/** Normalizes pointer clicks, touch controls, stairs, arrows, and running. */
export class InputController {
  constructor(canvas, handlers) {
    this.canvas = canvas;
    this.handlers = handlers;
    this.keys = new Set();

    canvas.addEventListener('pointermove', (event) => this.move(event));
    canvas.addEventListener('pointerdown', (event) => {
      canvas.setPointerCapture?.(event.pointerId);
      this.move(event);
      const activate = handlers.onPress?.();
      if (activate !== false) {
        handlers.onPulse();
        handlers.onBeamStart();
      }
    });
    canvas.addEventListener('pointerup', () => handlers.onBeamStop());
    canvas.addEventListener('pointercancel', () => handlers.onBeamStop());

    window.addEventListener('keydown', (event) => {
      const isControl = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code);
      if (isControl) event.preventDefault();
      if (event.repeat) return;
      this.keys.add(event.code);
      if (event.code === 'ArrowUp') handlers.onFloorChange(1);
      if (event.code === 'ArrowDown') handlers.onFloorChange(-1);
      if (event.code === 'Space') handlers.onRun(true);
      this.updateMovement();
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
      if (event.code === 'Space') handlers.onRun(false);
      this.updateMovement();
    });
    window.addEventListener('blur', () => { this.keys.clear(); handlers.onBeamStop(); handlers.onRun(false); this.updateMovement(); });
  }

  /** Sends normalized pointer coordinates to player movement and target aim. */
  move(event) {
    const bounds = this.canvas.getBoundingClientRect();
    this.handlers.onMove({
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    });
  }

  /** Keeps opposing arrow keys deterministic and sends the current run modifier. */
  updateMovement() {
    const axis = Number(this.keys.has('ArrowRight')) - Number(this.keys.has('ArrowLeft'));
    this.handlers.onControls(axis, this.keys.has('Space'));
  }
}
