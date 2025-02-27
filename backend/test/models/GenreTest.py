import pytest
from pages.models import Genre
from contextlib import nullcontext
from django.core.exceptions import ValidationError

class GenreTest:

    @pytest.mark.django_db
    def test_genre_creation(self):
        genre = Genre.objects.create(genre="Pop")

        assert genre.id is not None
        assert genre.genre == "Pop"

    @pytest.mark.django_db
    def test_genre_string_representation(self):
        genre = Genre.objects.create(genre="Savvy Punk")

        assert str(genre) == "Savvy Punk"
    
    @pytest.mark.django_db
    def test_genre_max_length(self):
        genre = Genre.objects.create(genre="1" * 255)
        with nullcontext():
            genre.full_clean()

        genre.genre ="1" * 256
        with pytest.raises(ValidationError):
            genre.full_clean()


    @pytest.mark.django_db
    def test_genre_invalid_inputs(self):
        with pytest.raises(ValidationError):
            Genre(genre=None).full_clean()

