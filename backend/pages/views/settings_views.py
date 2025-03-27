from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.models import Musician, User, Genre, Instrument
from pages.serializers.musician_serializers import MusicianSerializer
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated

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
            user.username = request.data.get("username", user.username)
            user.email = request.data.get("email", user.email)
            user.phone = request.data.get("phone", user.phone)
            user.save()

            # Update musician data
            musician.stage_name = request.data.get("stage_name", musician.stage_name)
            musician.years_played = request.data.get("years_played", musician.years_played)
            musician.home_studio = request.data.get("home_studio", musician.stage_name)
            musician.instruments.clear()
            musician.genres.clear()

            instruments = request.data.get("instruments", [])
            genres = request.data.get("genre", [])

            for instrument_name in instruments:
                try:
                    instrument = Instrument.objects.get(instrument=instrument_name)
                    musician.instruments.add(instrument)
                except Instrument.DoesNotExist:
                    print(f"Instrument '{instrument_name}' not found")

            for genre_name in genres:
                try:
                    genre = Genre.objects.get(genre=genre_name)
                    musician.genres.add(genre)
                except Genre.DoesNotExist:
                    print(f"Genre '{genre_name}' not found")

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


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("password")
        new_password = request.data.get("new_password")

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully"}, status=200)

