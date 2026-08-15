/**
 * Procedural placeholder art.
 *
 * This is scaffolding, not the art direction. Every plate here is meant to be
 * replaced by a generated one. It exists so the layer stack, the parallax, the
 * mood shader and the depth sorting can be judged before a single asset is
 * generated — and so the prototype reads in roughly the right key rather than
 * as programmer art.
 *
 * Ink and wash are drawn as separate operations for the same reason the real
 * pipeline separates them: the line carries structure, the wash carries mood.
 */

import { EARTH, INK, MEANING, PAPER } from './palette';
import { figureAtPlateY, platePx, xAtPlateX, zAtPlateY } from './ground';

type Ctx = CanvasRenderingContext2D;

function surface(w: number, h: number): { c: HTMLCanvasElement; x: Ctx } {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  return { c, x };
}

/** Deterministic noise so a reload looks identical. */
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The DOM layer's counterpart to the screen-space grain — the same tooth, for
 * surfaces the shader never sees.
 *
 * Returned as a data URI because the panels are HTML: a briefing card and a
 * speech bubble are plain accessible markup by design, and they were reading as
 * flat web chrome laid over a watercolour because they carried none of the
 * sheet's texture. With it they are sheets lying on the same sheet.
 *
 * Untinted, and composited with `multiply` rather than `overlay`. Overlay was
 * the first instinct and it is the wrong one here: against paper values this
 * close to white it compresses to nothing, and the tooth was invisible on
 * screen. Multiplying a near-white tile darkens by a controllable few percent
 * and leaves the hue to whatever it is laid on, which is how paper works.
 */
export function grainTile(size = 128, seed = 11): string {
  const { c, x } = surface(size, size);
  const rnd = mulberry(seed);
  x.fillStyle = '#FFFFFF';
  x.fillRect(0, 0, size, size);

  const img = x.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    // Darkens by 0–7%. Enough tooth to catch the eye at a hand's distance from
    // the screen, not enough to read as noise on a laptop in a classroom.
    const n = rnd() * 18;
    img.data[i] -= n;
    img.data[i + 1] -= n;
    img.data[i + 2] -= n * 0.85;
  }
  x.putImageData(img, 0, 0);

  // A few long fibres, as in the plate texture. Real rag paper has them and
  // their absence is what makes generated paper look like a gradient.
  x.globalAlpha = 0.05;
  x.strokeStyle = '#6B5B45';
  x.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    const fx = rnd() * size;
    const fy = rnd() * size;
    x.beginPath();
    x.moveTo(fx, fy);
    x.lineTo(fx + (rnd() - 0.5) * 46, fy + (rnd() - 0.5) * 14);
    x.stroke();
  }
  x.globalAlpha = 1;
  return c.toDataURL('image/png');
}

/** Paper grain, applied as a screen-space overlay rather than baked per layer. */
export function paperTexture(w = 512, h = 512, seed = 7): HTMLCanvasElement {
  const { c, x } = surface(w, h);
  const rnd = mulberry(seed);
  x.fillStyle = PAPER.WARM;
  x.fillRect(0, 0, w, h);

  const img = x.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 18;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n * 0.85;
  }
  x.putImageData(img, 0, 0);

  // Long fibres.
  x.globalAlpha = 0.05;
  x.strokeStyle = INK.FADED;
  for (let i = 0; i < 140; i++) {
    const y = rnd() * h;
    x.beginPath();
    x.moveTo(rnd() * w, y);
    x.lineTo(rnd() * w, y + (rnd() - 0.5) * 6);
    x.lineWidth = rnd() * 0.8;
    x.stroke();
  }
  x.globalAlpha = 1;
  return c;
}

/** A soft watercolour pool: many low-alpha passes with irregular edges. */
function wash(
  x: Ctx,
  pts: [number, number][],
  colour: string,
  alpha: number,
  rnd: () => number,
  passes = 5,
): void {
  x.fillStyle = colour;
  for (let p = 0; p < passes; p++) {
    x.globalAlpha = alpha / passes;
    x.beginPath();
    const jitter = p * 1.6;
    x.moveTo(pts[0][0] + (rnd() - 0.5) * jitter, pts[0][1] + (rnd() - 0.5) * jitter);
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i];
      const [qx, qy] = pts[(i + 1) % pts.length];
      x.quadraticCurveTo(
        px + (rnd() - 0.5) * jitter,
        py + (rnd() - 0.5) * jitter,
        (px + qx) / 2,
        (py + qy) / 2,
      );
    }
    x.closePath();
    x.fill();
  }
  x.globalAlpha = 1;
}

/* ------------------------------------------------------------------ colour
 *
 * Enough colour arithmetic to vary a stroke. Everything below works in sRGB
 * bytes, which is wrong colour science and completely adequate for nudging a
 * mass a few percent warmer or darker.
 */

function rgbOf(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

const clamp255 = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));

/**
 * Shift a colour by lightness and by temperature.
 *
 * `dl` moves toward white or black; `warm` pushes red up and blue down, which
 * is the cheapest convincing stand-in for a painter reaching for a warmer or
 * cooler version of the same pigment. Both are small numbers: this varies a
 * stroke, it does not recolour a thing.
 */
function vary(hex: string, dl: number, warm: number): string {
  const [r, g, b] = rgbOf(hex);
  const l = dl * 255;
  return (
    '#' +
    [
      clamp255(r + l + warm * 26),
      clamp255(g + l + warm * 6),
      clamp255(b + l - warm * 24),
    ]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * The accents (09 §2).
 *
 * A muted earth ground carrying a very small number of unnaturally saturated
 * notes that do not belong to the natural light. They are rare by construction
 * — a low per-mass probability — because the failure mode of this technique is
 * scattering them until the picture is a fruit bowl.
 *
 * None of them may carry meaning: Group D is the meaning channel, and an accent
 * that could be mistaken for a fact about a uniform is a bug.
 */
const ACCENTS = [
  '#7E8A3C', // sour green
  '#6B4A72', // bruised violet
  '#C2622A', // hot orange
  '#4E6B6B', // cold verdigris
];

/**
 * A mass, painted rather than filled.
 *
 * Was: one flat fill with a 1.6px edge jitter, which is the "outline plus flat
 * fill" that 02 §9.13 banned and that the whole build shipped anyway. Now: an
 * opaque base coat, then a dozen or more overlapping strokes at a consistent
 * angle in varied tints of the same pigment, then a few strokes that cross the
 * boundary so no edge is cut cleanly all the way round (09 §1.1).
 *
 * Still opaque, and that is deliberate. 09 asks for thin passages where the
 * ground shows, but a wall you can see the hills through breaks a painted set
 * faster than anything else — the lesson is in STATE.md and it was paid for.
 * So the variation is carried by the strokes on top of an opaque coat rather
 * than by transparency, and the "thin passage" reads as a darker stroke.
 */
function solid(
  x: Ctx,
  pts: [number, number][],
  base: string,
  rnd: () => number,
  tint?: string,
  tintAlpha = 0.3,
): void {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [px, py] of pts) {
    x0 = Math.min(x0, px);
    y0 = Math.min(y0, py);
    x1 = Math.max(x1, px);
    y1 = Math.max(y1, py);
  }
  const w = x1 - x0;
  const h = y1 - y0;
  const span = Math.max(w, h);

  const path = (jit: number): void => {
    x.beginPath();
    x.moveTo(pts[0][0] + (rnd() - 0.5) * jit, pts[0][1] + (rnd() - 0.5) * jit);
    for (let i = 1; i < pts.length; i++) {
      x.lineTo(pts[i][0] + (rnd() - 0.5) * jit, pts[i][1] + (rnd() - 0.5) * jit);
    }
    x.closePath();
  };

  x.save();
  x.globalAlpha = 1;

  // The base coat. Opaque, and a touch darker than the nominal colour so the
  // strokes laid over it read as light rather than as noise.
  x.fillStyle = vary(base, -0.035, 0);
  path(1.6);
  x.fill();

  /*
   * Below a hand's width, stop.
   *
   * A figure at this scale is read by its silhouette — STATE.md's art rule, and
   * it is why hats and builds vary. Working a brush into a twenty-pixel cuff
   * does not make it painterly, it makes it moth-eaten, which is exactly what
   * the first cut of this function did to every person on the lawn.
   */
  if (span < 20) {
    x.restore();
    x.globalAlpha = 1;
    if (tint) wash(x, pts, tint, tintAlpha, rnd, 3);
    return;
  }

  // Strokes are clipped to the mass; the edge-breakers below are not.
  path(1.2);
  x.clip();

  // One angle per mass, mostly diagonal — a painter holds the brush one way for
  // one form and does not re-grip between strokes.
  const ang = -0.42 + (rnd() - 0.5) * 0.8;
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);

  /*
   * The brush is a fixed size.
   *
   * The first cut scaled stroke width and length off the mass, which is wrong
   * in both directions at once: a hand two dozen pixels across came out
   * moth-eaten, and the lawn came out streaked with 600px scratches. A painter
   * does not fit the brush to the subject — a big field takes more strokes of
   * the same brush, not longer ones. So width and length are near-absolute, and
   * the count is whatever it takes to work the area.
   */
  const width = Math.max(2.2, Math.min(9, span / 13));
  const len = Math.max(11, Math.min(78, span * 0.34));
  const n = Math.max(3, Math.min(260, Math.round((w * h) / (len * width * 0.85))));

  /** `high` biases the stroke toward the top of the form, where light falls. */
  const laySt = (l: number, colour: string, wid: number, alpha: number, high = false): void => {
    const cx = x0 + rnd() * w;
    const cy = y0 + rnd() * h * (high ? 0.5 : 1);
    x.strokeStyle = colour;
    x.lineWidth = wid;
    x.globalAlpha = alpha;
    x.beginPath();
    x.moveTo(cx - dx * l * 0.5, cy - dy * l * 0.5);
    x.lineTo(cx + dx * l * 0.5, cy + dy * l * 0.5);
    x.stroke();
  };

  x.lineCap = 'round';

  /*
   * Two passes, and the second one is the whole style.
   *
   * The first is the worked ground: many overlapping strokes at low opacity,
   * which builds a surface that is not flat. On its own it is not enough — lay
   * enough translucent strokes over each other and they average back out into
   * the smooth field you were trying to escape, which is what the second cut of
   * this function did.
   *
   * The second pass is the loaded brush: a few near-opaque strokes, wider and
   * lighter, that stay visible AS strokes. 09 §1.1 — "thick and visibly worked
   * where the light falls", "the mark stays visible as a mark". These are the
   * marks a viewer actually reads as paint, and there are deliberately few of
   * them, because a picture that is all impasto is a picture with no light in
   * it.
   */
  for (let i = 0; i < n; i++) {
    laySt(
      len * (0.6 + rnd() * 0.7),
      vary(base, (rnd() - 0.45) * 0.2, (rnd() - 0.5) * 1.1),
      width * (0.55 + rnd() * 0.9),
      0.14 + rnd() * 0.3,
    );
  }

  /*
   * The loaded strokes go UP, where the light is.
   *
   * Scattered evenly they are not paint, they are scratches — the previous cut
   * put bright tan slashes across the dark near-field tents, because a lifted
   * stroke on a dark mass with no reason to be there reads as damage. Biased to
   * the top half of the form they read as the light catching a raised edge,
   * which is what they are meant to be.
   */
  const loaded = Math.max(2, Math.min(8, Math.round(n * 0.07)));
  for (let i = 0; i < loaded; i++) {
    laySt(
      len * (0.5 + rnd() * 0.6),
      vary(base, 0.045 + rnd() * 0.085, 0.25 + rnd() * 0.5),
      width * (1.05 + rnd() * 0.6),
      0.4 + rnd() * 0.3,
      true,
    );
  }

  // One accent, rarely, and never on something small enough that it would read
  // as a detail rather than as a note of colour.
  if (span > 26 && rnd() < 0.13) {
    x.strokeStyle = ACCENTS[Math.floor(rnd() * ACCENTS.length)];
    x.lineWidth = width * 0.7;
    x.globalAlpha = 0.13 + rnd() * 0.16;
    const cx = x0 + rnd() * w;
    const cy = y0 + rnd() * h;
    const len = span * 0.3;
    x.beginPath();
    x.moveTo(cx - dx * len * 0.5, cy - dy * len * 0.5);
    x.lineTo(cx + dx * len * 0.5, cy + dy * len * 0.5);
    x.stroke();
  }
  x.restore();

  /*
   * The broken edge.
   *
   * A few strokes straddling the boundary, painted unclipped, so the mass does
   * not end on a clean vector boundary. This is the single change that stops
   * the plates reading as cut paper, and it is why the clip above is inset
   * slightly from the fill.
   */
  if (span > 30) {
    x.save();
    x.lineCap = 'round';
    const breaks = Math.max(2, Math.min(7, Math.round(span / 34)));
    for (let i = 0; i < breaks; i++) {
      const t = rnd() * pts.length;
      const a = pts[Math.floor(t) % pts.length];
      const b = pts[(Math.floor(t) + 1) % pts.length];
      const f = t % 1;
      const ex = a[0] + (b[0] - a[0]) * f;
      const ey = a[1] + (b[1] - a[1]) * f;
      const len = Math.min(span * 0.2, 15) * (0.5 + rnd());
      x.strokeStyle = vary(base, (rnd() - 0.5) * 0.1, (rnd() - 0.5) * 0.6);
      x.lineWidth = Math.max(1.4, width * 0.5);
      x.globalAlpha = 0.3 + rnd() * 0.35;
      x.beginPath();
      x.moveTo(ex - dx * len * 0.5, ey - dy * len * 0.5);
      x.lineTo(ex + dx * len * 0.5, ey + dy * len * 0.5);
      x.stroke();
    }
    x.restore();
  }

  x.globalAlpha = 1;
  if (tint) wash(x, pts, tint, tintAlpha, rnd, 3);
}

/**
 * A thin dark form — a rail, a rope, a tent pole, a mast.
 *
 * 09 §1.1 abolishes the contour: there is no outline, and structure is carried
 * by mass and value. But 314 call sites are not outlines. A fence rail IS a
 * thin dark thing, and deleting the primitive would delete the fences.
 *
 * So it is repurposed rather than removed. It no longer draws one even
 * iron-gall contour; it lays a short dark stroke of varying weight and warmth,
 * broken more often than before, so a rail reads as painted rather than drawn.
 * The distinction that matters: use this for something that IS thin, never to
 * put a line around something that is not.
 */
function inkLine(
  x: Ctx,
  pts: [number, number][],
  rnd: () => number,
  weight = 1.4,
  lost = 0.15,
): void {
  x.lineCap = 'round';
  // More breaks than the drawn line had. A brush skips; a quill does not.
  const drop = lost + 0.12;
  for (let i = 0; i < pts.length - 1; i++) {
    if (rnd() < drop) continue;
    x.strokeStyle = vary(INK.SETTLED, (rnd() - 0.35) * 0.14, (rnd() - 0.5) * 0.7);
    x.lineWidth = weight * (0.7 + rnd() * 0.85);
    x.beginPath();
    x.moveTo(pts[i][0] + (rnd() - 0.5) * 1.4, pts[i][1] + (rnd() - 0.5) * 1.4);
    x.lineTo(pts[i + 1][0] + (rnd() - 0.5) * 1.4, pts[i + 1][1] + (rnd() - 0.5) * 1.4);
    x.globalAlpha = 0.5 + rnd() * 0.45;
    x.stroke();
  }
  x.globalAlpha = 1;
}

const W = 1600;
const H = 900;
const HORIZON = 0.34; // locked project-wide

/**
 * Atmospheric perspective.
 *
 * Distance does not only shrink things, it drains them: far planes lose
 * contrast and drift toward the colour of the air between. Baking it per layer
 * is what stops a stack of equally-crisp planes reading as flat cut paper, and
 * it is the cheapest depth cue there is.
 */
function haze(c: HTMLCanvasElement, amount: number, tint: string = PAPER.BRIGHT): HTMLCanvasElement {
  if (amount <= 0) return c;
  const x = c.getContext('2d')!;
  x.save();
  // Only veil what is already drawn, so transparent regions stay transparent.
  x.globalCompositeOperation = 'source-atop';
  x.globalAlpha = amount;
  x.fillStyle = tint;
  x.fillRect(0, 0, c.width, c.height);
  x.restore();
  return c;
}

/** A scatter of grass tufts, stones and ruts over a band of ground. */
function groundLitter(
  x: Ctx,
  rnd: () => number,
  y0: number,
  y1: number,
  n: number,
  scale = 1,
): void {
  for (let i = 0; i < n; i++) {
    const t = rnd();
    const y = y0 + (y1 - y0) * t * t;
    const px = rnd() * W;
    const s = (0.4 + t * 1.6) * scale;
    const kind = rnd();
    if (kind < 0.45) {
      for (let k = 0; k < 3; k++) {
        inkLine(x, [[px + k * 2 * s, y], [px + (k - 1) * 3 * s, y - (6 + rnd() * 8) * s]],
          rnd, 0.7 * s, 0.2);
      }
    } else if (kind < 0.8) {
      const r = (3 + rnd() * 6) * s;
      wash(x, [[px - r, y], [px - r * 0.4, y - r * 0.8], [px + r * 0.6, y - r * 0.7],
               [px + r, y + r * 0.2]], EARTH.WET_STONE, 0.3, rnd, 3);
    } else {
      inkLine(x, [[px, y], [px + (14 + rnd() * 40) * s, y + (rnd() - 0.5) * 5 * s]],
        rnd, 0.6 * s, 0.3);
    }
  }
}

/** L0 — the backdrop. Sky only. Barely moves. */
export function layerSky(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(11);
  x.fillStyle = PAPER.BRIGHT;
  x.fillRect(0, 0, W, H);
  const hy = H * HORIZON;
  for (let i = 0; i < 6; i++) {
    const y = rnd() * hy * 0.9;
    wash(
      x,
      [
        [rnd() * W * 0.4, y],
        [rnd() * W * 0.5 + W * 0.3, y - 20],
        [W * 0.9, y + 40],
        [rnd() * W * 0.3, y + 60],
      ],
      EARTH.SHADOW_SLATE,
      0.1,
      rnd,
    );
  }
  return c;
}

/**
 * A tileable band of cloud, drawn on transparency so it can drift across a sky
 * without carrying the sky with it.
 *
 * Every form is drawn three times — at x, x-W and x+W — so the strip wraps
 * seamlessly and can scroll forever on one texture.
 */
export function cloudBand(seed = 91, tint: string = EARTH.SHADOW_SLATE): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(seed);
  const hy = H * HORIZON;

  for (let i = 0; i < 14; i++) {
    const cx = rnd() * W;
    const cy = rnd() * hy * 0.82;
    const cw = 120 + rnd() * 320;
    const ch = 18 + rnd() * 34;
    const alpha = 0.05 + rnd() * 0.07;
    // A cloud is a run of overlapping lobes with a flat-ish base.
    const lobes = 3 + Math.floor(rnd() * 4);
    for (const wrap of [-W, 0, W]) {
      for (let k = 0; k < lobes; k++) {
        const t = k / Math.max(1, lobes - 1);
        const lx = cx + wrap + (t - 0.5) * cw;
        const lr = ch * (0.7 + rnd() * 0.9);
        wash(x, [[lx - lr, cy + ch * 0.4], [lx - lr * 0.6, cy - lr * 0.5],
                 [lx + lr * 0.3, cy - lr * 0.7], [lx + lr, cy - lr * 0.1],
                 [lx + lr * 0.8, cy + ch * 0.45], [lx - lr * 0.5, cy + ch * 0.5]],
          tint, alpha, rnd, 3);
      }
      // A few birds, high and far off. Two strokes each is enough at this size.
      if (i % 5 === 0) {
        for (let bq = 0; bq < 3; bq++) {
          const bx2 = cx + wrap + (rnd() - 0.5) * cw;
          const by2 = cy - 40 - rnd() * 50;
          const bs = 3 + rnd() * 4;
          inkLine(x, [[bx2 - bs, by2], [bx2, by2 - bs * 0.55], [bx2 + bs, by2]], rnd, 0.9, 0.0);
        }
      }
      // A softer underside, so it has a base rather than a bottom edge.
      wash(x, [[cx + wrap - cw * 0.5, cy + ch * 0.3], [cx + wrap + cw * 0.5, cy + ch * 0.2],
               [cx + wrap + cw * 0.42, cy + ch * 0.7], [cx + wrap - cw * 0.44, cy + ch * 0.8]],
        tint, alpha * 0.7, rnd, 3);
    }
  }
  return c;
}

/**
 * L1 — the Potomac, and the Maryland shore beyond it.
 *
 * The canonical view is from the west, the land side, so the river lies BEYOND
 * the house rather than in front of it: the mansion stands on the bluff and the
 * water shows over its roofline with the far shore as a low wooded line above
 * that. The act's palette is "river haze, spring green, PAPER sky", and the
 * haze is the point — this is the widest thing in the game and it should read
 * as distance, not as a blue stripe.
 */
export function layerHills(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(23);
  const hy = H * HORIZON;

  // The far shore: a low wooded ridge, hazed almost to nothing.
  const ridge: [number, number][] = [];
  for (let i = 0; i <= 22; i++) {
    ridge.push([(i / 22) * W, hy - 66 + Math.sin(i * 0.6) * 9 + rnd() * 6]);
  }
  solid(x, [...ridge, [W, hy - 34], [0, hy - 34]], '#93A08E', rnd);
  wash(x, [...ridge, [W, hy - 34], [0, hy - 34]], EARTH.TERRE_VERTE, 0.30, rnd);
  // Tree texture along the top of it, kept tiny.
  for (let i = 0; i < 120; i++) {
    const px = rnd() * W;
    const py = hy - 66 + Math.sin((px / W) * 22 * 0.6) * 9 + rnd() * 8;
    inkLine(x, [[px, py + 4], [px + (rnd() - 0.5) * 4, py - 2 - rnd() * 5]], rnd, 0.6, 0.35);
  }

  // The Potomac. Nearly two miles across here, so it is a broad flat band.
  solid(x, [[0, hy - 36], [W, hy - 36], [W, hy + 2], [0, hy + 2]], '#9DA9AD', rnd);
  wash(x, [[0, hy - 36], [W, hy - 36], [W, hy + 2], [0, hy + 2]], EARTH.SHADOW_SLATE, 0.22, rnd);
  // A little light on the water, and one sail.
  for (let i = 0; i < 26; i++) {
    const wy = hy - 32 + rnd() * 32;
    const sx = rnd() * W;
    inkLine(x, [[sx, wy], [sx + 20 + rnd() * 90, wy + (rnd() - 0.5) * 2]], rnd, 0.5, 0.35);
  }
  const sailX = W * 0.70;
  const sailY = hy - 18;
  solid(x, [[sailX, sailY], [sailX + 9, sailY - 22], [sailX + 13, sailY]], PAPER.BRIGHT, rnd);
  inkLine(x, [[sailX, sailY], [sailX + 9, sailY - 22], [sailX + 13, sailY]], rnd, 0.9, 0.15);

  // The near bank, rising to the bluff the house stands on.
  const bank: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    bank.push([(i / 18) * W, hy - 2 + Math.sin(i * 0.8) * 7 + rnd() * 5]);
  }
  solid(x, [...bank, [W, hy + 40], [0, hy + 40]], '#B6B79C', rnd);
  wash(x, [...bank, [W, hy + 40], [0, hy + 40]], EARTH.TERRE_VERTE, 0.26, rnd);
  inkLine(x, bank, rnd, 1.0, 0.34);

  return haze(c, 0.30);
}

/**
 * L2 — the subject. Mount Vernon in May 1775.
 *
 * Historically corrected per reference/historical-visual-reference.md: no
 * piazza (1777), no cupola (1778), no Dove of Peace (1787). The north wing is
 * an active building site, and the scaffolding is a story beat — Washington
 * rode away on 4 May 1775 and did not live here again for eight years.
 */
