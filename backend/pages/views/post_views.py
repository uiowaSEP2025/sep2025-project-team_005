from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.utils.s3_utils import upload_to_s3
from pages.forms import PostForm
from pages.models import Post
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class CreatePostView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            form = PostForm(request.data, request.FILES)
            
            if form.is_valid():
                # Get the cleaned file and caption data
                file = form.cleaned_data['file']
                # Call the function to upload the file to S3
                s3_url, file_key = upload_to_s3(file, request.user.id)
                # Create the Post instance and save it
                post = form.save(commit=False)
                post.owner = request.user
                post.s3_url = s3_url
                post.file_key = file_key
                post.file_type = file.content_type
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

        posts = Post.objects.filter(owner__username=username).distinct().order_by("created_at")
        
        paginated_posts = self.paginate_queryset(posts, request)

        return self.get_paginated_response([post.caption for post in paginated_posts])