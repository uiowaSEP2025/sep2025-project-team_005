from django.db import models
from django.core.validators import MaxLengthValidator
import uuid

from .User import User

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    tagged_users = models.ManyToManyField(User, related_name="tagged_users")

    description = models.TextField(validators=[MaxLengthValidator(500)], blank=True) 
    image_urls = models.JSONField(default=list, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)