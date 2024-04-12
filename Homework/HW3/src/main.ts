/*
  main.js is primarily responsible for hooking up the UI to the rest of the application 
  and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils';
import * as audio from './audio';
import * as canvas from './canvas';
import { DEFAULTS } from './enums/main-defaults.enum';

const drawParams = {
  showGradient: true,
  showBars: true,
  showCircles: true,
  useWaveform: true
};

let highshelf : boolean, lowshelf : boolean, distortion : boolean, distortionAmount : number = 20, rocketDraw : boolean, fps : number = 60, gradientCheckbox : HTMLInputElement,
barCheckbox : HTMLInputElement, circleCheckbox : HTMLInputElement, highshelfCheckbox : HTMLInputElement, lowshelfCheckbox : HTMLInputElement, distortionCheckbox : HTMLInputElement,
rocketCheckbox : HTMLInputElement, waveformCheckbox : HTMLInputElement, distortionSlider : HTMLInputElement;

gradientCheckbox = document.querySelector("#cb-gradient");
barCheckbox = document.querySelector("#cb-bars");
circleCheckbox = document.querySelector("#cb-circles");
highshelfCheckbox = document.querySelector("#cb-highshelf");
lowshelfCheckbox = document.querySelector("#cb-lowshelf");
distortionCheckbox = document.querySelector("#cb-distortion");
distortionSlider = document.querySelector("#slider-distortion");
rocketCheckbox = document.querySelector("#cb-rockets");
waveformCheckbox = document.querySelector("#cb-waveform");
distortionAmount = Number(distortionSlider.value);

const init = () => {
  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  audio.setupWebaudio(DEFAULTS.sound1);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  loadJsonXHR();
  loop();
}

const setupUI = (canvasElement : HTMLCanvasElement) => {
  // A - hookup fullscreen button
  const fsButton : HTMLButtonElement = document.querySelector("#btn-fs");
  const playButton : HTMLButtonElement = document.querySelector("#btn-play");
  
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("goFullscreen() called");
    utils.goFullscreen(canvasElement);
  };

  // add .onclick event to button
  playButton.onclick = e => {
    const target = e.target as HTMLInputElement;

    // check is context is in suspended state (autoplay policy)
    if (audio.audioCtx.state == "suspended") {
      audio.audioCtx.resume();
    }

    if (target.dataset.playing == "no") {
      // if track is currently paused, play it
      audio.playCurrentSound();
      target.dataset.playing = "yes";
    }
    else {
      // if track is playing, pause it
      audio.pauseCurrentSound();
      target.dataset.playing = "no";
    }
  };

  // C - hookup volume slider & label
  let volumeSlider : HTMLInputElement = document.querySelector("#slider-volume");
  let volumeLabel : HTMLSpanElement = document.querySelector("#label-volume");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    const target = e.target as HTMLInputElement;
    // set the gain
    audio.setVolume(Number(target.value));

    // update value of label to match value of slider
    volumeLabel.innerHTML = String(Math.round((Number(target.value) / 2 * 100)));
  };

  // set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect : HTMLSelectElement = document.querySelector("#select-track");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    const target = e.target as HTMLInputElement;
    audio.loadSoundFile(target.value);

    // pause the current track if it is playing
    if (playButton.dataset.playing == "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  }

  gradientCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    if (target.checked) { drawParams.showGradient = true; }
    else { drawParams.showGradient = false; }
  }

  barCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    if (target.checked) { drawParams.showBars = true; }
    else { drawParams.showBars = false; }
  }

  circleCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    if (target.checked) { drawParams.showCircles = true; }
    else { drawParams.showCircles = false; }
  }

  rocketCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    if (target.checked) { rocketDraw = true; }
    else { rocketDraw = false; }
  }

  waveformCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    if (target.checked) { drawParams.useWaveform = true; }
    else { drawParams.useWaveform = false; }
  }

  highshelfCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    highshelf = target.checked;
    toggleHighshelf();
  }

  lowshelfCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    lowshelf = target.checked;
    toggleLowshelf();
  }

  distortionCheckbox.onchange = e => {
    const target = e.target as HTMLInputElement;
    distortion = target.checked;
    toggleDistortion();
  }

  distortionSlider.onchange = e => {
    const target = e.target as HTMLInputElement;
    distortionAmount = Number(target.value);
    toggleDistortion();
  }

} // end setupUI

const loop = () => {
  setTimeout(loop, 1000 / fps);
  canvas.draw(drawParams);

  if (rocketDraw) {
    for (let r of canvas.rockets) {
      r.update();
      r.draw(canvas.ctx);
    }
  }
}

//toggles highshelf filter
const toggleHighshelf = () => {
  if (highshelf) {
    audio.biquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
    audio.biquadFilter.gain.setValueAtTime(15, audio.audioCtx.currentTime);
  }
  else {
    audio.biquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime);
  }
}

//toggles lowshelf filter
const toggleLowshelf = () => {
  if (lowshelf) {
    audio.lowshelfBiquad.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
    audio.lowshelfBiquad.gain.setValueAtTime(15, audio.audioCtx.currentTime);
  }
  else {
    audio.lowshelfBiquad.gain.setValueAtTime(0, audio.audioCtx.currentTime);
  }
}

//toggles distortion filter
const toggleDistortion = () => {
  if (distortion) {
    audio.distortionFilter.curve = null;
    audio.distortionFilter.curve = makeDistortionCurve(distortionAmount);
  }
  else {
    audio.distortionFilter.curve = null;
  }
}

//calculates curve for distortion filter
const makeDistortionCurve = (amount : number = 20) => {
  let n_samples = 256, curve = new Float32Array(n_samples);

  for (let i = 0; i < n_samples; ++i) {
    let x = i * 2 / n_samples - 1;
    curve[i] = x * Math.sin(x) * amount / 5;
  }

  return curve;
}

//loads in ui data from JSON file
const loadJsonXHR = () => {
  const url = "data/av-data.json";
  const xhr = new XMLHttpRequest();

  xhr.onload = (e) => {
    let json;
    const target = e.target as XMLHttpRequest;

    console.log(`In onload - HTTP Status Code = ${target.status}`);

    try {
      json = JSON.parse(target.response);
    }
    catch {
      console.log("JSON file error");
      return
    }

    const keys = Object.keys(json);

    //loop through ui elements in JSON file and load their settings
    for (let k of keys) {
      if (k == "ui") {
        const obj = json[k];

        for (let c of obj) {
          switch (c.component) {
            case 'gradient':
              gradientCheckbox.checked = c.value;
              drawParams.showGradient = c.value;
              break;
            case 'bars':
              barCheckbox.checked = c.value;
              drawParams.showBars = c.value;
              break;
            case 'circles':
              circleCheckbox.checked = c.value;
              drawParams.showCircles = c.value;
              break;
            case 'highshelf':
              highshelfCheckbox.checked = c.value;
              highshelf = c.value;
              toggleHighshelf();
              break;
            case 'lowshelf':
              lowshelfCheckbox.checked = c.value;
              lowshelf = c.value;
              toggleLowshelf();
              break;
            case 'distortion':
              distortionCheckbox.checked = c.value;
              distortion = c.value;
              toggleDistortion();
              break;
            case 'rockets':
              rocketCheckbox.checked = c.value;
              rocketDraw = c.value;
              break;
            case 'waveform':
              waveformCheckbox.checked = c.value;
              drawParams.useWaveform = c.value;
            default:
              break;
          }
        }
      }
    }
  };

  xhr.onerror = (e) => {
    const target = e.target as XMLHttpRequest;
    console.log(`In onerror - HTTP Status Code = ${target.status}`);
  }

  xhr.open("GET", url);
  xhr.send();
}

export { init, highshelf };