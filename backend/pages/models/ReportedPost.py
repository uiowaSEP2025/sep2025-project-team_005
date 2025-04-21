from django.db import models
import uuid
from pages.models import User, Post
from django.core.validators import MaxLengthValidator

class PostStatus(models.TextChoices):
    REPORTED = 'Reported'
    IN_PROGRESS = 'In Progress'
    ADDRESSED = 'Addressed'

class ReportedPost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    report_reason = models.TextField(validators=[MaxLengthValidator(500)], blank=True)
    status = models.CharField(
        choices=PostStatus.choices,
        default=PostStatus.REPORTED
    )
