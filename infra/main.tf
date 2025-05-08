terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "key_name" {
  description = "Name of an existing EC2 KeyPair for SSH access"
  type        = string
}

variable "public_subnet_id" {
  description = "Public Subnet ID (must have a default route to an Internet Gateway)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type (only t2.micro allowed)"
  type        = string
  default     = "t2.micro"
  validation {
    condition     = contains(["t2.micro"], var.instance_type)
    error_message = "Instance type must be t2.micro."
  }
}

variable "vpc_id" {
  description = "VPC ID in which the instances will be launched"
  type        = string
}

variable "my_app_security_group" {
  description = "Security Group ID for application servers that will access the RDS instance"
  type        = string
}

variable "domain_name" {
  description = "Our public domain"
  type        = string
  default     = ""
}

variable "environment" {
  description = "dev/test/prod"
  type        = string
  default     = "test"
  validation {
    condition     = contains(["dev","test","prod"], var.environment)
    error_message = "Environment must be one of dev, test, prod."
  }
}

variable "ssh_location" {
  description = "Our IP for SSHing"
  type        = string
  default     = "0.0.0.0/0"
}

locals {
  allow_ssh = var.environment != "prod"
  ami_map = {
    us-east-1 = "ami-0a25f237e97fa2b5e"
    us-east-2 = "ami-08529db39844c00c2"
  }
  ami_id = lookup(local.ami_map, var.aws_region, "")
}

resource "aws_eip" "frontend" {
  vpc = true
}

resource "aws_eip_association" "frontend" {
  allocation_id = aws_eip.frontend.allocation_id
  instance_id   = aws_instance.frontend.id
}

resource "aws_iam_role" "ssm" {
  name = "${var.environment}-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_managed" {
  role       = aws_iam_role.ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_policy" "ssm_get_parameters" {
  name        = "${var.environment}-ssm-get-parameters"
  description = "Allow SSM parameter retrieval"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["ssm:GetParameter","ssm:GetParameters"]
      Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/savvynote/*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_inline" {
  role       = aws_iam_role.ssm.name
  policy_arn = aws_iam_policy.ssm_get_parameters.arn
}

resource "aws_security_group" "frontend" {
  name        = "${var.environment}-frontend-sg"
  description = "Frontend: HTTP/HTTPS"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Dev only - Next.js"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  dynamic "ingress" {
    for_each = local.allow_ssh ? [1] : []
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.ssh_location]
    }
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name        = "${var.environment}-frontend-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "backend" {
  name        = "${var.environment}-backend-sg"
  description = "Backend: allow only Django & DB"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Django from frontend"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }
  dynamic "ingress" {
    for_each = local.allow_ssh ? [1] : []
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.ssh_location]
    }
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name        = "${var.environment}-backend-sg"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "deploy_ssm" {
  role       = aws_iam_role.github_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMFullAccess"
}

resource "aws_security_group_rule" "rds_ingress" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = var.my_app_security_group
  source_security_group_id = aws_security_group.backend.id
}

resource "aws_instance" "backend" {
  ami                    = local.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.backend.id]
  key_name               = var.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = file("${path.module}/scripts/backend_user_data.sh")

  metadata_options {
    http_tokens   = "optional"
    http_endpoint = "enabled"
  }

  tags = {
    Name        = "${var.environment}-Backend-Instance"
    Environment = var.environment
    Role        = "backend"
  }
}

resource "aws_instance" "frontend" {
  ami                    = local.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.frontend.id]
  key_name               = var.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = file("${path.module}/scripts/frontend_user_data.sh")

  depends_on = [aws_instance.backend]

  metadata_options {
    http_tokens   = "optional"
    http_endpoint = "enabled"
  }

  tags = {
    Name        = "${var.environment}-Frontend-Instance"
    Environment = var.environment
    Role = "frontend"
  }
}

output "frontend_public_ip" {
  description = "Public IP of the Frontend instance"
  value       = aws_eip.frontend.public_ip
}

output "backend_private_ip" {
  description = "Private IP of the Backend instance"
  value       = aws_instance.backend.private_ip
}

output "domain_name" {
  description = "Our app's domain"
  value       = var.domain_name
}
