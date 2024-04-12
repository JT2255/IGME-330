
let rocketImg : HTMLImageElement = new Image();
rocketImg.src = "media/rocketship.png"

import { canvasHeight, canvasWidth } from "../canvas";
import * as utils from '../utils';

//class for rockets
export class RocketSprite {
    x: number;
    y: number;
    width: number;
    height: number;
    up: boolean;
    speed: number;
    scale: number;

    constructor(x : number, y : number, width : number, height : number, up : boolean, scale : number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.up = up;
        this.speed = 1;
        this.scale = scale;
    }

    //update rocket position and loop around screen if it hits the border
    update() {
        if (this.up) {
            this.y -= 1 * this.speed;

            if (this.y < -50) {
                this.y = canvasHeight + utils.getRandom(0, 50);
                this.x = utils.getRandom(50, canvasWidth - 50);
                this.speed = utils.getRandom(1, 2);
            }
        }
        else {
            this.y -= 1 * this.speed;

            if (this.y < -canvasWidth - 50) {
                this.y = 50 - utils.getRandom(0, 50);
                this.x = utils.getRandom(50, canvasHeight - 50);
                this.speed = utils.getRandom(1, 2);
            }
        }
    }

    //draw rocket each frame
    draw(ctx) {
        if (this.up) {
            if (this.scale > 1) {
                ctx.save();
                ctx.drawImage(rocketImg, this.x - 1, this.y, this.width * this.scale, this.height * this.scale);
                ctx.restore();
            }
            else {
                ctx.save();
                ctx.drawImage(rocketImg, this.x, this.y, this.width * this.scale, this.height * this.scale);
                ctx.restore();
            }

        }
        else {
            if (this.scale > 1) {
                ctx.save();
                ctx.rotate(Math.PI / 2);
                ctx.drawImage(rocketImg, this.x - 1, this.y, this.width * this.scale, this.height * this.scale);
                ctx.restore();
            }
            else {
                ctx.save();
                ctx.rotate(Math.PI / 2);
                ctx.drawImage(rocketImg, this.x, this.y, this.width * this.scale, this.height * this.scale);
                ctx.restore();
            }

        }
    }
}