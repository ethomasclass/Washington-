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

/** Tufts of grass — three or four strokes springing from one point. */
function tuft(x: Ctx, px: number, py: number, s: number, rnd: () => number): void {
  const n = 3 + Math.floor(rnd() * 2);
  for (let i = 0; i < n; i++) {
    const lean = (i - (n - 1) / 2) * 0.5 + (rnd() - 0.5) * 0.4;
    pen(x, [[px, py], [px + lean * s * 0.7, py - s * (0.7 + rnd() * 0.5)]], rnd, 0.9);
  }
}

/** A lobed mass of foliage, with drawn leaf-clusters inside it. */
function crown(x: Ctx, cx: number, cy: number, r: number, rnd: () => number): Pt[] {
  const pts: Pt[] = [];
  const lobes = 15 + Math.floor(rnd() * 5);
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const rr = r * (0.80 + (i % 2 === 0 ? 0.20 : 0.02) + rnd() * 0.06);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.88]);
  }
  shape(x, pts, C.leaf, rnd, 2.1);
  inside(x, pts, () => {
    // A flat shaded side, with its own edge — never a gradient.
    fill(x, [[cx - r, cy + r * 0.1], [cx + r, cy - r * 0.1], [cx + r, cy + r], [cx - r, cy + r]], C.leafShade);
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2;
      const d = rnd() * r * 0.85;
      const lx = cx + Math.cos(a) * d;
      const ly = cy + Math.sin(a) * d * 0.88;
      // Leaf clusters: a scalloped arc, not a leaf.
      pen(x, [[lx - 7, ly], [lx - 3, ly - 5], [lx + 2, ly - 4], [lx + 6, ly + 1]], rnd, 1);
    }
  });
  return pts;
}

/* ------------------------------------------------------------ the objects */

