from rest_framework import serializers
from pages.utils.s3_utils import generate_s3_url
from pages.models import Message

class MessageSerializer(serializers.ModelSerializer):
    s3_urls = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'file_keys', 'file_types',
            'created_at', 'receiver', 'message',
        ]

    def get_s3_urls(self, obj):
        return [
            generate_s3_url(file_key, file_type)
            for file_key, file_type in zip(obj.file_keys, obj.file_types)
        ]
    