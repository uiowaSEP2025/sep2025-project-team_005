locals {
  cluster_name = "${var.prefix}-cluster"
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.33.1" // Latest module version

  cluster_name    = local.cluster_name
  cluster_version = "1.29" // Latest K8s version

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  cluster_endpoint_public_access_cidrs = [ // Needs Public IPs!!
    "128.255.234.13/32"                    //,
    // Max IP/32,
    // Kenna IP/32,
    // Marissa IP/32,
    // Laptop IPs will change. Only use desktops? Manually fix for laptop when not home? Need to research.
  ] // Allows access only from my current laptop IP. After setup, should include each of our IP addresses over 32, as well as desktop IPs.

  iam_role_additional_policies = {
    AllowECRApp   = aws_iam_policy.allow_ecr_app.arn
    AllowECRProxy = aws_iam_policy.allow_ecr_proxy.arn
  }

  eks_managed_node_group_defaults = {
    ami_type = "AL2_x86_64"
  }

  eks_managed_node_groups = {
    node_group = {
      name = "k8s-ng-1"

      instance_types = ["t3.micro"]

      min_size     = 1
      max_size     = 3
      desired_size = 1 // Kept low for cost, may need to scale up

      labels = {
        Environment = "Dev"
      }
    }
  }
}

module "vpc_cni_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.52.2" // Latest module version

  role_name_prefix      = "${var.prefix}-vpc-cni-irsa"
  attach_vpc_cni_policy = true // Allows k8s to mount network adapters to vpc
  vpc_cni_enable_ipv4   = true
  oidc_providers = { // Allows nodes to work with vpc
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-node"]
    }
  }
}