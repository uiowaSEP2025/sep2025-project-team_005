import pytest
import uuid
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from pages.models import User, JobListing, Instrument, Genre, Business

CREATE_JOB_URL = "/api/jobs/create/"
FETCH_JOB_URL = "/api/fetch-jobs/"
FETCH_ALL_JOBS_URL = "/api/fetch-all-jobs/"
FETCH_SINGLE_JOB_URL = "/api/fetch-job/"


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

@pytest.fixture
def job_listing(create_business, instrument, genre):
    """Fixture to create a job listing."""
    job = JobListing.objects.create(
        business=create_business,
        event_title="Sample Gig",
        venue="Cool Club",
        gig_type="oneTime",
        event_description="An awesome night of music",
        payment_type="Fixed amount",
        payment_amount=200.00,
        start_date="2025-06-01",
        end_date="2025-06-01",
        start_time="18:00",
        end_time="22:00",
    )

    job.instruments.set([instrument])
    job.genres.set([genre])

    return job

#@pytest.mark.django_db
#def test_create_joblisting_success(auth_client, create_user, create_business, instrument, genre):
#    job = {
#        "user_id": create_user.id,
#       "venue": "Cool Club",
#        "gig_type": "oneTime",
#        "event_description": "An awesome night of music",
#        "payment_type": "Fixed amount",
#        "payment_amount": 200.00,
#        "start_date": "2025-06-01",
#        "end_date": "2025-06-01",
#       "start_time": "18:00",
#        "end_time": "22:00",
#        "instruments": [instrument.id],
#        "genres": [genre.id],
#    }
#
#    response = auth_client.post(CREATE_JOB_URL, job, format='json')
#    assert response.status_code == status.HTTP_201_CREATED
#    assert JobListing.objects.filter(event_title="Sample Gig").exists()

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
    
@pytest.mark.django_db
def test_get_job_listings_success(auth_client, create_user, create_business, job_listing):
    """Test to successfully fetch job listings."""
    response = auth_client.get(FETCH_JOB_URL, {"user_id": create_user.id})
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1  # Assuming pagination is set to 1 per page
    assert response.data['results'][0]['event_title'] == "Sample Gig"

@pytest.mark.django_db
def test_get_job_listings_user_not_found(auth_client, create_user):
    """Test to fetch job listings when user is not found."""
    invalid_user_id = str(uuid.uuid4())
    response = auth_client.get(FETCH_JOB_URL, {"user_id": invalid_user_id})
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data['error'] == "User not found"

@pytest.mark.django_db
def test_get_job_listings_business_not_found(auth_client, create_user):
    """Test to fetch job listings when business profile is not found."""
    # Create user but not a business
    response = auth_client.get(FETCH_JOB_URL, {"user_id": create_user.id})
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data['error'] == "Business profile not found"

@pytest.mark.django_db
def test_get_job_listings_no_jobs(auth_client, create_user, create_business):
    """Test to fetch job listings when no jobs are available."""
    response = auth_client.get(FETCH_JOB_URL, {"user_id": create_user.id})
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 0  # No jobs available

@pytest.mark.django_db
def test_get_job_listings_paginated(auth_client, create_user, create_business, instrument, genre, job_listing):
    """Test to ensure pagination works for job listings."""
    pagination_job = JobListing.objects.create(
        business=create_business,
        event_title="Another Gig",
        venue="Another Club",
        gig_type="oneTime",
        event_description="A second awesome night of music",
        payment_type="Fixed amount",
        payment_amount=300.00,
        start_date="2025-06-02",
        end_date="2025-06-02",
        start_time="18:00",
        end_time="22:00",
    )
    
    pagination_job.instruments.set([instrument])
    pagination_job.genres.set([genre])

    response = auth_client.get(FETCH_JOB_URL, {"user_id": create_user.id})
    
    # Should return paginated results, depending on your page size
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 2  # Assuming 2 jobs now available
    
@pytest.mark.django_db
def test_fetch_all_jobs_success(auth_client, create_business, instrument, genre):
    """Test fetching all job listings with pagination."""
    # Create multiple job listings
    for i in range(8):
        job = JobListing.objects.create(
            business=create_business,
            event_title=f"Gig {i}",
            venue=f"Venue {i}",
            gig_type="oneTime",
            event_description=f"Description {i}",
            payment_type="Fixed amount",
            payment_amount=100.00 + i,
            start_date="2025-06-01",
            end_date="2025-06-01",
            start_time="18:00",
            end_time="22:00",
        )
        job.instruments.set([instrument])
        job.genres.set([genre])

    response = auth_client.get(FETCH_ALL_JOBS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert "results" in response.data
    assert len(response.data["results"]) == 6  # page size = 6
    assert response.data["count"] == 8


@pytest.mark.django_db
def test_fetch_single_job_success(auth_client, job_listing):
    """Test retrieving a specific job listing by ID."""
    response = auth_client.get(FETCH_SINGLE_JOB_URL, {"listing_id": str(job_listing.id)})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["event_title"] == "Sample Gig"
    assert response.data["venue"] == "Cool Club"


@pytest.mark.django_db
def test_fetch_single_job_not_found(auth_client):
    """Test retrieving a job listing with an invalid ID."""
    invalid_id = 0000
    response = auth_client.get(FETCH_SINGLE_JOB_URL, {"listing_id": invalid_id})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "Job listing not found"
