content = document.getElementById("content");

for (var i = 0; i < data.length; i++) {
    content.innerHTML += "<div class='string'>" + data[i] + "</div>";
}