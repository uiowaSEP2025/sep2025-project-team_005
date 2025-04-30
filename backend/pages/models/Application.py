from django.core.exceptions import ValidationError
from django.db import models
from django.core.validators import MaxLengthValidator
import uuid
from pages.models import JobListing
from django.contrib.postgres.fields import ArrayField

class Application(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey('User', on_delete=models.CASCADE)
    listing = models.ForeignKey(JobListing, on_delete=models.CASCADE)
    first_name = models.TextField(max_length=35)
    last_name = models.TextField(max_length=50)

    file_keys = ArrayField(
        models.CharField(max_length=255, validators=[MaxLengthValidator(255)]),
        size=10,
        verbose_name="S3 file keys",
        default=list,
    )
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('In-Progress', 'In-Progress'),
            ('Submitted', 'Submitted'),
            ('Rejected', 'Rejected'),
            ('Accepted', 'Accepted'),
        ],
        default='musician'
    )