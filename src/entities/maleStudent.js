const STAR_COLORS = Object.freeze(['', '#A8D8EA', '#AA96DA', '#FCBAD3', '#FFFFD2', '#FF9AA2']);
const REQUIRED_CLICKS = Object.freeze([0, 5, 6, 7, 8, 9]);

/** Patrol target or conquered snake follower. Students remain locked to their floor. */
export class MaleStudent {
  constructor({ id, starLevel, x, y, minX, maxX, floor = 1, random = Math.random }) {
    this.id = id;
    this.starLevel = starLevel;
    this.requiredClicks = REQUIRED_CLICKS[starLevel];
    this.clicks = 0;
    this.progress = 0;
    this.progressVisible = false;
    this.x = x;
    this.y = y;
    this.minX = minX;
    this.maxX = maxX;
    this.floor = floor;
    this.speed = 80;
    this.direction = random() < 0.5 ? -1 : 1;
    this.walkTimer = between(random, 2, 5);
    this.pauseTimer = 0;
    this.reverseAfterPause = false;
    this.mode = 'patrol';
    this.conquered = false;
    this.followerIndex = -1;
    this.floatingTimer = 0;
    this.activeClickTimer = 0;
    this.battle = null;
  }

  update(dt) {
    if (this.mode !== 'patrol') return;
    this.floatingTimer = Math.max(0, this.floatingTimer - dt);
    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      if (this.pauseTimer <= 0) {
        if (this.reverseAfterPause) this.direction *= -1;
        this.walkTimer = between(Math.random, 2, 5);
      }
      return;
    }
    this.walkTimer -= dt;
    this.x += this.direction * this.speed * dt;
    if (this.x <= this.minX || this.x >= this.maxX) {
      this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
      this.direction *= -1;
    }
    if (this.walkTimer <= 0) {
      this.pauseTimer = between(Math.random, 1, 3);
      this.reverseAfterPause = Math.random() < 0.5;
    }
  }

  addClick() {
    if (this.conquered) return false;
    this.progressVisible = true;
    this.clicks = Math.min(this.requiredClicks, this.clicks + 1);
    this.progress = this.clicks / this.requiredClicks;
    this.floatingTimer = 0.8;
    if (this.progress >= 1) {
      this.conquered = true;
      this.mode = 'follow';
    }
    return this.conquered;
  }

  completeConquest() {
    this.clicks = this.requiredClicks;
    this.progress = 1;
    this.battle = null;
    this.activeClickTimer = 0;
    this.conquered = true;
    this.mode = 'follow';
  }

  resetConquest() {
    this.clicks = 0;
    this.progress = 0;
    this.progressVisible = false;
    this.battle = null;
    this.activeClickTimer = 0;
  }

  get color() { return this.conquered ? '#FFC0CB' : STAR_COLORS[this.starLevel]; }
}

export const STAR_REQUIREMENTS = REQUIRED_CLICKS;

function between(random, min, max) { return min + random() * (max - min); }
