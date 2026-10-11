/** Passing classmate with a timed entrance, visible period, and exit. */
export class Friend {
  constructor(watching) {
    this.watching = watching;
    this.age = 0;
    this.duration = 3.5 + Math.random();
    this.side = Math.random() < 0.5 ? 1 : -1;
    this.variant = 1 + Math.floor(Math.random() * 3);
    this.visible = false;
  }

  /** Advances lifecycle and reports whether the friend remains in the scene. */
  update(delta) {
    this.age += delta;
    this.visible = this.age > 0.3 && this.age < this.duration - 0.35;
    return this.age < this.duration;
  }

  /** Maps age to the friend's horizontal walk across the corridor. */
  position(width) {
    const progress = this.age / this.duration;
    const x = this.side > 0
      ? -145 + progress * (width + 240)
      : width + 145 - progress * (width + 240);
    return { x: x + Math.sin(this.age * 8) * 3, direction: this.side };
  }
}
