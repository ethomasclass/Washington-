/**
 * The environment bake-off — one composition, four media.
 *
 * The figures became line-and-fill on 16 Aug 2026, which makes the alla prima
 * plates the odd thing in the frame rather than the settled thing. This renders
 * the SAME camp composition four ways so the choice can be made by looking
 * instead of by argument, with the real cut Washington sprite standing in each
 * one — because the only question that matters is how the figures sit on it.
 *
 * Everything here is a sample, not a shipping renderer. The geometry is shared
 * and deliberately plain; what changes between the four is only how a shape is
 * put down: whether it carries a contour, whether its tone is line or flat
 * colour, and how wide its value range runs.
 *
 * These are hand-drawn approximations of four media, at a fraction of the
 * fidelity a generation would give. They are for judging DIRECTION — silhouette
 * logic, palette, contrast, how much the world competes with a figure — and not
 * for judging finish.
 */

import { INK, MEANING, PAPER } from './palette';

export type Medium = 'aquatint' | 'wash' | 'poster' | 'comic';

export const MEDIA: { id: Medium; name: string; note: string }[] = [
  { id: 'aquatint', name: 'Aquatint / engraving', note: 'line structure, flat tinted washes over it' },
  { id: 'wash', name: 'Ink line + flat wash', note: 'the original direction — iron-gall line, bare paper as light' },
  { id: 'poster', name: 'Gouache poster-flat', note: 'flat shapes, hard edges, no contour' },
  { id: 'comic', name: 'Painted comic', note: 'flattened paint under a unifying dark contour' },
];

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

