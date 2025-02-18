import io
import sys
from contextlib import redirect_stdout
from behave import given, when, then

@given("I do not already have an account")
def step_given_no_account(context):
    context.output = io.StringIO()
    with redirect_stdout(context.output):
        print("Hello World!")  # Simulating the printed message

@then('I should see Hello World')
def step_then_check_printed_message(context):
    output = context.output.getvalue().strip()  # Get captured output
    assert output == "Hello World!", f"Expected 'Hello World!' but got '{output}'"