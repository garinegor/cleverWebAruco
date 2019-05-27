function fill(path) {
    var client = new XMLHttpRequest();
    client.open("GET", 'file?path=' + path);
    client.send();
    client.onreadystatechange = function () {
        var response = client.responseText;
        console.log(response);
    };
}

fill("");