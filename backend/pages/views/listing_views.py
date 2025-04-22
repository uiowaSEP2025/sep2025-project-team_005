from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from pages.serializers.listing_serializers import JobListingSerializer
from pages.models import User, Business

class CreateJobListingView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, ):
        try:
            user_id = request.data.get("user_id")
            user = User.objects.get(id=user_id)
            business = Business.objects.get(user=user)
            serializer = JobListingSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(business=business)
                return Response({"message": "Job listing created successfully!"}, status=status.HTTP_201_CREATED)
            
            return Response({"error": "Invalid listing data", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
