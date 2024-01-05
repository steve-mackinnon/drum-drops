import { Entity } from "./shape";
import "./style.css";
import * as PIXI from "pixi.js";
import { Engine, Bodies, Composite } from "matter-js";

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

const physicsEngine = Engine.create();
physicsEngine.gravity.scale = 0.1;

Composite.add(
  physicsEngine.world,
  Bodies.rectangle(0, 200, 1000, 10, { isStatic: true })
);

const shapes: Entity[] = [];

document.body.appendChild(app.view);

// Add a container to center our sprite stack on the page
const container = new PIXI.Container();
container.hitArea = new PIXI.Rectangle(0, 0, 10000, 10000);
container.eventMode = "dynamic";
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;
app.stage.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000);
app.stage.addChild(container);

const ground = new PIXI.Graphics();
ground.beginFill(0xff0000);
ground.drawRect(-500, 200, 1000, 10);
container.addChild(ground);

app.stage.onpointerdown = (ev: PIXI.FederatedPointerEvent) => {
  const local = container.toLocal(ev.global);
  console.log(local);
  const ro = new PIXI.Graphics();
  ro.beginFill(0x33ff00);
  ro.drawCircle(0, 0, 5);

  container.addChild(ro);

  const shape: Entity = {
    renderObject: ro,
    body: Bodies.circle(local.x, local.y, 5),
  };
  shape.body.mass = 1;
  Composite.add(physicsEngine.world, shape.body);
  shapes.push(shape);
};

// Set all sprite's properties to the same value, animated over time
let elapsed = 0.0;
app.ticker.add((delta) => {
  Engine.update(physicsEngine, delta);

  elapsed += delta / 60;
  const amount = Math.sin(elapsed);
  const scale = 1.0 + 0.25 * amount;
  const alpha = 0.75 + 0.25 * amount;
  const angle = 40 * amount;
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    shape.renderObject.scale.set(scale);
    shape.renderObject.alpha = alpha;
    shape.renderObject.angle = angle;
    shape.renderObject.x = shape.body.position.x;
    shape.renderObject.y = shape.body.position.y;
  }
});
