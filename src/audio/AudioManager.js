import { MusicPlayer } from './MusicPlayer.js';
import { SoundEffects } from './SoundEffects.js';

/** Coordinates optional music and effects behind one user-facing sound toggle. */
export class AudioManager {
  constructor() {
    this.music = new MusicPlayer();
    this.effects = new SoundEffects();
    this.enabled = false;
  }

  /** Toggles audio and returns the new state for the interface. */
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.music.play();
    else this.music.stop();
    return this.enabled;
  }

  /** Unlocks the shared Web Audio context following a user gesture. */
  unlock() {
    this.music.unlock();
    this.effects.unlock();
  }

  /** Plays a success cue through the sound-effects service. */
  playNote() {
    if (this.enabled) this.effects.playNote();
  }

  /** Plays a caught cue through the sound-effects service. */
  playWarning() {
    if (this.enabled) this.effects.playWarning();
  }
}
