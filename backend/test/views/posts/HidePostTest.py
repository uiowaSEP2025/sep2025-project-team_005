import uuid
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pages.models import Post

User = get_user_model()

HIDE_URL = "/api/post/hide/"
UNHIDE_URL = "/api/post/unhide/"

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

def test_hide_post(api_client, create_user, create_post):
    user = create_user
    post = create_post
    api_client.force_authenticate(user=user)
    
    response = api_client.post(HIDE_URL, {"post_id": post.id, "user_id": user.id})
    user.refresh_from_db()
    
    assert response.status_code == status.HTTP_200_OK
    assert post in user.hidden_posts.all()

@pytest.mark.django_db
def test_hide_non_existent_post(api_client, create_user):  
    user = create_user
    api_client.force_authenticate(user=user)

    response = api_client.post(HIDE_URL, {"post_id": uuid.uuid4(), "user_id": user.id})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "Post not found, refresh the page"

@pytest.mark.django_db
def test_hide_no_user(api_client, create_post):  
    response = api_client.post(HIDE_URL, {"post_id": create_post.id, "user_id": uuid.uuid4()})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "No user detected"

@pytest.mark.django_db
def test_hide_hidden_post(api_client, create_post, create_user):
    user = create_user
    post = create_post
    user.hidden_posts.add(post)
    user.save()
    api_client.force_authenticate(user=user)

    response = api_client.post(HIDE_URL, {"post_id": post.id, "user_id": user.id})

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "This post has already been hidden"

def test_unhide_post(api_client, create_user, create_post):
    user = create_user
    post = create_post
    user.hidden_posts.add(post)
    api_client.force_authenticate(user=user)
    
    response = api_client.delete(UNHIDE_URL, {"post_id": post.id, "user_id": user.id})
    user.refresh_from_db()
    
    assert response.status_code == status.HTTP_200_OK
    assert post not in user.hidden_posts.all()

@pytest.mark.django_db
def test_unhide_non_existent_post(api_client, create_user):    
    user = create_user
    api_client.force_authenticate(user=user)

    response = api_client.delete(UNHIDE_URL, {"post_id": uuid.uuid4(), "user_id": user.id})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "Post not found, refresh the page"

@pytest.mark.django_db
def test_unhide_no_user(api_client, create_post):  
    response = api_client.delete(UNHIDE_URL, {"post_id": create_post.id, "user_id": uuid.uuid4()})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "No user detected"

@pytest.mark.django_db
def test_unhide_shown_post(api_client, create_post, create_user):
    user = create_user
    api_client.force_authenticate(user=user)
    
    response = api_client.delete(UNHIDE_URL, {"post_id": create_post.id, "user_id": user.id})

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"] == "This post is not currently hidden"
