paper.setup("myCanvas"); // 'myCanvas' should match the ID of your canvas element
var canvas = paper.project.view;

let color = "#000000";
const group = {};
var selectedItem = null;
var panStart = new paper.Point(0, 0);
var panMode = false;
var boundingBox = null;

// Calculate the canvas bounds
var canvasWidth = paper.view.viewSize.width;
var canvasHeight = paper.view.viewSize.height;

// Create drawing and panning tools
let tool = new paper.Tool();

// Create a variable to hold the current path being drawn
let currentPath = null;

var canvasState = null;

// Set the initial line thickness
var lineThicknessSlider = document.getElementById("lineThicknessSlider");
var lineThicknessValue = document.getElementById("lineThicknessValue");

// Function to update line thickness when the slider changes
lineThicknessSlider.addEventListener("input", function () {
  var thickness = parseFloat(lineThicknessSlider.value);
  if (!currentPath) {
    currentPath = new paper.Path();
  }
  currentPath.strokeWidth = thickness;
  lineThicknessValue.textContent = thickness;
  paper.view.draw();
});

paper.view.onMouseDown = function (event) {
  if (panMode) {
    console.log("inside onmousedown with panmode");
    // Check if an item was clicked
    var hitResult = paper.project.hitTest(event.point);
    if (hitResult && hitResult.item) {
      console.log("inside hitResult");
      if (selectedItem) {
        selectedItem.selected = false;
        boundingBox.remove();
      }

      selectedItem = hitResult.item;
      selectedItem.selected = true; // select the new item

      // Add a bounding box or any other desired visual indicator
      boundingBox = new paper.Path.Rectangle(selectedItem.bounds);
      boundingBox.strokeColor = "red"; // Change the color to your preference
      boundingBox.strokeWidth = 2;
    }
    panStart = event.point;
  } else {
    console.log("inside onmousedown without panmode");
    currentPath = new paper.Path();
    currentPath.strokeWidth = parseFloat(lineThicknessSlider.value);
    currentPath.strokeColor = color;
    currentPath.add(event.point);
  }
};

// Event handler for mouse drag when drawing
paper.view.onMouseDrag = function (event) {
  // Check if we have a selected item
  if (panMode) {
    console.log("inside onmousedrag with panmode");
    var delta = event.point.subtract(panStart);
    var newPosition = selectedItem.position.add(delta);

    // Ensure panning stays within the canvas bounds
    var halfBoundingBoxWidth = boundingBox.bounds.width / 2;
    var halfBoundingBoxHeight = boundingBox.bounds.height / 2;

    var minX = halfBoundingBoxWidth;
    var maxX = canvasWidth - halfBoundingBoxWidth;
    var minY = halfBoundingBoxHeight;
    var maxY = canvasHeight - halfBoundingBoxHeight;

    newPosition.x = Math.min(Math.max(newPosition.x, minX), maxX);
    newPosition.y = Math.min(Math.max(newPosition.y, minY), maxY);

    selectedItem.position = newPosition;
    boundingBox.position = selectedItem.position;
    panStart = event.point;
  } else {
    console.log("inside onmousedrag without panmode");
    currentPath.add(event.point);
  }
};

// Event handler for mouse up when drawing
paper.view.onMouseUp = function (event) {
  if (boundingBox) {
    boundingBox.remove();
  }
  if (panMode) {
  } else {
    console.log("inside onmouseup without panmode");
    currentPath.add(event.point);
    currentPath = null;
  }
};

const toggleButton = document.getElementById("toggle-button");

toggleButton.addEventListener("click", function () {
  panMode = !panMode;
});

const undoButton = document.getElementById("undo-button");

const setColorListener = () => {
  const picker = document.getElementById("colorPicker");
  picker.addEventListener(
    "change",
    (event) => {
      console.log(event.target.value);
      color = "#" + event.target.value;
    },
    { passive: true }
  );
};

const clearCanvas = () => {
  canvasState = paper.project.exportJSON();
  paper.project.activeLayer.removeChildren();
  paper.view.update();
};