export function layerHouse(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(37);
  const hy = H * HORIZON;

  // The ground: horizon to the bottom of the frame. The lawn falls away west
  // toward the river, so the wash warms and darkens as it comes forward.
  // Lawn: green under, warmed with ochre where the sun has been on it, and
  // browner as it comes forward toward the river bank.
  solid(x, [[0, hy + 8], [W, hy - 6], [W, H], [0, H]], '#D2CFB9', rnd);
  wash(x, [[0, hy + 8], [W, hy - 6], [W, H], [0, H]], EARTH.TERRE_VERTE, 0.17, rnd);
  wash(x, [[0, hy + 40], [W * 0.7, hy + 20], [W, hy + 180], [0, hy + 220]],
    EARTH.YELLOW_OCHRE, 0.13, rnd);
  wash(x, [[0, hy + 190], [W, hy + 150], [W, H], [0, H]], EARTH.BISTRE, 0.13, rnd);

  // Mown bands. Short broken strokes rather than full-width rules, so they
  // read as ground texture instead of as ruled lines across the plate.
  x.globalAlpha = 0.5;
  for (let i = 0; i < 8; i++) {
    const y = hy + 46 + i * i * 8;
    if (y > H - 20) break;
    for (let j = 0; j < 5 + i * 2; j++) {
      const sx = rnd() * W;
      const len = 30 + rnd() * (60 + i * 22);
      inkLine(x, [[sx, y + rnd() * 8], [sx + len, y + rnd() * 8]], rnd, 0.6 + i * 0.1, 0.3);
    }
  }
  x.globalAlpha = 1;

  // A block: wash body, ink outline, roof, and a row of windows.
  const block = (bx: number, by: number, bw: number, bh: number, wins: number, ridge: number) => {
    // Rusticated boards, painted white and sanded — opaque, then washed warm
    // on the lit side and cool in the lee.
    solid(x, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], '#E3DCC8', rnd);
    wash(x, [[bx + bw * 0.55, by], [bx + bw, by], [bx + bw, by + bh], [bx + bw * 0.55, by + bh]],
      EARTH.SHADOW_SLATE, 0.11, rnd, 3);
    wash(x, [[bx, by], [bx + bw * 0.5, by], [bx + bw * 0.5, by + bh], [bx, by + bh]],
      EARTH.YELLOW_OCHRE, 0.045, rnd, 2);
    inkLine(x, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh], [bx, by]], rnd, 1.5, 0.1);
    // Board courses.
    for (let i = 1; i < 7; i++) {
      inkLine(x, [[bx, by + (bh * i) / 7], [bx + bw, by + (bh * i) / 7 - 1]], rnd, 0.5, 0.55);
    }
    // Slate roof, blue-grey and opaque.
    solid(x, [[bx - 8, by], [bx + bw / 2, by - ridge], [bx + bw + 8, by]], '#848A94', rnd,
      EARTH.SHADOW_SLATE, 0.18);
    inkLine(x, [[bx - 8, by], [bx + bw / 2, by - ridge], [bx + bw + 8, by]], rnd, 1.5, 0.08);
    for (let i = 1; i < 5; i++) {
      const t = i / 5;
      inkLine(x, [[bx - 8 + bw * 0.5 * t, by - ridge * t], [bx + bw + 8 - bw * 0.5 * t, by - ridge * t]],
        rnd, 0.5, 0.5);
    }
    for (let r = 0; r < (bh > 90 ? 2 : 1); r++) {
      for (let i = 0; i < wins; i++) {
        const wx = bx + bw * 0.12 + (i * bw * 0.76) / Math.max(1, wins - 1);
        const wy = by + 18 + r * bh * 0.42;
        const ww = bw * 0.075;
        const wh = bh * 0.2;
        // Glass reads dark and slightly green; shutters are painted.
        solid(x, [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], '#4C5450', rnd);
        inkLine(x, [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh], [wx, wy]], rnd, 0.9, 0.15);
        // Sash bars. Three lights across and four down is close enough to the
        // twelve-over-twelve that was there, and a pane grid is what makes a
        // dark rectangle read as glass instead of as a hole.
        for (let k = 1; k < 3; k++) {
          inkLine(x, [[wx + (ww * k) / 3, wy], [wx + (ww * k) / 3, wy + wh]], rnd, 0.5, 0.45);
        }
        for (let k = 1; k < 4; k++) {
          inkLine(x, [[wx, wy + (wh * k) / 4], [wx + ww, wy + (wh * k) / 4]], rnd, 0.5, 0.5);
        }
        solid(x, [[wx - ww * 0.42, wy], [wx - ww * 0.06, wy], [wx - ww * 0.06, wy + wh],
                  [wx - ww * 0.42, wy + wh]], '#5B6B5C', rnd);
        solid(x, [[wx + ww * 1.06, wy], [wx + ww * 1.42, wy], [wx + ww * 1.42, wy + wh],
                  [wx + ww * 1.06, wy + wh]], '#5B6B5C', rnd);
      }
    }
  };

  /*
   * The ground of a working farm, laid before anything is built on it.
   *
   * The previous pass staged this as a period engraving would: house dead
   * centre, dependencies mirrored either side, a formal avenue of clipped yews
   * marching up the middle. It was a handsome arrangement and the wrong one.
   * A ruled axis tells the player where to walk before he has decided anything,
   * and Mount Vernon in May 1775 was a farm being run, not a plate being sat
   * for — the serpentine bowling green everyone pictures was ten years off.
   *
   * So: nothing on the centre line, nothing mirrored, and the lines that do run
   * into the picture are the ones a working yard would actually have — a
   * paddock fence at an angle, garden rows, a track worn where feet go.
   */
  const houseBaseY = 352;
  const houseZ = zAtPlateY(houseBaseY, H);
  const houseCx = W * 0.42;

  // The track to the door. Worn rather than laid: it comes in from the yard on
  // the right, where the carriage and the outbuildings are, and bends toward
  // the door instead of aiming at it.
  {
    const doorGx = xAtPlateX(houseCx, houseZ, W);
    const pts: [number, number][] = [];
    const edge = (side: number) => {
      const out: [number, number][] = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const z = 0.24 + t * (houseZ - 0.03 - 0.24);
        // Bends: wide and vague near the viewer, narrowing to the doorstep.
        const gx = 0.74 + (doorGx - 0.74) * (t * t * (3 - 2 * t));
        const half = 0.085 - 0.055 * t;
        out.push([gx + side * half, z]);
      }
      return out;
    };
    for (const [gx, z] of edge(-1)) { const a = platePx({ x: gx, z }, W, H); pts.push([a.x, a.y]); }
    for (const [gx, z] of edge(1).reverse()) { const a = platePx({ x: gx, z }, W, H); pts.push([a.x, a.y]); }
    wash(x, pts, EARTH.RAW_UMBER, 0.16, rnd, 4);
    wash(x, pts, EARTH.YELLOW_OCHRE, 0.10, rnd, 3);
  }

  // The kitchen garden, off to the right where the ground is flat. Rows run
  // away from the viewer, which is the one honestly converging thing in the
  // frame and does the work the avenue was doing, without ruling the middle.
  for (let r = 0; r < 7; r++) {
    const gx = 0.60 + r * 0.028;
    const a = platePx({ x: gx, z: 0.66 }, W, H);
    const b = platePx({ x: gx + 0.012, z: 0.79 }, W, H);
    // The furrow itself, as a turned-earth band rather than a line — a single
    // stroke at this size disappears into the ground litter.
    wash(x, [[a.x - 5, a.y], [a.x + 5, a.y], [b.x + 3, b.y], [b.x - 3, b.y]],
      EARTH.RAW_UMBER, 0.34, rnd, 3);
    inkLine(x, [[a.x, a.y], [b.x, b.y]], rnd, 1.3, 0.14);
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      const sh = 9 * (1 - t * 0.45);
      solid(x, [[px - sh * 0.5, py], [px + sh * 0.5, py], [px + sh * 0.4, py - sh],
                [px - sh * 0.4, py - sh]], '#6B7A56', rnd, EARTH.TERRE_VERTE, 0.3);
    }
  }

  // A paddock fence running away on the left. Diagonal on purpose: every other
  // long line in the frame is parallel to its edges, and one that is not is
  // most of what stops a painted set looking like a stage flat.
  {
    const a = { x: 0.02, z: 0.30 };
    const b = { x: 0.30, z: 0.74 };
    const n = 13;
    let prev: { x: number; y: number } | null = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const q = platePx({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }, W, H);
      const ph = 34 * q.scale;
      inkLine(x, [[q.x, q.y], [q.x + 2, q.y - ph]], rnd, 1.6 * q.scale, 0.06);
      if (prev) {
        for (const f of [0.42, 0.78]) {
          inkLine(x, [[prev.x, prev.y - 34 * q.scale * f], [q.x, q.y - ph * f]], rnd, 1.1, 0.1);
        }
      }
      prev = q;
    }
  }

  /*
   * Staging.
   *
   * Nothing is centred and nothing is mirrored. The house sits left of the
   * frame's middle with its working yard open to the right, which is where the
   * carriage and the outbuildings already are — so the eye enters on the
   * business and travels to the house, rather than being aimed at the front
   * door from the first frame.
   *
   * The five-part Palladian massing is still true to the place; it is only the
   * symmetry of the engraved plates that has gone. A dependency nearer than the
   * house and a second one further off does more for depth than two of them
   * placed evenly ever did.
   */
  const bw = W * 0.245;
  const bh = 178;
  const bx = houseCx - bw / 2;
  const by = houseBaseY - bh;
  block(bx, by, bw, bh, 5, 50);

  /*
   * The west front, in the detail it actually had.
   *
   * Rusticated boards: pine, bevelled and bedded in sand paint so that from
   * twenty feet it passes for dressed stone. Washington was doing this in the
   * 1750s and it is the single most characteristic thing about the house —
   * without it the mansion is a white box. Drawn as courses with a light edge
   * along the top of each, which is what the bevel does in raking light.
   *
   * Three dormers in the roof, a pedimented centre bay, and a water table where
   * the boards meet the foundation. No cupola and no piazza: both are later, and
   * the north wing behind the scaffolding is the work in hand this spring.
   */
  {
    // Bevel highlights along each board course.
    x.globalAlpha = 0.5;
    for (let i = 1; i < 14; i++) {
      const yy = by + (bh * i) / 14;
      x.strokeStyle = PAPER.BRIGHT;
      x.lineWidth = 1.1;
      x.beginPath();
      x.moveTo(bx + 2, yy - 1.5);
      x.lineTo(bx + bw - 2, yy - 2.5);
      x.stroke();
    }
    x.globalAlpha = 1;
    for (let i = 1; i < 14; i++) {
      inkLine(x, [[bx, by + (bh * i) / 14], [bx + bw, by + (bh * i) / 14 - 1]], rnd, 0.6, 0.42);
    }

    // Corner boards, which frame the rustication and stop it running off.
    for (const cxb of [bx + 3, bx + bw - 3]) {
      inkLine(x, [[cxb, by], [cxb, by + bh]], rnd, 1.4, 0.06);
    }
    // Water table at the foot of the wall.
    solid(x, [[bx - 4, by + bh - 10], [bx + bw + 4, by + bh - 10],
              [bx + bw + 4, by + bh], [bx - 4, by + bh]], '#C9C0A6', rnd,
      EARTH.SHADOW_SLATE, 0.16);
    inkLine(x, [[bx - 4, by + bh - 10], [bx + bw + 4, by + bh - 10]], rnd, 1.3, 0.08);

    // The centre bay, standing slightly proud with a pediment over it.
    const px0 = bx + bw * 0.38;
    const pw = bw * 0.24;
    inkLine(x, [[px0, by], [px0, by + bh]], rnd, 1.3, 0.14);
    inkLine(x, [[px0 + pw, by], [px0 + pw, by + bh]], rnd, 1.3, 0.14);
    const ped: [number, number][] = [[px0 - 8, by + 4], [px0 + pw / 2, by - 26],
      [px0 + pw + 8, by + 4]];
    solid(x, ped, '#E6E0CC', rnd, EARTH.SHADOW_SLATE, 0.12);
    inkLine(x, [...ped, ped[0]], rnd, 1.5, 0.06);

    // Three dormers in the roof, which the west front had and this did not.
    for (const f of [0.24, 0.5, 0.76]) {
      const dx0 = bx + bw * f;
      // Set into the roof slope, not perched on the ridge. The first pass made
      // them nearly as tall as the roof is deep, so they read as three boxes
      // standing on top of the house.
      const dwd = bw * 0.044;
      const dh0 = 20;
      const dy0 = by - 22;
      solid(x, [[dx0 - dwd, dy0], [dx0 + dwd, dy0], [dx0 + dwd, dy0 + dh0], [dx0 - dwd, dy0 + dh0]],
        '#DED7C0', rnd, EARTH.SHADOW_SLATE, 0.12);
      solid(x, [[dx0 - dwd * 1.4, dy0], [dx0, dy0 - 11], [dx0 + dwd * 1.4, dy0]],
        '#7E8590', rnd, EARTH.SHADOW_SLATE, 0.2);
      inkLine(x, [[dx0 - dwd * 1.4, dy0], [dx0, dy0 - 11], [dx0 + dwd * 1.4, dy0]], rnd, 1.3, 0.08);
      solid(x, [[dx0 - dwd * 0.6, dy0 + 4], [dx0 + dwd * 0.6, dy0 + 4],
                [dx0 + dwd * 0.6, dy0 + dh0 - 3], [dx0 - dwd * 0.6, dy0 + dh0 - 3]],
        '#4C5450', rnd);
      inkLine(x, [[dx0 - dwd, dy0], [dx0 + dwd, dy0], [dx0 + dwd, dy0 + dh0],
                  [dx0 - dwd, dy0 + dh0], [dx0 - dwd, dy0]], rnd, 1.2, 0.1);
    }
  }

  // Chimneys. Two, at the ends, per the house as it stood before the wings
  // went up. Without them the roof reads as a lid.
  for (const f of [0.16, 0.84]) {
    const cxp = bx + bw * f;
    const cw = bw * 0.030;
    const ct = by - 38 * (1 - Math.abs(f - 0.5) * 1.1) - 16;
    solid(x, [[cxp - cw, ct], [cxp + cw, ct], [cxp + cw, by - 6], [cxp - cw, by - 6]],
      '#9A8A72', rnd, EARTH.RAW_UMBER, 0.3);
    inkLine(x, [[cxp - cw, ct], [cxp + cw, ct], [cxp + cw, by - 6], [cxp - cw, by - 6],
                [cxp - cw, ct]], rnd, 1.3, 0.07);
    inkLine(x, [[cxp - cw * 1.25, ct + 6], [cxp + cw * 1.25, ct + 6]], rnd, 1.2, 0.08);
  }

  // The door and its pediment. Centred on the building, which is no longer
  // centred on the frame — that is the whole difference.
  {
    const dx = bx + bw / 2;
    const dw = bw * 0.075;
    const dh = bh * 0.30;
    const dy = by + bh - dh;
    solid(x, [[dx - dw, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx - dw, dy + dh]], '#3A362C', rnd);
    inkLine(x, [[dx - dw, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx - dw, dy + dh],
                [dx - dw, dy]], rnd, 1.3, 0.06);
    solid(x, [[dx - dw * 1.7, dy - 2], [dx, dy - dh * 0.42], [dx + dw * 1.7, dy - 2]],
      '#D8D1BC', rnd, EARTH.SHADOW_SLATE, 0.14);
    inkLine(x, [[dx - dw * 1.7, dy - 2], [dx, dy - dh * 0.42], [dx + dw * 1.7, dy - 2],
                [dx - dw * 1.7, dy - 2]], rnd, 1.3, 0.06);
    // Steps down to the track.
    for (let i = 0; i < 2; i++) {
      const sw = dw * (1.6 + i * 0.32);
      inkLine(x, [[dx - sw, dy + dh + i * 5], [dx + sw, dy + dh + i * 5]], rnd, 1.1, 0.08);
    }
  }

  // The north wing, unfinished, and its scaffolding. In May 1775 this was an
  // open building site — no piazza, no cupola, no weathervane.
  const sx = bx + bw;
  {
    // Part-built wall, ragged along the top where the courses stop.
    const top: [number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      top.push([sx + (i * 110) / 6, by + 62 + (i % 2 === 0 ? 0 : 11) + rnd() * 6]);
    }
    const wall: [number, number][] = [...top, [sx + 110, by + bh], [sx, by + bh]];
    solid(x, wall, '#A08A6E', rnd, EARTH.RAW_UMBER, 0.28);
    inkLine(x, [...wall, wall[0]], rnd, 1.3, 0.12);
    for (let r = 1; r < 5; r++) {
      inkLine(x, [[sx, by + 62 + r * 24], [sx + 110, by + 60 + r * 24]], rnd, 0.7, 0.35);
    }
  }
  for (let i = 0; i <= 4; i++) {
    const px = sx + i * 27;
    inkLine(x, [[px, by + 28], [px, by + bh + 8]], rnd, 1.1, 0.05);
  }
  for (let i = 0; i < 5; i++) {
    inkLine(x, [[sx - 10, by + 42 + i * 38], [sx + 118, by + 38 + i * 38]], rnd, 1.0, 0.05);
  }

  /**
   * A dependency, turned.
   *
   * Two faces and a hipped roof. The gable end is taken as frontal; the long
   * face runs away, and everything on it — the eaves, the sill line, the
   * spacing of the windows — converges on the horizon. `k` is how far the far
   * end is foreshortened.
   *
   * The two are given different depths, sizes and angles on purpose. Matched
   * pairs read as architecture posing for a portrait; a big one close and a
   * small one further off reads as buildings that were put up when they were
   * needed, which is what these were.
   */
  const wing = (
    outer: number, inner: number, baseY: number, h: number, gw: number, wins: number, k = 0.74,
  ) => {
    const dir = Math.sign(inner - outer);
    const corner = outer + dir * gw;
    const topY = baseY - h;
    const conv = (yy: number) => hy + (yy - hy) * k; // toward the horizon
    const farTop = conv(topY);
    const farBot = conv(baseY);

    // Long face, running away toward the centre. In shade on the left wing and
    // catching the light on the right, since the sun is off to the west.
    const lit = dir < 0;
    const face: [number, number][] = [
      [corner, topY], [inner, farTop], [inner, farBot], [corner, baseY],
    ];
    solid(x, face, '#D8CDB4', rnd, lit ? EARTH.YELLOW_OCHRE : EARTH.SHADOW_SLATE, lit ? 0.09 : 0.17);
    inkLine(x, [...face, face[0]], rnd, 1.5, 0.08);

    // Gable end, taken as frontal, and always the darker of the two so the turn
    // reads as a turn rather than as a seam.
    const end: [number, number][] = [[outer, topY], [corner, topY], [corner, baseY], [outer, baseY]];
    solid(x, end, '#C9BEA4', rnd, EARTH.SHADOW_SLATE, lit ? 0.22 : 0.12);
    inkLine(x, [...end, end[0]], rnd, 1.5, 0.06);

    // Hipped roof: a ridge running back along the face, hipped over the end.
    const ridge = h * 0.22;
    const nearRidge: [number, number] = [corner + dir * gw * 0.3, topY - ridge];
    const farRidge: [number, number] = [inner - dir * 14, conv(topY - ridge)];
    const slope: [number, number][] = [[corner, topY], nearRidge, farRidge, [inner, farTop]];
    solid(x, slope, '#9C8065', rnd, EARTH.MADDER_LAKE, 0.16);
    inkLine(x, [...slope, slope[0]], rnd, 1.4, 0.08);
    const hip: [number, number][] = [[outer - dir * 6, topY], [corner, topY], nearRidge];
    solid(x, hip, '#8A6F58', rnd, EARTH.BISTRE, 0.14);
    inkLine(x, [...hip, hip[0]], rnd, 1.4, 0.08);

    // Windows, spaced projectively — evenly along the wall is not evenly across
    // the picture, and getting that wrong is what makes a turned building look
    // like a sheared rectangle.
    for (let i = 0; i < wins; i++) {
      const u = (i + 0.6) / (wins + 0.2);
      const t = (u * k) / (u * k + (1 - u));
      const wx0 = corner + (inner - corner) * t;
      const localH = h * (1 + (k - 1) * t);
      const ww = gw * 0.19 * (1 + (k - 1) * t);
      const wy = baseY - localH * 0.74;
      const wh = localH * 0.30;
      solid(x, [[wx0, wy], [wx0 + dir * ww, wy], [wx0 + dir * ww, wy + wh], [wx0, wy + wh]],
        '#4C5450', rnd);
      inkLine(x, [[wx0, wy], [wx0 + dir * ww, wy], [wx0 + dir * ww, wy + wh], [wx0, wy + wh],
                  [wx0, wy]], rnd, 0.9, 0.14);
    }
    // Eaves and sill lines, converging. Two ruled lines do more for the turn
    // than any amount of shading.
    inkLine(x, [[corner, topY + 6], [inner, conv(topY + 6)]], rnd, 0.9, 0.2);
    inkLine(x, [[corner, baseY - h * 0.2], [inner, conv(baseY - h * 0.2)]], rnd, 0.7, 0.35);
  };

  // The kitchen and the servants' hall, standing off the house and turned in.
  // They sit forward of the centre block, which is what closes the court.
  // The kitchen: near, large, its long face running back toward the house.
  wing(W * 0.045, W * 0.225, hy + 168, 168, W * 0.078, 3, 0.66);
  // A smaller store, further off and turned the other way, tucked between the
  // house and the yard.
  wing(W * 0.805, W * 0.690, hy + 100, 100, W * 0.050, 2, 0.80);

  /*
   * The work.
   *
   * Pentiment's places read as lived in because the clutter is somebody's job
   * half-finished — wood not yet stacked, washing not yet dry — rather than
   * set dressing placed for balance. All of this leans on a building or sits
   * where it was put down, and none of it is arranged.
   */

  // Woodpile against the kitchen's long face, and the axe left in the block.
  {
    const px = W * 0.185;
    const py = hy + 168;
    for (let r = 0; r < 4; r++) {
      for (let i = 0; i < 7 - r; i++) {
        const lx = px + i * 11 + r * 5;
        const ly = py - r * 10;
        solid(x, [[lx, ly - 10], [lx + 10, ly - 10], [lx + 10, ly], [lx, ly]], '#8A6F52', rnd,
          EARTH.BISTRE, 0.2);
        inkLine(x, [[lx, ly - 10], [lx + 10, ly - 10], [lx + 10, ly], [lx, ly], [lx, ly - 10]],
          rnd, 0.8, 0.3);
      }
    }
    solid(x, [[px - 30, py - 22], [px - 8, py - 22], [px - 8, py], [px - 30, py]], '#7A6349', rnd);
    inkLine(x, [[px - 22, py - 22], [px - 16, py - 44]], rnd, 1.6, 0.04); // helve
    solid(x, [[px - 20, py - 44], [px - 8, py - 50], [px - 6, py - 42], [px - 16, py - 38]],
      '#6A7076', rnd);
  }

  // Barrels by the store, one on its side.
  {
    const bxs = W * 0.665;
    const byb = hy + 104;
    const barrel = (cx0: number, b0: number, sc: number, tipped: boolean) => {
      const bwd = 22 * sc;
      const bht = 30 * sc;
      const pts: [number, number][] = tipped
        ? [[cx0 - bht / 2, b0 - bwd], [cx0 + bht / 2, b0 - bwd], [cx0 + bht / 2, b0], [cx0 - bht / 2, b0]]
        : [[cx0 - bwd / 2, b0 - bht], [cx0 + bwd / 2, b0 - bht], [cx0 + bwd / 2 + 1, b0], [cx0 - bwd / 2 - 1, b0]];
      solid(x, pts, '#7E6647', rnd, EARTH.RAW_UMBER, 0.24);
      inkLine(x, [...pts, pts[0]], rnd, 1.2, 0.1);
      for (const f of [0.3, 0.7]) {
        inkLine(x, tipped
          ? [[cx0 - bht / 2 + bht * f, b0 - bwd], [cx0 - bht / 2 + bht * f, b0]]
          : [[cx0 - bwd / 2, b0 - bht + bht * f], [cx0 + bwd / 2, b0 - bht + bht * f]],
          rnd, 0.9, 0.2);
      }
    };
    barrel(bxs, byb, 1.0, false);
    barrel(bxs + 26, byb + 3, 0.95, false);
    barrel(bxs - 30, byb + 5, 0.9, true);
  }

  // Washing on a line between the kitchen and a post. Nothing says a household
  // is running quite as cheaply as laundry that is not dry yet.
  {
    const ax = W * 0.235;
    const ay = hy + 128;
    const bx2 = W * 0.325;
    const by2 = hy + 150;
    inkLine(x, [[bx2, by2], [bx2, by2 - 74]], rnd, 1.6, 0.04);
    const sagY = (t: number) => ay + (by2 - 74 - ay) * t + Math.sin(Math.PI * t) * 9;
    const line: [number, number][] = [];
    for (let i = 0; i <= 8; i++) line.push([ax + (bx2 - ax) * (i / 8), sagY(i / 8)]);
    inkLine(x, line, rnd, 1.0, 0.06);
    for (const [t, wq, hq, tone] of [[0.18, 20, 26, '#DCD6C4'], [0.44, 16, 22, '#C9C2AE'],
                                     [0.70, 22, 30, '#E2DCCB']] as [number, number, number, string][]) {
      const px = ax + (bx2 - ax) * t;
      const py = sagY(t);
      solid(x, [[px - wq / 2, py], [px + wq / 2, py], [px + wq / 2 - 2, py + hq],
                [px - wq / 2 + 2, py + hq]], tone, rnd, EARTH.SHADOW_SLATE, 0.1);
      inkLine(x, [[px - wq / 2, py], [px + wq / 2, py], [px + wq / 2 - 2, py + hq],
                  [px - wq / 2 + 2, py + hq], [px - wq / 2, py]], rnd, 0.9, 0.18);
    }
  }

  // Poultry, wherever poultry is. Four marks and a scratch each.
  for (const [px, py, sc] of [[W * 0.30, hy + 196, 1.0], [W * 0.335, hy + 188, 0.9],
                              [W * 0.275, hy + 178, 0.85], [W * 0.56, hy + 150, 0.8],
                              [W * 0.585, hy + 158, 0.9]] as [number, number, number][]) {
    solid(x, [[px - 7 * sc, py - 9 * sc], [px + 5 * sc, py - 11 * sc], [px + 7 * sc, py - 4 * sc],
              [px - 5 * sc, py - 2 * sc]], '#B8A88A', rnd, EARTH.RAW_UMBER, 0.22);
    inkLine(x, [[px + 5 * sc, py - 11 * sc], [px + 9 * sc, py - 16 * sc]], rnd, 1.1 * sc, 0.06);
    inkLine(x, [[px - 2 * sc, py - 2 * sc], [px - 2 * sc, py]], rnd, 0.9 * sc, 0.1);
    inkLine(x, [[px + 3 * sc, py - 2 * sc], [px + 3 * sc, py]], rnd, 0.9 * sc, 0.1);
  }

  // Smoke off the kitchen chimney — the only thing in the frame that says the
  // house is occupied rather than merely standing.
  {
    let sxp = W * 0.115;
    let syp = hy + 168 - 168 - 26;
    for (let i = 0; i < 9; i++) {
      const r = 9 + i * 4.5;
      wash(x, [[sxp - r, syp], [sxp + r * 0.8, syp - r * 0.5], [sxp + r, syp + r * 0.4],
               [sxp - r * 0.6, syp + r * 0.6]], PAPER.BRIGHT, 0.20, rnd, 3);
      sxp += 7 + i * 1.6;
      syp -= 13;
    }
  }

  // The house throws its shadow west across the lawn in the afternoon.
  wash(x, [[bx - 20, by + bh], [bx + bw + 40, by + bh - 6], [bx + bw + 10, by + bh + 84],
           [bx - 70, by + bh + 92]], EARTH.RAW_UMBER, 0.12, rnd, 3);
  return c;
}

/**
 * L3 — the midground band.
 *
 * This is the layer that makes depth worth having. Objects sit across the whole
 * width rather than only at the edges, so wherever the player walks deep,
 * something passes in front of them. The middle is kept low and open — the
 * mansion has to stay visible through it.
 */
