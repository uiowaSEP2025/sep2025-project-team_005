from django.db import models
from django.core.validators import MinLengthValidator
import uuid

class Genre(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    genre = models.CharField(max_length=255, validators=[MinLengthValidator(1)])
    
    def __str__(self):
        return f"{self.genre}"