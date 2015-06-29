console.log('monitor yo');

var buffers = [];

function gotStream(stream) {

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	// make a new fuckin audio context yo

	// make an audio node so we can use it for the streaming
	var mediaStreamSource = audioContext.createMediaStreamSource(stream);

	// create a delay that we will later apply to the source
	var delay = audioContext.createDelay();
	delay.delayTime.value = 0.4;

	// set up feedback so the delay doesn’t just sound like wank
	var feedback = audioContext.createGain();
	feedback.gain.value = .64;

	// set up a low-pass filter to warm signal as it feeds back
	var lowPass = audioContext.createBiquadFilter(); // low-pass is default for biquad filer
	lowPass.frequency.value = 900;

	// feedback loop so audio softens out
	delay.connect(feedback);
	feedback.connect(lowPass);
	feedback.connect(delay);

	// connect it to destination so we can hear what’s coming in
	mediaStreamSource.connect(delay);
	mediaStreamSource.connect(audioContext.destination);
	delay.connect(audioContext.destination);
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia( { audio: true}, gotStream, function() { console.log("fucked up"); });