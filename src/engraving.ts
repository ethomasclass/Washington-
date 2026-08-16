/**
 * The interstitial plate — a copperplate engraving between scenes.
 *
 * WHY AN ENGRAVING AND NOT A PAINTING. The scenes are alla prima oil (09), and
 * a painted card between painted scenes is not a beat, it is a pause. An
 * engraving is a different medium doing a different job, exactly as it did in
 * 1775: the painting is what a place looked like, the print is how news of it
 * travelled. Amos Doolittle's four plates — already a findable object on the
 * lines in CB-03, and the only contemporary images of Lexington and Concord —
 * are the reference. So the card between scenes is the form the eighteenth
 * century actually used to say "here is what has happened, and where you are
 * now", and a student who meets Doolittle's plates later has already been
 * reading this medium for an hour without being told.
 *
 * HOW IT IS DRAWN. Everything is line. There are no fills and no washes in a
 * line engraving: tone is spacing, and the whole picture is parallel lines that
 * get closer together where it is darker, crossed a second time where it is
 * darker still. That is the entire technique, and it is why this file is a
 * hatching engine and four short compositions rather than four drawings.
 *
 * The paper carries a plate mark — the bruise the copper plate's edge presses
 * into damp paper — because it is the one detail that says "printed" instantly
 * and it costs two rectangles.
 */

import { INK, PAPER } from './palette';

type Ctx = CanvasRenderingContext2D;

/** Deterministic noise, so a plate is the same plate every time it is pulled. */
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1200;
const H = 760;

/** The image area, inside the plate mark, inside the paper. */
const ART = { x: 96, y: 78, w: W - 192, h: 452 };

/**
 * Parallel ruled lines through a shape.
 *
 * `density` is the gap in pixels — smaller is darker. The burin wanders a
 * little and lifts occasionally, because a line that is perfectly even reads as
 * a screen print and this has to read as a hand cutting metal.
 */
function hatch(
  x: Ctx,
  clip: () => void,
  angle: number,
  density: number,
  rnd: () => number,
  weight = 1,
  alpha = 1,
): void {
  x.save();
  x.beginPath();
  clip();
  x.clip();
  x.strokeStyle = INK.FLOOR;
  x.lineCap = 'round';
  const diag = Math.hypot(W, H);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  // Step perpendicular to the line direction, from one corner across the frame.
  for (let t = -diag; t < diag; t += density) {
    const jitter = (rnd() - 0.5) * density * 0.28;
    const cx = W / 2 + -dy * (t + jitter);
    const cy = H / 2 + dx * (t + jitter);
    x.globalAlpha = alpha * (0.62 + rnd() * 0.38);
    x.lineWidth = weight * (0.7 + rnd() * 0.6);
    x.beginPath();
    x.moveTo(cx - dx * diag, cy - dy * diag);
    x.lineTo(cx + dx * diag, cy + dy * diag);
    x.stroke();
  }
  x.restore();
}

/** A closed polygon as a clip path. */
const poly = (x: Ctx, pts: [number, number][]) => () => {
  x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
  x.closePath();
};

const rect = (x: Ctx, x0: number, y0: number, w: number, h: number) =>
  poly(x, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]);

/** The outline itself: an engraver cuts the contour before the tone. */
function outline(x: Ctx, pts: [number, number][], rnd: () => number, weight = 1.5): void {
  x.save();
  x.strokeStyle = INK.FLOOR;
  x.lineCap = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    x.lineWidth = weight * (0.8 + rnd() * 0.5);
    x.globalAlpha = 0.75 + rnd() * 0.25;
    x.beginPath();
    x.moveTo(pts[i][0], pts[i][1]);
    x.lineTo(pts[i + 1][0], pts[i + 1][1]);
    x.stroke();
  }
  x.restore();
}

/**
 * A figure, at engraving scale: five or six strokes and no face.
 *
 * At this size a person is a silhouette with a hat, and trying for more is how
 * a print starts to look like a cartoon.
 */
