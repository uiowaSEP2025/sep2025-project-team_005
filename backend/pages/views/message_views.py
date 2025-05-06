from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.serializers import MessageSerializer, UserSerializer
from pages.utils.s3_utils import upload_to_s3
from pages.forms import MessageForm
from pages.models import Message, User
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q, Count

class CreateMessageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            form = MessageForm(request.data, request.FILES)
            
            if form.is_valid():
                file_keys = []
                file_types = []
                for file in form.cleaned_data['files']:
                    file_keys.append(upload_to_s3(file, request.user.id))
                    file_types.append(file.content_type)
                message = form.save(commit=False)
                message.owner = request.user
                message.file_keys = file_keys
                message.file_types = file_types
                message.save()
                form.save_m2m()
                return Response({
                    "message": "Message created successfully!",
                    "message_object": MessageSerializer(message).data
                }, status=status.HTTP_201_CREATED)            
            return Response({"error": "Invalid form data", "details": form.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetMessagesView(APIView, PageNumberPagination):
    page_size = 30

    def get(self, request):
        user_id = request.GET.get("user_id")
        converser_id = request.GET.get("converser_id")
        print(converser_id)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            other_user = User.objects.get(id=converser_id)
        except User.DoesNotExist:
            return Response({"error": "Other user not found"}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(
            Q(sender=user, receiver=other_user) |
            Q(sender=other_user, receiver=user)
        ).order_by('-created_at')

        paginated_messages = self.paginate_queryset(messages, request)

        serialized_messages = MessageSerializer(paginated_messages, many=True, context={'auth_user': user}).data
        return self.get_paginated_response(serialized_messages)
    
class GetActiveConversationsView(APIView, PageNumberPagination):
    page_size = 6

    def get(self, request):
        user_id = request.GET.get("user_id")
        search_query = request.GET.get("search", "").strip()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        conversation_users = User.objects.filter(
            Q(sent_messages__receiver=user) | Q(received_messages__sender=user)
        ).exclude(id=user.id).distinct().order_by('-created_at')

        if search_query:
            conversation_users = conversation_users.filter(username__icontains=search_query)

        paginated_users = self.paginate_queryset(conversation_users, request)

        serialized_users = UserSerializer(paginated_users, many=True, context={'auth_user': user}).data
        return self.get_paginated_response(serialized_users)
