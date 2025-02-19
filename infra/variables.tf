variable "region" {
  description = "AWS region to deploy"
  default     = "us-east-1"
}

variable "prefix" {
  description = "Prefix assigned to resources"
  default     = "savvy-note"
}

variable "db_password" {
  description = "Password for RDS database instance"
  default     = "@@savvy-note-db-password1@@"
}