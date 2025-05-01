import boto3
import uuid
from django.conf import settings

def get_s3_client():
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    return s3_client

def get_bucket_name(file_type):
    if file_type.startswith('image/'):
        bucket_name = settings.AWS_IMAGE_BUCKET_NAME
    elif file_type.startswith('video/'):
        bucket_name = settings.AWS_VIDEO_BUCKET_NAME
    elif file_type == 'application/pdf':
        bucket_name = settings.AWS_METADATA_BUCKET_NAME
    else:
        raise ValueError("Unsupported file type")
    return bucket_name

def upload_to_s3(file_obj, user_id):
    # Generate unique file name
    file_extension = file_obj.name.split('.')[-1]
    file_type = file_obj.content_type
    bucket_name = get_bucket_name(file_type)
    print("***")
    print(bucket_name)
    
    object_key = f"user_{user_id}/{uuid.uuid4()}.{file_extension}"
    
    # Upload the file to the selected S3 bucket
    get_s3_client().upload_fileobj(
        file_obj,
        bucket_name,
        object_key,
        ExtraArgs={"ContentType": file_type}  # Set the MIME type
    )
    return object_key

def generate_s3_url(file_key, file_type):
    bucket_name = get_bucket_name(file_type)
    s3_client = get_s3_client()

    s3_url = s3_client.generate_presigned_url("get_object", Params={"Bucket": bucket_name, "Key": file_key}, ExpiresIn=3600)
    return s3_url