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

## 📂 Project Structure

```
/musician-connect
├── frontend/         # Next.js frontend
|   ├── app             # Page components and layouts
|   ├── components      # Reusable UI components
|   ├── config          # Configuration files (e.g., environment variables, constants)
|   ├── services        # API services (e.g., fetchers, database interactions)
├── backend/          # Django backend
└── README.md         # Project documentation
```

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
docker-compose up --build
kubectl apply -f infra/
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

## Testing
### Selenium Setup
```sh
pip install -r requirements.txt
# Install the browsers you want to test on:
# TODO brew installation instructions - otherwise, use command in past commit
brew install --cask google-chrome
# Update .env file with
SELENIUM_USER_DIR={/path/of/choice}
```
This empty directory acts as temporary session storage for user data while the Selenium tests are running, and will be cleared out via the `clear_user_data_dir`

If this does not work for your environment, you can download one manually and set the path for your tests to be able to find when needed. Download one of the following based on what browser you want to test with:
- [Chrome](https://developer.chrome.com/docs/chromedriver/downloads)
- [Firefox](https://github.com/mozilla/geckodriver/releases)
- [MicrosoftEdge](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/?form=MA13LH)

IMPORTANT NOTE: Make sure the version you download matches that of your browser version/ Once downloaded and extracted from the zip file, copy and paste the driver's .exe file to a folder in your system PATH (for windows, this could be C:\Windows\System32, C:\Windows\, C:\Program Files\, or another, for mac move to /usr/local/bin/), or if you do not want to copy and paste this you can specify the full path to the driver in your Selenium script

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
#### Single File Frontend Tests
```sh
cd frontend
npm run dev

python test/path/to/test.py -v
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

# Backend
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgres://<user>:<password>@localhost:5432/savvy-note-sp
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```
