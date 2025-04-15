from rest_framework import serializers
from pages.models import Musician, MusicianInstrument, Genre


# Serializer class for the intermediate model between musicians and instruments
class MusicianInstrumentSerializer(serializers.ModelSerializer):
    instrument_name = serializers.CharField(source="instrument.instrument", read_only=True)

    class Meta:
        model = MusicianInstrument
        fields = ['instrument', 'instrument_name', 'years_played']


# Serializer class for musicians
class MusicianSerializer(serializers.ModelSerializer):
    instruments = MusicianInstrumentSerializer(source="musicianinstrument_set", many=True, read_only=True)
    genres = serializers.StringRelatedField(many=True)

    class Meta:
        model = Musician
        fields = ['user', 'stage_name', 'home_studio', 'genres', 'instruments']

    def create(self, validated_data):
        instruments_data = validated_data.pop('instruments')
        musician = Musician.objects.create(**validated_data)

        # Create MusicianInstrument entries
        for instrument_data in instruments_data:
            MusicianInstrument.objects.create(
                musician=musician,
                instrument=instrument_data['instrument'],
                years_played=instrument_data['years_played']
            )

        return musician