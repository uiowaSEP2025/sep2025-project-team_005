# backend/authentication/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        })
        
        
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({
            "access": access_token,
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            }
        })
        response.set_cookie(
            "access_token", access_token, secure=True, samesite="Lax"
        )
        response.set_cookie(
            "refresh_token", str(refresh), secure=True, samesite="Lax"
)
        return response
        
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Ensure JWT authentication is being used
            authentication_classes = [JWTAuthentication]
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "Unauthorized"}, status=401)

            # Get the refresh token from cookies
            refresh_token = request.COOKIES.get("refresh_token")
            if refresh_token:
                try:
                    # Blacklist the refresh token to prevent further use
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception as e:
                    return Response({"error": f"Error blacklisting token: {str(e)}"}, status=400)

            # Remove cookies
            response = Response({"message": "Logged out successfully"}, status=200)
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")

            return response
        except Exception as e:
            return Response({"error": f"Error during logout: {str(e)}"}, status=400)