from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('save_map', views.save_map, name='save map'),
    path('validate_filename', views.validate_filename, name='save map')
]