from rest_framework.views import APIView
from rest_framework.response import Response
from pages.models import User
from django.core.paginator import Paginator
from rest_framework.pagination import PageNumberPagination

class GetUsersView(APIView, PageNumberPagination):
    page_size = 5

    def get(self, request):
        search_query = request.GET.get("search", "").strip()
        page = request.GET.get("page", 1)

        users = User.objects.all()

        if search_query:
            users = users.filter(username__icontains=search_query)

        paginated_users = self.paginate_queryset(users, request)
        return self.get_paginated_response([user.username for user in paginated_users])
