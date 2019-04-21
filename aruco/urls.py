from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('save_map', views.save_map, name='save map'),
    path('validate_filename', views.validate_filename, name='validate filename'),
    path('load_file', views.load_file, name='get file content')
]