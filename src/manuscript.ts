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

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

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
function pen(x: Ctx, pts: Pt[], rnd: () => number, weight = 2, close = false): void {
  const all = close ? [...pts, pts[0]] : pts;
  x.save();
  x.strokeStyle = INK;
  x.lineCap = 'round';
  x.lineJoin = 'round';
  for (let i = 0; i < all.length - 1; i++) {
    const [ax, ay] = all[i];
    const [bx, by] = all[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(2, Math.round(len / 22));
    // Overshoot: the stroke starts a hair before the corner and ends past it.
    const ux = (bx - ax) / (len || 1);
    const uy = (by - ay) / (len || 1);
    const over = 1 + rnd() * 1.8;
    x.lineWidth = weight * (0.75 + rnd() * 0.55);
    x.globalAlpha = 0.85 + rnd() * 0.15;
    x.beginPath();
    x.moveTo(ax - ux * over, ay - uy * over);
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const bow = Math.sin(t * Math.PI) * (rnd() - 0.5) * Math.min(3.4, len * 0.05);
      x.lineTo(ax + (bx - ax) * t - uy * bow, ay + (by - ay) * t + ux * bow);
    }
    x.lineTo(bx + ux * over, by + uy * over);
    x.stroke();
  }
  x.restore();
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

/** Fill, then draw the contour round it. The two-step that makes everything. */
function shape(x: Ctx, pts: Pt[], colour: string, rnd: () => number, weight = 2): void {
  fill(x, pts, colour);
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
export function drawCamp(W = 1600, H = 900): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(20775);
  const hz = H * 0.34;

  x.fillStyle = C.parchment;
  x.fillRect(0, 0, W, H);

  // Sky, flat and pale, with rounded cloud banks over it.
  fill(x, [[0, 0], [W, 0], [W, hz + 8], [0, hz + 8]], C.sky);
  for (const [cx2, cy, r] of [[W * 0.20, hz * 0.34, 54], [W * 0.52, hz * 0.22, 76], [W * 0.84, hz * 0.40, 48]] as const) {
    // Bulges, not spikes: each lobe is a full arc and they overlap.
    /*
     * A cloud is a row of overlapping round bulges sitting on a flat base, and
     * the contour is drawn round the union of them. Sampling lobes at a regular
     * angle made a croissant; walking the upper envelope of real circles makes
     * a cloud.
     */
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

  // Far hills — cooler and flatter, with a few drawn creases for their folds.
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

  // Boston across the water: a rank of small drawn houses and three steeples.
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

  // The water: a narrow strip, with chop ticks.
  const water: Pt[] = [[0, hz], [W, hz], [W, hz + 34], [0, hz + 38]];
  shape(x, water, C.water, rnd, 1.7);
  inside(x, water, () => {
    for (let i = 0; i < 70; i++) {
      const wx = rnd() * W;
      const wy = hz + 5 + rnd() * 27;
      pen(x, [[wx, wy], [wx + 10 + rnd() * 12, wy]], rnd, 0.75);
    }
  });

  /*
   * The ground, in three overlapping rolls rather than one band. Each is a
   * curve, each is a slightly different green, and each overlaps the one behind
   * — which is the only depth cue this space uses.
   */
  const rolls: { pts: Pt[]; colour: string; hatch: number }[] = [];
  const rollAt = (y: number, amp: number, colour: string, hatch: number) => {
    const top = ridge(-20, W + 20, y, amp, rnd, 8);
    const pts: Pt[] = [...top, [W + 20, H + 20], [-20, H + 20]];
    rolls.push({ pts, colour, hatch });
    shape(x, pts, colour, rnd, 2.1);
  };
  rollAt(hz + 48, 20, C.grassDark, 150);
  rollAt(hz + 150, 30, C.grass, 260);
  rollAt(hz + 300, 26, C.grassDark, 300);

  // Grass, laid along the fall of the land, thickening toward the viewer.
  rolls.forEach((r, i) => grassLay(x, r.pts, rnd, r.hatch, 0.55 - i * 0.1, 12 + i * 7));

  // A narrow track wandering up the middle, worn pale. It bends: a straight one
  // reads as a road in perspective, which this space does not have.
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
  const track: Pt[] = [...trackL, ...trackR.reverse()];
  shape(x, track, C.track, rnd, 1.6);
  inside(x, track, () => {
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 0.3;
      const line: Pt[] = trackL.map((p, k) => [p[0] + (trackR[trackR.length - 1 - k][0] - p[0]) * (0.5 + off * 0.3), p[1]]);
      pen(x, line, rnd, 1.1);
    }
  });

  // The house, standing on the second roll, stage left.
  house(x, W * 0.055, hz + 92, W * 0.17, H * 0.145, rnd);

  // Brush shelters near left — sticks, lumpy, nothing like the tents.
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

  // Greene's tents, stage right, in ordered rows on the rolls.
  for (let row = 0; row < 3; row++) {
    const base = hz + 150 + row * row * 52 + row * 60;
    const w = 22 + row * 10;
    for (let i = 0; i < 4 - Math.floor(row / 2); i++) {
      tent(x, W * (0.66 + i * 0.085) + row * 16, base, w, rnd);
    }
  }

  // The flag at the tent lines — the one saturated note the act permits.
  const fx = W * 0.635;
  const fy = hz + 120;
  pen(x, [[fx, fy + 70], [fx, fy - 32]], rnd, 2.3);
  shape(x, [[fx, fy - 32], [fx + 44, fy - 26], [fx + 44, fy - 2], [fx, fy - 6]], C.flag, rnd, 1.8);

  // Camp business by the track.
  fire(x, W * 0.585, hz + 300, 36, rnd);
  barrel(x, W * 0.55, hz + 330, 36, rnd);

  // Trees: dark masses with their branches drawn inside them.
  tree(x, W * 0.30, hz + 190, 210, rnd);
  tree(x, W * 0.395, hz + 168, 150, rnd);
  tree(x, W * 0.945, hz + 250, 240, rnd);

  // Shrubs scattered along the rolls, at varying scale.
  for (let i = 0; i < 22; i++) {
    const t = rnd();
    const by = hz + 90 + t * (H - hz - 260);
    const bx = rnd() * W;
    if (bx > W * 0.36 && bx < W * 0.6 && by > hz + 200) continue; // keep the street clear
    bush(x, bx, by, 12 + t * 26, rnd, rnd() < 0.4 ? C.leafShade : C.leaf);
  }

  // The world is inhabited: sheep on the far roll, a few distant figures.
  for (let i = 0; i < 5; i++) beast(x, W * (0.06 + rnd() * 0.22), hz + 70 + rnd() * 40, 7 + rnd() * 4, rnd);
  for (let i = 0; i < 4; i++) {
    const px = W * (0.62 + rnd() * 0.3);
    const py = hz + 96 + rnd() * 40;
    shape(x, [[px - 4, py], [px - 3, py - 13], [px + 3, py - 13], [px + 4, py]], C.timberShade, rnd, 1.2);
    shape(x, [[px - 3, py - 13], [px + 3, py - 13], [px + 2, py - 19], [px - 2, py - 19]], C.canvasShade, rnd, 1.1);
  }
  // Birds: two strokes each, the cheapest life there is.
  for (let i = 0; i < 7; i++) {
    const px = rnd() * W;
    const py = hz * (0.2 + rnd() * 0.5);
    const s = 5 + rnd() * 5;
    pen(x, [[px - s, py], [px, py - s * 0.45], [px + s, py]], rnd, 1);
  }

  /*
   * The foreground: a dark bank of scrub across the bottom edge, made of line
   * and the darkest mass in the frame. Not a slab of earth — the reference
   * frames almost every exterior with foliage, and it is what gives a flat
   * space its depth without any aerial perspective to call on.
   */
  const scrubTop = ridge(-20, W + 20, H - 168, 52, rnd, 13);
  const scrub: Pt[] = [...scrubTop, [W + 20, H + 20], [-20, H + 20]];
  shape(x, scrub, '#59653D', rnd, 2.6);
  inside(x, scrub, () => {
    for (let i = 0; i < 44; i++) bush(x, rnd() * W, H - 130 + rnd() * 130, 26 + rnd() * 40, rnd, '#4E5A38');
    for (let i = 0; i < 200; i++) {
      const gx = rnd() * W;
      const gy = H - 176 + rnd() * 190;
      pen(x, [[gx, gy], [gx + (rnd() - 0.5) * 30, gy - 20 - rnd() * 30]], rnd, 1.1);
    }
  });

  /*
   * Paper grain and a soft warm falloff at the edges.
   *
   * The reference is not flat lighting end to end — interiors carry a real glow
   * and every scene sits on a visible tooth of paper. Both are one pass over
   * the finished picture rather than anything the drawing has to know about.
   */
  x.save();
  x.globalAlpha = 0.05;
  for (let i = 0; i < 2600; i++) {
    const px = rnd() * W;
    const py = rnd() * H;
    x.fillStyle = rnd() < 0.5 ? '#6E5B45' : '#FFF6DE';
    x.fillRect(px, py, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  x.restore();
  const vig = x.createRadialGradient(W * 0.5, H * 0.46, H * 0.32, W * 0.5, H * 0.5, H * 0.95);
  vig.addColorStop(0, 'rgba(120,90,50,0)');
  vig.addColorStop(1, 'rgba(78,58,32,0.20)');
  x.fillStyle = vig;
  x.fillRect(0, 0, W, H);

  return c;
}
