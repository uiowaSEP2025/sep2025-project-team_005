from rest_framework import serializers
from pages.models import Musician

class MusicianSerializer(serializers.ModelSerializer):
    instruments = serializers.StringRelatedField(many=True)
    genres = serializers.StringRelatedField(many=True)

    class Meta:
        model = Musician
        fields = ['instruments', 'genres']