export function layerMidground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(51);
  const hy = H * HORIZON;

  const shadow = (cx: number, base: number, r: number) =>
    wash(x, [[cx - r, base], [cx + r, base - 4], [cx + r * 0.7, base + r * 0.24],
             [cx - r * 0.8, base + r * 0.26]], EARTH.RAW_UMBER, 0.2, rnd, 3);

  /**
   * A tree.
   *
   * Built as a broad, irregular mass of small dabs following the branch ends
   * rather than a few big blobs stacked on a pole — the blob version reads as a
   * lollipop at any size. Deciduous crowns at this distance are wider than they
   * are tall, the silhouette is ragged, and the sky shows through in places.
   */
  /**
   * A tree.
   *
   * Rebuilt opaque, which is the whole of the fix. The crown was thirty-odd
   * transparent dabs at alpha 0.11 laid over each other — the last thing in the
   * scene still made of washes when everything else had gone solid — so it read
   * as a smudge of green fog with a wire frame inside it while the buildings
   * and figures beside it had edges.
   *
   * The order is now: one opaque lumpy mass, shaded darker underneath where a
   * crown is always in its own shade, a few light clumps on the sunward top,
   * and a broken ink line round the silhouette. Broken matters — a continuous
   * outline turns a tree into a balloon.
   */
  const tree = (tx: number, base: number, th: number, spread: number) => {
    const forkY = base - th * 0.36; // low fork: most of the tree is crown
    const cyc = forkY - th * 0.30; // centre of the crown
    const ryc = th * 0.36;

    // Trunk, opaque and tapering.
    solid(x, [[tx - th * 0.030, base], [tx + th * 0.030, base],
              [tx + th * 0.015, forkY - th * 0.08], [tx - th * 0.015, forkY - th * 0.08]],
      '#6B563E', rnd, EARTH.BISTRE, 0.28);
    inkLine(x, [[tx - th * 0.028, base], [tx - th * 0.014, forkY]], rnd, 1.7, 0.08);
    inkLine(x, [[tx + th * 0.028, base], [tx + th * 0.014, forkY]], rnd, 1.7, 0.08);

    // Boughs into the crown, drawn before the leaf so they are half-hidden by it.
    const tips: [number, number][] = [];
    const boughs = 5;
    for (let i = 0; i < boughs; i++) {
      const t = (i + 0.5) / boughs;
      const ang = -Math.PI / 2 + (t - 0.5) * 2.2 + (rnd() - 0.5) * 0.28;
      const len = th * (0.30 + rnd() * 0.20);
      const mx = tx + Math.cos(ang) * len * 0.55;
      const my = forkY + Math.sin(ang) * len * 0.55;
      const ex = tx + Math.cos(ang) * len;
      const ey = forkY + Math.sin(ang) * len;
      inkLine(x, [[tx, forkY], [mx, my], [ex, ey]], rnd, 2.2, 0.06);
      tips.push([ex, ey]);
    }

    /*
     * The crown as one closed shape.
     *
     * Sampled round an ellipse with the radius pushed in and out per step, so
     * the boundary is ragged the way a canopy is rather than round the way a
     * lollipop is. Sixteen steps is enough to read as foliage and few enough
     * that each bump is a distinct clump of leaf.
     */
    const crown: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const a2 = (i / 16) * Math.PI * 2;
      const bump = 0.74 + rnd() * 0.46;
      crown.push([tx + Math.cos(a2) * spread * 0.5 * bump,
                  cyc + Math.sin(a2) * ryc * bump]);
    }
    solid(x, crown, '#6E7A56', rnd, EARTH.TERRE_VERTE, 0.30);

    // Underside shade: a crown is always darker below and inside.
    const under: [number, number][] = crown
      .filter(([, py2]) => py2 > cyc - ryc * 0.15)
      .map(([px2, py2]) => [px2 * 0.94 + tx * 0.06, py2] as [number, number]);
    if (under.length > 2) {
      under.push([tx, cyc - ryc * 0.1]);
      wash(x, under, EARTH.BISTRE, 0.24, rnd, 3);
    }

    // Sunward clumps on the upper left, opaque and lighter.
    for (let k = 0; k < 7; k++) {
      const a2 = -Math.PI * (0.55 + rnd() * 0.55);
      const rr = spread * 0.5 * (0.30 + rnd() * 0.42);
      const px2 = tx + Math.cos(a2) * rr;
      const py2 = cyc + Math.sin(a2) * ryc * 0.82;
      const r = spread * (0.09 + rnd() * 0.07);
      solid(x, [[px2 - r, py2], [px2 - r * 0.4, py2 - r * 0.95], [px2 + r * 0.6, py2 - r * 0.8],
                [px2 + r, py2 + r * 0.2], [px2 + r * 0.2, py2 + r * 0.85],
                [px2 - r * 0.65, py2 + r * 0.6]], '#84906A', rnd, EARTH.TERRE_VERTE, 0.2);
    }

    // Broken outline. Every third segment dropped, so the eye closes the shape
    // itself and the tree does not read as a cut-out.
    for (let i = 0; i < crown.length; i++) {
      if (i % 3 === 2) continue;
      inkLine(x, [crown[i], crown[(i + 1) % crown.length]], rnd, 1.5, 0.14);
    }
    // A few leaf edges caught in ink just outside the mass, so it frays.
    for (let k = 0; k < 14; k++) {
      const a2 = rnd() * Math.PI * 2;
      const rr = spread * 0.5 * (0.92 + rnd() * 0.22);
      const px2 = tx + Math.cos(a2) * rr;
      const py2 = cyc + Math.sin(a2) * ryc * (0.92 + rnd() * 0.22);
      inkLine(x, [[px2, py2], [px2 + (rnd() - 0.5) * 12, py2 + (rnd() - 0.5) * 9]], rnd, 1.0, 0.24);
    }

    shadow(tx, base, spread * 0.55);
  };

  // A clipped box hedge — a long low mass to walk behind.
  const hedge = (x0: number, x1: number, base: number, h: number) => {
    const top: [number, number][] = [];
    for (let i = 0; i <= 14; i++) {
      const px = x0 + ((x1 - x0) * i) / 14;
      top.push([px, base - h + Math.sin(i * 1.3) * 5 + rnd() * 4]);
    }
    wash(x, [...top, [x1, base], [x0, base]], EARTH.TERRE_VERTE, 0.3, rnd, 5);
    inkLine(x, top, rnd, 1.3, 0.28);
    shadow((x0 + x1) / 2, base, (x1 - x0) * 0.42);
  };

  // Stacked timber for the north wing — low, so it never blocks the house.
  const timber = (cx: number, base: number, w: number) => {
    for (let r = 0; r < 4; r++) {
      const y = base - 9 - r * 11;
      const jitter = (rnd() - 0.5) * 7;
      wash(x, [[cx - w / 2 + jitter, y], [cx + w / 2 + jitter, y - 2],
               [cx + w / 2 + jitter, y + 9], [cx - w / 2 + jitter, y + 11]],
        EARTH.BISTRE, 0.42, rnd, 3);
      inkLine(x, [[cx - w / 2 + jitter, y], [cx + w / 2 + jitter, y - 2]], rnd, 1.2, 0.12);
    }
    shadow(cx, base, w * 0.6);
  };

  // A two-wheeled farm cart, shafts down.
  const cart = (cx: number, base: number, w: number) => {
    const bodyY = base - w * 0.44;
    wash(x, [[cx - w / 2, bodyY], [cx + w / 2, bodyY - 4], [cx + w / 2, bodyY + w * 0.26],
             [cx - w / 2, bodyY + w * 0.3]], EARTH.RAW_UMBER, 0.5, rnd, 4);
    inkLine(x, [[cx - w / 2, bodyY], [cx + w / 2, bodyY - 4], [cx + w / 2, bodyY + w * 0.26],
                [cx - w / 2, bodyY + w * 0.3], [cx - w / 2, bodyY]], rnd, 1.6, 0.1);
    inkLine(x, [[cx - w / 2, bodyY + 6], [cx - w * 1.05, base - 6]], rnd, 1.8, 0.06);
    const wr = w * 0.24;
    const wy = base - wr;
    x.strokeStyle = INK.SETTLED;
    x.lineWidth = 1.8;
    x.globalAlpha = 0.85;
    x.beginPath();
    x.arc(cx + w * 0.1, wy, wr, 0, Math.PI * 2);
    x.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      x.beginPath();
      x.moveTo(cx + w * 0.1, wy);
      x.lineTo(cx + w * 0.1 + Math.cos(a) * wr, wy + Math.sin(a) * wr);
      x.stroke();
    }
    x.globalAlpha = 1;
    shadow(cx, base, w * 0.6);
  };

  /**
   * The chariot: a light enclosed four-wheeled carriage, packed for
   * Philadelphia, with the trunks already on and a pair in the traces. It is
   * the object the whole act points at, and until now it was an interactable
   * with nothing drawn under it.
   */
  const chariot = (cx: number, b: number, s2: number) => {
    const S = (v: number) => v * s2;

    // Wheels first, as the frame everything else hangs from. A chariot's rear
    // wheels are nearly twice the front, and the body is slung on braces above
    // both axles — you can see daylight under it. Drawing it as a box sitting on
    // four circles is what makes a carriage read as a delivery van.
    const rwR = S(34), fwR = S(21);
    const rwX = cx + S(42), rwY = b - rwR;
    const fwX = cx - S(62), fwY = b - fwR;

    const wheel = (wx: number, wy: number, r: number, spokes: number) => {
      x.strokeStyle = INK.SETTLED;
      x.lineCap = 'round';
      x.globalAlpha = 0.55;
      x.lineWidth = S(1.4);
      for (let i = 0; i < spokes; i++) {
        const ang = (i / spokes) * Math.PI * 2 + 0.2;
        x.beginPath();
        x.moveTo(wx + Math.cos(ang) * r * 0.14, wy + Math.sin(ang) * r * 0.14);
        x.lineTo(wx + Math.cos(ang) * r * 0.94, wy + Math.sin(ang) * r * 0.94);
        x.stroke();
      }
      x.globalAlpha = 0.9;
      x.lineWidth = S(2.4);
      x.beginPath();
      x.arc(wx, wy, r, 0, Math.PI * 2);
      x.stroke();
      x.lineWidth = S(3.2);
      x.beginPath();
      x.arc(wx, wy, r * 0.13, 0, Math.PI * 2); // the hub
      x.stroke();
      x.globalAlpha = 1;
    };
    wheel(fwX, fwY, fwR, 10);
    wheel(rwX, rwY, rwR, 12);

    // Perch and axle standards: the timber that ties the two axles together and
    // carries the body clear of them.
    inkLine(x, [[fwX, fwY - S(2)], [cx - S(16), b - S(50)], [rwX, rwY - S(4)]], rnd, S(2.6), 0.02);
    inkLine(x, [[fwX, fwY], [fwX + S(4), fwY - S(22)]], rnd, S(2.0), 0.05);
    inkLine(x, [[rwX, rwY], [rwX - S(4), rwY - S(26)]], rnd, S(2.2), 0.05);

    // The body. A coach body is a boat, not a crate: it swells below the
    // waistline and tucks under, the front rakes back, and the roof cambers.
    const bY = b - S(64); // underside of the body, clear above both axles
    const tY = b - S(132); // roof
    const shell: [number, number][] = [
      [cx - S(30), tY + S(2)],
      [cx + S(4), tY - S(3)],
      [cx + S(36), tY + S(3)],
      [cx + S(46), tY + S(22)],
      [cx + S(50), tY + S(44)],
      [cx + S(44), bY - S(6)],
      [cx + S(28), bY],
      [cx - S(14), bY + S(1)],
      [cx - S(32), bY - S(10)],
      [cx - S(38), tY + S(44)],
      [cx - S(36), tY + S(20)],
    ];
    solid(x, shell, '#5A4B3C', rnd, EARTH.BISTRE, 0.22);
    inkLine(x, [...shell, shell[0]], rnd, S(2.1), 0.04);

    // Waistline, with the panel below it darker — the standard two-tone body,
    // and the thing that most makes it read as a coach at a glance.
    const waist = tY + S(46);
    solid(x, [[cx - S(37), waist], [cx + S(49), waist], [cx + S(44), bY - S(6)],
              [cx + S(28), bY], [cx - S(14), bY + S(1)], [cx - S(32), bY - S(10)]],
      '#3E3327', rnd);
    inkLine(x, [[cx - S(37), waist], [cx + S(49), waist]], rnd, S(1.8), 0.06);

    // A single arched window with the light in it. One pale note on a dark mass
    // is enough; two would turn it into a bus.
    const gx0 = cx - S(22);
    const gx1 = cx + S(22);
    const glass: [number, number][] = [
      [gx0, tY + S(30)], [gx0 + S(6), tY + S(15)], [gx1 - S(6), tY + S(15)],
      [gx1, tY + S(30)], [gx1, waist - S(5)], [gx0, waist - S(5)],
    ];
    solid(x, glass, '#9AA6A4', rnd, EARTH.WET_STONE, 0.35);
    inkLine(x, [...glass, glass[0]], rnd, S(1.3), 0.12);
    // Door edge, running from the waist to the bottom of the body.
    inkLine(x, [[cx + S(24), tY + S(20)], [cx + S(26), bY - S(4)]], rnd, S(1.2), 0.16);

    // Leather braces: the body hangs from these, and they are why the whole
    // thing sits high. Two short diagonals do the entire job.
    inkLine(x, [[cx - S(34), bY - S(8)], [fwX + S(4), fwY - S(20)]], rnd, S(2.4), 0.03);
    inkLine(x, [[cx + S(44), bY - S(8)], [rwX - S(4), rwY - S(24)]], rnd, S(2.6), 0.03);

    // Coachman's box, forward and a little lower than the roof.
    solid(x, [[cx - S(60), tY + S(30)], [cx - S(34), tY + S(26)],
              [cx - S(34), tY + S(48)], [cx - S(58), tY + S(50)]], '#4C4032', rnd);
    inkLine(x, [[cx - S(60), tY + S(30)], [cx - S(34), tY + S(26)],
                [cx - S(34), tY + S(48)], [cx - S(58), tY + S(50)],
                [cx - S(60), tY + S(30)]], rnd, S(1.6), 0.1);
    inkLine(x, [[cx - S(58), tY + S(50)], [cx - S(54), bY - S(14)]], rnd, S(1.5), 0.1);

    // Trunks on the rack behind — the reason it reads as packed rather than
    // parked, and the only part of the drawing that is doing narrative work.
    const trunk = (tx: number, ty: number, tw: number, th: number) => {
      const pts: [number, number][] = [[tx, ty], [tx + tw, ty - S(3)],
        [tx + tw, ty + th - S(3)], [tx, ty + th]];
      solid(x, pts, '#6E5A3E', rnd, EARTH.RAW_UMBER, 0.26);
      inkLine(x, [...pts, pts[0]], rnd, S(1.5), 0.1);
      inkLine(x, [[tx + tw * 0.35, ty - S(1)], [tx + tw * 0.35, ty + th - S(1)]], rnd, S(1.2), 0.08);
      inkLine(x, [[tx, ty + th * 0.42], [tx + tw, ty + th * 0.42 - S(3)]], rnd, S(1.1), 0.2);
    };
    trunk(cx + S(48), tY + S(34), S(40), S(34));
    trunk(cx + S(54), tY + S(4), S(30), S(28));
    inkLine(x, [[cx + S(46), tY + S(66)], [cx + S(92), tY + S(60)]], rnd, S(2.0), 0.06);

    /*
     * A pair in the traces, in profile and facing out of frame. Drawn as a
     * curved barrel with a neck that rises off the shoulder and a head at the
     * end of it — a box with sticks under it reads as furniture, and this is the
     * one animal in the scene close enough for that to show.
     */
    const horse = (hx: number, hb: number, hs: number, coat: string) => {
      const H = (v: number) => v * hs;
      shadow(hx, hb, H(48));

      // Legs first, so the barrel closes over their tops. Each has one joint —
      // a straight line from belly to ground is the single thing that makes a
      // drawn horse look like a sawhorse.
      const leg = (lx: number, knee: number, foot: number, top: number) => {
        inkLine(x, [[hx + H(lx), hb - H(top)], [hx + H(lx + knee), hb - H(24)],
                    [hx + H(lx + foot), hb]], rnd, H(2.6), 0.02);
      };
      leg(-24, 4, 2, 50);
      leg(20, 4, -2, 54);
      leg(-32, -3, -8, 52);
      leg(28, 6, 9, 56);

      // Barrel: withers, a dip along the back, croup, and a belly that curves.
      const barrel: [number, number][] = [
        [hx - H(30), hb - H(84)], [hx + H(4), hb - H(80)], [hx + H(30), hb - H(86)],
        [hx + H(42), hb - H(66)], [hx + H(32), hb - H(46)], [hx - H(4), hb - H(42)],
        [hx - H(28), hb - H(48)], [hx - H(40), hb - H(58)], [hx - H(42), hb - H(74)],
      ];
      solid(x, barrel, coat, rnd, EARTH.BISTRE, 0.24);
      inkLine(x, [...barrel, barrel[0]], rnd, H(1.8), 0.08);

      // Neck: a broad wedge off the shoulder, crest above and throat below.
      const neck: [number, number][] = [
        [hx - H(26), hb - H(86)], [hx - H(62), hb - H(126)], [hx - H(52), hb - H(104)],
        [hx - H(38), hb - H(70)],
      ];
      solid(x, neck, coat, rnd);
      inkLine(x, [...neck, neck[0]], rnd, H(1.7), 0.08);

      // Head: hung forward and down off the poll, not continuing the neck's
      // line. That angle is the whole silhouette — without it the neck reads as
      // a horn.
      const head: [number, number][] = [
        [hx - H(60), hb - H(128)], [hx - H(84), hb - H(118)], [hx - H(92), hb - H(106)],
        [hx - H(82), hb - H(101)], [hx - H(54), hb - H(106)],
      ];
      solid(x, head, coat, rnd, EARTH.BISTRE, 0.2);
      inkLine(x, [...head, head[0]], rnd, H(1.6), 0.06);
      inkLine(x, [[hx - H(62), hb - H(128)], [hx - H(58), hb - H(138)]], rnd, H(1.5), 0.04); // ear
      inkLine(x, [[hx - H(60), hb - H(126)], [hx - H(40), hb - H(96)], [hx - H(28), hb - H(84)]],
        rnd, H(1.6), 0.16); // mane

      // Tail, and the trace running back to the carriage.
      inkLine(x, [[hx + H(40), hb - H(82)], [hx + H(54), hb - H(58)], [hx + H(48), hb - H(30)]],
        rnd, H(2.4), 0.06);
      inkLine(x, [[hx + H(40), hb - H(62)], [hx + H(104), hb - H(58)]], rnd, H(1.6), 0.12);
    };
    // The off horse first and paler, so the near one reads in front of it
    // rather than the two merging into a single brown mass.
    horse(cx - S(178), b - S(9), s2 * 0.84, '#8C7659');
    horse(cx - S(140), b + S(3), s2 * 0.92, '#5E4B3A');

    shadow(cx + S(6), b, S(78));
  };

  const base = hy + 196; // the near midground stands at roughly z = 0.40

  tree(W * 0.10, base + 34, 250, 168);
  hedge(W * 0.185, W * 0.335, base + 12, 54);
  timber(W * 0.475, base + 4, 96);
  cart(W * 0.60, base + 16, 108);
  chariot(W * 0.815, base + 26, 1.0);
  tree(W * 0.905, base + 40, 268, 182);

  // A well, and a barrow tipped against it.
  const wx = W * 0.585;
  wash(x, [[wx - 34, base + 8], [wx + 34, base + 4], [wx + 30, base - 40], [wx - 30, base - 44]],
    EARTH.WET_STONE, 0.42, rnd, 4);
  inkLine(x, [[wx - 30, base - 44], [wx + 30, base - 40], [wx + 34, base + 8]], rnd, 1.8, 0.1);
  inkLine(x, [[wx - 26, base - 46], [wx - 20, base - 96], [wx + 22, base - 96], [wx + 28, base - 42]],
    rnd, 1.6, 0.12);
  inkLine(x, [[wx - 20, base - 96], [wx + 22, base - 96]], rnd, 2.0, 0.05);
  inkLine(x, [[wx + 2, base - 94], [wx + 2, base - 58]], rnd, 1.0, 0.25);

  // Paling posts, to break the middle without hiding it.
  for (const px of [W * 0.385, W * 0.415, W * 0.66, W * 0.64]) {
    inkLine(x, [[px, base + 6], [px + (rnd() - 0.5) * 4, base - 34]], rnd, 2.2, 0.04);
  }
  groundLitter(x, rnd, base - 20, base + 90, 90, 0.9);
  return c;
}

/**
 * L3 for the Vernon set — the far midground.
 *
 * A second occlusion band between the house and the near midground. Without it
 * everything mid-scene sits at one depth and the ground reads as two planes
 * with a gap; with it the lawn has a middle.
 */
export function layerFarMidground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(59);
  const hy = H * HORIZON;
  const base = hy + 96;

  // Paddock fence, in runs rather than one rule across the plate — an unbroken
  // line at this distance reads as a drawn border, not as a fence.
  const run = (x0: number, x1: number) => {
    const n = Math.max(3, Math.round(((x1 - x0) / W) * 22));
    const rail: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const px = x0 + ((x1 - x0) * i) / n;
      rail.push([px, base - 20 + Math.sin(i * 0.7) * 3 + rnd() * 2]);
    }
    inkLine(x, rail, rnd, 1.4, 0.2);
    inkLine(x, rail.map(([px, py]) => [px, py + 15] as [number, number]), rnd, 1.3, 0.26);
    for (let i = 0; i <= n; i += 2) {
      const px = x0 + ((x1 - x0) * i) / n + rnd() * 5;
      inkLine(x, [[px, base + 14], [px + (rnd() - 0.5) * 3, base - 32]], rnd, 1.7, 0.08);
    }
  };
  run(0, W * 0.235);
  run(W * 0.33, W * 0.60);   // gate gap before this run
  run(W * 0.665, W);

  // Two small outbuildings, low and pale with distance.
  const shed = (sx: number, sw: number, sh: number) => {
    wash(x, [[sx, base - sh], [sx + sw, base - sh], [sx + sw, base], [sx, base]],
      PAPER.SMOKED, 0.5, rnd, 4);
    inkLine(x, [[sx, base - sh], [sx + sw, base - sh], [sx + sw, base], [sx, base], [sx, base - sh]],
      rnd, 1.4, 0.1);
    wash(x, [[sx - 7, base - sh], [sx + sw / 2, base - sh - 20], [sx + sw + 7, base - sh]],
      EARTH.RAW_UMBER, 0.4, rnd, 3);
  };
  shed(W * 0.155, 92, 54);
  shed(W * 0.80, 78, 46);

  // A horse in the paddock, small enough to be a shape.
  const nx = W * 0.30;
  wash(x, [[nx - 34, base - 30], [nx + 30, base - 34], [nx + 32, base - 12], [nx - 32, base - 8]],
    EARTH.BISTRE, 0.5, rnd, 4);
  wash(x, [[nx + 26, base - 34], [nx + 44, base - 52], [nx + 52, base - 44], [nx + 34, base - 24]],
    EARTH.BISTRE, 0.5, rnd, 3);
  for (const lx of [nx - 24, nx - 10, nx + 10, nx + 22]) {
    inkLine(x, [[lx, base - 12], [lx + (rnd() - 0.5) * 5, base + 6]], rnd, 1.6, 0.1);
  }

  groundLitter(x, rnd, base - 6, base + 60, 40, 0.55);
  return haze(c, 0.20);
}

/**
 * L4 — foreground. A post-and-rail fence running along the very bottom of the
 * frame, so the player walks behind it and the eye gets a depth cue at the
 * near edge without the fence occluding faces.
 */
export function layerForeground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(67);
  const y = H * 0.94;

  /*
   * Rough grass and a little colour in the strip in front of the fence.
   *
   * This band was bare olive, which was survivable until there were insects in
   * it — a butterfly crossing an empty field reads as a sprite, and the same
   * butterfly crossing grass reads as being somewhere. Everything here is kept
   * short and low in the frame: this plate draws over the figures, so anything
   * tall enough to reach a walking man's chest would cut him in half.
   */
  for (let i = 0; i < 150; i++) {
    const px = rnd() * W;
    const py = H * 0.70 + rnd() * H * 0.30;
    const depth = (py - H * 0.70) / (H * 0.30); // taller toward the bottom edge
    const th = (7 + rnd() * 13) * (0.5 + depth);
    const tone = rnd() < 0.35 ? EARTH.TERRE_VERTE : EARTH.RAW_UMBER;
    x.strokeStyle = tone;
    x.lineCap = 'round';
    x.lineWidth = 1.1 + depth * 0.9;
    x.globalAlpha = 0.28 + rnd() * 0.24;
    for (let bl = 0; bl < 3; bl++) {
      const lean = (bl - 1) * (2 + rnd() * 4);
      x.beginPath();
      x.moveTo(px, py);
      x.quadraticCurveTo(px + lean * 0.4, py - th * 0.6, px + lean, py - th);
      x.stroke();
    }
    x.globalAlpha = 1;
  }

  // A handful of wildflowers. Four notes of colour in a frame this olive is
  // more than it sounds like.
  for (let i = 0; i < 22; i++) {
    const px = rnd() * W;
    const py = H * 0.74 + rnd() * H * 0.24;
    const head = ['#C7A96B', '#B8846E', '#D9CDA4', '#9FA98C'][Math.floor(rnd() * 4)];
    x.strokeStyle = EARTH.TERRE_VERTE;
    x.globalAlpha = 0.4;
    x.lineWidth = 1.1;
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + (rnd() - 0.5) * 4, py - 12 - rnd() * 8);
    x.stroke();
    x.globalAlpha = 0.85;
    x.fillStyle = head;
    x.beginPath();
    x.arc(px + (rnd() - 0.5) * 4, py - 14 - rnd() * 8, 1.8 + rnd() * 1.6, 0, Math.PI * 2);
    x.fill();
    x.globalAlpha = 1;
  }

  for (let i = 0; i <= 11; i++) {
    const px = i * (W / 11) + rnd() * 10;
    inkLine(x, [[px, y - 44], [px + (rnd() - 0.5) * 8, H]], rnd, 4.2, 0.0);
    wash(x, [[px - 5, y - 44], [px + 5, y - 44], [px + 6, H], [px - 6, H]], EARTH.RAW_UMBER, 0.4, rnd, 3);
  }
  for (const off of [0, 34]) {
    const rail: [number, number][] = [];
    for (let i = 0; i <= 30; i++) rail.push([(i / 30) * W, y - 26 + off + Math.sin(i * 0.4) * 3]);
    inkLine(x, rail, rnd, 3.4, 0.04);
  }
  // Weeds at the base of the posts.
  for (let i = 0; i < 70; i++) {
    const px = rnd() * W;
    const h = 14 + rnd() * 26;
    inkLine(x, [[px, H], [px + (rnd() - 0.5) * 10, H - h]], rnd, 1.1, 0.1);
  }
  return c;
}

/**
 * A character cutout.
 *
 * Rebuilt around the period silhouette rather than a coat-shaped blob, because
 * the silhouette is the whole read at this size: a tricorne, a queue, a coat
 * with turned-back skirts over a waistcoat, breeches to the knee, and stockings.
 * Get those five shapes right and a figure eighty pixels tall is unmistakably
 * of the 1770s; get them wrong and no amount of detail rescues it.
 *
 * `phase` walks the legs and arms around a cycle, 0..1. Pass -1 to stand.
 */
export interface LookOpts {
  hat?: 'tricorne' | 'round' | 'none';
  build?: number;
  /**
   * A gown rather than a coat: fitted bodice, full skirt to the ground, sleeves
   * to the elbow. Every figure in the game wore a man's coat until now, which
   * made the one woman in Act 1 a man in a brown coat.
   */
  gown?: boolean;
  /** Skin. Defaulted, but never assumed — see William Lee below. */
  skin?: string;
  /** Hair colour, if it should not be picked from the seed. */
  hair?: string;
  /** Facing colour for cuffs and lapels — the whole point of a livery. */
  facings?: string;
  /** A white linen cap, worn indoors and out by most women, most days. */
  cap?: boolean;
}

