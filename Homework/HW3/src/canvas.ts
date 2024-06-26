/*
    The purpose of this file is to take in the analyser node and a <canvas> element: 
      - the module will create a drawing context that points at the <canvas> 
      - it will store the reference to the analyser node
      - in draw(), it will loop through the data in the analyser node
      - and then draw something representative on the canvas
      - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils';
import { highshelf } from './main';
import * as rocket from './classes/RocketSprite'
import { DrawParams } from 'interfaces/drawParams.interface';

let ctx : CanvasRenderingContext2D, canvasWidth : number, canvasHeight : number, gradient : CanvasGradient, analyserNode : AnalyserNode, audioData;
let rockets : Array<rocket.RocketSprite> = [], rocketImg : HTMLImageElement = new Image(), counter : number;


const setupCanvas = (canvasElement : HTMLCanvasElement, analyserNodeRef : AnalyserNode) => {
    // create drawing context
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "skyblue" }, { percent: 1, color: "lightpink" }]);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);

    rockets.push(new rocket.RocketSprite(utils.getRandom(50, 250), canvasHeight + utils.getRandom(0, 100), 30, 40, true, 1));
    rockets.push(new rocket.RocketSprite(utils.getRandom(500, 750), canvasHeight, 30, 40, true, 1));
    rockets.push(new rocket.RocketSprite(utils.getRandom(50, 150), 0 + utils.getRandom(0, 100), 30, 40, false, 1));
    rockets.push(new rocket.RocketSprite(utils.getRandom(400, 550), 0, 30, 40, false, 1));
    rocketImg.src = "./media/rocketship.png";
}

const draw = (params:DrawParams) => {
    if (params.useWaveform) {
        analyserNode.getByteTimeDomainData(audioData); // waveform data
    }
    else {
        analyserNode.getByteFrequencyData(audioData); // frequency data
    }

    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3 - draw gradient
    if (params.showGradient) {
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    // 4 - draw bars
    if (params.showBars) {
        let barSpacing = 4;
        let barWidth = 10;
        let barHeight = 150;
        counter = 0
        ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.50)';
        ctx.save();
        ctx.translate(canvasWidth / 2 + 3, canvasHeight / 2 - 71);

        for (let b of audioData) {
            let percent = b / 255;
            if (percent < .01) percent = .01;
            counter += percent;
            ctx.translate(barSpacing, 0);
            ctx.rotate(Math.PI * 2 / 32);
            ctx.save();
            ctx.scale(1, -1);
            ctx.fillStyle = `rgb(${b}, ${b}, ${b})`;
            ctx.fillRect(0, 0, barWidth, barHeight * percent);
            ctx.restore();
            ctx.translate(barWidth, 0);
        }

        ctx.restore();

        //when the percent of all of the data is higher than a specific amount, increase size of rockets
        //typically makes rockets larger on drum beats
        if (highshelf) {
            if (counter > 30) {
                for (let r of rockets) {
                    r.scale = 1.1;
                }
            }
            else {
                for (let r of rockets) {
                    r.scale = 1;
                }
            }
        }
        else {
            if (counter > 15) {
                for (let r of rockets) {
                    r.scale = 1.1;
                }
            }
            else {
                for (let r of rockets) {
                    r.scale = 1;
                }
            }
        }
    }

    // 5 - draw circles
    if (params.showCircles) {
        let maxRadius = canvasHeight / 4;

        ctx.save();
        ctx.globalAlpha = 0.5;

        for (let i = 0; i < audioData.length; i++) {
            let percent = audioData[i] / 255;
            let circleRadius = percent * maxRadius;
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(255, 255, 255, .02);
            ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
        }

        ctx.restore();
    }
}

export { setupCanvas, draw, rockets, ctx, canvasHeight, canvasWidth };