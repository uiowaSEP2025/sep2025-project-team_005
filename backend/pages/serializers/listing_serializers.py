from rest_framework import serializers
from pages.models import JobListing

class JobListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobListing
        fields = [
            "event_title", "venue", "payment_type", "payment_amount", "gig_type",
            "event_description", "experience_level", "instruments",
            "genres", "start_date", "start_time", "end_time",
            "recurring_pattern", "end_date"
        ]