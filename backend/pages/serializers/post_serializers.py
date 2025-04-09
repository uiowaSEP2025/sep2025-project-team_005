from rest_framework import serializers
from pages.utils.s3_utils import generate_s3_url
from pages.models import Post

class PostSerializer(serializers.ModelSerializer):
    s3_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'owner','file_key','file_type','created_at','caption','tagged_users', 's3_url']

    def get_s3_url(self, obj):
        return generate_s3_url(obj.file_key, obj.file_type)