import { Body, Bodies, Composite, Engine, Events } from "matter-js";
import * as PIXI from "pixi.js";
import { playPluck } from "./audio";
import { Entity } from "./shape";
import "./style.css";
import { createSurface } from "./entityfactory";

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
  angle: 0,
});
app.stage.onpointerdown = (ev: PIXI.FederatedPointerEvent) => {
  const local = container.toLocal(ev.global);
  const ro = new PIXI.Graphics();
  ro.beginFill(0x33ff00);
  ro.drawCircle(0, 0, 5);

  container.addChild(ro);

  const shape: Entity = {
    renderObject: ro,
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

  ground.renderObject.x = ground.body.position.x;
  ground.renderObject.y = ground.body.position.y;

  const groundWidth = ground.body.bounds.max.x - ground.body.bounds.min.x;
  const groundHeight = ground.body.bounds.max.y - ground.body.bounds.min.y;
  ground.renderObject.width = groundWidth;
  ground.renderObject.height = groundHeight;

  elapsed += delta / 60;
  const amount = Math.sin(elapsed);
  const scale = 1.0 + 0.25 * amount;
  const alpha = 0.8 + 0.25 * amount;
  const angle = 40 * amount;

  let indicesToRemove: number[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    shape.renderObject.scale.set(scale);
    shape.renderObject.alpha = alpha;
    shape.renderObject.angle = angle;
    shape.renderObject.x = shape.body.position.x;
    shape.renderObject.y = shape.body.position.y;

    if (shape.renderObject.y > innerHeight + 100) {
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
