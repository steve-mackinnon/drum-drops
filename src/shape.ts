import { Body } from "matter-js";
import { Graphics } from "pixi.js";

export interface Entity {
  graphics: Graphics;
  body: Body;
  alpha: number;
}
