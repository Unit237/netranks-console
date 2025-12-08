# Terraform Infrastructure for NetRanks Console

This directory contains Terraform configuration for deploying the NetRanks Console frontend to AWS S3 and CloudFront.

## Prerequisites

1. **AWS CLI** installed and configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **AWS Account** with permissions to create:
   - S3 buckets
   - CloudFront distributions
   - IAM policies

## Setup

1. **Copy the example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars`** if you need to customize any values:
   ```hcl
   aws_region  = "eu-central-1"
   bucket_name = "console.netranks.ai"
   environment = "production"
   ```

3. **Initialize Terraform:**
   ```bash
   cd terraform
   terraform init
   ```

4. **Review the planned changes:**
   ```bash
   terraform plan
   ```

5. **Apply the infrastructure:**
   ```bash
   terraform apply
   ```

   This will create:
   - S3 bucket: `console.netranks.ai`
   - CloudFront distribution
   - Origin Access Control (OAC) for secure S3 access
   - Bucket policy allowing CloudFront access

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


