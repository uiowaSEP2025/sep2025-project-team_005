from django.db import models
import uuid

class BlockedUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blocker = models.ForeignKey("pages.User", on_delete=models.CASCADE, related_name="blocking")
    blocked = models.ForeignKey("pages.User", on_delete=models.CASCADE, related_name="blocked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="unique_blocker_blocked"),
            models.CheckConstraint(
                check=~models.Q(blocker=models.F("blocked")),
                name="prevent_self_block"
            ),
        ]

    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"
