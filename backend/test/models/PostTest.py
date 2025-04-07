from datetime import datetime
from django.core.exceptions import ValidationError
import pytest
from pages.models import Post, User, Like


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
            owner=create_owner,
            file_key="image/sample.png",
            file_type="image/png",
            caption="Test caption"
        )
        #post.tagged_users.add(create_tagged_users[0],create_tagged_users[1])
        post.full_clean()
        return post

    def test_post_creation(self, create_post, create_tagged_users):
        post = create_post
        
        #post.tagged_users.add(create_tagged_users[0],create_tagged_users[1])
        post.full_clean()

        assert post.id is not None
        assert post.caption == "Test caption"
        #assert post.tagged_users.count() == 2
        assert post.file_key == "image/sample.png"
        assert post.file_type == "image/png"

#    def test_many_to_many_relationships(self, create_post, create_tagged_users):
#        post = create_post
#
#        assert create_tagged_users[0] in post.tagged_users.all()
#        assert create_tagged_users[1] in post.tagged_users.all()
#        assert post.tagged_users.count() == 2
        
#    def test_no_tagged_users(self, create_owner):
#        post = Post.objects.create(
#            owner=create_owner,
#            file_key="image/sample.png",
#            file_type="image/png",
#            caption="Valid caption"
#        )
#        assert post.tagged_users.count() == 0


    @pytest.mark.django_db
    def test_field_max_length(self, create_post):
        post = create_post

        post.caption = "A" * 501
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
        
    def test_like_count(self, create_post, create_tagged_users):
        post = create_post
        users = create_tagged_users

        assert post.like_count() == 0

        Like.objects.create(user=users[0], post=post)
        assert post.like_count() == 1

        Like.objects.create(user=users[1], post=post)
        assert post.like_count() == 2
        
    def test_blank_caption(self, create_owner):
        post = Post.objects.create(
            owner=create_owner,
            file_key="image/sample.png",
            file_type="image/png",
            caption=""
        )
        assert post.caption == ""

