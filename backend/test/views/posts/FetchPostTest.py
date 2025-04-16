
import uuid
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pages.serializers.post_serializers import PostSerializer
from pages.models import Post, ReportedPost
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils.timezone import now, timedelta

User = get_user_model()

FETCH_POSTS_URL = "/api/post/fetch/"
FETCH_FEED_URL = "/api/fetch-feed/"
FETCH_BANNED_POSTS_URL = "/api/fetch-banned-posts/"
FETCH_REPORTED_POSTS_URL = "/api/fetch-reported-posts/"

@pytest.fixture
def post_factory():
    def create(owner=None, caption="Default Caption", created_days_ago=0, file_key="user_0001/test.jpg", file_type="image/jpeg", is_banned=False):
        post = Post.objects.create(
            owner=owner,
            file_keys=[file_key],
            file_types=[file_type],
            caption=caption,
        )
        if created_days_ago:
            post.created_at = now() - timedelta(days=created_days_ago)
            post.save()
        if is_banned:
            post.is_banned = True
            post.save()
        return post
    return create

@pytest.fixture
def create_users(db):
    user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
    user.full_clean()
    user2 = User.objects.create_user(username="testuser2", email="test2@test.com", password="password123")
    user2.full_clean()
    return user, user2

@pytest.fixture
def create_posts(post_factory, create_users):
    return (
        post_factory(owner=create_users[0], caption="Test", created_days_ago=0, file_key="user_0001/test.png", file_type="image/png"),
        post_factory(owner=create_users[0], caption="Test2", created_days_ago=1, file_key="user_0001/test2.jpg"),
        post_factory(owner=create_users[0], caption="Test3", created_days_ago=2, file_key="user_0001/test3.jpg"),
        post_factory(owner=create_users[0], caption="Test4", created_days_ago=3, file_key="user_0001/test4.jpg")
    )

@pytest.fixture
def create_posts_other_user(post_factory, create_users):
    return (
        post_factory(owner=create_users[1], caption="Test-other", created_days_ago=1, file_key="user_0002/test.png"),
        post_factory(owner=create_users[1], caption="Test2-other", created_days_ago=2, file_key="user_0002/test2.jpg")
    )

@pytest.fixture
def create_banned_posts(db, create_posts, create_posts_other_user):
    post = create_posts[0]
    post.is_banned = True
    post.save()
    post2 = create_posts_other_user[0]
    post2.is_banned = True
    post2.save()
    return post, post2

@pytest.fixture
def create_reported_posts(db, create_users, create_posts, create_posts_other_user):
    post = ReportedPost.objects.create(user=create_users[1], post=create_posts[1])
    post2 = ReportedPost.objects.create(user=create_users[0], post=create_posts_other_user[1])
    return post, post2

@pytest.fixture
def create_hidden_post(db, create_users, create_posts):
    user = create_users[1]
    post = create_posts[2]
    user.hidden_posts.add(post)
    return post

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_file():
    return SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg")

@pytest.fixture
def mock_generate_s3_url(mocker):
    mock = mocker.patch("pages.serializers.post_serializers.generate_s3_url")
    mock.return_value = "https://mock-s3-url.com/user_0000/test.jpg"
    yield mock

def test_fetch_posts(api_client, create_users, create_posts, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])

    response = api_client.get(FETCH_POSTS_URL, {"username": create_users[0].username})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) > 0
    assert response.data["results"][0]["file_keys"][0] == "user_0001/test.png"
    assert response.data["results"][0]["file_types"][0] == "image/png"
    assert response.data["results"][0]["caption"] == "Test"

def test_fetch_no_banned_posts(api_client, create_users, create_posts_other_user, create_banned_posts, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[1])
    banned_post = create_banned_posts[0]

    response = api_client.get(FETCH_POSTS_URL, {"username": create_users[1].username})

    assert all(post["id"] != str(banned_post.id) for post in response.data["results"])


def test_fetch_posts_order(api_client, create_users, create_posts, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])

    response = api_client.get(FETCH_POSTS_URL, {"username": create_users[0].username})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["caption"] == "Test"
    assert response.data["results"][1]["caption"] == "Test2"

def test_fetch_feed(api_client, create_users, create_posts_other_user, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])
    other_user = create_users[1]

    response = api_client.get(FETCH_FEED_URL, {"user_id": create_users[0].id})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) > 0
    assert response.data["results"][0]["file_keys"][0] == "user_0002/test.png"
    assert response.data["results"][0]["owner"]["id"] == str(other_user.id)
    assert response.data["results"][0]["owner"]["username"] == other_user.username

def test_fetch_feed_no_user(api_client, create_users, create_posts_other_user, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])

    response = api_client.get(FETCH_FEED_URL, {"user_id": uuid.uuid4()})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"] == "User not found"

def test_feed_correct_posts(api_client, create_users, create_posts, create_banned_posts, create_reported_posts, create_hidden_post, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[1])
    banned_post = create_banned_posts[0]
    reported_post = create_reported_posts[0]
    hidden_post = create_hidden_post

    response = api_client.get(FETCH_FEED_URL, {"user_id": create_users[1].id})

    assert response.status_code == status.HTTP_200_OK
    assert all(post["id"] != str(banned_post.id) for post in response.data["results"])
    assert all(post["id"] != str(hidden_post.id) for post in response.data["results"])
    assert all(post["id"] != str(reported_post.id) for post in response.data["results"])

def test_fetch_feed_order(api_client, create_users, create_posts_other_user, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])

    response = api_client.get(FETCH_FEED_URL, {"user_id": create_users[0].id})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["caption"] == "Test-other"
    assert response.data["results"][1]["caption"] == "Test2-other"

def test_fetch_reported_posts(api_client, create_users, create_reported_posts, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users)

    response = api_client.get(FETCH_REPORTED_POSTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) > 0
    assert response.data["results"][0]["file_types"][0] == "image/jpeg"
 
def test_fetch_reported_posts_order(api_client, create_users, create_reported_posts, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])

    response = api_client.get(FETCH_REPORTED_POSTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["caption"] == "Test2-other"
    assert response.data["results"][1]["caption"] == "Test2"

def test_fetch_banned_posts(api_client, create_users, create_banned_posts, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])

    response = api_client.get(FETCH_BANNED_POSTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) > 0
    assert response.data["results"][0]["file_keys"][0] == "user_0001/test.png"
    assert response.data["results"][0]["file_types"][0] == "image/png"
    assert response.data["results"][0]["caption"] == "Test"

def test_fetch_banned_posts_order(api_client, create_users, create_banned_posts, mock_generate_s3_url):
    api_client.force_authenticate(user=create_users[0])

    response = api_client.get(FETCH_BANNED_POSTS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["caption"] == "Test"
    assert response.data["results"][1]["caption"] == "Test-other"

def test_post_serializer(mocker, create_posts, mock_generate_s3_url):
    serializer = PostSerializer(create_posts[0])
    data = serializer.data

    assert data["id"] == str(create_posts[0].id)
    assert data["owner"]["id"] == str(create_posts[0].owner.id)
    assert data["file_keys"] == ["user_0001/test.png"]
    assert data["file_types"] == ["image/png"]
    assert data["caption"] == "Test"
    assert data["s3_urls"] == ["https://mock-s3-url.com/user_0000/test.jpg"]

    mock_generate_s3_url.assert_called_once_with("user_0001/test.png", "image/png")