/**
 * The mansion's interior, May 1775 — two floors and the stair between them.
 *
 * Built in WORLD coordinates (the shell is rotated 90°, so the house's long
 * axis runs along z): footprint x ∈ [−4.75, 4.75], z ∈ [−11, +11], west wall
 * at −x with the front door at z ≈ 3.14. Everything the player can collide
 * with is registered as an axis-aligned box; everything they can stand on is
 * answered by `heightAt`, which knows both floors and the stair ramp and picks
 * by the player's current foot height.
 *
 * The plan is a simplification of the 1775 house, not a survey: a central
 * passage from the west door to an east door, parlor and dining room to the
 * north, and to the south the NEW WING — Washington's study below and the
 * bedchamber above — which in May 1775 stood structurally complete and
 * unfinished inside. Its far rooms are bare studs, loose planks and tools,
 * which is the whole Act 1 theme standing inside the house.
 */

import * as THREE from 'three';
import { mat } from '../fp/kit';
import { V } from './vernon-kit';

// Footprint, in world coordinates.
const X0 = -4.75, X1 = 4.75;
const Z0 = -11, Z1 = 11;
const WALL_T = 0.16;
const STORY = 3.1;
const SLAB = 0.15;

// The stair: a straight flight along the passage's north side, climbing east.
const STAIR_Z0 = 1.62, STAIR_Z1 = 2.95;
const STAIR_X0 = 0.6, STAIR_X1 = 4.4;

// Room dividers (z lines) and their doorway gaps (x ranges).
const PASSAGE_N = 1.55, PASSAGE_S = 4.7;
const PARLOR_DIV = -4.1;
const RAW_DIV = 7.7;      // beyond this line the new wing is unfinished

export interface InteriorSpec {
  /** Terrain height at the house (the plateau). */
  groundY: number;
  box: (minX: number, minZ: number, maxX: number, maxZ: number, minY?: number, maxY?: number) => void;
}

