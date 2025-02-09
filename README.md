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
ALTER USER postgres WITH PASSWORD '{password}'
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
npm install next@15.1.6
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

# Backend
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgres://<user>:<password>@localhost:5432/savvy-note-sp
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```
