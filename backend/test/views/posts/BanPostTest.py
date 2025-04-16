import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pages.models import Post

User = get_user_model()
BAN_URL = "/api/post/ban/"
UNBAN_URL = "/api/post/unban/"

@pytest.fixture
def create_user(db):
    user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
    user.full_clean()
    return user

@pytest.fixture
def create_post(db, create_user):
    post = Post.objects.create(
        owner=create_user,
        file_keys=["user_0001/test.png"],
        file_types=["image/png"],
        caption="Test",
    )
    return post

@pytest.fixture
def api_client():
    return APIClient()

def test_ban_post(api_client, create_user, create_post):
    user = create_user
    post = create_post
    api_client.force_authenticate(user=user)
    
    response = api_client.post(BAN_URL, {"post_id": post.id, "admin_id": user.id})

    post.refresh_from_db()
    
    assert response.status_code == status.HTTP_200_OK
    assert post.is_banned == True

def test_unban_post(api_client, create_user, create_post):
    api_client.force_authenticate(user=create_user)
    post = create_post
    post.is_banned = True
    post.save()
    
    response = api_client.post(UNBAN_URL, {"post_id": post.id})

    post.refresh_from_db()
    
    assert response.status_code == status.HTTP_200_OK
    assert post.is_banned == False
