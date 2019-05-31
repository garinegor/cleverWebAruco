function saveFile() {
    var req = new XMLHttpRequest();
    req.open('GET', 'save?path=' + path + '&content=' + document.getElementById("area").innerText, false);
    console.log(req);
    req.send(null);
    if (req.status == 200) {

    }
}