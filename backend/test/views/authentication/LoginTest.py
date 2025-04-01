import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


User = get_user_model()
LOGIN_URL = "/api/auth/login/"
PROFILE_URL = "/api/auth/profile/"

## Test User Model correctly retrieves the user
def test_get_user_model():
    user_model = get_user_model()
    assert user_model == User 
    


@pytest.fixture
def create_user(db):
    """Fixture to create a user for authentication tests."""
    user1 = User.objects.create_user(username="testuser1", password="testpassword1!", email="user1@gmail.com", first_name="John", last_name="Doe", role="musician")
    user2 = User.objects.create_user(username="testuser2", password="testpassword2!", email="user2@gmail.com", first_name="Jane", last_name="Doe", role="musician")
    return user1, user2

@pytest.fixture
def get_token_user1(api_client, create_user):
    user1, _ = create_user
    url = LOGIN_URL
    response = api_client.post(url, {"username": "testuser1", "password": "testpassword1!"}, format="json")
    return response.data["access"]

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
    
@pytest.mark.django_db
def test_profile_view_authenticated(api_client, create_user, get_token_user1):
    user1, user2 = create_user
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {get_token_user1}")
    response = api_client.get(PROFILE_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == user1.username

@pytest.mark.django_db
def test_profile_view_unauthenticated(api_client):
    response = api_client.get(PROFILE_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED