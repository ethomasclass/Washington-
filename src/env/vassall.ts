/**
 * The Vassall house — headquarters, Cambridge, 1775.
 *
 * RESEARCH (recorded, as vernon.ts does):
 *   R.1  John Vassall's mansion on the Watertown road ("Tory Row"), built 1759;
 *        Vassall fled to Boston in 1774. Washington made it his headquarters in
 *        July 1775 and ran the siege from it. (Longfellow House–Washington's
 *        Headquarters NHS.)
 *   R.2  Mid-Georgian main block: two stories, five bays, central pedimented
 *        entry, hip roof, paired interior chimneys, corner pilasters.
 *   R.3  Washington worked from the ground-floor room east of the entry hall —
 *        parlour and office both; the council chairs and the map work lived
 *        there. (Site interpretation; simplified to one great parlour here.)
 *   V.1  The pale-yellow paint is documented for the 19th century; the 1775
 *        colour is not certain. CB-01's authored text already says pale yellow,
 *        so the house keeps it — flagged unverified.
 *
 * The house stands in the cambridge env west of the camp, at the end of its
 * own lane. The player finds it, the front door swings for them, and the hall
 * and parlour inside are real walkable rooms — CB-02's content anchors here.
 * The stair is real but blocked with headquarters baggage: the war upstairs
 * is nobody's business.
 */

import * as THREE from 'three';
import { mat, texMat } from '../fp/kit';
import * as E from './vernon-kit';
import { V } from './vernon-kit';
import type { BuildCtx } from './scene';
import { clapboardTex, shingleTex, plankTex } from './textures';

// Footprint, world coordinates. Door on the south (−z) face, toward the road.
export const HX = -78, HZ = 16;
const W = 15, D = 10.5;
const X0 = HX - W / 2, X1 = HX + W / 2;
const Z0 = HZ - D / 2, Z1 = HZ + D / 2;
const WALL_T = 0.16;
const STORY = 2.9;
const PLINTH = 0.5;
// The entry hall runs front-to-back between these x lines.
const HALL_W = HX - 2.3, HALL_E = HX + 2.3;
// The hall→parlour doorway, in z, near the front of the house.
const PDOOR_Z0 = Z0 + 1.25, PDOOR_Z1 = Z0 + 2.35;
// The front door gap, in x.
const FDOOR_X0 = HX - 0.55, FDOOR_X1 = HX + 0.55;

/** The parlour's furniture marks, for the game's anchor table. */
export const MARKS = {
  door: [HX + 3.2, Z0 + 2.0] as const,       // the chairs by the parlour door
  hearth: [X1 - 1.6, HZ + 0.6] as const,     // the chimney breast, east wall
  maptable: [HX + 4.9, HZ - 1.0] as const,   // the map table, mid-room
  secretary: [HX + 4.9, Z1 - 1.6] as const,  // the secretary's desk, back wall
  window: [X1 - 1.4, Z0 + 1.3] as const,     // the south-east window
  hall: [HX, Z0 + 1.9] as const,             // just inside the front door
};

/** A worked map — drawn once, laid on the table top. */
function mapTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 192;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e8dfc6'; g.fillRect(0, 0, 256, 192);
  g.strokeStyle = '#b5a888'; g.lineWidth = 1;
  g.strokeRect(7, 7, 242, 178);
  // the harbour: water wash east, the town's peninsula, the neck
  g.fillStyle = '#c9cdb9';
  g.beginPath();
  g.moveTo(150, 12); g.lineTo(244, 12); g.lineTo(244, 182); g.lineTo(130, 182);
  g.quadraticCurveTo(160, 120, 148, 70); g.closePath(); g.fill();
  g.fillStyle = '#ddd4b8';
  g.beginPath();
  g.moveTo(196, 60); g.quadraticCurveTo(176, 92, 196, 128);
  g.quadraticCurveTo(216, 140, 224, 116); g.quadraticCurveTo(228, 80, 210, 62);
  g.closePath(); g.fill();
  g.strokeStyle = '#7a6f54'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(196, 128); g.quadraticCurveTo(186, 152, 170, 168); g.stroke();
  // the ring of works, inked west of the water
  g.strokeStyle = '#8a4a3a'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(60, 24); g.quadraticCurveTo(120, 60, 118, 96);
  g.quadraticCurveTo(116, 138, 66, 170); g.stroke();
  // roads
  g.strokeStyle = '#9a8a68'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(14, 96); g.lineTo(96, 96); g.stroke();
  g.beginPath(); g.moveTo(58, 30); g.lineTo(58, 164); g.stroke();
  // a compass rose, small
  g.strokeStyle = '#7a6f54'; g.lineWidth = 1;
  g.beginPath(); g.arc(34, 36, 12, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(34, 22); g.lineTo(34, 50); g.moveTo(20, 36); g.lineTo(48, 36); g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Stand the house, its rooms, and its furniture; register every collider and
 * the interior floor. Call once from the cambridge build.
 */
export function vassallHouse(ctx: BuildCtx): void {
  const { scene, height, animate, box } = ctx;
  const gY = height(HX, HZ);
  const floorY = gY + PLINTH + 0.02;

  // ---- THE SHELL (R.2, V.1) ----------------------------------------------
  const wallT = clapboardTex(), roofT = shingleTex();
  const house = E.building({
    w: W, d: D, stories: 2, storyH: STORY,
    wall: 0xd8c88e, roof: 0x5a5148, roofType: 'hip', roofH: 3.1, ridgeFrac: 0.5,
    windowsX: 5, door: { face: 'n', bay: 2, pediment: true, leafless: true },
    chimneys: ['e', 'w'], shutters: true, plinth: PLINTH,
    cornice: true, wallTex: wallT, roofTex: roofT,
  });
  house.position.set(HX, gY, HZ);
  scene.add(house);
  // corner pilaster strips — the Georgian dress the shell generator lacks
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.34, STORY * 2, 0.34), mat(V.trim));
    p.castShadow = true;
    p.position.set(HX + sx * (W / 2 - 0.05), gY + PLINTH + STORY, HZ + sz * (D / 2 - 0.05));
    scene.add(p);
  }

  // ---- THE FRONT DOOR, hinged, and its step ------------------------------
  const hinge = new THREE.Group();
  const leaf = E.doorLeaf(1.06, 2.12);
  hinge.add(leaf); // leaf extends +x from the west jamb
  hinge.position.set(FDOOR_X0, floorY, Z0);
  scene.add(hinge);
  let angle = 0;
  animate((_t, dt, cam) => {
    const near = cam ? Math.hypot(cam.x - HX, cam.z - Z0) < 3.4 : false;
    const target = near ? -1.9 : 0; // swings inward, north
    angle += (target - angle) * (1 - Math.exp(-dt / 0.22));
    hinge.rotation.y = angle;
  });
  for (let s = 0; s < 2; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.24, 0.55 - s * 0.12), mat(V.stone));
    step.castShadow = step.receiveShadow = true;
    step.position.set(HX, height(HX, Z0 - 0.8) + 0.12 + s * 0.24, Z0 - 0.62 + s * 0.14);
    scene.add(step);
  }

  // ---- INTERIOR SURFACES -------------------------------------------------
  // Same technique as the Mount Vernon interior: no point lights, plaster
  // linings inside the (backface-culled) shell, a whisper of warm emissive.
  const g = new THREE.Group();
  scene.add(g);
  const solid = (
    cx: number, cy: number, cz: number, sx: number, sy: number, sz: number,
    color: number, em = 0,
  ): THREE.Mesh => {
    let material: THREE.Material;
    if (em > 0) {
      const m2 = new THREE.MeshToonMaterial({ color });
      m2.emissive = new THREE.Color(color).lerp(new THREE.Color(0xffdca4), 0.45);
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
  const plaster = 0xe9e2cf;

  // floor boards and seams
  solid(HX, floorY - 0.05, HZ, W, 0.1, D, 0xa8875a, 0.4);
  for (let z = Z0 + 0.85; z < Z1; z += 0.85) {
    solid(HX, floorY + 0.002, z, W, 0.004, 0.03, 0x82653e, 0.08);
  }
  // ceiling — the parlour's world stops at its cornice. The slab CASTS
  // shadow: the shell's own shadow leaks at the sunward eave (grazing rays,
  // back-face depth, normal bias), and without this the sun paints a wedge
  // across the plaster. A horizontal caster overhead closes the rooms off
  // from the sky for good.
  const ceil = solid(HX, floorY + STORY + 0.06, HZ, W, 0.12, D, 0x9c7c50);
  ceil.castShadow = true;
  solid(HX, floorY + STORY - 0.015, HZ, W, 0.03, D, 0xf2edda, 0.5);

  // exterior wall linings, split at the front door
  const lin = (cx: number, cz: number, sx: number, sz: number) =>
    solid(cx, floorY + STORY / 2, cz, sx, STORY, sz, plaster, 0.55);
  lin((X0 + FDOOR_X0) / 2, Z0 + 0.12, FDOOR_X0 - X0, 0.08);   // front, west of door
  lin((FDOOR_X1 + X1) / 2, Z0 + 0.12, X1 - FDOOR_X1, 0.08);   // front, east of door
  lin(HX, Z1 - 0.12, W, 0.08);                                 // back
  lin(X0 + 0.12, HZ, 0.08, D);                                 // west gable
  lin(X1 - 0.12, HZ, 0.08, D);                                 // east gable
  // over the front door
  solid(HX, floorY + 2.55 + (STORY - 2.55) / 2, Z0 + 0.12, 1.3, STORY - 2.55, 0.08, plaster, 0.55);

  // daylight: bright panes just inside the linings, at the shell's bays
  const glow = new THREE.MeshToonMaterial({ color: 0xdfe8e4 });
  glow.emissive = new THREE.Color(0xeef4ec);
  glow.emissiveIntensity = 0.7;
  const bayXs = [HX - 6, HX - 3, HX, HX + 3, HX + 6];
  for (const bx of bayXs) {
    for (const [wz, face] of [[Z0 + 0.18, 0], [Z1 - 0.18, Math.PI]] as const) {
      if (bx === HX && wz < HZ) continue; // the door bay
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.65), mat(0x8d6f46));
      frame.position.set(bx, floorY + 1.7, wz);
      frame.rotation.y = face;
      g.add(frame);
      // the pane sits a hair ROOMWARD of the frame, or the frame hides it
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.45), glow);
      pane.position.set(bx, floorY + 1.7, wz + (face === 0 ? 0.012 : -0.012));
      pane.rotation.y = face;
      g.add(pane);
    }
  }

  // ---- PARTITIONS: hall walls, one doorway, one shut door ----------------
  const partition = (xLine: number, gapZ0: number, gapZ1: number) => {
    const seg = (za: number, zb: number) => {
      if (zb - za < 0.05) return;
      solid(xLine, floorY + STORY / 2, (za + zb) / 2, WALL_T, STORY, zb - za, plaster, 0.5);
      solid(xLine, floorY + 0.09, (za + zb) / 2, WALL_T + 0.04, 0.18, zb - za, 0x8d6f46, 0.08);
      box(xLine - WALL_T / 2, za, xLine + WALL_T / 2, zb, floorY - 0.3, floorY + 2.4);
    };
    seg(Z0, gapZ0);
    seg(gapZ1, Z1);
    if (gapZ1 > gapZ0) {
      solid(xLine, floorY + 2.55 + (STORY - 2.55) / 2, (gapZ0 + gapZ1) / 2,
        WALL_T, STORY - 2.55, gapZ1 - gapZ0, plaster, 0.5);
    }
  };
  partition(HALL_E, PDOOR_Z0, PDOOR_Z1);        // hall → parlour, open
  partition(HALL_W, PDOOR_Z0, PDOOR_Z1);        // hall → west rooms, shut
  // the west door stands closed — the family's rooms are not the war's
  const shut = E.doorLeaf(1.06, 2.12);
  shut.position.set(HALL_W - 0.53 + 0.02, floorY, PDOOR_Z0 + 0.55);
  shut.rotation.y = Math.PI / 2;
  g.add(shut);
  box(HALL_W - 0.2, PDOOR_Z0, HALL_W + 0.2, PDOOR_Z1, floorY - 0.3, floorY + 2.4);

  // ---- EXTERIOR WALL COLLISION, with the front-door gap ------------------
  box(X0 - 0.3, Z0 - 0.2, FDOOR_X0, Z0 + 0.2);   // front, west of door
  box(FDOOR_X1, Z0 - 0.2, X1 + 0.3, Z0 + 0.2);   // front, east of door
  box(X0 - 0.3, Z1 - 0.2, X1 + 0.3, Z1 + 0.2);   // back
  box(X0 - 0.2, Z0, X0 + 0.2, Z1);               // west gable
  box(X1 - 0.2, Z0, X1 + 0.2, Z1);               // east gable

  // ---- THE STAIR, real and refused ---------------------------------------
  // A closed-string flight along the hall's west side, climbing north; the
  // headquarters' baggage is stacked on the bottom steps. Upstairs is where
  // the General sleeps, and the game does not go there.
  const S_X = HALL_W + 0.75;
  const S_Z0 = HZ - 0.4, S_Z1 = Z1 - 0.9;
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const z = S_Z0 + (S_Z1 - S_Z0) * t0;
    const stepD = (S_Z1 - S_Z0) / steps;
    solid(S_X, floorY + (STORY - 0.2) * (t0 + 0.5 / steps) - 0.04, z + stepD / 2,
      1.15, 0.09, stepD + 0.02, 0x8d6f46, 0.1);
    solid(S_X, floorY + (STORY - 0.2) * t0 * 0.5 + 0.02, z + stepD / 2,
      1.15, (STORY - 0.2) * t0 + 0.04, stepD - 0.04, plaster, 0.3);
  }
  // handrail on the open side
  const railA = new THREE.Vector3(S_X + 0.58, floorY + 0.85, S_Z0);
  const railB = new THREE.Vector3(S_X + 0.58, floorY + STORY - 0.2 + 0.85, S_Z1);
  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, railA.distanceTo(railB), 6), mat(0x6b4f2e));
  rail.position.copy(railA).add(railB).multiplyScalar(0.5);
  rail.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0), railB.clone().sub(railA).normalize());
  g.add(rail);
  // the baggage: trunks on the bottom steps, and the collision that refuses you
  const trunk = (x: number, z: number, y: number, yaw: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.55),
      texMat(0x6b4f2e, plankTex(), { flat: false }));
    m.castShadow = true;
    m.position.set(x, y + 0.25, z); m.rotation.y = yaw;
    g.add(m);
  };
  trunk(S_X, S_Z0 + 0.35, floorY + 0.05, 0.12);
  trunk(S_X + 0.1, S_Z0 + 1.0, floorY + 0.28, -0.2);
  box(S_X - 0.7, S_Z0 - 0.15, S_X + 0.7, S_Z1 + 0.2, floorY - 0.3, floorY + 2.4);

  // ---- THE PARLOUR, furnished --------------------------------------------
  const table = (x: number, z: number, w: number, d2: number, topTex?: THREE.Texture) => {
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d2),
      topTex ? texMat(0xcabb96, topTex, { flat: false }) : mat(0x8d6f46));
    top.castShadow = top.receiveShadow = true;
    top.position.set(x, floorY + 0.75, z);
    g.add(top);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      solid(x + sx * (w / 2 - 0.1), floorY + 0.37, z + sz * (d2 / 2 - 0.1), 0.09, 0.74, 0.09, 0x59452a);
    }
    box(x - w / 2, z - d2 / 2, x + w / 2, z + d2 / 2, floorY, floorY + 1.2);
  };
  const chair = (x: number, z: number, yaw: number) => {
    const ch = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.4), mat(0x7a5a38));
    seat.position.y = 0.45; ch.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.05), mat(0x6b4f2e));
    back.position.set(0, 0.78, -0.18); ch.add(back);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), mat(0x59452a));
      leg.position.set(sx * 0.17, 0.22, sz * 0.16); ch.add(leg);
    }
    ch.traverse((o) => { o.castShadow = true; });
    ch.position.set(x, floorY, z); ch.rotation.y = yaw;
    g.add(ch);
  };
  const paper = (x: number, z: number, y: number, spin: number) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), mat(V.linen));
    p.rotation.x = -Math.PI / 2; p.rotation.z = spin;
    p.position.set(x, y, z);
    g.add(p);
  };

  // the good carpet under the middle of the room
  solid(HX + 4.9, floorY + 0.012, HZ + 0.4, 3.4, 0.02, 4.6, 0x7a3b34, 0.25);
  solid(HX + 4.9, floorY + 0.02, HZ + 0.4, 2.9, 0.02, 4.1, 0x8a4a3c, 0.25);

  // the map table, the map on it, and the week of returns burying the map
  const [mtX, mtZ] = MARKS.maptable;
  table(mtX, mtZ, 1.5, 1.0, mapTex());
  paper(mtX - 0.45, mtZ + 0.28, floorY + 0.80, 0.4);
  paper(mtX + 0.42, mtZ - 0.22, floorY + 0.80, -0.7);
  paper(mtX + 0.1, mtZ + 0.38, floorY + 0.80, 1.2);
  // the owner's silver inkstand
  const ink = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.14), mat(0xc9c9c2));
  ink.castShadow = true;
  ink.position.set(mtX - 0.35, floorY + 0.82, mtZ - 0.3);
  g.add(ink);
  const well = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.07, 8), mat(0xd8d8d0));
  well.position.set(mtX - 0.35, floorY + 0.88, mtZ - 0.3);
  g.add(well);

  // the secretary's table against the back wall, papers and the dispatch box
  const [seX, seZ] = MARKS.secretary;
  table(seX, seZ, 1.7, 0.75);
  paper(seX - 0.5, seZ + 0.05, floorY + 0.80, 0.2);
  paper(seX - 0.15, seZ - 0.08, floorY + 0.80, -0.35);
  paper(seX + 0.2, seZ + 0.1, floorY + 0.80, 0.9);
  const dbox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.34),
    texMat(0x59452a, plankTex(), { flat: false }));
  dbox.castShadow = true;
  dbox.position.set(seX + 0.55, floorY + 0.89, seZ);
  g.add(dbox);
  chair(seX, seZ - 0.75, 0);

  // the council chairs, drawn up in a rough ring by the parlour door
  const [cdX, cdZ] = MARKS.door;
  const ringR = 1.0;
  for (let i = 0; i < 5; i++) {
    const a = -0.5 + i * 1.05;
    chair(cdX + Math.cos(a) * ringR, cdZ + Math.sin(a) * ringR, -a + Math.PI / 2 + Math.PI);
  }
  box(cdX - 0.5, cdZ - 0.5, cdX + 0.5, cdZ + 0.5, floorY, floorY + 0.9);

  // the chimney breast: hearth, mantel, the portrait turned to the wall,
  // and Knox's crate of gunnery books beside it
  const [, heZ] = MARKS.hearth;
  const heX = X1 - 0.45;
  solid(heX, floorY + 0.72, heZ, 0.5, 1.44, 1.9, V.brick, 0.22);
  solid(heX - 0.22, floorY + 0.5, heZ, 0.16, 1.0, 1.05, 0x241c14);          // the opening
  const emberMat = new THREE.MeshToonMaterial({ color: 0xd06a24 });
  emberMat.emissive = new THREE.Color(0xdd7a26);
  emberMat.emissiveIntensity = 0.7;
  const ember = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.6), emberMat);
  ember.position.set(heX - 0.2, floorY + 0.12, heZ);
  g.add(ember);
  solid(heX - 0.28, floorY + 1.5, heZ, 0.4, 0.12, 2.1, 0x8d6f46, 0.18);           // mantel
  box(heX - 0.55, heZ - 1.0, X1, heZ + 1.0, floorY, floorY + 1.6);
  // the portrait: gilt frame, and the stretcher-and-canvas BACK facing the room
  solid(heX - 0.24, floorY + 2.25, heZ, 0.07, 0.95, 0.75, 0x9a7a3a, 0.2);
  solid(heX - 0.26, floorY + 2.25, heZ, 0.04, 0.82, 0.62, 0xcabb96, 0.22);
  solid(heX - 0.28, floorY + 2.25, heZ, 0.03, 0.7, 0.09, 0xa8946a, 0.2);         // stretcher bar
  solid(heX - 0.28, floorY + 2.25, heZ, 0.03, 0.09, 0.5, 0xa8946a, 0.2);
  // the crate of books
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5),
    texMat(0x77603f, plankTex(), { flat: false }));
  crate.castShadow = true;
  crate.position.set(heX - 0.6, floorY + 0.25, heZ + 1.55);
  crate.rotation.y = 0.2;
  g.add(crate);
  for (let i = 0; i < 4; i++) {
    solid(heX - 0.6 + (i % 2) * 0.18 - 0.09, floorY + 0.56, heZ + 1.45 + Math.floor(i / 2) * 0.2,
      0.14, 0.22, 0.05 + (i % 3) * 0.01, [0x6b3a2e, 0x3d4a3a, 0x59452a, 0x7a5a38][i]);
  }
  box(heX - 1.0, heZ + 1.2, heX - 0.2, heZ + 1.9, floorY, floorY + 0.8);

  // a hall table with the day's post, so the entry reads inhabited
  table(HX + 1.5, Z1 - 1.1, 1.1, 0.6);
  paper(HX + 1.4, Z1 - 1.05, floorY + 0.80, 0.5);

  // ---- STANDING HEIGHT ---------------------------------------------------
  ctx.setHeightOverride((x, z) => {
    if (x < X0 || x > X1 || z < Z0 - 1.1 || z > Z1) return null;
    // the step, climbed rather than teleported
    if (z < Z0) {
      if (x < FDOOR_X0 - 0.4 || x > FDOOR_X1 + 0.4) return null;
      const t = 1 - (Z0 - z) / 1.1;
      return height(HX, Z0 - 1.2) * (1 - t) + floorY * t;
    }
    return floorY;
  });
}
