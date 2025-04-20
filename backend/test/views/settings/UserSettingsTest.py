import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pages.models import Musician, Instrument, Genre, MusicianInstrument, Business, BlockedUser
import json

User = get_user_model()
MUSICIAN_URL = "/api/musician/{}/"
BUSINESS_URL = "/api/business/{}/"
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

    MusicianInstrument.objects.create(musician=musician, instrument=instrument1, years_played=3)
    MusicianInstrument.objects.create(musician=musician, instrument=instrument2, years_played=2)
    musician.genres.add(genre)
    musician.save()
    return user, musician

@pytest.fixture
def create_business(db):
    """Creates a test user with a business name and industry."""
    user = User.objects.create_user(username="testuser", email="business@gmail.com", password="Testpassword1!")
    business = Business.objects.create(user=user, business_name="Test Business", industry="Test Industry")

    return user, business

@pytest.mark.django_db
def test_get_musician_detail(api_client, create_musician):
    """Test retrieving musician details."""
    user, musician = create_musician
    url = MUSICIAN_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    response = api_client.get(url)
    assert response.status_code == 200
    assert [inst["instrument_name"] for inst in response.data["instruments"]] == ["Guitar", "Piano"]
    assert [inst["years_played"] for inst in response.data["instruments"]] == [3, 2]
    assert response.data["genres"] == ["Rock"]
    assert response.data["stage_name"] == "Test Band"
    assert response.data["home_studio"] == True

@pytest.mark.django_db
def test_get_user_not_found(api_client):
    """Test retrieving a musician profile for a non-existent user."""
    url = MUSICIAN_URL.format("00000000-0000-0000-0000-000000000000")
    response = api_client.get(url)

    assert response.status_code == 404
    assert response.data == {"error": "User not found"}
    
    url = BUSINESS_URL.format("00000000-0000-0000-0000-000000000000")
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

@pytest.mark.django_db
def test_get_musician_while_blocked(api_client, create_musician, db):
    user = create_musician[0]
    api_client.force_authenticate(user=user)
    user2 = User.objects.create_user(username="testuser2", email="test2@gmail.com", password="Testpassword1!")
    Musician.objects.create(user=user2, stage_name="Test2 Band", years_played=5, home_studio=True)
    blockedUser = BlockedUser.objects.create(blocker=user2, blocked=user)
    blockedUser.save()

    url = MUSICIAN_URL.format(user2.id)
    response = api_client.get(url)
    
    assert response.status_code == 403
    assert response.data == {"detail": "You are blocked from viewing this profile."}  

@pytest.mark.django_db
def test_patch_musician(api_client, create_musician):
    """Test updating musician profile with new instruments and genres."""
    user, musician = create_musician
    url = MUSICIAN_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    instrument = Instrument.objects.create(instrument="Drums")
    MusicianInstrument.objects.create(musician=musician, instrument=instrument, years_played=2)

    Genre.objects.create(genre="Jazz")
    
    updated_data = {
        "username": "updateduser",
        "email": "updated@gmail.com",
        "phone": "1234567890",
        "instruments": [{"instrument_name": "Drums", "years_played": 2}],
        "genres": ["Jazz"],
        "home_studio": True
    }
    
    response = api_client.patch(url, json.dumps(updated_data), content_type="application/json")
    
    assert response.status_code == 200
    assert response.data == {"message": "Profile updated successfully"}
    user.refresh_from_db()
    musician.refresh_from_db()
    assert user.username == "updateduser"
    assert user.email == "updated@gmail.com"
    assert list(musician.genres.values_list("genre", flat=True)) == ["Jazz"]

@pytest.mark.django_db
def test_patch_musician_user_not_found(api_client):
    url = MUSICIAN_URL.format("00000000-0000-0000-0000-000000000000")
    response = api_client.patch(url, {}, format="json")
    
    assert response.status_code == 404
    assert response.data == {"error": "User not found"}

@pytest.mark.django_db
def test_patch_musician_not_found(api_client, db):
    user = User.objects.create_user(username="testuser", email="test@gmail.com", password="Testpassword1!")
    url = MUSICIAN_URL.format(user.id)
    response = api_client.patch(url)
    
    assert response.status_code == 404
    assert response.data == {"error": "Musician profile not found"}

