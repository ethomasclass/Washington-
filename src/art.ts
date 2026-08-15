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

/** L1 — far hills. */
export function layerHills(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(23);
  const hy = H * HORIZON;
  const ridge: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    ridge.push([(i / 18) * W, hy - 40 + Math.sin(i * 0.7) * 22 + rnd() * 12]);
  }
  wash(x, [...ridge, [W, hy + 30], [0, hy + 30]], EARTH.TERRE_VERTE, 0.32, rnd);
  inkLine(x, ridge, rnd, 1.1, 0.3);
  return c;
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
  wash(x, [[0, hy + 8], [W, hy - 6], [W, H], [0, H]], EARTH.YELLOW_OCHRE, 0.30, rnd);
  wash(x, [[0, hy + 150], [W, hy + 120], [W, H], [0, H]], EARTH.BISTRE, 0.16, rnd);

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
    wash(x, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], PAPER.SMOKED, 0.55, rnd);
    inkLine(x, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh], [bx, by]], rnd, 1.5, 0.1);
    wash(x, [[bx - 8, by], [bx + bw / 2, by - ridge], [bx + bw + 8, by]], EARTH.RAW_UMBER, 0.4, rnd);
    inkLine(x, [[bx - 8, by], [bx + bw / 2, by - ridge], [bx + bw + 8, by]], rnd, 1.5, 0.08);
    for (let r = 0; r < (bh > 90 ? 2 : 1); r++) {
      for (let i = 0; i < wins; i++) {
        const wx = bx + bw * 0.12 + (i * bw * 0.76) / Math.max(1, wins - 1);
        const wy = by + 18 + r * bh * 0.42;
        const ww = bw * 0.075;
        const wh = bh * 0.2;
        wash(x, [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], INK.FADED, 0.5, rnd, 3);
        inkLine(x, [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh], [wx, wy]], rnd, 0.8, 0.2);
      }
    }
  };

  // The mansion, smaller and higher than before so that walking the lawn reads
  // as closing distance on something genuinely far off.
  const bx = W * 0.40;
  const bw = W * 0.20;
  const by = hy - 66;
  const bh = 150;
  block(bx, by, bw, bh, 5, 40);

  // The north wing, unfinished, and its scaffolding. In May 1775 this was an
  // open building site — no piazza, no cupola, no weathervane.
  const sx = bx + bw;
  wash(x, [[sx, by + 44], [sx + 92, by + 44], [sx + 92, by + bh], [sx, by + bh]], PAPER.SHADOW, 0.4, rnd);
  for (let i = 0; i <= 4; i++) {
    const px = sx + i * 23;
    inkLine(x, [[px, by + 20], [px, by + bh + 6]], rnd, 1.0, 0.05);
  }
  for (let i = 0; i < 4; i++) {
    inkLine(x, [[sx - 8, by + 32 + i * 34], [sx + 100, by + 29 + i * 34]], rnd, 0.9, 0.05);
  }

  // Flanking dependencies — the kitchen and servants' hall stood apart from the
  // house. They give the far ground something other than lawn.
  block(bx - W * 0.13, by + 66, W * 0.085, 74, 2, 22);
  block(bx + bw + W * 0.05, by + 70, W * 0.08, 70, 2, 20);

  // The house throws its shadow west across the lawn in the afternoon.
  wash(x, [[bx - 20, by + bh], [bx + bw + 40, by + bh - 6], [bx + bw + 10, by + bh + 74],
           [bx - 60, by + bh + 80]], EARTH.RAW_UMBER, 0.12, rnd, 3);
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

    // Leaf: many small dabs clustered on the tips, thinning at the edges.
    for (const [ex, ey] of tips) {
      const n = 9 + Math.floor(rnd() * 5);
      for (let k = 0; k < n; k++) {
        const r = spread * (0.10 + rnd() * 0.14);
        const ox = ex + (rnd() - 0.5) * spread * 0.62;
        const oy = ey + (rnd() - 0.5) * spread * 0.42;
        wash(x, [[ox - r, oy], [ox - r * 0.3, oy - r * 0.9], [ox + r * 0.6, oy - r * 0.75],
                 [ox + r, oy + r * 0.15], [ox + r * 0.2, oy + r * 0.8], [ox - r * 0.6, oy + r * 0.6]],
          EARTH.TERRE_VERTE, 0.13, rnd, 3);
      }
    }

    // A darker core so the crown has weight where the boughs converge.
    wash(x, [[tx - spread * 0.5, forkY - th * 0.18], [tx + spread * 0.45, forkY - th * 0.24],
             [tx + spread * 0.3, forkY - th * 0.02], [tx - spread * 0.36, forkY]],
      EARTH.TERRE_VERTE, 0.14, rnd, 4);

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

  const base = hy + 196; // the midground stands at roughly z = 0.44

  tree(W * 0.10, base + 34, 250, 168);
  hedge(W * 0.185, W * 0.335, base + 12, 54);
  timber(W * 0.475, base + 4, 96);
  cart(W * 0.695, base + 20, 130);
  tree(W * 0.885, base + 40, 268, 182);

  // A few paling posts, to break the middle without hiding it.
  for (const px of [W * 0.385, W * 0.415, W * 0.585, W * 0.615]) {
    inkLine(x, [[px, base + 6], [px + (rnd() - 0.5) * 4, base - 34]], rnd, 2.2, 0.04);
  }
  return c;
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
 * A character cutout: ink silhouette over a wash fill, keyed on transparency.
 *
 * `phase` walks the legs around a cycle, 0..1. Pass -1 for a standing pose.
 * The real pipeline segments a generated character sheet into a paper-puppet
 * rig and rotates the limbs; this bakes a handful of frames instead, which is
 * the same idea at placeholder fidelity.
 */
