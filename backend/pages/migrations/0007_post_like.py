# Generated by Django 5.1.6 on 2025-03-04 03:49

import django.core.validators
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0006_alter_business_business_name_alter_business_industry_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('s3_url', models.URLField(max_length=255)),
                ('file_key', models.CharField(max_length=255)),
                ('file_type', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('caption', models.TextField(blank=True, validators=[django.core.validators.MaxLengthValidator(500)])),
                ('likes', models.ManyToManyField(blank=True, related_name='liked_posts', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('tagged_users', models.ManyToManyField(related_name='tagged_users', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pages.post')),
            ],
        ),
    ]