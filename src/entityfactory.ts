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
      density: 1000000000000,
    }),
    collisionRecency: 0,
  };
  Composite.add(world, surface.body);
  container.addChild(surface.graphics);
  return surface;
}

interface Position {
  x: number;
  y: number;
}
export function createRainDrop(
  world: World,
  container: PIXI.Container,
  origin?: Position,
): Entity {
  const ro = new PIXI.Graphics();
  ro.beginFill("rgb(246,228,182)");
  ro.drawCircle(0, 0, 5);

  const x = origin ? origin.x : Math.random() * innerWidth;
  const y = origin ? origin.y : 0;
  container.addChild(ro);

  const shape: Entity = {
    graphics: ro,
    body: Bodies.circle(x, y, 5),
    collisionRecency: 0,
  };
  shape.body.mass = 1;
  shape.body.restitution = 0.9;
  Composite.add(world, shape.body);
  return shape;
}

export function renderPoly(surface: Entity) {
  const interpolateColor = (
    neutral: PIXI.Color,
    active: PIXI.Color,
  ): PIXI.Color => {
    const interpolateChannel = (neutral: number, active: number) =>
      neutral + (active - neutral) * surface.collisionRecency;
    const r = interpolateChannel(neutral.red, active.red);
    const g = interpolateChannel(neutral.green, active.green);
    const b = interpolateChannel(neutral.blue, active.blue);
    return new PIXI.Color([r, g, b]);
  };
  surface.graphics.clear();
  const NEUTRAL_COLOR = new PIXI.Color([0.2, 0, 0.6]);
  const ACTIVE_COLOR = new PIXI.Color([1, 1, 1]);
  surface.graphics.beginFill(interpolateColor(NEUTRAL_COLOR, ACTIVE_COLOR));
  surface.graphics.drawPolygon(surface.body.vertices);
  surface.graphics.endFill();
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
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        width: Math.random() * 200 + 10,
        height: Math.random() * 10 + 10,
        angle: getRandomAngleInRadians(),
      }),
    );
  }
  return surfaces;
}

function getRandomAngleInRadians() {
  const a = (Math.PI / 4) * Math.random();
  if (Math.random() > 0.5) {
    return Math.PI + a;
  }
  return Math.PI - a;
}
