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

  const base = hy + 196; // the near midground stands at roughly z = 0.40

  tree(W * 0.10, base + 34, 250, 168);
  hedge(W * 0.185, W * 0.335, base + 12, 54);
  timber(W * 0.475, base + 4, 96);
  cart(W * 0.695, base + 20, 130);
  tree(W * 0.885, base + 40, 268, 182);

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
