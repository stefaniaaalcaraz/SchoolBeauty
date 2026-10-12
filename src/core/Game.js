import { CONFIG } from './config.js';
import { GameScene } from '../scenes/GameScene.js';
import { InputController } from '../input/InputController.js';
import { AudioManager } from '../audio/AudioManager.js';
import { HallwayRenderer } from '../rendering/HallwayRenderer.js';

/** Composes the rules, canvas renderer, input adapter, and audio services. */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.scene = new GameScene(CONFIG);
    const savedLevel = Number(localStorage.getItem('school-beauty-level') || 1);
    this.scene.level = Number.isInteger(savedLevel) ? Math.max(1, Math.min(5, savedLevel)) : 1;
    this.scene.floors = CONFIG.floorsByLevel[this.scene.level - 1];
    this.renderer = new HallwayRenderer();
    this.audio = new AudioManager();
    this.lastFrameTime = 0;
    this.keyboardAxis = 0;
    this.keyboardRun = false;
    this.touchAxis = 0;
    this.touchRun = false;
    this.input = new InputController(canvas, {
      onMove: (point) => this.scene.setPointer(point),
      onPress: () => this.handlePress(),
      onPulse: () => { if (this.scene.mode === 'playing') this.scene.pulse(); },
      onBeamStart: () => { if (this.scene.mode === 'playing') this.scene.setBeam(true); },
      onBeamStop: () => { this.scene.setBeam(false); this.touchAxis = 0; this.touchRun = false; this.updateControls(); },
      onControls: (axis, running) => { this.keyboardAxis = axis; this.keyboardRun = running; this.updateControls(); },
      onRun: (running) => { this.keyboardRun = running; this.updateControls(); },
      onFloorChange: (direction) => this.scene.changeFloor(direction),
    });
    this.bindInterface();
  }

  /** Connects optional HTML cabinet controls while the game UI stays on canvas. */
  bindInterface() {
    document.querySelector('#music-toggle').addEventListener('click', () => this.toggleMusic());
    document.querySelector('#effects-toggle').addEventListener('click', () => this.toggleEffects());
    document.querySelector('#fullscreen').addEventListener('click', () => this.toggleFullscreen());
    this.scene.on('note', () => this.audio.playNote());
    this.scene.on('caught', () => this.audio.playWarning());
    this.scene.on('win-duel', () => this.audio.playNote());
  }

  /** Sends tutorial clicks to the canvas UI, and unlocks audio on first play. */
  handlePress() {
    if (this.scene.mode === 'tutorial') {
      const x = this.scene.pointer.x;
      const y = this.scene.pointer.y;
      if (x > .69 && x < .76 && y > .83) { this.toggleMusic(); return false; }
      if (x > .79 && x < .86 && y > .83) { this.toggleEffects(); return false; }
      this.scene.handleTutorialPress(this.scene.pointer);
      return false;
    } else if (this.scene.mode === 'objectives') {
      const x = this.scene.pointer.x * 1100;
      const y = this.scene.pointer.y * 550;
      if (x > 395 && x < 710 && y > 350 && y < 475) this.scene.startMatch();
      this.audio.unlock();
      return false;
    } else if (this.scene.mode === 'gameover') {
      const x = this.scene.pointer.x * 1100;
      const y = this.scene.pointer.y * 550;
      if (y > 400 && y < 475 && x > 330 && x < 550) this.scene.showObjectives(this.scene.level);
      else if (y > 400 && y < 475 && x > 570 && x < 750 && this.scene.results.passed && this.scene.level < 5) {
          this.scene.level += 1;
          localStorage.setItem('school-beauty-level', String(this.scene.level));
          this.scene.showObjectives(this.scene.level);
      }
      return false;
    } else {
      const x = this.scene.pointer.x * 1100;
      const y = this.scene.pointer.y * 550;
      if (y > 470 && x < 90) { this.touchAxis = -1; this.updateControls(); return false; }
      if (y > 470 && x >= 90 && x < 175) { this.touchAxis = 1; this.updateControls(); return false; }
      if (y > 470 && x > 925 && x < 1010) { this.touchAxis = 1; this.updateControls(); return false; }
      if (y > 470 && x >= 1010) { this.touchRun = true; this.touchAxis = this.keyboardAxis || 1; this.updateControls(); return false; }
      const playerScreenX = this.scene.player.x - this.scene.cameraX;
      if (y > 335 && y < 450 && this.scene.nearStairs() && Math.abs(x - playerScreenX) < 105) {
        const direction = x < playerScreenX ? 1 : -1;
        if (this.scene.changeFloor(direction)) return false;
      }
      if (x > .9 * 1100 && y < 110) { this.toggleMusic(); return false; }
      this.audio.unlock();
      return true;
    }
  }

  /** Synchronizes the independent soundtrack toggle with the toolbar. */
  toggleMusic() {
    const enabled = this.audio.toggleMusic();
    const control = document.querySelector('#music-toggle');
    control.textContent = `♫ Music ${enabled ? 'ON' : 'OFF'}`;
    control.setAttribute('aria-pressed', String(enabled));
  }

  /** Synchronizes the independent effects toggle with the toolbar. */
  toggleEffects() {
    const enabled = this.audio.toggleEffects();
    const control = document.querySelector('#effects-toggle');
    control.textContent = `♪ SFX ${enabled ? 'ON' : 'OFF'}`;
    control.setAttribute('aria-pressed', String(enabled));
  }

  /** Merges held keys with the active touch movement button. */
  updateControls() {
    const active = this.scene.mode === 'playing';
    this.scene.setControls(active ? (this.touchAxis || this.keyboardAxis) : 0, active && (this.keyboardRun || this.touchRun));
  }

  /** Enters or exits browser fullscreen for a larger game view. */
  toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.querySelector('.cabinet').requestFullscreen?.();
  }

  /** Fits the high-DPI drawing buffer to its responsive CSS box. */
  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(bounds.width * ratio);
    this.canvas.height = Math.round(bounds.height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.renderer.resize(bounds.width, bounds.height);
  }

  /** Begins the animation loop and keeps the cabinet sharp on resize. */
  start() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame((time) => this.frame(time));
  }

  /** Advances the scene and draws one frame using a capped delta time. */
  frame(time) {
    const delta = Math.min((time - (this.lastFrameTime || time)) / 1000, 0.05);
    this.lastFrameTime = time;
    this.scene.update(delta);
    this.renderer.draw(this.context, this.scene);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }
}
