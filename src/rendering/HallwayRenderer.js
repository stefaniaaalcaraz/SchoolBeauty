import { hallway } from '../assets/HallwayArt.js';
import { student } from '../assets/CharacterArt.js';

const TUTORIAL = [
  { lines: ['You move in the direction of the', 'cursor.', '', 'When the cursor is farther away you', 'will run.'] },
  { lines: ['When your cursor is on the head of a', 'boy you will get a “lock on”.', '', 'Click and hold the left mouse button', 'to fire a love beam and fill his heart.'] },
  { lines: ['When firing the beam and a rival', 'appears, a showdown will happen.', '', 'Keep clicking your mouse button to', 'defeat your rival!'] },
  { lines: ['Firing the beam will drain the meter.', 'Restore it by collecting hearts.', '', 'If the meter reaches zero, the game', 'is over. The clock ends the round.'] },
  { lines: ['Watch out for teachers in the hall!', '', 'If you bump into one, you will fall', 'down and lose some love meter.'] },
];

/** Converts tutorial and round state into the framed game canvas. */
export class HallwayRenderer {
  constructor() { this.width = 1100; this.height = 550; this.time = 0; }

  /** Stores the responsive drawing area in CSS pixels. */
  resize(width, height) { this.width = width; this.height = height; }

  /** Paints the tutorial, live corridor, or the round-over card. */
  draw(ctx, scene) {
    this.time += 1 / 60;
    ctx.save();
    ctx.scale(this.width / 1100, this.height / 550);
    if (scene.mode === 'tutorial') this.drawTutorial(ctx, scene);
    else {
      hallway(ctx, this.time, scene);
      this.drawActors(ctx, scene);
      if (scene.mode === 'gameover') this.drawGameOver(ctx, scene);
    }
    ctx.restore();
  }

  /** Draws the tutorial page matching the source game's pink instruction book. */
  drawTutorial(ctx, scene) {
    ctx.fillStyle = '#e9b8e4'; ctx.fillRect(0, 0, 1100, 550);
    ctx.fillStyle = '#fff8ff'; roundedRect(ctx, 9, 8, 1082, 532, 33); ctx.fill();
    ctx.save(); ctx.beginPath(); roundedRect(ctx, 18, 17, 1064, 516, 28); ctx.clip();
    ctx.fillStyle = '#fff9ff'; ctx.fillRect(18, 17, 1064, 516);
    for (let y = 55; y < 520; y += 106) for (let x = 70; x < 1080; x += 115) flower(ctx, x + (Math.floor(y / 106) % 2) * 35, y, 35, '#f7e5f4');
    ctx.restore();
    this.drawOrnateFrame(ctx);
    this.drawTutorialPlaque(ctx);
    this.drawTutorialScene(ctx, scene.tutorialPage);
    this.drawTutorialText(ctx, scene.tutorialPage);
    this.drawTutorialNavigation(ctx, scene.tutorialPage);
  }

  /** Paints curved corner flourishes, fine borders, and floral corner clusters. */
  drawOrnateFrame(ctx) {
    ctx.lineWidth = 5; ctx.strokeStyle = '#72225f'; roundedRect(ctx, 18, 16, 1064, 516, 25); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#d57ec8'; roundedRect(ctx, 26, 24, 1048, 500, 22); ctx.stroke();
    ctx.lineWidth = 7; ctx.strokeStyle = '#85326f';
    ctx.beginPath(); ctx.moveTo(31, 120); ctx.bezierCurveTo(30, 55, 92, 37, 192, 35); ctx.lineTo(417, 35);
    ctx.moveTo(1069, 120); ctx.bezierCurveTo(1070, 55, 1008, 37, 908, 35); ctx.lineTo(683, 35);
    ctx.moveTo(31, 435); ctx.bezierCurveTo(46, 478, 73, 490, 116, 519);
    ctx.moveTo(1069, 435); ctx.bezierCurveTo(1054, 478, 1027, 490, 984, 519); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = '#c66db9';
    for (const [x, y, mirror] of [[38, 38, 0], [1062, 38, 1], [38, 518, 0], [1062, 518, 1]]) {
      ctx.save(); ctx.translate(x, y); ctx.scale(mirror ? -1 : 1, y > 100 ? -1 : 1);
      for (let i = 0; i < 4; i += 1) { ctx.beginPath(); ctx.ellipse(13 + i * 12, 10 + i * 6, 17, 6, -.65, 0, Math.PI * 2); ctx.stroke(); }
      flower(ctx, 34, 34, 14, '#e5a5db'); ctx.restore();
    }
  }

