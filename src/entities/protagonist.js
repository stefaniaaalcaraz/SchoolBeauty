const WORLD_MIN_X = 30;
const WORLD_MAX_X = 5730;
const MIN_Y = 200;
const MAX_Y = 800;

/** Player movement, stamina, stun recovery, and the short trail used by followers. */
export class Protagonist {
  constructor() {
    this.x = 960;
    this.y = 500;
    this.width = 60;
    this.height = 80;
    this.energy = 100;
    this.maxEnergy = 100;
    this.isImmobilized = false;
    this.stunTimer = 0;
    this.fallTimer = 0;
    this.state = 'Idle';
    this.moveTarget = null;
    this.mobileRun = false;
    this.facing = 1;
    this.animationTime = 0;
    this.trailDistance = 0;
    this.trail = [{ x: this.x, y: this.y, distance: 0 }];
  }

  update(dt, directionX, directionY, running) {
    this.animationTime += dt;
    if (this.isImmobilized) {
      this.stunTimer -= dt;
      this.fallTimer = Math.max(0, this.fallTimer - dt);
      this.state = this.fallTimer > 0 ? 'Fall' : 'Stunned';
      if (this.stunTimer <= 0) {
        this.energy = 20;
        this.isImmobilized = false;
        this.state = 'Idle';
      }
      return 0;
    }

    const length = Math.hypot(directionX, directionY);
    if (length > 0) {
      directionX /= length;
      directionY /= length;
      const speed = running && this.energy > 0 ? 350 : 200;
      const oldX = this.x, oldY = this.y;
      this.x = clamp(this.x + directionX * speed * dt, WORLD_MIN_X, WORLD_MAX_X);
      this.y = clamp(this.y + directionY * speed * dt, MIN_Y, MAX_Y);
      const moved = Math.hypot(this.x - oldX, this.y - oldY);
      if (moved > 0) {
        this.facing = directionX < 0 ? -1 : directionX > 0 ? 1 : this.facing;
        this.trailDistance += moved;
        this.trail.push({ x: this.x, y: this.y, distance: this.trailDistance });
        // Keep only enough history for the current five-student snake, plus a margin.
        while (this.trail.length > 2 && this.trailDistance - this.trail[1].distance > 420) this.trail.shift();
        this.energy = Math.max(0, this.energy - (running ? 2.6 : 2) * dt);
      }
      this.state = running ? 'Run' : 'Walk';
      if (this.energy <= 0) {
        this.isImmobilized = true;
        this.stunTimer = 3;
        this.fallTimer = 0.45;
        this.state = 'Fall';
        this.moveTarget = null;
      }
      return speed;
    }
    this.state = 'Idle';
    return 0;
  }

  recoverEnergy(amount = 25) { this.energy = Math.min(this.maxEnergy, this.energy + amount); }

  /** Sample the travelled path at a distance behind the player for snake followers. */
  pointBehind(distance) {
    const wanted = Math.max(0, this.trailDistance - distance);
    for (let i = this.trail.length - 1; i > 0; i--) {
      const newer = this.trail[i], older = this.trail[i - 1];
      if (wanted >= older.distance) {
        const span = newer.distance - older.distance;
        const t = span > 0 ? (wanted - older.distance) / span : 0;
        return { x: older.x + (newer.x - older.x) * t, y: older.y + (newer.y - older.y) * t };
      }
    }
    return { x: this.x - this.facing * distance, y: this.y };
  }
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
