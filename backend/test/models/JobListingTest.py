import pytest
from django.contrib.auth import get_user_model
from pages.models import Business, JobListing, Instrument, Genre
from django.utils import timezone

@pytest.fixture
def user():
    """Fixture to create a user instance for testing."""
    user = get_user_model().objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpassword',
        phone='123-456-7890',
        role='business',
    )
    return user

@pytest.fixture
def business(user):
    """Fixture to create a business linked to the user."""
    business = Business.objects.create(
        user=user,
        business_name="TestBiz",
        industry="Music",
    )
    return business

@pytest.mark.django_db
def test_create_joblisting_with_required_fields(business):
    """Test job listing creation with required fields."""
    job = JobListing.objects.create(
        business=business,
        event_title="Jazz Night",
        venue="Downtown Lounge",
        gig_type="oneTime",
        event_description="Live jazz event",
        payment_type="Fixed amount",
        payment_amount=150.00,
        start_date="2025-06-01",
        end_date="2025-06-01",
        start_time="18:00",
        end_time="22:00"
    )

    assert job.pk is not None
    assert job.event_title == "Jazz Night"
    assert job.venue == "Downtown Lounge"
    assert job.gig_type == "oneTime"
    assert job.event_description == "Live jazz event"
    assert job.payment_type == "Fixed amount"
    assert job.payment_amount == 150.00
    assert job.start_date == "2025-06-01"
    assert job.end_date == "2025-06-01"
    assert job.start_time == "18:00"
    assert job.end_time == "22:00"

@pytest.mark.django_db
def test_joblisting_str_method(business):
    """Test the string representation of a job listing."""
    job = JobListing.objects.create(
        business=business,
        event_title="Open Mic Night",
        venue="Cafe Vibe",
        gig_type="recurring",
        event_description="Weekly open mic event",
        payment_type="Hourly rate",
    )

    assert str(job) == "Open Mic Night"

@pytest.mark.django_db
def test_joblisting_many_to_many_fields(business):
    """Test the many-to-many fields (instruments and genres) in job listing."""
    instrument = Instrument.objects.create(instrument="Piano")
    genre = Genre.objects.create(genre="Jazz")

    job = JobListing.objects.create(
        business=business,
        event_title="Evening Jam",
        venue="The Blue Room",
        gig_type="recurring",
        event_description="Chill jam session",
        payment_type="Fixed amount",
        payment_amount=100.00,
    )
    
    job.instruments.add(instrument)
    job.genres.add(genre)

    assert instrument in job.instruments.all()
    assert genre in job.genres.all()

@pytest.mark.django_db
def test_optional_fields_can_be_blank_or_null(business):
    """Test that optional fields can be blank or null."""
    job = JobListing.objects.create(
        business=business,
        event_title="Minimal Gig",
        venue="NoFrills Hall",
        gig_type="oneTime",
        event_description="Minimalist concert",
        payment_type="Fixed amount",
    )

    assert job.payment_amount is None
    assert job.start_date is None
    assert job.recurring_pattern == None
