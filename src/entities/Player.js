/** Mouse-directed avatar with smooth movement and temporary teacher stun. */
export class Player {
  constructor() {
    this.x = 135;
    this.y = 430;
    this.targetX = this.x;
    this.targetY = this.y;
    this.stun = 0;
    this.hitCooldown = 0;
    this.fallen = 0;
    this.facing = 1;
  }

  /** Exposes a renderer-friendly position snapshot. */
  get position() { return { x: this.x, y: this.y }; }

  /** Converts normalized pointer coordinates into a safe hallway destination. */
  setDestination(point) {
    this.targetX = 45 + point.x * 1010;
    // The source game is a side-view hall: pointer height aims, while walking
    // stays grounded on the corridor floor.
    this.targetY = 430;
  }

  /** Eases toward the pointer and ticks down collision protection. */
  update(delta) {
    this.stun = Math.max(0, this.stun - delta);
    this.hitCooldown = Math.max(0, this.hitCooldown - delta);
    this.fallen = Math.max(0, this.fallen - delta);
    if (this.stun > 0) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.facing = dx < 0 ? -1 : 1;
    // The cursor distance controls the gait: nearby destinations are a walk,
    // far destinations are a brisk run, matching the source game's tutorial.
    const distance = Math.abs(dx);
    const speed = distance > 150 ? 390 : 220;
    const ease = Math.min(1, (speed * delta) / Math.max(1, distance));
    this.x += dx * ease;
    this.y += dy * ease;
    this.x = Math.max(35, Math.min(1065, this.x));
    this.y = Math.max(260, Math.min(465, this.y));
  }

  /** Applies knockback after a teacher collision. */
  knockBack(direction) {
    this.stun = 0.75;
    this.fallen = 0.8;
    this.hitCooldown = 2;
    this.x += direction * 90;
    this.x = Math.max(35, Math.min(1065, this.x));
  }
}
