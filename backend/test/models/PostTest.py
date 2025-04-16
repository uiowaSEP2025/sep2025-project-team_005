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
    def create_ban_admin(db):
        admin = User.objects.create_user(username="admin", email="admin@test.com")
        admin.full_clean()
        return admin
    
    @pytest.fixture
    def create_tagged_users(db):
        user = User.objects.create_user(username="testuser2", email="test2@test.com")
        user.full_clean()
        user2 = User.objects.create_user(username="testuser3", email="test3@test.com")
        user2.full_clean()
        return [user,user2]
    
    @pytest.fixture
    def create_post(db, create_owner, create_tagged_users):
        post = Post.objects.create(
            owner=create_owner,
            file_keys=["image/sample.png"],
            file_types=["image/png"],
            caption="Test caption"
        )
        post.tagged_users.add(create_tagged_users[0],create_tagged_users[1])
        post.full_clean()
        return post

    def test_post_creation(self, create_post, create_tagged_users):
        post = create_post
        
        post.tagged_users.add(create_tagged_users[0],create_tagged_users[1])
        post.full_clean()

        assert post.id is not None
        assert post.caption == "Test caption"
        assert post.tagged_users.count() == 2
        assert post.file_keys == ["image/sample.png"]
        assert post.file_types == ["image/png"]
        assert post.is_banned == False

    def test_many_to_many_relationships(self, create_post, create_tagged_users):
       post = create_post

       assert create_tagged_users[0] in post.tagged_users.all()
       assert create_tagged_users[1] in post.tagged_users.all()
       assert post.tagged_users.count() == 2
        
    def test_no_tagged_users(self, create_owner):
       post = Post.objects.create(
           owner=create_owner,
           file_keys=["image/sample.png"],
           file_types=["image/png"],
           caption="Valid caption"
       )
       assert post.tagged_users.count() == 0


    def test_field_max_length(self, create_post):
        post = create_post

        post.caption = "A" * 501
        with pytest.raises(ValidationError):
            post.full_clean()

    def test_cascade_delete(self, create_owner, create_post):
        owner = create_owner
        post = create_post

        owner.delete()
        assert Post.objects.filter(id=post.id).count() == 0

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
            file_keys=["image/sample.png"],
            file_types=["image/png"],
            caption=""
        )
        assert post.caption == ""

    def test_banned_without_admin_should_fail(self, create_post):
        post = create_post
        post.is_banned=True
        with pytest.raises(ValidationError, match="A banned post must have at least one ban_admin"):
            post.full_clean()

    def test_banned_with_admin_should_pass(self, create_ban_admin, create_post):
        post = create_post
        post.is_banned=True
        post.save()
        post.ban_admin.add(create_ban_admin)
        post.full_clean()

    def test_not_banned_with_admin_should_fail(self, create_ban_admin, create_post):
        post = create_post
        post.is_banned=False
        post.ban_admin.add(create_ban_admin)
        with pytest.raises(ValidationError, match="A non-banned post should not have any ban_admins."):
            post.full_clean()

    def test_not_banned_without_admin_should_pass(self, create_post):
        post = create_post
        post.is_banned=False
        post.save()
        post.full_clean()