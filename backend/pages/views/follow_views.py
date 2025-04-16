from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from pages.serializers import FollowCountSerializer, UserSerializer
from pages.models import User, Musician, Follower, BlockedUser
from rest_framework.permissions import IsAuthenticated


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
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            follow_type = request.GET.get("type", "followers")
            page = request.GET.get("page", 1)
            
            if follow_type == "followers":
                follow_queryset = User.objects.filter(following__following=user)
            else:
                follow_queryset = User.objects.filter(followers__follower=user)
            
            blocked_by_others = BlockedUser.objects.filter(blocked=request.user).values_list('blocker_id', flat=True)
            follow_queryset = follow_queryset.exclude(id__in=blocked_by_others)
                
            paginated_followers = self.paginate_queryset(follow_queryset, request, view=self)
            serializer = UserSerializer(paginated_followers, many=True, context={'request': request, 'auth_user': request.user})

            return self.get_paginated_response(serializer.data)
        
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        

class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user == target_user:
            return Response({"error": "You cannot follow yourself"}, status=status.HTTP_400_BAD_REQUEST)

        follow_exists = Follower.objects.filter(follower=request.user, following=target_user).exists()
        if follow_exists:
            return Response({"message": "Already following"}, status=status.HTTP_200_OK)

        Follower.objects.create(follower=request.user, following=target_user)
        return Response({"message": "Followed"}, status=status.HTTP_201_CREATED)

    def delete(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            follow = Follower.objects.get(follower=request.user, following=target_user)
            follow.delete()
            return Response({"message": "Unfollowed"}, status=status.HTTP_204_NO_CONTENT)
        except Follower.DoesNotExist:
            return Response({"error": "You are not following this user"}, status=status.HTTP_400_BAD_REQUEST)
        
class IsFollowingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        is_following = Follower.objects.filter(follower=request.user, following=target_user).exists()
        return Response({"is_following": is_following})