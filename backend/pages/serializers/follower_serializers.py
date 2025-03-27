from rest_framework import serializers
from pages.models import User

class FollowCountSerializer(serializers.ModelSerializer):
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['follower_count', 'following_count']

    def get_follower_count(self, obj):
        return obj.follower_count()

    def get_following_count(self, obj):
        return obj.following_count()