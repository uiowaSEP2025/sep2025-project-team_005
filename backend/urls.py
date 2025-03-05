from django.contrib import admin
from django.urls import path, include
from pages.views.discover_views import GetUsersView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("pages.authentication.urls", namespace="authentication")),
    path("create/", GetUsersView.as_view(), name="get_users"),
]
