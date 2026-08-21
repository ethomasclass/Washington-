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
  /**
   * The prop is its own light source, and the map's light does not dim it.
   *
   * Everything else in the world is drawn multiplied by the scene's key and
   * fill, which is right: a barrel at midnight is a dark barrel. A LANTERN at
   * midnight is not a dark lantern, and the first night map in this game
   * proved it the hard way — the lanterns were tinted down by the same dark
   * fill as the mud they were standing in, so the one thing in the frame
   * that was supposed to be lit was the same value as everything else and
   * the whole scene came out an even black.
   *
   * A glowing prop is drawn at full brightness with a slight warm bias, so
   * it also clears the bloom threshold and throws a halo. Use it for exactly
   * what it says: lanterns, fires, torches, candles, a musket flash.
   */
  glow?: boolean;
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
    glow: true,
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
    glow: true,
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


  /* ====================================================================== *
   * NEW ENGLAND FURNITURE
   *
   * A borrowed loyalist house on Brattle Street furnished out of Mount
   * Vernon's prop list looked like Mount Vernon, which is a claim about the
   * eighteenth century that is not true: Virginia sat on upholstered
   * mahogany from London and Massachusetts sat on turned maple made forty
   * miles away, and a student who walks from one to the other should be able
   * to feel the difference before anybody tells them.
   *
   * These are different FORMS, not recolours. A ladder-back has a different
   * silhouette from a side chair at thirty pixels; a red side chair painted
   * green is still a red side chair.
   * ==================================================================== */

  /** A rush-seated ladder-back in turned maple. The New England chair. */
  chairLadderback: {
    w: 30, h: 52, block: 0.26, sink: 2,
    draw(g, w, h, v) {
      const back = 8;
      // Turned rear stiles, with the swelling at the turnings.
      for (const x of [6, w - 9]) {
        rect(g, x, back, 3, h - back - 4, P.brownD);
        vline(g, x, back, h - back - 4, P.brown);
        for (const y of [back + 4, back + 16, h - 20]) rect(g, x - 1, y, 5, 2, P.brownL);
      }
      // Four arched slats, each a little wider than the one below it.
      for (let i = 0; i < 4; i++) {
        const y = back + 2 + i * 7;
        rect(g, 7, y, w - 16, 4, i % 2 ? P.brown : shade(P.brown, -0.06));
        hline(g, 8, y, w - 18, P.brownL);
        px(g, Math.round(w / 2), y - 1, P.brownL);
      }
      // The rush seat: woven, in four triangles, and the weave is the point.
      const sy = h - 20;
      rect(g, 3, sy, w - 6, 7, P.buffD);
      for (let i = 0; i < 7; i++) {
        hline(g, 3 + i, sy + i, w - 6 - i * 2, i % 2 ? P.buff : P.buffL);
        hline(g, 3 + i, sy + 6 - i, w - 6 - i * 2, i % 2 ? P.buffL : P.buff);
      }
      // Front legs, turned, with a stretcher.
      for (const x of [4, w - 7]) {
        rect(g, x, sy + 6, 3, h - sy - 8, P.brownD);
        vline(g, x, sy + 6, h - sy - 8, P.brown);
      }
      rect(g, 4, h - 8, w - 8, 2, P.brownD);
      speckle(g, 3, sy, w - 6, 7, P.sandD, 0.10, v);
    },
  },

  /**
   * A Windsor, painted green.
   *
   * The American chair, and Washington's own: he bought twenty-seven of
   * them for the Mount Vernon piazza. Spindles and a saddled plank seat, no
   * upholstery at all, and cheap enough that a camp could own some.
   */
  chairWindsor: {
    w: 32, h: 50, block: 0.26, sink: 2,
    draw(g, w, h) {
      const sy = h - 20;
      // The bow, bent in one piece.
      for (let a = 0; a <= 22; a++) {
        const t = a / 22;
        const x = Math.round(5 + t * (w - 10));
        const y = Math.round(sy - 22 + Math.sin(t * Math.PI) * -4 + 4);
        px(g, x, y, P.greenD); px(g, x, y + 1, P.green);
      }
      // Spindles up to it.
      for (let i = 0; i < 7; i++) {
        const x = 7 + i * Math.round((w - 14) / 6);
        const top = Math.round(sy - 22 + Math.sin((i / 6) * Math.PI) * -4 + 6);
        vline(g, x, top, sy - top, P.greenD);
        px(g, x, top, P.greenL);
      }
      // The seat: a saddled plank, thick at the front edge.
      rect(g, 2, sy, w - 4, 6, P.green);
      hline(g, 3, sy, w - 6, P.greenL);
      hline(g, 2, sy + 5, w - 4, P.greenD);
      rect(g, 8, sy + 1, w - 16, 2, shade(P.greenD, -0.08));   // the saddling
      // Splayed legs, which is what makes it a Windsor and not a chair.
      for (const [x0, x1] of [[7, 2], [w - 8, w - 3]] as const) {
        for (let k = 0; k < 3; k++) line(g, x0 + k, sy + 6, x1 + k, h - 3, k === 0 ? P.greenL : P.greenD);
      }
      line(g, 5, h - 9, w - 6, h - 9, P.greenD);
    },
  },

  /** An easy chair, wings and all, in blue-green wool. A room's best seat. */
  chairWing: {
    w: 44, h: 58, block: 0.34, sink: 2,
    draw(g, w, h, v) {
      const sy = h - 22;
      // The back and the two wings, which are the silhouette.
      rect(g, 6, 8, w - 12, sy - 6, P.parlour);
      rect(g, 6, 8, 8, sy - 6, P.parlourD);
      rect(g, w - 14, 8, 8, sy - 6, P.parlourD);
      hline(g, 8, 8, w - 16, P.parlourL);
      for (const x of [2, w - 8]) {
        rect(g, x, 12, 7, sy - 20, P.parlour);
        vline(g, x, 12, sy - 20, P.parlourL);
        rect(g, x, sy - 10, 7, 8, P.parlourD);
      }
      // Rolled arms.
      for (const x of [1, w - 9]) {
        ellipse(g, x + 4, sy - 4, 5, 5, P.parlour);
        ellipse(g, x + 3, sy - 6, 3, 3, P.parlourL);
      }
      // A loose cushion, which is a different value or the chair is a blob.
      rect(g, 6, sy - 4, w - 12, 8, shade(P.parlour, 0.10));
      hline(g, 7, sy - 4, w - 14, P.parlourL);
      rect(g, 5, sy + 4, w - 10, 6, P.parlourD);
      for (const x of [7, w - 11]) rect(g, x, sy + 10, 4, h - sy - 12, P.woodD);
      speckle(g, 6, 8, w - 12, sy - 2, shade(P.parlourD, -0.08), 0.07, v);
    },
  },

  /** A tavern table: scrubbed pine, turned legs, no cloth. */
  tableTavern: {
    w: 72, h: 40, block: 0.5, sink: 2,
    draw(g, w, h, v) {
      const top = h - 22;
      for (const x of [8, w - 14]) {
        rect(g, x, top + 4, 5, h - top - 8, P.brownD);
        vline(g, x, top + 4, h - top - 8, P.brown);
        for (const y of [top + 8, h - 14]) rect(g, x - 1, y, 7, 3, P.brownL);
      }
      rect(g, 6, h - 8, w - 12, 3, P.brownD);       // the stretcher
      board(g, 2, top, w - 4, 7, [P.woodD, P.pine, P.pineL], v);
      hline(g, 2, top, w - 4, P.pineL);
      // Scrubbed: the top is paler than the frame, and unevenly so.
      speckle(g, 3, top + 1, w - 6, 5, shade(P.pineL, 0.10), 0.16, v + 3);
      rect(g, 2, top + 7, w - 4, 3, P.brownD);
    },
  },

  /** A corner cupboard with pewter on it. Pewter, not china: this is 1775. */
  cupboardCorner: {
    w: 52, h: 92, block: 0.42, sink: 2,
    draw(g, w, h, v) {
      rect(g, 4, 6, w - 8, h - 8, P.brownD);
      rect(g, 6, 8, w - 12, h - 12, shade(P.brown, -0.04));
      // An arched, glazed upper stage.
      rect(g, 9, 12, w - 18, 40, shade(P.ink, 0.10));
      for (let a = 0; a <= 18; a++) {
        const t = a / 18;
        px(g, Math.round(9 + t * (w - 18)), Math.round(14 - Math.sin(t * Math.PI) * 5), P.brownL);
      }
      // Three shelves of pewter: plates on edge, a tankard, a charger.
      for (let i = 0; i < 3; i++) {
        const y = 20 + i * 12;
        hline(g, 9, y + 8, w - 18, P.brownL);
        for (let x = 11; x < w - 12; x += 6) {
          ellipse(g, x + 2, y + 4, 2, 4, P.stoneL);
          px(g, x + 1, y + 2, P.plasterL);
        }
        if (i === 1) { rect(g, w / 2 - 3, y + 1, 6, 7, P.stone); px(g, w / 2 + 3, y + 4, P.stoneL); }
      }
      // Panelled doors below.
      rect(g, 9, 56, w - 18, h - 66, P.brown);
      for (const x of [10, w / 2 + 1]) stroke(g, x, 60, Math.round(w / 2) - 12, h - 76, P.brownD);
      px(g, Math.round(w / 2) - 2, 70, P.buffL);
      px(g, Math.round(w / 2) + 2, 70, P.buffL);
      speckle(g, 6, 8, w - 12, h - 12, P.brownD, 0.05, v);
    },
  },

  /** A tall case clock. A merchant's status object, and it is the loudest thing in a quiet house. */
  caseClock: {
    w: 34, h: 104, block: 0.26, sink: 2,
    draw(g, w, h) {
      // Hood, with a broken-arch pediment.
      rect(g, 2, 6, w - 4, 30, P.brownD);
      rect(g, 4, 8, w - 8, 26, P.brown);
      for (const s of [-1, 1] as const) {
        for (let a = 0; a <= 10; a++) {
          const t = a / 10;
          px(g, Math.round(w / 2 + s * (2 + t * (w / 2 - 4))),
            Math.round(6 - Math.sin((1 - t) * Math.PI * 0.5) * 5), P.brownL);
        }
      }
      px(g, Math.round(w / 2), 0, P.buffL);
      // The dial: brass, with a silvered chapter ring and no numerals drawn.
      disc(g, w / 2, 20, 10, P.buffD);
      disc(g, w / 2, 20, 8, P.buff);
      disc(g, w / 2, 20, 6, P.linenL);
      for (let a = 0; a < 12; a++) {
        const t = (a / 12) * Math.PI * 2;
        px(g, Math.round(w / 2 + Math.cos(t) * 7), Math.round(20 + Math.sin(t) * 7), P.inkSoft);
      }
      line(g, w / 2, 20, w / 2 + 3, 16, P.ink);
      line(g, w / 2, 20, w / 2 - 1, 26, P.ink);
      // Waist, with a small glazed door onto the pendulum.
      rect(g, 6, 36, w - 12, h - 50, P.brownD);
      rect(g, 8, 38, w - 16, h - 54, P.brown);
      rect(g, 11, 46, w - 22, 34, shade(P.ink, 0.12));
      disc(g, w / 2, 74, 4, P.buff);
      // Base and bracket feet.
      rect(g, 4, h - 16, w - 8, 14, P.brownD);
      rect(g, 6, h - 14, w - 12, 10, P.brown);
      for (const x of [4, w - 8]) rect(g, x, h - 4, 5, 3, P.brownD);
    },
  },

  /** A slant-front bureau, open, with the pigeonholes showing. */
  bureauSlant: {
    w: 56, h: 62, block: 0.4, sink: 2,
    draw(g, w, h, v) {
      // Case and three graduated drawers.
      rect(g, 3, 26, w - 6, h - 30, P.brownD);
      let y = 32;
      for (const dh of [8, 9, 10]) {
        rect(g, 5, y, w - 10, dh - 1, P.brown);
        hline(g, 5, y, w - 10, P.brownL);
        for (const x of [14, w - 18]) { px(g, x, y + Math.floor(dh / 2), P.buffL); px(g, x + 1, y + Math.floor(dh / 2), P.buffD); }
        y += dh;
      }
      // The fall, let down, with the interior above it.
      rect(g, 1, 22, w - 2, 5, P.brown);
      hline(g, 1, 22, w - 2, P.brownL);
      rect(g, 6, 6, w - 12, 16, shade(P.brownD, -0.10));
      for (let x = 8; x < w - 12; x += 7) {
        rect(g, x, 8, 6, 12, shade(P.brown, -0.06));
        vline(g, x, 8, 12, P.brownD);
        // A paper in one of them, which is what makes it a working desk.
        if (hash(x, 0, v) < 0.4) rect(g, x + 1, 9, 4, 3, P.paper);
      }
      rect(g, 12, 20, 20, 4, P.paper);
      hline(g, 12, 20, 20, P.paperDim);
      for (const x of [4, w - 7]) rect(g, x, h - 5, 4, 4, P.brownD);
    },
  },

  /**
   * A New England chimney piece: a plain bolection surround in painted
   * wood over a plastered breast, with an iron fireback in the opening.
   *
   * `mantel` is the Virginia one — a carved marble-look chimneypiece with
   * an overmantel panel. This is the same object in a colony with less
   * money and colder winters: bigger opening, less carving, more iron.
   */
  chimneyNE: {
    w: 96, h: 80, block: 0, sink: 0,
    draw(g, w, h, v) {
      // The breast, plastered, and a bolection moulding round the opening.
      rect(g, 0, 0, w, h, P.plaster);
      speckle(g, 0, 0, w, h, P.plasterD, 0.08, v);
      const ox = 16, ow = w - 32, oy = 24, oh = h - 26;
      rect(g, ox - 8, oy - 8, ow + 16, oh + 8, shade(P.plasterD, -0.04));
      rect(g, ox - 5, oy - 5, ow + 10, oh + 5, P.linenD);
      hline(g, ox - 8, oy - 8, ow + 16, P.plasterL);
      // The opening: deep, black, with a fireback and a fire in it.
      rect(g, ox, oy, ow, oh, shade(P.ink, 0.04));
      rect(g, ox + 4, oy + 4, ow - 8, oh - 10, P.ironD);
      for (let i = 0; i < 5; i++) hline(g, ox + 8, oy + 10 + i * 6, ow - 16, shade(P.ironD, 0.06));
      // Andirons and a fire.
      for (const x of [ox + 8, ox + ow - 12]) {
        rect(g, x, h - 18, 3, 14, P.ironL);
        rect(g, x - 1, h - 6, 6, 3, P.iron);
      }
      for (let i = 0; i < 22; i++) {
        const fx = Math.round(ox + 12 + hash(i, v, 41) * (ow - 24));
        const fy = Math.round(h - 8 - hash(i, v, 42) * 14);
        px(g, fx, fy, hash(i, v, 43) < 0.3 ? P.ember : hash(i, v, 44) < 0.6 ? P.fireL : P.fire);
      }
      rect(g, ox + 10, h - 8, ow - 20, 4, P.fireD);
      // A shelf, and a pair of candlesticks on it. No overmantel painting:
      // that is the Virginia room.
      rect(g, 6, 14, w - 12, 5, P.linen);
      hline(g, 6, 14, w - 12, P.linenL);
      for (const x of [20, w - 24]) { rect(g, x, 8, 3, 6, P.stoneL); px(g, x + 1, 6, P.ember); }
    },
  },

  /* ====================================================================== *
   * BROOKLYN, AUGUST 1776, AND THE DELAWARE IN DECEMBER
   *
   * Two boats in this set carry an actual historical correction each, and
   * both corrections are the kind a picture makes and a paragraph cannot.
   *
   * The DURHAM BOAT is not the boat in the Leutze painting. It is forty to
   * sixty feet long, four feet deep, black, with high sides and no thwarts
   * to speak of — a freight barge for iron ore, poled and steered by a
   * sweep, and the men crossed the Delaware standing up in it because there
   * was nowhere to sit. Draw it right once and the painting can never lie
   * to that student again.
   *
   * The FLATBOAT at Brooklyn is the other half of the same point: what took
   * nine thousand men off Long Island in one night was a scratch fleet of
   * whatever Glover's fishermen could find, rowed, with muffled oarlocks.
   * ==================================================================== */

  /** A Durham boat: black, sixty feet, high-sided, poled. NOT the Leutze boat. */
  durhamBoat: {
    w: 150, h: 40, block: 0.7, sink: 2,
    draw(g, w, h, v) {
      const top = 10, bot = h - 8;
      // The hull: long, straight-sided, pointed at both ends, and BLACK.
      for (let x = 0; x < w; x++) {
        const t = x / w;
        // Fine ends: the sheer rises and the hull narrows at both bows.
        const rise = Math.round(Math.pow(Math.abs(t - 0.5) * 2, 3) * 7);
        const y0 = top - rise, y1 = bot - Math.round(rise * 0.35);
        rect(g, x, y0, 1, y1 - y0, P.blackD);
        px(g, x, y0, P.ironL);
        px(g, x, y0 + 1, shade(P.black, 0.10));
        px(g, x, y1 - 1, shade(P.blackD, -0.3));
      }
      // The wale, running the whole length, which is the line that says boat.
      for (let x = 2; x < w - 2; x++) {
        const t = x / w;
        const rise = Math.round(Math.pow(Math.abs(t - 0.5) * 2, 3) * 7);
        px(g, x, top - rise + 4, P.woodD);
      }
      // Setting poles, laid along the top, and the steering sweep aft.
      line(g, 14, top + 1, 70, top - 2, P.pineL);
      line(g, 80, top - 1, 136, top + 2, P.pine);
      line(g, w - 6, top + 2, w - 34, top - 12, P.woodD);
      rect(g, w - 40, top - 15, 10, 3, P.wood);
      // A little water inside, and the ribs.
      for (let x = 12; x < w - 12; x += 9) vline(g, x, top + 2, 5, shade(P.blackD, 0.12));
      speckle(g, 6, top, w - 12, 6, shade(P.waterD, 0.10), 0.10, v);
    },
  },

  /** A flatboat, rowed, with muffled oarlocks. What crossed the East River. */
  flatBoat: {
    w: 104, h: 38, block: 0.6, sink: 2,
    draw(g, w, h, v) {
      const top = 12, bot = h - 8;
      for (let x = 0; x < w; x++) {
        const t = x / w;
        const rise = Math.round(Math.pow(Math.abs(t - 0.5) * 2, 2.4) * 6);
        rect(g, x, top - rise, 1, bot - top + rise, P.woodD);
        px(g, x, top - rise, P.woodL);
        px(g, x, bot - 1, shade(P.woodD, -0.28));
      }
      // Thwarts — this one you sit in, which is the difference from a Durham.
      for (const x of [22, 46, 70]) {
        rect(g, x, top + 1, 4, bot - top - 3, P.wood);
        hline(g, x, top + 1, 4, P.woodL);
      }
      // Oars out, and rags round the looms where they bear. The rags are the
      // reason nobody in Brooklyn heard nine thousand men leave.
      for (const [x, s] of [[26, -1], [50, -1], [74, -1], [34, 1], [58, 1], [82, 1]] as const) {
        line(g, x, top + 4, x + s * 16, top + 4 - s * 12, P.pine);
        rect(g, x + s * 4 - 1, top + 2 - s * 3, 3, 3, P.linenD);
      }
      speckle(g, 6, top, w - 12, 5, shade(P.waterD, 0.10), 0.09, v);
    },
  },

  /** A ship's lantern with a horn pane. The only warm thing in the night frames. */
  shipLantern: {
    glow: true,
    w: 26, h: 44, block: 0.14, sink: 2,
    draw(g, w, h) {
      // A post to hang it on, because a lantern lying on the ground is a lamp.
      rect(g, w / 2 - 2, 14, 4, h - 16, P.woodD);
      vline(g, w / 2 - 2, 14, h - 16, P.wood);
      // The body: pierced tin, four panes, a conical top and a ring.
      for (let a = 0; a <= 10; a++) {
        const t = a / 10;
        px(g, Math.round(w / 2 - 8 + t * 16), Math.round(10 - Math.sin(t * Math.PI) * 4), P.ironL);
      }
      rect(g, w / 2 - 8, 10, 16, 16, P.ironD);
      rect(g, w / 2 - 6, 12, 12, 12, P.lantern);
      rect(g, w / 2 - 6, 12, 5, 12, P.lanternD);
      vline(g, w / 2, 12, 12, P.ironD);
      hline(g, w / 2 - 6, 17, 12, P.ironD);
      // The flame, and a halo of two pixels. Bloom does the rest.
      px(g, w / 2 + 2, 18, P.ember);
      px(g, w / 2 + 2, 17, '#FFF6D0');
      rect(g, w / 2 - 9, 26, 18, 3, P.ironD);
      disc(g, w / 2, 6, 2, P.ironL);
    },
  },

  /** A gun spiked and left, because it would not fit in the boat. */
  gunSpiked: {
    w: 76, h: 40, block: 0.5, sink: 3,
    draw(g, w, h) {
      // Same gun as `fieldGun`, over on its side with a wheel off. The
      // silhouette has to read as WRONG at a glance.
      rect(g, 10, h - 12, w - 24, 6, P.carriageD);
      rect(g, w - 22, h - 18, 12, 10, P.carriageD);
      for (let x = 12; x < w - 20; x++) {
        const t = (x - 12) / (w - 32);
        const r = Math.round(6 - t * 2);
        rect(g, x, h - 24 - r, 1, r * 2, P.ironD);
        px(g, x, h - 24 - r, P.iron);
      }
      // The spike, driven into the vent and snapped off. One nail, and it
      // is the whole difference between a gun and eight hundredweight of iron.
      rect(g, w - 30, h - 34, 3, 12, P.ironL);
      px(g, w - 29, h - 36, P.linenL);
      // A wheel, off, lying flat beside it.
      ellipse(g, 22, h - 6, 12, 5, P.carriageD);
      ellipse(g, 22, h - 7, 9, 4, P.carriage);
      for (let a = 0; a < 8; a++) {
        const t = (a / 8) * Math.PI * 2;
        line(g, 22, h - 7, Math.round(22 + Math.cos(t) * 9), Math.round(h - 7 + Math.sin(t) * 4), P.carriageL);
      }
    },
  },

  /** A redoubt's embrasure: a gun looking out through a notch in the bank. */
  embrasure: {
    w: 70, h: 44, block: 0.55, sink: 2,
    draw(g, w, h, v) {
      // The bank either side, cut turf, with a notch between.
      for (const [x0, x1] of [[0, 24], [w - 24, w]] as const) {
        for (let x = x0; x < x1; x++) {
          const drop = Math.round(Math.abs(x - (x < w / 2 ? x1 : x0)) * 0.35);
          rect(g, x, 10 + drop, 1, h - 12 - drop, P.turf);
          px(g, x, 10 + drop, P.turfL);
          if (hash(x, 0, v) < 0.3) px(g, x, 12 + drop, P.turfD);
        }
      }
      // Fascines revetting the cheeks of the notch.
      for (const x of [22, w - 26]) {
        for (let y = 16; y < h - 6; y += 5) {
          rect(g, x, y, 4, 4, P.brown);
          hline(g, x, y, 4, P.leafDry);
        }
      }
      // The muzzle in the notch, and a very dark hole behind it.
      rect(g, 26, 18, w - 52, h - 22, shade(P.ink, 0.08));
      rect(g, Math.round(w / 2) - 5, 20, 10, 12, P.ironD);
      rect(g, Math.round(w / 2) - 4, 20, 8, 3, P.ironL);
      disc(g, w / 2, 24, 3, shade(P.ink, 0.02));
    },
  },

  /** A haystack on a Kings County farm, standing in the middle of a battle. */
  haystack: {
    w: 60, h: 54, block: 0.45, sink: 2,
    draw(g, w, h, v) {
      // A pole in the middle, and hay heaped round it — a New York hayrick,
      // not a bale. Bales are a hundred years away.
      vline(g, w / 2, 2, h - 4, P.woodD);
      for (let y = h - 4; y > 8; y--) {
        const t = (h - 4 - y) / (h - 12);
        const half = Math.round((1 - Math.pow(t, 1.6)) * (w / 2 - 3));
        hline(g, w / 2 - half, y, half * 2, t > 0.55 ? P.buff : P.buffD);
        px(g, w / 2 - half, y, P.buffD);
        px(g, w / 2 + half - 1, y, shade(P.buffD, -0.12));
        if (hash(y, v, 191) < 0.4) px(g, Math.round(w / 2 - half + hash(y, v, 192) * half * 2), y, P.buffL);
      }
      // Loose wisps off the sides, or it is a cone.
      for (let i = 0; i < 24; i++) {
        const y = Math.round(14 + hash(i, v, 193) * (h - 20));
        const t = (h - 4 - y) / (h - 12);
        const half = Math.round((1 - Math.pow(t, 1.6)) * (w / 2 - 3));
        const s = hash(i, v, 194) < 0.5 ? -1 : 1;
        line(g, w / 2 + s * half, y, w / 2 + s * (half + 4), y - 2, P.buffL);
      }
    },
  },

  /** An oyster-shell midden. Two hundred years of Brooklyn's dinner. */
  shellHeap: {
    w: 46, h: 20, flat: true, block: 0,
    draw(g, w, h, v) {
      for (let i = 0; i < 90; i++) {
        const x = Math.round(4 + hash(i, v, 201) * (w - 8));
        const y = Math.round(3 + hash(i, v, 202) * (h - 6));
        const t = hash(i, v, 203);
        ellipse(g, x, y, 3, 2, t < 0.4 ? P.plasterD : t < 0.75 ? P.plaster : P.plasterL);
        px(g, x - 1, y - 1, P.plasterL);
      }
      speckle(g, 2, 2, w - 4, h - 4, P.siltD, 0.10, v);
    },
  },

  /** A milestone on the Jamaica road, which is how anybody knew where they were. */
  milestone: {
    w: 22, h: 30, block: 0.14, sink: 3,
    draw(g, w, h, v) {
      for (let y = 6; y < h - 2; y++) {
        const t = (y - 6) / (h - 8);
        const half = Math.round(4 + t * 4);
        hline(g, w / 2 - half, y, half * 2, P.stone);
        px(g, w / 2 - half, y, P.stoneL);
        px(g, w / 2 + half - 1, y, P.stoneD);
      }
      for (let a = 0; a <= 8; a++) {
        const t = a / 8;
        px(g, Math.round(w / 2 - 4 + t * 8), Math.round(6 - Math.sin(t * Math.PI) * 3), P.stoneL);
      }
      // Cut lettering, illegible on purpose: never readable generated text.
      for (let y = 12; y < 22; y += 4) hline(g, w / 2 - 3, y, 6, P.stoneD);
      speckle(g, 4, 6, w - 8, h - 8, P.stoneD, 0.08, v);
    },
  },

  /** A pile of knapsacks and blankets, dropped where the boats are. */
  kitPile: {
    w: 48, h: 26, block: 0.24, sink: 2,
    draw(g, w, h, v) {
      for (let i = 0; i < 7; i++) {
        const x = Math.round(4 + hash(i, v, 211) * (w - 20));
        const y = Math.round(h - 6 - hash(i, v, 212) * 12);
        const c = [P.osnaD, P.brownD, P.linenD, P.greenD][Math.floor(hash(i, v, 213) * 4)];
        rect(g, x, y, 12, 7, c);
        hline(g, x, y, 12, shade(c, 0.16));
        rect(g, x + 2, y + 2, 8, 2, shade(c, -0.14));
        // A strap, which is what makes it a knapsack and not a box.
        line(g, x + 1, y, x + 5, y + 7, P.buffD);
      }
    },
  },

  /** A drum, laid flat, with a map on the head. Where a plan gets made outdoors. */
  drumTable: {
    w: 40, h: 30, block: 0.22, sink: 2,
    draw(g, w, h, v) {
      ellipse(g, w / 2, h - 10, 16, 8, P.woodD);
      ellipse(g, w / 2, h - 12, 16, 8, P.blueD);
      ellipse(g, w / 2, h - 13, 14, 7, P.linenL);
      for (let a = 0; a < 16; a++) {
        const t = (a / 16) * Math.PI * 2;
        px(g, Math.round(w / 2 + Math.cos(t) * 15), Math.round(h - 12 + Math.sin(t) * 7.5), P.buffL);
      }
      // The sheet on it, curling.
      rect(g, w / 2 - 10, h - 19, 20, 10, P.paper);
      hline(g, w / 2 - 10, h - 19, 20, P.paperDim);
      line(g, w / 2 - 7, h - 15, w / 2 + 6, h - 17, P.inkSoft);
      line(g, w / 2 - 4, h - 12, w / 2 + 8, h - 13, P.blueD);
      speckle(g, w / 2 - 9, h - 18, 18, 8, P.paperDim, 0.06, v);
    },
  },

  /**
   * A Hessian grenadier cap, on the ground.
   *
   * `docs/05` calls the brass cap plate "the money object" of Act 4 and it
   * is right: a mitre cap is instantly, unmistakably not-American, and one
   * of them lying in a street is the whole of what nine hundred prisoners
   * means, at the size a sprite can carry.
   */
  hessianCap: {
    w: 30, h: 34, block: 0, sink: 2,
    draw(g, w, h) {
      // The mitre: a tall front plate over a cloth bag, tipped over.
      for (let y = 6; y < h - 6; y++) {
        const t = (y - 6) / (h - 12);
        const half = Math.round(3 + t * 10);
        hline(g, w / 2 - half, y, half * 2, P.brassD);
        px(g, w / 2 - half, y, P.brassL);
        px(g, w / 2 + half - 1, y, shade(P.brassD, -0.2));
      }
      // The lion and the scrollwork, as shapes, never as letters.
      disc(g, w / 2, 16, 5, P.brass);
      disc(g, w / 2, 15, 3, P.brassL);
      for (const s of [-1, 1] as const) {
        line(g, w / 2 + s * 5, 12, w / 2 + s * 9, 20, P.brassL);
        line(g, w / 2 + s * 6, 22, w / 2 + s * 10, 26, P.brass);
      }
      // The cloth bag behind, and the band.
      rect(g, w / 2 - 12, h - 8, 24, 5, P.hessian);
      hline(g, w / 2 - 12, h - 8, 24, P.hessianL);
      rect(g, w / 2 - 13, h - 4, 26, 3, P.brassD);
    },
  },

  /**
   * A FILE OF HESSIANS, FORMED.
   *
   * This is the most load-bearing prop in Act 4 and it exists because the
   * act was built without it and did not work. The whole argument of
   * Trenton — `docs/05` §4.3, and every decision in the act — is that the
   * garrison was not asleep and not drunk: it turned out under arms, in the
   * street, in the sleet, and formed by companies while the guns were
   * firing down the street at it. The text said so in six places. The
   * street was empty. A player standing at the head of King Street saw two
   * cannon, a well, and nothing to shoot at, and concluded — reasonably —
   * that the story about the sleeping garrison was true after all.
   *
   * So: five men, shoulder to shoulder, drawn as one object. Blue coats,
   * brass mitre caps, and a bayonet on every barrel, because a third of the
   * muskets in the American column would not take one and that difference
   * is the argument the prop is making.
   *
   * They are deliberately NOT individuated. At this size the read is the
   * dressed line — the fact that the intervals are equal and the barrels
   * are all at the same angle — and jittering them would destroy the one
   * thing the prop is for. The only variation is a half-pixel of height
   * off `hash`, so the rank does not look stamped.
   */
  hessianFile: {
    w: 78, h: 52, block: 0.5, sink: 2,
    draw(g, _w, h, v) {
      for (let m = 0; m < 5; m++) {
        const cx = 9 + m * 15;
        // A pixel of height, so five men are not one man five times. It is
        // the only variation there is, and that is deliberate: see above.
        const lift = hash(m, v, 241) < 0.5 ? 0 : 1;
        const head = 18 - lift;          // top of the face
        const coat = head + 7;           // shoulders
        const foot = h - 6;

        /*
         * The musket, first, and passing OUTSIDE the right shoulder.
         * On the first pass it ran up the middle of the figure and the
         * coat, drawn after it, painted over the whole barrel: five men
         * turned out under arms with no arms. It is shouldered, so it
         * clears the coat by two pixels and the bayonet clears the cap.
         */
        line(g, cx + 7, foot - 2, cx + 4, head - 8, P.woodD);
        line(g, cx + 8, foot - 2, cx + 5, head - 8, P.wood);
        // The bayonet, in bright steel. Sixteen inches of it above the cap
        // is the one silhouette in this frame that says these men can close.
        line(g, cx + 4, head - 8, cx + 3, head - 16, P.steelL);
        line(g, cx + 5, head - 8, cx + 4, head - 16, P.iron);
        px(g, cx + 3, head - 17, P.steelL);

        // The coat: Hessian blue, turnbacks light on one edge, shadow on
        // the other, and the belts crossed white over the breast.
        rect(g, cx - 5, coat, 11, foot - coat, P.hessian);
        vline(g, cx - 5, coat, foot - coat, P.hessianL);
        vline(g, cx + 5, coat, foot - coat, P.hessianD);
        line(g, cx - 4, coat + 2, cx + 4, coat + 9, P.linen);
        line(g, cx + 4, coat + 2, cx - 4, coat + 9, P.linen);
        hline(g, cx - 5, foot - 1, 11, P.hessianD);

        // Black gaiters to the knee, which is the other half of why a
        // Hessian reads as a Hessian at this size.
        rect(g, cx - 4, foot, 3, 5, P.ironD);
        rect(g, cx + 2, foot, 3, 5, P.ironD);

        // The face. No features: two pixels of shadow under the plate is
        // all a head this size will carry, and eyes at this scale read as
        // a skull.
        rect(g, cx - 2, head, 5, 6, P.skinA);
        hline(g, cx - 2, head, 5, P.skinAD);

        // The mitre cap over it: a tall brass front plate, tapering up.
        for (let y = 0; y < 9; y++) {
          const half = Math.round(1 + (y / 8) * 3);
          hline(g, cx - half, head - 9 + y, half * 2 + 1, P.brassD);
          px(g, cx - half, head - 9 + y, P.brass);
        }
        px(g, cx, head - 10, P.brassL);
        // The scrollwork, as a shape, never as letters.
        px(g, cx, head - 5, P.brassL);
        hline(g, cx - 4, head - 1, 9, P.brass);
        px(g, cx - 4, head - 1, P.brassL);
      }
    },
  },

  /** A stand of arms, grounded: nine hundred muskets in one object. */
  armsStand: {
    w: 62, h: 46, block: 0.4, sink: 2,
    draw(g, _w, h, v) {
      for (let cluster = 0; cluster < 3; cluster++) {
        const cx = 12 + cluster * 20;
        for (const s of [-1, 0, 1] as const) {
          line(g, cx + s * 6, h - 3, cx + Math.round(s * 1.5), 8, P.woodD);
          line(g, cx + s * 6 + 1, h - 3, cx + Math.round(s * 1.5) + 1, 8, P.wood);
          px(g, cx + Math.round(s * 1.5), 7, P.ironL);
        }
        // Bayonets crossed at the top. These ones HAVE bayonets, and that is
        // the point: they are Hessian.
        disc(g, cx, 7, 2, P.ironD);
        line(g, cx - 4, 10, cx + 4, 2, P.ironL);
        line(g, cx + 4, 10, cx - 4, 2, P.ironL);
        if (hash(cluster, v, 221) < 0.6) {
          rect(g, cx - 5, h - 14, 10, 6, P.hessian);
          hline(g, cx - 5, h - 14, 10, P.hessianL);
        }
      }
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

  /* ====================================================================== *
   * VALLEY FORGE, 1777-78
   *
   * THE HUT IS THE ACT.
   *
   * Everything about Valley Forge that a student is likely to have been
   * told is a picture of suffering, and the thing the record actually shows
   * is a specification. The hutting order of 18 December 1777 gave the
   * dimensions — fourteen feet by sixteen, six and a half feet to the
   * eaves, the door in the side facing the street, the fireplace at the
   * rear — and squads that built theirs wrong were made to pull them down
   * and start again. Twelve men to a hut, six hundred huts, laid out on a
   * grid, by an army that was starving and had no nails.
   *
   * So these props are drawn to make one argument: ORDER AND MISERY IN THE
   * SAME FRAME. The huts are identical because they were meant to be, and
   * the timber is green and pale and gapped because it was cut that week
   * off the hill behind them. A picturesque ruin would be a lie in the
   * opposite direction from the one everybody already believes.
   * ==================================================================== */

  /**
   * A finished hut, to the specification.
   *
   * Green logs, clay chinking in every course, a door in the long side, and
   * a chimney of sticks and clay at the gable end. The proportions are the
   * order's: wider than it is deep, and LOW — six and a half feet at the
   * eaves means a man of Washington's height could not stand up in one,
   * which is a fact worth being able to see rather than be told.
   */
  forgeHut: {
    w: 92, h: 74, block: 1.5, sink: 3,
    draw(g, w, h, v) {
      const eave = 34;
      const base = h - 4;

      // --- the log wall, course by course --------------------------------
      // Each course is a log with clay rammed into the gap above it. The
      // clay stripe is not decoration: green wood shrinks as it dries and
      // the gaps are the reason the order specified eighteen inches of it.
      const RET = w - 22;                 // where the front wall turns the corner
      for (let y = eave; y < base; y += 7) {
        // The front wall, in the light.
        rect(g, 6, y, RET - 6, 5, P.greenwood);
        hline(g, 6, y, RET - 6, P.greenwoodL);
        hline(g, 6, y + 4, RET - 6, P.greenwoodD);
        rect(g, 6, y + 5, RET - 6, 2, P.clay);
        hline(g, 6, y + 6, RET - 6, P.clayD);
        /*
         * The returning end, in shadow — and drawn as LOGS, not as a slab.
         * The first pass laid a flat grey rectangle over this end to darken
         * it and it read as a stain on the wall rather than as a wall
         * turning a corner: the courses simply stopped, and a log building
         * whose logs stop is not a log building.
         */
        rect(g, RET, y, w - 6 - RET, 5, shade(P.greenwood, -0.22));
        hline(g, RET, y, w - 6 - RET, shade(P.greenwoodL, -0.24));
        hline(g, RET, y + 4, w - 6 - RET, shade(P.greenwoodD, -0.18));
        rect(g, RET, y + 5, w - 6 - RET, 2, shade(P.clay, -0.20));
        vline(g, RET, y, 7, P.greenwoodD);
        // The sawn ends of the logs, showing at the corners.
        rect(g, 3, y, 4, 5, P.greenwoodL);
        rect(g, w - 7, y, 4, 5, shade(P.greenwoodD, -0.16));
      }

      // --- the roof: split shakes, weighted with poles --------------------
      for (let y = 10; y < eave; y++) {
        const t = (y - 10) / (eave - 10);
        const half = Math.round(8 + t * (w / 2 - 6));
        hline(g, w / 2 - half, y, half, P.woodD);
        hline(g, w / 2, y, half, shade(P.woodD, -0.12));
        /*
         * SHAKE COURSES, EVERY FOUR ROWS.
         *
         * Without them the roof is one flat brown triangle the size of the
         * whole prop, and six hundred flat brown triangles down a street is
         * a hillside rather than a town. A shake roof is short split boards
         * laid in overlapping courses, so the read is a stack of horizontal
         * lines with the ends of the boards breaking them up — and the ends
         * are staggered off `hash`, because a roof split with a froe by a
         * hungry man is not a regular grid.
         */
        if ((y - 10) % 4 === 0) {
          hline(g, w / 2 - half, y, half * 2, shade(P.wood, -0.16));
          for (let x = w / 2 - half; x < w / 2 + half; x += 9) {
            if (hash(x, y + v, 601) < 0.7) vline(g, x + (v % 3), y, 4, shade(P.woodD, -0.22));
          }
        }
      }
      hline(g, w / 2 - 9, 10, 19, P.wood);
      // Weight poles laid across it, which is how a shake roof stayed on
      // when the army had no nails and the order did not issue any.
      for (const dx of [-22, 0, 22]) {
        line(g, w / 2 + dx - 4, 12, w / 2 + dx - 14, eave - 2, P.woodD);
      }

      // --- the door, in the long side, facing the street ------------------
      rect(g, 24, base - 26, 20, 26, shade(P.ink, 0.10));
      vline(g, 24, base - 26, 26, P.greenwoodL);
      vline(g, 43, base - 26, 26, P.greenwoodD);
      hline(g, 24, base - 26, 20, P.greenwoodL);
      // A hide or a blanket hung in it, because doors needed hinges and the
      // order did not issue those either. Hung, so it falls in folds.
      rect(g, 27, base - 24, 14, 17, shade(P.canvasD, -0.18));
      for (let x = 28; x < 41; x += 4) vline(g, x, base - 24, 17, shade(P.canvasD, -0.30));
      hline(g, 27, base - 24, 14, shade(P.canvasM, -0.14));

      /*
       * The chimney: sticks laid up like a miniature log pen and daubed
       * with clay, which is what a camp chimney was and why so many of them
       * caught fire. Muted against the chinking rather than matching it —
       * two identical reds at this size read as one object.
       */
      rect(g, w - 20, 2, 13, eave - 2, shade(P.clay, -0.12));
      rect(g, w - 20, 2, 5, eave - 2, shade(P.clayL, -0.10));
      hline(g, w - 21, 2, 15, P.clayD);
      for (let y = 5; y < eave - 4; y += 5) {
        hline(g, w - 20, y, 13, P.clayD);
        px(g, w - 20, y, P.greenwoodD);
        px(g, w - 8, y, P.greenwoodD);
      }

      // Sparse. The first pass speckled clay over the whole wall and it
      // read as spatter rather than as daub.
      speckle(g, 6, eave, RET - 6, base - eave, P.greenwoodD, 0.018, v + 602);
    },
  },

  /**
   * The same hut, three courses up and no roof.
   *
   * This is what the whole camp looked like on the day the act opens: the
   * order given on the eighteenth, twelve thousand men in the open, and the
   * huts going up around them out of green wood with axes and no nails. The
   * gap between this prop and the one above it, standing in the same
   * street four months apart, is the act.
   */
  forgeHutRaw: {
    w: 92, h: 42, block: 1.5, sink: 3,
    draw(g, w, h, v) {
      const base = h - 4;
      for (let y = base - 21; y < base; y += 7) {
        rect(g, 6, y, w - 12, 5, P.greenwood);
        hline(g, 6, y, w - 12, P.greenwoodL);
        hline(g, 6, y + 4, w - 12, P.greenwoodD);
        // No clay yet in the top course — that is the work still to do.
        if (y < base - 8) {
          rect(g, 6, y + 5, w - 12, 2, P.clay);
          hline(g, 6, y + 6, w - 12, P.clayD);
        }
        rect(g, 3, y, 4, 5, P.greenwoodL);
        rect(g, w - 7, y, 4, 5, P.greenwoodD);
      }
      // The next log, up on skids, waiting to go on.
      rect(g, 14, base - 30, w - 34, 6, P.greenwood);
      hline(g, 14, base - 30, w - 34, P.greenwoodL);
      for (const x of [18, w - 26]) line(g, x, base - 24, x + 5, base - 2, P.woodD);
      // Corner posts standing above the courses, marking the height to come.
      for (const x of [6, w - 10]) rect(g, x, base - 38, 4, 38, P.woodD);
      speckle(g, 6, base - 21, w - 12, 21, P.clayD, 0.05, v + 611);
    },
  },

  /**
   * A hut pegged out and not yet raised.
   *
   * Four sills on the ground and a stake at each corner, at fourteen by
   * sixteen exactly. This is the specification made visible: a rectangle
   * on frozen mud, drawn before anybody had a wall.
   */
  hutFrame: {
    w: 92, h: 30, block: 0.6, sink: 2, flat: true,
    draw(g, w, h, v) {
      rect(g, 4, h - 8, w - 8, 4, P.greenwoodD);
      rect(g, 4, 6, w - 8, 4, shade(P.greenwoodD, -0.10));
      rect(g, 4, 6, 4, h - 10, P.greenwood);
      rect(g, w - 8, 6, 4, h - 10, shade(P.greenwood, -0.08));
      for (const [x, y] of [[3, 4], [w - 8, 4], [3, h - 10], [w - 8, h - 10]] as const) {
        rect(g, x, y, 3, 7, P.woodD);
        px(g, x, y, P.greenwoodL);
      }
      speckle(g, 8, 10, w - 16, h - 18, P.greenwoodL, 0.04, v + 621);
    },
  },

  /**
   * A stump, cut this winter.
   *
   * The cut face is pale and clean and the chips are still round it, and
   * that is the tell: a stump that has stood one season is grey. An acre of
   * these is what six hundred huts costs, and the hillside behind the camp
   * was stripped to the ridge.
   */
  stumpCut: {
    w: 30, h: 22, block: 0.4, sink: 3,
    draw(g, w, h, v) {
      ellipse(g, w / 2, h - 8, 11, 6, P.woodD);
      ellipse(g, w / 2, h - 11, 11, 6, P.greenwoodL);
      ellipse(g, w / 2, h - 11, 6, 3, P.greenwood);
      // Axe cuts round the rim, which is how it was felled — the army had
      // few saws and the order did not issue those either.
      for (let i = 0; i < 5; i++) {
        const a = hash(i, v, 631) * Math.PI * 2;
        px(g, Math.round(w / 2 + Math.cos(a) * 9), Math.round(h - 11 + Math.sin(a) * 4), P.woodD);
      }
      for (let i = 0; i < 6; i++) {
        const x = Math.floor(hash(i, v, 632) * w);
        px(g, x, h - 2 - Math.floor(hash(i, v, 633) * 3), P.greenwoodL);
      }
    },
  },

  /** Green timber, stacked where it was dragged to. */
  greenTimber: {
    w: 58, h: 30, block: 0.7, sink: 2,
    draw(g, w, h, v) {
      for (let row = 0; row < 3; row++) {
        const y = h - 6 - row * 7;
        const inset = row * 5;
        for (let x = 4 + inset; x < w - 6 - inset; x += 11) {
          ellipse(g, x + 5, y, 5, 4, P.greenwoodD);
          ellipse(g, x + 5, y - 1, 4, 3, P.greenwood);
          ellipse(g, x + 5, y - 1, 2, 2, P.greenwoodL);
        }
      }
      for (const x of [2, w - 4]) line(g, x, h - 2, x + 2, 6, P.woodD);
      speckle(g, 4, 6, w - 8, h - 8, P.greenwoodL, 0.05, v + 641);
    },
  },

  /**
   * A FILE OF CONTINENTALS, AND WHY IT IS DRAWN AGAINST `hessianFile`.
   *
   * Same construction, same five men, same interval, same angle on every
   * musket — and not one of them matching another. Hunting shirts, a coat
   * that was blue once, a blanket cut with a hole for the head, one man in
   * an overall and one in nothing much. A third of them have no shoes and
   * the drawing says so.
   *
   * That is the entire argument of Act 5 in one object. At Trenton the
   * matched blue rank with brass caps was the professional army and the
   * ragged one was not; by June the ragged one moves exactly like it, and
   * the only thing that changed is that somebody spent a winter teaching
   * them to. Von Steuben's own line about it is the point: in Europe you
   * say "this is why you do it" and the man does it; here you have to say
   * why, and then he does it — and does it better.
   */
  continentalFile: {
    w: 78, h: 52, block: 0.5, sink: 2,
    draw(g, _w, h, v) {
      const coats = [P.hessianD, P.wood, P.canvasD, P.turfD, P.carriageD];
      for (let m = 0; m < 5; m++) {
        const cx = 9 + m * 15;
        const lift = hash(m, v, 651) < 0.5 ? 0 : 1;
        const head = 18 - lift;
        const coat = head + 7;
        const foot = h - 6;
        const cloth = coats[Math.floor(hash(m, v, 652) * coats.length) % coats.length];

        // The musket, shouldered, at the same angle as every other man's —
        // which is the whole of what the winter bought.
        line(g, cx + 7, foot - 2, cx + 4, head - 8, P.woodD);
        line(g, cx + 8, foot - 2, cx + 5, head - 8, P.wood);
        // Only some of them have a bayonet, and that is documented: the
        // muskets were whatever anybody had brought from home.
        if (hash(m, v, 653) < 0.45) {
          line(g, cx + 4, head - 8, cx + 3, head - 15, P.steelL);
          px(g, cx + 3, head - 16, P.steelL);
        }

        rect(g, cx - 5, coat, 11, foot - coat, cloth);
        vline(g, cx - 5, coat, foot - coat, shade(cloth, 0.14));
        vline(g, cx + 5, coat, foot - coat, shade(cloth, -0.16));
        hline(g, cx - 5, foot - 1, 11, shade(cloth, -0.20));
        // A patch, on about half of them.
        if (hash(m, v, 654) < 0.5) {
          rect(g, cx - 2, coat + 6, 4, 4, shade(coats[(m + 2) % coats.length], 0.06));
        }

        // Legs. Rags round the feet where there are no shoes, and there is
        // no shoe on two men in five.
        const shod = hash(m, v, 655) < 0.6;
        rect(g, cx - 4, foot, 3, 5, shod ? P.ironD : P.canvasM);
        rect(g, cx + 2, foot, 3, 5, shod ? P.ironD : P.canvasM);

        rect(g, cx - 2, head, 5, 6, P.skinA);
        hline(g, cx - 2, head, 5, P.skinAD);
        // Hats: a cocked hat, a round hat, a cap, or nothing at all.
        const hat = Math.floor(hash(m, v, 656) * 4);
        if (hat === 0) {
          hline(g, cx - 6, head - 2, 13, P.woodD);
          rect(g, cx - 3, head - 5, 7, 3, P.woodD);
        } else if (hat === 1) {
          hline(g, cx - 5, head - 1, 11, shade(P.wood, -0.10));
          rect(g, cx - 3, head - 5, 7, 4, shade(P.wood, -0.10));
        } else if (hat === 2) {
          rect(g, cx - 3, head - 4, 7, 5, P.canvasD);
          px(g, cx + 3, head - 4, P.canvasM);
        }
      }
    },
  },

  /**
   * A pole with a fascine of straw on it — von Steuben's bayonet target.
   *
   * He had to teach the use of the bayonet from nothing, because the
   * Continental soldier had been using his as a spit and a tent peg. This
   * is the object that teaching happened against, and it is on the Grand
   * Parade because that is where it was.
   */
  bayonetPost: {
    w: 26, h: 56, block: 0.4, sink: 3,
    draw(g, w, h, v) {
      vline(g, w / 2, 12, h - 14, P.woodD);
      vline(g, w / 2 + 1, 12, h - 14, P.wood);
      // The straw bundle, tied twice, and punched through in three places.
      rect(g, w / 2 - 8, 6, 17, 22, P.canvasD);
      for (let i = 0; i < 14; i++) {
        const x = w / 2 - 8 + Math.floor(hash(i, v, 661) * 17);
        vline(g, x, 6, 22, hash(i, v, 662) < 0.4 ? P.canvasM : P.canvasD);
      }
      hline(g, w / 2 - 9, 11, 19, P.woodD);
      hline(g, w / 2 - 9, 23, 19, P.woodD);
      for (let i = 0; i < 3; i++) {
        disc(g, w / 2 - 4 + i * 4, 13 + Math.floor(hash(i, v, 663) * 8), 2, shade(P.ink, 0.12));
      }
    },
  },

  /**
   * A hospital bunk: three tiers of green poles, no bedding to speak of.
   *
   * The flying hospitals were huts like the others with berths built up the
   * walls. Twelve men in fourteen by sixteen means they were stacked, and
   * the record of what that did — two thousand dead, mostly of typhus and
   * dysentery, mostly in the spring rather than the worst of the cold — is
   * the act's fixed loss.
   */
  hospitalBunk: {
    w: 62, h: 54, block: 0.8, sink: 2,
    draw(g, w, h, v) {
      for (const x of [4, w - 8]) rect(g, x, 4, 4, h - 6, P.greenwoodD);
      for (let tier = 0; tier < 3; tier++) {
        const y = 12 + tier * 14;
        rect(g, 6, y, w - 12, 4, P.greenwood);
        hline(g, 6, y, w - 12, P.greenwoodL);
        // Straw on the berth, and a blanket on some of them.
        for (let i = 0; i < 9; i++) {
          const bx = 8 + Math.floor(hash(i, v, tier * 10 + 671) * (w - 20));
          hline(g, bx, y - 1, 4, P.canvasD);
        }
        if (hash(tier, v, 672) < 0.66) {
          rect(g, 10 + tier * 3, y - 5, 26, 5, shade(P.turfD, 0.08));
          hline(g, 10 + tier * 3, y - 5, 26, shade(P.turf, 0.06));
        }
      }
    },
  },
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
