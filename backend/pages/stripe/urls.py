from django.urls import path
from .views import *

app_name = 'stripe'

urlpatterns = [
    path('create-subscription-session/', CreateSubscriptionSessionView.as_view(), name="create-checkout"),
]
