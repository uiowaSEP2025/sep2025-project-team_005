from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.db import models
from pages.models.Follower import Follower
from pages.models.Follower import Follower
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=30, unique=True, validators=[MinLengthValidator(1)])
    email = models.EmailField(unique=True) # TODO SN5-81: add email db validation
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
    
    followers = models.ManyToManyField("self", symmetrical=False, related_name="following")


    def set_password(self, raw_password):
        """Hash and securely store the password"""
        super().set_password(raw_password)
        # TODO SN5-81: add password db validation
        
    def follower_count(self):
        return Follower.objects.filter(following=self).count()

    def following_count(self):
        return Follower.objects.filter(follower=self).count()
