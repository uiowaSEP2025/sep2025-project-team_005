from django.db import models
import uuid

from .User import User

class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey("pages.Post", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
