/**
 * The drawn world — scenes made of line and flat colour.
 *
 * This is an attempt at the thing itself rather than a prompt for it. If a
 * scene can be DRAWN at quality in code, that is strictly better than
 * generating it: twenty-seven plates are then consistent by construction, there
 * is no drift to police across a long generation run, every plate is a few
 * kilobytes of source instead of a megabyte of JPEG, and a plate can be edited
 * — move the house, cut a tent, widen the street — instead of re-rolled and
 * hoped over.
 *
 * THE GRAMMAR, which is the whole of the style:
 *
 *   1. Every form is bounded by a drawn contour. The line wanders, varies in
 *      weight, and overshoots its corners. A plotted line that closes exactly
 *      is the failure mode — it reads as clip art instantly.
 *   2. Colour is flat and opaque inside the contour. No gradients, no blends,
 *      no cast shadows, no rendering. Where a form needs a shaded side it gets
 *      a SECOND FLAT TONE with its own edge, never a ramp.
 *   3. Everything is described by drawn incident: courses of stone, ranks of
 *      shingles, the boards of a fence, tufts of grass, ruts in a track. This
 *      is what separates the style from flat vector art — busy with marks,
 *      empty of rendering.
 *   4. Space is flattened. Depth is overlap and height on the page, not haze.
 *
 * The palette is a warm parchment ground carrying a small muted earth range,
 * and the darkest value in the picture is the ink of the line.
 */

import { HORIZON, OVERSCAN, VIEW_H } from './ground';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

/**
 * Where the horizon lands in PLATE pixels, and how much of a plate is seen.
 *
 * A plate is drawn 14% larger than the view so it has room to slide for
 * parallax without showing an edge, which means roughly six percent is cropped
 * off every side and the horizon does NOT sit at 0.34 of the image the way it
 * sits at 0.34 of the frame. Composing to the image rather than to the view is
 * what put the clouds off the top of the screen and the foreground below the
 * bottom of it on the first attempt in-engine.
 *
 * These come straight out of ground.ts rather than being measured by eye,
 * because the whole project's discipline is that everything which has to agree
 * about space reads the same numbers.
 */
const horizonView = VIEW_H / 2 - HORIZON * VIEW_H;
export const plateHorizon = (H: number): number =>
  (0.5 - horizonView / (VIEW_H * OVERSCAN)) * H;
/** The fraction of a plate that survives the overscan crop, per edge. */
export const PLATE_SAFE = (1 - 1 / OVERSCAN) / 2;

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

/** The ink. Never black — a warm brown-black, as iron gall dries. */
const INK = '#3B2D1F';

const C = {
  parchment: '#EFE4C8',
  sky: '#AFC8D2',
  cloud: '#E6EDEC',
  hillFar: '#93A695',
  hillNear: '#7E9078',
  water: '#9FB3B4',
  grass: '#A2AC6E',
  grassDark: '#8E9A5E',
  track: '#C0B48C',
  trackDark: '#AB9E77',
  stone: '#CDC4AC',
  stoneShade: '#B4AA92',
  roof: '#9C6B52',
  roofShade: '#87593F',
  timber: '#8A6F4E',
  timberShade: '#6F5940',
  canvasLit: '#E3DAC0',
  canvasShade: '#C6BBA0',
  leaf: '#7E8C55',
  leafShade: '#6A7847',
  bank: '#9A8B66',
  bankShade: '#83754F',
  flag: '#A8433A',
  fire: '#C87B34',
} as const;

/* ------------------------------------------------------------------ the pen */

/**
 * A drawn line. The single most important function in the file.
 *
 * Straight spans are broken into short steps and bowed slightly, weight varies
 * stroke to stroke, and each segment starts and ends a little past where it
 * should. Take any of that away and the picture turns into vector art.
 */
/**
 * One-dimensional value noise. Smooth, and therefore LOW frequency.
 *
 * This is the correction that matters most in the whole file. A hand cutting a
 * curve deviates over twenty or forty pixels, not over two. Per-segment random
 * jitter — which is what this code did first — is high-frequency, and high
 * frequency does not read as a hand: it reads as a bad printer, or as a filter.
 * A line that wanders slowly and confidently reads as a tool held by a person.
 */
function wobble(seed: number): (t: number) => number {
  const r = mulberry(seed);
  const table: number[] = [];
  for (let i = 0; i < 64; i++) table.push(r() * 2 - 1);
  return (t: number) => {
    const i = Math.floor(t);
    const f = t - i;
    const a = table[((i % 64) + 64) % 64];
    const b = table[(((i + 1) % 64) + 64) % 64];
    const u = f * f * (3 - 2 * f); // smoothstep, so there are no corners
    return a + (b - a) * u;
  };
}

