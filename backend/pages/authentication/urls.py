from django.urls import path
from .views import LogoutView
from .views import SignUp
from rest_framework_simplejwt.views import CustomTokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("signup/", SignUp, name="signup")
]