/** Lighten or darken a hex colour. */
function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * k)));
  return `#${[f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

/*
 * THE FOUR PALETTES.
 *
 * Each medium gets its own, because a palette is part of a medium and not a
 * setting applied to one. The engraving is nearly monochrome and earns its
 * colour; the wash is paper plus three transparent earths; the poster is flat
 * and few and confident; the comic is the poster with the values pulled apart.
 */
const PALETTES: Record<Medium, { paper: string; sky: string; far: string; water: string; ground: string; mass: string; near: string; accent: string }> = {
  aquatint: {
    paper: '#EDE6D4', sky: '#CFCBB8', far: '#9AA096', water: '#A8AFA8',
    ground: '#BFB79C', mass: '#8C8871', near: '#6E6A57', accent: MEANING.BRITISH_MADDER,
  },
  wash: {
    paper: PAPER.BRIGHT, sky: '#DCE2E2', far: '#B7BFB4', water: '#C4CCCA',
    ground: '#D3CBB2', mass: '#A79E82', near: '#7E7660', accent: MEANING.BRITISH_MADDER,
  },
  poster: {
    paper: '#E8E0CC', sky: '#B9C2BE', far: '#79857A', water: '#93A09B',
    ground: '#A8A183', mass: '#6F6C58', near: '#43443A', accent: '#B4553F',
  },
  comic: {
    paper: '#E4DCC6', sky: '#AEB8B8', far: '#5F6A62', water: '#7C8781',
    ground: '#9A9276', mass: '#5A5747', near: '#33342C', accent: '#A8492F',
  },
};

/**
 * Put a shape down in the current medium.
 *
 * This one function is the whole experiment: the composition below calls it
 * identically for all four, and every visible difference between the samples
 * comes out of here.
 */
function mass(x: Ctx, m: Medium, pts: Pt[], colour: string, rnd: () => number, depth = 0): void {
  const path = () => {
    x.beginPath();
    x.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
    x.closePath();
  };

  if (m === 'poster') {
    // Flat, hard-edged, no contour. Depth is carried purely by value.
    x.fillStyle = shade(colour, depth * 0.05);
    path();
    x.fill();
    return;
  }

  if (m === 'comic') {
    // Flat fill, a single darker band along the lower edge, then a contour that
    // ties it to the drawn figures.
    x.fillStyle = shade(colour, depth * 0.04);
    path();
    x.fill();
    x.save();
    path();
    x.clip();
    const box = pts.reduce(
      (a, p) => ({ y0: Math.min(a.y0, p[1]), y1: Math.max(a.y1, p[1]) }),
      { y0: Infinity, y1: -Infinity },
    );
    const g = x.createLinearGradient(0, box.y0, 0, box.y1);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(20,16,10,0.22)');
    x.fillStyle = g;
    x.fillRect(0, box.y0, x.canvas.width, box.y1 - box.y0);
    x.restore();
    x.strokeStyle = INK.FLOOR;
    x.lineWidth = 2.2;
    x.lineJoin = 'round';
    path();
    x.stroke();
    return;
  }

  if (m === 'wash') {
    // Transparent wash — the paper under it does the light — and a broken quill
    // line that does not close all the way round.
    x.save();
    x.globalAlpha = 0.46;
    x.fillStyle = colour;
    path();
    x.fill();
    x.restore();
    x.strokeStyle = INK.SETTLED;
    x.lineJoin = 'round';
    for (let i = 0; i < pts.length; i++) {
      if (rnd() < 0.22) continue; // the line lifts
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      x.lineWidth = 1.1 + rnd() * 0.9;
      x.globalAlpha = 0.55 + rnd() * 0.4;
      x.beginPath();
      x.moveTo(a[0] + (rnd() - 0.5), a[1] + (rnd() - 0.5));
      x.lineTo(b[0] + (rnd() - 0.5), b[1] + (rnd() - 0.5));
      x.stroke();
    }
    x.globalAlpha = 1;
    return;
  }

  // aquatint: a flat tint, then ruled tone over it, then a cut contour. Tone is
  // spacing — closer lines where it is darker — exactly as a plate is bitten.
  x.save();
  x.globalAlpha = 0.55;
  x.fillStyle = colour;
  path();
  x.fill();
  x.restore();
  x.save();
  path();
  x.clip();
  x.strokeStyle = INK.FLOOR;
  const gap = 9 - depth * 2.2;
  x.globalAlpha = 0.3 + depth * 0.1;
  x.lineWidth = 0.8;
  for (let y = -x.canvas.height; y < x.canvas.height * 2; y += Math.max(2.4, gap)) {
    x.beginPath();
    x.moveTo(-50, y);
    x.lineTo(x.canvas.width + 50, y + 26);
    x.stroke();
  }
  x.restore();
  x.strokeStyle = INK.FLOOR;
  x.globalAlpha = 0.75;
  x.lineWidth = 1.3;
  path();
  x.stroke();
  x.globalAlpha = 1;
}

/**
 * The camp, once, in a given medium.
 *
 * Composed to the rules the cutter needs: horizon exactly a third down, the
 * walkable ground open and empty, a dark mass cropped by the bottom edge.
 */
export function renderCamp(m: Medium, W = 1280, H = 720): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = mulberry(4771);
  const P = PALETTES[m];
  const hz = H * 0.34;

  x.fillStyle = P.paper;
  x.fillRect(0, 0, W, H);

  // Sky. The poster keeps it flat; the others let it carry a little tone.
  mass(x, m, [[0, 0], [W, 0], [W, hz], [0, hz]], P.sky, rnd, 0);

  // Boston across the water: a low town of roofs and steeples, small and out of
  // reach. One form, not a hundred buildings.
  const town: Pt[] = [[W * 0.42, hz], [W * 0.42, hz - 26], [W * 0.62, hz - 34], [W * 0.78, hz - 22], [W, hz - 30], [W, hz]];
  mass(x, m, town, P.far, rnd, 0.4);
  for (const sx of [0.5, 0.58, 0.69, 0.85]) {
    mass(x, m, [[W * sx, hz - 24], [W * sx + 3, hz - 62], [W * sx + 7, hz - 24]], P.far, rnd, 0.5);
  }
  // The near hill, stage left.
  mass(x, m, [[0, hz], [W * 0.06, hz - 30], [W * 0.2, hz - 18], [W * 0.3, hz], [0, hz]], P.far, rnd, 0.3);

  // The water — the act's whole problem, four miles he cannot cross.
  mass(x, m, [[0, hz], [W, hz], [W, hz + 30], [0, hz + 34]], P.water, rnd, 0.2);

  // The ground, running from the water to the bottom edge. Left OPEN down the
  // middle, because that band is where the player walks.
  mass(x, m, [[0, hz + 30], [W, hz + 26], [W, H], [0, H]], P.ground, rnd, 0.5);

  // The house — one solid landmark, stage left of centre.
  const hx = W * 0.30;
  mass(x, m, [[hx, hz - 4], [hx + 128, hz - 4], [hx + 128, hz + 78], [hx, hz + 78]], P.mass, rnd, 0.6);
  mass(x, m, [[hx - 10, hz - 4], [hx + 64, hz - 46], [hx + 138, hz - 4]], shade(P.mass, -0.06), rnd, 0.7);

  // Tents, in two groups either side of the open street. Ordered rows stage
  // right — the one regiment that looks like an army.
  const tent = (cx: number, base: number, w: number, d: number) =>
    mass(x, m, [[cx - w, base], [cx, base - w * 1.3], [cx + w, base]], shade(P.mass, 0.10), rnd, d);
  for (let i = 0; i < 4; i++) tent(W * 0.10 + i * 52, hz + 96 + i * 10, 26 + i * 3, 0.6);
  for (let i = 0; i < 5; i++) tent(W * 0.66 + i * 62, hz + 88 + i * 14, 30 + i * 4, 0.6);
  // Brush shelters, near left — lumpy, unlike the tents, which is the point.
  for (let i = 0; i < 3; i++) {
    const bx = W * 0.06 + i * 74;
    const by = hz + 190 + i * 26;
    mass(x, m, [[bx, by], [bx + 20, by - 34], [bx + 58, by - 28], [bx + 74, by]], shade(P.mass, -0.02), rnd, 0.8);
  }

  // The regimental flag: the one saturated note the act permits.
  const fx = W * 0.70;
  mass(x, m, [[fx, hz + 54], [fx + 34, hz + 48], [fx + 34, hz + 70], [fx, hz + 74]], P.accent, rnd, 0.4);
  x.strokeStyle = INK.FLOOR;
  x.lineWidth = 1.6;
  x.beginPath();
  x.moveTo(fx, hz + 46);
  x.lineTo(fx, hz + 110);
  x.stroke();

  // The near-field occluder, cropped by the bottom edge: a rutted bank, heaviest
  // weight, almost no colour. Without it the frame has no depth.
  mass(x, m, [[0, H - 92], [W * 0.34, H - 122], [W * 0.72, H - 104], [W, H - 132], [W, H], [0, H]], P.near, rnd, 1);

  return c;
}
