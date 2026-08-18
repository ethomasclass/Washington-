/**
 * Landmass — a distant shore that is actually terrain.
 *
 * The vistas were props on a shelf: chimneys standing on a flat plane at
 * water level, a hill that was a squashed sphere. At a mile's range the
 * SILHOUETTE is what sells a shore — a real rise from a real shoreline — so
 * this builds a small heightfield island: radial falloff to the water, fbm
 * relief, vertex-coloured from tidal sand through field to crest, the same
 * toon ramp and ground mottle as the playable terrain. `heightAt` lets a
 * scene stand ruins, forts and towns ON the ground instead of floating them.
 */

import * as THREE from 'three';
import { fbm } from './noise';
import { groundTex } from './textures';

export interface LandmassOpts {
  w: number;              // extent along x, metres
  d: number;              // extent along z
  peak: number;           // crest height above water
  seed: number;
  /** Where the crest sits, -1..1 across each axis (default centre). */
  crestX?: number;
  crestZ?: number;
  shore?: number;         // colour of the tide line
  field?: number;         // colour of the open ground
  crest?: number;         // colour of the high ground
  segments?: number;
  /**
   * Levelled patches (LOCAL x/z), for standing towns and forts on — without
   * one, a group of houses placed at a single height half-buries its edges
   * in the hillside.
   */
  plateaus?: Array<{ x: number; z: number; r: number; h: number }>;
}

export interface BuiltLandmass {
  mesh: THREE.Mesh;
  /** Height above the landmass origin at LOCAL (x, z). */
  heightAt: (x: number, z: number) => number;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// own toon ramp, so scenes can build landmasses without importing the
// assembler (which imports the scenes — a cycle)
let RAMP: THREE.DataTexture | null = null;
function ramp3(): THREE.DataTexture {
  if (RAMP) return RAMP;
  const d = new Uint8Array([188, 188, 188, 255, 222, 222, 222, 255, 255, 255, 255, 255]);
  RAMP = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter;
  RAMP.needsUpdate = true;
  return RAMP;
}

export function landmass(o: LandmassOpts): BuiltLandmass {
  const seg = o.segments ?? 48;
  const shoreC = new THREE.Color(o.shore ?? 0xa89a6e);
  const fieldC = new THREE.Color(o.field ?? 0x8a8a5e);
  const crestC = new THREE.Color(o.crest ?? 0x77804e);

  const elev = (x: number, z: number): number => {
    // unit radial coordinate, crest offset applied
    const ux = (x / (o.w / 2)) - (o.crestX ?? 0) * 0.4;
    const uz = (z / (o.d / 2)) - (o.crestZ ?? 0) * 0.4;
    const r = Math.hypot(ux, uz);
    const falloff = clamp(1 - r, 0, 1);
    const n = fbm(x * 0.03 + o.seed, z * 0.03 + o.seed * 2, { seed: o.seed, octaves: 4 });
    let h = Math.pow(falloff, 1.35) * o.peak * (0.72 + n * 0.55) - 0.6;
    for (const p of o.plateaus ?? []) {
      const t = clamp(1 - Math.hypot(x - p.x, z - p.z) / p.r, 0, 1);
      h = h + (p.h - h) * (t * t * (3 - 2 * t));
    }
    return h;
  };

  const geo = new THREE.PlaneGeometry(o.w, o.d, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, elev(pos.getX(i), pos.getZ(i)));
  }
  geo.computeVertexNormals();
  const colors: number[] = [];
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const h = pos.getY(i);
    const t = clamp(h / o.peak, 0, 1);
    if (h < 0.5) c.copy(shoreC).lerp(fieldC, clamp(h / 0.5, 0, 1) * 0.6);
    else c.copy(fieldC).lerp(crestC, t);
    const mottle = fbm(pos.getX(i) * 0.08, pos.getZ(i) * 0.08, { seed: o.seed + 9 });
    c.lerp(new THREE.Color(0x6d5e40), mottle * 0.18);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp3(), map: groundTex() });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return { mesh, heightAt: elev };
}
