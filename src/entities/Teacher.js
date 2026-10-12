/** Teacher patrols the corridor and penalizes collisions with the player. */
export class Teacher {
  constructor(x, y, floor = 0, routeWidth = 320) {
    this.x = x;
    this.y = y;
    this.floor = floor;
    this.centerX = x;
    this.routeWidth = routeWidth;
    this.age = Math.random() * 4;
    this.cooldown = 0;
  }

  /** Moves at a steady pace along the teacher's assigned hallway lane. */
  update(delta) {
    this.age += delta;
    this.cooldown = Math.max(0, this.cooldown - delta);
    this.x = this.centerX + Math.sin(this.age * 0.32) * this.routeWidth;
  }
}
