import * as Tone from "tone";

// const audioContext = new AudioContext();
const output = new Tone.Reverb({
  wet: 0.2,
  decay: 2.0,
}).toDestination();

loadBuffers();

async function createBufferFromFile(filename: string) {
  const file = await fetch(filename);
  const buffer = await file.arrayBuffer();

  const audioContext = Tone.context.rawContext;
  const decoded = await audioContext.decodeAudioData(buffer);
  return decoded;
}

async function loadBuffers() {
  buffers = await Promise.all([
    createBufferFromFile("cowbell.wav"),
    createBufferFromFile("kick.wav"),
    createBufferFromFile("shaker.wav"),
    createBufferFromFile("tomlow.wav"),
    createBufferFromFile("tomlower.wav"),
    createBufferFromFile("snare.wav"),
    createBufferFromFile("ride.wav"),
    createBufferFromFile("uh.wav"),
    createBufferFromFile("808long.wav"),
  ]);
}

let buffers: AudioBuffer[];

function getRandomBuffer() {
  const val = Math.random();
  const increment = 1.0 / buffers.length;
  for (let i = 0; i < buffers.length; ++i) {
    if (val < i * increment + increment) {
      return buffers[i];
    }
  }
  return buffers[0];
}

export async function playPluck(speed: number, pan: number) {
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }

  let gain = 0.1 * (speed / 160.0);
  const frequency = 100 + (speed / 160.0) * 800;
  const decay = speed / 160.0;

  const audioContext = Tone.context.rawContext;
  let node: AudioScheduledSourceNode;
  if (Math.random() > 0.3) {
    const sample = audioContext.createBufferSource();
    sample.buffer = getRandomBuffer();
    node = sample;
  } else {
    const osc = audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    node = osc;
    gain *= 0.6;
  }

  const gainNode = audioContext.createGain();
  gainNode.gain.value = gain;
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + decay,
  );
  const panNode = audioContext.createStereoPanner();
  panNode.pan.value = pan;
  node.connect(panNode).connect(gainNode);
  node.start();
  node.stop(audioContext.currentTime + decay);

  gainNode.connect(output.input.input);
}
