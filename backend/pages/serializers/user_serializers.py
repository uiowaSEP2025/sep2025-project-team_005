from rest_framework import serializers
from pages.models import User, Musician, Instrument, Genre

class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = ["id", "instrument"]

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "genre"]

class MusicianSerializer(serializers.ModelSerializer):
    instruments = InstrumentSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Musician
        fields = ["instruments", "genres"]

class UserSerializer(serializers.ModelSerializer):
    musician = MusicianSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "first_name", "last_name", "musician"]
