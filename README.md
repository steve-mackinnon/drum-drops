# Drum Drops

A small experimental web app that combines a physics simulation with a drum machine.

## What is this?

Drum Drops randomly generates a field of rigid surfaces, then periodically spawns ball objects that fall down into the field. When a collision occurs, a drum sample or oscillator (randomly chosen) will be played back. Its volume, pan, and pitch (for the oscillator) will be determined by the velocity and location of the ball when the collision occurs.

This is written in vanilla TypeScript and uses [Matter.js](https://brm.io/matter-js/) for physics, [Pixi.js](https://pixijs.com/) for 2D rendering, and WebAudio for audio playback.

## But... why?

This project was a random idea that I thought _might_ be interesting (but mostly hilarious). Hope you enjoy it!
