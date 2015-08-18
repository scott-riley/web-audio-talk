"use strict";
console.log('monitor yo');

var fullScreen = document.querySelector('.fullScreen');

document.addEventListener("keydown", function(e) {
  if (e.keyCode == 13) {
    toggleFullScreen();
  }
}, false);

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  setTimeout (function(){
    drawBackground();
  }, 300)
}

var buffers = [];

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
// make a new fuckin audio context yo
var analyser = audioContext.createAnalyser();

var canvas = document.querySelector('#c');
var canvasContext = canvas.getContext("2d");

var canvasWidth = document.querySelector('.wrapper').clientWidth;
var canvasHeight = document.querySelector('.wrapper').clientHeight;

canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);

var drawVisual;

var previousTime = 0;
var treeX = 50;
var lastTreeX = 300;
var lastTreeHeight = 0;
var timeBetweenBranches = 0;

var drawing = "stars";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var WIDTH,
    HEIGHT;

function drawBackground() {

  var canvasWidth = document.querySelector('.wrapper').clientWidth;
  var canvasHeight = document.querySelector('.wrapper').clientHeight;

  canvas.setAttribute('width', canvasWidth);
  canvas.setAttribute('height', canvasHeight);

  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  var bgGradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, 'rgb(33,44,57)');
  bgGradient.addColorStop(.7, 'rgb(58,82,102)');

  canvasContext.fillStyle = bgGradient;
  canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

}

function drawAmbience() {
  // var ambientRadius = 120;
  // var moonRadius = 40;
  // canvasContext.beginPath();
  // canvasContext.arc(canvas.width - 400, 720, ambientRadius, 0, 2 * Math.PI, false);
  // canvasContext.fillStyle = 'rgba(125,110,110, 1)';
  // canvasContext.shadowColor = 'rgb(180,110,110)';
  // canvasContext.shadowBlur = 1000;
  // canvasContext.shadowOffsetX = 0;
  // canvasContext.shadowOffsetY = 0;
  // canvasContext.fill();
}

function redrawFog() {
  var fogGradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
  fogGradient.addColorStop(0, 'rgba(33,44,57, .9)');
  fogGradient.addColorStop(1, 'rgba(59,83,103, .0)');
  canvasContext.fillStyle = fogGradient;
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  var moonRadius = 180;
  canvasContext.beginPath();
  canvasContext.arc(20, 20, moonRadius, 0, 2 * Math.PI, false);
  canvasContext.fillStyle = 'rgba(245,230,230, 1)';
  canvasContext.shadowColor = 'transparent';
  canvasContext.fill();

}