/**
 * A drawn line, as a filled shape rather than a stroke.
 *
 * A relief line is the wood LEFT STANDING after everything round it is cut
 * away, so it swells where the knife is deep and tapers to nothing where it
 * enters and leaves. `ctx.stroke()` cannot do that — it has one width for the
 * whole path — so the line is built as a polygon: walk the path, offset by half
 * the width along the normal on each side, and fill the loop that makes.
 *
 * Three further properties, all of them things a plotted line does not have:
 * the contour wanders at low frequency; segments overshoot their junctions,
 * because two cuts meeting rarely meet exactly; and the line occasionally
 * BREAKS, because blocks chip and ink runs short. A contour in this medium
 * closes visually without closing topologically.
 */
function pen(x: Ctx, pts: Pt[], rnd: () => number, weight = 2, close = false): void {
  const all = close ? [...pts, pts[0]] : pts;
  if (all.length < 2) return;
  const wob = wobble(Math.floor(rnd() * 100000));
  const stroke = 0.85 + rnd() * 0.3; // stroke-to-stroke variation

  for (let i = 0; i < all.length - 1; i++) {
    if (rnd() < 0.09) continue; // the block chips; the line breaks
    const [ax, ay] = all[i];
    const [bx, by] = all[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 0.5) continue;
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    const nx = -uy;
    const ny = ux;
    // Overshoot: two cuts meeting rarely meet exactly.
    const over = 1.5 + rnd() * 2.5;
    const steps = Math.max(3, Math.round(len / 9));
    const L: Pt[] = [];
    const R: Pt[] = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      // Low-frequency wander, ~0.6-1.2px over a 18-40px wavelength.
      const wav = wob(t * (len / 28) + i * 3.1) * 1.1;
      const px = ax + (bx - ax) * t - ux * over + ux * over * 2 * t + nx * wav;
      const py = ay + (by - ay) * t - uy * over + uy * over * 2 * t + ny * wav;
      /*
       * The nib profile: fat in the middle, pointed at both ends, which is what
       * a knife entering and leaving a block leaves behind.
       */
      const w = weight * stroke * (0.42 + Math.pow(Math.sin(Math.PI * t), 0.35) * 0.95);
      L.push([px + nx * w * 0.5, py + ny * w * 0.5]);
      R.push([px - nx * w * 0.5, py - ny * w * 0.5]);
    }
    x.save();
    x.fillStyle = INK;
    x.globalAlpha = 0.8 + rnd() * 0.2;
    x.beginPath();
    x.moveTo(L[0][0], L[0][1]);
    for (const p of L.slice(1)) x.lineTo(p[0], p[1]);
    for (const p of R.reverse()) x.lineTo(p[0], p[1]);
    x.closePath();
    x.fill();
    x.restore();
  }
}

/** Flat opaque colour inside a shape. No gradient, ever. */
function fill(x: Ctx, pts: Pt[], colour: string): void {
  x.save();
  x.fillStyle = colour;
  x.beginPath();
  x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
  x.closePath();
  x.fill();
  x.restore();
}

/**
 * Fill, then draw the contour round it — and DO NOT let them line up.
 *
 * The highest-value cue in the whole style, and the cheapest. A print was cut
 * by one person and coloured by another, working fast over the top, so the
 * colour overshoots the line on one side and falls short on the other. Perfect
 * registration between a fill and its contour is the single loudest signal that
 * a picture was made by a machine — it is the thing that survives even when the
 * line itself has been roughened.
 *
 * The flat is therefore offset bodily by a pixel or three AND given its own
 * independently wandering boundary, rather than being the same path drawn
 * twice.
 */
function shape(x: Ctx, pts: Pt[], colour: string, rnd: () => number, weight = 2): void {
  const dx = (rnd() - 0.5) * 5;
  const dy = (rnd() - 0.5) * 5;
  const wob = wobble(Math.floor(rnd() * 100000));
  const wandered: Pt[] = pts.map((p, i) => [
    p[0] + dx + wob(i * 0.7) * 2.2,
    p[1] + dy + wob(i * 0.7 + 31) * 2.2,
  ]);
  fill(x, wandered, colour);
  pen(x, pts, rnd, weight, true);
}

/** Run a callback with drawing clipped to a shape, for laying incident inside it. */
function inside(x: Ctx, pts: Pt[], fn: () => void): void {
  x.save();
  x.beginPath();
  x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
  x.closePath();
  x.clip();
  fn();
  x.restore();
}

/* ------------------------------------------------------- drawn incident */

/** Courses of stone: horizontal beds, broken by staggered vertical joints. */
function stonework(x: Ctx, box: Pt[], rnd: () => number, course = 15): void {
  const x0 = Math.min(...box.map((p) => p[0]));
  const x1 = Math.max(...box.map((p) => p[0]));
  const y0 = Math.min(...box.map((p) => p[1]));
  const y1 = Math.max(...box.map((p) => p[1]));
  inside(x, box, () => {
    for (let y = y0 + course; y < y1; y += course) {
      pen(x, [[x0 - 4, y + (rnd() - 0.5) * 2], [x1 + 4, y + (rnd() - 0.5) * 2]], rnd, 1);
      let px = x0 + rnd() * course * 1.6;
      while (px < x1) {
        pen(x, [[px, y], [px + (rnd() - 0.5) * 2, y - course]], rnd, 0.9);
        px += course * (1.2 + rnd() * 1.4);
      }
    }
  });
}

