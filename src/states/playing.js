import { BaseState } from './base.js?v=4';
import { StateId, GAME_WIDTH } from '../game.js?v=4';

const WORLD_WIDTH = 3500;
export class PlayingState extends BaseState {
  enter() {
    if (!this.game.resumeRequested) this.game.progress = { playerX: 220, score: 0, timeLeft: 60 };
    this.game.resumeRequested = false;
    this.game.camera.reset(); this.game.camera.worldWidth = WORLD_WIDTH;
    this.ui = { buttons: [{ id: 'pause', label: 'Ⅱ', x: 1800, y: 53, w: 66, h: 58, style: 'secondary', fontSize: 22 }] };
    this.refreshButtons();
  }
  update(deltaTime) {
    const input = this.game.input;
    const action = this.click();
    if (action === 'pause' || input.wasPressed('Escape')) { this.game.resumeRequested = true; this.game.changeState(StateId.LEVEL_START); return; }
    const left = input.isDown('ArrowLeft', 'a', 'A') || (input.pointer.down && input.pointer.x < 140);
    const right = input.isDown('ArrowRight', 'd', 'D') || (input.pointer.down && input.pointer.x >= 140 && input.pointer.x < 265);
    const run = input.isDown(' ', 'Shift') || (input.pointer.down && input.pointer.x >= 265 && input.pointer.x < 360 && input.pointer.y > 840);
    this.game.progress.playerX += ((right ? 1 : 0) - (left ? 1 : 0)) * (run ? 600 : 330) * deltaTime;
    this.game.progress.playerX = Math.max(80, Math.min(WORLD_WIDTH - 90, this.game.progress.playerX));
    this.game.camera.followX(this.game.progress.playerX, WORLD_WIDTH);
    this.game.progress.timeLeft -= deltaTime;
    // Placeholder interactions: nearby classmates turn into connection points.
    const nearest = Math.round((this.game.progress.playerX - 750) / 290);
    if (input.wasPressed('Enter') || input.pointer.pressed) {
      if (nearest >= 0 && nearest < 5 && Math.abs(this.game.progress.playerX - (750 + nearest * 290)) < 150) this.game.progress.score = Math.min(5, this.game.progress.score + 1);
    }
    if (this.game.progress.timeLeft <= 0 || this.game.progress.playerX >= WORLD_WIDTH - 100 || this.game.progress.score >= 5) this.game.changeState(StateId.GAME_OVER);
  }
  exit() { super.exit(); }
}
