from django.core.exceptions import ValidationError
from django.db import models
from django.core.validators import MaxLengthValidator
import uuid
from pages.models import Like
from django.contrib.postgres.fields import ArrayField

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey('User', on_delete=models.CASCADE)
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
    
    tagged_users = models.ManyToManyField('User', related_name="tagged_users")

    is_banned = models.BooleanField(default=False)
    ban_admin = models.ManyToManyField('User', related_name="banned_posts", blank=True)
    
    def clean(self):
        if self.is_banned and not self.ban_admin.exists():
            raise ValidationError("A banned post must have at least one ban_admin.")
        if not self.is_banned and self.ban_admin.exists():
            raise ValidationError("A non-banned post should not have any ban_admins.")

    def like_count(self):
        return self.likes.count()