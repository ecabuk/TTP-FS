from django.urls import path
from . import views

urlpatterns = [
    path('login', views.user_login, name='login'),
    path('register', views.user_registration, name='registration'),
    path('logout', views.user_logout, name='logout'),
    path('user/home', views.user_home, name='home'),
    path('user/portfolio', views.portfolio, name='portfolio'),
    path('user/transactions', views.transactions, name='transactions'),
]
