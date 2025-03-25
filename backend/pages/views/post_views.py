from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.forms import PostForm
from pages.utils.s3_utils import upload_to_s3
from pages.models import Post, Instrument, Genre, MusicianInstrument, User, Musician
from rest_framework import serializers
from rest_framework.decorators import api_view
from pages.authentication.views import MusicianInstrumentSerializer, MusicianSerializer

class CreatePostView(APIView):
    def post(self, request):
        try:
            form = PostForm(request.data, request.FILES)  # Use request.data instead of request.POST for DRF
            
            if form.is_valid():
                # Get the cleaned file and caption data
                file = form.cleaned_data['file']
                caption = form.cleaned_data['caption']

                # Call the function to upload the file to S3
                s3_url, file_key = upload_to_s3(file, request.user.id)

                # Create the Post instance and save it
                post = form.save(commit=False)
                post.owner = request.user
                post.s3_url = s3_url
                post.file_key = file_key
                post.file_type = file.content_type
                post.save()
                form.save_m2m()

                return Response({"message": "Post created successfully!", "post_id": post.id}, status=status.HTTP_201_CREATED)
            
            return Response({"error": "Invalid form data", "details": form.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# Serializer for instruments
class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = ['id', 'instrument', 'class_name']


# Serializer for genres
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'genre'] 


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


# API endpoint to get all instruments
@api_view(['GET'])
def get_instruments(request):
    instruments = Instrument.objects.all()  # Retrieve all instruments
    serializer = InstrumentSerializer(instruments, many=True)  # Serialize the list of instruments
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


# API endpoint to get all genres
@api_view(['GET'])
def get_genres(request):
    genres = Genre.objects.all()  # Retrieve all genres
    serializer = GenreSerializer(genres, many=True)  # Serialize the list of genres
    return Response(serializer.data, status=status.HTTP_200_OK)

# API endpoint to get all musician instruments
@api_view(['GET'])
def get_musician_instruments(request):
    musician_instruments = MusicianInstrument.objects.all() # Retrieve all musician-instruments
    serializer = MusicianInstrumentSerializer(musician_instruments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Serializer for users
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'rating', 'created_at']


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