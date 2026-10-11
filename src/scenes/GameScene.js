import { Crush } from '../entities/Crush.js';
import { Friend } from '../entities/Friend.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';

/** Owns gameplay rules and emits events for independent presentation services. */
export class GameScene {
  constructor(config) {
    this.config = config;
    this.listeners = new Map();
    this.crush = new Crush();
    this.effects = new ParticleSystem();
    this.friends = [];
    this.pointer = { x: 0.7, y: 0.7 };
    this.reset();
  }

  /** Registers a listener for a scene event such as score or round end. */
  on(name, callback) {
    const listeners = this.listeners.get(name) || [];
    listeners.push(callback);
    this.listeners.set(name, listeners);
  }

  /** Notifies subscribers without depending on rendering, audio, or DOM code. */
  emit(name, value) {
    for (const callback of this.listeners.get(name) || []) callback(value);
  }

  /** Resets the timers, meter, score, and passing students. */
  reset() {
    this.active = false;
    this.elapsed = 0;
    this.timeLeft = this.config.seconds;
    this.score = 0;
    this.meter = 8;
    this.flirting = false;
    this.spawnIn = 1.2;
    this.friends = [];
    this.lastSecond = this.timeLeft;
  }

  /** Starts a new passing period and sends initial values to the HUD. */
  start() {
    this.reset();
    this.active = true;
    this.crush.reset();
    this.addFriend();
    this.emit('score', this.score);
    this.emit('meter', this.meter);
    this.emit('tick', this.timeLeft);
  }

  /** Stores the pointer's normalized position for the crush character's gaze. */
  setPointer(point) {
    this.pointer = point;
  }

  /** Enables or ends the hold-to-flirt action while a round is active. */
  setFlirting(isFlirting) {
    if (this.active) this.flirting = isFlirting;
  }

  /** Advances round time, friend movement, effects, and meter reactions. */
  update(delta) {
    this.effects.update(delta);
    if (!this.active) return;

    this.elapsed += delta;
    this.timeLeft = Math.max(0, this.config.seconds - Math.floor(this.elapsed));
    if (this.timeLeft !== this.lastSecond) {
      this.lastSecond = this.timeLeft;
      this.emit('tick', this.timeLeft);
    }

    this.spawnIn -= delta;
    if (this.spawnIn <= 0) this.addFriend();
    this.friends = this.friends.filter((friend) => friend.update(delta));
    this.crush.update(delta, this.pointer);

    const isWatched = this.friends.some((friend) => friend.watching && friend.visible);
    if (isWatched && this.flirting) {
      this.flirting = false;
      this.meter = Math.max(0, this.meter - 36);
      this.emit('caught');
      this.effects.burst(690, 240, '?!');
    } else if (this.flirting) {
      this.meter += delta * this.config.charge;
      if (this.meter >= this.config.max) this.completeFlirt();
    } else {
      this.meter = Math.max(8, this.meter - delta * this.config.cool);
    }

    this.meter = Math.min(this.meter, this.config.max);
    this.emit('meter', this.meter);
    if (this.timeLeft === 0) {
      this.active = false;
      this.emit('end', this.score);
    }
  }

  /** Awards love notes and a floating-heart burst after the meter fills. */
  completeFlirt() {
    this.score += this.config.points;
    this.meter = 12;
    this.emit('score', this.score);
    this.emit('note');
    this.effects.burst(714, 298, '♥');
  }

  /** Adds a passing classmate and gradually increases hallway traffic. */
  addFriend() {
    this.friends.push(new Friend(Math.random() < 0.43));
    const pressure = this.config.spawn - this.elapsed * 0.02;
    this.spawnIn = Math.max(this.config.minSpawn, pressure) * (0.75 + Math.random() * 0.65);
  }
}
