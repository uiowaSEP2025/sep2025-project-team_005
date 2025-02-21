from behave import given, when, then
from selenium import webdriver

@given('I am on the Savvy Note landing page')
def step_impl(context):
    context.browser.get(context.base_url)  # Use dynamic URL

@given('I have not logged into a Savvy Note account')
def step_impl(context):
    assert "Login" in context.browser.page_source

@when('I click the Login button')
def step_impl(context):
    login_button = context.browser.find_element("id", "loginButton")
    login_button.click()

@then('I am redirected to the login page')
def step_impl(context):
    assert context.browser.current_url.endswith("/login")  # Ensure redirection to login page



@given('I have not created a Savvy Note account')
def step_impl(context):
    assert "Get Started" in context.browser.page_source

@when('I click the Get Started button')
def step_impl(context):
    get_started_button = context.browser.find_element("id", "signupButton")
    get_started_button.click()

@then('I am redirected to the signup page')
def step_impl(context):
    assert context.browser.current_url.endswith("/signup")  # Check redirection to signup page