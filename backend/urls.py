from django.contrib import admin
from django.urls import path, include
from pages.views import CreatePostView

from django.http import JsonResponse

# For debugging:
def home(request):
    return JsonResponse({"message": "Django API is running!"})

urlpatterns = [
    path("", home),
    path('admin/', admin.site.urls),
    path("api/auth/", include("pages.authentication.urls", namespace="authentication")),
    path('create/', CreatePostView.as_view(), name='create_post'),
]
