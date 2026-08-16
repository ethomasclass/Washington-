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

import { figureAtPlateY, HORIZON, OVERSCAN, VIEW_H } from './ground';

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
  /*
   * A band of shade under the eaves, and nothing else.
   *
   * This used to be a flat second tone over the right-hand quarter of the wall,
   * meant to read as the gable end turning away. It did not: with no perspective
   * on the wall to support it, it read as a stripe of different-coloured stone
   * stuck to one end of the house. In a flat style a second tone only reads as
   * form when it follows something the drawing already states — here, the line
   * of the eaves.
   */
  fill(x, [[hx, hy], [hx + w, hy], [hx + w, hy + h * 0.14], [hx, hy + h * 0.14]], C.stoneShade);
  pen(x, [[hx, hy + h * 0.14], [hx + w, hy + h * 0.14]], rnd, 1.3);
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
  /*
   * The steeples, standing ON the shoreline rather than above it.
   *
   * They were drawn from hz-48 up to hz-20 — a base twenty pixels clear of the
   * line every house in the town stands on — so the whole skyline hovered. In a
   * flat style there is no ground plane to catch the error: if a thing does not
   * touch the line it is standing on, it simply floats.
   */
  for (const sx of [0.45, 0.61, 0.77]) {
    const px = W * sx;
    shape(x, [[px - 5, hz], [px + 5, hz], [px + 3, hz - 46], [px - 3, hz - 46]], C.stone, rnd, 1.3);
    shape(x, [[px - 4, hz - 46], [px, hz - 70], [px + 4, hz - 46]], C.roofShade, rnd, 1.2);
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

/**
 * L2 — the ground the player walks, and everything standing on it.
 *
 * EVERYTHING HERE IS SIZED IN MAN-HEIGHTS, via `figureAtPlateY`, and none of it
 * is sized by eye. `STATE.md` warns about this in as many words — *"a wedge
 * tent's ridge is about a man's height. Sizing by eye produced a camp of tents a
 * third of a man tall that read as kennels"* — and the first version of this
 * scene reproduced the documented bug exactly: tents at 0.22 to 0.37 of a man,
 * a two-storey house at 1.1, barrels at a fifth of the men standing beside them.
 *
 * The reason it is so easy to get wrong is that a drawn scene has no
 * perspective cues of its own to argue with you. A painted plate with aerial
 * haze and a receding ground at least *looks* wrong when the scale slips. Flat
 * colour inside a contour looks perfectly fine at any size, right up until a
 * figure walks past it.
 */
function campGroundPlate(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(50881);
  const hz = plateHorizon(H);
  /** How tall a standing man is, in plate pixels, at this row. The unit. */
  const man = (y: number): number => figureAtPlateY(y, H);

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

  // The track: narrow, wandering, and left clear because it is where the player
  // walks. A straight one reads as a road in perspective.
  const trackL: Pt[] = [];
  const trackR: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const y = H - t * (H - hz - 46);
    const mid = W * (0.47 + Math.sin(t * 2.4) * 0.07 - t * 0.02);
    const half = (1 - t) * W * 0.05 + W * 0.008;
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

  /*
   * EVERYTHING THAT STANDS ON THE GROUND GOES IN A SORTED LIST.
   *
   * The plate has no depth buffer — 'order of calls is the only thing deciding
   * what covers what' (STATE.md) — and drawing in the order things were
   * conveniently written produced exactly the faults you would expect: barrels
   * resting on the roofs of tents that stood in front of them, and sheep
   * grazing across the front of a house they were a hundred yards behind.
   *
   * So nothing draws itself directly any more. Each object is queued with the y
   * of its FEET, the list is sorted back to front, and only then is it painted.
   * A painter's algorithm, which is the correct answer whenever depth is a
   * scalar and the art is flat.
   */
  const queue: { y: number; draw: () => void }[] = [];
  const at = (y: number, draw: () => void) => queue.push({ y, draw });

  {
    const baseY = hz + 132;
    const h = man(baseY) * 2.4;
    at(baseY, () => house(x, W * 0.075, baseY - h, h * 1.75, h, rnd));
  }

  /*
   * Greene's tents. A wedge tent's ridge is a man's height, and a man can stand
   * up in the middle of it — which is the whole reason a regiment with tents
   * looks like an army and a regiment in brush piles does not.
   */
  for (let row = 0; row < 3; row++) {
    const base = hz + 130 + row * row * 78 + row * 96;
    if (base > H + 60) continue;
    const m = man(base);
    const w = m * 0.72; // ridge = w * 1.35 ≈ one man
    for (let i = 0; i < 3; i++) {
      const px = W * 0.70 + i * w * 3.4 + row * w * 0.9 - row * W * 0.02;
      if (px - w * 1.6 > W) continue;
      at(base, () => tent(x, px, base, w, rnd));
    }
  }

  // Brush shelters near left: a man crawls into one, so a little under his
  // height, and they are lumpy where the tents are regular.
  for (let i = 0; i < 3; i++) {
    const by = hz + 240 + i * 72;
    const m = man(by);
    const s = m * 1.05;
    const bx = W * 0.015 + i * W * 0.085;
    /*
     * A brush shelter: a lean-to of poles with brush and turf thrown over it.
     *
     * It was a dark lump — a shape too low, too brown and too smooth to read as
     * anything, which is worse than absent, because the eye stops on it and
     * comes away with nothing. It now has the three things that say "somebody
     * built this out of what was lying about": a ridge pole with its ends
     * showing, a lighter turf side so it is not one flat mass, and the ends of
     * the brush sticking out past the frame.
     */
    const hut: Pt[] = [[bx, by], [bx + s * 0.3, by - s * 0.78], [bx + s * 0.95, by - s * 0.66], [bx + s * 1.25, by]];
    at(by, () => {
    shape(x, hut, '#8A7A55', rnd, 2);
    inside(x, hut, () => {
      // The turf half, flat, with its own edge.
      fill(x, [[bx + s * 0.62, by - s * 0.72], [bx + s * 1.3, by - s * 0.6], [bx + s * 1.3, by], [bx + s * 0.6, by]], '#6F6A42');
      pen(x, [[bx + s * 0.62, by - s * 0.72], [bx + s * 0.6, by]], rnd, 1.3);
      for (let k = 0; k < 11; k++) {
        pen(x, [[bx + s * (0.04 + k * 0.115), by], [bx + s * (0.32 + k * 0.062), by - s * 0.74]], rnd, 1.1);
      }
    });
    // The ridge pole, its ends past the brush, which is what dates it as built.
    pen(x, [[bx + s * 0.2, by - s * 0.82], [bx + s * 1.05, by - s * 0.7]], rnd, 2.2);
    for (let k = 0; k < 5; k++) {
      const px = bx + s * (0.34 + k * 0.16);
      pen(x, [[px, by - s * (0.72 - k * 0.02)], [px + s * 0.1, by - s * 0.92]], rnd, 1.2);
    }
    });
  }

  // The colours at the tent lines: a pole about two men tall.
  {
    const fy = hz + 150;
    const m = man(fy);
    const fx = W * 0.63;
    at(fy, () => {
      pen(x, [[fx, fy], [fx, fy - m * 2]], rnd, 2.6);
      shape(x, [[fx, fy - m * 2], [fx + m * 0.9, fy - m * 1.85],
                [fx + m * 0.9, fy - m * 1.3], [fx, fy - m * 1.4]], C.flag, rnd, 1.8);
    });
  }

  // Camp business by the track, all of it man-relative.
  {
    // Stores stand in the OPEN, clear of the tent lines. They were sitting on
    // the tents' own ground and, drawn afterwards, appeared to rest on the
    // canvas.
    const fy = hz + 300;
    at(fy, () => fire(x, W * 0.475, fy, man(fy) * 0.5, rnd));
    at(hz + 336, () => barrel(x, W * 0.40, hz + 336, man(hz + 336) * 0.55, rnd));
    at(hz + 362, () => barrel(x, W * 0.435, hz + 362, man(hz + 362) * 0.55, rnd));
  }

  /*
   * Trees. A mature tree beside a two-storey house is four or five times a
   * man; at two, which is what these were, they read as saplings and they made
   * the house look enormous by comparison, which was the one thing keeping the
   * scale error hidden.
   */
  for (const [tx, ty, k] of [[W * 0.30, hz + 150, 4.6], [W * 0.40, hz + 128, 3.6], [W * 0.955, hz + 230, 5.2]] as const) {
    at(ty, () => tree(x, tx, ty, man(ty) * k, rnd));
  }

  // Shrubs, waist to shoulder high.
  for (let i = 0; i < 22; i++) {
    const t = rnd();
    const by = hz + 90 + t * (H - hz - 260);
    const bx = rnd() * W;
    if (bx > W * 0.36 && bx < W * 0.6 && by > hz + 200) continue;
    const r = man(by) * (0.2 + rnd() * 0.22);
    const col = rnd() < 0.4 ? C.leafShade : C.leaf;
    at(by, () => bush(x, bx, by, r, rnd, col));
  }

  // Sheep on the far roll — about a third of a man at the shoulder.
  // Sheep, on the far roll BEHIND the house. They were drawn after it and so
  // grazed across its front wall from a hundred yards further back.
  for (let i = 0; i < 5; i++) {
    const by = hz + 62 + rnd() * 34;
    const bxs = W * (0.30 + rnd() * 0.26);
    at(by, () => beast(x, bxs, by, man(by) * 0.3, rnd));
  }

  /*
   * Distant men at the tent lines, painted into the plate.
   *
   * Permitted because at this depth they are one form and not a hundred
   * figures — 03a's rule — and they are the only thing that states the scale of
   * the tents beyond argument. They are drawn at exactly one man-height, which
   * is what makes the tents behind them read as tents.
   */
  for (let i = 0; i < 5; i++) {
    const px = W * (0.60 + rnd() * 0.34);
    const py = hz + 120 + rnd() * 70;
    const m = man(py);
    at(py, () => {
      shape(x, [[px - m * 0.15, py], [px - m * 0.13, py - m * 0.62],
                [px + m * 0.13, py - m * 0.62], [px + m * 0.15, py]], C.timberShade, rnd, 1.3);
      shape(x, [[px - m * 0.11, py - m * 0.62], [px + m * 0.11, py - m * 0.62],
                [px + m * 0.08, py - m * 0.86], [px - m * 0.08, py - m * 0.86]], C.canvasShade, rnd, 1.2);
      pen(x, [[px - m * 0.16, py - m * 0.86], [px + m * 0.16, py - m * 0.86]], rnd, 1.4);
    });
  }

  // Back to front, and only now does anything touch the canvas.
  queue.sort((a, b) => a.y - b.y).forEach((q) => q.draw());
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

/* ------------------------------------------------------------- the people */

export interface PersonLook {
  coat: string;
  hat?: 'tricorne' | 'round' | 'none';
  /** Shoulder and hip width multiplier, around 1. */
  build?: number;
  /** Height multiplier, around 1. */
  tall?: number;
  gown?: boolean;
  cap?: boolean;
  skin?: string;
  hair?: string;
  /** Cuffs and lapels. A livery is defined by its facings. */
  facings?: string;
  /** A fringed linen hunting shirt over the coat — the Virginia riflemen. */
  hunting?: boolean;
  /** The waistcoat showing between the coat fronts. Seeded when absent. */
  waistcoat?: string;
  /** What the man has in his hands. Seeded when absent. */
  carry?: 'none' | 'musket' | 'spade' | 'bundle' | 'papers';
}

const SKINS = ['#C8A07C', '#B98D68', '#8C6242', '#6E4630', '#D2B08C'];
const HAIRS = ['#3E3226', '#2B2118', '#6B5638', '#8A7A55', '#B9B0A0'];

/*
 * Waistcoats, and why they matter more than they sound.
 *
 * A coat in this camp is a muted earth by necessity — the authored colours are
 * all dyes a New England militiaman could have had — and a crowd of them reads
 * as one dark mass. The waistcoat is the period's own answer: it was worn
 * showing, it was usually the lightest thing a man had on, and it runs the full
 * height of the torso. One pale wedge down the middle of every figure breaks
 * the mass, and it is a historical fact rather than a decoration.
 */
const WAISTCOATS = ['#D8CDAF', '#E2D9BF', '#C7B891', '#B6A47D', '#9E7A55', '#8E4A3C'];
const CARRIES: NonNullable<PersonLook['carry']>[] =
  ['none', 'none', 'musket', 'musket', 'spade', 'bundle', 'papers'];

/**
 * A person, drawn.
 *
 * The brief is narrow and it is the same brief the figure sheets were cut to:
 * this is read at about eighty pixels, moving, against a drawn world, and the
 * player has to be able to tell one man from another well enough to remember
 * which one they have already spoken to. So everything here is spent on
 * SILHOUETTE — the hat, the width of the coat skirts, the length of the
 * garment, whether the man is carrying anything — and almost nothing is spent
 * on the face, which at this size is two marks and a nose and cannot be more.
 *
 * The period silhouette is the whole trick: a coat cut close to the body and
 * flaring hard from the waist into skirts that end at mid-thigh. Get that and a
 * figure reads as eighteenth-century before any detail is legible. Miss it and
 * no amount of buttons will save it.
 */
export function drawnPerson(look: PersonLook, seed: number, H = 320): HTMLCanvasElement {
  const rnd = mulberry(seed * 7919 + 13);
  const build = look.build ?? 1;
  const tall = look.tall ?? 1;
  const W = Math.round(H * 0.46); // ground.ts FIGURE_ASPECT
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;

  const cx = W / 2;
  const foot = H * 0.985;
  const top = H * (1 - tall) + H * 0.02;
  const headH = (foot - top) * 0.135;
  const headY = top + headH * 0.5;
  const shoulder = top + headH * 1.35;
  const waist = top + (foot - top) * 0.46;
  const skirt = top + (foot - top) * (look.gown ? 0.99 : 0.63);
  const knee = top + (foot - top) * 0.76;
  const halfSh = W * 0.19 * build;
  const halfHip = W * 0.17 * build;

  const skin = look.skin ?? SKINS[Math.floor(rnd() * SKINS.length)];
  const hair = look.hair ?? HAIRS[Math.floor(rnd() * HAIRS.length)];
  /*
   * A dye lot is never twice the same, and neither is a coat that has been in
   * the weather since April. Half a dozen men authored with the same hex used
   * to stand in a row as one repeated cutout; ±6% of lightness is enough to
   * separate them and small enough that the authored colour still governs.
   */
  const coat = shadeOf(look.coat, (rnd() - 0.5) * 0.12);
  const facings = look.facings ?? shadeOf(coat, 0.12);
  const coatShade = shadeOf(coat, -0.07);
  const waistcoat = look.waistcoat ?? WAISTCOATS[Math.floor(rnd() * WAISTCOATS.length)];
  const carry = look.gown ? 'none' : look.carry ?? CARRIES[Math.floor(rnd() * CARRIES.length)];

  // Legs: breeches to the knee, then stockings, then a shoe. Drawn first so the
  // coat skirts close over the top of them.
  if (!look.gown) {
    for (const side of [-1, 1]) {
      const lx = cx + side * halfHip * 0.5;
      shape(x, [[lx - W * 0.07, waist], [lx + W * 0.07, waist],
                [lx + W * 0.06, knee], [lx - W * 0.06, knee]], '#C9BFA6', rnd, 1.5);
      shape(x, [[lx - W * 0.055, knee], [lx + W * 0.055, knee],
                [lx + W * 0.05, foot - H * 0.03], [lx - W * 0.05, foot - H * 0.03]], '#CFC5AA', rnd, 1.4);
      shape(x, [[lx - W * 0.07, foot - H * 0.03], [lx + W * 0.075, foot - H * 0.03],
                [lx + W * 0.075, foot], [lx - W * 0.07, foot]], '#2E2419', rnd, 1.5);
    }
  }

  // The garment. A gown falls straight from the shoulder; a coat is cut close
  // and flares hard from the waist, which is the period's whole silhouette.
  const body: Pt[] = look.gown
    ? [[cx - halfSh, shoulder], [cx + halfSh, shoulder],
       [cx + halfHip * 2.0, skirt], [cx - halfHip * 2.0, skirt]]
    : [[cx - halfSh, shoulder], [cx + halfSh, shoulder],
       [cx + halfHip * 0.92, waist], [cx + halfHip * 1.75, skirt],
       [cx - halfHip * 1.75, skirt], [cx - halfHip * 0.92, waist]];
  shape(x, body, coat, rnd, 2);
  // The shaded half, a second flat with its own edge — never a gradient.
  inside(x, body, () => {
    fill(x, [[cx + halfSh * 0.15, shoulder - 4], [cx + halfSh * 2.4, shoulder - 4],
             [cx + halfHip * 2.4, skirt + 4], [cx + halfHip * 0.2, skirt + 4]], coatShade);
    pen(x, [[cx + halfSh * 0.15, shoulder], [cx + halfHip * 0.2, skirt]], rnd, 1.3);
  });

  if (!look.gown) {
    // The coat worn open, and the waistcoat down the middle of the man. This is
    // the one pale vertical in the figure and it is what keeps a crowd from
    // reading as a hedge.
    const wcBottom = waist + (skirt - waist) * 0.5;
    shape(x, [[cx - halfSh * 0.24, shoulder + 2], [cx + halfSh * 0.24, shoulder + 2],
              [cx + halfHip * 0.42, wcBottom], [cx - halfHip * 0.42, wcBottom]],
      waistcoat, rnd, 1.4);
    // The button stand, and the coat edges falling either side of it.
    pen(x, [[cx + W * 0.008, shoulder + H * 0.03], [cx + W * 0.008, wcBottom - H * 0.01]], rnd, 1);
    pen(x, [[cx - halfSh * 0.24, shoulder + 4], [cx - halfHip * 0.42, wcBottom]], rnd, 1.2);
    pen(x, [[cx + halfSh * 0.24, shoulder + 4], [cx + halfHip * 0.42, wcBottom]], rnd, 1.2);

    // Lapels turned back, in the facing colour: the one thing that says which
    // regiment a man belongs to, when he belongs to one at all. They flank the
    // waistcoat rather than crossing it.
    shape(x, [[cx - halfSh * 0.82, shoulder + 2], [cx - halfSh * 0.26, shoulder + 2],
              [cx - halfSh * 0.36, waist * 0.62 + shoulder * 0.38]], facings, rnd, 1.3);
    shape(x, [[cx + halfSh * 0.82, shoulder + 2], [cx + halfSh * 0.26, shoulder + 2],
              [cx + halfSh * 0.36, waist * 0.62 + shoulder * 0.38]], facings, rnd, 1.3);
    // The vent up the back of the skirts.
    pen(x, [[cx, wcBottom], [cx, skirt]], rnd, 1.2);
  }

  // A fringed hunting shirt over the coat — the Virginia riflemen, and the one
  // garment in the camp that reads at a hundred yards.
  if (look.hunting) {
    const hs: Pt[] = [[cx - halfSh * 1.05, shoulder + 2], [cx + halfSh * 1.05, shoulder + 2],
                      [cx + halfHip * 1.5, skirt * 0.82 + waist * 0.18],
                      [cx - halfHip * 1.5, skirt * 0.82 + waist * 0.18]];
    shape(x, hs, '#DCD3BC', rnd, 1.8);
    const fy = skirt * 0.82 + waist * 0.18;
    for (let i = 0; i < 11; i++) {
      const fx2 = cx - halfHip * 1.45 + (i / 10) * halfHip * 2.9;
      pen(x, [[fx2, fy], [fx2 + (rnd() - 0.5) * 3, fy + H * 0.035]], rnd, 1);
    }
  }

  /*
   * Arms, hanging. Two narrow shapes and a cuff — no hands worth the name.
   *
   * Each arm gets its own drift at the wrist. Sixteen thousand men who all hang
   * their arms at exactly the same angle read as one figure stamped repeatedly,
   * which is what a stock woodcut looks like when it is reused badly; a few
   * pixels of difference per elbow is the whole cure.
   */
  const sleeve = look.hunting ? '#DCD3BC' : coat;
  const armEnd = waist + H * 0.06;
  const drift: Record<number, number> = { [-1]: (rnd() - 0.5) * W * 0.11, 1: (rnd() - 0.5) * W * 0.11 };
  // A man carrying a musket has the near hand up at the sling, not by his hip.
  const nearUp = carry === 'musket' || carry === 'spade';
  for (const side of [-1, 1]) {
    const ax = cx + side * (halfSh - W * 0.02);
    const d = drift[side];
    const lift = nearUp && side === 1 ? -H * 0.09 : 0;
    shape(x, [[ax - W * 0.055, shoulder + 2], [ax + W * 0.055, shoulder + 4],
              [ax + d + W * 0.05, armEnd + lift], [ax + d - W * 0.06, armEnd + lift - H * 0.01]],
      sleeve, rnd, 1.5);
    shape(x, [[ax + d - W * 0.06, armEnd + lift - H * 0.03], [ax + d + W * 0.05, armEnd + lift - H * 0.02],
              [ax + d + W * 0.045, armEnd + lift + H * 0.015], [ax + d - W * 0.055, armEnd + lift + H * 0.005]],
      facings, rnd, 1.2);
  }

  // The stock at the throat: a scrap of white that separates head from body at
  // any size, and every man in the period wore one.
  shape(x, [[cx - W * 0.075, shoulder - 3], [cx + W * 0.075, shoulder - 3],
            [cx + W * 0.06, shoulder + H * 0.022], [cx - W * 0.06, shoulder + H * 0.022]],
    '#E8E2D4', rnd, 1.2);

  /*
   * Hair behind the head, then the head over it.
   *
   * This was a rectangle taller and wider than the face, and in a brown it
   * read as a wooden box with a man's features painted on the front — the
   * single worst thing in the figure. Hair follows the skull: barely wider
   * than the face, stopping at the jaw, with the queue tied at the nape doing
   * the silhouette work instead.
   */
  const nape = headY + headH * 0.42;
  shape(x, [[cx - W * 0.098, headY - headH * 0.5], [cx + W * 0.098, headY - headH * 0.5],
            [cx + W * 0.104, nape], [cx - W * 0.104, nape]], hair, rnd, 1.4);
  // The queue, clubbed and tied — worn by every man in the army who had hair.
  shape(x, [[cx - W * 0.09, headY + headH * 0.05], [cx - W * 0.035, headY + headH * 0.1],
            [cx - W * 0.05, shoulder + H * 0.012], [cx - W * 0.095, shoulder + H * 0.006]],
    hair, rnd, 1.2);
  shape(x, [[cx - W * 0.088, headY - headH * 0.42], [cx + W * 0.088, headY - headH * 0.42],
            [cx + W * 0.082, headY + headH * 0.52], [cx - W * 0.082, headY + headH * 0.52]], skin, rnd, 1.5);
  // Two marks and a nose. Nothing else survives at eighty pixels.
  pen(x, [[cx - W * 0.05, headY - headH * 0.05], [cx - W * 0.02, headY - headH * 0.05]], rnd, 1.1);
  pen(x, [[cx + W * 0.02, headY - headH * 0.05], [cx + W * 0.05, headY - headH * 0.05]], rnd, 1.1);
  pen(x, [[cx, headY + headH * 0.02], [cx - W * 0.012, headY + headH * 0.18]], rnd, 1);

  // The hat. It is doing more work than the face and it is worth more strokes.
  const hy = headY - headH * 0.44;
  if (look.cap) {
    shape(x, [[cx - W * 0.11, hy + headH * 0.1], [cx - W * 0.085, hy - headH * 0.42],
              [cx + W * 0.085, hy - headH * 0.42], [cx + W * 0.11, hy + headH * 0.1]], '#EFE7D5', rnd, 1.5);
  } else if (look.hat === 'tricorne') {
    /*
     * Felt, not ink. Cocked hats were drawn near-black here and every man in
     * the camp wore a hole in his own head — the darkest value in a frame is
     * the line, never a fill, and a hat that matches the contour stops being a
     * shape and becomes a blob. Brown felt with a pale binding along the cocked
     * edge gives back the three-cornered read that made the hat worth drawing.
     */
    /*
     * A cocked hat is WIDE and LOW. Drawn tall it becomes a brown box sitting
     * on the head like a chimney, which is exactly what it was doing — the
     * crown rose almost a full head above the brow and the whole face went
     * under it. The read comes from the brim being nearly twice the width of
     * the head while the crown barely clears it, and from the felt being brown
     * rather than ink, since the darkest value in a frame is the line.
     */
    const felt = shadeOf('#4A3A2A', (rnd() - 0.5) * 0.10);
    const brimY = hy + headH * 0.14;
    const brimL: Pt = [cx - W * 0.215, brimY];
    const peakL: Pt = [cx - W * 0.075, hy - headH * 0.26];
    const peakR: Pt = [cx + W * 0.075, hy - headH * 0.26];
    const brimR: Pt = [cx + W * 0.215, brimY];
    shape(x, [brimL, peakL, peakR, brimR, [cx, brimY + headH * 0.16]], felt, rnd, 1.6);
    // The binding, a drawn line just inside the cocked edge rather than a
    // second flat — a pale shape in here reads as a hat inside a hat.
    pen(x, [[brimL[0] + W * 0.03, brimY - headH * 0.03],
            [peakL[0] + W * 0.012, peakL[1] + headH * 0.10],
            [peakR[0] - W * 0.012, peakR[1] + headH * 0.10],
            [brimR[0] - W * 0.03, brimY - headH * 0.03]], rnd, 1.1);
  } else if (look.hat === 'round') {
    shape(x, [[cx - W * 0.17, hy + headH * 0.13], [cx + W * 0.17, hy + headH * 0.13],
              [cx + W * 0.098, hy - headH * 0.24], [cx - W * 0.098, hy - headH * 0.24]],
      shadeOf('#5A4833', (rnd() - 0.5) * 0.10), rnd, 1.6);
    pen(x, [[cx - W * 0.195, hy + headH * 0.13], [cx + W * 0.195, hy + headH * 0.13]], rnd, 1.8);
  }

  /*
   * What the man is holding.
   *
   * At this size a carried object is worth more than a face: a musket adds a
   * hard vertical a head taller than the figure, and it is visible across the
   * frame when nothing else about the man is. It also does the scene's work —
   * a camp where some men carry arms, some carry tools and some carry paper is
   * a camp doing something, and one where nobody carries anything is a row of
   * statues. Drawn last, because a shouldered arm passes in front of the body.
   */
  const bar = (from: Pt, to: Pt, wide: number, colour: string): void => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * wide;
    const ny = (dx / len) * wide;
    shape(x, [[from[0] + nx, from[1] + ny], [to[0] + nx, to[1] + ny],
              [to[0] - nx, to[1] - ny], [from[0] - nx, from[1] - ny]], colour, rnd, 1.3);
  };

  if (carry === 'musket') {
    const butt: Pt = [cx + halfSh * 0.95, waist + H * 0.11];
    const muzzle: Pt = [cx + halfSh * 1.45, top - H * 0.055];
    bar(butt, muzzle, W * 0.022, '#3A2F24');
    // The stock is wood and wider than the barrel, and it is the half nearest
    // the man, so it reads as a musket rather than as a pole.
    bar(butt, [butt[0] + (muzzle[0] - butt[0]) * 0.42, butt[1] + (muzzle[1] - butt[1]) * 0.42],
      W * 0.042, '#6B4A2E');
  } else if (carry === 'spade') {
    const grip: Pt = [cx + halfSh * 1.05, waist - H * 0.02];
    const heel: Pt = [cx + halfSh * 1.35, foot - H * 0.06];
    bar(grip, heel, W * 0.02, '#7A5936');
    shape(x, [[heel[0] - W * 0.075, heel[1]], [heel[0] + W * 0.075, heel[1]],
              [heel[0] + W * 0.06, foot], [heel[0] - W * 0.06, foot]], '#5C5750', rnd, 1.4);
  } else if (carry === 'bundle') {
    const by = shoulder + H * 0.03;
    shape(x, [[cx - halfSh * 1.55, by + H * 0.02], [cx - halfSh * 1.0, by - H * 0.04],
              [cx - halfSh * 0.55, by + H * 0.05], [cx - halfSh * 1.15, by + H * 0.10]],
      '#CFC3A4', rnd, 1.5);
    pen(x, [[cx - halfSh * 1.35, by - H * 0.01], [cx - halfSh * 0.72, by + H * 0.07]], rnd, 1.1);
  } else if (carry === 'papers') {
    const py = waist + H * 0.045;
    shape(x, [[cx + halfSh * 0.55, py], [cx + halfSh * 1.35, py - H * 0.012],
              [cx + halfSh * 1.35, py + H * 0.055], [cx + halfSh * 0.55, py + H * 0.065]],
      '#EDE6D2', rnd, 1.3);
    pen(x, [[cx + halfSh * 0.68, py + H * 0.03], [cx + halfSh * 1.22, py + H * 0.022]], rnd, 1);
  }

  return c;
}

/** Lighten or darken a hex colour. Local to the figure drawing. */
function shadeOf(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * k)));
  return `#${[f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}
