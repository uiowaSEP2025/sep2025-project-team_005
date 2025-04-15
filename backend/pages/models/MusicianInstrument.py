from django.db import models
from .Musician import Musician
from .Instrument import Instrument

class MusicianInstrument(models.Model):
    musician = models.ForeignKey(Musician, on_delete=models.CASCADE)
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    years_played = models.PositiveIntegerField()

    class Meta:
        unique_together = ('musician', 'instrument')  # Ensures a musician can't have duplicate instrument entries
        db_table = 'pages_musicianinstrument'