from django.urls import path
from . import api_views

urlpatterns = [
    path('action', api_views.action, name='action'),
    path('transactions', api_views.transactions, name='transactions'),
    path('symbols', api_views.symbols, name='symbols'),
    path('symbols/search/<str:term>', api_views.symbol_search, name='symbol-search')
]
