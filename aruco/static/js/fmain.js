function fill(path) {
    var client = new XMLHttpRequest();
    client.open("GET", 'file?path=' + path);
    client.send();
    client.onreadystatechange = function () {
        var response = client.responseText;
        var files = JSON.parse(response).files;
        //console.log(files);
        for (var i = 0; i < files.length; i++) {
            if (!files[i].includes('.'))
                addElement(files[i], "sidebar");
        }
    };
}

fill("");

function addElement(element, id) {
    var el = "<div class='file_elem'>" + element + "<img src='/static/images/angle-right.png' alt=''></div>";
    document.getElementById(id).innerHTML += el;
}