import * as Tone from "tone";

// const audioContext = new AudioContext();
const output = new Tone.Reverb({
  wet: 0.2,
  decay: 2.0,
}).toDestination();

export async function playPluck(speed: number) {
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }

  const gain = 0.7 * (speed / 160.0);
  const frequency = 100 + (speed / 160.0) * 800;
  const decay = speed / 160.0;

  const audioContext = Tone.context.rawContext;
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  const gainNode = audioContext.createGain();
  gainNode.gain.value = gain;
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + decay,
  );
  oscillator.connect(gainNode);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + decay);

  gainNode.connect(output.input.input);
}
