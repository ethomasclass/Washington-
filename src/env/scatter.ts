/**
 * Scatter — vegetation and rock, placed on the terrain by the thousand.
 *
 * One InstancedMesh per kind so a forest costs one draw call. Placement reads
 * the terrain height and slope: trees avoid steep ground and water; rocks prefer
 * it. Seeded, so the wood is the same wood every load.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { prng, fbm } from './noise';

function colored(geo: THREE.BufferGeometry, hex: number): THREE.BufferGeometry {
  // mergeGeometries requires every part indexed or every part non-indexed;
  // primitives disagree (cylinders indexed, polyhedra not), so normalise here.
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

/** A broadleaf/poplar tree merged into one geometry. `bare` = winter. */
export function treeGeometry(
  trunk: number, leaf: number, bare = false, form: 'broad' | 'tall' = 'broad',
): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunkH = form === 'tall' ? 3.4 : 2.4;
  const t = colored(new THREE.CylinderGeometry(0.11, 0.2, trunkH, 6), trunk);
  t.translate(0, trunkH / 2, 0); parts.push(t);
  if (bare) {
    const n = form === 'tall' ? 6 : 5;
    for (let i = 0; i < n; i++) {
      const b = colored(new THREE.CylinderGeometry(0.03, 0.06, form === 'tall' ? 1.7 : 1.4, 4), trunk);
      b.rotateZ((Math.random() - 0.5) * (form === 'tall' ? 0.7 : 1.2));
      b.rotateX((Math.random() - 0.5) * (form === 'tall' ? 0.7 : 1.2));
      b.translate((Math.random() - 0.5) * 0.5, trunkH - 0.2 + i * 0.3, (Math.random() - 0.5) * 0.5);
      parts.push(b);
    }
  } else if (form === 'tall') {
    // poplar: narrow stacked crowns
    for (let i = 0; i < 4; i++) {
      const c = colored(new THREE.IcosahedronGeometry(1.0 - i * 0.16, 0), leaf);
      c.scale(0.8, 1.15, 0.8); c.translate(0, trunkH + 0.5 + i * 1.15, 0);
      parts.push(c);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const c = colored(new THREE.IcosahedronGeometry(1.5 - i * 0.32, 0), leaf);
      c.scale(1, 0.85, 1); c.translate(0, 2.6 + i * 0.95, 0);
      parts.push(c);
    }
  }
  return mergeGeometries(parts, false)!;
}

/** A clump of grass blades — the ground-clutter workhorse. */
export function tuftGeometry(color: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const blade = colored(new THREE.ConeGeometry(0.045, 0.34 + (i % 2) * 0.14, 3), color);
    blade.rotateX((i % 2 ? 1 : -1) * 0.28);
    blade.rotateY(a);
    blade.translate(Math.cos(a) * 0.07, 0.16, Math.sin(a) * 0.07);
    parts.push(blade);
  }
  return mergeGeometries(parts, false)!;
}

/** A fallen stick. */
export function stickGeometry(color: number): THREE.BufferGeometry {
  const g = colored(new THREE.CylinderGeometry(0.025, 0.035, 0.9, 4), color);
  g.rotateZ(Math.PI / 2 - 0.08);
  g.translate(0, 0.035, 0);
  return g;
}

export function rockGeometry(color: number): THREE.BufferGeometry {
  const g = colored(new THREE.DodecahedronGeometry(0.6, 0), color);
  g.scale(1, 0.6, 1.1);
  return g;
}

export interface ScatterOpts {
  count: number;
  area: number;           // half-extent to place within
  seed: number;
  maxSlope: number;
  minHeight?: number;     // avoid water
  scaleMin?: number;
  scaleMax?: number;
  avoid?: Array<{ x: number; z: number; r: number }>; // clearings (house, camp, dock)
  /**
   * Clump the scatter: placements survive only where a noise field exceeds
   * the threshold. Kills the even "orchard rim" a uniform scatter produces.
   */
  cluster?: { scale: number; threshold: number };
}

export function scatter(
  geo: THREE.BufferGeometry,
  ramp: THREE.Texture,
  height: (x: number, z: number) => number,
  slopeAt: (x: number, z: number) => number,
  o: ScatterOpts,
): THREE.InstancedMesh {
  const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp });
  (mat as unknown as { flatShading: boolean }).flatShading = true;
  const inst = new THREE.InstancedMesh(geo, mat, o.count);
  const rand = prng(o.seed);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  let placed = 0;
  let tries = 0;
  while (placed < o.count && tries < o.count * 8) {
    tries++;
    const x = (rand() - 0.5) * o.area * 2;
    const z = (rand() - 0.5) * o.area * 2;
    const h = height(x, z);
    if (o.minHeight !== undefined && h < o.minHeight) continue;
    if (slopeAt(x, z) > o.maxSlope) continue;
    if (o.avoid && o.avoid.some((a) => Math.hypot(x - a.x, z - a.z) < a.r)) continue;
    if (o.cluster && fbm(x * o.cluster.scale, z * o.cluster.scale, { seed: o.seed + 5 }) < o.cluster.threshold) continue;
    const sc = (o.scaleMin ?? 0.8) + rand() * ((o.scaleMax ?? 1.4) - (o.scaleMin ?? 0.8));
    p.set(x, h, z);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    s.set(sc, sc * (0.9 + rand() * 0.3), sc);
    m.compose(p, q, s);
    inst.setMatrixAt(placed, m);
    placed++;
  }
  inst.count = placed;
  inst.instanceMatrix.needsUpdate = true;
  inst.castShadow = true;
  return inst;
}
