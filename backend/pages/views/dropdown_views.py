from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from pages.serializers import InstrumentSerializer, GenreSerializer
from pages.models import Instrument, Genre

@api_view(['GET'])
def get_instruments(request):
    instruments = Instrument.objects.all()
    serializer = InstrumentSerializer(instruments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_genres(request):
    genres = Genre.objects.all()
    serializer = GenreSerializer(genres, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)