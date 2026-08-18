/**
 * Mount Vernon, the first week of May 1775 — the estate he rides away from.
 *
 * ENVIRONMENT DIRECTION. The postcard Mount Vernon — piazza, cupola, red roof,
 * colonnades, bowling green — is 1777–1793 work and appears NOWHERE here. What
 * stood in May 1775 is better for this game anyway: an asymmetric house with
 * its new south wing standing raw and scaffolded, a working forecourt of
 * dependencies, and a departure by chariot that would last six years.
 *
 * SPATIAL SCALE is taken from the estate's real plan (cross-checked against
 * the modern grounds map): the dependencies stand off the house in two service
 * rows a proper lane-width away, the walled gardens are large and sit well
 * west of the forecourt, the quarter and stable are outbuildings you WALK to,
 * not porch furniture. The 1775 feature set stays; only the distances grew.
 *
 * Orientation: the Potomac lies EAST (+x). The west approach (−x) runs between
 * the two walled gardens — which really did block the view of the house until
 * 1785 — into the forecourt. The east slope is plain and half-wooded.
 *
 * VERIFIED — research pass, 16 Aug 2026 (mountvernon.org digital encyclopedia
 * and archaeology pages; via search excerpts):
 *   R.1  No piazza (1777), no cupola (1778), no north wing (begun 1776):
 *        the house is 2.5 stories, ASYMMETRIC — new south wing, old north end.
 *   R.2  Roof: cypress shingles painted SLATE BLUE as of 1775; red is 1790s.
 *   R.3  Rusticated sand-painted "stone" siding since 1758 — cream-white.
 *   R.4  South addition begun spring 1774; structure up, interior unfinished
 *        in May 1775; finished by Lund Washington that winter.
 *   R.5  Four frame dependencies in service rows off the west corners, fenced
 *        into a forecourt; the new kitchen's rebuild starting during 1775.
 *   R.6  Rectangular brick-walled gardens flank the west approach and block
 *        the view: lower = kitchen garden (1760s), upper = fruit-and-nut.
 *   R.7  House for Families: c. 1760, two-story quarter on the north service
 *        lane. THE BUILDING IS PRESENT; depictions of the enslaved community
 *        are deliberately not, pending the project's own review gate for this
 *        material (see the R5/Witness Register gate in src/scenes/mv01.ts) —
 *        the same rule that holds the William Lee thread out of the build.
 *   R.8  Frame stable (the brick one is 1782, after the 1781 fire).
 *   R.9  Bluff ~125 ft over the Potomac; east slope plain, partly wooded.
 *   R.10 Wheat + corn (tobacco gone since 1766); May = sheep shearing, corn
 *        planting, tail of the shad/herring run at the shore landings.
 *   R.11 Washington left by CHARIOT on 4 May 1775. Martha stayed until
 *        November; Lund Washington managed the estate throughout the war.
 */

import * as THREE from 'three';
import type { SceneDef } from './scene';
import { fbm } from './noise';
import * as K from '../fp/kit';
import * as E from './vernon-kit';
import { V } from './vernon-kit';
import { buildInterior } from './vernon-interior';
import { shingleTex, brickTex, clapboardTex } from './textures';
import { texMat } from '../fp/kit';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

// ---------------------------------------------------------------------------
// GROUND — a bluff over the Potomac, falling east
// ---------------------------------------------------------------------------

const RIVER_LEVEL = -5.2;
const BLUFF_EDGE = 34;    // x where the high ground ends
const SHORE = 66;         // x where the water begins

function segDist(x: number, z: number, ax: number, az: number, bx: number, bz: number): number {
  const vx = bx - ax, vz = bz - az;
  const t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0, 1);
  return Math.hypot(x - (ax + vx * t), z - (az + vz * t));
}

function elevation(x: number, z: number): number {
  let h = fbm(x * 0.012 + 3, z * 0.012 + 9, { seed: 41, octaves: 5 }) * 6 + 2.5;
  // the levelled house plateau, forecourt and service rows
  const dHouse = Math.hypot(x * 0.62, z * 0.5);
  h = mixN(h, 6.4, clamp(1 - dHouse / 46, 0, 1) * 0.92);
  // the fall to the river
  if (x > BLUFF_EDGE) {
    const t = smooth(clamp((x - BLUFF_EDGE) / (SHORE - BLUFF_EDGE), 0, 1));
    h = mixN(h, RIVER_LEVEL + 0.8, t);
  }
  // a soft ravine breaking the ground south of the lawn
  const rav = clamp(1 - segDist(x, z, 10, 38, 50, 52) / 13, 0, 1);
  h -= rav * rav * 3.0 * clamp((x - 2) / 30, 0, 1);
  return h;
}

// ---------------------------------------------------------------------------
// GROUND PAINT — lawn, lanes, fields, shore
// ---------------------------------------------------------------------------

const LANES: Array<[number, number, number, number]> = [
  [-120, 0, -14, 0],      // the west approach, between the garden walls
  [-14, 0, 6, 0],         // the forecourt to the west door
  [-16, -13, -52, -17],   // north service row, out to the quarter
  [-16, 13, -22, 36],     // south lane to the stable and paddock
  [8, 4, 54, 16],         // the track down the bluff to the wharf
];

function paint(x: number, z: number, h: number, slope: number, out: THREE.Color): void {
  const lawn = new THREE.Color(0x84ad52);
  const lawnDry = new THREE.Color(0x9fb75f);
  const wheat = new THREE.Color(0x8fae54);   // winter wheat, standing green in May
  const plough = new THREE.Color(0x77603f);  // the corn ground, fresh-turned
  const lane = new THREE.Color(0x9a8a68);
  const shore = new THREE.Color(0xa89a6e);
  const mudFlat = new THREE.Color(0x8a7f62);

  const n = fbm(x * 0.09, z * 0.09, { seed: 8 });
  out.copy(lawn).lerp(lawnDry, n * 0.7);

  const dHouse = Math.hypot(x * 0.62, z * 0.5);
  if (dHouse > 44 && x < BLUFF_EDGE) {
    const stripe = Math.sin(z * 0.9 + fbm(x * 0.05, z * 0.05, { seed: 12 }) * 2) * 0.5 + 0.5;
    const fieldCol = new THREE.Color().copy(wheat).lerp(plough, stripe > 0.5 ? 0.14 : 0);
    const corn = clamp(1 - Math.hypot((x + 95) / 30, (z + 30) / 22), 0, 1);
    fieldCol.lerp(plough, corn * 0.85);
    out.lerp(fieldCol, clamp((dHouse - 44) / 14, 0, 1));
  }

  let laneT = 0;
  for (const [ax, az, bx, bz] of LANES) {
    laneT = Math.max(laneT, clamp(1 - segDist(x, z, ax, az, bx, bz) / 2.4, 0, 1));
  }
  out.lerp(lane, smooth(laneT) * 0.85);

  if (x > BLUFF_EDGE + 8) {
    const t = clamp((x - (BLUFF_EDGE + 8)) / (SHORE - BLUFF_EDGE - 8), 0, 1);
    out.lerp(shore, smooth(t));
    if (h < RIVER_LEVEL + 1.6) out.lerp(mudFlat, 0.6);
  }

  out.lerp(new THREE.Color(0x6d5638), clamp((slope - 0.35) * 2.2, 0, 1));
}

// ---------------------------------------------------------------------------
// THE SCENE
// ---------------------------------------------------------------------------

