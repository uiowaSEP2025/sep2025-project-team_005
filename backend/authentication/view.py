# backend/authentication/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get the refresh token from cookies or headers
            refresh_token = request.COOKIES.get("refresh_token")
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()  # Blacklist the refresh token to prevent further use
                except Exception as e:
                    return Response({"error": str(e)}, status=400)
            return Response({"message": "Logged out successfully"}, status=200)
        except Exception as e:
            return Response({"error": "Failed to log out"}, status=400)
