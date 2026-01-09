bucket         = "netranks-terraform-state"
key            = "dev/terraform.tfstate"
region         = "eu-central-1"
dynamodb_table = "terraform-state-lock"
encrypt        = true

