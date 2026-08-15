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

import { EARTH, INK, PAPER } from './palette';
import { platePx } from './ground';

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

/**
 * An opaque form with a washed surface.
 *
 * Buildings have to stop the light. `wash` is many low-alpha passes, which is
 * right for foliage and ground but leaves a wall you can see the hills through,
 * and nothing breaks a painted set faster. So: lay an opaque ground first,
 * then wash over it for tone. Slight edge jitter keeps it from reading as a
 * vector shape.
 */
function solid(
  x: Ctx,
  pts: [number, number][],
  base: string,
  rnd: () => number,
  tint?: string,
  tintAlpha = 0.3,
): void {
  x.save();
  x.globalAlpha = 1;
  x.fillStyle = base;
  x.beginPath();
  x.moveTo(pts[0][0] + (rnd() - 0.5) * 1.6, pts[0][1] + (rnd() - 0.5) * 1.6);
  for (let i = 1; i < pts.length; i++) {
    x.lineTo(pts[i][0] + (rnd() - 0.5) * 1.6, pts[i][1] + (rnd() - 0.5) * 1.6);
  }
  x.closePath();
  x.fill();
  x.restore();
  if (tint) wash(x, pts, tint, tintAlpha, rnd, 3);
}

/** A drawn line with a little wobble and a lost edge or two. */
function inkLine(
  x: Ctx,
  pts: [number, number][],
  rnd: () => number,
  weight = 1.4,
  lost = 0.15,
): void {
  x.strokeStyle = INK.SETTLED;
  x.lineWidth = weight;
  x.lineCap = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    if (rnd() < lost) continue; // lost edge — the line breaks and the eye closes it
    x.beginPath();
    x.moveTo(pts[i][0] + (rnd() - 0.5), pts[i][1] + (rnd() - 0.5));
    x.lineTo(pts[i + 1][0] + (rnd() - 0.5), pts[i + 1][1] + (rnd() - 0.5));
    x.globalAlpha = 0.65 + rnd() * 0.35;
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
        inkLine(x, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], rnd, 0.5, 0.4);
        solid(x, [[wx - ww * 0.42, wy], [wx - ww * 0.06, wy], [wx - ww * 0.06, wy + wh],
                  [wx - ww * 0.42, wy + wh]], '#5B6B5C', rnd);
        solid(x, [[wx + ww * 1.06, wy], [wx + ww * 1.42, wy], [wx + ww * 1.42, wy + wh],
                  [wx + ww * 1.06, wy + wh]], '#5B6B5C', rnd);
      }
    }
  };

  // Palings closing the court, drawn to the same curve so the fence lies on the
  // ground rather than across the picture — and drawn before anything is built
  // on that ground, because a plate has no depth sorting of its own and a fence
  // painted last runs straight through the first storey of the house.
  for (const side of [-1, 1]) {
    const near = platePx({ x: 0.5 + side * 0.34, z: 0.93 }, W, H);
    const far = platePx({ x: 0.5 + side * 1.6, z: 0.93 }, W, H);
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const px = near.x + (far.x - near.x) * t;
      const py = near.y + (far.y - near.y) * t;
      inkLine(x, [[px, py], [px, py - 15]], rnd, 0.9, 0.14);
    }
    inkLine(x, [[near.x, near.y - 11], [far.x, far.y - 11]], rnd, 1.0, 0.08);
    inkLine(x, [[near.x, near.y - 4], [far.x, far.y - 4]], rnd, 0.9, 0.12);
  }

  /*
   * Staging, after the period plates.
   *
   * The engraved views of a Virginia seat — the Bodleian plate of the College
   * being the one everybody knows — all use the same arrangement, and it is a
   * better one than a row of buildings seen flat: the principal house dead
   * frontal on the centre line, the dependencies turned inward so their long
   * faces run away toward the same vanishing point, and a formal axis marching
   * out of the picture toward the viewer. The eye is put low and close, so the
   * house fills the frame rather than sitting in it.
   *
   * It suits Mount Vernon better than it suits most places, because the west
   * front is a five-part Palladian composition already — a centre block with
   * two dependencies standing off it. The plate was not inventing a courtyard;
   * it was drawing one.
   */
  const bx = W * 0.375;
  const bw = W * 0.25;
  const by = hy - 96;
  const bh = 196;
  block(bx, by, bw, bh, 5, 52);

  // The door, on the centre line, with a pediment over it. An axis has to end
  // on something or the eye runs off the top of the building — this is the
  // whole reason the arrangement works in the plates.
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
    // Steps down to the gravel.
    for (let i = 0; i < 3; i++) {
      const sw = dw * (1.6 + i * 0.32);
      inkLine(x, [[dx - sw, dy + dh + i * 5], [dx + sw, dy + dh + i * 5]], rnd, 1.1, 0.08);
    }
  }

  // The north wing, unfinished, and its scaffolding. In May 1775 this was an
  // open building site — no piazza, no cupola, no weathervane.
  const sx = bx + bw;
  wash(x, [[sx, by + 58], [sx + 110, by + 58], [sx + 110, by + bh], [sx, by + bh]], PAPER.SHADOW, 0.4, rnd);
  for (let i = 0; i <= 4; i++) {
    const px = sx + i * 27;
    inkLine(x, [[px, by + 28], [px, by + bh + 8]], rnd, 1.1, 0.05);
  }
  for (let i = 0; i < 5; i++) {
    inkLine(x, [[sx - 10, by + 42 + i * 38], [sx + 118, by + 38 + i * 38]], rnd, 1.0, 0.05);
  }

  /**
   * A dependency turned to face the central axis.
   *
   * Two faces and a hipped roof. The gable end is taken as frontal; the long
   * face runs away inward, and everything on it — the eaves, the sill line, the
   * spacing of the windows — converges on the horizon. `k` is how far the far
   * end is foreshortened, and it is the only number here doing any work: it
   * fixes where the building's vanishing point lands, and it has to be the same
   * for both wings or the courtyard pulls apart.
   */
  const wing = (outer: number, inner: number, baseY: number, h: number, gw: number, wins: number) => {
    const dir = Math.sign(inner - outer);
    const corner = outer + dir * gw;
    const topY = baseY - h;
    const k = 0.74;
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
  wing(W * 0.145, W * 0.305, hy + 118, 146, W * 0.072, 3);
  wing(W * 0.855, W * 0.695, hy + 122, 142, W * 0.072, 3);

  /*
   * The formal axis.
   *
   * Laid out with the same projection the player walks on, so the rows are a
   * corridor he moves down rather than scenery he walks through. This is the
   * part that would have been impossible before the ground curve was shared:
   * painted by eye, the avenue and the walking would have disagreed, and the
   * disagreement is exactly the kind that reads as "wrong" without anyone being
   * able to say why.
   */
  const gravel: [number, number][] = [];
  for (const z of [0.86, 0.34]) {
    const a = platePx({ x: 0.5 - 0.105, z }, W, H);
    gravel.push([a.x, a.y]);
  }
  for (const z of [0.34, 0.86]) {
    const a = platePx({ x: 0.5 + 0.105, z }, W, H);
    gravel.push([a.x, a.y]);
  }
  // Low contrast on purpose. The first pass used a pale opaque trapezoid and it
  // read as a spotlight thrown from the front door — a bright shape narrowing
  // toward a building is a beam unless the edges are drawn.
  wash(x, gravel, EARTH.YELLOW_OCHRE, 0.22, rnd, 4);
  wash(x, gravel, PAPER.BRIGHT, 0.13, rnd, 3);
  inkLine(x, [gravel[0], gravel[1]], rnd, 1.1, 0.22);
  inkLine(x, [gravel[2], gravel[3]], rnd, 1.1, 0.22);

  // Clipped yews down both sides, marching away. Size comes off the same curve
  // as the path, so the file recedes at the rate a walking figure does.
  for (let i = 0; i <= 13; i++) {
    const z = 0.38 + (i / 13) * 0.48;
    for (const side of [-1, 1]) {
      const p = platePx({ x: 0.5 + side * 0.185, z }, W, H);
      const sh = 54 * p.scale * (0.62 + 0.38 * (1 - z));
      const sw = sh * 0.42;
      const cone: [number, number][] = [
        [p.x, p.y - sh], [p.x + sw * 0.5, p.y - sh * 0.42], [p.x + sw * 0.42, p.y],
        [p.x - sw * 0.42, p.y], [p.x - sw * 0.5, p.y - sh * 0.42],
      ];
      solid(x, cone, '#6E7A5C', rnd, EARTH.TERRE_VERTE, 0.3);
      inkLine(x, [...cone, cone[0]], rnd, 1.0, 0.16);
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
  const tree = (tx: number, base: number, th: number, spread: number) => {
    const forkY = base - th * 0.36; // low fork: most of the tree is crown
    const tips: [number, number][] = [];

    // Trunk, tapering, drawn as a narrow wedge rather than a line.
    wash(x, [[tx - th * 0.026, base], [tx + th * 0.026, base],
             [tx + th * 0.014, forkY], [tx - th * 0.014, forkY]],
      EARTH.RAW_UMBER, 0.55, rnd, 3);
    inkLine(x, [[tx - th * 0.024, base], [tx - th * 0.012, forkY]], rnd, 1.6, 0.1);
    inkLine(x, [[tx + th * 0.024, base], [tx + th * 0.012, forkY]], rnd, 1.6, 0.1);

    // Boughs fan out from the fork; each one ends where a clump of leaf sits.
    const boughs = 5;
    for (let i = 0; i < boughs; i++) {
      const t = (i + 0.5) / boughs;
      const ang = -Math.PI / 2 + (t - 0.5) * 2.3 + (rnd() - 0.5) * 0.3;
      const len = th * (0.34 + rnd() * 0.22);
      const mx = tx + Math.cos(ang) * len * 0.55;
      const my = forkY + Math.sin(ang) * len * 0.55;
      const ex = tx + Math.cos(ang) * len;
      const ey = forkY + Math.sin(ang) * len;
      inkLine(x, [[tx, forkY], [mx, my], [ex, ey]], rnd, 2.0, 0.12);
      tips.push([ex, ey]);
      // A short secondary off each bough.
      const sx2 = mx + Math.cos(ang + 0.7) * len * 0.3;
      const sy2 = my + Math.sin(ang + 0.7) * len * 0.3;
      inkLine(x, [[mx, my], [sx2, sy2]], rnd, 1.3, 0.3);
      tips.push([sx2, sy2]);
    }

    // Leaf: many small dabs clustered on the tips, thinning at the edges. Two
    // passes — a broad soft mass, then a denser core where the boughs meet, so
    // the crown has weight instead of reading as a wire frame with speckles.
    for (const pass of [0, 1]) {
      const alpha = pass ? 0.16 : 0.11;
      const reach = pass ? 0.42 : 0.85;
      for (const [ex, ey] of tips) {
        const n = pass ? 10 : 18;
        for (let k = 0; k < n; k++) {
          const r = spread * (0.12 + rnd() * (pass ? 0.16 : 0.22));
          const ox = ex + (rnd() - 0.5) * spread * reach;
          const oy = ey + (rnd() - 0.5) * spread * reach * 0.68;
          wash(x, [[ox - r, oy], [ox - r * 0.3, oy - r * 0.9], [ox + r * 0.6, oy - r * 0.75],
                   [ox + r, oy + r * 0.15], [ox + r * 0.2, oy + r * 0.8], [ox - r * 0.6, oy + r * 0.6]],
            EARTH.TERRE_VERTE, alpha, rnd, 3);
        }
      }
    }
    // A scatter of leaf edges caught in ink, so the mass has a drawn boundary.
    const cyc = forkY - th * 0.5;
    for (let k = 0; k < 26; k++) {
      const ang = rnd() * Math.PI * 2;
      const rr = spread * (0.55 + rnd() * 0.5);
      const px2 = tx + Math.cos(ang) * rr;
      const py2 = cyc + Math.sin(ang) * rr * 0.66;
      inkLine(x, [[px2, py2], [px2 + (rnd() - 0.5) * 14, py2 + (rnd() - 0.5) * 10]], rnd, 0.9, 0.25);
    }

    // A darker core so the crown has weight where the boughs converge.
    wash(x, [[tx - spread * 0.62, forkY - th * 0.20], [tx + spread * 0.56, forkY - th * 0.28],
             [tx + spread * 0.40, forkY + th * 0.02], [tx - spread * 0.46, forkY + th * 0.04]],
      EARTH.TERRE_VERTE, 0.20, rnd, 4);

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
export function characterCutout(
  coat: string,
  seed: number,
  height = 320,
  phase = -1,
  opts: { hat?: 'tricorne' | 'round' | 'none'; build?: number } = {},
): HTMLCanvasElement {
  const H1 = height;
  const w = Math.round(H1 * 0.46);
  const { c, x } = surface(w, H1);
  const rnd = mulberry(seed);
  const cx = w / 2;
  const build = opts.build ?? 1;
  const hat = opts.hat ?? 'tricorne';

  const walking = phase >= 0;
  const a = phase * Math.PI * 2;
  const swing = walking ? Math.sin(a) * w * 0.30 : 0;
  const liftL = walking ? Math.max(0, -Math.sin(a)) * H1 * 0.045 : 0;
  const liftR = walking ? Math.max(0, Math.sin(a)) * H1 * 0.045 : 0;
  const lean = walking ? -Math.sin(a) * w * 0.045 : 0;

  // Vertical landmarks, as fractions of height.
  const yHat = 0.052;
  const yBrim = 0.108;
  const yChin = 0.205;
  const ySh = 0.238;
  const yWaist = 0.470;
  const ySkirt = 0.600;
  const yHem = 0.715;
  const yKnee = 0.760;
  const yAnkle = 0.955;

  const shW = w * 0.30 * build;
  const hipW = w * 0.26 * build;

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
    wash(x, [[hipX - w * 0.075, hy], [hipX + w * 0.075, hy],
             [kx + w * 0.055, ky], [kx - w * 0.06, ky]], EARTH.RAW_UMBER, 0.62, rnd, 3);
    // Stocking below it, lighter.
    wash(x, [[kx - w * 0.05, ky], [kx + w * 0.048, ky],
             [fx + w * 0.042, fy], [fx - w * 0.045, fy]], PAPER.SMOKED, 0.66, rnd, 3);
    inkLine(x, [[hipX - w * 0.07, hy], [kx - w * 0.055, ky], [fx - w * 0.042, fy]], rnd, 1.2, 0.22);
    inkLine(x, [[hipX + w * 0.07, hy], [kx + w * 0.05, ky], [fx + w * 0.04, fy]], rnd, 1.2, 0.22);
    inkLine(x, [[kx - w * 0.055, ky], [kx + w * 0.05, ky]], rnd, 1.0, 0.3); // knee band
    // Shoe.
    wash(x, [[fx - w * 0.055, fy], [fx + w * 0.05, fy],
             [fx + w * 0.085, H1 * 0.995], [fx - w * 0.07, H1 * 0.995]], INK.FLOOR, 0.7, rnd, 3);
  };
  leg(cx - w * 0.085, swing, liftL);
  leg(cx + w * 0.085, -swing, liftR);

  /** One arm, swinging against the legs, with a turned-back cuff. */
  const arm = (side: number, dx: number) => {
    const sx = cx + side * shW * 0.92 + lean * 0.6;
    const sy = H1 * (ySh + 0.02);
    const ex = sx + side * w * 0.06 + dx;
    const ey = H1 * (yWaist + 0.075);
    wash(x, [[sx - w * 0.055, sy], [sx + w * 0.055, sy],
             [ex + w * 0.05, ey], [ex - w * 0.05, ey]], coat, 0.8, rnd, 3);
    inkLine(x, [[sx + side * w * 0.055, sy], [ex + side * w * 0.05, ey]], rnd, 1.4, 0.2);
    // Cuff.
    inkLine(x, [[ex - w * 0.05, ey - H1 * 0.022], [ex + w * 0.05, ey - H1 * 0.022]], rnd, 1.3, 0.15);
    wash(x, [[ex - w * 0.05, ey - H1 * 0.022], [ex + w * 0.05, ey - H1 * 0.022],
             [ex + w * 0.048, ey], [ex - w * 0.048, ey]], PAPER.SMOKED, 0.5, rnd, 2);
  };
  arm(-1, -swing * 0.5);
  arm(1, swing * 0.5);

  // Waistcoat, showing at the coat's open front.
  wash(x, [[cx - w * 0.12, H1 * ySh], [cx + w * 0.12, H1 * ySh],
           [cx + w * 0.10, H1 * ySkirt], [cx - w * 0.10, H1 * ySkirt]],
    PAPER.SMOKED, 0.75, rnd, 3);

  // The coat: shoulders in, waist nipped, skirts turned back and flaring.
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
  wash(x, coatPts, coat, 0.88, rnd, 5);

  // Coat outline, drawn as separate strokes so the line can break.
  inkLine(x, coatPts.slice(0, 5), rnd, 1.7, 0.12);
  inkLine(x, coatPts.slice(4).concat([coatPts[0]]), rnd, 1.7, 0.12);
  // The open front, and a row of buttons down one side of it.
  inkLine(x, [[cx - w * 0.11 + lean, H1 * (ySh + 0.02)], [cx - w * 0.095, H1 * ySkirt],
              [cx - w * 0.12, H1 * yHem]], rnd, 1.3, 0.2);
  inkLine(x, [[cx + w * 0.11 + lean, H1 * (ySh + 0.02)], [cx + w * 0.095, H1 * ySkirt],
              [cx + w * 0.12, H1 * yHem]], rnd, 1.3, 0.2);
  x.fillStyle = INK.SETTLED;
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    x.globalAlpha = 0.5 + rnd() * 0.4;
    x.beginPath();
    x.arc(cx + w * 0.105 + lean * (1 - t), H1 * (ySh + 0.045 + t * 0.33), w * 0.017, 0, 7);
    x.fill();
  }
  x.globalAlpha = 1;
  // The hem, and the turned-back skirt corners.
  inkLine(x, [[cx - hipW * 1.42, H1 * yHem], [cx, H1 * (yHem + 0.012)],
              [cx + hipW * 1.42, H1 * yHem]], rnd, 1.5, 0.18);

  // Neck stock, white and tight.
  wash(x, [[cx - w * 0.075 + lean, H1 * yChin], [cx + w * 0.075 + lean, H1 * yChin],
           [cx + w * 0.085 + lean, H1 * ySh], [cx - w * 0.085 + lean, H1 * ySh]],
    PAPER.BRIGHT, 0.8, rnd, 2);

  // Head, and the queue tied at the back of it.
  const hx = cx + lean;
  wash(x, [[hx - w * 0.082, H1 * yBrim], [hx + w * 0.082, H1 * yBrim],
           [hx + w * 0.07, H1 * yChin], [hx - w * 0.07, H1 * yChin]],
    PAPER.SMOKED, 0.9, rnd, 3);
  inkLine(x, [[hx - w * 0.078, H1 * yBrim], [hx - w * 0.068, H1 * yChin]], rnd, 1.2, 0.3);
  inkLine(x, [[hx + w * 0.078, H1 * yBrim], [hx + w * 0.068, H1 * yChin]], rnd, 1.2, 0.3);
  wash(x, [[hx + w * 0.06, H1 * (yBrim + 0.02)], [hx + w * 0.115, H1 * (yBrim + 0.045)],
           [hx + w * 0.10, H1 * (yChin + 0.03)], [hx + w * 0.05, H1 * yChin]],
    INK.FADED, 0.55, rnd, 3);

  if (hat === 'tricorne') {
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
    wash(x, brim, INK.SETTLED, 0.82, rnd, 4);
    inkLine(x, [...brim, brim[0]], rnd, 1.5, 0.06);
    // Crown behind the brim.
    wash(x, [[hx - w * 0.085, by], [hx - w * 0.06, H1 * yHat],
             [hx + w * 0.06, H1 * yHat], [hx + w * 0.085, by]], INK.SETTLED, 0.8, rnd, 3);
  } else if (hat === 'round') {
    const by = H1 * yBrim;
    wash(x, [[hx - w * 0.20, by], [hx + w * 0.20, by],
             [hx + w * 0.16, by + H1 * 0.02], [hx - w * 0.16, by + H1 * 0.02]],
      EARTH.BISTRE, 0.75, rnd, 3);
    wash(x, [[hx - w * 0.085, by], [hx - w * 0.07, H1 * (yHat + 0.02)],
             [hx + w * 0.07, H1 * (yHat + 0.02)], [hx + w * 0.085, by]],
      EARTH.BISTRE, 0.72, rnd, 3);
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
  const ridge: [number, number][] = [];
  for (let i = 0; i <= 20; i++) ridge.push([(i / 20) * W, hy - 26 + Math.sin(i * 0.5) * 12 + rnd() * 8]);
  wash(x, [...ridge, [W, hy + 24], [0, hy + 24]], EARTH.SHADOW_SLATE, 0.24, rnd);

  // Boston: roofs and one spire, small and grey.
  const bx = W * 0.44;
  for (let i = 0; i < 16; i++) {
    const rx = bx + i * 13 + rnd() * 5;
    const rh = 10 + rnd() * 12;
    solid(x, [[rx, hy - 10], [rx + 11, hy - 10], [rx + 11, hy - 10 - rh], [rx, hy - 10 - rh]],
      rnd() < 0.35 ? '#9B8478' : '#8E939A', rnd);
  }
  inkLine(x, [[bx + 96, hy - 14], [bx + 96, hy - 62], [bx + 100, hy - 76], [bx + 104, hy - 62],
              [bx + 104, hy - 14]], rnd, 1.4, 0.1);
  // The water between — opaque, and colder than the land.
  solid(x, [[0, hy - 6], [W, hy - 10], [W, hy + 22], [0, hy + 26]], '#8D97A0', rnd,
    EARTH.SHADOW_SLATE, 0.28);
  for (let i = 0; i < 22; i++) {
    const wy2 = hy - 2 + rnd() * 24;
    inkLine(x, [[rnd() * W, wy2], [rnd() * W * 0.2 + rnd() * W * 0.7, wy2 + (rnd() - 0.5) * 3]],
      rnd, 0.6, 0.3);
  }
  inkLine(x, ridge, rnd, 1.0, 0.35);
  return c;
}

/** L2 — the lane itself, churned to mud, running away from the camera. */
export function campGround(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(237);
  const hy = H * HORIZON;

  solid(x, [[0, hy + 10], [W, hy + 4], [W, H], [0, H]], '#CAC5AE', rnd);
  wash(x, [[0, hy + 10], [W, hy + 4], [W, H], [0, H]], EARTH.RAW_UMBER, 0.16, rnd);
  wash(x, [[0, hy + 170], [W, hy + 140], [W, H], [0, H]], EARTH.BISTRE, 0.12, rnd);

  // Trodden grass either side, and a churned lane down the middle.
  wash(x, [[0, hy + 10], [W, hy + 4], [W, H], [0, H]], EARTH.TERRE_VERTE, 0.13, rnd);
  solid(x, [[W * 0.42, hy + 16], [W * 0.58, hy + 16], [W * 0.86, H], [W * 0.10, H]],
    '#A99A85', rnd, EARTH.RAW_UMBER, 0.24);

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

  // The shanty town, ragged and unaligned, on the left and centre.
  const shanties: [number, number, number, number][] = [
    [0.075, 0.30, 120, 92], [0.155, 0.10, 96, 74], [0.225, 0.42, 138, 104],
    [0.315, 0.02, 88, 68], [0.40, 0.26, 112, 86], [0.485, -0.06, 78, 60],
    [0.575, 0.20, 104, 80], [0.655, -0.02, 84, 64],
  ];
  shanties.forEach(([fx, dy, w, h], i) => shanty(W * fx, base + dy * 120, w, h, i));

  // Greene's Rhode Islanders: ordered rows, straight streets, tents that match.
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 4; i++) {
      const b = base - row * 34 + 26;
      const cx = W * (0.755 + i * 0.052) + row * 12;
      tent(cx, b, 76 - row * 9, 60 - row * 7);
    }
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
  wash(x, [[fx - 15, fy - 42], [fx + 15, fy - 42], [fx + 11, fy - 16], [fx - 11, fy - 16]],
    INK.SETTLED, 0.55, rnd, 3);
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
  for (let i = 0; i < 4; i++) {
    const px = lx0 + 24 + i * 30;
    const py = base - 10 + Math.sin(i) * 4;
    wash(x, [[px, py], [px + 22, py - 2], [px + 20, py + 40], [px - 2, py + 42]],
      PAPER.BRIGHT, 0.5, rnd, 3);
    inkLine(x, [[px, py], [px + 22, py - 2], [px + 20, py + 40], [px - 2, py + 42]], rnd, 1.0, 0.3);
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

  groundLitter(x, rnd, base + 20, base + 76, 34, 0.5);
  return haze(c, 0.22, PAPER.COOL);
}

/** L4 — near clutter. Nothing here belongs to the army. */
export function campForeground(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(267);
  const y = H * 0.95;

  // A stack of firewood and two leaning muskets at the frame edge.
  for (let i = 0; i < 5; i++) {
    const yy = y - i * 13 - 8;
    wash(x, [[10, yy], [190 - i * 8, yy - 4], [190 - i * 8, yy + 11], [10, yy + 13]],
      EARTH.BISTRE, 0.44, rnd, 3);
    inkLine(x, [[10, yy], [190 - i * 8, yy - 4]], rnd, 1.3, 0.14);
  }
  inkLine(x, [[W - 150, H], [W - 108, y - 128]], rnd, 2.6, 0.05);
  inkLine(x, [[W - 118, H], [W - 96, y - 132]], rnd, 2.6, 0.05);

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
};
