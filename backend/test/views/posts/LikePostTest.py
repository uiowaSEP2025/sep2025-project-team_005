import pytest
import uuid
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from pages.models import Post, Like
from rest_framework import status
import uuid

User = get_user_model()

LIKE_TOGGLE_URL = "/api/post/like/"

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
def authenticated_client(create_user):
    client = APIClient()
    client.force_authenticate(user=create_user)
    return client

@pytest.mark.django_db
def test_like_post(authenticated_client, create_user, create_post):
    user = create_user
    post = create_post

    response = authenticated_client.post(LIKE_TOGGLE_URL, {"post_id": post.id})

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["message"] == "Liked"
    assert Like.objects.filter(user=user, post=post).exists()

@pytest.mark.django_db
def test_like_post_already_liked(authenticated_client, create_user, create_post):
    user = create_user
    post = create_post
    Like.objects.create(user=user, post=post)
    
    response = authenticated_client.post(LIKE_TOGGLE_URL, {"post_id": post.id})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["message"] == "Already liked"

@pytest.mark.django_db
def test_like_non_existent_post(authenticated_client, create_user, create_post):    
    response = authenticated_client.post(LIKE_TOGGLE_URL, {"post_id": uuid.uuid4()})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "Post not found"

@pytest.mark.django_db
def test_unlike_post(authenticated_client, create_user, create_post):
    user = create_user
    post = create_post
    Like.objects.create(user=user, post=post)
    
    response = authenticated_client.delete(LIKE_TOGGLE_URL, {"post_id": post.id})

    assert response.status_code == status.HTTP_200_OK
    assert not Like.objects.filter(user=user, post=post).exists()

@pytest.mark.django_db
def test_unlike_post_not_liked(authenticated_client, create_post):
    response = authenticated_client.delete(LIKE_TOGGLE_URL, {"post_id": create_post.id})

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "This post is not liked"

@pytest.mark.django_db
def test_unlike_non_existent_post(authenticated_client, create_user, create_post):    
    response = authenticated_client.delete(LIKE_TOGGLE_URL, {"post_id": uuid.uuid4()})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "Post not found"
    