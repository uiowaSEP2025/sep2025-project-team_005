resource "aws_ecr_repository" "savvynote_frontend" {
  name                 = "savvynote-frontend"
  image_scanning_configuration {
    scan_on_push = true
  }
  image_tag_mutability = "MUTABLE"
  #lifecycle {
  #  prevent_destroy = true
  #}
}

# Backend repo
resource "aws_ecr_repository" "savvynote_backend" {
  name                 = "savvynote-backend"
  image_scanning_configuration {
    scan_on_push = true
  }
  image_tag_mutability = "MUTABLE"
  #lifecycle {
  #  prevent_destroy = true
  #}
}

data "aws_iam_policy_document" "ecr_pull" {
  statement {
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.ec2_role.arn]
    }
    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability",
    ]
  }
}

resource "aws_ecr_repository_policy" "frontend_pull" {
  repository = aws_ecr_repository.savvynote_frontend.name
  policy     = data.aws_iam_policy_document.ecr_pull.json
}

resource "aws_ecr_repository_policy" "backend_pull" {
  repository = aws_ecr_repository.savvynote_backend.name
  policy     = data.aws_iam_policy_document.ecr_pull.json
}
