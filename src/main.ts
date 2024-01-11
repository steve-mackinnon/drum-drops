import { Body, Engine, Events } from "matter-js";
import * as PIXI from "pixi.js";
import { playPluck } from "./audio";
import { Entity } from "./shape";
import "./style.css";
import {
  createRainDrop,
  createRandomizedSurfaces,
  renderPoly,
} from "./entityfactory";

const gravity = {
  x: 0,
  y: 0.1,
};
const app = new PIXI.Application<HTMLCanvasElement>({
  background: "rgb(10,10,10)",
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
physicsEngine.gravity.scale = 0;

Events.on(physicsEngine, "collisionStart", (e) => {
  let maxSpeed = 0;
  for (const pair of e.pairs) {
    maxSpeed = Math.max(maxSpeed, Math.max(pair.bodyA.speed, pair.bodyB.speed));
  }
  playPluck(maxSpeed);
});

let drops: Entity[] = [];

document.body.appendChild(app.view);

// Add a container to center our sprite stack on the page
const container = new PIXI.Container();
container.eventMode = "static";
app.stage.addChild(container);

// Determine the number of surfaces based on the screen width
const numSurfaces = (22 * (innerWidth * innerHeight)) / 425000;
const surfaces = createRandomizedSurfaces(
  physicsEngine.world,
  container,
  numSurfaces,
);

let userHasInteracted = false;
app.stage.onpointerdown = (ev: PIXI.FederatedPointerEvent) => {
  userHasInteracted = true;
  const local = container.toLocal(ev.global);
  drops.push(createRainDrop(physicsEngine.world, container, local));
};

// Set all sprite's properties to the same value, animated over time
let elapsed = 0.0;
app.ticker.add((delta) => {
  if (userHasInteracted && Math.random() > 0.99) {
    drops.push(createRainDrop(physicsEngine.world, container));
  }
  Engine.update(physicsEngine, delta);

  for (const surface of surfaces) {
    renderPoly(surface);
  }

  elapsed += delta / 60;

  let indicesToRemove: number[] = [];
  for (let i = 0; i < drops.length; i++) {
    const drop = drops[i];
    Body.applyForce(drop.body, drop.body.position, {
      x: drop.body.mass * gravity.x,
      y: drop.body.mass * gravity.y,
    });
    drop.graphics.x = drop.body.position.x;
    drop.graphics.y = drop.body.position.y;

    if (drop.graphics.y > innerHeight + 100) {
      indicesToRemove.push(i);
      drop.graphics.destroy();
    }
  }
  drops = drops.filter((_, i) => !indicesToRemove.includes(i));
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
