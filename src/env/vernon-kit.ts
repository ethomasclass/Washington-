/**
 * The estate kit — parametric Georgian-Virginia architecture and plantation
 * life, for Mount Vernon and every other built place in the game.
 *
 * Two disciplines, learned from the prop kit and kept:
 *
 *   1. SILHOUETTE FIRST. The outline pass inks what the geometry gives it, so a
 *      window is a recessed dark pane with proud white muntins, a hip roof is a
 *      real four-slope solid, a worm fence actually zigzags. No decals.
 *   2. PARAMETERS, NOT COPIES. One `building()` makes the mansion, a dairy and
 *      a smokehouse; the difference is a config object, exactly the way one
 *      figure() makes a soldier and a field hand. That is what keeps eight acts
 *      of architecture affordable.
 *
 * Nothing in here knows where anything stands — placement belongs to the scene.
 * Animation: anything that moves registers itself through the `Animated` list
 * the scene passes in (smoke drifts, birds circle, laundry sways).
 */

import * as THREE from 'three';
import { mat, texMat } from '../fp/kit';
import { brickTex, plankTex, stoneTex } from './textures';

/** Per-frame animator. `cam` is the player's position, for proximity effects. */
export type Animated = (t: number, dt: number, cam?: THREE.Vector3) => void;

// Period palette — Virginia tidewater, painted wood and brick.
export const V = {
  white:     0xe9e4d4, // painted "stone" white of the mansion
  cream:     0xddd5be,
  trim:      0xf2eee0,
  shutter:   0x3d4a3a, // dark green
  glass:     0x2e3c44,
  roofSlate: 0x5c6b76, // cypress shingles painted slate blue — the 1775 roof;
                       // the famous red roof is documented only from the 1790s
  roofWood:  0x71583a, // unpainted cypress shingle, weathered
  rawSiding: 0xc4ad82, // new pine siding, primed tan, not yet sanded white
  brick:     0x8d5138,
  stone:     0x8d867a,
  clapboard: 0xc9bda0, // whitewashed-once outbuilding
  clapboard2:0xb3a683, // weathered outbuilding
  door:      0x4a3826,
  postWood:  0x77603f,
  railWood:  0x8a7350,
  soil:      0x6d5638,
  bed:       0x5d7a3a, // garden bed green
  linen:     0xe8e2d2,
  smoke:     0xd9d6d0,
  sheepWool: 0xd8d2c2,
  sheepFace: 0x4a4038,
  cow:       0x7a4a30,
  cowPatch:  0xe0d8c8,
  horse:     0x5a3d28,
  hay:       0xc0a860,
} as const;

function mesh(geo: THREE.BufferGeometry, color: number, flat = true): THREE.Mesh {
  return new THREE.Mesh(geo, mat(color, { flat }));
}

// ---------------------------------------------------------------------------
// ROOF GEOMETRY — real solids, built by hand
// ---------------------------------------------------------------------------

/** A hip roof: rectangular eave, shorter ridge, four slopes. Origin at eave level. */
export function hipRoofGeo(w: number, d: number, h: number, ridgeFrac = 0.45): THREE.BufferGeometry {
  const rw = w * ridgeFrac; // ridge length along x
  const verts: number[] = [];
  const e = [
    [-w / 2, 0, -d / 2], [w / 2, 0, -d / 2], [w / 2, 0, d / 2], [-w / 2, 0, d / 2],
  ];
  const r = [[-rw / 2, h, 0], [rw / 2, h, 0]];
  const quad = (a: number[], b: number[], c: number[], dd: number[]) => {
    verts.push(...a, ...b, ...c, ...a, ...c, ...dd);
  };
  const tri = (a: number[], b: number[], c: number[]) => verts.push(...a, ...b, ...c);
  quad(e[0], e[1], r[1], r[0]);       // north slope
  quad(e[2], e[3], r[0], r[1]);       // south slope
  tri(e[1], e[2], r[1]);              // east hip
  tri(e[3], e[0], r[0]);              // west hip
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  // planar-ish UVs so shingle textures can lie on the slopes
  const uvs: number[] = [];
  for (let i = 0; i < verts.length; i += 3) {
    uvs.push(verts[i] / 3, (verts[i + 2] + verts[i + 1]) / 3);
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  return geo;
}

/** A gable roof solid (triangular prism), ridge along x. */
export function gableRoofGeo(w: number, d: number, h: number): THREE.BufferGeometry {
  const sh = new THREE.Shape();
  sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, h); sh.lineTo(-d / 2, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false });
  g.rotateY(Math.PI / 2);
  g.translate(-w / 2, 0, 0);
  return g;
}

// ---------------------------------------------------------------------------
// WINDOWS AND DOORS — the Georgian face
// ---------------------------------------------------------------------------

/** A sash window: proud white frame, recessed dark glass, muntin cross. */
export function sashWindow(w = 0.9, h = 1.5): THREE.Group {
  const g = new THREE.Group();
  const frame = mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, 0.06), V.trim);
  g.add(frame);
  const glass = mesh(new THREE.BoxGeometry(w, h, 0.05), V.glass);
  glass.position.z = 0.015; g.add(glass);
  const mv = mesh(new THREE.BoxGeometry(0.05, h, 0.06), V.trim);
  mv.position.z = 0.02; g.add(mv);
  const mh = mesh(new THREE.BoxGeometry(w, 0.05, 0.06), V.trim);
  mh.position.z = 0.02; g.add(mh);
  return g;
}

/**
 * A hinged door leaf, matching the mansion's real west door: deep maroon-red,
 * six raised panels, a brass box lock. ORIGIN AT THE HINGE EDGE (x = 0 is the
 * hinge stile; the leaf extends +x), so rotating the group about Y swings it.
 */
