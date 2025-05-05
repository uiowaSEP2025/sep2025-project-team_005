import boto3
from rest_framework.views import APIView
from botocore.exceptions import NoCredentialsError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import traceback
from pages.utils.s3_utils import upload_to_s3
from pages.models import JobListing, JobApplication
from pages.serializers.application_serializers import JobApplicationSerializer
from django.conf import settings
import uuid


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

        return Response({"message": "Application submitted successfully.", "application_id": str(application.id)}, status=status.HTTP_201_CREATED)
    
class ApplicationsForListingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, listing_id):
        applications = JobApplication.objects.filter(listing__id=listing_id)
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)