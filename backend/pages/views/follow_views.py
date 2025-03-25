from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.serializers.follower_serializers import FollowCountSerializer
from pages.models import User, Musician
from django.http import JsonResponse


class FollowingView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            musician = Musician.objects.get(user=user)

            # Serialize follower count data
            follower_data = FollowCountSerializer(user).data  

            return Response(follower_data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Musician.DoesNotExist:
            return Response({"error": "Musician profile not found"}, status=status.HTTP_404_NOT_FOUND)