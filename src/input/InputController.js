/** Normalizes pointer and keyboard gestures to a hold/release interface. */
export class InputController {
  constructor(canvas, handlers) {
    this.canvas = canvas;
    this.handlers = handlers;

    canvas.addEventListener('pointerdown', (event) => {
      canvas.setPointerCapture?.(event.pointerId);
      this.move(event);
      handlers.onStart();
    });
    canvas.addEventListener('pointermove', (event) => this.move(event));
    canvas.addEventListener('pointerup', () => handlers.onStop());
    canvas.addEventListener('pointercancel', () => handlers.onStop());

    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        handlers.onStart();
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.code === 'Space') handlers.onStop();
    });
    window.addEventListener('blur', () => handlers.onStop());
  }

  /** Sends pointer coordinates relative to the canvas to the game scene. */
  move(event) {
    const bounds = this.canvas.getBoundingClientRect();
    this.handlers.onMove({
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    });
  }
}
