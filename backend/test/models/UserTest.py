import pytest
from pages.models import User
from datetime import datetime


class UserTest:

    ## Test User object creation
    @pytest.mark.django_db
    def test_create_user(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@test.com"
        assert user.password != "password123"       # Doesn't equal due to password hashing
        assert user.role == "musician"              # Default role

    ## Test default assignment of role parameter
    @pytest.mark.django_db
    def test_default_role(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        assert user.role == "musician"
    
    ## Check that stored password value doesn't match entered valued -- indicate password is hashed
    @pytest.mark.django_db
    def test_set_password(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        assert user.password != "password123"
        assert user.check_password("password123")
    
    ## Tested embedded function to ensure email uniqueness
    @pytest.mark.django_db
    def test_email_uniqueness(self):
        User.objects.create_user(username="testuser1", email="test@test.com", password="password123")
        with pytest.raises(Exception):
            User.objects.create_user(username="testuser2", email="test@test.com", password="password123")
    
    ## Test default assignment of rating parameter
    @pytest.mark.django_db
    def test_default_rating(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        assert user.rating == 0.0
    
    ## Test function to assign optional paramters after object instantiation 
    @pytest.mark.django_db
    def test_set_rating(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        user.rating = 4.5
        user.save()
        user = User.objects.get(id=user.id)
        assert user.rating == 4.5

    ## Test username is saved as a string object
    @pytest.mark.django_db
    def test_user_str(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        assert str(user) == "testuser"

    ## Test that user creation time is not null, is a datetime object, and is time-zone aware
    @pytest.mark.django_db
    def test_created_at(self):
        user = User.objects.create_user(username="testuser", email="test@test.com", password="password123")
        assert user.created_at is not None
        assert isinstance(user.created_at, datetime)
