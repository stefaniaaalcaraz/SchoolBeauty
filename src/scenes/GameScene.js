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
    this.mode = 'tutorial';
    this.tutorialPage = 0;
    this.active = false;
    this.elapsed = 0;
    this.timeLeft = this.config.seconds;
    this.score = 0;
    this.energy = this.config.maxEnergy;
    this.hearts = 0;
    this.pointer = { x: 0.52, y: 0.76 };
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
    this.mode = 'playing';
    this.active = true;
    this.player.setDestination(this.pointer);
    this.rivals = [new Rival(385, 424, 100), new Rival(785, 424, 95)];
    this.teachers = [new Teacher(560, 424, 345)];
    for (let i = 0; i < 5; i += 1) this.addBoy(i);
    this.emitHud();
    this.emit('tick', this.timeLeft);
  }

  /** Restarts the illustrated tutorial after a round has finished. */
  showTutorial() {
    this.reset();
  }

  /** Handles tutorial arrows and its PLAY button using canvas coordinates. */
  handleTutorialPress(point) {
    const x = point.x * 1100;
    const y = point.y * 550;
    if (y > 456 && x > 375 && x < 720) {
      this.start();
      return;
    }
    if (y > 200 && y < 405) {
      if (x > 1010) this.tutorialPage = Math.min(4, this.tutorialPage + 1);
      if (x < 90) this.tutorialPage = Math.max(0, this.tutorialPage - 1);
    }
  }

  /** Sends pointer position to the player and the beam target selector. */
  setPointer(point) {
    this.pointer = point;
    if (point.y >= 0.2) this.player.setDestination(point);
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
      this.mode = 'gameover';
      this.beam = false;
    }
  }

  /** Resolves beam targets, rival click duels, teacher collisions, and hearts. */
  updateInteractions(dt) {
    const p = this.player.position;
    const target = this.nearestBoy();
    const rival = target && this.rivals.find((item) => !item.retreating && Math.hypot(item.x - target.x, item.y - target.y) < 122);
    if (this.beam && target) this.energy = Math.max(0, this.energy - dt * this.config.beamCostPerSecond);
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
      if (Math.hypot(heart.x - p.x, heart.y - (p.y - 32)) > 48) return true;
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
    this.pickups.push(new HeartPickup(boy.x, boy.y - 25));
    this.effects.burst(boy.x, boy.y - 145, '♥');
    this.emit('note');
  }

  /** Finds the closest available classmate within the beam's reach. */
  nearestBoy() {
    let best = null;
    let distance = 52;
    const cursorX = this.pointer.x * 1100;
    const cursorY = this.pointer.y * 550;
    for (const boy of this.boys) {
      if (boy.state !== 'available') continue;
      const next = Math.hypot(boy.x - cursorX, (boy.y - 218) - cursorY);
      if (next < distance) { best = boy; distance = next; }
    }
    return best;
  }

  /** Creates a classmate and gently staggers future arrivals. */
  addBoy(index = this.boys.length) {
    const x = 165 + (index % 5) * 195 + Math.random() * 22;
    const y = index % 2 ? 423 : 408;
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
