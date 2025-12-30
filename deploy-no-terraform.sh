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
BUILD_DIR="dist"
AWS_REGION="${AWS_REGION:-eu-central-1}"
SKIP_CONFIRMATION=false
# Initialize from environment variables first
BUCKET_NAME="${BUCKET_NAME:-}"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

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
    --bucket-name)
      BUCKET_NAME="$2"
      shift 2
      ;;
    --distribution-id)
      DISTRIBUTION_ID="$2"
      shift 2
      ;;
    --region)
      AWS_REGION="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --skip-confirmation, -y          Skip confirmation prompt"
      echo "  --profile PROFILE_NAME          AWS profile to use"
      echo "  --bucket-name BUCKET_NAME        S3 bucket name (required if not set via env var)"
      echo "  --distribution-id DIST_ID        CloudFront distribution ID (optional)"
      echo "  --region AWS_REGION             AWS region (default: eu-central-1)"
      echo ""
      echo "Environment variables:"
      echo "  BUCKET_NAME                      S3 bucket name"
      echo "  CLOUDFRONT_DISTRIBUTION_ID       CloudFront distribution ID"
      echo "  AWS_REGION                       AWS region"
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

# Validate bucket name
if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}❌ S3 bucket name is required.${NC}"
    echo -e "${YELLOW}💡 Provide it via --bucket-name flag or BUCKET_NAME environment variable${NC}"
    exit 1
fi

# Verify bucket exists
echo -e "${BLUE}🔍 Verifying S3 bucket exists...${NC}"
if ! aws s3 ls "s3://$BUCKET_NAME" --region "$AWS_REGION" &>/dev/null; then
    echo -e "${RED}❌ S3 bucket '$BUCKET_NAME' does not exist or is not accessible.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ S3 bucket verified: $BUCKET_NAME${NC}"

# Verify CloudFront distribution if provided
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "${BLUE}🔍 Verifying CloudFront distribution exists...${NC}"
    if ! aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --region "$AWS_REGION" &>/dev/null; then
        echo -e "${YELLOW}⚠️  CloudFront distribution '$DISTRIBUTION_ID' not found or not accessible.${NC}"
        echo -e "${YELLOW}   Continuing without CloudFront cache invalidation...${NC}"
        DISTRIBUTION_ID=""
    else
        echo -e "${GREEN}✓ CloudFront distribution verified: $DISTRIBUTION_ID${NC}"
    fi
fi

echo ""

if [ "$SKIP_CONFIRMATION" = false ]; then
    echo -e "${YELLOW}⚠️  You are about to deploy to AWS Account: $AWS_ACCOUNT_ID${NC}"
    echo -e "${YELLOW}   S3 Bucket: $BUCKET_NAME${NC}"
    if [ ! -z "$DISTRIBUTION_ID" ]; then
        echo -e "${YELLOW}   CloudFront Distribution: $DISTRIBUTION_ID${NC}"
    fi
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
    
    # Get CloudFront URL
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id "$DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text 2>/dev/null || echo "")
    
    if [ ! -z "$CLOUDFRONT_DOMAIN" ]; then
        CLOUDFRONT_URL="https://$CLOUDFRONT_DOMAIN"
    fi
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
if [ ! -z "$CLOUDFRONT_URL" ]; then
    echo -e "${GREEN}🌐 Your site is available at: $CLOUDFRONT_URL${NC}"
elif [ ! -z "$BUCKET_NAME" ]; then
    echo -e "${GREEN}🌐 Your site is available at: https://$BUCKET_NAME.s3.$AWS_REGION.amazonaws.com${NC}"
    echo -e "${YELLOW}💡 Note: If you have CloudFront configured, provide --distribution-id to get the CloudFront URL${NC}"
fi

