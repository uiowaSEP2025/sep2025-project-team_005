from django.db import models
import uuid

class Instrument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instrument = models.CharField(max_length=255)
    class_name = models.CharField(max_length=255, default="", blank=True)
    
    def __str__(self):
        return f"{self.instrument} - {self.class_name}"