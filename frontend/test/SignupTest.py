import os
import environ
import shutil
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# Load .env file so know where to find/store temporary selenium user data
env = environ.Env()
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.env"))

# Load .env file explicitly
if os.path.exists(env_path):
    env.read_env(env_path)
else:
    raise FileNotFoundError(f"ERROR: .env file not found at {env_path}")

# Retrieve SELENIUM_USER_DIR variable from .env
try:
    user_data_dir = os.path.abspath(os.path.join(os.path.dirname(env_path), env("SELENIUM_USER_DIR")))
except environ.ImproperlyConfigured:
    raise ValueError("ERROR: SELENIUM_USER_DIR is not set in .env!")


# Function to clear out the user data directory
def clear_user_data_dir():
    if os.path.exists(user_data_dir):
        shutil.rmtree(user_data_dir)  # Remove the directory and its contents
    os.makedirs(user_data_dir)  # Recreate an empty directory

# Clear the user data directory before starting the driver
clear_user_data_dir()

# Set up Chrome options to use the user data directory
options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument(f"user-data-dir={user_data_dir}")  # Specify the user data directory

# This will automatically download and configure the correct version of ChromeDriver
service = Service(ChromeDriverManager().install())

# Start the Chrome WebDriver
driver = webdriver.Chrome(service=service, options=options)

try:
    print("Testing initial sign up page: ")
    # Open the sign up page where you select your role
    driver.get("http://localhost:3000/signup")

    # Find and click the "Musician" role option
    musician_button = driver.find_element(By.XPATH, "//h2[text()='Musician']")
    musician_button.click()

    # Wait for the last element of the musician page to load, which is the submit button
    WebDriverWait(driver, 5).until(
       EC.presence_of_element_located((By.CSS_SELECTOR, "button[class*='submitButton']"))
    )

    # Check that the page has successfully rerouted
    assert driver.current_url == "http://localhost:3000/signup/musician"

    # If the above test passes, then we will reach this print statement:
    print("Test 1 passed: clicking on musician role reroutes to the appropriate page")

    # Go back to the selection page, wait for the featureText element of the page to load
    driver.back()
    WebDriverWait(driver, 5).until(
       EC.presence_of_element_located((By.CSS_SELECTOR, "p[class*='featureText']"))
    )

    # Repeat but with business role selection
    business_button = driver.find_element(By.XPATH, "//h2[text()='Business']")
    business_button.click()

    WebDriverWait(driver, 5).until(
       EC.presence_of_element_located((By.CSS_SELECTOR, "button[class*='businessSubmit']"))
    )

    assert driver.current_url == "http://localhost:3000/signup/business"
    print("Test 2 passed: clicking on business role reroutes to the appropriate page")

    # Now need to test each signup page: business and musician
    # Start with business since we are already there if the above assertion passes
    print("Testing business signup page: ")

    #

    # First, check
finally:
    # Ensure browser closes after tests run
    driver.quit()