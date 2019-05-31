from django.shortcuts import render
from os import listdir
from django.http import JsonResponse


home_path = "C:\\Users\\Motoy\\Desktop"

icons = {
    "png": "image",
    "jpg": "image",
    "jpeg": "image",
    "svg": "image",
    "ico": "image",
}

image_types = ["png", "jpg", "jpeg", "svg", "ico"]


def home(request):
    data = dict()
    path = request.GET.get('path')

    try:
        if path == None or path.find(".") == -1:
            return return_folder(request)
        elif get_type(path) == "image":
            return return_image(request)
        else:
            return return_readable(request)
    except:
        data["url"] = home_path + path
        return render(request, "error.html", data)


def return_folder(request):
    data = dict()
    path = request.GET.get('path')

    if path == None:
        path = ""
    else:
        path = normal(path)

    file_names = [f for f in listdir(home_path + path)]
    files = []
    if path != "":
        files.append({
            "name": "Up",
            "type": "up"
        })
        data["home_path"] = path[:len(path) - len(path.split("\\")[len(path.split("\\")) - 1]) - 1]

    for i in range(0, len(file_names)):
        files.append({
            "name": file_names[i],
            "type": get_type(file_names[i])
        })
    data["files"] = files
    data["path"] = path
    return render(request, "explorer.html", data)


def return_image(request):
    data = dict()
    path = request.GET.get('path')
    data["path"] = path
    data["image_path"] = "file://" + (home_path + path).replace('\\', "/")
    return render(request, "imageViewer.html", data)


def return_readable(request):
    data = dict()
    path = request.GET.get('path')
    splited = path.split('\\')
    data["path"] = ""
    for i in splited[1: ]:
        data["path"] += '/' + i
    data["content"] = ""
    data["home_path"] = path[:len(path) - len(path.split("\\")[len(path.split("\\")) - 1]) - 1]
    with open(home_path + path) as f:
        data["content"] = f.read()
    return render(request, "fileViewer.html", data)


def normal(path):
    try:
        while path[len(path) - 1] == '\\':
            try:
                path = path[:len(path) - 1]
            except:
                break
    except:
        pass
    return path


def get_type(file):
    if file.find(".") == -1:
        return "folder"
    else:
        try:
            return icons[file.split(".")[len(file.split(".")) - 1].lower()]
        except:
            return "hz"


def save_file(request):
    path = request.GET.get("path")
    content = str(request.GET.get("content"))
    with open(home_path + '\\' + path, 'w') as f:
        f.write(content)
    return JsonResponse(dict())
