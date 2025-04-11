import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

stripe.api_key = settings.STRIPE_SECRET_KEY

# Replace these with your actual Stripe Price IDs
STRIPE_PRICE_MONTHLY = 'sub_1RCMMdJJ0feuvHiCbQE0Xg9n'
STRIPE_PRICE_ANNUAL = 'sub_1RCMPxJJ0feuvHiCRDWUrVN3'

class CreateSubscriptionSessionView(APIView):
    def post(self, request, *args, **kwargs):
        subscription_type = request.data.get('type')  # expects 'monthly' or 'annual'

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
                success_url='http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:3000/cancel',
            )
            return Response({'id': session.id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)