/*
  Love Lockdown by Kanye West Visualizer
  Eric Modzelewski
  With help from Jason Sigal https://github.com/therewasaguy/p5-music-viz
 */

var mic, soundFile, osc;
var analyzer;
var numSamples = 1024;
var samples = [];
var amplitude;
var fft;
var fftDRUM;
var smoothing = 0.8;
var binCount = 128; 
var particles =  new Array(binCount);
var prevLevels = new Array(60);
var currentLyric = '';
var lyricDiv;
var lrcStrings;
var cnv, peakDetect;
var ellipseWidth = 10;
var divisions = 5;

function preload() {
  img = loadImage("808s-heartbreak-psd-463780.png");
  lrcStrings = loadStrings('Kanye West - Love Lockdown (128  kbps).lrc')
}

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-holder');
  textAlign(CENTER);
  
  analyzer = new p5.FFT(0, numSamples);
  osc = new p5.Oscillator();
  osc.amp(0.5);
  osc.freq(10);
  soundFile = createAudio('LoveLockdownFINALSTEMACCA_nocla.mp3');
  soundFile.play();
  analyzer.setInput(soundFile);
  DISTO = createAudio('LoveLockdownFINALREMIXSTEMDISTO.mp3');
  DISTO.play();
  DRUMS = createAudio('LoveLockdownFINALSTEM808.mp3');
  DRUMS.play();
  SYNTH = createAudio('LoveLockdownFINALSTEMOUTROSYNTH.mp3');
  SYNTH.play();
  PIANO = createAudio('LoveLockdownFINALSTEMPIANO.mp3');
  PIANO.play();
  PERC = createAudio('LoveLockdownFINALSTEMALLPERCDRU.mp3');
  PERC.play();
  amplitude = new p5.Amplitude();
  amplitude.setInput(DRUMS);
  amplitude.smooth(0.6);
  amplitude2 = new p5.Amplitude();
  amplitude.setInput(PERC);
  amplitude.smooth(0.6);
  fft = new p5.FFT(smoothing, binCount);
  fft.setInput(DISTO);
  fftDRUM = new p5.FFT();
  fftDRUM.setInput(DRUMS);
  
  peakDetect = new p5.PeakDetect(4000, 12000, 0.2);
  // instantiate the particles.
  for (var i = 0; i < particles.length; i++) {
    var x = map(i, 0, binCount, 0, width * 2);
    var y = random(0, height);
    var position = createVector(x, y);
    particles[i] = new Particle(position);
  }
  //LYRICS
  // turn the array of strings into one big string, separated by line breaks.
  lrcStrings = lrcStrings.join('\n');

  // lrc.js library converts Strings to JSON
  var lrcJSON = new Lrc(lrcStrings);

  // iterate through each line of the LRC file to get a Time and Lyric
  for (var i = 0; i < lrcJSON.lines.length; i++) {
    var time = lrcJSON.lines[i].time;
    var lyric = lrcJSON.lines[i].txt.valueOf();
    // schedule events to trigger at specific times during audioEl playback
    DISTO.addCue(time, showLyric, lyric);
  }
  
  // create a <div> to hold the lyrics and give it some style
  lyricDiv = createDiv('');
  lyricDiv.style('position', 'relative');
  lyricDiv.style('top', '-30%');
  lyricDiv.style('padding-top', '30%');
  lyricDiv.style('font-size', '48px');
  lyricDiv.style('margin', 'auto')
  lyricDiv.style('font-family', 'OCR A Std')
  lyricDiv.style('text-align', 'center');
  lyricDiv.style('opacity', '.5')
  }

function showLyric(value) {
  var lyric = value;
  
  // if lyric is empty, clear the lyricDiv
  if (lyric === '') {
    lyricDiv.html('');
    lyricDiv.style('font-size', '48px')
    lyricDiv.style('opacity', '.6');
    
    return;
  }

  // othewrwise, create a new <span> with the lyric, followed by a space
  currentLyric = lyric + ' ';
  var newLyric = createSpan(currentLyric);

  // give it a random color
  newLyric.style('color', 'rgba('+ 255 + ', ' + 0 + ', ' + 0 +', 255)');
  lyricDiv.style('font-size', 'random(0,255)')
  // append newLyric to the lyricDiv
  lyricDiv.child(newLyric);
}

