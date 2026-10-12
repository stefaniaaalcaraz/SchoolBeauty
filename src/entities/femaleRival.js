const RIVAL_COLORS = Object.freeze(['', '#FFB6C1', '#FF69B4', '#FF1493', '#C71585', '#DC143C']);
const AI_TICK = Object.freeze([0, 0.02, 0.025, 0.03, 0.035, 0.04]);

/** Patrol rival, active tug-of-war opponent, or short-lived defeated/retreating sprite. */
export class FemaleRival {
  constructor({ id, level, x, y, minX, maxX, girlfriendTargetId = null, random = Math.random }) {
    this.id = id;
    this.level = level;
    this.x = x;
    this.y = y;
    this.minX = minX;
    this.maxX = maxX;
    this.speed = 120;
    this.direction = random() < 0.5 ? -1 : 1;
    this.walkTimer = between(random, 1.5, 4);
    this.pauseTimer = 0;
    this.reverseAfterPause = false;
    this.girlfriendTargetId = girlfriendTargetId;
    this.battleTargetId = null;
    this.rivalProgress = 0;
    this.battleTimer = 0.5;
    this.mode = 'patrol';
    this.defeatTimer = 0;
    this.exitX = null;
    this.animationTime = 0;
  }

  update(dt, aggroTarget, cameraX) {
    this.animationTime += dt;
    if (this.mode === 'defeated') {
      this.defeatTimer -= dt;
      return this.defeatTimer <= 0 ? 'remove' : null;
    }
    if (this.mode === 'leaving') {
      this.x += this.direction * this.speed * dt;
      return this.x < cameraX - 100 || this.x > cameraX + 2020 ? 'remove' : null;
    }
    if (this.mode === 'battle') return null;
    if (aggroTarget) {
      this.mode = 'aggro';
      const dx = aggroTarget.x - this.x;
      const dy = aggroTarget.y - this.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= 100) return 'battle';
      const step = Math.min(distance, 180 * dt);
      this.x += (dx / distance) * step;
      this.y = clamp(this.y + (dy / distance) * step, 200, 800);
      this.direction = dx < 0 ? -1 : 1;
      return null;
    }
    this.mode = 'patrol';
    this.updatePatrol(dt);
    return null;
  }

  updatePatrol(dt) {
    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      if (this.pauseTimer <= 0) {
        if (this.reverseAfterPause) this.direction *= -1;
        this.walkTimer = between(Math.random, 1.5, 4);
      }
      return;
    }
    this.walkTimer -= dt;
    this.x += this.direction * this.speed * dt;
    if (this.x <= this.minX || this.x >= this.maxX) {
      this.x = clamp(this.x, this.minX, this.maxX);
      this.direction *= -1;
    }
    if (this.walkTimer <= 0) {
      this.pauseTimer = between(Math.random, 0.5, 2);
      this.reverseAfterPause = Math.random() < 0.5;
    }
  }

  beginBattle(student) {
    this.mode = 'battle';
    this.battleTargetId = student.id;
    this.rivalProgress = 0;
    this.battleTimer = 0.5;
  }

  /** Return accumulated rival percentage progress in 0.5-second AI ticks. */
  advanceBattle(dt) {
    this.battleTimer -= dt;
    let added = 0;
    while (this.battleTimer <= 0) {
      added += AI_TICK[this.level] * 100;
      this.battleTimer += 0.5;
    }
    this.rivalProgress = Math.min(100, this.rivalProgress + added);
    return this.rivalProgress;
  }

  defeat() { this.mode = 'defeated'; this.defeatTimer = 0.65; }

  retreat(cameraX) {
    this.mode = 'leaving';
    const leftDistance = Math.abs(this.x - cameraX);
    const rightDistance = Math.abs(cameraX + 1920 - this.x);
    this.direction = leftDistance <= rightDistance ? -1 : 1;
    this.exitX = this.direction < 0 ? cameraX - 101 : cameraX + 2021;
  }

  get color() { return RIVAL_COLORS[this.level]; }
  get fadeAlpha() { return this.mode === 'defeated' ? clamp(this.defeatTimer / 0.65, 0, 1) : 1; }
  get isFlashing() { return this.mode === 'defeated' && Math.floor(this.animationTime * 18) % 2 === 0; }
}

export const RIVAL_AI_TICK = AI_TICK;

function between(random, min, max) { return min + random() * (max - min); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
