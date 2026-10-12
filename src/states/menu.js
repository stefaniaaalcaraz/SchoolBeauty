import { BaseState } from './base.js?v=10';
import { StateId } from '../game.js?v=10';

export class MenuState extends BaseState {
  enter() {
    this.ui = { buttons: [
      { id: 'play', label: 'Play', x: 800, y: 623, w: 320, h: 78 },
      { id: 'tutorial', label: 'How to play', x: 800, y: 725, w: 320, h: 68, style: 'secondary' },
      { id: 'music', label: '', x: 1570, y: 63, w: 136, h: 54 },
      { id: 'sfx', label: '', x: 1755, y: 63, w: 136, h: 54 },
    ], music: this.game.settings.music, sfx: this.game.settings.sfx, campaignWon: this.game.campaignWon };
    super.enter();
  }
  update() {
    const action = this.click();
    if (action === 'play' || this.game.input.wasPressed('Enter')) {
      if (this.game.campaignWon) { this.game.campaignWon = false; this.game.level = 1; }
      this.go(StateId.LEVEL_START);
    }
    else if (action === 'tutorial') this.go(StateId.TUTORIAL);
    else if (action === 'music') { this.game.settings.music = !this.game.settings.music; this.ui.music = this.game.settings.music; }
    else if (action === 'sfx') { this.game.settings.sfx = !this.game.settings.sfx; this.ui.sfx = this.game.settings.sfx; }
  }
}
