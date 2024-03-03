/*
  main.js is primarily responsible for hooking up the UI to the rest of the application 
  and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

const drawParams = {
  showGradient : true,
  showBars : true,
  showCircles : true,
  showNoise : true,
  showInvert : false,
  showEmboss : false
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "media/Red Shift.mp3"
});

function init() {
  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  audio.setupWebaudio(DEFAULTS.sound1);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  loop();
}

function setupUI(canvasElement) {
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");
  const playButton = document.querySelector("#playButton");

  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("goFullscreen() called");
    utils.goFullscreen(canvasElement);
  };

  // add .onclick event to button
  playButton.onclick = e => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    // check is context is in suspended state (autoplay policy)
    if (audio.audioCtx.state == "suspended") {
      audio.audioCtx.resume();
    }

    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);

    if (e.target.dataset.playing == "no") {
      // if track is currently paused, play it
      audio.playCurrentSound();
      e.target.dataset.playing = "yes";
    }
    else {
      // if track is playing, pause it
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no";
    }
  };

  // C - hookup volume slider & label
  let volumeSlider = document.querySelector("#volumeSlider");
  let volumeLabel = document.querySelector("#volumeLabel");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    // set the gain
    audio.setVolume(e.target.value);

    // update value of label to match value of slider
    volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
  };

  // set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);

    // pause the current track if it is playing
    if (playButton.dataset.playing == "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  }

  let gradientCheckbox = document.querySelector("#gradientCB");
  let barCheckbox = document.querySelector("#barsCB");
  let circleCheckbox = document.querySelector("#circlesCB");
  let noiseCheckbox = document.querySelector("#noiseCB");
  let invertCheckbox = document.querySelector("#invertCB");
  let embossCheckbox = document.querySelector("#embossCB");

  gradientCheckbox.onchange = e => {
    if (e.target.checked) { drawParams.showGradient = true; }
    else { drawParams.showGradient = false; }
  }

  barCheckbox.onchange = e => {
    if (e.target.checked) { drawParams.showBars = true; }
    else { drawParams.showBars = false; } 
  }

  circleCheckbox.onchange = e => {
    if (e.target.checked) { drawParams.showCircles = true; }
    else { drawParams.showCircles = false; } 
  }

  noiseCheckbox.onchange = e => {
    if (e.target.checked) { drawParams.showNoise = true; }
    else { drawParams.showNoise = false; } 
  }

  invertCheckbox.onchange = e => {
    if (e.target.checked) { drawParams.showInvert = true; }
    else { drawParams.showInvert = false; } 
  }

  embossCheckbox.onchange = e => {
    if (e.target.checked) { drawParams.showEmboss = true; }
    else { drawParams.showEmboss = false; } 
  }
} // end setupUI

function loop() {
  requestAnimationFrame(loop);
  canvas.draw(drawParams);
}

export { init };