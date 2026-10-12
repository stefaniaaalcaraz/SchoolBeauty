import { Player } from '../entities/Player.js';
import { Boy } from '../entities/Boy.js';
import { Rival } from '../entities/Rival.js';
import { Teacher } from '../entities/Teacher.js';
import { HeartPickup } from '../entities/HeartPickup.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';

/** Owns tutorial, level objectives, match progression, and school-floor rules. */
export class GameScene {
  constructor(config) {
    this.config = config;
    this.listeners = new Map();
    this.effects = new ParticleSystem();
    this.level = 1;
    this.reset();
  }

  /** Registers a view or audio subscriber for a named scene event. */
  on(name, callback) {
    const listeners = this.listeners.get(name) || [];
    listeners.push(callback);
    this.listeners.set(name, listeners);
  }

  /** Publishes a scene event without coupling rules to presentation code. */
  emit(name, value) {
    for (const callback of this.listeners.get(name) || []) callback(value);
  }

  /** Resets round values while preserving the selected level number. */
  reset() {
    this.mode = 'tutorial';
    this.tutorialPage = 0;
    this.active = false;
    this.elapsed = 0;
    this.timeLeft = this.config.seconds;
    this.score = 0;
    this.energy = this.config.maxEnergy;
    this.conquests = 0;
    this.rivalWins = 0;
    this.conqueredStarFive = false;
    this.pointer = { x: .52, y: .76 };
    this.beam = false;
    this.pendingTaps = 0;
    this.player = new Player();
    this.floorIndex = 0;
    this.floors = this.config.floorsByLevel[this.level - 1];
    this.worldWidth = this.config.floorWorldWidth;
    this.cameraX = 0;
    this.boys = [];
    this.rivals = [];
    this.teachers = [];
    this.pickups = [];
    this.spawnIn = 0;
    this.nextBoyId = 1;
    this.nextRivalId = 1;
    this.duel = null;
    this.objectives = null;
    this.results = null;
    this.exhaustionCooldown = 0;
    this.specialBoySpawned = false;
    this.visitedFloors = new Set([0]);
  }

  /** Moves from the tutorial carousel to this level's mission checklist. */
  showObjectives(level = this.level) {
    this.level = Math.max(1, Math.min(5, level));
    this.reset();
    this.mode = 'objectives';
    const scale = this.config.levelDifficultyStep ** (this.level - 1);
    this.objectives = {
      boys: Math.ceil(this.config.baseObjectiveBoys * scale),
      score: Math.ceil(this.config.baseObjectiveScore * scale),
      requiresStarFive: this.level === 5,
      floors: this.floors,
    };
  }

  /** Starts the 3-minute clock after the player dismisses level objectives. */
  startMatch() {
    const level = this.level;
    this.reset();
    this.level = level;
    this.floors = this.config.floorsByLevel[this.level - 1];
    this.objectives = this.makeObjectives();
    this.mode = 'playing';
    this.active = true;
    this.player.floor = this.floorIndex;
    this.spawnFloor(this.floorIndex);
    this.emitHud();
  }

  /** Recomputes the level's progressively scaled mission targets. */
  makeObjectives() {
    const scale = this.config.levelDifficultyStep ** (this.level - 1);
    return {
      boys: Math.ceil(this.config.baseObjectiveBoys * scale),
      score: Math.ceil(this.config.baseObjectiveScore * scale),
      requiresStarFive: this.level === 5,
      floors: this.floors,
    };
  }

  /** Restarts the illustrated tutorial from its first carousel page. */
  showTutorial() { this.reset(); }

  /** Handles tutorial carousel arrows and the Play button. */
  handleTutorialPress(point) {
    const x = point.x * 1100;
    const y = point.y * 550;
    if (y > 456 && x > 900 && x < 1020) { this.tutorialPage = Math.min(4, this.tutorialPage + 1); return; }
    if (y > 456 && x > 375 && x < 720) { this.showObjectives(this.level); return; }
    if (y > 200 && y < 405) {
      if (x > 1010) this.tutorialPage = Math.min(4, this.tutorialPage + 1);
      if (x < 90) this.tutorialPage = Math.max(0, this.tutorialPage - 1);
    }
  }

