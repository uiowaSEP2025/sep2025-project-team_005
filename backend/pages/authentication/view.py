# backend/authentication/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view
from pages.models.User import User
from pages.models.Musician import Musician
from pages.models.Instrument import Instrument
from pages.models.MusicianInstrument import MusicianInstrument
from pages.models.Genre import Genre
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        })
        
        
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({
            "access": access_token,
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            }
        })
        response.set_cookie(
            "access_token", access_token, secure=True, samesite="Lax"
        )
        response.set_cookie(
            "refresh_token", str(refresh), secure=True, samesite="Lax"
)
        return response
        
        
class LogoutView(APIView):
    def post(self, request):
        try:
            response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")
            return response
        except Exception as e:
            return Response({"error": "An error occurred while logging out", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        
# Class for serialization of user data stored in the database
class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate(self, data):
        # Check if username or email already associated with a user in the database
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "An account with this email already exists."})
        return data

    def create(self, validated_data):
        # Hash the password before saving the user
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)
    
# API endpoint for user signup requests
@api_view(['POST'])
def signup(request):

    print("Received sign up request: ", request.data)

    logger.debug("Received sign up request with data: %s", request.data)

    user_serializer = UserSignupSerializer(data=request.data)

    if user_serializer.is_valid():
        # Save the User instance (the user object is now fully created)
        user = user_serializer.save()

        # Automatically create a musician profile if the role is "musician"
        if request.data.get("role") == "musician":
            # Create Musician instance without genres field for now
            musician_data = {
                "user": user,  # Associate with the User instance
                "stage_name": request.data.get("stage_name", ""),
                "years_played": request.data.get("years_played", None),
                "home_studio": request.data.get("home_studio", False),
            }

            # Save the Musician instance first
            musician = Musician.objects.create(**musician_data)

            # Handle instruments by creating MusicianInstrument entries
            instruments_data = request.data.get("instruments", [])  # Expecting list of instrument IDs
            for instrument_data in instruments_data:
                instrument_id = instrument_data.get("id")  # Extract instrument ID
                years_played = instrument_data.get("years_played")  # Extract years_played


                print("ID: ", instrument_id, " Years: ", years_played)


                if instrument_id and years_played is not None:
                    try:
                        instrument = Instrument.objects.get(id=instrument_id)  # Get the instrument object
                        MusicianInstrument.objects.create(
                            musician=musician,
                            instrument=instrument,
                            years_played=years_played
                        )
                    except Instrument.DoesNotExist:
                        return Response({"error": "Instrument not found."}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Instrument ID and years played are required."}, status=status.HTTP_400_BAD_REQUEST)

            # Now set genres after Musician instance is created
            genres_data = request.data.get("genres", [])
            if genres_data:
                # Extract ids from the data
                genre_ids = [genre.get("id") for genre in genres_data if genre.get("id")]
                musician.genres.set(genre_ids)  # Use set() to assign ManyToMany field

            return Response({"message": "User and musician created successfully", "id": user.id}, status=status.HTTP_201_CREATED)

        return Response({"message": "User created successfully", "id": user.id}, status=status.HTTP_201_CREATED)

    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Serializer class for the intermediate model between musicians and instrumens
class MusicianInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MusicianInstrument
        fields = ['instrument', 'years_played']


# Serializer class for musicians
class MusicianSerializer(serializers.ModelSerializer):
    instruments = MusicianInstrumentSerializer(many=True, write_only=True)
    genres = serializers.PrimaryKeyRelatedField(many=True, queryset=Genre.objects.all())

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