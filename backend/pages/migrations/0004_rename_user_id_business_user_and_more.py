# Generated by Django 4.2.5 on 2025-02-27 00:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0003_alter_business_industry_alter_instrument_class_name_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='business',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='musician',
            old_name='user_id',
            new_name='user',
        ),
    ]
