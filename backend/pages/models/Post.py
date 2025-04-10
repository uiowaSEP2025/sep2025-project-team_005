from django.db import models
from django.core.validators import MaxLengthValidator
import uuid
from pages.models import Like
from django.contrib.postgres.fields import ArrayField

from .User import User


class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    file_keys = ArrayField(
        models.CharField(max_length=255, validators=[MaxLengthValidator(255)]),
        size=10,
        verbose_name="S3 file keys",
        default=list,
    )
    file_types = ArrayField(
        models.CharField(max_length=50, validators=[MaxLengthValidator(50)]),
        size=10,
        verbose_name="File types",
        default=list
    )
    created_at = models.DateTimeField(auto_now_add=True)
    caption = models.TextField(validators=[MaxLengthValidator(500)], blank=True)
    
    tagged_users = models.ManyToManyField(User, related_name="tagged_users")
    
    def like_count(self):
        return Like.objects.filter(post=self).count()
