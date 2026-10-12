import { BaseState } from './base.js?v=7';
import { StateId, GAME_WIDTH } from '../game.js?v=7';
import { Protagonist } from '../entities/protagonist.js?v=7';
import { MaleStudent } from '../entities/maleStudent.js?v=7';
import { FemaleRival } from '../entities/femaleRival.js?v=7';
import { levelDefinition, createLevelObjectives } from '../levels.js?v=7';

const WORLD_WIDTH = 5760;
const FLOOR_MIN_Y = 200;
const FLOOR_MAX_Y = 800;
export class PlayingState extends BaseState {
  enter() {
    const resume = this.game.resumeRequested;
    if (!resume) {
      const definition = levelDefinition(this.game.level);
      this.game.currentFloor = 1;
      this.game.totalFloors = definition.floors;
      this.game.objectives = createLevelObjectives(this.game.level);
      this.game.floorData = new Map();
      this.game.floorTransition = null;
      this.game.progress = { playerX: 960, score: 0, timeLeft: 180 };
      this.game.protagonist = new Protagonist();
      this.game.maleStudents = this.createStudents(this.game.level || 1, 1);
      this.game.floorData.set(1, this.game.maleStudents);
      this.game.rivals = [];
      this.game.rivalSpawnTimer = definition.rivalSpawnSeconds;
      this.spawnInterval = definition.rivalSpawnSeconds;
      this.game.rivalsDefeated = 0;
      this.game.displayEnergy = this.game.protagonist.energy;
      this.game.scorePopTime = 0;
      this.game.campaignWon = false;
      this.specialGirlfriendsSpawned = new Set();
    }
    this.game.resumeRequested = false;
    this.game.camera.worldWidth = WORLD_WIDTH;
    if (resume) this.game.camera.followX(this.game.protagonist.x, WORLD_WIDTH);
    else this.game.camera.reset();
    this.mobileRunUntilTarget = false;
    this.pointerStartedMove = false;
    this.ui = { buttons: [{ id: 'pause', label: 'Ⅱ', x: 1800, y: 53, w: 66, h: 58, style: 'secondary', fontSize: 22 }] };
    this.refreshHudButtons();
  }

  createStudents(level, floor) {
    const random = Math.random;
    const students = [];
    const stars = levelDefinition(level).studentsPerFloor;
    for (let i = 0; i < stars.length; i++) {
      const minX = randomBetween(random, 100, 2000);
      const maxX = randomBetween(random, minX + 500, 5600);
      let x = randomBetween(random, minX, maxX);
      let y = randomBetween(random, FLOOR_MIN_Y + 20, FLOOR_MAX_Y - 20);
      // Keep the opening formation readable while retaining random patrol ranges.
      for (let attempt = 0; attempt < 40 && students.some((other) => Math.hypot(other.x - x, other.y - y) < 115); attempt++) {
        x = randomBetween(random, minX, maxX);
        y = randomBetween(random, FLOOR_MIN_Y + 20, FLOOR_MAX_Y - 20);
      }
      students.push(new MaleStudent({ id: `L${level}-F${floor}-student-${i + 1}`, starLevel: stars[i], x, y, minX, maxX, floor, random }));
    }
    return students;
  }

