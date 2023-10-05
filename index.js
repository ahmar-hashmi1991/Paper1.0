const svgState = {}
let mousePressed = false
let color = '#000000'
const group = {}
const bgUrl = 'https://c85ec4c2721d0d1fda7c4d73a2dd9307.cdn.bubble.io/f1678812878088x914327110712574700/Lung%20for%20bubble.svg'

let currentMode;
var canvas;

const modes = {
    pan: 'pan',
    drawing: 'drawing'
}

// Initialize Paper.js
const initCanvas = () => {
    paper.setup('myCanvas'); // 'myCanvas' should match the ID of your canvas element
    canvas = paper.project.view;
    console.log("canvas >> ", canvas);
}

const toggleMode = (mode) => {    
    if (mode === modes.pan) {
        if (currentMode === modes.pan) {
            currentMode = ''
        } else {
            currentMode = modes.pan
            canvas.isDrawingMode = false
            canvas.draw()
        }
    } else if (mode === modes.drawing) {
        if (currentMode === modes.drawing) {
            currentMode = ''
            canvas.isDrawingMode = false
            canvas.draw()
        } else {
            currentMode = modes.drawing
            canvas.freeDrawingBrush.color = color
            canvas.freeDrawingBrush.width = 5
            canvas.isDrawingMode = true
            canvas.draw()
        }      
    }
}

const setColorListener = () => {
    const picker = document.getElementById('colorPicker')
    picker.addEventListener('change', (event) => {
        console.log(event.target.value)
        color = '#' + event.target.value
        canvas.freeDrawingBrush.color = color
        canvas.requestRenderAll()
    },{passive:true})
}

const clearCanvas = () => {
    svgState.val = canvas.toSVG()
    canvas.getObjects().forEach((o) => {
        if(o !== canvas.backgroundImage) {
            canvas.remove(o)
        }
    })
}

const restoreCanvas = () => {
    // if (svgState.val) {
    //     fabric.loadSVGFromString(svgState.val, objects => {
    //         console.log(objects)
    //         objects = objects.filter(o => o['xlink:href'] !== bgUrl)
    //         canvas.add(...objects)
    //         canvas.requestRenderAll()
    //     })
    // }
}

const addTextToPaper = (x, y, content) => {
    // Create a Point where you want to place the text
    var point = new paper.Point(x, y); // (x, y) coordinates

    // Create a TextItem
    var text = new paper.PointText(point);
    text.content = content;
    text.fontSize = 24;
    text.fillColor = 'black';

    // Handle text positioning
    text.position = point; // Set the position again (optional)

    // You can also style the text further
    text.fontFamily = 'Arial';
    text.fontWeight = 'bold';

    // Update the view to render changes
    paper.view.draw();
}

const addImageToPaper = (x, y, imagePath) => {
    var raster = new paper.Raster({
        source: imagePath,
        position: new paper.Point(x, y), // Custom coordinates (x, y)
    });

    // Handle any additional image settings
    raster.scale(0.2); // You can scale the image if needed

    // Update the Paper.js view
    paper.view.draw();
}

const exportCanvasToImage = () => {
    // Get a reference to your Paper.js canvas
    var paperCanvas = document.getElementById('myCanvas');
  
    // Create a new canvas element
    var exportCanvas = document.createElement('canvas');
    exportCanvas.width = paperCanvas.width;
    exportCanvas.height = paperCanvas.height;
  
    // Get the 2D context of the new canvas
    var context = exportCanvas.getContext('2d');
  
    // Draw the Paper.js canvas onto the new canvas
    context.drawImage(paperCanvas, 0, 0);
  
    // Convert the canvas to a data URL (JPG format)
    var dataURL = exportCanvas.toDataURL({ format: 'jpeg', quality: 0.8 });

    // Create a link element to download the image
    var downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'canvas_image.jpg';
  
    // Trigger a click event to download the image
    downloadLink.click();
}

const exportCanvasToJSON = () => {
    const json = paper.project.exportJSON();
    return json;
}

// Function to load JSON data and render it on the canvas
const loadJSONToCanvas = (jsonData) => {  
    // Clear the canvas
    paper.project.clear();

    // Import the JSON data into the Paper.js canvas
    paper.project.importJSON(jsonData);

    // Update the view to fit the imported data
    paper.view.update();
}

const invertCanvasByXDegrees = (x) => {
    paper.project.activeLayer.rotate(x, paper.view.center);
    paper.view.update();
}

const createCirc = (originX, originY, radius, color) => {
    // Create a circle
    return new paper.Path.Circle({
        center: [originX, originY],
        radius: radius,
        fillColor: color
    });
}

const createRect = (top, left, width, height, color) => {
    // Create a rectangle
    return new paper.Path.Rectangle({
        point: [top, left],   // Top-left corner of the rectangle
        size: [width, height],   // Width and height of the rectangle
        fillColor: color // Fill color of the rectangle
    });
}

const copyElementOnCanvas = (elem) => {
    // Rasterize the elem
    var elemRaster = elem.rasterize();

    // Set the position of the rasterized image
    elemRaster.position = new paper.Point(elem.bounds.x, elem.bounds.y);

    // Get the canvas element and its 2D rendering context
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');

    // Draw the rasterized image onto the canvas
    ctx.drawImage(elemRaster.canvas, 0, 0);
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Paper.js
    initCanvas();
    setColorListener();

    // Rest of your code
    addTextToPaper(100, 100, 'Hello World!');
    addImageToPaper(150, 200, 'sample.jpeg');
    var jsonData = exportCanvasToJSON();
    loadJSONToCanvas(jsonData);
    invertCanvasByXDegrees(0);
    var _ = createCirc(50, 50, 50, 'red');
    var circle = createCirc(150, 150, 50, 'blue');
    var rect = createRect(200, 200, 25, 25, 'green');
    copyElementOnCanvas(circle);
    copyElementOnCanvas(rect);
});