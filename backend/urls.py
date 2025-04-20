from django.contrib import admin
from django.urls import path, include
from pages.views.discover_views import GetUsersView, InstrumentListView, GenreListView, UserByUsernameView
from pages.views.settings_views import MusicianDetailView, ChangePasswordView, BusinessDetailView
from pages.views.follow_views import FollowingView, FollowListView, FollowToggleView, IsFollowingView
from pages.views.post_views import *
from pages.views.blocked_views import BlockUserView, BlockedListView
from pages.views.dropdown_views import get_instruments, get_genres
from django.http import JsonResponse

# For debugging:
def home(request):
    return JsonResponse({"message": "Django API is running!"})

urlpatterns = [
    path("", home),
    path('admin/', admin.site.urls),
    path('api/', include([
        path('auth/', include("pages.authentication.urls", namespace="authentication")),
        path('stripe/', include("pages.stripe.urls", namespace="stripe")),
        path('discover/', GetUsersView.as_view(), name="get_users"),
        path('post/', include([
            path('create/', CreatePostView.as_view(), name='create_post'),
            path('fetch/', GetPostsView.as_view(), name="get_posts"),
            path('like/', LikeToggleView.as_view(), name="like_post"),
            path('ban/', BanView.as_view(), name="ban"),
            path('unban/', UnbanView.as_view(), name="unban"),
            path('report/', ReportView.as_view(), name="report"),
            path('hide/', HideView.as_view(), name="hide"),
            path('unhide/', UnhideView.as_view(), name="hide"),
        ])),
        path('fetch-feed/', GetFeedView.as_view(), name="get-feed"),
        path('fetch-banned-posts/', GetBannedPostsView.as_view(), name="get-banned-posts"), 
        path('fetch-reported-posts/', GetReportedPostsView.as_view(), name="get-reported-posts"),
        path('fetch-liked-posts/', GetLikedPostsView.as_view(), name="get-liked-posts"),
        path('musician/<uuid:user_id>/', MusicianDetailView.as_view(), name='musician-detail'),
        path('business/<uuid:user_id>/', BusinessDetailView.as_view(), name='business-detail'),
        path('change-password/', ChangePasswordView.as_view(), name="change-password"),
        path('user/<str:username>/', UserByUsernameView.as_view(), name='get-user-by-username'),
        path('follower/<uuid:user_id>/', FollowingView.as_view(), name='follow-count'),
        path('instruments/', InstrumentListView.as_view(), name='instrument-list'),
        path('genres/', GenreListView.as_view(), name='genre-list'),
        path('instruments/all/', get_instruments, name="get-instruments"),
        path('genres/all/', get_genres, name="get-genres"),
        path('follow-list/<uuid:user_id>/', FollowListView.as_view(), name='follow-list'),
        path('follow/<uuid:user_id>/', FollowToggleView.as_view(), name='follow-toggle'),
        path('is-following/<uuid:user_id>/', IsFollowingView.as_view(), name='is-follow'),
        path("block/<uuid:user_id>/", BlockUserView.as_view(), name="block_user"),
        path('block-list/<uuid:user_id>/', BlockedListView.as_view(), name='block-list'),
    ])),
]