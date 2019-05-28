from django.shortcuts import render
from os import listdir

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

    if path == None or path.find(".") == -1:
        return return_folder(request)
    elif get_type(path) == "image":
        return return_image(request)


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
        print(home_path)

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
    data["image_path"] = "file://" + (home_path + path).replace('\\', "/")
    print(data["image_path"])
    return render(request, "imageViewer.html", data)


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
