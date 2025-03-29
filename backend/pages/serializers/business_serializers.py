from rest_framework import serializers
from pages.models import Business

# Serializer for Businesses
class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ['id', 'user', 'business_name', 'industry']