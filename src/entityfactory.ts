import { Entity } from "./shape";
import * as PIXI from "pixi.js";
import { Bodies, Composite, World } from "matter-js";

export interface SurfaceInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}
export function createSurface(
  world: World,
  container: PIXI.Container,
  info: SurfaceInfo,
): Entity {
  const surface: Entity = {
    renderObject: (() => {
      const ro = new PIXI.Graphics();
      ro.beginFill(0xff11ee);
      ro.drawRect(
        info.x - info.width / 2,
        info.y - info.height / 2,
        info.width,
        info.height,
      );
      ro.angle = info.angle;
      return ro;
    })(),
    body: Bodies.rectangle(0, 0, 200, 10, {
      isStatic: true,
      angle: info.angle,
    }),
  };
  Composite.add(world, surface.body);
  container.addChild(surface.renderObject);
  return surface;
}
