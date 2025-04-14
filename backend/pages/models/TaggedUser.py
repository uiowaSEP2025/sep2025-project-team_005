from xml.dom import ValidationErr
from django.db import models
from django.core.validators import MaxValueValidator
import uuid
from pages.models import User, Post

class TaggedUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    image_index = models.IntegerField(blank=True, null=True, validators=[
            MaxValueValidator(10),
    ])

    def clean(self):
        super().clean()
        if self.image_index is not None:
            max_index = len(self.post.file_keys)
            if self.image_index > max_index:
                raise ValidationErr({
                    'image_index': f"Must be less than the number of file keys ({max_index})."
                })