export function doorLeaf(w = 1.1, h = 2.15): THREE.Group {
  const g = new THREE.Group();
  const maroon = 0x59262a;
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), texMat(maroon, plankTex(), { flat: false }));
  leaf.castShadow = true;
  leaf.position.set(w / 2, h / 2, 0);
  g.add(leaf);
  for (const s of [-1, 1]) {
    for (const [ry, ph] of [[0.16, 0.20], [0.46, 0.26], [0.80, 0.20]] as const) {
      for (const side of [0.045, -0.045]) {
        const p = mesh(new THREE.BoxGeometry(w * 0.33, h * ph, 0.025), 0x47191d);
        p.position.set(w / 2 + s * w * 0.21, h * ry + h * ph / 2, side);
        g.add(p);
      }
    }
  }
  const lock = mesh(new THREE.BoxGeometry(0.13, 0.17, 0.09), 0x8a6f2e);
  lock.position.set(w - 0.12, h * 0.44, 0);
  g.add(lock);
  return g;
}

/**
 * A panel door. With `pediment` it becomes a full Georgian frontispiece —
 * flanking pilasters, entablature, and a triangular pediment over the head,
 * after the mansion's west-door surround. `leafless` renders the surround
 * only, for doorways that get a separately-hinged animated leaf.
 */
export function panelDoor(w = 1.1, h = 2.2, pediment = false, leafless = false): THREE.Group {
  const g = new THREE.Group();
  if (leafless) {
    // a true jamb frame with a VOID opening — a separately-hinged leaf lives
    // in the gap, and a solid backing slab here would hide it
    for (const sx of [-1, 1]) {
      const jamb = mesh(new THREE.BoxGeometry(0.12, h + 0.05, 0.09), V.trim);
      jamb.position.set(sx * (w / 2 + 0.05), (h + 0.05) / 2, 0);
      g.add(jamb);
    }
    const head = mesh(new THREE.BoxGeometry(w + 0.22, 0.14, 0.09), V.trim);
    head.position.y = h + 0.07;
    g.add(head);
  } else {
    const frame = mesh(new THREE.BoxGeometry(w + 0.2, h + 0.15, 0.07), V.trim);
    frame.position.y = h / 2; g.add(frame);
    const leaf = doorLeaf(w, h);
    leaf.position.set(-w / 2, 0, 0.02);
    g.add(leaf);
  }
  if (pediment) {
    for (const sx of [-1, 1]) {
      const pil = mesh(new THREE.BoxGeometry(0.22, h + 0.25, 0.1), V.trim);
      pil.position.set(sx * (w / 2 + 0.28), (h + 0.25) / 2, 0.02);
      g.add(pil);
      const cap = mesh(new THREE.BoxGeometry(0.3, 0.1, 0.14), V.trim);
      cap.position.set(sx * (w / 2 + 0.28), h + 0.2, 0.03);
      g.add(cap);
    }
    const entab = mesh(new THREE.BoxGeometry(w + 1.05, 0.22, 0.14), V.trim);
    entab.position.set(0, h + 0.36, 0.03);
    g.add(entab);
    const ped = mesh(gableRoofGeo(w + 1.05, 0.36, 0.42), V.trim);
    ped.position.set(0, h + 0.47, 0.0);
    g.add(ped);
  }
  return g;
}

// ---------------------------------------------------------------------------
// THE BUILDING GENERATOR
// ---------------------------------------------------------------------------

export interface BuildingSpec {
  w: number; d: number;            // footprint, metres
  stories: number;                 // full stories
  storyH?: number;
  wall: number;                    // wall colour
  roof: number;                    // roof colour
  roofType: 'hip' | 'gable';
  roofH?: number;
  ridgeFrac?: number;
  windowsX: number;                // bays on the long (x) faces
  windowsZup?: boolean;            // windows on gable ends too
  door?: { face: 'n' | 's'; bay?: number; pediment?: boolean; leafless?: boolean };
  /** Cut the door void through BOTH long faces — a central passage. */
  doorThrough?: boolean;
  dormers?: number;
  chimneys?: Array<'e' | 'w' | 'c'>;
  chimneyColor?: number;
  shutters?: boolean;
  plinth?: number;                 // stone foundation height
  /** Rusticated block coursing — thin shadow lines across the long faces. */
  courses?: boolean;
  /** A cornice band under the eaves. */
  cornice?: boolean;
  /** Detail textures (low-contrast; see env/textures.ts). */
  wallTex?: THREE.Texture;
  roofTex?: THREE.Texture;
}