export interface BuiltInterior {
  group: THREE.Group;
  /** Absolute standing height inside, or null where the terrain rules. */
  heightAt: (x: number, z: number, footY: number) => number | null;
  floorY: number;
  floor2Y: number;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function buildInterior(spec: InteriorSpec): BuiltInterior {
  const g = new THREE.Group();
  const floorY = spec.groundY + 0.52;          // top of the plinth
  const floor2Y = floorY + STORY + SLAB;
  const plaster = V.trim;
  const floorWood2 = 0x8d6f46;
  const rawWood = V.railWood;

  // Interior surfaces carry a whisper of self-light (emissive in their own
  // hue). No roof-blocked sun and no leakable point lights ever reach these
  // rooms, so this is the fake bounce light that keeps them readable.
  const solid = (
    cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, color: number,
    em = 0,
  ): THREE.Mesh => {
    let material: THREE.Material;
    if (em > 0) {
      const m2 = new THREE.MeshToonMaterial({ color });
      m2.emissive = new THREE.Color(color);
      m2.emissiveIntensity = em;
      material = m2;
    } else {
      material = mat(color);
    }
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    m.position.set(cx, cy, cz);
    m.receiveShadow = true;
    g.add(m);
    return m;
  };

  // ---- floors -------------------------------------------------------------
  // ground floor boards
  solid((X0 + X1) / 2, floorY - 0.05, (Z0 + Z1) / 2, X1 - X0, 0.1, Z1 - Z0, 0xa8875a, 0.12);
  // board seams — thin darker strips, the cheap plank read
  for (let z = Z0 + 0.9; z < Z1; z += 0.9) {
    solid((X0 + X1) / 2, floorY + 0.002, z, X1 - X0, 0.004, 0.03, 0x82653e, 0.08);
  }
  // second floor slab, with the stairwell left open (x 2.0..X1, z stair strip)
  const slabY = floor2Y - SLAB / 2;
  const slabPieces: Array<[number, number, number, number]> = [
    [(X0 + X1) / 2, (Z0 + PASSAGE_N) / 2, X1 - X0, PASSAGE_N - Z0],
    [(X0 + X1) / 2, (3.0 + Z1) / 2, X1 - X0, Z1 - 3.0],
    [(X0 + 2.0) / 2, (PASSAGE_N + 3.0) / 2, 2.0 - X0, 3.0 - PASSAGE_N],
  ];
  for (const [cx, cz, sx, sz] of slabPieces) {
    solid(cx, slabY, cz, sx, SLAB, sz, 0x9c7c50, 0.12);
    // plastered ceiling skin under each piece
    solid(cx, slabY - SLAB / 2 - 0.02, cz, sx, 0.03, sz, 0xf4f0e2, 0.2);
  }
  // garret ceiling, plastered below
  solid((X0 + X1) / 2, floor2Y + STORY, (Z0 + Z1) / 2, X1 - X0, SLAB, Z1 - Z0, plaster);
  solid((X0 + X1) / 2, floor2Y + STORY - SLAB / 2 - 0.02, (Z0 + Z1) / 2, X1 - X0, 0.03, Z1 - Z0, 0xf4f0e2, 0.2);

  // ---- a partition wall with a doorway, plus its collision ----------------
  const partition = (
    zLine: number, gapX0: number, gapX1: number, baseY: number, raw = false,
  ) => {
    const yC = baseY + STORY / 2;
    const mkSeg = (xa: number, xb: number) => {
      if (xb - xa < 0.05) return;
      if (raw) {
        // bare studs, sill and plate — the unfinished wing
        solid((xa + xb) / 2, baseY + 0.06, zLine, xb - xa, 0.12, 0.1, rawWood);
        solid((xa + xb) / 2, baseY + STORY - 0.06, zLine, xb - xa, 0.12, 0.1, rawWood);
        for (let x = xa + 0.3; x < xb - 0.1; x += 0.62) {
          solid(x, yC, zLine, 0.09, STORY - 0.2, 0.09, rawWood);
        }
      } else {
        solid((xa + xb) / 2, yC, zLine, xb - xa, STORY, WALL_T, plaster, 0.2);
        // baseboard
        solid((xa + xb) / 2, baseY + 0.09, zLine, xb - xa, 0.18, WALL_T + 0.04, 0x8d6f46, 0.08);
      }
      spec.box(xa, zLine - WALL_T / 2, xb, zLine + WALL_T / 2, baseY - 0.3, baseY + 2.4);
    };
    mkSeg(X0, gapX0);
    mkSeg(gapX1, X1);
    // door head over the gap
    if (!raw) solid((gapX0 + gapX1) / 2, baseY + 2.55, zLine, gapX1 - gapX0, STORY - 2.55 + 0.05, WALL_T, plaster);
  };

  // ground floor
  partition(PASSAGE_N, -1.2, -0.2, floorY);
  partition(PASSAGE_S, -1.2, -0.2, floorY);
  partition(PARLOR_DIV, 0.8, 1.8, floorY);
  partition(RAW_DIV, 0.8, 1.8, floorY, true);
  // second floor
  partition(PASSAGE_N, -1.2, -0.2, floor2Y);
  partition(PASSAGE_S, -1.2, -0.2, floor2Y);
  partition(PARLOR_DIV, 0.8, 1.8, floor2Y);
  partition(RAW_DIV, 0.8, 1.8, floor2Y, true);

  // ---- exterior wall collision, with the two door gaps --------------------
  const DOOR_Z0 = 2.6, DOOR_Z1 = 3.7;
  spec.box(X0 - 0.3, Z0, X0 + 0.1, DOOR_Z0);          // west wall, north of door
  spec.box(X0 - 0.3, DOOR_Z1, X0 + 0.1, Z1);          // west wall, south of door
  spec.box(X1 - 0.1, Z0, X1 + 0.3, DOOR_Z0);          // east wall, north of door
  spec.box(X1 - 0.1, DOOR_Z1, X1 + 0.3, Z1);          // east wall, south of door
  spec.box(X0, Z0 - 0.3, X1, Z0 + 0.1);               // north gable
  spec.box(X0, Z1 - 0.1, X1, Z1 + 0.3);               // south gable

  // ---- the stair ----------------------------------------------------------
  const rise = floor2Y - floorY;
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const x = STAIR_X0 + (STAIR_X1 - STAIR_X0) * t0;
    const stepW = (STAIR_X1 - STAIR_X0) / steps;
    solid(x + stepW / 2, floorY + rise * (t0 + 0.5 / steps) - 0.04,
      (STAIR_Z0 + STAIR_Z1) / 2, stepW + 0.02, 0.09, STAIR_Z1 - STAIR_Z0, floorWood2, 0.1);
    // risers, closed — a paneled period flight, not an open stringer
    solid(x + stepW / 2, floorY + rise * t0 * 0.5 + 0.02,
      (STAIR_Z0 + STAIR_Z1) / 2, stepW + 0.02, rise * t0 + 0.04, STAIR_Z1 - STAIR_Z0 - 0.06, plaster, 0.16);
  }
  // handrail along the open (south) side
  const railA = new THREE.Vector3(STAIR_X0, floorY + 0.9, STAIR_Z1);
  const railB = new THREE.Vector3(STAIR_X1, floor2Y + 0.9, STAIR_Z1);
  const railLen = railA.distanceTo(railB);
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, railLen, 6), mat(0x6b4f2e));
  rail.position.copy(railA).add(railB).multiplyScalar(0.5);
  rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), railB.clone().sub(railA).normalize());
  g.add(rail);
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    const x = STAIR_X0 + (STAIR_X1 - STAIR_X0) * t;
    const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.9, 5), mat(0x6b4f2e));
    baluster.position.set(x, floorY + rise * t + 0.45, STAIR_Z1);
    g.add(baluster);
  }
  // ground-floor guard along the flight's flank: no side-stepping onto mid-air
  spec.box(1.2, STAIR_Z1 - 0.02, STAIR_X1 + 0.35 > X1 ? X1 : 4.4, STAIR_Z1 + 0.1, floorY - 0.3, floorY + 2.4);
  // upstairs guards around the stairwell hole
  spec.box(1.85, PASSAGE_N, 2.0, 3.0, floor2Y - 0.4, floor2Y + 2.0);        // west edge
  spec.box(1.85, 2.95, 4.35, 3.06, floor2Y - 0.4, floor2Y + 2.0);          // south edge, entry at east
  // upstairs rail meshes to match the guards
  solid(2.95, floor2Y + 0.5, 3.0, 2.4, 1.0, 0.06, 0x6b4f2e);
  solid(1.95, floor2Y + 0.5, 2.3, 0.06, 1.0, 1.45, 0x6b4f2e);

  // ---- wall linings -------------------------------------------------------
  // The exterior shell is a single front-side box, invisible from within, and
  // any interior point light leaks straight through it. So the inside gets a
  // real skin: plaster linings just inside every exterior wall, and NO point
  // lights at all — the hemisphere light plus emissive window panes carry the
  // rooms, which also means nothing can leak.
  const lining = (
    cx: number, cz: number, sx: number, sz: number, baseY: number,
  ) => {
    solid(cx, baseY + STORY / 2, cz, sx, STORY, sz, plaster, 0.22);
  };
  for (const baseY of [floorY, floor2Y]) {
    // west wall, split at the door on the ground floor
    if (baseY === floorY) {
      lining(X0 + 0.12, (Z0 + 2.6) / 2, 0.08, 2.6 - Z0, baseY);
      lining(X0 + 0.12, (3.7 + Z1) / 2, 0.08, Z1 - 3.7, baseY);
      lining(X1 - 0.12, (Z0 + 2.6) / 2, 0.08, 2.6 - Z0, baseY);
      lining(X1 - 0.12, (3.7 + Z1) / 2, 0.08, Z1 - 3.7, baseY);
    } else {
      lining(X0 + 0.12, 0, 0.08, Z1 - Z0, baseY);
      lining(X1 - 0.12, 0, 0.08, Z1 - Z0, baseY);
    }
    lining(0, Z0 + 0.12, X1 - X0, 0.08, baseY);
    lining(0, Z1 - 0.12, X1 - X0, 0.08, baseY);
  }

  // ---- daylight: bright panes just inside the linings ---------------------
  const bays = [9.43, 6.29, 3.14, 0, -3.14, -6.29, -9.43];
  const glow = new THREE.MeshToonMaterial({ color: 0xdfe8e4 });
  glow.emissive = new THREE.Color(0xeef4ec);
  glow.emissiveIntensity = 0.5;
  for (const bz of bays) {
    for (const [wx, face] of [[X0 + 0.18, 1], [X1 - 0.18, -1]] as const) {
      for (const fy of [floorY + 1.75, floor2Y + 1.6]) {
        if (fy < floor2Y && Math.abs(bz - 3.14) < 0.01 && wx < 0) continue; // the west door bay
        const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.7), mat(0x8d6f46));
        frame.position.set(wx - face * 0.005, fy, bz);
        frame.rotation.y = face * Math.PI / 2;
        g.add(frame);
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.5), glow);
        pane.position.set(wx, fy, bz);
        pane.rotation.y = face * Math.PI / 2;
        g.add(pane);
      }
    }
  }

  // ---- fireplaces ---------------------------------------------------------
  const fireplace = (x: number, z: number, baseY: number, yaw: number) => {
    const fp = new THREE.Group();
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.35, 0.3), mat(V.brick));
    s1.position.y = 0.67; fp.add(s1);
    const open = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.95, 0.32), mat(0x241c14));
    open.position.y = 0.48; fp.add(open);
    const emberMat = new THREE.MeshToonMaterial({ color: 0xd06a24 });
    emberMat.emissive = new THREE.Color(0xdd7a26);
    emberMat.emissiveIntensity = 0.8;
    const ember = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.3), emberMat);
    ember.position.y = 0.12; fp.add(ember);
    const mantel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.4), mat(0x8d6f46));
    mantel.position.y = 1.4; fp.add(mantel);
    fp.position.set(x, baseY, z);
    fp.rotation.y = yaw;
    g.add(fp);
  };
  fireplace(0, Z0 + 0.35, floorY, 0);              // parlor, north gable
  fireplace(X1 - 0.35, -1.2, floorY, -Math.PI / 2); // dining, east wall
  fireplace(0, Z1 - 0.35, floorY, Math.PI);        // the study, south gable (new chimney)
  fireplace(0, Z0 + 0.35, floor2Y, 0);             // chamber above the parlor

  // ---- furnishing, sparse and period --------------------------------------
  const table = (x: number, z: number, w: number, d: number, baseY: number) => {
    solid(x, baseY + 0.74, z, w, 0.07, d, 0x8d6f46);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      solid(x + sx * (w / 2 - 0.1), baseY + 0.37, z + sz * (d / 2 - 0.1), 0.09, 0.74, 0.09, 0x6b4f2e);
    }
    spec.box(x - w / 2, z - d / 2, x + w / 2, z + d / 2, baseY, baseY + 1.2);
  };
  const stool = (x: number, z: number, baseY: number) => {
    solid(x, baseY + 0.45, z, 0.38, 0.06, 0.38, 0x8d6f46);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      solid(x + sx * 0.14, baseY + 0.22, z + sz * 0.14, 0.06, 0.45, 0.06, 0x6b4f2e);
    }
  };
  // dining room
  table(1, -1.4, 2.2, 1.1, floorY);
  stool(0.2, -0.6, floorY); stool(1.8, -0.6, floorY); stool(0.2, -2.2, floorY); stool(1.8, -2.2, floorY);
  // the study: desk, papers, and the ledger work of a man about to leave
  table(-1.2, 6.4, 1.5, 0.8, floorY);
  for (let i = 0; i < 3; i++) {
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), mat(V.linen));
    paper.rotation.x = -Math.PI / 2; paper.rotation.z = i * 0.5 - 0.4;
    paper.position.set(-1.4 + i * 0.35, floorY + 0.79, 6.35);
    g.add(paper);
  }
  stool(-1.2, 7.2, floorY);
  // parlor
  table(-1, -7.5, 1.2, 1.2, floorY);
  stool(0.2, -7.5, floorY); stool(-2.2, -7.5, floorY);
  // upstairs: two bedchambers
  const bed = (x: number, z: number, baseY: number) => {
    solid(x, baseY + 0.3, z, 1.4, 0.25, 2.0, 0x6b4f2e);
    solid(x, baseY + 0.5, z, 1.3, 0.22, 1.9, V.linen);
    solid(x, baseY + 0.62, z - 0.7, 1.3, 0.14, 0.5, V.cream);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      solid(x + sx * 0.62, baseY + 0.9, z + sz * 0.92, 0.08, 1.8, 0.08, 0x6b4f2e);
    }
    spec.box(x - 0.7, z - 1.0, x + 0.7, z + 1.0, baseY, baseY + 1.0);
  };
  bed(-1.4, -8.3, floor2Y);
  bed(1.6, -6.2, floor2Y);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.55), mat(0x6b4f2e));
  chest.position.set(-3.8, floor2Y + 0.28, -4.9);
  g.add(chest);

  // ---- the unfinished wing: planks, sawhorse, shavings --------------------
  for (let i = 0; i < 4; i++) {
    solid(0.5 + (i % 2) * 0.3, floorY + 0.08 + i * 0.09, 9.3 + (i % 2) * 0.2, 0.35, 0.08, 3.2, rawWood);
  }
  const saw = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4), mat(V.postWood));
  saw.position.set(-1.6, floorY + 0.4, 9.2);
  g.add(saw);
  const ladder2 = new THREE.Group();
  for (const sx of [-0.22, 0.22]) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.4, 4), mat(V.postWood));
    r.position.x = sx; ladder2.add(r);
  }
  for (let i = 0; i < 7; i++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 4), mat(V.railWood));
    rung.rotation.z = Math.PI / 2; rung.position.y = -1.5 + i * 0.48; ladder2.add(rung);
  }
  ladder2.position.set(-3.6, floorY + 1.75, 9.6);
  ladder2.rotation.x = -0.18;
  g.add(ladder2);

  // ---- standing height ----------------------------------------------------
  const heightAt = (x: number, z: number, footY: number): number | null => {
    if (x < X0 || x > X1 || z < Z0 || z > Z1) return null;
    if (z > STAIR_Z0 && z < STAIR_Z1 && x > 0.4) {
      const t = clamp((x - STAIR_X0) / (STAIR_X1 - STAIR_X0), 0, 1);
      return floorY + (floor2Y - floorY) * t;
    }
    // two flat candidates; the player's own height picks the floor
    return Math.abs(footY - floor2Y) < Math.abs(footY - floorY) ? floor2Y : floorY;
  };

  return { group: g, heightAt, floorY, floor2Y };
}
