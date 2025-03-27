from django.db import models
import uuid
#from django.contrib.auth import get_user_model

#User = get_user_model()

class Follower(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey("pages.User", on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey("pages.User", on_delete=models.CASCADE, related_name="followers")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
        models.UniqueConstraint(fields=["follower", "following"], name="unique_follower_following"),
        models.CheckConstraint(
            check=~models.Q(follower=models.F("following")),
            name="prevent_self_follow"
        ),
    ]

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"