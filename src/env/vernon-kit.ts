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
import { mat } from '../fp/kit';

export type Animated = (t: number, dt: number) => void;

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

/** A panel door, optionally with a small triangular pediment. */
export function panelDoor(w = 1.1, h = 2.2, pediment = false): THREE.Group {
  const g = new THREE.Group();
  const frame = mesh(new THREE.BoxGeometry(w + 0.2, h + 0.15, 0.07), V.trim);
  frame.position.y = h / 2; g.add(frame);
  const door = mesh(new THREE.BoxGeometry(w, h, 0.06), V.door);
  door.position.set(0, h / 2, 0.02); g.add(door);
  if (pediment) {
    const p = mesh(gableRoofGeo(w + 0.5, 0.3, 0.35), V.trim);
    p.position.y = h + 0.12; g.add(p);
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
  door?: { face: 'n' | 's'; bay?: number; pediment?: boolean };
  dormers?: number;
  chimneys?: Array<'e' | 'w' | 'c'>;
  chimneyColor?: number;
  shutters?: boolean;
  plinth?: number;                 // stone foundation height
}

/** A Georgian-Virginia building. Origin at ground centre; faces ±z. */
export function building(s: BuildingSpec): THREE.Group {
  const g = new THREE.Group();
  const storyH = s.storyH ?? 2.9;
  const H = s.stories * storyH;
  const plinth = s.plinth ?? 0.35;

  if (plinth > 0) {
    const p = mesh(new THREE.BoxGeometry(s.w + 0.2, plinth, s.d + 0.2), V.stone);
    p.position.y = plinth / 2; g.add(p);
  }
  const body = mesh(new THREE.BoxGeometry(s.w, H, s.d), s.wall);
  body.position.y = plinth + H / 2; g.add(body);

  // roof
  const roofH = s.roofH ?? Math.min(2.6, s.d * 0.42);
  const roofGeo = s.roofType === 'hip'
    ? hipRoofGeo(s.w + 0.5, s.d + 0.5, roofH, s.ridgeFrac ?? 0.45)
    : gableRoofGeo(s.w + 0.3, s.d + 0.5, roofH);
  const roof = mesh(roofGeo, s.roof);
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
          const dr = panelDoor(1.1, 2.15, s.door!.pediment);
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

  // chimneys, through the ridge
  for (const c of s.chimneys ?? []) {
    const x = c === 'c' ? 0 : (c === 'e' ? 1 : -1) * (s.w / 2 - 0.5);
    const ch = mesh(new THREE.BoxGeometry(0.9, roofH + 1.6, 1.3), s.chimneyColor ?? V.brick);
    ch.position.set(x, plinth + H + (roofH + 1.6) / 2 - 0.3, 0);
    g.add(ch);
    const cap = mesh(new THREE.BoxGeometry(1.1, 0.22, 1.5), s.chimneyColor ?? V.brick);
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
    const p = mesh(new THREE.IcosahedronGeometry(0.4, 0), V.smoke, false);
    const m = p.material as THREE.MeshToonMaterial;
    m.transparent = true; m.opacity = 0.85; m.fog = true;
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
      (p.material as THREE.MeshToonMaterial).opacity = 0.85 * (1 - ph * 0.8);
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
}

/** A civilian figure. Same scale as the soldier; different clothes and work. */
export function person(p: PersonSpec): THREE.Group {
  const g = new THREE.Group();
  const skin = p.skin ?? 0xc0906a;
  const bend = p.pose === 'bend' || p.pose === 'hoe';

  if (p.dress === 'gown') {
    const skirt = mesh(new THREE.CylinderGeometry(0.16, 0.42, 1.05, 8), p.color);
    skirt.position.y = 0.55; g.add(skirt);
    const bodice = mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.5, 8), p.color);
    bodice.position.y = 1.28; g.add(bodice);
    const apron = mesh(new THREE.BoxGeometry(0.3, 0.7, 0.04), V.linen);
    apron.position.set(0, 0.85, 0.2); g.add(apron);
  } else {
    for (const sx of [-1, 1]) {
      const leg = mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.85, 6), 0x8a7350);
      leg.position.set(sx * 0.11, 0.45, 0); g.add(leg);
    }
    const shirtC = p.dress === 'shirt' ? p.color : p.color;
    const torso = mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.62, 8), shirtC);
    torso.position.y = 1.18;
    if (bend) { torso.rotation.x = 0.5; torso.position.z = 0.12; torso.position.y = 1.08; }
    g.add(torso);
  }

  // arms
  for (const sx of [-1, 1]) {
    const arm = mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.6, 5), p.color);
    if (p.pose === 'hoe') {
      arm.position.set(sx * 0.2, 1.06, 0.3); arm.rotation.x = -1.0;
    } else if (p.pose === 'carry') {
      arm.position.set(sx * 0.26, 1.06, 0.18); arm.rotation.x = -0.7;
    } else if (p.pose === 'bend') {
      arm.position.set(sx * 0.24, 1.0, 0.28); arm.rotation.x = -0.9;
    } else {
      arm.position.set(sx * 0.27, 1.12, 0); arm.rotation.z = sx * 0.15;
    }
    g.add(arm);
  }

  // head
  const headY = bend && p.dress !== 'gown' ? 1.52 : 1.62;
  const headZ = bend && p.dress !== 'gown' ? 0.24 : 0;
  const head = mesh(new THREE.SphereGeometry(0.15, 8, 7), skin);
  head.position.set(0, headY, headZ); head.scale.y = 1.1; g.add(head);

  // hats
  if (p.hat === 'tricorne') {
    const brim = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 3), 0x211a12);
    brim.position.set(0, headY + 0.12, headZ); brim.rotation.y = Math.PI / 6; g.add(brim);
  } else if (p.hat === 'straw') {
    const brim = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8), V.hay);
    brim.position.set(0, headY + 0.1, headZ); g.add(brim);
    const crown = mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.1, 8), V.hay);
    crown.position.set(0, headY + 0.17, headZ); g.add(crown);
  } else if (p.hat === 'cap') {
    const cap = mesh(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), V.linen);
    cap.position.set(0, headY + 0.05, headZ); g.add(cap);
  }

  // tools
  if (p.pose === 'hoe') {
    const shaft = mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.7, 4), V.postWood);
    shaft.position.set(0.1, 1.0, 0.5); shaft.rotation.x = 0.55; g.add(shaft);
    const blade = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.03), 0x3c3a37);
    blade.position.set(0.1, 0.28, 0.95); g.add(blade);
  } else if (p.pose === 'carry') {
    const basket = mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.26, 7), V.hay);
    basket.position.set(0, 1.05, 0.4); g.add(basket);
  }
  return g;
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
  const sail = mesh(new THREE.PlaneGeometry(4.2, 4.6, 1, 1), V.linen, false);
  (sail.material as THREE.MeshToonMaterial).side = THREE.DoubleSide;
  sail.position.set(-1.4, 4.2, 0); g.add(sail);
  const animate: Animated = (t) => {
    g.rotation.z = Math.sin(t * 0.5) * 0.015;
    g.rotation.x = Math.sin(t * 0.7) * 0.01;
    g.position.y += 0; // bobbing handled by caller offset if wanted
  };
  return { group: g, animate };
}
