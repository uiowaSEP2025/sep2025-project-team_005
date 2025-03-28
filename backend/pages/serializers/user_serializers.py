from rest_framework import serializers
from pages.models import User

# Serializer for users
class UserSerializer(serializers.ModelSerializer):
    isFollowing = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'isFollowing']

    def get_isFollowing(self, obj):
        """Check if the authenticated user follows this user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(follower=request.user).exists()
        return False