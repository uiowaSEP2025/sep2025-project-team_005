from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from pages.serializers.listing_serializers import JobListingSerializer
from pages.models import User, Business, JobListing, Instrument, Genre
from pages.serializers.user_serializers import UserSerializer

class CreateJobListingView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_id = request.data.get("user_id")
            user = User.objects.get(id=user_id)
            business = Business.objects.get(user=user)

            # Extract scalar fields
            event_title = request.data.get("event_title")
            venue = request.data.get("venue")
            payment_type = request.data.get("payment_type")
            payment_amount = request.data.get("payment_amount")
            gig_type = request.data.get("gig_type")
            event_description = request.data.get("event_description")
            experience_level = request.data.get("experience_level")
            start_date = request.data.get("start_date")
            end_date = request.data.get("end_date")
            start_time = request.data.get("start_time")
            end_time = request.data.get("end_time")
            recurring_pattern = request.data.get("recurring_pattern")

            # Create job listing object
            job = JobListing.objects.create(
                business=business,
                event_title=event_title,
                venue=venue,
                payment_type=payment_type,
                payment_amount=payment_amount,
                gig_type=gig_type,
                event_description=event_description,
                experience_level=experience_level,
                start_date=start_date,
                end_date=end_date,
                start_time=start_time,
                end_time=end_time,
                recurring_pattern=recurring_pattern
            )

            # Handle many-to-many relationships
            instrument_ids = request.data.get("instruments", [])
            genre_ids = request.data.get("genres", [])
            job.instruments.set(Instrument.objects.filter(id__in=instrument_ids))
            job.genres.set(Genre.objects.filter(id__in=genre_ids))

            return Response({"message": "Job listing created successfully!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetJobListingsView(APIView, PageNumberPagination):
    authentication_classes = [JWTAuthentication]
    page_size = 6

    def get(self, request):
        user_id = request.GET.get("user_id")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            business = Business.objects.get(user=user)
        except Business.DoesNotExist:
            return Response({"error": "Business profile not found"}, status=status.HTTP_404_NOT_FOUND)

        job_listings = JobListing.objects.filter(business=business).order_by("-created_at")

        paginated_jobs = self.paginate_queryset(job_listings, request)

        serialized_jobs = JobListingSerializer(paginated_jobs, many=True).data
        return self.get_paginated_response(serialized_jobs)

class GetAllJobListingsView(APIView, PageNumberPagination):
    authentication_classes = [JWTAuthentication]
    page_size = 6

    def get(self, request):
        job_listings = JobListing.objects.all().order_by("-created_at")

        paginated_jobs = self.paginate_queryset(job_listings, request)

        serialized_jobs = JobListingSerializer(paginated_jobs, many=True).data
        return self.get_paginated_response(serialized_jobs)
    
class GetJobListingView(APIView):
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        listing_id = request.GET.get("listing_id")

        try:
            job_listing = JobListing.objects.get(id=listing_id)
        except JobListing.DoesNotExist:
            return Response({"error": "Job listing not found"}, status=status.HTTP_404_NOT_FOUND)

        serialized_jobs = JobListingSerializer(job_listing)
        return Response(serialized_jobs.data, status=status.HTTP_200_OK)
    
class GetUserFromBusinessView(APIView):
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, business_id):
        try:
            business = Business.objects.get(id=business_id)
            user = business.user
            serialize_user = UserSerializer(user)
        except Business.DoesNotExist:
            return Response({"error": "Business not found"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serialize_user.data, status=status.HTTP_200_OK)