import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


User = get_user_model()
SIGNUP_URL = "/api/auth/signup/"

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    user = User.objects.create(username="testuser", email="testuser@example.com", password="TestPassword123!", role="musician")
    return user

@pytest.mark.django_db
def test_signup_success(api_client, create_user):
    data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "NewPassword123!",
        "role": "musician"
    }
    response = api_client.post(SIGNUP_URL, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(email=data["email"]).exists()

@pytest.mark.django_db
def test_signup_existing_email(api_client, create_user):
    data = {
        "username": "anotheruser",
        "email": create_user.email,
        "password": "NewPassword123!",
        "role": "musician"
    }
    response = api_client.post(SIGNUP_URL, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data