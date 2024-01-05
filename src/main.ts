import { Shape } from './shape';
import './style.css'
import * as PIXI from 'pixi.js';

const app = new PIXI.Application<HTMLCanvasElement>({ 
  background: '#000000', 
  resizeTo: window,
  eventMode: 'dynamic',
  antialias: true,
  eventFeatures: {
    move: true,
    globalMove: true,
    click: true,
    wheel: true,
  }
});

const shapes: Shape[] = [];

document.body.appendChild(app.view);

// Add a container to center our sprite stack on the page
const container = new PIXI.Container();
container.hitArea = new PIXI.Rectangle(0,0, 10000, 10000)
container.eventMode = 'dynamic';
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;
app.stage.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000);
app.stage.addChild(container);

app.stage.onpointerdown = (ev: PIXI.FederatedPointerEvent) => {
  const local = container.toLocal(ev.global);
  console.log(local);
  const ro = new PIXI.Graphics();
  ro.beginFill(0x33ff00);
  ro.drawCircle(0, 0, 5);
  
  container.addChild(ro);
  
  const shape: Shape = {
    origin: {
      x: local.x,
      y: local.y,
    },
    renderObject: ro
  };
  shapes.push(shape);
};

// Set all sprite's properties to the same value, animated over time
let elapsed = 0.0;
app.ticker.add((delta) => {
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
    shape.renderObject.x = shape.origin.x;
    shape.renderObject.y = shape.origin.y;
  }
});

