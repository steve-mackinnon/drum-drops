import { Body } from "matter-js";
import { Container } from "pixi.js";

export interface Entity {
  renderObject: Container;
  body: Body;
}