/** A Georgian-Virginia building. Origin at ground centre; faces ±z. */
export function building(s: BuildingSpec): THREE.Group {
  const g = new THREE.Group();
  const storyH = s.storyH ?? 2.9;
  const H = s.stories * storyH;
  const plinth = s.plinth ?? 0.35;

  if (plinth > 0) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.2, plinth, s.d + 0.2), texMat(V.stone, stoneTex()));
    p.castShadow = p.receiveShadow = true;
    p.position.y = plinth / 2; g.add(p);
  }
  const wallMat = s.wallTex ? texMat(s.wall, s.wallTex) : mat(s.wall);
  const slab = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), wallMat);
    m.castShadow = m.receiveShadow = true;
    m.position.set(cx, cy, cz);
    g.add(m);
    return m;
  };
  if (s.door?.leafless) {
    /*
     * A REAL doorway. A leafless door means a hinged leaf and a walk-through
     * interior, and both were being defeated by the shell: one solid box has
     * no hole, so the leaf hung EMBEDDED in the wall (z-fighting stripes, and
     * a door that vanished into the facade as it swung). The shell is built
     * as slabs instead, with a genuine void at the door bay — on both long
     * faces when `doorThrough` says the passage runs straight through.
     */
    const T = 0.26;                       // wall slab thickness
    const bayW2 = s.w / s.windowsX;
    const bayX = -s.w / 2 + bayW2 * ((s.door.bay ?? Math.floor(s.windowsX / 2)) + 0.5);
    const DW = 1.24, DH = 2.28;           // the void, a shade wider than the leaf
    const yMid = plinth + H / 2;
    const doored = (zc: number) => {
      slab((-s.w / 2 + (bayX - DW / 2)) / 2, yMid, zc, bayX - DW / 2 + s.w / 2, H, T);
      slab((bayX + DW / 2 + s.w / 2) / 2, yMid, zc, s.w / 2 - bayX - DW / 2, H, T);
      slab(bayX, plinth + DH + (H - DH) / 2, zc, DW, H - DH, T);
    };
    const zN = -(s.d - T) / 2, zS = (s.d - T) / 2;
    if (s.door.face === 'n') doored(zN); else slab(0, yMid, zN, s.w, H, T);
    if (s.door.face === 's' || s.doorThrough) doored(zS); else slab(0, yMid, zS, s.w, H, T);
    for (const sx of [-1, 1]) {
      slab(sx * (s.w - T) / 2, yMid, 0, T, H, s.d - T * 2);
    }
    // a lid under the roof, so the hollow shell reads solid from any hill
    slab(0, plinth + H - 0.06, 0, s.w - T, 0.12, s.d - T);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(s.w, H, s.d), wallMat);
    body.castShadow = body.receiveShadow = true;
    body.position.y = plinth + H / 2; g.add(body);
  }

  // rusticated coursing: shallow horizontal score lines, inked by the outline
  // pass — the sand-painted "stone block" read without a texture. PERIMETER
  // STRIPS, not sheets: a full-footprint box would slice through the interior.
  if (s.courses) {
    for (let y = plinth + 0.7; y < plinth + H - 0.4; y += 0.78) {
      for (const sz of [-1, 1]) {
        const line = mesh(new THREE.BoxGeometry(s.w + 0.03, 0.03, 0.05), V.cream);
        line.position.set(0, y, sz * (s.d / 2 + 0.005));
        g.add(line);
      }
      for (const sx of [-1, 1]) {
        const line = mesh(new THREE.BoxGeometry(0.05, 0.03, s.d + 0.03), V.cream);
        line.position.set(sx * (s.w / 2 + 0.005), y, 0);
        g.add(line);
      }
    }
  }
  if (s.cornice) {
    for (const [inset, h2, y] of [[0.4, 0.22, -0.06], [0.24, 0.12, -0.22]] as const) {
      for (const sz of [-1, 1]) {
        const c = mesh(new THREE.BoxGeometry(s.w + inset, h2, inset / 2), V.trim);
        c.position.set(0, plinth + H + y, sz * (s.d / 2 + inset / 4));
        g.add(c);
      }
      for (const sx of [-1, 1]) {
        const c = mesh(new THREE.BoxGeometry(inset / 2, h2, s.d + inset), V.trim);
        c.position.set(sx * (s.w / 2 + inset / 4), plinth + H + y, 0);
        g.add(c);
      }
    }
  }

  // roof
  const roofH = s.roofH ?? Math.min(2.6, s.d * 0.42);
  const roofGeo = s.roofType === 'hip'
    ? hipRoofGeo(s.w + 0.5, s.d + 0.5, roofH, s.ridgeFrac ?? 0.45)
    : gableRoofGeo(s.w + 0.3, s.d + 0.5, roofH);
  const roof = s.roofTex
    ? new THREE.Mesh(roofGeo, texMat(s.roof, s.roofTex))
    : mesh(roofGeo, s.roof);
  roof.castShadow = roof.receiveShadow = true;
  roof.position.y = plinth + H; g.add(roof);

  // windows on both long faces, every story
  const bayW = s.w / s.windowsX;
  for (let st = 0; st < s.stories; st++) {
    for (let i = 0; i < s.windowsX; i++) {
      const doorHere = s.door && st === 0 &&
        (s.door.bay ?? Math.floor(s.windowsX / 2)) === i;
      for (const face of ['n', 's'] as const) {
        const zz = (face === 's' ? 1 : -1) * (s.d / 2 + 0.04);
        const x = -s.w / 2 + bayW * (i + 0.5);
        if (doorHere && s.door!.face === face) {
          const dr = panelDoor(1.1, 2.15, s.door!.pediment, s.door!.leafless);
          dr.position.set(x, plinth, zz);
          if (face === 'n') dr.rotation.y = Math.PI;
          g.add(dr);
          continue;
        }
        const win = sashWindow(0.85, st === 0 ? 1.55 : 1.35);
        win.position.set(x, plinth + storyH * st + storyH * 0.55, zz);
        if (face === 'n') win.rotation.y = Math.PI;
        g.add(win);
        if (s.shutters) {
          for (const sx of [-1, 1]) {
            const sh = mesh(new THREE.BoxGeometry(0.34, 1.5, 0.05), V.shutter);
            sh.position.set(x + sx * 0.72, plinth + storyH * st + storyH * 0.55, zz);
            if (face === 'n') sh.rotation.y = Math.PI;
            g.add(sh);
          }
        }
      }
    }
  }

  // dormers along the south roof slope — kept inside the ridge span so the
  // end dormers never poke through a hip's corner slopes
  if (s.dormers) {
    const span = s.roofType === 'hip' ? s.w * (s.ridgeFrac ?? 0.45) + s.w * 0.18 : s.w;
    for (let i = 0; i < s.dormers; i++) {
      const x = -span / 2 + (span / s.dormers) * (i + 0.5);
      const dm = new THREE.Group();
      const box = mesh(new THREE.BoxGeometry(0.9, 1.0, 1.0), s.wall);
      box.position.y = 0.5; dm.add(box);
      const dr = mesh(gableRoofGeo(1.0, 1.1, 0.45), s.roof);
      dr.position.y = 1.0; dm.add(dr);
      const wn = sashWindow(0.5, 0.7);
      wn.position.set(0, 0.55, 0.53); dm.add(wn);
      dm.position.set(x, plinth + H + roofH * 0.28, s.d * 0.22);
      g.add(dm);
    }
  }

  // chimneys, through the ridge — brick unless told otherwise. In a
  // multi-storey building the stack runs down to the top floor, so the
  // chimney breast meets the room inside instead of hovering at its ceiling.
  for (const c of s.chimneys ?? []) {
    const x = c === 'c' ? 0 : (c === 'e' ? 1 : -1) * (s.w / 2 - 0.5);
    const cc = s.chimneyColor ?? V.brick;
    const cTex = cc === V.stone ? stoneTex() : brickTex();
    const chTop = plinth + H + roofH + 1.3;
    const chBottom = s.stories > 1 ? plinth + (s.stories - 1) * storyH + 0.15 : plinth + H - 0.3;
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.9, chTop - chBottom, 1.3), texMat(cc, cTex));
    ch.castShadow = true;
    ch.position.set(x, (chTop + chBottom) / 2, 0);
    g.add(ch);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 1.5), texMat(cc, cTex));
    cap.position.set(x, plinth + H + roofH + 1.35, 0);
    g.add(cap);
  }
  return g;
}

