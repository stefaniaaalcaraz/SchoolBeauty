/** Draws an original, softly shaded chibi student with expressive features. */
export function student(ctx, { x, y, scale = 1, color = 0, direction = 1, gaze = 0, blush = false, watch = false, kind = 'girl', fallen = false }) {
  const palettes = [
    { hair: '#684657', skin: '#f7c9a8', shirt: '#f9f4eb', skirt: '#d97891', accent: '#e8ad62' },
    { hair: '#8a553f', skin: '#f2bf9b', shirt: '#fff7ee', skirt: '#72a5a0', accent: '#dd9d58' },
    { hair: '#493e56', skin: '#d99b7a', shirt: '#fff5e9', skirt: '#9b83b9', accent: '#eab567' },
    { hair: '#d7a34f', skin: '#f4c8aa', shirt: '#fff7eb', skirt: '#7caa87', accent: '#e789a0' },
  ];
  const p = kind === 'boy'
    ? { hair: '#25202b', skin: '#f4c49c', shirt: '#354164', skirt: '#303354', accent: '#e4bb58' }
    : kind === 'teacher'
      ? { hair: '#754c32', skin: '#d99e75', shirt: '#783d50', skirt: '#783d50', accent: '#edbe55' }
      : palettes[color % palettes.length];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * direction, scale);
  if (fallen) ctx.rotate(-Math.PI / 2);

  // Soft floor shadow grounds the oversized, friendly schoolkid silhouette.
  ctx.fillStyle = '#72514824';
  ctx.beginPath(); ctx.ellipse(0, -5, 32, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Legs, socks, and rounded shoes.
  ctx.fillStyle = p.skin;
  rounded(ctx, -13, -75, 10, 48, 5); rounded(ctx, 3, -75, 10, 48, 5);
  ctx.fillStyle = '#fff9ee'; rounded(ctx, -14, -40, 11, 18, 5); rounded(ctx, 3, -40, 11, 18, 5);
  ctx.fillStyle = '#625267'; rounded(ctx, -19, -29, 19, 10, 5); rounded(ctx, 1, -29, 19, 10, 5);
  // A-line skirt and softly shaded, collared uniform.
  ctx.fillStyle = p.skirt;
  if (kind === 'boy' || kind === 'teacher') {
    rounded(ctx, -22, -111, 20, 44, 6); rounded(ctx, 2, -111, 20, 44, 6);
    ctx.fillStyle = '#fff8eb'; rounded(ctx, -13, -69, 5, 20, 2); rounded(ctx, 8, -69, 5, 20, 2);
  } else {
    ctx.beginPath(); ctx.moveTo(-22, -105); ctx.lineTo(22, -105); ctx.lineTo(29, -70); ctx.quadraticCurveTo(0, -63, -29, -70); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12, -101); ctx.lineTo(-16, -73); ctx.moveTo(0, -101); ctx.lineTo(0, -69); ctx.moveTo(12, -101); ctx.lineTo(16, -73); ctx.stroke();
  }
  const shirt = ctx.createLinearGradient(-27, -177, 27, -100); shirt.addColorStop(0, '#fffdf5'); shirt.addColorStop(1, p.shirt); ctx.fillStyle = shirt;
  ctx.beginPath(); ctx.moveTo(-21, -174); ctx.quadraticCurveTo(-29, -175, -31, -162); ctx.lineTo(-27, -108); ctx.quadraticCurveTo(0, -99, 27, -108); ctx.lineTo(31, -162); ctx.quadraticCurveTo(29, -175, 21, -174); ctx.lineTo(13, -181); ctx.lineTo(-13, -181); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8dfd4'; ctx.beginPath(); ctx.moveTo(-9, -176); ctx.lineTo(0, -164); ctx.lineTo(-3, -151); ctx.lineTo(-15, -172); ctx.fill();
  ctx.beginPath(); ctx.moveTo(9, -176); ctx.lineTo(0, -164); ctx.lineTo(3, -151); ctx.lineTo(15, -172); ctx.fill();
  ctx.fillStyle = p.accent; ctx.beginPath(); ctx.moveTo(0, -163); ctx.lineTo(5, -155); ctx.lineTo(2, -137); ctx.lineTo(-2, -137); ctx.lineTo(-5, -155); ctx.closePath(); ctx.fill();
  // Little hands emerge below the short sleeves.
  ctx.fillStyle = p.skin; ctx.beginPath(); ctx.ellipse(-30, -132, 6, 9, -.1, 0, Math.PI * 2); ctx.ellipse(30, -132, 6, 9, .1, 0, Math.PI * 2); ctx.fill();
  // Neck and large rounded face.
  ctx.fillStyle = p.skin; rounded(ctx, -8, -194, 16, 20, 6);
  ctx.beginPath(); ctx.ellipse(0, -215, 32, 37, 0, 0, Math.PI * 2); ctx.fill();
  // Hair cap, side locks, and a few polished highlight strokes.
  ctx.fillStyle = p.hair;
  if (kind === 'boy') {
    ctx.beginPath(); ctx.moveTo(-32, -221); ctx.quadraticCurveTo(-40, -255, -6, -259); ctx.quadraticCurveTo(30, -267, 34, -237); ctx.lineTo(27, -226); ctx.quadraticCurveTo(12, -238, 3, -245); ctx.quadraticCurveTo(-11, -229, -32, -230); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(-31, -222); ctx.quadraticCurveTo(-37, -255, -7, -257); ctx.quadraticCurveTo(26, -267, 33, -239); ctx.lineTo(30, -214); ctx.quadraticCurveTo(17, -225, 11, -241); ctx.quadraticCurveTo(-4, -226, -29, -225); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-28, -221, 7, 23, -.18, 0, Math.PI * 2); ctx.ellipse(28, -221, 7, 23, .18, 0, Math.PI * 2); ctx.fill();
  }
  if (kind === 'teacher') { ctx.beginPath(); ctx.arc(22, -251, 13, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#ffffff35'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-4, -242, 17, 3.8, 5.4); ctx.stroke();
  // Bright eyes, tiny catchlights, brows, and rosy cheeks.
  const eyeY = watch ? -219 : -216;
  ctx.fillStyle = '#584653'; ctx.beginPath();
  if (kind === 'teacher') {
    ctx.ellipse(-11 + gaze * 4, eyeY, 3, watch ? 1.2 : 3.7, 0, 0, Math.PI * 2);
    ctx.ellipse(11 + gaze * 4, eyeY, 3, watch ? 1.2 : 3.7, 0, 0, Math.PI * 2);
  } else ctx.ellipse(13 + gaze * 4, eyeY, 3.2, watch ? 1.2 : 4.1, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!watch) { ctx.fillStyle = '#fffdf5'; ctx.beginPath(); ctx.arc(12 + gaze * 4, eyeY - 1, 1.1, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = p.hair; ctx.lineWidth = 2; ctx.beginPath();
  if (kind === 'teacher') { ctx.moveTo(-16, -225); ctx.quadraticCurveTo(-11, -229, -6, -225); ctx.moveTo(6, -225); ctx.quadraticCurveTo(11, -229, 16, -225); }
  else { ctx.moveTo(8, -225); ctx.quadraticCurveTo(13, -228, 18, -224); }
  ctx.stroke();
  if (kind === 'teacher') { ctx.strokeStyle = '#66515c'; ctx.lineWidth = 2; ctx.strokeRect(-18, -222, 14, 12); ctx.strokeRect(4, -222, 14, 12); ctx.beginPath(); ctx.moveTo(-4, -217); ctx.lineTo(4, -217); ctx.stroke(); }
  ctx.fillStyle = '#e9889870'; ctx.beginPath();
  if (kind === 'teacher') ctx.ellipse(-20, -205, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.ellipse(19, -205, blush ? 7 : 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(25, -211, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a65f6c'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(17, -204, 4, .3, 2.8); ctx.stroke();
  ctx.restore();
}

/** Adds a rounded shape without repeating path boilerplate. */
function rounded(ctx, x, y, width, height, radius) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fill();
}
