let ctx;
let canvas;
let paused = false;
let createRectangles = true;
let createArcs = true;
let createLines = true;

import { getRandomColor, getRandomInt } from "./utils.js";
import { drawRectangle, drawArc, drawLine } from "./canvas-utlis.js";

const init = () => {
    console.log("page loaded!");
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    setupUI();
    update();
}

const update = () => {
    if (paused) return;
    requestAnimationFrame(update);
    if (createRectangles) drawRandomRect(ctx);
    if (createArcs) drawRandomArc(ctx);
    if (createLines) drawRandomLine(ctx);
}

//draws a random rectangle
const drawRandomRect = (ctx) => {
    drawRectangle(ctx, getRandomInt(0, 1280), getRandomInt(0, 720), getRandomInt(0, 100), getRandomInt(0, 100), getRandomColor(), getRandomInt(2, 10), getRandomColor());
}

//draws a random circle
const drawRandomArc = (ctx) => {
    drawArc(ctx, getRandomInt(0, 1280), getRandomInt(0, 720), getRandomInt(1, 75), getRandomColor(), getRandomInt(2, 10), getRandomColor());
}

//draws a random line
const drawRandomLine = (ctx) => {
    drawLine(ctx, getRandomInt(0, 1280), getRandomInt(0, 720), getRandomInt(0, 1280), getRandomInt(0, 720), getRandomInt(1, 10), getRandomColor());
}

const canvasClicked = (e) => {
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;
    console.log(mouseX, mouseY);

    for (let i = 0; i < 10; i++) {
        let x = getRandomInt(-100, 100) + mouseX;
        let y = getRandomInt(-100, 100) + mouseY;
        let radius = getRandomInt(10, 50);
        let color = getRandomColor();
        drawArc(ctx, x, y, radius, color);
    }
}

const setupUI = () => {
    document.querySelector("#btn-pause").onclick = function () {
        paused = true;
    };

    document.querySelector("#btn-play").onclick = function () {
        if (paused) {
            paused = false;
            update();
        }
    };

    document.querySelector("#btn-clear").onclick = function () {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 1280, 720);
        ctx.restore();
    }

    document.querySelector("#cb-rectangles").onclick = function (e) {
        createRectangles = e.target.checked;
    }

    document.querySelector("#cb-arcs").onclick = function (e) {
        createArcs = e.target.checked;
    }

    document.querySelector("#cb-lines").onclick = function (e) {
        createLines = e.target.checked;
    }

    canvas.onclick = canvasClicked;
}

init();