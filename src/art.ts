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
  const bx = W * 0.36;
  const by = hy - 90;
  const bw = W * 0.28;
  const bh = 210;

  // The ground: from the horizon to the bottom of the frame. The lawn falls
  // away west toward the river, so the wash warms and darkens as it comes
  // forward.
  wash(
    x,
    [
      [0, hy + 8],
      [W, hy - 6],
      [W, H],
      [0, H],
    ],
    EARTH.YELLOW_OCHRE,
    0.30,
    rnd,
  );
  wash(
    x,
    [
      [0, hy + 150],
      [W, hy + 120],
      [W, H],
      [0, H],
    ],
    EARTH.BISTRE,
    0.16,
    rnd,
  );
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

  // The house casts west across the lawn in the afternoon.
  wash(
    x,
    [[W * 0.36, hy + 120], [W * 0.68, hy + 118], [W * 0.62, hy + 190], [W * 0.3, hy + 196]],
    EARTH.RAW_UMBER,
    0.12,
    rnd,
    3,
  );

  // Main block.
  wash(
    x,
    [
      [bx, by],
      [bx + bw, by],
      [bx + bw, by + bh],
      [bx, by + bh],
    ],
    PAPER.SMOKED,
    0.55,
    rnd,
  );
  inkLine(
    x,
    [
      [bx, by],
      [bx + bw, by],
      [bx + bw, by + bh],
      [bx, by + bh],
      [bx, by],
    ],
    rnd,
    1.6,
    0.1,
  );

  // Roof.
  inkLine(
    x,
    [
      [bx - 12, by],
      [bx + bw / 2, by - 54],
      [bx + bw + 12, by],
    ],
    rnd,
    1.6,
    0.08,
  );
  wash(
    x,
    [
      [bx - 12, by],
      [bx + bw / 2, by - 54],
      [bx + bw + 12, by],
    ],
    EARTH.RAW_UMBER,
    0.4,
    rnd,
  );

  // Windows — two storeys.
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 5; i++) {
      const wx = bx + 26 + i * (bw - 52) / 4;
      const wy = by + 34 + r * 84;
      wash(x, [[wx, wy], [wx + 22, wy], [wx + 22, wy + 40], [wx, wy + 40]], INK.FADED, 0.5, rnd, 3);
      inkLine(x, [[wx, wy], [wx + 22, wy], [wx + 22, wy + 40], [wx, wy + 40], [wx, wy]], rnd, 0.9, 0.2);
    }
  }

  // The north wing under construction, and its scaffolding.
  const sx = bx + bw;
  wash(x, [[sx, by + 60], [sx + 130, by + 60], [sx + 130, by + bh], [sx, by + bh]], PAPER.SHADOW, 0.4, rnd);
  for (let i = 0; i <= 4; i++) {
    const px = sx + i * 32;
    inkLine(x, [[px, by + 30], [px, by + bh + 8]], rnd, 1.2, 0.05);
  }
  for (let i = 0; i < 4; i++) {
    const py = by + 44 + i * 46;
    inkLine(x, [[sx - 10, py], [sx + 140, py - 3]], rnd, 1.1, 0.05);
  }
  return c;
}

