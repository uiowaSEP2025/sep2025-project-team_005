from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.core.validators import RegexValidator
from django.db import models
from pages.models.Follower import Follower
import uuid
 
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=30, unique=True, validators=[MinLengthValidator(1)])
    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=14,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$',
                message="Enter a valid US phone number (e.g., '+1 123-456-7890', '(123) 456-7890', or '1234567890')."
            )
        ],
        blank=True,  
        null=True,   
    )
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

    hidden_posts = models.ManyToManyField('Post', related_name="hidden_users")
    reported_posts = models.ManyToManyField('Post', related_name="reported_users", through="ReportedPost")

    def set_password(self, raw_password):
        """Hash and securely store the password"""
        super().set_password(raw_password)
        # TODO SN5-81: add password db validation
        
    def follower_count(self):
        return Follower.objects.filter(following=self).count()

    def following_count(self):
        return Follower.objects.filter(follower=self).count()