function visualise() {

  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  analyser.fftSize = 64;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  console.log(previousTime);

  // drawType, xOff, foreground, yHeight
  function draw() {

    drawVisual = requestAnimationFrame(draw);

    if (previousTime == 0) {
      previousTime = audioContext.currentTime;
    }
    else if ( (audioContext.currentTime - previousTime) > 10) {
      previousTime = audioContext.currentTime;
    }

    analyser.getByteFrequencyData(dataArray);

    // Set up a horizontal grid for placing elements based on frequency energy
    var colWidth = (canvas.width / analyser.fftSize);
    var yHeight;
    var x = 0;
    var drawingBaseline;
    var fill;

    if (drawing === "mountainBg") {
      var bgBaseline = canvas.height - (canvas.height/4.3);
      var fgBaseline = canvas.height;
      colWidth = (canvas.width / 24);

      var multiplier = getRandomInt(canvas.height * .019, canvas.height * .027);

      drawingBaseline = fgBaseline;
      fill = 'rgb(55, 75, 94)';
      canvasContext.shadowColor = 'rgba(180,110,110, .4)';
      canvasContext.shadowBlur = 400;

      // loop through the frequency array (backwards to determine the highest frequency)
      for(var i = 0; i < bufferLength; i++) {

        // console.log(`${i} : ${dataArray[i]}`);

        // For each frequency band, determine the loudest frequency
        // This gives us the ‘peak’ of the sound and determines height/y pos
        if(dataArray[i] < dataArray[i-1]) {
          yHeight = dataArray[i] * multiplier;
        }

        // For every frequency, determine if it’s loud enough to qualify as the max
        if(dataArray[i] > 30) {
          x += colWidth * i;
        }
        else {
          var mountain = new Path2D();
          // start x = mountain middle offset
          // start y = mountain height
          mountain.moveTo(x, drawingBaseline - yHeight);
          
          // draw line to background baseline and rightmost triangle point
          mountain.lineTo(x + (yHeight * 1.4), drawingBaseline);

          // draw bottom of mountain
          mountain.lineTo(x - (yHeight * 1.4), drawingBaseline);

          // draw the mountain yo
          canvasContext.fillStyle = fill;
          canvasContext.fill(mountain);

          // redrawFog();
        }

      }
    }

    else if (drawing === "mountain") {
      var bgBaseline = canvas.height - (canvas.height/4.3);
      var fgBaseline = canvas.height;
      colWidth = (canvas.width / 24);

      var multiplier = getRandomInt(canvas.height * .014, canvas.height * .022);

      if (1 == 1) {
        drawingBaseline = fgBaseline;
        fill = 'rgb(26,36,44)';
      }
      else {
        drawingBaseline = bgBaseline;
        fill = 'rgb(24,37,46)';
      }
      // loop through the frequency array (backwards to determine the highest frequency)
      for(var i = 0; i < bufferLength; i++) {

        // console.log(`${i} : ${dataArray[i]}`);

        // For each frequency band, determine the loudest frequency
        // This gives us the ‘peak’ of the sound and determines height/y pos
        if(dataArray[i] < dataArray[i-1]) {
          yHeight = dataArray[i] * multiplier;
        }

        // For every frequency, determine if it’s loud enough to qualify as the max
        if(dataArray[i] > 30) {
          x += colWidth * i;
        }
        else {
          var mountain = new Path2D();
          // start x = mountain middle offset
          // start y = mountain height
          mountain.moveTo(x, drawingBaseline - yHeight);
          
          // draw line to background baseline and rightmost triangle point
          mountain.lineTo(x + (yHeight / 1.2), drawingBaseline);

          // draw bottom of mountain
          mountain.lineTo(x - (yHeight / 1.2), drawingBaseline);

          // draw the mountain yo
          canvasContext.fillStyle = fill;
          canvasContext.fill(mountain);

          // redrawFog();
        }

      }
    }

    else if (drawing === "treesBg") {
      var bgBaseline = canvas.height - (canvas.height/5.3);
      var fgBaseline = canvas.height;
      colWidth = (canvas.width / 36);

      var multiplier = getRandomInt(2,3);
      drawingBaseline = bgBaseline - getRandomInt(canvas.height * .015, canvas.height * .14);
      fill = 'rgb(53,85,82)';

      // loop through the frequency array (backwards to determine the highest frequency)
      for(var i = 0; i < bufferLength; i++) {

        // console.log(`${i} : ${dataArray[i]}`);

        // For each frequency band, determine the loudest frequency
        // This gives us the ‘peak’ of the sound and determines height/y pos
        if(dataArray[i] < dataArray[i-1]) {
          yHeight = dataArray[i] * multiplier + (multiplier + getRandomInt(canvas.height * .012, canvas.height * .06));
        }

        // For every frequency, determine if it’s loud enough to qualify as the max
        if(dataArray[i] > 30) {
          x += colWidth * i;
        }
        else {
          var mountain = new Path2D();
          // start x = mountain middle offset
          // start y = mountain height
          mountain.moveTo(x, drawingBaseline - yHeight);
          
          // draw line to background baseline and rightmost triangle point
          mountain.lineTo(x + (yHeight / 2.8), drawingBaseline);

          // draw bottom of mountain
          mountain.lineTo(x - (yHeight / 3.8), drawingBaseline);

          // draw the mountain yo
          canvasContext.fillStyle = fill;
          canvasContext.fill(mountain);

        }

      }
    }

    else if (drawing === "treesFg") {
      var bgBaseline = (canvas.height/4.3);
      var fgBaseline = canvas.height;
      var colCount = 24
      colWidth = (canvas.width / colCount);

      var multiplier = getRandomInt(2,colCount);
      drawingBaseline = fgBaseline + getRandomInt(canvas.height * .015, canvas.height * .23);
      fill = 'rgb(29,26,32)';



      if ( (audioContext.currentTime - previousTime) > 2.5) {

        var treeHeight = getRandomInt(canvas.height * .3, canvas.height * .46);

        //draw the tree
        var tree = new Path2D();

        // start the tree path
        tree.moveTo(treeX, canvas.height - (canvas.height * .15));
        tree.lineTo(treeX + 35, canvas.height - treeHeight);
        tree.lineTo(treeX + 70, canvas.height - (canvas.height * .15));
        lastTreeX = treeX;
        treeX = colWidth * getRandomInt(2,colCount - 1);
        canvasContext.fillStyle = fill;
        canvasContext.fill(tree);
        previousTime = audioContext.currentTime;

        lastTreeHeight = treeHeight;
        if(timeBetweenBranches == 0) {
          timeBetweenBranches = audioContext.currentTime;
        }

      }

      else if ( (audioContext.currentTime - timeBetweenBranches) > .5 && lastTreeHeight > 0) {

        var maxStrength = 0;

        for(var i = 0; i < bufferLength; i++) {
          if(dataArray[i] < dataArray[i-1] && dataArray[i] > 10) {
            maxStrength = dataArray[i] * 4;
            if(maxStrength > 100) {
              maxStrength = 80;
            }
          }
        }

        var branchY = canvas.height - lastTreeHeight + (lastTreeHeight * (getRandomInt(15, 45) / 100) );
        var branch = new Path2D();

        branch.moveTo(lastTreeX + 30, branchY);
        branch.lineTo(lastTreeX + 30, branchY - 10);
        if ( getRandomInt(1,2) == 1) {
          branch.lineTo(lastTreeX + (maxStrength + 15), branchY - 5);
        }
        else {
         branch.lineTo(lastTreeX - (maxStrength - 15), branchY - 5); 
        }
        
        canvasContext.fillStyle = fill;
        canvasContext.fill(branch);
        timeBetweenBranches = audioContext.currentTime;

      }

    }

    else if (drawing === "stars") {
      var starRadius = 2;
      for(var i = 0; i < bufferLength; i++) {
        if(dataArray[i] > 100) {
          var opacity = dataArray[i] * 0.001 * 5;
          canvasContext.beginPath();
          canvasContext.arc(getRandomInt(0, canvas.width), getRandomInt(0, canvas.height), starRadius, 0, 2 * Math.PI, false);
          canvasContext.fillStyle = 'rgba(255,255,255, ' + opacity + ')';
          canvasContext.shadowColor = 'rgba(255,255,255, ' + (opacity - .2) + ')';
          canvasContext.shadowBlur = 4;
          canvasContext.shadowOffsetX = 0;
          canvasContext.shadowOffsetY = 0;
          canvasContext.fill();
        }
      }
    }

    else if (drawing === "terrainBg") {

      if (previousTime == 0) {
        previousTime = audioContext.currentTime;
      }
      else if ( (audioContext.currentTime - previousTime) > .5) {
        previousTime = audioContext.currentTime;
        for(var i = 0; i < bufferLength; i++) {
          if(dataArray[i] > 100) {
            var terrain = new Path2D();
            colWidth = (canvas.width / 24);
            var terrainHeight = dataArray[i];
            var terrainOffset = terrainHeight * (getRandomInt(canvas.height * .0077, canvas.height * .023) / 10);
            var terrainControlY = canvas.height - (terrainHeight * (getRandomInt(4,16) / 10));
            var terrainControlX = canvas.width/2 + i * getRandomInt(3,15);
            if(getRandomInt(1,2) == 1) {
              terrain.moveTo(0, canvas.height);
              terrain.lineTo(0, canvas.height - terrainOffset);
              terrain.quadraticCurveTo(terrainControlX, terrainControlY, canvas.width, canvas.height);
              terrain.lineTo(0, canvas.height);
              canvasContext.fillStyle = 'rgb(42,59,74)';
              canvasContext.fill(terrain);
            }
            else {
              terrain.moveTo(canvas.width, canvas.height);
              terrain.lineTo(canvas.width, canvas.height - terrainOffset);
              terrain.quadraticCurveTo(terrainControlX, terrainControlY, 0, canvas.height);
              terrain.lineTo(canvas.width, canvas.height);
              canvasContext.fillStyle = 'rgb(42,59,74)';
              canvasContext.fill(terrain);
            }

          }
        }
      }
    }

    else if (drawing === "terrainFg") {

      if (previousTime == 0) {
        previousTime = audioContext.currentTime;
      }
      else if ( (audioContext.currentTime - previousTime) > .5) {
        previousTime = audioContext.currentTime;
        for(var i = 0; i < bufferLength; i++) {
          if(dataArray[i] > 100) {
            var terrain = new Path2D();
            colWidth = (canvas.width / 24);
            var terrainHeight = dataArray[i];
            var terrainOffset = terrainHeight * (getRandomInt(canvas.height * .0038, canvas.height * .012) / 10);
            var terrainControlY = canvas.height + (terrainHeight * (getRandomInt(canvas.height * .0015, canvas.height * .003) / 10));
            var terrainControlX = canvas.width + i * getRandomInt(3,150);
            if(getRandomInt(1,2) == 1) {
              terrain.moveTo(0, canvas.height);
              terrain.lineTo(0, canvas.height - terrainOffset);
              terrain.quadraticCurveTo(terrainControlX, terrainControlY, canvas.width, canvas.height);
              terrain.lineTo(0, canvas.height);
              canvasContext.fillStyle = 'rgb(26,36,44)';
              canvasContext.fill(terrain);
            }
            else {
              terrain.moveTo(canvas.width, canvas.height);
              terrain.lineTo(canvas.width, canvas.height - terrainOffset);
              terrain.quadraticCurveTo(terrainControlX * -1, terrainControlY, 0, canvas.height);
              terrain.lineTo(canvas.width, canvas.height);
              canvasContext.fillStyle = 'rgb(26,36,44)';
              canvasContext.fill(terrain);
            }

          }
        }
      }
    }

  };

  draw();

}

