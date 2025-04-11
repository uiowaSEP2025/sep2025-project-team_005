import pytest
from unittest.mock import MagicMock
from pages.utils import generate_s3_url

@pytest.fixture
def file_keys():
    return ["user_0000/test.jpg"]

@pytest.fixture
def file_types():
    return ["image/jpeg"]

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

def test_generate_s3_url(file_keys, file_types, mock_get_s3_client, mock_get_bucket_name):
    s3_url = generate_s3_url(file_keys[0], file_types[0])

    assert s3_url == "https://mock-url.com/test.jpg"

    mock_get_s3_client.generate_presigned_url.assert_called_once_with(
        "get_object",
        Params={"Bucket": "mock-bucket", "Key": file_keys[0]},
        ExpiresIn=3600,
    )