export function characterCutout(
  coat: string,
  seed: number,
  height = 320,
  phase = -1,
  opts: LookOpts = {},
): HTMLCanvasElement {
  const H1 = height;
  const w = Math.round(H1 * 0.46);
  const { c, x } = surface(w, H1);
  const rnd = mulberry(seed);
  const cx = w / 2;
  const build = opts.build ?? 1;
  const hat = opts.hat ?? 'tricorne';
  const gown = opts.gown ?? false;
  const skin = opts.skin ?? '#E0D3B8';
  const facings = opts.facings;

  const walking = phase >= 0;
  const a = phase * Math.PI * 2;
  const swing = walking ? Math.sin(a) * w * 0.30 : 0;
  const liftL = walking ? Math.max(0, -Math.sin(a)) * H1 * 0.045 : 0;
  const liftR = walking ? Math.max(0, Math.sin(a)) * H1 * 0.045 : 0;
  const lean = walking ? -Math.sin(a) * w * 0.045 : 0;

  /*
   * Vertical landmarks, as fractions of height.
   *
   * Same correction as the player's: a man is about seven and a half heads tall
   * and his legs are half of him, and a coat skirt stops just above the knee.
   * These sat at a 0.715 hem with the head at a tenth of the height, which read
   * as a bell-shaped tunic with a small head on top of it.
   */
  const yHat = 0.030;
  const yBrim = 0.078;
  const yChin = 0.162;
  const ySh = 0.202;
  const yWaist = 0.390;
  const ySkirt = 0.490;
  const yHem = 0.630;
  const yKnee = 0.700;
  const yAnkle = 0.950;

  const shW = w * 0.27 * build;
  const hipW = w * 0.21 * build;

  // Cast shadow first, so the figure sits on the ground.
  wash(x, [[cx - w * 0.32, H1 * 0.986], [cx + w * 0.28, H1 * 0.978],
           [cx + w * 0.34, H1], [cx - w * 0.38, H1]], INK.SETTLED, 0.28, rnd, 4);

  /** One leg: stocking, breeches above the knee, and a buckled shoe. */
  const leg = (hipX: number, footDx: number, lift: number) => {
    const hy = H1 * ySkirt;
    const ky = H1 * yKnee - lift * 0.5;
    const fy = H1 * yAnkle - lift;
    const kx = hipX + footDx * 0.55;
    const fx = hipX + footDx;
    // Breeches to the knee.
    solid(x, [[hipX - w * 0.075, hy], [hipX + w * 0.075, hy],
              [kx + w * 0.055, ky], [kx - w * 0.06, ky]], '#8E7C63', rnd, EARTH.RAW_UMBER, 0.26);
    // Stocking below it, lighter.
    solid(x, [[kx - w * 0.05, ky], [kx + w * 0.048, ky],
              [fx + w * 0.042, fy], [fx - w * 0.045, fy]], PAPER.SMOKED, rnd);
    inkLine(x, [[hipX - w * 0.07, hy], [kx - w * 0.055, ky], [fx - w * 0.042, fy]], rnd, 1.2, 0.22);
    inkLine(x, [[hipX + w * 0.07, hy], [kx + w * 0.05, ky], [fx + w * 0.04, fy]], rnd, 1.2, 0.22);
    inkLine(x, [[kx - w * 0.055, ky], [kx + w * 0.05, ky]], rnd, 1.0, 0.3); // knee band
    // Shoe.
    solid(x, [[fx - w * 0.055, fy], [fx + w * 0.05, fy],
              [fx + w * 0.085, H1 * 0.995], [fx - w * 0.07, H1 * 0.995]], '#2E2419', rnd);
  };
  if (!gown) {
    leg(cx - w * 0.085, swing, liftL);
    leg(cx + w * 0.085, -swing, liftR);
  } else {
    // A shoe toe under the hem, and nothing else. The skirt does the walking.
    for (const s2 of [-1, 1]) {
      const fx2 = cx + s2 * w * 0.055 + (walking ? Math.sin(a) * s2 * w * 0.03 : 0);
      solid(x, [[fx2 - w * 0.05, H1 * 0.958], [fx2 + w * 0.045, H1 * 0.958],
                [fx2 + w * 0.06, H1 * 0.995], [fx2 - w * 0.065, H1 * 0.995]], '#2E2419', rnd);
    }
  }

  /** One arm, swinging against the legs, with a turned-back cuff. */
  const arm = (side: number, dx: number) => {
    const sx = cx + side * shW * 1.04 + lean * 0.6;
    const sy = H1 * (ySh + 0.02);
    const ex = sx + side * w * 0.06 + dx;
    const ey = H1 * (yWaist + 0.075);
    solid(x, [[sx - w * 0.055, sy], [sx + w * 0.055, sy],
              [ex + w * 0.05, ey], [ex - w * 0.05, ey]], coat, rnd, INK.SETTLED, 0.22);
    inkLine(x, [[sx + side * w * 0.055, sy], [ex + side * w * 0.05, ey]], rnd, 1.4, 0.2);
    // Cuff.
    inkLine(x, [[ex - w * 0.05, ey - H1 * 0.022], [ex + w * 0.05, ey - H1 * 0.022]], rnd, 1.3, 0.15);
    solid(x, [[ex - w * 0.05, ey - H1 * 0.022], [ex + w * 0.05, ey - H1 * 0.022],
              [ex + w * 0.048, ey], [ex - w * 0.048, ey]], facings ?? PAPER.SMOKED, rnd);
    // A hand out of the cuff. Two marks, but their absence is what made every
    // figure read as a coat on a stand rather than as somebody wearing one.
    solid(x, [[ex - w * 0.036, ey], [ex + w * 0.036, ey],
              [ex + w * 0.030, ey + H1 * 0.040], [ex - w * 0.030, ey + H1 * 0.040]],
      skin, rnd, EARTH.RAW_UMBER, 0.22);
    inkLine(x, [[ex - w * 0.036, ey + H1 * 0.006], [ex + w * 0.036, ey + H1 * 0.006]],
      rnd, 0.9, 0.34);
  };

  // The coat: shoulders in, waist nipped, skirts turned back and flaring.
  if (gown) {
    /*
     * A gown, not a coat in a different colour.
     *
     * Fitted bodice coming to a point at the waist, then a skirt that falls
     * full and unbroken to the floor — the silhouette is a triangle standing on
     * a wide base, and it is nothing like the man's coat that every figure in
     * this game wore until now. Sleeves stop at the elbow with a ruffle, and a
     * kerchief crosses the neck, which is what married women of her rank wore
     * every day and not only for a portrait.
     */
    const yBod = 0.470;
    const skirt: [number, number][] = [
      [cx - shW * 0.86, H1 * (ySh + 0.03)],
      [cx - shW * 0.78, H1 * yBod],
      [cx - hipW * 2.5, H1 * 0.72],
      [cx - hipW * 2.9, H1 * 0.965],
      [cx + hipW * 2.9, H1 * 0.965],
      [cx + hipW * 2.5, H1 * 0.72],
      [cx + shW * 0.78, H1 * yBod],
      [cx + shW * 0.86, H1 * (ySh + 0.03)],
    ];
    solid(x, skirt, coat, rnd, INK.SETTLED, 0.08);
    inkLine(x, [...skirt, skirt[0]], rnd, 1.8, 0.1);
    // Long folds down the skirt, which is where all its weight reads.
    for (const f of [-0.68, -0.3, 0.1, 0.5, 0.82]) {
      inkLine(x, [[cx + shW * f * 0.7, H1 * (yBod + 0.02)],
                  [cx + hipW * 2.7 * f, H1 * 0.955]], rnd, 1.0, 0.34);
    }
    // Bodice, pointed at the waist, a shade darker than the skirt.
    const bod: [number, number][] = [
      [cx - shW * 0.84, H1 * (ySh + 0.02)], [cx + shW * 0.84, H1 * (ySh + 0.02)],
      [cx + shW * 0.72, H1 * (yBod - 0.02)], [cx, H1 * (yBod + 0.03)],
      [cx - shW * 0.72, H1 * (yBod - 0.02)],
    ];
    solid(x, bod, coat, rnd, INK.SETTLED, 0.2);
    inkLine(x, [...bod, bod[0]], rnd, 1.5, 0.12);
    // Sleeves to the elbow, with the shift ruffle below them.
    for (const s2 of [-1, 1]) {
      const sx2 = cx + s2 * shW * 0.86;
      solid(x, [[sx2 - w * 0.03, H1 * (ySh + 0.02)], [sx2 + s2 * w * 0.07, H1 * (ySh + 0.05)],
                [sx2 + s2 * w * 0.06, H1 * 0.40], [sx2 - w * 0.045, H1 * 0.37]],
        coat, rnd, INK.SETTLED, 0.14);
      solid(x, [[sx2 - w * 0.05, H1 * 0.395], [sx2 + s2 * w * 0.075, H1 * 0.41],
                [sx2 + s2 * w * 0.065, H1 * 0.455], [sx2 - w * 0.045, H1 * 0.44]],
        PAPER.BRIGHT, rnd, EARTH.SHADOW_SLATE, 0.1);
      inkLine(x, [[sx2 - w * 0.05, H1 * 0.395], [sx2 + s2 * w * 0.075, H1 * 0.41]], rnd, 1.2, 0.14);
      // Hand below the ruffle.
      solid(x, [[sx2 - w * 0.028, H1 * 0.452], [sx2 + s2 * w * 0.05, H1 * 0.462],
                [sx2 + s2 * w * 0.042, H1 * 0.505], [sx2 - w * 0.024, H1 * 0.496]],
        skin, rnd, EARTH.RAW_UMBER, 0.2);
    }
    // The kerchief, crossed at the breast.
    const ker: [number, number][] = [
      [cx - shW * 0.86, H1 * (ySh + 0.015)], [cx, H1 * (ySh - 0.005)],
      [cx + shW * 0.86, H1 * (ySh + 0.015)], [cx + shW * 0.4, H1 * 0.33],
      [cx, H1 * 0.375], [cx - shW * 0.4, H1 * 0.33],
    ];
    solid(x, ker, PAPER.BRIGHT, rnd, EARTH.SHADOW_SLATE, 0.1);
    inkLine(x, [...ker, ker[0]], rnd, 1.3, 0.14);
    inkLine(x, [[cx - shW * 0.3, H1 * 0.26], [cx, H1 * 0.372]], rnd, 1.1, 0.24);
    inkLine(x, [[cx + shW * 0.3, H1 * 0.26], [cx, H1 * 0.372]], rnd, 1.1, 0.24);
  }

  const coatPts: [number, number][] = [
    [cx - shW + lean, H1 * ySh],
    [cx - shW * 0.92 + lean, H1 * yWaist],
    [cx - hipW * 1.28, H1 * ySkirt],
    [cx - hipW * 1.42, H1 * yHem],
    [cx + hipW * 1.42, H1 * yHem],
    [cx + hipW * 1.28, H1 * ySkirt],
    [cx + shW * 0.92 + lean, H1 * yWaist],
    [cx + shW + lean, H1 * ySh],
  ];
  if (!gown) solid(x, coatPts, coat, rnd, INK.SETTLED, 0.07);

  // Coat outline, drawn as separate strokes so the line can break.
  if (!gown) inkLine(x, coatPts.slice(0, 5), rnd, 1.7, 0.12);
  if (!gown) inkLine(x, coatPts.slice(4).concat([coatPts[0]]), rnd, 1.7, 0.12);

  /*
   * Waistcoat, in the gap where the coat hangs open.
   *
   * It used to be painted underneath a translucent coat and read through it.
   * Now that the coat is opaque it has to be painted on top and only as wide as
   * the opening, which is what it should have been: the waistcoat is a strip
   * you see between the coat fronts, not a garment showing through one.
   */
  solid(x, [[cx - w * 0.062 + lean, H1 * (ySh + 0.02)], [cx + w * 0.062 + lean, H1 * (ySh + 0.02)],
            [cx + w * 0.056, H1 * (ySkirt + 0.07)], [cx - w * 0.056, H1 * (ySkirt + 0.07)]],
    '#CFC3A6', rnd, EARTH.YELLOW_OCHRE, 0.22);
  if (facings && !gown) {
    // Turned-back lapels in the facing colour. A livery is defined by them —
    // white faced scarlet is not a white coat, it is a servant of that house.
    for (const s2 of [-1, 1]) {
      const lap: [number, number][] = [
        [cx + s2 * w * 0.058 + lean, H1 * (ySh + 0.01)],
        [cx + s2 * w * 0.16 + lean, H1 * (ySh + 0.004)],
        [cx + s2 * w * 0.14, H1 * (yWaist - 0.01)],
        [cx + s2 * w * 0.05, H1 * (yWaist - 0.03)],
      ];
      solid(x, lap, facings, rnd, INK.SETTLED, s2 > 0 ? 0.18 : 0.06);
      inkLine(x, [...lap, lap[0]], rnd, 1.3, 0.14);
    }
  }

  // The open front, and a row of buttons down one side of it.
  inkLine(x, [[cx - w * 0.11 + lean, H1 * (ySh + 0.02)], [cx - w * 0.095, H1 * ySkirt],
              [cx - w * 0.12, H1 * yHem]], rnd, 1.3, 0.2);
  inkLine(x, [[cx + w * 0.11 + lean, H1 * (ySh + 0.02)], [cx + w * 0.095, H1 * ySkirt],
              [cx + w * 0.12, H1 * yHem]], rnd, 1.3, 0.2);
  x.fillStyle = INK.SETTLED;
  for (let i = 0; i < (gown ? 0 : 6); i++) {
    const t = i / 6;
    x.globalAlpha = 0.5 + rnd() * 0.4;
    x.beginPath();
    x.arc(cx + w * 0.105 + lean * (1 - t), H1 * (ySh + 0.045 + t * 0.33), w * 0.017, 0, 7);
    x.fill();
  }
  x.globalAlpha = 1;
  /*
   * Drape.
   *
   * Broadcloth falls in a few long folds from the waist, not in many small
   * ones. Three or four lines that start at the waist and open toward the hem
   * do more to make a coat read as cloth than any amount of shading, because
   * they are what the eye actually uses to tell cloth from card.
   */
  for (const f of gown ? [] : [-0.62, -0.2, 0.28, 0.66]) {
    const topX = cx + shW * f * 0.8 + lean;
    const botX = cx + hipW * 1.34 * f;
    inkLine(x, [[topX, H1 * (yWaist + 0.02)], [(topX + botX) / 2, H1 * (ySkirt + 0.04)],
                [botX, H1 * (yHem - 0.01)]], rnd, 1.0, 0.36);
  }

  // The hem, and the turned-back skirt corners.
  if (!gown) {
    inkLine(x, [[cx - hipW * 1.42, H1 * yHem], [cx, H1 * (yHem + 0.012)],
                [cx + hipW * 1.42, H1 * yHem]], rnd, 1.5, 0.18);
  }

  // Arms last of the body, because they hang in front of the coat. Drawn before
  // it — as they were while everything was translucent — an opaque coat swallows
  // them whole. They also sit a little wider than the shoulder and a shade
  // darker than the coat, or they disappear into its silhouette instead.
  if (!gown) {
    arm(-1, -swing * 0.5);
    arm(1, swing * 0.5);
  }

  // Neck stock, white and tight.
  solid(x, [[cx - w * 0.075 + lean, H1 * yChin], [cx + w * 0.075 + lean, H1 * yChin],
            [cx + w * 0.085 + lean, H1 * ySh], [cx - w * 0.085 + lean, H1 * ySh]],
    PAPER.BRIGHT, rnd);

  // Head, and the queue tied at the back of it.
  const hx = cx + lean;
  solid(x, [[hx - w * 0.098, H1 * yBrim], [hx + w * 0.098, H1 * yBrim],
            [hx + w * 0.086, H1 * yChin], [hx - w * 0.086, H1 * yChin]],
    skin, rnd, EARTH.YELLOW_OCHRE, 0.2);
  inkLine(x, [[hx - w * 0.094, H1 * yBrim], [hx - w * 0.084, H1 * yChin]], rnd, 1.2, 0.3);
  inkLine(x, [[hx + w * 0.094, H1 * yBrim], [hx + w * 0.084, H1 * yChin]], rnd, 1.2, 0.3);

  /*
   * A face, in four marks.
   *
   * Brow, nose, mouth, ear. At this size that is the whole budget: a fifth mark
   * turns a person into a caricature and a sixth into a smudge. What they buy
   * is that the figure is looking at something, which a blank oval never is.
   */
  {
    const fy = (t: number) => H1 * (yBrim + (yChin - yBrim) * t);
    const gaze = (rnd() - 0.5) * w * 0.018; // not everyone faces dead front
    inkLine(x, [[hx - w * 0.044 + gaze, fy(0.30)], [hx - w * 0.014 + gaze, fy(0.27)]], rnd, 1.1, 0.2);
    inkLine(x, [[hx + w * 0.016 + gaze, fy(0.27)], [hx + w * 0.046 + gaze, fy(0.30)]], rnd, 1.1, 0.2);
    inkLine(x, [[hx + gaze, fy(0.34)], [hx + w * 0.008 + gaze, fy(0.60)]], rnd, 1.0, 0.24);
    inkLine(x, [[hx - w * 0.024 + gaze, fy(0.76)], [hx + w * 0.024 + gaze, fy(0.76)]], rnd, 1.1, 0.26);
    inkLine(x, [[hx - w * 0.088, fy(0.36)], [hx - w * 0.094, fy(0.58)]], rnd, 1.0, 0.4);
  }
  solid(x, [[hx + w * 0.06, H1 * (yBrim + 0.02)], [hx + w * 0.115, H1 * (yBrim + 0.045)],
            [hx + w * 0.10, H1 * (yChin + 0.03)], [hx + w * 0.05, H1 * yChin]],
    INK.FADED, rnd);

  if (opts.cap) {
    /*
     * A cap of white linen, gathered and ruffled at the edge.
     *
     * Married women wore one indoors and out, every day, and every likeness of
     * Martha Washington has her in one. It is the single mark that says who she
     * is at this size — more than the gown, which any woman in the frame would
     * wear.
     */
    const by = H1 * (yBrim + 0.006);
    const crown: [number, number][] = [
      [hx - w * 0.155, by + H1 * 0.008], [hx - w * 0.145, H1 * (yHat + 0.004)],
      [hx - w * 0.07, H1 * (yHat - 0.012)], [hx + w * 0.07, H1 * (yHat - 0.012)],
      [hx + w * 0.145, H1 * (yHat + 0.004)], [hx + w * 0.155, by + H1 * 0.008],
    ];
    solid(x, crown, PAPER.BRIGHT, rnd, EARTH.SHADOW_SLATE, 0.08);
    inkLine(x, [...crown, crown[0]], rnd, 1.4, 0.1);
    // The ruffle, as a run of small scallops along the front edge.
    for (let i = 0; i < 8; i++) {
      const rx = hx - w * 0.155 + (i * w * 0.31) / 7;
      inkLine(x, [[rx, by + H1 * 0.008], [rx + w * 0.022, by + H1 * 0.024],
                  [rx + w * 0.044, by + H1 * 0.008]], rnd, 1.1, 0.12);
    }
  } else if (hat === 'tricorne') {
    // Three cornered: a wide flat brim with the front peak and two rear points.
    const by = H1 * yBrim;
    const bw = w * 0.30;
    const brim: [number, number][] = [
      [hx - bw, by + H1 * 0.006],
      [hx - bw * 0.42, by - H1 * 0.016],
      [hx, by - H1 * 0.03],
      [hx + bw * 0.42, by - H1 * 0.016],
      [hx + bw, by + H1 * 0.006],
      [hx + bw * 0.5, by + H1 * 0.024],
      [hx - bw * 0.5, by + H1 * 0.024],
    ];
    solid(x, brim, INK.SETTLED, rnd);
    inkLine(x, [...brim, brim[0]], rnd, 1.5, 0.06);
    // Crown behind the brim.
    solid(x, [[hx - w * 0.085, by], [hx - w * 0.06, H1 * yHat],
              [hx + w * 0.06, H1 * yHat], [hx + w * 0.085, by]], INK.SETTLED, rnd);
  } else if (hat === 'round') {
    const by = H1 * yBrim;
    solid(x, [[hx - w * 0.20, by], [hx + w * 0.20, by],
              [hx + w * 0.16, by + H1 * 0.02], [hx - w * 0.16, by + H1 * 0.02]],
      EARTH.BISTRE, rnd, INK.SETTLED, 0.14);
    solid(x, [[hx - w * 0.085, by], [hx - w * 0.07, H1 * (yHat + 0.02)],
              [hx + w * 0.07, H1 * (yHat + 0.02)], [hx + w * 0.085, by]],
      EARTH.BISTRE, rnd, INK.SETTLED, 0.1);
  }
  return c;
}

/** Frame 0 is the standing pose; the rest walk one full cycle. */
export function characterFrames(
  coat: string,
  seed: number,
  height = 320,
  steps = 8,
  opts: { hat?: 'tricorne' | 'round' | 'none'; build?: number } = {},
): HTMLCanvasElement[] {
  const out = [characterCutout(coat, seed, height, -1, opts)];
  for (let i = 0; i < steps; i++) {
    out.push(characterCutout(coat, seed, height, i / steps, opts));
  }
  return out;
}

/** Placeholder portrait plate for the dialogue well. */
export function portraitPlate(coat: string, seed: number): HTMLCanvasElement {
  const { c, x } = surface(288, 384);
  const rnd = mulberry(seed);
  x.fillStyle = PAPER.COOL;
  x.fillRect(0, 0, 288, 384);
  wash(x, [[40, 380], [248, 380], [230, 200], [58, 200]], coat, 0.8, rnd, 5);
  wash(x, [[104, 96], [184, 96], [190, 210], [98, 210]], PAPER.SMOKED, 0.9, rnd, 4);
  wash(x, [[86, 96], [202, 96], [196, 60], [92, 60]], INK.SETTLED, 0.7, rnd, 4);
  inkLine(x, [[104, 96], [184, 96], [190, 210], [98, 210], [104, 96]], rnd, 1.5, 0.2);
  inkLine(x, [[40, 380], [58, 200], [230, 200], [248, 380]], rnd, 1.6, 0.15);
  x.globalAlpha = 0.25;
  x.strokeStyle = INK.FADED;
  x.lineWidth = 6;
  x.strokeRect(3, 3, 282, 378);
  x.globalAlpha = 1;
  return c;
}


/* ------------------------------------------------------------------ Act 2 --
 * Cambridge, July 1775.
 *
 * Flat overcast, no directional key, cool grey. Mud, unbleached linen,
 * weathered board. The only saturated colour in the act is the distant red of
 * the British lines, and it is not in this plate — it lives at the end of a
 * spyglass on the siege line, which is the act's thesis in one shot.
 */

/** L0 — flat overcast. No sun anywhere in it. */
/**
 * Where the camp street runs, in ground coordinates.
 *
 * Defined once because two plates need it: campGround paints it, and
 * campMidground has to keep the tent lines off it. Written out separately in
 * each, the tents drift onto the road the first time either is adjusted — which
 * is exactly what had happened.
 */
export function campLane(z: number): { mid: number; half: number } {
  const t = (z + 0.06) / 0.94;
  return {
    mid: 0.30 + 0.34 * t,
    half: 0.165 - 0.10 * t + Math.sin(t * 7.1) * 0.018,
  };
}

export function campSky(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(211);
  // Overcast, but not colourless: a cold blue-grey aloft warming to pale straw
  // at the horizon, which is what a flat July sky over water actually does.
  const g = x.createLinearGradient(0, 0, 0, H * HORIZON + 40);
  g.addColorStop(0, '#AFB6BE');
  g.addColorStop(0.55, '#CBCCC6');
  g.addColorStop(1, '#E4DFCE');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  const hy = H * HORIZON;
  for (let i = 0; i < 9; i++) {
    const y = rnd() * hy;
    wash(x, [[0, y], [W * 0.5, y - 26], [W, y + 14], [W * 0.4, y + 62]],
      EARTH.WET_STONE, 0.09, rnd);
  }
  return c;
}

