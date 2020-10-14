var canvas;
var categories = [];
var coords = [];
var mousePressed = false;
var model;
var gm;
const imgSize = 28;
//const path = 'model1';
const path = "data/model10";
var players = [];
const APIKEY = "y-bm_k6E6SHHkWoUXCcgPDrHRp-YhwbtwHRASagi9mM";

$(() => {
  init();
  canvas = new fabric.Canvas("canvas");
  canvas.backgroundColor = "#ffffff";
  canvas.isDrawingMode = 0;
  canvas.freeDrawingBrush.color = "black";
  canvas.freeDrawingBrush.width = 8;
  canvas.renderAll();

  //listeners
  canvas.on("mouse:up", function (e) {
    //getFrame();
    mousePressed = false;
  });

  canvas.on("mouse:down", function (e) {
    mousePressed = true;
  });

  canvas.on("mouse:move", function (e) {
    recordCoords(e);
  });
});

async function init() {
  // Load model
  model = await tf.loadLayersModel(path + "/model.json");

  // Test
  model.predict(tf.zeros([1, imgSize, imgSize, 1]));

  //allow draw
  canvas.isDrawingMode = 1;

  await loadCategories();
}

function showModel() {
  var el = document.getElementById("tfjs-visor-container");

  if (!el) {
    const surface = {
      name: "Model Summary",
      tab: "Model Inspection",
    };

    tfvis.show.layer(surface, model);
  } else {
    tfvis.visor().toggle();
  }
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

    var preds = [];
    names.forEach((name, i) => {
      preds.push({
        keyword: name.split("_").join(" "),
        prob: probs[i].toFixed(3) * 100,
      });
    });

    return preds;
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
  txt_path = path + "/class_names.txt";

  await $.ajax({
    url: txt_path,
    dataType: "text",
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
    y: Math.min.apply(null, yCoor),
  };

  //find max x and y coordinates
  var max_coords = {
    x: Math.max.apply(null, xCoor),
    y: Math.max.apply(null, yCoor),
  };

  return {
    min: min_coords,
    max: max_coords,
  };
}

//get the image data
function getImageData() {
  //get the minimum bounding box around the drawing
  const mbb = getMinBoundingBox();

  //get image data according to dpi (the ratio of the resolution for current device)
  const dpi = window.devicePixelRatio;

  // (x: x-axis coordinate of the top-left corner, y: y-axis coordinate of the top-left corner, z: width, w: height)
  const imgData = canvas.contextContainer.getImageData(
    mbb.min.x * dpi,
    mbb.min.y * dpi,
    (mbb.max.x - mbb.min.x) * dpi,
    (mbb.max.y - mbb.min.y) * dpi
  );

  return imgData;
}

function preprocess(imgData) {
  return tf.tidy(() => {
    // Convert to tensor
    let tensor = tf.browser.fromPixels(imgData, (nrChannels = 1));

    // Resize
    const resize = tf.image
      .resizeBilinear(tensor, [imgSize, imgSize])
      .toFloat();

    // Normalize => 1.0 - (data/255.0)
    const offset = tf.scalar(255.0);
    const normalize = tf.scalar(1.0).sub(resize.div(offset));

    // Batch Shape
    const batch = normalize.expandDims(0);

    return batch;
  });
}

// Save canvas as image
function saveCanvas() {
  return canvas.toDataURL();
}

//Clear the canvas
function clearCanvas() {
  canvas.clear();
  canvas.backgroundColor = "#ffffff";
  coords = [];
  console.log("cleared");
}

//add player to list and array
function addPlayer(e) {
  e.preventDefault();

  // Getting box and ul by selecting id;
  let input = document.getElementById("box");

  if (
    input.value != "" &&
    !players.find((player) => player.name === input.value)
  ) {
    const newPlayer = new Player(input.value);
    players.push(newPlayer);
    // console.log(players);

    if (players.length > 2) {
      // console.log("more than 2 players")
      $("#start-button").removeClass("disabled");
      $("#start-button").addClass("enabled");
      document.getElementById("start-button").disabled = false;
    }

    $("#players").prepend(
      `<li id="${newPlayer.name}" class="list-group-item d-flex justify-content-between align-items-center">` +
      input.value +
      `<span class="badge badge-danger badge-pill" onclick="removePlayer(this)">X</span></li>`
    );

    input.value = "";
  }
}

function removePlayer(obj) {
  console.log(obj.parentNode.id);
  var name = obj.parentNode.id;
  $("#" + name).remove();

  players = players.filter(function (player) {
    return player.name != name;
  });

  if (players.length < 3) {
    // console.log("less than 3 players")
    $("#start-button").addClass("disabled");
    $("#start-button").removeClass("enabled");
    document.getElementById("start-button").disabled = true;
  }
}

function stateHandler(e = null, restart = false) {
  if (e !== null) e.preventDefault();

  if (!gm) {
    // Start our game
    gm = new GameState([]);
  }

  // Open game state
  if (gm.playerIndex === 0) {
    hideAndShowElementsByID("welcome-state", "game-state");

    // Show exit button
    document
      .getElementById("exit-button")
      .style.setProperty("display", "block", "important");

    // Add players to game state
    gm.players = players.sort(() => Math.random() - 0.5);
  }

  if (gm.players.length < 2) return;

  if (restart) {
    console.log("Restart Game");

    gm.restart();
  }

  // End state
  if (gm.playerIndex === gm.players.length && gm.state !== 1) {
    console.log("End state");
    //players = [];
    gm.endState();
    return;
  }

  // Draw state
  if (gm.state === 0) {
    console.log("Draw State", gm.players[gm.playerIndex]);

    gm.drawState();

    gm.playerIndex++;
  }

  // AI state
  else if (gm.state === 1) {
    console.log("AI State");

    gm.AIState();
  }

  // Guess state
  else if (gm.state === 2) {
    console.log("Guess State", gm.players[gm.playerIndex]);

    gm.guessState();

    gm.playerIndex++;
  }

  gm.state++;
  gm.state = gm.state % 3;
}

function hideAndShowElementsByID(hideID, showID) {
  document
    .getElementById(hideID)
    .style.setProperty("display", "none", "important");
  document
    .getElementById(showID)
    .style.setProperty("display", "block", "important");
}

function hide(el) {
  el.parentNode.parentNode.parentNode.style.setProperty("display", "none", "important");
}