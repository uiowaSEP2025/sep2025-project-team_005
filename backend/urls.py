from django.contrib import admin
from django.urls import path, include
from pages.views import CreatePostView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("pages.authentication.urls", namespace="authentication")),
    path('create/', CreatePostView.as_view(), name='create_post'),
]
