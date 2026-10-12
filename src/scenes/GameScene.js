import { Player } from '../entities/Player.js';
import { Boy } from '../entities/Boy.js';
import { Rival } from '../entities/Rival.js';
import { Teacher } from '../entities/Teacher.js';
import { HeartPickup } from '../entities/HeartPickup.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';

/** Owns the passing-period rules and publishes presentation events. */
export class GameScene {
  constructor(config) {
    this.config = config;
    this.listeners = new Map();
    this.effects = new ParticleSystem();
    this.reset();
  }

  /** Registers a listener without coupling gameplay to the HUD or renderer. */
  on(name, callback) {
    const listeners = this.listeners.get(name) || [];
    listeners.push(callback);
    this.listeners.set(name, listeners);
  }

  /** Publishes a state change to interested presentation services. */
  emit(name, value) {
    for (const callback of this.listeners.get(name) || []) callback(value);
  }

  /** Restores all round state and creates a fresh school cast. */
  reset() {
    this.active = false;
    this.elapsed = 0;
    this.timeLeft = this.config.seconds;
    this.score = 0;
    this.energy = this.config.maxEnergy;
    this.hearts = 0;
    this.pointer = { x: 0.52, y: 0.77 };
    this.beam = false;
    this.pendingTaps = 0;
    this.player = new Player();
    this.boys = [];
    this.rivals = [];
    this.teachers = [];
    this.pickups = [];
    this.spawnIn = 0;
    this.lastSecond = this.timeLeft;
    this.duel = null;
  }

  /** Begins a fresh round and broadcasts initial HUD values. */
  start() {
    this.reset();
    this.active = true;
    this.rivals = [new Rival(360, 350), new Rival(775, 470)];
    this.teachers = [new Teacher(560, 472)];
    for (let i = 0; i < 5; i += 1) this.addBoy(i);
    this.emitHud();
    this.emit('tick', this.timeLeft);
  }

  /** Sends pointer position to the player and the beam target selector. */
  setPointer(point) {
    this.pointer = point;
    this.player.setDestination(point);
  }

  /** Toggles the charm beam while the primary input is held. */
  setBeam(active) {
    this.beam = active;
  }

  /** Queues one rapid click for a nearby rival duel. */
  pulse() {
    if (this.active) this.pendingTaps += 1;
  }

  /** Advances movement, charm, hazards, collectibles, and the round timer. */
  update(dt) {
    this.effects.update(dt);
    if (!this.active) return;
    this.elapsed += dt;
    this.timeLeft = Math.max(0, this.config.seconds - Math.floor(this.elapsed));
    if (this.timeLeft !== this.lastSecond) {
      this.lastSecond = this.timeLeft;
      this.emit('tick', this.timeLeft);
    }
    this.player.update(dt);
    for (const boy of this.boys) boy.update(dt, this.player);
    for (const rival of this.rivals) rival.update(dt);
    for (const teacher of this.teachers) teacher.update(dt);
    this.pickups = this.pickups.filter((heart) => heart.update(dt));
    this.updateInteractions(dt);
    this.pendingTaps = 0;
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.boys.filter((boy) => boy.state === 'available').length < 4) this.addBoy();
    if (this.timeLeft === 0 || this.energy <= 0) {
      this.active = false;
      this.emit('end', this.score);
    }
  }

  /** Resolves beam targets, rival click duels, teacher collisions, and hearts. */
  updateInteractions(dt) {
    const p = this.player.position;
    const rival = this.rivals.find((item) => !item.retreating && Math.hypot(item.x - p.x, item.y - p.y) < 115);
    const target = this.nearestBoy();
    if (rival && target && this.beam && target.state === 'available') {
      this.duel = { rival, target };
      rival.pressure += dt * this.config.rivalPressurePerSecond;
      target.duel += this.pendingTaps * this.config.tapPower;
      this.effects.burst((rival.x + p.x) / 2, (rival.y + p.y) / 2 - 95, '♡');
      if (target.duel >= 100) {
        rival.retreat();
        this.duel = null;
        this.emit('win-duel');
      } else if (rival.pressure >= 100) {
        rival.pressure = 0;
        target.state = 'available';
        target.duel = 0;
        this.duel = null;
        this.energy = Math.max(0, this.energy - 18);
        this.emit('caught');
      }
    } else {
      this.duel = null;
      if (this.beam && target && target.state === 'available') {
        this.energy = Math.max(0, this.energy - dt * this.config.beamCostPerSecond);
        target.charm += dt * this.config.charmPerSecond;
        if (target.charm >= 100) this.charmBoy(target);
      } else {
        for (const boy of this.boys) boy.charm = Math.max(0, boy.charm - dt * 14);
      }
    }
    for (const teacher of this.teachers) {
      if (teacher.cooldown <= 0 && Math.hypot(teacher.x - p.x, teacher.y - p.y) < 52) {
        teacher.cooldown = 1.2;
        this.energy = Math.max(0, this.energy - this.config.teacherPenalty);
        this.player.knockBack(teacher.x < p.x ? 1 : -1);
        const follower = this.boys.find((boy) => boy.state === 'follower');
        if (follower) follower.state = 'available';
        this.emit('caught');
      }
    }
    this.pickups = this.pickups.filter((heart) => {
      if (Math.hypot(heart.x - p.x, heart.y - (p.y - 70)) > 42) return true;
      this.hearts += 1;
      this.score += 10;
      this.energy = Math.min(this.config.maxEnergy, this.energy + this.config.heartEnergy);
      this.effects.burst(heart.x, heart.y, '♥');
      this.emit('note');
      return false;
    });
    this.emitHud();
    this.emit('target', target);
    this.emit('duel', this.duel);
  }

  /** Turns a fully charmed classmate into a follower and drops a heart. */
  charmBoy(boy) {
    boy.state = 'follower';
    boy.charm = 0;
    boy.followIndex = this.boys.filter((item) => item.state === 'follower').length;
    this.pickups.push(new HeartPickup(boy.x, boy.y - 75));
    this.effects.burst(boy.x, boy.y - 145, '♥');
    this.emit('note');
  }

  /** Finds the closest available classmate within the beam's reach. */
  nearestBoy() {
    let best = null;
    let distance = 190;
    for (const boy of this.boys) {
      if (boy.state !== 'available') continue;
      const next = Math.hypot(boy.x - this.player.position.x, boy.y - this.player.position.y);
      if (next < distance) { best = boy; distance = next; }
    }
    return best;
  }

  /** Creates a classmate and gently staggers future arrivals. */
  addBoy(index = this.boys.length) {
    const x = 150 + (index % 4) * 205 + Math.random() * 45;
    const y = index % 2 ? 440 : 355;
    this.boys.push(new Boy(x, y, index % 4));
    this.spawnIn = 2.5;
  }

  /** Emits the values shown in the energy, heart, and follower HUD. */
  emitHud() {
    this.emit('score', this.score);
    this.emit('energy', this.energy);
    this.emit('hearts', this.hearts);
    this.emit('followers', this.boys.filter((boy) => boy.state === 'follower').length);
  }
}
