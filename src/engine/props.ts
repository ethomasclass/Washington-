/**
 * Everything in the world that is not ground, not a building and not a person.
 *
 * A prop is a pixel sprite drawn front-on and stood up as a billboard, or — if
 * it is flagged `flat` — laid on the ground as a decal. Sizes are in pixels at
 * 32px per world tile, so a prop 32 wide is one tile wide and a man (48px) is a
 * shade under a tile and a half tall.
 *
 * The historical claim this file quietly makes: Mount Vernon in May 1775 was a
 * building site. The kitchen and the servants' hall were going up that year,
 * the south wing had just been finished, the north end was open, and the
 * colonnades that tie the whole composition together did not exist yet. So
 * the props here run heavily to scaffolding, stacked yellow pine, a lime pit
 * and a sawpit, and that is not set dressing — it is the act's argument.
 */

import {
  cylinder, disc, ellipse, hash, hline, line, outline, px, rect, shade, speckle,
  stroke, surface, vline, type Surface,
} from './pixels';
import { P } from '../palette';

export interface PropDef {
  w: number;
  h: number;
  /** Lies on the ground rather than standing up. */
  flat?: boolean;
  /** Blocks the player. Radius in tiles; 0 means walk through it. */
  block?: number;
  /** Sits this many pixels into the ground, so it does not look pasted on. */
  sink?: number;
  draw: (g: CanvasRenderingContext2D, w: number, h: number, v: number) => void;
}

/* ---------------------------------------------------------------------- *
 * Shared parts
 * ---------------------------------------------------------------------- */

/** A tapering trunk with roots, lit from the left. */
function trunk(g: CanvasRenderingContext2D, cx: number, top: number, bot: number, w: number): void {
  for (let y = top; y <= bot; y++) {
    const t = (y - top) / Math.max(1, bot - top);
    const ww = Math.round(w * (0.7 + 0.5 * t));
    const x = Math.round(cx - ww / 2);
    hline(g, x, y, ww, P.trunk);
    vline(g, x, y, 1, P.trunkL);
    vline(g, x + ww - 1, y, 1, P.trunkD);
    if (hash(0, y, 3) < 0.3) px(g, x + 1 + Math.floor(hash(1, y, 4) * (ww - 2)), y, P.trunkD);
  }
  // Roots spreading at the base.
  for (const s of [-1, 1] as const) {
    hline(g, cx + s * Math.round(w * 0.5), bot, Math.round(w * 0.7) * s > 0 ? 3 : 3, P.trunkD);
  }
}

/** A lobed canopy: overlapping discs, three values, never a circle. */
function canopy(
  g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number,
  ramp: readonly [string, string, string], seed: number, lobes = 7,
): void {
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + hash(i, seed, 1) * 0.6;
    const d = 0.45 + hash(i, seed, 2) * 0.45;
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    ellipse(g, x, y, rx * (0.42 + hash(i, seed, 3) * 0.2), ry * (0.42 + hash(i, seed, 4) * 0.2), ramp[1]);
  }
  ellipse(g, cx, cy, rx * 0.72, ry * 0.72, ramp[1]);
  // Shadow underside, then lit crowns on the sun side (upper left).
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + hash(i, seed, 5) * 0.6;
    const x = cx + Math.cos(a) * rx * 0.5, y = cy + Math.sin(a) * ry * 0.5;
    if (Math.sin(a) > 0.1) ellipse(g, x, y + 1, rx * 0.3, ry * 0.24, ramp[0]);
    if (Math.cos(a) < -0.2 && Math.sin(a) < 0.2) ellipse(g, x - 1, y - 1, rx * 0.24, ry * 0.2, ramp[2]);
  }
  // Broken edge, so the silhouette is not an ellipse.
  for (let i = 0; i < 40; i++) {
    const a = hash(i, seed, 6) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(a) * rx * (0.78 + hash(i, seed, 7) * 0.22));
    const y = Math.round(cy + Math.sin(a) * ry * (0.78 + hash(i, seed, 8) * 0.22));
    px(g, x, y, hash(i, seed, 9) < 0.4 ? ramp[2] : ramp[1]);
  }
}

/** A board with grain. The building site is made of these. */
function board(
  g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  ramp: readonly [string, string, string], seed = 0,
): void {
  rect(g, x, y, w, h, ramp[1]);
  hline(g, x, y, w, ramp[2]);
  hline(g, x, y + h - 1, w, ramp[0]);
  for (let i = 0; i < w; i++) if (hash(x + i, y, seed) < 0.12) vline(g, x + i, y + 1, h - 2, ramp[0]);
}

/* ---------------------------------------------------------------------- *
 * The registry
 * ---------------------------------------------------------------------- */

