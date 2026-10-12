import { InputManager } from './input.js?v=7';
import { Renderer } from './renderer.js?v=7';
import { Camera } from './camera.js?v=7';
import { MenuState } from './states/menu.js?v=7';
import { TutorialState } from './states/tutorial.js?v=7';
import { LevelStartState } from './states/levelStart.js?v=7';
import { PlayingState } from './states/playing.js?v=7';
import { GameOverState } from './states/gameOver.js?v=7';

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const StateId = Object.freeze({ MENU: 'MENU', TUTORIAL: 'TUTORIAL', LEVEL_START: 'LEVEL_START', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' });

/** Owns the loop, shared systems, and all legal state transitions. */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);
    this.camera = new Camera(GAME_WIDTH, GAME_HEIGHT);
    this.settings = { music: true, sfx: true };
    this.progress = { playerX: 960, score: 0, timeLeft: 180 };
    this.level = 1;
    this.currentFloor = 1;
    this.totalFloors = 3;
    this.objectives = null;
    this.floorData = new Map();
    this.floorTransition = null;
    this.displayEnergy = 100;
    this.scorePopTime = 0;
    this.campaignWon = false;
    this.protagonist = null;
    this.maleStudents = [];
    this.rivals = [];
    this.rivalSpawnTimer = 10;
    this.rivalsDefeated = 0;
    this.states = {
      [StateId.MENU]: new MenuState(this),
      [StateId.TUTORIAL]: new TutorialState(this),
      [StateId.LEVEL_START]: new LevelStartState(this),
      [StateId.PLAYING]: new PlayingState(this),
      [StateId.GAME_OVER]: new GameOverState(this),
    };
    this.currentStateId = null;
    this.currentState = null;
    this.lastTime = 0;
    this.running = false;
    this.frame = this.frame.bind(this);
  }

  start() { this.running = true; this.changeState(StateId.MENU); requestAnimationFrame(this.frame); }

  /** exit() always runs before enter(), so timers/input owned by a state are cleaned up. */
  changeState(nextId) {
    const next = this.states[nextId];
    if (!next) throw new Error(`Unknown game state: ${nextId}`);
    if (this.currentState) this.currentState.exit();
    this.input.clear();
    this.currentStateId = nextId;
    this.currentState = next;
    this.currentState.enter();
  }

  frame(now) {
    if (!this.running) return;
    const deltaTime = this.lastTime ? Math.min((now - this.lastTime) / 1000, 0.05) : 0;
    this.lastTime = now;
    this.currentState?.update(deltaTime);
    this.renderer.render(this);
    this.input.endFrame();
    requestAnimationFrame(this.frame);
  }
}
