from rest_framework import serializers
from pages.models import Genre

# Serializer for genres
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'genre'] 