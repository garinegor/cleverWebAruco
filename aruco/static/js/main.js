// variables
var rightClick;

// Grid variables
var gridWidth = 0;
var gridCreated = false;

// Magnet variables
var magnetEnabled = true;
var forceMagnetEnabled = true; // Chtobi pri povorote ne meshalo
var pxMagnetThreshold = 10; // Pixels
var degreeMagnetThreshold = 10; // Degrees
var resizeMarkerThreshold = 10; // Pixels
var magnetPreference = {
  "center": true,
  "right-top": false,
  "right-bottom": false,
  "left-top": false,
  "left-bottom": false,
  "rotate": true,
  "resize": false
};
var is_scaling = false;
var scaling_points = {};

// one marker properties panel variables
var idField = document.getElementById("inputID");
var markerSide = document.getElementById("markerSide");
var angle = document.getElementById("inputAngle");
var shiftX = document.getElementById("inputX");
var shiftY = document.getElementById("inputY");
var shiftZ = document.getElementById("inputZ");
var zeroCheck = document.getElementById("zerocheck");

// multiple marker properties panel variables
var selectionWidth = document.getElementById("multiMarkerWidth");
var selectionHeight = document.getElementById("multiMarkerHeight");
var selectionX = document.getElementById("multiInputX");
var selectionY = document.getElementById("multiInputY");

var fileContent;

// create canvas and field
var c = document.getElementById('c');

c.width = $("#aruco-field-container").width();
c.height = $("#aruco-field-container").height();

var canvas = new fabric.Canvas('c');
canvas.uniScaleKey = "null";

// Create white field for arucos
var pxFieldWidth = 1000;
var pxFieldHeight;

var mmFieldWidth = 1000;
var mmFieldHeight = 500;

var pxPerMm = pxFieldWidth / mmFieldWidth;

pxFieldHeight = mmFieldHeight * pxPerMm;

var rect = new fabric.Rect({
  left: 0,
  top: 0,
  originX: 'left',
  originY: 'top',
  width: pxFieldWidth,
  height: pxFieldHeight,
  fill: 'white',
  hasBorders: false,
  selectable: false,

});

rect.scaleToHeight(canvas.height);
rect.setCoords();

canvas.add(rect);

// calculations
function getHeight(object) {
  var coords = object.aCoords;
  var tg = object.height / object.width;
  var hypo = Math.sqrt((coords.bl.y - coords.tr.y) ** 2 + (coords.bl.x - coords.tr.x) ** 2);
  return Math.sin(Math.atan(tg)) * hypo;
}

function getWidth(object) {
  var coords = object.aCoords;
  var tg = object.height / object.width;
  var hypo = Math.sqrt((coords.bl.y - coords.tr.y) ** 2 + (coords.bl.x - coords.tr.x) ** 2);
  return Math.cos(Math.atan(tg)) * hypo;
}

function getPxValue(mmValue) {
  return mmValue * getHeight(rect) / mmFieldHeight;
}

function getMmValue(pxValue) {
  return Math.round(pxValue * mmFieldHeight / getHeight(rect));
}

function calculateScaleFactor(object, targetMm) {
  var targetPx = getPxValue(targetMm);
  return targetPx / object.height;
}

function getBlCoordinates(object) {
  var objectPoints = object.getPointByOrigin("left", "bottom");
  return {x: objectPoints.x, y: getHeight(rect) - objectPoints.y};
}

function setBlCoordinates(object, x, y) {
  object.setPositionByOrigin({x: x, y: getHeight(rect) - y}, "left", "bottom");
  canvas.requestRenderAll();
}

// three creation modes
function createOneMarker() {
  // create on marker
  Ply.dialog("prompt", {
    title: "Введите параметры маркера",
    form: {
      id: {
        hint: "ID маркера",
        type: "number"
      },
      side: {
        hint: "Сторона маркера",
        type: "number"
      }
    },
    ok: 'Создать',
    cancel: 'Отмена'
  }).done(function(ui) {
    var markerId = ui.data.id;
    var mmMarkerSide = ui.data.side;
    addMarkerObject(markerId, mmMarkerSide, 0, getPxValue(mmFieldHeight - mmMarkerSide));
  });
}

