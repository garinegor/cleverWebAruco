from django.shortcuts import render
from django.http import JsonResponse
from os import listdir
import unicodedata
from os.path import isfile, join

home_path = "C:\\Users\\Motoy\\Desktop"


def home(request):
    data = dict()
    return render(request, "explorer.html", data)


def get_files(request):
    data = dict()
    path = request.GET.get('path')
    files = [f for f in listdir(home_path + path)]
    data["files"] = files
    return JsonResponse(data)
