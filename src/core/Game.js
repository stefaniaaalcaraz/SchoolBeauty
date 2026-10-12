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
    this.renderer = new HallwayRenderer();
    this.audio = new AudioManager();
    this.lastFrameTime = 0;
    this.input = new InputController(canvas, {
      onMove: (point) => this.scene.setPointer(point),
      onPress: () => this.handlePress(),
      onPulse: () => { if (this.scene.mode === 'playing') this.scene.pulse(); },
      onBeamStart: () => { if (this.scene.mode === 'playing') this.scene.setBeam(true); },
      onBeamStop: () => this.scene.setBeam(false),
    });
    this.bindInterface();
  }

  /** Connects optional HTML cabinet controls while the game UI stays on canvas. */
  bindInterface() {
    const sound = document.querySelector('#sound-toggle');
    sound.addEventListener('click', () => this.toggleSound());
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
      if (x > .68 && x < .79 && y > .83) {
        this.toggleSound();
        return false;
      }
      this.scene.handleTutorialPress(this.scene.pointer);
      if (this.scene.mode === 'playing') this.audio.unlock();
      return false;
    } else if (this.scene.mode === 'gameover') {
      this.scene.showTutorial();
      return false;
    } else {
      if (this.scene.pointer.x > .9 && this.scene.pointer.y < .19) {
        this.toggleSound();
        return false;
      }
      this.audio.unlock();
      return true;
    }
  }

  /** Toggles generated soundtrack and click effects from the host toolbar. */
  toggleSound() {
    const enabled = this.audio.toggle();
    const control = document.querySelector('#sound-toggle');
    control.setAttribute('aria-pressed', String(enabled));
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
