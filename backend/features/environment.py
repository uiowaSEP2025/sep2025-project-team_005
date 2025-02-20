import os
import django
from selenium import webdriver

def before_all(context):
    context.base_url = os.getenv("SAVVY_NOTE_URL", "http://localhost:3000")
    context.browser = webdriver.Chrome()

def after_all(context):
    context.browser.quit()  # Close the browser after all tests
    
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
django.setup()
