import pytest
from pages.models import User, Business, Subscription
from django.utils import timezone


@pytest.fixture
def create_user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass',
        role='business',
        phone='123-456-7890'
    )

@pytest.fixture
def create_business(create_user):
    return Business.objects.create(
        user=create_user,
        business_name='Test Business',
        industry='Music'
    )

@pytest.fixture
def create_subscription(create_business):
    return Subscription.objects.create(
        business=create_business,
        stripe_customer_id='cus_test123',
        stripe_subscription_id='sub_test123',
        plan='monthly'
    )

@pytest.mark.django_db
def test_subscription_creation(create_subscription, create_business):
    ''' Assert the subscription has been created correctly '''
    assert create_subscription.business == create_business
    assert create_subscription.stripe_customer_id == 'cus_test123'
    assert create_subscription.stripe_subscription_id == 'sub_test123'
    assert create_subscription.plan == 'monthly'
    assert create_subscription.created_at is not None

@pytest.mark.django_db
def test_subscription_default_plan(create_business):
    ''' Create a subscription with the default plan ('none') '''
    subscription = Subscription.objects.create(
        business=create_business,
        stripe_customer_id='cus_test123',
        stripe_subscription_id='sub_test123',
        plan='none'
    )

    # Assert the subscription has the default plan 'none'
    assert subscription.plan == 'none'

@pytest.mark.django_db
def test_subscription_one_to_one_relationship(create_subscription, create_business):
    ''' Assert that only one subscription exists for the business '''
    assert create_business.subscription == create_subscription
    assert Subscription.objects.filter(business=create_business).count() == 1

@pytest.mark.django_db
def test_subscription_created_at(create_subscription):
    ''' Assert that the subscription has a created_at timestamp '''
    assert create_subscription.created_at is not None
    assert create_subscription.created_at <= timezone.now()
