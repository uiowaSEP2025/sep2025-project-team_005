import pytest
from pages.models import User

class UserTest:
    @pytest.mark.django_db
    def createUser(self):
        user = User(username="testuser", email="test@test.com")

        assert user.id is not None