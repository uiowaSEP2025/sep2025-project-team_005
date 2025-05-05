import uuid
import pytest
from unittest.mock import MagicMock
from pages.utils.s3_utils import get_bucket_name

@pytest.fixture
def file_key():
    return "user_0000/test.jpg"

@pytest.fixture
def file_type():
    return "image/jpeg"

@pytest.fixture
def video_key():
    return "user_0000/test.mp4"

@pytest.fixture
def video_type():
    return "video/mp4"

@pytest.fixture
def mock_get_bucket_name(mocker):
    mock = mocker.patch("pages.utils.s3_utils.get_bucket_name")
    mock.return_value = "mock-bucket"
    return mock

@pytest.fixture
def mock_get_s3_client(mocker):
    mock_boto_client = mocker.patch("boto3.client")
    
    mock_s3_client = MagicMock()
    mock_s3_client.generate_presigned_url.return_value = "https://mock-url.com/test.jpg"
    
    mock_boto_client.return_value = mock_s3_client
    
    return mock_s3_client

@pytest.fixture(autouse=True)
def mock_django_settings(monkeypatch):
    monkeypatch.delenv("AWS_PROFILE", raising=False)
    monkeypatch.setattr("pages.utils.s3_utils.settings", MagicMock(
        AWS_ACCESS_KEY_ID="fake_id",
        AWS_SECRET_ACCESS_KEY="fake_secret",
        AWS_REGION="us-east-1",
        AWS_IMAGE_BUCKET_NAME="mock-bucket",
        AWS_VIDEO_BUCKET_NAME="mock-video-bucket"
))
    
def test_get_bucket_name_image(monkeypatch):
    monkeypatch.setattr("pages.utils.s3_utils.settings", type("MockSettings", (), {
        "AWS_IMAGE_BUCKET_NAME": "image-bucket",
        "AWS_VIDEO_BUCKET_NAME": "video-bucket",
    })())
    
    result = get_bucket_name("image/jpeg")
    assert result == "image-bucket"

def test_get_bucket_name_video(monkeypatch):
    monkeypatch.setattr("pages.utils.s3_utils.settings", type("MockSettings", (), {
        "AWS_IMAGE_BUCKET_NAME": "image-bucket",
        "AWS_VIDEO_BUCKET_NAME": "video-bucket"
    })())
    
    result = get_bucket_name("video/mp4")
    assert result == "video-bucket"

def test_get_bucket_name_invalid_type(monkeypatch):
    monkeypatch.setattr("pages.utils.s3_utils.settings", type("MockSettings", (), {
        "AWS_IMAGE_BUCKET_NAME": "image-bucket",
        "AWS_VIDEO_BUCKET_NAME": "video-bucket"
    })())

    with pytest.raises(ValueError, match="Unsupported file type"):
        get_bucket_name("application/zip")

def test_generate_s3_url(file_key, file_type, mock_get_s3_client, mock_get_bucket_name):
    from pages.utils.s3_utils import generate_s3_url

    s3_url = generate_s3_url(file_key, file_type)

    assert s3_url == "https://mock-url.com/test.jpg"

    mock_get_s3_client.generate_presigned_url.assert_called_once_with(
        "get_object",
        Params={"Bucket": "mock-bucket", "Key": file_key},
        ExpiresIn=3600,
    )

def test_upload_to_s3_image(monkeypatch, mock_get_bucket_name, mock_get_s3_client):
    from pages.utils.s3_utils import upload_to_s3

    file = type("MockFile", (), {})()
    file.name = "test.jpg"
    file.content_type = "image/jpeg"
    user_id = 1

    monkeypatch.setattr("pages.utils.s3_utils.get_bucket_name", lambda x: "mock-bucket")
    monkeypatch.setattr("pages.utils.s3_utils.get_s3_client", lambda: mock_get_s3_client)

    key = upload_to_s3(file, user_id)

    assert key.startswith(f"user_{user_id}/")
    assert key.endswith(".jpg")
    uuid.UUID(key.split("/")[-1].split(".")[0])
    mock_get_s3_client.upload_fileobj.assert_called_once_with(
        file,
        "mock-bucket",
        key,
        ExtraArgs={"ContentType": "image/jpeg"},
    )

def test_upload_to_s3_video(monkeypatch, mock_get_bucket_name, mock_get_s3_client):
    from pages.utils.s3_utils import upload_to_s3

    file = type("MockFile", (), {})()
    file.name = "test.mp4"
    file.content_type = "video/mp4"
    user_id = 2

    monkeypatch.setattr("pages.utils.s3_utils.get_bucket_name", lambda x: "mock-bucket")
    monkeypatch.setattr("pages.utils.s3_utils.get_s3_client", lambda: mock_get_s3_client)

    key = upload_to_s3(file, user_id)

    assert key.startswith(f"user_{user_id}/")
    assert key.endswith(".mp4")
    uuid.UUID(key.split("/")[-1].split(".")[0])
    mock_get_s3_client.upload_fileobj.assert_called_once_with(
        file,
        "mock-bucket",
        key,
        ExtraArgs={"ContentType": "video/mp4"},
    )
    
def test_get_bucket_name_pdf(monkeypatch):
    monkeypatch.setattr("pages.utils.s3_utils.settings", type("MockSettings", (), {
        "AWS_IMAGE_BUCKET_NAME": "image-bucket",
        "AWS_VIDEO_BUCKET_NAME": "video-bucket",
        "AWS_METADATA_BUCKET_NAME": "metadata-bucket"
    })())

    result = get_bucket_name("application/pdf")
    assert result == "metadata-bucket"
