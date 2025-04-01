from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pages.models import Musician, User, Genre, Instrument, MusicianInstrument
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
            
            new_username = request.data.get("username", user.username)
            new_email = request.data.get("email", user.email)
            
            if User.objects.exclude(id=user_id).filter(username=new_username).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.exclude(id=user_id).filter(email=new_email).exists():
                return Response({"error": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)

            # Update the user data
            user.username = request.data.get("username", user.username)
            user.email = request.data.get("email", user.email)
            user.phone = request.data.get("phone", user.phone)
            user.save()

            # Update musician data
            musician.stage_name = request.data.get("stage_name", musician.stage_name)
            musician.years_played = request.data.get("years_played", musician.years_played)
            musician.home_studio = request.data.get("home_studio", musician.stage_name)
            musician.save()
            
            instruments = request.data.get("instruments", [])
            genres = request.data.get("genre", [])

            # Update instruments with years_played
            if 'instruments' in request.data:
                musician.instruments.clear()
                for instrument_data in instruments:
                    instrument_name = instrument_data.get('instrument_name')
                    years_played = instrument_data.get('years_played', 0)

                    try:
                        instrument = Instrument.objects.get(instrument=instrument_name)
                        musician_instrument, created = MusicianInstrument.objects.update_or_create(
                            musician=musician,
                            instrument=instrument,
                            defaults={'years_played': years_played}
                        )
                        if created:
                            musician.instruments.add(instrument)
                    except Instrument.DoesNotExist:
                        print(f"Instrument '{instrument_name}' not found")

            if 'genre' in request.data:
                musician.genres.clear()  # Clear existing genres

                missing_genres = []  # Track genres that were not found in the database
                for genre_name in genres:
                    try:
                        genre = Genre.objects.get(genre=genre_name)
                        musician.genres.add(genre)
                    
                    except Genre.DoesNotExist:
                        missing_genres.append(genre_name)

                # Return a response indicating which genres weren't found in the database
                if missing_genres:
                    return Response(
                        {"error": f"Genre(s) not found: {', '.join(missing_genres)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )


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

