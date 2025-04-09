from django.contrib import admin
from django.urls import path, include
from pages.views.discover_views import GetUsersView, InstrumentListView, GenreListView, UserByUsernameView
from pages.views.settings_views import MusicianDetailView, ChangePasswordView
from pages.views.follow_views import FollowingView, FollowListView
from pages.views.post_views import CreatePostView, GetPostsView, GetFeedView
from pages.views.helper_views import create_genre, create_instrument, get_instruments, get_genres, get_musician_instruments, get_users, get_musicians, get_businesses
from django.http import JsonResponse

# For debugging:
def home(request):
    return JsonResponse({"message": "Django API is running!"})

urlpatterns = [
    path("", home),
    path('admin/', admin.site.urls),
    path('api/', include([
        path('auth/', include("pages.authentication.urls", namespace="authentication")),
        path('discover/', GetUsersView.as_view(), name="get_users"),
        path('create-post/', CreatePostView.as_view(), name='create_post'),
        path('fetch-posts/', GetPostsView.as_view(), name="get_posts"),
        path('fetch-feed/', GetFeedView.as_view(), name="get-feed"),
        path('musician/<uuid:user_id>/', MusicianDetailView.as_view(), name='musician-detail'),
        path('change-password/', ChangePasswordView.as_view(), name="change-password"),
        path('user/<str:username>/', UserByUsernameView.as_view(), name='get-user-by-username'),
        path('follower/<uuid:user_id>/', FollowingView.as_view(), name='follow-count'),
        path('instruments/', InstrumentListView.as_view(), name='instrument-list'),
        path('genres/', GenreListView.as_view(), name='genre-list'),
        path('instruments/all/', get_instruments, name="get-instruments"),
        path('genres/all/', get_genres, name="get-genres"),
        path('users/all/', get_users, name="get-users"),
        path('musicians/all/', get_musicians, name="get-musicians"),
        path('businesses/all/', get_businesses, name="get-businesses"),
        path('add-instrument/', create_instrument, name="add-instrument"),
        path('add-genre/', create_genre, name="add-genre"),
        path('follow-list/<uuid:user_id>/', FollowListView.as_view(), name='follow-list'),
    ])),
]