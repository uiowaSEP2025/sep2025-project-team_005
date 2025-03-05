import pytest
from django.contrib.auth import get_user_model
from pages.models import User
from rest_framework.test import APIClient

User = get_user_model()
DISCOVER_URL = "/discover/"


@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_users(db):
    """Creates 10 test users in the database. (One page worth)"""
    users = [
        User.objects.create(username=f"user{i}", email=f"user{i}@gmail.com", password="testpassword1!")
        for i in range(10)
    ]
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
