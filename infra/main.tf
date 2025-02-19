terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.83.0" // Earliest compatible version
    }
  }
  required_version = "1.10.5" // Latest Terraform version
}
provider "aws" {
  region = var.region
}

data "aws_availability_zones" "available" {}