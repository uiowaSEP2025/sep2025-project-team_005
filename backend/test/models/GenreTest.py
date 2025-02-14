import pytest
from pages.models import Genre

class GenreTest:

    @pytest.mark.django_db
    def createGenre(self):
        genre = Genre(genre="pop")

        assert genre.id is not None