// ---------------------------------------------------------------------------
// CONSTRUCTION — the 1775 story: he leaves mid-build
// ---------------------------------------------------------------------------

/** Scaffolding bay against a wall: poles, ledgers, planks, a ladder. */
export function scaffolding(w = 4, h = 6): THREE.Group {
  const g = new THREE.Group();
  const levels = Math.max(2, Math.round(h / 2.2));
  for (const x of [-w / 2, w / 2]) for (const z of [0, 1.2]) {
    const pole = mesh(new THREE.CylinderGeometry(0.06, 0.07, h, 5), V.postWood);
    pole.position.set(x, h / 2, z); g.add(pole);
  }
  for (let l = 1; l <= levels; l++) {
    const y = (h / (levels + 0.3)) * l;
    for (const z of [0, 1.2]) {
      const ledger = mesh(new THREE.CylinderGeometry(0.045, 0.045, w, 4), V.railWood);
      ledger.rotation.z = Math.PI / 2; ledger.position.set(0, y, z); g.add(ledger);
    }
    const plank = mesh(new THREE.BoxGeometry(w, 0.06, 0.9), V.railWood);
    plank.position.set(0, y + 0.05, 0.6); g.add(plank);
  }
  const ladder = new THREE.Group();
  for (const sx of [-0.25, 0.25]) {
    const rail = mesh(new THREE.CylinderGeometry(0.04, 0.04, h + 1, 4), V.postWood);
    rail.position.x = sx; ladder.add(rail);
  }
  for (let i = 0; i < 8; i++) {
    const rung = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4), V.railWood);
    rung.rotation.z = Math.PI / 2; rung.position.y = -h / 2 + 0.6 + i * (h / 8); ladder.add(rung);
  }
  ladder.position.set(w / 2 + 0.5, h / 2, 0.8); ladder.rotation.x = -0.22; g.add(ladder);
  return g;
}

/** A sawpit-and-lumber corner: stacked planks, sawhorses, a barrel of nails. */
export function lumberYard(): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const plank = mesh(new THREE.BoxGeometry(3.4, 0.09, 0.4), V.railWood);
    plank.position.set((i % 2) * 0.1, 0.1 + i * 0.1, (i % 2) * 0.15);
    plank.rotation.y = (i % 2) * 0.08; g.add(plank);
  }
  for (const dz of [-0.8, 0.8]) {
    const legs = mesh(gableRoofGeo(0.9, 0.7, 0.8), V.postWood);
    legs.position.set(1.2, 0, dz + 1.6); g.add(legs);
  }
  const beam = mesh(new THREE.BoxGeometry(0.25, 0.25, 2.6), V.railWood);
  beam.position.set(1.2, 0.85, 1.6); g.add(beam);
  return g;
}

// ---------------------------------------------------------------------------
// FENCES, LANES, GARDENS
// ---------------------------------------------------------------------------

/** Virginia worm (snake) fence between two points: zigzag stacked rails. */
export function wormFence(from: THREE.Vector2, to: THREE.Vector2, ground: (x: number, z: number) => number): THREE.Group {
  const g = new THREE.Group();
  const dir = new THREE.Vector2().subVectors(to, from);
  const len = dir.length(); dir.normalize();
  const normal = new THREE.Vector2(-dir.y, dir.x);
  const seg = 2.6;
  const n = Math.max(1, Math.round(len / seg));
  let prev = from.clone().addScaledVector(normal, 0.5);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const side = i % 2 === 0 ? 0.5 : -0.5;
    const next = new THREE.Vector2(from.x + dir.x * len * t, from.y + dir.y * len * t)
      .addScaledVector(normal, side);
    const mid = prev.clone().add(next).multiplyScalar(0.5);
    const segLen = prev.distanceTo(next);
    const ang = Math.atan2(next.y - prev.y, next.x - prev.x);
    for (let r = 0; r < 4; r++) {
      const rail = mesh(new THREE.CylinderGeometry(0.055, 0.055, segLen, 4), r % 2 ? V.railWood : V.postWood);
      rail.rotation.z = Math.PI / 2;
      rail.rotation.y = -ang;
      rail.position.set(mid.x, ground(mid.x, mid.y) + 0.18 + r * 0.24, mid.y);
      g.add(rail);
    }
    prev = next;
  }
  return g;
}

/** White paling (picket) fence between two points — for the gardens. */
export function palingFence(from: THREE.Vector2, to: THREE.Vector2, ground: (x: number, z: number) => number): THREE.Group {
  const g = new THREE.Group();
  const dir = new THREE.Vector2().subVectors(to, from);
  const len = dir.length(); dir.normalize();
  const n = Math.floor(len / 0.36);
  for (let i = 0; i <= n; i++) {
    const x = from.x + dir.x * i * 0.36, z = from.y + dir.y * i * 0.36;
    const p = mesh(new THREE.BoxGeometry(0.09, 1.1, 0.04), V.trim);
    p.position.set(x, ground(x, z) + 0.55, z);
    p.rotation.y = Math.atan2(dir.y, dir.x);
    g.add(p);
  }
  for (const hh of [0.35, 0.85]) {
    const rail = mesh(new THREE.BoxGeometry(len, 0.07, 0.04), V.trim);
    const mid = from.clone().add(to).multiplyScalar(0.5);
    rail.position.set(mid.x, ground(mid.x, mid.y) + hh, mid.y);
    rail.rotation.y = -Math.atan2(dir.y, dir.x);
    g.add(rail);
  }
  return g;
}

