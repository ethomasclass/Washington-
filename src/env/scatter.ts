/**
 * Scatter — vegetation and rock, placed on the terrain by the thousand.
 *
 * One InstancedMesh per kind so a forest costs one draw call. Placement reads
 * the terrain height and slope: trees avoid steep ground and water; rocks prefer
 * it. Seeded, so the wood is the same wood every load.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { prng } from './noise';

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

/** A conifer/broadleaf tree merged into one geometry. `bare` = winter. */
export function treeGeometry(trunk: number, leaf: number, bare = false): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const t = colored(new THREE.CylinderGeometry(0.12, 0.2, 2.4, 6), trunk);
  t.translate(0, 1.2, 0); parts.push(t);
  if (bare) {
    for (let i = 0; i < 5; i++) {
      const b = colored(new THREE.CylinderGeometry(0.03, 0.06, 1.4, 4), trunk);
      b.rotateZ((Math.random() - 0.5) * 1.2); b.rotateX((Math.random() - 0.5) * 1.2);
      b.translate((Math.random() - 0.5) * 0.6, 2.3 + i * 0.25, (Math.random() - 0.5) * 0.6);
      parts.push(b);
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
