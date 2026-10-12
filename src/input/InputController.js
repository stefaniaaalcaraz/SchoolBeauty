/** Normalizes mouse, touch, and keyboard into move, beam, and tap events. */
export class InputController {
  constructor(canvas, handlers) {
    this.canvas = canvas;
    this.handlers = handlers;

    canvas.addEventListener('pointermove', (event) => this.move(event));
    canvas.addEventListener('pointerdown', (event) => {
      canvas.setPointerCapture?.(event.pointerId);
      this.move(event);
      handlers.onPulse();
      handlers.onBeamStart();
    });
    canvas.addEventListener('pointerup', () => handlers.onBeamStop());
    canvas.addEventListener('pointercancel', () => handlers.onBeamStop());

    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        handlers.onPulse();
        handlers.onBeamStart();
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.code === 'Space') handlers.onBeamStop();
    });
    window.addEventListener('blur', () => handlers.onBeamStop());
  }

  /** Sends normalized pointer coordinates to player movement and target aim. */
  move(event) {
    const bounds = this.canvas.getBoundingClientRect();
    this.handlers.onMove({
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    });
  }
}
