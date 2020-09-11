var canvas;
var categories = [];
var coords = [];
var mousePressed = false;
var mode;

$(() => {
  canvas = new fabric.Canvas('canvas');
  canvas.backgroundColor = '#ffffff';
  canvas.isDrawingMode = 1;
  canvas.freeDrawingBrush.color = "black";
  canvas.freeDrawingBrush.width = 10;
  canvas.renderAll();

  //listeners
  canvas.on('mouse:up', function (e) {
    //getFrame();
  });

  canvas.on('mouse:down', function (e) {
    mousePressed = true;
  });

  canvas.on('mouse:move', function (e) {
    recordCoords(e);
  });
});

// Record the drawings coords
function recordCoords($) {
  var pointer = canvas.getPointer($.e);
  var x = pointer.x;
  var y = pointer.y;

  if (x >= 0 && y >= 0 && mousePressed) {
    coords.push(pointer);
  }
}