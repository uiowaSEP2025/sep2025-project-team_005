from rest_framework.views import APIView
from rest_framework.response import Response
<<<<<<< HEAD
from django.core.paginator import Paginator
from rest_framework.pagination import PageNumberPagination
from pages.models import User, Musician, Instrument, Genre
from django.db.models import Q
=======
from pages.models import User
from django.core.paginator import Paginator
from rest_framework.pagination import PageNumberPagination
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.

class GetUsersView(APIView, PageNumberPagination):
    page_size = 5

    def get(self, request):
        search_query = request.GET.get("search", "").strip()
<<<<<<< HEAD
        instrument_query = request.GET.getlist("instrument")
        genre_query = request.GET.getlist("genre")
        page = request.GET.get("page", 1)

        musicians = Musician.objects.all()
        filter_query = Q()

        if instrument_query:
            filter_query |= Q(instruments__instrument__in=instrument_query)
    
        if genre_query:
            filter_query |= Q(genres__genre__in=genre_query)

        if filter_query:  
            musicians = musicians.filter(filter_query).distinct()

        if search_query:
            musicians = musicians.filter(user__username__icontains=search_query)

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
=======
        page = request.GET.get("page", 1)

        users = User.objects.all()

        if search_query:
            users = users.filter(username__icontains=search_query)

        paginated_users = self.paginate_queryset(users, request)
        return self.get_paginated_response([user.username for user in paginated_users])
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