/** A kitchen-garden plot: raised beds in rows inside a rectangle. */
export function gardenBeds(w: number, d: number): THREE.Group {
  const g = new THREE.Group();
  const rows = Math.floor(d / 1.4);
  for (let r = 0; r < rows; r++) {
    const soil = mesh(new THREE.BoxGeometry(w - 1, 0.22, 0.85), V.soil);
    soil.position.set(0, 0.11, -d / 2 + 1 + r * 1.4); g.add(soil);
    const crop = mesh(new THREE.BoxGeometry(w - 1.3, 0.16, 0.55), V.bed);
    crop.position.set(0, 0.28, -d / 2 + 1 + r * 1.4); g.add(crop);
  }
  return g;
}

/** An orchard fruit tree — smaller and rounder than the forest trees. */
export function fruitTree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.4, 5), V.postWood);
  trunk.position.y = 0.7; g.add(trunk);
  const crown = mesh(new THREE.IcosahedronGeometry(1.15, 0), 0x7fa348);
  crown.position.y = 2.0; crown.scale.y = 0.9; g.add(crown);
  return g;
}

// ---------------------------------------------------------------------------
// LIVESTOCK — the lawn is a farm
// ---------------------------------------------------------------------------

export function sheep(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.IcosahedronGeometry(0.42, 0), V.sheepWool);
  body.position.y = 0.55; body.scale.set(1.25, 0.95, 0.85); g.add(body);
  const head = mesh(new THREE.BoxGeometry(0.2, 0.24, 0.3), V.sheepFace);
  head.position.set(0.55, 0.62, 0); g.add(head);
  for (const [lx, lz] of [[0.3, 0.18], [0.3, -0.18], [-0.3, 0.18], [-0.3, -0.18]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 4), V.sheepFace);
    leg.position.set(lx, 0.18, lz); g.add(leg);
  }
  return g;
}

export function cow(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(1.5, 0.85, 0.7), V.cow);
  body.position.y = 0.95; g.add(body);
  const head = mesh(new THREE.BoxGeometry(0.42, 0.4, 0.34), V.cow);
  head.position.set(0.95, 1.15, 0); g.add(head);
  for (const s of [-1, 1]) {
    const horn = mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 4), V.cowPatch);
    horn.rotation.z = s * 1.2; horn.position.set(0.95, 1.42, s * 0.18); g.add(horn);
  }
  for (const [lx, lz] of [[0.55, 0.25], [0.55, -0.25], [-0.55, 0.25], [-0.55, -0.25]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 4), V.cow);
    leg.position.set(lx, 0.28, lz); g.add(leg);
  }
  return g;
}

export function horse(color: number = V.horse): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(1.5, 0.7, 0.55), color);
  body.position.y = 1.15; g.add(body);
  const neck = mesh(new THREE.BoxGeometry(0.6, 0.28, 0.3), color);
  neck.position.set(0.72, 1.6, 0); neck.rotation.z = 0.7; g.add(neck);
  const head = mesh(new THREE.BoxGeometry(0.5, 0.22, 0.24), color);
  head.position.set(1.05, 1.86, 0); head.rotation.z = 0.25; g.add(head);
  const tail = mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.8, 5), 0x2e2018);
  tail.position.set(-0.8, 0.95, 0); tail.rotation.z = 0.5; g.add(tail);
  for (const [lx, lz] of [[0.55, 0.18], [0.55, -0.18], [-0.55, 0.18], [-0.55, -0.18]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.8, 4), color);
    leg.position.set(lx, 0.4, lz); g.add(leg);
  }
  return g;
}

export function chicken(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.IcosahedronGeometry(0.14, 0), 0xd8cdb6);
  body.position.y = 0.18; body.scale.set(1.2, 1, 0.9); g.add(body);
  const head = mesh(new THREE.SphereGeometry(0.07, 5, 4), 0xd8cdb6);
  head.position.set(0.14, 0.34, 0); g.add(head);
  const comb = mesh(new THREE.BoxGeometry(0.05, 0.06, 0.02), 0xa83a2a);
  comb.position.set(0.14, 0.42, 0); g.add(comb);
  return g;
}

// ---------------------------------------------------------------------------
// LIFE — smoke, birds, laundry, hay
// ---------------------------------------------------------------------------

/** Drifting chimney smoke. Returns the group and its animator. */
export function smokeColumn(strength = 1): { group: THREE.Group; animate: Animated } {
  // Opaque-ish drawn puffs, on purpose: the outline pass inks them, so they
  // read as toon clouds rather than translucent haze. Occlusion stays correct
  // because they live in the main scene.
  const g = new THREE.Group();
  const puffs: THREE.Mesh[] = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    // near-opaque, so against a bright sky the puff reads as a drawn cloud
    // rather than an outlined bubble
    const p = mesh(new THREE.IcosahedronGeometry(0.4, 0), V.smoke, false);
    const m = p.material as THREE.MeshToonMaterial;
    m.transparent = true; m.opacity = 0.96; m.fog = true;
    puffs.push(p); g.add(p);
  }
  const animate: Animated = (t) => {
    for (let i = 0; i < n; i++) {
      const ph = ((t * 0.26 * strength) + i / n) % 1;
      const p = puffs[i];
      p.position.set(
        ph * 2.6 + Math.sin(t * 0.8 + i) * 0.18,
        ph * 4.6,
        Math.cos(t * 0.6 + i * 2) * 0.25,
      );
      const s = 0.7 + ph * 2.0;
      p.scale.setScalar(s);
      (p.material as THREE.MeshToonMaterial).opacity = 0.96 * (1 - ph * 0.7);
    }
  };
  return { group: g, animate };
}

