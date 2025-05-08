# AWS region (matches your provider block default)
aws_region            = "us-east-2"

# The EC2 KeyPair you use for SSH’ing into instances
key_name              = "NEWKPKGM"

# The public subnet in which to launch your instances
public_subnet_id      = "subnet-0e857f872d653e972"

# The VPC ID for all networking
vpc_id                = "vpc-0ae19de88c642fbd5"

# The security group that your app servers will use
# (must already exist or be created separately in Terraform)
my_app_security_group = "sg-084db03f535da912e"

# Your application’s public domain name
domain_name           = "savvy-note.com"

# Which environment you’re targeting: dev, test, or prod
environment           = "dev"

# Your CIDR for ssh access (0.0.0.0/0 is “anywhere” but you can lock it down)
ssh_location          = "0.0.0.0/0"

# (Optional) Override the default t2.micro if you ever change instance_type
instance_type       = "t2.micro"
