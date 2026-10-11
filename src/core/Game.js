import { CONFIG } from './config.js';
import { GameScene } from '../scenes/GameScene.js';
import { InputController } from '../input/InputController.js';
import { AudioManager } from '../audio/AudioManager.js';
import { HallwayRenderer } from '../rendering/HallwayRenderer.js';

/** Composes the game model with input, audio, HUD, and Canvas rendering. */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.scene = new GameScene(CONFIG);
    this.renderer = new HallwayRenderer();
    this.audio = new AudioManager();
    this.lastFrameTime = 0;

    this.input = new InputController(canvas, {
      onStart: () => this.scene.setFlirting(true),
      onStop: () => this.scene.setFlirting(false),
      onMove: (point) => this.scene.setPointer(point),
    });

    this.bindInterface();
  }

  /** Connects DOM controls and scene events without coupling the model to the DOM. */
  bindInterface() {
    document.querySelector('#start').addEventListener('click', () => this.beginRound());
    document.querySelector('#again').addEventListener('click', () => this.beginRound());
    document.querySelector('#sound').addEventListener('click', (event) => {
      const enabled = this.audio.toggle();
      event.currentTarget.textContent = enabled ? '♫ Sound on' : '♫ Sound off';
      event.currentTarget.setAttribute('aria-pressed', String(enabled));
    });

    this.scene.on('score', (score) => this.updateScore(score));
    this.scene.on('meter', (meter) => {
      document.querySelector('#meter').style.width = meter + '%';
    });
    this.scene.on('tick', (seconds) => {
      document.querySelector('#timer').textContent = String(seconds).padStart(2, '0');
    });
    this.scene.on('note', () => this.audio.playNote());
    this.scene.on('caught', () => this.audio.playWarning());
    this.scene.on('end', (score) => this.showResults(score));
  }

  /** Resizes for the display and starts the browser animation loop. */
  start() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame((time) => this.frame(time));
  }

  /** Starts a fresh round after the player's click unlocks browser audio. */
  beginRound() {
    this.audio.unlock();
    this.scene.start();
    document.querySelector('#intro').classList.add('hidden');
    document.querySelector('#result').classList.add('hidden');
  }

  /** Uses device pixels for crisp drawing while keeping CSS pixel coordinates. */
  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(bounds.width * ratio);
    this.canvas.height = Math.round(bounds.height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.renderer.resize(bounds.width, bounds.height);
  }

  /** Advances game state and draws one frame using a capped delta time. */
  frame(time) {
    const delta = Math.min((time - (this.lastFrameTime || time)) / 1000, 0.05);
    this.lastFrameTime = time;
    this.scene.update(delta);
    this.renderer.draw(this.context, this.scene);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }

  /** Updates the score display and persists the best result on this device. */
  updateScore(score) {
    document.querySelector('#score').textContent = String(score).padStart(3, '0');
    const best = Math.max(score, Number(localStorage.getItem('best') || 0));
    localStorage.setItem('best', String(best));
    document.querySelector('#best').textContent = String(best).padStart(3, '0');
  }

  /** Shows score-aware feedback after the passing period ends. */
  showResults(score) {
    document.querySelector('#final').textContent = String(score);
    document.querySelector('#result-title').textContent =
      score >= 80 ? 'They noticed you!' : score >= 30 ? 'Cute work!' : 'There’s always tomorrow!';
    document.querySelector('#result-copy').textContent = 'The bell rang, but you made it count.';
    document.querySelector('#result').classList.remove('hidden');
  }
}
