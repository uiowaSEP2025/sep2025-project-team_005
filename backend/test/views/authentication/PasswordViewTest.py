import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.core import mail
from rest_framework import status
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator

User = get_user_model()
token_generator = PasswordResetTokenGenerator()

FORGOT_PASSWORD_URL = "/api/auth/forgot-password/"
RESET_PASSWORD_URL = "/api/auth/reset-password/"

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    return User.objects.create_user(
        username="resetuser",
        email="reset@example.com",
        password="Password1!",
        role="musician"
    )

# Forgot Password Tests
@pytest.mark.django_db
def test_forgot_password_sends_email(api_client, create_user):
    response = api_client.post(FORGOT_PASSWORD_URL, {"email": create_user.email})
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.data
    assert len(mail.outbox) == 1
    assert create_user.email in mail.outbox[0].to

@pytest.mark.django_db
def test_forgot_password_nonexistent_email(api_client):
    response = api_client.post(FORGOT_PASSWORD_URL, {"email": "unknown@example.com"})
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.data
    assert len(mail.outbox) == 0  # No email sent

@pytest.mark.django_db
def test_forgot_password_missing_email(api_client):
    response = api_client.post(FORGOT_PASSWORD_URL, {})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data

# Reset Password Tests
@pytest.mark.django_db
def test_reset_password_success(api_client, create_user):
    uid = urlsafe_base64_encode(force_bytes(create_user.id))
    token = token_generator.make_token(create_user)
    
    data = {
        "uid": uid,
        "token": token,
        "password": "NewPassword1!",
        "confirmedPassword": "NewPassword1!"
    }

    response = api_client.post(RESET_PASSWORD_URL, data)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["message"] == "Successfully reset the password!"
    create_user.refresh_from_db()
    assert create_user.check_password(data["password"])

@pytest.mark.django_db
def test_reset_password_invalid_token(api_client, create_user):
    uid = urlsafe_base64_encode(force_bytes(create_user.id))
    invalid_token = "invalid-token"

    data = {
        "uid": uid,
        "token": invalid_token,
        "password": "NewPassword1!",
        "confirmedPassword": "NewPassword1!"
    }

    response = api_client.post(RESET_PASSWORD_URL, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data

@pytest.mark.django_db
def test_reset_password_passwords_dont_match(api_client, create_user):
    uid = urlsafe_base64_encode(force_bytes(create_user.id))
    token = token_generator.make_token(create_user)

    data = {
        "uid": uid,
        "token": token,
        "password": "NewStrongPass123!",
        "confirmedPassword": "DifferentPass123!"
    }

    response = api_client.post(RESET_PASSWORD_URL, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "Passwords don't match."

@pytest.mark.django_db
def test_reset_password_missing_fields(api_client):
    response = api_client.post(RESET_PASSWORD_URL, {})  # No fields
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "Make sure all fields are filled out."

@pytest.mark.django_db
def test_reset_password_weak_password(api_client, create_user):
    uid = urlsafe_base64_encode(force_bytes(create_user.id))
    token = token_generator.make_token(create_user)

    data = {
        "uid": uid,
        "token": token,
        "password": "badPass",
        "confirmedPassword": "badPass"
    }

    response = api_client.post(RESET_PASSWORD_URL, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Password must be at least 8 characters" in response.data["error"]
