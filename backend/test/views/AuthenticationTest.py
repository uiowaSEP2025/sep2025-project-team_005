import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


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
@pytest.mark.django_db
def test_logout_success():
    client = APIClient()

    # Simulate a logged-in user by setting cookies
    client.cookies["access_token"] = "test_access_token"
    client.cookies["refresh_token"] = "test_refresh_token"

    response = client.post(LOGOUT_URL)  # Call the logout endpoint

    # Assertions
    assert response.status_code == 200  # Check if logout is successful
    assert response.data["message"] == "Logged out successfully"

    # Ensure cookies have expired
    assert response.cookies["access_token"].value == ""
    assert response.cookies["refresh_token"].value == ""
    
@pytest.mark.django_db
def test_logout_without_cookies():
    client = APIClient()
    
    response = client.post(LOGOUT_URL)  # Call the logout endpoint

    # Assertions
    assert response.status_code == 200  # Should still return success
    assert response.data["message"] == "Logged out successfully"

    # Ensure cookies have expired
    assert response.cookies["access_token"].value == ""
    assert response.cookies["refresh_token"].value == ""

@pytest.mark.django_db
def test_logout_exception(monkeypatch):
    client = APIClient()
    
    # Patch response.delete_cookie to raise an exception
    def mock_delete_cookie(*args, **kwargs):
        raise Exception("Mocked exception")

    monkeypatch.setattr("pages.authentication.view.Response.delete_cookie", mock_delete_cookie)

    response = client.post(LOGOUT_URL)

    # Assertions
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "error" in response.data
    assert response.data["error"] == "An error occurred while logging out"
    assert "details" in response.data
    assert response.data["details"] == "Mocked exception"