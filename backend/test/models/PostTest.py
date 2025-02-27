from datetime import datetime
from django.core.exceptions import ValidationError
import pytest
from pages.models import Post, User


@pytest.mark.django_db
class PostTest:

    @pytest.fixture
    def create_owner(db):
        owner = User.objects.create_user(username="testuser", email="test@test.com")
        owner.full_clean()
        return owner
    
    @pytest.fixture
    def create_tagged_users(db):
        tagged_user = User.objects.create_user(username="testuser2", email="test2@test.com")
        tagged_user.full_clean()
        tagged_user2 = User.objects.create_user(username="testuser3", email="test3@test.com")
        tagged_user2.full_clean()
        return [tagged_user,tagged_user2]
    
    @pytest.fixture
    def create_post(db, create_owner, create_tagged_users):
        post = Post.objects.create(
            owner=create_owner
        )
        post.tagged_users.add(create_tagged_users[0],create_tagged_users[1])
        post.full_clean()
        return post

    def test_post_creation(self, create_owner, create_tagged_users):
        post = Post.objects.create(
            owner=create_owner,
            description="Large Description",
            image_urls=[]
        )
        post.tagged_users.add(create_tagged_users[0],create_tagged_users[1])
        post.full_clean()

        assert post.id is not None
        assert post.description == "Large Description"
        assert post.tagged_users.count() == 2
        assert post.image_urls == []

    def test_many_to_many_relationships(self, create_post, create_tagged_users):
        post = create_post

        assert create_tagged_users[0] in post.tagged_users.all()
        assert create_tagged_users[1] in post.tagged_users.all()

        assert post.tagged_users.count() == 2
        assert post.image_urls == []

    @pytest.mark.django_db
    def test_field_max_length(self, create_post):
        post = create_post

        post.description = "A" * 501
        with pytest.raises(ValidationError):
            post.full_clean()

    @pytest.mark.django_db
    def test_cascade_delete(self, create_owner, create_post):
        owner = create_owner
        post = create_post

        owner.delete()
        assert Post.objects.filter(id=post.id).count() == 0

    @pytest.mark.django_db
    def test_created_at(self, create_post):
        post = create_post

        assert post.created_at is not None
        assert isinstance(post.created_at, datetime)