  update(dt) {
    const game = this.game;
    const input = game.input;
    const action = this.click();
    if (action === 'pause' || input.wasPressed('Escape')) {
      game.resumeRequested = true;
      game.changeState(StateId.LEVEL_START);
      return;
    }

    if (this.game.floorTransition) {
      this.updateFloorTransition(dt);
      this.refreshHudButtons();
      return;
    }

    const nearLeftStair = this.isNearStair('left');
    const nearRightStair = this.isNearStair('right');
    if (action === 'stairUp' && this.game.currentFloor > 1) { this.startFloorTransition(this.game.currentFloor - 1); return; }
    if (action === 'stairDown' && this.game.currentFloor < this.game.totalFloors) { this.startFloorTransition(this.game.currentFloor + 1); return; }
    if (input.wasPressed('ArrowUp') && nearLeftStair && this.game.currentFloor > 1) { this.startFloorTransition(this.game.currentFloor - 1); return; }
    if (input.wasPressed('ArrowDown') && nearRightStair && this.game.currentFloor < this.game.totalFloors) { this.startFloorTransition(this.game.currentFloor + 1); return; }

    const player = game.protagonist;
    const targets = game.maleStudents.filter((student) => student.mode === 'patrol');
    const pointer = input.pointer;
    let pointerToTarget = false;
    const hudTouch = pointer.down && pointer.y > 860 && pointer.x < 380;
    if (pointer.pressed && action === null && !hudTouch) {
      const target = this.targetAtScreen(pointer.x, pointer.y);
      if (target) {
        pointerToTarget = true;
        this.conquerClick(target);
      } else {
        player.moveTarget = this.pointerWorldPoint(pointer.x, pointer.y);
        this.pointerStartedMove = true;
      }
      if (pointer.doubleTapped && player.moveTarget) this.mobileRunUntilTarget = true;
    }
    if (pointer.down && this.pointerStartedMove && !hudTouch) {
      player.moveTarget = this.pointerWorldPoint(pointer.x, pointer.y);
      if (pointer.doubleTapped) this.mobileRunUntilTarget = true;
    }
    if (!pointer.down) this.pointerStartedMove = false;

    // The optional touch controls are also recognized as large, forgiving hit areas.
    let touchX = 0, touchRun = false;
    if (hudTouch) {
      if (pointer.x < 135) touchX = -1;
      else if (pointer.x < 245) touchX = 1;
      else touchRun = true;
    }
    let dx = ((input.isDown('ArrowRight', 'd', 'D') ? 1 : 0) - (input.isDown('ArrowLeft', 'a', 'A') ? 1 : 0)) || touchX;
    let dy = (input.isDown('ArrowDown', 's', 'S') && !nearRightStair ? 1 : 0) - (input.isDown('ArrowUp', 'w', 'W') && !nearLeftStair ? 1 : 0);
    if (!dx && !dy && player.moveTarget) {
      const deltaX = player.moveTarget.x - player.x;
      const deltaY = player.moveTarget.y - player.y;
      if (Math.hypot(deltaX, deltaY) < 9) {
        player.moveTarget = null;
        this.mobileRunUntilTarget = false;
      } else { dx = deltaX; dy = deltaY; }
    }
    const running = input.isDown(' ', 'Shift') || touchRun || this.mobileRunUntilTarget;
    player.update(dt, dx, dy, running);
    if (player.isImmobilized) this.mobileRunUntilTarget = false;
    game.progress.playerX = player.x;
    game.progress.timeLeft = Math.max(0, game.progress.timeLeft - dt);
    game.scorePopTime = Math.max(0, game.scorePopTime - dt);
    game.displayEnergy += (player.energy - game.displayEnergy) * Math.min(1, dt * 10);
    game.camera.followX(player.x, WORLD_WIDTH);

    for (const student of targets) student.update(dt);
    this.avoidStudentOverlap(targets);
    const followers = game.maleStudents.filter((student) => student.mode === 'follow');
    followers.forEach((student, index) => {
      const point = player.pointBehind((index + 1) * 50);
      student.x = point.x;
      student.y = point.y;
      student.followerIndex = index;
      student.floatingTimer = Math.max(0, student.floatingTimer - dt);
    });

    // Keyboard interaction is useful for accessibility when standing beside a target.
    if (input.wasPressed('Enter') && !pointerToTarget) {
      const nearest = targets.reduce((best, student) => Math.hypot(student.x - player.x, student.y - player.y) < Math.hypot((best?.x ?? Infinity) - player.x, (best?.y ?? Infinity) - player.y) ? student : best, null);
      if (nearest && Math.hypot(nearest.x - player.x, nearest.y - player.y) <= 100) this.conquerClick(nearest);
    }

    for (const student of game.maleStudents) {
      if (student.mode === 'patrol') student.activeClickTimer = Math.max(0, student.activeClickTimer - dt);
    }
    this.updateRivals(dt);
    this.saveCurrentFloor();

    if (game.progress.timeLeft <= 0) {
      game.changeState(StateId.GAME_OVER);
    }
    this.refreshHudButtons();
  }

