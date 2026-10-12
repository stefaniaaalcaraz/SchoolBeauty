import { BaseState } from './base.js';
import { StateId } from '../game.js';

export class LevelStartState extends BaseState {
  enter() {
    this.ui = { buttons: [
      { id: 'back', label: 'Back', x: 700, y: 790, w: 190, h: 66, style: 'secondary' },
      { id: 'start', label: 'Start the day', x: 920, y: 790, w: 300, h: 66 },
    ] }; super.enter();
  }
  update() {
    const action = this.click();
    if (action === 'back' || this.game.input.wasPressed('Escape')) {
      this.game.resumeRequested = false;
      this.go(StateId.MENU);
    }
    else if (action === 'start' || this.game.input.wasPressed('Enter')) this.go(StateId.PLAYING);
  }
}
