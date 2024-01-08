import { Body, Bodies, Composite, Engine, Events } from "matter-js";
import * as PIXI from "pixi.js";
import { playPluck } from "./audio";
import { Entity } from "./shape";
import "./style.css";
import {
  createRainDrop,
  createRandomizedSurfaces,
  renderPoly,
} from "./entityfactory";

const app = new PIXI.Application<HTMLCanvasElement>({
  background: "#000000",
  resizeTo: window,
  eventMode: "static",
  antialias: true,
  eventFeatures: {
    move: false,
    globalMove: false,
    click: true,
    wheel: false,
  },
});
// @ts-ignore
globalThis.__PIXI_APP__ = app;

app.ticker.start();

const physicsEngine = Engine.create();
physicsEngine.gravity.scale = 0.1;

Events.on(physicsEngine, "collisionStart", (e) => {
  let maxSpeed = 0;
  for (const pair of e.pairs) {
    maxSpeed = Math.max(maxSpeed, Math.max(pair.bodyA.speed, pair.bodyB.speed));
  }
  playPluck(maxSpeed);
});

let shapes: Entity[] = [];

document.body.appendChild(app.view);

// Add a container to center our sprite stack on the page
const container = new PIXI.Container();
container.eventMode = "static";
app.stage.addChild(container);

const surfaces = createRandomizedSurfaces(physicsEngine.world, container, 40);

app.stage.onpointerdown = (ev: PIXI.FederatedPointerEvent) => {
  const local = container.toLocal(ev.global);
  shapes.push(createRainDrop(physicsEngine.world, container, local));
};

// Set all sprite's properties to the same value, animated over time
let elapsed = 0.0;
app.ticker.add((delta) => {
  if (Math.random() > 0.98) {
    shapes.push(createRainDrop(physicsEngine.world, container));
  }
  Engine.update(physicsEngine, delta);

  for (const surface of surfaces) {
    renderPoly(surface);
  }

  elapsed += delta / 60;
  const amount = Math.sin(elapsed);
  const scale = 1.0 + 0.25 * amount;
  const alpha = 0.8 + 0.25 * amount;
  const angle = 40 * amount;

  let indicesToRemove: number[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    shape.graphics.scale.set(scale);
    shape.graphics.alpha = alpha;
    shape.graphics.angle = angle;
    shape.graphics.x = shape.body.position.x;
    shape.graphics.y = shape.body.position.y;

    if (shape.graphics.y > innerHeight + 100) {
      indicesToRemove.push(i);
      shape.graphics.destroy();
    }
  }
  shapes = shapes.filter((_, i) => !indicesToRemove.includes(i));
});

function handleResize() {
  app.stage.hitArea = new PIXI.Rectangle(
    0,
    0,
    window.innerWidth,
    window.innerHeight,
  );
}
handleResize();
window.addEventListener("resize", handleResize);
