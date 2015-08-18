var canvas = document.querySelector('#c');
var canvasContext = canvas.getContext("2d");

var canvasWidth = document.querySelector('.wrapper').clientWidth;
var canvasHeight = document.querySelector('.wrapper').clientHeight;

canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);

var drawVisual;

function drawBackground() {

  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  var bgGradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, 'rgb(32,43,53)');
  bgGradient.addColorStop(1, 'rgb(59,83,103)');

  canvasContext.fillStyle = bgGradient;
  canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

}

function redrawFog() {
  var fogGradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
  fogGradient.addColorStop(0, 'rgba(32,43,53, .9)');
  fogGradient.addColorStop(1, 'rgba(59,83,103, .0)');
  canvasContext.fillStyle = fogGradient;
  canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
}

function visualise() {

  function draw(drawType, xOff, foreground, yHeight) {

    console.log('drawing');

    drawVisual = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    for(var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;
      console.log("V : " + v + "Y: " + y);
    }

    // set up baselines for foreground and background drawing (terrain only)
    var bgBaseline = canvas.height - 300;
    var fgBaseline = canvas.height;

    if (foreground) {
      drawingBaseline = fgBaseline;
      fill = 'rgb(24,37,46)';
    }
    else {
      drawingBaseline = bgBaseline;
      fill = 'rgb(24,37,46)';
    }
    
    if (drawType === 'mountain') {
      
      var mountain = new Path2D();
      // start x = mountain middle offset
      // start y = mountain height
      mountain.moveTo(xOff, drawingBaseline - yHeight);
      
      // draw line to background baseline and rightmost triangle point
      mountain.lineTo(xOff + (yHeight / 2), drawingBaseline);

      // draw bottom of mountain
      mountain.lineTo(xOff - (yHeight / 2), drawingBaseline);

      console.log(mountain);

      // draw the mountain yo
      canvasContext.fillStyle = fill;
      canvasContext.fill(mountain);

      redrawFog();

    }
    if(drawType === 'hill') {

    }
  }

  // drawBackground();
  // draw('mountain', 200, 0, 400);
  // draw('mountain', 800, 0, 200);
  // draw('mountain', 0, 0, 600);
  // draw('mountain', 1200, 0, 400);

}

drawBackground();