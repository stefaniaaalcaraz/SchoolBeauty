/** Paints the side-view school corridor and chalkboard game HUD. */
export function hallway(ctx, time, scene, cameraX = 0) {
  const wall = ctx.createLinearGradient(0, 100, 0, 412);
  wall.addColorStop(0, '#fff5e9'); wall.addColorStop(1, '#e9d5c4');
  ctx.fillStyle = wall; ctx.fillRect(0, 0, 1100, 550);

  // Classroom windows and doors slide more slowly than the cast for depth.
  ctx.save(); ctx.translate(-(cameraX * .55), 0);
  for (let x = -285; x < 2000; x += 285) drawWindowBay(ctx, x - 12, 120);
  for (let x = 268; x < 2400; x += 600) drawClassroomDoor(ctx, x, 204);
  ctx.fillStyle = '#a58b6e'; ctx.fillRect(0, 388, 1100, 11);
  const floor = ctx.createLinearGradient(0, 399, 0, 550);
  floor.addColorStop(0, '#dce1bd'); floor.addColorStop(1, '#f3f0d7');
  ctx.fillStyle = floor; ctx.fillRect(0, 399, 1100, 151);
  ctx.strokeStyle = '#cdd2ad'; ctx.lineWidth = 1;
  const plankStart = -(cameraX % 82);
  for (let x = plankStart; x < 1100; x += 82) { ctx.beginPath(); ctx.moveTo(x, 399); ctx.lineTo(x - 12, 550); ctx.stroke(); }
  ctx.restore();

  drawScoreboard(ctx, time, scene);
}

/** Draws framed glass panels with curtains and wood mullions. */
function drawWindowBay(ctx, x, y) {
  ctx.fillStyle = '#a98d6e'; ctx.fillRect(x, y, 266, 190);
  const glass = ctx.createLinearGradient(0, y, 0, y + 182);
  glass.addColorStop(0, '#f6e3e8'); glass.addColorStop(1, '#fff8ed');
  ctx.fillStyle = glass; ctx.fillRect(x + 8, y + 8, 250, 170);
  ctx.fillStyle = '#dfc4b8'; ctx.fillRect(x + 8, y + 95, 250, 9);
  for (let pane = 1; pane < 3; pane += 1) { ctx.fillStyle = '#a98d6e'; ctx.fillRect(x + pane * 83, y + 8, 6, 170); }
  ctx.fillStyle = '#f4d6dc';
  ctx.beginPath(); ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + 54, y + 12); ctx.lineTo(x + 47, y + 178); ctx.lineTo(x + 8, y + 166); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 258, y + 8); ctx.lineTo(x + 220, y + 12); ctx.lineTo(x + 226, y + 178); ctx.lineTo(x + 258, y + 166); ctx.fill();
  ctx.strokeStyle = '#fff8ed'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + 12, y + 17); ctx.lineTo(x + 250, y + 17); ctx.stroke();
}

/** Draws a classroom door and frosted window. */
function drawClassroomDoor(ctx, x, y) {
  ctx.fillStyle = '#ac9273'; ctx.fillRect(x, y, 196, 190);
  ctx.fillStyle = '#f3eedc'; ctx.fillRect(x + 7, y + 7, 182, 174);
  ctx.fillStyle = '#d9d2bf'; ctx.fillRect(x + 33, y + 24, 127, 82);
  ctx.fillStyle = '#fae7ee'; ctx.fillRect(x + 39, y + 30, 115, 70);
  ctx.fillStyle = '#ac9273'; ctx.fillRect(x + 94, y + 30, 4, 70);
  ctx.fillStyle = '#bd9a64'; ctx.beginPath(); ctx.arc(x + 170, y + 119, 5, 0, Math.PI * 2); ctx.fill();
}

/** Paints the scoreboard, nine heart meter, clock, score, and sound button. */
function drawScoreboard(ctx, time, scene) {
  ctx.fillStyle = '#4a3f35'; ctx.fillRect(0, 0, 1100, 112);
  ctx.fillStyle = '#126320'; ctx.fillRect(4, 4, 1092, 103);
  ctx.fillStyle = '#1d7627'; ctx.fillRect(8, 8, 475, 91);
  ctx.fillStyle = '#f5f4dc'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'left'; ctx.fillText('LOVE METER', 28, 39);
  const hearts = Math.ceil(scene.energy / (scene.config.maxEnergy / 9));
  for (let i = 0; i < 9; i += 1) drawMeterHeart(ctx, 42 + i * 49, 73, i < hearts);
  // Cream clock housing interrupts the green scoreboard like the original game.
  ctx.fillStyle = '#ede8d3'; ctx.fillRect(485, 4, 132, 103);
  ctx.fillStyle = '#bfb59d'; ctx.beginPath(); ctx.arc(551, 54, 43, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fffdf0'; ctx.beginPath(); ctx.arc(551, 50, 39, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a7988b'; ctx.lineWidth = 2;
  for (let i = 0; i < 12; i += 1) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(551 + Math.cos(a) * 31, 50 + Math.sin(a) * 31); ctx.lineTo(551 + Math.cos(a) * 35, 50 + Math.sin(a) * 35); ctx.stroke(); }
  const angle = ((60 - scene.timeLeft) / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#bd3d56'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(551, 50); ctx.lineTo(551 + Math.cos(angle) * 25, 50 + Math.sin(angle) * 25); ctx.stroke();
  ctx.fillStyle = '#1d7627'; ctx.fillRect(619, 8, 469, 91);
  ctx.fillStyle = '#f5f4dc'; ctx.font = 'bold 26px monospace'; ctx.fillText('SCORE', 658, 39);
  ctx.font = 'bold 34px monospace'; ctx.fillText(String(scene.score).padStart(8, '0'), 658, 78);
  ctx.font = 'bold 15px monospace'; ctx.fillText(`LEVEL ${scene.level}   FLOOR ${scene.floorIndex + 1}/${scene.floors}`, 658, 96);
  const clockText = `${Math.floor(scene.timeLeft / 60)}:${String(scene.timeLeft % 60).padStart(2, '0')}`;
  ctx.fillStyle = '#493a35'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.fillText(clockText, 551, 102);
  ctx.fillStyle = '#155c24'; ctx.strokeStyle = '#e5edcd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(995, 16, 62, 58, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e5edcd'; ctx.beginPath(); ctx.moveTo(1006, 39); ctx.lineTo(1018, 39); ctx.lineTo(1031, 29); ctx.lineTo(1031, 61); ctx.lineTo(1018, 51); ctx.lineTo(1006, 51); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e5edcd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1028, 45, 14, -.85, .85); ctx.stroke(); ctx.beginPath(); ctx.arc(1028, 45, 22, -.78, .78); ctx.stroke();
}

/** Draws either a filled heart or the empty outline in the love meter. */
function drawMeterHeart(ctx, x, y, filled) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = filled ? '#efb7ed' : '#16451f'; ctx.strokeStyle = '#d6b7dc'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 16); ctx.bezierCurveTo(-36, -3, -17, -27, 0, -11); ctx.bezierCurveTo(17, -27, 36, -3, 0, 16); ctx.fill(); ctx.stroke(); ctx.restore();
}
