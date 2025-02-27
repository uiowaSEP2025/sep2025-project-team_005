# Generated by Django 4.2.5 on 2025-02-27 02:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0004_rename_user_id_business_user_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='business',
            name='industry',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='instrument',
            name='class_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='musician',
            name='stage_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='musician',
            name='years_played',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
