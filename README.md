# Cosmic noise demo thingy

This is a demo (with _real bad_ JavaScript) that I presented at Hybrid Conf. It takes audio input and turns it into stars and mountains and shit.

## Input and audio
The input gets a stereo delay added to it for #super #cool #space #ambience when you’re making noise. It uses direct input by default and pipes that through a few delay and panner nodes to achieve this. The demo is live-input by default which means anything you play is output after the delay/panning signal chain. Use headphones if you don’t want crazy feedback.

The code can be tweaked to use an audio file as an input if you want to go the pre-recorded route but in the name of randomness and experimentation, try it with direct input for the best results.

The background ambience is basically a super long A-minor chord and is _chill as fuck_. The visualisation doesn’t take the audio file into account, it’s just there so it works better when you’re stoned off your face. Subsequently, you can replace it with an audio file of your choosing and not have it intefere with the visualisation results.

## Visualisation
The actual visualisation depends on a few factors from the audio input. It uses an `AnalyserNode` that the default `AudioContext` is connected to. This can reveal lots of dope information about the incoming audio signal. This information is used differently depending on what part of the ‘scene’ is being created.

All visualisation are just 2D Canvas shapes with various effects. The stars are circles with shadows, the mountains are triangular paths, with background mountains having a glow for dat ethereal ambience. The foreground and background ‘hills’ are just bezier curves and the trees are combinations of triangles that end up looking like those shitty Christmas cards you made in primary school.

Colours are currently locked in but you can totally make this ‘themeable’ (I plan to do so soon) to create any combination of natural/totally fucked up environments.

### Stars
The stars depend mostly on signal amplitude. Play loud/drawn-out sounds and more stars will appear, play sporadically and less will appear. Play nothing and you’ll have a shit sky with no stars and a big fuckin mooon.

### Background mountains
These are based on frequency and amplitude, with a bit of randomisation to stop you getting shitty, homogenous, ‘jagged-teeth’ like mountains. Higher frequencies will draw more mountains on the right of the scene, while lower frequencies will draw them towards the left. The amplitude of those frequencies will determine the peak of the mountains. There’s some really dumb code to try to isolate peak frequencies away from any harmonics/overtones but it is far from a good example of frequency-detection (also, that’s not the point of this, ovetones should make little shitty mountains pop up anyway).

### Foreground mountains
Pretty much exactly the same as the background ones except there’s a few different multipliers to make sure the peaks stay slightly lower than the background mountains and they don’t grow as ‘wide’.

### Background trees
These are based around a horizontal grid, and again use non-intelligent frequency detection. Instead of plotting based on every frequency in the `AnalyserNode`’s bin; they’re limited to a customisable horizontal grid. This means you can ‘stack’ triangles on top of each other instead of having a load of shitty triangles scattered everywhere and shitty floating trees.

### Background hills
This is the dumbest part of the scene and something that needs improvement. There’s a lot of randomisation, but basically the frequency determines where the bezier curve ‘peaks’ and it slopes off to the bottom after that. It uses ‘randomised symmetry’ which basically means the left–right frequency ‘grid’ is halved and a random integer dictates if the hill is drawn left/right or right/left. It results in a kinda-but-not symmetrical layout for hills but also means there’s little variation in terrain.

### Foreground trees
The trees themselves are drawn randomly across a grid, the audio has no impact on where the trees are placed but the amplitude has a slight effect on the height of the tree, which is also randomised. The ‘branches’ for each tree are based on how intensely you play in a 2.5s window while each tree is being drawn. The left/right ‘growth’ of the branches are randomised so the audio input only affects the horizontal spread of each branch.

### Foreground terrain
Exactly like the background terrain but with a lower peak for the curves.

### Ambience and celestials
There’s some really shitty shooting stars and comets and also a random fucking planet that zoom past (in front of the moon). These are done with simple `setInterval`s because they’re not as accurate as other JS timing functions and that’s what I want. They don’t have to be there and they’re the only CSS/HTML that’s used outside of the body and canvas tags etc. but I kinda like them and also fuck you this is my world I’ll setInterval wherever I want.

### Transitions between visualise sections
The transitions currently use `setTimeout` to change the `drawing` variable. This is far from ideal but a quick and dirty solution to switching through each section. This should be rewritten to use `requestAnimationFrame` but for now I can live with it.

## The code
The code is not great at all.

I’ve tried to comment it as best as I can; a decent understanding of Canvas and the Web Audio API would be useful but there’s still some idiosyncrasies from how I’ve pieced it together. The comments should help but I should also rewrite it when I get better at JS. Pls don’t hate me.

## Running the thing
This all runs locally, the best way I’ve found to do it is using iojs simple http-server.

* `npm install -g http-server`
* `http-server`

The go to `0.0.0.0:8000` (or whatever you set the port to be) and you should be able to run it fine.

You’ll get the whole 

> 0.0.0.0 Wants to use your microphone

Message, just click `Allow` and melt some faces.

## Press Enter to go full-screen
Right now, because I demoed it at full-screen, the background won’t get drawn until it’s full-screen and it’ll all look fucking terrible. So press Enter to go full screen and it should be okay. I’ll fix this soon. Maybe.

## License and stuff
Do what you want with this code and the music I’ve written for the demo except sell it like a fucking shitlord. If you make some dope shit based off it PLEASE PLEASE share it with me. Visualising audio like this is super interesting to me and I’d absolutely love someone more creative than me to jump on and experiment. If you like it, hit me up on [Twitter](http://twitter.com/scott_riley) and we can say nice things to each other xoxo

