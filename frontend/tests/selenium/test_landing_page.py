import os
import shutil
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Path to the user data directory
user_data_dir = "/home/mmiller152/chrome_user_data"

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
driver.get("http://localhost:3000")

# Allow small delay for page to load
time.sleep(2)

# Verify that we see our welcome message
expected_message = 'Connect, Collaborate, and Get Paid'
actual_message = driver.find_element(By.TAG_NAME, "h1").text
assert expected_message in actual_message, f"Expected '{expected_message}', got '{actual_message}'"

# If the above test passes, then the code will get to this line and print the following
print(f"Test passed: found expected welcome message '{actual_message}'")

# Verify that the 5 elements you can click on are present
#assert driver.find_element(By.CLASS_NAME, "primaryButton")

driver.quit()