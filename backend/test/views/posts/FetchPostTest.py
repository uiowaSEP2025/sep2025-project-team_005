import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pages.serializers.post_serializers import PostSerializer
from pages.models import Post
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils.timezone import now, timedelta

User = get_user_model()
CREATE_URL = "/api/create-post/"

@pytest.fixture
def create_user(db):
    user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
    user.full_clean()
    return user

@pytest.fixture
def create_post(db, create_user):
    post = Post.objects.create(
        owner=create_user,
        file_key="user_0001/test.png",
        file_type="image/png",
        caption="Test",
    )
    return post

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def mock_upload(mocker):
    mock = mocker.patch("pages.utils.s3_utils.upload_to_s3")
    mock.return_value = "user_0000/test.jpg"
    yield mock

@pytest.fixture
def test_file():
    return SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg")

@pytest.fixture
def mock_generate_s3_url(mocker):
    mock = mocker.patch("pages.serializers.post_serializers.generate_s3_url")
    mock.return_value = "https://mock-s3-url.com/user_0000/test.jpg"
    yield mock

def test_fetch_posts(api_client, create_user, create_post, mock_generate_s3_url):
    api_client.force_authenticate(user=create_user)

    response = api_client.get(f"/api/fetch-posts/?username={create_user.username}")

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) > 0
    assert response.data["results"][0]["file_key"] == "user_0001/test.png"
    assert response.data["results"][0]["file_type"] == "image/png"
    assert response.data["results"][0]["caption"] == "Test"

def test_fetch_posts_order(api_client, create_user, create_post, db, mock_generate_s3_url):
    post2 = Post.objects.create(
        owner=create_user,
        file_key="user_0001/test2.jpg",
        file_type="image/jpeg",
        caption="Test2"
    )

    post2.created_at = now() - timedelta(days=1)
    post2.save()

    response = api_client.get(f"/api/fetch-posts/?username={create_user.username}")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["caption"] == "Test"
    assert response.data["results"][1]["caption"] == "Test2"

def test_post_serializer(mocker, create_post, mock_generate_s3_url):
    serializer = PostSerializer(create_post)
    data = serializer.data

    assert data["id"] == str(create_post.id)
    assert data["owner"] == create_post.owner.id
    assert data["file_key"] == "user_0001/test.png"
    assert data["file_type"] == "image/png"
    assert data["caption"] == "Test"
    assert data["s3_url"] == "https://mock-s3-url.com/user_0000/test.jpg"

    mock_generate_s3_url.assert_called_once_with("user_0001/test.png", "image/png")