from django.urls import path
from .views import *

app_name = 'stripe'

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name="create-checkout"),
]
