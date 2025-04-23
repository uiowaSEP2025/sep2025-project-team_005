import pytest
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from pages.models import User, JobListing, Instrument, Genre, Business

CREATE_JOB_URL = "/api/jobs/create/"

@pytest.fixture
def create_user():
    """Fixture to create a test user."""
    return User.objects.create_user(username="testuser", email="test@test.com")

@pytest.fixture
def auth_client(create_user):
    client = APIClient()
    client.force_authenticate(user=create_user)
    return client

@pytest.fixture
def create_business(create_user):
    return Business.objects.create(
        user=create_user,
        business_name="Test Business",
        industry="Music"
    )

@pytest.fixture
def instrument():
    return Instrument.objects.create(instrument="Guitar")

@pytest.fixture
def genre():
    return Genre.objects.create(genre="Rock")

@pytest.mark.django_db
def test_create_joblisting_success(auth_client, create_user, create_business, instrument, genre):
    job = {
        "user_id": create_user.id,
        "event_title": "Sample Gig",
        "venue": "Cool Club",
        "gig_type": "oneTime",
        "event_description": "An awesome night of music",
        "payment_type": "Fixed amount",
        "payment_amount": 200.00,
        "start_date": "2025-06-01",
        "end_date": "2025-06-01",
        "start_time": "18:00",
        "end_time": "22:00",
        "instruments": [instrument.id],
        "genres": [genre.id],
    }

    response = auth_client.post(CREATE_JOB_URL, job, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert JobListing.objects.filter(event_title="Sample Gig").exists()

@pytest.mark.django_db
def test_create_joblisting_invalid_data(auth_client, create_user, create_business):
    response = auth_client.post(CREATE_JOB_URL, {"user_id": create_user.id}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data

@pytest.mark.django_db
def test_create_joblisting_no_user(auth_client):
    response = auth_client.post(CREATE_JOB_URL, {"user_id": 9999}, format='json')
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "error" in response.data