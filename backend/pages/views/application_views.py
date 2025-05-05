import boto3
from rest_framework.views import APIView
from botocore.exceptions import NoCredentialsError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import traceback
from pages.utils.s3_utils import upload_to_s3
from pages.models import JobListing, JobApplication, Experience
from pages.serializers.application_serializers import JobApplicationSerializer
from pages.serializers.experience_serializers import ExperienceSerializer

from django.conf import settings
import tempfile
from pages.utils.resume_utils import parse_resume


class CreateApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        print(request.data)

        # Extract data
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        alt_email = request.data.get("alt_email")
        phone = request.data.get("phone")
        status_val = request.data.get("status", "In-Progress")
        listing_id = request.data.get("job_listing")

        if not listing_id:
            return Response({"error": "Missing job listing ID."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            listing = JobListing.objects.get(id=listing_id)
        except JobListing.DoesNotExist:
            return Response({"error": "Job listing not found."}, status=status.HTTP_404_NOT_FOUND)

        # Handle resume upload
        uploaded_file = request.FILES.get('resume')
        file_keys = []

        if uploaded_file:
            if uploaded_file.content_type != 'application/pdf':
                return Response({"error": "Only PDF files are allowed."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                file_key = upload_to_s3(uploaded_file, user.id)
                file_keys.append(file_key)
            except Exception as e:
                print("Upload to S3 failed:")
                traceback.print_exc()  # This prints the full traceback
                return Response({"error": f"Failed to upload PDF: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"error": "No resume file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        print(file_keys)
        # Create Application
        application = JobApplication.objects.create(
            applicant=user,
            listing=listing,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            alt_email=alt_email,
            file_keys=file_keys,
            status=status_val
        )

        return Response({"message": "Application created", "application_id": application.id}, status=status.HTTP_201_CREATED)
    
class ApplicationsForListingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, listing_id):
        applications = JobApplication.objects.filter(listing__id=listing_id)
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    
class GetApplication(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, app_id):
        try:
            application = JobApplication.objects.get(id=app_id)
            serializer = JobApplicationSerializer(application)
            return Response(serializer.data)
        except JobApplication.DoesNotExist:
            return Response(
                {"error": "Job application not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
class AutofillResumeView(APIView):
    def post(self, request, *args, **kwargs):
        s3_file_key = request.data.get('s3_key')
        if not s3_file_key:
            return Response({'error': 'Missing s3_key'}, status=status.HTTP_400_BAD_REQUEST)

        s3 = boto3.client('s3')
        try:
            with tempfile.NamedTemporaryFile(suffix=".pdf") as temp:
                s3.download_fileobj(settings.AWS_METADATA_BUCKET_NAME, s3_file_key, temp)
                temp.flush()
                data = parse_resume(temp.name)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SubmitExperiencesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, app_id):
        try:
            job_app = JobApplication.objects.get(id=app_id, applicant=request.user)
        except JobApplication.DoesNotExist:
            return Response({"error": "Job application not found."}, status=status.HTTP_404_NOT_FOUND)

        experiences_data = request.data.get('experiences', [])
        serializer = ExperienceSerializer(data=experiences_data, many=True)
        print(serializer)

        if serializer.is_valid():
            for exp_data in serializer.validated_data:
                Experience.objects.create(application=job_app, **exp_data)
            
            # Optional: mark application as submitted
            job_app.status = "Submitted"
            job_app.save()

            return Response({"message": "Experiences submitted successfully."}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)