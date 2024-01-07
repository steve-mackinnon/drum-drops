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
    body: Bodies.rectangle(info.x, info.y, info.width, info.height, {
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

export function createRandomizedSurfaces(
  world: World,
  container: PIXI.Container,
  numToCreate: number,
): Entity[] {
  let surfaces: Entity[] = [];
  for (let i = 0; i < numToCreate; ++i) {
    surfaces.push(
      createSurface(world, container, {
        x: Math.random() * innerWidth * 0.8,
        y: Math.random() * innerHeight * 0.8,
        width: Math.random() * 200 + 10,
        height: Math.random() * 10 + 10,
        angle: Math.random() * 360,
      }),
    );
  }
  return surfaces;
}
