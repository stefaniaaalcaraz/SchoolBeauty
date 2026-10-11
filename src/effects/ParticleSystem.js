/** Reusable floating symbols for reward and caught-in-the-act reactions. */
export class ParticleSystem {
  constructor() {
    this.items = [];
  }

  /** Adds a randomized burst at a logical canvas position. */
  burst(x, y, glyph) {
    for (let index = 0; index < 8; index += 1) {
      this.items.push({
        x, y, glyph,
        vx: (Math.random() - 0.5) * 85,
        vy: -40 - Math.random() * 75,
        age: 0,
        life: 0.8 + Math.random() * 0.5,
        size: 12 + Math.random() * 12,
      });
    }
  }

  /** Moves active particles and removes expired entries. */
  update(delta) {
    this.items = this.items.filter((particle) => {
      particle.age += delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy -= 18 * delta;
      return particle.age < particle.life;
    });
  }
}
