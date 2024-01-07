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
    graphics: new PIXI.Graphics(),
    body: Bodies.rectangle(0, 0, 200, 10, {
      isStatic: true,
      angle: info.angle,
    }),
  };
  Composite.add(world, surface.body);
  container.addChild(surface.graphics);
  return surface;
}

export function renderPoly(surface: Entity) {
  surface.graphics.clear();
  surface.graphics.lineStyle(2, 0xff11ee);
  const origin = surface.body.vertices[0];
  surface.graphics.moveTo(origin.x, origin.y);
  for (let i = 0; i < surface.body.vertices.length; ++i) {
    const vertex = surface.body.vertices[i];
    surface.graphics.lineTo(vertex.x, vertex.y);
  }
  surface.graphics.lineTo(origin.x, origin.y);
}
