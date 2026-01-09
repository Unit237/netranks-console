variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
  # Default will be overridden by workspace-specific tfvars files
  # Dev: dev.netranks.ai
  # Prod: console.netranks.ai
}

variable "environment" {
  description = "Environment name (e.g., production, development)"
  type        = string
  # Default will be overridden by workspace-specific tfvars files
  # Dev: development
  # Prod: production
}

variable "domain_name" {
  description = "Custom domain name for CloudFront (optional)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for custom domain (optional)"
  type        = string
  default     = ""
}

