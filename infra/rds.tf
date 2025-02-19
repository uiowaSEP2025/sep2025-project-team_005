module "db" {
  source     = "terraform-aws-modules/rds/aws"
  version    = "~> 6.10.0" // Latest module version
  identifier = "${var.prefix}-db"

  engine         = "postgres"
  engine_version = "16.7"         // Latest Free Tier PostgreSQL
  instance_class = "db.t4g.micro" // Most powerful free option (I believe)
  family         = "postgres16"   // Redundant, yes, but seems necessary

  allocated_storage   = 5    // Should be rouhgly 20-25 for production, but while I'm learning I kept it low for cost savings
  skip_final_snapshot = true // Just for development process; real-world should likely be set to false

  db_name  = "savvynoteproject"
  username = "savvynoteadmin"
  password = var.db_password

  multi_az               = false // Free option
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [module.rds_security_group.security_group_id]
}

module "rds_security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.3.0" // Latest module version

  name        = "${var.prefix}-rds-sg"
  description = "RDS security group"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [{
    from_port   = 5432 // Postgres standard port
    to_port     = 5432
    protocol    = "tcp"
    description = "PostgreSQL access from VPC"
    cidr_blocks = module.vpc.vpc_cidr_block
  }]
}