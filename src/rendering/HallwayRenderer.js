import { hallway } from '../assets/HallwayArt.js';
import { student } from '../assets/CharacterArt.js';

/** Renders the school world and its actors independently from game rules. */
export class HallwayRenderer {
  constructor() { this.width = 960; this.height = 600; this.time = 0; }

  /** Stores the responsive canvas size in CSS pixels. */
  resize(width, height) { this.width = width; this.height = height; }

  /** Draws background, beam, classmates, hazards, pickups, and particles. */
  draw(ctx, scene) {
    this.time += 1 / 60;
    ctx.save();
    ctx.scale(this.width / 960, this.height / 600);
    hallway(ctx, this.time);
    for (const teacher of scene.teachers) this.drawActor(ctx, teacher, 2, 1.03);
    for (const rival of scene.rivals) if (!rival.retreating) this.drawActor(ctx, rival, 1, 0.9);
    for (const boy of scene.boys) {
      if (boy.state === 'collected') continue;
      this.drawActor(ctx, boy, boy.variant, boy.state === 'follower' ? 0.78 : 0.88);
      if (boy.charm > 0) this.progress(ctx, boy.x, boy.y - 222, boy.charm, '#ef7fa5');
      if (scene.duel?.target === boy) this.progress(ctx, boy.x, boy.y - 244, boy.duel, '#d68dc2');
    }
    for (const heart of scene.pickups) this.drawHeart(ctx, heart);
    const target = scene.nearestBoy();
    if (scene.beam && target) this.drawBeam(ctx, scene.player.x, scene.player.y - 195, target.x, target.y - 194, scene.duel);
    this.drawActor(ctx, scene.player, 3, 1);
    for (const particle of scene.effects.items) this.drawParticle(ctx, particle);
    ctx.restore();
  }

  /** Draws a cast member and a small shadow at their floor position. */
  drawActor(ctx, actor, variant, scale) {
    ctx.fillStyle = '#705a5638'; ctx.beginPath(); ctx.ellipse(actor.x, actor.y - 4, 31 * scale, 8 * scale, 0, 0, Math.PI * 2); ctx.fill();
    student(ctx, { x: actor.x, y: actor.y, scale, color: variant, direction: actor.facing || 1,
      gaze: 0.3, blush: actor.state === 'follower', watch: actor.pressure > 0 });
  }

  /** Paints a soft line connecting the player with the active crush. */
  drawBeam(ctx, x1, y1, x2, y2, duel) {
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = duel ? '#e68db5aa' : '#f28bab99'; ctx.lineWidth = duel ? 14 : 10;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 50, x2, y2); ctx.stroke();
    ctx.strokeStyle = '#fff4d9'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  }

  /** Shows charm/duel progress in a compact rounded bar. */
  progress(ctx, x, y, value, color) {
    ctx.fillStyle = '#fff9ed'; ctx.beginPath(); ctx.roundRect(x - 29, y, 58, 8, 4); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x - 27, y + 2, 54 * Math.min(1, value / 100), 4, 2); ctx.fill();
  }

  /** Paints a collectible heart with a friendly glow. */
  drawHeart(ctx, heart) {
    ctx.save(); ctx.shadowColor = '#e7769c'; ctx.shadowBlur = 16; ctx.fillStyle = '#e7769c';
    ctx.font = 'bold 30px Georgia'; ctx.textAlign = 'center'; ctx.fillText('♥', heart.x, heart.y + Math.sin(heart.age * 4) * 4); ctx.restore();
  }

  /** Fades a floating reward or reaction glyph as it rises away. */
  drawParticle(ctx, particle) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
    ctx.fillStyle = '#db7696'; ctx.font = 'bold ' + particle.size + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(particle.glyph, particle.x, particle.y); ctx.globalAlpha = 1;
  }
}
