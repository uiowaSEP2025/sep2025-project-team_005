import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
django.setup()

from pages.models import User  # Import your models

def seed_database():
    if not User.objects.exists():  # Prevent duplicate seeding
        User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        User.objects.create_user(username="testuser3", email="test2@test.com", password="password123")
        print("Database seeded successfully!")
    else:
        print("Database already contains data. No seeding performed.")

if __name__ == "__main__":
    seed_database()

