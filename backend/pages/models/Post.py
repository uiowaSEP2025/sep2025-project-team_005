from django.db import models
from django.core.validators import MaxLengthValidator
import uuid
from pages.models.Like import Like

from .User import User


class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    s3_url = models.URLField(max_length=255)  # Direct URL to file in S3
    file_key = models.CharField(max_length=255)  # S3 object key - file path within the bucket
    file_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    caption = models.TextField(validators=[MaxLengthValidator(500)], blank=True)
    
    tagged_users = models.ManyToManyField(User, related_name="tagged_users")
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    
    def like_count(self):
        return Like.objects.filter(post=self).count()


    # For debugging
    def __str__(self):
        return f"{self.user.username} - {self.file_key}"
