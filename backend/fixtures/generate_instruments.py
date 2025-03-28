# backend/fixtures/generate_instruments.py
import uuid
import json


# Define the instrument data
instruments = [
    { "instrument": "Violin", "class_name": "String" },
    { "instrument": "Viola", "class_name": "String" },
    { "instrument": "Cello", "class_name": "String" },
    { "instrument": "Double Bass", "class_name": "String" },
    { "instrument": "Harp", "class_name": "String" },
    { "instrument": "Classical Guitar", "class_name": "String" },
    { "instrument": "Acoustic Guitar", "class_name": "String" },
    { "instrument": "Ukulele", "class_name": "String" },
    { "instrument": "Mandolin", "class_name": "String" },
    { "instrument": "Banjo", "class_name": "String" },
    { "instrument": "Zither", "class_name": "String" },
    { "instrument": "Dulcimer", "class_name": "String" },
    { "instrument": "Sitar", "class_name": "String" },
    { "instrument": "Sarod", "class_name": "String" },
    { "instrument": "Veena", "class_name": "String" },
    { "instrument": "Erhu", "class_name": "String" },
    { "instrument": "Koto", "class_name": "String" },
    { "instrument": "Guzheng", "class_name": "String" },
    { "instrument": "Pipa", "class_name": "String" },
    { "instrument": "Lute", "class_name": "String" },
    { "instrument": "Balalaika", "class_name": "String" },
    { "instrument": "Bouzouki", "class_name": "String" },
    { "instrument": "Rebab", "class_name": "String" },
    { "instrument": "Hardanger Fiddle", "class_name": "String" },
    { "instrument": "Nyckelharpa", "class_name": "String" },
    { "instrument": "Hurdy Gurdy", "class_name": "String" },
    { "instrument": "Tar", "class_name": "String" },
    { "instrument": "Domra", "class_name": "String" },
    { "instrument": "Cavaquinho", "class_name": "String" },
    { "instrument": "Flute", "class_name": "Woodwind" },
    { "instrument": "Piccolo", "class_name": "Woodwind" },
    { "instrument": "Clarinet", "class_name": "Woodwind" },
    { "instrument": "Bass Clarinet", "class_name": "Woodwind" },
    { "instrument": "Oboe", "class_name": "Woodwind" },
    { "instrument": "English Horn", "class_name": "Woodwind" },
    { "instrument": "Bassoon", "class_name": "Woodwind" },
    { "instrument": "Contrabassoon", "class_name": "Woodwind" },
    { "instrument": "Alto Saxophone", "class_name": "Woodwind" },
    { "instrument": "Tenor Saxophone", "class_name": "Woodwind" },
    { "instrument": "Baritone Saxophone", "class_name": "Woodwind" },
    { "instrument": "Soprano Saxophone", "class_name": "Woodwind" },
    { "instrument": "Recorder", "class_name": "Woodwind" },
    { "instrument": "Bass Recorder", "class_name": "Woodwind" },
    { "instrument": "Pan Flute", "class_name": "Woodwind" },
    { "instrument": "Harmonica", "class_name": "Woodwind" },
    { "instrument": "Bagpipes", "class_name": "Woodwind" },
    { "instrument": "Shakuhachi", "class_name": "Woodwind" },
    { "instrument": "Didgeridoo", "class_name": "Woodwind" },
    { "instrument": "Melodica", "class_name": "Woodwind" },
    { "instrument": "Bass Flute", "class_name": "Woodwind" },
    { "instrument": "Contrabass Clarinet", "class_name": "Woodwind" },
    { "instrument": "Bass Oboe", "class_name": "Woodwind" },
    { "instrument": "Dizi", "class_name": "Woodwind" },
    { "instrument": "Bansuri", "class_name": "Woodwind" },
    { "instrument": "Kaval", "class_name": "Woodwind" },
    { "instrument": "Ocarina", "class_name": "Woodwind" },
    { "instrument": "Trumpet", "class_name": "Brass" },
    { "instrument": "Cornet", "class_name": "Brass" },
    { "instrument": "Flugelhorn", "class_name": "Brass" },
    { "instrument": "French Horn", "class_name": "Brass" },
    { "instrument": "Mellophone", "class_name": "Brass" },
    { "instrument": "Trombone", "class_name": "Brass" },
    { "instrument": "Bass Trombone", "class_name": "Brass" },
    { "instrument": "Tenor Trombone", "class_name": "Brass" },
    { "instrument": "Baritone Horn", "class_name": "Brass" },
    { "instrument": "Euphonium", "class_name": "Brass" },
    { "instrument": "Tuba", "class_name": "Brass" },
    { "instrument": "Sousaphone", "class_name": "Brass" },
    { "instrument": "Wagner Tuba", "class_name": "Brass" },
    { "instrument": "Cimbasso", "class_name": "Brass" },
    { "instrument": "Bugle", "class_name": "Brass" },
    { "instrument": "Alto Horn", "class_name": "Brass" },
    { "instrument": "Snare Drum", "class_name": "Percussion" },
    { "instrument": "Bass Drum", "class_name": "Percussion" },
    { "instrument": "Tom-Toms", "class_name": "Percussion" },
    { "instrument": "Cymbals", "class_name": "Percussion" },
    { "instrument": "Hi-Hat", "class_name": "Percussion" },
    { "instrument": "Triangle", "class_name": "Percussion" },
    { "instrument": "Tambourine", "class_name": "Percussion" },
    { "instrument": "Maracas", "class_name": "Percussion" },
    { "instrument": "Glockenspiel", "class_name": "Percussion" },
    { "instrument": "Xylophone", "class_name": "Percussion" },
    { "instrument": "Vibraphone", "class_name": "Percussion" },
    { "instrument": "Marimba", "class_name": "Percussion" },
    { "instrument": "Timpani", "class_name": "Percussion" },
    { "instrument": "Cajón", "class_name": "Percussion" },
    { "instrument": "Bongos", "class_name": "Percussion" },
    { "instrument": "Congas", "class_name": "Percussion" },
    { "instrument": "Djembe", "class_name": "Percussion" },
    { "instrument": "Claves", "class_name": "Percussion" },
    { "instrument": "Castanets", "class_name": "Percussion" },
    { "instrument": "Agogo Bells", "class_name": "Percussion" },
    { "instrument": "Piano", "class_name": "Keyboard" },
    { "instrument": "Grand Piano", "class_name": "Keyboard" },
    { "instrument": "Upright Piano", "class_name": "Keyboard" },
    { "instrument": "Electric Piano", "class_name": "Keyboard" },
    { "instrument": "Organ", "class_name": "Keyboard" },
    { "instrument": "Pipe Organ", "class_name": "Keyboard" },
    { "instrument": "Harmonium", "class_name": "Keyboard" },
    { "instrument": "Harpsichord", "class_name": "Keyboard" },
    { "instrument": "Celesta", "class_name": "Keyboard" },
    { "instrument": "Keytar", "class_name": "Keyboard" },
    { "instrument": "Clavichord", "class_name": "Keyboard" },
    { "instrument": "Theremin", "class_name": "Electronic" },
    { "instrument": "Synthesizer", "class_name": "Electronic" },
    { "instrument": "Drum Machine", "class_name": "Electronic" },
    { "instrument": "Electric Guitar", "class_name": "Electronic" },
    { "instrument": "Bass Guitar", "class_name": "Electronic" },
    { "instrument": "Turntable", "class_name": "Electronic" },
    { "instrument": "Sampler", "class_name": "Electronic" },
    { "instrument": "Digital Piano", "class_name": "Electronic" },
    { "instrument": "Electronic Drum Kit", "class_name": "Electronic" },
    { "instrument": "Modular Synthesizer", "class_name": "Electronic" },
    { "instrument": "MIDI Controller", "class_name": "Electronic" },
    { "instrument": "EWI (Electronic Wind Instrument)", "class_name": "Electronic" }
]
 

# Generate the fixture format
fixture = [
    {
        "model": "pages.Instrument",  # Replace with your actual Django app name
        "pk": str(uuid.uuid4()),  # Generate a unique UUID for each entry
        "fields": instrument
    }
    for instrument in instruments
]

 

# Write to a JSON file
with open("instruments.json", "w") as f:
    json.dump(fixture, f, indent=4)


print("JSON file 'instruments.json' has been generated.")