function figure(x: Ctx, px: number, py: number, h: number, rnd: () => number, hat = true): void {
  // py is the ground under the feet; the whole figure is built up from it.
  const w = h * 0.30;
  const hipY = py - h * 0.34;
  const shoulderY = py - h * 0.78;
  const headY = py - h * 0.88;
  x.save();
  x.strokeStyle = INK.FLOOR;
  x.lineCap = 'round';
  x.lineWidth = Math.max(0.7, h * 0.03);

  // Legs first, so the coat skirt closes over them.
  x.beginPath();
  x.moveTo(px - w * 0.17, hipY);
  x.lineTo(px - w * 0.21, py);
  x.moveTo(px + w * 0.17, hipY);
  x.lineTo(px + w * 0.22, py);
  x.stroke();

  /*
   * The coat. A period coat is narrow at the shoulder and flares from the waist
   * — that silhouette is most of what makes a small figure read as eighteenth
   * century rather than as a modern person in a rectangle.
   */
  const coat: [number, number][] = [
    [px - w * 0.34, shoulderY],
    [px + w * 0.34, shoulderY],
    [px + w * 0.5, hipY + h * 0.02],
    [px + w * 0.34, hipY - h * 0.01],
    [px - w * 0.34, hipY - h * 0.01],
    [px - w * 0.5, hipY + h * 0.02],
  ];
  hatch(x, poly(x, coat), Math.PI / 2.5, Math.max(1.3, h * 0.045), rnd, 0.85, 1);
  hatch(x, poly(x, coat), -Math.PI / 2.9, Math.max(2.4, h * 0.1), rnd, 0.7, 0.55);
  outline(x, [...coat, coat[0]], rnd, Math.max(0.8, h * 0.016));

  // Head.
  x.beginPath();
  x.arc(px, headY, h * 0.062, 0, Math.PI * 2);
  x.stroke();

  /*
   * A tricorne, which at this size is a flattened triangle over the skull and
   * is worth more than a face: it dates the figure at a glance.
   */
  if (hat) {
    const brim = h * 0.115;
    const tri: [number, number][] = [
      [px - brim, headY - h * 0.03],
      [px, headY - h * 0.13],
      [px + brim, headY - h * 0.03],
    ];
    hatch(x, poly(x, tri), Math.PI / 3, Math.max(1.2, h * 0.05), rnd, 0.8, 1);
    outline(x, [...tri, tri[0]], rnd, Math.max(0.8, h * 0.016));
  }
  x.restore();
}

/** Sky: sparse horizontals, closer at the top, the way a plate is skied. */
function sky(x: Ctx, rnd: () => number, horizon: number): void {
  hatch(x, rect(x, ART.x, ART.y, ART.w, horizon - ART.y), 0, 9, rnd, 0.7, 0.30);
  // A weather bank, crossed for weight.
  const band: [number, number][] = [
    [ART.x, ART.y + 26], [ART.x + ART.w, ART.y + 12],
    [ART.x + ART.w, ART.y + 88], [ART.x, ART.y + 104],
  ];
  hatch(x, poly(x, band), 0.06, 5.5, rnd, 0.7, 0.34);
}

/* ------------------------------------------------------------- compositions */

function plateVernon(x: Ctx, rnd: () => number): void {
  const hz = ART.y + 250;
  sky(x, rnd, hz);
  // The river, flat and light, behind everything.
  hatch(x, rect(x, ART.x, hz - 16, ART.w, 22), 0, 4.5, rnd, 0.7, 0.5);
  // The house: a long block, a pediment, the cupola.
  const hx = ART.x + 300;
  const body: [number, number][] = [[hx, hz - 96], [hx + 300, hz - 96], [hx + 300, hz + 34], [hx, hz + 34]];
  hatch(x, poly(x, body), -Math.PI / 2.2, 8, rnd, 0.8, 0.55);
  outline(x, [...body, body[0]], rnd, 1.7);
  const roof: [number, number][] = [[hx - 12, hz - 96], [hx + 150, hz - 150], [hx + 312, hz - 96]];
  hatch(x, poly(x, roof), Math.PI / 3, 4.5, rnd, 0.8, 0.8);
  outline(x, [...roof, roof[0]], rnd, 1.7);
  // Cupola.
  outline(x, [[hx + 132, hz - 150], [hx + 132, hz - 184], [hx + 168, hz - 184], [hx + 168, hz - 150]], rnd, 1.4);
  // The piazza columns — the thing everyone recognises.
  for (let i = 0; i <= 7; i++) {
    const cx = hx + 18 + i * 38;
    outline(x, [[cx, hz - 88], [cx, hz + 30]], rnd, 1.5);
  }
  // Lawn, opening toward the viewer.
  hatch(x, rect(x, ART.x, hz + 34, ART.w, ART.h - (hz + 34 - ART.y)), 0.08, 13, rnd, 0.7, 0.4);
  /*
   * Trees, as masses rather than leaves. The crown is walked round in an
   * irregular loop so it reads as foliage; the flat-sided polygon it started as
   * read as a child's drawing of a fir.
   */
  for (const [tx, th] of [[ART.x + 120, 150], [ART.x + 196, 104], [ART.x + ART.w - 96, 164]] as const) {
    const crown: [number, number][] = [];
    const lobes = 13;
    for (let i = 0; i <= lobes; i++) {
      const a = Math.PI + (i / lobes) * Math.PI * 1.02;
      const r = th * (0.46 + rnd() * 0.16);
      crown.push([tx + Math.cos(a) * r * 0.9, hz + 6 + Math.sin(a) * r * 1.15]);
    }
    crown.push([tx + th * 0.3, hz + 6]);
    hatch(x, poly(x, crown), Math.PI / 3.4, 4, rnd, 0.85, 0.85);
    hatch(x, poly(x, crown), -Math.PI / 3, 7, rnd, 0.7, 0.5);
    outline(x, [...crown, crown[0]], rnd, 1.2);
    outline(x, [[tx, hz + 6], [tx - 3, hz + 40]], rnd, 2.2);
  }
  figure(x, ART.x + 250, hz + 96, 66, rnd);
  figure(x, ART.x + 286, hz + 104, 62, rnd);
}