/** L1 — the far shore, and Boston on it. */
export function campHills(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(223);
  const hy = H * HORIZON;

  /*
   * What the army was looking at.
   *
   * This band was a grey ridge and sixteen anonymous roofs. It is the most
   * legible piece of teaching in the scene and it was doing none of it: from
   * the Cambridge lines in July 1775 you could see the whole argument at once —
   * the town the enemy holds, the fleet that keeps them supplied, and the town
   * they burned three weeks ago and did not rebuild.
   *
   * Left to right: the Charlestown peninsula, burned on 17 June and standing in
   * chimneys, with the British redoubt on the hill above it; then the water;
   * then Boston on its own peninsula with Beacon Hill and the spires.
   */

  // The far shore, a low continuous land mass behind everything.
  const ridge: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    ridge.push([(i / 24) * W, hy - 22 + Math.sin(i * 0.42) * 9 + rnd() * 6]);
  }
  wash(x, [...ridge, [W, hy + 24], [0, hy + 24]], EARTH.SHADOW_SLATE, 0.22, rnd);

  /* ---- Charlestown: burned, and its hill held against you ---- */
  {
    const cx0 = W * 0.115;
    // Bunker Hill behind, with the redoubt the regulars dug after they took it.
    const hill: [number, number][] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      hill.push([cx0 - 90 + t * 300, hy - 20 - Math.sin(t * Math.PI) * 34]);
    }
    solid(x, [...hill, [cx0 + 210, hy + 4], [cx0 - 90, hy + 4]], '#8A8B80', rnd,
      EARTH.SHADOW_SLATE, 0.3);
    inkLine(x, hill, rnd, 1.1, 0.24);
    // The redoubt: a squat parapet on the crown, and a colour over it.
    const rx0 = cx0 + 42;
    solid(x, [[rx0 - 34, hy - 50], [rx0 + 34, hy - 52], [rx0 + 30, hy - 38], [rx0 - 30, hy - 36]],
      '#6F6A5C', rnd, EARTH.BISTRE, 0.3);
    for (let i = 0; i < 5; i++) {
      inkLine(x, [[rx0 - 30 + i * 15, hy - 50], [rx0 - 30 + i * 15, hy - 56]], rnd, 1.1, 0.1);
    }
    inkLine(x, [[rx0 + 40, hy - 40], [rx0 + 40, hy - 76]], rnd, 1.2, 0.06);
    solid(x, [[rx0 + 40, hy - 76], [rx0 + 62, hy - 71], [rx0 + 40, hy - 64]], '#8E8477', rnd);

    // The town below it: burned to the ground, chimneys left standing. Nothing
    // else in the frame is drawn as an absence, and it should be.
    solid(x, [[cx0 - 70, hy - 16], [cx0 + 150, hy - 18], [cx0 + 146, hy + 2], [cx0 - 74, hy + 4]],
      '#57514A', rnd, INK.SETTLED, 0.34);
    for (let i = 0; i < 15; i++) {
      const sx0 = cx0 - 62 + i * 14 + rnd() * 5;
      const sh = 8 + rnd() * 13;
      solid(x, [[sx0, hy - 16], [sx0 + 4, hy - 16], [sx0 + 4, hy - 16 - sh], [sx0, hy - 16 - sh]],
        '#6E6157', rnd);
    }
    // Smoke still going up off it, three weeks on.
    for (const sm of [cx0 - 30, cx0 + 40, cx0 + 110]) {
      for (let k = 0; k < 4; k++) {
        const t = k / 4;
        wash(x, [[sm - 6 - t * 14, hy - 20 - t * 40], [sm + 7 + t * 13, hy - 24 - t * 40],
                 [sm + 5 + t * 17, hy - 44 - t * 40], [sm - 8 - t * 11, hy - 40 - t * 40]],
          EARTH.WET_STONE, 0.11, rnd, 2);
      }
    }
  }

  /* ---- Boston, across the water ---- */
  {
    const bx0 = W * 0.50;
    // Beacon Hill, with the mast the town is named for on top of it.
    const bh: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      bh.push([bx0 - 20 + t * 190, hy - 18 - Math.sin(t * Math.PI) * 40]);
    }
    solid(x, [...bh, [bx0 + 170, hy + 2], [bx0 - 20, hy + 2]], '#948E80', rnd,
      EARTH.SHADOW_SLATE, 0.26);
    inkLine(x, [[bx0 + 74, hy - 57], [bx0 + 76, hy - 96]], rnd, 1.3, 0.05);
    inkLine(x, [[bx0 + 68, hy - 90], [bx0 + 84, hy - 90]], rnd, 1.0, 0.1);

    // Roofs along the waterfront, and four spires standing out of them. The
    // spires are the whole silhouette of eighteenth-century Boston.
    for (let i = 0; i < 30; i++) {
      const rx = bx0 - 60 + i * 15 + rnd() * 5;
      const rh = 8 + rnd() * 13;
      solid(x, [[rx, hy - 8], [rx + 13, hy - 8], [rx + 13, hy - 8 - rh], [rx, hy - 8 - rh]],
        rnd() < 0.35 ? '#9B8478' : '#8E939A', rnd);
    }
    for (const [sx0, sh] of [[bx0 + 22, 58], [bx0 + 128, 70], [bx0 + 232, 50], [bx0 + 300, 62]] as
         [number, number][]) {
      solid(x, [[sx0 - 7, hy - 10], [sx0 + 7, hy - 10], [sx0 + 5, hy - sh * 0.62],
                [sx0 - 5, hy - sh * 0.62]], '#B6B0A0', rnd, EARTH.SHADOW_SLATE, 0.2);
      solid(x, [[sx0 - 5, hy - sh * 0.62], [sx0 + 5, hy - sh * 0.62], [sx0, hy - sh]],
        '#A49E8E', rnd, EARTH.SHADOW_SLATE, 0.24);
      inkLine(x, [[sx0 - 7, hy - 10], [sx0 - 5, hy - sh * 0.62], [sx0, hy - sh],
                  [sx0 + 5, hy - sh * 0.62], [sx0 + 7, hy - 10]], rnd, 1.1, 0.1);
    }
  }

  // The water between — opaque, and colder than the land.
  solid(x, [[0, hy - 4], [W, hy - 8], [W, hy + 22], [0, hy + 26]], '#8D97A0', rnd,
    EARTH.SHADOW_SLATE, 0.28);

  /* ---- the fleet, which is why the siege could not be closed ---- */
  for (const [sx0, sc] of [[W * 0.335, 1.0], [W * 0.405, 0.82], [W * 0.60, 0.9], [W * 0.685, 0.72],
                           [W * 0.80, 0.86], [W * 0.875, 0.66]] as [number, number][]) {
    const wl = hy + 6 + (1 - sc) * 8;
    solid(x, [[sx0 - 22 * sc, wl - 5 * sc], [sx0 + 22 * sc, wl - 5 * sc],
              [sx0 + 16 * sc, wl + 3 * sc], [sx0 - 17 * sc, wl + 3 * sc]], '#5F5A50', rnd);
    for (const [mx0, mh] of [[-9, 30], [1, 36], [11, 28]] as [number, number][]) {
      inkLine(x, [[sx0 + mx0 * sc, wl - 5 * sc], [sx0 + mx0 * sc, wl - (5 + mh) * sc]],
        rnd, 1.0 * sc, 0.05);
      for (const yd of [0.42, 0.68]) {
        inkLine(x, [[sx0 + (mx0 - 7) * sc, wl - (5 + mh * yd) * sc],
                    [sx0 + (mx0 + 7) * sc, wl - (5 + mh * yd) * sc]], rnd, 0.8 * sc, 0.14);
      }
    }
  }

  for (let i = 0; i < 22; i++) {
    const wy2 = hy + 2 + rnd() * 22;
    inkLine(x, [[rnd() * W, wy2], [rnd() * W * 0.2 + rnd() * W * 0.7, wy2 + (rnd() - 0.5) * 3]],
      rnd, 0.6, 0.3);
  }
  inkLine(x, ridge, rnd, 1.0, 0.35);
  return c;
}

export function campGround(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(237);
  const hy = H * HORIZON;

  solid(x, [[0, hy + 10], [W, hy + 4], [W, H], [0, H]], '#CAC5AE', rnd);
  wash(x, [[0, hy + 10], [W, hy + 4], [W, H], [0, H]], EARTH.RAW_UMBER, 0.16, rnd);
  wash(x, [[0, hy + 170], [W, hy + 140], [W, H], [0, H]], EARTH.BISTRE, 0.12, rnd);

  wash(x, [[0, hy + 10], [W, hy + 4], [W, H], [0, H]], EARTH.TERRE_VERTE, 0.13, rnd);

  /*
   * The camp street.
   *
   * It was a symmetric wedge down the dead centre of the frame — the same axial
   * staging that was wrong at Mount Vernon, and wrong here for the same reason:
   * it aims the player before he has decided anything. A street in a camp of
   * sixteen thousand men who pitched where they liked is a thing worn by feet,
   * not surveyed. So it enters left of centre, drifts right as it goes back, and
   * its edges wander.
   *
   * Laid through platePx so it sits on the curve the player walks, which is what
   * lets a man walk up the middle of it rather than across it.
   */
  {
    const lane: [number, number][] = [];
    const edge = (side: number) => {
      const out: [number, number][] = [];
      for (let i = 0; i <= 12; i++) {
        const z = -0.06 + (i / 12) * 0.94;
        const { mid, half } = campLane(z);
        out.push([mid + side * half, z]);
      }
      return out;
    };
    for (const [gx, z] of edge(-1)) { const a = platePx({ x: gx, z }, W, H); lane.push([a.x, a.y]); }
    for (const [gx, z] of edge(1).reverse()) { const a = platePx({ x: gx, z }, W, H); lane.push([a.x, a.y]); }
    solid(x, lane, '#AA9C86', rnd, EARTH.RAW_UMBER, 0.18);
    // Ruts along it, so the churned ground reads as churned rather than paved.
    for (let r = 0; r < 14; r++) {
      const off = (r % 5) * 0.05 - 0.1;
      const z0 = 0.02 + (r / 14) * 0.62;
      const a = platePx({ x: campLane(z0).mid + off, z: z0 }, W, H);
      const b = platePx({ x: campLane(z0 + 0.16).mid + off * 0.7, z: z0 + 0.16 }, W, H);
      inkLine(x, [[a.x, a.y], [b.x, b.y]], rnd, 1.4, 0.24);
      wash(x, [[a.x - 7, a.y], [a.x + 7, a.y], [b.x + 4, b.y], [b.x - 4, b.y]],
        EARTH.BISTRE, 0.18, rnd, 2);
    }
  }

  // Ruts and standing water.
  for (let i = 0; i < 26; i++) {
    const t = rnd();
    const y = hy + 30 + t * t * (H - hy - 40);
    const spread = 0.06 + t * 0.34;
    const sx = W * (0.5 - spread) + rnd() * W * spread * 2;
    const len = 24 + t * 150;
    inkLine(x, [[sx, y], [sx + len, y + (rnd() - 0.5) * 8]], rnd, 0.7 + t * 1.6, 0.25);
    if (rnd() < 0.4) {
      wash(x, [[sx, y], [sx + len * 0.7, y - 3], [sx + len * 0.6, y + 9], [sx - 4, y + 11]],
        EARTH.SHADOW_SLATE, 0.16, rnd, 3);
    }
  }
  return c;
}

/**
 * L3 — the camp itself.
 *
 * Emerson's list, literally: shelters of boards, of sailcloth, of board and
 * sailcloth mixed, of stone and turf, of birch, of brush. And stage right,
 * Greene's Rhode Islanders in proper tents in ordered rows — one regiment that
 * looks like an army, surrounded by thousands of men living in brush piles.
 */
export function campMidground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(251);
  const hy = H * HORIZON;
  const base = hy + 196;

  const shadow = (cx: number, b: number, r: number) =>
    wash(x, [[cx - r, b], [cx + r, b - 3], [cx + r * 0.7, b + r * 0.22], [cx - r * 0.8, b + r * 0.24]],
      EARTH.BISTRE, 0.20, rnd, 3);

  /** A lean-to of whatever the regiment had. */
  const shanty = (cx: number, b: number, w: number, h: number, kind: number) => {
    // Lighter wash, harder line. These have to read as built things, not as
    // boulders — the structure is the whole content of the shot.
    // Weathered board, dirty sailcloth, cut turf, brush. Opaque, then tinted —
    // a shelter you can see the water through is not a shelter.
    const tone = ['#C6BFA9', '#D8D3C2', '#8E8A74', '#7C6B52'][kind % 4];
    const tint = [EARTH.RAW_UMBER, EARTH.WET_STONE, EARTH.TERRE_VERTE, EARTH.BISTRE][kind % 4];
    const ridgeX = cx - w / 2 + w * 0.22;
    const ridgeY = b - h;
    const backY = b - h * 0.48;
    solid(x, [[cx - w / 2, b], [ridgeX, ridgeY], [cx + w / 2, backY], [cx + w / 2, b]], tone, rnd,
      tint, 0.26);
    // Ridge, back slope, and the two uprights.
    inkLine(x, [[cx - w / 2, b], [ridgeX, ridgeY]], rnd, 2.4, 0.03);
    inkLine(x, [[ridgeX, ridgeY], [cx + w / 2, backY]], rnd, 2.4, 0.03);
    inkLine(x, [[cx + w / 2, backY], [cx + w / 2, b]], rnd, 2.0, 0.08);
    inkLine(x, [[ridgeX, ridgeY], [ridgeX, b]], rnd, 1.5, 0.28);

    if (kind % 2) {
      // Boarded: parallel planks following the slope.
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        inkLine(x, [[cx - w / 2 + w * 0.22 * t, b - h * t],
                    [cx + w / 2 - w * 0.1 * (1 - t), backY + (b - backY) * (1 - t) * 0.55]],
          rnd, 1.0, 0.22);
      }
    } else {
      // Brush: cut boughs laid over the frame, sticking past the ridge.
      for (let i = 0; i < 16; i++) {
        const t = rnd();
        const sx2 = cx - w / 2 + w * 0.22 * t + rnd() * w * 0.5;
        const sy2 = b - h * t * 0.9;
        inkLine(x, [[sx2, sy2], [sx2 + 10 + rnd() * 26, sy2 + 6 + rnd() * 16]], rnd, 1.1, 0.14);
      }
    }
    // A dark mouth, so it reads as somewhere a man goes into.
    wash(x, [[cx - w * 0.12, b], [cx + w * 0.1, b], [cx + w * 0.07, b - h * 0.4],
             [cx - w * 0.08, b - h * 0.44]], INK.SETTLED, 0.30, rnd, 3);
    shadow(cx, b, w * 0.55);
  };

  /** A proper wedge tent, of the kind Rhode Island bought. */
  const tent = (cx: number, b: number, w: number, h: number) => {
    solid(x, [[cx - w / 2, b], [cx, b - h], [cx + w / 2, b]], '#E8E4D4', rnd);
    // One lit face and one shaded, so a row of tents is not a row of triangles.
    wash(x, [[cx, b - h], [cx + w / 2, b], [cx, b]], EARTH.SHADOW_SLATE, 0.22, rnd, 3);
    inkLine(x, [[cx - w / 2, b], [cx, b - h], [cx + w / 2, b], [cx - w / 2, b]], rnd, 1.5, 0.06);
    inkLine(x, [[cx, b - h], [cx, b]], rnd, 0.9, 0.4);
    shadow(cx, b, w * 0.5);
  };

  /*
   * Everything below is sized in man-heights off the ground curve rather than
   * in pixels. Drawn by eye, the tents came out at about a third of the height
   * of a man standing beside them — which is most of why the camp read as a
   * model seen from a distance instead of a place the player is standing in.
   */
  const man = (b: number) => figureAtPlateY(b, H);

  // The shanty town, ragged and unaligned, on the left and centre.
  // Clustered, not spaced. Men from the same town built next to each other and
  // left gaps everywhere else; an even row of huts reads as a fence.
  // x, depth offset, width as a multiple of its own height, height in man-heights.
  const shanties: [number, number, number, number][] = [
    [0.048, 0.34, 1.34, 0.95], [0.104, 0.16, 1.30, 0.74], [0.132, 0.46, 1.36, 1.04],
    [0.246, 0.04, 1.28, 0.70], [0.284, 0.30, 1.32, 0.88], [0.318, -0.08, 1.26, 0.64],
    [0.452, 0.22, 1.30, 0.84], [0.492, 0.02, 1.28, 0.66], [0.60, 0.38, 1.32, 0.90],
  ];
  /*
   * Painted back to front, which they were not.
   *
   * A plate has no depth buffer: the only thing deciding what covers what is
   * the order of the calls. The shelters were painted in the order they happen
   * to be listed and the tent rows were painted near row first, so small far
   * shelters were laid over large near ones. That reads exactly as tents
   * stacked on top of each other, which is what it was.
   *
   * Sorting by baseline — smaller y is further away — is the whole fix, and
   * doing it here rather than by hand-ordering the list means the arrays can be
   * written for legibility and still come out right.
   */
  shanties
    .map(([fx, dy, wf, hf], i) => ({ fx, b: base + dy * 120, wf, hf, i }))
    .sort((a, b) => a.b - b.b)
    .forEach(({ fx, b, wf, hf, i }) => {
      const hpx = man(b) * hf;
      shanty(W * fx, b, hpx * wf, hpx, i);
    });

  // Greene's Rhode Islanders: ordered rows, straight streets, tents that match.
  // Back row first, for the same reason.
  for (let row = 2; row >= 0; row--) {
    for (let i = 0; i < 2; i++) {
      const b = base - row * 34 + 26;
      /*
       * The line starts where the road ends.
       *
       * Spacing is off the tents' own width — sized correctly they are twice as
       * wide as they were, and the old fraction-of-the-frame spacing packed them
       * into one continuous ridge of canvas. The first tent of each row is then
       * placed from the verge of the street at that row's depth rather than from
       * a guessed column, so no tent can end up pitched in the road however
       * either of them is adjusted later.
       *
       * A common wedge tent stood about as high at the ridge as the man who
       * slept in it, and was a little wider than it was tall.
       */
      const z = zAtPlateY(b, H);
      const lane = campLane(z);
      const th0 = man(b) * 1.02;
      const verge = platePx({ x: lane.mid + lane.half, z }, W, H).x;
      const cx = verge + th0 * 1.28 * 0.5 + 30 + i * th0 * 1.46;
      tent(cx, b, th0 * 1.28, th0);
    }
  }

  /*
   * The headquarters marquee.
   *
   * A wall tent, not a wedge: vertical sides you can stand up inside, a ridge
   * over them, and a fly out front on its own poles to work under. Set apart
   * from the lines with a sentry on it, and half again the height of anything
   * else in the camp — which is the whole point of it. A general's quarters
   * that reads as one more tent is not doing its job.
   *
   * HISTORICAL NOTE: on 3 July 1775 Washington's quarters at Cambridge were a
   * house, not a marquee — Wadsworth House first, then the Vassall house from
   * about the 15th. The marquee is right from 1776 onward in the field. This is
   * drawn here because the scene needs a command post the player can walk to;
   * swapping it for the Vassall house is a change to this block alone.
   */
  {
    const mx = W * 0.862;
    const mb = base + 8;
    const mh = man(mb) * 1.40;
    const mw = mh * 1.30;
    const wallY = mb - mh * 0.52; // where the vertical side wall stops

    // Guy ropes first, so the canvas covers their tops.
    for (const d of [-1.05, -0.72, 0.72, 1.05]) {
      inkLine(x, [[mx + mw * d * 0.5, mb - mh * (d < 0 ? 0.86 : 0.86)],
                  [mx + mw * d * 0.92, mb + 6]], rnd, 1.2, 0.1);
    }

    // Body: side walls up to the eaves, then the ridge above them.
    const body: [number, number][] = [
      [mx - mw / 2, mb], [mx - mw / 2, wallY], [mx - mw * 0.30, mb - mh],
      [mx + mw * 0.30, mb - mh], [mx + mw / 2, wallY], [mx + mw / 2, mb],
    ];
    solid(x, body, '#E4DFCD', rnd);
    // One lit face and one in shade, or a big pale tent reads as a cut-out.
    wash(x, [[mx + mw * 0.06, mb - mh], [mx + mw * 0.30, mb - mh], [mx + mw / 2, wallY],
             [mx + mw / 2, mb], [mx + mw * 0.06, mb]], EARTH.SHADOW_SLATE, 0.2, rnd, 3);
    inkLine(x, [...body, body[0]], rnd, 2.2, 0.03);
    inkLine(x, [[mx - mw / 2, wallY], [mx + mw / 2, wallY]], rnd, 1.3, 0.24); // eaves
    // Ridge pole ends, sticking out past the canvas at both gables.
    inkLine(x, [[mx - mw * 0.34, mb - mh], [mx + mw * 0.34, mb - mh]], rnd, 2.0, 0.06);

    // The door, hooked back — a dark opening, which is what says a tent is
    // somewhere a man goes in rather than a shape on the ground.
    const dw = mw * 0.125;
    solid(x, [[mx - dw, mb], [mx - dw * 0.85, mb - mh * 0.66], [mx + dw * 0.85, mb - mh * 0.66],
              [mx + dw, mb]], '#3A322A', rnd);
    // A table just inside it, so the opening reads as a room and not a hole.
    solid(x, [[mx - dw * 0.7, mb - mh * 0.30], [mx + dw * 0.7, mb - mh * 0.30],
              [mx + dw * 0.7, mb - mh * 0.24], [mx - dw * 0.7, mb - mh * 0.24]],
      '#6B5A44', rnd);
    inkLine(x, [[mx - dw * 0.55, mb - mh * 0.24], [mx - dw * 0.55, mb - mh * 0.06]], rnd, 1.1, 0.1);
    inkLine(x, [[mx + dw * 0.55, mb - mh * 0.24], [mx + dw * 0.55, mb - mh * 0.06]], rnd, 1.1, 0.1);
    solid(x, [[mx + dw * 0.85, mb - mh * 0.62], [mx + dw * 2.0, mb - mh * 0.54],
              [mx + dw * 1.8, mb], [mx + dw * 0.8, mb]], '#D9D3BF', rnd, EARTH.SHADOW_SLATE, 0.22);
    inkLine(x, [[mx + dw * 0.85, mb - mh * 0.62], [mx + dw * 2.0, mb - mh * 0.54],
                [mx + dw * 1.8, mb]], rnd, 1.4, 0.1);

    // The fly, forward on two poles: the roof councils were held under.
    const fyTop = mb - mh * 0.84;
    const flyF = mb - mh * 0.56;
    solid(x, [[mx - mw * 0.40, fyTop], [mx + mw * 0.40, fyTop],
              [mx + mw * 0.52, flyF], [mx - mw * 0.52, flyF]], '#DCD6C2', rnd,
      EARTH.SHADOW_SLATE, 0.14);
    inkLine(x, [[mx - mw * 0.40, fyTop], [mx + mw * 0.40, fyTop], [mx + mw * 0.52, flyF],
                [mx - mw * 0.52, flyF], [mx - mw * 0.40, fyTop]], rnd, 1.6, 0.08);
    for (const d of [-0.52, 0.52]) {
      inkLine(x, [[mx + mw * d, flyF], [mx + mw * d * 1.02, mb + 4]], rnd, 2.2, 0.04);
    }
    shadow(mx, mb, mw * 0.62);
  }

  // A flagless pole, a cook fire with a kettle on a tripod, and stacked arms.
  inkLine(x, [[W * 0.70, base + 20], [W * 0.70, base - 130]], rnd, 2.4, 0.04);

  const fx = W * 0.345;
  const fy = base + 52;
  wash(x, [[fx - 26, fy], [fx + 26, fy - 4], [fx + 20, fy + 14], [fx - 22, fy + 16]],
    EARTH.MADDER_LAKE, 0.26, rnd, 3);
  for (let i = 0; i < 3; i++) {
    inkLine(x, [[fx - 22 + i * 20, fy + 12], [fx - 4 + i * 14, fy - 40 - i * 6]], rnd, 1.8, 0.08);
  }
  solid(x, [[fx - 15, fy - 42], [fx + 15, fy - 42], [fx + 11, fy - 16], [fx - 11, fy - 16]],
    '#3E3A34', rnd);
  inkLine(x, [[fx - 15, fy - 42], [fx + 15, fy - 42]], rnd, 1.6, 0.1);

  // Stacked arms — three muskets leaning into each other.
  const ax = W * 0.615;
  for (const d of [-16, 0, 16]) {
    inkLine(x, [[ax + d, base + 34], [ax + d * 0.25, base - 62]], rnd, 2.0, 0.05);
  }

  // Laundry on a line between two poles.
  const lx0 = W * 0.045;
  const lx1 = W * 0.20;
  inkLine(x, [[lx0, base - 16], [lx0, base + 36]], rnd, 2.0, 0.06);
  inkLine(x, [[lx1, base - 22], [lx1, base + 32]], rnd, 2.0, 0.06);
  inkLine(x, [[lx0, base - 12], [(lx0 + lx1) / 2, base - 2], [lx1, base - 18]], rnd, 1.1, 0.14);
  for (let i = 0; i < 5; i++) {
    const px = lx0 + 18 + i * 28;
    const py = base - 10 + Math.sin(i * 1.7) * 5;
    const ww = 18 + rnd() * 9;
    const hhq = 30 + rnd() * 18;
    const sag = 3 + rnd() * 5; // hangs unevenly, because it was hung wet
    const tone = ['#CFC6B0', '#BEB49C', '#D6CDB6', '#B3A98F'][i % 4];
    const pts: [number, number][] = [[px, py], [px + ww, py - 2],
      [px + ww - 2, py + hhq], [px + sag, py + hhq + sag]];
    solid(x, pts, tone, rnd, EARTH.SHADOW_SLATE, 0.16);
    inkLine(x, [...pts, pts[0]], rnd, 1.0, 0.28);
  }

  /*
   * The work of a camp.
   *
   * A farm's clutter is somebody's job half-finished. An army's is supply: the
   * things sixteen thousand men need daily and mostly did not have. Every item
   * here is one Washington was writing to Congress about within a fortnight of
   * arriving — barrels, firewood, tools, and the beef ration.
   */

  // Provision barrels, stacked and broached. The powder was the thing he could
  // not get; the salt beef he could.
  {
    const bxp = W * 0.695;
    const byp = base + 44;
    const cask = (cx0: number, b0: number, sc: number) => {
      const cw = 30 * sc;
      const ch = 40 * sc;
      const pts: [number, number][] = [[cx0 - cw / 2, b0 - ch], [cx0 + cw / 2, b0 - ch],
        [cx0 + cw / 2 + 2, b0], [cx0 - cw / 2 - 2, b0]];
      solid(x, pts, '#8A7150', rnd, EARTH.RAW_UMBER, 0.26);
      inkLine(x, [...pts, pts[0]], rnd, 1.4, 0.08);
      for (const f of [0.26, 0.72]) {
        inkLine(x, [[cx0 - cw / 2, b0 - ch + ch * f], [cx0 + cw / 2, b0 - ch + ch * f]], rnd, 1.1, 0.16);
      }
    };
    cask(bxp, byp, 1.0);
    cask(bxp + 34, byp + 4, 0.95);
    cask(bxp + 17, byp - 38, 0.9);
    shadow(bxp + 17, byp + 6, 52);
  }

  // Firewood, cut and not yet carried, with the saw-horse still standing over it.
  {
    const wxp = W * 0.185;
    const wyp = base + 66;
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 6 - r; i++) {
        const lx = wxp + i * 13 + r * 6;
        const ly = wyp - r * 12;
        solid(x, [[lx, ly - 12], [lx + 12, ly - 12], [lx + 12, ly], [lx, ly]], '#7E6749', rnd,
          EARTH.BISTRE, 0.22);
        inkLine(x, [[lx, ly - 12], [lx + 12, ly - 12], [lx + 12, ly], [lx, ly], [lx, ly - 12]],
          rnd, 0.8, 0.32);
      }
    }
    for (const d of [0, 46]) {
      inkLine(x, [[wxp - 26 + d, wyp], [wxp - 12 + d, wyp - 44]], rnd, 1.8, 0.06);
      inkLine(x, [[wxp - 2 + d, wyp], [wxp - 16 + d, wyp - 44]], rnd, 1.8, 0.06);
    }
    inkLine(x, [[wxp - 30, wyp - 40], [wxp + 34, wyp - 40]], rnd, 1.6, 0.08);
  }

  // Entrenching tools against a shanty — spades and a pick, which is most of
  // what this army did all summer.
  {
    const txp = W * 0.375;
    const typ = base + 30;
    for (const [d, hd] of [[0, 1], [13, 0], [26, 1], [37, 0]] as [number, number][]) {
      inkLine(x, [[txp + d, typ], [txp + d + 8, typ - 66]], rnd, 1.7, 0.06);
      if (hd) {
        solid(x, [[txp + d + 4, typ - 66], [txp + d + 15, typ - 70], [txp + d + 17, typ - 52],
                  [txp + d + 6, typ - 48]], '#7B7F84', rnd, EARTH.SHADOW_SLATE, 0.2);
      }
    }
  }

  // A beef carcass on a frame, and the butcher's tub under it. The ration was
  // killed in camp, which is a fact students find more vivid than any number.
  {
    const mxp = W * 0.545;
    const myp = base + 58;
    inkLine(x, [[mxp - 30, myp], [mxp - 22, myp - 84]], rnd, 2.0, 0.05);
    inkLine(x, [[mxp + 30, myp], [mxp + 22, myp - 84]], rnd, 2.0, 0.05);
    inkLine(x, [[mxp - 24, myp - 80], [mxp + 24, myp - 80]], rnd, 1.8, 0.06);
    solid(x, [[mxp - 12, myp - 76], [mxp + 8, myp - 78], [mxp + 12, myp - 30],
              [mxp - 8, myp - 26]], '#8A6D5E', rnd, EARTH.MADDER_LAKE, 0.16);
    inkLine(x, [[mxp - 12, myp - 76], [mxp + 8, myp - 78], [mxp + 12, myp - 30],
                [mxp - 8, myp - 26], [mxp - 12, myp - 76]], rnd, 1.2, 0.14);
    solid(x, [[mxp - 16, myp - 18], [mxp + 14, myp - 18], [mxp + 11, myp], [mxp - 13, myp]],
      '#6E5B45', rnd, EARTH.BISTRE, 0.2);
  }

  // Guy ropes off the near tents. Every long line in this plate runs with the
  // frame or straight back into it; these are the only diagonals, and they are
  // most of what keeps the tent rows from reading as wallpaper.
  for (let i = 0; i < 4; i++) {
    const gx0 = W * (0.762 + i * 0.052);
    inkLine(x, [[gx0, base + 6], [gx0 - 30, base + 30]], rnd, 0.9, 0.2);
    inkLine(x, [[gx0, base + 6], [gx0 + 30, base + 30]], rnd, 0.9, 0.2);
  }

  groundLitter(x, rnd, base - 10, base + 110, 80, 0.9);
  return c;
}

