terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "sep2025-project-team_005/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "my-terraform-locks"
    encrypt        = true
  }
}
