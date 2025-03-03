from django.db import models
import uuid

from .User import User


class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    s3_url = models.URLField(max_length=255)  # Direct URL to file in S3
    file_key = models.CharField(max_length=255)  # S3 object key - file path within the bucket
    file_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    caption = models.TextField(blank=True, null=True)
    
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    
    def like_count(self):
        return self.likes.count()


    def __str__(self):
        return f"{self.user.username} - {self.file_key}"
