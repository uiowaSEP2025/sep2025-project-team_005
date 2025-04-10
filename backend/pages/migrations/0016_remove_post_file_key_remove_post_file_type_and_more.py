# Generated by Django 5.1.7 on 2025-04-10 06:33

import django.contrib.postgres.fields
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0015_remove_post_likes_comment_like_comment'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='file_key',
        ),
        migrations.RemoveField(
            model_name='post',
            name='file_type',
        ),
        migrations.AddField(
            model_name='post',
            name='file_keys',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=255, validators=[django.core.validators.MaxLengthValidator(255)]), default=list, size=10, verbose_name='S3 file keys'),
        ),
        migrations.AddField(
            model_name='post',
            name='file_types',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=50, validators=[django.core.validators.MaxLengthValidator(50)]), default=list, size=10, verbose_name='File types'),
        ),
    ]