/** A slow wheel of birds high over a point. */
export function birds(count = 7, radius = 14, height = 26): { group: THREE.Group; animate: Animated } {
  const g = new THREE.Group();
  const each: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const b = new THREE.Mesh(
      gableRoofGeo(0.55, 0.16, 0.1),
      mat(0x2a241c),
    );
    each.push(b); g.add(b);
  }
  const animate: Animated = (t) => {
    for (let i = 0; i < count; i++) {
      const a = t * 0.14 + (i / count) * Math.PI * 2;
      const r = radius * (0.8 + 0.2 * Math.sin(t * 0.3 + i));
      each[i].position.set(Math.cos(a) * r, height + Math.sin(t * 0.7 + i) * 1.6, Math.sin(a) * r);
      each[i].rotation.y = -a;
      each[i].rotation.z = Math.sin(t * 6 + i * 2) * 0.35; // wingbeat
    }
  };
  return { group: g, animate };
}

/** A laundry line between two posts, linens swaying. */
export function laundryLine(len = 6): { group: THREE.Group; animate: Animated } {
  const g = new THREE.Group();
  for (const sx of [-len / 2, len / 2]) {
    const post = mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.9, 5), V.postWood);
    post.position.set(sx, 0.95, 0); g.add(post);
  }
  const line = mesh(new THREE.CylinderGeometry(0.015, 0.015, len, 3), 0x9c8b63);
  line.rotation.z = Math.PI / 2; line.position.y = 1.78; g.add(line);
  const sheets: THREE.Mesh[] = [];
  let x = -len / 2 + 0.9;
  while (x < len / 2 - 0.6) {
    const w = 0.7 + Math.random() * 0.5;
    const sheet = mesh(new THREE.PlaneGeometry(w, 1.1, 1, 3), V.linen, false);
    (sheet.material as THREE.MeshToonMaterial).side = THREE.DoubleSide;
    sheet.position.set(x + w / 2, 1.2, 0);
    sheets.push(sheet); g.add(sheet);
    x += w + 0.35;
  }
  const animate: Animated = (t) => {
    for (let i = 0; i < sheets.length; i++) {
      sheets[i].rotation.x = Math.sin(t * 1.3 + i * 1.7) * 0.18;
    }
  };
  return { group: g, animate };
}

export function haystack(): THREE.Group {
  const g = new THREE.Group();
  const s = mesh(new THREE.ConeGeometry(1.1, 1.9, 7), V.hay);
  s.position.y = 0.95; g.add(s);
  const pole = mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 4), V.postWood);
  pole.position.y = 1.15; g.add(pole);
  return g;
}

// ---------------------------------------------------------------------------
// PEOPLE AT WORK — pose variants over the soldier figure's anatomy
// ---------------------------------------------------------------------------

export interface PersonSpec {
  dress: 'coat' | 'shirt' | 'gown';
  color: number;
  skin?: number;
  pose?: 'stand' | 'hoe' | 'carry' | 'bend';
  hat?: 'tricorne' | 'straw' | 'cap' | 'none';
  /** A musket shouldered on the left. */
  musket?: boolean;
  /** Distinguishes idle phases so a crowd never moves in unison. */
  seed?: number;
}

/**
 * An articulated figure. Real proportions (~1.72 m, shoulders at 1.42), a
 * jointed skeleton of pivot groups — torso, head, shoulder/elbow, hip/knee —
 * and a per-frame animator: breath, weight shift, a wandering gaze, and a
 * working cycle for the hoe. Capsule limbs, smooth-shaded, so the outline
 * pass draws a clean human contour instead of a stack of boxes.
 */
