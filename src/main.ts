import './style.css'
import * as PIXI from 'pixi.js';

const app = new PIXI.Application<HTMLCanvasElement>({ 
  background: '#1099bb', 
  resizeTo: window,
  eventMode: 'passive',
  eventFeatures: {
    move: true,
    globalMove: false,
    click: true,
    wheel: true,
  }
});

document.body.appendChild(app.view);

// Add a container to center our sprite stack on the page
const container = new PIXI.Container();
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;
app.stage.addChild(container);

const shapes: PIXI.Graphics[] = [];
const radiusValues: number[] = [];

for (let i = 0; i < 5; ++i) {
  let shape = new PIXI.Graphics();
  shape.beginFill(0xffff00);
  shape.drawCircle(10, 10, 5);
  container.addChild(shape);
  shapes.push(shape);
  radiusValues.push(5);

  shape.interactive = true;
  shape.onpointerdown = () => {
    radiusValues[i] = radiusValues[i] * 2;
    shape.drawCircle(10, 10, radiusValues[i]);
  };
}

// Set all sprite's properties to the same value, animated over time
let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta / 60;
  const amount = Math.sin(elapsed);
  const scale = 1.0 + 0.25 * amount;
  const alpha = 0.75 + 0.25 * amount;
  const angle = 40 * amount;
  const x = 75 * amount;
  for (let i = 0; i < shapes.length; i++) {
    const sprite = shapes[i];
    sprite.scale.set(scale);
    sprite.alpha = alpha;
    sprite.angle = angle;
    sprite.x = x;
    sprite.y = -200;
  }
});

