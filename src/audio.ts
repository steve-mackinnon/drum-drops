export function playPluck(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

  const gain = audioContext.createGain();
  gain.gain.value = 0.7;
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
  oscillator.connect(gain);
  oscillator.start();

  gain.connect(audioContext.destination);
}
