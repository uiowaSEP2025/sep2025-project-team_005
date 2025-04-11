import pytest
from django.db import IntegrityError
from pages.models import User, BlockedUser

@pytest.mark.django_db
class BlockedUserTest:

    @pytest.fixture
    def users(self):
        user1 = User.objects.create_user(username="user1", email="user1@example.com", password="password123")
        user2 = User.objects.create_user(username="user2", email="user2@example.com", password="password123")
        return user1, user2

    def test_block_user_successfully(self, users):
        blocker, blocked = users
        block = BlockedUser.objects.create(blocker=blocker, blocked=blocked)
        assert block.blocker == blocker
        assert block.blocked == blocked
        assert str(block) == f"{blocker.username} blocked {blocked.username}"

    def test_block_user_uniqueness(self, users):
        blocker, blocked = users
        BlockedUser.objects.create(blocker=blocker, blocked=blocked)
        with pytest.raises(IntegrityError):
            BlockedUser.objects.create(blocker=blocker, blocked=blocked)

    def test_user_cannot_block_self(self, users):
        user = users[0]
        with pytest.raises(IntegrityError):
            BlockedUser.objects.create(blocker=user, blocked=user)