export function person(p: PersonSpec): { group: THREE.Group; animate: Animated } {
  const g = new THREE.Group();
  const skin = p.skin ?? 0xc0906a;
  const stocking = 0xd8d0b8;
  const phase = (p.seed ?? 0) * 1.7 + (p.color % 97) * 0.13;

  const smoothMesh = (geo: THREE.BufferGeometry, color: number) => {
    const m = new THREE.Mesh(geo, mat(color, { flat: false }));
    m.castShadow = true;
    return m;
  };
  /** A limb segment hanging from its pivot: capsule of `len`, pivot at the top. */
  const limb = (r: number, len: number, color: number): THREE.Mesh => {
    const m = smoothMesh(new THREE.CapsuleGeometry(r, len, 3, 8), color);
    m.position.y = -len / 2;
    return m;
  };

  // ---- pelvis and legs ----
  const hipsY = 0.92;
  const hips = new THREE.Group();
  hips.position.y = hipsY;
  g.add(hips);

  const knees: THREE.Group[] = [];
  if (p.dress !== 'gown') {
    for (const sx of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(sx * 0.10, 0, 0);
      const thigh = limb(0.075, 0.32, 0x8a7350); // breeches
      hip.add(thigh);
      const knee = new THREE.Group();
      knee.position.y = -0.44;
      const calf = limb(0.055, 0.30, stocking);  // stockings
      knee.add(calf);
      const shoe = smoothMesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), 0x241c14);
      shoe.position.set(0, -0.445, 0.05);
      knee.add(shoe);
      hip.add(knee);
      hips.add(hip);
      knees.push(hip);
    }
  }

  // ---- torso (a pivot, so bending is a joint not a lean) ----
  const torso = new THREE.Group();
  hips.add(torso);
  if (p.dress === 'gown') {
    const skirt = smoothMesh(new THREE.CylinderGeometry(0.155, 0.40, hipsY + 0.12, 10), p.color);
    skirt.position.y = -(hipsY + 0.12) / 2 + 0.06;
    hips.add(skirt);
    const bodice = smoothMesh(new THREE.CapsuleGeometry(0.145, 0.28, 3, 10), p.color);
    bodice.position.y = 0.28; bodice.scale.z = 0.8;
    torso.add(bodice);
    const apron = smoothMesh(new THREE.BoxGeometry(0.26, 0.5, 0.03), V.linen);
    apron.position.set(0, -0.28, 0.17);
    hips.add(apron);
    const kerchief = smoothMesh(new THREE.ConeGeometry(0.16, 0.16, 8), V.linen);
    kerchief.position.y = 0.42; torso.add(kerchief);
  } else {
    const chest = smoothMesh(new THREE.CapsuleGeometry(0.155, 0.30, 3, 10), p.color);
    chest.position.y = 0.28; chest.scale.z = 0.78;
    torso.add(chest);
    if (p.dress === 'coat') {
      const skirtC = smoothMesh(new THREE.CylinderGeometry(0.17, 0.26, 0.34, 10), p.color);
      skirtC.position.y = -0.04;
      torso.add(skirtC);
      const waistcoat = smoothMesh(new THREE.BoxGeometry(0.16, 0.3, 0.05), V.cream);
      waistcoat.position.set(0, 0.22, 0.14);
      torso.add(waistcoat);
    }
  }

  // ---- arms: shoulder → elbow chains ----
  const shoulderY = 0.50;
  const shoulders: THREE.Group[] = [];
  const elbows: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(sx * 0.20, shoulderY, 0);
    const upper = limb(0.055, 0.24, p.color);
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.31;
    const fore = limb(0.045, 0.22, p.dress === 'shirt' ? V.linen : p.color);
    elbow.add(fore);
    const hand = smoothMesh(new THREE.SphereGeometry(0.05, 6, 5), skin);
    hand.position.y = -0.31;
    elbow.add(hand);
    shoulder.add(elbow);
    torso.add(shoulder);
    shoulders.push(shoulder);
    elbows.push(elbow);
  }

  // ---- head on a neck pivot ----
  const neck = new THREE.Group();
  neck.position.y = shoulderY + 0.16;
  torso.add(neck);
  const headG = new THREE.Group();
  neck.add(headG);
  const head = smoothMesh(new THREE.SphereGeometry(0.105, 10, 8), skin);
  head.position.y = 0.09; head.scale.y = 1.15;
  headG.add(head);
  const nose = smoothMesh(new THREE.ConeGeometry(0.02, 0.05, 5), skin);
  nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.09, 0.105);
  headG.add(nose);
  const hairC = 0x4a3826;
  const hair = smoothMesh(new THREE.SphereGeometry(0.108, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hairC);
  hair.position.y = 0.10; hair.scale.y = 1.12;
  headG.add(hair);

  if (p.hat === 'tricorne') {
    const brim = smoothMesh(new THREE.CylinderGeometry(0.19, 0.19, 0.025, 3), 0x211a12);
    brim.position.y = 0.20; brim.rotation.y = Math.PI / 6;
    headG.add(brim);
    const crown = smoothMesh(new THREE.SphereGeometry(0.09, 8, 6), 0x211a12);
    crown.position.y = 0.19; crown.scale.y = 0.7;
    headG.add(crown);
  } else if (p.hat === 'straw') {
    const brim = smoothMesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 10), V.hay);
    brim.position.y = 0.185;
    headG.add(brim);
    const crown = smoothMesh(new THREE.CylinderGeometry(0.1, 0.11, 0.08, 10), V.hay);
    crown.position.y = 0.22;
    headG.add(crown);
  } else if (p.hat === 'cap') {
    const cap = smoothMesh(new THREE.SphereGeometry(0.115, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), V.linen);
    cap.position.y = 0.13;
    headG.add(cap);
  }

  // ---- a shouldered musket ----
  if (p.musket) {
    const mus = new THREE.Group();
    const barrel = smoothMesh(new THREE.CylinderGeometry(0.018, 0.02, 1.35, 5), 0x3c3a37);
    barrel.position.y = 0.3; mus.add(barrel);
    const stock = smoothMesh(new THREE.BoxGeometry(0.05, 0.5, 0.045), 0x4a3320);
    stock.position.y = -0.35; mus.add(stock);
    mus.position.set(-0.26, shoulderY + 0.18, -0.06);
    mus.rotation.x = 0.1; mus.rotation.z = 0.08;
    torso.add(mus);
  }

  // ---- pose the joints ----
  const pose = p.pose ?? 'stand';
  let tool: THREE.Group | null = null;
  if (pose === 'stand') {
    shoulders[0].rotation.z = 0.10; shoulders[1].rotation.z = -0.10;
    elbows[0].rotation.x = -0.25; elbows[1].rotation.x = -0.25;
  } else if (pose === 'carry') {
    for (const s of shoulders) s.rotation.x = -0.5;
    for (const e of elbows) e.rotation.x = -1.0;
    const basket = new THREE.Group();
    const b = smoothMesh(new THREE.CylinderGeometry(0.19, 0.14, 0.2, 8), V.hay);
    basket.add(b);
    basket.position.set(0, 0.12, 0.34);
    torso.add(basket);
  } else if (pose === 'bend') {
    torso.rotation.x = 0.85;
    neck.rotation.x = -0.4;
    for (const s of shoulders) s.rotation.x = -0.5;
  } else if (pose === 'hoe') {
    torso.rotation.x = 0.35;
    shoulders[0].rotation.x = -0.9; shoulders[1].rotation.x = -0.9;
    shoulders[0].rotation.z = 0.15; shoulders[1].rotation.z = -0.15;
    elbows[0].rotation.x = -0.4; elbows[1].rotation.x = -0.4;
    tool = new THREE.Group();
    const shaft = smoothMesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 5), V.postWood);
    shaft.rotation.x = 0.9; shaft.position.set(0, -0.3, 0.45);
    tool.add(shaft);
    const blade = smoothMesh(new THREE.BoxGeometry(0.13, 0.13, 0.025), 0x3c3a37);
    blade.position.set(0, -0.95, 0.95);
    tool.add(blade);
    tool.position.y = shoulderY;
    torso.add(tool);
  }

  // ---- life: breath, weight, gaze, and the work cycle ----
  const baseTorsoX = torso.rotation.x;
  const animate: Animated = (t) => {
    const bt = t + phase * 10;
    // breath
    torso.position.y = Math.sin(bt * 1.9) * 0.008;
    // weight shift
    g.rotation.z = Math.sin(bt * 0.43) * 0.015;
    hips.position.x = Math.sin(bt * 0.43) * 0.012;
    if (pose === 'stand' || pose === 'carry') {
      // a gaze that wanders like a person's, not a metronome's
      headG.rotation.y = Math.sin(bt * 0.31) * 0.55 + Math.sin(bt * 0.11) * 0.25;
      headG.rotation.x = Math.sin(bt * 0.23) * 0.06;
      shoulders[0].rotation.x = (pose === 'carry' ? -0.5 : 0) + Math.sin(bt * 1.9) * 0.02;
    } else if (pose === 'hoe') {
      const swing = Math.sin(bt * 2.3);
      torso.rotation.x = baseTorsoX + 0.22 + swing * 0.2;
      shoulders[0].rotation.x = -0.9 - swing * 0.35;
      shoulders[1].rotation.x = -0.9 - swing * 0.35;
      if (tool) tool.rotation.x = -swing * 0.28;
    } else if (pose === 'bend') {
      torso.rotation.x = baseTorsoX + Math.sin(bt * 1.1) * 0.07;
    }
    void knees;
  };

  return { group: g, animate };
}