  /** Paints the raised pink tutorial title cartouche. */
  drawTutorialPlaque(ctx) {
    ctx.save(); ctx.shadowColor = '#58204c77'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#f7c8ed'; ctx.strokeStyle = '#72225f'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(423, 25); ctx.quadraticCurveTo(429, 12, 454, 16); ctx.lineTo(646, 16); ctx.quadraticCurveTo(672, 12, 678, 25); ctx.lineTo(669, 70); ctx.quadraticCurveTo(648, 99, 550, 101); ctx.quadraticCurveTo(452, 99, 431, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#fff4ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(447, 29); ctx.quadraticCurveTo(550, 38, 653, 29); ctx.stroke();
    ctx.fillStyle = '#74245f'; ctx.font = '29px Georgia'; ctx.textAlign = 'center'; ctx.fillText('TUTORIAL', 550, 75); ctx.restore();
  }

  /** Draws the character vignette that illustrates the selected lesson. */
  drawTutorialScene(ctx, page) {
    if (page === 0) {
      student(ctx, { x: 260, y: 422, scale: .77, color: 0, direction: 1, kind: 'girl' });
      this.drawCursor(ctx, 428, 163); arrow(ctx, 420, 176, 329, 271, '#7d276a');
    } else if (page === 1) {
      student(ctx, { x: 228, y: 427, scale: .78, color: 0, kind: 'girl' });
      student(ctx, { x: 449, y: 423, scale: .8, color: 1, kind: 'boy' });
      this.drawBeam(ctx, 250, 258, 446, 214, false); this.drawHeartBadge(ctx, 446, 142, 42);
      spark(ctx, 353, 251, '#ed6ee6');
    } else if (page === 2) {
      student(ctx, { x: 175, y: 433, scale: .68, color: 0, kind: 'girl' });
      student(ctx, { x: 363, y: 430, scale: .72, color: 1, kind: 'boy' });
      student(ctx, { x: 505, y: 430, scale: .64, color: 2, kind: 'rival' });
      jaggedBurst(ctx, 359, 270, 102, '#ff7ddf');
      this.drawBeam(ctx, 198, 263, 350, 236, true); spark(ctx, 427, 255, '#ffca48');
      this.drawHeartBadge(ctx, 422, 123, 30);
    } else if (page === 3) {
      this.drawInsetHud(ctx, 382, 150);
      student(ctx, { x: 550, y: 416, scale: .43, color: 0, kind: 'girl' });
    } else {
      student(ctx, { x: 247, y: 427, scale: .78, color: 0, kind: 'girl', fallen: true });
      student(ctx, { x: 444, y: 427, scale: .82, color: 2, kind: 'teacher' });
      ctx.fillStyle = '#60404f'; ctx.font = 'bold 21px Georgia'; ctx.textAlign = 'center'; ctx.fillText('OOPS!', 263, 218);
    }
  }

  /** Renders readable tutorial copy with the source game's alignment and tone. */
  drawTutorialText(ctx, page) {
    if (page === 3) {
      ctx.fillStyle = '#76276b'; ctx.font = 'bold 24px Georgia'; ctx.textAlign = 'left';
      ['Firing the beam will', 'drain the meter.', '', 'Collect hearts to refill it.', '', 'Zero meter means game over.'].forEach((line, index) => ctx.fillText(line, 65, 225 + index * 33));
      ['One round ends', 'when the clock', 'runs out.'].forEach((line, index) => ctx.fillText(line, 755, 245 + index * 35));
      return;
    }
    const lines = TUTORIAL[page].lines;
    const left = page === 4 ? 575 : 550;
    const top = 205;
    ctx.fillStyle = '#76276b'; ctx.font = 'bold 26px Georgia'; ctx.textAlign = 'left';
    let row = 0;
    for (const line of lines) {
      if (!line) { row += 27; continue; }
      ctx.fillText(line, left, top + row);
      row += 34;
    }
  }

