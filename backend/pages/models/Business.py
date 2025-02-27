from django.db import models
import uuid
from .User import User  # Import User model to set up the foreign key

class Business(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='businesses')
    
    business_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255, default="", blank=True)

    def __str__(self):
        return self.business_name