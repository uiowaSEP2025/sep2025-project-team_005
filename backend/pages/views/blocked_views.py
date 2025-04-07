# views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from pages.models import User, BlockedUser
from rest_framework.pagination import PageNumberPagination
from pages.serializers.user_serializers import UserSerializer


class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user == target_user:
            return Response({"error": "Cannot block yourself."}, status=status.HTTP_400_BAD_REQUEST)

        block, created = BlockedUser.objects.get_or_create(
            blocker=request.user, blocked=target_user
        )
        if created:
            return Response({"message": "User blocked."}, status=status.HTTP_201_CREATED)
        return Response({"message": "Already blocked."}, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user == target_user:
            return Response({"error": "Cannot unblock yourself."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            block = BlockedUser.objects.get(blocker=request.user, blocked=target_user)
            block.delete()
            return Response({"message": "User unblocked."}, status=status.HTTP_204_NO_CONTENT)
        except BlockedUser.DoesNotExist:
            return Response({"error": "Block relationship does not exist."}, status=status.HTTP_400_BAD_REQUEST)


class BlockPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 50

class BlockedListView(APIView, BlockPagination):
    def get(self, request, user_id):
        print(f"Authenticated user: {request.user}")
        try:
            # Fetch the user by the provided user_id
            user = User.objects.get(id=user_id)

            # Retrieve the page query parameter (defaults to 1 if not provided)
            page = request.GET.get("page", 1)

            # Query blocked users for the provided user
            blocked_queryset = BlockedUser.objects.filter(blocker=user)

            # Paginate the blocked users list
            paginated_blocked_users = self.paginate_queryset(blocked_queryset, request, view=self)

            # Extract blocked users (blocked users are related via the 'blocked' field in BlockedUser)
            blocked_users = [blocked.blocked for blocked in paginated_blocked_users]
            
            # Pass the auth_user to the context of the serializer
            serializer = UserSerializer(blocked_users, many=True, context={'auth_user': request.user})
            return self.get_paginated_response(serializer.data)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except BlockedUser.DoesNotExist:
            return Response({"error": "No blocked users found"}, status=status.HTTP_404_NOT_FOUND)