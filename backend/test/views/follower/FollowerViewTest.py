import pytest
import uuid
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from pages.models import Musician, Follower, BlockedUser
from rest_framework import status

User = get_user_model()

FOLLOW_LIST_URL = "/api/follow-list/{}/"
FOLLOWER_URL = "/api/follower/{}/"
FOLLOW_TOGGLE_URL = "/api/follow/{}/"
IS_FOLLOWING_URL = "/api/is-following/{}/"

@pytest.fixture
def create_user():
    """Fixture to create a test user."""
    return User.objects.create_user(username="testuser", email="test@test.com")

@pytest.fixture
def create_musician(create_user):
    """Fixture to create a musician profile for the user."""
    return Musician.objects.create(user=create_user)

@pytest.fixture
def create_follower(create_user):
    follower_user = User.objects.create_user(username="followeruser", email="follower@test.com")
    Follower.objects.create(follower=follower_user, following=create_user)
    return follower_user

@pytest.fixture
def authenticated_client(create_user):
    client = APIClient()
    client.force_authenticate(user=create_user)
    return client

@pytest.fixture
def create_blocked_user(create_user):
    blocked_user = User.objects.create_user(username="blockeduser", email="blocked@test.com")
    BlockedUser.objects.create(blocker=create_user, blocked=blocked_user)
    return blocked_user


@pytest.mark.django_db
class FollowerViewTest:

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
        
    def test_follow_list_view_followers(self, create_user, authenticated_client, create_musician, create_follower):
        """Test retrieving the list of followers."""
        url = FOLLOW_LIST_URL.format(create_user.id)
        response = authenticated_client.get(url, {"type": "followers"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["username"] == "followeruser"
    
    def test_follow_list_view_following(self, authenticated_client, create_user, create_musician, create_follower):
        """Test retrieving the list of following."""
        url = FOLLOW_LIST_URL.format(create_follower.id)
        response = authenticated_client.get(url, {"type": "following"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["username"] == "testuser"
    
    def test_follow_list_view_user_not_found(self, authenticated_client):
        """Test when the user does not exist."""
        non_existent_uuid = uuid.uuid4()
        url = FOLLOW_LIST_URL.format(non_existent_uuid)
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"
    
    def test_follow_list_view_pagination(self, create_user, authenticated_client, create_musician):
        """Test pagination functionality."""
        for i in range(15):
            follower_user = User.objects.create_user(username=f"follower{i}", email=f"follower{i}@test.com")
            Follower.objects.create(follower=follower_user, following=create_user)
        
        url = FOLLOW_LIST_URL.format(create_user.id)
        response = authenticated_client.get(url, {"type": "followers", "page_size": 10})
        
        assert response.status_code == status.HTTP_200_OK
        assert "next" in response.data
        assert len(response.data["results"]) == 10
    
    @pytest.mark.django_db
    def test_follow_user(self, authenticated_client, create_user):
        """Test following a user."""
        target_user = User.objects.create_user(username="targetuser", email="target@test.com")
        
        # User follows target_user
        response = authenticated_client.post(FOLLOW_TOGGLE_URL.format(target_user.id))
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["message"] == "Followed"
        
        # Check if the follower entry is created
        assert Follower.objects.filter(follower=create_user, following=target_user).exists()

    @pytest.mark.django_db
    def test_follow_user_already_following(self, authenticated_client, create_user):
        """Test attempting to follow a user already followed."""
        target_user = User.objects.create_user(username="targetuser", email="target@test.com")
        Follower.objects.create(follower=create_user, following=target_user)
        
        # User tries to follow the target_user again
        response = authenticated_client.post(FOLLOW_TOGGLE_URL.format(target_user.id))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Already following"

    @pytest.mark.django_db
    def test_follow_self(self, authenticated_client, create_user):
        """Test attempting to follow oneself."""
        response = authenticated_client.post(FOLLOW_TOGGLE_URL.format(create_user.id))
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "You cannot follow yourself"

    @pytest.mark.django_db
    def test_follow_non_existent_user(self, authenticated_client):    
        response = authenticated_client.post(FOLLOW_TOGGLE_URL.format(uuid.uuid4()))

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"

    @pytest.mark.django_db
    def test_unfollow_user(self, authenticated_client, create_user):
        """Test unfollowing a user."""
        target_user = User.objects.create_user(username="targetuser", email="target@test.com")
        Follower.objects.create(follower=create_user, following=target_user)
        
        # User unfollows target_user
        response = authenticated_client.delete(FOLLOW_TOGGLE_URL.format(target_user.id))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Check if the follower entry is deleted
        assert not Follower.objects.filter(follower=create_user, following=target_user).exists()

    @pytest.mark.django_db
    def test_unfollow_user_not_following(self, authenticated_client):
        """Test attempting to unfollow a user who is not followed."""
        target_user = User.objects.create_user(username="targetuser", email="target@test.com")
        
        # User tries to unfollow target_user without following them
        response = authenticated_client.delete(FOLLOW_TOGGLE_URL.format(target_user.id))
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "You are not following this user"

    @pytest.mark.django_db
    def test_unfollow_non_existent_user(self, authenticated_client):    
        response = authenticated_client.delete(FOLLOW_TOGGLE_URL.format(uuid.uuid4()))

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"
        
    @pytest.mark.django_db
    def test_follow_list_excludes_blocked_users(self, authenticated_client, create_user, create_follower, create_blocked_user):
        """
        Ensure that users who have blocked the current user do not appear in the followers or following list.
        """
        current_user = create_user
        blocked_user = create_blocked_user
        follower_user = create_follower
        
        BlockedUser.objects.create(blocker=blocked_user, blocked=current_user)

        # Ensure the follower relationship doesn't exist before creating
        if not Follower.objects.filter(follower=follower_user, following=current_user).exists():
            Follower.objects.create(follower=follower_user, following=current_user)

        url = FOLLOW_LIST_URL.format(current_user.id)
        response = authenticated_client.get(url, {"type": "followers"})

        assert response.status_code == status.HTTP_200_OK
        blocked_usernames = [blocked_user.username]
        result_usernames = [user["username"] for user in response.data["results"]]

        # Ensure the blocked user is not in the followers list
        for username in blocked_usernames:
            assert username not in result_usernames, f"{username} should not be visible to the blocked user"

        response = authenticated_client.get(url, {"type": "following"})
        
        assert response.status_code == status.HTTP_200_OK
        result_usernames = [user["username"] for user in response.data["results"]]

        # Ensure the blocked user is not in the following list
        for username in blocked_usernames:
            assert username not in result_usernames, f"{username} should not be visible to the blocked user"

    @pytest.mark.django_db
    def test_get_true_follow_status(self, create_user, create_follower):
        client = APIClient()
        client.force_authenticate(user=create_follower)

        response = client.get(IS_FOLLOWING_URL.format(create_user.id))

        assert response.data["is_following"] == True

    @pytest.mark.django_db
    def test_get_false_follow_status(self, authenticated_client, create_follower):
        response = authenticated_client.get(IS_FOLLOWING_URL.format(create_follower.id))

        assert response.data["is_following"] == False

    @pytest.mark.django_db
    def test_no_user_follow_status(self, authenticated_client, create_follower):
        response = authenticated_client.get(IS_FOLLOWING_URL.format(uuid.uuid4()))

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"
