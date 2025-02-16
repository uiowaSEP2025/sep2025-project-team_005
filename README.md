# Savvy Note

Savvy Note is a professional networking platform for musicians, similar to LinkedIn, where artists can post upcoming gigs, browse gig inquiries, collaborate in real time via live streaming, and securely manage payments through an escrow system.

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

### Backend Setup
```sh
cd backend
python -m venv venv
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
$env:PYTHONPATH = "path\to\sep2025-project-team_005\backend" # May be optional
python manage.py migrate
python manage.py runserver
```

### Launch Backend
```sh
cd backend
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```sh
cd frontend
npm install
npm install next@15.1.6
npm run dev
```

### Launch Frontend
```sh
cd frontend
npm run dev
```

### Docker & Kubernetes Deployment
```sh
docker-compose up --build
kubectl apply -f infra/
```

### PostgreSQL Setup and Migration
```sh
brew services start postgresql@15       # On Windows 'net start postgresql-x64-15'
source venv/bin/activate
pip install psycopg2	    ** If not already installed
python manage.py makemigrations pages
python manage.py makemigrations admin
python manage.py migrate 
python manage.py showmigrations

```

### Behave Setup
```sh
cd backend
pip install behave django-behave
pip install django-environ
```

### Running Behave Features
```sh
# In project's root directory, run the following in the terminal:
PYTHONPATH=backend behave backend/features  # PYTHONPATH=backend is optional if you have set that path in your environment already
```

### Selenium Setup
```sh
pip install selenium
```

Selenium requires you to have a WebDriver since it controls browsers, so download one of the following based on what browser you want to test with:
- [Chrome](https://developer.chrome.com/docs/chromedriver/downloads)
- [Firefox](https://github.com/mozilla/geckodriver/releases)
- [MicrosoftEdge](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/?form=MA13LH)

IMPORTANT NOTE: Make sure the version you download matches that of your browser version Once downloaded and extracted from the zip file, copy and paste the driver's .exe file to a folder in your system PATH (for windows, this could be C:\Windows\System32, C:\Windows\, C:\Program Files\, or another, for mac move to /usr/local/bin/), or if you do not want to copy and paste this you can specify the full path to the driver in your Selenium script

```sh
# Verify the web driver is accessible
# Chrome:
chromedriver --version
# Firefox:
geckodriver --version
# Microsoft Edge:
msedgedriver --version
```

# Backend
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgres://user:password@db:5432/musician_connect
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```
