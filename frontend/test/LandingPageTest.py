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


env = environ.Env()
env.read_env(os.path.join(os.path.dirname(__file__), "../.env"))

# Path to the user data directory
user_data_dir = env("SELENIUM_USER_DIR")

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

# Open the landing page of the application
driver.get(f"{env("FRONTEND_API")}")

# Wait for the elements to load (wait up to 10 seconds for elements to be visible)
WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.TAG_NAME, "h1"))
)

# Verify that we see our welcome message
expected_message = 'Connect, Collaborate, and Contract'
actual_message = driver.find_element(By.TAG_NAME, "h1").text
assert expected_message in actual_message, f"Expected '{expected_message}', got '{actual_message}'"

# If the above test passes, then the code will get to this line and print the following
print(f"Test 1 passed: found expected welcome message '{actual_message}'")

# Verify that the 5 elements you can click on are present
# First check login button, waiting up to 10 seconds
login_button = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.XPATH, "//a[contains(@class, 'primaryButton')]"))
)
assert login_button.text == "Login", "Login button text is incorrect or not found!"
print("Test 2 passed: found login button")

# Next check for the sign up button ("Get Started"), waiting up to 10 seconds
signup_button = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.XPATH, "//a[contains(@class, 'secondaryButton')]"))
)
assert signup_button.text == "Get Started", "Get Started button text is incorrect or not found!"
print("Test 2 passed: found signup button")

driver.quit()