from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('file', views.get_files)
]