export function characterCutout(
  coat: string,
  seed: number,
  height = 320,
  phase = -1,
): HTMLCanvasElement {
  const w = Math.round(height * 0.42);
  const { c, x } = surface(w, height);
  const rnd = mulberry(seed);
  const cx = w / 2;

  const walking = phase >= 0;
  const a = phase * Math.PI * 2;
  const swing = walking ? Math.sin(a) * w * 0.38 : 0;
  // The trailing leg lifts as it comes through; the leading one is planted.
  const liftL = walking ? Math.max(0, -Math.sin(a)) * height * 0.05 : 0;
  const liftR = walking ? Math.max(0, Math.sin(a)) * height * 0.05 : 0;
  // Shoulders counter-rotate against the hips.
  const lean = walking ? -Math.sin(a) * w * 0.06 : 0;

  // Cast shadow, so the figure sits on the ground rather than floating on it.
  wash(x, [[cx - w * 0.34, height * 0.985], [cx + w * 0.3, height * 0.975],
           [cx + w * 0.36, height], [cx - w * 0.4, height]], INK.SETTLED, 0.3, rnd, 4);

  const leg = (hipX: number, footDx: number, lift: number) => {
    const hy = height * 0.70;
    const fy = height - lift;
    wash(x, [[hipX - w * 0.075, hy], [hipX + w * 0.075, hy],
             [hipX + footDx + w * 0.075, fy], [hipX + footDx - w * 0.085, fy]],
      EARTH.BISTRE, 0.78, rnd, 3);
    inkLine(x, [[hipX, hy], [hipX + footDx, fy]], rnd, 1.3, 0.25);
  };
  leg(cx - w * 0.12, swing, liftL);
  leg(cx + w * 0.12, -swing, liftR);

  // Coat.
  wash(x, [[cx - w * 0.3 + lean, height * 0.3], [cx + w * 0.3 + lean, height * 0.3],
           [cx + w * 0.34, height * 0.72], [cx - w * 0.34, height * 0.72]],
    coat, 0.85, rnd, 4);

  // Head and hat.
  wash(x, [[cx - w * 0.13 + lean, height * 0.14], [cx + w * 0.13 + lean, height * 0.14],
           [cx + w * 0.13 + lean, height * 0.3], [cx - w * 0.13 + lean, height * 0.3]],
    PAPER.SMOKED, 0.9, rnd, 3);
  wash(x, [[cx - w * 0.28 + lean, height * 0.14], [cx + w * 0.28 + lean, height * 0.14],
           [cx + w * 0.2 + lean, height * 0.05], [cx - w * 0.2 + lean, height * 0.05]],
    INK.SETTLED, 0.8, rnd, 3);

  // Outline: the two falling sides and the shoulder line only. The full
  // rectangle reads as a box around the figure rather than as a coat.
  inkLine(x, [[cx - w * 0.3 + lean, height * 0.31], [cx - w * 0.34, height * 0.72]], rnd, 1.6, 0.22);
  inkLine(x, [[cx + w * 0.3 + lean, height * 0.31], [cx + w * 0.34, height * 0.72]], rnd, 1.6, 0.22);
  inkLine(x, [[cx - w * 0.3 + lean, height * 0.32], [cx - w * 0.14 + lean, height * 0.29],
              [cx + w * 0.14 + lean, height * 0.29], [cx + w * 0.3 + lean, height * 0.32]],
    rnd, 1.4, 0.15);
  inkLine(x, [[cx - w * 0.34, height * 0.72], [cx - w * 0.1, height * 0.75],
              [cx + w * 0.12, height * 0.74], [cx + w * 0.34, height * 0.72]], rnd, 1.4, 0.3);
  return c;
}