/** Ranks of shingles or tiles, drawn as overlapping ticks. */
function shingles(x: Ctx, poly: Pt[], rnd: () => number, rank = 11): void {
  const x0 = Math.min(...poly.map((p) => p[0]));
  const x1 = Math.max(...poly.map((p) => p[0]));
  const y0 = Math.min(...poly.map((p) => p[1]));
  const y1 = Math.max(...poly.map((p) => p[1]));
  inside(x, poly, () => {
    for (let y = y0 + rank; y < y1 + rank; y += rank) {
      pen(x, [[x0 - 4, y], [x1 + 4, y + (rnd() - 0.5) * 2]], rnd, 0.9);
      for (let px = x0 + (rnd() * rank); px < x1; px += rank * (1.1 + rnd() * 0.5)) {
        pen(x, [[px, y], [px, y - rank * 0.8]], rnd, 0.7);
      }
    }
  });
}

/** Vertical boards, for a fence, a door or a shutter. */
function planks(x: Ctx, box: Pt[], rnd: () => number, gap = 9): void {
  const x0 = Math.min(...box.map((p) => p[0]));
  const x1 = Math.max(...box.map((p) => p[0]));
  const y0 = Math.min(...box.map((p) => p[1]));
  const y1 = Math.max(...box.map((p) => p[1]));
  inside(x, box, () => {
    for (let px = x0 + gap; px < x1; px += gap) pen(x, [[px, y0], [px + (rnd() - 0.5) * 2, y1]], rnd, 0.9);
  });
}


/**
 * A wavy silhouette, for ground that rolls.
 *
 * The single biggest correction from the reference: land is not a band. Every
 * ground plane in this style is a curve that rises and falls, and depth is read
 * from one curve overlapping the next. Straight horizontal edges are what made
 * the first attempt look like a bar chart.
 */
function ridge(x0: number, x1: number, y: number, amp: number, rnd: () => number, steps = 9): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const wob = Math.sin(t * Math.PI * (1.4 + rnd() * 0.6)) * amp + (rnd() - 0.5) * amp * 0.5;
    out.push([x0 + (x1 - x0) * t, y - wob]);
  }
  return out;
}

/**
 * Grass as directional hatching, not as scattered tufts.
 *
 * The reference covers open ground in dense short strokes that lie along the
 * fall of the land, which is what stops a big green shape reading as a painted
 * wall. Sparse tufts on flat colour read as speckle; this reads as a field.
 */
function grassLay(
  x: Ctx,
  region: Pt[],
  rnd: () => number,
  n: number,
  lean: number,
  len: number,
): void {
  const x0 = Math.min(...region.map((p) => p[0]));
  const x1 = Math.max(...region.map((p) => p[0]));
  const y0 = Math.min(...region.map((p) => p[1]));
  const y1 = Math.max(...region.map((p) => p[1]));
  inside(x, region, () => {
    /*
     * Clustered, not scattered. Evenly spread single strokes read as rain
     * falling on the field; grass grows in patches, so each site puts down a
     * small group of short strokes that share a lean, and the ground between
     * them is left bare.
     */
    for (let i = 0; i < n / 5; i++) {
      const cx2 = x0 + rnd() * (x1 - x0);
      const t = rnd();
      const cy2 = y0 + t * (y1 - y0);
      const patchLean = lean + (rnd() - 0.5) * 0.5;
      for (let k = 0; k < 5; k++) {
        const gx = cx2 + (rnd() - 0.5) * 34;
        const gy = cy2 + (rnd() - 0.5) * 12;
        const s = len * (0.3 + t * 0.5) * (0.6 + rnd() * 0.6);
        pen(x, [[gx, gy], [gx + patchLean * s * 1.6, gy - s * 0.42]], rnd, 0.75);
      }
    }
  });
}

/**
 * A tree: a dark mass with its branch structure drawn INSIDE it.
 *
 * This is the most recognisable single object in the reference and it is not
 * how trees are usually stylised — the branches are not hidden behind the
 * canopy, they are drawn straight over it in the same ink as the contour, so
 * the mass reads as foliage carried on a structure rather than as a lollipop.
 */
