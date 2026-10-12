/** Single pointer + keyboard input layer; states only consume this normalized API. */
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressedKeys = new Set();
    this.pointer = { x: 0, y: 0, down: false, pressed: false, doubleTapped: false, lastTap: null };
    this.buttons = [];
    this.bindings = new Map();
    window.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
      if (!this.keys.has(event.key)) this.pressedKeys.add(event.key);
      this.keys.add(event.key);
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.key));
    window.addEventListener('blur', () => this.clear());
    canvas.addEventListener('pointerdown', (event) => {
      this.updatePointer(event);
      const now = performance.now();
      const last = this.pointer.lastTap;
      this.pointer.doubleTapped = Boolean(last && now - last.time < 340 && Math.hypot(this.pointer.x - last.x, this.pointer.y - last.y) < 90);
      this.pointer.lastTap = { x: this.pointer.x, y: this.pointer.y, time: now };
      this.pointer.down = true; this.pointer.pressed = true;
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => this.updatePointer(event));
    canvas.addEventListener('pointerup', (event) => { this.updatePointer(event); this.pointer.down = false; });
    canvas.addEventListener('pointercancel', () => { this.pointer.down = false; });
  }

  updatePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 1920;
    this.pointer.y = ((event.clientY - rect.top) / rect.height) * 1080;
  }
  // One-frame events are cleared after update/render, so a pointer event arriving
  // between animation frames is never discarded before the state can consume it.
  endFrame() { this.pointer.pressed = false; this.pointer.doubleTapped = false; this.pressedKeys.clear(); }
  clear() { this.keys.clear(); this.pressedKeys.clear(); this.pointer.down = false; this.pointer.pressed = false; this.pointer.doubleTapped = false; }
  isDown(...keys) { return keys.some((key) => this.keys.has(key)); }
  wasPressed(...keys) { return keys.some((key) => this.pressedKeys.has(key)); }
  setButtons(buttons) { this.buttons = buttons; }
  /** Call after state update so pointer press isn't consumed by multiple controls. */
  activateButton(id) {
    if (!this.pointer.pressed) return false;
    const button = this.buttons.find(({ x, y, w, h }) => this.pointer.x >= x && this.pointer.x <= x + w && this.pointer.y >= y && this.pointer.y <= y + h);
    if (!button) return false;
    this.pointer.pressed = false;
    return button.id === id;
  }
  consumeClick() {
    if (!this.pointer.pressed) return null;
    const button = [...this.buttons].reverse().find(({ x, y, w, h }) => this.pointer.x >= x && this.pointer.x <= x + w && this.pointer.y >= y && this.pointer.y <= y + h);
    if (!button) return null;
    this.pointer.pressed = false;
    return button.id;
  }
}
