from rest_framework import serializers
from pages.models import Experience, JobApplication

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ["id"]
        
class ExperienceSerializer(serializers.ModelSerializer):
    application = ApplicationSerializer
    class Meta:
        model = Experience
        fields = ['application', 'job_title', 'company_name', 'start_date', 'end_date', 'description']