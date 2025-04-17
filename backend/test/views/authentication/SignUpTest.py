import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from pages.models import Musician, Business, Instrument, Genre


User = get_user_model()
SIGNUP_URL = "/api/auth/signup/"

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    user = User.objects.create(username="testuser", email="testuser@example.com", password="TestPassword1!", role="musician")
    return user

@pytest.fixture
def instrument(db):
    return Instrument.objects.create(instrument="Guitar")

@pytest.fixture
def genre(db):
    return Genre.objects.create(genre="Rock")

@pytest.mark.django_db
def test_signup_musician_success(api_client, instrument, genre):
    data = {
        "username": "musouser",
        "email": "musouser@example.com",
        "password": "StrongPass1!",
        "role": "musician",
        "stage_name": "Muso Pro",
        "years_played": 5,
        "home_studio": True,
        "instruments": [
            {"id": instrument.id, "years_played": 3}
        ],
        "genres": [
            {"id": genre.id}
        ]
    }
    response = api_client.post(SIGNUP_URL, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(email=data["email"]).exists()
    assert Musician.objects.filter(user__email=data["email"]).exists()

@pytest.mark.django_db
def test_signup_business_success(api_client):
    data = {
        "username": "bizuser",
        "email": "biz@example.com",
        "password": "StrongPass1!",
        "role": "business",
        "business_name": "BigSound Inc",
        "industry": "Audio Equipment"
    }
    response = api_client.post(SIGNUP_URL, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(email=data["email"]).exists()
    assert Business.objects.filter(user__email=data["email"]).exists()

@pytest.mark.django_db
def test_signup_invalid_instrument(api_client):
    data = {
        "username": "badinstruuser",
        "email": "badinstru@example.com",
        "password": "StrongPass1!",
        "role": "musician",
        "instruments": [
            {"id": 9999, "years_played": 2}
        ]
    }
    response = api_client.post(SIGNUP_URL, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data
    assert response.data["error"] == "Instrument not found."

@pytest.mark.django_db
def test_signup_missing_fields(api_client):
    data = {
        "username": "",  # empty username
        "email": "nope@example.com",
        "password": "",
        "role": "musician"
    }
    response = api_client.post(SIGNUP_URL, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in response.data
    assert "password" in response.data

@pytest.mark.django_db
def test_signup_existing_email(api_client, create_user):
    data = {
        "username": "anotheruser",
        "email": create_user.email,
        "password": "NewPassword1!",
        "role": "musician"
    }
    response = api_client.post(SIGNUP_URL, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data