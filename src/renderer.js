import { GAME_WIDTH, GAME_HEIGHT, StateId } from './game.js';

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
    if (game.currentStateId === StateId.PLAYING) return this.drawGameplayBackground(game);
    // Warm paper backdrop with a soft illustrated campus skyline.
    c.fillStyle = '#fff4eb'; c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    c.fillStyle = '#fbe3e4'; c.beginPath(); c.ellipse(970, 735, 750, 290, 0, 0, Math.PI * 2); c.fill();
    this.drawSchool(c, 210, 278, 0.9);
    this.drawSchool(c, 1450, 330, 0.62);
    c.fillStyle = '#e5d6cf'; c.fillRect(0, 870, GAME_WIDTH, 210);
    c.fillStyle = '#d7c6bc'; c.fillRect(0, 868, GAME_WIDTH, 10);
    this.drawTree(c, 130, 732, 1); this.drawTree(c, 1745, 770, 0.8);
    c.fillStyle = 'rgba(255,255,255,.44)'; c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
  drawSchool(c, x, y, scale) {
    c.save(); c.translate(x, y); c.scale(scale, scale);
    c.fillStyle = '#f4c9bf'; c.fillRect(0, 95, 490, 270);
    c.fillStyle = '#e89a91'; c.fillRect(24, 70, 442, 35);
    c.fillStyle = '#f8d8c5'; c.beginPath(); c.moveTo(-12, 75); c.lineTo(245, -15); c.lineTo(510, 75); c.closePath(); c.fill();
    c.fillStyle = '#d77d7d'; c.beginPath(); c.moveTo(-12, 75); c.lineTo(245, -15); c.lineTo(245, 10); c.lineTo(30, 91); c.closePath(); c.fill();
    c.fillStyle = '#51475a'; c.fillRect(195, 245, 94, 120);
    c.fillStyle = '#fff2de';
    for (let row = 0; row < 2; row++) for (let col = 0; col < 5; col++) c.fillRect(40 + col * 88, 135 + row * 75, 46, 40);
    c.fillStyle = '#faf1e7'; c.fillRect(211, 252, 62, 55);
    c.fillStyle = '#d78983'; c.fillRect(215, 256, 54, 48);
    c.fillStyle = '#fff4e9'; c.font = '800 26px "DM Sans", sans-serif'; c.textAlign = 'center'; c.fillText('SCHOOL', 245, 115);
    c.restore();
  }
  drawTree(c, x, y, scale) {
    c.save(); c.translate(x, y); c.scale(scale, scale); c.fillStyle = '#c28e78'; c.fillRect(-14, 38, 28, 126);
    c.fillStyle = '#b8d3ab'; c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#c9dfb9'; c.beginPath(); c.arc(-31, 12, 35, 0, Math.PI * 2); c.arc(34, 15, 39, 0, Math.PI * 2); c.fill(); c.restore();
  }
  drawGameplayBackground(game) {
    const c = this.ctx; c.fillStyle = '#d8edf0'; c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    c.fillStyle = '#faf0e3'; c.fillRect(0, 650, GAME_WIDTH, 430);
    c.fillStyle = '#e7c7ba'; c.fillRect(0, 850, GAME_WIDTH, 230);
    c.fillStyle = '#c5a69a'; c.fillRect(0, 847, GAME_WIDTH, 12);
    c.save(); c.translate(-game.camera.x * 0.38, 0);
    for (let i = 0; i < 5; i++) this.drawSchool(c, i * 610 + 160, 420, 0.58);
    c.restore();
    for (let i = 0; i < 28; i++) { const x = (i * 191 - game.camera.x * 0.7) % 2050; c.fillStyle = i % 2 ? '#f4b5bf' : '#fff'; c.beginPath(); c.arc((x + 2050) % 2050, 770 + Math.sin(i * 3) * 16, 5, 0, Math.PI * 2); c.fill(); }
  }
  drawEntities(game) {
    const c = this.ctx;
    if (game.currentStateId === StateId.PLAYING) {
      this.drawCharacter(c, game.progress.playerX - game.camera.x, 818, '#e76c91', true);
      for (let i = 0; i < 5; i++) this.drawCharacter(c, 750 + i * 290 - game.camera.x, 818, i % 2 ? '#809bc4' : '#eab27f', false);
      return;
    }
    if ([StateId.MENU, StateId.LEVEL_START].includes(game.currentStateId)) {
      this.drawCharacter(c, 830, 710, '#e76c91', true);
      this.drawCharacter(c, 1070, 738, '#809bc4', false);
    }
  }
  drawCharacter(c, x, y, outfit, heroine) {
    if (x < -100 || x > GAME_WIDTH + 100) return;
    c.save(); c.translate(x, y);
    c.fillStyle = 'rgba(88,65,78,.14)'; c.beginPath(); c.ellipse(0, 90, 57, 13, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#e7b7a2'; c.beginPath(); c.arc(0, -49, 44, 0, Math.PI * 2); c.fill();
    c.fillStyle = heroine ? '#5f425d' : '#55485c'; c.beginPath(); c.arc(0, -62, 48, Math.PI, 0); c.lineTo(42, -33); c.quadraticCurveTo(12, -15, -40, -37); c.closePath(); c.fill();
    c.fillStyle = '#3e3444'; c.beginPath(); c.arc(-15, -48, 3, 0, Math.PI * 2); c.arc(15, -48, 3, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#bb6f74'; c.lineWidth = 3; c.beginPath(); c.arc(0, -36, 9, .2, Math.PI - .2); c.stroke();
    c.fillStyle = '#e7b7a2'; c.fillRect(-14, -6, 28, 30);
    c.fillStyle = outfit; c.beginPath(); c.moveTo(-48, 17); c.lineTo(48, 17); c.lineTo(60, 77); c.lineTo(-59, 77); c.closePath(); c.fill();
    c.fillStyle = '#fff1e5'; c.fillRect(-10, 15, 20, 40);
    c.fillStyle = '#433a4d'; c.fillRect(-39, 76, 30, 58); c.fillRect(9, 76, 30, 58);
    c.fillStyle = '#fff8ef'; c.fillRect(-42, 127, 38, 13); c.fillRect(5, 127, 38, 13);
    c.fillStyle = '#dca894'; c.fillRect(-61, 27, 16, 48); c.fillRect(45, 27, 16, 48);
    if (heroine) { c.fillStyle = '#fff5df'; c.beginPath(); c.arc(36, -89, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e76c91'; c.beginPath(); c.arc(36, -89, 9, 0, Math.PI * 2); c.fill(); }
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
    c.fillStyle = 'rgba(255,253,250,.9)'; roundRect(c, 56, 42, 355, 108, 28); c.fill();
    this.text(c, 'FIRST PERIOD', 86, 82, 16, C.darkPink, 800, 'left'); this.text(c, 'Make a connection', 86, 120, 27, C.ink, 800, 'left');
    c.fillStyle = 'rgba(255,253,250,.9)'; roundRect(c, 1480, 42, 380, 108, 28); c.fill();
    this.text(c, `♥  ${game.progress.score} / 5`, 1555, 108, 28, C.pink, 800, 'left');
    this.text(c, `BELL  ${Math.ceil(game.progress.timeLeft)}s`, 1782, 108, 23, C.ink, 800, 'center');
    this.drawButtons(c, ui.buttons);
    if ('ontouchstart' in window) {
      this.drawTouchPad(c, ui);
    }
    this.text(c, '←  → MOVE       SPACE RUN       ESC PAUSE', 960, 1031, 15, C.muted, 800, 'center');
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
    this.text(c, `Connections made  •  ${ui.score ?? 0} / 5`, 960, 484, 27, C.pink, 800, 'center');
    this.text(c, 'There’s always another school day.', 960, 540, 20, C.muted, 500, 'center');
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
