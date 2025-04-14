from xml.dom import ValidationErr
import pytest
from datetime import datetime
from django.db.utils import IntegrityError
from pages.models import User, TaggedUser, Post

@pytest.mark.django_db
class TaggedUserTest:
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
    def create_tagged_user(db, create_user, create_post):
        user = create_user
        post = create_post
        taggedUser = TaggedUser.objects.create(user=user, post=post, image_index=1)
        taggedUser.full_clean()
        return taggedUser, user, post

    def test_musician_instrument_creation(self, create_tagged_user):
        taggedUser, user, post = create_tagged_user

        assert taggedUser.user == user
        assert taggedUser.post == post
        assert taggedUser.image_index == 1   

    def test_max_index(self, create_user, create_post):
        with pytest.raises(ValidationErr) as e:
            taggedUser = TaggedUser.objects.create(user=create_user, post=create_post, image_index=2)
            taggedUser.full_clean()

        assert "Must be less than the number of file keys" in str(e.value)