function tent(x: Ctx, cx: number, base: number, w: number, rnd: () => number): void {
  const h = w * 1.35;
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

/** The camp before Boston, drawn. Plate size, ready to cut. */
export function drawCamp(W = 1600, H = 900): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(20775);
  const hz = H * 0.34;

  // Parchment, everywhere, and it stays visible at the edges of everything.
  x.fillStyle = C.parchment;
  x.fillRect(0, 0, W, H);

  // Sky, flat, with lobed clouds drawn over it.
  fill(x, [[0, 0], [W, 0], [W, hz], [0, hz]], C.sky);
  for (const [cx2, cy, r] of [[W * 0.24, hz * 0.36, 62], [W * 0.55, hz * 0.26, 84], [W * 0.83, hz * 0.44, 54]] as const) {
    const puff: Pt[] = [];
    const lobes = 13;
    for (let i = 0; i < lobes; i++) {
      const a = Math.PI + (i / (lobes - 1)) * Math.PI;
      const rr = r * (0.72 + (i % 2 === 0 ? 0.28 : 0));
      puff.push([cx2 + Math.cos(a) * rr * 1.5, cy + Math.sin(a) * rr * 0.72]);
    }
    puff.push([cx2 + r * 1.5, cy], [cx2 - r * 1.5, cy]);
    shape(x, puff, C.cloud, rnd, 2);
  }

  // Hills behind the town, then the town, then the water. Each overlaps the
  // last, which is the only depth cue this style has.
  shape(x, [[0, hz - 4], [W * 0.18, hz - 46], [W * 0.42, hz - 22],
            [W * 0.68, hz - 52], [W, hz - 26], [W, hz], [0, hz]], C.hillFar, rnd, 2);

  // Boston: a rank of little drawn houses and three steeples, small and precise.
  for (let i = 0; i < 16; i++) {
    const bx = W * 0.40 + i * W * 0.038 + (rnd() - 0.5) * 6;
    const bw = 20 + rnd() * 12;
    const bh = 14 + rnd() * 10;
    shape(x, [[bx, hz - bh], [bx + bw, hz - bh], [bx + bw, hz], [bx, hz]], C.stone, rnd, 1.4);
    shape(x, [[bx - 2, hz - bh], [bx + bw / 2, hz - bh - 9], [bx + bw + 2, hz - bh]], C.roof, rnd, 1.3);
  }
  for (const sx of [0.47, 0.63, 0.79]) {
    const px = W * sx;
    shape(x, [[px - 6, hz - 22], [px + 6, hz - 22], [px + 4, hz - 52], [px - 4, hz - 52]], C.stone, rnd, 1.4);
    shape(x, [[px - 5, hz - 52], [px, hz - 78], [px + 5, hz - 52]], C.roofShade, rnd, 1.3);
  }

  // The water, with a few drawn ticks for chop.
  const water: Pt[] = [[0, hz], [W, hz], [W, hz + 40], [0, hz + 46]];
  shape(x, water, C.water, rnd, 1.8);
  inside(x, water, () => {
    for (let i = 0; i < 60; i++) {
      const wx = rnd() * W;
      const wy = hz + 6 + rnd() * 32;
      pen(x, [[wx, wy], [wx + 12 + rnd() * 10, wy]], rnd, 0.8);
    }
  });

  // The ground the player walks.
  const ground: Pt[] = [[0, hz + 42], [W, hz + 36], [W, H], [0, H]];
  shape(x, ground, C.grass, rnd, 2);

  // The camp street: a worn track up the middle, left OPEN because that band is
  // where the player walks and nothing may stand in it.
  const track: Pt[] = [[W * 0.30, hz + 44], [W * 0.56, hz + 44], [W * 0.86, H], [W * 0.10, H]];
  shape(x, track, C.track, rnd, 1.8);
  inside(x, track, () => {
    for (let i = 0; i < 7; i++) {
      const t = i / 7;
      pen(x, [[W * (0.33 + t * 0.2), hz + 50], [W * (0.16 + t * 0.62), H]], rnd, 1 + rnd());
    }
  });

  // Grass tufts across the ground, thicker toward the viewer.
  for (let i = 0; i < 190; i++) {
    const t = rnd();
    const gy = hz + 48 + t * t * (H - hz - 60);
    const gx = rnd() * W;
    // Keep the walkable street relatively clear.
    const tw = 0.30 + (gy - hz) / (H - hz) * 0.26;
    if (gx > W * (0.5 - tw) && gx < W * (0.5 + tw) && rnd() < 0.72) continue;
    tuft(x, gx, gy, 7 + t * 16, rnd);
  }

  // The house, stage left of centre, standing across the water's edge.
  house(x, W * 0.055, hz + 6, W * 0.185, H * 0.16, rnd);

  // Brush shelters, near left: lumpy, made of sticks, unlike the tents.
  for (let i = 0; i < 3; i++) {
    const bx = W * 0.045 + i * W * 0.085;
    const by = hz + 232 + i * 40;
    const s = 46 + i * 12;
    const hut: Pt[] = [[bx, by], [bx + s * 0.3, by - s * 0.72], [bx + s * 0.9, by - s * 0.62], [bx + s * 1.2, by]];
    shape(x, hut, C.timberShade, rnd, 2);
    inside(x, hut, () => {
      for (let k = 0; k < 9; k++) {
        pen(x, [[bx + s * (0.1 + k * 0.12), by], [bx + s * (0.3 + k * 0.07), by - s * 0.7]], rnd, 1);
      }
    });
  }

  // Greene's Rhode Islanders, stage right, in ordered rows — the one thing in
  // the picture that looks like an army.
  for (let row = 0; row < 3; row++) {
    const base = hz + 150 + row * row * 46 + row * 54;
    const w = 24 + row * 11;
    for (let i = 0; i < 4 - Math.floor(row / 2); i++) {
      tent(x, W * (0.665 + i * 0.088) + row * 14, base, w, rnd);
    }
  }

  // The flag at the tent lines: the one saturated note the act permits.
  const fx = W * 0.645;
  const fy = hz + 116;
  pen(x, [[fx, fy + 74], [fx, fy - 34]], rnd, 2.4);
  shape(x, [[fx, fy - 34], [fx + 46, fy - 28], [fx + 46, fy - 2], [fx, fy - 6]], C.flag, rnd, 1.8);

  // A cooking fire and stores by the street.
  fire(x, W * 0.60, hz + 268, 40, rnd);
  barrel(x, W * 0.565, hz + 300, 40, rnd);
  barrel(x, W * 0.60, hz + 330, 46, rnd);

  // Trees flanking the frame.
  for (const [tx, ty, tr] of [[W * 0.315, hz + 130, 74], [W * 0.955, hz + 178, 92]] as const) {
    shape(x, [[tx - 7, ty], [tx + 7, ty], [tx + 10, ty + 66], [tx - 10, ty + 66]], C.timber, rnd, 2);
    inside(x, [[tx - 10, ty], [tx + 10, ty], [tx + 10, ty + 66], [tx - 10, ty + 66]], () => {
      for (let k = 0; k < 5; k++) pen(x, [[tx - 8, ty + 10 + k * 13], [tx + 8, ty + 6 + k * 13]], rnd, 0.8);
    });
    crown(x, tx, ty - tr * 0.55, tr, rnd);
  }

  /*
   * The near-field bank, cropped by the bottom edge.
   *
   * Stated in LINE and dark colour, not in value alone: a flat style has no
   * atmospheric perspective to separate a foreground from the ground behind it,
   * so a foreground that is only a darker shape reads as a second stripe.
   */
  const bank: Pt[] = [[0, H - 118], [W * 0.3, H - 152], [W * 0.66, H - 128], [W, H - 164], [W, H], [0, H]];
  shape(x, bank, C.bank, rnd, 2.6);
  inside(x, bank, () => {
    fill(x, [[0, H - 62], [W, H - 96], [W, H], [0, H]], C.bankShade);
    pen(x, [[0, H - 62], [W, H - 96]], rnd, 1.6);
    // Ruts, stones and grass along the crest.
    for (let i = 0; i < 26; i++) {
      const rx = rnd() * W;
      const ry = H - 110 + rnd() * 96;
      pen(x, [[rx, ry], [rx + 30 + rnd() * 60, ry + (rnd() - 0.5) * 8]], rnd, 1.1);
    }
    for (let i = 0; i < 22; i++) {
      const sx = rnd() * W;
      const sy = H - 100 + rnd() * 84;
      const s = 5 + rnd() * 9;
      shape(x, [[sx - s, sy], [sx - s * 0.5, sy - s * 0.8], [sx + s * 0.6, sy - s * 0.7], [sx + s, sy]], C.stoneShade, rnd, 1.2);
    }
    for (let i = 0; i < 40; i++) tuft(x, rnd() * W, H - 116 + rnd() * 26, 12 + rnd() * 14, rnd);
  });

  return c;
}
