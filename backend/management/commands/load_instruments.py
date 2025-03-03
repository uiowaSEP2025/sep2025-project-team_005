import os
import django
import json

# Set up Django settings and the environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  # Updated path
django.setup()

from backend.pages.models import Instrument  # Import your model after setting up Django

# Your script logic for loading instruments into the database
with open('backend/fixtures/instruments.json', 'r') as file:
    instruments = json.load(file)

for instrument_data in instruments:
    instrument_name = instrument_data.get('instrument')
    class_name = instrument_data.get('class_name')

    # Create instrument objects if they don't exist already
    if not Instrument.objects.filter(instrument=instrument_name).exists():
        Instrument.objects.create(
            instrument=instrument_name,
            class_name=class_name
        )
        print(f"Created instrument: {instrument_name}")
    else:
        print(f"Instrument {instrument_name} already exists.")
