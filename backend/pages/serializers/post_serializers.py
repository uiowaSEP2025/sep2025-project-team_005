from pages.serializers.user_serializers import UserSerializer
from rest_framework import serializers
from pages.utils.s3_utils import generate_s3_url
from pages.models import Post, ReportedPost

class PostSerializer(serializers.ModelSerializer):
    s3_urls = serializers.SerializerMethodField()
    owner = UserSerializer(read_only=True)
    is_reported = serializers.SerializerMethodField()
    is_banned = serializers.BooleanField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'owner', 'file_keys', 'file_types',
            'created_at', 'caption', 'tagged_users',
            's3_urls', 'is_reported', 'is_banned'
        ]

    def get_s3_urls(self, obj):
        return [
            generate_s3_url(file_key, file_type)
            for file_key, file_type in zip(obj.file_keys, obj.file_types)
        ]

    def get_is_reported(self, obj):
        # TODO: don't serialize if not admin - so anonymous people can't hit the API and get all reported posts (and who reported)
        return ReportedPost.objects.filter(post=obj).exists()