import pytest
from pages.models import Instrument

class InstrumentTest:
    
    @pytest.mark.django_db
    def createInstrument(self):
        instrument = Instrument(instrument="cello")

        assert instrument.id is not None