/**
 * The far camp — a second occlusion band, hazed back.
 *
 * Thousands of men living in brush, seen as a mass rather than as shelters,
 * with smoke standing up off it. This is the band that makes the camp read as
 * enormous instead of as eight huts in a row.
 */
export function campFarMidground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(259);
  const hy = H * HORIZON;
  const base = hy + 92;

  // A long ragged mass of distant shelter, unreadable in detail.
  for (let i = 0; i < 60; i++) {
    const px = rnd() * W;
    const bw = 26 + rnd() * 40;
    const bh = 14 + rnd() * 26;
    const by = base - rnd() * 22;
    wash(x, [[px, by], [px + bw * 0.3, by - bh], [px + bw, by - bh * 0.5], [px + bw, by]],
      rnd() < 0.3 ? PAPER.BRIGHT : PAPER.SMOKED, 0.34, rnd, 3);
    inkLine(x, [[px, by], [px + bw * 0.3, by - bh], [px + bw, by - bh * 0.5]], rnd, 1.1, 0.2);
  }

  // Cook-fire smoke, standing up straight in still air.
  for (const sx of [W * 0.14, W * 0.33, W * 0.52, W * 0.71, W * 0.90]) {
    const h = 90 + rnd() * 70;
    for (let k = 0; k < 5; k++) {
      const t = k / 5;
      wash(x, [[sx - 8 - t * 22, base - h * t], [sx + 8 + t * 20, base - h * t - 6],
               [sx + 6 + t * 26, base - h * (t + 0.24)], [sx - 10 - t * 18, base - h * (t + 0.2)]],
        EARTH.WET_STONE, 0.10, rnd, 3);
    }
  }

  // An earthwork line running across, with gabions on it.
  const para: [number, number][] = [];
  for (let i = 0; i <= 24; i++) para.push([(i / 24) * W, base + 16 + Math.sin(i * 0.8) * 5]);
  wash(x, [...para, [W, base + 54], [0, base + 54]], EARTH.BISTRE, 0.26, rnd, 4);
  inkLine(x, para, rnd, 1.4, 0.2);
  for (let i = 0; i < 14; i++) {
    const px = i * (W / 14) + rnd() * 20;
    wash(x, [[px, base + 18], [px + 30, base + 16], [px + 28, base - 8], [px + 2, base - 6]],
      EARTH.RAW_UMBER, 0.3, rnd, 3);
    inkLine(x, [[px, base + 18], [px + 2, base - 6], [px + 28, base - 8], [px + 30, base + 16]],
      rnd, 1.2, 0.22);
  }

  /*
   * The Vassall house — Washington's headquarters, July 1775 to April 1776, and
   * later Longfellow's.
   *
   * A large Georgian frame mansion, pale yellow with white trim, standing on
   * Brattle Street among the other Tory Row houses whose owners had fled. He
   * did not sleep in a tent at Cambridge; he requisitioned a Loyalist's
   * mansion, and that contrast — a gentleman's house at the top of a field of
   * brush huts — is worth more to a student than any number.
   *
   * Set apart and up the slope from the camp, which is where it was.
   *
   * NOT sized in man-heights, and this is the one place that rule breaks. A
   * two-and-a-half-storey Georgian mansion is about thirty-five feet, or a bit
   * over six times a man — which drawn on the walkable curve at this depth comes
   * out 740px tall on a 900px plate, filling the frame. The curve is truncated
   * on purpose (FAR_SCALE 0.46, so a figure never shrinks past readable), and a
   * truncated curve cannot represent a building a quarter mile off. Anything
   * beyond the walkable band is scenery and gets sized by eye against its
   * neighbours: here, clearly larger than the distant shelters around it and
   * clearly smaller than the huts the player is standing among.
   *
   * The column is 596 because that is where a player at ground (0.10, 0.74) is
   * drawn, and the interactable has to sit under the thing it names. Painted at
   * a plain 0.245 of the plate it would have been at a ground x of about -0.16 —
   * off the walkable band entirely, and unreachable.
   */
  {
    const hxp = 596;
    const hb = base - 4;
    const unit = 44;
    const hh = 106;
    const hw = hh * 1.62;
    const roof = hh * 0.34;
    const top = hb - hh;

    // Body, with the centre bay standing slightly proud.
    solid(x, [[hxp - hw / 2, top], [hxp + hw / 2, top], [hxp + hw / 2, hb], [hxp - hw / 2, hb]],
      '#D9CFA4', rnd, EARTH.YELLOW_OCHRE, 0.24);
    inkLine(x, [[hxp - hw / 2, top], [hxp + hw / 2, top], [hxp + hw / 2, hb], [hxp - hw / 2, hb],
                [hxp - hw / 2, top]], rnd, 1.6, 0.06);

    // Hipped roof with a balustrade along the flat of it.
    solid(x, [[hxp - hw / 2 - 4, top], [hxp - hw * 0.28, top - roof], [hxp + hw * 0.28, top - roof],
              [hxp + hw / 2 + 4, top]], '#7E7A70', rnd, EARTH.SHADOW_SLATE, 0.24);
    inkLine(x, [[hxp - hw / 2 - 4, top], [hxp - hw * 0.28, top - roof], [hxp + hw * 0.28, top - roof],
                [hxp + hw / 2 + 4, top]], rnd, 1.4, 0.08);
    for (let i = 0; i <= 8; i++) {
      const bxp = hxp - hw * 0.28 + (i / 8) * hw * 0.56;
      inkLine(x, [[bxp, top - roof], [bxp, top - roof - hh * 0.07]], rnd, 0.9, 0.14);
    }
    inkLine(x, [[hxp - hw * 0.28, top - roof - hh * 0.07], [hxp + hw * 0.28, top - roof - hh * 0.07]],
      rnd, 1.1, 0.1);

    // Two chimneys, and the central pediment over the door.
    for (const f of [-0.34, 0.34]) {
      const cxp = hxp + hw * f;
      solid(x, [[cxp - hw * 0.028, top - roof * 1.5], [cxp + hw * 0.028, top - roof * 1.5],
                [cxp + hw * 0.028, top - roof * 0.5], [cxp - hw * 0.028, top - roof * 0.5]],
        '#9A8A72', rnd, EARTH.RAW_UMBER, 0.3);
    }
    solid(x, [[hxp - hw * 0.15, top + hh * 0.06], [hxp, top - hh * 0.08],
              [hxp + hw * 0.15, top + hh * 0.06]], '#E6E0CC', rnd, EARTH.SHADOW_SLATE, 0.14);
    inkLine(x, [[hxp - hw * 0.15, top + hh * 0.06], [hxp, top - hh * 0.08],
                [hxp + hw * 0.15, top + hh * 0.06]], rnd, 1.3, 0.08);

    // Pilasters, which are most of what says "gentleman's house" at this size.
    for (const f of [-0.44, -0.16, 0.16, 0.44]) {
      inkLine(x, [[hxp + hw * f, top + hh * 0.05], [hxp + hw * f, hb]], rnd, 1.2, 0.16);
    }

    // Windows: two ranks of five, and the door on the centre line.
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 5; i++) {
        if (r === 1 && i === 2) continue; // the door goes here
        const wx0 = hxp - hw * 0.36 + (i * hw * 0.72) / 4;
        const wy0 = top + hh * (0.18 + r * 0.38);
        const ww = hw * 0.058;
        const wh2 = hh * 0.20;
        solid(x, [[wx0 - ww, wy0], [wx0 + ww, wy0], [wx0 + ww, wy0 + wh2], [wx0 - ww, wy0 + wh2]],
          '#4A5250', rnd);
        inkLine(x, [[wx0 - ww, wy0], [wx0 + ww, wy0], [wx0 + ww, wy0 + wh2], [wx0 - ww, wy0 + wh2],
                    [wx0 - ww, wy0]], rnd, 0.9, 0.16);
      }
    }
    solid(x, [[hxp - hw * 0.055, hb - hh * 0.30], [hxp + hw * 0.055, hb - hh * 0.30],
              [hxp + hw * 0.055, hb], [hxp - hw * 0.055, hb]], '#3E3A30', rnd);

    // A paling fence along the front, and one sentry's box beside the gate.
    for (let i = 0; i <= 22; i++) {
      const fxp = hxp - hw * 0.78 + (i / 22) * hw * 1.56;
      inkLine(x, [[fxp, hb + unit * 0.14], [fxp, hb + unit * 0.02]], rnd, 0.9, 0.16);
    }
    inkLine(x, [[hxp - hw * 0.78, hb + unit * 0.05], [hxp + hw * 0.78, hb + unit * 0.05]],
      rnd, 1.0, 0.1);
  }

  groundLitter(x, rnd, base + 20, base + 76, 34, 0.5);
  return haze(c, 0.22, PAPER.COOL);
}

/** L4 — near clutter. Nothing here belongs to the army. */
export function campForeground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(267);
  const y = H * 0.95;

  /*
   * Shelter at the player's own scale, cropped by the frame.
   *
   * Correcting the sizes further back made the camp the right size but did not
   * make it somewhere you are standing — everything still sat in one band in
   * the middle distance, with the near third empty, which is the composition of
   * looking at a camp from outside it. Two shelters running off the edges at
   * the scale of the man walking between them is what puts him inside it. They
   * are on the nearest plate, so he passes behind them.
   */
  const nearShelter = (edge: number, dir: number) => {
    const b = H * 1.02;
    const hgt = figureAtPlateY(H * 0.9, H) * 1.5;
    const wd = hgt * 1.5;
    const ridgeX = edge + dir * wd * 0.30;
    const backX = edge + dir * wd;
    const body: [number, number][] = [
      [edge, b], [edge, b - hgt * 0.86], [ridgeX, b - hgt],
      [backX, b - hgt * 0.44], [backX, b],
    ];
    solid(x, body, '#9C917A', rnd, EARTH.BISTRE, 0.32);
    inkLine(x, [[edge, b - hgt * 0.86], [ridgeX, b - hgt], [backX, b - hgt * 0.44]], rnd, 3.0, 0.02);
    inkLine(x, [[backX, b - hgt * 0.44], [backX, b]], rnd, 2.4, 0.06);
    // Boards down the slope, and a guy rope out to a stake in the dirt.
    for (let i = 1; i < 7; i++) {
      const t = i / 7;
      inkLine(x, [[edge + (ridgeX - edge) * t, b - hgt * (0.86 + 0.14 * t)],
                  [backX - dir * wd * 0.08, b - hgt * (0.44 + 0.42 * (1 - t))]], rnd, 1.2, 0.24);
    }
    inkLine(x, [[ridgeX, b - hgt], [ridgeX + dir * wd * 0.62, b - hgt * 0.1]], rnd, 1.4, 0.12);
  };
  nearShelter(-40, 1);
  nearShelter(W + 40, -1);

  // A stack of firewood and two leaning muskets at the frame edge.
  for (let i = 0; i < 5; i++) {
    const yy = y - i * 13 - 8;
    solid(x, [[210, yy], [390 - i * 8, yy - 4], [390 - i * 8, yy + 11], [210, yy + 13]],
      '#6E5A42', rnd, EARTH.BISTRE, 0.24);
    inkLine(x, [[210, yy], [390 - i * 8, yy - 4]], rnd, 1.3, 0.14);
  }
  inkLine(x, [[W - 420, H], [W - 378, y - 128]], rnd, 2.6, 0.05);
  inkLine(x, [[W - 388, H], [W - 366, y - 132]], rnd, 2.6, 0.05);

  // Trodden ground and a scatter of stakes across the very bottom.
  for (let i = 0; i < 60; i++) {
    const px = rnd() * W;
    const h = 10 + rnd() * 22;
    inkLine(x, [[px, H], [px + (rnd() - 0.5) * 8, H - h]], rnd, 1.0, 0.15);
  }
  for (let i = 0; i < 7; i++) {
    const py = y - 30 + rnd() * 60;
    inkLine(x, [[rnd() * W * 0.5, py], [rnd() * W * 0.5 + W * 0.4, py + (rnd() - 0.5) * 10]],
      rnd, 1.4, 0.3);
  }
  return c;
}

/** Plate sets, keyed by the name a scene declares. */
/**
 * Plate sets, keyed by the name a scene declares.
 *
 * Six planes, not five. The scene architecture argued for five on parallax
 * grounds — a seventh buys sub-2px movement nobody perceives — but that
 * argument is about apparent motion, not about occlusion. Depth sorting can
 * only be as granular as the layer count, and with one midground band
 * everything mid-scene shares a depth and the ground reads as two planes with
 * a hole between them. A sixth plane buys a second band a figure can walk
 * between, which is the difference between a set and a backdrop.
 */
/**
 * Cloud shadows: the same weather, seen on the ground.
 *
 * Soft dark pools drifting across the lawn a little slower than the clouds
 * above them. This is the effect that most makes a static painted set feel
 * like a place with air over it, and it costs one scrolling texture.
 */
export function cloudShadows(seed = 131): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(seed);
  const hy = H * HORIZON;
  for (let i = 0; i < 9; i++) {
    const cx = rnd() * W;
    const cy = hy + 40 + rnd() * (H - hy - 40);
    const cw = 260 + rnd() * 420;
    const ch = 60 + rnd() * 130;
    for (const wrap of [-W, 0, W]) {
      for (let k = 0; k < 5; k++) {
        const ox = cx + wrap + (rnd() - 0.5) * cw * 0.5;
        const oy = cy + (rnd() - 0.5) * ch * 0.5;
        const rw = cw * (0.3 + rnd() * 0.35);
        const rh = ch * (0.4 + rnd() * 0.4);
        wash(x, [[ox - rw, oy], [ox - rw * 0.4, oy - rh], [ox + rw * 0.5, oy - rh * 0.85],
                 [ox + rw, oy + rh * 0.2], [ox + rw * 0.2, oy + rh], [ox - rw * 0.6, oy + rh * 0.8]],
          EARTH.SHADOW_SLATE, 0.032, rnd, 3);
      }
    }
  }
  return c;
}

/**
 * A small flying insect, drawn at the size it will actually be seen.
 *
 * Two wings, a body, and nothing else — anything more is invisible at eighteen
 * pixels and only costs fill rate. The wings are drawn spread; the flutter is
 * done at runtime by squeezing the sprite horizontally, which reads as a
 * wingbeat and costs nothing.
 */
export function insect(kind: 'butterfly' | 'fly' | 'dragonfly', seed: number): HTMLCanvasElement {
  const size = 40;
  const { c, x } = surface(size, size);
  const rnd = mulberry(seed);
  const cx = size / 2;
  const cy = size / 2;

  if (kind === 'butterfly') {
    const wing = rnd() < 0.5 ? EARTH.YELLOW_OCHRE : '#C7A96B';
    // Both wings cross the midline rather than meeting on it. Wings that merely
    // touch at the centre pinch into a notched V once the runtime squeeze
    // closes them, and the whole thing stops reading as an animal.
    for (const side of [-1, 1]) {
      wash(x, [[cx - side * 3, cy - 3], [cx + side * 16, cy - 13], [cx + side * 18, cy - 1],
               [cx + side * 7, cy + 4]], wing, 0.85, rnd, 3);
      wash(x, [[cx - side * 2, cy + 1], [cx + side * 12, cy + 3], [cx + side * 10, cy + 13],
               [cx, cy + 6]], wing, 0.7, rnd, 3);
      inkLine(x, [[cx, cy - 2], [cx + side * 16, cy - 13], [cx + side * 18, cy - 1],
                  [cx + side * 7, cy + 4]], rnd, 0.9, 0.08);
    }
    // Body last, wide enough to survive the squeeze and hold the two halves
    // together as one silhouette.
    wash(x, [[cx - 2.4, cy - 8], [cx + 2.4, cy - 8], [cx + 1.8, cy + 11], [cx - 1.8, cy + 11]],
      INK.SETTLED, 0.9, rnd, 2);
    for (const side of [-1, 1]) {
      inkLine(x, [[cx, cy - 7], [cx + side * 5, cy - 13]], rnd, 0.7, 0.1); // antennae
    }
  } else if (kind === 'dragonfly') {
    for (const side of [-1, 1]) {
      for (const dy of [-3, 2]) {
        wash(x, [[cx - side * 2, cy + dy], [cx + side * 18, cy + dy - 3],
                 [cx + side * 18, cy + dy + 3], [cx - side * 2, cy + dy + 3]],
          EARTH.SHADOW_SLATE, 0.5, rnd, 2);
        inkLine(x, [[cx, cy + dy], [cx + side * 18, cy + dy - 2]], rnd, 0.7, 0.14);
      }
    }
    wash(x, [[cx - 2.2, cy - 6], [cx + 2.2, cy - 6], [cx + 1.2, cy + 16], [cx - 1.2, cy + 16]],
      EARTH.TERRE_VERTE, 0.95, rnd, 2);
    inkLine(x, [[cx, cy - 6], [cx, cy + 16]], rnd, 1.1, 0.06);
  } else {
    for (const side of [-1, 1]) {
      wash(x, [[cx, cy - 1], [cx + side * 8, cy - 5], [cx + side * 8, cy + 1], [cx, cy + 2]],
        PAPER.BRIGHT, 0.45, rnd, 2);
    }
    wash(x, [[cx - 2, cy - 2], [cx + 2, cy - 2], [cx + 1.6, cy + 5], [cx - 1.6, cy + 5]],
      INK.FLOOR, 0.9, rnd, 2);
  }
  return c;
}

/**
 * Near-field motes — seed, dust, insects in a shaft of light.
 *
 * Tileable in both axes so it can drift diagonally forever. Kept faint enough
 * to be felt rather than counted.
 */
export function motes(seed = 149): HTMLCanvasElement {
  const { c, x } = surface(512, 512);
  const rnd = mulberry(seed);
  x.fillStyle = PAPER.BRIGHT;
  for (let i = 0; i < 90; i++) {
    const px = rnd() * 512;
    const py = rnd() * 512;
    const r = 0.7 + rnd() * 1.9;
    for (const wx of [-512, 0, 512]) {
      for (const wy of [-512, 0, 512]) {
        x.globalAlpha = 0.10 + rnd() * 0.22;
        x.beginPath();
        x.arc(px + wx, py + wy, r, 0, 7);
        x.fill();
      }
    }
  }
  x.globalAlpha = 1;
  return c;
}

/** Cloud strips, one per set — the camp's sky is colder and heavier. */
export const CLOUD_BANDS: Record<string, () => HTMLCanvasElement> = {
  vernon: () => cloudBand(91, EARTH.SHADOW_SLATE),
  camp: () => cloudBand(97, EARTH.WET_STONE),
  lines: () => cloudBand(419, EARTH.SHADOW_SLATE),
};

/**
 * How deep each plate stands, for occlusion.
 *
 * A plate is a flat painting, so the renderer needs one depth per plate to
 * decide whether a figure passes in front of it or behind it. That number has
 * to be the depth of the nearest thing painted on the plate — and it was
 * hand-chosen instead, which drifted the moment the ground curve changed.
 *
 * The consequence was that a player walking to the back of Mount Vernon
 * vanished. Sky, hills, the house plate and the far midground all paint content
 * beyond the walkable band entirely, but were declared at 0.94, 0.80 and 0.62,
 * so a figure at z = 0.72 was sorted behind scenery that stands far behind him
 * — including the ground wash that covers the whole lower frame.
 *
 * They are derived now. The limitation that remains is real and worth stating:
 * one depth per plate cannot describe a plate whose content spans a range of
 * distances, so the nearest thing on it wins and anything painted further back
 * on the same plate over-occludes. Splitting a plate is the fix when that shows.
 */
const nearestOn = (plateY: number) => zAtPlateY(plateY, H);


/* ------------------------------------------------------------ the lines
 *
 * CB-03: the American works above Charlestown.
 *
 * The far bands are the camp's, unchanged — from these hills you are looking at
 * the same Boston, the same burned Charlestown and the same fleet, which is
 * exactly the point of the scene and a good reason not to draw them twice.
 * What is new is the ground: a hill crown with an earthwork along it, the slope
 * falling away to the water, and an abatis on the forward face.
 */
export function linesGround(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(311);
  const hy = H * HORIZON;

  // Turf, thin and much walked on, over subsoil the digging has turned up.
  solid(x, [[0, hy + 6], [W, hy + 2], [W, H], [0, H]], '#B9B79C', rnd);
  wash(x, [[0, hy + 6], [W, hy + 2], [W, H], [0, H]], EARTH.TERRE_VERTE, 0.16, rnd);
  wash(x, [[0, hy + 150], [W, hy + 120], [W, H], [0, H]], EARTH.RAW_UMBER, 0.18, rnd);

  // The forward slope, falling away to the left toward the water. Everything on
  // that side is spoil and nothing grows on it.
  const brow: [number, number][] = [];
  for (let i = 0; i <= 22; i++) {
    brow.push([(i / 22) * W, hy + 66 + Math.sin(i * 0.55) * 9 - (i / 22) * 26]);
  }
  solid(x, [...brow, [W, hy + 4], [0, hy + 8]], '#A79878', rnd, EARTH.RAW_UMBER, 0.26);
  inkLine(x, brow, rnd, 1.6, 0.14);
  for (let i = 0; i < 40; i++) {
    const px = rnd() * W;
    const py = hy + 20 + rnd() * 44;
    inkLine(x, [[px, py], [px + 18 + rnd() * 30, py + 6 + rnd() * 8]], rnd, 0.8, 0.3);
  }

  // The trodden way along the crown, worn to bare earth by half a mile of feet.
  {
    const way: [number, number][] = [];
    const edge = (side: number) => {
      const out: [number, number][] = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const z = -0.04 + t * 0.92;
        out.push([0.46 + 0.10 * t + side * (0.20 - 0.11 * t), z]);
      }
      return out;
    };
    for (const [gx, z] of edge(-1)) { const a = platePx({ x: gx, z }, W, H); way.push([a.x, a.y]); }
    for (const [gx, z] of edge(1).reverse()) { const a = platePx({ x: gx, z }, W, H); way.push([a.x, a.y]); }
    solid(x, way, '#A2937E', rnd, EARTH.RAW_UMBER, 0.2);
  }

  groundLitter(x, rnd, hy + 90, H - 40, 60, 0.8);
  return c;
}

/** The reverse slope: the graves, and the huts below them. */
export function linesFarMidground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(317);
  const hy = H * HORIZON;
  const base = hy + 86;

  // Distant camp on the low ground behind, seen as a mass.
  for (let i = 0; i < 34; i++) {
    const px = rnd() * W;
    const bw = 22 + rnd() * 30;
    const bh = 12 + rnd() * 18;
    wash(x, [[px, base], [px + bw * 0.3, base - bh], [px + bw, base - bh * 0.5], [px + bw, base]],
      PAPER.SMOKED, 0.34, rnd, 3);
    inkLine(x, [[px, base], [px + bw * 0.3, base - bh], [px + bw, base - bh * 0.5]], rnd, 1.0, 0.24);
  }
  for (const sx of [W * 0.18, W * 0.44, W * 0.72, W * 0.9]) {
    for (let k = 0; k < 5; k++) {
      const t = k / 5;
      wash(x, [[sx - 7 - t * 18, base - 96 * t], [sx + 7 + t * 17, base - 96 * t - 5],
               [sx + 5 + t * 22, base - 96 * (t + 0.24)], [sx - 9 - t * 15, base - 96 * (t + 0.2)]],
        EARTH.WET_STONE, 0.10, rnd, 3);
    }
  }
  return haze(c, 0.22, PAPER.COOL);
}

/**
 * The parapet itself, and the things stood along it.
 *
 * Gabions — wicker baskets filled with earth — with fascine bundles between
 * them, which is the whole science of a field work: sticks, baskets and dirt.
 * An embrasure cut through for a gun that is not there yet, because in November
 * 1775 it was not.
 */
export function linesMidground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(331);
  const hy = H * HORIZON;
  const base = hy + 214;
  const man = (b: number) => figureAtPlateY(b, H);

  const shadow = (cx: number, b: number, r: number) =>
    wash(x, [[cx - r, b], [cx + r, b - 3], [cx + r * 0.7, b + r * 0.22], [cx - r * 0.8, b + r * 0.24]],
      EARTH.BISTRE, 0.20, rnd, 3);

  // The bank: a long earth mass with a firing step cut behind it.
  const crest: [number, number][] = [];
  for (let i = 0; i <= 26; i++) {
    crest.push([(i / 26) * W, base - man(base) * 1.02 + Math.sin(i * 0.7) * 7 + rnd() * 5]);
  }
  solid(x, [...crest, [W, base + 60], [0, base + 60]], '#9C8C6E', rnd, EARTH.RAW_UMBER, 0.28);
  inkLine(x, crest, rnd, 2.2, 0.05);
  // Turf laid on the outer face, in courses.
  for (let r = 1; r < 5; r++) {
    const off: [number, number][] = crest.map(([px, py]) => [px, py + r * 13]);
    inkLine(x, off, rnd, 0.9, 0.4);
  }

  /*
   * Gabions along the crest, sized in man-heights like everything else. A
   * gabion stood about chest high on the man filling it — that is what made
   * them useful, since a man could carry the empty basket and fill it in place
   * under fire.
   */
  const gh = man(base) * 0.78;
  for (let i = 0; i < 9; i++) {
    const cx = W * 0.06 + i * W * 0.108 + (rnd() - 0.5) * 12;
    const b = base - man(base) * 0.92 + (rnd() - 0.5) * 8;
    const gw = gh * 0.62;
    solid(x, [[cx - gw / 2, b - gh], [cx + gw / 2, b - gh], [cx + gw / 2 + 2, b],
              [cx - gw / 2 - 2, b]], '#9A8258', rnd, EARTH.BISTRE, 0.24);
    inkLine(x, [[cx - gw / 2, b - gh], [cx + gw / 2, b - gh], [cx + gw / 2 + 2, b],
                [cx - gw / 2 - 2, b], [cx - gw / 2, b - gh]], rnd, 1.8, 0.06);
    // The weave: uprights and three bands round.
    for (let k = 1; k < 5; k++) {
      inkLine(x, [[cx - gw / 2 + (gw * k) / 5, b - gh], [cx - gw / 2 + (gw * k) / 5, b]],
        rnd, 1.0, 0.22);
    }
    for (const f of [0.22, 0.55, 0.86]) {
      inkLine(x, [[cx - gw / 2 - 1, b - gh + gh * f], [cx + gw / 2 + 1, b - gh + gh * f]],
        rnd, 1.2, 0.14);
    }
    // Fascine bundle wedged in the gap.
    if (i < 8) {
      const fx = cx + W * 0.054;
      const fh = gh * 0.34;
      solid(x, [[fx - gw * 0.44, b - fh], [fx + gw * 0.44, b - fh], [fx + gw * 0.44, b],
                [fx - gw * 0.44, b]], '#7C6B4A', rnd, EARTH.BISTRE, 0.3);
      for (let k = 0; k < 5; k++) {
        inkLine(x, [[fx - gw * 0.44, b - fh + (fh * k) / 5], [fx + gw * 0.44, b - fh + (fh * k) / 5 + 2]],
          rnd, 1.0, 0.2);
      }
      inkLine(x, [[fx - gw * 0.2, b - fh - 2], [fx - gw * 0.2, b + 2]], rnd, 1.4, 0.1);
    }
  }

  // An embrasure: a gap cut through the bank, splayed outward, with no gun in
  // it. Knox is somewhere on the road from Ticonderoga with the guns.
  {
    const ex = W * 0.60;
    const eh = man(base) * 0.66;
    const eb = base - man(base) * 0.92;
    solid(x, [[ex - 34, eb - eh], [ex + 34, eb - eh], [ex + 52, eb], [ex - 52, eb]],
      '#6E6146', rnd, INK.SETTLED, 0.22);
    inkLine(x, [[ex - 34, eb - eh], [ex - 52, eb]], rnd, 1.8, 0.06);
    inkLine(x, [[ex + 34, eb - eh], [ex + 52, eb]], rnd, 1.8, 0.06);
  }

  // The spyglass on its rest, stage right, which is what the scene is for.
  {
    const sx = W * 0.845;
    const sb = base + 28;
    const sh = man(sb) * 0.92;
    for (const d of [-16, 0, 16]) {
      inkLine(x, [[sx + d, sb], [sx - d * 0.15, sb - sh]], rnd, 2.4, 0.04);
    }
    inkLine(x, [[sx - 40, sb - sh - 6], [sx + 42, sb - sh + 4]], rnd, 3.4, 0.02);
    solid(x, [[sx - 40, sb - sh - 10], [sx - 20, sb - sh - 9], [sx - 21, sb - sh - 1],
              [sx - 41, sb - sh - 2]], '#4A4038', rnd);
    shadow(sx, sb, 30);
  }

  groundLitter(x, rnd, base + 10, base + 120, 60, 0.9);
  return c;
}