  /** Stores pointer position for head targeting and converts it to floor space. */
  setPointer(point) {
    this.pointer = point;
  }

  /** Sets currently held keyboard movement and running controls. */
  setControls(axis, running) { this.player.setControls(axis, running); }

  /** Queues one click for a target heart or an ongoing rival showdown. */
  pulse() { if (this.active) this.pendingTaps += 1; }

  /** Starts or stops the held lovebeam used by the rival counterattack timer. */
  setBeam(active) { this.beam = Boolean(active && this.active); }

  /** Changes floors only while the player is at the appropriate stair edge. */
  changeFloor(direction) {
    if (!this.active || direction === 0) return false;
    const atRight = this.player.x > this.worldWidth - 130;
    if (direction > 0 && (!this.nearStairs() || this.floorIndex >= this.floors - 1)) return false;
    if (direction < 0 && (!this.nearStairs() || this.floorIndex <= 0)) return false;
    this.floorIndex += direction;
    this.player.floor = this.floorIndex;
    this.player.x = atRight ? 70 : this.worldWidth - 70;
    this.player.setControls(0, false);
    this.spawnFloor(this.floorIndex);
    this.visitedFloors.add(this.floorIndex);
    this.updateCamera();
    this.emit('floor', this.floorIndex);
    return true;
  }

  /** Reports whether the protagonist is close enough to either staircase. */
  nearStairs() { return this.player.x < 130 || this.player.x > this.worldWidth - 130; }

  /** Initializes one floor with students and rivals, respecting the cast cap. */
  spawnFloor(floor) {
    const existing = this.boys.filter((boy) => boy.floor === floor);
    if (existing.length) return;
    if (!this.teachers.some((teacher) => teacher.floor === floor)) this.teachers.push(new Teacher(360 + Math.random() * (this.worldWidth - 720), 420, floor, 280));
    const entryX = Math.max(250, Math.min(this.worldWidth - 250, this.player.x));
    if (this.level === 5 && !this.specialBoySpawned) this.spawnBoy(floor, 5, Math.min(this.worldWidth - 180, entryX + 230));
    for (let i = 0; i < 4; i += 1) this.spawnBoy(floor, 0, Math.max(110, Math.min(this.worldWidth - 110, entryX - 370 + i * 235)));
    this.spawnRival(floor, this.randomRivalLevel());
    if (this.level >= 3 && Math.random() < .45) this.spawnRival(floor, this.randomRivalLevel());
    this.spawnIn = 4;
  }

  /** Creates a student with level-appropriate star availability and escorts. */
  spawnBoy(floor, forcedStar = 0, spawnX = null) {
    const star = forcedStar || this.randomBoyStar();
    // Reserve room for the promised escorts before an elite target is added.
    const escortCount = star === 4 ? 3 : star === 5 ? 1 : 0;
    if (this.activeCount(floor) + 1 + escortCount > 9) return null;
    const x = spawnX ?? 160 + Math.random() * (this.worldWidth - 320);
    const boy = new Boy(this.nextBoyId++, x, floor, star, this.config);
    this.boys.push(boy);
    if (star === 5) {
      this.specialBoySpawned = true;
      this.spawnRival(floor, 5, { targetBoyId: boy.id, girlfriend: true, x: x + 85 });
    } else if (star === 4) {
      this.spawnRival(floor, 2, { targetBoyId: boy.id, x: x - 92 });
      this.spawnRival(floor, 2, { targetBoyId: boy.id, x: x + 88 });
      this.spawnRival(floor, 3, { targetBoyId: boy.id, x: x + 135 });
    }
    return boy;
  }

  /** Chooses from only the tiers unlocked by the selected level. */
  randomBoyStar() {
    const roll = Math.random();
    if (this.level >= 3 && roll > .91) return 4;
    if (this.level >= 2 && roll > .76) return 3;
    return roll > .48 ? 1 : 2;
  }

