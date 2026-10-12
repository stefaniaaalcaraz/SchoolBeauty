import { GAME_WIDTH, GAME_HEIGHT, StateId } from './game.js?v=6';

const C = { ink: '#342b39', muted: '#786b78', pink: '#e76c91', coral: '#ef8e7e', cream: '#fff7ee', paper: '#fffdfa', lilac: '#a698c9', mint: '#add8c4', sky: '#cce8ed', darkPink: '#bd4c76' };

/** Draws the scene in three explicit passes: background, entities, UI overlay. */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Canvas 2D rendering is not supported in this browser.');
  }
  render(game) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.cream; ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.drawBackground(game);
    this.drawEntities(game);
    this.drawOverlay(game);
  }
  drawBackground(game) {
    const c = this.ctx;
    this.drawHallway(c, game.currentStateId === StateId.PLAYING ? game.camera.x : 0);
  }
  /** Repeating school corridor built from Canvas shapes so the scene scrolls cleanly. */
  drawHallway(c, cameraX) {
    c.fillStyle = '#f4f0d8'; c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    c.fillStyle = '#f8f5e5'; c.fillRect(0, 0, GAME_WIDTH, 132);
    c.fillStyle = '#ded8bd'; c.fillRect(0, 128, GAME_WIDTH, 13);
    // Soft ceiling panels and fluorescent fixtures give the hallway depth.
    for (let x = -80; x < GAME_WIDTH + 180; x += 320) {
      c.fillStyle = 'rgba(207,200,177,.26)'; c.fillRect(x - (cameraX * .12 % 320), 14, 260, 96);
      c.fillStyle = '#fffdf1'; roundRect(c, x + 38 - (cameraX * .12 % 320), 42, 150, 16, 8); c.fill();
    }
    const sectionWidth = 1480;
    const offset = (cameraX * .42) % sectionWidth;
    for (let index = -1; index < 3; index++) {
      this.drawHallwaySection(c, index * sectionWidth - offset);
    }
    // Polished school floor with long perspective-like tiles.
    const floor = c.createLinearGradient(0, 718, 0, GAME_HEIGHT);
    floor.addColorStop(0, '#dce7ca'); floor.addColorStop(.28, '#eef0dc'); floor.addColorStop(1, '#f6f1dc');
    c.fillStyle = floor; c.fillRect(0, 724, GAME_WIDTH, GAME_HEIGHT - 724);
    c.fillStyle = '#aeb89e'; c.fillRect(0, 710, GAME_WIDTH, 13);
    c.fillStyle = '#d3dbc0'; c.fillRect(0, 723, GAME_WIDTH, 10);
    c.strokeStyle = 'rgba(150,164,139,.22)'; c.lineWidth = 3;
    for (let x = -140 - ((cameraX * .85) % 140); x < GAME_WIDTH + 140; x += 140) {
      c.beginPath(); c.moveTo(x, 734); c.lineTo(x + 28, GAME_HEIGHT); c.stroke();
    }
    for (const y of [820, 936, 1050]) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_WIDTH, y); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.17)'; c.fillRect(0, 740, GAME_WIDTH, 115);
  }
  drawHallwaySection(c, x) {
    c.fillStyle = '#e8e7c7'; c.fillRect(x, 141, 1480, 569);
    c.fillStyle = 'rgba(255,255,255,.23)'; c.fillRect(x, 145, 1480, 23);
    // Classroom windows, tall double doors, and corridor signage.
    this.drawClassroomWindow(c, x + 54, 178, 370, 394);
    this.drawClassroomWindow(c, x + 1050, 178, 355, 394);
    this.drawClassroomDoor(c, x + 570, 191, 332, 520);
    c.fillStyle = '#a98c68'; c.fillRect(x + 44, 184, 390, 12);
    c.fillStyle = '#a98c68'; c.fillRect(x + 1040, 184, 376, 12);
    c.fillStyle = '#e5e0c5'; c.fillRect(x + 430, 141, 12, 570);
    c.fillStyle = '#d1d0b5'; c.fillRect(x + 432, 141, 3, 570);
    // Floor marker and a little student notice board.
    c.fillStyle = '#aa8161'; roundRect(c, x + 78, 250, 102, 96, 9); c.fill();
    c.fillStyle = '#fff5d9'; roundRect(c, x + 85, 257, 88, 82, 6); c.fill();
    c.fillStyle = '#a56b4f'; c.font = '800 40px "DM Sans", sans-serif'; c.textAlign = 'center'; c.fillText('2F', x + 129, 313);
    c.fillStyle = '#b78b61'; roundRect(c, x + 965, 265, 60, 130, 8); c.fill();
    c.fillStyle = '#faf1da'; roundRect(c, x + 972, 272, 46, 115, 5); c.fill();
    c.fillStyle = '#e8968b'; c.fillRect(x + 982, 292, 26, 31); c.fillStyle = '#d1bd9b'; c.fillRect(x + 982, 333, 26, 5); c.fillRect(x + 982, 346, 22, 5);
    // Wall panels and continuous wood trim.
    c.fillStyle = '#d9d7b8'; c.fillRect(x, 680, 1480, 20);
    c.fillStyle = '#b9b89d'; c.fillRect(x, 700, 1480, 10);
    c.strokeStyle = 'rgba(181,177,147,.34)'; c.lineWidth = 3;
    for (let panelX = x + 12; panelX < x + 1480; panelX += 150) { c.beginPath(); c.moveTo(panelX, 590); c.lineTo(panelX, 680); c.stroke(); }
  }
  drawClassroomWindow(c, x, y, w, h) {
    c.fillStyle = '#9c8d72'; c.fillRect(x - 9, y - 9, w + 18, h + 18);
    c.fillStyle = '#eddae5'; c.fillRect(x, y, w, h);
    const glass = c.createLinearGradient(x, y, x + w, y + h);
    glass.addColorStop(0, '#e8d9e8'); glass.addColorStop(.5, '#f3e7ed'); glass.addColorStop(1, '#d5e0d9');
    c.fillStyle = glass; c.fillRect(x + 5, y + 5, w - 10, h - 10);
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(x + 25, y + 8); c.lineTo(x + 95, y + 8); c.lineTo(x + 35, y + h - 8); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,249,239,.68)'; c.fillRect(x + w * .43, y, 13, h);
    c.fillStyle = '#a18f76'; c.fillRect(x + w * .65, y, 11, h); c.fillRect(x, y + h * .56, w, 12);
    c.fillStyle = '#c4b69a'; c.fillRect(x - 5, y + h - 2, w + 10, 13);
  }
  drawClassroomDoor(c, x, y, w, h) {
    c.fillStyle = '#9e8e72'; c.fillRect(x - 12, y - 8, w + 24, h + 20);
    c.fillStyle = '#ede9d7'; c.fillRect(x, y, w, h);
    c.fillStyle = '#b2a185'; c.fillRect(x + w / 2 - 5, y, 10, h);
    for (let side = 0; side < 2; side++) {
      const panelX = x + side * (w / 2) + 22;
      c.fillStyle = '#a79a81'; c.fillRect(panelX, y + 27, w / 2 - 44, 170);
      c.fillStyle = '#e9dfea'; c.fillRect(panelX + 5, y + 32, w / 2 - 54, 160);
      c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(panelX + 10, y + 36); c.lineTo(panelX + 39, y + 36); c.lineTo(panelX + 7, y + 115); c.closePath(); c.fill();
      const knobX = x + (side ? w / 2 - 22 : w / 2 + 12);
      c.fillStyle = '#98896e'; c.beginPath(); c.arc(knobX, y + 280, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#d4ceb9'; c.fillRect(panelX, y + 230, w / 2 - 44, 235);
    }
    c.fillStyle = '#a39479'; c.fillRect(x - 15, y + h - 14, w + 30, 18);
  }
  drawEntities(game) {
    const c = this.ctx;
    if (game.currentStateId === StateId.PLAYING) {
      const cameraX = game.camera.x;
      // Both student groups share the middle layer and are ordered by floor depth.
      const actors = [
        ...game.maleStudents.map((student) => ({ kind: 'student', actor: student })),
        ...game.rivals.map((rival) => ({ kind: 'rival', actor: rival })),
      ].sort((a, b) => a.actor.y - b.actor.y);
      for (const entry of actors) {
        if (entry.kind === 'student') this.drawStudent(c, entry.actor, cameraX, game);
        else this.drawRival(c, entry.actor, cameraX);
      }
      // The protagonist remains the topmost entity layer.
      this.drawProtagonist(c, game.protagonist, cameraX);
      return;
    }
    if ([StateId.MENU, StateId.LEVEL_START].includes(game.currentStateId)) {
      this.drawCharacter(c, 650, 800, '#e76c91', true);
      this.drawCharacter(c, 1290, 800, '#809bc4', false);
    }
  }
  drawStudent(c, student, cameraX, game) {
    const screenX = student.x - cameraX;
    const footY = floorYToScreen(student.y);
    const centerY = footY - 35;
    if (screenX < -110 || screenX > GAME_WIDTH + 110) return;
    c.save();
    // The reticle responds to player proximity or pointer/touch hover.
    const pointer = game.input.pointer;
    const nearPlayer = Math.hypot(student.x - game.protagonist.x, student.y - game.protagonist.y) <= 80;
    const nearPointer = Math.hypot(pointer.x - screenX, pointer.y - centerY) <= 80;
    if (!student.conquered && (nearPlayer || nearPointer)) {
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.setLineDash([8, 6]);
      c.beginPath(); c.arc(screenX, centerY, 43, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#e76c91'; c.lineWidth = 2; c.beginPath(); c.arc(screenX, centerY, 47, 0, Math.PI * 2); c.stroke();
    }
    c.fillStyle = 'rgba(67,57,70,.20)'; c.beginPath(); c.ellipse(screenX, footY + 4, 27, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = student.color; c.fillRect(screenX - 25, footY - 70, 50, 70);
    c.strokeStyle = student.conquered ? '#d77b91' : '#66586b'; c.lineWidth = 3; c.strokeRect(screenX - 25, footY - 70, 50, 70);
    // A tiny profile detail keeps the color-block placeholder readable as a student.
    c.fillStyle = '#fff3e8'; c.beginPath(); c.arc(screenX + 9, footY - 52, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#49394b'; c.beginPath(); c.arc(screenX + 12, footY - 53, 2.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#554759'; c.fillRect(screenX - 25, footY - 13, 50, 13);
    if (!student.conquered) {
      this.text(c, '★'.repeat(student.starLevel), screenX, footY - 78, 13, '#8b5071', 900, 'center');
      if (student.progressVisible || student.battle) {
        const barShake = student.battle ? Math.sin(student.battle.shakeTime * 50) * 2 : 0;
        if (student.battle) this.text(c, 'BATTLE!', screenX, footY - 110, 16, '#d73754', 900, 'center', 1);
        const barX = screenX - 50 + barShake;
        c.fillStyle = '#CCCCCC'; c.fillRect(barX, footY - 96, 100, 10);
        const playerProgress = student.battle ? student.battle.playerProgress / 100 : student.progress;
        c.fillStyle = '#4A90E2'; c.fillRect(barX, footY - 96, 100 * playerProgress, 10);
        if (student.battle) {
          c.fillStyle = '#E24A4A'; c.fillRect(barX + 100 * (1 - student.battle.rivalProgress / 100), footY - 96, 100 * student.battle.rivalProgress / 100, 10);
        }
        c.strokeStyle = '#fff'; c.lineWidth = 1; c.strokeRect(barX, footY - 96, 100, 10);
      }
    } else {
      this.text(c, '♡', screenX, footY - 79, 20, '#e76c91', 900, 'center');
    }
    if (student.floatingTimer > 0) {
      const elapsed = 0.8 - student.floatingTimer;
      c.globalAlpha = Math.min(1, student.floatingTimer * 2);
      this.text(c, '+1', screenX, footY - 108 - elapsed * 38, 24, '#fff', 900, 'center', 1);
    }
    c.restore();
  }
  drawProtagonist(c, player, cameraX) {
    if (!player) return;
    const screenX = player.x - cameraX;
    const footY = floorYToScreen(player.y);
    const bob = player.state === 'Walk' ? Math.sin(player.animationTime * 12) * 2 : player.state === 'Run' ? Math.sin(player.animationTime * 20) * 3 : 0;
    const flashing = player.state === 'Stunned' && Math.floor(player.animationTime * 10) % 2 === 0;
    c.save();
    c.fillStyle = 'rgba(67,57,70,.24)'; c.beginPath(); c.ellipse(screenX, footY + 5, 34, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = flashing ? '#ef5350' : '#C7CEEA';
    c.fillRect(screenX - 30, footY - 80 + bob, 60, 80);
    c.strokeStyle = '#514b68'; c.lineWidth = 3; c.strokeRect(screenX - 30, footY - 80 + bob, 60, 80);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(screenX + player.facing * 12, footY - 58 + bob, 5, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  drawRival(c, rival, cameraX) {
    const screenX = rival.x - cameraX;
    const footY = floorYToScreen(rival.y);
    const width = rival.level === 5 ? 62 : 50;
    const height = rival.level === 5 ? 82 : 70;
    if (screenX < -120 || screenX > GAME_WIDTH + 120) return;
    c.save();
    c.globalAlpha = rival.fadeAlpha;
    c.fillStyle = 'rgba(67,57,70,.2)'; c.beginPath(); c.ellipse(screenX, footY + 4, width * .55, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = rival.isFlashing ? '#fff' : rival.color;
    c.fillRect(screenX - width / 2, footY - height, width, height);
    c.strokeStyle = rival.mode === 'battle' ? '#d92f58' : '#6c4057'; c.lineWidth = rival.mode === 'battle' ? 4 : 3;
    c.strokeRect(screenX - width / 2, footY - height, width, height);
    c.fillStyle = '#fff3e8'; c.beginPath(); c.arc(screenX + 10, footY - height + 20, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#49394b'; c.beginPath(); c.arc(screenX + 12, footY - height + 20, 2.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6a2d50'; c.fillRect(screenX - width / 2, footY - 13, width, 13);
    if (rival.level === 5) {
      c.fillStyle = '#ffd34f'; c.beginPath();
      c.moveTo(screenX - 15, footY - height - 3); c.lineTo(screenX - 12, footY - height - 18);
      c.lineTo(screenX - 3, footY - height - 9); c.lineTo(screenX + 3, footY - height - 20);
      c.lineTo(screenX + 10, footY - height - 9); c.lineTo(screenX + 15, footY - height - 18);
      c.lineTo(screenX + 17, footY - height - 3); c.closePath(); c.fill();
      c.strokeStyle = '#b1832b'; c.lineWidth = 2; c.stroke();
    } else {
      this.text(c, `${rival.level}`, screenX, footY - height - 6, 13, '#fff', 900, 'center');
    }
    c.restore();
  }
  drawCharacter(c, x, y, outfit, heroine) {
    if (x < -100 || x > GAME_WIDTH + 100) return;
    c.save(); c.translate(x, y);
    const skin = '#edbd9e', outline = '#49394b';
    c.fillStyle = 'rgba(63,71,61,.2)'; c.beginPath(); c.ellipse(0, 4, 52, 11, 0, 0, Math.PI * 2); c.fill();
    // Walking legs are offset so the silhouette reads clearly in profile.
    c.strokeStyle = outline; c.lineWidth = 24; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-7, -58); c.lineTo(-22, -29); c.lineTo(-33, -3); c.stroke();
    c.strokeStyle = heroine ? '#273856' : '#8f2940'; c.lineWidth = 17;
    c.beginPath(); c.moveTo(-7, -58); c.lineTo(-22, -29); c.lineTo(-33, -3); c.stroke();
    c.strokeStyle = outline; c.lineWidth = 24; c.beginPath(); c.moveTo(11, -58); c.lineTo(24, -31); c.lineTo(34, -6); c.stroke();
    c.strokeStyle = heroine ? '#273856' : '#8f2940'; c.lineWidth = 17; c.beginPath(); c.moveTo(11, -58); c.lineTo(24, -31); c.lineTo(34, -6); c.stroke();
    // Shoes point forward, toward the right edge of the screen.
    c.fillStyle = '#fff8ed'; roundRect(c, -53, -10, 30, 12, 6); c.fill(); roundRect(c, 20, -12, 35, 12, 6); c.fill();
    c.fillStyle = heroine ? '#566fa6' : '#633c59'; roundRect(c, -50, -9, 23, 8, 5); c.fill(); roundRect(c, 24, -11, 27, 8, 5); c.fill();
    // Torso in profile with a visible forward arm.
    c.fillStyle = outline; c.beginPath(); c.moveTo(-22, -121); c.lineTo(19, -118); c.lineTo(28, -62); c.lineTo(-18, -55); c.closePath(); c.fill();
    c.fillStyle = outfit; c.beginPath(); c.moveTo(-19, -119); c.lineTo(15, -116); c.lineTo(21, -67); c.lineTo(-15, -61); c.closePath(); c.fill();
    c.fillStyle = heroine ? '#fff7eb' : '#e7c5d0'; c.beginPath(); c.moveTo(-5, -114); c.lineTo(7, -112); c.lineTo(11, -75); c.lineTo(-2, -73); c.closePath(); c.fill();
    c.fillStyle = skin; c.beginPath(); c.moveTo(11, -111); c.quadraticCurveTo(31, -102, 30, -85); c.lineTo(38, -71); c.quadraticCurveTo(40, -64, 34, -61); c.quadraticCurveTo(27, -60, 24, -68); c.lineTo(14, -81); c.closePath(); c.fill();
    c.strokeStyle = outline; c.lineWidth = 3; c.stroke();
    if (heroine) {
      c.fillStyle = '#fff4e4'; c.beginPath(); c.moveTo(-27, -67); c.lineTo(25, -70); c.lineTo(37, -17); c.lineTo(-42, -17); c.closePath(); c.fill();
      c.fillStyle = '#596b99'; c.beginPath(); c.moveTo(-19, -66); c.lineTo(26, -68); c.lineTo(49, -21); c.lineTo(-47, -21); c.closePath(); c.fill();
      c.strokeStyle = '#8293bd'; c.lineWidth = 3;
      for (let pleat = -28; pleat <= 30; pleat += 18) { c.beginPath(); c.moveTo(pleat, -62); c.lineTo(pleat - 8, -24); c.stroke(); }
    } else {
      c.fillStyle = '#d84d62'; c.beginPath(); c.moveTo(-17, -64); c.lineTo(19, -65); c.lineTo(24, -27); c.lineTo(-20, -27); c.closePath(); c.fill();
      c.strokeStyle = '#f0808a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, -57); c.lineTo(16, -57); c.stroke();
    }
    // Side-profile face: one eye, a small nose, and swept hair. Every student faces right.
    c.fillStyle = skin; c.beginPath(); c.moveTo(-27, -193); c.quadraticCurveTo(-3, -218, 20, -194); c.quadraticCurveTo(34, -180, 26, -157); c.lineTo(39, -147); c.quadraticCurveTo(42, -143, 34, -140); c.lineTo(31, -128); c.quadraticCurveTo(15, -115, -10, -126); c.lineTo(-29, -141); c.closePath(); c.fill();
    c.strokeStyle = outline; c.lineWidth = 4; c.stroke();
    c.fillStyle = '#fff8ed'; c.beginPath(); c.ellipse(18, -168, 7, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#433443'; c.beginPath(); c.arc(21, -168, 3.6, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#8e554e'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(27, -144); c.quadraticCurveTo(22, -139, 16, -142); c.stroke();
    c.fillStyle = heroine ? '#a43b53' : '#b77153'; c.beginPath(); c.arc(-23, -151, 9, 0, Math.PI * 2); c.fill();
    const hair = heroine ? '#6b304f' : '#353442';
    c.fillStyle = outline; c.beginPath(); c.moveTo(-34, -162); c.lineTo(-35, -196); c.quadraticCurveTo(-20, -222, 8, -213); c.quadraticCurveTo(30, -207, 34, -187); c.lineTo(26, -181); c.lineTo(12, -191); c.lineTo(4, -174); c.lineTo(-4, -190); c.lineTo(-13, -173); c.lineTo(-19, -188); c.lineTo(-25, -161); c.closePath(); c.fill();
    c.fillStyle = hair; c.beginPath(); c.moveTo(-31, -164); c.lineTo(-31, -193); c.quadraticCurveTo(-18, -215, 7, -208); c.quadraticCurveTo(25, -204, 29, -188); c.lineTo(24, -184); c.lineTo(11, -194); c.lineTo(2, -178); c.lineTo(-5, -193); c.lineTo(-14, -177); c.lineTo(-20, -190); c.lineTo(-26, -164); c.closePath(); c.fill();
    if (heroine) {
      c.fillStyle = '#542742'; c.beginPath(); c.moveTo(-29, -165); c.quadraticCurveTo(-58, -153, -56, -103); c.quadraticCurveTo(-54, -84, -43, -77); c.lineTo(-39, -130); c.lineTo(-26, -150); c.closePath(); c.fill();
      c.fillStyle = '#e9b6c2'; c.beginPath(); c.arc(31, -200, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e76c91'; c.beginPath(); c.arc(31, -200, 7, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }
  drawOverlay(game) {
    const c = this.ctx, ui = game.currentState?.ui || { buttons: [] };
    this.drawTopChrome(c, game);
    if (game.currentStateId === StateId.MENU) this.drawMenu(c, ui);
    else if (game.currentStateId === StateId.TUTORIAL) this.drawTutorial(c, ui);
    else if (game.currentStateId === StateId.LEVEL_START) this.drawLevelStart(c, ui);
    else if (game.currentStateId === StateId.PLAYING) this.drawHud(c, game, ui);
    else if (game.currentStateId === StateId.GAME_OVER) this.drawGameOver(c, ui);
  }
  drawTopChrome(c, game) {
    if (game.currentStateId === StateId.PLAYING || game.currentStateId === StateId.GAME_OVER) return;
    c.fillStyle = 'rgba(255,253,250,.82)'; roundRect(c, 58, 50, 340, 72, 28); c.fill();
    c.fillStyle = C.pink; c.beginPath(); c.arc(95, 86, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.ink; c.font = '800 21px "DM Sans", sans-serif'; c.textAlign = 'left'; c.fillText('PINKY PROMISE STUDIO', 124, 94);
    this.text(c, 'v 0.1 • HOMEROOM', 62, 1021, 16, C.muted, 700, 'left');
  }
  drawMenu(c, ui) {
    this.text(c, 'A LITTLE CRUSH, A LOT OF CHAOS', 960, 207, 19, C.darkPink, 800, 'center', 3);
    this.text(c, 'School', 960, 355, 136, C.ink, 900, 'center', 0, 'Nunito');
    this.text(c, 'Beauty', 960, 475, 136, C.pink, 900, 'center', 0, 'Nunito');
    this.text(c, 'Make the halls your runway.', 960, 529, 28, C.muted, 600, 'center');
    this.drawButtons(c, ui.buttons);
    this.drawSoundToggles(c, ui);
    this.text(c, 'A SCHOOL-DAY STORY', 960, 1017, 16, C.muted, 700, 'center');
  }
  drawSoundToggles(c, ui) {
    for (const [kind, label, on, x] of [['music', 'MUSIC', ui.music, 1570], ['sfx', 'SFX', ui.sfx, 1755]]) {
      this.text(c, label, x + 68, 52, 14, C.muted, 800, 'center');
      c.fillStyle = '#fffdfa'; roundRect(c, x, 63, 136, 54, 24); c.fill();
      c.fillStyle = on ? C.pink : '#b8acb6'; roundRect(c, x + 6, 69, 124, 42, 21); c.fill();
      c.fillStyle = '#fff'; c.font = '800 15px "DM Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(on ? 'ON' : 'OFF', x + 68, 90); c.textBaseline = 'alphabetic';
      c.fillStyle = 'rgba(255,255,255,.96)'; c.beginPath(); c.arc(on ? x + 105 : x + 32, 90, 16, 0, Math.PI * 2); c.fill();
      this.text(c, on ? '♪' : '♪', on ? x + 105 : x + 32, 96, 17, on ? C.pink : C.muted, 800, 'center');
    }
  }
  drawTutorial(c, ui) {
    this.dim(c); this.panel(c, 480, 235, 960, 610, 'YOUR QUICK GUIDE');
    const slide = ui.slide || 0;
    const icons = ['↔', '♡', '!'];
    c.fillStyle = ['#fbe2e6', '#f6e9d8', '#e3eef1'][slide]; c.beginPath(); c.arc(960, 430, 85, 0, Math.PI * 2); c.fill();
    this.text(c, icons[slide], 960, 466, 88, slide === 2 ? C.lilac : C.pink, 900, 'center', 0, 'Nunito');
    this.text(c, `0${slide + 1} / 03`, 960, 568, 17, C.darkPink, 800, 'center');
    this.text(c, ['Move with Arrow Keys, Run with Spacebar', 'Click boys to conquer them', 'Beware of rival girls!'][slide], 960, 626, 31, C.ink, 800, 'center');
    this.text(c, ['Find your pace and make a grand entrance.', 'A little charm goes a long way around campus.', 'Keep your eyes open between classes.'][slide], 960, 670, 20, C.muted, 500, 'center');
    for (let i = 0; i < 3; i++) { c.fillStyle = i === slide ? C.pink : '#e6dce2'; c.beginPath(); c.arc(925 + i * 35, 730, i === slide ? 8 : 6, 0, Math.PI * 2); c.fill(); }
    this.drawButtons(c, ui.buttons);
  }
  drawLevelStart(c, ui) {
    this.dim(c); this.panel(c, 520, 210, 880, 665, "TODAY'S PLAN");
    this.text(c, 'Fresh start, full heart.', 960, 333, 40, C.ink, 900, 'center', 0, 'Nunito');
    this.text(c, 'FIRST PERIOD • MONDAY MORNING', 960, 379, 16, C.darkPink, 800, 'center');
    const level = ui.level || 1;
    this.text(c, `LEVEL ${String(level).padStart(2, '0')} / 05  •  ${['3 × 1★  +  2 × 2★', '2 × 1★  +  2 × 2★  +  1 × 3★', '1 × 1★  +  2 × 2★  +  1 × 3★  +  1 × 4★', '1 × 1★  +  1 × 2★  +  1 × 3★  +  2 × 4★', '1 × 2★  +  1 × 3★  +  1 × 4★  +  2 × 5★'][level - 1]}`, 960, 433, 18, C.ink, 800, 'center');
    this.objective(c, 690, 466, '01', 'Make a connection', 'Meet someone new along the way.', C.pink);
    this.objective(c, 690, 574, '02', 'Keep moving', 'Reach the far side before the bell.', C.lilac);
    c.fillStyle = '#fff3e8'; roundRect(c, 690, 687, 540, 57, 20); c.fill();
    this.text(c, 'ARROWS TO MOVE     •     SPACE TO RUN', 960, 724, 16, C.muted, 800, 'center');
    this.drawButtons(c, ui.buttons);
  }
  objective(c, x, y, number, title, detail, color) {
    c.fillStyle = '#fff8f3'; roundRect(c, x, y, 540, 84, 20); c.fill();
    c.fillStyle = color; c.beginPath(); c.arc(x + 43, y + 42, 23, 0, Math.PI * 2); c.fill();
    this.text(c, number, x + 43, y + 48, 16, '#fff', 800, 'center');
    this.text(c, title, x + 83, y + 36, 21, C.ink, 800, 'left'); this.text(c, detail, x + 83, y + 62, 16, C.muted, 500, 'left');
  }
  drawHud(c, game, ui) {
    const top = c.createLinearGradient(0, 0, 0, 150);
    top.addColorStop(0, '#16752e'); top.addColorStop(1, '#105b29');
    c.fillStyle = top; c.fillRect(0, 0, GAME_WIDTH, 151);
    c.fillStyle = '#0a4c25'; c.fillRect(0, 145, GAME_WIDTH, 8);
    this.text(c, 'BEAUTY TIME', 292, 53, 27, '#fff8eb', 900, 'center', 0, 'Nunito');
    c.fillStyle = '#f8e8f1'; roundRect(c, 78, 75, 520, 47, 22); c.fill();
    c.fillStyle = '#bd4d8b'; roundRect(c, 84, 81, 508, 35, 17); c.fill();
    const remaining = Math.max(0, Math.min(1, game.progress.timeLeft / 60));
    const shineWidth = Math.max(0, 496 * remaining);
    if (shineWidth > 0) {
      const bar = c.createLinearGradient(84, 0, 84 + shineWidth, 0);
      bar.addColorStop(0, '#ffc6eb'); bar.addColorStop(.82, '#f99de0'); bar.addColorStop(1, '#fff2fa');
      c.fillStyle = bar; roundRect(c, 84, 81, shineWidth, 35, 17); c.fill();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(84 + shineWidth - 3, 98, 15, 0, Math.PI * 2); c.fill();
    }
    // Center clock echoes the reference HUD and makes the bell timer easy to read.
    c.fillStyle = '#f4eedc'; c.fillRect(855, 0, 210, 145);
    c.fillStyle = '#a2937e'; c.beginPath(); c.arc(960, 73, 59, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff8e9'; c.beginPath(); c.arc(960, 69, 52, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#d4c5b6'; c.lineWidth = 2;
    for (let tick = 0; tick < 12; tick++) {
      const angle = tick * Math.PI / 6 - Math.PI / 2;
      c.beginPath(); c.moveTo(960 + Math.cos(angle) * 42, 69 + Math.sin(angle) * 42); c.lineTo(960 + Math.cos(angle) * 46, 69 + Math.sin(angle) * 46); c.stroke();
    }
    c.strokeStyle = '#b43d50'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(960, 69); c.lineTo(960 + Math.cos(-Math.PI / 2 + remaining * Math.PI * 2) * 35, 69 + Math.sin(-Math.PI / 2 + remaining * Math.PI * 2) * 35); c.stroke();
    c.fillStyle = '#b43d50'; c.beginPath(); c.arc(960, 69, 6, 0, Math.PI * 2); c.fill();
    this.text(c, 'SCORE', 1180, 56, 23, '#fff8eb', 900, 'left', 1);
    this.text(c, String(game.progress.score).padStart(6, '0'), 1180, 117, 43, '#fff8eb', 900, 'left', 3, 'Nunito');
    this.text(c, 'ENERGY', 1180, 145, 13, '#d9f0d4', 800, 'left');
    c.fillStyle = 'rgba(255,255,255,.35)'; roundRect(c, 1242, 132, 300, 13, 7); c.fill();
    const energy = game.protagonist ? game.protagonist.energy / game.protagonist.maxEnergy : 1;
    c.fillStyle = energy > .25 ? '#ffc7e4' : '#ff7676'; roundRect(c, 1242, 132, 300 * energy, 13, 7); c.fill();
    this.drawDebug(c, game);
    this.text(c, 'MAKE A CONNECTION', 1445, 54, 17, '#d9f0d4', 800, 'center');
    this.text(c, `${Math.ceil(game.progress.timeLeft)}s TO THE BELL`, 1445, 111, 26, '#fff8eb', 900, 'center', 0, 'Nunito');
    this.drawButtons(c, ui.buttons);
    if ('ontouchstart' in window) {
      this.drawTouchPad(c, ui);
    }
    this.text(c, '←  → MOVE   •   SPACE RUN   •   TAP / DRAG TO WALK   •   DOUBLE-TAP TO RUN   •   ESC PAUSE', 960, 1031, 15, C.muted, 800, 'center');
  }
  drawDebug(c, game) {
    const player = game.protagonist;
    c.save(); c.globalAlpha = .91; c.fillStyle = 'rgba(48,39,53,.84)'; roundRect(c, 24, 166, 435, 90, 12); c.fill();
    this.text(c, 'PLAYER DEBUG', 42, 190, 14, '#ffd6e7', 900, 'left');
    this.text(c, `ENERGY ${player.energy.toFixed(1)} / 100   •   ${player.state.toUpperCase()}`, 42, 214, 15, '#fff', 700, 'left');
    this.text(c, `X ${Math.round(player.x)}   Y ${Math.round(player.y)}   •   LEVEL ${game.level}`, 42, 239, 15, '#fff', 700, 'left');
    roundRect(c, 1450, 164, 444, 151, 12); c.fill();
    this.text(c, 'STUDENT DEBUG  •  STAR / X / PROGRESS', 1468, 188, 13, '#ffd6e7', 900, 'left');
    game.maleStudents.forEach((student, index) => {
      const status = student.mode === 'follow' ? 'FOLLOW' : `${Math.round(student.progress * 100)}%`;
      this.text(c, `${student.starLevel}★   X ${Math.round(student.x)}   ${status}`, 1468, 213 + index * 19, 14, '#fff', 700, 'left');
    });
    roundRect(c, 24, 267, 435, 137, 12); c.fill();
    this.text(c, 'RIVAL DEBUG', 42, 291, 14, '#ff9dbd', 900, 'left');
    this.text(c, `NEXT SPAWN ${game.rivalSpawnTimer.toFixed(1)}s   •   DEFEATED ${game.rivalsDefeated}`, 42, 315, 14, '#fff', 700, 'left');
    game.rivals.slice(0, 3).forEach((rival, index) => {
      const battle = rival.mode === 'battle'
        ? `BATTLE P${Math.round(game.maleStudents.find((student) => student.id === rival.battleTargetId)?.battle?.playerProgress || 0)} / R${Math.round(rival.rivalProgress)}`
        : rival.mode.toUpperCase();
      this.text(c, `LV ${rival.level}   ${battle}`, 42, 341 + index * 19, 14, '#fff', 700, 'left');
    });
    c.restore();
  }
  drawTouchPad(c, ui) {
    c.globalAlpha = .78;
    for (const [id, x, label] of [['left', 87, '‹'], ['right', 175, '›'], ['run', 300, 'RUN']]) {
      c.fillStyle = '#fffdfa'; c.beginPath(); c.arc(x, 930, 42, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#e8d9dd'; c.lineWidth = 3; c.stroke(); this.text(c, label, x, 941, id === 'run' ? 15 : 42, id === 'run' ? C.darkPink : C.pink, 800, 'center');
    }
    c.globalAlpha = 1;
  }
  drawGameOver(c, ui) {
    this.dim(c); this.panel(c, 555, 250, 810, 575, 'THE BELL HAS RUNG');
    this.text(c, 'That was a day to remember.', 960, 401, 40, C.ink, 900, 'center', 0, 'Nunito');
    this.text(c, `FINAL SCORE  •  ${ui.score ?? 0} POINTS`, 960, 484, 27, C.pink, 800, 'center');
    this.text(c, `Rivals defeated  •  ${ui.rivalsDefeated ?? 0}`, 960, 535, 21, C.darkPink, 800, 'center');
    this.text(c, 'There’s always another school day.', 960, 573, 19, C.muted, 500, 'center');
    this.drawButtons(c, ui.buttons);
  }
  drawButtons(c, buttons) {
    for (const b of buttons) {
      const hover = b.id && false;
      c.save();
      c.fillStyle = b.style === 'secondary' ? '#fffdfa' : (b.style === 'quiet' ? 'rgba(255,255,255,.76)' : C.pink);
      roundRect(c, b.x, b.y, b.w, b.h, b.radius || Math.min(24, b.h / 2)); c.fill();
      if (b.style === 'secondary') { c.strokeStyle = '#eadde1'; c.lineWidth = 2; c.stroke(); }
      c.fillStyle = b.style === 'secondary' || b.style === 'quiet' ? C.ink : '#fff';
      c.font = `800 ${b.fontSize || 22}px "DM Sans", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      if (hover) c.globalAlpha = .9;
      c.restore();
    }
  }
  dim(c) { c.fillStyle = 'rgba(65,45,60,.18)'; c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); }
  panel(c, x, y, w, h, eyebrow) {
    c.save(); c.shadowColor = 'rgba(72,45,60,.16)'; c.shadowBlur = 42; c.shadowOffsetY = 15;
    c.fillStyle = '#fffdfa'; roundRect(c, x, y, w, h, 40); c.fill(); c.restore();
    this.text(c, eyebrow, 960, y + 48, 15, C.darkPink, 800, 'center');
  }
  text(c, value, x, y, size, color, weight = 600, align = 'center', spacing = 0, family = 'DM Sans') {
    c.save(); c.fillStyle = color; c.font = `${weight} ${size}px "${family}", "DM Sans", sans-serif`; c.textAlign = align; c.textBaseline = 'alphabetic';
    if (!spacing) c.fillText(value, x, y);
    else { const chars = [...value], total = chars.reduce((sum, char) => sum + c.measureText(char).width, 0) + (chars.length - 1) * spacing; let at = x - total / 2; for (const char of chars) { c.fillText(char, at, y); at += c.measureText(char).width + spacing; } }
    c.restore();
  }
}

function roundRect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2)); }
function floorYToScreen(y) { return 740 + ((y - 200) / 600) * 200; }
