import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.models import Business, Subscription, User
from django.http import HttpResponse
from rest_framework.permissions import AllowAny

stripe.api_key = settings.STRIPE_SECRET_KEY

STRIPE_PRICE_MONTHLY = 'price_1RCMEHJJ0feuvHiCkaSxAIOg'
STRIPE_PRICE_ANNUAL = 'price_1RCMEnJJ0feuvHiCby39Hx0P'


class CreateSubscriptionSessionView(APIView):
    def post(self, request, *args, **kwargs):
        subscription_type = request.data.get('type')
        user_id = request.data.get('user_id')

        if subscription_type == 'monthly':
            price_id = STRIPE_PRICE_MONTHLY
        elif subscription_type == 'annual':
            price_id = STRIPE_PRICE_ANNUAL
        else:
            return Response({'error': 'Invalid subscription type.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='subscription',
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                success_url='http://localhost:3000/subscription/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:3000/subscription/cancel',
                metadata={
                    'user_id': user_id,
                    'type': subscription_type
                }
            )
            return Response({'id': session.id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            customer_id = session['customer']
            subscription_id = session['subscription']
            user_id = session['metadata'].get('user_id')
            business = Business.objects.get(user=user_id)
            plan = session['metadata'].get('type')

            try:
                Subscription.objects.create(
                    business=business,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=subscription_id,
                    plan=plan
                )
            except Business.DoesNotExist:
                # Optionally log this
                pass

        return HttpResponse(status=200)