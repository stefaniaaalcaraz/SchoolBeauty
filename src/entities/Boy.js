/** Boy target that can be charmed, challenged, or follow the player. */
export class Boy {
  constructor(x, y, variant = 0) {
    this.x = x;
    this.y = y;
    this.homeX = x;
    this.homeY = y;
    this.variant = variant;
    this.state = 'available';
    this.charm = 0;
    this.duel = 0;
    this.age = Math.random() * 5;
    this.followOffset = 0;
  }

  /** Adds a small idle sway before the boy is charmed. */
  update(delta, leader) {
    this.age += delta;
    if (this.state === 'available') {
      this.x = this.homeX + Math.sin(this.age * 0.8) * 12;
      this.y = this.homeY + Math.sin(this.age * 1.1) * 3;
    } else if (this.state === 'follower' && leader) {
      const tx = leader.x - (50 + this.followIndex * 34) * leader.facing;
      const ty = leader.y + (this.followIndex % 2 ? -10 : 8);
      this.x += (tx - this.x) * Math.min(1, delta * 3.2);
      this.y += (ty - this.y) * Math.min(1, delta * 3.2);
    }
  }

  /** Changes this target into a follower and drops a collectible heart. */
  capture() {
    this.state = 'following';
  }

  /** Draws this boy in the leader's follower formation. */
  capture() {
    this.state = 'follower';
  }
}
