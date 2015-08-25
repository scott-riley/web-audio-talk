"use strict";

var fullScreen = document.querySelector('.fullScreen');

// Toggle full-screen when the user hits the enter key
document.addEventListener("keydown", function(e) {
  if (e.keyCode == 13) {
    toggleFullScreen();
  }
}, false);

// Fucking vendor prefixes fml
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
  }, 1000)
}

// LOTS AND LOTS OF INITIALISING AND SHIT

// This is our One And Only™ audio context
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// This is our global analyser that gives us all sorts of information on the audio stream
var analyser = audioContext.createAnalyser();

// Canvas context for all our visualisation needs
var canvas = document.querySelector('#c');
var canvasContext = canvas.getContext("2d");
var canvasWidth = document.querySelector('.wrapper').clientWidth;
var canvasHeight = document.querySelector('.wrapper').clientHeight;
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);

// Visalisation variables that update over time
var drawVisual; // we will populate this with the requestAnimationFrame function call
var previousTime = 0;
var treeX = 50;
var lastTreeX = 300;
var lastTreeHeight = 0;
var timeBetweenBranches = 0;

// So our visualise function always knows what to draw; this is updated as time passes in the scene
var drawing = "stars";

// Until for generating a random int because Math.random is fucking hilariously shit
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// I probs shouldn’t even us these; will fix
var WIDTH,
    HEIGHT;

// Drawing our background gradient to show the sky
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

// Draw a foggy gradient to make the background mountains more subtle
// Also draw a moon because WHY NOT???
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