function createMultipleMarkers() {
  // create multiple markers
  Ply.dialog("prompt", {
    title: "Введите параметры поля",
    form: {
      firstMarkerId: {
        hint: "ID первого маркера",
        type: "number"
      },
      markerSide: {
        hint: "Сторона маркера",
        type: "number"
      },
      mmSep: {
        hint: "Расстояние между маркерами",
        type: "number"
      },
      xQuan: {
        hint: "Количество маркеров по X",
        type: "number"
      },
      yQuan: {
        hint: "Количество маркеров по Y",
        type: "number"
      }
    },
    ok: 'Создать',
    cancel: 'Отмена'
  }).done(function(ui) {
    var firstMarkerId = parseInt(ui.data.firstMarkerId);
    var mmMarkerSide = parseInt(ui.data.markerSide);
    var xQuan = parseInt(ui.data.xQuan);
    var yQuan = parseInt(ui.data.yQuan);
    var mmSep = parseInt(ui.data.mmSep);

    for (var i = 0; i < yQuan; i++) {
      for (var j = 0; j < xQuan; j++) {
        addMarkerObject(firstMarkerId + i * xQuan + j, mmMarkerSide, getPxValue(j * (mmMarkerSide + mmSep)), getPxValue(i * (mmMarkerSide + mmSep)));
      }
    }
  });
}

function createGrid() {
  hide_context_menu();
  Ply.dialog("prompt", {
    title: "Введите размеры секи",
    form: {
      cell: {
        hint: "Ширина, мм",
        type: "number"
      }
    },
    ok: 'Создать',
    cancel: 'Отмена'
  }).done(function(ui) {
    not_expand();
    addGridObject(ui.data.cell);
  });
}

// generate and append marker object to the canvas
function addMarkerObject(markerId, mmMarkerSide, left, top) {
  not_expand();

  var marker;

  marker = generateArucoMarker(4, 4, "4x4_1000", markerId);

  var scale = calculateScaleFactor(marker, mmMarkerSide);

  marker.set({
    id: markerId,
    side: mmMarkerSide,
    left: left,
    top: top,
    scaleX: scale,
    scaleY: scale,
    z: 0,
    main: false
  });

  canvas.add(marker);

  return marker;
}

function generateMarkerObject(width, height, bits) {
  var marker = [];

  // Background rect
  var backRect = new fabric.Rect({
    left: 0,
    top: 0,
    originX: 'left',
    originY: 'top',
    width: width + 2,
    height: height + 2,
    fill: 'black'
  });
  marker.push(backRect);

  // "Pixels"
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      var color = bits[i * height + j] ? 'white' : 'black';
      var pixel = new fabric.Rect({
        left: j + 1,
        top: i + 1,
        originX: 'left',
        originY: 'top',
        width: 1,
        height: 1,
        fill: color,
        hasBorders: false
      });
      marker.push(pixel);
    }
  }
  // generate group object
  var group = new fabric.Group(marker, {
    width: width + 2,
    height: height + 2,
    originX: 'left',
    originY: 'top',
    transparentCorners: false,
    lockScalingFlip: true
  }).setCoords().setControlsVisibility({
    'ml': false,
    'mt': false,
    'mr': false,
    'mb': false
  });

  return group;
}

