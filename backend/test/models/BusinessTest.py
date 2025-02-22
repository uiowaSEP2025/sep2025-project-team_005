import pytest
from pages.models import Business, User

class BusinessTest:
    @pytest.mark.django_db
    def createBusiness(self):
        user = User(username="testuser", email="test@test.com")

        business = Business(
            user_id=user,
            business_name="Savvy Note",
            industry="Software"
        )

        assert business.id is not None

