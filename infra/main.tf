terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.79.0"
    }
  }
  required_version = "1.10.5"
}
provider "aws" {
  region = var.region
}

data "aws_availability_zones" "available" {}