// This big fucker handles all the visualisation and drawing
function visualise() {

  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  // Setting up our initial analyser values
  analyser.fftSize = 64; // Fast-fourier Transform size; tells us how much fidelity we’ll be working with
  var bufferLength = analyser.frequencyBinCount; // This is almost always half of the FFT length, and is how many ‘bins’ of frequency data we have
  var dataArray = new Uint8Array(bufferLength); // Fuck Uint

  function draw() {

    // Re-call the draw function every frame so we don’t have to worry about setInterval’s shocking performance
    // This means that draw is ran every frame, which means we’re pretty close to real-time manipulation
    drawVisual = requestAnimationFrame(draw);

    // Reset the previousTime every ten seconds, used so we know how much time has elapsed for time-dependent visualisation (used sparingly)
    if (previousTime == 0) {
      previousTime = audioContext.currentTime;
    }
    else if ( (audioContext.currentTime - previousTime) > 10) {
      previousTime = audioContext.currentTime;
    }

    // Populate our dataArray with the frequency bins from our analyser.
    // This is tricky to explain. Basically a ‘bin’ contains data about frequencies
    // The index of the array represents a frequency ‘bin’ e.g. dataArray[0] is our first bin, dataArray[12] is our 13th
    // The frequencies contained in each bin are determined by our fftSize. The higher the FFT size, the more granularly split our frequencies are
    // Ergo, a higher FFT size = more frequency bins, with smaller ranges
    // The value of an index in the dataArray represents the volume of those frequencies
    // As an axample dataArray[0] with a value of 255 means there’s a load of bass frequencies, dataArray[0] with a value of 0 means there’s no bass frequencies
    // The value sensitivity of each ‘bin’ is determined by a min/max dB setting on the analyser; this isn’t too important right now, though
    // This is the longest comment I’ve ever written
    // I’ve basically just blogged
    // Skype me if you don’t get this
    // Kiss me if you love me
    analyser.getByteFrequencyData(dataArray);

    // Set up a horizontal grid for placing elements based on frequency energy
    // This is basically just a horizontal grid, split into columns, so we can pot shit left/right based on how loud our frequency bins are
    // The grid is calculated based on our fftSize, so every ‘bin‘ is a column
    var colWidth = (canvas.width / analyser.fftSize);
    var yHeight;
    var x = 0;
    var drawingBaseline;
    var fill;

    // ifstatementsthatshouldbeswitches.tumblr.com/fuck-you-dad-i-do-what-i-want
    if (drawing === "mountainBg") {
      var bgBaseline = canvas.height - (canvas.height/4.3);
      var fgBaseline = canvas.height;
      colWidth = (canvas.width / 24);

      // The multiplier for the peak of the mountain, randomised.
      // Basing this on canvas height, RESPONSIVE FUCKIN MOUNTAINS
      var multiplier = getRandomInt(canvas.height * .019, canvas.height * .027);

      drawingBaseline = fgBaseline;
      fill = 'rgb(55, 75, 94)';
      canvasContext.shadowColor = 'rgba(180,110,110, .4)';
      canvasContext.shadowBlur = 400;

      // loop through the frequency array
      for(var i = 0; i < bufferLength; i++) {

        // For each frequency band, determine the loudest frequency
        // This gives us the ‘peak’ of the sound and determines height/y pos
        if(dataArray[i] < dataArray[i-1]) {
          yHeight = dataArray[i] * multiplier;
        }

        // For every frequency, determine if it’s loud enough to qualify as ‘drawable’
        // if not, we move to a different column for our drawing origin
        if(dataArray[i] > 30) {
          x += colWidth * i;
        }
        else {
          // It’s loud enough to be visualised, let’s draw some shit
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
        }

      }
    }

    else if (drawing === "mountain") {
      // This is almost identical to the above
      var bgBaseline = canvas.height - (canvas.height/4.3);
      var fgBaseline = canvas.height;
      colWidth = (canvas.width / 24);

      var multiplier = getRandomInt(canvas.height * .014, canvas.height * .022);

      // different fill style for our foreground mountains
      drawingBaseline = fgBaseline;
      fill = 'rgb(26,36,44)';

      // loop through the frequency array (backwards to determine the highest frequency)
      for(var i = 0; i < bufferLength; i++) {

        // For each frequency band, determine the loudest frequency
        // This gives us the ‘peak’ of the sound and determines height/y pos
        if(dataArray[i] < dataArray[i-1]) {
          yHeight = dataArray[i] * multiplier;
        }

        // For every frequency, determine if it’s loud enough to qualify as ‘drawable’
        // if not, we move to a different column for our drawing origin
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
        }

      }
    }

    else if (drawing === "treesBg") {
      // Lets draw some fucking trees
      var bgBaseline = canvas.height - (canvas.height/5.3);
      var fgBaseline = canvas.height;
      colWidth = (canvas.width / 36);

      // We’re going to somewhat randomise the y position of each triangle we draw, that way we can ‘stack’ triangles to make trees
      var multiplier = getRandomInt(2,3);
      drawingBaseline = bgBaseline - getRandomInt(canvas.height * .015, canvas.height * .14);

      // Nice green fill for dat christmas tree vibe
      fill = 'rgb(53,85,82)';

      // loop through the frequency array (backwards to determine the highest frequency)
      for(var i = 0; i < bufferLength; i++) {

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
          var tree = new Path2D();
          // start x = mountain middle offset
          // start y = mountain height
          tree.moveTo(x, drawingBaseline - yHeight);
          
          // draw line to background baseline and rightmost triangle point
          tree.lineTo(x + (yHeight / 2.8), drawingBaseline);

          // draw bottom of mountain
          tree.lineTo(x - (yHeight / 3.8), drawingBaseline);

          // draw the mountain yo
          canvasContext.fillStyle = fill;
          canvasContext.fill(tree);

        }

      }
    }

    else if (drawing === "treesFg") {
      // Lets draw some shitty black Tim Burton wannabe-trees
      var bgBaseline = (canvas.height/4.3);
      var fgBaseline = canvas.height;

      // 24 potential places to draw a tree
      var colCount = 24
      colWidth = (canvas.width / colCount);

      // Ranomising the Y position so the trees aren’t all in one row
      var multiplier = getRandomInt(2,colCount);
      drawingBaseline = fgBaseline + getRandomInt(canvas.height * .015, canvas.height * .23);
      fill = 'rgb(29,26,32)';

      // We want to draw a tree every 2.5s 
      if ( (audioContext.currentTime - previousTime) > 2.5) {
        // 2.5s has passed since the drawing of the last tree

        // Randomise the tree height
        var treeHeight = getRandomInt(canvas.height * .3, canvas.height * .46);

        //draw the tree
        var tree = new Path2D();

        // There’s lots of multiplies based on the canvas height here
        // Pls don’t hate me
        tree.moveTo(treeX, canvas.height - (canvas.height * .15));
        tree.lineTo(treeX + 35, canvas.height - treeHeight);
        tree.lineTo(treeX + 70, canvas.height - (canvas.height * .15));
        lastTreeX = treeX;
        treeX = colWidth * getRandomInt(2,colCount - 1);
        canvasContext.fillStyle = fill;
        canvasContext.fill(tree);

        // Reset previousTime so a new tree can grow
        previousTime = audioContext.currentTime;

        lastTreeHeight = treeHeight;
        if(timeBetweenBranches == 0) {
          // We’re ready to draw some branches for the first tree
          timeBetweenBranches = audioContext.currentTime;
        }

      }

      else if ( (audioContext.currentTime - timeBetweenBranches) > .5 && lastTreeHeight > 0) {
        // If we’ve already drew a tree AND .5s has passed since we last drew a branch, we can draw another one
        var maxStrength = 0;

        // Loop through our frequencies and determine how ‘wide’ our branch should be
        for(var i = 0; i < bufferLength; i++) {
          if(dataArray[i] < dataArray[i-1] && dataArray[i] > 10) {
            // 4 is arbitrary, fear not the 4
            maxStrength = dataArray[i] * 4;
            if(maxStrength > 100) {
              // Setting a threshold so we don’t get super long branches that ruin everyone’s life
              maxStrength = 80;
            }
          }
        }

        // Start drawing the branches
        // This is a bit weird, but basically we want to make sure that our branches are drawn within the top/bottom of the free
        // Here we’re basically making sure that the lowest branch is drawn at 15% of the three’s height or higher
        // and that the highest branch is drawn at 45% of the tree’s height or lower
        var branchY = canvas.height - lastTreeHeight + (lastTreeHeight * (getRandomInt(15, 45) / 100) );
        var branch = new Path2D();

        // Getting our point in the middle of the tree to draw our branch
        branch.moveTo(lastTreeX + 30, branchY);
        // Lining upwards to draw the ‘height’ of our branch
        branch.lineTo(lastTreeX + 30, branchY - 10);

        // Randomly draw a left/right–pointing branch
        if ( getRandomInt(1,2) == 1) {
          branch.lineTo(lastTreeX + (maxStrength + 15), branchY - 5);
        }
        else {
         branch.lineTo(lastTreeX - (maxStrength - 15), branchY - 5); 
        }
        
        // Fill dat shit and update our timing variables to move on to the next branch
        canvasContext.fillStyle = fill;
        canvasContext.fill(branch);
        timeBetweenBranches = audioContext.currentTime;

      }

    }

    else if (drawing === "stars") {
      // The simplest visualisation
      var starRadius = 2;
      for(var i = 0; i < bufferLength; i++) {
        if(dataArray[i] > 100) {
          // Setting the stars opacity based on frequency energy
          var opacity = dataArray[i] * 0.001 * 5;
          canvasContext.beginPath();
          // Drawing little circles for our stars; randomised on the canvas
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
      // Background hills
      // This code is bad
      // I am so sorry
      if (previousTime == 0) {
        previousTime = audioContext.currentTime;
      }
      else if ( (audioContext.currentTime - previousTime) > .5) {
        // We’re going to draw a curve every .5s so our terrain doesn’t get super weird
        previousTime = audioContext.currentTime;
        for(var i = 0; i < bufferLength; i++) {
          // for every frequency in our bin
          if(dataArray[i] > 100) {
            // if it’s louder enough to fuck with our terrain, start the drawing path
            var terrain = new Path2D();
            // 24 columns to fuck shit up on
            colWidth = (canvas.width / 24);
            // Set the height of our terrain based on the amplitube of the current frequency bin and some weird randomising
            var terrainHeight = dataArray[i];
            var terrainOffset = terrainHeight * (getRandomInt(canvas.height * .0077, canvas.height * .023) / 10);

            // Set the X/Y coordinates for our control point of our quadtratic curves
            // This determines how harsh/steep our curve is
            var terrainControlY = canvas.height - (terrainHeight * (getRandomInt(4,16) / 10));
            var terrainControlX = canvas.width/2 + i * getRandomInt(3,15);

            // Randomise the direction a curve is drawn from
            if(getRandomInt(1,2) == 1) {
              // drawing left–right
              terrain.moveTo(0, canvas.height);
              terrain.lineTo(0, canvas.height - terrainOffset);
              terrain.quadraticCurveTo(terrainControlX, terrainControlY, canvas.width, canvas.height);
              terrain.lineTo(0, canvas.height);
              canvasContext.fillStyle = 'rgb(42,59,74)';
              canvasContext.fill(terrain);
            }
            else {
              // drawing right–left
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
      // Just as bad as above; just smaller multipliers
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

function gotStream(stream) {
  // When the user enables their mic input we do this shit

  // Load in our sexy ambient stoner track for deep, sensual background noise
  var audioFile = new Audio('assets/audio/ambience.mp3');
  audioFile.play();

  // Some reallllllll bad code for making shit fly across the screen
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

  // Some realllllll bad code for switching visualisation focus
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

  // Set up an audio source from the user’s stream
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create a gain node to slightly boost the input so it’s audible over background sound
  var gain = audioContext.createGain();
  gain.gain.value = 1.3;

  // Connect our source ot our gain node
  mediaStreamSource.connect(gain);

  // Connect gain node to our analyser (we ceated this up top, it lets us read data from an input signal)
  gain.connect(analyser);

  // create two Delay Nodes, one for the left, one for the right
  // Left delay is a lot shorter than right delay
  var delayLeft = audioContext.createDelay();
  delayLeft.delayTime.value = 0.16;
  var delayRight = audioContext.createDelay();
  delayRight.delayTime.value = 0.28;

  // create the panner nodes to spread the delay
  // 80% left and 80% right panning
  var pannerLeft = audioContext.createStereoPanner();
  pannerLeft.pan.value = -.8;
  var pannerRight = audioContext.createStereoPanner();
  pannerRight.pan.value = .8;

  // Set up individual feedback loops for each delay
  // Left day lasts a lot longer than right delay
  var feedbackLeft = audioContext.createGain();
  feedbackLeft.gain.value = .84;
  var feedbackRight = audioContext.createGain();
  feedbackRight.gain.value = .24;

  // set up a low-pass filter for each delay to warm-up the delay sound
  var lowPassLeft = audioContext.createBiquadFilter(); // low-pass is default for biquad filer
  lowPassLeft.frequency.value = 900;
  var lowPassRight = audioContext.createBiquadFilter(); // low-pass is default for biquad filer
  lowPassRight.frequency.value = 700;

  // Run everything through a feedback loop so our delay carries on and softens out as it goes
  delayLeft.connect(feedbackLeft);
  feedbackLeft.connect(lowPassLeft);
  feedbackLeft.connect(delayLeft);
  delayRight.connect(feedbackRight);
  feedbackRight.connect(lowPassRight);
  feedbackRight.connect(delayRight);

  // Connect everything to our destination so we can hear the beautiful result of all that shit

  // Because we connected our signal to an analyser, this analyser node holds our initial/pure signal (after the gain boost)
  // Connect it to the left/right delays so we get the delay and feedback loop magic going on
  analyser.connect(delayLeft);
  analyser.connect(delayRight);

  // Connect it to the destination so our pure signal is output
  // Without this line we would _only_ hear the delays (which is quite cool if you’re a hippie prog fuck)
  analyser.connect(audioContext.destination);

  // Connect our delays to panner nodes so they’re spread out before they’re output
  delayLeft.connect(pannerLeft);
  delayRight.connect(pannerRight);

  // Connect both our panner nodes to the destination
  pannerLeft.connect(audioContext.destination);
  pannerRight.connect(audioContext.destination);

  // Finally, call our visualise function so we can get this circus on the road
  visualise();

}

// More vendor prefix polyfills YAY
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

// Call getUserMedia (WebRTC shit); this makes the ‘APP would like to access your Mic’ thing pop up
// If the user allows mic input, run the gotStream function and get sexy
navigator.getUserMedia( { audio: true}, gotStream, function() { console.log("fucked up"); });