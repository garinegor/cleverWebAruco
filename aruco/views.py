import re
import os
from json import loads

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt


PATH_TO_LAUNCH = "path_to_launch"
PATH_TO_FOLDER = "/Users/garinegorgmail.com/desktop/map"


def home(request):
    return render(request, "aruco/index.html")


@csrf_exempt
def save_map(request):
    if request.method == 'POST':
        data = request.POST
        filename = data["filename"].split(".")[0] + ".txt"
        map_json = loads(data["map"])
        try:
            path_to_file = PATH_TO_FOLDER + "/" + filename
            with open(path_to_file, "w") as f:
                for line in map_json:
                    f.write(line + "\n")
            message = "Saved."
        except:
            return HttpResponseBadRequest()
    else:
        message = "Error."
    return HttpResponse(message)


@csrf_exempt
def validate_filename(request):
    if request.method == 'POST':
        data = request.POST
        is_valid = re.match("^[a-zA-Z0-9]+(.txt)?$", data["filename"])
        filename = data["filename"].split(".")[0] + ".txt"

        if is_valid and filename not in os.listdir(PATH_TO_FOLDER):
            message = "Filename is valid"
        else:
            return HttpResponseBadRequest()

    else:
        message = "Error."

    return HttpResponse(message)
