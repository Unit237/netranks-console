terraform {
  backend "s3" {
    # These values will be provided via backend config file or command line
    # bucket         = "netranks-terraform-state"
    # key            = "dev/terraform.tfstate"  # Will be workspace-specific
    # region         = "eu-central-1"
    # dynamodb_table = "terraform-state-lock"
    # encrypt        = true
  }
}