@pytest.mark.django_db
def test_patch_musician_used_email(api_client, create_musician, db):
    user = create_musician[0]
    url = MUSICIAN_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    user = User.objects.create_user(username="testupdated", email="updated@gmail.com", password="Testpassword1!")
    
    updated_data = {
        "username": "updateduser",
        "email": "updated@gmail.com",
        "phone": "1234567890",
        "instruments": [{"instrument_name": "Drums", "years_played": 2}],
        "genres": ["Jazz"],
        "home_studio": True
    }
    
    response = api_client.patch(url, json.dumps(updated_data), content_type="application/json")
    
    assert response.status_code == 400
    assert response.data == {"error": "Email already in use"}

@pytest.mark.django_db
def test_patch_musician_used_name(api_client, create_musician, db):
    user = create_musician[0]
    url = MUSICIAN_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    user = User.objects.create_user(username="updateduser", email="updatedtest@gmail.com", password="Testpassword1!")
    
    updated_data = {
        "username": "updateduser",
        "email": "updated@gmail.com",
        "phone": "1234567890",
        "instruments": [{"instrument_name": "Drums", "years_played": 2}],
        "genres": ["Jazz"],
        "home_studio": True
    }
    
    response = api_client.patch(url, json.dumps(updated_data), content_type="application/json")
    
    assert response.status_code == 400
    assert response.data == {"error": "Username already taken"}

@pytest.mark.django_db
def test_patch_instrument_not_found(api_client, db):
    user = User.objects.create_user(username="testuser", email="test@gmail.com", password="Testpassword1!")
    musician = Musician.objects.create(user=user, stage_name="Test Band", years_played=5, home_studio=True)
    genre = Genre.objects.create(genre="Rock")
    musician.genres.add(genre)
    musician.save()

    url = MUSICIAN_URL.format(user.id)
    api_client.force_authenticate(user=user)
    response = api_client.patch(url, {"instruments":[{"instrument_name": "instrument", "years_played": 3}], "genres": [genre.genre]}, format="json")
    
    assert response.status_code == 404
    assert response.data == {"error": "Instrument not found"}
    
@pytest.mark.django_db
def test_patch_genre_not_found(api_client, db):
    user = User.objects.create_user(username="testuser", email="test@gmail.com", password="Testpassword1!")
    musician = Musician.objects.create(user=user, stage_name="Test Band", years_played=5, home_studio=True)
    instrument = Instrument.objects.create(instrument="Guitar")
    musicianInstrument = MusicianInstrument.objects.create(musician=musician, instrument=instrument, years_played=3)

    url = MUSICIAN_URL.format(user.id)
    api_client.force_authenticate(user=user)
    response = api_client.patch(url, {"instruments":[{"instrument_name": instrument.instrument, "years_played": musicianInstrument.years_played}], "genres":["genre"]}, format="json")
    
    assert response.status_code == 404
    assert response.data == {"error": "Genre not found"}

@pytest.mark.django_db
def test_patch_business(api_client, create_business):
    """Test updating business profile."""
    user, business = create_business
    url = BUSINESS_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    updated_data = {
        "username": "updateduser",
        "email": "updated@gmail.com",
        "phone": "1234567890",
        "business_name": "New Business",
        "industry": "New Industry",
    }
    
    response = api_client.patch(url, json.dumps(updated_data), content_type="application/json")
    
    assert response.status_code == 200
    assert response.data == {"message": "Profile updated successfully"}
    user.refresh_from_db()
    business.refresh_from_db()
    assert user.username == "updateduser"
    assert user.email == "updated@gmail.com"
    assert business.business_name == "New Business"
    assert business.industry == "New Industry"
    
@pytest.mark.django_db
def test_patch_business_user_not_found(api_client):
    """Test updating a business profile that doesn't exist."""
    url = BUSINESS_URL.format("00000000-0000-0000-0000-000000000000")
    response = api_client.patch(url, {}, format="json")
    
    assert response.status_code == 404
    assert response.data == {"error": "User not found"}

