from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from decimal import Decimal


class User(AbstractBaseUser):
    objects = BaseUserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'

    name = models.CharField('Name', max_length=150)
    email = models.EmailField("Email", unique=True)
    balance = models.DecimalField(
        default=Decimal(5000),
        **settings.MONEY_FIELD_ARGS
    )
