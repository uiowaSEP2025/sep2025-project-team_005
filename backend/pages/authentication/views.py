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
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view
from pages.models.User import User
from django.urls import reverse_lazy
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.auth.password_validation import validate_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
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
    def post(self, request):
        try:
            response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")
            return response
        except Exception as e:
            return Response({"error": "An error occurred while logging out", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        
# Class for serialization of data stored in the database
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate(self, data):
        # Check if username or email already associated with a user in the database
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "An account with this email already exists."})
        # TODO SN5-81: add regex validation in backend for email. Password should be good
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        # Hash the password before saving the user
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)

class ResetPasswordView(SuccessMessageMixin, PasswordResetView):
    # template_name = 'reset_password/reset_password.html'
    email_template_name = 'reset_password/reset_password_email.html'
    subject_template_name = 'reset_password/password_reset_subject'
    success_message = "We've emailed you instructions for setting your password, " \
                      "if an account exists with the email you entered. You should receive them shortly." \
                      " If you don't receive an email, " \
                      "please make sure you've entered the address you registered with, and check your spam folder."
    success_url = reverse_lazy('profile')

    def form_valid(slef, form):
        super().form_valid(form)
        return Response({ "message": "Password reset email sent" })
    
    def form_invalid(self, form):
        return Response({ "error": form.errors}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordConfirmView(PasswordResetConfirmView):
    def form_valid(self, form):
        form.save()
        return Response({"message": "Password reset successful!"})

    def form_invalid(self, form):
        return Response({"error": form.errors}, status=status.HTTP_400_BAD_REQUEST)

# API endpoint for signup requests
@api_view(['POST'])
def signup(request):
    serializer = UserSignupSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "User created successfully", "id": user.id}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)