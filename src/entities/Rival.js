/** Rival student patrols between crushes and can contest a boy. */
export class Rival {
  constructor(x, y, routeWidth = 230) {
    this.x = x;
    this.y = y;
    this.centerX = x;
    this.routeWidth = routeWidth;
    this.age = Math.random() * 3;
    this.stunned = 0;
    this.variant = Math.floor(Math.random() * 3);
    this.pressure = 0;
    this.retreating = false;
  }

  /** Patrols the hallway and briefly retreats after losing a duel. */
  update(delta) {
    this.age += delta;
    this.stunned = Math.max(0, this.stunned - delta);
    if (this.retreating) return;
    if (this.stunned > 0) return;
    this.x = this.centerX + Math.sin(this.age * 0.42) * this.routeWidth;
  }

  /** Makes the rival back off from the boy after the player wins. */
  retreat() {
    this.retreating = true;
    this.stunned = 3.5;
    this.centerX = this.x > 480 ? 1060 : -120;
  }
}