function draw() {
  
  background(0,0,0, 100);
  textSize(level);
  // returns an array with [binCount] amplitude readings from lowest to highest frequencies
  var spectrum = fft.analyze(binCount*2);
  //amplitude stuff 
  var level = amplitude.getLevel();
  var spacing = 20;
  var w = width/ (prevLevels.length * spacing);
  var minHeight = 2;
  var roundness = 20;
  var newBuffer = [];
  samples = analyzer.waveform();
  var bufLen = samples.length;
  strokeWeight(1);
  stroke('red');
  fill(color(0, 0, 0));
  beginShape();
  for (var i = 0; i < bufLen; i++){
    var x = map(i, 0, bufLen, 0, width);
    var y = map(samples[i], -1, 1, -height/100, height/2);
    vertex(x, y + height/2);
  }
  endShape();
    var freq = map(mouseX, 0, windowWidth, 1, 440);
  osc.freq(freq, 0.01);
  var amp = map(mouseY, height, 0, 0, 1);
  osc.amp(amp, 0.01);
  
  // scaledSpectrum is a new, smaller array of more meaningful values
  var scaledSpectrum = splitOctaves(spectrum, 3);
  var len = scaledSpectrum.length;
   // add new level to end of array
  prevLevels.push(level);
  
  // remove first item in array
  prevLevels.splice(0, 1);
  // loop through all the previous levels
  strokeWeight(.1);
  for (var j = 0; j < prevLevels.length; j++) {

    var x = map(j, prevLevels.length, 0, width/2, width*1.5);
    var h = map(prevLevels[j], 0, 0.5, minHeight, 100);

    var alphaValue = logMap(j, 0, prevLevels.length, 1, 250);

    var hueValue = map(h, minHeight, height, 200, 255);

    fill(255, 0, 0, alphaValue);

    rect(x+60, height/100, 10, h);
    rect(width-60 - x, height/100, 10, h);
  }

    
      ellipseWidth = h*5;
      fill(50)
  
  image(img, width/2 - ellipseWidth/8, height/100, ellipseWidth/4, ellipseWidth/4);
  strokeWeight(0).textSize(ellipseWidth/10); 
  fill(255)
   
  // update and draw all [binCount] particles!
  // Each particle gets a level that corresponds to
  // the level at one bin of the FFT spectrum. 
  // This level is like amplitude, often called "energy."
  // It will be a number between 0-255.
  for (var i = 0; i < binCount; i++) {
    var thisLevel = map(spectrum[i], 0, 255, 0, 1);

    // update values based on amplitude at this part of the frequency spectrum
    particles[i].update( thisLevel );

    // draw the particle
    particles[i].draw();

    // update x position (in case we change the bin count while live coding)
    particles[i].position.x = map(i, 0, binCount, 0, width*2);
  }

}

// average a point in an array with its neighbors
function smoothPoint(spectrum, index, numberOfNeighbors) {

  // default to 2 neighbors on either side
  var neighbors = numberOfNeighbors || 2;
  var len = spectrum.length;

  var val = 0;

  // start below the index
  var indexMinusNeighbors = index - neighbors;
  var smoothedPoints = 0;

  for (var i = indexMinusNeighbors; i < (index+neighbors) && i < len; i++) {
    // if there is a point at spectrum[i], tally it
    if (typeof(spectrum[i]) !== 'undefined') {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  val = val/smoothedPoints;

  return val;
}

// ===============
// Particle class
// ===============

var Particle = function(position) {
  this.position = position;
  this.scale = random(.5, 1);
  this.speed = createVector(0, random(0, 10) );
  this.color = [255, 0, 0, random(0,255)];
}

var theyExpand = 1;

// use FFT bin level to change speed and diameter
Particle.prototype.update = function(someLevel) {
  this.position.y += this.speed.y / (someLevel);
  if (this.position.y > height) {
    this.position.y = 0;
  }
  this.diameter = map(someLevel, 0, 1, 0, 100) * this.scale * theyExpand;

}

Particle.prototype.draw = function() {
  fill(this.color);
  ellipse(
    this.position.x, this.position.y,
    2, this.diameter
  );
}


// ================
// Helper Functions
// ================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}


  
