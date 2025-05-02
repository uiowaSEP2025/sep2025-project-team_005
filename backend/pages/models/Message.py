from django.db import models
import uuid
from pages.models import User, Post
from django.core.validators import MaxLengthValidator
from django.contrib.postgres.fields import ArrayField

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField(validators=[MaxLengthValidator(500)], blank=True)
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

