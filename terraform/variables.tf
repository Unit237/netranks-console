variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
  default     = "console.netranks.ai"
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
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

