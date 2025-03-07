import boto3
import uuid
from django.conf import settings

# Uploads a file to S3 and returns the S3 URL and object key
def upload_to_s3(file_obj, user_id):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )

    # Generate unique file name
    file_extension = file_obj.name.split('.')[-1]
    file_type = file_obj.content_type
    
    if file_type.startswith('image/'):
        bucket_name = settings.AWS_IMAGE_BUCKET_NAME  # Set the image bucket
    elif file_type.startswith('video/'):
        bucket_name = settings.AWS_VIDEO_BUCKET_NAME  # Set the video bucket
    else:
        raise ValueError("Unsupported file type")
    
    
    object_key = f"user_{user_id}/{uuid.uuid4()}.{file_extension}"
    
    # Upload the file to the selected S3 bucket
    s3_client.upload_fileobj(
        file_obj,
        bucket_name,
        object_key,
        ExtraArgs={"ContentType": file_type}  # Set the MIME type
    )

    # Generate the S3 URL for the uploaded file
    s3_url = f"{settings.AWS_IMAGE_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_key}"
    return s3_url, object_key