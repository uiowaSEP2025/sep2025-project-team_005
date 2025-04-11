from pages.serializers.user_serializers import UserSerializer
from rest_framework import serializers
from pages.utils.s3_utils import generate_s3_url
from pages.models import Post

class PostSerializer(serializers.ModelSerializer):
    s3_urls = serializers.SerializerMethodField()
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id','owner','file_keys','file_types','created_at','caption','tagged_users', 's3_urls']

    def get_s3_urls(self, obj):
        s3_urls = [generate_s3_url(file_key, file_type) for file_key, file_type in zip(obj.file_keys, obj.file_types)]
        return s3_urls