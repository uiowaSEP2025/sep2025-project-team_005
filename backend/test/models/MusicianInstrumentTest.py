import pytest
from datetime import datetime
from django.db.utils import IntegrityError
from pages.models import User, MusicianInstrument, Instrument, Musician

@pytest.mark.django_db
class MusicianInstrumentTest:
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

    @pytest.fixture
    def create_instrument(db):
        instrument = Instrument.objects.create(instrument="Guitar", class_name="Strings")
        instrument.full_clean()
        return instrument
    
    @pytest.fixture
    def create_musician_instrument(db, create_musician, create_instrument):
        musician = create_musician
        instrument = create_instrument
        musicianInstrument = MusicianInstrument.objects.create(musician=musician, instrument=instrument, years_played=5)
        musicianInstrument.full_clean()
        return musicianInstrument, musician, instrument

    def test_musician_instrument_creation(self, create_musician_instrument):
        musicianInstrument, musician, instrument = create_musician_instrument

        assert musicianInstrument.musician == musician
        assert musicianInstrument.instrument == instrument
        assert musicianInstrument.years_played == 5
                