export const PROPS: Record<string, PropDef> = {
  /* --- trees and planting ------------------------------------------- */
  oak: {
    w: 104, h: 136, block: 0.22, sink: 3,
    draw(g, w, h, v) {
      void v;
      trunk(g, w / 2, h * 0.46, h - 2, 15);
      // Two limbs, so the canopy has something to sit on.
      line(g, w / 2, h * 0.55, w * 0.26, h * 0.40, P.trunkD);
      line(g, w / 2, h * 0.58, w * 0.74, h * 0.42, P.trunkD);
      canopy(g, w / 2, h * 0.30, w * 0.46, h * 0.28, [P.leafD, P.leaf, P.leafL], v * 7 + 1, 9);
      canopy(g, w * 0.30, h * 0.42, w * 0.24, h * 0.16, [P.leafD, P.leaf, P.leafL], v * 7 + 2, 5);
      canopy(g, w * 0.72, h * 0.44, w * 0.24, h * 0.16, [P.leafD, P.leaf, P.leafL], v * 7 + 3, 5);
    },
  },
  elm: {
    w: 92, h: 150, block: 0.20, sink: 3,
    draw(g, w, h, v) {
      trunk(g, w / 2, h * 0.34, h - 2, 12);
      canopy(g, w / 2, h * 0.22, w * 0.46, h * 0.22, [P.leafD, P.leaf, P.leafL], v * 11 + 1, 8);
      canopy(g, w * 0.34, h * 0.34, w * 0.26, h * 0.13, [P.leafD, P.leaf, P.leafL], v * 11 + 2, 5);
      canopy(g, w * 0.68, h * 0.36, w * 0.26, h * 0.13, [P.leafD, P.leaf, P.leafL], v * 11 + 3, 5);
    },
  },
  pineTree: {
    w: 76, h: 140, block: 0.20, sink: 3,
    draw(g, w, h) {
      trunk(g, w / 2, h * 0.22, h - 2, 9);
      // Tiers, narrowing upward. Drawn bottom-first so upper tiers overlap.
      for (let i = 6; i >= 0; i--) {
        const t = i / 6;
        const y = h * (0.16 + t * 0.70);
        const rx = w * (0.10 + t * 0.36);
        ellipse(g, w / 2, y, rx, h * 0.05, P.leafD);
        ellipse(g, w / 2, y - 2, rx * 0.92, h * 0.045, P.leaf);
        ellipse(g, w / 2 - rx * 0.2, y - 3, rx * 0.5, h * 0.03, shade(P.leaf, 0.14));
      }
    },
  },
  sapling: {
    w: 40, h: 64, block: 0.16, sink: 2,
    draw(g, w, h, v) {
      trunk(g, w / 2, h * 0.44, h - 2, 5);
      canopy(g, w / 2, h * 0.28, w * 0.42, h * 0.24, [P.leafD, P.leaf, P.leafL], v + 5, 6);
    },
  },
  boxwood: {
    w: 44, h: 34, block: 0.16, sink: 4,
    draw(g, w, h, v) {
      // Clipped, which is the whole point of it — nothing on the west front
      // grew where it chose to.
      ellipse(g, w / 2, h * 0.6, w * 0.46, h * 0.44, P.box);
      ellipse(g, w * 0.42, h * 0.5, w * 0.3, h * 0.3, P.boxL);
      ellipse(g, w * 0.62, h * 0.74, w * 0.3, h * 0.22, P.boxD);
      speckle(g, 2, 2, w - 4, h - 4, P.boxD, 0.10, v);
      speckle(g, 2, 2, w - 4, h - 4, P.boxL, 0.07, v + 1);
    },
  },
  shrub: {
    w: 40, h: 30, block: 0.16, sink: 4,
    draw(g, w, h, v) {
      canopy(g, w / 2, h * 0.58, w * 0.44, h * 0.38, [P.leafD, P.leaf, P.leafL], v + 9, 6);
    },
  },
  flowerbed: {
    w: 56, h: 40, flat: true,
    draw(g, w, h, v) {
      ellipse(g, w / 2, h / 2, w * 0.46, h * 0.44, P.dirtD);
      speckle(g, 4, 4, w - 8, h - 8, P.leaf, 0.24, v);
      for (let i = 0; i < 14; i++) {
        const x = 6 + Math.floor(hash(i, v, 2) * (w - 12));
        const y = 6 + Math.floor(hash(i, v, 3) * (h - 12));
        px(g, x, y, [P.scarletL, P.buffL, P.linenL, P.wineL][i % 4]);
      }
    },
  },

  /* --- fences, walls, gates ------------------------------------------ */
  railFence: {
    w: 64, h: 40, block: 0.5, sink: 4,
    draw(g, w, h) {
      // Post and rail, the Virginia standard.
      for (const rail of [0.32, 0.55, 0.78]) board(g, 2, h * rail, w - 4, 4, [P.woodD, P.wood, P.woodL], rail * 100);
      for (const x of [4, w - 12]) {
        rect(g, x, h * 0.18, 8, h * 0.82, P.woodD);
        vline(g, x, h * 0.18, h * 0.82, P.woodL);
        hline(g, x, h * 0.18, 8, P.woodL);
      }
    },
  },
  gate: {
    w: 72, h: 52, sink: 4,
    draw(g, w, h) {
      for (const x of [2, w - 12]) { rect(g, x, 0, 10, h, P.woodD); vline(g, x, 0, h, P.woodL); }
      for (const rail of [0.22, 0.5, 0.78]) board(g, 12, h * rail, w - 24, 5, [P.woodD, P.wood, P.woodL], rail * 50);
      line(g, 14, h * 0.78, w - 16, h * 0.24, P.woodL);
      line(g, 15, h * 0.78, w - 15, h * 0.24, P.woodD);
    },
  },
  hahaWall: {
    w: 64, h: 34, block: 0.5, sink: 2,
    draw(g, w, h, v) {
      // A sunk wall: it keeps the cattle off the lawn without interrupting the
      // view, which is the single most eighteenth-century object on the estate.
      rect(g, 0, 6, w, h - 6, P.stoneD);
      for (let row = 0; row < 5; row++) {
        const off = (row % 2) * 8;
        for (let x = -16; x < w; x += 16) {
          rect(g, x + off, 6 + row * 6, 15, 5, hash(x, row, v) < 0.4 ? shade(P.stone, -0.08) : P.stone);
          hline(g, x + off, 6 + row * 6, 15, P.stoneL);
        }
      }
      hline(g, 0, 5, w, P.grassD);
      rect(g, 0, 0, w, 5, P.grass);
      speckle(g, 0, 0, w, 5, P.grassL, 0.2, v);
    },
  },

  /* --- the building site --------------------------------------------- */
  scaffold: {
    w: 96, h: 150, block: 0.42, sink: 3,
    draw(g, w, h) {
      const post = [P.pineD, P.pine, P.pineL] as const;
      for (const x of [6, w * 0.36, w * 0.68, w - 14]) {
        board(g, x, 4, 8, h - 6, post, x);
      }
      for (const y of [0.26, 0.52, 0.78]) {
        board(g, 2, h * y, w - 4, 6, post, y * 90);
        // Putlogs sticking out, and a plank walk on top of them.
        for (let x = 4; x < w - 6; x += 18) board(g, x, h * y - 4, 6, 4, post, x + y);
      }
      // Diagonal braces — the thing that stops it reading as a bookshelf.
      line(g, 8, h - 8, w - 16, h * 0.30, P.pineD);
      line(g, 9, h - 8, w - 15, h * 0.30, P.pineL);
      line(g, w - 10, h - 8, 14, h * 0.30, P.pineD);
      // A rope and a hod left on the second lift.
      line(g, w * 0.68 + 4, h * 0.26, w * 0.68 + 4, h * 0.52, P.sandD);
      rect(g, w * 0.62, h * 0.48, 10, 6, P.woodD);
    },
  },
  timberStack: {
    w: 80, h: 46, block: 0.38, sink: 3,
    draw(g, w, h, v) {
      // Fresh-sawn yellow pine, stickered so it can season. It is the brightest
      // thing on the estate and the eye goes to it, which is correct: the
      // house is being built, and that is what the act is about.
      for (let row = 0; row < 5; row++) {
        const y = h - 8 - row * 7;
        const inset = row * 3;
        for (let x = inset; x < w - inset - 6; x += 14) {
          board(g, x, y, 13, 6, [P.pineD, P.pine, P.pineL], x + row + v);
          rect(g, x, y, 3, 6, shade(P.pineD, -0.1)); // end grain
        }
      }
      rect(g, 2, h - 6, w - 4, 5, P.woodD);
    },
  },
  limePit: {
    w: 72, h: 44, flat: true,
    draw(g, w, h, v) {
      ellipse(g, w / 2, h / 2, w * 0.46, h * 0.44, P.dirtD);
      ellipse(g, w / 2, h / 2, w * 0.40, h * 0.36, P.plasterD);
      ellipse(g, w / 2, h * 0.52, w * 0.34, h * 0.30, P.plasterL);
      speckle(g, 6, 6, w - 12, h - 12, P.plaster, 0.2, v);
      // The slaked crust, cracked.
      for (let i = 0; i < 5; i++) {
        const a = hash(i, v, 1) * Math.PI * 2;
        line(g, w / 2, h / 2, w / 2 + Math.cos(a) * w * 0.34, h / 2 + Math.sin(a) * h * 0.3, P.plasterD);
      }
    },
  },
  sawpit: {
    w: 88, h: 52, block: 0.4, sink: 2,
    draw(g, w, h, v) {
      rect(g, 4, h * 0.42, w - 8, h * 0.55, P.ink);
      rect(g, 6, h * 0.46, w - 12, h * 0.48, shade(P.dirtD, -0.2));
      // The log on the trestles, half cut, with the saw still in the kerf.
      for (const x of [10, w - 26]) { rect(g, x, h * 0.2, 8, h * 0.3, P.woodD); }
      board(g, 6, h * 0.14, w - 12, 12, [P.pineD, P.pine, P.pineL], v);
      vline(g, w * 0.6, h * 0.06, h * 0.3, P.stoneL);
      rect(g, w * 0.56, h * 0.02, 8, 6, P.woodD);
      speckle(g, 4, h * 0.42, w - 8, 6, P.pineL, 0.3, v);  // sawdust
    },
  },
  sawhorse: {
    w: 44, h: 34, block: 0.18, sink: 2,
    draw(g, w, h) {
      board(g, 2, 4, w - 4, 6, [P.woodD, P.wood, P.woodL], 1);
      for (const x of [6, w - 12]) {
        line(g, x + 3, 10, x - 2, h - 2, P.woodD);
        line(g, x + 3, 10, x + 9, h - 2, P.woodD);
        line(g, x + 4, 10, x - 1, h - 2, P.wood);
        line(g, x + 4, 10, x + 10, h - 2, P.wood);
      }
    },
  },
  barrow: {
    w: 52, h: 36, block: 0.16, sink: 2,
    draw(g, w, h) {
      rect(g, 8, 8, w - 20, 12, P.wood);
      hline(g, 8, 8, w - 20, P.woodL);
      rect(g, 8, 8, w - 20, 4, P.plasterD);  // mortar in it
      line(g, w - 12, 12, w - 2, 22, P.woodD);
      line(g, 8, 20, 4, h - 6, P.woodD);
      disc(g, 14, h - 8, 7, P.woodD);
      disc(g, 14, h - 8, 4, P.wood);
      px(g, 14, h - 8, P.ink);
    },
  },
  ladder: {
    w: 26, h: 110, block: 0.2, sink: 2,
    draw(g, w, h) {
      for (const x of [3, w - 8]) board(g, x, 0, 5, h, [P.pineD, P.pine, P.pineL], x);
      for (let y = 6; y < h - 4; y += 11) board(g, 3, y, w - 6, 3, [P.pineD, P.pine, P.pineL], y);
    },
  },
  stonePile: {
    w: 60, h: 34, block: 0.30, sink: 3,
    draw(g, w, h, v) {
      for (let i = 0; i < 14; i++) {
        const x = 4 + Math.floor(hash(i, v, 1) * (w - 20));
        const y = h - 6 - Math.floor(hash(i, v, 2) * (h - 14));
        const sw = 8 + Math.floor(hash(i, v, 3) * 8);
        rect(g, x, y, sw, 7, hash(i, v, 4) < 0.4 ? shade(P.stone, -0.1) : P.stone);
        hline(g, x, y, sw, P.stoneL);
        hline(g, x, y + 6, sw, P.stoneD);
      }
    },
  },
  toolChest: {
    w: 46, h: 30, block: 0.18, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 8, w - 4, h - 10, P.woodD);
      rect(g, 3, 9, w - 6, h - 12, P.wood);
      rect(g, 2, 4, w - 4, 6, P.woodL);
      hline(g, 2, 4, w - 4, shade(P.woodL, 0.2));
      for (const x of [8, w - 12]) { vline(g, x, 4, h - 6, P.blackD); }
      rect(g, w / 2 - 3, 8, 6, 5, P.blackL);
    },
  },

  /* --- estate furniture ---------------------------------------------- */
  barrel: {
    w: 30, h: 38, block: 0.28, sink: 2,
    draw(g, w, h) {
      for (let y = 2; y < h - 1; y++) {
        const t = (y - 2) / (h - 4);
        const bulge = Math.sin(t * Math.PI) * 3;
        const ww = Math.round(w - 8 + bulge * 2);
        const x = Math.round(w / 2 - ww / 2);
        hline(g, x, y, ww, P.wood);
        vline(g, x, y, 1, P.woodL);
        vline(g, x + ww - 1, y, 1, P.woodD);
      }
      for (const y of [6, h * 0.45, h - 8]) hline(g, 2, y, w - 4, P.blackD);
      ellipse(g, w / 2, 3, w * 0.36, 2, P.woodL);
      for (let x = 5; x < w - 4; x += 4) vline(g, x, 3, h - 6, shade(P.wood, -0.08));
    },
  },
  crate: {
    w: 34, h: 30, block: 0.18, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 2, w - 4, h - 3, P.wood);
      for (let y = 2; y < h - 2; y += 6) hline(g, 2, y, w - 4, P.woodD);
      hline(g, 2, 2, w - 4, P.woodL);
      line(g, 3, h - 3, w - 4, 3, P.woodD);
      stroke(g, 2, 2, w - 4, h - 3, P.woodD);
    },
  },
  trunkBox: {
    w: 48, h: 34, block: 0.3, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 6, w - 4, h - 8, P.brownD);
      rect(g, 3, 7, w - 6, h - 10, P.brown);
      // Domed lid, thrown back — a trunk being packed, not a trunk standing by.
      ellipse(g, w / 2, 8, w * 0.46, 6, P.brownL);
      hline(g, 4, 6, w - 8, shade(P.brownL, 0.2));
      for (const x of [10, w - 14]) rect(g, x, 6, 4, h - 8, P.blackD);
      rect(g, w / 2 - 4, h * 0.5, 8, 6, P.buffD);
    },
  },
  sack: {
    w: 28, h: 32, block: 0.24, sink: 2,
    draw(g, w, h, v) {
      for (let y = 6; y < h - 1; y++) {
        const t = (y - 6) / (h - 7);
        const ww = Math.round(6 + t * (w - 10));
        hline(g, Math.round(w / 2 - ww / 2), y, ww, P.osna);
        px(g, Math.round(w / 2 - ww / 2), y, P.osnaD);
        px(g, Math.round(w / 2 + ww / 2) - 1, y, P.osnaL);
      }
      rect(g, w / 2 - 4, 3, 8, 5, P.osnaD);
      speckle(g, 4, 8, w - 8, h - 10, P.osnaD, 0.08, v);
    },
  },
  trough: {
    w: 56, h: 26, block: 0.4, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 6, w - 4, h - 8, P.woodD);
      rect(g, 4, 8, w - 8, h - 12, P.water);
      hline(g, 4, 8, w - 8, P.waterL);
      hline(g, 2, 6, w - 4, P.woodL);
      for (const x of [4, w - 8]) rect(g, x, 6, 4, h - 8, P.wood);
    },
  },
  well: {
    w: 54, h: 66, block: 0.45, sink: 3,
    draw(g, w, h) {
      rect(g, 4, h - 22, w - 8, 20, P.stoneD);
      for (let row = 0; row < 3; row++) {
        const off = (row % 2) * 6;
        for (let x = -12; x < w; x += 12) rect(g, x + off + 4, h - 22 + row * 7, 11, 6, P.stone);
      }
      ellipse(g, w / 2, h - 22, w * 0.42, 5, P.ink);
      ellipse(g, w / 2, h - 23, w * 0.36, 4, shade(P.waterD, -0.3));
      for (const x of [8, w - 12]) rect(g, x, 6, 5, h - 28, P.woodD);
      board(g, 4, 2, w - 8, 6, [P.woodD, P.wood, P.woodL], 1);
      line(g, w / 2, 8, w / 2, h - 30, P.sandD);
      rect(g, w / 2 - 5, h - 34, 10, 8, P.woodD);
    },
  },
  bench: {
    w: 52, h: 26, block: 0.3, sink: 2,
    draw(g, w, h) {
      board(g, 2, 8, w - 4, 5, [P.woodD, P.wood, P.woodL], 1);
      for (const x of [6, w - 12]) rect(g, x, 13, 5, h - 14, P.woodD);
    },
  },
  necessary: {
    w: 46, h: 62, block: 0.45, sink: 2,
    draw(g, w, h) {
      rect(g, 4, 12, w - 8, h - 14, P.rustD);
      rect(g, 5, 13, w - 10, h - 16, P.rust);
      // Even the privies at Mount Vernon were built to match the house.
      for (let y = 14; y < h - 4; y += 5) hline(g, 5, y, w - 10, P.rustD);
      rect(g, w / 2 - 6, h - 26, 12, 24, P.woodD);
      ellipse(g, w / 2, 2 + 8, w * 0.5, 9, P.roofD);
      rect(g, 0, 8, w, 6, P.roof);
      hline(g, 0, 8, w, P.roofL);
      px(g, w / 2 + 3, h - 16, P.blackL);
    },
  },
  cartTwoWheel: {
    w: 84, h: 52, block: 0.55, sink: 3,
    draw(g, w, h) {
      board(g, 8, 16, w - 24, 10, [P.woodD, P.wood, P.woodL], 1);
      for (let x = 10; x < w - 20; x += 8) vline(g, x, 8, 10, P.woodD);
      line(g, 8, 22, 0, 30, P.woodD);
      disc(g, 26, h - 12, 12, P.woodD);
      disc(g, 26, h - 12, 9, P.wood);
      disc(g, 26, h - 12, 3, P.woodD);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        line(g, 26, h - 12, 26 + Math.cos(a) * 9, h - 12 + Math.sin(a) * 9, P.woodD);
      }
      disc(g, w - 26, h - 12, 12, P.woodD);
      disc(g, w - 26, h - 12, 9, P.wood);
    },
  },
  chariot: {
    w: 110, h: 76, block: 0.7, sink: 3,
    draw(g, w, h) {
      // The Washington chariot: a closed carriage, green with a leather roof,
      // and the only vehicle on the estate that says gentleman rather than farm.
      const body = [P.greenD, P.green, P.greenL] as const;
      rect(g, 22, 16, w - 48, 26, body[1]);
      hline(g, 22, 16, w - 48, body[2]);
      rect(g, 22, 38, w - 48, 4, body[0]);
      ellipse(g, w / 2 - 2, 16, (w - 48) / 2, 8, P.blackD);
      rect(g, 30, 20, 18, 14, P.glassDark);
      rect(g, 31, 21, 16, 12, P.glass);
      hline(g, 31, 21, 16, P.glassL);
      rect(g, w - 46, 20, 16, 14, P.blackD);
      // Springs, shafts, wheels.
      line(g, 20, 40, 8, 30, P.blackD);
      line(g, w - 26, 40, w - 8, 34, P.blackD);
      disc(g, 30, h - 12, 11, P.blackD); disc(g, 30, h - 12, 8, P.brownD);
      disc(g, w - 30, h - 12, 14, P.blackD); disc(g, w - 30, h - 12, 11, P.brownD);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        line(g, w - 30, h - 12, w - 30 + Math.cos(a) * 11, h - 12 + Math.sin(a) * 11, P.brown);
        line(g, 30, h - 12, 30 + Math.cos(a) * 8, h - 12 + Math.sin(a) * 8, P.brown);
      }
    },
  },
  horse: {
    w: 84, h: 68, block: 0.5, sink: 2,
    draw(g, w, h, v) {
      const coat = v % 2 === 0 ? [P.brownD, P.brown, P.brownL] as const : [shade(P.buffD, -0.2), P.buffD, P.buff] as const;
      // Body.
      ellipse(g, w * 0.5, h * 0.42, w * 0.30, h * 0.18, coat[1]);
      ellipse(g, w * 0.44, h * 0.36, w * 0.24, h * 0.12, coat[2]);
      ellipse(g, w * 0.58, h * 0.50, w * 0.24, h * 0.12, coat[0]);
      // Neck and head.
      rect(g, w * 0.22, h * 0.18, w * 0.12, h * 0.28, coat[1]);
      ellipse(g, w * 0.24, h * 0.20, w * 0.09, h * 0.12, coat[1]);
      ellipse(g, w * 0.19, h * 0.16, w * 0.07, h * 0.06, coat[1]);
      rect(g, w * 0.13, h * 0.14, w * 0.09, h * 0.07, coat[1]);
      px(g, w * 0.16, h * 0.16, P.ink);
      // Mane and tail.
      for (let i = 0; i < 12; i++) vline(g, w * 0.22 + i, h * 0.16 + i * 0.6, 5, shade(coat[0], -0.2));
      for (let i = 0; i < 10; i++) line(g, w * 0.79, h * 0.36 + i, w * 0.86, h * 0.56 + i * 1.2, shade(coat[0], -0.25));
      // Legs.
      for (const [x, o] of [[0.34, 0], [0.40, 2], [0.66, 1], [0.72, 3]] as const) {
        rect(g, w * x, h * 0.52, 5, h * 0.44 - o, coat[o % 2 ? 0 : 1]);
        rect(g, w * x - 1, h * 0.94 - o, 7, 3, P.ink);
      }
    },
  },

  /* --- the river ------------------------------------------------------ */
  wharfPost: {
    w: 20, h: 56, block: 0.2, sink: 4,
    draw(g, w, h, v) {
      rect(g, 4, 4, w - 8, h - 4, P.woodD);
      vline(g, 4, 4, h - 4, P.wood);
      ellipse(g, w / 2, 5, w * 0.32, 3, P.woodL);
      // Weed and tideline at the foot.
      rect(g, 2, h - 14, w - 4, 5, shade(P.leafD, -0.15));
      speckle(g, 2, h - 16, w - 4, 8, P.leafD, 0.3, v);
    },
  },
  sloop: {
    w: 200, h: 190, block: 1.2, sink: 6,
    draw(g, w, h) {
      const hull = [shade(P.brownD, -0.1), P.brownD, P.brown] as const;
      // Hull with a sheer to it, dark below the wale.
      for (let y = 0; y < 26; y++) {
        const t = y / 26;
        const inset = Math.round(Math.pow(t, 1.7) * 30);
        hline(g, 14 + inset, h - 30 + y, w - 34 - inset * 2, t < 0.4 ? hull[2] : hull[1]);
      }
      hline(g, 12, h - 30, w - 26, P.buffD);
      hline(g, 12, h - 29, w - 26, P.buff);
      hline(g, 10, h - 34, w - 22, P.brownD);
      for (let x = 24; x < w - 30; x += 22) rect(g, x, h - 40, 10, 7, P.blackD);  // wale ports
      // Mast, gaff, boom, and a mainsail brailed up.
      rect(g, w * 0.44, 10, 7, h - 46, P.woodD);
      vline(g, w * 0.44, 10, h - 46, P.woodL);
      line(g, w * 0.46, 24, w * 0.80, 96, P.woodD);
      rect(g, w * 0.30, h - 62, w * 0.42, 8, P.woodD);
      for (let y = 30; y < 96; y += 6) {
        const t = (y - 30) / 66;
        hline(g, w * 0.46, y, Math.round(w * 0.30 * t) + 6, y % 12 === 0 ? P.linenD : P.linen);
      }
      // Standing rigging — three lines is enough to say ship.
      line(g, w * 0.46, 12, 16, h - 36, P.sandD);
      line(g, w * 0.47, 12, w - 20, h - 40, P.sandD);
      line(g, w * 0.46, 12, w * 0.44, h - 60, P.sandD);
    },
  },
  netRack: {
    w: 72, h: 62, block: 0.4, sink: 2,
    draw(g, w, h) {
      for (const x of [4, w - 10]) rect(g, x, 4, 6, h - 6, P.woodD);
      board(g, 2, 6, w - 4, 5, [P.woodD, P.wood, P.woodL], 1);
      // The net itself: a diamond mesh, hanging and sagging.
      for (let i = 0; i < 26; i++) {
        const x = 10 + i * 2;
        const sag = Math.sin((i / 26) * Math.PI) * 10;
        line(g, x, 12, x - 8, 12 + 34 + sag, P.sandD);
        line(g, x, 12, x + 8, 12 + 34 + sag, P.sand);
      }
      rect(g, 6, h - 12, 16, 10, P.woodD);
    },
  },
  herringBarrel: {
    w: 34, h: 30, block: 0.28, sink: 2,
    draw(g, w, h) {
      // On its side, stacked at the fishery.
      for (let x = 3; x < w - 2; x++) {
        const t = (x - 3) / (w - 5);
        const bulge = Math.sin(t * Math.PI) * 3;
        const hh = Math.round(h - 10 + bulge * 2);
        const y = Math.round(h / 2 - hh / 2);
        vline(g, x, y, hh, P.wood);
        px(g, x, y, P.woodL);
        px(g, x, y + hh - 1, P.woodD);
      }
      for (const x of [6, w / 2, w - 8]) vline(g, x, 4, h - 8, P.blackD);
      ellipse(g, 4, h / 2, 3, h * 0.34, P.woodD);
    },
  },

  /* --- indoors -------------------------------------------------------- */
  desk: {
    w: 68, h: 46, block: 0.45, sink: 2,
    draw(g, w, h) {
      board(g, 2, 6, w - 4, 7, [P.brownD, P.brown, P.brownL], 1);
      rect(g, 6, 13, w - 12, 18, P.brownD);
      for (let y = 15; y < 30; y += 7) { hline(g, 8, y, w - 16, P.brown); rect(g, w / 2 - 1, y + 2, 3, 2, P.buffD); }
      for (const x of [6, w - 12]) rect(g, x, 31, 6, h - 32, P.brownD);
      // Papers and an inkstand, always.
      rect(g, 14, 2, 18, 5, P.paper);
      rect(g, 16, 1, 16, 5, P.paperDim);
      rect(g, w - 26, 1, 8, 6, P.blackD);
      vline(g, w - 22, -2, 5, P.linenL);
    },
  },
  chairSide: {
    w: 34, h: 52, block: 0.28, sink: 2,
    draw(g, w, h) {
      rect(g, 6, 2, w - 12, 22, P.brownD);
      rect(g, 8, 4, w - 16, 18, P.wine);
      hline(g, 8, 4, w - 16, P.wineL);
      board(g, 4, 24, w - 8, 5, [P.brownD, P.brown, P.brownL], 1);
      for (const x of [6, w - 10]) rect(g, x, 29, 4, h - 30, P.brownD);
    },
  },
  armchair: {
    w: 46, h: 56, block: 0.34, sink: 2,
    draw(g, w, h) {
      rect(g, 4, 4, w - 8, 30, P.wineD);
      rect(g, 6, 6, w - 12, 26, P.wine);
      rect(g, 2, 20, 6, 18, P.wineD);
      rect(g, w - 8, 20, 6, 18, P.wineD);
      board(g, 4, 34, w - 8, 6, [P.brownD, P.brown, P.brownL], 1);
      for (const x of [6, w - 12]) rect(g, x, 40, 5, h - 41, P.brownD);
    },
  },
  tableRound: {
    w: 60, h: 44, block: 0.4, sink: 2,
    draw(g, w, h) {
      ellipse(g, w / 2, 12, w * 0.46, 10, P.brownD);
      ellipse(g, w / 2, 10, w * 0.44, 9, P.brown);
      ellipse(g, w / 2 - 4, 8, w * 0.28, 5, P.brownL);
      rect(g, w / 2 - 4, 20, 8, h - 26, P.brownD);
      for (const dx of [-14, 0, 14]) line(g, w / 2, h - 8, w / 2 + dx, h - 2, P.brownD);
    },
  },
  tableLong: {
    w: 96, h: 44, block: 0.6, sink: 2,
    draw(g, w, h) {
      board(g, 2, 8, w - 4, 8, [P.brownD, P.brown, P.brownL], 1);
      for (const x of [8, w - 16]) { rect(g, x, 16, 7, h - 18, P.brownD); vline(g, x, 16, h - 18, P.brown); }
      // Laid: a cloth, and plate enough to say the room dines.
      rect(g, 10, 4, w - 20, 5, P.linenL);
      for (let x = 18; x < w - 20; x += 20) { ellipse(g, x, 5, 6, 2, P.plasterL); }
    },
  },
  sideboard: {
    w: 74, h: 48, block: 0.5, sink: 2,
    draw(g, w, h) {
      board(g, 2, 8, w - 4, 6, [P.brownD, P.brown, P.brownL], 1);
      rect(g, 6, 14, w - 12, 22, P.brownD);
      for (const x of [10, w / 2 + 2]) { rect(g, x, 17, w / 2 - 16, 16, P.brown); px(g, x + 4, 25, P.buffD); }
      for (const x of [6, w - 12]) rect(g, x, 36, 5, h - 37, P.brownD);
      // Silver on top. It catches the bloom and it is meant to.
      ellipse(g, 20, 6, 7, 3, P.plasterL);
      rect(g, w - 30, 1, 5, 8, P.plasterL);
      rect(g, w - 22, 2, 4, 7, P.linenL);
    },
  },
  bookcase: {
    w: 62, h: 96, block: 0.45, sink: 2,
    draw(g, w, h, v) {
      rect(g, 2, 2, w - 4, h - 4, P.brownD);
      for (let shelf = 0; shelf < 4; shelf++) {
        const y = 8 + shelf * 22;
        rect(g, 6, y, w - 12, 18, shade(P.brownD, -0.2));
        let x = 8;
        while (x < w - 12) {
          const bw = 3 + Math.floor(hash(x, shelf, v) * 4);
          const bh = 12 + Math.floor(hash(x, shelf, v + 1) * 5);
          const c = [P.wineD, P.brownD, P.greenD, P.blueD, P.leafD][Math.floor(hash(x, shelf, v + 2) * 5)];
          rect(g, x, y + 18 - bh, bw, bh, c);
          hline(g, x, y + 18 - bh, bw, shade(c, 0.25));
          if (bw > 4) hline(g, x + 1, y + 18 - bh + 3, bw - 2, P.buffD);
          x += bw + 1;
        }
        board(g, 4, y + 18, w - 8, 3, [P.brownD, P.brown, P.brownL], shelf);
      }
    },
  },
  globe: {
    w: 40, h: 56, block: 0.25, sink: 2,
    draw(g, w, h) {
      disc(g, w / 2, 20, 15, P.sandD);
      disc(g, w / 2 - 3, 17, 11, P.sand);
      // Continents, unlabelled — nothing generated ever renders readable text.
      ellipse(g, w / 2 - 5, 16, 6, 4, P.leafD);
      ellipse(g, w / 2 + 5, 24, 5, 5, P.leafD);
      ellipse(g, w / 2 + 2, 12, 3, 2, P.leafD);
      for (let a = -1.2; a < 1.3; a += 0.6) ellipse(g, w / 2, 20, 15 * Math.cos(a), 15, 'rgba(0,0,0,0)');
      rect(g, w / 2 - 16, 19, 32, 1, P.buffD);
      rect(g, w / 2 - 2, 35, 4, h - 40, P.brownD);
      ellipse(g, w / 2, h - 4, 12, 4, P.brownD);
    },
  },
  bedTester: {
    w: 92, h: 108, block: 0.7, sink: 2,
    draw(g, w, h) {
      for (const x of [6, w - 14]) rect(g, x, 8, 8, h - 10, P.brownD);
      rect(g, 2, 2, w - 4, 10, P.brownD);
      rect(g, 4, 4, w - 8, 7, P.wine);
      // Hangings — the most expensive thing in an 18th-century bedchamber.
      for (const x of [8, w - 22]) {
        rect(g, x, 12, 14, h - 40, P.wineD);
        for (let y = 14; y < h - 30; y += 5) hline(g, x, y, 14, P.wine);
      }
      rect(g, 20, h - 40, w - 40, 20, P.linenL);
      rect(g, 20, h - 44, w - 40, 6, P.linen);
      rect(g, 24, h - 48, 20, 8, P.linenL);
      rect(g, 18, h - 22, w - 36, 8, P.brownD);
    },
  },
  bedSimple: {
    w: 76, h: 46, block: 0.6, sink: 2,
    draw(g, w, h) {
      rect(g, 4, 10, w - 8, 22, P.linen);
      rect(g, 4, 8, w - 8, 5, P.linenL);
      rect(g, 6, 6, 18, 7, P.linenL);
      rect(g, 2, 30, w - 4, 6, P.brownD);
      for (const x of [4, w - 10]) rect(g, x, 4, 6, h - 6, P.brownD);
    },
  },
  chestDrawers: {
    w: 56, h: 54, block: 0.4, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 4, w - 4, h - 6, P.brownD);
      board(g, 0, 2, w, 5, [P.brownD, P.brown, P.brownL], 1);
      for (let i = 0; i < 3; i++) {
        const y = 10 + i * 13;
        rect(g, 6, y, w - 12, 11, P.brown);
        hline(g, 6, y, w - 12, P.brownL);
        rect(g, w / 2 - 5, y + 4, 4, 3, P.buffD);
        rect(g, w / 2 + 2, y + 4, 4, 3, P.buffD);
      }
    },
  },
  mantel: {
    w: 96, h: 84, block: 0, sink: 0,
    draw(g, w, h) {
      // A chimneypiece drawn as a wall fixture: the fire is the only warm light
      // source indoors, and the bloom pass keys off it.
      rect(g, 2, 2, w - 4, h - 4, P.plasterD);
      rect(g, 8, 8, w - 16, 6, P.plasterL);
      rect(g, 14, 20, w - 28, h - 30, P.blackD);
      rect(g, 18, 26, w - 36, h - 38, shade(P.blackD, -0.4));
      // Fire.
      for (let i = 0; i < 9; i++) {
        const x = 26 + i * 4;
        const fh = 8 + Math.floor(hash(i, 0, 2) * 12);
        rect(g, x, h - 20 - fh, 3, fh, i % 3 === 0 ? P.fireL : P.fire);
        px(g, x + 1, h - 20 - fh, P.ember);
      }
      rect(g, 20, h - 20, w - 40, 6, P.fireD);
      hline(g, 20, h - 20, w - 40, P.ember);
      for (const x of [8, w - 16]) rect(g, x, 14, 8, h - 20, P.plaster);
      rect(g, 4, 4, w - 8, 5, P.plasterL);
    },
  },
  candleStand: {
    w: 24, h: 48, block: 0.2, sink: 2,
    draw(g, w, h) {
      ellipse(g, w / 2, h - 4, 9, 4, P.brownD);
      rect(g, w / 2 - 2, 14, 4, h - 18, P.brownD);
      ellipse(g, w / 2, 14, 8, 3, P.brown);
      rect(g, w / 2 - 2, 6, 4, 8, P.linenL);
      px(g, w / 2, 4, P.ember);
      px(g, w / 2, 3, P.fireL);
    },
  },
  framedPortrait: {
    w: 44, h: 54, block: 0, sink: 0,
    draw(g, w, h) {
      rect(g, 0, 0, w, h, P.buffD);
      rect(g, 3, 3, w - 6, h - 6, P.brownD);
      rect(g, 5, 5, w - 10, h - 10, shade(P.blueD, -0.15));
      // A colonel of the Virginia Regiment, at thirty. He is looking at you.
      ellipse(g, w / 2, h * 0.42, 8, 10, P.skinA);
      rect(g, w / 2 - 9, h * 0.62, 18, h * 0.3, P.blueD);
      rect(g, w / 2 - 9, h * 0.62, 5, h * 0.3, P.buffD);
      rect(g, w / 2 + 4, h * 0.62, 5, h * 0.3, P.buffD);
      rect(g, w / 2 - 4, h * 0.6, 8, 4, P.linenL);
      ellipse(g, w / 2, h * 0.34, 8, 4, P.hairGrey);
      hline(g, 3, 3, w - 6, P.buffL);
    },
  },
  spinningWheel: {
    w: 46, h: 54, block: 0.3, sink: 2,
    draw(g, w, h) {
      disc(g, 16, 24, 14, P.brownD);
      disc(g, 16, 24, 11, shade(P.brownD, -0.4));
      disc(g, 16, 24, 10, P.plasterD);
      disc(g, 16, 24, 9, shade(P.brownD, -0.5));
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        line(g, 16, 24, 16 + Math.cos(a) * 10, 24 + Math.sin(a) * 10, P.brown);
      }
      line(g, 4, h - 4, w - 6, h - 10, P.brownD);
      rect(g, w - 14, 12, 4, h - 22, P.brownD);
      rect(g, w - 18, 8, 12, 5, P.linenL);
    },
  },
  hearthKitchen: {
    w: 120, h: 92, block: 0, sink: 0,
    draw(g, w, h) {
      rect(g, 0, 0, w, h, P.brickD);
      for (let row = 0; row < 14; row++) {
        const off = (row % 2) * 8;
        for (let x = -16; x < w; x += 16) rect(g, x + off, row * 7, 15, 6, hash(x, row, 1) < 0.35 ? shade(P.brick, -0.14) : P.brick);
      }
      rect(g, 16, 22, w - 32, h - 24, shade(P.blackD, -0.5));
      board(g, 8, 14, w - 16, 9, [P.woodD, P.wood, P.woodL], 1);
      // Crane, pot, fire.
      line(g, 22, 30, 22, h - 20, P.blackL);
      line(g, 22, 34, 60, 34, P.blackL);
      rect(g, 52, 36, 4, 12, P.blackL);
      ellipse(g, 58, 56, 14, 11, P.blackD);
      ellipse(g, 58, 47, 14, 4, P.blackL);
      for (let i = 0; i < 14; i++) {
        const x = 30 + i * 5;
        const fh = 6 + Math.floor(hash(i, 1, 3) * 14);
        rect(g, x, h - 16 - fh, 4, fh, i % 3 === 0 ? P.fireL : P.fire);
        px(g, x + 1, h - 17 - fh, P.ember);
      }
      rect(g, 22, h - 16, w - 44, 8, P.fireD);
      speckle(g, 16, 22, w - 32, 14, P.blackD, 0.4, 2);
    },
  },
  dresserPlates: {
    w: 66, h: 88, block: 0.4, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 2, w - 4, h - 4, P.brownD);
      for (let shelf = 0; shelf < 3; shelf++) {
        const y = 8 + shelf * 20;
        rect(g, 6, y, w - 12, 16, shade(P.brownD, -0.25));
        for (let i = 0; i < 4; i++) {
          ellipse(g, 12 + i * 13, y + 9, 6, 7, P.plasterD);
          ellipse(g, 12 + i * 13, y + 8, 5, 6, P.plasterL);
        }
        board(g, 4, y + 16, w - 8, 3, [P.brownD, P.brown, P.brownL], shelf);
      }
      rect(g, 6, 70, w - 12, 14, P.brown);
    },
  },
  workTable: {
    w: 72, h: 42, block: 0.5, sink: 2,
    draw(g, w, h) {
      board(g, 2, 8, w - 4, 8, [P.woodD, P.wood, P.woodL], 1);
      for (const x of [6, w - 12]) rect(g, x, 16, 6, h - 18, P.woodD);
      // Scrubbed white, and something being prepared on it.
      hline(g, 2, 8, w - 4, P.linenD);
      ellipse(g, 22, 6, 8, 3, P.plasterL);
      rect(g, 40, 3, 10, 5, P.leafD);
      rect(g, 52, 4, 6, 4, P.scarletD);
    },
  },
  washTub: {
    w: 42, h: 30, block: 0.3, sink: 2,
    draw(g, w, h) {
      for (let y = 4; y < h - 1; y++) {
        const t = (y - 4) / (h - 5);
        const ww = Math.round(w - 6 - t * 8);
        hline(g, Math.round(w / 2 - ww / 2), y, ww, P.wood);
        px(g, Math.round(w / 2 - ww / 2), y, P.woodL);
        px(g, Math.round(w / 2 + ww / 2) - 1, y, P.woodD);
      }
      ellipse(g, w / 2, 5, w * 0.42, 3, P.water);
      ellipse(g, w / 2 - 3, 4, w * 0.2, 2, P.waterL);
      hline(g, 3, 10, w - 6, P.blackD);
    },
  },
  cookFire: {
    w: 50, h: 34, sink: 3,
    draw(g, w, h) {
      ellipse(g, w / 2, h - 6, 18, 6, P.stoneD);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        ellipse(g, w / 2 + Math.cos(a) * 16, h - 6 + Math.sin(a) * 5, 5, 3, P.stone);
      }
      for (let i = 0; i < 8; i++) {
        const x = 14 + i * 3;
        const fh = 6 + Math.floor(hash(i, 0, 7) * 12);
        rect(g, x, h - 10 - fh, 3, fh, i % 3 === 0 ? P.fireL : P.fire);
      }
      rect(g, 12, h - 12, w - 24, 5, P.fireD);
      line(g, 8, h - 4, w - 8, h - 22, P.woodD);
    },
  },

  /* --- documents and small things you pick up ------------------------ */
  papers: {
    w: 30, h: 22, block: 0, sink: 1,
    draw(g, w, h) {
      for (let i = 0; i < 4; i++) {
        rect(g, 2 + i, h - 8 - i * 3, w - 8, 6, i % 2 ? P.paperDim : P.paper);
        hline(g, 2 + i, h - 8 - i * 3, w - 8, P.linenL);
        for (let y = 2; y < 5; y += 2) hline(g, 5 + i, h - 8 - i * 3 + y, w - 14, P.paperDim);
      }
    },
  },
  bookStack: {
    w: 30, h: 26, block: 0, sink: 1,
    draw(g, w, h) {
      const cols = [P.wineD, P.brownD, P.greenD];
      for (let i = 0; i < 3; i++) {
        rect(g, 3 + i, h - 6 - i * 6, w - 8 - i * 2, 6, cols[i]);
        hline(g, 3 + i, h - 6 - i * 6, w - 8 - i * 2, shade(cols[i], 0.3));
        hline(g, 4 + i, h - 3 - i * 6, w - 10 - i * 2, P.buffD);
      }
    },
  },
  chestSurveyor: {
    w: 52, h: 34, block: 0.3, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 8, w - 4, h - 10, P.brownD);
      rect(g, 3, 9, w - 6, h - 12, P.brown);
      rect(g, 0, 4, w, 6, P.brownL);
      // A Gunter's chain and a circumferenter, half packed.
      ellipse(g, 14, 4, 8, 3, P.buffD);
      ellipse(g, 14, 3, 6, 2, P.buff);
      for (let i = 0; i < 8; i++) px(g, 26 + i * 2, 4 + (i % 2), P.plasterL);
      rect(g, w - 16, 1, 10, 6, P.blackD);
    },
  },
  uniformOnChest: {
    w: 50, h: 40, block: 0.3, sink: 2,
    draw(g, w, h) {
      rect(g, 2, 16, w - 4, h - 18, P.brownD);
      rect(g, 3, 17, w - 6, h - 20, P.brown);
      // The coat, folded, blue faced buff. The object the act turns on.
      rect(g, 6, 6, w - 12, 12, P.blueD);
      rect(g, 7, 7, w - 14, 10, P.blue);
      rect(g, 7, 7, 6, 10, P.buff);
      rect(g, w - 13, 7, 6, 10, P.buff);
      hline(g, 7, 7, w - 14, P.blueL);
      for (let x = 16; x < w - 16; x += 5) px(g, x, 12, P.buffL);
      rect(g, 10, 2, w - 20, 5, P.scarlet);   // the sash on top of it
      hline(g, 10, 2, w - 20, P.scarletL);
    },
  },
  signpost: {
    w: 34, h: 62, block: 0.2, sink: 3,
    draw(g, w, h) {
      rect(g, w / 2 - 3, 8, 6, h - 10, P.woodD);
      vline(g, w / 2 - 3, 8, h - 10, P.woodL);
      board(g, 2, 6, w - 4, 12, [P.woodD, P.wood, P.woodL], 1);
      for (let y = 9; y < 16; y += 3) hline(g, 6, y, w - 14, P.inkSoft);
    },
  },


  /* ====================================================================== *
   * CAMBRIDGE, 1775-76
   *
   * The camp is made of canvas, brush, turf and iron, and every one of those
   * is a different drawing problem from anything Act 1 needed. Two rules
   * carried over and they carried the whole set: three values or it reads as
   * a sticker, and nothing is symmetrical. A row of identical wedge tents is
   * a texture; a row of wedge tents where each one sags differently is a
   * camp.
   * ==================================================================== */

  /** A private's wedge tent. Canvas over a ridge pole, sagging between pegs. */
  tentWedge: {
    w: 52, h: 40, block: 0.5, sink: 2,
    draw(g, w, h, v) {
      const ridge = 6;
      // The two slopes, drawn line by line so the canvas can sag.
      for (let y = ridge; y < h - 2; y++) {
        const t = (y - ridge) / (h - 2 - ridge);
        const half = Math.round(2 + t * (w / 2 - 3) + Math.sin(t * Math.PI) * 1.5);
        hline(g, w / 2 - half, y, half, P.canvasM);
        hline(g, w / 2, y, half, P.canvasD);
      }
      // Lit slope, shadowed slope, and the ridge itself catching the light.
      for (let y = ridge; y < h - 2; y++) {
        const t = (y - ridge) / (h - 2 - ridge);
        const half = Math.round(2 + t * (w / 2 - 3) + Math.sin(t * Math.PI) * 1.5);
        if (hash(y, v, 1) < 0.35) hline(g, w / 2 - half, y, 2, P.canvasL);
      }
      hline(g, w / 2 - 2, ridge, 5, P.canvasL);
      // The ridge pole ends poking out either end.
      hline(g, w / 2 - 3, ridge - 1, 7, P.woodD);
      // The dark mouth of it, which is the only thing that makes it a shelter.
      for (let y = h - 16; y < h - 2; y++) {
        const t = (y - (h - 16)) / 14;
        const half = Math.round(3 + t * 5);
        hline(g, w / 2 - half, y, half * 2, shade(P.ink, 0.10));
      }
      // Pegs and guy lines.
      for (const s of [-1, 1] as const) {
        line(g, w / 2 + s * 4, ridge + 1, w / 2 + s * (w / 2 - 1), h - 3, P.canvasD);
        px(g, w / 2 + s * (w / 2 - 1), h - 2, P.woodD);
      }
      speckle(g, 4, ridge, w - 8, h - ridge - 3, P.canvasD, 0.05, v + 3);
    },
  },

  /**
   * The general's marquee. Bigger, walled, with a fly over the door.
   *
   * He lived in one of these until the Vassall House was made ready, and then
   * kept it for the field. It is the largest single object in the camp and
   * the scene should let it be — this is where the army looks when it wants
   * to know whether anybody is in charge.
   */
  tentMarquee: {
    w: 96, h: 66, block: 0.9, sink: 3,
    draw(g, w, h, v) {
      const eave = 30;
      // Walls.
      rect(g, 8, eave, w - 16, h - eave - 3, P.canvasM);
      rect(g, w - 26, eave, 18, h - eave - 3, P.canvasD);
      vline(g, 8, eave, h - eave - 3, P.canvasL);
      // Hipped canvas roof.
      for (let y = 8; y < eave; y++) {
        const t = (y - 8) / (eave - 8);
        const half = Math.round(6 + t * (w / 2 - 7));
        hline(g, w / 2 - half, y, half, P.canvasL);
        hline(g, w / 2, y, half, P.canvasM);
        if (hash(y, v, 5) < 0.3) hline(g, w / 2 - half, y, 3, shade(P.canvasL, 0.06));
      }
      hline(g, w / 2 - 8, 8, 17, P.canvasL);
      // The door: a fly held open on two poles, and darkness behind it.
      rect(g, w / 2 - 12, h - 30, 24, 27, shade(P.ink, 0.12));
      for (const s of [-1, 1] as const) {
        vline(g, w / 2 + s * 13, h - 34, 31, P.woodD);
        line(g, w / 2 + s * 13, h - 34, w / 2 + s * 20, h - 4, P.canvasD);
      }
      rect(g, w / 2 - 16, h - 36, 33, 5, P.canvasL);
      // Guy lines to the pegs.
      for (const s of [-1, 1] as const) {
        line(g, w / 2 + s * (w / 2 - 8), eave + 2, w / 2 + s * (w / 2 - 1), h - 4, P.canvasD);
      }
      speckle(g, 8, 10, w - 16, h - 14, P.canvasD, 0.045, v + 7);
    },
  },

  /**
   * A brush shelter.
   *
   * Greene's letter is the source and it is worth quoting in a comment
   * because it is what this object is: some regiments had tents, and some
   * had "shelters made of boards, some of sailcloth, some partly of one and
   * partly of the other" — and some had brush. The camp street is a survey
   * of how unequal an army of thirteen colonies actually was.
   */
  brushShelter: {
    w: 58, h: 34, block: 0.5, sink: 2,
    draw(g, w, h, v) {
      // A lean-to frame of poles.
      for (const x of [4, w / 2, w - 6]) line(g, x, h - 3, x + 6, 6, P.trunkD);
      line(g, 6, 8, w - 4, 8, P.trunkD);
      // Brush thrown over it, drawn as strokes rather than a mass.
      for (let i = 0; i < 150; i++) {
        const t = hash(i, v, 11);
        const x = Math.round(4 + hash(i, v, 12) * (w - 10));
        const y = Math.round(7 + hash(i, v, 13) * (h - 12));
        const len = 3 + Math.floor(hash(i, v, 14) * 5);
        const c = t < 0.35 ? P.leafDry : t < 0.7 ? P.leafD : P.trunkD;
        if (hash(i, v, 15) < 0.55) line(g, x, y, x + len, y - 2, c);
        else line(g, x, y, x + 2, y + len, c);
      }
      // A board or two, because some of them had boards and some did not.
      board(g, w - 22, h - 18, 18, 5, [P.woodD, P.wood, P.woodL], v);
      rect(g, 8, h - 12, 14, 9, shade(P.ink, 0.14));
    },
  },

  /** The kettle, on a trivet, over the fire. One to a mess of six. */
  campKettle: {
    w: 34, h: 32, block: 0.22, sink: 2,
    draw(g, w, h, v) {
      // Embers.
      ellipse(g, w / 2, h - 5, 13, 4, P.fireD);
      for (let i = 0; i < 12; i++) {
        px(g, Math.round(w / 2 - 11 + hash(i, v, 21) * 22), h - 6 + Math.round(hash(i, v, 22) * 3),
          hash(i, v, 23) < 0.4 ? P.ember : P.fire);
      }
      // Trivet legs.
      for (const s of [-1, 0, 1] as const) line(g, w / 2 + s * 9, h - 4, w / 2 + s * 5, h - 16, P.ironD);
      // The pot: belly, rim, bail.
      ellipse(g, w / 2, h - 18, 11, 9, P.iron);
      ellipse(g, w / 2 - 3, h - 21, 6, 5, P.ironL);
      ellipse(g, w / 2, h - 26, 11, 3, P.ironD);
      ellipse(g, w / 2, h - 26, 8, 2, shade(P.ink, 0.06));
      for (let a = 0; a <= 12; a++) {
        const t = a / 12;
        px(g, Math.round(w / 2 - 11 + t * 22), Math.round(h - 27 - Math.sin(t * Math.PI) * 8), P.ironL);
      }
    },
  },

  /** Three muskets stacked by the bayonet — the one thing this army lacks. */
  musketStack: {
    w: 30, h: 52, block: 0.2, sink: 2,
    draw(g, w, h) {
      for (const [x0, x1] of [[3, 14], [w - 4, 16], [w / 2, 15]] as const) {
        line(g, x0, h - 3, x1, 6, P.woodD);
        line(g, x0 + 1, h - 3, x1 + 1, 6, P.wood);
        // Lock and barrel bands.
        px(g, Math.round((x0 + x1) / 2), Math.round(h / 2), P.ironL);
      }
      // Where the bayonets would cross, if there were bayonets.
      disc(g, 15, 6, 3, P.ironD);
      px(g, 15, 5, P.ironL);
    },
  },

  /** A regimental drum, hooped and painted. The camp runs on this, not a clock. */
  drum: {
    w: 34, h: 34, block: 0.2, sink: 2,
    draw(g, w, h, v) {
      cylinder(g, 4, 8, w - 8, h - 14, [P.blueD, P.blue, P.blueL]);
      rect(g, 3, 6, w - 6, 4, P.woodL);
      rect(g, 3, h - 8, w - 6, 4, P.woodD);
      // The cords, zig-zagged between the hoops.
      for (let i = 0; i < 6; i++) {
        const x = 5 + i * 4;
        line(g, x, 10, x + 3, h - 8, P.buffL);
        line(g, x + 3, h - 8, x + 6, 10, P.buffL);
      }
      ellipse(g, w / 2, 8, 12, 3, P.linenL);
      speckle(g, 5, 9, w - 10, h - 16, P.blueD, 0.05, v);
    },
  },

  /** A bare staff. What the camp flew before there was anything to fly. */
  flagStaff: {
    w: 20, h: 84, block: 0.16, sink: 4,
    draw(g, w, h) {
      vline(g, w / 2, 2, h - 4, P.woodD);
      vline(g, w / 2 + 1, 2, h - 4, P.wood);
      vline(g, w / 2 + 2, 2, h - 4, P.woodL);
      disc(g, w / 2 + 1, 3, 2, P.buffL);
      // The halyard, and nothing on the end of it.
      line(g, w / 2, 6, w / 2 - 4, h - 12, P.linenD);
    },
  },

  /**
   * The Grand Union, raised on Prospect Hill on 1 January 1776.
   *
   * Thirteen stripes and the King's colours still in the canton, which is the
   * whole of where this war is in January: they are fighting the King's army
   * under the King's flag, because independence has not been declared and
   * most of them have not asked for it. Do not draw stars. There are no stars
   * for another eighteen months, and a student who is shown one here will
   * carry the error out of the room.
   */
  grandUnion: {
    w: 74, h: 88, block: 0.16, sink: 4,
    draw(g, w, h, v) {
      vline(g, 4, 2, h - 4, P.woodD);
      vline(g, 5, 2, h - 4, P.wood);
      vline(g, 6, 2, h - 4, P.woodL);
      disc(g, 5, 3, 2, P.buffL);
      const fy = 8, fh = 39, fw = w - 12;
      // Thirteen stripes, red and white, with the fly lifting a little.
      for (let i = 0; i < 13; i++) {
        const y = fy + Math.round((i * fh) / 13);
        const hgt = Math.round(((i + 1) * fh) / 13) - Math.round((i * fh) / 13);
        for (let x = 0; x < fw; x++) {
          const lift = Math.round(Math.sin((x / fw) * Math.PI * 1.4 + v) * 2);
          rect(g, 7 + x, y + lift, 1, Math.max(1, hgt), i % 2 === 0 ? P.scarlet : P.linenL);
        }
      }
      // The canton: the union flag of 1606, crosses only.
      const cw = Math.round(fw * 0.42), ch = Math.round((fh * 7) / 13);
      rect(g, 7, fy, cw, ch, P.blueD);
      line(g, 7, fy, 7 + cw - 1, fy + ch - 1, P.linenL);
      line(g, 7, fy + ch - 1, 7 + cw - 1, fy, P.linenL);
      rect(g, 7, fy + Math.round(ch / 2) - 1, cw, 3, P.linenL);
      rect(g, 7 + Math.round(cw / 2) - 1, fy, 3, ch, P.linenL);
      rect(g, 7, fy + Math.round(ch / 2), cw, 1, P.scarlet);
      rect(g, 7 + Math.round(cw / 2), fy, 1, ch, P.scarlet);
    },
  },

  /**
   * A gabion: a bottomless wicker basket set on end and filled with earth.
   *
   * Twenty of them side by side is a wall, and any farmer who has made a
   * hurdle can make one. That sentence is the whole reason field engineering
   * was something this army could actually do.
   */
  gabion: {
    w: 34, h: 42, block: 0.3, sink: 2,
    draw(g, w, h, v) {
      // The wicker: uprights first, then the weave over them.
      cylinder(g, 3, 6, w - 6, h - 8, [P.trunkD, P.brown, P.brownL]);
      for (let x = 5; x < w - 4; x += 4) vline(g, x, 6, h - 8, shade(P.brownD, -0.06));
      for (let y = 8; y < h - 4; y += 3) {
        for (let x = 3; x < w - 3; x++) {
          if (((x + y) >> 1) % 2 === 0) px(g, x, y, P.brownL);
        }
      }
      // Earth, heaped above the rim and spilling a little.
      ellipse(g, w / 2, 7, w * 0.44, 5, P.turf);
      ellipse(g, w / 2 - 2, 5, w * 0.30, 3, P.turfL);
      speckle(g, 4, 3, w - 8, 8, P.turfD, 0.20, v);
    },
  },

  /** Fascines: brushwood bound in six-foot lengths, stacked. */
  fascineStack: {
    w: 60, h: 26, block: 0.34, sink: 2,
    draw(g, w, h, v) {
      for (let row = 0; row < 3; row++) {
        const y = h - 6 - row * 6;
        const inset = row * 5;
        cylinder(g, 3 + inset, y, w - 6 - inset * 2, 6, [P.trunkD, P.brown, P.leafDry]);
        // Cut ends, which is what says brushwood rather than a log.
        for (let x = 4 + inset; x < w - 4 - inset; x += 3) {
          px(g, x, y + 1 + Math.floor(hash(x, row, v) * 3), P.leafDry);
        }
        // The withy binding it.
        for (const bx of [10 + inset, w - 14 - inset]) vline(g, bx, y, 6, P.trunkD);
      }
    },
  },

  /** Abatis: a felled tree laid with its sharpened branches outward. */
  abatis: {
    w: 76, h: 30, block: 0.55, sink: 2,
    draw(g, w, h, v) {
      cylinder(g, 4, h - 12, w - 8, 8, [P.trunkD, P.trunk, P.trunkL], false);
      for (let i = 0; i < 22; i++) {
        const x = Math.round(6 + hash(i, v, 31) * (w - 12));
        const len = 8 + Math.floor(hash(i, v, 32) * 12);
        const up = hash(i, v, 33) < 0.6;
        const y1 = up ? h - 14 - len : h - 4 + Math.floor(len * 0.2);
        line(g, x, h - 8, x + Math.round((hash(i, v, 34) - 0.5) * 16), y1, P.trunkD);
        line(g, x + 1, h - 8, x + 1 + Math.round((hash(i, v, 34) - 0.5) * 16), y1, P.trunk);
        // The sharpened point, which is the entire purpose of the object.
        px(g, x + Math.round((hash(i, v, 34) - 0.5) * 16), y1, P.pineL);
      }
    },
  },

  /** A palisade: pointed stakes, driven and braced. */
  palisade: {
    w: 64, h: 40, block: 0.42, sink: 3,
    draw(g, w, h, v) {
      for (let x = 3; x < w - 3; x += 6) {
        const top = 6 + Math.floor(hash(x, v, 41) * 4);
        rect(g, x, top, 5, h - top - 2, P.wood);
        vline(g, x, top, h - top - 2, P.woodL);
        vline(g, x + 4, top, h - top - 2, P.woodD);
        // The point.
        px(g, x + 2, top - 2, P.pineL);
        px(g, x + 1, top - 1, P.pine);
        px(g, x + 3, top - 1, P.pine);
      }
      rect(g, 2, h - 14, w - 4, 3, P.woodD);
    },
  },

  /**
   * A field gun on its carriage. Iron barrel, red-ochred carriage.
   *
   * There are almost none of these in front of Boston until Knox gets back,
   * which is why the two that are here stand where the whole camp walks past
   * them.
   */
  fieldGun: {
    w: 78, h: 42, block: 0.5, sink: 2,
    draw(g, w, h) {
      // Trail and cheeks.
      rect(g, 6, h - 16, w - 14, 7, P.carriage);
      hline(g, 6, h - 16, w - 14, P.carriageL);
      hline(g, 6, h - 10, w - 14, P.carriageD);
      rect(g, w - 20, h - 24, 14, 12, P.carriage);
      // The barrel, tapering, with reinforcing rings and a muzzle swell.
      for (let x = 8; x < w - 16; x++) {
        const t = (x - 8) / (w - 24);
        const r = Math.round(7 - t * 2.5);
        rect(g, x, h - 26 - r, 1, r * 2, P.iron);
        px(g, x, h - 26 - r, P.ironL);
        px(g, x, h - 27 + r, P.ironD);
      }
      for (const x of [12, 26, w - 30]) rect(g, x, h - 35, 3, 18, P.ironD);
      rect(g, 6, h - 34, 4, 16, P.ironL);   // the muzzle
      rect(g, w - 20, h - 30, 6, 10, P.ironD);  // the cascabel end
      // Wheels: spokes, felloes, and an iron tyre.
      for (const cx of [22, w - 30]) {
        disc(g, cx, h - 12, 11, P.carriageD);
        disc(g, cx, h - 12, 9, P.carriage);
        for (let a = 0; a < 8; a++) {
          const t = (a / 8) * Math.PI * 2;
          line(g, cx, h - 12, Math.round(cx + Math.cos(t) * 9), Math.round(h - 12 + Math.sin(t) * 9), P.carriageL);
        }
        disc(g, cx, h - 12, 3, P.ironD);
      }
    },
  },

  /** A pyramid of round shot, which is the only tidy thing in the camp. */
  shotPile: {
    w: 40, h: 30, block: 0.24, sink: 2,
    draw(g, w, h) {
      const rows = [[5, 0], [4, 5], [3, 10], [2, 15], [1, 20]] as const;
      for (const [n, up] of rows) {
        for (let i = 0; i < n; i++) {
          const cx = w / 2 - (n - 1) * 4 + i * 8;
          disc(g, cx, h - 6 - up, 4, P.ironD);
          disc(g, cx - 1, h - 7 - up, 2, P.iron);
          px(g, cx - 2, h - 8 - up, P.ironL);
        }
      }
    },
  },

  /** The glass on its rest, pointed at a town you cannot enter. */
  spyglassRest: {
    w: 40, h: 46, block: 0.2, sink: 2,
    draw(g, w, h) {
      for (const s of [-1, 0, 1] as const) line(g, w / 2 + s * 8, h - 3, w / 2, h - 22, P.woodD);
      rect(g, w / 2 - 3, h - 26, 7, 6, P.woodD);
      // The tube, drawn as three drawn sections, tilted up a little.
      for (let i = 0; i < 3; i++) {
        const x = 6 + i * 9, r = 4 - i;
        rect(g, x, h - 30 - i * 3, 10, r * 2, P.blackD);
        hline(g, x, h - 30 - i * 3, 10, P.brownL);
      }
      rect(g, 4, h - 30, 3, 8, P.buffD);
      px(g, 5, h - 27, P.glassL);
    },
  },

  /** A grave, marked on a board. Eleven of them, and not one of them shot. */
  graveMarker: {
    w: 24, h: 30, block: 0, sink: 2,
    draw(g, w, h, v) {
      // The mound first, so the board stands in it.
      ellipse(g, w / 2, h - 4, 10, 4, P.turfD);
      ellipse(g, w / 2 - 1, h - 5, 8, 3, P.turf);
      rect(g, w / 2 - 5, h - 22, 10, 15, P.woodD);
      rect(g, w / 2 - 4, h - 21, 8, 13, P.wood);
      hline(g, w / 2 - 5, h - 22, 10, P.woodL);
      // Lettering, deliberately illegible: never generate readable period text.
      for (let y = h - 19; y < h - 11; y += 3) hline(g, w / 2 - 3, y, 5 + (v % 2), P.inkSoft);
    },
  },

  /** A sentry box, which is a barrel with a roof and a bored man in it. */
  sentryBox: {
    w: 34, h: 58, block: 0.3, sink: 2,
    draw(g, w, h, v) {
      rect(g, 3, 10, w - 6, h - 13, P.woodD);
      for (let x = 4; x < w - 4; x += 5) vline(g, x, 11, h - 15, P.wood);
      rect(g, 7, 16, w - 14, h - 22, shade(P.ink, 0.12));
      // A pitched cap on it.
      for (let y = 2; y < 11; y++) {
        const half = Math.round(3 + ((y - 2) / 9) * (w / 2 - 2));
        hline(g, w / 2 - half, y, half * 2, y < 6 ? P.shingleL : P.shingle);
      }
      speckle(g, 4, 11, w - 8, h - 15, P.woodD, 0.06, v);
    },
  },

  /**
   * Knox's sledge: a gun on a sled, behind oxen that are not drawn.
   *
   * It arrives in January and it is the only object in Act 2 that is
   * unambiguously good news, so it gets to be the one thing in a grey frame
   * with a saturated colour on it.
   */
  gunSledge: {
    w: 88, h: 40, block: 0.6, sink: 2,
    draw(g, w, h) {
      // Runners, curled up at the front.
      for (const y of [h - 6, h - 10]) {
        rect(g, 8, y, w - 18, 3, P.woodD);
        line(g, 8, y, 3, y - 6, P.woodD);
      }
      // Deck.
      for (let x = 10; x < w - 12; x += 7) rect(g, x, h - 16, 6, 6, P.wood);
      hline(g, 10, h - 16, w - 22, P.woodL);
      // The barrel, chained down. This one is a twenty-four pounder.
      for (let x = 14; x < w - 18; x++) {
        const t = (x - 14) / (w - 32);
        const r = Math.round(8 - t * 2);
        rect(g, x, h - 20 - r * 2, 1, r * 2, P.iron);
        px(g, x, h - 20 - r * 2, P.ironL);
      }
      for (const x of [22, 40, w - 34]) rect(g, x, h - 38, 3, 20, P.ironD);
      for (const x of [26, w - 36]) rect(g, x, h - 22, 3, 8, P.blackD);
      // The chain across it.
      for (let x = 16; x < w - 20; x += 4) px(g, x, h - 18, P.ironL);
    },
  },

  /** A four-wheeled baggage wagon, canvas-tilted. */
  wagonTilt: {
    w: 86, h: 52, block: 0.6, sink: 2,
    draw(g, w, h, v) {
      // Bed.
      rect(g, 10, h - 24, w - 24, 9, P.woodD);
      hline(g, 10, h - 24, w - 24, P.woodL);
      // Tilt: hoops with canvas over them.
      for (let x = 12; x < w - 16; x++) {
        const t = (x - 12) / (w - 28);
        const top = Math.round(h - 26 - Math.sin(t * Math.PI) * 20);
        vline(g, x, top, h - 26 - top, P.canvasM);
        px(g, x, top, P.canvasL);
        if (t > 0.55) vline(g, x, top + 1, h - 27 - top, P.canvasD);
      }
      for (const t of [0.15, 0.45, 0.78]) {
        const x = Math.round(12 + t * (w - 28));
        const top = Math.round(h - 26 - Math.sin(t * Math.PI) * 20);
        vline(g, x, top, h - 26 - top, P.canvasD);
      }
      // Wheels: small in front, tall behind.
      for (const [cx, r] of [[22, 9], [w - 26, 13]] as const) {
        disc(g, cx, h - 4 - r + 4, r, P.woodD);
        disc(g, cx, h - 4 - r + 4, r - 2, P.wood);
        for (let a = 0; a < 8; a++) {
          const t = (a / 8) * Math.PI * 2;
          line(g, cx, h - r, Math.round(cx + Math.cos(t) * (r - 2)),
            Math.round(h - r + Math.sin(t) * (r - 2)), P.woodD);
        }
      }
      speckle(g, 12, h - 46, w - 28, 22, P.canvasD, 0.05, v);
    },
  },

  /** A marked powder cask. There are never enough, and this is the act saying so. */
  powderCask: {
    w: 28, h: 34, block: 0.24, sink: 2,
    draw(g, w, h, v) {
      for (let y = 2; y < h - 1; y++) {
        const t = (y - 2) / (h - 4);
        const bulge = Math.sin(t * Math.PI) * 2.5;
        const ww = Math.round(w - 8 + bulge * 2);
        const x = Math.round(w / 2 - ww / 2);
        hline(g, x, y, ww, P.brown);
        vline(g, x, y, 1, P.brownL);
        vline(g, x + ww - 1, y, 1, P.brownD);
      }
      for (const y of [5, h * 0.5, h - 7]) hline(g, 2, y, w - 4, P.ironD);
      ellipse(g, w / 2, 3, w * 0.34, 2, P.brownL);
      // The mark, which is a mark and not a word.
      rect(g, w / 2 - 4, h * 0.44, 8, 7, P.blackD);
      px(g, w / 2, h * 0.47, P.buffL);
      speckle(g, 5, 6, w - 10, h - 12, P.brownD, 0.05, v);
    },
  },

  /** A trestle table with the day's paper on it. The camp's other weapon. */
  campTable: {
    w: 58, h: 34, block: 0.3, sink: 2,
    draw(g, w, h) {
      for (const cx of [12, w - 14]) {
        line(g, cx - 6, h - 3, cx + 2, h - 14, P.woodD);
        line(g, cx + 6, h - 3, cx - 2, h - 14, P.woodD);
      }
      board(g, 2, h - 18, w - 4, 6, [P.woodD, P.wood, P.woodL], 2);
      rect(g, 14, h - 22, 20, 5, P.paper);
      hline(g, 14, h - 22, 20, P.paperDim);
      for (let y = h - 21; y < h - 18; y++) hline(g, 16, y, 14, P.inkSoft);
      rect(g, w - 22, h - 21, 6, 4, P.blackD);
    },
  },

  /**
   * The map table: the object the whole Knox sequence hangs on.
   *
   * A big deal table with a survey of the country between here and
   * Ticonderoga on it, weighted at the corners. Examining it opens the sheet
   * full screen; standing next to it, it has to read as a table with a plan
   * on it from twelve feet up, which means the plan needs a coastline the eye
   * can recognise as a coastline at this size and nothing else.
   */
  mapTable: {
    w: 84, h: 48, block: 0.5, sink: 2,
    draw(g, w, h, v) {
      for (const cx of [10, w - 12]) {
        rect(g, cx - 3, h - 22, 6, 20, P.woodD);
        rect(g, cx - 7, h - 4, 14, 3, P.woodD);
      }
      board(g, 2, h - 28, w - 4, 8, [P.woodD, P.wood, P.woodL], 3);
      // The sheet, curling at one corner.
      rect(g, 8, h - 44, w - 18, 18, P.paper);
      hline(g, 8, h - 44, w - 18, P.paperDim);
      line(g, w - 12, h - 44, w - 10, h - 40, P.paperDim);
      // A coastline and a river, which is all the detail this size can carry.
      line(g, 12, h - 30, 26, h - 36, P.inkSoft);
      line(g, 26, h - 36, 40, h - 33, P.inkSoft);
      line(g, 40, h - 33, 58, h - 40, P.inkSoft);
      line(g, 58, h - 40, w - 16, h - 36, P.inkSoft);
      for (let x = 14; x < w - 16; x += 3) px(g, x, h - 42 + Math.round(Math.sin(x * 0.4) * 2), P.blueD);
      // The weights at the corners, and a pair of dividers.
      for (const [x, y] of [[10, h - 43], [w - 14, h - 29]] as const) disc(g, x, y, 3, P.ironD);
      line(g, 46, h - 42, 52, h - 32, P.ironL);
      line(g, 46, h - 42, 41, h - 32, P.ironL);
      speckle(g, 9, h - 43, w - 20, 16, P.paperDim, 0.05, v);
    },
  },

  /** A woodpile. In December this is the most valuable object in the camp. */
  woodpile: {
    w: 54, h: 32, block: 0.36, sink: 2,
    draw(g, w, h, v) {
      for (let row = 0; row < 4; row++) {
        const y = h - 6 - row * 6;
        const inset = Math.floor(row * 2.5);
        for (let x = 3 + inset; x < w - 4 - inset; x += 7) {
          disc(g, x + 3, y + 2, 3, P.trunkD);
          disc(g, x + 3, y + 2, 2, P.trunk);
          // The split face, pale, which is what makes it firewood and not logs.
          if (hash(x, row, v) < 0.5) rect(g, x + 2, y, 3, 3, P.pineL);
        }
      }
    },
  },

  /** A bare tree. Winter's most important object, because there are hundreds. */
  oakBare: {
    w: 78, h: 108, block: 0.20, sink: 3,
    draw(g, w, h, v) {
      const cx = w / 2;
      trunk(g, cx, 40, h - 4, 10);
      // Boughs, drawn as a recursive fork so no two are the same shape.
      const limb = (x: number, y: number, a: number, len: number, thick: number, d: number) => {
        const x1 = Math.round(x + Math.cos(a) * len);
        const y1 = Math.round(y + Math.sin(a) * len);
        for (let t = 0; t < thick; t++) line(g, x + t, y, x1 + t, y1, t === 0 ? P.trunkL : P.trunkD);
        if (d <= 0) return;
        limb(x1, y1, a - 0.42 - hash(d, v, 51) * 0.3, len * 0.68, Math.max(1, thick - 1), d - 1);
        limb(x1, y1, a + 0.40 + hash(d, v, 52) * 0.3, len * 0.66, Math.max(1, thick - 1), d - 1);
      };
      limb(cx, 44, -Math.PI / 2 - 0.5, 22, 3, 3);
      limb(cx, 44, -Math.PI / 2 + 0.45, 21, 3, 3);
      limb(cx, 52, -Math.PI / 2 - 1.05, 18, 2, 3);
      limb(cx, 52, -Math.PI / 2 + 1.00, 18, 2, 3);
      // Two or three leaves that never fell.
      for (let i = 0; i < 5; i++) {
        px(g, Math.round(10 + hash(i, v, 53) * (w - 20)), Math.round(12 + hash(i, v, 54) * 40), P.leafDry);
      }
    },
  },

  /** A pine with snow on it. Drawn as a pine, then the snow laid on top. */
  pineSnow: {
    w: 62, h: 116, block: 0.20, sink: 3,
    draw(g, w, h, v) {
      const cx = w / 2;
      trunk(g, cx, 74, h - 4, 7);
      // Tiers, widest at the bottom, each with a lit upper edge of snow.
      for (let i = 0; i < 6; i++) {
        const y = 18 + i * 12;
        const half = Math.round(5 + i * 4.2);
        for (let x = -half; x <= half; x++) {
          const drop = Math.round((Math.abs(x) / half) * 8);
          vline(g, cx + x, y + drop, 12 - Math.round(drop * 0.4), i % 2 ? P.leafD : P.leaf);
        }
        // Snow, sitting on the top of each tier and only on the top.
        for (let x = -half; x <= half; x++) {
          const drop = Math.round((Math.abs(x) / half) * 8);
          if (hash(x, i, v + 61) < 0.72) {
            px(g, cx + x, y + drop, P.snowL);
            if (hash(x, i, v + 62) < 0.5) px(g, cx + x, y + drop + 1, P.snow);
          }
        }
      }
      px(g, cx, 14, P.snowL);
    },
  },

  /** A drift, lying flat. Breaks up an unbroken field of snow tiles. */
  snowDrift: {
    w: 70, h: 20, flat: true, block: 0,
    draw(g, w, h, v) {
      for (let i = 0; i < 4; i++) {
        const cx = Math.round(12 + hash(i, v, 71) * (w - 24));
        const rx = 10 + Math.floor(hash(i, v, 72) * 14);
        ellipse(g, cx, h / 2 + Math.round(hash(i, v, 73) * 4), rx, 5, P.snow);
        ellipse(g, cx - 2, h / 2 - 2, Math.round(rx * 0.7), 3, P.snowL);
      }
      speckle(g, 2, 2, w - 4, h - 4, P.snowD, 0.05, v);
    },
  },

  /*
   * doorFrame and staircase used to live here: both were flat, always-
   * camera-facing billboards, and both turned out to be the wrong shape for
   * the job. A billboard door can't be oriented to the wall it's set into —
   * every doorway in this house sits in a wall running north-south, so the
   * door graphic read as turned a quarter-turn from its own opening — and a
   * billboard stair has no collision or elevation, so a player walked
   * straight through it rather than climbing it.
   *
   * The stair is fixed in `content/mansion.ts`: it is ground now, three
   * tiles of the passage actually rise, and `build.ts` draws the automatic
   * riser faces between them the same way it already draws the estate's
   * terraces. The doorway is unmarked for now rather than marked wrong — the
   * real fix is a door baked into the interior wall texture at build time,
   * the way `structures.ts`'s exterior `doorLeaf` already is, and that is
   * future work, not a prop.
   */
};

