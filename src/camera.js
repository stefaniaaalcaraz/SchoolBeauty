/** Horizontal camera with world-bound clamping. World coordinates are pixels. */
export class Camera {
  constructor(viewWidth, viewHeight) { this.viewWidth = viewWidth; this.viewHeight = viewHeight; this.x = 0; this.worldWidth = viewWidth; }
  followX(targetX, worldWidth = this.worldWidth) {
    this.worldWidth = Math.max(this.viewWidth, worldWidth);
    this.x = Math.max(0, Math.min(targetX - this.viewWidth * 0.5, this.worldWidth - this.viewWidth));
  }
  reset() { this.x = 0; }
}
