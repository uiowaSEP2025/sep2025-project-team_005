from rest_framework import serializers
from pages.models import JobApplication, User, Experience


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['job_title', 'company_name', 'start_date', 'end_date', 'description']

        
class JobApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer()
    experiences = ExperienceSerializer(many=True, read_only=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'applicant', 'first_name', 'last_name', 'phone', 'alt_email',
            'file_keys', 'status', 'experiences'
        ]