  targetAtScreen(screenX, screenY) {
    const cameraX = this.game.camera.x;
    return this.game.maleStudents.find((student) => student.mode === 'patrol' &&
      Math.hypot(screenX - (student.x - cameraX), screenY - (floorYToScreen(student.y) - 35)) <= 80) || null;
  }

  pointerWorldPoint(screenX, screenY) {
    return {
      x: clamp(screenX + this.game.camera.x, 30, WORLD_WIDTH - 30),
      y: clamp(screenYToFloorY(screenY + 40), FLOOR_MIN_Y, FLOOR_MAX_Y),
    };
  }

  conquerClick(student) {
    if (!student || student.conquered || student.mode !== 'patrol') return;
    student.activeClickTimer = 4;
    this.playClickSound();
    if (student.battle) {
      student.battle.playerProgress = Math.min(100, student.battle.playerProgress + 5);
      student.progress = student.battle.playerProgress / 100;
      student.progressVisible = true;
      student.floatingTimer = 0.8;
      if (student.battle.playerProgress >= 100) {
        const rival = this.game.rivals.find((entry) => entry.id === student.battle.rivalId);
        this.finishConquest(student, rival ? 1.15 : 1);
        if (rival) {
          rival.defeat();
          this.game.rivalsDefeated += 1;
        }
      }
      return;
    }
    if (student.addClick()) {
      this.finishConquest(student);
    }
  }

  finishConquest(student, multiplier = 1) {
    if (!student.conquered) student.completeConquest();
    const followers = this.game.maleStudents.filter((entry) => entry.mode === 'follow').length;
    student.followerIndex = followers - 1;
    this.game.protagonist.recoverEnergy(25);
    const points = Math.round(100 * student.starLevel * multiplier);
    this.game.progress.score += points;
    this.game.objectives.actualConquests += 1;
    this.game.objectives.actualScore += points;
    this.game.objectives.objectivesMet = this.game.objectives.actualConquests >= this.game.objectives.targetConquests && this.game.objectives.actualScore >= this.game.objectives.targetScore;
    this.game.scorePopTime = 0.45;
  }

  updateRivals(dt) {
    const game = this.game;
    const cameraX = game.camera.x;
    const screenRight = cameraX + GAME_WIDTH;
    const activeMales = game.maleStudents.filter((student) => student.mode === 'patrol');
    const highStarVisible = activeMales.some((student) => student.starLevel >= 4 && student.x >= cameraX - 25 && student.x <= screenRight + 25);
    const baseSpawnInterval = levelDefinition(game.level).rivalSpawnSeconds;
    const spawnInterval = highStarVisible ? baseSpawnInterval / 1.5 : baseSpawnInterval;
    if (spawnInterval !== this.spawnInterval) {
      game.rivalSpawnTimer = this.spawnInterval > 0 ? game.rivalSpawnTimer * spawnInterval / this.spawnInterval : spawnInterval;
      this.spawnInterval = spawnInterval;
    }

    // A five-star girlfriend is a one-time special spawn tied to that specific student.
    for (const student of activeMales) {
      if (student.starLevel !== 5 || student.x < cameraX - 25 || student.x > screenRight + 25) continue;
      if (game.rivals.length < 3 && !this.specialGirlfriendsSpawned.has(student.id)) {
        this.spawnRival(5, student.id);
        this.specialGirlfriendsSpawned.add(student.id);
      }
    }

    if (game.rivals.length < 3) {
      game.rivalSpawnTimer = Math.max(0, game.rivalSpawnTimer - dt);
      if (game.rivalSpawnTimer <= 0) {
        this.spawnRival(this.rollRivalLevel());
        game.rivalSpawnTimer = spawnInterval;
      }
    } else {
      game.rivalSpawnTimer = Math.min(game.rivalSpawnTimer, spawnInterval);
    }

    const removeIds = new Set();
    for (const rival of game.rivals) {
      if (rival.mode === 'battle') {
        const student = game.maleStudents.find((entry) => entry.id === rival.battleTargetId);
        if (!student || !student.battle) {
          rival.retreat(cameraX);
          continue;
        }
        const battleProgress = rival.advanceBattle(dt);
        student.battle.rivalProgress = battleProgress;
        student.battle.shakeTime += dt;
        if (battleProgress >= 100) {
          student.resetConquest();
          rival.retreat(cameraX);
        }
        continue;
      }

      const target = this.findRivalTarget(rival);
      const result = rival.update(dt, target, cameraX);
      if (result === 'remove') { removeIds.add(rival.id); continue; }
      if (result === 'battle' && target && !target.battle && target.progress > 0 && target.progress < 1) {
        target.battle = { rivalId: rival.id, playerProgress: target.progress * 100, rivalProgress: 0, shakeTime: 0 };
        rival.beginBattle(target);
      }
    }
    if (removeIds.size) game.rivals = game.rivals.filter((rival) => !removeIds.has(rival.id));
  }

