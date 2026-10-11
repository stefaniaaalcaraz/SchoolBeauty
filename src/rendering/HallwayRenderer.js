import { hallway } from '../assets/HallwayArt.js';
import { student } from '../assets/CharacterArt.js';

/** Converts scene state into Canvas artwork without owning game rules. */
export class HallwayRenderer {
  constructor() {
    this.width = 960;
    this.height = 600;
    this.time = 0;
  }

  /** Stores the current responsive viewport in CSS pixels. */
  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  /** Draws the art, passing students, reactions, and the flirt prompt. */
  draw(context, scene) {
    this.time += 1 / 60;
    context.save();
    context.scale(this.width / 960, this.height / 600);
    hallway(context, this.time);

    for (const friend of scene.friends) this.drawFriend(context, friend);
    student(context, {
      x: 690, y: 570, scale: 1, color: 0, direction: -1,
      gaze: scene.crush.gaze, blush: scene.flirting,
    });
    for (const particle of scene.effects.items) this.drawParticle(context, particle);
    if (scene.flirting) this.drawPrompt(context);
    context.restore();
  }

  /** Draws a student crossing the hall and their suspicion bubble. */
  drawFriend(context, friend) {
    const position = friend.position(960);
    const fade = Math.max(0, Math.min(1, friend.age * 2, (friend.duration - friend.age) * 2));
    context.globalAlpha = fade;
    student(context, {
      x: position.x, y: 510, scale: 0.73, color: friend.variant,
      direction: position.direction, gaze: friend.watching ? 0.55 : 0,
      watch: friend.watching,
    });
    context.globalAlpha = 1;

    if (friend.visible && friend.watching) {
      context.fillStyle = '#fff';
      context.beginPath();
      context.roundRect(position.x - 22, 344, 44, 26, 12);
      context.fill();
      context.fillStyle = '#bf718d';
      context.font = 'bold 14px sans-serif';
      context.textAlign = 'center';
      context.fillText('?!', position.x, 362);
    }
  }

  /** Fades each reward or warning symbol over its lifetime. */
  drawParticle(context, particle) {
    context.globalAlpha = 1 - particle.age / particle.life;
    context.fillStyle = particle.glyph === '♥' ? '#df7395' : '#9c688a';
    context.font = 'bold ' + particle.size + 'px sans-serif';
    context.fillText(particle.glyph, particle.x, particle.y);
    context.globalAlpha = 1;
  }

  /** Displays a speech cue while the player holds the flirt action. */
  drawPrompt(context) {
    context.fillStyle = '#fff';
    context.beginPath();
    context.roundRect(630, 202, 116, 31, 14);
    context.fill();
    context.fillStyle = '#bf708a';
    context.font = 'bold 11px sans-serif';
    context.textAlign = 'center';
    context.fillText('♡ hi, cutie!', 688, 222);
  }
}
