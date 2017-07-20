# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-07-20 16:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20170613_1851'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transaction',
            name='required_witnesses',
        ),
        migrations.AlterField(
            model_name='paymentdata',
            name='kind',
            field=models.CharField(choices=[('btc', 'Bitcoin'), ('csh', 'Cash'), ('cdt', 'Credit Card'), ('dbt', 'Debit Card'), ('gnc', 'Other')], default='gnc', max_length=3),
        ),
    ]