function plateCamp(x: Ctx, rnd: () => number): void {
  const hz = ART.y + 214;
  sky(x, rnd, hz);
  // Distant hills, and the town beyond the water.
  const hills: [number, number][] = [
    [ART.x, hz], [ART.x + 160, hz - 34], [ART.x + 420, hz - 14],
    [ART.x + 700, hz - 40], [ART.x + ART.w, hz - 18], [ART.x + ART.w, hz],
  ];
  hatch(x, poly(x, hills), 0.1, 7, rnd, 0.7, 0.42);
  outline(x, hills.slice(0, -1), rnd, 1.3);
  // Ground.
  hatch(x, rect(x, ART.x, hz, ART.w, ART.h - (hz - ART.y)), 0.05, 15, rnd, 0.7, 0.35);
  // Tents in rows, receding — the shot is "an army that is not one yet".
  const tent = (cx: number, base: number, w: number) => {
    const t: [number, number][] = [[cx - w, base], [cx, base - w * 1.25], [cx + w, base]];
    hatch(x, poly(x, t), Math.PI / 2.8, Math.max(3, w * 0.22), rnd, 0.75, 0.6);
    outline(x, [...t, t[0]], rnd, 1.4);
  };
  for (let row = 0; row < 4; row++) {
    const base = hz + 30 + row * row * 26 + row * 22;
    const w = 20 + row * 12;
    for (let i = 0; i < 7 - row; i++) {
      tent(ART.x + 90 + i * (w * 3.1) + row * 30, base, w);
    }
  }
  // Smoke from a cooking fire, a few curled lines.
  x.save();
  x.strokeStyle = INK.FLOOR;
  x.globalAlpha = 0.5;
  x.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) {
    x.beginPath();
    let sx2 = ART.x + 640 + i * 6;
    let sy2 = hz + 40;
    x.moveTo(sx2, sy2);
    for (let k = 0; k < 8; k++) {
      sx2 += Math.sin(k * 1.3 + i) * 7;
      sy2 -= 11;
      x.lineTo(sx2, sy2);
    }
    x.stroke();
  }
  x.restore();
  figure(x, ART.x + 200, hz + 150, 76, rnd);
  figure(x, ART.x + 250, hz + 162, 82, rnd);
  figure(x, ART.x + 520, hz + 132, 68, rnd, false);
}

