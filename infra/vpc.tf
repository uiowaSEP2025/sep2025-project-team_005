module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.19.0" // Latest module version

  name = "${var.prefix}-vpc"
  cidr = "10.0.0.0/16"
  azs  = slice(data.aws_availability_zones.available.names, 0, 3) // I get the first three available zones

  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]    // Can expand to ~.4.0/24, ~.5.0/24, etc. if needed 
  public_subnets   = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"] // Can expand to ~.13.0/24, ~.14.0/24, etc. if needed 
  database_subnets = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"] // Can expand to ~.23.0/24, ~.24.0/24, etc. if needed 

  enable_nat_gateway           = true
  single_nat_gateway           = true
  enable_dns_hostnames         = true
  create_database_subnet_group = true

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.prefix}-cluster" = "shared"
    "kubernetes.io/role/elb"                      = 1
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.prefix}-cluster" = "shared"
    "kubernetes.io/role/elb"                      = 1
  }
}