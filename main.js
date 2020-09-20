var canvas;
var categories = [];
var coords = [];
var mousePressed = false;
var model;
const imgSize = 28;
//const path = 'model1';
const path = 'data/model3';

$(() => {
  init();
  canvas = new fabric.Canvas('canvas');
  canvas.backgroundColor = '#ffffff';
  canvas.isDrawingMode = 0;
  canvas.freeDrawingBrush.color = "black";
  canvas.freeDrawingBrush.width = 10;
  canvas.renderAll();

  //listeners
  canvas.on('mouse:up', function (e) {
    //getFrame();
    mousePressed = false;
  });

  canvas.on('mouse:down', function (e) {
    mousePressed = true;

  });

  canvas.on('mouse:move', function (e) {
    recordCoords(e);
  });
});

async function init() {
  // Load model
  model = await tf.loadLayersModel(path + '/model.json');

  // Test
  model.predict(tf.zeros([1, imgSize, imgSize, 1]));

  //allow draw
  canvas.isDrawingMode = 1;

  await loadCategories();
}

// Record the drawings coords
function recordCoords(event) {
  var pointer = canvas.getPointer(event.e);
  var x = pointer.x;
  var y = pointer.y;

  if (x >= 0 && y >= 0 && mousePressed) {
    coords.push(pointer);
  }
}

function getFrame() {
  if (coords.length >= 2) {

    const imgData = getImageData();

    const pred = model.predict(preprocess(imgData)).dataSync();

    //find prediction
    const indices = findIndicesOfMax(pred, 5);
    const probs = findTopValues(pred, 5);
    const names = getCategories(indices);

    console.log(indices);
    console.log(probs);
    console.log(names);

    $('#pred').text(names[0].split('_').join(' ') + ' ' + probs[0].toFixed(3) * 100 + '% probability');
  }
}

// get categories
function getCategories(indices) {
  var res = [];
  for (let i = 0; i < indices.length; i++) {
    res[i] = categories[indices[i]];
  }

  return res;
}

async function loadCategories() {
  txt_path = path + '/class_names.txt';

  await $.ajax({
    url: txt_path,
    dataType: 'text'
  }).done((data) => {
    //If read successfully
    const categoriesList = data.split("\n");
    for (let i = 0; i < categoriesList.length; i++) {
      let category = categoriesList[i];
      categories[i] = category;
    }
  });
}

function findIndicesOfMax(pred, maxPred) {
  var res = [];
  for (let i = 0; i < pred.length; i++) {
    res.push(i);
    if (res.length > maxPred) {
      res.sort((a, b) => {
        return pred[b] - pred[a];
      }); // Sort in descending order;
      res.pop();
    }

  }

  return res;
}

function findTopValues(pred, maxPred) {
  var res = [];
  let indices = findIndicesOfMax(pred, maxPred);

  // Get top 5 preds
  for (let i = 0; i < indices.length; i++) {
    res[i] = pred[indices[i]];
  }

  return res;
}

//get the best bounding box by trimming around the drawing
function getMinBoundingBox() {
  //get x-coordinates 
  var xCoor = coords.map((c) => {
    return c.x;
  });

  //get y-coordinates
  var yCoor = coords.map((c) => {
    return c.y;
  });

  //find min x and y coordinates
  var min_coords = {
    x: Math.min.apply(null, xCoor),
    y: Math.min.apply(null, yCoor)
  };

  //find max x and y coordinates
  var max_coords = {
    x: Math.max.apply(null, xCoor),
    y: Math.max.apply(null, yCoor)
  };

  return {
    min: min_coords,
    max: max_coords
  };
}

//get the image data
function getImageData() {
  //get the minimum bounding box around the drawing
  const mbb = getMinBoundingBox();

  //get image data according to dpi (the ratio of the resolution for current device)
  const dpi = window.devicePixelRatio;

  // (x: x-axis coordinate of the top-left corner, y: y-axis coordinate of the top-left corner, z: width, w: height)
  const imgData = canvas.contextContainer.getImageData(mbb.min.x * dpi, mbb.min.y * dpi, (mbb.max.x - mbb.min.x) * dpi, (mbb.max.y - mbb.min.y) * dpi);

  return imgData;
}

function preprocess(imgData) {
  return tf.tidy(() => {
    // Convert to tensor
    let tensor = tf.browser.fromPixels(imgData, nrChannels = 1);

    // Resize
    const resize = tf.image.resizeBilinear(tensor, [imgSize, imgSize]).toFloat();


    // Normalize => 1.0 - (data/255.0)
    const offset = tf.scalar(255.0);
    const normalize = tf.scalar(1.0).sub(resize.div(offset));


    // Batch Shape
    const batch = normalize.expandDims(0);


    return batch;
  });
}

//Clear the canvas
function clearCanvas() {
  canvas.clear();
  canvas.backgroundColor = '#ffffff';
  coords = [];
  console.log('cleared');
}