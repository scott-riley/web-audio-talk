console.log('monitor yo');

var buffers = [];

function gotStream(stream) {

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	// make a new fuckin audio context yo

	// make an audio node so we can use it for the streaming
	var mediaStreamSource = audioContext.createMediaStreamSource(stream)

	// connect it to destination so we can hear what’s coming in
	mediaStreamSource.connect(audioContext.destination)
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia( { audio: true}, gotStream, function() { console.log("fucked up"); })