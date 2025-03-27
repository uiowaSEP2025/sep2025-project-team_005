from django.contrib import admin
from django.urls import path, include
from pages.views.discover_views import GetUsersView, InstrumentListView, GenreListView, UserByUsernameView
from pages.views.settings_views import MusicianDetailView, ChangePasswordView
from pages.views.follow_views import FollowingView
from pages.views.post_views import CreatePostView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('auth/', include("pages.authentication.urls", namespace="authentication")),
        path('discover/', GetUsersView.as_view(), name="get_users"),
        path('create/', CreatePostView.as_view(), name='create_post'),
        path('musician/<uuid:user_id>/', MusicianDetailView.as_view(), name='musician-detail'),
        path('instruments/', InstrumentListView.as_view(), name='instrument-list'),
        path('genres/', GenreListView.as_view(), name='genre-list'),
        path('change-password/', ChangePasswordView.as_view(), name="change-password"),
        path('user/<str:username>/', UserByUsernameView.as_view(), name='get-user-by-username'),
        path('follower/<uuid:user_id>/', FollowingView.as_view(), name='follow-count'),
    ])),
]
