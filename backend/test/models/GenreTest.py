import pytest
from pages.models import Genre
from contextlib import nullcontext
from django.core.exceptions import ValidationError

class GenreTest:

    @pytest.fixture
    def create_genre(db):
        genre = Genre.objects.create(genre="Savvy Punk")
        genre.full_clean()
        return genre

    @pytest.mark.django_db
    def test_genre_creation(self):
        genre = Genre.objects.create(genre="Pop")
        genre.full_clean()

        assert genre.id is not None
        assert genre.genre == "Pop"

    @pytest.mark.django_db
    def test_string_representation(self, create_genre):
        genre = create_genre
        assert str(genre) == "Savvy Punk"
    
    @pytest.mark.django_db
    def test_genre_max_length(self, create_genre):
        genre = create_genre
        genre.genre = "1" * 255
        with nullcontext():
            genre.full_clean()

        genre.genre = "1" * 256
        with pytest.raises(ValidationError):
            genre.full_clean()


    @pytest.mark.django_db
    def test_genre_invalid_inputs(self, create_genre):
        genre = create_genre

        genre.genre = None
        with pytest.raises(ValidationError):
            genre.full_clean()

