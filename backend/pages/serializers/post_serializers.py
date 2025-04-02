from rest_framework import serializers
from pages.models import Post

# Serializer for genres
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'