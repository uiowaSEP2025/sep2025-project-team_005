import pytest
import random
from django.contrib.auth import get_user_model
from pages.models import User, Musician, Genre, Instrument, MusicianInstrument, BlockedUser
from rest_framework.test import APIClient

User = get_user_model()
DISCOVER_URL = "/api/discover/"
USER_URL = "/api/user/{}/"
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

@pytest.fixture
def authenticated_client_factory(api_client):
    def make_authenticated_client(user=None):
        if not user:
            user = User.objects.create_user(username="authuser", email="auth@example.com", password="testpassword1!")
        api_client.force_authenticate(user=user)
        return api_client, user
    return make_authenticated_client



@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_pagination(authenticated_client_factory, create_users):
    """Test if pagination works correctly by checking the first page length."""
    url = DISCOVER_URL
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
    assert response.status_code == 200
    assert "results" in response.data
    assert len(response.data["results"]) == 5
    
@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_search(authenticated_client_factory, create_users):
    """Test search functionality to ensure only matching results are returned."""
    search_query = create_users[0].username
    url = DISCOVER_URL + f"?search={search_query}"
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["results"][0] == search_query
    
@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_pagination_next_page(authenticated_client_factory, create_users):
    """Ensure pagination works for loading additional pages"""
    url = DISCOVER_URL + "?page=2"
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
    assert response.status_code == 200
    assert "results" in response.data
    assert len(response.data["results"]) == 5
    assert response.data["next"] is None
    
@pytest.mark.django_db
@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_empty_search(authenticated_client_factory):
    """Ensure an empty database returns an empty response."""
    url = DISCOVER_URL
    client, _ = authenticated_client_factory()
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data["results"]) == 0
    
@pytest.mark.filterwarnings("ignore:Pagination may yield inconsistent results with an unordered object_list")
def test_get_users_instrument_filter(authenticated_client_factory, create_users):
    """Test filtering users by instrument - Guitar."""
    url = DISCOVER_URL + "?instrument=Guitar"
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
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
def test_get_users_genre_filter(authenticated_client_factory, create_users):
    """Test filtering users by genre - Rock."""
    url = DISCOVER_URL + "?genre=Rock"
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
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
def test_get_users_instrument_and_genre_filter(authenticated_client_factory, create_users):
    """Test filtering users by instrument and genre - Guitar or Rock."""
    url = DISCOVER_URL + "?instrument=Guitar&genre=Rock"
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
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
    
    
@pytest.mark.django_db
def test_get_user_by_username(authenticated_client_factory, create_users):
    """Test fetching a user by username."""
    # Take the first user from the created users
    user = create_users[0]
    url = USER_URL.format(user.username)
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
    
    assert response.status_code == 200
    assert response.json()["user_id"] == str(user.id)
    
@pytest.mark.django_db
def test_get_user_by_invalid_username(authenticated_client_factory, create_users):
    """Test fetching a user by username that does not exist."""
    invalid_username = "nonexistentuser"
    url = USER_URL.format(invalid_username)
    client, _ = authenticated_client_factory(create_users[0])
    response = client.get(url)
    assert response.status_code == 404
    
@pytest.mark.django_db
def test_discover_excludes_blocked_users(authenticated_client_factory, create_users):
    """
    Ensure that users who have blocked the current user do not appear in discover results.
    """
    current_user = create_users[0]
    blocked_user = create_users[1]

    # Create a BlockedUser relationship where blocked_user blocks current_user
    BlockedUser.objects.create(blocker=blocked_user, blocked=current_user)

    client, _ = authenticated_client_factory(current_user)
    response = client.get(DISCOVER_URL)

    assert response.status_code == 200
    blocked_usernames = [blocked_user.username]
    result_usernames = response.data["results"]

    # Ensure the blocked_user's username is not in the discover results
    for username in blocked_usernames:
        assert username not in result_usernames, f"{username} should not be visible to the blocked user"