/** Near gabions and the firing step, cropping the bottom corners. */
export function linesForeground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(337);

  // A gabion at the player's own scale at each corner, so he stands among them.
  for (const [edge, dir] of [[-30, 1], [W + 30, -1]] as [number, number][]) {
    const b = H * 1.04;
    const gh = figureAtPlateY(H * 0.9, H) * 1.1;
    const gw = gh * 0.66;
    const cx = edge + dir * gw * 0.5;
    solid(x, [[cx - gw / 2, b - gh], [cx + gw / 2, b - gh], [cx + gw / 2 + 4, b],
              [cx - gw / 2 - 4, b]], '#8E7A52', rnd, EARTH.BISTRE, 0.3);
    inkLine(x, [[cx - gw / 2, b - gh], [cx + gw / 2, b - gh]], rnd, 3.0, 0.03);
    for (let k = 1; k < 7; k++) {
      inkLine(x, [[cx - gw / 2 + (gw * k) / 7, b - gh], [cx - gw / 2 + (gw * k) / 7, b]],
        rnd, 1.6, 0.18);
    }
    for (const f of [0.2, 0.5, 0.8]) {
      inkLine(x, [[cx - gw / 2 - 3, b - gh + gh * f], [cx + gw / 2 + 3, b - gh + gh * f]],
        rnd, 2.0, 0.1);
    }
  }

  // Sharpened stakes of the abatis, cropping in along the very bottom.
  for (let i = 0; i < 9; i++) {
    const px = W * 0.12 + i * W * 0.094;
    inkLine(x, [[px, H], [px + 54, H - 74 - (i % 3) * 16]], rnd, 3.4, 0.03);
    inkLine(x, [[px + 40, H - 58], [px + 74, H - 50]], rnd, 2.0, 0.1);
    inkLine(x, [[px + 26, H - 34], [px - 6, H - 26]], rnd, 2.0, 0.12);
  }
  for (let i = 0; i < 50; i++) {
    const px = rnd() * W;
    const h = 8 + rnd() * 18;
    inkLine(x, [[px, H], [px + (rnd() - 0.5) * 8, H - h]], rnd, 1.0, 0.18);
  }
  return c;
}

export const PLATE_DEPTHS: Record<string, number[]> = {
  //          sky  hills  ground  farMid            midground             foreground
  vernon: [1, 1, 1, 1, nearestOn(H * HORIZON + 236), 0],
  camp: [1, 1, 1, 1, nearestOn(H * HORIZON + 251), 0],
  lines: [1, 1, 1, 1, nearestOn(H * HORIZON + 214), 0],
};

export const PLATE_SETS: Record<string, () => HTMLCanvasElement[]> = {
  vernon: () => [
    layerSky(), layerHills(), layerHouse(),
    layerFarMidground(), layerMidground(), layerForeground(),
  ],
  camp: () => [
    campSky(), campHills(), campGround(),
    campFarMidground(), campMidground(), campForeground(),
  ],
  // Same sky and same far shore as the camp: from these hills you are looking
  // at the same Boston, which is the point of the scene.
  lines: () => [
    campSky(), campHills(), linesGround(),
    linesFarMidground(), linesMidground(), linesForeground(),
  ],
};

/* -------------------------------------------------------------- set pieces
 *
 * The objects the interactables name.
 *
 * Every interactable in the game had a label, an examine string and nothing on
 * the ground under it: the player walked up to bare grass and was told there
 * was a kettle there. These are drawn small and read by silhouette, because
 * that is all there is at the size a thing on the ground gets.
 *
 * Each sprite is drawn into a box of PROP_H man-heights and placed by the
 * renderer off the same ground curve as the figures, so a musket leaning at the
 * back of the scene is the right size relative to the man walking toward it
 * without anybody choosing a number.
 */
export type PropKind =
  | 'papers' | 'chest' | 'uniform' | 'sash' | 'kettle' | 'musket' | 'horn'
  | 'shirt' | 'necessary' | 'canteen' | 'barrel' | 'fire' | 'table' | 'horse'
  | 'bucket' | 'drum';

/** Height of each prop as a fraction of a standing man at the same depth. */
export const PROP_H: Record<PropKind, number> = {
  papers: 0.44, chest: 0.30, uniform: 0.52, sash: 0.30, kettle: 0.40,
  musket: 0.98, horn: 0.62, shirt: 0.62, necessary: 0.72, canteen: 0.60,
  barrel: 0.46, fire: 0.34, table: 0.62, horse: 1.06, bucket: 0.24, drum: 0.46,
};

/**
 * Canvas box per kind, where a square one will not do.
 *
 * Most props are about as wide as they are tall and fit a square. A horse is
 * not: it is half again as long as it stands, and drawing one into a 128 box
 * put its head at x = -44 and clipped it clean off. That is why the first two
 * attempts read as llamas — the head was never there to look at.
 */
const PROP_BOX: Partial<Record<PropKind, { w: number; h: number }>> = {
  horse: { w: 230, h: 150 },
  necessary: { w: 150, h: 128 },
};

export function prop(kind: PropKind, seed: number): HTMLCanvasElement {
  const dims = PROP_BOX[kind] ?? { w: 128, h: 128 };
  const { c, x } = surface(dims.w, dims.h);
  const rnd = mulberry(seed);
  const cx = dims.w / 2;
  const b = dims.h - 4; // everything stands on this line

  const box = (x0: number, y0: number, w: number, h: number, fill: string, tint?: string) => {
    const pts: [number, number][] = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]];
    solid(x, pts, fill, rnd, tint, 0.24);
    inkLine(x, [...pts, pts[0]], rnd, 2.0, 0.06);
  };

  switch (kind) {
    case 'papers': {
      /*
       * Paper does not lie on grass.
       *
       * Loose sheets scattered on a lawn was the wrong answer twice over: they
       * would blow away, and nobody in 1775 treated a document like that. What
       * is actually happening in this scene is that the house is being emptied
       * into a chariot bound for Philadelphia, so documents are out of doors
       * because they are being packed — which means they are in something.
       *
       * Two sorts, off the seed. A japanned tin document box with the papers
       * standing in it, or a portfolio propped against a packing case with the
       * loose sheets weighted under a stone. Both work equally well on a Virginia
       * lawn and in a camp street, which is the point of choosing them.
       */
      if (seed % 2 === 0) {
        // Packing case, with the portfolio leaning on it.
        const cw = 74;
        const ch = 46;
        solid(x, [[cx - cw / 2, b - ch], [cx + cw / 2, b - ch], [cx + cw / 2, b], [cx - cw / 2, b]],
          '#8A7052', rnd, EARTH.RAW_UMBER, 0.24);
        inkLine(x, [[cx - cw / 2, b - ch], [cx + cw / 2, b - ch], [cx + cw / 2, b],
                    [cx - cw / 2, b], [cx - cw / 2, b - ch]], rnd, 1.8, 0.06);
        for (const f of [0.3, 0.7]) {
          inkLine(x, [[cx - cw / 2, b - ch + ch * f], [cx + cw / 2, b - ch + ch * f]], rnd, 1.0, 0.3);
        }
        // Portfolio: a leather cover with a strap, leaning against the case.
        const port: [number, number][] = [[cx - 34, b - 2], [cx - 20, b - 62],
          [cx + 16, b - 58], [cx + 4, b + 2]];
        solid(x, port, '#6E4F38', rnd, EARTH.BISTRE, 0.26);
        inkLine(x, [...port, port[0]], rnd, 1.8, 0.06);
        inkLine(x, [[cx - 27, b - 32], [cx + 10, b - 28]], rnd, 1.4, 0.12); // strap
        // Two sheets on the case lid, with a stone on them.
        solid(x, [[cx - 6, b - ch - 3], [cx + 34, b - ch - 7], [cx + 36, b - ch + 3],
                  [cx - 4, b - ch + 6]], PAPER.BRIGHT, rnd);
        inkLine(x, [[cx - 6, b - ch - 3], [cx + 34, b - ch - 7]], rnd, 1.2, 0.14);
        solid(x, [[cx + 12, b - ch - 12], [cx + 26, b - ch - 14], [cx + 28, b - ch - 4],
                  [cx + 13, b - ch - 3]], '#9A968C', rnd, EARTH.SHADOW_SLATE, 0.3);
      } else {
        // Japanned tin box, lid back, documents standing in it.
        const bw2 = 66;
        const bh2 = 40;
        solid(x, [[cx - bw2 / 2, b - bh2], [cx + bw2 / 2, b - bh2],
                  [cx + bw2 / 2, b], [cx - bw2 / 2, b]], '#2E2A26', rnd, EARTH.BISTRE, 0.18);
        inkLine(x, [[cx - bw2 / 2, b - bh2], [cx + bw2 / 2, b - bh2], [cx + bw2 / 2, b],
                    [cx - bw2 / 2, b], [cx - bw2 / 2, b - bh2]], rnd, 1.8, 0.06);
        // Lid, hinged back.
        solid(x, [[cx - bw2 / 2, b - bh2], [cx - bw2 / 2 - 10, b - bh2 - 34],
                  [cx + 8, b - bh2 - 30], [cx + bw2 / 2, b - bh2]], '#3A342E', rnd);
        inkLine(x, [[cx - bw2 / 2, b - bh2], [cx - bw2 / 2 - 10, b - bh2 - 34],
                    [cx + 8, b - bh2 - 30]], rnd, 1.6, 0.08);
        // Papers standing in the box, edges up.
        for (let i = 0; i < 4; i++) {
          const px2 = cx - 22 + i * 12;
          solid(x, [[px2, b - bh2 - 2], [px2 + 10, b - bh2 - 5 - i], [px2 + 11, b - bh2 + 16],
                    [px2 + 1, b - bh2 + 18]], i === 1 ? PAPER.BRIGHT : '#DED7C2', rnd);
          inkLine(x, [[px2, b - bh2 - 2], [px2 + 10, b - bh2 - 5 - i]], rnd, 1.1, 0.2);
        }
      }
      break;
    }
    case 'chest': {
      box(cx - 44, b - 52, 88, 52, '#7A6248', EARTH.BISTRE);
      solid(x, [[cx - 48, b - 66], [cx + 48, b - 66], [cx + 44, b - 50], [cx - 44, b - 50]],
        '#8A7052', rnd, EARTH.RAW_UMBER, 0.2);
      inkLine(x, [[cx - 48, b - 66], [cx + 48, b - 66], [cx + 44, b - 50], [cx - 44, b - 50],
                  [cx - 48, b - 66]], rnd, 2.0, 0.06);
      for (const f of [-0.5, 0.5]) inkLine(x, [[cx + 88 * f * 0.5, b - 64], [cx + 88 * f * 0.5, b - 4]], rnd, 1.8, 0.12);
      box(cx - 8, b - 44, 16, 14, '#9A9184');
      break;
    }
    case 'uniform': {
      /*
       * Laid over the lid of an open trunk, because it is being packed.
       *
       * It hung on a peg before, and a clothes peg standing free on a lawn is a
       * stranger object than the coat on it. The trunk also says what the coat
       * is for: he had it made, and it is going to Philadelphia whether or not
       * he has decided what he is going as.
       */
      const tw = 84;
      const th = 40;
      solid(x, [[cx - tw / 2, b - th], [cx + tw / 2, b - th], [cx + tw / 2, b], [cx - tw / 2, b]],
        '#6E5238', rnd, EARTH.BISTRE, 0.24);
      inkLine(x, [[cx - tw / 2, b - th], [cx + tw / 2, b - th], [cx + tw / 2, b],
                  [cx - tw / 2, b], [cx - tw / 2, b - th]], rnd, 1.8, 0.06);
      for (const f of [0.28, 0.72]) {
        inkLine(x, [[cx - tw / 2 + tw * f, b - th], [cx - tw / 2 + tw * f, b]], rnd, 1.3, 0.14);
      }
      // Lid, standing open behind.
      solid(x, [[cx - tw / 2, b - th], [cx - tw / 2 + 6, b - th - 44],
                [cx + tw / 2 + 6, b - th - 40], [cx + tw / 2, b - th]], '#5E452F', rnd,
        EARTH.BISTRE, 0.3);
      inkLine(x, [[cx - tw / 2 + 6, b - th - 44], [cx + tw / 2 + 6, b - th - 40]], rnd, 1.6, 0.08);

      // The coat itself, folded over the near edge: shoulders down, skirts hanging.
      const coatPts: [number, number][] = [
        [cx - 30, b - th - 12], [cx + 26, b - th - 16], [cx + 32, b - th + 4],
        [cx + 24, b - 6], [cx - 22, b - 2], [cx - 34, b - th + 6],
      ];
      solid(x, coatPts, MEANING.CONTINENTAL_BLUE, rnd, INK.SETTLED, 0.12);
      inkLine(x, [...coatPts, coatPts[0]], rnd, 1.8, 0.06);
      // Buff facing showing where it is turned back, and a run of buttons.
      solid(x, [[cx - 30, b - th - 12], [cx - 12, b - th - 14], [cx - 6, b - 6],
                [cx - 22, b - 2]], '#D8C79A', rnd, EARTH.YELLOW_OCHRE, 0.16);
      inkLine(x, [[cx - 12, b - th - 14], [cx - 6, b - 6]], rnd, 1.3, 0.14);
      x.fillStyle = '#B8933F';
      for (let i = 0; i < 4; i++) {
        x.globalAlpha = 0.85;
        x.beginPath();
        x.arc(cx + 8 + i * 2, b - th - 6 + i * 12, 2.4, 0, 7);
        x.fill();
      }
      x.globalAlpha = 1;
      break;
    }
    case 'sash': {
      // In the box it has been kept in for twenty years. A silk sash lying on
      // grass would be a careless thing, and carelessness is the one charge
      // nobody ever laid against him.
      const bw3 = 68;
      const bh3 = 26;
      solid(x, [[cx - bw3 / 2, b - bh3], [cx + bw3 / 2, b - bh3], [cx + bw3 / 2, b],
                [cx - bw3 / 2, b]], '#5E452F', rnd, EARTH.BISTRE, 0.26);
      inkLine(x, [[cx - bw3 / 2, b - bh3], [cx + bw3 / 2, b - bh3], [cx + bw3 / 2, b],
                  [cx - bw3 / 2, b], [cx - bw3 / 2, b - bh3]], rnd, 1.7, 0.06);
      solid(x, [[cx - bw3 / 2, b - bh3], [cx - bw3 / 2 + 5, b - bh3 - 30],
                [cx + bw3 / 2 + 5, b - bh3 - 27], [cx + bw3 / 2, b - bh3]], '#4E3927', rnd);
      inkLine(x, [[cx - bw3 / 2 + 5, b - bh3 - 30], [cx + bw3 / 2 + 5, b - bh3 - 27]], rnd, 1.5, 0.08);
      // The sash, folded into it and spilling a little over the front edge.
      const silk: [number, number][] = [[cx - 28, b - bh3 - 2], [cx + 26, b - bh3 - 5],
        [cx + 24, b - bh3 + 12], [cx + 8, b - bh3 + 16], [cx - 26, b - bh3 + 13]];
      solid(x, silk, '#8E4A44', rnd, EARTH.MADDER_LAKE, 0.32);
      inkLine(x, [...silk, silk[0]], rnd, 1.4, 0.1);
      for (const f of [-14, 2, 16]) {
        inkLine(x, [[cx + f, b - bh3 - 3], [cx + f + 2, b - bh3 + 13]], rnd, 1.1, 0.24);
      }
      break;
    }
    case 'kettle': {
      for (const d of [-30, 0, 30]) inkLine(x, [[cx + d, b], [cx - d * 0.2, b - 78]], rnd, 2.2, 0.05);
      const pot: [number, number][] = [[cx - 26, b - 52], [cx + 26, b - 52], [cx + 20, b - 12],
        [cx - 20, b - 12]];
      solid(x, pot, '#3E3A34', rnd);
      inkLine(x, [...pot, pot[0]], rnd, 2.0, 0.06);
      inkLine(x, [[cx - 26, b - 52], [cx, b - 68], [cx + 26, b - 52]], rnd, 1.8, 0.1);
      break;
    }
    case 'musket': {
      inkLine(x, [[cx - 20, b], [cx + 14, b - 112]], rnd, 3.0, 0.03);
      const stock: [number, number][] = [[cx - 20, b], [cx - 10, b - 4], [cx + 2, b - 54],
        [cx - 8, b - 56]];
      solid(x, stock, '#6E5638', rnd, EARTH.BISTRE, 0.24);
      inkLine(x, [...stock, stock[0]], rnd, 1.8, 0.08);
      inkLine(x, [[cx - 4, b - 60], [cx + 10, b - 58]], rnd, 2.0, 0.1); // lock
      break;
    }
    case 'horn': {
      // Hung on a stake, strap and all. A powder horn left lying in camp mud
      // would be a ruined horn, and powder was the one thing this army could
      // not replace.
      inkLine(x, [[cx + 6, b], [cx + 2, b - 96]], rnd, 2.6, 0.03);
      inkLine(x, [[cx + 2, b - 92], [cx - 20, b - 62], [cx - 4, b - 40]], rnd, 1.4, 0.1); // strap
      /*
       * The horn itself: a long cone with a curve in it, wide at the butt where
       * the plug goes and narrowing to the spout. Drawn as a parallelogram it
       * read as a shingle. Sampling the taper along a curve is the whole
       * difference, and it costs eight points.
       */
      const upper: [number, number][] = [];
      const lower: [number, number][] = [];
      for (let i = 0; i <= 7; i++) {
        const t = i / 7;
        const px2 = cx - 30 + t * 52;
        const py2 = b - 52 - Math.sin(t * Math.PI) * 11 + t * 4;
        const half = 13 * (1 - t) + 2.4;
        upper.push([px2, py2 - half]);
        lower.push([px2, py2 + half]);
      }
      const horn: [number, number][] = [...upper, ...lower.reverse()];
      solid(x, horn, '#CBBE96', rnd, EARTH.YELLOW_OCHRE, 0.24);
      inkLine(x, [...horn, horn[0]], rnd, 1.6, 0.06);
      // Scribed rings near the spout, and the wooden butt plug.
      for (const t of [0.62, 0.74]) {
        const px2 = cx - 30 + t * 52;
        const py2 = b - 52 - Math.sin(t * Math.PI) * 11 + t * 4;
        const half = 13 * (1 - t) + 2.4;
        inkLine(x, [[px2, py2 - half], [px2, py2 + half]], rnd, 1.1, 0.14);
      }
      solid(x, [[cx + 18, b - 44], [cx + 24, b - 43], [cx + 24, b - 37], [cx + 18, b - 38]],
        '#6E5238', rnd);
      solid(x, [[cx - 32, b - 65], [cx - 27, b - 66], [cx - 27, b - 39], [cx - 32, b - 38]],
        '#8A6F52', rnd, EARTH.BISTRE, 0.24);
      break;
    }
    case 'shirt': {
      inkLine(x, [[cx - 52, b - 96], [cx + 52, b - 90]], rnd, 1.6, 0.1); // the line
      const sh: [number, number][] = [[cx - 34, b - 94], [cx + 34, b - 92], [cx + 40, b - 60],
        [cx + 26, b - 58], [cx + 22, b - 4], [cx - 24, b - 2], [cx - 28, b - 58], [cx - 40, b - 60]];
      solid(x, sh, '#CFC6AC', rnd, EARTH.RAW_UMBER, 0.16);
      inkLine(x, [...sh, sh[0]], rnd, 1.8, 0.08);
      inkLine(x, [[cx - 6, b - 92], [cx - 2, b - 62]], rnd, 1.4, 0.2);
      break;
    }
    case 'necessary': {
      // A screen of boards round a trench. Nobody drew it and everyone used it.
      for (let i = 0; i < 5; i++) {
        const px = cx - 34 + i * 15;
        box(px, b - 92 - (i % 2) * 6, 12, 92, i % 2 ? '#9C8A6E' : '#8A7A60', EARTH.BISTRE);
      }
      inkLine(x, [[cx - 36, b - 60], [cx + 42, b - 56]], rnd, 1.6, 0.16);
      break;
    }
    case 'canteen': {
      // A cheesebox canteen — a wooden cheese hoop with two heads let into it
      // and a strap — hung on a shelter pole beside the horn, for the same
      // reason. Round, which is what tells it from every square thing in camp.
      inkLine(x, [[cx - 4, b], [cx, b - 92]], rnd, 2.6, 0.03);
      inkLine(x, [[cx, b - 88], [cx - 22, b - 70], [cx - 14, b - 56]], rnd, 1.4, 0.1); // strap
      x.save();
      x.translate(cx - 6, b - 34);
      const r0 = 26;
      x.fillStyle = '#B49B74';
      x.beginPath();
      x.ellipse(0, 0, r0, r0 * 0.94, 0, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 0.26;
      x.fillStyle = EARTH.RAW_UMBER;
      x.beginPath();
      x.ellipse(0, 0, r0, r0 * 0.94, 0, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 0.9;
      x.strokeStyle = INK.SETTLED;
      x.lineWidth = 1.9;
      x.beginPath();
      x.ellipse(0, 0, r0, r0 * 0.94, 0, 0, Math.PI * 2);
      x.stroke();
      x.lineWidth = 1.2;
      x.globalAlpha = 0.6;
      x.beginPath();
      x.ellipse(0, 0, r0 * 0.72, r0 * 0.68, 0, 0, Math.PI * 2);
      x.stroke();
      x.globalAlpha = 1;
      x.restore();
      solid(x, [[cx - 12, b - 60], [cx, b - 62], [cx + 1, b - 52], [cx - 11, b - 50]],
        '#6E5238', rnd); // the spout bung
      break;
    }
    case 'barrel': {
      const pts: [number, number][] = [[cx - 30, b - 76], [cx + 30, b - 76], [cx + 34, b - 4],
        [cx - 34, b - 4]];
      solid(x, pts, '#8A7150', rnd, EARTH.RAW_UMBER, 0.26);
      inkLine(x, [...pts, pts[0]], rnd, 2.2, 0.05);
      for (const f of [0.24, 0.72]) {
        inkLine(x, [[cx - 31 - f * 6, b - 76 + 72 * f], [cx + 31 + f * 6, b - 76 + 72 * f]], rnd, 1.8, 0.1);
      }
      break;
    }
    case 'fire': {
      // Stones, sticks, and the flame. The flame is the only saturated thing
      // in the frame besides Washington's coat, so it is kept small.
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const sx0 = cx + Math.cos(a) * 44;
        const sy0 = b - 6 + Math.sin(a) * 12;
        solid(x, [[sx0 - 9, sy0 - 8], [sx0 + 9, sy0 - 10], [sx0 + 8, sy0], [sx0 - 8, sy0 + 1]],
          '#8E8A80', rnd, EARTH.SHADOW_SLATE, 0.24);
      }
      for (const d of [-26, -8, 12, 28]) {
        inkLine(x, [[cx + d, b - 6], [cx - d * 0.4, b - 42]], rnd, 2.2, 0.06);
      }
      const flame: [number, number][] = [[cx - 22, b - 26], [cx - 6, b - 62], [cx + 4, b - 44],
        [cx + 14, b - 74], [cx + 24, b - 24]];
      solid(x, flame, '#C9762F', rnd);
      solid(x, [[cx - 12, b - 22], [cx - 2, b - 48], [cx + 12, b - 20]], '#E0A64A', rnd);
      inkLine(x, [...flame, flame[0]], rnd, 1.4, 0.3);
      break;
    }
    case 'table': {
      /*
       * A trestle with a portable writing desk on it.
       *
       * The desk is the thing that makes this make sense out of doors: a
       * slope-front box with the ink and pens inside, carried to wherever the
       * work is. Washington used one for eight years of campaign. A bare table
       * with a sheet lying on it says somebody left their homework on the lawn.
       */
      // Trestle: a board on two splayed pairs of legs.
      for (const f of [-0.40, 0.40]) {
        const lx = cx + 104 * f;
        inkLine(x, [[lx - 8, b], [lx + 3, b - 54]], rnd, 2.4, 0.04);
        inkLine(x, [[lx + 10, b], [lx + 1, b - 54]], rnd, 2.4, 0.04);
        inkLine(x, [[lx - 5, b - 20], [lx + 8, b - 20]], rnd, 1.4, 0.16);
      }
      solid(x, [[cx - 56, b - 62], [cx + 56, b - 62], [cx + 56, b - 52], [cx - 56, b - 52]],
        '#8A7052', rnd, EARTH.RAW_UMBER, 0.24);
      inkLine(x, [[cx - 56, b - 62], [cx + 56, b - 62], [cx + 56, b - 52], [cx - 56, b - 52],
                  [cx - 56, b - 62]], rnd, 1.8, 0.06);

      // The writing desk: a wedge, hinged lid sloping toward the writer.
      const desk: [number, number][] = [[cx - 34, b - 62], [cx + 18, b - 62],
        [cx + 18, b - 84], [cx - 34, b - 74]];
      solid(x, desk, '#6E5238', rnd, EARTH.BISTRE, 0.24);
      inkLine(x, [...desk, desk[0]], rnd, 1.8, 0.05);
      inkLine(x, [[cx - 34, b - 68], [cx + 18, b - 74]], rnd, 1.2, 0.2); // the hinge line
      // A sheet on the slope, and the inkstand beside it.
      solid(x, [[cx - 28, b - 66], [cx + 10, b - 71], [cx + 11, b - 79], [cx - 27, b - 73]],
        PAPER.BRIGHT, rnd);
      inkLine(x, [[cx - 28, b - 66], [cx + 10, b - 71]], rnd, 1.1, 0.2);
      solid(x, [[cx + 26, b - 62], [cx + 42, b - 62], [cx + 40, b - 76], [cx + 28, b - 76]],
        '#3E3A34', rnd);
      inkLine(x, [[cx + 34, b - 76], [cx + 46, b - 102]], rnd, 1.5, 0.06); // quill
      break;
    }
    case 'bucket': {
      const pts: [number, number][] = [[cx - 24, b - 40], [cx + 24, b - 40], [cx + 18, b - 2],
        [cx - 18, b - 2]];
      solid(x, pts, '#8A7458', rnd, EARTH.BISTRE, 0.24);
      inkLine(x, [...pts, pts[0]], rnd, 2.0, 0.06);
      inkLine(x, [[cx - 24, b - 40], [cx, b - 58], [cx + 24, b - 40]], rnd, 1.6, 0.12);
      break;
    }
    case 'drum': {
      /*
       * A side drum: a wooden shell between two hoops, roped in a zigzag with
       * leather ears to tension it, sticks laid across the head. It was a plain
       * box with four diagonal scratches before, which is neither a drum nor
       * anything else.
       *
       * The drum is how an army is actually run — every order of the day
       * reaches the men as a beat, and Washington spent that summer trying to
       * get men who had never heard one to answer it.
       */
      const dw = 62;
      const dh = 52;
      const t0 = b - dh - 12;
      // Shell.
      solid(x, [[cx - dw / 2, t0], [cx + dw / 2, t0], [cx + dw / 2, t0 + dh],
                [cx - dw / 2, t0 + dh]], '#B8A276', rnd, EARTH.YELLOW_OCHRE, 0.26);
      // Hoops, top and bottom, darker.
      for (const hy2 of [t0, t0 + dh - 7]) {
        solid(x, [[cx - dw / 2 - 3, hy2], [cx + dw / 2 + 3, hy2],
                  [cx + dw / 2 + 3, hy2 + 7], [cx - dw / 2 - 3, hy2 + 7]], '#7A5C3E', rnd,
          EARTH.BISTRE, 0.24);
        inkLine(x, [[cx - dw / 2 - 3, hy2], [cx + dw / 2 + 3, hy2]], rnd, 1.5, 0.06);
      }
      inkLine(x, [[cx - dw / 2, t0], [cx - dw / 2, t0 + dh]], rnd, 1.7, 0.06);
      inkLine(x, [[cx + dw / 2, t0], [cx + dw / 2, t0 + dh]], rnd, 1.7, 0.06);
      // Rope, zigzag between the hoops, with the leather ears on it.
      for (let i = 0; i < 6; i++) {
        const x0 = cx - dw / 2 + (i * dw) / 6;
        const x1 = cx - dw / 2 + ((i + 1) * dw) / 6;
        inkLine(x, [[x0, t0 + 6], [x1, t0 + dh - 6]], rnd, 1.2, 0.1);
        inkLine(x, [[x1, t0 + dh - 6], [x1 + dw / 12, t0 + 6]], rnd, 1.2, 0.14);
        solid(x, [[x0 + 2, t0 + 20], [x0 + 9, t0 + 22], [x0 + 8, t0 + 34], [x0 + 1, t0 + 32]],
          '#5E452F', rnd);
      }
      // Sticks, leaning against it.
      inkLine(x, [[cx + dw / 2 - 4, b], [cx + dw / 2 + 12, t0 - 6]], rnd, 2.0, 0.04);
      inkLine(x, [[cx + dw / 2 + 4, b], [cx + dw / 2 + 18, t0 - 4]], rnd, 2.0, 0.04);
      break;
    }
    case 'horse': {
      /*
       * Proportions first, because that is what was wrong.
       *
       * A horse is about as long in the body as it is tall at the withers, its
       * head is a bit under half the length of its neck-and-head together, and
       * the neck comes off the shoulder low and thick and narrows to the poll.
       * The first attempt gave it a thin neck at forty-five degrees, a small
       * wedge head and wire legs, and the result read as a llama. Legs are
       * drawn as tapered shapes with a joint, not as strokes: a leg with no
       * width has no weight on it.
       */
      const bay = ['#7A5C3E', '#6A4A32', '#8A6A46', '#54402E'][seed % 4];
      const dark = '#33271C';
      const W0 = b - 92; // withers
      const cx = dims.w / 2 + 24; // shifted back, to leave the head its room
      const limb = (
        hipx: number, hipy: number, kx: number, ky: number, fx2: number, wide: number, far: boolean,
      ) => {
        if (far) x.globalAlpha = 0.5;
        solid(x, [[hipx - wide, hipy], [hipx + wide, hipy], [kx + wide * 0.5, ky],
                  [kx - wide * 0.5, ky]], far ? '#5E4632' : bay, rnd, EARTH.BISTRE, 0.24);
        solid(x, [[kx - wide * 0.42, ky], [kx + wide * 0.42, ky],
                  [fx2 + wide * 0.30, b - 5], [fx2 - wide * 0.32, b - 5]],
          far ? '#54402E' : bay, rnd, EARTH.BISTRE, 0.3);
        solid(x, [[fx2 - wide * 0.42, b - 7], [fx2 + wide * 0.40, b - 7],
                  [fx2 + wide * 0.46, b], [fx2 - wide * 0.48, b]], dark, rnd);
        if (!far) {
          inkLine(x, [[hipx - wide, hipy], [kx - wide * 0.5, ky], [fx2 - wide * 0.32, b - 5]],
            rnd, 1.4, 0.16);
        }
        x.globalAlpha = 1;
      };

      // Off-side pair, dulled and drawn first.
      limb(cx - 20, b - 58, cx - 16, b - 32, cx - 20, 6, true);
      limb(cx + 26, b - 62, cx + 34, b - 34, cx + 26, 7, true);

      // Barrel: deep through the girth, tucked at the flank, croup rising.
      const barrel: [number, number][] = [
        [cx - 40, W0 + 4], [cx - 22, W0 - 4], [cx + 6, W0 - 2], [cx + 30, W0 - 8],
        [cx + 44, W0 + 8], [cx + 48, b - 68], [cx + 40, b - 50], [cx + 16, b - 44],
        [cx - 12, b - 44], [cx - 34, b - 52], [cx - 44, b - 68],
      ];
      solid(x, barrel, bay, rnd, EARTH.BISTRE, 0.18);
      inkLine(x, [...barrel, barrel[0]], rnd, 2.0, 0.05);
      inkLine(x, [[cx - 34, W0 + 2], [cx - 26, b - 52]], rnd, 1.2, 0.32); // shoulder
      inkLine(x, [[cx + 30, W0 - 4], [cx + 26, b - 50]], rnd, 1.2, 0.34); // stifle

      // Neck: thick off the shoulder, narrowing to the poll, crest arched.
      const neck: [number, number][] = [
        [cx - 38, W0 + 6], [cx - 44, W0 - 8], [cx - 58, b - 118], [cx - 70, b - 130],
        [cx - 80, b - 124], [cx - 68, b - 108], [cx - 50, b - 86], [cx - 30, b - 62],
      ];
      solid(x, neck, bay, rnd, EARTH.BISTRE, 0.1);
      inkLine(x, [...neck, neck[0]], rnd, 1.8, 0.05);

      // Head: cheek and jaw, then the muzzle forward and down off the poll.
      const head: [number, number][] = [
        [cx - 72, b - 134], [cx - 88, b - 130], [cx - 104, b - 110], [cx - 108, b - 100],
        [cx - 96, b - 96], [cx - 80, b - 106], [cx - 66, b - 116],
      ];
      solid(x, head, bay, rnd, EARTH.BISTRE, 0.22);
      inkLine(x, [...head, head[0]], rnd, 1.7, 0.04);
      solid(x, [[cx - 108, b - 106], [cx - 98, b - 96], [cx - 106, b - 95]], dark, rnd);
      inkLine(x, [[cx - 86, b - 120], [cx - 90, b - 117]], rnd, 1.8, 0.03); // eye
      for (const d of [0, 7]) {
        inkLine(x, [[cx - 76 + d, b - 133], [cx - 71 + d, b - 146]], rnd, 1.6, 0.03); // ears
      }
      if (seed % 3 === 0) {
        solid(x, [[cx - 82, b - 130], [cx - 74, b - 127], [cx - 100, b - 98],
                  [cx - 106, b - 101]], '#D8CDB6', rnd); // blaze
      }
      // Mane down the crest.
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        inkLine(x, [[cx - 40 - t * 34, W0 - 2 - t * 42], [cx - 30 - t * 32, W0 + 10 - t * 38]],
          rnd, 1.7, 0.08);
      }

      // Near pair, in front and at full strength.
      limb(cx - 30, b - 56, cx - 30, b - 30, cx - 34, 7, false);
      limb(cx + 34, b - 62, cx + 44, b - 34, cx + 34, 8, false);

      // Tail: from the dock, hanging behind the quarters and clear of them.
      const tail: [number, number][] = [
        [cx + 46, b - 76], [cx + 56, b - 72], [cx + 62, b - 44], [cx + 56, b - 18],
        [cx + 48, b - 22], [cx + 52, b - 48], [cx + 44, b - 70],
      ];
      solid(x, tail, dark, rnd, EARTH.BISTRE, 0.34);
      inkLine(x, [...tail, tail[0]], rnd, 1.4, 0.12);
      break;
    }
  }
  return c;
}

