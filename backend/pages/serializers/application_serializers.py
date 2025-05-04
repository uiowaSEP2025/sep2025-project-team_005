from rest_framework import serializers
from pages.models import JobApplication, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        
class JobApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer()
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'applicant', 'first_name', 'last_name', 'phone', 'alt_email',
            'file_keys', 'status'
        ]
