document.getElementById("magnetTogglerContainer").onmouseover = function() {
  document.getElementById("magnetTogglerContainer").style.backgroundColor = "#02a676";
  document.getElementById("magnetToggler").style.backgroundColor = "#02a676";
  document.getElementById("magnetTogglerContainer").style.cursor = "pointer";
};

document.getElementById("magnetTogglerContainer").onmouseleave = function() {
  document.getElementById("magnetTogglerContainer").style.backgroundColor = "#EEEEEE";
  document.getElementById("magnetToggler").style.backgroundColor = "#EEEEEE";
  document.getElementById("magnetTogglerContainer").style.cursor = "default";
};

window.addEventListener('click', function(e) {
  if (document.getElementById('context-menu').contains(e.target) || document.getElementById('magnet-context-menu').contains(e.target)) {
    // Clicked in right click box
  } else {
    hide_context_menu();
  }
});

if (document.addEventListener) {
  document.getElementById("aruco-field-container").addEventListener('contextmenu', function(e) {
    show_context_menu(e);
    e.preventDefault();
  }, false);
}

function toggleMaget() {
  document.getElementById("magnet-context-menu").style.top = (rightClick.clientY + 30).toString() + "px";
  document.getElementById("magnet-context-menu").style.left = (rightClick.clientX + 220).toString() + "px";
  document.getElementById("magnet-context-menu").style.width = "auto";
  document.getElementById("magnet-context-menu").style.height = "auto";
  document.getElementById("magnet-context-menu").addEventListener('mouseleave', function() {
    hide_magnet_context_menu();
  });
}

function context_menu(x, y) {
  menu = document.getElementById("context-menu");
  menu.style.top = y;
  menu.style.left = x;
  menu.style.width = "230px";
  menu.style.height = "auto";
}

function hide_context_menu() {
  //e.clientX, e.clientY
  menu = document.getElementById("context-menu");
  menu.style.top = "100%";
  menu.style.left = "100%";
  menu.style.width = "0px";
  menu.style.height = "0px";
}

function show_context_menu(e) {
  menu = document.getElementById("context-menu");
  rightClick = e;
  context_menu((e.clientX - 10).toString() + "px", (e.clientY - 10).toString() + "px");
  /*menu.addEventListener('mouseleave', function() {
    hide_context_menu();
  });*/
}

function hide_magnet_context_menu() {
  document.getElementById("magnet-context-menu").style.top = "100%";
  document.getElementById("magnet-context-menu").style.left = "100%";
  document.getElementById("magnet-context-menu").style.width = "0";
  document.getElementById("magnet-context-menu").style.height = "0";
}
