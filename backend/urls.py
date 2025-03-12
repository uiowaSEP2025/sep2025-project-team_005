from django.contrib import admin
from django.urls import path, include
from pages.views.discover_views import GetUsersView, InstrumentListView, GenreListView
from pages.views.post_views import CreatePostView, create_genre, create_instrument, get_instruments, get_genres, get_musician_instruments, get_users, get_musicians, get_businesses

from django.http import JsonResponse

# For debugging:
def home(request):
    return JsonResponse({"message": "Django API is running!"})

urlpatterns = [
    path("", home),
    path('admin/', admin.site.urls),
    path("api/auth/", include("pages.authentication.urls", namespace="authentication")),
    path("discover/", GetUsersView.as_view(), name="get_users"),
    path('create/', CreatePostView.as_view(), name='create_post'),
    path('api/instruments/', create_instrument, name='create-instrument'),
    path('api/genres/', create_genre, name='create-genre'),
    path('api/instruments/all/', get_instruments, name='get-instruments'),
    path('api/genres/all/', get_genres, name='get-genres'),
    path('api/musician-instruments/all/', get_musician_instruments, name='get-musician-instruments'),
    path('api/users/all/', get_users, name='get-users'),
    path('api/musicians/all/', get_musicians, name='get-musicians'),
    path('instruments/', InstrumentListView.as_view(), name='instrument-list'),
    path('genres/', GenreListView.as_view(), name='genre-list'),
    path('api/businesses/all/', get_businesses, name='get-businesses')
]
