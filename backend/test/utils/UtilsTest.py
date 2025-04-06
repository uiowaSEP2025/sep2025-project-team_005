import pytest
from unittest.mock import MagicMock
from pages.utils import generate_s3_url

@pytest.fixture
def file_key():
    return "user_0000/test.jpg"

@pytest.fixture
def file_type():
    return "image/jpeg"

@pytest.fixture
def mock_get_bucket_name(monkeypatch):
    mock = MagicMock(return_value="mock-bucket")
    monkeypatch.setattr("pages.utils.s3_utils.get_bucket_name", mock)
    return mock

@pytest.fixture
def mock_s3_client(mocker):
    mock = mocker.patch("pages.utils.s3_utils.get_s3_client")
    mock.return_value = MagicMock()
    return mock

def test_generate_s3_url(file_key, file_type, mock_get_bucket_name, mock_s3_client):
    mock_client_instance = mock_s3_client.return_value
    mock_client_instance.generate_presigned_url.return_value = "https://mock-url.com/test.jpg"
    mock_get_bucket_name.return_value = "mock-bucket"

    s3_url = generate_s3_url(file_key, file_type)

    assert s3_url == "https://mock-url.com/test.jpg"

    mock_get_bucket_name.assert_called_once_with(file_type)
    mock_client_instance.generate_presigned_url.assert_called_once_with(
        "get_object",
        Params={"Bucket": "mock-bucket", "Key": file_key},
        ExpiresIn=3600,
    )
