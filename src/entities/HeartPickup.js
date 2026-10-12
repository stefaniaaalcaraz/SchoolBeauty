/** Bouncing heart collectible that restores energy and adds to the score. */
export class HeartPickup {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.collected = false;
    this.life = 10;
  }

  /** Bobs visibly so the player can spot the heart on the floor. */
  update(delta) {
    this.age += delta;
    this.y += Math.sin(this.age * 4) * 0.15;
    return this.age < this.life;
  }
}
