/** A floor-bound male student with a star tier and click-to-conquer progress. */
export class Boy {
  constructor(id, x, floor, star, config) {
    this.id = id;
    this.x = x;
    this.y = 420;
    this.floor = floor;
    this.star = star;
    this.difficulty = config.boyStarDifficulty[star - 1];
    this.clickRequirement = Math.ceil(config.baseClicks * this.difficulty);
    this.clickProgress = 0;
    this.variant = (star + id) % 4;
    this.state = 'available';
    this.direction = Math.random() < .5 ? -1 : 1;
    this.speed = 34 + star * 5 + Math.random() * 22;
    this.stopTime = 0;
    this.age = Math.random() * 8;
    this.followIndex = 0;
    this.rivalVictories = 0;
  }

  /** Patrols this hallway, pauses now and then, or follows after conquest. */
  update(dt, player, floorWidth) {
    this.age += dt;
    if (this.state === 'following') {
      const targetX = player.x - player.facing * (52 + this.followIndex * 30);
      this.x += (targetX - this.x) * Math.min(1, dt * 2.8);
      this.y = player.y + (this.followIndex % 2 ? -7 : 3);
      return;
    }
    if (this.state !== 'available') return;
    this.stopTime = Math.max(0, this.stopTime - dt);
    if (this.stopTime <= 0) {
      this.x += this.direction * this.speed * dt;
      if (this.x < 60 || this.x > floorWidth - 60) this.direction *= -1;
      this.x = Math.max(60, Math.min(floorWidth - 60, this.x));
      if (Math.random() < dt * .025) { this.direction *= -1; this.stopTime = .2 + Math.random() * .7; }
    }
  }

  /** Adds one successful click to the conquest heart. */
  click() { this.clickProgress = Math.min(this.clickRequirement, this.clickProgress + 1); }

  /** Reports the fraction filled for the floating heart meter. */
  get progress() { return this.clickProgress / this.clickRequirement; }
}