function tree(x: Ctx, tx: number, groundY: number, h: number, rnd: () => number): void {
  const trunkW = h * 0.045;
  const crownR = h * 0.34;
  const crownY = groundY - h * 0.66;

  // Trunk, drawn first and then covered by the canopy.
  shape(x, [[tx - trunkW, groundY], [tx - trunkW * 0.6, crownY],
            [tx + trunkW * 0.6, crownY], [tx + trunkW, groundY]], C.timber, rnd, 1.8);

  // The canopy: two or three overlapping lobed masses, not one circle.
  const lobes: Pt[][] = [];
  for (const [ox, oy, r] of [[-crownR * 0.5, 0, crownR * 0.8], [crownR * 0.45, -crownR * 0.2, crownR * 0.75], [0, -crownR * 0.5, crownR * 0.85]] as const) {
    const pts: Pt[] = [];
    const n = 17;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.82 + (i % 2 === 0 ? 0.2 : 0.03) + rnd() * 0.07);
      pts.push([tx + ox + Math.cos(a) * rr, crownY + oy + Math.sin(a) * rr * 0.92]);
    }
    lobes.push(pts);
    fill(x, pts, C.leaf);
  }
  for (const pts of lobes) pen(x, pts, rnd, 2.2, true);

  // Branches drawn over the canopy, in ink, reaching into it.
  x.save();
  const hull = lobes.flat();
  const bx0 = Math.min(...hull.map((p) => p[0]));
  const bx1 = Math.max(...hull.map((p) => p[0]));
  const by0 = Math.min(...hull.map((p) => p[1]));
  const by1 = Math.max(...hull.map((p) => p[1]));
  x.beginPath();
  x.rect(bx0, by0, bx1 - bx0, by1 - by0);
  x.clip();
  const limb = (fx: number, fy: number, angle: number, len: number, depth: number): void => {
    if (depth > 3 || len < 8) return;
    const ex = fx + Math.cos(angle) * len;
    const ey = fy + Math.sin(angle) * len;
    pen(x, [[fx, fy], [ex, ey]], rnd, Math.max(0.9, 3.4 - depth));
    limb(ex, ey, angle - 0.45 - rnd() * 0.3, len * 0.66, depth + 1);
    limb(ex, ey, angle + 0.45 + rnd() * 0.3, len * 0.66, depth + 1);
  };
  limb(tx, crownY + crownR * 0.5, -Math.PI / 2, crownR * 0.62, 0);
  x.restore();
}

/** A shrub: a cluster of small lobed masses, the cheapest incident there is. */
function bush(x: Ctx, bx: number, by: number, r: number, rnd: () => number, colour: string = C.leaf): void {
  for (let k = 0; k < 3; k++) {
    const ox = (k - 1) * r * 0.55;
    const rr = r * (0.62 + rnd() * 0.3);
    const pts: Pt[] = [];
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / (n - 1)) * Math.PI;
      const q = rr * (0.8 + (i % 2 === 0 ? 0.24 : 0));
      pts.push([bx + ox + Math.cos(a) * q, by + Math.sin(a) * q * 0.9]);
    }
    pts.push([bx + ox + rr, by], [bx + ox - rr, by]);
    shape(x, pts, colour, rnd, 1.7);
  }
}

/** A sheep, a hen, a rabbit — small life, drawn tiny. The world is inhabited. */
function beast(x: Ctx, px: number, py: number, s: number, rnd: () => number): void {
  shape(x, [[px - s, py - s * 0.5], [px - s * 0.7, py - s], [px + s * 0.7, py - s],
            [px + s, py - s * 0.45], [px + s * 0.6, py], [px - s * 0.6, py]], C.canvasLit, rnd, 1.3);
  shape(x, [[px + s * 0.7, py - s * 0.95], [px + s * 1.25, py - s * 0.9],
            [px + s * 1.2, py - s * 0.5], [px + s * 0.7, py - s * 0.5]], C.timberShade, rnd, 1.2);
  pen(x, [[px - s * 0.5, py], [px - s * 0.5, py + s * 0.4]], rnd, 1);
  pen(x, [[px + s * 0.4, py], [px + s * 0.4, py + s * 0.4]], rnd, 1);
}


/* ------------------------------------------------------------ the objects */

function tent(x: Ctx, cx: number, base: number, w: number, rnd: () => number): void {
  const h = w * 1.35;
  // Contact with the ground. Without it a drawn object floats, and in a style
  // with no cast shadows this flat smear under the base is the only thing
  // saying the thing is standing on something.
  x.save();
  x.globalAlpha = 0.16;
  x.fillStyle = '#2E3320';
  x.beginPath();
  x.ellipse(cx, base + 2, w * 1.15, w * 0.2, 0, 0, Math.PI * 2);
  x.fill();
  x.restore();
  const body: Pt[] = [[cx - w, base], [cx, base - h], [cx + w, base]];
  shape(x, body, C.canvasLit, rnd, 2.1);
  // The shaded half, flat, with its own edge down the ridge.
  fill(x, [[cx, base - h], [cx + w, base], [cx + w * 0.12, base]], C.canvasShade);
  pen(x, [[cx, base - h], [cx + w * 0.12, base]], rnd, 1.4);
  // Seams down the canvas, and the door flap.
  inside(x, body, () => {
    for (let i = -2; i <= 2; i++) {
      pen(x, [[cx + i * w * 0.34, base], [cx + i * w * 0.10, base - h * 0.9]], rnd, 0.8);
    }
  });
  pen(x, [[cx - w * 0.22, base], [cx, base - h * 0.55], [cx + w * 0.22, base]], rnd, 1.2);
  // Guy ropes and pegs.
  pen(x, [[cx, base - h], [cx - w * 1.5, base + 3]], rnd, 1);
  pen(x, [[cx, base - h], [cx + w * 1.5, base + 3]], rnd, 1);
  pen(x, [[cx - w * 1.5, base - 5], [cx - w * 1.5, base + 4]], rnd, 1.2);
  pen(x, [[cx + w * 1.5, base - 5], [cx + w * 1.5, base + 4]], rnd, 1.2);
}

