import { Body, Composite, Engine, Events } from "matter-js";
import * as PIXI from "pixi.js";
import { playPluck } from "./audio";
import { Entity } from "./shape";
import "./style.css";
import {
  createRainDrop,
  createRandomizedSurfaces,
  renderPoly,
} from "./entityfactory";
import { clamp } from "./helpers";

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
  interface CollisionInfo {
    maxSpeed: number;
    pan: number;
    staticBody: Body | undefined;
  }
  const { maxSpeed, pan, staticBody } = e.pairs.reduce(
    (prev, current) => {
      const fastestBody = [current.bodyA, current.bodyB].reduce(
        (prev, current) => {
          return current.speed > prev.speed ? current : prev;
        },
      );
      const staticBodies = [current.bodyA, current.bodyB].filter(
        (b) => b.isStatic,
      );
      return fastestBody.speed > prev.maxSpeed
        ? {
            maxSpeed: fastestBody.speed,
            pan: (fastestBody.position.x / innerWidth) * 2 - 1,
            staticBody: staticBodies.length > 0 ? staticBodies[0] : undefined,
          }
        : prev;
    },
    { maxSpeed: 0, pan: 0, staticBody: undefined } as CollisionInfo,
  );
  playPluck(maxSpeed, clamp(pan * 0.75, -1, 1));
  if (staticBody) {
    const surface = surfaces.find((s) => s.body.id === staticBody.id);
    if (surface) {
      surface.alpha = Math.min(1.0, maxSpeed / 160);
    }
  }
});

let drops: Entity[] = [];

// Add game canvas to document
app.view.className = "game";
const resetButton = document.getElementById("reset-button");
document.body.insertBefore(app.view, resetButton);

// Add a container to center our sprite stack on the page
const container = new PIXI.Container();
container.eventMode = "static";
app.stage.addChild(container);

let surfaces = createMap();

let userHasInteracted = false;
app.stage.onpointerdown = (ev: PIXI.FederatedPointerEvent) => {
  userHasInteracted = true;
  const local = container.toLocal(ev.global);
  drops.push(createRainDrop(physicsEngine.world, container, local));
};

// Set all sprite's properties to the same value, animated over time
app.ticker.add((delta) => {
  if (userHasInteracted && Math.random() > 0.99) {
    drops.push(createRainDrop(physicsEngine.world, container));
  }
  Engine.update(physicsEngine, delta);

  for (const surface of surfaces) {
    renderPoly(surface);
    if (surface.alpha > 0.2) {
      surface.alpha *= 0.9;
    }
  }

  let indicesToRemove: number[] = [];
  const gravity = {
    x: 0,
    y: 0.1,
  };
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

function createMap() {
  // Determine the number of surfaces based on the screen width
  const numSurfaces = (22 * (innerWidth * innerHeight)) / 425000;
  return createRandomizedSurfaces(physicsEngine.world, container, numSurfaces);
}

resetButton?.addEventListener("mousedown", () => {
  if (!surfaces) {
    return;
  }
  for (const surface of surfaces) {
    surface.graphics.destroy();
    Composite.remove(physicsEngine.world, surface.body);
  }
  surfaces = createMap();
});
