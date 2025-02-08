from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ('musician', 'Musician'),
            ('business', 'Business'),
        ],
        default='musician'
    )
    
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)  # Example: 4.5 rating
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        """Hash and securely store the password"""
        super().set_password(raw_password)