  findRivalTarget(rival) {
    const students = this.game.maleStudents.filter((student) => student.mode === 'patrol' && !student.battle && student.progress > 0 && student.progress < 1);
    if (rival.girlfriendTargetId) {
      const girlfriendTarget = this.game.maleStudents.find((student) => student.id === rival.girlfriendTargetId && student.mode === 'patrol' && !student.battle);
      if (girlfriendTarget) return girlfriendTarget;
    }
    return students.sort((a, b) => Math.hypot(a.x - rival.x, a.y - rival.y) - Math.hypot(b.x - rival.x, b.y - rival.y))[0] || null;
  }

  spawnRival(level, girlfriendTargetId = null) {
    const random = Math.random;
    const minX = randomBetween(random, 100, 2000);
    const maxX = randomBetween(random, minX + 500, 5600);
    const x = randomBetween(random, minX, maxX);
    const y = randomBetween(random, FLOOR_MIN_Y, FLOOR_MAX_Y);
    const id = `rival-${Math.random().toString(36).slice(2, 9)}`;
    this.game.rivals.push(new FemaleRival({ id, level, x, y, minX, maxX, girlfriendTargetId, random }));
  }

  rollRivalLevel() {
    const roll = Math.random();
    if (roll < 0.70) return 1;
    if (roll < 0.90) return 2;
    if (roll < 0.98) return 3;
    return 4;
  }

  isNearStair(side) {
    const x = this.game.protagonist.x;
    return side === 'left' ? x <= 150 : x >= WORLD_WIDTH - 150;
  }

  refreshHudButtons() {
    const buttons = [{ id: 'pause', label: 'Ⅱ', x: 1820, y: 92, w: 62, h: 52, style: 'secondary', fontSize: 20 }];
    if (this.isNearStair('left')) buttons.push({ id: 'stairUp', label: '▲', x: 1630, y: 932, w: 60, h: 60, style: this.game.currentFloor > 1 ? 'blue' : 'disabled', disabled: this.game.currentFloor <= 1, fontSize: 26 });
    if (this.isNearStair('right')) buttons.push({ id: 'stairDown', label: '▼', x: 1630, y: 1002, w: 60, h: 60, style: this.game.currentFloor < this.game.totalFloors ? 'blue' : 'disabled', disabled: this.game.currentFloor >= this.game.totalFloors, fontSize: 26 });
    this.ui.buttons = buttons;
    this.refreshButtons();
  }

  startFloorTransition(destinationFloor) {
    this.game.floorTransition = { elapsed: 0, destinationFloor, loaded: false };
    this.game.protagonist.moveTarget = null;
  }

