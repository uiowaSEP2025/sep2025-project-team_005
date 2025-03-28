from rest_framework import serializers
from pages.models import Instrument

# Serializer for instruments
class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = ['id', 'instrument', 'class_name']