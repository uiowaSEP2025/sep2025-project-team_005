# backend/fixtures/generage_genres.py
import uuid
import json

# Define the genres data
genres = [
    { "genres": "Pop" },
    { "genres": "Rock" },
    { "genres": "Jazz" },
    { "genres": "Classical" },
    { "genres": "Hip Hop" },
    { "genres": "R&B" },
    { "genres": "Country" },
    { "genres": "Blues" },
    { "genres": "Electronic" },
    { "genres": "Reggae" },
    { "genres": "Folk" },
    { "genres": "Metal" },
    { "genres": "Punk" },
    { "genres": "Indie" },
    { "genres": "Soul" },
    { "genres": "Latin" },
    { "genres": "Disco" },
    { "genres": "Funk" },
    { "genres": "Alternative" },
    { "genres": "Dance" },
    { "genres": "Gospel" },
    { "genres": "World" },
    { "genres": "Bluegrass" },
    { "genres": "Ska" },
    { "genres": "Techno" },
    { "genres": "House" },
    { "genres": "Ambient" },
    { "genres": "Trance" },
    { "genres": "New Age" },
    { "genres": "K-pop" },
    { "genres": "Reggaeton" },
    { "genres": "Synthwave" },
    { "genres": "Post-rock" },
    { "genres": "Emo" },
    { "genres": "Hardcore" },
    { "genres": "Grunge" },
    { "genres": "Shoegaze" },
    { "genres": "Progressive Rock" },
    { "genres": "Industrial" },
    { "genres": "Trap" },
    { "genres": "Dubstep" },
    { "genres": "Folk Rock" },
    { "genres": "Experimental" },
    { "genres": "Alternative Hip Hop" },
    { "genres": "Krautrock" },
    { "genres": "Gothic" },
    { "genres": "Indie Pop" },
    { "genres": "Nu Metal" },
    { "genres": "Jazz Fusion" },
    { "genres": "Acoustic" },
    { "genres": "Tech House" },
    { "genres": "Lofi Hip Hop" }
]


# Generate the appropriate fixture format
fixture = [
    {
        "model": "pages.Genre",
        "pk": str(uuid.uuid4()),
        "fields": genre
    }
    for genre in genres
]


# Write to a JSON file to be able to be loaded via command: python manage.py loaddata fixtures/genres.json
with open("genres.json", "w") as f:
    json.dump(fixture, f, indent=4)


print("JSON file 'genres.json' has been generated.")