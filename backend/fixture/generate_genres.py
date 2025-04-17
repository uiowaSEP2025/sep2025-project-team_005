# backend/fixtures/generage_genres.py
import uuid
import json

# Define the genres data
genres = [
    { "genre": "Pop" },
    { "genre": "Rock" },
    { "genre": "Jazz" },
    { "genre": "Classical" },
    { "genre": "Hip Hop" },
    { "genre": "R&B" },
    { "genre": "Country" },
    { "genre": "Blues" },
    { "genre": "Electronic" },
    { "genre": "Reggae" },
    { "genre": "Folk" },
    { "genre": "Metal" },
    { "genre": "Punk" },
    { "genre": "Indie" },
    { "genre": "Soul" },
    { "genre": "Latin" },
    { "genre": "Disco" },
    { "genre": "Funk" },
    { "genre": "Alternative" },
    { "genre": "Dance" },
    { "genre": "Gospel" },
    { "genre": "World" },
    { "genre": "Bluegrass" },
    { "genre": "Ska" },
    { "genre": "Techno" },
    { "genre": "House" },
    { "genre": "Ambient" },
    { "genre": "Trance" },
    { "genre": "New Age" },
    { "genre": "K-pop" },
    { "genre": "Reggaeton" },
    { "genre": "Synthwave" },
    { "genre": "Post-rock" },
    { "genre": "Emo" },
    { "genre": "Hardcore" },
    { "genre": "Grunge" },
    { "genre": "Shoegaze" },
    { "genre": "Progressive Rock" },
    { "genre": "Industrial" },
    { "genre": "Trap" },
    { "genre": "Dubstep" },
    { "genre": "Folk Rock" },
    { "genre": "Experimental" },
    { "genre": "Alternative Hip Hop" },
    { "genre": "Krautrock" },
    { "genre": "Gothic" },
    { "genre": "Indie Pop" },
    { "genre": "Nu Metal" },
    { "genre": "Jazz Fusion" },
    { "genre": "Acoustic" },
    { "genre": "Tech House" },
    { "genre": "Lofi Hip Hop" }
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