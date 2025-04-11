from rest_framework import serializers
from pages.models import Comment

class CommentSerializer(serializers.ModelSerializer):
    s3_url = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'