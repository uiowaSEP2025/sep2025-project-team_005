from rest_framework import serializers
from pages.serializers.user_serializers import UserSerializer
from pages.utils.s3_utils import generate_s3_url
from pages.models import Message

class MessageSerializer(serializers.ModelSerializer):
    s3_urls = serializers.SerializerMethodField()
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'created_at', 'receiver', 'message', 's3_urls'
        ]

    def get_s3_urls(self, obj):
        return [
            generate_s3_url(file_key, file_type)
            for file_key, file_type in zip(obj.file_keys, obj.file_types)
        ]
    
    def get_sender(self, obj):
        auth_user = self.context.get('auth_user')
        return UserSerializer(obj.sender, context={'auth_user': auth_user}).data

    def get_receiver(self, obj):
        auth_user = self.context.get('auth_user')
        return UserSerializer(obj.receiver, context={'auth_user': auth_user}).data
    