/**
 * A travelling chariot — the closed carriage Washington actually left in on
 * 4 May 1775. Body slung between four wheels, a pair of horses in the traces.
 */
export function chariot(): THREE.Group {
  const g = new THREE.Group();
  const bodyC = 0x2a3428; // dark green coach body
  const body = mesh(new THREE.BoxGeometry(2.2, 1.5, 1.4), bodyC);
  body.position.y = 1.35; g.add(body);
  const roof = mesh(new THREE.BoxGeometry(2.3, 0.12, 1.5), 0x1c2018);
  roof.position.y = 2.15; g.add(roof);
  const win = mesh(new THREE.BoxGeometry(0.7, 0.6, 0.05), V.glass);
  win.position.set(0.3, 1.5, 0.71); g.add(win);
  const seat = mesh(new THREE.BoxGeometry(0.8, 0.3, 1.1), 0x1c2018);
  seat.position.set(1.5, 1.35, 0); g.add(seat);
  const wheel = (x: number, r: number) => {
    const w = new THREE.Group();
    w.add(mesh(new THREE.TorusGeometry(r, 0.055, 5, 12), 0x3a2c1c));
    for (let i = 0; i < 6; i++) {
      const sp = mesh(new THREE.CylinderGeometry(0.028, 0.028, r * 2, 4), V.postWood);
      sp.rotation.z = (i / 6) * Math.PI; w.add(sp);
    }
    w.rotation.y = Math.PI / 2; w.position.set(x, r, 0.78);
    const w2 = w.clone(); w2.position.z = -0.78;
    g.add(w, w2);
  };
  wheel(-0.7, 0.72); wheel(0.9, 0.55);
  // shafts and the pair
  for (const sz of [-0.35, 0.35]) {
    const shaft = mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 4), V.postWood);
    shaft.rotation.x = Math.PI / 2; shaft.position.set(1.6, 0.9, sz); g.add(shaft);
  }
  const h1 = horse(0x3d2c1e); h1.position.set(3.4, 0, 0.45); g.add(h1);
  const h2 = horse(0x50381f); h2.position.set(3.4, 0, -0.45); g.add(h2);
  return g;
}

// ---------------------------------------------------------------------------
// THE RIVER LIFE — wharf and a sloop
// ---------------------------------------------------------------------------

export function wharf(len = 12): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < len / 1.5; i++) {
    const deck = mesh(new THREE.BoxGeometry(2.4, 0.18, 1.45), V.postWood);
    deck.position.set(0, 0.55, i * 1.5); g.add(deck);
    for (const sx of [-1, 1]) {
      const pile = mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.6, 5), 0x4a3826);
      pile.position.set(sx * 1.0, -0.2, i * 1.5); g.add(pile);
    }
  }
  return g;
}

/** A small river sloop with one gaff sail, anchored or at the wharf. */
export function sloop(): { group: THREE.Group; animate: Animated } {
  const g = new THREE.Group();
  // hull — a stretched, pinched box with a raised bow
  const hull = mesh(new THREE.CylinderGeometry(0.9, 0.55, 7, 6), 0x4a3a28);
  hull.rotation.z = Math.PI / 2; hull.scale.y = 0.45; hull.position.y = 0.3; g.add(hull);
  const deck = mesh(new THREE.BoxGeometry(6.4, 0.12, 1.5), V.railWood);
  deck.position.y = 0.72; g.add(deck);
  const mast = mesh(new THREE.CylinderGeometry(0.08, 0.1, 7.5, 6), V.postWood);
  mast.position.set(0.8, 4.2, 0); g.add(mast);
  const boom = mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.6, 5), V.postWood);
  boom.rotation.z = Math.PI / 2; boom.position.set(-1.5, 1.8, 0); g.add(boom);
  // at anchor the sail rides FURLED on the boom — a loose bundle, not a wall
  const furl = mesh(new THREE.CylinderGeometry(0.22, 0.16, 4.4, 6), V.linen, false);
  furl.rotation.z = Math.PI / 2; furl.position.set(-1.5, 2.02, 0); g.add(furl);
  const gaff = mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 5), V.postWood);
  gaff.rotation.z = Math.PI / 2 - 0.35; gaff.position.set(-1.2, 2.6, 0); g.add(gaff);
  const animate: Animated = (t) => {
    g.rotation.z = Math.sin(t * 0.5) * 0.015;
    g.rotation.x = Math.sin(t * 0.7) * 0.01;
    g.position.y += 0; // bobbing handled by caller offset if wanted
  };
  return { group: g, animate };
}