/* ---------------------------------------------------------------------- *
 * Atlas
 * ---------------------------------------------------------------------- */

export interface PackedProp {
  id: string;
  x: number; y: number; w: number; h: number;
  def: PropDef;
}

export interface PropAtlas {
  surface: Surface;
  entries: Map<string, PackedProp>;
}

let ATLAS: PropAtlas | null = null;

/**
 * Shelf-pack every prop into one texture. One texture means the whole world's
 * scenery is a single draw call, which is the difference between 45 fps and 12
 * on the Chromebook this has to be good on.
 */
export function propAtlas(): PropAtlas {
  if (ATLAS) return ATLAS;
  const ids = Object.keys(PROPS).sort();
  const MAX = 1024;
  const placed: PackedProp[] = [];
  let x = 0, y = 0, shelf = 0;
  for (const id of ids) {
    const def = PROPS[id];
    if (x + def.w > MAX) { x = 0; y += shelf; shelf = 0; }
    placed.push({ id, x, y, w: def.w, h: def.h, def });
    x += def.w + 1;
    shelf = Math.max(shelf, def.h + 1);
  }
  const height = y + shelf;
  const s = surface(MAX, Math.max(1, height));
  const entries = new Map<string, PackedProp>();
  for (const p of placed) {
    const one = surface(p.w, p.h);
    p.def.draw(one.g, p.w, p.h, 0);
    if (!p.def.flat) outline(one, P.ink);
    s.g.drawImage(one.canvas, p.x, p.y);
    entries.set(p.id, p);
  }
  ATLAS = { surface: s, entries };
  return ATLAS;
}