/** Frame 0 is the standing pose; the rest walk one full cycle. */
export function characterFrames(
  coat: string,
  seed: number,
  height = 320,
  steps = 8,
): HTMLCanvasElement[] {
  const out = [characterCutout(coat, seed, height, -1)];
  for (let i = 0; i < steps; i++) {
    out.push(characterCutout(coat, seed, height, i / steps));
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
  x.fillStyle = PAPER.COOL;
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
    wash(x, [[rx, hy - 10], [rx + 11, hy - 10], [rx + 11, hy - 10 - rh], [rx, hy - 10 - rh]],
      EARTH.WET_STONE, 0.4, rnd, 3);
  }
  inkLine(x, [[bx + 96, hy - 14], [bx + 96, hy - 62], [bx + 100, hy - 76], [bx + 104, hy - 62],
              [bx + 104, hy - 14]], rnd, 1.4, 0.1);
  // The water between.
  wash(x, [[0, hy - 6], [W, hy - 10], [W, hy + 22], [0, hy + 26]], EARTH.WET_STONE, 0.3, rnd);
  inkLine(x, ridge, rnd, 1.0, 0.35);
  return c;
}

/** L2 — the lane itself, churned to mud, running away from the camera. */
export function campGround(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(237);
  const hy = H * HORIZON;

  wash(x, [[0, hy + 10], [W, hy + 4], [W, H], [0, H]], EARTH.RAW_UMBER, 0.26, rnd);
  wash(x, [[0, hy + 170], [W, hy + 140], [W, H], [0, H]], EARTH.BISTRE, 0.20, rnd);

  // The lane: a pale churned band widening toward the camera.
  wash(x, [[W * 0.42, hy + 16], [W * 0.58, hy + 16], [W * 0.86, H], [W * 0.10, H]],
    PAPER.SHADOW, 0.34, rnd, 5);

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
    const tone = [PAPER.SMOKED, PAPER.BRIGHT, PAPER.SHADOW, EARTH.RAW_UMBER][kind % 4];
    const ridgeX = cx - w / 2 + w * 0.22;
    const ridgeY = b - h;
    const backY = b - h * 0.48;
    wash(x, [[cx - w / 2, b], [ridgeX, ridgeY], [cx + w / 2, backY], [cx + w / 2, b]],
      tone, 0.28, rnd, 4);
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
    wash(x, [[cx - w / 2, b], [cx, b - h], [cx + w / 2, b]], PAPER.BRIGHT, 0.62, rnd, 4);
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

  // A flagless pole, and a fire with nobody at it.
  inkLine(x, [[W * 0.70, base + 20], [W * 0.70, base - 130]], rnd, 2.4, 0.04);
  wash(x, [[W * 0.335, base + 46], [W * 0.365, base + 40], [W * 0.372, base + 58], [W * 0.33, base + 60]],
    EARTH.MADDER_LAKE, 0.22, rnd, 3);
  return c;
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
export const PLATE_SETS: Record<string, () => HTMLCanvasElement[]> = {
  vernon: () => [layerSky(), layerHills(), layerHouse(), layerMidground(), layerForeground()],
  camp: () => [campSky(), campHills(), campGround(), campMidground(), campForeground()],
};
