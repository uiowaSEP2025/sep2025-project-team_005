import pytest
import random
from django.contrib.auth import get_user_model
from pages.models import User, Musician, Genre, Instrument, MusicianInstrument
from rest_framework.test import APIClient

User = get_user_model()
DISCOVER_URL = "/discover/"


@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_users(db):
    """Creates 10 test users in the database with different combinations of instruments and genres."""
    instruments = ["Drums", "Guitar", "Piano", "Bass"]
    genres = ["Rock", "Jazz", "Pop", "Classical"]

    users = []
    for i in range(10):
        # Create user
        user = User.objects.create(username=f"user{i}", email=f"user{i}@gmail.com", password="testpassword1!")

        # Create musician object
        musician = Musician.objects.create(user=user, stage_name=f"Test Band {i}", years_played=random.randint(1, 20), home_studio=random.choice([True, False]))

        # Randomly assign instruments and genres
        num_instruments = random.randint(1, 3)
        num_genres = random.randint(1, 2)

        selected_instruments = set()
        selected_genres = set()

        # Add instruments using the MusicianInstrument model
        for _ in range(num_instruments):
            instrument_name = random.choice(instruments)
            if instrument_name not in selected_instruments:
                selected_instruments.add(instrument_name)
                instrument, _ = Instrument.objects.get_or_create(instrument=instrument_name)
                MusicianInstrument.objects.create(musician=musician, instrument=instrument, years_played=random.randint(1, 20))

        # Add genres
        for _ in range(num_genres):
            genre_name = random.choice(genres)
            if genre_name not in selected_genres:
                selected_genres.add(genre_name)
                genre, _ = Genre.objects.get_or_create(genre=genre_name)
                musician.genres.add(genre)

        musician.save()
        users.append(user)

    return users


@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_pagination(api_client, create_users):
    """Test if pagination works correctly by checking the first page length."""
    url = DISCOVER_URL
    response = api_client.get(url)

    assert response.status_code == 200
    assert "results" in response.data
    assert len(response.data["results"]) == 5

@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_search(api_client, create_users):
    """Test search functionality to ensure only matching results are returned."""
    search_query = create_users[0].username
    url = DISCOVER_URL + f"?search={search_query}"

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["results"][0] == search_query

@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_pagination_next_page(api_client, create_users):
    """Ensure pagination works for loading additional pages"""
    url = DISCOVER_URL + "?page=2"
    response = api_client.get(url)

    assert response.status_code == 200
    assert "results" in response.data
    assert len(response.data["results"]) == 5
    assert response.data["next"] is None

@pytest.mark.django_db
@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_empty_search(api_client):
    """Ensure an empty database returns an empty response."""
    url = DISCOVER_URL
    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data["results"]) == 0

@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_instrument_filter(api_client, create_users):
    """Test filtering users by instrument - Guitar."""
    url = DISCOVER_URL + "?instrument=Guitar"
    response = api_client.get(url)

    assert response.status_code == 200

    users_with_guitar = [
        user.username
        for user in create_users
        if any(
            instrument.instrument == "Guitar" 
            for instrument in user.musician_set.first().instruments.all()
        )
    ]
    
    assert all(result in users_with_guitar for result in response.data["results"])
    
@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_genre_filter(api_client, create_users):
    """Test filtering users by genre - Rock."""
    url = DISCOVER_URL + "?genre=Rock"
    response = api_client.get(url)

    assert response.status_code == 200

    users_with_rock_genre = [
        user.username
        for user in create_users
        if any(
            genre.genre == "Rock"
            for genre in user.musician_set.first().genres.all()
        )
    ]
    
    assert all(result in users_with_rock_genre for result in response.data["results"])

@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_instrument_and_genre_filter(api_client, create_users):
    """Test filtering users by instrument and genre - Guitar or Rock."""
    url = DISCOVER_URL + "?instrument=Guitar&genre=Rock"
    response = api_client.get(url)

    assert response.status_code == 200

    users_with_guitar_or_rock = [
        user.username
        for user in create_users
        if any(
            instrument.instrument == "Guitar"
            for instrument in user.musician_set.first().instruments.all()
        ) or any(
            genre.genre == "Rock"
            for genre in user.musician_set.first().genres.all()
        )
    ]
    
    assert all(result in users_with_guitar_or_rock for result in response.data["results"])