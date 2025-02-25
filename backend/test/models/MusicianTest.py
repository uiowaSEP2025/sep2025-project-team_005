import pytest
from pages.models import Musician, User, Genre, Instrument


@pytest.mark.django_db
class MusicianTest:
    
    ## Test Musican object creation
    def test_musician_creation(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")

        musician = Musician.objects.create(
            user_id=user,
            stage_name="Big Savvy",
            years_played=5,
            home_studio=True,
        )

        assert musician.id is not None
        assert musician.stage_name == "Big Savvy"
        assert musician.years_played == 5
        assert musician.home_studio is True
        assert musician.user_id == user

    ## Test that stage name is saved as string
    def test_musician_string_representation(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        musician = Musician.objects.create(user_id=user, stage_name="Big Savvy")

        assert str(musician) == "Big Savvy"

    ## Test that musican can have many genre and many instruments
    def test_musician_many_to_many_relationships(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        musician = Musician.objects.create(user_id=user, stage_name="Big Savvy")

        genre1 = Genre.objects.create(genre="Jazz")
        genre2 = Genre.objects.create(genre="Rock")
        instrument1 = Instrument.objects.create(instrument="Guitar", class_name="string")
        instrument2 = Instrument.objects.create(instrument="Piano", class_name="chordophones")

        musician.genres.add(genre1, genre2)
        musician.instruments.add(instrument1, instrument2)

        assert musician.genres.count() == 2
        assert musician.instruments.count() == 2
        assert genre1 in musician.genres.all()
        assert genre2 in musician.genres.all()
        assert instrument1 in musician.instruments.all()
        assert instrument2 in musician.instruments.all()

    ## Tests that musican is added and accessible in the databse
    def test_musician_persistence(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        musician = Musician.objects.create(
            user_id=user,
            stage_name="Big Savvy",
            years_played=5,
            home_studio=True,
        )

        musician_from_db = Musician.objects.get(id=musician.id)
        assert musician_from_db.stage_name == "Big Savvy"
        assert musician_from_db.years_played == 5
        assert musician_from_db.home_studio is True
