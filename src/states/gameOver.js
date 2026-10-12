import { BaseState } from './base.js';
import { StateId } from '../game.js';

export class GameOverState extends BaseState {
  enter() {
    this.ui = { score: this.game.progress.score, buttons: [
      { id: 'again', label: 'Play again', x: 760, y: 635, w: 250, h: 68 },
      { id: 'menu', label: 'Main menu', x: 1030, y: 635, w: 210, h: 68, style: 'secondary' },
    ] }; super.enter();
  }
  update() {
    const action = this.click();
    if (action === 'again' || this.game.input.wasPressed('Enter')) this.go(StateId.LEVEL_START);
    else if (action === 'menu' || this.game.input.wasPressed('Escape')) this.go(StateId.MENU);
  }
}
