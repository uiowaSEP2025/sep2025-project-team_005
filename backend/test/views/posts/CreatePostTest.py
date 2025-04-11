import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pages.models import Post
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()
CREATE_URL = "/api/post/create"

@pytest.fixture
def create_user(db):
    user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
    user.full_clean()
    return user

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def mock_upload(mocker):
    mock = mocker.patch("pages.views.post_views.upload_to_s3")
    mock.return_value = ("user_0000/test.jpg")
    yield mock

@pytest.fixture
def test_file():
    return SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg")

def test_create_post_success(mock_upload, api_client, create_user, test_file):
    """ Test success post creation with a tagged user """
    api_client.force_authenticate(user=create_user)
    tagged_user = User.objects.create_user(username="taggeduser", email="tagged@test.com", password="password123")

    data = {"file": test_file, "caption": "Test Caption",}    #, "tagged_users": [tagged_user.id],}
    
    response = api_client.post(CREATE_URL, data, format="multipart")
    
    assert response.status_code == status.HTTP_201_CREATED
    assert Post.objects.count() == 1
    assert response.data["message"] == "Post created successfully!"
    assert mock_upload.called
    
    #post = Post.objects.first()
    #assert post.tagged_users.count() == 1
    #assert post.tagged_users.first() == tagged_user
    
def test_create_post_without_tagged_users(api_client, create_user, test_file, mock_upload):
    """ Test successful post creation with no tagged users in data field """
    api_client.force_authenticate(user=create_user)

    data = {
        "file": test_file,
        "caption": "Test Caption",
    }
    
    response = api_client.post(CREATE_URL, data, format="multipart")

    assert response.status_code == status.HTTP_201_CREATED
    assert Post.objects.count() == 1

    #post = Post.objects.first()
    #assert post.tagged_users.count() == 0
    
#def test_create_post_multiple_tagged_users(mock_upload, api_client, create_user, test_file):
#    """ Test successful post creation with many tagged users """
#    api_client.force_authenticate(user=create_user)
#    tagged_user1 = User.objects.create_user(username="tagged1", email="tagged1@test.com", password="password123")
#    tagged_user2 = User.objects.create_user(username="tagged2", email="tagged2@test.com", password="password123")
#
#    data = {
#        "file": test_file,
#        "caption": "Test Caption",
#        "tagged_users": [tagged_user1.id, tagged_user2.id],
#    }
#    
#    response = api_client.post(CREATE_URL, data, format="multipart")
#    
#    assert response.status_code == status.HTTP_201_CREATED
#    post = Post.objects.first()
#    assert post.tagged_users.count() == 2
#    assert set(post.tagged_users.values_list("id", flat=True)) == {tagged_user1.id, tagged_user2.id}


def test_create_post_invalid_data(api_client, create_user):
    """ Test unsuccessful post creation due to missing required form data (file) """
    api_client.force_authenticate(user=create_user)
    data = {"caption": "Missing file field"}
    
    response = api_client.post(CREATE_URL, data, format="multipart")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "file" in response.data["details"]
    assert Post.objects.count() == 0
    
def test_create_post_invalid_file_type(api_client, create_user):
    """ Test unsuccessful request due to none image/video file """
    api_client.force_authenticate(user=create_user)
    invalid_file = SimpleUploadedFile("test.txt", b"invalid content", content_type="text/plain")

    data = {"file": invalid_file, "caption": "Invalid file test"}

    response = api_client.post(CREATE_URL, data, format="multipart")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Only image and video files are allowed." in response.data["details"]["file"]

def test_create_post_exception(mock_upload, api_client, create_user, test_file):
    """ Test an unsuccessful post creation will throw 500 status error """
    api_client.force_authenticate(user=create_user)
    mock_upload.side_effect = Exception("S3 upload failed")
    
    data = {"file": test_file, "caption": "Test Caption"}
    
    response = api_client.post(CREATE_URL, data, format="multipart")
    
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "S3 upload failed" in response.data["error"]