export const MOUNT_VERNON_1775: SceneDef = {
  id: 'mount-vernon',
  name: 'Mount Vernon — May 1775',
  bounds: 150,
  defaultWeather: 'clear',
  spawn: { x: -85, z: 0, yaw: -Math.PI / 2 }, // on the west lane, walls either side
  elevation,
  paint,
  treeCount: 180,
  water: { level: RIVER_LEVEL, extent: 520, color: 0x51748a, hi: 0xa9c6d2, pos: [210, 0] },
  clearings: [
    { x: -2, z: 0, r: 34 },     // house, forecourt, both service rows
    { x: -61, z: -21, r: 21 },  // upper garden plot
    { x: -61, z: 21, r: 21 },   // lower garden plot
    { x: -88, z: 0, r: 12 },    // the west lane approach
    { x: -48, z: 0, r: 13 },    // the view corridor between the gardens
    { x: -30, z: 0, r: 9 },     // ...and where it meets the forecourt
    { x: -52, z: -18, r: 12 },  // the quarter and its yard
    { x: -22, z: 36, r: 15 },   // stable yard and paddock
    { x: -95, z: -30, r: 26 },  // the ploughed corn ground
    { x: -45, z: 42, r: 16 },   // the orchard rows
    { x: 30, z: 9, r: 8 },      // the wharf track where it leaves the lawn
    { x: 52, z: 16, r: 15 },    // the landing and fishery
  ],
  sky: {
    zenith: 0x3f7ec2, horizon: 0xd8e6e2, sunColor: 0xfff2c8,
    sunAzimuth: -2.4, sunElevation: 0.95, sunIntensity: 2.5, ambient: 1.25,
    fogColor: 0xdde8e6, fogNear: 110, fogFar: 380, haze: 0.5,
  },

  build(ctx) {
    const { place, height, animate } = ctx;
    const g2 = (x: number, z: number) => height(x, z);
    const putPerson = (spec: E.PersonSpec, x: number, z: number, yaw: number) => {
      const pr = E.person(spec);
      place(pr.group, x, z, yaw);
      animate(pr.animate);
    };

    // ---- THE MANSION (R.1–R.4) --------------------------------------------
    // Facade per the house itself, filtered to 1775: rusticated coursing,
    // dark-green shutters, cornice, the Georgian door surround. NO west
    // pediment or oculus (that gable is 1778 work, like the cupola), no
    // colonnades, no piazza.
    const mansion = E.building({
      w: 22, d: 9.5, stories: 2, storyH: 3.1,
      wall: V.white, roof: V.roofSlate, roofType: 'hip', roofH: 3.5, ridgeFrac: 0.6,
      windowsX: 7, door: { face: 's', bay: 2, pediment: true, leafless: true },
      dormers: 4, chimneys: ['e', 'w'], shutters: true, plinth: 0.5,
      courses: true, cornice: true, roofTex: shingleTex(),
    });
    mansion.rotation.y = Math.PI / 2; // door face now looks west (−x)
    place(mansion, 0, 0, Math.PI / 2);

    // The east door surround (the passage runs straight through the house)
    // and stone steps at both thresholds.
    const eastDoor = E.panelDoor(1.1, 2.15, false, true);
    eastDoor.position.set(4.78, g2(0, 0) + 0.5, 3.14);
    eastDoor.rotation.y = Math.PI / 2;
    ctx.scene.add(eastDoor);

    // THE REAL DOORS: hinged maroon six-panel leaves that swing inward as the
    // player approaches, and close again behind them. Hinge on the north jamb.
    const doorBase = g2(0, 0) + 0.52;
    const mkDoor = (hx: number, openSign: number) => {
      const hinge = new THREE.Group();
      const leaf = E.doorLeaf(1.06, 2.12);
      // leaf extends +x from its hinge stile; aim it along +z (south, across the gap)
      leaf.rotation.y = -Math.PI / 2;
      hinge.add(leaf);
      hinge.position.set(hx, doorBase, 2.62);
      ctx.scene.add(hinge);
      let angle = 0;
      animate((_t, dt, cam) => {
        const near = cam ? Math.hypot(cam.x - hx, cam.z - 3.14) < 3.6 : false;
        const target = near ? openSign * 1.85 : 0;
        angle += (target - angle) * (1 - Math.exp(-dt / 0.22));
        hinge.rotation.y = angle;
      });
    };
    mkDoor(-4.72, 1);   // west door opens inward, east
    mkDoor(4.72, -1);   // east door opens inward, west
    for (const [sx, dx] of [[-1, -5.15], [1, 5.15]] as const) {
      void sx;
      for (let s = 0; s < 2; s++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(0.5 - s * 0.1, 0.24, 1.7), K.mat(V.stone));
        step.position.set(dx + (dx > 0 ? -0.1 : 0.1) * s, g2(dx, 3.14) + 0.12 + s * 0.22, 3.14);
        ctx.scene.add(step);
      }
    }

    // ---- THE INTERIOR — two floors and the stair (walk in the west door) --
    const interior = buildInterior({ groundY: g2(0, 0), box: ctx.box });
    ctx.scene.add(interior.group);
    ctx.setHeightOverride(interior.heightAt);

    // The raw south wing: tan cladding over the southern bays (R.4).
    for (const face of [-1, 1]) {
      const cl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.4, 6.4), K.mat(V.rawSiding));
      cl.position.set(face * 4.85, g2(0, 0) + 0.5 + 3.2, 7.7);
      ctx.scene.add(cl);
    }
    const clS = new THREE.Mesh(new THREE.BoxGeometry(9.55, 6.4, 0.18), K.mat(V.rawSiding));
    clS.position.set(0, g2(0, 0) + 0.5 + 3.2, 11.05);
    ctx.scene.add(clS);
    const scaf = E.scaffolding(9, 7);
    place(scaf, 0, 12.6, 0);
    place(E.lumberYard(), 7, 17, 0.4);
    // Lund Washington and Lanphier's carpenters at the south end (R.4, R.11)
    putPerson({ dress: 'coat', color: 0x5a4a38, pose: 'stand', hat: 'tricorne', seed: 1 }, 4.5, 15.5, 2.4);
    putPerson({ dress: 'shirt', color: V.linen, pose: 'carry', hat: 'none', seed: 2 }, 3, 18, -0.5);
    putPerson({ dress: 'shirt', color: 0xb3a683, pose: 'bend', hat: 'straw', seed: 3 }, 8.5, 14, 2.9);

    // ---- THE SERVICE ROWS (R.5) — a lane-width off the house corners ------
    const dep = (w: number, chim: boolean, x: number, z: number, yaw: number) => {
      const b = E.building({
        w, d: 4.2, stories: 1, storyH: 2.6,
        wall: V.clapboard, roof: V.roofWood, roofType: 'gable', roofH: 1.8,
        windowsX: 2, door: { face: z < 0 ? 's' : 'n', bay: 0 }, chimneys: chim ? ['e'] : [],
        plinth: 0.25, wallTex: clapboardTex(), roofTex: shingleTex(),
      });
      place(b, x, z, yaw);
      ctx.box(x - w / 2 - 0.2, z - 2.3, x + w / 2 + 0.2, z + 2.3);
    };
    // north row: kitchen, wash house, dairy — walking distance, not porch furniture
    dep(6, true, -17, -13, -0.06);
    dep(5, true, -27, -14, -0.06);
    dep(4.5, false, -36, -15, -0.06);
    // south row: smokehouse, storehouse
    dep(4.5, true, -17, 13, 0.06);
    dep(5, false, -27, 14, 0.06);
    // kitchen smoke — the one fire that never goes out
    const ks = E.smokeColumn(1);
    place(ks.group, -15.8, -13.2); ks.group.position.y = g2(-17, -13) + 5.2;
    animate(ks.animate);
    for (let i = 0; i < 5; i++) place(E.chicken(), -16 + Math.sin(i * 2.4) * 2, -10.2 + Math.cos(i * 1.7) * 1.4, i);
    // laundry drying behind the wash house
    const laundry = E.laundryLine(6);
    place(laundry.group, -27, -18.5, 0.15);
    animate(laundry.animate);
    // the NEW kitchen just starting: brick footings and materials (R.5)
    const footing = new THREE.Group();
    for (const [fx, fz, fl, fr] of [[-3, 0, 6, 0], [3, 0, 6, 0], [0, -2, 0.01, 1], [0, 2, 0.01, 1]] as const) {
      const wallSeg = new THREE.Mesh(
        new THREE.BoxGeometry(fr ? 0.35 : fl, 0.5, fr ? 4 : 0.35), K.mat(V.brick));
      wallSeg.position.set(fx, 0.25, fz); footing.add(wallSeg);
    }
    place(footing, -12, -14, -0.2);

    // paling closing the forecourt at the lane's mouth
    ctx.scene.add(E.palingFence(new THREE.Vector2(-14, -9), new THREE.Vector2(-14, -3), g2));
    ctx.scene.add(E.palingFence(new THREE.Vector2(-14, 3), new THREE.Vector2(-14, 9), g2));

    // ---- THE WALLED GARDENS (R.6) — large, and well west of the house -----
    for (const sz of [-1, 1]) {
      const zc = sz * 21;
      const x0 = -78, x1 = -44, z0 = zc - 9, z1 = zc + 9;
      const walls: Array<[number, number, number, number]> = [
        [x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0],
      ];
      for (const [ax, az, bx, bz] of walls) {
        const len = Math.hypot(bx - ax, bz - az);
        const wall = new THREE.Mesh(new THREE.BoxGeometry(len + 0.3, 1.9, 0.32), texMat(V.brick, brickTex()));
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        wall.position.set(mx, g2(mx, mz) + 0.95, mz);
        wall.rotation.y = -Math.atan2(bz - az, bx - ax);
        ctx.scene.add(wall);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(len + 0.34, 0.12, 0.42), K.mat(V.stone));
        cap.position.set(mx, g2(mx, mz) + 1.95, mz);
        cap.rotation.y = wall.rotation.y;
        ctx.scene.add(cap);
        ctx.box(Math.min(ax, bx) - 0.2, Math.min(az, bz) - 0.2, Math.max(ax, bx) + 0.2, Math.max(az, bz) + 0.2);
      }
      if (sz < 0) {
        // upper garden: fruit-and-nut rows (the parterres are 1785+)
        for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
          place(E.fruitTree(), -74 + c * 4.6, zc - 5 + r * 5, r * 7 + c);
        }
      } else {
        // lower garden: the kitchen beds
        place(E.gardenBeds(30, 15), -61, zc);
      }
    }

    // ---- THE HOUSE FOR FAMILIES (R.7) -------------------------------------
    // The two-story quarter on the north service lane. The building stands;
    // the people who lived in it are not depicted in this pass — that
    // material is gated for review, per the project's own rule (mv01.ts).
    const quarter = E.building({
      w: 12, d: 5.2, stories: 2, storyH: 2.55,
      wall: V.clapboard2, roof: V.roofWood, roofType: 'gable', roofH: 2.1,
      windowsX: 3, door: { face: 's', bay: 1 }, chimneys: ['w'], chimneyColor: V.stone,
      plinth: 0.25, wallTex: clapboardTex(), roofTex: shingleTex(),
    });
    place(quarter, -52, -18, 0.08);
    ctx.box(-58.4, -20.9, -45.6, -15.1);
    const qs = E.smokeColumn(0.7);
    place(qs.group, -57, -18); qs.group.position.y = g2(-52, -18) + 7.2;
    animate(qs.animate);
    place(E.gardenBeds(6, 4), -45, -21);
    place(E.chicken(), -47, -16, 2);
    place(E.chicken(), -46, -15, 4);

    // ---- STABLE, PADDOCK, SHEARING (R.8, R.10) ----------------------------
    const stable = E.building({
      w: 10, d: 5.5, stories: 1, storyH: 3.0,
      wall: V.clapboard, roof: V.roofWood, roofType: 'gable', roofH: 2.3,
      windowsX: 2, door: { face: 'n', bay: 0 }, chimneys: [], plinth: 0.2,
      wallTex: clapboardTex(), roofTex: shingleTex(),
    });
    place(stable, -22, 38, -0.05);
    ctx.box(-27.4, 34.9, -16.6, 41.1);
    place(E.horse(), -17, 34.5, 2.6);
    place(E.horse(0x6e5136), -26.5, 33.5, -2.0);
    putPerson({ dress: 'shirt', color: 0x8a7350, pose: 'stand', hat: 'straw', seed: 4 }, -18.5, 33.5, 2.2);
    place(E.haystack(), -28.5, 41);
    place(E.haystack(), -31, 39.5);
    // May shearing: a shearer bent over a sheep, the flock waiting (R.10)
    putPerson({ dress: 'shirt', color: V.linen, pose: 'bend', hat: 'none', seed: 5 }, -14, 40, 0.3);
    const shorn = E.sheep(); shorn.scale.set(0.9, 0.82, 0.9);
    place(shorn, -13.5, 40.8, 1.2);
    for (let i = 0; i < 6; i++) {
      place(E.sheep(), -10 + Math.sin(i * 2.1) * 3 + i * 0.9, 42.5 + Math.cos(i * 1.3) * 2.5, i * 0.8);
    }

    // ---- ORCHARD, FIELDS AND FENCES (R.10) --------------------------------
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      place(E.fruitTree(), -52 + c * 4.5, 38 + r * 4.5, (r * 6 + c) * 0.7);
    }
    const wf = (ax: number, az: number, bx: number, bz: number) =>
      ctx.scene.add(E.wormFence(new THREE.Vector2(ax, az), new THREE.Vector2(bx, bz), g2));
    wf(-125, -16, -84, -16); wf(-84, -16, -84, -48); wf(-125, -48, -84, -48);
    wf(-125, 18, -86, 18); wf(-86, 18, -86, 46); wf(-125, 46, -86, 46);
    // cattle beyond the south fence
    for (let i = 0; i < 3; i++) place(E.cow(), -94 + i * 7, 28 + (i % 2) * 5, i);
    // crows working the fresh furrows of the corn ground
    const crows = E.birds(4, 12, 18);
    place(crows.group, -95, -30); animate(crows.animate);

    // ---- THE RIVER (R.9, R.10) --------------------------------------------
    const wharfG = E.wharf(10);
    wharfG.position.set(58, RIVER_LEVEL + 0.4, 14);
    wharfG.rotation.y = Math.PI / 2;
    ctx.scene.add(wharfG);
    const boat = E.sloop();
    boat.group.position.set(67, RIVER_LEVEL + 0.15, 20);
    boat.group.rotation.y = 0.5;
    ctx.scene.add(boat.group);
    animate((t) => { boat.animate(t, 0); boat.group.position.y = RIVER_LEVEL + 0.15 + Math.sin(t * 0.6) * 0.08; });
    // the fishery, tail of the herring run: net racks, salting barrels (R.10)
    for (let i = 0; i < 3; i++) {
      const rack = new THREE.Group();
      for (const sx of [-1.4, 1.4]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 4), K.mat(V.postWood));
        p.position.set(sx, 0.8, 0); rack.add(p);
      }
      const net = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.1), K.mat(0x8a7f62));
      (net.material as THREE.Material).side = THREE.DoubleSide;
      net.position.y = 0.9; rack.add(net);
      place(rack, 50, 22 + i * 3, 0.35);
    }
    for (let i = 0; i < 5; i++) place(K.barrel(0.8, 0.36), 48 + (i % 2) * 1.3, 28 + i * 0.9);
    const gulls = E.birds(6, 10, 12);
    place(gulls.group, 56, 20); animate(gulls.animate);

    // ---- THE DEPARTURE (R.11) ---------------------------------------------
    // The chariot stands ready before the west door, the pair in the traces;
    // Martha at the threshold. The last hour of the old life.
    const coach = E.chariot();
    place(coach, -13, 3.5, Math.PI); // team facing west, down the lane
    putPerson({ dress: 'shirt', color: 0x8a7350, pose: 'stand', hat: 'none', seed: 6 }, -18.5, 3, -1.2);
    putPerson({ dress: 'gown', color: 0x6a2f3a, pose: 'stand', hat: 'cap', seed: 7 }, -6, 1.8, -1.4);
  },
};
