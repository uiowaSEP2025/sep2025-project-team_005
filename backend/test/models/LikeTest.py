import pytest
from datetime import datetime
from django.db.utils import IntegrityError
from pages.models import Like, User, Post

@pytest.mark.django_db
class LikeTest:

    @pytest.fixture
    def create_user(db):
        user = User.objects.create_user(username="testuser", email="test@test.com")
        user.full_clean()
        return user

    @pytest.fixture
    def create_post(db, create_user):
        post1 = Post.objects.create(
            owner=create_user,
            s3_url="https://s3-bucket-url.com/sample1.png",
            file_key="image/sample1.png",
            file_type="image/png",
            caption="Test caption1"
        )
        post1.full_clean()
        
        post2 = Post.objects.create(
            owner=create_user,
            s3_url="https://s3-bucket-url.com/sample2.png",
            file_key="image/sample2.png",
            file_type="image/png",
            caption="Test caption2"
        )
        post2.full_clean()
        return [post1, post2]

    def test_like_creation(self, create_user, create_post):
        posts = create_post
        like = Like.objects.create(user=create_user, post=posts[0])

        assert like.id is not None
        assert like.user == create_user
        assert like.post == posts[0]
        assert like.created_at is not None
        assert isinstance(like.created_at, datetime)

    def test_multiple_likes(self, create_user, create_post):
        posts = create_post
        Like.objects.create(user=create_user, post=posts[0])
        Like.objects.create(user=create_user, post=posts[1])

        assert Like.objects.count() == 2

    def test_cascade_delete_on_user(self, create_user, create_post):
        posts = create_post
        like = Like.objects.create(user=create_user, post=posts[0])
        assert Like.objects.count() == 1

        create_user.delete()
        assert Like.objects.count() == 0

    def test_cascade_delete_on_post(self, create_user, create_post):
        posts = create_post
        like = Like.objects.create(user=create_user, post=posts[0])
        assert Like.objects.count() == 1

        posts[0].delete()
        assert Like.objects.count() == 0
