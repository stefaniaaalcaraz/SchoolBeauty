import { BaseState } from './base.js?v=6';
import { StateId } from '../game.js?v=6';

export class LevelStartState extends BaseState {
  enter() {
    this.ui = { level: this.game.level || 1, buttons: [
      { id: 'levelPrev', label: '‹', x: 817, y: 398, w: 58, h: 52, style: 'secondary' },
      { id: 'levelNext', label: '›', x: 1045, y: 398, w: 58, h: 52, style: 'secondary' },
      { id: 'back', label: 'Back', x: 700, y: 790, w: 190, h: 66, style: 'secondary' },
      { id: 'start', label: 'Start the day', x: 920, y: 790, w: 300, h: 66 },
    ] }; super.enter();
  }
  update() {
    const action = this.click();
    if (!this.game.resumeRequested && (action === 'levelPrev' || this.game.input.wasPressed('ArrowLeft'))) this.game.level = ((this.game.level + 3) % 5) + 1;
    else if (!this.game.resumeRequested && (action === 'levelNext' || this.game.input.wasPressed('ArrowRight'))) this.game.level = (this.game.level % 5) + 1;
    this.ui.level = this.game.level || 1;
    if (action === 'back' || this.game.input.wasPressed('Escape')) {
      this.game.resumeRequested = false;
      this.go(StateId.MENU);
    }
    else if (action === 'start' || this.game.input.wasPressed('Enter')) this.go(StateId.PLAYING);
  }
}
