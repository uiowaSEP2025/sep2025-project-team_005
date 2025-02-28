import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


User = get_user_model()
LOGOUT_URL = "/api/auth/logout/"

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