from django.urls import path
from pages.authentication.view import CustomTokenObtainPairView, LogoutView, ProfileView
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'authentication'

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('profile/', ProfileView.as_view(), name='profile'),
]