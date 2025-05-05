from rest_framework import serializers
from pages.models import JobApplication

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'alt_email',
            'file_keys', 'status'
        ]
