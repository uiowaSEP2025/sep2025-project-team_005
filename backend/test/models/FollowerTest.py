from django.db import IntegrityError
import pytest
from pages.models import User, Follower

class FollowerTest:

    @pytest.fixture
    def create_users(self, db):
        user1 = User.objects.create_user(username="user1", email="user1@test.com", password="password123")
        user2 = User.objects.create_user(username="user2", email="user2@test.com", password="password123")
        return user1, user2

    @pytest.mark.django_db
    def test_create_follower(self, create_users):
        user1, user2 = create_users
        follower = Follower.objects.create(follower=user1, following=user2)
        assert follower.id is not None
        assert follower.follower == user1
        assert follower.following == user2
        assert follower.created_at is not None
    
    @pytest.mark.django_db
    def test_unique_follower_following_constraint(self, create_users):
        user1, user2 = create_users
        Follower.objects.create(follower=user1, following=user2)
        with pytest.raises(IntegrityError):
            Follower.objects.create(follower=user1, following=user2)
    
    @pytest.mark.django_db
    def test_user_cannot_follow_themselves(self, create_users):
        user1, _ = create_users
        with pytest.raises(IntegrityError):
            Follower.objects.create(follower=user1, following=user1)
    
    @pytest.mark.django_db
    def test_follower_str_representation(self, create_users):
        user1, user2 = create_users
        follower = Follower.objects.create(follower=user1, following=user2)
        assert str(follower) == "user1 follows user2"
    
    @pytest.mark.django_db
    def test_delete_user_cascades_follower(self, create_users):
        user1, user2 = create_users
        follower = Follower.objects.create(follower=user1, following=user2)
        user1.delete()
        assert not Follower.objects.filter(id=follower.id).exists()
