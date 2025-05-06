from rest_framework import serializers
from pages.models import JobListing, Genre, Instrument, Business

class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = ["id", "instrument"]

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "genre"]
        
class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ["id", "business_name"]

class JobListingSerializer(serializers.ModelSerializer):
    instruments = InstrumentSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    business = BusinessSerializer()
    
    class Meta:
        model = JobListing
        fields = [
            "id", "event_title", "venue", "payment_type", "payment_amount", "gig_type",
            "event_description", "experience_level", "instruments",
            "genres", "start_date", "start_time", "end_time",
            "recurring_pattern", "end_date", "business"
        ]