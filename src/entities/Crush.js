/** Tracks small animation details for the crush character. */
export class Crush {
  constructor() {
    this.gaze = 0;
    this.blink = 0;
  }

  /** Resets animation state for a fresh round. */
  reset() {
    this.gaze = 0;
    this.blink = 0;
  }

  /** Eases the eyes toward the pointer and advances blink timing. */
  update(delta, pointer) {
    this.gaze += ((pointer.x - 0.72) * 0.12 - this.gaze) * Math.min(1, delta * 4);
    this.blink = (this.blink + delta) % 4.2;
  }
}
