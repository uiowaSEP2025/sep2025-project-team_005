from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'authentication'

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("signup/", signup, name="signup"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("reset-password-confirmation/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]