function house(x: Ctx, hx: number, hy: number, w: number, h: number, rnd: () => number): void {
  const body: Pt[] = [[hx, hy], [hx + w, hy], [hx + w, hy + h], [hx, hy + h]];
  shape(x, body, C.stone, rnd, 2.3);
  stonework(x, body, rnd, h / 7);
  // The gable end, a flat second tone.
  fill(x, [[hx + w * 0.72, hy], [hx + w, hy], [hx + w, hy + h], [hx + w * 0.72, hy + h]], C.stoneShade);
  pen(x, [[hx + w * 0.72, hy], [hx + w * 0.72, hy + h]], rnd, 1.5);
  // Roof: a shallow hip, shingled.
  const roof: Pt[] = [[hx - 9, hy], [hx + w * 0.5, hy - h * 0.46], [hx + w + 9, hy]];
  shape(x, roof, C.roof, rnd, 2.3);
  shingles(x, roof, rnd, h * 0.1);
  // Windows: four panes each, with a drawn sill.
  for (let i = 0; i < 3; i++) {
    const wx = hx + w * (0.12 + i * 0.26);
    const wy = hy + h * 0.22;
    const ww = w * 0.13;
    const wh = h * 0.3;
    const win: Pt[] = [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]];
    shape(x, win, C.timberShade, rnd, 1.8);
    pen(x, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], rnd, 1);
    pen(x, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], rnd, 1);
    pen(x, [[wx - 3, wy + wh + 2], [wx + ww + 3, wy + wh + 2]], rnd, 1.4);
  }
  // Door, planked.
  const dw = w * 0.12;
  const dx = hx + w * 0.44;
  const door: Pt[] = [[dx, hy + h * 0.6], [dx + dw, hy + h * 0.6], [dx + dw, hy + h], [dx, hy + h]];
  shape(x, door, C.timber, rnd, 2);
  planks(x, door, rnd, dw / 3);
  // A chimney, because a roofline needs an interruption.
  const cx2 = hx + w * 0.22;
  shape(x, [[cx2, hy - h * 0.3], [cx2 + w * 0.07, hy - h * 0.3], [cx2 + w * 0.07, hy - h * 0.05], [cx2, hy - h * 0.05]], C.stoneShade, rnd, 2);
}

function fire(x: Ctx, px: number, py: number, s: number, rnd: () => number): void {
  // A tripod, a kettle, and flames drawn as tongues.
  pen(x, [[px - s * 0.6, py], [px, py - s * 1.25]], rnd, 1.6);
  pen(x, [[px + s * 0.6, py], [px, py - s * 1.25]], rnd, 1.6);
  pen(x, [[px, py - s * 1.25], [px, py - s * 0.75]], rnd, 1.2);
  shape(x, [[px - s * 0.34, py - s * 0.75], [px + s * 0.34, py - s * 0.75],
            [px + s * 0.26, py - s * 0.3], [px - s * 0.26, py - s * 0.3]], C.timberShade, rnd, 1.8);
  for (let i = -1; i <= 1; i++) {
    shape(x, [[px + i * s * 0.22 - s * 0.14, py],
              [px + i * s * 0.22, py - s * 0.34 - rnd() * s * 0.12],
              [px + i * s * 0.22 + s * 0.14, py]], C.fire, rnd, 1.3);
  }
  // Logs.
  pen(x, [[px - s * 0.5, py + 2], [px + s * 0.5, py]], rnd, 1.6);
  pen(x, [[px - s * 0.42, py + 5], [px + s * 0.46, py + 4]], rnd, 1.4);
}

function barrel(x: Ctx, px: number, py: number, s: number, rnd: () => number): void {
  const body: Pt[] = [[px - s * 0.42, py - s], [px + s * 0.42, py - s],
                      [px + s * 0.5, py - s * 0.5], [px + s * 0.42, py],
                      [px - s * 0.42, py], [px - s * 0.5, py - s * 0.5]];
  shape(x, body, C.timber, rnd, 2);
  inside(x, body, () => {
    for (const t of [0.28, 0.72]) pen(x, [[px - s * 0.6, py - s * (1 - t)], [px + s * 0.6, py - s * (1 - t)]], rnd, 1.4);
    for (let i = -1; i <= 1; i++) pen(x, [[px + i * s * 0.26, py - s], [px + i * s * 0.3, py]], rnd, 0.8);
  });
}

/* ------------------------------------------------------------- the scene */