/** L3 — midground. The tree line that frames the west front. */
export function layerTrees(): HTMLCanvasElement {
  const { c, x } = surface(W, H);
  const rnd = mulberry(51);
  const hy = H * HORIZON;

  const tree = (tx: number, base: number, th: number, spread: number) => {
    // Trunk, tapering, with two limbs.
    inkLine(x, [[tx, base], [tx + (rnd() - 0.5) * 8, base - th * 0.55]], rnd, 3.4, 0.02);
    inkLine(x, [[tx, base - th * 0.5], [tx - spread * 0.5, base - th * 0.82]], rnd, 2.0, 0.06);
    inkLine(x, [[tx, base - th * 0.55], [tx + spread * 0.45, base - th * 0.86]], rnd, 2.0, 0.06);

    // Canopy: a few overlapping pools, denser at the centre, lost at the edges.
    const cy = base - th * 0.82;
    for (let i = 0; i < 7; i++) {
      const ox = (rnd() - 0.5) * spread * 1.1;
      const oy = (rnd() - 0.5) * th * 0.22;
      const r = spread * (0.34 + rnd() * 0.3);
      wash(
        x,
        [
          [tx + ox - r, cy + oy],
          [tx + ox - r * 0.4, cy + oy - r * 0.85],
          [tx + ox + r * 0.5, cy + oy - r * 0.8],
          [tx + ox + r, cy + oy + r * 0.2],
          [tx + ox + r * 0.3, cy + oy + r * 0.7],
          [tx + ox - r * 0.5, cy + oy + r * 0.6],
        ],
        EARTH.TERRE_VERTE,
        0.17,
        rnd,
        4,
      );
    }
    // A little shadow pooled at the root so the tree sits on the ground.
    wash(
      x,
      [[tx - spread * 0.5, base], [tx + spread * 0.5, base - 4], [tx + spread * 0.35, base + 16], [tx - spread * 0.4, base + 18]],
      EARTH.RAW_UMBER,
      0.2,
      rnd,
      3,
    );
  };

  tree(W * 0.1, hy + 235, 300, 120);
  tree(W * 0.22, hy + 165, 235, 92);
  tree(W * 0.8, hy + 180, 255, 100);
  tree(W * 0.92, hy + 250, 320, 130);
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

/** A character cutout: ink silhouette with a wash fill, keyed on transparency. */
export function characterCutout(
  coat: string,
  seed: number,
  height = 320,
): HTMLCanvasElement {
  const w = Math.round(height * 0.42);
  const { c, x } = surface(w, height);
  const rnd = mulberry(seed);
  const cx = w / 2;

  // Cast shadow, so the figure sits on the ground rather than floating on it.
  wash(
    x,
    [
      [cx - w * 0.34, height * 0.985],
      [cx + w * 0.3, height * 0.975],
      [cx + w * 0.36, height],
      [cx - w * 0.4, height],
    ],
    INK.SETTLED,
    0.3,
    rnd,
    4,
  );

  // Coat.
  wash(
    x,
    [
      [cx - w * 0.3, height * 0.3],
      [cx + w * 0.3, height * 0.3],
      [cx + w * 0.34, height * 0.72],
      [cx - w * 0.34, height * 0.72],
    ],
    coat,
    0.85,
    rnd,
    4,
  );
  // Legs.
  wash(x, [[cx - w * 0.2, height * 0.7], [cx - w * 0.04, height * 0.7], [cx - w * 0.06, height], [cx - w * 0.22, height]], EARTH.BISTRE, 0.75, rnd, 3);
  wash(x, [[cx + w * 0.04, height * 0.7], [cx + w * 0.2, height * 0.7], [cx + w * 0.22, height], [cx + w * 0.06, height]], EARTH.BISTRE, 0.75, rnd, 3);
  // Head and hat.
  wash(x, [[cx - w * 0.13, height * 0.14], [cx + w * 0.13, height * 0.14], [cx + w * 0.13, height * 0.3], [cx - w * 0.13, height * 0.3]], PAPER.SMOKED, 0.9, rnd, 3);
  wash(x, [[cx - w * 0.28, height * 0.14], [cx + w * 0.28, height * 0.14], [cx + w * 0.2, height * 0.05], [cx - w * 0.2, height * 0.05]], INK.SETTLED, 0.8, rnd, 3);

  // Outline: only the two falling sides and the shoulder line. Drawing the
  // full rectangle reads as a box around the figure rather than as a coat.
  inkLine(x, [[cx - w * 0.3, height * 0.31], [cx - w * 0.34, height * 0.72]], rnd, 1.6, 0.22);
  inkLine(x, [[cx + w * 0.3, height * 0.31], [cx + w * 0.34, height * 0.72]], rnd, 1.6, 0.22);
  inkLine(
    x,
    [
      [cx - w * 0.3, height * 0.32],
      [cx - w * 0.14, height * 0.29],
      [cx + w * 0.14, height * 0.29],
      [cx + w * 0.3, height * 0.32],
    ],
    rnd,
    1.4,
    0.15,
  );
  // Coat skirt.
  inkLine(
    x,
    [
      [cx - w * 0.34, height * 0.72],
      [cx - w * 0.1, height * 0.75],
      [cx + w * 0.12, height * 0.74],
      [cx + w * 0.34, height * 0.72],
    ],
    rnd,
    1.4,
    0.3,
  );
  return c;
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
