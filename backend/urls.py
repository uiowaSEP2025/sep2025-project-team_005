from django.contrib import admin
from django.urls import path, include
from pages.views.post_views import CreatePostView
from pages.views.settings_views import MusicianDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("pages.authentication.urls", namespace="authentication")),
    path('create/', CreatePostView.as_view(), name='create_post'),
    path('musician/<uuid:user_id>/', MusicianDetailView.as_view(), name='musician-detail'),
]
