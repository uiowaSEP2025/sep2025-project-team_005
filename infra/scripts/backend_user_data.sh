#!/bin/bash
exec > /var/log/user-data.log 2>&1
set -xe

# 1) Install prerequisites
apt-get update -y
apt-get install -y software-properties-common git awscli docker.io docker-compose 

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-2"
export AWS_DEFAULT_REGION="$AWS_REGION"

# 2) Add ubuntu user to docker group and finish prereqs
usermod -aG docker ubuntu
systemctl enable --now docker
add-apt-repository ppa:deadsnakes/ppa -y
apt-get update -y
apt-get install -y python3.11 python3.11-venv python3.11-distutils

# 3) Clone or update repository
cd /home/ubuntu
git clone https://github.com/uiowaSEP2025/sep2025-project-team_005.git savvynote
chown -R ubuntu:ubuntu .

# 4) Setup Python venv and install dependencies
python3.11 -m venv backend/venv
. backend/venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r /home/ubuntu/savvynote/backend/requirements.txt
pip install Django==5.2.0 gunicorn
deactivate

# 5) Docker login via SSM
sudo -u ubuntu bash -lc '
  aws ssm get-parameter --region '"$AWS_REGION"' --name "/savvynote/DOCKER_PASSWORD" --with-decryption --query "Parameter.Value" --output text \
  | docker login -u "$(aws ssm get-parameter --region '"$AWS_REGION"' --name "/savvynote/DOCKER_USERNAME" --with-decryption --query "Parameter.Value" --output text)" --password-stdin
'

# 6) Build .env for backend
cat <<EOF > /home/ubuntu/savvynote/.env
DJANGO_ENV=test
DB_NAME=$(aws ssm get-parameter --name "/savvynote/DB_NAME" --with-decryption --query "Parameter.Value" --output text)
DB_USER=$(aws ssm get-parameter --name "/savvynote/DB_USER" --with-decryption --query "Parameter.Value" --output text)
DB_PASSWORD=$(aws ssm get-parameter --name "/savvynote/DB_PASSWORD" --with-decryption --query "Parameter.Value" --output text)
DB_HOST=$(aws ssm get-parameter --name "/savvynote/DB_HOST" --with-decryption --query "Parameter.Value" --output text)
DB_PORT=$(aws ssm get-parameter --name "/savvynote/DB_PORT" --with-decryption --query "Parameter.Value" --output text)
SECRET_KEY=$(aws ssm get-parameter --name "/savvynote/SECRET_KEY" --with-decryption --query "Parameter.Value" --output text)
DJANGO_SECRET_KEY=$(aws ssm get-parameter --name "/savvynote/SECRET_KEY" --with-decryption --query "Parameter.Value" --output text)
NEXT_PUBLIC_API_URL=$(aws ssm get-parameter --name "/savvynote/NEXT_PUBLIC_API_URL" --with-decryption --query "Parameter.Value" --output text)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(aws ssm get-parameter --name "/savvynote/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" --with-decryption --query "Parameter.Value" --output text)
SELENIUM_USER_DIR=$(aws ssm get-parameter --name "/savvynote/SELENIUM_USER_DIR" --with-decryption --query "Parameter.Value" --output text)
AWS_ACCESS_KEY_ID=$(aws ssm get-parameter --name "/savvynote/AWS_ACCESS_KEY_ID" --with-decryption --query "Parameter.Value" --output text)
AWS_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "/savvynote/AWS_SECRET_ACCESS_KEY" --with-decryption --query "Parameter.Value" --output text)
AWS_REGION=$(aws ssm get-parameter --name "/savvynote/AWS_REGION" --with-decryption --query "Parameter.Value" --output text)
AWS_PROFILE=$(aws ssm get-parameter --name "/savvynote/AWS_PROFILE" --with-decryption --query "Parameter.Value" --output text)
EMAIL_USER=$(aws ssm get-parameter --name "/savvynote/EMAIL_USER" --with-decryption --query "Parameter.Value" --output text)
EMAIL_PASSWORD=$(aws ssm get-parameter --name "/savvynote/EMAIL_PASSWORD" --with-decryption --query "Parameter.Value" --output text)
GOOGLE_CLIENT_ID=$(aws ssm get-parameter --name "/savvynote/GOOGLE_CLIENT_ID" --with-decryption --query "Parameter.Value" --output text)
GOOGLE_CLIENT_SECRET=$(aws ssm get-parameter --name "/savvynote/GOOGLE_CLIENT_SECRET" --with-decryption --query "Parameter.Value" --output text)
FRONTEND_API=$(aws ssm get-parameter --name "/savvynote/FRONTEND_API" --with-decryption --query "Parameter.Value" --output text)
BACKEND_API=$(aws ssm get-parameter --name "/savvynote/BACKEND_API" --with-decryption --query "Parameter.Value" --output text)
STRIPE_SECRET_KEY=$(aws ssm get-parameter --name "/savvynote/STRIPE_SECRET_KEY" --with-decryption --query "Parameter.Value" --output text)
STRIPE_WEBHOOK_SECRET=$(aws ssm get-parameter --name "/savvynote/STRIPE_WEBHOOK_SECRET" --with-decryption --query "Parameter.Value" --output text)
EOF
chown ubuntu:ubuntu /home/ubuntu/savvynote/.env

aws ecr get-login-password \
  --region "$AWS_REGION" \
| docker login \
    --username AWS \
    --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

IMAGE="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/savvynote-backend:latest"
docker pull $IMAGE
docker rm -f savvynote-backend || true
docker run -d \
  --name savvynote-backend \
  --env-file /home/ubuntu/savvynote/.env \
  $IMAGE
