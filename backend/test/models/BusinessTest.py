from django.db import IntegrityError
import pytest
from pages.models import Business, User
from django.core.exceptions import ValidationError
from contextlib import nullcontext

class BusinessTest:

    @pytest.fixture
    def create_user(db):
        user = User.objects.create_user(username="testuser", email="test@test.com")
        user.full_clean()
        return user
    
    @pytest.fixture
    def create_business(db, create_user):
        business = Business.objects.create(
            user=create_user,
            business_name="Savvy Note",
            industry="Software"
        )
        business.full_clean()
        return business

    @pytest.mark.django_db
    def test_business_creation(self, create_user):
        user = create_user
        business = Business.objects.create(
            user=user,
            business_name="Savvy Note",
            industry="Software"
        )
        business.full_clean()

        assert business.id is not None
        assert business.user == user
        assert business.business_name == "Savvy Note"
        assert business.industry == "Software"

    @pytest.mark.django_db
    def test_string_representation(self, create_business):
        assert str(create_business) == "Savvy Note"
    
    @pytest.mark.django_db
    def test_field_max_length(self, create_business):
        business = create_business

        business.business_name = "1" * 256
        business.industry = "1" * 256

        with pytest.raises(ValidationError) as error:
            business.full_clean()

        error_messages = error.value.message_dict
        assert "business_name" in error_messages
        assert "industry" in error_messages

    @pytest.mark.django_db
    def test_field_invalid_inputs(self, create_business):
        business = create_business

        business.industry = None
        with nullcontext():
            business.full_clean()

        business.business_name = None
        with pytest.raises(ValidationError):
            business.full_clean()

    @pytest.mark.django_db
    def test_require_user(self):
        with pytest.raises(IntegrityError):
            Business.objects.create(business_name="No User", industry="Tech")

    @pytest.mark.django_db
    def test_cascade_delete(self, create_user, create_business):
        user = create_user
        business = create_business

        user.delete()
        assert Business.objects.filter(id=business.id).count() == 0 

    @pytest.mark.django_db
    def test_related_name(self, create_user, create_business):
        user = create_user
        business = create_business

        assert user.businesses.count() == 1
        assert user.businesses.first() == business