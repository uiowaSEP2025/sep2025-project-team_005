from django.db import models
from django.core.validators import MaxLengthValidator
import uuid

from .User import User

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey('Post', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    text = models.TextField(validators=[MaxLengthValidator(500)], blank=True)
    reply_to = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE)
    likes = models.ManyToManyField('Like', related_name="liked_comments")
