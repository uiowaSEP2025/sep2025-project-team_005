import pytest
import uuid
import io
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from pages.models import User, JobListing, Instrument, Genre, Business

SUBMIT_APPLICATION_URL = "/api/submit-application/"
FETCH_SINGLE_LISTING_URL = "/api/applications/listing/{}/"


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

@pytest.mark.django_db
def test_submit_application_success(auth_client, job_listing):
    """Test submitting a valid job application with a PDF resume."""
    pdf_file = SimpleUploadedFile(
        "resume.pdf", b"%PDF-1.4 test content", content_type="application/pdf"
    )

    data = {
        "first_name": "Jane",
        "last_name": "Doe",
        "alt_email": "jane.alt@example.com",
        "phone": "1234567890",
        "job_listing": str(job_listing.id),
        "resume": pdf_file
    }

    response = auth_client.post(SUBMIT_APPLICATION_URL, data, format="multipart")

    assert response.status_code == 201
    assert "application_id" in response.data
    assert response.data["message"] == "Application submitted successfully."