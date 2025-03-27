# Explicit definition of the intermediate model between musicians and instruments
# This is needed because we are including an additional field (years_played), so the Django default is not sufficient

from django.db import models
from .Musician import Musician
from .Instrument import Instrument

class MusicianInstrument(models.Model):
    musician = models.ForeignKey(Musician, on_delete=models.CASCADE)
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    years_played = models.PositiveIntegerField()

    class Meta:
        unique_together = ('musician', 'instrument')  # Ensures a musician can't have duplicate instrument entries
        db_table = 'pages_musician_instruments'

    def __str__(self):
        return f"{self.musician.stage_name} - {self.instrument.name} ({self.years_played} years)"
