from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from pages.serializers.user_serializers import UserSerializer
from pages.serializers.musician_serializers import MusicianSerializer, MusicianInstrumentSerializer
from pages.serializers.instrument_serializers import InstrumentSerializer
from pages.serializers.genre_serializers import GenreSerializer
from pages.serializers.business_serializers import BusinessSerializer
from pages.models import User, Musician, Instrument, MusicianInstrument, Genre, Business


# API endpoint to get all all users
@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# API endpoint to get all musicians
@api_view(['GET'])
def get_musicians(request):
    musicians = Musician.objects.all()  # Fetch all musicians from the database
    serializer = MusicianSerializer(musicians, many=True)  # Serialize the queryset
    return Response(serializer.data, status=status.HTTP_200_OK)


# API endpoint to get all instruments
@api_view(['GET'])
def get_instruments(request):
    instruments = Instrument.objects.all()  # Retrieve all instruments
    serializer = InstrumentSerializer(instruments, many=True)  # Serialize the list of instruments
    return Response(serializer.data, status=status.HTTP_200_OK)


# API endpoint to create instrument in database
@api_view(['POST'])
def create_instrument(request):
    serializer = InstrumentSerializer(data=request.data)

    if serializer.is_valid():
        instrument = serializer.save()
        return Response(
            {"message": "Instrument created successfully", "id": instrument.id},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# API endpoint to get all musician instruments
@api_view(['GET'])
def get_musician_instruments(request):
    musician_instruments = MusicianInstrument.objects.all() # Retrieve all musician-instruments
    serializer = MusicianInstrumentSerializer(musician_instruments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# API endpoint to get all genres
@api_view(['GET'])
def get_genres(request):
    genres = Genre.objects.all()  # Retrieve all genres
    serializer = GenreSerializer(genres, many=True)  # Serialize the list of genres
    return Response(serializer.data, status=status.HTTP_200_OK)


# API endpoint to create a genre in the database
@api_view(['POST'])
def create_genre(request):
    serializer = GenreSerializer(data=request.data)

    if serializer.is_valid():
        genre = serializer.save()
        return Response(
            {"message": "Genre created successfully", "id": genre.id},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# API endpoint to get all businesses
@api_view(["GET"])
def get_businesses(request):
    businesses = Business.objects.all() # Fetch all businesses from the database
    serializer = BusinessSerializer(businesses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)