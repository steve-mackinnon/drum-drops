import { Body, Bodies, Composite, Engine, Events } from "matter-js";
import * as PIXI from "pixi.js";
import { playPluck } from "./audio";
import { Entity } from "./shape";
import "./style.css";
import { createSurface, renderPoly } from "./entityfactory";

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

const ground = createSurface(physicsEngine.world, container, {
  x: 0,
  y: 0,
  width: 200,
  height: 10,
  angle: 10,
});

app.stage.onpointerdown = (ev: PIXI.FederatedPointerEvent) => {
  const local = container.toLocal(ev.global);
  const ro = new PIXI.Graphics();
  ro.beginFill(0x33ff00);
  ro.drawCircle(0, 0, 5);

  container.addChild(ro);

  const shape: Entity = {
    graphics: ro,
    body: Bodies.circle(local.x, local.y, 5),
  };
  shape.body.mass = 1;
  shape.body.restitution = 0.9;
  Composite.add(physicsEngine.world, shape.body);
  shapes.push(shape);
};

// Set all sprite's properties to the same value, animated over time
let elapsed = 0.0;
app.ticker.add((delta) => {
  Engine.update(physicsEngine, delta);

  renderPoly(ground);

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
    }
  }
  shapes = shapes.filter((_, i) => !indicesToRemove.includes(i));
});

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
function handleResize() {
  app.stage.hitArea = new PIXI.Rectangle(
    0,
    0,
    window.innerWidth,
    window.innerHeight,
  );

  const scaleX = innerWidth / screenWidth;
  screenWidth = innerWidth;
  screenHeight = innerHeight;
  Body.scale(ground.body, scaleX, 1);
  Body.setPosition(ground.body, {
    x: screenWidth / 2, // - groundWidth / 2,
    y: screenHeight / 2, // - groundHeight / 2,
  });
}
handleResize();
window.addEventListener("resize", handleResize);