/* ------------------------------------------------------------- Washington
 *
 * The general, drawn properly and from three sides.
 *
 * Until now the player used the same generic period cutout as everyone else in
 * a different colour. He is the one figure on screen for the whole game and the
 * only one the player is, so he gets his own drawing and his own set of
 * facings.
 *
 * The uniform is blue faced buff — the Fairfax militia colours he chose before
 * anyone made him anything, and afterwards the Continental ones. Buff waistcoat
 * and breeches, tall black boots, white stock, and the hair grey and clubbed
 * back in a queue.
 *
 * The pale blue riband across the breast is his rank, and it is documented to
 * the day: general orders, Cambridge, 14 July 1775 — "The Commander in Chief is
 * to be distinguished by a light blue Ribband, worn across his breast, between
 * his Coat and Waistcoat." So it belongs from Act 2 onward and not before, and
 * `riband` is off by default for that reason.
 */
export type Facing = 'front' | 'back' | 'side';

const BUFF = '#D8C79A';

export function washington(
  facing: Facing,
  phase = -1,
  opts: { riband?: boolean; height?: number } = {},
): HTMLCanvasElement {
  const H1 = opts.height ?? 320;
  const w = Math.round(H1 * 0.46);
  const { c, x } = surface(w, H1);
  const rnd = mulberry(1732); // his birth year, and a stable seed
  const cx = w / 2;

  const walking = phase >= 0;
  const a = walking ? phase * Math.PI * 2 : 0;

  /*
   * How the legs move, per facing.
   *
   * Seen from the side a walking man's feet travel a long way fore and aft and
   * the scissor is the whole read. Seen head-on or from behind that travel is
   * almost entirely toward and away from the viewer, so it foreshortens to
   * nearly nothing — what is left is the lift of the knee and a small lateral
   * splay. Using the side-on swing for all three is what makes a front-facing
   * walk look like a man shuffling sideways.
   */
  const side = facing === 'side';
  const swingAmp = side ? w * 0.30 : w * 0.085;
  const liftAmp = side ? H1 * 0.03 : H1 * 0.075;
  const swing = walking ? Math.sin(a) * swingAmp : 0;
  const liftL = walking ? Math.max(0, Math.sin(a)) * liftAmp : 0;
  const liftR = walking ? Math.max(0, -Math.sin(a)) * liftAmp : 0;
  const lean = walking ? -Math.sin(a) * w * (side ? 0.02 : 0.035) : 0;

  /*
   * Proportions.
   *
   * A man is about seven and a half heads tall and his legs are half of him.
   * The first cut hung the coat to 0.69 of the height, which left a third of a
   * figure below it and read as a bell-shaped tunic with boots under it. An
   * eighteenth-century coat skirt stops just above the knee: hem at 0.625, boot
   * tops immediately below it, and the leg gets the room it should have.
   */
  const yHair = 0.028;
  const yBrow = 0.074;
  const yChin = 0.152;
  const ySh = 0.198;
  const yWaist = 0.380;
  const ySkirt = 0.478;
  const yHem = 0.625;
  const yBoot = 0.662;
  const yAnkle = 0.952;

  // Edge-on he is narrower across and deeper front to back.
  const shW = w * (side ? 0.145 : 0.26);
  const hipW = w * (side ? 0.132 : 0.20);

  wash(x, [[cx - w * 0.32, H1 * 0.986], [cx + w * 0.28, H1 * 0.978],
           [cx + w * 0.34, H1], [cx - w * 0.38, H1]], INK.SETTLED, 0.26, rnd, 4);

  /** One leg: buff breeches to the knee, then a tall boot. */
  const leg = (hipX: number, footDx: number, lift: number, back: boolean) => {
    const hy = H1 * (ySkirt + 0.02);
    const ky = H1 * yBoot - lift * 0.55;
    const fy = H1 * yAnkle - lift;
    const kx = hipX + footDx * 0.5;
    const fx = hipX + footDx;
    const shade = back ? 0.34 : 0.12;
    solid(x, [[hipX - w * 0.072, hy], [hipX + w * 0.072, hy],
              [kx + w * 0.056, ky], [kx - w * 0.058, ky]], BUFF, rnd, EARTH.SHADOW_SLATE, shade);
    // The boot. Turned-down top, then a hard black shaft to the instep.
    solid(x, [[kx - w * 0.062, ky - H1 * 0.018], [kx + w * 0.062, ky - H1 * 0.018],
              [kx + w * 0.058, ky + H1 * 0.022], [kx - w * 0.058, ky + H1 * 0.022]],
      '#4A3A2C', rnd);
    solid(x, [[kx - w * 0.052, ky + H1 * 0.018], [kx + w * 0.05, ky + H1 * 0.018],
              [fx + w * 0.046, fy], [fx - w * 0.05, fy]], '#241C16', rnd);
    solid(x, [[fx - w * 0.052, fy - H1 * 0.006], [fx + w * 0.05, fy - H1 * 0.006],
              [fx + w * (side ? 0.135 : 0.085), H1 * 0.995],
              [fx - w * 0.07, H1 * 0.995]], '#1C1611', rnd);
    inkLine(x, [[kx - w * 0.062, ky - H1 * 0.018], [kx + w * 0.062, ky - H1 * 0.018]], rnd, 1.4, 0.1);
  };
  // Back leg first, so the near one closes over it.
  const hipL = cx - w * (side ? 0.03 : 0.085);
  const hipR = cx + w * (side ? 0.03 : 0.085);
  if (swing >= 0) {
    leg(hipR, -swing, liftR, true);
    leg(hipL, swing, liftL, false);
  } else {
    leg(hipL, swing, liftL, true);
    leg(hipR, -swing, liftR, false);
  }

  /** One arm, in the coat's sleeve, with a turned-back buff cuff. */
  const arm = (sideSign: number, dx: number, behind: boolean) => {
    const sx = cx + sideSign * shW * (side ? 0.5 : 1.04) + lean * 0.6;
    const sy = H1 * (ySh + 0.02);
    const ex = sx + sideSign * w * 0.05 + dx;
    const ey = H1 * (yWaist + 0.085);
    solid(x, [[sx - w * 0.056, sy], [sx + w * 0.056, sy],
              [ex + w * 0.05, ey], [ex - w * 0.05, ey]], MEANING.CONTINENTAL_BLUE, rnd,
      INK.SETTLED, behind ? 0.34 : 0.16);
    inkLine(x, [[sx + sideSign * w * 0.056, sy], [ex + sideSign * w * 0.05, ey]], rnd, 1.4, 0.18);
    // Cuff, buff and deep, which is the whole point of "faced buff".
    solid(x, [[ex - w * 0.054, ey - H1 * 0.036], [ex + w * 0.054, ey - H1 * 0.036],
              [ex + w * 0.05, ey], [ex - w * 0.05, ey]], BUFF, rnd, EARTH.SHADOW_SLATE,
      behind ? 0.3 : 0.08);
    inkLine(x, [[ex - w * 0.054, ey - H1 * 0.036], [ex + w * 0.054, ey - H1 * 0.036]], rnd, 1.3, 0.12);
  };

  // The coat: shoulders square, waist in, skirts turned back and flaring.
  const coatPts: [number, number][] = side
    ? [
        [cx - shW * 1.45 + lean, H1 * ySh],
        [cx - shW * 1.15 + lean, H1 * yWaist],
        [cx - hipW * 1.5, H1 * ySkirt],
        [cx - hipW * 2.0, H1 * yHem],
        [cx + hipW * 1.7, H1 * yHem],
        [cx + hipW * 1.15, H1 * ySkirt],
        [cx + shW * 0.95 + lean, H1 * yWaist],
        [cx + shW * 1.15 + lean, H1 * ySh],
      ]
    : [
        [cx - shW + lean, H1 * ySh],
        [cx - shW * 0.78 + lean, H1 * yWaist],
        [cx - hipW * 1.16, H1 * ySkirt],
        [cx - hipW * 1.62, H1 * yHem],
        [cx + hipW * 1.62, H1 * yHem],
        [cx + hipW * 1.16, H1 * ySkirt],
        [cx + shW * 0.78 + lean, H1 * yWaist],
        [cx + shW + lean, H1 * ySh],
      ];

  arm(-1, -swing * 0.42, true);
  solid(x, coatPts, MEANING.CONTINENTAL_BLUE, rnd, INK.SETTLED, 0.08);
  inkLine(x, [...coatPts, coatPts[0]], rnd, 1.8, 0.1);

  if (facing === 'front') {
    // Buff waistcoat in the opening, then the lapels turned back over it.
    solid(x, [[cx - w * 0.052 + lean, H1 * (ySh + 0.016)], [cx + w * 0.052 + lean, H1 * (ySh + 0.016)],
              [cx + w * 0.048, H1 * (yWaist + 0.055)], [cx - w * 0.048, H1 * (yWaist + 0.055)]],
      BUFF, rnd, EARTH.YELLOW_OCHRE, 0.16);
    for (const s2 of [-1, 1]) {
      const lap: [number, number][] = [
        [cx + s2 * w * 0.062 + lean, H1 * (ySh + 0.012)],
        [cx + s2 * w * 0.17 + lean, H1 * (ySh + 0.004)],
        [cx + s2 * w * 0.15, H1 * yWaist],
        [cx + s2 * w * 0.055, H1 * (yWaist - 0.02)],
      ];
      solid(x, lap, BUFF, rnd, EARTH.SHADOW_SLATE, s2 > 0 ? 0.16 : 0.06);
      inkLine(x, [...lap, lap[0]], rnd, 1.4, 0.14);
    }
    // Buttons down the lapel edges.
    x.fillStyle = '#B8933F';
    for (const s2 of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        x.globalAlpha = 0.85;
        x.beginPath();
        x.arc(cx + s2 * w * 0.135 + lean * (1 - i / 5), H1 * (ySh + 0.05 + i * 0.042),
          w * 0.017, 0, 7);
        x.fill();
      }
    }
    x.globalAlpha = 1;

    if (opts.riband) {
      // Right shoulder to left hip, over the waistcoat and under the coat.
      const rb: [number, number][] = [
        [cx + w * 0.16 + lean, H1 * (ySh + 0.01)], [cx + w * 0.235 + lean, H1 * (ySh + 0.05)],
        [cx - w * 0.10, H1 * (yWaist + 0.03)], [cx - w * 0.165, H1 * (yWaist - 0.01)],
      ];
      solid(x, rb, '#8FA6C4', rnd, PAPER.BRIGHT, 0.1);
      inkLine(x, [...rb, rb[0]], rnd, 1.2, 0.2);
    }
  } else if (facing === 'back') {
    // From behind: the coat's centre vent and the two skirt pleats.
    inkLine(x, [[cx + lean, H1 * (ySh + 0.03)], [cx, H1 * yHem]], rnd, 1.5, 0.16);
    for (const s2 of [-1, 1]) {
      inkLine(x, [[cx + s2 * hipW * 0.7, H1 * ySkirt], [cx + s2 * hipW * 0.85, H1 * yHem]],
        rnd, 1.3, 0.2);
    }
  } else {
    // Edge-on: one lapel and the skirt's turned-back corner.
    const lap: [number, number][] = [[cx - shW * 1.2 + lean, H1 * (ySh + 0.01)],
      [cx - shW * 0.5 + lean, H1 * (ySh + 0.03)], [cx - shW * 0.6, H1 * yWaist],
      [cx - shW * 1.1, H1 * (yWaist - 0.03)]];
    solid(x, lap, BUFF, rnd, EARTH.SHADOW_SLATE, 0.12);
    inkLine(x, [...lap, lap[0]], rnd, 1.4, 0.16);
    inkLine(x, [[cx + hipW * 1.2, H1 * ySkirt], [cx + hipW * 1.5, H1 * yHem]], rnd, 1.3, 0.2);
  }

  // Epaulettes. Bullion, gold, and the one bright thing on him.
  const epaulette = (s2: number) => {
    const ex = cx + s2 * shW * (side ? 0.7 : 1.0) + lean;
    const ey = H1 * (ySh + 0.006);
    solid(x, [[ex - w * 0.055, ey - H1 * 0.016], [ex + w * 0.055, ey - H1 * 0.014],
              [ex + w * 0.05, ey + H1 * 0.016], [ex - w * 0.05, ey + H1 * 0.014]],
      '#C6A247', rnd, EARTH.YELLOW_OCHRE, 0.24);
    inkLine(x, [[ex - w * 0.055, ey - H1 * 0.016], [ex + w * 0.055, ey - H1 * 0.014]], rnd, 1.2, 0.1);
    for (let i = 0; i < 4; i++) {
      inkLine(x, [[ex - w * 0.042 + i * w * 0.028, ey + H1 * 0.014],
                  [ex - w * 0.046 + i * w * 0.028, ey + H1 * 0.042]], rnd, 1.1, 0.14);
    }
  };
  if (side) epaulette(-1); else { epaulette(-1); epaulette(1); }

  arm(1, swing * 0.42, false);

  // Neck stock, white and high.
  solid(x, [[cx - w * 0.062 + lean, H1 * yChin], [cx + w * 0.062 + lean, H1 * yChin],
            [cx + w * 0.075 + lean, H1 * ySh], [cx - w * 0.075 + lean, H1 * ySh]],
    PAPER.BRIGHT, rnd);
  inkLine(x, [[cx - w * 0.062 + lean, H1 * yChin], [cx + w * 0.062 + lean, H1 * yChin]], rnd, 1.2, 0.24);

  // Head. Narrower edge-on, and the face only where there is a face.
  const hx = cx + lean;
  const headW = w * (side ? 0.082 : 0.098);
  solid(x, [[hx - headW, H1 * yBrow], [hx + headW, H1 * yBrow],
            [hx + headW * 0.86, H1 * yChin], [hx - headW * 0.86, H1 * yChin]],
    facing === 'back' ? '#CFC0A4' : '#E2D2B4', rnd, EARTH.YELLOW_OCHRE, 0.18);
  inkLine(x, [[hx - headW, H1 * yBrow], [hx - headW * 0.86, H1 * yChin]], rnd, 1.2, 0.3);
  inkLine(x, [[hx + headW, H1 * yBrow], [hx + headW * 0.86, H1 * yChin]], rnd, 1.2, 0.3);
  if (facing === 'front') {
    // The long nose and the set jaw, in three marks. More than that turns into
    // a caricature at eighty pixels.
    inkLine(x, [[hx + w * 0.003, H1 * 0.092], [hx + w * 0.011, H1 * 0.124]], rnd, 1.1, 0.18);
    inkLine(x, [[hx - w * 0.028, H1 * 0.134], [hx + w * 0.028, H1 * 0.134]], rnd, 1.2, 0.24);
  } else if (side) {
    inkLine(x, [[hx - headW, H1 * 0.092], [hx - headW * 1.45, H1 * 0.114],
                [hx - headW * 0.9, H1 * 0.130]], rnd, 1.3, 0.14); // profile
  }

  /*
   * The hair: grey, rolled at the sides, clubbed into a queue behind. He wore
   * his own hair powdered rather than a wig, which is a small thing that the
   * silhouette carries anyway — the rolls above the ears are the read.
   */
  const hair = '#C9C6BC';
  // A skull, not a box: the crown curves and the brow line is where the hair
  // stops, not where a hat sits.
  const skull: [number, number][] = [
    [hx - headW * 1.02, H1 * (yBrow + 0.004)],
    [hx - headW * 0.92, H1 * (yHair + 0.012)],
    [hx - headW * 0.42, H1 * yHair],
    [hx + headW * 0.42, H1 * yHair],
    [hx + headW * 0.92, H1 * (yHair + 0.012)],
    [hx + headW * 1.02, H1 * (yBrow + 0.004)],
  ];
  solid(x, skull, hair, rnd, EARTH.SHADOW_SLATE, 0.14);
  inkLine(x, [...skull], rnd, 1.2, 0.16);
  // The rolls above the ears — the one detail that says his own hair, dressed,
  // rather than a wig or a hat.
  for (const s2 of side ? [1] : [-1, 1]) {
    solid(x, [[hx + s2 * headW * 0.86, H1 * 0.070], [hx + s2 * headW * 1.42, H1 * 0.080],
              [hx + s2 * headW * 1.36, H1 * 0.112], [hx + s2 * headW * 0.86, H1 * 0.106]],
      hair, rnd, EARTH.SHADOW_SLATE, 0.22);
    inkLine(x, [[hx + s2 * headW * 0.9, H1 * 0.074], [hx + s2 * headW * 1.42, H1 * 0.083]],
      rnd, 1.1, 0.2);
  }
  // The queue, tied and hanging on the collar.
  const qx = hx + (side ? headW * 1.0 : 0);
  solid(x, [[qx - headW * 0.30, H1 * 0.118], [qx + headW * 0.30, H1 * 0.118],
            [qx + headW * 0.22, H1 * 0.205], [qx - headW * 0.22, H1 * 0.205]],
    hair, rnd, EARTH.SHADOW_SLATE, 0.26);
  inkLine(x, [[qx - headW * 0.30, H1 * 0.146], [qx + headW * 0.30, H1 * 0.146]], rnd, 1.4, 0.06);

  return c;
}

/** Standing pose plus one walk cycle, for each facing. */
export function washingtonFrames(
  facing: Facing,
  steps = 8,
  height = 320,
  opts: { riband?: boolean } = {},
): HTMLCanvasElement[] {
  const out = [washington(facing, -1, { ...opts, height })];
  for (let i = 0; i < steps; i++) out.push(washington(facing, i / steps, { ...opts, height }));
  return out;
}
