import boto3
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from botocore.exceptions import NoCredentialsError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import textwrap
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.pagination import PageNumberPagination
from pages.utils.s3_utils import upload_to_s3, generate_s3_url
from pages.models import JobListing, JobApplication, Experience
from pages.serializers.application_serializers import JobApplicationSerializer
from pages.serializers.experience_serializers import ExperienceSerializer
import logging
import tempfile
from pages.utils.resume_utils import parse_resume

logger = logging.getLogger(__name__)


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
    
class ApplicationsForListingView(APIView, PageNumberPagination):
    permission_classes = [IsAuthenticated]
    page_size = 3

    def get(self, request, listing_id):
        applications = JobApplication.objects.filter(listing__id=listing_id)
        paginated_applications = self.paginate_queryset(applications, request)
        serializer = JobApplicationSerializer(paginated_applications, many=True)

        # Replace file_keys with signed URLs
        data_with_urls = []
        for app_data in serializer.data:
            file_keys = app_data.get("file_keys", [])
            signed_urls = [generate_s3_url(key, 'application/pdf') for key in file_keys]
            app_data["file_urls"] = signed_urls  # Add new key
            app_data.pop("file_keys", None)      # Optional: remove file_keys
            data_with_urls.append(app_data)

        return self.get_paginated_response(data_with_urls)
        
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
            logger.exception("Resume autofill failed")
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
            
            job_app.status = "Submitted"
            job_app.save()

            return Response({"message": "Experiences submitted successfully."}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class PatchApplication(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, app_id):
        application = get_object_or_404(JobApplication, id=app_id)

        new_status = request.data.get('status')
        if not new_status:
            return Response({'detail': 'Missing status field'}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save()
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SendAcceptanceEmail(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        app_id = request.data.get("application_id")
        email = request.data.get("app_email")

        if not app_id:
            return Response({"error": "Application ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            application = JobApplication.objects.select_related('applicant').get(id=app_id)
            listing = application.listing
            business = listing.business

            subject = f"{listing.event_title} - Application Accepted"
            message = f"Congratulations {application.first_name},\n\nYour application for {listing.event_title} has been accepted!"
            html_message = textwrap.dedent(f"""
                <p>Congratulations {application.first_name},</p>
                <p>Your application for <strong>{listing.event_title}</strong> has been <strong>accepted</strong>!</p>
                <p>The employer may contact you soon with more details.</p>
                <p>Best,<br> {business.business_name}</p>
            """)

            send_mail(
                subject=subject,
                message=message,
                html_message=html_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
            )

            return Response({"message": "Acceptance email sent successfully."}, status=status.HTTP_200_OK)

        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        
class SendRejectionEmail(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        app_id = request.data.get("application_id")
        email = request.data.get("app_email")

        if not app_id:
            return Response({"error": "Application ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            application = JobApplication.objects.select_related('applicant').get(id=app_id)
            listing = application.listing
            business = listing.business

            subject = f"{listing.event_title} - Application Update"
            message = f"Dear {application.first_name},\n\nThank you for applying for {listing.event_title}. After careful consideration, we regret to inform you that you were not selected for the position.\n\nWe appreciate your interest and wish you the best in your future musical endeavors.\n\nBest regards,\nSavvyNote Team"
            html_message = f"""
                <p>Dear {application.first_name},</p>
                <p>Thank you for applying for <strong>{listing.event_title}</strong>. After careful consideration, we regret to inform you that you were not selected for the position.</p>
                <p>We appreciate your interest and wish you the best in your future musical endeavors.</p>
                <p>Best regards,<br> {business.business_name}</p>
            """

            send_mail(
                subject=subject,
                message=message,
                html_message=html_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
            )
            print(email)

            return Response({"message": "Rejection email sent successfully."}, status=status.HTTP_200_OK)

        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        
class UserApplicationsView(APIView, PageNumberPagination):
    permission_classes = [IsAuthenticated]
    page_size = 3

    def get(self, request, *args, **kwargs):
        user = request.user
        applications = JobApplication.objects.filter(applicant=user)

        paginated_applications = self.paginate_queryset(applications, request)
        
        # Serialize data
        serializer = JobApplicationSerializer(paginated_applications, many=True)
        print(serializer.data)
        
        return self.get_paginated_response(serializer.data)