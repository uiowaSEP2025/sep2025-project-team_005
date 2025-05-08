# 1) Create the EC2 assume‐role
resource "aws_iam_role" "ec2_role" {
  name = "savvynote-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
  lifecycle {
    prevent_destroy = true
  }
}

# 2) Attach the managed ECR‐ReadOnly policy
resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ec2_readonly" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess"
}

resource "aws_iam_role_policy" "ssm_read" {
  name = "savvynote-ec2-ssm-read"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ]
      Resource = [
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/savvynote/*"
      ]
    }]
  })
}

# 3) Create an instance profile and attach the role
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "savvynote-ec2-profile"
  role = aws_iam_role.ec2_role.name
}