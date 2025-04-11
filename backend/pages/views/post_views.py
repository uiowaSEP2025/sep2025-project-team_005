from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.serializers import PostSerializer, CommentSerializer
from pages.utils.s3_utils import upload_to_s3
from pages.forms import PostForm
from pages.models import Post, Comment, Like
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q, Count

class CreatePostView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            form = PostForm(request.data, request.FILES)
            
            if form.is_valid():
                file_keys = []
                file_types = []
                for file in form.cleaned_data['files']:
                    file_keys.append(upload_to_s3(file, request.user.id))
                    file_types.append(file.content_type)
                post = form.save(commit=False)
                post.owner = request.user
                post.file_keys = file_keys
                post.file_types = file_types
                post.save()
                form.save_m2m()
                return Response({"message": "Post created successfully!", "post_id": post.id}, status=status.HTTP_201_CREATED)
            
            return Response({"error": "Invalid form data", "details": form.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetPostsView(APIView, PageNumberPagination):
    page_size = 6

    def get(self, request):
        username = request.GET.get("username")

        posts = Post.objects.filter(owner__username=username).distinct().order_by("-created_at")

        paginated_posts = self.paginate_queryset(posts, request)

        serialized_posts = PostSerializer(paginated_posts, many=True).data
        return self.get_paginated_response(serialized_posts)
    
class GetFeedView(APIView, PageNumberPagination):
    page_size = 6

    def get(self, request):
        username = request.GET.get("username")

        posts = Post.objects.filter(~Q(owner__username=username)).distinct().order_by("-created_at")

        paginated_posts = self.paginate_queryset(posts, request)

        serialized_posts = PostSerializer(paginated_posts, many=True).data
        return self.get_paginated_response(serialized_posts)
    
class LikeToggleView(APIView):
    def post(self, request):
        post = request.POST.get("post")
        try:
            target_post = Post.objects.get(id=post.id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        follow_exists = Like.objects.filter(user=request.user, post=post).exists()
        if follow_exists:
            return Response({"message": "Already liked"}, status=status.HTTP_200_OK)

        Like.objects.create(user=request.user, post=post)
        return Response({"message": "Liked"}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        post = request.POST.get("post")
        try:
            target_post = Post.objects.get(id=post.id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            like = Like.objects.get(user=request.user, post=target_post)
            like.delete()
            return Response({"message": "Unliked"}, status=status.HTTP_204_NO_CONTENT)
        except like.DoesNotExist:
            return Response({"error": "This post is already not liked"}, status=status.HTTP_400_BAD_REQUEST)