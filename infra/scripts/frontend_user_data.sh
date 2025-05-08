#!/bin/bash
exec > /var/log/user-data.log 2>&1
set -xe

# 1) Install Node.js, Git, Nginx, Docker, and AWS CLI
curl -sL https://deb.nodesource.com/setup_20.x | bash -
apt-get update -y
apt-get install -y nodejs git awscli docker.io docker-compose nginx

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-2"
export AWS_DEFAULT_REGION="$AWS_REGION"

# 2) Add ubuntu user to docker group
usermod -aG docker ubuntu
systemctl start docker

# 3) Get an ECR auth token and log in
aws ecr get-login-password \
  --region "$AWS_REGION" \
| docker login \
    --username AWS \
    --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# 4) Clone repository
cd /home/ubuntu
git clone https://github.com/uiowaSEP2025/sep2025-project-team_005.git savvynote
chown -R ubuntu:ubuntu .

# 5) Grab runtime config
NEXT_PUBLIC_API_URL=$(aws ssm get-parameter \
  --name "/savvynote/NEXT_PUBLIC_API_URL" --with-decryption \
  --query "Parameter.Value" --output text)

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(aws ssm get-parameter \
  --name "/savvynote/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" --with-decryption \
  --query "Parameter.Value" --output text)

# 6) Pull image from ECR
IMAGE="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/savvynote-frontend:latest"
docker pull $IMAGE
docker rm -f savvynote-frontend || true
docker run -d \
  --name savvynote-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
  $IMAGE

echo "Next.js started on port 3000"

FRONTEND_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
BACKEND_IP=$(
  aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --filters \
      "Name=tag:Role,Values=backend" \
      "Name=instance-state-name,Values=running" \
    --query "Reservations[0].Instances[0].PrivateIpAddress" \
    --output text
)
SSL_DIR="/etc/nginx/ssl"
mkdir -p $SSL_DIR

aws ssm get-parameter \
    --name "/savvynote/savvy-note.com.pem" \
    --region $AWS_REGION \
    --with-decryption \
    --query "Parameter.Value" \
    --output text > $SSL_DIR/savvy-note.com.pem

aws ssm get-parameter \
    --name "/savvynote/savvy-note.com.key" \
    --region $AWS_REGION \
    --with-decryption \
    --query "Parameter.Value" \
    --output text > $SSL_DIR/savvy-note.com.key

chmod 600 "$SSL_DIR"/*

# 7) Test and reload NGinX
rm -f /etc/nginx/sites-enabled/default
cat <<EOF > /etc/nginx/sites-available/savvynote
server {
    listen 80;
    server_name savvy-note.com www.savvy-note.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name savvy-note.com www.savvy-note.com;

    ssl_certificate     $SSL_DIR/savvy-note.com.pem;
    ssl_certificate_key $SSL_DIR/savvy-note.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1h;
    client_max_body_size 100M;

    location / {
        proxy_pass         http://$FRONTEND_IP:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host       \$host;
    }

    location /api/ {
        proxy_pass         http://$BACKEND_IP:8000/api/;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Cookie            \$http_cookie;
        proxy_set_header   Upgrade           \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/savvynote /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
