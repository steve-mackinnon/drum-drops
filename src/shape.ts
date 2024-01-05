import { Container } from "pixi.js";
import { Body } from "matter-js";

export interface Entity {
  renderObject: Container;
  body: Body;
}