function plateParlour(x: Ctx, rnd: () => number): void {
  // An interior: the plate is the room, so the "horizon" is the far wall.
  const wall = ART.y + 300;
  // Wall, lightly toned; panelling as ruled boxes.
  hatch(x, rect(x, ART.x, ART.y, ART.w, wall - ART.y), Math.PI / 2, 12, rnd, 0.6, 0.28);
  for (let i = 0; i < 5; i++) {
    const px = ART.x + 40 + i * ((ART.w - 80) / 5);
    outline(x, [
      [px, ART.y + 40], [px + 130, ART.y + 40],
      [px + 130, wall - 60], [px, wall - 60], [px, ART.y + 40],
    ], rnd, 1);
  }
  // Two tall windows, the only light in the plate: left white, framed heavy.
  for (const wx of [ART.x + 56, ART.x + 214]) {
    const win: [number, number][] = [[wx, ART.y + 54], [wx + 104, ART.y + 54], [wx + 104, wall - 84], [wx, wall - 84]];
    outline(x, [...win, win[0]], rnd, 2.2);
    for (let k = 1; k < 4; k++) outline(x, [[wx + (k * 104) / 4, ART.y + 54], [wx + (k * 104) / 4, wall - 84]], rnd, 0.9);
    for (let k = 1; k < 6; k++) {
      const yy = ART.y + 54 + (k * (wall - 138 - ART.y)) / 6;
      outline(x, [[wx, yy], [wx + 104, yy]], rnd, 0.9);
    }
  }
  // Floor, hatched toward the viewer.
  hatch(x, rect(x, ART.x, wall, ART.w, ART.h - (wall - ART.y)), 0.03, 11, rnd, 0.7, 0.34);
  // The map table, and the papers on it — the subject of the room.
  const tx = ART.x + 380;
  const top: [number, number][] = [[tx, wall + 24], [tx + 320, wall + 24], [tx + 348, wall + 60], [tx - 28, wall + 60]];
  hatch(x, poly(x, top), 0.02, 4, rnd, 0.7, 0.5);
  outline(x, [...top, top[0]], rnd, 1.8);
  outline(x, [[tx + 6, wall + 60], [tx + 22, wall + 150]], rnd, 1.8);
  outline(x, [[tx + 314, wall + 60], [tx + 300, wall + 150]], rnd, 1.8);
  /*
   * Papers heaped on it. In a line engraving the lightest thing in the picture
   * is bare paper, so these are knocked back out of the table's tone rather
   * than drawn on top of it — which is also how the plate would have been cut.
   */
  for (let i = 0; i < 5; i++) {
    const px = tx + 30 + i * 58 + (rnd() - 0.5) * 12;
    const sheet: [number, number][] = [
      [px, wall + 18], [px + 54, wall + 14], [px + 58, wall + 30], [px + 4, wall + 34],
    ];
    x.save();
    x.fillStyle = PAPER.WARM;
    x.beginPath();
    poly(x, sheet)();
    x.fill();
    x.restore();
    outline(x, [...sheet, sheet[0]], rnd, 1);
  }
  // Two officers at the table, and the general standing apart from it.
  figure(x, tx - 70, wall + 128, 104, rnd);
  figure(x, tx + 392, wall + 132, 108, rnd);
  figure(x, tx + 150, wall + 6, 92, rnd);
}

function plateLines(x: Ctx, rnd: () => number): void {
  const hz = ART.y + 206;
  sky(x, rnd, hz);
  // Boston across the water: a low town with spires, hatched light.
  const town: [number, number][] = [[ART.x + 300, hz], [ART.x + 300, hz - 26], [ART.x + ART.w, hz - 34], [ART.x + ART.w, hz]];
  hatch(x, poly(x, town), Math.PI / 2, 6, rnd, 0.6, 0.4);
  outline(x, town.slice(1, 3), rnd, 1.1);
  for (const sx2 of [ART.x + 430, ART.x + 560, ART.x + 700, ART.x + 840]) {
    outline(x, [[sx2, hz - 26], [sx2 + 3, hz - 74], [sx2 + 6, hz - 26]], rnd, 1.2);
  }
  // The water, ruled flat — the widest tone in the plate and the whole problem
  // of the act: four miles he cannot cross.
  hatch(x, rect(x, ART.x, hz, ART.w, 62), 0, 5, rnd, 0.7, 0.45);
  // Men-of-war at anchor.
  for (const [sxp, s] of [[ART.x + 520, 1], [ART.x + 700, 0.8]] as const) {
    const hull: [number, number][] = [[sxp, hz + 30], [sxp + 60 * s, hz + 30], [sxp + 52 * s, hz + 44], [sxp + 8 * s, hz + 44]];
    hatch(x, poly(x, hull), Math.PI / 2.4, 3, rnd, 0.7, 0.8);
    outline(x, [...hull, hull[0]], rnd, 1.2);
    for (let m = 0; m < 3; m++) outline(x, [[sxp + (14 + m * 18) * s, hz + 30], [sxp + (14 + m * 18) * s, hz - 26 * s]], rnd, 1);
  }
  // The parapet in the foreground, dark and close: the ground he is standing on.
  const bank: [number, number][] = [
    [ART.x, hz + 150], [ART.x + 240, hz + 118], [ART.x + 560, hz + 132],
    [ART.x + ART.w, hz + 112], [ART.x + ART.w, ART.y + ART.h], [ART.x, ART.y + ART.h],
  ];
  hatch(x, poly(x, bank), Math.PI / 2.6, 6, rnd, 0.85, 0.6);
  hatch(x, poly(x, bank), -Math.PI / 2.6, 11, rnd, 0.7, 0.4);
  outline(x, bank.slice(0, 4), rnd, 1.8);
  // Gabions along the top of it — wicker baskets, drawn as ribbed cylinders.
  for (let i = 0; i < 5; i++) {
    const gx = ART.x + 60 + i * 176;
    const gy = hz + 130 - i * 4;
    outline(x, [[gx, gy], [gx, gy - 54], [gx + 46, gy - 54], [gx + 46, gy], [gx, gy]], rnd, 1.4);
    for (let k = 1; k < 4; k++) outline(x, [[gx, gy - k * 13], [gx + 46, gy - k * 13]], rnd, 0.8);
  }
  figure(x, ART.x + 300, hz + 128, 92, rnd);
  figure(x, ART.x + 356, hz + 134, 88, rnd, false);
}

