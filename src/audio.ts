export function playPluck(audioContext: AudioContext, speed: number) {
  const gain = speed / 160.0;
  const frequency = 100 + (speed / 160.0) * 800;
  const decay = speed / 160.0;

  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  const gainNode = audioContext.createGain();
  gainNode.gain.value = gain;
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + decay
  );
  oscillator.connect(gainNode);
  oscillator.start();

  gainNode.connect(audioContext.destination);
}
