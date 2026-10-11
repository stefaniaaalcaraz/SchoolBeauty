/** Synthesizes one-shot feedback sounds independently from background music. */
export class SoundEffects {
  constructor() {
    this.context = null;
  }

  /** Creates or resumes this effects service's Web Audio context. */
  unlock() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.context.state === 'suspended') this.context.resume();
  }

  /** Plays two ascending triangle tones when a flirt succeeds. */
  playNote() {
    this.playTone(660, 0.16, 'triangle', 0.08);
    window.setTimeout(() => this.playTone(880, 0.2, 'triangle', 0.06), 90);
  }

  /** Plays a soft lower tone when a friend catches the player. */
  playWarning() {
    this.playTone(190, 0.3, 'sine', 0.05);
  }

  /** Synthesizes one short note with a smooth volume envelope. */
  playTone(frequency, duration, waveform, volume) {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}
