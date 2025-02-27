from django.db import models
import uuid

from .User import User
from .Instrument import Instrument
from .Genre import Genre

class Musician(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    stage_name = models.CharField(max_length=255, default="", blank=True)
    years_played = models.IntegerField(null=True, blank=True)
    home_studio = models.BooleanField(default=False)
    
    genres = models.ManyToManyField(Genre, related_name="musicians")
    instruments = models.ManyToManyField(Instrument, related_name="musicians")

    def __str__(self):
        return self.stage_name