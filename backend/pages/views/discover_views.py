from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.paginator import Paginator
from rest_framework.pagination import PageNumberPagination
from pages.models import User, Musician, Instrument, Genre, MusicianInstrument
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status

class GetUsersView(APIView, PageNumberPagination):
    page_size = 5

    def get(self, request):
        search_query = request.GET.get("search", "").strip()
        instrument_query = request.GET.getlist("instrument")
        genre_query = request.GET.getlist("genre")
        page = request.GET.get("page", 1)
        
        musicians = Musician.objects.all()
        filter_query = Q()

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

        # Get distinct users associated with filtered musicians
        users = User.objects.filter(id__in=musicians.values("user_id"), role="musician").distinct()
        paginated_users = self.paginate_queryset(users, request)

        return self.get_paginated_response([user.username for user in paginated_users])

class InstrumentListView(APIView):
    def get(self, request):
        instruments = Instrument.objects.values_list("instrument", flat=True)
        return Response(list(instruments))
    
class GenreListView(APIView):
    def get(self, request):
        genres = Genre.objects.values_list("genre", flat=True)
        return Response(list(genres))
    
class UserByUsernameView(APIView):
    def get(self, request, *args, **kwargs):
        username = kwargs.get('username')
        user = get_object_or_404(User, username=username)
        return JsonResponse({"user_id": str(user.id)}, status=status.HTTP_200_OK)