  /** Draws tutorial arrow keys, next/back buttons, play, and sound glyph. */
  drawTutorialNavigation(ctx, page) {
    if (page > 0) arrow(ctx, 60, 310, 20, 310, '#b969ac');
    if (page < 4) arrow(ctx, 1040, 310, 1080, 310, '#b969ac');
    ctx.save(); ctx.shadowColor = '#67475988'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#f4b26a'; ctx.strokeStyle = '#a66a42'; ctx.lineWidth = 4; roundedRect(ctx, 432, 472, 236, 48, 15); ctx.fill(); ctx.stroke();
    ctx.shadowColor = 'transparent'; ctx.fillStyle = '#69391b'; ctx.font = 'bold 26px monospace'; ctx.textAlign = 'center'; ctx.fillText('PLAY', 550, 504);
    ctx.fillStyle = '#fff8ee'; ctx.strokeStyle = '#a66a42'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(430, 496, 29, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); flower(ctx, 430, 496, 19, '#e8aa5e');
    ctx.fillStyle = '#f5d8f1'; ctx.strokeStyle = '#a66a42'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(802, 496, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#884276'; ctx.font = 'bold 30px sans-serif'; ctx.fillText('◖))', 802, 506); ctx.restore();
    ctx.fillStyle = '#a04d8b'; ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`${page + 1} / 5`, 550, 455);
  }

