import { MusicPlayer } from './MusicPlayer.js';
import { SoundEffects } from './SoundEffects.js';

/** Coordinates optional music and effects behind one user-facing sound toggle. */
export class AudioManager {
  constructor() {
    this.music = new MusicPlayer();
    this.effects = new SoundEffects();
    this.musicEnabled = false;
    this.effectsEnabled = false;
  }

  /** Toggles background music without changing one-shot effects. */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) this.music.play();
    else this.music.stop();
    return this.musicEnabled;
  }

  /** Toggles sound effects without changing the music loop. */
  toggleEffects() {
    this.effectsEnabled = !this.effectsEnabled;
    return this.effectsEnabled;
  }

  /** Unlocks the shared Web Audio context following a user gesture. */
  unlock() {
    this.music.unlock();
    this.effects.unlock();
  }

  /** Plays a success cue through the sound-effects service. */
  playNote() {
    if (this.effectsEnabled) this.effects.playNote();
  }

  /** Plays a caught cue through the sound-effects service. */
  playWarning() {
    if (this.effectsEnabled) this.effects.playWarning();
  }
}
