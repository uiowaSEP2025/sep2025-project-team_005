from django.core.exceptions import ValidationError
from django.db import models
from django.core.validators import MaxLengthValidator
from django.core.validators import RegexValidator
import uuid
from pages.models import JobApplication


class Experience(models.Model):
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name="experiences")
    job_title = models.CharField(max_length=75)
    company_name = models.CharField(max_length=75)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True)