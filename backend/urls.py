from django.contrib import admin
from django.urls import path, include
from pages.views.settings_views import MusicianDetailView
from pages.views.discover_views import GetUsersView, InstrumentListView, GenreListView
from pages.views.post_views import CreatePostView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("pages.authentication.urls", namespace="authentication")),
    path("discover/", GetUsersView.as_view(), name="get_users"),
    path('create/', CreatePostView.as_view(), name='create_post'),
    path('musician/<uuid:user_id>/', MusicianDetailView.as_view(), name='musician-detail'),
    path('instruments/', InstrumentListView.as_view(), name='instrument-list'),
    path('genres/', GenreListView.as_view(), name='genre-list'),
]
