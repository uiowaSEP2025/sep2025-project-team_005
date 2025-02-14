import pytest
from pages.models import Musician, User

class MusicianTest:
    @pytest.mark.django_db
    def createMusician(self):
        user = User(username="testuser", email="test@test.com")

        musician = Musician(
            user_id=user,
            stage_name="Big Savvy",
        )

        assert musician.id is not None