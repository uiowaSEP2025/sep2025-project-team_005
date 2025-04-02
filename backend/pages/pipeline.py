# File for custom Google login redirect pipeline
# Since we are using a custom user model, social-auth was having trouble automatically creating a user if
# the email the user is trying to login with is not yet in the database. Need to make this custom pipeline to
# then redirect the user to our sign up page

from django.shortcuts import redirect
from django.contrib.auth import get_user_model

def redirect_to_signup_if_new(strategy, details, backend, user=None, *args, **kwargs):
    """
    If the user does not exist yet, redirect them to the signup page.
    Otherwise, continue with the login process.
    """


    # DEBUGGIN:
    print("In custom redirect pipeline")


    User = get_user_model()
    email = details.get('email')

    if email and not User.objects.filter(email=email).exists():
        print("User with email ", email, " does not exist yet.")
        return strategy.redirect('http://127.0.0.1:8000/api/auth/signup/')
    
    return {}  # Continue the pipeline
