from django.db import models
from django.core.validators import MinLengthValidator
import uuid

class Instrument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instrument = models.CharField(max_length=255, validators=[MinLengthValidator(1)])
    class_name = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"{self.instrument}"