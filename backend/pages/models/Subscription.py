from django.db import models
from pages.models import Business

class Subscription(models.Model):
    business = models.OneToOneField(Business, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255)
    plan = models.CharField(
        max_length=20,
        choices=[
            ('none', 'None'),
            ('monthly', 'Monthly'),
            ('annual', 'Annual'),
        ],
        default='musician'
    )
    created_at = models.DateTimeField(auto_now_add=True)
