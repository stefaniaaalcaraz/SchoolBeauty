/** Rival girl with her own tier, escort target, and showdown click race. */
export class Rival {
  constructor(id, x, floor, level, options = {}) {
    this.id = id;
    this.x = x;
    this.y = 420;
    this.floor = floor;
    this.level = level;
    this.targetBoyId = options.targetBoyId ?? null;
    this.girlfriend = Boolean(options.girlfriend);
    this.variant = (level + id) % 4;
    this.centerX = x;
    this.range = options.range ?? 140;
    this.age = Math.random() * 4;
    this.direction = Math.random() < .5 ? -1 : 1;
    this.battleClicks = 0;
    this.battleRequirement = 4 + level * 2;
    this.opponentProgress = 0;
    this.defeated = false;
    this.retreatTime = 0;
  }

  /** Patrols within one floor and retreats briefly after a lost showdown. */
  update(dt, floorWidth) {
    this.age += dt;
    if (this.defeated) { this.retreatTime = Math.max(0, this.retreatTime - dt); return; }
    this.x = this.centerX + Math.sin(this.age * .36) * this.range;
    this.x = Math.max(55, Math.min(floorWidth - 55, this.x));
  }

  /** Adds a player click to the rival's side of the tug-of-war. */
  click() { this.battleClicks += 1; }

  /** Returns true once the rival has lost and should retreat. */
  defeat() {
    this.defeated = true;
    this.retreatTime = 2.5;
    return true;
  }
}
