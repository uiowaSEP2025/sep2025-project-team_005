import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


User = get_user_model()
LOGIN_URL = "/api/auth/login/"

## Test User Model correctly retrieves the user
def test_get_user_model():
    user_model = get_user_model()
    assert user_model == User 
    


@pytest.fixture
def create_user(db):
    """Fixture to create a user for authentication tests."""
    User.objects.create_user(username="testuser1", password="testpassword1!", email="user1@gmail.com", first_name="John", last_name="Doe", role="musician")
    User.objects.create_user(username="testuser2", password="testpassword2!", email="user2@gmail.com", first_name="Jane", last_name="Doe", role="musician")

@pytest.fixture
def api_client():
    """Fixture to provide API test client."""
    return APIClient()

@pytest.mark.django_db
def test_login_success(api_client, create_user):
    """Test successful login with valid credentials."""
    url = LOGIN_URL
    response = api_client.post(url, {"username": "testuser1", "password": "testpassword1!"}, format="json")
    
    # Assert successful login (200 OK)
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["username"] == "testuser1"
    
@pytest.mark.django_db
def test_unique_tokens_for_different_users(api_client, create_user):
    """Test that two different users receive different access tokens."""
    url = LOGIN_URL

    response1 = api_client.post(url, {"username": "testuser1", "password": "testpassword1!"}, format="json")
    assert response1.status_code == 200
    assert "access" in response1.data

    response2 = api_client.post(url, {"username": "testuser2", "password": "testpassword2!"}, format="json")
    assert response2.status_code == 200
    assert "access" in response2.data

    assert response1.data["access"] != response2.data["access"]


@pytest.mark.django_db
def test_login_failure(api_client):
    """Test failed login with invalid credentials."""
    url = LOGIN_URL
    response = api_client.post(url, {"username": "wronguser", "password": "wrongpassword"}, format="json")
    
    assert response.status_code == 401
    assert "error" in response.data