@pytest.mark.django_db
def test_patch_business_not_found(api_client, db):
    user = User.objects.create_user(username="testuser", email="test@gmail.com", password="Testpassword1!")
    url = BUSINESS_URL.format(user.id)
    response = api_client.patch(url)
    
    assert response.status_code == 404
    assert response.data == {"error": "Business profile not found"}


@pytest.mark.django_db
def test_patch_business_used_email(api_client, create_business, db):
    user = create_business[0]
    url = BUSINESS_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    user = User.objects.create_user(username="testupdated", email="updated@gmail.com", password="Testpassword1!")
    
    updated_data = {
        "username": "updateduser",
        "email": "updated@gmail.com",
        "phone": "1234567890",
        "instruments": [{"instrument_name": "Drums", "years_played": 2}],
        "genres": ["Jazz"],
        "home_studio": True
    }
    
    response = api_client.patch(url, json.dumps(updated_data), content_type="application/json")
    
    assert response.status_code == 400
    assert response.data == {"error": "Email already in use"}

@pytest.mark.django_db
def test_patch_business_used_name(api_client, create_business, db):
    user = create_business[0]
    url = BUSINESS_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    user = User.objects.create_user(username="updateduser", email="updatedtest@gmail.com", password="Testpassword1!")
    
    updated_data = {
        "username": "updateduser",
        "email": "updated@gmail.com",
        "phone": "1234567890",
        "instruments": [{"instrument_name": "Drums", "years_played": 2}],
        "genres": ["Jazz"],
        "home_studio": True
    }
    
    response = api_client.patch(url, json.dumps(updated_data), content_type="application/json")
    
    assert response.status_code == 400
    assert response.data == {"error": "Username already taken"}

@pytest.mark.django_db
def test_change_password(api_client, create_musician):
    """Test changing the user's password."""
    user, _ = create_musician
    api_client.force_authenticate(user=user)
    
    data = {
        "password": "Testpassword1!",
        "new_password": "Newpassword1!"
    }
    
    response = api_client.post(CHANGE_PASSWORD_URL, data, format="json")
    
    assert response.status_code == 200
    assert response.data == {"message": "Password changed successfully"}
    user.refresh_from_db()
    assert user.check_password("Newpassword1!")

@pytest.mark.django_db
def test_change_password_invalid(api_client, create_musician):
    """Test changing password with an incorrect current password."""
    user, _ = create_musician
    api_client.force_authenticate(user=user)
    
    data = {
        "password": "Wrongpassword!",
        "new_password": "Newpassword1!"
    }
    
    response = api_client.post(CHANGE_PASSWORD_URL, data, format="json")
    
    assert response.status_code == 400
    assert response.data == {"error": "Current password is incorrect"}

@pytest.mark.django_db
def test_get_business_detail(api_client, create_business):
    """Test retrieving business details."""
    user, business = create_business
    url = BUSINESS_URL.format(user.id)
    api_client.force_authenticate(user=user)
    
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data["business_name"] == "Test Business"
    assert response.data["industry"] == "Test Industry"
    
@pytest.mark.django_db
def test_get_business_not_found(api_client, db):
    """Test retrieving a business profile when the user exists but business does not."""
    user = User.objects.create_user(username="testuser", email="test@gmail.com", password="Testpassword1!")
    url = BUSINESS_URL.format(user.id)
    response = api_client.get(url)
    
    assert response.status_code == 404
    assert response.data == {"error": "Business profile not found"}

@pytest.mark.django_db
def test_get_business_while_blocked(api_client, create_business, db):
    user = create_business[0]
    api_client.force_authenticate(user=user)
    user2 = User.objects.create_user(username="testuser2", email="test2@gmail.com", password="Testpassword1!")
    Business.objects.create(user=user2)
    blockedUser = BlockedUser.objects.create(blocker=user2, blocked=user)
    blockedUser.save()

    url = BUSINESS_URL.format(user2.id)
    response = api_client.get(url)
    
    assert response.status_code == 403
    assert response.data == {"detail": "You are blocked from viewing this profile."}  
