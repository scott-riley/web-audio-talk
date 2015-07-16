console.log('monitor yo');

var buffers = [];

function gotStream(stream) {

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	// make a new fuckin audio context yo

	// make an audio node so we can use it for the streaming
	var mediaStreamSource = audioContext.createMediaStreamSource(stream);

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

	delayRight.connect(feedbackRight);
	feedbackRight.connect(lowPassRight);
	feedbackRight.connect(delayRight);

	// connect it to destination so we can hear what’s coming in
	mediaStreamSource.connect(delayLeft);
	mediaStreamSource.connect(delayRight);
	mediaStreamSource.connect(audioContext.destination);
	delayLeft.connect(pannerLeft);
	delayRight.connect(pannerRight);
	pannerLeft.connect(audioContext.destination);
	pannerRight.connect(audioContext.destination);
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia( { audio: true}, gotStream, function() { console.log("fucked up"); });