// drawBackground();

function gotStream(stream) {

  var audioFile = new Audio('assets/audio/ambience.mp3');
  audioFile.play();

  setInterval(function() {
    var topClass = 't' + getRandomInt(1,5);
    var comet = document.createElement('div');
    comet.className = 'shooting-star ' + topClass;
    var wrapper = document.querySelector('.wrapper');
    wrapper.appendChild(comet);
  }, 5000)

  setInterval(function() {
    var topClass = 't' + getRandomInt(1,5);
    var comet = document.createElement('div');
    comet.className = 'comet ' + topClass;
    var wrapper = document.querySelector('.wrapper');
    wrapper.appendChild(comet);
  }, 12000)

  setInterval(function() {
    var topClass = 't' + getRandomInt(1,5);
    var comet = document.createElement('div');
    comet.className = 'planet ' + topClass;
    var wrapper = document.querySelector('.wrapper');
    wrapper.appendChild(comet);
  }, 14000)

  setTimeout(function() {
    canvasContext.shadowColor = "transparent";
    drawing = "mountainBg"
    drawAmbience();
  }, 10000)

  setTimeout(function() {
    canvasContext.shadowColor = "transparent";
    drawing = "mountain"
  }, 15000)

  setTimeout(function() {
    canvasContext.shadowColor = "transparent";
    drawing = "treesBg"
    redrawFog();
  }, 23000)

  setTimeout(function() {
    canvasContext.shadowColor = "transparent";
    drawing = "terrainBg"
  }, 30000)

  setTimeout(function() {
    canvasContext.shadowColor = "transparent";
    drawing = "treesFg"
  }, 38000)

  setTimeout(function() {
    canvasContext.shadowColor = "transparent";
    drawing = "terrainFg"
  }, 60500)

  // Stereo buffer for bitch shifted goodness
  var channels = 2;
  var recLength = audioContext.sampleRate * 1.0;

  // make an audio node so we can use it for the streaming
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);

  console.log(audioContext.sampleRate);

  var gain = audioContext.createGain();
  gain.gain.value = 1.3;

  mediaStreamSource.connect(gain);

  gain.connect(analyser);

  // create a delay that we will later apply to the source
  var delayLeft = audioContext.createDelay();
  delayLeft.delayTime.value = 0.16;

  var delayRight = audioContext.createDelay();
  delayRight.delayTime.value = 0.28;

  // create the panner nodes to spread the delay
  var pannerLeft = audioContext.createStereoPanner();
  pannerLeft.pan.value = -.8;

  var pannerRight = audioContext.createStereoPanner();
  pannerRight.pan.value = .8;

  // set up feedback so the delay doesn’t just sound like wank
  var feedbackLeft = audioContext.createGain();
  feedbackLeft.gain.value = .84;

  var feedbackRight = audioContext.createGain();
  feedbackRight.gain.value = .24;

  // set up a low-pass filter to warm signal as it feeds back
  var lowPassLeft = audioContext.createBiquadFilter(); // low-pass is default for biquad filer
  lowPassLeft.frequency.value = 900;

  var lowPassRight = audioContext.createBiquadFilter(); // low-pass is default for biquad filer
  lowPassRight.frequency.value = 700;

  // feedback loop so audio softens out
  delayLeft.connect(feedbackLeft);
  feedbackLeft.connect(lowPassLeft);
  feedbackLeft.connect(delayLeft);
  // delayLeft.playbackRate.value = 2;

  delayRight.connect(feedbackRight);
  feedbackRight.connect(lowPassRight);
  feedbackRight.connect(delayRight);

  // connect it to destination so we can hear what’s coming in
  analyser.connect(delayLeft);
  analyser.connect(delayRight);
  analyser.connect(audioContext.destination);
  delayLeft.connect(pannerLeft);
  delayRight.connect(pannerRight);
  pannerLeft.connect(audioContext.destination);
  pannerRight.connect(audioContext.destination);

  visualise();

}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia( { audio: true}, gotStream, function() { console.log("fucked up"); });