import * as Tone from "tone";

// const audioContext = new AudioContext();
const output = new Tone.Reverb({
  wet: 0.2,
  decay: 2.0,
}).toDestination();

async function createBufferFromFile(filename: string) {
  const file = await fetch(filename);
  const buffer = await file.arrayBuffer();

  const audioContext = Tone.context.rawContext;
  const decoded = await audioContext.decodeAudioData(buffer);
  return decoded;
}

const cowbell = await createBufferFromFile("cowbell.wav");
const kick = await createBufferFromFile("kick.wav");
const shaker = await createBufferFromFile("shaker.wav");
const tomLow = await createBufferFromFile("tomlow.wav");
const tomLower = await createBufferFromFile("tomlower.wav");
const snare = await createBufferFromFile("snare.wav");
const ride = await createBufferFromFile("snare.wav");
const uh = await createBufferFromFile("uh.wav");
const long808 = await createBufferFromFile("808long.wav");

const BUFFERS = [
  cowbell,
  kick,
  shaker,
  tomLow,
  tomLower,
  snare,
  ride,
  uh,
  long808,
];

function getRandomBuffer() {
  const val = Math.random();
  const increment = 1.0 / BUFFERS.length;
  for (let i = 0; i < BUFFERS.length; ++i) {
    if (val < i * increment + increment) {
      return BUFFERS[i];
    }
  }
  return kick;
}

export async function playPluck(speed: number) {
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }

  let gain = 0.1 * (speed / 160.0);
  const frequency = 100 + (speed / 160.0) * 800;
  const decay = speed / 160.0;

  const audioContext = Tone.context.rawContext;
  let node: AudioScheduledSourceNode;
  if (Math.random() > 0.3) {
    node = audioContext.createBufferSource();
    (node as AudioBufferSourceNode).buffer = getRandomBuffer();
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
    audioContext.currentTime + decay
  );
  node.connect(gainNode);
  node.start();
  node.stop(audioContext.currentTime + decay);

  gainNode.connect(output.input.input);
}