function generateArucoMarker(width, height, dictName, id) {
  console.log('Generate ArUco marker ' + dictName + ' ' + id);

  var bytes = dict[dictName][id];
  var bits = [];
  var bitsCount = width * height;

  // Parse marker's bytes
  for (var byte of bytes) {
    var start = bitsCount - bits.length;
    for (var i = Math.min(7, start - 1); i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  return generateMarkerObject(width, height, bits);
}

// generate and append grid to the canvas
function addGridObject(step) {
  gridWidth = parseInt(step);
  gridCreated = true;
  // Delete grid if it already exists (maybe ask user if he sure)
  for (var i = 0; i < canvas._objects.length; i++) {
    if (canvas._objects[i].name == "grid") {
      canvas.remove(canvas._objects[i]);
    }
  }

  // Generate grid object
  var grid = generateGridObject(step);
  grid.selectable = false;
  grid.name = "grid";

  // add grid object to the canvas and put it under all other objects
  canvas.add(grid);
  canvas.moveTo(grid, 1);

  document.getElementById("gridToggler").innerHTML = "Скрыть сетку";
}

function generateGridObject(step) {
  var grid = [];

  step = getPxValue(step);

  // vertical lines generation
  for (var i = 0; i < getPxValue(mmFieldWidth) / step + 1; i++) {
    if (i * step < getPxValue(mmFieldWidth)) {
      var line = new fabric.Line([i * step, 0, i * step, getPxValue(mmFieldHeight)]);
      line.stroke = "purple";
      grid.push(line);
    }
  }

  // horizontal lines generation
  for (var i = getPxValue(mmFieldHeight) / step; i >= 0; i--) {
    if (i * step < getPxValue(mmFieldHeight)) {
      var line = new fabric.Line([0, i * step, getPxValue(mmFieldWidth), i * step]);
      line.stroke = "purple";
      grid.push(line);
    }
  }

  // return grid object
  return new fabric.Group(grid);
}

// toggle grid
function toggleGrid() {
  hide_context_menu();
  if (gridCreated) {
    for (var i = 0; i < canvas._objects.length; i++) {
      if (canvas._objects[i].name == "grid") {
        canvas.remove(canvas._objects[i]);
      }
    }
    gridCreated = false;
    document.getElementById("gridToggler").innerHTML = "Показать сетку";
  } else if (gridWidth != 0) {
    addGridObject(gridWidth);
  }
}

// magnet
function magnetize(op) {
  forceMagnetEnabled = magnetEnabled;
  if (gridCreated && magnetEnabled && forceMagnetEnabled) {
    var diagonal = Math.sqrt(Math.pow(op.target.width * op.target.scaleX, 2) + Math.pow(op.target.height * op.target.scaleY, 2));
    var marker_points = [{ //center
        x: op.target.left + (diagonal * Math.cos(Math.PI / 180 * (op.target.angle) + Math.asin(op.target.height * op.target.scaleY / diagonal))) / 2,
        y: op.target.top + (diagonal * Math.sin(Math.PI / 180 * (op.target.angle) + Math.acos(op.target.width * op.target.scaleX / diagonal))) / 2
      },
      { // bottom right
        x: op.target.left + (diagonal * Math.cos(Math.PI / 180 * (op.target.angle) + Math.asin(op.target.height * op.target.scaleY / diagonal))),
        y: op.target.top + (diagonal * Math.sin(Math.PI / 180 * (op.target.angle) + Math.acos(op.target.width * op.target.scaleX / diagonal)))
      },
      { // top left
        x: op.target.left,
        y: op.target.top
      },
      { // top right
        x: op.target.left + (op.target.width * op.target.scaleX * Math.cos(Math.PI / 180 * op.target.angle)),
        y: op.target.top + (op.target.width * op.target.scaleX * Math.sin(Math.PI / 180 * op.target.angle))
      },
      { //bottom left
        x: op.target.left - (op.target.height * op.target.scaleY * Math.cos(Math.PI / 180 * (90 - op.target.angle))),
        y: op.target.top + (op.target.height * op.target.scaleY * Math.sin(Math.PI / 180 * (90 - op.target.angle)))
      }
    ];

    // console.log(marker_points);

    for (var i = 0; i < getPxValue(mmFieldWidth); i += getPxValue(gridWidth)) {
      if (magnetPreference["center"] && marker_points[0].x < i + pxMagnetThreshold && marker_points[0].x > i - pxMagnetThreshold) {
        op.target.left = i - (marker_points[0].x - op.target.left);
        break;
      }
      if (magnetPreference["right-top"] && marker_points[3].x < i + pxMagnetThreshold && marker_points[3].x > i - pxMagnetThreshold) {
        op.target.left = i - (marker_points[3].x - op.target.left);
        break;
      }
      if (magnetPreference["right-bottom"] && marker_points[1].x < i + pxMagnetThreshold && marker_points[1].x > i - pxMagnetThreshold) {
        op.target.left = i - (marker_points[1].x - op.target.left);
        break;
      }
      if (magnetPreference["left-top"] && marker_points[2].x < i + pxMagnetThreshold && marker_points[2].x > i - pxMagnetThreshold) {
        op.target.left = i - (marker_points[2].x - op.target.left);
        break;
      }
      if (magnetPreference["left-bottom"] && marker_points[4].x < i + pxMagnetThreshold && marker_points[4].x > i - pxMagnetThreshold) {
        op.target.left = i - (marker_points[4].x - op.target.left);
        break;
      }
    }

    for (var i = getPxValue(mmFieldHeight) % getPxValue(gridWidth); i < getPxValue(mmFieldHeight); i += getPxValue(gridWidth)) {
      if (magnetPreference["center"] && marker_points[0].y < i + pxMagnetThreshold && marker_points[0].y > i - pxMagnetThreshold) {
        op.target.top = i - (marker_points[0].y - op.target.top);
        break;
      }
      if (magnetPreference["right-top"] && marker_points[3].y < i + pxMagnetThreshold && marker_points[3].y > i - pxMagnetThreshold) {
        op.target.top = i - (marker_points[3].y - op.target.top);
        break;
      }
      if (magnetPreference["right-bottom"] && marker_points[1].y < i + pxMagnetThreshold && marker_points[1].y > i - pxMagnetThreshold) {
        op.target.top = i - (marker_points[1].y - op.target.top);
        break;
      }
      if (magnetPreference["left-top"] && marker_points[2].y < i + pxMagnetThreshold && marker_points[2].y > i - pxMagnetThreshold) {
        op.target.top = i - (marker_points[2].y - op.target.top);
        break;
      }
      if (magnetPreference["left-bottom"] && marker_points[4].y < i + pxMagnetThreshold && marker_points[4].y > i - pxMagnetThreshold) {
        op.target.top = i - (marker_points[4].y - op.target.top);
        break;
      }
    }
  }
}

function magnetSettings(e) {
  magnetPreference[e] = !magnetPreference[e];
  if (magnetPreference[e]) {
    document.getElementById("magnetTogglerImg" + e).src = "/static/css/svg/tick.png";

  } else {
    document.getElementById("magnetTogglerImg" + e).src = "/static/css/svg/cross.svg";
  }
}

// handlers
// page handlers
$('html').keyup(function(e) {
  if (e.keyCode == 46) {
    removeSelected();
  } else if (e.keyCode == 78 && e.ctrlKey) {
    createOneMarker();
  }
});

// window resize handler
// ПЕРЕПИСАТЬ
$(window).resize(function (){
 if (canvas.width != $("#aruco-field-container").width()) {
            var scaleMultiplier = $("#aruco-field-container").width() / canvas.width;
            var objects = canvas.getObjects();
            for (var i in objects) {
                objects[i].scaleX = objects[i].scaleX * scaleMultiplier;
                objects[i].scaleY = objects[i].scaleY * scaleMultiplier;
                objects[i].left = objects[i].left * scaleMultiplier;
                objects[i].top = objects[i].top * scaleMultiplier;
                objects[i].setCoords();
            }

            canvas.setWidth(canvas.getWidth() * scaleMultiplier);
            canvas.setHeight(canvas.getHeight() * scaleMultiplier);
            canvas.renderAll();
            canvas.calcOffset();
        }
});


// wheel scrolled, canvas should be zoomed
canvas.on("mouse:wheel", function(opt) {
  var delta = opt.e.deltaY;
  var pointer = canvas.getPointer(opt.e);
  var zoom = canvas.getZoom();
  zoom = zoom + delta / 200;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint({
    x: opt.e.offsetX,
    y: opt.e.offsetY
  }, zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
});

canvas.on("mouse:up", function(opt) {
  is_scaling = false;
});

// selection handlers
canvas.on("selection:created", function(options) {
  console.log(options.target);
  if ("id" in options.target) {
    markerSelected(options);
  } else {
    multiMarkerSelected(options);
  }
});

canvas.on("selection:updated", function(options) {
  if (options.selected.length == 1) {
    markerSelected(options);
  } else {
    multiMarkerSelected(options);
  }
});

canvas.on('selection:cleared', function(options) {
  hide_info();
  hide_info_group();
});

// object moving, scaling and rotating events
canvas.on('object:moving', function(options) {
  magnetize(options);

  var objectCoords = getBlCoordinates(options.target);

  if ("id" in options.target) {
    shiftX.value = getMmValue(objectCoords.x);
    shiftY.value = getMmValue(objectCoords.y);
  } else {
    selectionX.value = getMmValue(objectCoords.x);
    selectionY.value = getMmValue(objectCoords.y);
  }
});

canvas.on('object:rotating', function(op) {
  if (magnetEnabled && magnetPreference["rotate"]) {
    forceMagnetEnabled = false;
    var diagonal = Math.sqrt(Math.pow(op.target.width * op.target.scaleX, 2) + Math.pow(op.target.height * op.target.scaleY, 2));
    marker_points = {
      x: op.target.left + (diagonal * Math.cos(Math.PI / 180 * (op.target.angle) + Math.asin(op.target.height * op.target.scaleY / diagonal))) / 2,
      y: op.target.top + (diagonal * Math.sin(Math.PI / 180 * (op.target.angle) + Math.acos(op.target.width * op.target.scaleX / diagonal))) / 2
    };
    var angles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
    for (var i = 0; i < angles.length; i++) {
      if (op.target.angle > angles[i] - degreeMagnetThreshold && op.target.angle < angles[i] + degreeMagnetThreshold) {
        op.target.angle = angles[i];
        break;
      }
    }

    op.target.left = marker_points.x - (diagonal * Math.cos(Math.PI / 180 * (op.target.angle) + Math.asin(op.target.height * op.target.scaleY / diagonal))) / 2;
    op.target.top = marker_points.y - (diagonal * Math.sin(Math.PI / 180 * (op.target.angle) + Math.acos(op.target.width * op.target.scaleX / diagonal))) / 2;
  }
  angle.value = op.target.angle;
  shiftX.value = getMmValue(op.target.left + (op.target.width * op.target.scaleX * Math.cos(Math.PI / 180 * (op.target.angle))));
  shiftY.value = getMmValue(op.target.top + (op.target.height * op.target.scaleY * Math.sin(Math.PI / 180 * (op.target.angle))));
  markerSide.value = op.target.width * op.target.scaleX;
});


canvas.on('object:scaling', function(options) {
  if ("id" in options.target) {
    if (magnetPreference["resize"] && gridCreated) {
       if (!is_scaling) {
        var diagonall = Math.sqrt(Math.pow(options.target.width * options.target.scaleX, 2) + Math.pow(options.target.height * options.target.scaleY, 2));
        scaling_points = {
            x: options.target.left + (diagonall * Math.cos(Math.PI / 180 * (options.target.angle) + Math.asin(options.target.height * options.target.scaleY / diagonall))) / 2,
            y: options.target.top + (diagonall * Math.sin(Math.PI / 180 * (options.target.angle) + Math.acos(options.target.width * options.target.scaleX / diagonall))) / 2
        };
        is_scaling = true;
       }
      forceMagnetEnabled = false;

      if (options.target.width * options.target.scaleX > getPxValue(gridWidth) - resizeMarkerThreshold && options.target.width * options.target.scaleX < getPxValue(gridWidth) + resizeMarkerThreshold) {
        options.target.scaleX = getPxValue(gridWidth) / options.target.width;
        options.target.scaleY = options.target.scaleX;
      }

      var diagonal = Math.sqrt(Math.pow(options.target.width * options.target.scaleX, 2) + Math.pow(options.target.height * options.target.scaleY, 2));
      var now_points = {
        x: options.target.left + (diagonal * Math.cos(Math.PI / 180 * (options.target.angle) + Math.asin(options.target.height * options.target.scaleY / diagonal))) / 2,
        y: options.target.top + (diagonal * Math.sin(Math.PI / 180 * (options.target.angle) + Math.acos(options.target.width * options.target.scaleX / diagonal))) / 2
      };
      options.target.left -= now_points.x - scaling_points.x;
      options.target.top -= now_points.y - scaling_points.y;
    }

    // recalculate aCoords and get bottom left coordinates
    options.target.setCoords(); 
    var markerCoords = getBlCoordinates(options.target);
    shiftX.value = getMmValue(markerCoords.x);
    shiftY.value = getMmValue(markerCoords.y);
    markerSide.value = getMmValue(getHeight(options.target));
    options.target.side = markerSide.value;
  } else {
    // recalculate aCoords
    options.target.setCoords(); 
    var markerCoords = getBlCoordinates(options.target);
    selectionX.value = getMmValue(markerCoords.x);
    selectionY.value = getMmValue(markerCoords.y);
    selectionHeight.value = getMmValue(getHeight(options.target));
    selectionWidth.value = getMmValue(getWidth(options.target));
  }
});

// selection actions
function markerSelected(options) {
  var marker = options.target;
  var markerCoords = getBlCoordinates(marker);

  idField.value = marker.id;
  markerSide.value = marker.side;
  shiftX.value = getMmValue(markerCoords.x);
  shiftY.value = getMmValue(markerCoords.y);
  shiftZ.value = marker.z;
  angle.value = marker.angle;

  idField.onchange = function() {
    console.log(idField.value);
    // add new marker with old marker parameters
    var newMarker = addMarkerObject(idField.value, marker.side, marker.left, marker.top);
    newMarker.main = marker.main;
    // remove old marker
    canvas.remove(marker);
    // select new marker
    canvas.setActiveObject(newMarker);
  };
  markerSide.onchange = function() {
    var scale = calculateScaleFactor(marker, markerSide.value);
    marker.set({
      side: markerSide.value,
      scaleX: scale,
      scaleY: scale
    });
    marker.setCoords();
    canvas.requestRenderAll();
  };
  shiftX.onchange = function() {
    setBlCoordinates(marker, getPxValue(shiftX.value), getHeight(rect) - marker.aCoords.bl.y);
    marker.setCoords();
  };
  shiftY.onchange = function() {
    setBlCoordinates(marker, marker.aCoords.bl.x, getPxValue(shiftY.value));
    marker.setCoords();
  };
  shiftZ.onchange = function() {
    marker.z = shiftZ.value;
  };
  angle.onchange = function() {
    marker.angle = angle.value;
    marker.setCoords();
    canvas.requestRenderAll();
  };
  zeroCheck.onclick = function() {
    var t = !marker.main;
    for (var i = 0; i < canvas._objects.length; i++) {
      if (canvas._objects[i].main) {
        canvas._objects[i].main = false;
        break;
      }
    }
    marker.main = t;
    if (marker.main) {
      document.getElementById("starIcon").src = "/static/css/svg/gold-star.png";
      document.getElementById("starText").innerHTML = "Главная метка";
    } else {
      document.getElementById("starIcon").src = "/static/css/svg/graystar.png";
      document.getElementById("starText").innerHTML = "Сделать метку главной";
    }
  }


  if (marker.main) {
    document.getElementById("starIcon").src = "/static/css/svg/gold-star.png";
    document.getElementById("starText").innerHTML = "Главная метка";
  } else {
    document.getElementById("starIcon").src = "/static/css/svg/graystar.png";
    document.getElementById("starText").innerHTML = "Сделать метку главной";
  }
  display_info();
}

function multiMarkerSelected(options) {
  var markers = options.target;
  markers.lockScalingFlip = true;
  markers.setControlsVisibility({
    'ml': false,
    'mt': false,
    'mr': false,
    'mb': false
  });

  var markersCoords = getBlCoordinates(markers);

  selectionX.value = getMmValue(markersCoords.x);
  selectionY.value = getMmValue(markersCoords.y);
  selectionWidth.value = getMmValue(markers.width);
  selectionHeight.value = getMmValue(markers.height);

  selectionX.onchange = function() {
    setBlCoordinates(markers, getPxValue(selectionX.value), getHeight(rect) - markers.aCoords.bl.y);
  };
  selectionY.onchange = function() {
    setBlCoordinates(markers, markers.aCoords.bl.x, getPxValue(selectionY.value));
  };

  display_info_group();
}

function removeSelected() {
  canvas.getActiveObjects().forEach(function(object) {
    canvas.remove(object);
  });
  canvas.discardActiveObject();
}

// map generation
function generateMap() {
  var null_point = {
    x: 0,
    y: mmFieldHeight,
    z: 0
  };
  for (var i = 0; i < canvas._objects.length; i++) {
    if (canvas._objects[i].main) {
      var diagonal = Math.sqrt(Math.pow(canvas._objects[i].width * canvas._objects[i].scaleX, 2) + Math.pow(canvas._objects[i].height * canvas._objects[i].scaleY, 2));
      null_point.x = getMmValue(canvas._objects[i].left + (diagonal * Math.cos(Math.PI / 180 * (canvas._objects[i].angle) + Math.asin(canvas._objects[i].height * canvas._objects[i].scaleY / diagonal))) / 2);
      null_point.y = getMmValue(canvas._objects[i].top + (diagonal * Math.sin(Math.PI / 180 * (canvas._objects[i].angle) + Math.acos(canvas._objects[i].width * canvas._objects[i].scaleX / diagonal))) / 2);
      null_point.z = canvas._objects[i].z
      break;
    }
  }

  var strings = [];

  for (var i = 0; i < canvas._objects.length; i++) {
    if ("id" in canvas._objects[i]) {
      var id = canvas._objects[i].id;
      var size = getMmValue(canvas._objects[i].width * canvas._objects[i].scaleX) / 1000;
      var diagonal = Math.sqrt(Math.pow(canvas._objects[i].width * canvas._objects[i].scaleX, 2) + Math.pow(canvas._objects[i].height * canvas._objects[i].scaleY, 2));
      var x = getMmValue(canvas._objects[i].left + (diagonal * Math.cos(Math.PI / 180 * (canvas._objects[i].angle) + Math.asin(canvas._objects[i].height * canvas._objects[i].scaleY / diagonal))) / 2) - null_point.x;
      var y = -getMmValue(canvas._objects[i].top + (diagonal * Math.sin(Math.PI / 180 * (canvas._objects[i].angle) + Math.acos(canvas._objects[i].width * canvas._objects[i].scaleX / diagonal))) / 2) + null_point.y;
      var z = canvas._objects[i].z - null_point.z;
      var az = -(canvas._objects[i].angle / 180 * Math.PI);
      var ay = 0;
      var ax = 0;
      strings.push(id.toString() + " " + size.toString() + " " + (x / 1000).toString() + " " + (y / 1000).toString() + " " + (z / 1000).toString() + " " + az.toString() + " " + ay.toString() + " " + ax.toString());
    }
  }

  if (strings.length > 0){
    var fileName = "map";
    Ply.dialog('getFilename').done(function(ui) {
      fileName = ui.data.filename;
      $.post("/aruco/save_map", {
        filename: fileName,
        map: JSON.stringify(strings)
      })
      .done(function(msg){
        console.log(msg);
      })
      .fail(function() {
        Ply.dialog("alert", "Возникли проблемы с сохранением!");
      });
    });
  }
  else {
    Ply.dialog("alert", "На поле нет маркеров!");
  }
}

// load map file
function loadFile(fileName) {
  // var map;

  // hide modal
  $('#filePicker').modal('hide');

  // get file content
  $.post("/aruco/load_file", {
        filename: fileName
      })
      .done(function(content){
        fileContent = content;
        console.log(fileContent);
      })
      .fail(function() {
        Ply.dialog("alert", "Возникли проблемы с загрузкой файла!");
        return;
      });

  // parse markers
  var markers = fileContent.split("\n").slice(0,-1);
  console.log(markers);
  markers.forEach(function (target) {
    var markerParameters = target.split(" ");
    console.log(markerParameters);
  })

  // add markers to a canvas

}

