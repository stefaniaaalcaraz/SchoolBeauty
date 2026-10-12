/** Mouse-directed avatar with smooth movement and temporary teacher stun. */
export class Player {
  constructor() {
    this.x = 135;
    this.y = 490;
    this.targetX = this.x;
    this.targetY = this.y;
    this.stun = 0;
    this.hitCooldown = 0;
    this.facing = 1;
  }

  /** Exposes a renderer-friendly position snapshot. */
  get position() { return { x: this.x, y: this.y }; }

  /** Converts normalized pointer coordinates into a safe hallway destination. */
  setDestination(point) {
    this.targetX = 70 + point.x * 820;
    this.targetY = 280 + point.y * 215;
  }

  /** Eases toward the pointer and ticks down collision protection. */
  update(delta) {
    this.stun = Math.max(0, this.stun - delta);
    this.hitCooldown = Math.max(0, this.hitCooldown - delta);
    if (this.stun > 0) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.facing = dx < 0 ? -1 : 1;
    const ease = Math.min(1, delta * 4.8);
    this.x += dx * ease;
    this.y += dy * ease;
    this.x = Math.max(52, Math.min(908, this.x));
    this.y = Math.max(275, Math.min(510, this.y));
  }

  /** Applies knockback after a teacher collision. */
  knockBack(direction) {
    this.stun = 0.75;
    this.hitCooldown = 2;
    this.x += direction * 90;
    this.x = Math.max(52, Math.min(908, this.x));
  }
}
