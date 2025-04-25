from django.db import models
from django.conf import settings
from pages.models import Business
from pages.models import Instrument
from pages.models import Genre

class JobListing(models.Model):
    GIG_TYPE_CHOICES = [
        ('oneTime', 'One-time Gig'),
        ('recurring', 'Recurring Gig'),
        ('longTerm', 'Long-term Gig'),
    ]

    PAYMENT_TYPE_CHOICES = [
        ('Fixed amount', 'Fixed amount'),
        ('Hourly rate', 'Hourly rate'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='job_listings')

    event_title = models.CharField(max_length=255)
    venue = models.CharField(max_length=255)
    gig_type = models.CharField(max_length=10, choices=GIG_TYPE_CHOICES)
    event_description = models.TextField()

    # Payment details
    payment_type = models.CharField(max_length=15, choices=PAYMENT_TYPE_CHOICES)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Unified date/time fields
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    # Optional recurring info
    recurring_pattern = models.CharField(max_length=20, blank=True, null=True)
    experience_level = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    instruments = models.ManyToManyField(Instrument, related_name='job_listings')
    genres = models.ManyToManyField(Genre, related_name='job_listings')

    def __str__(self):
        return self.event_title