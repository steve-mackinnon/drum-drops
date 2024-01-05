import { Graphics } from "pixi.js";

export interface Shape {
    origin: {
        x: number;
        y: number;
    },
    renderObject: Graphics;
}