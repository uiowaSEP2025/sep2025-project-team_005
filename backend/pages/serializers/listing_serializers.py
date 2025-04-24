from rest_framework import serializers
from pages.models import JobListing, Genre, Instrument

class JobListingSerializer(serializers.ModelSerializer):
    instruments = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Instrument.objects.all()
    )
    genres = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Genre.objects.all()
    )
    
    class Meta:
        model = JobListing
        fields = [
            "event_title", "venue", "payment_type", "payment_amount", "gig_type",
            "event_description", "experience_level", "instruments",
            "genres", "start_date", "start_time", "end_time",
            "recurring_pattern", "end_date"
        ]