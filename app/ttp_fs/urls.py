from django.urls import path, include
from user.views import home_page

urlpatterns = [
    path('', include(('user.urls', 'user'), namespace='user')),
    path('api/v1/market/', include(('market.api_urls', 'market'), namespace='market-api')),
    path('', home_page, name='home')
]
