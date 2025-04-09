from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from pages.serializers import FollowCountSerializer, UserSerializer
from pages.models import User, Musician


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
        
class FollowPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 50

class FollowListView(APIView, FollowPagination):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            follow_type = request.GET.get("type", "followers")
            page = request.GET.get("page", 1)
            
            if follow_type == "followers":
                follow_queryset = User.objects.filter(following__following=user)
            else:
                follow_queryset = User.objects.filter(followers__follower=user)
            
            paginated_followers = self.paginate_queryset(follow_queryset, request, view=self)
            serializer = UserSerializer(paginated_followers, many=True, context={'request': request})

            return self.get_paginated_response(serializer.data)
        
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)