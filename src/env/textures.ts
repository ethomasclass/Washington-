/**
 * Procedural textures — the detail pass under the cel shading.
 *
 * Every texture here is drawn once on a canvas, near-white and LOW CONTRAST,
 * because in this pipeline the material's `color` carries the hue and the
 * outline pass carries the drawing. A texture's whole job is to break up the
 * flat fill with material grain — plank joints, brick courses, shingle rows,
 * canvas weave — quietly enough that the toon bands still read.
 *
 * Deterministic (seeded), generated once, cached by name.
 */

import * as THREE from 'three';
import { prng } from './noise';

const CACHE = new Map<string, THREE.CanvasTexture>();

function make(
  name: string, w: number, h: number,
  draw: (ctx: CanvasRenderingContext2D, rand: () => number) => void,
  repeat = 1,
): THREE.CanvasTexture {
  const hit = CACHE.get(name);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  draw(ctx, prng(name.length * 7919 + 13));
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  CACHE.set(name, tex);
  return tex;
}

/** Horizontal clapboard siding: board shadows every course. */
export function clapboardTex(): THREE.CanvasTexture {
  return make('clapboard', 256, 256, (ctx, rand) => {
    for (let y = 0; y < 256; y += 21) {
      ctx.fillStyle = 'rgba(60,45,25,0.16)';
      ctx.fillRect(0, y + 18, 256, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fillRect(0, y, 256, 2);
      // grain streaks
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(80,60,30,${0.03 + rand() * 0.04})`;
        ctx.fillRect(rand() * 256, y + 3 + rand() * 13, 30 + rand() * 60, 1);
      }
    }
  });
}

/** Vertical plank boards with joints and grain — floors, doors, wagon beds. */
export function plankTex(): THREE.CanvasTexture {
  return make('plank', 256, 256, (ctx, rand) => {
    for (let x = 0; x < 256; x += 43) {
      ctx.fillStyle = 'rgba(60,45,25,0.20)';
      ctx.fillRect(x, 0, 2, 256);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(70,50,25,${0.04 + rand() * 0.05})`;
        const gy = rand() * 256;
        ctx.fillRect(x + 4 + rand() * 34, gy, 2, 20 + rand() * 60);
      }
      // an occasional knot
      if (rand() < 0.6) {
        ctx.beginPath();
        ctx.arc(x + 10 + rand() * 24, rand() * 256, 3 + rand() * 3, 0, 7);
        ctx.strokeStyle = 'rgba(60,42,20,0.25)';
        ctx.stroke();
      }
    }
  });
}

/** Running-bond brickwork with pale mortar joints. */
export function brickTex(): THREE.CanvasTexture {
  return make('brick', 256, 256, (ctx, rand) => {
    const bh = 16, bw = 52;
    for (let row = 0; row < 256 / bh; row++) {
      const off = row % 2 ? bw / 2 : 0;
      // mortar bed
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(0, row * bh, 256, 2);
      for (let x = -1; x < 256 / bw + 1; x++) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(x * bw + off, row * bh, 2, bh);
        // per-brick tone shift
        ctx.fillStyle = `rgba(${rand() < 0.5 ? '120,60,40' : '90,45,35'},${0.05 + rand() * 0.09})`;
        ctx.fillRect(x * bw + off + 2, row * bh + 2, bw - 2, bh - 2);
      }
    }
  }, 2);
}

/** Shingle courses with staggered joints — for wooden roofs. */
export function shingleTex(): THREE.CanvasTexture {
  return make('shingle', 256, 256, (ctx, rand) => {
    const ch = 26;
    for (let row = 0; row < 256 / ch + 1; row++) {
      ctx.fillStyle = 'rgba(40,30,18,0.22)';
      ctx.fillRect(0, row * ch + ch - 3, 256, 3);
      const off = rand() * 30;
      for (let x = 0; x < 256 / 30 + 1; x++) {
        ctx.fillStyle = 'rgba(40,30,18,0.14)';
        ctx.fillRect(x * 30 + off, row * ch, 1.5, ch);
        ctx.fillStyle = `rgba(255,255,255,${rand() * 0.07})`;
        ctx.fillRect(x * 30 + off + 2, row * ch + 2, 26, ch - 6);
      }
    }
  }, 2);
}

/** Woven canvas with seam lines — tents and sails. */
export function canvasTex(): THREE.CanvasTexture {
  return make('canvas', 128, 128, (ctx, rand) => {
    for (let y = 0; y < 128; y += 2) {
      ctx.fillStyle = `rgba(120,105,70,${0.03 + rand() * 0.03})`;
      ctx.fillRect(0, y, 128, 1);
    }
    for (let x = 0; x < 128; x += 2) {
      ctx.fillStyle = `rgba(120,105,70,${0.02 + rand() * 0.03})`;
      ctx.fillRect(x, 0, 1, 128);
    }
    // seams
    ctx.fillStyle = 'rgba(90,75,45,0.18)';
    ctx.fillRect(0, 42, 128, 2);
    ctx.fillRect(0, 96, 128, 2);
  }, 3);
}

/** Coursed rubble stone — foundations and chimneys. */
export function stoneTex(): THREE.CanvasTexture {
  return make('stone', 256, 256, (ctx, rand) => {
    let y = 0;
    while (y < 256) {
      const rh = 20 + rand() * 16;
      let x = 0;
      while (x < 256) {
        const rw = 26 + rand() * 30;
        ctx.strokeStyle = 'rgba(255,255,255,0.30)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, rw, rh);
        ctx.fillStyle = `rgba(70,65,55,${rand() * 0.08})`;
        ctx.fillRect(x + 2, y + 2, rw - 4, rh - 4);
        x += rw;
      }
      y += rh;
    }
  }, 2);
}

/** Soft mottle for the terrain — multiplied over the vertex colours. */
export function groundTex(): THREE.CanvasTexture {
  return make('ground', 256, 256, (ctx, rand) => {
    for (let i = 0; i < 900; i++) {
      const r = 3 + rand() * 14;
      ctx.beginPath();
      ctx.arc(rand() * 256, rand() * 256, r, 0, 7);
      const dark = rand() < 0.5;
      ctx.fillStyle = dark
        ? `rgba(60,55,30,${0.02 + rand() * 0.035})`
        : `rgba(255,255,250,${0.02 + rand() * 0.03})`;
      ctx.fill();
    }
  }, 48);
}

/** Wicker weave for gabions. */
export function wickerTex(): THREE.CanvasTexture {
  return make('wicker', 128, 128, (ctx, rand) => {
    for (let y = 0; y < 128; y += 9) {
      ctx.fillStyle = 'rgba(70,50,20,0.25)';
      ctx.fillRect(0, y, 128, 2.5);
      for (let x = 0; x < 128; x += 13) {
        ctx.fillStyle = `rgba(255,255,255,${0.06 + rand() * 0.06})`;
        ctx.fillRect(x + (y % 18 ? 6 : 0), y + 2.5, 7, 6);
      }
    }
  }, 2);
}
