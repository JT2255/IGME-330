import { DEFAULTS } from "./enums/audio-defaults.enum";

// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx : AudioContext;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element : HTMLAudioElement, sourceNode : MediaElementAudioSourceNode, analyserNode : AnalyserNode, gainNode : GainNode, 
biquadFilter : BiquadFilterNode, lowshelfBiquad : BiquadFilterNode, distortionFilter : WaveShaperNode;

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
const setupWebaudio = (filePath : string) => {
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext;
    audioCtx = new AudioContext();

    // 2 - this creates an <audio> element
    element = new Audio();

    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node  
    analyserNode = audioCtx.createAnalyser(); // note the UK spelling of "Analyser"

    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.

    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = "highshelf";
    biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    biquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);

    lowshelfBiquad = audioCtx.createBiquadFilter();
    lowshelfBiquad.type = "lowshelf";
    lowshelfBiquad.frequency.setValueAtTime(1000, audioCtx.currentTime);
    lowshelfBiquad.gain.setValueAtTime(0, audioCtx.currentTime);

    distortionFilter = audioCtx.createWaveShaper();

    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(biquadFilter);
    biquadFilter.connect(lowshelfBiquad);
    lowshelfBiquad.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(distortionFilter);
    distortionFilter.connect(audioCtx.destination);
}

const loadSoundFile = (filePath : string) => {
    element.src = filePath;
}

const playCurrentSound = () => {
    element.play();
}

const pauseCurrentSound = () => {
    element.pause();
}

const setVolume = (value : number) => {
    value = Number(value); // make sure that it's a Number rather than a String
    gainNode.gain.value = value;
}

export { audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, analyserNode, biquadFilter, lowshelfBiquad, distortionFilter };