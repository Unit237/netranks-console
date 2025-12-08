#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
TERRAFORM_DIR="terraform"
BUILD_DIR="dist"
AWS_REGION="eu-central-1"
SKIP_CONFIRMATION=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-confirmation|-y)
      SKIP_CONFIRMATION=true
      shift
      ;;
    --profile)
      export AWS_PROFILE="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 [--skip-confirmation|-y] [--profile PROFILE_NAME]"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}🚀 Starting deployment process...${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials and account
echo -e "${BLUE}🔍 Verifying AWS environment...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
AWS_USER_ARN=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null || echo "")

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Could not get AWS account ID. Please check your AWS credentials.${NC}"
    exit 1
fi

echo -e "${BLUE}   AWS Account ID: ${BOLD}$AWS_ACCOUNT_ID${NC}"
echo -e "${BLUE}   AWS User/Role: ${BOLD}$AWS_USER_ARN${NC}"
echo -e "${BLUE}   AWS Region: ${BOLD}$AWS_REGION${NC}"
echo ""

if [ "$SKIP_CONFIRMATION" = false ]; then
    echo -e "${YELLOW}⚠️  You are about to deploy to AWS Account: $AWS_ACCOUNT_ID${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled.${NC}"
        exit 0
    fi
fi

# Set production environment variables if not already set
if [ -z "$VITE_PROD" ]; then
    export VITE_PROD="true"
    echo -e "${YELLOW}📝 Setting VITE_PROD=true for production build${NC}"
fi

# Check if .env file exists and load it
if [ -f ".env" ]; then
    echo -e "${YELLOW}📝 Loading environment variables from .env file...${NC}"
    set -a
    source .env
    set +a
fi

# Display environment variables being used
echo -e "${BLUE}📋 Build environment variables:${NC}"
echo -e "${BLUE}   VITE_PROD=${BOLD}${VITE_PROD:-not set}${NC}"
echo -e "${BLUE}   VITE_BACKEND_API_URL=${BOLD}${VITE_BACKEND_API_URL:-not set (will use default)}${NC}"
echo -e "${BLUE}   VITE_DEMO_BACKEND_API_URL=${BOLD}${VITE_DEMO_BACKEND_API_URL:-not set (will use default)}${NC}"
echo -e "${BLUE}   VITE_NETRANKS_DOMAIN=${BOLD}${VITE_NETRANKS_DOMAIN:-not set (will use default)}${NC}"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠️  Build directory '$BUILD_DIR' not found. Building project...${NC}"
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        echo -e "${RED}❌ Build failed. '$BUILD_DIR' directory still not found.${NC}"
        exit 1
    fi
fi

# Navigate to terraform directory
cd "$TERRAFORM_DIR"

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    echo -e "${YELLOW}📦 Initializing Terraform...${NC}"
    terraform init
fi

# Get S3 bucket name and CloudFront distribution ID from Terraform outputs
echo -e "${YELLOW}📋 Getting Terraform outputs...${NC}"
BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}❌ Could not get S3 bucket name from Terraform outputs.${NC}"
    echo -e "${YELLOW}💡 Make sure Terraform has been applied: terraform apply${NC}"
    exit 1
fi

if [ -z "$DISTRIBUTION_ID" ]; then
    echo -e "${RED}❌ Could not get CloudFront distribution ID from Terraform outputs.${NC}"
    echo -e "${YELLOW}💡 Make sure Terraform has been applied: terraform apply${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found S3 bucket: $BUCKET_NAME${NC}"
echo -e "${GREEN}✓ Found CloudFront distribution: $DISTRIBUTION_ID${NC}"

# Go back to project root
cd ..

# Sync files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "service-worker.js"

# Upload HTML files with shorter cache
echo -e "${YELLOW}📤 Uploading HTML files...${NC}"
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "service-worker.js"

# Set proper content types
echo -e "${YELLOW}🔧 Setting content types...${NC}"
aws s3 cp "$BUILD_DIR/index.html" "s3://$BUCKET_NAME/index.html" \
    --region "$AWS_REGION" \
    --content-type "text/html" \
    --cache-control "public, max-age=0, must-revalidate"

# Invalidate CloudFront cache
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo -e "${GREEN}✓ CloudFront invalidation created: $INVALIDATION_ID${NC}"
    echo -e "${YELLOW}⏳ Cache invalidation may take a few minutes to complete.${NC}"
fi

# Get CloudFront URL
CLOUDFRONT_URL=$(cd "$TERRAFORM_DIR" && terraform output -raw cloudfront_url 2>/dev/null || echo "")

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
if [ ! -z "$CLOUDFRONT_URL" ]; then
    echo -e "${GREEN}🌐 Your site is available at: $CLOUDFRONT_URL${NC}"
fi

