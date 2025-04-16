import pytest
import json
from rest_framework.test import APIClient
from rest_framework import status
from pages.models import Business, Subscription, User

# URL patterns
CREATE_SUBSCRIPTION_URL = "/api/stripe/create-subscription-session/"
STRIPE_WEBHOOK_URL = "/api/stripe/webhook/"

@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass',
        role='business',
        phone='123-456-7890'
    )

@pytest.fixture
def business(test_user):
    return Business.objects.create(
        user=test_user,
        business_name='Test Business',
        industry='Music'
    )

@pytest.mark.django_db
def test_create_subscription_session_monthly(api_client, test_user, mocker):
    mock_create = mocker.patch('stripe.checkout.Session.create')
    mock_create.return_value.id = 'test_session_id'

    url = CREATE_SUBSCRIPTION_URL.format(test_user.id)
    response = api_client.post(url, {
        'type': 'monthly',
        'user_id': test_user.id
    }, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == 'test_session_id'
    mock_create.assert_called_once()

@pytest.mark.django_db
def test_create_subscription_session_invalid_type(api_client, test_user):
    url = CREATE_SUBSCRIPTION_URL.format(test_user.id)
    response = api_client.post(url, {
        'type': 'weekly',
        'user_id': test_user.id
    }, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data

@pytest.mark.django_db
def test_stripe_webhook_checkout_completed(api_client, test_user, business, mocker, settings):
    settings.STRIPE_WEBHOOK_SECRET = 'whsec_testsecret'

    payload = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "customer": "cus_test123",
                "subscription": "sub_test123",
                "metadata": {
                    "user_id": str(test_user.id),
                    "type": "monthly"
                }
            }
        }
    }

    encoded_payload = json.dumps(payload)
    mock_construct = mocker.patch('stripe.Webhook.construct_event')
    mock_construct.return_value = payload

    url = STRIPE_WEBHOOK_URL.format(test_user.id)
    response = api_client.post(url,
                               data=encoded_payload,
                               content_type='application/json',
                               HTTP_STRIPE_SIGNATURE='testsignature')

    assert response.status_code == 200
    subscription = Subscription.objects.get(business=business)
    assert subscription.stripe_customer_id == 'cus_test123'
    assert subscription.stripe_subscription_id == 'sub_test123'
    assert subscription.plan == 'monthly'
