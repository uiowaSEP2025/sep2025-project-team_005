from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.models import Musician, User, Genre, Instrument
from pages.serializers.musician_serializers import MusicianSerializer

class MusicianDetailView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            musician = Musician.objects.get(user=user)
            serializer = MusicianSerializer(musician)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Musician.DoesNotExist:
            return Response({"error": "Musician profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            musician = Musician.objects.get(user=user)

            # Update the user data
            user.first_name = request.data.get("first_name", user.first_name)
            user.last_name = request.data.get("last_name", user.last_name)
            user.username = request.data.get("username", user.username)
            user.email = request.data.get("email", user.email)
            user.phone = request.data.get("phone", user.phone)
            user.save()

            # Update musician data
            musician.instruments.clear()
            musician.genres.clear()

            instruments = request.data.get("instruments", [])
            genres = request.data.get("genre", [])

            for instrument_id in instruments:
                instrument = Instrument.objects.get(id=instrument_id)
                musician.instruments.add(instrument)

            for genre_id in genres:
                genre = Genre.objects.get(id=genre_id)
                musician.genres.add(genre)

            musician.save()

            return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Musician.DoesNotExist:
            return Response({"error": "Musician profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Instrument.DoesNotExist:
            return Response({"error": "Instrument not found"}, status=status.HTTP_404_NOT_FOUND)
        except Genre.DoesNotExist:
            return Response({"error": "Genre not found"}, status=status.HTTP_404_NOT_FOUND)
