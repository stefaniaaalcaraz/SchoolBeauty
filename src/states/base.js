/** State interface. Override lifecycle hooks; all update times are seconds. */
export class BaseState {
  constructor(game) { this.game = game; this.ui = { buttons: [] }; }
  enter() { this.refreshButtons(); }
  update() {}
  exit() { this.game.input.setButtons([]); }
  refreshButtons() { this.game.input.setButtons(this.ui.buttons); }
  click() { return this.game.input.consumeClick(); }
  go(stateId) { this.game.changeState(stateId); }
}