const PLATES: Record<string, (x: Ctx, rnd: () => number) => void> = {
  vernon: plateVernon,
  camp: plateCamp,
  parlour: plateParlour,
  lines: plateLines,
};

/**
 * Pull a plate.
 *
 * `subject` is the scene's plate set, so a scene gets the engraving of its own
 * place without anything having to be wired up twice.
 */
export function engraving(subject: string, seed = 7): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(seed * 977 + 13);

  // Laid paper, slightly warm, with the tooth left visible.
  x.fillStyle = PAPER.WARM;
  x.fillRect(0, 0, W, H);
  x.save();
  x.globalAlpha = 0.05;
  x.strokeStyle = INK.FADED;
  for (let i = 0; i < H; i += 3) {
    x.beginPath();
    x.moveTo(0, i + (rnd() - 0.5));
    x.lineTo(W, i + (rnd() - 0.5));
    x.stroke();
  }
  x.restore();

  // Foxing: the small rust spots that age gives a print.
  x.save();
  for (let i = 0; i < 40; i++) {
    x.globalAlpha = 0.04 + rnd() * 0.05;
    x.fillStyle = '#8A6A3C';
    const r = 2 + rnd() * 7;
    x.beginPath();
    x.arc(rnd() * W, rnd() * H, r, 0, Math.PI * 2);
    x.fill();
  }
  x.restore();

  /*
   * Everything the composition draws is clipped to the image area. A plate is
   * bitten inside its border and nothing prints outside it — and without this
   * the camp's front row of tents marched off the bottom of the picture and
   * onto the margin, which is the one thing a print cannot do.
   */
  x.save();
  x.beginPath();
  x.rect(ART.x, ART.y, ART.w, ART.h);
  x.clip();
  (PLATES[subject] ?? plateCamp)(x, rnd);
  /*
   * The bite. Ink sits heavier at the foot of a plate and toward the corners;
   * a perfectly even tone is a laser printer, not a copper plate.
   */
  const grad = x.createLinearGradient(0, ART.y + ART.h * 0.45, 0, ART.y + ART.h);
  grad.addColorStop(0, 'rgba(36,28,20,0)');
  grad.addColorStop(1, 'rgba(36,28,20,0.14)');
  x.fillStyle = grad;
  x.fillRect(ART.x, ART.y, ART.w, ART.h);
  x.restore();

  // The image border, cut as part of the plate.
  outline(x, [
    [ART.x, ART.y], [ART.x + ART.w, ART.y],
    [ART.x + ART.w, ART.y + ART.h], [ART.x, ART.y + ART.h], [ART.x, ART.y],
  ], rnd, 2.2);

  // The plate mark: the bruise the copper's edge presses into damp paper. One
  // light line and one dark, offset — an emboss, not a border.
  x.save();
  x.globalAlpha = 0.5;
  x.strokeStyle = '#B9A886';
  x.lineWidth = 2.5;
  x.strokeRect(ART.x - 34, ART.y - 30, ART.w + 68, ART.h + 156);
  x.globalAlpha = 0.28;
  x.strokeStyle = '#6E5B45';
  x.lineWidth = 1.4;
  x.strokeRect(ART.x - 32, ART.y - 28, ART.w + 68, ART.h + 156);
  x.restore();

  return c;
}
