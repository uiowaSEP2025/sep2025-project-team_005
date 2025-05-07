import pytest
import uuid
from django.core import mail
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from pages.models import User, JobListing, Instrument, Genre, Business, JobApplication, Experience

SUBMIT_APPLICATION_URL = "/api/submit-application/"
FETCH_SINGLE_LISTING_URL = "/api/applications/listing/{}/"
PATCH_APPLICATION_URL = "/api/patch-application/{}/"
GET_APPLICATION_URL = "/api/job-application/{}/"
AUTOFILL_RESUME_URL = "/api/parse-resume/"
APPLICATION_EXPERIENCE_URL = "/api/job-application/{}/submit-experiences/"
SEND_ACCEPTANCE_EMAIL_URL = "/api/send-acceptance-email/"
SEND_REJECTION_EMAIL_URL = "/api/send-reject-email/"
USER_APPLICATIONS_URL = "/api/applications/user/"


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
    assert response.data["message"] == "Application created"
    
@pytest.mark.django_db
def test_get_application_success(auth_client, job_listing, create_user):
    """Test fetching a submitted application."""
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        alt_email="alt@example.com",
        phone="1234567890"
    )

    response = auth_client.get(GET_APPLICATION_URL.format(app.id))
    assert response.status_code == 200
    assert response.data["first_name"] == "Jane"
    assert response.data["last_name"] == "Doe"

@pytest.mark.django_db
def test_get_application_not_found(auth_client):
    """Test fetching an application that doesn't exist."""
    random_uuid = uuid.uuid4()
    response = auth_client.get(GET_APPLICATION_URL.format(random_uuid))
    assert response.status_code == 404
    assert response.data["error"] == "Job application not found."

@pytest.mark.django_db
def test_patch_application_success(auth_client, job_listing, create_user):
    """Test patching an application status."""
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        alt_email="alt@example.com",
        phone="1234567890"
    )
    data = {"status": "Under Review"}
    response = auth_client.patch(PATCH_APPLICATION_URL.format(app.id), data, format="json")
    assert response.status_code == 200
    assert response.data["status"] == "Under Review"

@pytest.mark.django_db
def test_patch_application_missing_status(auth_client, job_listing, create_user):
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        alt_email="alt@example.com",
        phone="1234567890"
    )
    response = auth_client.patch(PATCH_APPLICATION_URL.format(app.id), {}, format="json")
    assert response.status_code == 400
    assert response.data["detail"] == "Missing status field"

@pytest.mark.django_db
def test_submit_experiences_success(auth_client, job_listing, create_user):
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        alt_email="alt@example.com",
        phone="1234567890"
    )
    data = {
        "experiences": [
            {
                "job_title": "Guitarist",
                "company_name": "Freelance",
                "start_date": "2020-01-01",
                "end_date": "2023-01-01",
                "description": "Played at events"
            },
            {
                "job_title": "Session Musician",
                "company_name": "Studio Inc.",
                "start_date": "2018-01-01",
                "end_date": "2020-01-01",
                "description": "Studio work"
            }
        ]
    }

    response = auth_client.post(APPLICATION_EXPERIENCE_URL.format(app.id), data, format="json")
    assert response.status_code == 201
    assert response.data["message"] == "Experiences submitted successfully."
    assert Experience.objects.filter(application=app).count() == 2

@pytest.mark.django_db
def test_autofill_resume_missing_key(auth_client):
    response = auth_client.post(AUTOFILL_RESUME_URL, {}, format="json")
    assert response.status_code == 400
    assert response.data["error"] == "Missing s3_key"
    
@pytest.mark.django_db
def test_send_acceptance_email_success(auth_client, job_listing, create_user):
    """Test sending an acceptance email for a valid application."""
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        alt_email="jane.alt@example.com",
        phone="1234567890"
    )

    data = {
        "application_id": str(app.id),
        "app_email": "jane.alt@example.com"
    }

    response = auth_client.post(SEND_ACCEPTANCE_EMAIL_URL, data, format="json")

    assert response.status_code == 200
    assert response.data["message"] == "Acceptance email sent successfully."
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "SavvyNote - Application Accepted"
    assert "Congratulations" in mail.outbox[0].body or mail.outbox[0].alternatives[0][0]

@pytest.mark.django_db
def test_send_acceptance_email_missing_id(auth_client):
    """Test sending email with missing application_id."""
    data = {
        "app_email": "someone@example.com"
    }

    response = auth_client.post(SEND_ACCEPTANCE_EMAIL_URL, data, format="json")

    assert response.status_code == 400
    assert response.data["error"] == "Application ID is required."

@pytest.mark.django_db
def test_send_acceptance_email_app_not_found(auth_client):
    """Test sending email with a non-existent application ID."""
    random_uuid = uuid.uuid4()

    data = {
        "application_id": str(random_uuid),
        "app_email": "someone@example.com"
    }

    response = auth_client.post(SEND_ACCEPTANCE_EMAIL_URL, data, format="json")

    assert response.status_code == 404
    assert response.data["error"] == "Application not found."
    
@pytest.mark.django_db
def test_send_rejection_email_success(auth_client, job_listing, create_user):
    """Test sending an acceptance email for a valid application."""
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        alt_email="jane.alt@example.com",
        phone="1234567890"
    )

    data = {
        "application_id": str(app.id),
        "app_email": "jane.alt@example.com"
    }

    response = auth_client.post(SEND_REJECTION_EMAIL_URL, data, format="json")

    assert response.status_code == 200
    assert response.data["message"] == "Rejection email sent successfully."
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "SavvyNote - Application Update"
    assert "Dear" in mail.outbox[0].body or mail.outbox[0].alternatives[0][0]

@pytest.mark.django_db
def test_send_rejection_email_missing_id(auth_client):
    """Test sending email with missing application_id."""
    data = {
        "app_email": "someone@example.com"
    }

    response = auth_client.post(SEND_REJECTION_EMAIL_URL, data, format="json")

    assert response.status_code == 400
    assert response.data["error"] == "Application ID is required."

@pytest.mark.django_db
def test_send_rejection_email_app_not_found(auth_client):
    """Test sending email with a non-existent application ID."""
    random_uuid = uuid.uuid4()

    data = {
        "application_id": str(random_uuid),
        "app_email": "someone@example.com"
    }

    response = auth_client.post(SEND_REJECTION_EMAIL_URL, data, format="json")

    assert response.status_code == 404
    assert response.data["error"] == "Application not found."
    
@pytest.mark.django_db
def test_user_applications_view_returns_correct_applications(auth_client, job_listing, create_user):
    """Test that the user applications view returns only the applications for the authenticated user."""
    # Create applications for the test user
    JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        alt_email="alt@example.com",
        phone="1234567890"
    )
    JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Janet",
        last_name="Smith",
        alt_email="janet@example.com",
        phone="9876543210"
    )

    response = auth_client.get(USER_APPLICATIONS_URL)
    print(response.data)
    assert response.status_code == 200
    assert response.data["count"] == 2
    assert {app["first_name"] for app in response.data["results"]} == {"Jane", "Janet"}


@pytest.mark.django_db
def test_user_applications_view_empty(auth_client):
    """Test that the user applications view returns an empty list if the user has no applications."""
    response = auth_client.get(USER_APPLICATIONS_URL)
    assert response.status_code == 200
    assert response.data["count"] == 0
