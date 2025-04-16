from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.serializers import PostSerializer, CommentSerializer
from pages.utils.s3_utils import upload_to_s3
from pages.forms import PostForm
from pages.models import Post, Comment, Like, User, ReportedPost
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

        posts = Post.objects.filter(owner__username=username, is_banned=False).distinct().order_by("-created_at")

        paginated_posts = self.paginate_queryset(posts, request)

        serialized_posts = PostSerializer(paginated_posts, many=True).data
        return self.get_paginated_response(serialized_posts)
    
class GetFeedView(APIView, PageNumberPagination):
    page_size = 6

    def get(self, request):
        user_id = request.GET.get("user_id")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        posts = Post.objects.filter(
            ~Q(owner__username=user.username),
            ~Q(id__in=user.hidden_posts.values('id')),
            ~Q(id__in=user.reported_posts.values('id')),
            Q(is_banned=False)
        ).distinct().order_by("-created_at")

        paginated_posts = self.paginate_queryset(posts, request)

        serialized_posts = PostSerializer(paginated_posts, many=True).data
        return self.get_paginated_response(serialized_posts)
    
class GetReportedPostsView(APIView, PageNumberPagination):
    page_size = 6

    def get(self, request):
        post_ids = ReportedPost.objects.values_list('post_id', flat=True).distinct()
        posts = Post.objects.filter(
            id__in=post_ids,
            is_banned=False
        ).distinct().order_by("created_at")

        paginated_posts = self.paginate_queryset(posts, request)

        serialized_posts = PostSerializer(paginated_posts, many=True).data
        return self.get_paginated_response(serialized_posts)
    
class GetBannedPostsView(APIView, PageNumberPagination):
    page_size = 6

    def get(self, request):
        posts = Post.objects.filter(
            Q(is_banned=True)
        ).distinct().order_by("-created_at")

        paginated_posts = self.paginate_queryset(posts, request)

        serialized_posts = PostSerializer(paginated_posts, many=True).data
        return self.get_paginated_response(serialized_posts)
    
class LikeToggleView(APIView):
    def post(self, request):
        post_id = request.POST.get("post_id")
        try:
            target_post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        follow_exists = Like.objects.filter(user=request.user, post=target_post).exists()
        if follow_exists:
            return Response({"message": "Already liked"}, status=status.HTTP_200_OK)

        Like.objects.create(user=request.user, post=target_post)
        return Response({"message": "Liked"}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        post_id = request.POST.get("post_id")
        try:
            target_post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            like = Like.objects.get(user=request.user, post=target_post)
            like.delete()
            return Response({"message": "Unliked"}, status=status.HTTP_200_OK)
        except Like.DoesNotExist:
            return Response({"error": "This post is not liked"}, status=status.HTTP_400_BAD_REQUEST)
        
class HideView(APIView):
    def post(self, request):
        post_id = request.data.get("post_id")
        user_id = request.data.get("user_id")
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found, refresh the page"}, status=status.HTTP_404_NOT_FOUND)
        try: 
            user = User.objects.get(id=user_id)
        except:
            return Response({"error": "No user detected"}, status=status.HTTP_404_NOT_FOUND)
        
        if user.hidden_posts.filter(id=post.id).exists():
            return Response({"error": "This post has already been hidden"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # TODO: add report reason
            user.hidden_posts.add(post)
            return Response({"message": "Hidden"}, status=status.HTTP_200_OK)
        except:
            return Response({"error": "Failed to hide post"}, status=status.HTTP_400_BAD_REQUEST)
        
class UnhideView(APIView):
    def delete(self, request):
        post_id = request.data.get("post_id")
        user_id = request.data.get("user_id")

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found, refresh the page"}, status=status.HTTP_404_NOT_FOUND)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "No user detected"}, status=status.HTTP_404_NOT_FOUND)

        if not user.hidden_posts.filter(id=post.id).exists():
            return Response({"error": "This post is not currently hidden"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user.hidden_posts.remove(post)
            return Response({"message": "Post unhidden"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Failed to unhide post"}, status=status.HTTP_400_BAD_REQUEST)
        
class ReportView(APIView):
    def post(self, request):
        post_id = request.data.get("post_id")
        user_id = request.data.get("user_id")
        try:
            target_post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found, refresh the page"}, status=status.HTTP_404_NOT_FOUND)
        try: 
            user = User.objects.get(id=user_id)
        except:
            user = None
        
        if (ReportedPost.objects.filter(post=target_post).exists()):
            return Response({"error": "This post has already been reported"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # TODO: add report reason
            ReportedPost.objects.create(post=target_post,user=user)
            return Response({"message": "Reported"}, status=status.HTTP_201_CREATED)
        except:
            return Response({"error": "Failed to report post"}, status=status.HTTP_400_BAD_REQUEST)
        
class BanView(APIView):
    def post(self, request):
        post_id = request.data.get("post_id")
        admin_id = request.data.get("admin_id")
        try:
            target_post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found, refresh the page"}, status=status.HTTP_404_NOT_FOUND)
        try: 
            admin = User.objects.get(id=admin_id)
        except:
            return Response({"error": "No admin detected"}, status=status.HTTP_404_NOT_FOUND)
        
        if (target_post.is_banned):
            return Response({"error": "This post is already banned"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_post.is_banned = True
            target_post.ban_admin.add(admin)
            target_post.full_clean()
            target_post.save()
            return Response({"message": "Banned"}, status=status.HTTP_200_OK)
        except:
            return Response({"error": "Failed to ban post"}, status=status.HTTP_400_BAD_REQUEST)

class UnbanView(APIView):
    def post(self, request):
        post_id = request.data.get("post_id")
        try:
            target_post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found, refresh the page"}, status=status.HTTP_404_NOT_FOUND)
        
        if not (target_post.is_banned):
            return Response({"error": "This post is already unbanned"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_post.is_banned = False
            target_post.ban_admin.clear()
            target_post.full_clean()
            target_post.save()
            return Response({"message": "Unbanned"}, status=status.HTTP_200_OK)
        except:
            return Response({"error": "Failed to ban post"}, status=status.HTTP_400_BAD_REQUEST)
