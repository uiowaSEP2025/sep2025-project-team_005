from django.contrib import admin
from django.urls import path, include
from pages.views import CreatePostView
#from pages.views.settings_views import UserProfileView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("pages.authentication.urls", namespace="authentication")),
    path('create/', CreatePostView.as_view(), name='create_post'),
    #path('musician/', UserProfileView.as_view(), name='user_profile')
]
