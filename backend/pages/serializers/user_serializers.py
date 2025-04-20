from rest_framework import serializers
from pages.models import User, Follower, BlockedUser


# Serializer for users
class UserSerializer(serializers.ModelSerializer):
    isFollowing = serializers.SerializerMethodField()
    isBlocked = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'isFollowing', 'isBlocked']
        
    def get_isFollowing(self, obj):
        auth_user = self.context.get('auth_user')

        if not auth_user or not auth_user.is_authenticated:
            return False

        return Follower.objects.filter(follower=auth_user, following=obj).exists()
    
    def get_isBlocked(self, obj):
        auth_user = self.context.get('auth_user')

        if not auth_user or not auth_user.is_authenticated:
            return False

        return BlockedUser.objects.filter(blocker=auth_user, blocked=obj).exists()