  updateFloorTransition(dt) {
    const game = this.game;
    const transition = game.floorTransition;
    game.progress.timeLeft = Math.max(0, game.progress.timeLeft - dt);
    game.scorePopTime = Math.max(0, game.scorePopTime - dt);
    game.displayEnergy += (game.protagonist.energy - game.displayEnergy) * Math.min(1, dt * 10);
    transition.elapsed += dt;
    if (!transition.loaded && transition.elapsed >= 0.25) {
      this.loadFloor(transition.destinationFloor);
      transition.loaded = true;
    }
    if (game.progress.timeLeft <= 0) { game.floorTransition = null; game.changeState(StateId.GAME_OVER); return; }
    if (transition.elapsed >= 0.5) game.floorTransition = null;
  }

  saveCurrentFloor() {
    const game = this.game;
    const floorStudents = game.maleStudents.filter((student) => student.mode === 'patrol');
    for (const student of floorStudents) {
      if (student.battle) {
        student.progress = student.battle.playerProgress / 100;
        student.clicks = Math.floor(student.progress * student.requiredClicks);
        student.progress = student.clicks / student.requiredClicks;
        student.battle = null;
        student.activeClickTimer = 0;
      }
    }
    game.floorData.set(game.currentFloor, floorStudents);
  }

  loadFloor(floor) {
    const game = this.game;
    this.saveCurrentFloor();
    const followers = game.maleStudents.filter((student) => student.mode === 'follow');
    game.currentFloor = floor;
    const students = game.floorData.get(floor) || this.createStudents(game.level, floor);
    game.floorData.set(floor, students);
    game.maleStudents = [...followers, ...students];
    for (const follower of followers) follower.floor = floor;
    const player = game.protagonist;
    player.x = 960;
    player.trailDistance = 0;
    player.trail = [{ x: player.x, y: player.y, distance: 0 }];
    player.moveTarget = null;
    game.progress.playerX = player.x;
    game.rivals = []; // Rivals are local to their floor and do not cross staircases.
    game.rivalSpawnTimer = levelDefinition(game.level).rivalSpawnSeconds;
    this.spawnInterval = game.rivalSpawnTimer;
    this.specialGirlfriendsSpawned = new Set();
    game.camera.reset();
    game.camera.followX(player.x, WORLD_WIDTH);
  }

  advanceFloor(floorDelta) {
    const next = this.game.currentFloor + floorDelta;
    if (next < 1 || next > this.game.totalFloors) return false;
    this.startFloorTransition(next);
    return true;
  }

  playClickSound() {
    if (!this.game.settings.sfx) return;
    // Tiny synthesized placeholder click; replace with an asset when audio is added.
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioContext ||= new AudioContextClass();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(720, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.055);
      gain.gain.setValueAtTime(0.045, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.06);
      oscillator.connect(gain); gain.connect(this.audioContext.destination);
      oscillator.start(); oscillator.stop(this.audioContext.currentTime + 0.06);
    } catch { /* Audio is optional; visual feedback remains available. */ }
  }

  avoidStudentOverlap(students) {
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const a = students[i], b = students[j];
        if (Math.abs(a.y - b.y) >= 68 || Math.abs(a.x - b.x) >= 52) continue;
        const push = (52 - Math.abs(a.x - b.x)) / 2 + 0.5;
        const sign = a.x <= b.x ? -1 : 1;
        a.x = clamp(a.x + sign * push, a.minX, a.maxX);
        b.x = clamp(b.x - sign * push, b.minX, b.maxX);
        if (a.x <= a.minX || a.x >= a.maxX) a.direction *= -1;
        if (b.x <= b.minX || b.x >= b.maxX) b.direction *= -1;
      }
    }
  }

  exit() { super.exit(); }
}

export function floorYToScreen(y) { return 740 + ((y - FLOOR_MIN_Y) / (FLOOR_MAX_Y - FLOOR_MIN_Y)) * 200; }
function screenYToFloorY(y) { return FLOOR_MIN_Y + ((y - 740) / 200) * (FLOOR_MAX_Y - FLOOR_MIN_Y); }
function randomBetween(random, min, max) { return min + random() * Math.max(0, max - min); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