/**
 * The camp before Boston, drawn.
 *
 * Rebuilt against reference. The corrections that mattered, in order of how
 * badly the first attempt got them wrong:
 *
 *   - LAND ROLLS. Ground is a sequence of overlapping curved ridges, and depth
 *     is read from one overlapping the next. Straight horizontal bands made the
 *     first version look like a bar chart.
 *   - GRASS IS HATCHING. Open ground is covered in dense short strokes lying
 *     along the fall of the land. Scattered tufts on flat colour read as
 *     speckle; this reads as a field.
 *   - THE FOREGROUND IS FOLIAGE. A dark bank of drawn scrub across the bottom
 *     edge, not a slab of earth — it is the frame's darkest mass and it is made
 *     of line.
 *   - THE PATH WANDERS and is narrow. A wide converging track reads as a road
 *     in perspective, which is the one thing this space does not have.
 *   - THE WORLD IS INHABITED. Sheep, distant figures, birds. Cheap, and it is
 *     the difference between a diagram and a place.
 */

/**
 * The sheet, multiplied over the finished picture.
 *
 * The largest single visual change available for the least code, and the reason
 * is physical: ink printed onto rag paper sits IN the sheet, not on top of it.
 * Multiplying the paper over the whole frame at the end puts every mark behind
 * the same tooth, the same laid lines and the same unevenness — which is also
 * what stops a procedural picture reading as clean layers stacked in software.
 *
 * 1775 America is laid RAG paper, not parchment: lighter, cooler, with chain
 * lines and a visible wire mould. Vellum would be two centuries out of date and
 * is reserved for engrossed legal instruments.
 */
function paper(x: Ctx, W: number, H: number, rnd: () => number): void {
  const sheet = document.createElement('canvas');
  sheet.width = W;
  sheet.height = H;
  const g = sheet.getContext('2d')!;
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, W, H);

  // Laid lines: the close-set wires of the mould, running horizontally.
  g.strokeStyle = 'rgba(110,91,69,0.035)';
  g.lineWidth = 1;
  for (let y = 0; y < H; y += 3) {
    g.beginPath();
    g.moveTo(0, y + (rnd() - 0.5));
    g.lineTo(W, y + (rnd() - 0.5));
    g.stroke();
  }
  // Chain lines: the widely spaced stitching, running the other way.
  g.strokeStyle = 'rgba(110,91,69,0.05)';
  for (let px = 20 + rnd() * 40; px < W; px += 58 + rnd() * 8) {
    g.beginPath();
    g.moveTo(px, 0);
    g.lineTo(px + (rnd() - 0.5) * 3, H);
    g.stroke();
  }
  // Fibres in the pulp.
  for (let i = 0; i < 600; i++) {
    const px = rnd() * W;
    const py = rnd() * H;
    const a = rnd() * Math.PI;
    g.strokeStyle = `rgba(${rnd() < 0.5 ? '110,91,69' : '255,246,222'},${0.02 + rnd() * 0.02})`;
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(px + Math.cos(a) * (2 + rnd() * 4), py + Math.sin(a) * (2 + rnd() * 4));
    g.stroke();
  }
  // Foxing: the rust spots age gives a sheet.
  for (let i = 0; i < 44; i++) {
    g.fillStyle = `rgba(138,106,60,${0.04 + rnd() * 0.05})`;
    g.beginPath();
    g.arc(rnd() * W, rnd() * H, 2 + rnd() * 7, 0, Math.PI * 2);
    g.fill();
  }
  // Uneven inking: broad soft patches where the impression took more or less.
  for (let i = 0; i < 14; i++) {
    g.fillStyle = `rgba(90,72,48,${0.02 + rnd() * 0.035})`;
    g.beginPath();
    g.ellipse(rnd() * W, rnd() * H, 90 + rnd() * 260, 60 + rnd() * 160, rnd() * 3, 0, Math.PI * 2);
    g.fill();
  }

  x.save();
  x.globalCompositeOperation = 'multiply';
  x.drawImage(sheet, 0, 0);
  x.restore();
}

/* --------------------------------------------------------- the camp, layered */

/**
 * The camp before Boston, drawn straight into the engine's layer stack.
 *
 * Drawing the layers separately rather than cutting bands out of a finished
 * picture is the whole advantage of making the art in code. A cut cannot invent
 * what was behind the thing it lifted, so a cut band slides and reveals a hole;
 * these layers are each drawn complete, so the ground exists behind the
 * foreground scrub whether anything ever moves or not. Occlusion simply is not
 * a problem that arises.
 *
 * No paper pass here. The renderer's post shader already lays one grain over
 * the whole composed frame (MOOD_FRAG uPaper), and baking a sheet into each
 * layer would multiply it three times over.
 */
