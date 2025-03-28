from rest_framework import serializers
from pages.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password


# Class for serialization of data stored in the database
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate(self, data):
        # Check if username or email already associated with a user in the database
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "An account with this email already exists."})
        # TODO SN5-81: add regex validation in backend for email. Password should be good
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        # Hash the password before saving the user
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)