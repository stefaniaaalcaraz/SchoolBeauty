/** Owns the gentle repeating background motif, separate from one-shot effects. */
export class MusicPlayer {
  constructor() {
    this.context = null;
    this.timer = null;
    this.notes = [261.63, 329.63, 392, 329.63];
    this.noteIndex = 0;
  }

  /** Lazily creates or resumes this player's Web Audio context. */
  unlock() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.context.state === 'suspended') this.context.resume();
  }

  /** Starts the repeating motif once; calling twice does not duplicate it. */
  play() {
    if (this.timer) return;
    this.unlock();
    this.timer = window.setInterval(() => {
      this.playTone(this.notes[this.noteIndex++ % this.notes.length]);
    }, 620);
  }

  /** Stops the loop while leaving the audio context ready for another round. */
  stop() {
    window.clearInterval(this.timer);
    this.timer = null;
  }

  /** Synthesizes a soft background note with a quick attack and gentle fade. */
  playTone(frequency) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.03, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.42);
  }
}