  /** Spawns a rival girl; low-tier rivals use the most common weight. */
  spawnRival(floor, level, options = {}) {
    if (this.activeCount(floor) >= 9) return null;
    const x = options.x ?? 120 + Math.random() * (this.worldWidth - 240);
    const rival = new Rival(this.nextRivalId++, x, floor, level, options);
    this.rivals.push(rival);
    return rival;
  }

  /** Counts active non-player characters on a floor for the 10-person cap. */
  activeCount(floor) {
    return this.boys.filter((boy) => boy.floor === floor && boy.state !== 'removed').length
      + this.rivals.filter((rival) => rival.floor === floor && !rival.defeated).length;
  }

  /** Advances the 3-minute clock, current floor, stamina, and level state. */
  update(dt) {
    this.effects.update(dt);
    if (!this.active) return;
    this.elapsed += dt;
    this.timeLeft = Math.max(0, this.config.seconds - Math.floor(this.elapsed));
    const movementCost = this.player.update(dt, this.worldWidth);
    this.energy = Math.max(0, this.energy - movementCost * this.config.walkEnergyPerSecond * dt);
    this.energy = Math.max(0, this.energy - (this.beam ? this.config.beamCostPerSecond * dt : 0));
    this.updateExhaustion(dt);
    for (const boy of this.boys) if (boy.floor === this.floorIndex) boy.update(dt, this.player, this.worldWidth);
    for (const rival of this.rivals) if (rival.floor === this.floorIndex) rival.update(dt, this.worldWidth);
    for (const teacher of this.teachers) if (teacher.floor === this.floorIndex) teacher.update(dt);
    this.pickups = this.pickups.filter((heart) => heart.update(dt));
    this.updateInteractions(dt);
    this.pendingTaps = 0;
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.activeCount(this.floorIndex) < 8) {
      const eliteNearby = this.boys.some((boy) => boy.floor === this.floorIndex && boy.star >= 4 && Math.abs(boy.x - this.player.x) < 420);
      if (Math.random() < (eliteNearby ? .52 : .24)) this.spawnRival(this.floorIndex, this.randomRivalLevel());
      else this.spawnBoy(this.floorIndex);
      this.spawnIn = this.nextSpawnDelay();
    }
    this.updateCamera();
    if (this.timeLeft === 0) this.finishMatch();
  }

  /** Restores a little stamina after each short exhaustion stumble. */
  updateExhaustion(dt) {
    if (this.energy > 0) { this.exhaustionCooldown = 0; return; }
    if (this.exhaustionCooldown <= 0) {
      this.player.exhaust(this.config.exhaustionSeconds);
      this.exhaustionCooldown = this.config.exhaustionSeconds;
    }
    this.exhaustionCooldown -= dt;
    if (this.exhaustionCooldown <= 0) this.energy = Math.min(20, this.config.conquestEnergy);
  }

  /** Raises rival encounter frequency near high-tier boys. */
  nextSpawnDelay() {
    const eliteNearby = this.boys.some((boy) => boy.floor === this.floorIndex && boy.star >= 4 && Math.abs(boy.x - this.player.x) < 360);
    return (eliteNearby ? 2.3 : 4.8) * (.8 + Math.random() * .4);
  }

  /** Resolves clicks, multi-rival battles, teacher hits, and heart rewards. */
  updateInteractions(dt) {
    const boy = this.nearestBoy();
    const nearbyRivals = boy ? this.rivals.filter((rival) => !rival.defeated && rival.floor === boy.floor
      && (rival.targetBoyId === boy.id || Math.abs(rival.x - boy.x) < 95)) : [];
    this.duel = boy && nearbyRivals.length ? { boy, rivals: nearbyRivals } : null;
    if (boy && this.pendingTaps > 0) {
      if (nearbyRivals.length) {
        for (const rival of nearbyRivals) {
          rival.click();
          if (rival.battleClicks >= rival.battleRequirement) {
            rival.defeat();
            boy.rivalVictories += 1;
            this.rivalWins += 1;
            this.emit('win-duel');
          }
        }
      }
      boy.click();
      if (boy.clickProgress >= boy.clickRequirement && !this.rivals.some((rival) => !rival.defeated && rival.floor === boy.floor && (rival.targetBoyId === boy.id || Math.abs(rival.x - boy.x) < 95))) {
        this.conquerBoy(boy);
      }
    }
    for (const rival of this.rivals) {
      if (rival.defeated || !this.beam || rival.floor !== this.floorIndex || !this.duel?.rivals.includes(rival)) continue;
      rival.opponentProgress += dt * (.1 + rival.level * .02);
      if (rival.opponentProgress >= 1) {
        rival.opponentProgress = 0;
        this.duel.boy.clickProgress = Math.max(0, this.duel.boy.clickProgress - 1);
        this.player.knockBack(rival.x < this.player.x ? 1 : -1);
        this.emit('caught');
      }
    }
    for (const teacher of this.teachers) {
      if (teacher.floor === this.floorIndex && teacher.cooldown <= 0 && Math.abs(teacher.x - this.player.x) < 48) {
        teacher.cooldown = 1.8;
        this.energy = Math.max(0, this.energy - this.config.teacherPenalty);
        this.player.knockBack(teacher.x < this.player.x ? 1 : -1);
        this.emit('caught');
      }
    }
    this.pickups = this.pickups.filter((heart) => {
      if (heart.floor !== this.floorIndex || Math.abs(heart.x - this.player.x) > 44) return true;
      this.energy = Math.min(this.config.maxEnergy, this.energy + this.config.heartEnergy);
      this.score += 25;
      this.effects.burst(heart.x, heart.y, '♥');
      this.emit('note');
      return false;
    });
    this.emitHud();
  }

  /** Rewards a conquest with score, stamina, and a following pink companion. */
  conquerBoy(boy) {
    boy.state = 'following';
    boy.followIndex = this.boys.filter((item) => item.state === 'following').length;
    this.conquests += 1;
    this.energy = Math.min(this.config.maxEnergy, this.energy + this.config.conquestEnergy);
    const baseScore = boy.star * 100;
    this.score += Math.round(baseScore * (1 + .15 * boy.rivalVictories));
    if (boy.star === 5) this.conqueredStarFive = true;
    this.pickups.push(new HeartPickup(boy.x, boy.y - 35, boy.floor));
    this.effects.burst(boy.x, boy.y - 185, '♥');
    this.emit('note');
  }

  /** Selects only the hovered boy head on the visible floor. */
  nearestBoy() {
    const cursorX = this.pointer.x * 1100 + this.cameraX;
    const cursorY = this.pointer.y * 550;
    let best = null;
    let distance = 62;
    for (const boy of this.boys) {
      if (boy.floor !== this.floorIndex || boy.state !== 'available') continue;
      const next = Math.hypot(boy.x - cursorX, boy.y - 218 - cursorY);
      if (next < distance) { best = boy; distance = next; }
    }
    return best;
  }

  /** Moves the camera while keeping the player near the center of long floors. */
  updateCamera() {
    this.cameraX = Math.max(0, Math.min(this.worldWidth - 1100, this.player.x - 550));
  }

  /** Checks all mission goals and opens the results popup at match end. */
  finishMatch() {
    this.active = false;
    this.mode = 'gameover';
    this.beam = false;
    const passed = this.conquests >= this.objectives.boys && this.score >= this.objectives.score
      && this.visitedFloors.size >= this.objectives.floors
      && (!this.objectives.requiresStarFive || this.conqueredStarFive);
    this.results = { passed, targetBoys: this.objectives.boys, targetScore: this.objectives.score, targetFloors: this.objectives.floors };
    this.emit('end', this.results);
  }

  /** Returns the level-scaled rival spawn tier using the configured weights. */
  randomRivalLevel() {
    const weights = [.51, .30, .13, .06];
    let roll = Math.random();
    for (let i = 0; i < weights.length; i += 1) { roll -= weights[i]; if (roll <= 0) return i + 1; }
    return 1;
  }

  /** Maintains the canvas HUD and updates to progression observers. */
  emitHud() {
    this.emit('score', this.score);
    this.emit('energy', this.energy);
    this.emit('conquests', this.conquests);
    this.emit('tick', this.timeLeft);
    this.emit('floor', this.floorIndex);
  }
}
