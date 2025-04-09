import os
import django
import tempfile
import shutil
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service 

def before_all(context):
    context.base_url = os.getenv("SAVVY_NOTE_URL", "http://localhost:3000")
    
    chrome_options = Options()
    chrome_options.headless = True
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    context.temp_dir = tempfile.mkdtemp()
    chrome_options.add_argument(f"--user-data-dir={context.temp_dir}")

    chrome_binary = os.getenv("CHROMIUM_BROWSER_PATH", "/usr/bin/chromium-browser")
    chrome_driver = os.getenv("CHROME_DRIVER_PATH", "/usr/bin/chromedriver")
    if not chrome_binary or not chrome_driver:
         raise Exception("CHROMIUM_BROWSER_PATH and CHROME_DRIVER_PATH environment variables must be set")

    chrome_options.binary_location = chrome_binary
    service = Service(chrome_driver)
    
    try:
        context.browser = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        shutil.rmtree(context.temp_dir)
        raise e

def after_all(context):
    if hasattr(context, "browser"):
        context.browser.quit()
    if hasattr(context, "temp_dir"):
        shutil.rmtree(context.temp_dir)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
django.setup()