  /** Draws a small practice HUD with nine heart pips and a clock. */
  drawInsetHud(ctx, x, y) {
    ctx.fillStyle = '#d9c7ba'; ctx.fillRect(x, y, 340, 186); ctx.fillStyle = '#f9f2df'; ctx.fillRect(x + 4, y + 4, 332, 178);
    ctx.fillStyle = '#126320'; ctx.fillRect(x + 5, y + 5, 242, 45); ctx.fillStyle = '#f5f4dc'; ctx.font = 'bold 15px monospace'; ctx.fillText('LOVE METER', x + 15, y + 22);
    for (let i = 0; i < 9; i += 1) heartShape(ctx, x + 22 + i * 23, y + 41, i < 4 ? '#efb7ed' : '#22632c', 8);
    ctx.fillStyle = '#8b7862'; ctx.beginPath(); ctx.arc(x + 289, y + 34, 23, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 289, y + 34, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#176523'; ctx.fillRect(x + 5, y + 55, 330, 126); ctx.fillStyle = '#f3e9d7'; ctx.fillRect(x + 14, y + 65, 112, 87); ctx.fillRect(x + 138, y + 65, 188, 87);
  }

  /** Renders the live hallway cast and the lock-on / lovebeam feedback. */
  drawActors(ctx, scene) {
    for (const teacher of scene.teachers) this.drawActor(ctx, teacher, 2, .78, 'teacher');
    for (const rival of scene.rivals) if (!rival.retreating) this.drawActor(ctx, rival, rival.variant, .75, 'rival');
    for (const boy of scene.boys) {
      if (boy.state === 'collected') continue;
      this.drawActor(ctx, boy, boy.variant, boy.state === 'follower' ? .68 : .77, 'boy');
      if (boy.charm > 0) this.drawHeartBadge(ctx, boy.x, boy.y - 275, 16, boy.charm / 100);
      if (scene.duel?.target === boy) jaggedBurst(ctx, boy.x, boy.y - 220, 56, '#ff8ae4');
    }
    for (const heart of scene.pickups) this.drawHeartBadge(ctx, heart.x, heart.y, 17);
    const target = scene.nearestBoy();
    if (target) {
      this.drawLockOn(ctx, target.x, target.y - 218);
      if (scene.beam) this.drawBeam(ctx, scene.player.x + scene.player.facing * 12, scene.player.y - 180, target.x, target.y - 215, scene.duel);
    }
    this.drawActor(ctx, scene.player, 0, .78, 'girl', scene.player.fallen > 0);
    for (const particle of scene.effects.items) this.drawParticle(ctx, particle);
    if (scene.mode === 'playing' && scene.active) this.drawRoundHint(ctx, scene);
  }

  /** Draws character shadow, pose, and a fallen pose after a teacher collision. */
  drawActor(ctx, actor, variant, scale, kind, fallen = false) {
    ctx.fillStyle = '#5d594d55'; ctx.beginPath(); ctx.ellipse(actor.x, actor.y - 2, 40 * scale, 9 * scale, 0, 0, Math.PI * 2); ctx.fill();
    student(ctx, { x: actor.x, y: actor.y, scale, color: variant, direction: actor.facing || 1, kind, fallen, blush: kind === 'boy' && actor.state === 'follower' });
  }

  /** Displays the source game's heart lock-on over the hovered boy. */
  drawLockOn(ctx, x, y) {
    ctx.save(); ctx.globalAlpha = .93; ctx.strokeStyle = '#fa40db'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.stroke();
    this.drawHeartBadge(ctx, x, y - 40, 23); ctx.restore();
  }

  /** Draws the pink beam, with a contrasting flare during rival showdowns. */
  drawBeam(ctx, x1, y1, x2, y2, duel) {
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = duel ? '#ff9b25' : '#fa40dc'; ctx.lineWidth = duel ? 10 : 8;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = '#ffd9ff'; ctx.lineWidth = 2; ctx.stroke();
    spark(ctx, (x1 + x2) / 2, (y1 + y2) / 2, duel ? '#ffca48' : '#ff9df0'); ctx.restore();
  }

  /** Draws a hovering outlined or filled heart. */
  drawHeartBadge(ctx, x, y, size, fill = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24); ctx.fillStyle = `rgba(247,58,225,${Math.max(.18, fill)})`; ctx.strokeStyle = '#eb35da'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-39, -7, -17, -30, 0, -13); ctx.bezierCurveTo(17, -30, 39, -7, 0, 18); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  /** Fades a heart, sparkle, or warning particle as it rises away. */
  drawParticle(ctx, particle) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life); ctx.fillStyle = '#ed47d4'; ctx.font = `bold ${particle.size}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(particle.glyph, particle.x, particle.y); ctx.globalAlpha = 1;
  }

  /** Gives the active round a subtle one-line reminder. */
  drawRoundHint(ctx, scene) {
    ctx.fillStyle = '#704a3c'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    const text = scene.duel ? 'CLICK QUICKLY TO WIN THE SHOWDOWN!' : scene.nearestBoy() ? 'LOCKED ON — HOLD TO FIRE YOUR LOVEBEAM' : 'MOVE YOUR CURSOR OVER A BOY TO LOCK ON';
    ctx.fillText(text, 550, 531);
  }

  /** Places the cursor arrow used in the movement instruction page. */
  drawCursor(ctx, x, y) {
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#17121a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1, y + 42); ctx.lineTo(x + 12, y + 31); ctx.lineTo(x + 23, y + 48); ctx.lineTo(x + 30, y + 44); ctx.lineTo(x + 19, y + 27); ctx.lineTo(x + 35, y + 26); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  /** Paints result text and one-click return to the tutorial. */
  drawGameOver(ctx, scene) {
    ctx.fillStyle = '#28152f99'; ctx.fillRect(0, 112, 1100, 438);
    ctx.fillStyle = '#fff6ff'; ctx.strokeStyle = '#91327f'; ctx.lineWidth = 6; roundedRect(ctx, 336, 190, 428, 220, 24); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#76276b'; ctx.textAlign = 'center'; ctx.font = 'bold 36px Georgia'; ctx.fillText('ROUND OVER', 550, 248);
    ctx.font = 'bold 21px sans-serif'; ctx.fillText(`SCORE  ${String(scene.score).padStart(8, '0')}`, 550, 300);
    ctx.font = '18px sans-serif'; ctx.fillText(`${scene.hearts} hearts collected`, 550, 336);
    ctx.fillStyle = '#f4b26a'; ctx.strokeStyle = '#a66a42'; roundedRect(ctx, 426, 360, 248, 40, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#69391b'; ctx.font = 'bold 19px monospace'; ctx.fillText('PLAY AGAIN', 550, 387);
  }
}

/** Creates a rounded rect path for interface cards. */
function roundedRect(ctx, x, y, width, height, radius) { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); }

/** Draws the pale wallpaper flower motif. */
function flower(ctx, x, y, radius, color) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, radius * .7, radius * .32, radius * .66, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, radius * .18, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

/** Draws a small tutorial or impact heart. */
function heartShape(ctx, x, y, color, size = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 12, size / 12); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-20, -4, -10, -17, 0, -8); ctx.bezierCurveTo(10, -17, 20, -4, 0, 8); ctx.fill(); ctx.restore();
}

/** Draws the tutorial's directional arrow. */
function arrow(ctx, x1, y1, x2, y2, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 21 * Math.cos(a - .45), y2 - 21 * Math.sin(a - .45)); ctx.lineTo(x2 - 21 * Math.cos(a + .45), y2 - 21 * Math.sin(a + .45)); ctx.closePath(); ctx.fill(); ctx.restore();
}

/** Adds a bright star flare at a beam or rivalry point. */
function spark(ctx, x, y, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.strokeStyle = '#fff3ff'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i < 12; i += 1) { const a = i * Math.PI / 6; const r = i % 2 ? 13 : 35; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

/** Draws a zigzag impact aura for a boy in a rival showdown. */
function jaggedBurst(ctx, x, y, radius, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = `${color}88`; ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.beginPath();
  for (let i = 0; i < 20; i += 1) { const a = i * Math.PI / 10; const r = i % 2 ? radius * .7 : radius; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
