/**
 * Where you can stand, computed without a renderer.
 *
 * This exists because a building was placed across the north lane and walled
 * the Quarter off from the rest of the estate, and nothing caught it: the
 * linter could not see the collision grid, because the collision grid was
 * being computed halfway down the mesh builder with a WebGL context in scope.
 *
 * So it moved here, it takes a `MapDef` and nothing else, and `npm test` now
 * floods the map from the spawn and asserts that every person, every object
 * and every door is actually reachable. A map that cannot be walked is a
 * broken map whether or not it compiles.
 */

import type { MapDef } from '../types';
import { TILE_SOLID, type TileId } from './tiles';
import { PROPS } from './props';

/** One elevation digit. Ten steps covers the fall from the house to the river. */
export const STEP = 0.42;
/** Pixels per world unit for sprites: a 32px sprite is one tile wide. */
export const PPU = 32;

export interface Grid {
  cols: number;
  rows: number;
  tile: TileId[];
  height: Float32Array;
  /** 0 walkable, 1 blocked. */
  solid: Uint8Array;
  at(col: number, row: number): number;
  heightAt(x: number, z: number): number;
  blocked(x: number, z: number): boolean;
}

export function makeGrid(map: MapDef): Grid {
  const rows = map.ground.length;
  const cols = Math.max(...map.ground.map((r) => r.length));
  const tile: TileId[] = new Array(cols * rows).fill('grass');
  const height = new Float32Array(cols * rows);
  const solid = new Uint8Array(cols * rows);

  for (let r = 0; r < rows; r++) {
    const line = map.ground[r] ?? '';
    const elev = map.elev?.[r] ?? '';
    const obj = map.objects?.[r] ?? '';
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const ch = line[c] ?? ' ';
      const id = map.legend[ch];
      // A character with no legend entry is a hole in the map — legal, and how
      // an interior gets a footprint that is not a rectangle.
      tile[i] = id ?? ('grass' as TileId);
      if (!id) solid[i] = 1;
      else if (TILE_SOLID[id]) solid[i] = 1;
      const d = elev[c];
      height[i] = d && d >= '0' && d <= '9' ? (d.charCodeAt(0) - 48) * STEP : 0;
      const o = obj[c];
      if (o === '#' || o === 'X') solid[i] = 1;
    }
  }

  const at = (col: number, row: number) => {
    if (col < 0 || row < 0 || col >= cols || row >= rows) return -1;
    return row * cols + col;
  };

  // Structures block their whole footprint unless they are declared passable —
  // which the unfinished north wing is, because you can walk into it.
  for (const s of map.structures ?? []) {
    if (s.passable) continue;
    for (let c = Math.floor(s.x); c < Math.ceil(s.x + s.w); c++) {
      for (let r = Math.floor(s.z); r < Math.ceil(s.z + s.d); r++) {
        const i = at(c, r);
        if (i >= 0) solid[i] = 1;
      }
    }
  }

  // Props block a radius, in tiles, declared on the prop itself.
  for (const p of map.props) {
    const def = PROPS[p.id];
    if (!def?.block) continue;
    const rad = def.block * (p.scale ?? 1);
    for (let c = Math.floor(p.x - rad); c <= Math.floor(p.x + rad); c++) {
      for (let r = Math.floor(p.z - rad); r <= Math.floor(p.z + rad); r++) {
        const i = at(c, r);
        if (i >= 0) solid[i] = 1;
      }
    }
  }

  // Doors, spawns and the tiles people are standing on always stay open,
  // whatever a structure or a prop claimed on top of them.
  for (const p of map.portals ?? []) {
    for (let c = p.x; c < p.x + (p.w ?? 1); c++) {
      for (let r = p.z; r < p.z + (p.d ?? 1); r++) {
        const i = at(c, r);
        if (i >= 0) solid[i] = 0;
      }
    }
  }
  for (const n of map.npcs ?? []) {
    const i = at(Math.floor(n.x), Math.floor(n.z));
    if (i >= 0) solid[i] = 0;
  }
  const si = at(Math.floor(map.spawn.x), Math.floor(map.spawn.z));
  if (si >= 0) solid[si] = 0;

  return {
    cols, rows, tile, height, solid, at,
    heightAt(x, z) {
      const i = at(Math.floor(x), Math.floor(z));
      return i < 0 ? 0 : height[i];
    },
    blocked(x, z) {
      const i = at(Math.floor(x), Math.floor(z));
      return i < 0 ? true : solid[i] === 1;
    },
  };
}

/** Every tile the player can actually get to from the spawn. */
export function reachable(grid: Grid, from: [number, number]): Uint8Array {
  const seen = new Uint8Array(grid.cols * grid.rows);
  const start = grid.at(Math.floor(from[0]), Math.floor(from[1]));
  if (start < 0 || grid.solid[start]) return seen;
  const queue = [start];
  seen[start] = 1;
  while (queue.length) {
    const i = queue.pop()!;
    const c = i % grid.cols, r = (i / grid.cols) | 0;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const j = grid.at(c + dc, r + dr);
      if (j < 0 || seen[j] || grid.solid[j]) continue;
      seen[j] = 1;
      queue.push(j);
    }
  }
  return seen;
}

/**
 * Whether something at (x, z) can be spoken to or looked at: is there any
 * reachable tile within arm's length of it? An object standing in the middle
 * of a hedge is not findable even though its own tile is technically clear.
 */
export function withinReach(
  grid: Grid, seen: Uint8Array, x: number, z: number, reach = 1.9,
): boolean {
  const rad = Math.ceil(reach);
  for (let c = Math.floor(x) - rad; c <= Math.floor(x) + rad; c++) {
    for (let r = Math.floor(z) - rad; r <= Math.floor(z) + rad; r++) {
      const i = grid.at(c, r);
      if (i < 0 || !seen[i]) continue;
      if (Math.hypot(c + 0.5 - (x + 0.5), r + 0.5 - (z + 0.5)) <= reach) return true;
    }
  }
  return false;
}
