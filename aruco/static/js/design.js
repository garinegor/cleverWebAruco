//ПОтом убрать

function expand() {
  butt = document.getElementById("new-aruco");
  butt.style.width = "200px";
  butt.style.height = "235px";
  butt.style.bottom = "125px";
  butt.style.backgroundImage = "none";
  butt.style.backgroundColor = "#009541";
  butt.style.fontSize = "1.5em";
  butt.style.cursor = "default";
  document.getElementById("hidden").style.display = "block";
  document.getElementById("aruco-plus").onclick = not_expand;
  document.getElementById("aruco-plus").style.transform = "rotate(45deg)";
  setTimeout(hide_pic, 300);
}

function hide_pic() {
  document.getElementById("aruco-pic").style.width = "40px";
  document.getElementById("aruco-pic").style.height = "40px";
  document.getElementById("aruco-pic2").style.width = "40px";
  document.getElementById("aruco-pic2").style.height = "40px";
  document.getElementById("aruco-pic3").style.width = "40px";
  document.getElementById("aruco-pic3").style.height = "40px";
}

function not_expand() {
  butt = document.getElementById("new-aruco");
  butt.style.cursor = "pointer";
  butt.style.width = "60px";
  butt.style.bottom = "50px";
  butt.style.height = "60px";
  butt.style.backgroundColor = "#009541";
  butt.style.fontSize = "0";
  document.getElementById("aruco-pic").style.width = "0px";
  document.getElementById("aruco-pic").style.height = "0px";
  document.getElementById("aruco-pic2").style.width = "0px";
  document.getElementById("aruco-pic2").style.height = "0px";
  document.getElementById("aruco-pic3").style.width = "0px";
  document.getElementById("aruco-pic3").style.height = "0px";
  document.getElementById("hidden").style.display = "none";
  document.getElementById("aruco-plus").style.transform = "rotate(0deg)";
  document.getElementById("aruco-plus").onclick = expand;
}

function display_info() {
  document.getElementById("aruco-info").style.top = "20px";
  hide_info_group();
}

function hide_info() {
  document.getElementById("aruco-info").style.top = "-800px";
}

function display_info_group() {
  document.getElementById("multi-aruco-info").style.top = "20px";
  hide_info();
}

function hide_info_group() {
  document.getElementById("multi-aruco-info").style.top = "-800px";
}

function showArucoSendContent() {
    var content = document.getElementById("aruco-send-content");
    content.style.backgroundColor = "#2D6A70";
    content.style.right = "150px";
    document.getElementById("aruco-send").onclick = hideArucoSendContent;
    setTimeout(function() {
        var content = document.getElementById("aruco-send-content");
        content.style.width = "180px";
    }, 250);
}

function hideArucoSendContent() {
    var content = document.getElementById("aruco-send-content");
    content.style.backgroundColor = "#2D6A70";
    content.style.right = "50px";
    content.style.width = "60px";
    document.getElementById("aruco-send").onclick = showArucoSendContent;
}

