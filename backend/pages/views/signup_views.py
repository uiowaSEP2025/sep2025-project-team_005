from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from pages.models import Musician, Instrument, MusicianInstrument, Business
from pages.serializers import UserSignupSerializer


# API endpoint for signup requests (handles both musicians and business account)
@api_view(['POST'])
def signup(request):

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
            instruments_data = request.data.get("instruments", [])
            for instrument_data in instruments_data:
                instrument_id = instrument_data.get("id")  # Extract instrument ID
                years_played = instrument_data.get("years_played")  # Extract years_played

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
                    # Print to the terminal to indicate no join objects will be made
                    print("There are no instruments to create musician instruments with")

            # Set genres after Musician instance is created
            genres_data = request.data.get("genres", [])
            if genres_data:
                # Extract ids from the data
                genre_ids = [genre.get("id") for genre in genres_data if genre.get("id")]
                musician.genres.set(genre_ids)  # Use set() to assign ManyToMany field

            return Response({"message": "User and musician created successfully", "id": user.id}, status=status.HTTP_201_CREATED)

        # If not a musician, check if the role is business
        elif request.data.get("role") == "business":
            # Create Business instance
            business_data = {
                "user": user,  # Associate the business with the User instance
                "business_name": request.data.get("business_name", ""),
                "industry": request.data.get("industry", "")
            }

            # Create and save business in the database
            business = Business.objects.create(**business_data)

            # Debugging:
            print("Created business: ", business)

            return Response({"message": "User and business created successfully", "id": user.id}, status=status.HTTP_201_CREATED)

    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)