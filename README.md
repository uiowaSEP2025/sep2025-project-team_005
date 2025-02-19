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

### Testing
#### All Tests
```sh
cd backend
pytest
```
#### Single File Tests
```sh
pytest test/path/to/test.py -v
```
#### Single File Tests
```sh
pytest test/path/to/test.py -v
```

### Behave Setup
```sh
cd backend
pip install behave django-behave
pip install django-environ
```

### Running Behave Features
```sh
cd frontend
npm run dev

cd backend
behave features/XXXX.feature
```

### Selenium Setup
```sh
pip install selenium

# The following commands are for installing chrome:
# Install the browser you will want to test on for WSL:
sudo apt update
sudo apt install -y wget
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb

# Install the browser you will want to test on for Mac:
pip install selenium
brew install --cask google-chrome


# Selenium requires you to have a WebDriver as well since it controls browsers, one way to acheive this is to install a
# driver manager to automatically handle compatible versions for you:
pip install webdriver-manager
```

If this does not work for your environment, you can download one manually and set the path for your tests to be able to find when needed. Download of the following based on what browser you want to test with:
- [Chrome](https://developer.chrome.com/docs/chromedriver/downloads)
- [Firefox](https://github.com/mozilla/geckodriver/releases)
- [MicrosoftEdge](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/?form=MA13LH)

IMPORTANT NOTE: Make sure the version you download matches that of your browser version Once downloaded and extracted from the zip file, copy and paste the driver's .exe file to a folder in your system PATH (for windows, this could be C:\Windows\System32, C:\Windows\, C:\Program Files\, or another, for mac move to /usr/local/bin/), or if you do not want to copy and paste this you can specify the full path to the driver in your Selenium script

```sh
# If doing this alternative, verify the web driver is accessible
# Chrome:
chromedriver --version
# Firefox:
geckodriver --version
# Microsoft Edge:
msedgedriver --version
```

### Testing Selenium Setup:
Before being able to successfully run your Selenium tests, there may be some modifications that need to be made to the test files themselves depending on your setup. Using the file `test_landing_page.py` as an example, you would need to change line 11's `user_data_dir` string to your specific directory you will be using for this. Just make an empty directory wherever you would like (if using WSL it must be in there), and replace the path that is in there to yours. This empty directory acts as temporary session storage for user data while the Selenium tests are running, and will be cleared out via the `clear_user_data_dir` function (this is the only way I could get it to work without running into session errors). Additionally, the options specified may not be necessary for everyone's environment, it was just the only way I got it to work. The web driver used can be changed by importing another other than Chrome, but I had many problems with the others so I would not recommend. Now you can attempt to run this test_landing_page.py Selenium test by doing the following:

```sh
# Start up the application but DO NOT open it in browser
npm run dev

# In another terminal, run this command:
python frontend/tests/selenium/test_landing_page.py
```

If the setup is successful, the following print statement should be seen in the terminal: "Test passed: found expected welcome message 'Connect, Collaborate, and Contract'"

# Backend
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgres://<user>:<password>@localhost:5432/savvy-note-sp
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```
