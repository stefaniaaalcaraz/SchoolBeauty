import { BaseState } from './base.js?v=10';
import { StateId } from '../game.js?v=10';

export class GameOverState extends BaseState {
  enter() {
    const objectives = this.game.objectives || { targetConquests: 0, targetScore: 0, actualConquests: 0, actualScore: 0, objectivesMet: false };
    const nextEnabled = objectives.objectivesMet;
    this.ui = {
      level: this.game.level,
      objectives: { ...objectives },
      objectivesMet: nextEnabled,
      boysConquered: objectives.actualConquests,
      fiveStarConquered: objectives.fiveStarConquered || false,
      requiresFiveStar: objectives.requiresFiveStar || false,
      rivalsDefeated: this.game.rivalsDefeated || 0,
      score: this.game.progress.score,
      timeLeft: this.game.progress.timeLeft,
      buttons: [
        { id: 'next', label: 'Next Level', x: 666, y: 788, w: 180, h: 54, style: nextEnabled ? 'blue' : 'disabled', disabled: !nextEnabled },
        { id: 'retry', label: 'Retry', x: 870, y: 788, w: 180, h: 54, style: 'blue' },
        { id: 'menu', label: 'Main Menu', x: 1074, y: 788, w: 180, h: 54, style: 'secondary' },
      ],
    };
    super.enter();
  }

  update() {
    const action = this.click();
    if ((action === 'next' || this.game.input.wasPressed('Enter')) && this.ui.objectivesMet) {
      this.game.resumeRequested = false;
      if (this.game.level >= 5) {
        resetRun(this.game);
        this.game.campaignWon = true;
        this.go(StateId.MENU);
      } else {
        this.game.level += 1;
        this.go(StateId.LEVEL_START);
      }
    } else if (action === 'retry' || this.game.input.wasPressed('Enter')) {
      this.game.resumeRequested = false;
      this.go(StateId.LEVEL_START);
    } else if (action === 'menu' || this.game.input.wasPressed('Escape')) {
      resetRun(this.game);
      this.go(StateId.MENU);
    }
  }
}

function resetRun(game) {
  game.level = 1;
  game.currentFloor = 1;
  game.totalFloors = 3;
  game.objectives = null;
  game.floorData = new Map();
  game.floorTransition = null;
  game.protagonist = null;
  game.maleStudents = [];
  game.rivals = [];
  game.rivalsDefeated = 0;
  game.progress = { playerX: 960, score: 0, timeLeft: 180 };
  game.campaignWon = false;
}
