from django.core.exceptions import ValidationError
import pytest
from pages.models import Musician, User, Genre, Instrument, MusicianInstrument


@pytest.mark.django_db
class MusicianTest:
    @pytest.fixture
    def create_user(db):
        user = User.objects.create_user(username="testuser", email="test@test.com")
        user.full_clean()
        return user
    
    @pytest.fixture
    def create_musician(db, create_user):
        musician = Musician.objects.create(
            user=create_user,
            stage_name="Big Savvy",
            years_played=5,
            home_studio=True,
        )
        musician.full_clean()
        return musician
    
    ## Test Musican object creation
    def test_musician_creation(self, create_user):
        user = create_user
        musician = Musician.objects.create(
            user=user,
            stage_name="Big Savvy",
            years_played=5,
            home_studio=True,
        )
        assert musician.id is not None
        assert musician.stage_name == "Big Savvy"
        assert musician.years_played == 5
        assert musician.home_studio is True
        assert musician.user == user
        
    ## Test that stage name is saved as string
    def test_string_representation(self, create_musician):
        assert str(create_musician) == "Big Savvy"
    
    ## Test that musican can have many genre and many instruments
    def test_many_to_many_relationships(self, create_musician):
        musician = create_musician
        genre1 = Genre.objects.create(genre="Jazz")
        genre2 = Genre.objects.create(genre="Rock")
        instrument1 = Instrument.objects.create(instrument="Guitar", class_name="Strings")
        instrument2 = Instrument.objects.create(instrument="Piano", class_name="Chordophones")

        musician.genres.add(genre1, genre2)

        # Explicitly create the intermediate model entries
        MusicianInstrument.objects.create(musician=musician, instrument=instrument1, years_played=5)
        MusicianInstrument.objects.create(musician=musician, instrument=instrument2, years_played=3)

        assert musician.genres.count() == 2
        assert MusicianInstrument.objects.filter(musician=musician).count() == 2


    ## Tests that musican is added and accessible in the databse
    def test_persistence(self, create_musician):
        musician = create_musician
        musician_from_db = Musician.objects.get(id=musician.id)
        assert musician_from_db.stage_name == "Big Savvy"
        assert musician_from_db.years_played == 5
        assert musician_from_db.home_studio is True
    
    @pytest.mark.django_db
    def test_field_max_length(self, create_musician):
        musician = create_musician
        musician.stage_name = "1" * 256
        with pytest.raises(ValidationError):
            musician.full_clean()
    
    @pytest.mark.django_db
    def test_cascade_delete(self, create_user, create_musician):
        user = create_user
        musician = create_musician
        user.delete()
        assert Musician.objects.filter(id=musician.id).count() == 0 