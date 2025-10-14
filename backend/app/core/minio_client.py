# app/core/minio_client.py
from minio import Minio
from app.core.config import settings

minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE
)

def upload_to_minio(file_path: str, object_name: str):
    bucket = settings.MINIO_BUCKET_NAME
    if not minio_client.bucket_exists(bucket):
        minio_client.make_bucket(bucket)
    minio_client.fput_object(bucket, object_name, file_path)
    return f"{bucket}/{object_name}"

def get_file_url(object_name: str, expires_in=3600):
    return minio_client.presigned_get_object(
        settings.MINIO_BUCKET_NAME, object_name, expires=expires_in
    )