const restoreCanvas = () => {
  if (canvasState) {
    paper.project.clear();
    paper.project.importJSON(canvasState);
    paper.view.update();
  }
};

const addTextToPaper = (x, y, content) => {
  // Create a Point where you want to place the text
  var point = new paper.Point(x, y); // (x, y) coordinates

  // Create a TextItem
  var text = new paper.PointText(point);
  text.content = content;
  text.fontSize = 24;
  text.fillColor = "black";

  // Handle text positioning
  text.position = point; // Set the position again (optional)

  // You can also style the text further
  text.fontFamily = "Arial";
  text.fontWeight = "bold";

  // Update the view to render changes
  paper.view.draw();
};

const addImageToPaper = (x, y, imagePath) => {
  var raster = new paper.Raster({
    source: imagePath,
    position: new paper.Point(x, y), // Custom coordinates (x, y)
  });

  // Handle any additional image settings
  raster.scale(0.2); // You can scale the image if needed

  // Update the Paper.js view
  paper.view.draw();
};

const exportCanvasToImage = () => {
  // Get a reference to your Paper.js canvas
  var paperCanvas = document.getElementById("myCanvas");

  // Create a new canvas element
  var exportCanvas = document.createElement("canvas");
  exportCanvas.width = paperCanvas.width;
  exportCanvas.height = paperCanvas.height;

  // Get the 2D context of the new canvas
  var context = exportCanvas.getContext("2d");

  // Draw the Paper.js canvas onto the new canvas
  context.drawImage(paperCanvas, 0, 0);

  // Convert the canvas to a data URL (JPG format)
  var dataURL = exportCanvas.toDataURL({ format: "jpeg", quality: 0.8 });

  // Create a link element to download the image
  var downloadLink = document.createElement("a");
  downloadLink.href = dataURL;
  downloadLink.download = "canvas_image.jpg";

  // Trigger a click event to download the image
  downloadLink.click();
};

const exportCanvasToJSON = () => {
  const json = paper.project.exportJSON();
  return json;
};

// Function to load JSON data and render it on the canvas
const loadJSONToCanvas = (jsonData) => {
  // Clear the canvas
  paper.project.clear();

  // Import the JSON data into the Paper.js canvas
  paper.project.importJSON(jsonData);

  // Update the view to fit the imported data
  paper.view.update();
};

const invertCanvasByXDegrees = (x) => {
  paper.project.activeLayer.rotate(x, paper.view.center);
  paper.view.update();
};

const createCirc = (originX, originY, radius, color) => {
  // Create a circle
  return new paper.Path.Circle({
    center: [originX, originY],
    radius: radius,
    fillColor: color,
  });
};

const createRect = (top, left, width, height, color) => {
  // Create a rectangle
  return new paper.Path.Rectangle({
    point: [top, left], // Top-left corner of the rectangle
    size: [width, height], // Width and height of the rectangle
    fillColor: color, // Fill color of the rectangle
  });
};

const copyElementOnCanvas = (elem) => {
  // Rasterize the elem
  var elemRaster = elem.rasterize();

  // Set the position of the rasterized image
  elemRaster.position = new paper.Point(elem.bounds.x, elem.bounds.y);

  // Get the canvas element and its 2D rendering context
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");

  // Draw the rasterized image onto the canvas
  ctx.drawImage(elemRaster.canvas, 0, 0);
};

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Paper.js
  setColorListener();
  tool.activate();

  // addTextToPaper(100, 100, "Hello World!");
  // addImageToPaper(150, 200, "sample.jpeg");
  // var jsonData = exportCanvasToJSON();
  // loadJSONToCanvas(jsonData);
  // invertCanvasByXDegrees(0);
  // var _ = createCirc(50, 50, 50, "red");
  // var circle = createCirc(150, 150, 50, "blue");
  // var rect = createRect(200, 200, 25, 25, "green");
  // copyElementOnCanvas(circle);
  // copyElementOnCanvas(rect);
});
