import { BaseState } from './base.js?v=9';
import { StateId } from '../game.js?v=9';

export class TutorialState extends BaseState {
  enter() {
    this.ui = { slide: 0, buttons: [
      { id: 'close', label: 'Close', x: 520, y: 887, w: 170, h: 62, style: 'secondary' },
      { id: 'prev', label: 'Previous', x: 740, y: 887, w: 190, h: 62, style: 'secondary' },
      { id: 'next', label: 'Next', x: 990, y: 887, w: 190, h: 62 },
      { id: 'dot0', label: '1', x: 918, y: 716, w: 15, h: 28, style: 'quiet' },
      { id: 'dot1', label: '2', x: 953, y: 716, w: 15, h: 28, style: 'quiet' },
      { id: 'dot2', label: '3', x: 988, y: 716, w: 15, h: 28, style: 'quiet' },
    ] }; super.enter();
  }
  update() {
    const action = this.click();
    if (action === 'close' || this.game.input.wasPressed('Escape')) return this.go(StateId.MENU);
    if (action === 'next' || this.game.input.wasPressed('ArrowRight')) this.ui.slide = Math.min(2, this.ui.slide + 1);
    if (action === 'prev' || this.game.input.wasPressed('ArrowLeft')) this.ui.slide = Math.max(0, this.ui.slide - 1);
    if (action === 'dot0' || action === 'dot1' || action === 'dot2') this.ui.slide = Number(action.at(-1));
  }
}
