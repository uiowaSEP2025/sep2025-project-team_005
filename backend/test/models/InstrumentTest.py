from contextlib import nullcontext
from django.core.exceptions import ValidationError
import pytest
from pages.models import Instrument

class InstrumentTest:
    
    @pytest.fixture
    def create_instrument(db):
        instrument = Instrument.objects.create(instrument="Savvy Piano", class_name = "Percussion")
        instrument.full_clean()
        return instrument
    
    @pytest.mark.django_db
    def test_instrument_creation(self):
        instrument = Instrument.objects.create(instrument="Cello", class_name = "Strings")

        assert instrument.id is not None
        assert instrument.instrument == "Cello"
        assert instrument.class_name == "Strings"

    @pytest.mark.django_db
    def test_string_representation(self, create_instrument):
        assert str(create_instrument) == "Savvy Piano"
    
    @pytest.mark.django_db
    def test_field_max_length(self, create_instrument):
        instrument = create_instrument
        instrument.instrument = "1" * 255
        instrument.class_name = "1" * 255
        with nullcontext():
            instrument.full_clean()

        instrument.instrument = "1" * 256
        instrument.class_name = "1" * 256
        with pytest.raises(ValidationError) as error:
            instrument.full_clean()

        error_messages = error.value.message_dict
        assert "instrument" in error_messages
        assert "class_name" in error_messages

    @pytest.mark.django_db
    def test_field_min_length(self, create_instrument):
        instrument = create_instrument
        instrument.instrument = ""
        with pytest.raises(ValidationError):
            instrument.full_clean()

    @pytest.mark.django_db
    def test_invalid_inputs(self, create_instrument):
        instrument = create_instrument

        instrument.instrument = None
        with pytest.raises(ValidationError):
            instrument.full_clean()
    