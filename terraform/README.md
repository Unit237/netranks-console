# Terraform Infrastructure for NetRanks Console

This directory contains Terraform configuration for deploying the NetRanks Console frontend to AWS S3 and CloudFront.

**Supports multiple environments:** Dev and Production using Terraform workspaces.

## Prerequisites

1. **AWS CLI** installed and configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **AWS Account** with permissions to create:
   - S3 buckets
   - CloudFront distributions
   - IAM policies

## Quick Start

### Dev Environment

```bash
cd terraform

# Create and select dev workspace
terraform workspace new dev
terraform workspace select dev

# Initialize
terraform init

# Plan and apply
terraform plan -var-file=dev.tfvars
terraform apply -var-file=dev.tfvars
```

### Production Environment

```bash
cd terraform

# Create and select prod workspace
terraform workspace new prod
terraform workspace select prod

# Initialize
terraform init

# Plan and apply
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars
```

## Environment Configuration

- **Dev**: Uses `dev.tfvars` → Creates `dev.netranks.ai` bucket
- **Prod**: Uses `prod.tfvars` → Creates `console.netranks.ai` bucket

See [WORKSPACES.md](WORKSPACES.md) for detailed workspace management guide.

## Deployment

After the infrastructure is set up, deploy your frontend build:

```bash
# From the project root
./deploy.sh
```

The deployment script will:
1. Build the project (if `dist` folder doesn't exist)
2. Sync files to S3 with appropriate cache headers
3. Invalidate CloudFront cache

## Outputs

After running `terraform apply`, you'll get:
- `cloudfront_url`: The CloudFront distribution URL
- `s3_bucket_name`: The S3 bucket name
- `cloudfront_distribution_id`: The CloudFront distribution ID

## Custom Domain (Optional)

To use a custom domain (`console.netranks.ai`):

1. Request an ACM certificate in `us-east-1` (CloudFront requirement)
2. Update `terraform.tfvars`:
   ```hcl
   domain_name         = "console.netranks.ai"
   acm_certificate_arn = "arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID"
   ```
3. Uncomment the `aliases` and `viewer_certificate` blocks in `main.tf`
4. Run `terraform apply`
5. Create a CNAME record pointing your domain to the CloudFront distribution

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning:** This will delete the S3 bucket and all its contents, as well as the CloudFront distribution.


