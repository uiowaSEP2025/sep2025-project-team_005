import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
LOGIN_URL = "/api/auth/login/"
LOGOUT_URL = "/api/auth/logout/"

## Test User Model correctly retrieves the user
def test_get_user_model():
    user_model = get_user_model()
    assert user_model == User 

## Login Function
@pytest.fixture
def create_user(db):
    """Fixture to create a user for authentication tests."""
    return User.objects.create_user(username="testuser", password="testpassword", first_name="John", last_name="Doe", role="musician")

@pytest.fixture
def api_client():
    """Fixture to provide API test client."""
    return APIClient()

@pytest.mark.django_db
def test_login_success(api_client, create_user):
    """Test successful login with valid credentials."""
    url = LOGIN_URL
    response = api_client.post(url, {"username": "testuser", "password": "testpassword"}, format="json")
    
    # Assert successful login (200 OK)
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["username"] == "testuser"

@pytest.mark.django_db
def test_login_failure(api_client):
    """Test failed login with invalid credentials."""
    url = LOGIN_URL
    response = api_client.post(url, {"username": "wronguser", "password": "wrongpassword"}, format="json")
    
    assert response.status_code == 401
    assert "error" in response.data
    
    
## Logout Function
@pytest.fixture
def authenticated_client(api_client, create_user):
    """Fixture to create an authenticated API client."""
    refresh = RefreshToken.for_user(create_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return api_client

def test_logout_success(authenticated_client):
    """Test successful logout where refresh token is blacklisted."""
    url = LOGOUT_URL
    response = authenticated_client.post(url, {}, format="json")
    
    assert response.status_code == 200
    assert response.data["message"] == "Logged out successfully"

def test_logout_unauthenticated(api_client):
    """Test logout attempt without authentication."""
    url = LOGOUT_URL
    response = api_client.post(url, {}, format="json")
    
    assert response.status_code == 401  # Expect unauthorized