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
├── backend/          # Django backend
├── db/               # Database migrations & setup
├── infra/            # Kubernetes deployment configurations
├── scripts/          # Utility scripts for setup & deployment
├── README.md         # Project documentation
└── docker-compose.yml # Local development setup
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
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
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

## 🔑 Environment Variables
Create a `.env` file in both `frontend` and `backend` directories and add the following:

```
# Backend
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgres://user:password@db:5432/musician_connect
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```
