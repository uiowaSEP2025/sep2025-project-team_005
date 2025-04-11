import pytest
import uuid
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework import status
from pages.models import BlockedUser

User = get_user_model()

BLOCK_URL = "/api/block/{}/"
BLOCK_LIST_URL = "/api/block-list/{}/"

@pytest.fixture
def create_user():
    """Fixture to create a test user."""
    return User.objects.create_user(username="testuser", email="test@test.com")

@pytest.fixture
def authenticated_client(create_user):
    client = APIClient()
    client.force_authenticate(user=create_user)
    return client

@pytest.mark.django_db
def test_block_user_success(authenticated_client, create_user):
    """Test successfully blocking a user."""
    target_user = User.objects.create_user(username="targetuser", email="target@test.com")

    response = authenticated_client.post(BLOCK_URL.format(target_user.id))

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["message"] == "User blocked."
    assert BlockedUser.objects.filter(blocker=create_user, blocked=target_user).exists()

@pytest.mark.django_db
def test_block_user_already_blocked(authenticated_client, create_user):
    """Test attempting to block an already blocked user."""
    target_user = User.objects.create_user(username="targetuser", email="target@test.com")
    BlockedUser.objects.create(blocker=create_user, blocked=target_user)

    response = authenticated_client.post(BLOCK_URL.format(target_user.id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["message"] == "Already blocked."

@pytest.mark.django_db
def test_block_user_not_found(authenticated_client):
    """Test blocking a non-existent user."""
    non_existent_uuid = uuid.uuid4()
    response = authenticated_client.post(BLOCK_URL.format(non_existent_uuid))

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "User not found."

@pytest.mark.django_db
def test_block_self(authenticated_client, create_user):
    """Test attempting to block oneself."""
    response = authenticated_client.post(BLOCK_URL.format(create_user.id))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "Cannot block yourself."

@pytest.mark.django_db
def test_unblock_user_success(authenticated_client, create_user):
    """Test successfully unblocking a user."""
    target_user = User.objects.create_user(username="targetuser", email="target@test.com")
    BlockedUser.objects.create(blocker=create_user, blocked=target_user)

    response = authenticated_client.delete(BLOCK_URL.format(target_user.id))

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not BlockedUser.objects.filter(blocker=create_user, blocked=target_user).exists()

@pytest.mark.django_db
def test_unblock_user_not_blocked(authenticated_client):
    """Test attempting to unblock a user who is not blocked."""
    target_user = User.objects.create_user(username="targetuser", email="target@test.com")

    response = authenticated_client.delete(BLOCK_URL.format(target_user.id))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "Block relationship does not exist."

@pytest.mark.django_db
def test_unblock_self(authenticated_client, create_user):
    """Test attempting to unblock oneself."""
    response = authenticated_client.delete(BLOCK_URL.format(create_user.id))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "Cannot unblock yourself."

@pytest.mark.django_db
def test_block_list_view(authenticated_client, create_user):
    """Test retrieving the list of blocked users."""
    for i in range(6):
        user = User.objects.create_user(username=f"user{i}", email=f"user{i}@test.com")
        BlockedUser.objects.create(blocker=create_user, blocked=user)

    response = authenticated_client.get(BLOCK_LIST_URL.format(create_user.id), {"page_size": 5})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 5
    assert "next" in response.data

@pytest.mark.django_db
def test_block_list_user_not_found(authenticated_client):
    """Test retrieving blocked users for a non-existent user."""
    non_existent_uuid = uuid.uuid4()

    response = authenticated_client.get(BLOCK_LIST_URL.format(non_existent_uuid))

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "User not found"
