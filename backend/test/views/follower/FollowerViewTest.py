import pytest
import uuid
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from pages.models import Musician, Follower
import uuid

User = get_user_model()
FOLLOWER_URL = "/api/follower/{}/"

@pytest.mark.django_db
class FollowerViewTest:

    @pytest.fixture
    def create_user(self):
        """Fixture to create a test user."""
        return User.objects.create_user(username="testuser", email="test@test.com")

    @pytest.fixture
    def create_musician(self, create_user):
        """Fixture to create a musician profile for the user."""
        return Musician.objects.create(user=create_user)

    def test_following_view_success(self, create_user, create_musician):
        """Test successful retrieval of follower and following count."""
        client = APIClient()
        url = FOLLOWER_URL.format(create_user.id)
        response = client.get(url)

        assert response.status_code == 200
        assert response.data["follower_count"] == 0
        assert response.data["following_count"] == 0

    def test_following_view_user_not_found(self):
        """Test when the user does not exist."""
        client = APIClient()
        non_existent_uuid = uuid.uuid4()
        url = FOLLOWER_URL.format(non_existent_uuid)
        response = client.get(url)

        assert response.status_code == 404
        assert response.data["error"] == "User not found"

    def test_following_view_musician_not_found(self, create_user):
        """Test when the musician profile does not exist for a valid user."""
        client = APIClient()
        url = FOLLOWER_URL.format(create_user.id)
        response = client.get(url)

        assert response.status_code == 404
        assert response.data["error"] == "Musician profile not found"
        
    def test_following_view_with_followers(self, create_user, create_musician):
        """Test that the follower and following count are correctly recorded when a user has followers."""
        client = APIClient()
        another_user = User.objects.create_user(username="anotheruser", email="another@test.com")
        another_musician = Musician.objects.create(user=another_user)

        # Create a follower relationship
        Follower.objects.create(follower=another_user, following=create_user)

        url = FOLLOWER_URL.format(create_user.id)
        response = client.get(url)

        assert response.status_code == 200
        assert response.data["follower_count"] == 1
        assert response.data["following_count"] == 0

        # Check the other user's follow count
        url = FOLLOWER_URL.format(another_user.id)
        response = client.get(url)

        assert response.status_code == 200
        assert response.data["follower_count"] == 0
        assert response.data["following_count"] == 1