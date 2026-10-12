import { hallway } from '../assets/HallwayArt.js';
import { student } from '../assets/CharacterArt.js';

const TUTORIAL = [
  { lines: ['Use the left and right arrow keys', 'or touch arrows to walk.', '', 'Hold SPACE or RUN to sprint.', 'At a stair, press UP or DOWN.'] },
  { lines: ['Hover over a boy to show the target', 'reticle, then click to charm him.', '', 'Keep clicking to fill his heart bar.', 'Each boy has a different star rank.'] },
  { lines: ['A rival can challenge your target.', 'Click quickly to win the showdown.', '', 'Each rival you defeat adds 15%', 'to that boy’s conquest score.'] },
  { lines: ['Moving uses energy; running uses', '30% more. Conquests restore energy.', '', 'At zero, you pause briefly to recover.', 'The clock ends the round at 0:00.'] },
  { lines: ['Watch out for teachers in the hall!', '', 'Bumping into one knocks you down', 'and drains your energy.'] },
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
    else if (scene.mode === 'objectives') {
      hallway(ctx, this.time, scene, 0);
      this.drawObjectives(ctx, scene);
    } else {
      hallway(ctx, this.time, scene, scene.cameraX);
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
      student(ctx, { x: 260, y: 422, scale: .77, color: 0, direction: 1, kind: 'protagonist' });
      this.drawCursor(ctx, 428, 163); arrow(ctx, 420, 176, 329, 271, '#7d276a');
    } else if (page === 1) {
      student(ctx, { x: 228, y: 427, scale: .78, color: 0, kind: 'protagonist' });
      student(ctx, { x: 449, y: 423, scale: .8, color: 1, kind: 'boy' });
      this.drawBeam(ctx, 250, 258, 446, 214, false); this.drawHeartBadge(ctx, 446, 142, 42);
      spark(ctx, 353, 251, '#ed6ee6');
    } else if (page === 2) {
      student(ctx, { x: 175, y: 433, scale: .68, color: 0, kind: 'protagonist' });
      student(ctx, { x: 363, y: 430, scale: .72, color: 1, kind: 'boy' });
      student(ctx, { x: 505, y: 430, scale: .64, color: 2, kind: 'rival' });
      jaggedBurst(ctx, 359, 270, 102, '#ff7ddf');
      this.drawBeam(ctx, 198, 263, 350, 236, true); spark(ctx, 427, 255, '#ffca48');
      this.drawHeartBadge(ctx, 422, 123, 30);
    } else if (page === 3) {
      this.drawInsetHud(ctx, 382, 150);
      student(ctx, { x: 550, y: 416, scale: .43, color: 0, kind: 'protagonist' });
    } else {
      student(ctx, { x: 247, y: 427, scale: .78, color: 0, kind: 'protagonist', fallen: true });
      student(ctx, { x: 444, y: 427, scale: .82, color: 2, kind: 'teacher' });
      ctx.fillStyle = '#60404f'; ctx.font = 'bold 21px Georgia'; ctx.textAlign = 'center'; ctx.fillText('OOPS!', 263, 218);
    }
  }

  /** Renders readable tutorial copy with the source game's alignment and tone. */
  drawTutorialText(ctx, page) {
    if (page === 3) {
      ctx.fillStyle = '#76276b'; ctx.font = 'bold 24px Georgia'; ctx.textAlign = 'left';
      ['Moving uses energy.', 'Running drains it 30% faster.', '', 'Conquests restore energy.', 'At zero, you pause to recover.'].forEach((line, index) => ctx.fillText(line, 65, 225 + index * 33));
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
    if (page < 4) {
      ctx.fillStyle = '#f4b26a'; ctx.strokeStyle = '#a66a42'; ctx.lineWidth = 3; roundedRect(ctx, 922, 472, 88, 48, 13); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#69391b'; ctx.font = 'bold 16px monospace'; ctx.fillText('NEXT ›', 966, 502);
    }
    ctx.fillStyle = '#fff8ee'; ctx.strokeStyle = '#a66a42'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(430, 496, 29, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); flower(ctx, 430, 496, 19, '#e8aa5e');
    for (const [x, label] of [[785, '♫'], [872, 'SFX']]) {
      ctx.fillStyle = '#f5d8f1'; ctx.strokeStyle = '#a66a42'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, 496, 29, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#884276'; ctx.font = label === 'SFX' ? 'bold 11px sans-serif' : 'bold 25px sans-serif'; ctx.fillText(label, x, 502);
    }
    ctx.restore();
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
    ctx.save(); ctx.translate(-scene.cameraX, 0);
    for (const teacher of scene.teachers) if (teacher.floor === scene.floorIndex) this.drawActor(ctx, teacher, 2, .78, 'teacher');
    for (const rival of scene.rivals) if (rival.floor === scene.floorIndex && !rival.defeated) {
      this.drawActor(ctx, rival, rival.variant, .72, 'rival');
      this.drawStarLabel(ctx, rival.x, rival.y - 260, rival.level, '#bd73d3');
      if (scene.duel?.rivals.includes(rival)) this.drawRivalBattleMeter(ctx, rival);
    }
    for (const boy of scene.boys) {
      if (boy.floor !== scene.floorIndex || boy.state === 'removed') continue;
      this.drawActor(ctx, boy, boy.variant, boy.state === 'following' ? .68 : .77, 'boy');
      if (boy.state === 'available') this.drawStarLabel(ctx, boy.x, boy.y - 278, boy.star, '#e7b64e');
      if (boy.clickProgress > 0 || scene.duel?.boy === boy) this.drawConquestMeter(ctx, boy, scene.duel?.boy === boy ? scene.duel.rivals : []);
    }
    for (const heart of scene.pickups) if (heart.floor === scene.floorIndex) this.drawHeartBadge(ctx, heart.x, heart.y, 17);
    const target = scene.nearestBoy();
    if (target) {
      this.drawLockOn(ctx, target.x, target.y - 218);
      if (scene.beam) this.drawBeam(ctx, scene.player.x + scene.player.facing * 12, scene.player.y - 180, target.x, target.y - 215, Boolean(scene.duel));
    }
    this.drawStairs(ctx, scene);
    // Paint the protagonist after the NPC layers so she is always in front.
    this.drawActor(ctx, scene.player, 0, .78, 'protagonist', scene.player.fallen > 0);
    for (const particle of scene.effects.items) this.drawParticle(ctx, particle);
    ctx.restore();
    this.drawTouchControls(ctx, scene);
    if (scene.mode === 'playing' && scene.active) this.drawRoundHint(ctx, scene);
  }

  /** Draws character shadow, pose, and a fallen pose after a teacher collision. */
  drawActor(ctx, actor, variant, scale, kind, fallen = false) {
    ctx.fillStyle = '#5d594d55'; ctx.beginPath(); ctx.ellipse(actor.x, actor.y - 2, 40 * scale, 9 * scale, 0, 0, Math.PI * 2); ctx.fill();
    student(ctx, { x: actor.x, y: actor.y, scale, color: variant, direction: actor.facing || 1, kind, fallen,
      gait: actor.animationTime ?? actor.age ?? 0, running: Boolean(actor.running), blush: kind === 'boy' && actor.state === 'following' });
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
    ctx.fillStyle = '#fff6ff'; ctx.strokeStyle = '#91327f'; ctx.lineWidth = 6; roundedRect(ctx, 300, 135, 500, 365, 24); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#76276b'; ctx.textAlign = 'center'; ctx.font = 'bold 31px Georgia'; ctx.fillText(scene.results.passed ? 'MISSION COMPLETE!' : 'ROUND OVER', 550, 180);
    ctx.textAlign = 'left';
    this.drawChecklist(ctx, 345, 226, scene.conquests >= scene.results.targetBoys, `Conquer boys  ${scene.conquests}/${scene.results.targetBoys}`);
    this.drawChecklist(ctx, 345, 263, scene.score >= scene.results.targetScore, `Reach score  ${scene.score}/${scene.results.targetScore}`);
    this.drawChecklist(ctx, 345, 300, scene.visitedFloors.size >= scene.results.targetFloors, `Visit floors  ${scene.visitedFloors.size}/${scene.results.targetFloors}`);
    if (scene.level === 5) this.drawChecklist(ctx, 345, 337, scene.conqueredStarFive, 'Conquer the 5-star boyfriend');
    const canAdvance = scene.results.passed && scene.level < 5;
    this.drawActionButton(ctx, 355, 410, 175, 53, 'RETRY', true);
    this.drawActionButton(ctx, 570, 410, 175, 53, scene.level === 5 && scene.results.passed ? 'FINISHED' : 'NEXT LEVEL', canAdvance);
  }

  /** Shows level goals before starting its timer. */
  drawObjectives(ctx, scene) {
    ctx.fillStyle = '#341d3488'; ctx.fillRect(0, 112, 1100, 438);
    ctx.fillStyle = '#fff8ff'; ctx.strokeStyle = '#91327f'; ctx.lineWidth = 6; roundedRect(ctx, 315, 125, 470, 365, 24); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#76276b'; ctx.textAlign = 'center'; ctx.font = 'bold 32px Georgia'; ctx.fillText(`LEVEL ${scene.level} OBJECTIVES`, 550, 175);
    ctx.font = '18px sans-serif'; ctx.fillText(`3:00 minutes  •  ${scene.floors} school floors`, 550, 212);
    this.drawChecklist(ctx, 370, 267, false, `Conquer ${scene.objectives.boys} boys`);
    this.drawChecklist(ctx, 370, 308, false, `Reach ${scene.objectives.score} score`);
    this.drawChecklist(ctx, 370, 349, false, `Explore all ${scene.floors} floors`);
    if (scene.objectives.requiresStarFive) this.drawChecklist(ctx, 370, 390, false, 'Conquer a 5-star boy');
    this.drawActionButton(ctx, 420, 418, 260, 55, 'START MATCH', true);
  }

  /** Draws a checklist row with a checked or empty square. */
  drawChecklist(ctx, x, y, checked, label) {
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#803576'; ctx.lineWidth = 2; roundedRect(ctx, x, y - 19, 21, 21, 3); ctx.fill(); ctx.stroke();
    if (checked) { ctx.strokeStyle = '#32a06b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 4, y - 9); ctx.lineTo(x + 9, y - 3); ctx.lineTo(x + 18, y - 16); ctx.stroke(); }
    ctx.fillStyle = '#512b54'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(label, x + 34, y); ctx.restore();
  }

  /** Draws an enabled or locked mission button. */
  drawActionButton(ctx, x, y, width, height, text, enabled) {
    ctx.fillStyle = enabled ? '#f4b26a' : '#c8b8c8'; ctx.strokeStyle = enabled ? '#a66a42' : '#958895'; ctx.lineWidth = 3;
    roundedRect(ctx, x, y, width, height, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = enabled ? '#69391b' : '#706875'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.fillText(text, x + width / 2, y + height / 2 + 6);
  }

  /** Places the male student's level tier over his head. */
  drawStarLabel(ctx, x, y, count, color) {
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = '#fffdf5'; ctx.lineWidth = 2; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.strokeText('★'.repeat(count), x, y); ctx.fillText('★'.repeat(count), x, y); ctx.restore();
  }

  /** Renders conquest progress independently from the rival's contest meter. */
  drawConquestMeter(ctx, boy, rivals) {
    const x = boy.x - 33; const y = boy.y - 295;
    ctx.fillStyle = '#fff9ff'; ctx.strokeStyle = '#783671'; ctx.lineWidth = 2; roundedRect(ctx, x, y, 66, 11, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f44bd9'; roundedRect(ctx, x + 2, y + 2, 62 * boy.progress, 7, 3); ctx.fill();
    if (rivals.length) this.drawRivalBattleMeter(ctx, rivals[0], x, y + 13);
  }

  /** Shows how close the player is to winning this rival's click challenge. */
  drawRivalBattleMeter(ctx, rival, x = rival.x - 27, y = rival.y - 280) {
    const width = x === rival.x - 27 ? 54 : 66;
    ctx.fillStyle = '#fff9ff'; ctx.strokeStyle = '#783671'; ctx.lineWidth = 2; roundedRect(ctx, x, y, width, 8, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8563c9'; roundedRect(ctx, x + 1, y + 1, (width - 2) * Math.min(1, rival.battleClicks / rival.battleRequirement), 6, 3); ctx.fill();
  }

  /** Draws staircase portals and the up/down prompt near the protagonist. */
  drawStairs(ctx, scene) {
    for (const x of [24, scene.worldWidth - 70]) {
      ctx.fillStyle = '#9a8066'; ctx.fillRect(x, 335, 52, 64); ctx.fillStyle = '#c4a987';
      for (let step = 0; step < 4; step += 1) ctx.fillRect(x + step * 10, 385 - step * 13, 14, 13);
    }
    if (scene.nearStairs()) {
      const x = scene.player.x;
      if (scene.floorIndex < scene.floors - 1) this.drawActionButton(ctx, x - 48, 331, 42, 40, '↑', true);
      if (scene.floorIndex > 0) this.drawActionButton(ctx, x + 7, 331, 42, 40, '↓', true);
    }
  }

  /** Provides virtual left/right/run controls for touchscreens. */
  drawTouchControls(ctx, scene) {
    if (scene.mode !== 'playing') return;
    for (const [x, label] of [[50, '◀'], [130, '▶'], [1050, 'RUN']]) {
      ctx.save(); ctx.globalAlpha = .72; ctx.fillStyle = '#fff8ff'; ctx.strokeStyle = '#8e4789'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, 505, label === 'RUN' ? 31 : 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = '#733375'; ctx.font = label === 'RUN' ? 'bold 12px sans-serif' : 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, x, 511); ctx.restore();
    }
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