function campSkyPlate(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(20775);
  const hz = plateHorizon(H);

  x.fillStyle = C.parchment;
  x.fillRect(0, 0, W, H);
  fill(x, [[0, 0], [W, 0], [W, hz + 8], [0, hz + 8]], C.sky);

  const skyTop = H * PLATE_SAFE;
  for (const [cx2, cy, r] of [[W * 0.20, skyTop + hz * 0.30, 54], [W * 0.52, skyTop + hz * 0.16, 78], [W * 0.84, skyTop + hz * 0.36, 48]] as const) {
    const circles: { x: number; y: number; r: number }[] = [];
    const n = 5;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      circles.push({
        x: cx2 - r * 1.5 + t * r * 3,
        y: cy - Math.sin(t * Math.PI) * r * 0.32,
        r: r * (0.42 + Math.sin(t * Math.PI) * 0.42),
      });
    }
    const puff: Pt[] = [];
    for (let px = cx2 - r * 1.9; px <= cx2 + r * 1.9; px += 5) {
      let top = cy + 6;
      for (const cc of circles) {
        const dx2 = px - cc.x;
        if (Math.abs(dx2) < cc.r) top = Math.min(top, cc.y - Math.sqrt(cc.r * cc.r - dx2 * dx2));
      }
      puff.push([px, Math.min(top, cy + 6)]);
    }
    puff.push([cx2 + r * 1.9, cy + 7], [cx2 - r * 1.9, cy + 7]);
    shape(x, puff, C.cloud, rnd, 2);
  }

  // Birds, high up, two strokes each.
  for (let i = 0; i < 7; i++) {
    const px = rnd() * W;
    const py = skyTop + hz * (0.16 + rnd() * 0.42);
    const s = 5 + rnd() * 5;
    pen(x, [[px - s, py], [px, py - s * 0.45], [px + s, py]], rnd, 1);
  }

  // Far hills, with drawn creases for their folds.
  const far = ridge(-20, W + 20, hz - 6, 44, rnd, 7);
  const farPoly: Pt[] = [...far, [W + 20, hz + 20], [-20, hz + 20]];
  shape(x, farPoly, C.hillFar, rnd, 2);
  inside(x, farPoly, () => {
    for (let i = 0; i < 14; i++) {
      const px = rnd() * W;
      const py = hz - 30 + rnd() * 26;
      pen(x, [[px, py], [px + 18 + rnd() * 30, py + 12 + rnd() * 10]], rnd, 1);
    }
  });

  // Boston: a rank of small drawn houses and three steeples, out of reach.
  for (let i = 0; i < 18; i++) {
    const bx = W * 0.36 + i * W * 0.036 + (rnd() - 0.5) * 6;
    const bw = 17 + rnd() * 11;
    const bh = 12 + rnd() * 9;
    shape(x, [[bx, hz - bh], [bx + bw, hz - bh], [bx + bw, hz], [bx, hz]], C.stone, rnd, 1.3);
    shape(x, [[bx - 2, hz - bh], [bx + bw / 2, hz - bh - 8], [bx + bw + 2, hz - bh]], C.roof, rnd, 1.2);
  }
  for (const sx of [0.45, 0.61, 0.77]) {
    const px = W * sx;
    shape(x, [[px - 5, hz - 20], [px + 5, hz - 20], [px + 3, hz - 48], [px - 3, hz - 48]], C.stone, rnd, 1.3);
    shape(x, [[px - 4, hz - 48], [px, hz - 70], [px + 4, hz - 48]], C.roofShade, rnd, 1.2);
  }

  // The water, with chop ticks.
  const water: Pt[] = [[0, hz], [W, hz], [W, hz + 34], [0, hz + 38]];
  shape(x, water, C.water, rnd, 1.7);
  inside(x, water, () => {
    for (let i = 0; i < 70; i++) {
      const wx = rnd() * W;
      const wy = hz + 5 + rnd() * 27;
      pen(x, [[wx, wy], [wx + 10 + rnd() * 12, wy]], rnd, 0.75);
    }
  });
  return c;
}

