from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from pages.models import User, Musician, Instrument, Genre, MusicianInstrument, BlockedUser
from pages.serializers import UserSerializer
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class GetUsersView(APIView, PageNumberPagination):
    permission_classes = [IsAuthenticated]
    page_size = 5

    def get(self, request):
        search_query = request.GET.get("search", "").strip()
        instrument_query = request.GET.getlist("instrument")
        genre_query = request.GET.getlist("genre")
        
        musicians = Musician.objects.all()

        # Filtering by instruments
        if instrument_query:
            musicians = musicians.filter(
                id__in=MusicianInstrument.objects.filter(instrument__instrument__in=instrument_query)
                .values_list("musician_id", flat=True)
            )

        # Filtering by genres
        if genre_query:
            musicians = musicians.filter(genres__genre__in=genre_query)

        # Filtering by username
        if search_query:
            musicians = musicians.filter(user__username__icontains=search_query)

        blocked_by_others = BlockedUser.objects.filter(blocked=request.user).values_list('blocker_id', flat=True)
        discover_queryset = musicians.exclude(user__id__in=blocked_by_others)
            
        # Get distinct users associated with filtered musicians
        users = User.objects.filter(id__in=discover_queryset.values("user_id"), role="musician").distinct()
        paginated_users = self.paginate_queryset(users, request)

        return self.get_paginated_response([user.username for user in paginated_users])
    
class UserByUsernameView(APIView):
    def get(self, request, *args, **kwargs):
        username = kwargs.get('username')
        user = get_object_or_404(User, username=username)
        return JsonResponse({"user_id": str(user.id)}, status=status.HTTP_200_OK)
    
class UserByIdView(APIView):
    def get(self, request):
        id = request.GET.get('user_id')
        print(id)
        user = get_object_or_404(User, id=id)
        print(user)
        serializer = UserSerializer(user, context={'auth_user': user})
        return Response(serializer.data, status=status.HTTP_200_OK)