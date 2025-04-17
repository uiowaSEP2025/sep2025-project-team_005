from django.core.exceptions import ValidationError
import pytest
from pages.models import User, ReportedPost, Post, PostStatus

@pytest.mark.django_db
class ReportedPostTest:
    @pytest.fixture
    def create_user(db):
        user = User.objects.create_user(username="testuser", email="test@test.com")
        user.full_clean()
        return user

    @pytest.fixture
    def create_post(db, create_user):
        post = Post.objects.create(
            owner=create_user,
            file_keys=["image/sample.png"],
            file_types=["image/png"],
            caption="Test caption"
        )
        post.full_clean()
        return post

    @pytest.fixture
    def create_reported_post(db, create_user, create_post):
        user = create_user
        post = create_post
        reportedPost = ReportedPost.objects.create(user=user, post=post)
        reportedPost.full_clean()
        return reportedPost, user, post

    def test_reported_post_creation(self, create_reported_post):
        reportedPost, user, post = create_reported_post

        assert reportedPost.user == user
        assert reportedPost.post == post
        assert reportedPost.report_reason == ""
        assert reportedPost.status == PostStatus.REPORTED