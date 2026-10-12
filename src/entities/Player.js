/** Keyboard-controlled protagonist with walking, running, fall, and exhaustion. */
export class Player {
  constructor() {
    this.x = 550;
    this.y = 430;
    this.floor = 0;
    this.moveAxis = 0;
    this.running = false;
    this.facing = 1;
    this.animationTime = 0;
    this.fallen = 0;
    this.exhausted = 0;
  }

  /** Applies horizontal direction and run state from normalized keyboard input. */
  setControls(axis, running) {
    this.moveAxis = Math.max(-1, Math.min(1, axis));
    this.running = Boolean(running && this.moveAxis);
  }

  /** Walks within the current floor and returns stamina used this frame. */
  update(dt, floorWidth) {
    this.animationTime += dt * (this.moveAxis ? (this.running ? 14 : 8) : 2);
    this.fallen = Math.max(0, this.fallen - dt);
    this.exhausted = Math.max(0, this.exhausted - dt);
    if (this.fallen > 0 || this.exhausted > 0) return 0;
    const speed = this.running ? 390 : 300;
    this.x += this.moveAxis * speed * dt;
    this.x = Math.max(28, Math.min(floorWidth - 28, this.x));
    if (this.moveAxis) this.facing = Math.sign(this.moveAxis);
    return this.moveAxis ? (this.running ? 1.3 : 1) : 0;
  }

  /** Knocks the protagonist down after touching a teacher or losing a duel. */
  knockBack(direction) {
    this.fallen = 1.1;
    this.x = Math.max(28, this.x + direction * 90);
  }

  /** Stops movement for a short recovery when stamina reaches zero. */
  exhaust(seconds) {
    this.exhausted = Math.max(this.exhausted, seconds);
  }
}
