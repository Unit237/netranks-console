output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.console.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.console.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.console.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.console.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.console.domain_name
}

output "cloudfront_url" {
  description = "Full URL of the CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.console.domain_name}"
}


