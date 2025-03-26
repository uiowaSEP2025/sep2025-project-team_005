# Savvy Note

Savvy Note is a professional networking platform for musicians where artists can post upcoming gigs, browse gig inquiries, collaborate in real time via live streaming, and securely manage payments through an escrow system.

## 🚀 Features

- 🎤 **Musician Profiles** – Showcase your skills, experience, and past gigs.  
- 🎶 **Gig Listings & Inquiries** – Post and browse performance opportunities.  
- 📹 **Live Streaming** – Collaborate with other artists in real time.  
- 💰 **Escrow Payment System** – Secure transactions for booked gigs.  

## 🏗️ Tech Stack

| Component      | Technology |
|---------------|-----------|
| **Frontend**  | Next.js |
| **Backend**   | Python, Django |
| **Database**  | PostgreSQL |
| **Storage**   | Amazon S3 |
| **CI/CD**     | GitHub Actions |
| **Containerization** | Docker |
| **Orchestration** | Kubernetes |
| **Load Balancer** | Nginx |

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Python 3.x](https://www.python.org/)
- [Docker](https://www.docker.com/)
- [Kubernetes (kubectl & minikube)](https://kubernetes.io/)

### WSL
```sh
# In terminal
wsl
su -l {user_name}
# From VS Code search bar
> WSL: Open Folder in WSL
# Replace "root" with "home" and select user
# Navigate to project directory
```

### Backend Setup
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Postgres Setup
```sh
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD '{password}';
CREATE DATABASE "savvy-note-sp";
GRANT ALL PRIVILEGES ON DATABASE "savvy-note-sp" TO {username};
# Update .env file with
DB_USER={username}
DB_PASSWORD={password}
```

### Frontend Setup
```sh
cd frontend
npm install
npm run dev
```

### Docker & Kubernetes Deployment
```sh
# This is all you need to run the docker-compose build
docker login
docker-compose up -d
# Versions:
# - Docker: 26.1.3
# - Docker Desktop: 4.38.0 -- may not be necessary; did not try without
# - psql: 17.4
# - python3: 3.13.2

#Using RDS:
# - Copy "Endpoint" (from under "Endpoint & Port") into DB_HOST.
# - Go to the "VPC security groups" (also under "Endpoint & Port").
# - Go to "Inbound Rules" and click "Edit inbound rules".
# - Add a new inbound rule of "Type" PostgreSQL and "Source" Custom, with your public IP address in the textbox with the magnifying glass with "/32" after (eg. 192.168.6.54/32).
# - Add a description like "Desktop Postgres Rule" or "Temp Laptop Rule" if you'd like (remember this will need to be changed every time your public IP changes).

#Debugging:
# - "docker-compose down --rmi all --volumes --remove-orphans" will completely tear down the docker build and give a clean docker desktop if needed.
# - "docker-compose ps" will sure you the running services. You should have db, backend, and frontend.
# - "lsof -i :8000" will show you what is running on port 8000. Good for "Port already in use" errors. If this doesn't work, restarting VSCode (and computer if that still doesn't work) has worked each time for me.
# - If you get an error asking if the DB host is listening, you likely need to refresh your security group inbound rules with your current public IP address.
```

### PostgreSQL Setup and Migration
```sh
sudo systemctl start postgresql
source venv/bin/activate
python manage.py migrate 
python manage.py showmigrations
```

### Creating New Migration
```sh
python manage.py makemigrations pages
python manage.py makemigrations admin
```

### Setup S3 Bucket configuration
```sh
cd backend
aws configure
```
To properly configure S3 buckets, you will have to ensure your AWS user has correctly been added to the bucket permissions. Once added, you will need your AWS user access key, secret key, and bucket region. All information will have to be provided by S3 account manager.

## Testing
### Selenium Setup
```sh
pip install -r requirements.txt
# Update .env file with
SELENIUM_USER_DIR={/path/of/choice}

# Linux
sudo apt update
sudo apt install -y wget
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb

# Mac (if Brew is installed)
brew install --cask google-chrome
```
If this does not work for your environment, you can download one manually and set the path for your tests to be able to find when needed. Download one of the following based on what browser you want to test with:
- [Chrome](https://developer.chrome.com/docs/chromedriver/downloads)
- [Firefox](https://github.com/mozilla/geckodriver/releases)
- [MicrosoftEdge](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/?form=MA13LH)

IMPORTANT NOTE: Make sure the version you download matches that of your browser version. Once downloaded and extracted from the zip file, copy and paste the driver's .exe file to a folder in your system PATH (Linux-based systems are /usr/local/bin/), or if you do not want to copy and paste this you can specify the full path to the driver in your Selenium script

```sh
# If doing this alternative, verify the web driver is accessible
# Chrome:
chromedriver --version
# Firefox:
geckodriver --version
# Microsoft Edge:
msedgedriver --version
```

### Unit Tests
#### All Backend Tests
```sh
cd backend
pytest
```
#### Single File Backend Tests
```sh
cd backend
pytest test/path/to/test.py -v
```
#### All Frontend Tests
TODO
#### Single File Frontend Tests
TODO

### Functional Tests
#### All Backend Tests
TODO
#### Single File Backend Tests
TODO
#### All Frontend Tests
```sh
cd frontend
npm run dev

pytest
```
#### Single File Frontend Jest Tests
```sh
cd frontend
npm run test

```

### Integration Tests
#### All Tests
TODO
#### Single File Tests
TODO

### Acceptance Tests
#### All Tests
```sh
cd frontend
npm run dev

cd backend
behave test/features/
```
#### Single File Tests
```sh
cd frontend
npm run dev

cd backend
behave test/features/XXXX.feature
```

#### Run Code Coverage
```sh
python manage.py runserver
npm run dev

cd backend
coverage erase
coverage run --source=pages -m pytest
coverage run --source=pages -m behave test/features
coverage report -m

cd frontend
npm test -- --coverage
```

# Backend
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgres://<user>:<password>@localhost:5432/savvy-note-sp
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
