import { BaseState } from './base.js?v=7';
import { StateId } from '../game.js?v=7';
import { levelDefinition } from '../levels.js?v=7';

export class LevelStartState extends BaseState {
  enter() {
    this.paused = Boolean(this.game.resumeRequested);
    this.ui = { level: this.game.level || 1, objectives: levelDefinition(this.game.level || 1), paused: this.paused, buttons: this.makeButtons() };
    super.enter();
  }

  makeButtons() {
    const buttons = [];
    if (!this.paused) {
      buttons.push(
        { id: 'levelPrev', label: '‹', x: 760, y: 407, w: 60, h: 50, style: 'secondary' },
        { id: 'levelNext', label: '›', x: 1100, y: 407, w: 60, h: 50, style: 'secondary' },
      );
    }
    buttons.push(
      { id: 'back', label: this.paused ? 'Main menu' : 'Back', x: this.paused ? 650 : 680, y: 748, w: this.paused ? 180 : 160, h: 60, style: 'secondary' },
      { id: 'start', label: this.paused ? 'Resume' : 'START', x: this.paused ? 875 : 870, y: 748, w: this.paused ? 220 : 200, h: 60, style: 'green' },
    );
    return buttons;
  }

  update() {
    const action = this.click();
    if (!this.paused && (action === 'levelPrev' || this.game.input.wasPressed('ArrowLeft'))) this.game.level = this.game.level <= 1 ? 5 : this.game.level - 1;
    else if (!this.paused && (action === 'levelNext' || this.game.input.wasPressed('ArrowRight'))) this.game.level = this.game.level >= 5 ? 1 : this.game.level + 1;
    this.ui.level = this.game.level || 1;
    this.ui.objectives = levelDefinition(this.ui.level);

    if (action === 'back' || this.game.input.wasPressed('Escape')) {
      this.game.resumeRequested = false;
      if (this.paused) resetToMenu(this.game);
      this.go(StateId.MENU);
    } else if (action === 'start' || this.game.input.wasPressed('Enter')) {
      this.game.resumeRequested = this.paused;
      this.go(StateId.PLAYING);
    }
  }
}

function resetToMenu(game) {
  game.level = 1;
  game.currentFloor = 1;
  game.totalFloors = 3;
  game.objectives = null;
  game.floorData = new Map();
  game.floorTransition = null;
  game.protagonist = null;
  game.maleStudents = [];
  game.rivals = [];
  game.progress = { playerX: 960, score: 0, timeLeft: 180 };
  game.campaignWon = false;
}