/** L2 — the ground the player walks, and everything standing on it. */
function campGroundPlate(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(50881);
  const hz = plateHorizon(H);

  const rolls: Pt[][] = [];
  const rollAt = (y: number, amp: number, colour: string) => {
    const top = ridge(-20, W + 20, y, amp, rnd, 8);
    const pts: Pt[] = [...top, [W + 20, H + 20], [-20, H + 20]];
    rolls.push(pts);
    shape(x, pts, colour, rnd, 2.1);
  };
  rollAt(hz + 48, 20, C.grassDark);
  rollAt(hz + 150, 30, C.grass);
  rollAt(hz + 300, 26, C.grassDark);
  rolls.forEach((r, i) => grassLay(x, r, rnd, 150 + i * 75, 0.55 - i * 0.1, 12 + i * 7));

  // The track: narrow and wandering. A straight one reads as a road in
  // perspective, and the street has to stay clear because it is where the
  // player walks.
  const trackL: Pt[] = [];
  const trackR: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const y = H - t * (H - hz - 46);
    const mid = W * (0.47 + Math.sin(t * 2.4) * 0.07 - t * 0.02);
    const half = (1 - t) * W * 0.055 + W * 0.008;
    trackL.push([mid - half, y]);
    trackR.push([mid + half, y]);
  }
  const track: Pt[] = [...trackL, ...[...trackR].reverse()];
  shape(x, track, C.track, rnd, 1.6);
  inside(x, track, () => {
    for (let i = 0; i < 4; i++) {
      const line: Pt[] = trackL.map((p, k) => [p[0] + (trackR[k][0] - p[0]) * (0.25 + i * 0.2), p[1]]);
      pen(x, line, rnd, 1.1);
    }
  });

  house(x, W * 0.055, hz + 92, W * 0.17, H * 0.145, rnd);

  for (let i = 0; i < 3; i++) {
    const bx = W * 0.05 + i * W * 0.082;
    const by = hz + 320 + i * 46;
    const s = 44 + i * 13;
    const hut: Pt[] = [[bx, by], [bx + s * 0.28, by - s * 0.7], [bx + s * 0.9, by - s * 0.6], [bx + s * 1.2, by]];
    shape(x, hut, C.timberShade, rnd, 2);
    inside(x, hut, () => {
      for (let k = 0; k < 9; k++) pen(x, [[bx + s * (0.08 + k * 0.13), by], [bx + s * (0.3 + k * 0.07), by - s * 0.68]], rnd, 1);
    });
  }

  for (let row = 0; row < 3; row++) {
    const base = hz + 150 + row * row * 52 + row * 60;
    const w = 22 + row * 10;
    for (let i = 0; i < 4 - Math.floor(row / 2); i++) {
      tent(x, W * (0.66 + i * 0.085) + row * 16, base, w, rnd);
    }
  }

  const fx = W * 0.635;
  const fy = hz + 120;
  pen(x, [[fx, fy + 70], [fx, fy - 32]], rnd, 2.3);
  shape(x, [[fx, fy - 32], [fx + 44, fy - 26], [fx + 44, fy - 2], [fx, fy - 6]], C.flag, rnd, 1.8);

  fire(x, W * 0.585, hz + 300, 36, rnd);
  barrel(x, W * 0.55, hz + 330, 36, rnd);

  tree(x, W * 0.30, hz + 190, 210, rnd);
  tree(x, W * 0.395, hz + 168, 150, rnd);
  tree(x, W * 0.945, hz + 250, 240, rnd);

  for (let i = 0; i < 22; i++) {
    const t = rnd();
    const by = hz + 90 + t * (H - hz - 260);
    const bx = rnd() * W;
    if (bx > W * 0.36 && bx < W * 0.6 && by > hz + 200) continue;
    bush(x, bx, by, 12 + t * 26, rnd, rnd() < 0.4 ? C.leafShade : C.leaf);
  }

  for (let i = 0; i < 5; i++) beast(x, W * (0.06 + rnd() * 0.22), hz + 70 + rnd() * 40, 7 + rnd() * 4, rnd);
  for (let i = 0; i < 4; i++) {
    const px = W * (0.62 + rnd() * 0.3);
    const py = hz + 96 + rnd() * 40;
    shape(x, [[px - 4, py], [px - 3, py - 13], [px + 3, py - 13], [px + 4, py]], C.timberShade, rnd, 1.2);
    shape(x, [[px - 3, py - 13], [px + 3, py - 13], [px + 2, py - 19], [px - 2, py - 19]], C.canvasShade, rnd, 1.1);
  }
  return c;
}

/** L5 — the foreground scrub, which passes in front of the player. */
function campForePlate(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(90210);

  const scrubTop = ridge(-20, W + 20, H * (1 - PLATE_SAFE) - 150, 48, rnd, 13);
  const scrub: Pt[] = [...scrubTop, [W + 20, H + 20], [-20, H + 20]];
  shape(x, scrub, '#59653D', rnd, 2.6);
  inside(x, scrub, () => {
    for (let i = 0; i < 44; i++) bush(x, rnd() * W, H * (1 - PLATE_SAFE) - 120 + rnd() * 150, 26 + rnd() * 40, rnd, '#4E5A38');
    for (let i = 0; i < 200; i++) {
      const gx = rnd() * W;
      const gy = H * (1 - PLATE_SAFE) - 160 + rnd() * 200;
      pen(x, [[gx, gy], [gx + (rnd() - 0.5) * 30, gy - 20 - rnd() * 30]], rnd, 1.1);
    }
  });
  return c;
}

const blankPlate = (W: number, H: number): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
};

/**
 * Drawn plate sets, in the shape the renderer already consumes.
 *
 * A scene picks these up through the plate-set name it already carries, so
 * adopting the drawn medium for a scene is one entry in this table and nothing
 * else. Anything not listed keeps its procedural painter, which means the
 * medium can be moved over one scene at a time instead of in a single jump.
 */
export const DRAWN_PLATES: Record<string, (W: number, H: number) => HTMLCanvasElement[]> = {
  camp: (W, H) => [
    campSkyPlate(W, H),
    blankPlate(W, H),
    campGroundPlate(W, H),
    blankPlate(W, H),
    blankPlate(W, H),
    campForePlate(W, H),
  ],
};

/** Depths for the drawn sets: everything behind the player but the foreground. */
export const DRAWN_DEPTHS: Record<string, number[]> = {
  camp: [1, 1, 1, 1, 1, 0],
};

/** The whole scene on one canvas, for the bench — with the paper pass on. */
export function drawCamp(W = 1600, H = 900): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  for (const layer of DRAWN_PLATES.camp(W, H)) x.drawImage(layer, 0, 0);
  paper(x, W, H, mulberry(31));
  return c;
}
