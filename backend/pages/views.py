from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .forms import PostForm
from .utils.s3_utils import upload_to_s3
from .models import Post

class CreatePostView(APIView):
    def post(self, request):
        try:
            form = PostForm(request.data, request.FILES)  # Use request.data instead of request.POST for DRF
            
            if form.is_valid():
                # Get the cleaned file and caption data
                file = form.cleaned_data['file']
                caption = form.cleaned_data['caption']

                # Call the function to upload the file to S3
                s3_url, file_key = upload_to_s3(file, request.user.id)

                # Create the Post instance and save it
                post = form.save(commit=False)
                post.owner = request.user
                post.s3_url = s3_url
                post.file_key = file_key
                post.file_type = file.content_type
                post.save()

                return Response({"message": "Post created successfully!", "post_id": post.id}, status=status.HTTP_201_CREATED)
            
            return Response({"error": "Invalid form data", "details": form.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)