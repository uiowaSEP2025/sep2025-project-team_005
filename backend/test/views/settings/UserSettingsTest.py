import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pages.models import Musician, Instrument, Genre

User = get_user_model()
MUSICIAN_URL = "/api/musician/{}/"
CHANGE_PASSWORD_URL = "/api/change-password/"

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_musician(db):
    """Creates a test user with a musician profile, instruments, and genres."""
    user = User.objects.create_user(username="testuser", email="test@gmail.com", password="Testpassword1!")
    musician = Musician.objects.create(user=user, stage_name="Test Band", years_played=5, home_studio=True)

    instrument1 = Instrument.objects.create(instrument="Guitar")
    instrument2 = Instrument.objects.create(instrument="Piano")
    genre = Genre.objects.create(genre="Rock")

    musician.instruments.add(instrument1, instrument2)
    musician.genres.add(genre)
    musician.save()
    return user, musician

@pytest.mark.django_db
def test_get_musician_detail(api_client, create_musician):
    """Test retrieving musician details."""
    user, musician = create_musician
    url = MUSICIAN_URL.format(user.id)
    response = api_client.get(url)

    assert response.status_code == 200
    assert response.data["instruments"] == ["Guitar", "Piano"]
    assert response.data["genres"] == ["Rock"]
    assert response.data["stage_name"] == "Test Band"
    assert response.data["years_played"] == 5
    assert response.data["home_studio"] == True

@pytest.mark.django_db
def test_get_user_not_found(api_client):
    """Test retrieving a musician profile for a non-existent user."""
    url = MUSICIAN_URL.format("00000000-0000-0000-0000-000000000000")
    response = api_client.get(url)

    assert response.status_code == 404
    assert response.data == {"error": "User not found"}

@pytest.mark.django_db
def test_get_musician_not_found(api_client, db):
    """Test retrieving a musician profile when the user exists but musician does not."""
    user = User.objects.create_user(username="testuser", email="test@gmail.com", password="Testpassword1!")
    url = MUSICIAN_URL.format(user.id)
    response = api_client.get(url)

    assert response.status_code == 404
    assert response.data == {"error": "Musician profile not found"}
