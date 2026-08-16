/**
 * Deterministic noise for terrain.
 *
 * A seeded PRNG plus value-noise fBm. Deterministic so a scene's hills are the
 * same every load (and the same for the player, the scatter and the collision
 * that all read heightAt). No Math.random in the terrain — the seed is the map.
 */

/** mulberry32 — small, fast, seedable. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(ix: number, iy: number, seed: number): number {
  let h = ix * 374761393 + iy * 668265263 + seed * 2246822519;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return (h >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** 2D value noise in [0,1]. */
export function valueNoise(x: number, y: number, seed = 1): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  const ux = smooth(fx), uy = smooth(fy);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

/** Fractal Brownian motion — layered value noise. Returns roughly [0,1]. */
export function fbm(x: number, y: number, opts: { seed?: number; octaves?: number; lacunarity?: number; gain?: number } = {}): number {
  const { seed = 1, octaves = 5, lacunarity = 2.0, gain = 0.5 } = opts;
  let amp = 0.5, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + o * 17);
    norm += amp;
    amp *= gain; freq *= lacunarity;
  }
  return sum / norm;
}

/** Ridged noise — sharper crests, for eroded ground and banks. */
export function ridged(x: number, y: number, seed = 1): number {
  const n = Math.abs(valueNoise(x, y, seed) * 2 - 1);
  return 1 - n;
}
