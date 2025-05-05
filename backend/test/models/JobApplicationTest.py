import pytest
import uuid
from rest_framework.test import APIClient
from django.core.exceptions import ValidationError
from pages.models import JobApplication, User, JobListing, Genre, Instrument, Business
from django.contrib.postgres.fields import ArrayField


@pytest.fixture
def create_user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass',
        role='business',
        phone='123-456-7890'
    )

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
def test_job_application_creation(create_user, job_listing):
    """Test successful creation of a JobApplication."""
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        phone="123-456-7890",
        alt_email="jane.alt@example.com",
        file_keys=["file1.pdf", "file2.pdf"],
        status="Submitted"
    )

    assert isinstance(app.id, uuid.UUID)
    assert app.first_name == "Jane"
    assert app.last_name == "Doe"
    assert app.status == "Submitted"
    assert app.file_keys == ["file1.pdf", "file2.pdf"]


@pytest.mark.django_db
def test_job_application_invalid_phone(create_user, job_listing):
    """Test phone number with invalid format raises ValidationError."""
    app = JobApplication(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        phone="invalid_number",
        alt_email="jane@example.com",
        file_keys=[],
    )
    with pytest.raises(ValidationError):
        app.full_clean()


@pytest.mark.django_db
def test_file_key_too_long(create_user, job_listing):
    """Test file key exceeding 255 characters raises ValidationError."""
    long_key = "a" * 256
    app = JobApplication(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        phone="123-456-7890",
        alt_email="jane@example.com",
        file_keys=[long_key],
    )
    with pytest.raises(ValidationError):
        app.full_clean()


@pytest.mark.django_db
def test_file_key_array_too_large(create_user, job_listing):
    """Test that more than 10 file keys raises ValidationError."""
    file_keys = [f"file_{i}.pdf" for i in range(11)]
    app = JobApplication(
        applicant=create_user,
        listing=job_listing,
        first_name="Jane",
        last_name="Doe",
        phone="123-456-7890",
        alt_email="jane@example.com",
        file_keys=file_keys,
    )
    with pytest.raises(ValidationError):
        app.full_clean()


@pytest.mark.django_db
def test_optional_fields(create_user, job_listing):
    """Test optional fields can be left blank."""
    app = JobApplication.objects.create(
        applicant=create_user,
        listing=job_listing,
        first_name="NoAlt",
        last_name="User",
        phone=None,
        alt_email=None,
        file_keys=[],
    )
    assert app.phone is None
    assert app.alt_email is None


@pytest.mark.django_db
def test_invalid_status_choice(create_user, job_listing):
    """Test invalid status choice raises ValidationError."""
    app = JobApplication(
        applicant=create_user,
        listing=job_listing,
        first_name="Test",
        last_name="User",
        phone="123-456-7890",
        status="NotAStatus",
        file_keys=[]
    )
    with pytest.raises(ValidationError):
        app.full_clean()