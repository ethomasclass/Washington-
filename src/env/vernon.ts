/**
 * Mount Vernon, the first week of May 1775 — the estate he rides away from.
 *
 * ENVIRONMENT DIRECTION. The postcard Mount Vernon — piazza, cupola, red roof,
 * colonnades, bowling green — is 1777–1793 work and appears NOWHERE here. What
 * stood in May 1775 is better for this game anyway: an asymmetric house with
 * its new south wing standing raw and scaffolded, a working forecourt of
 * dependencies, and a departure by chariot that would last six years. The
 * construction is the Act 1 theme in one object: he is building a private life
 * and leaving it at the same moment.
 *
 * Orientation: the Potomac lies EAST (+x). The west approach (−x) runs between
 * the two walled gardens — which really did block the view of the house until
 * 1785 — into the forecourt. The east slope is plain and half-wooded: the deer
 * park, ha-ha walls and manicured lawn are all a decade away.
 *
 * VERIFIED — research pass, 16 Aug 2026 (mountvernon.org digital encyclopedia
 * and archaeology pages; via search excerpts, see docs note):
 *   R.1  No piazza (1777), no cupola (1778), no north wing (begun 1776):
 *        the house is 2.5 stories, ASYMMETRIC — new south wing, old north end.
 *   R.2  Roof: cypress shingles painted SLATE BLUE as of 1775; red is 1790s.
 *   R.3  Rusticated sand-painted "stone" siding since 1758 — cream-white.
 *   R.4  South addition begun spring 1774; structure up, interior unfinished
 *        in May 1775; finished by Lund Washington that winter.
 *   R.5  Four frame dependencies at angles radiating from the west corners,
 *        fenced into a forecourt; new kitchen/servants' hall rebuild just
 *        starting during 1775. No colonnades (c. 1778).
 *   R.6  Rectangular brick-walled gardens flank the west approach and block
 *        the view: lower = kitchen garden (1760s), upper = fruit-and-nut.
 *   R.7  House for Families: c. 1760, TWO-story barracks-form quarter on the
 *        north service lane; home of the Mansion House Farm's enslaved
 *        domestic and craft workers.
 *   R.8  Frame stable (the brick one is 1782, after the 1781 fire).
 *   R.9  Bluff ~125 ft over the Potomac; east slope plain, partly wooded.
 *   R.10 Wheat + corn (tobacco gone since 1766); May = corn planting, sheep
 *        shearing, tail of the shad/herring run at the shore landings.
 *   R.11 Washington left by CHARIOT on 4 May 1775. Martha stayed until
 *        November; Lund Washington managed the estate throughout the war.
 *   V.1  Enslaved population c. 1775: no census exists before 1786 (~216).
 *        "Well over 100 estate-wide, a few dozen at Mansion House Farm" is an
 *        estimate and is marked unverified for classroom use.
 */

import * as THREE from 'three';
import type { SceneDef } from './scene';
import { fbm } from './noise';
import * as K from '../fp/kit';
import * as E from './vernon-kit';
import { V } from './vernon-kit';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

// ---------------------------------------------------------------------------
// GROUND — a bluff over the Potomac, falling east
// ---------------------------------------------------------------------------

const RIVER_LEVEL = -5.2;
const BLUFF_EDGE = 30;    // x where the high ground ends
const SHORE = 60;         // x where the water begins

function segDist(x: number, z: number, ax: number, az: number, bx: number, bz: number): number {
  const vx = bx - ax, vz = bz - az;
  const t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0, 1);
  return Math.hypot(x - (ax + vx * t), z - (az + vz * t));
}

function elevation(x: number, z: number): number {
  let h = fbm(x * 0.014 + 3, z * 0.014 + 9, { seed: 41, octaves: 5 }) * 5.5 + 2.5;
  // the levelled house plateau and forecourt
  const dHouse = Math.hypot((x - 0) * 0.75, z * 0.55);
  h = mixN(h, 6.4, clamp(1 - dHouse / 36, 0, 1) * 0.92);
  // the fall to the river
  if (x > BLUFF_EDGE) {
    const t = smooth(clamp((x - BLUFF_EDGE) / (SHORE - BLUFF_EDGE), 0, 1));
    h = mixN(h, RIVER_LEVEL + 0.8, t);
  }
  // a soft ravine breaking the ground south of the lawn
  const rav = clamp(1 - segDist(x, z, 8, 32, 46, 46) / 12, 0, 1);
  h -= rav * rav * 3.0 * clamp((x - 2) / 28, 0, 1);
  return h;
}

// ---------------------------------------------------------------------------
// GROUND PAINT — lawn, lanes, fields, shore
// ---------------------------------------------------------------------------

const LANES: Array<[number, number, number, number]> = [
  [-95, 0, -12, 0],       // the west approach, between the garden walls
  [-12, 0, 6, 0],         // the forecourt to the west door
  [-14, -2, -16, -22],    // north service lane: quarter, new-kitchen works
  [-14, 2, -10, 24],      // south lane: stable and paddock
  [8, 4, 52, 14],         // the track down the bluff to the wharf
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

  const dHouse = Math.hypot(x * 0.75, z * 0.55);
  if (dHouse > 30 && x < BLUFF_EDGE) {
    const stripe = Math.sin(z * 0.9 + fbm(x * 0.05, z * 0.05, { seed: 12 }) * 2) * 0.5 + 0.5;
    const fieldCol = new THREE.Color().copy(wheat).lerp(plough, stripe > 0.5 ? 0.14 : 0);
    const corn = clamp(1 - Math.hypot((x + 56) / 26, (z + 26) / 18), 0, 1);
    fieldCol.lerp(plough, corn * 0.85);
    out.lerp(fieldCol, clamp((dHouse - 30) / 12, 0, 1));
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
  bounds: 110,
  defaultWeather: 'clear',
  spawn: { x: -50, z: 0, yaw: -Math.PI / 2 }, // on the west lane, walls either side
  elevation,
  paint,
  treeCount: 130,
  water: { level: RIVER_LEVEL, extent: 420, color: 0x51748a, hi: 0xa9c6d2, pos: [170, 0] },
  clearings: [
    { x: -2, z: 0, r: 30 },     // house and forecourt
    { x: -21, z: -12, r: 12 },  // upper garden plot
    { x: -21, z: 12, r: 12 },   // lower garden plot
    { x: -52, z: 0, r: 9 },     // the west lane approach
    { x: -17, z: -24, r: 12 },  // the quarter and its yard
    { x: -10, z: 26, r: 13 },   // stable yard and paddock
    { x: -56, z: -26, r: 22 },  // the ploughed corn ground
    { x: 30, z: 9, r: 8 },      // the wharf track where it leaves the lawn
    { x: 52, z: 14, r: 14 },    // the landing and fishery
  ],
  sky: {
    zenith: 0x3f7ec2, horizon: 0xd8e6e2, sunColor: 0xfff2c8,
    sunAzimuth: -2.4, sunElevation: 0.95, sunIntensity: 2.5, ambient: 1.25,
    fogColor: 0xdde8e6, fogNear: 100, fogFar: 340, haze: 0.5,
  },

  build(ctx) {
    const { place, height, animate } = ctx;
    const g2 = (x: number, z: number) => height(x, z);

    // ---- THE MANSION (R.1–R.4) --------------------------------------------
    // One mass, asymmetric: five old bays cream-white, two new south bays in
    // raw tan siding. Slate-blue hip roof, dormers, brick end chimneys.
    // Long axis north–south (rotated), west and east fronts plain — no piazza.
    const mansion = E.building({
      w: 22, d: 9.5, stories: 2, storyH: 3.1,
      wall: V.white, roof: V.roofSlate, roofType: 'hip', roofH: 3.5, ridgeFrac: 0.6,
      windowsX: 7, door: { face: 's', bay: 2, pediment: true },
      dormers: 4, chimneys: ['e', 'w'], shutters: false, plinth: 0.5,
    });
    mansion.rotation.y = Math.PI / 2; // door face now looks west (−x)
    place(mansion, 0, 0, Math.PI / 2);

    // The raw south wing: tan cladding over the southernmost bays (R.4) —
    // the new work, sided but not yet sanded white.
    for (const face of [-1, 1]) {
      const cl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.4, 6.4), K.mat(V.rawSiding));
      cl.position.set(face * 4.85, g2(0, 0) + 0.5 + 3.2, 7.7);
      ctx.scene.add(cl);
    }
    const clS = new THREE.Mesh(new THREE.BoxGeometry(9.55, 6.4, 0.18), K.mat(V.rawSiding));
    clS.position.set(0, g2(0, 0) + 0.5 + 3.2, 11.05);
    ctx.scene.add(clS);
    // scaffolding on the south gable, lumber below
    const scaf = E.scaffolding(9, 7);
    place(scaf, 0, 12.6, 0);
    place(E.lumberYard(), 7, 16, 0.4);
    // Lanphier's crew and Lund Washington (R.4, R.11)
    place(E.person({ dress: 'coat', color: 0x5a4a38, pose: 'stand', hat: 'tricorne' }), 4.5, 15, 2.6);
    place(E.person({ dress: 'shirt', color: V.linen, pose: 'carry', hat: 'none' }), 3, 17.5, -0.5);
    place(E.person({ dress: 'shirt', color: 0xb3a683, pose: 'carry', hat: 'straw', skin: 0x6b4a33 }), 8.5, 13.5, 2.9);

    // ---- THE FORECOURT (R.5) ----------------------------------------------
    // Four frame dependencies angled off the west corners of the house.
    const dep = (w: number, chim: boolean, x: number, z: number, yaw: number) => {
      const b = E.building({
        w, d: 4, stories: 1, storyH: 2.6,
        wall: V.clapboard, roof: V.roofWood, roofType: 'gable', roofH: 1.8,
        windowsX: 2, door: { face: 's', bay: 0 }, chimneys: chim ? ['e'] : [],
        plinth: 0.25,
      });
      place(b, x, z, yaw);
      return b;
    };
    dep(6, true, -9, -8, -0.45);   // kitchen, NW
    dep(4.5, false, -15, -12, -0.45); // dairy, beyond it
    dep(5, true, -9, 8, 0.45);     // wash house, SW
    dep(4.5, false, -15, 12, 0.45);  // storehouse
    // kitchen smoke — the fire that never goes out
    const ks = E.smokeColumn(1);
    place(ks.group, -7.8, -8.4); ks.group.position.y = g2(-9, -8) + 5.2;
    animate(ks.animate);
    // hens about the kitchen door; the cook at the threshold
    for (let i = 0; i < 5; i++) place(E.chicken(), -8 + Math.sin(i * 2.4) * 2, -5.2 + Math.cos(i * 1.7) * 1.4, i);
    place(E.person({ dress: 'gown', color: 0x7a5a44, pose: 'stand', hat: 'cap', skin: 0x6b4a33 }), -10.5, -5.6, 0.7);
    // laundry drying behind the wash house
    const laundry = E.laundryLine(6);
    place(laundry.group, -12, 15.5, 0.25);
    animate(laundry.animate);
    // the NEW kitchen just starting: brick footings and materials (R.5)
    const footing = new THREE.Group();
    for (const [fx, fz, fl, fr] of [[-3, 0, 6, 0], [3, 0, 6, 0], [0, -2, 0.01, 1], [0, 2, 0.01, 1]] as const) {
      const wallSeg = new THREE.Mesh(
        new THREE.BoxGeometry(fr ? 0.35 : fl, 0.5, fr ? 4 : 0.35), K.mat(V.brick));
      wallSeg.position.set(fx, 0.25, fz); footing.add(wallSeg);
    }
    place(footing, -20, -18, -0.4);
    place(E.person({ dress: 'shirt', color: V.linen, pose: 'bend', hat: 'none', skin: 0x6b4a33 }), -18.5, -16.5, 1.9);

    // ---- THE WALLED GARDENS (R.6) — they block the view west --------------
    // Upper (north): fruit and nut trees inside brick walls.
    // Lower (south): the kitchen garden, in beds since the 1760s.
    for (const sz of [-1, 1]) {
      const zc = sz * 12;
      const x0 = -32, x1 = -12, z0 = zc - 5, z1 = zc + 5;
      const walls: Array<[number, number, number, number]> = [
        [x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0],
      ];
      for (const [ax, az, bx, bz] of walls) {
        const len = Math.hypot(bx - ax, bz - az);
        const wall = new THREE.Mesh(new THREE.BoxGeometry(len + 0.3, 1.9, 0.32), K.mat(V.brick));
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        wall.position.set(mx, g2(mx, mz) + 0.95, mz);
        wall.rotation.y = -Math.atan2(bz - az, bx - ax);
        ctx.scene.add(wall);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(len + 0.34, 0.12, 0.42), K.mat(V.stone));
        cap.position.set(mx, g2(mx, mz) + 1.95, mz);
        cap.rotation.y = wall.rotation.y;
        ctx.scene.add(cap);
      }
      if (sz < 0) {
        for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
          place(E.fruitTree(), -29 + c * 3.8, zc - 2.4 + r * 4.6, r * 5 + c);
        }
      } else {
        place(E.gardenBeds(17, 8.6), -22, zc);
        place(E.person({ dress: 'gown', color: 0x5d6a52, pose: 'bend', hat: 'cap', skin: 0x5d3f2c }), -19, zc - 1.6, 0.9);
        place(E.person({ dress: 'shirt', color: V.linen, pose: 'hoe', hat: 'straw', skin: 0x6b4a33 }), -25, zc + 2, -0.7);
      }
    }

    // ---- THE HOUSE FOR FAMILIES (R.7) -------------------------------------
    // Two-story barracks-form quarter on the north service lane. A home and a
    // workplace both; rendered with the same dignity as everything else here.
    const quarter = E.building({
      w: 11, d: 5, stories: 2, storyH: 2.55,
      wall: V.clapboard2, roof: V.roofWood, roofType: 'gable', roofH: 2.1,
      windowsX: 3, door: { face: 's', bay: 1 }, chimneys: ['w'], chimneyColor: V.stone,
      plinth: 0.25,
    });
    place(quarter, -17, -26, 0.08);
    const qs = E.smokeColumn(0.7);
    place(qs.group, -22, -26); qs.group.position.y = g2(-17, -26) + 7.2;
    animate(qs.animate);
    place(E.gardenBeds(5, 3.5), -10, -29);
    place(E.person({ dress: 'gown', color: 0x5d6a52, pose: 'carry', hat: 'cap', skin: 0x5d3f2c }), -13.5, -24, -0.8);
    place(E.person({ dress: 'shirt', color: 0xb3a683, pose: 'stand', hat: 'none', skin: 0x6b4a33 }), -19, -23.2, 0.4);
    place(E.chicken(), -12, -27.5, 2);
    place(E.chicken(), -11, -26.6, 4);

    // ---- STABLE, PADDOCK, SHEARING (R.8, R.10) ----------------------------
    const stable = E.building({
      w: 9, d: 5, stories: 1, storyH: 3.0,
      wall: V.clapboard, roof: V.roofWood, roofType: 'gable', roofH: 2.2,
      windowsX: 2, door: { face: 'n', bay: 0 }, chimneys: [], plinth: 0.2,
    });
    place(stable, -10, 27, -0.05);
    place(E.horse(), -5.5, 24, 2.6);
    place(E.horse(0x6e5136), -13.5, 23.5, -2.0);
    place(E.person({ dress: 'shirt', color: 0x8a7350, pose: 'stand', hat: 'straw', skin: 0x6b4a33 }), -7, 23.2, 2.2);
    place(E.haystack(), -15.5, 30);
    place(E.haystack(), -18, 28.5);
    // May shearing: a shearer bent over a sheep, the flock waiting
    place(E.person({ dress: 'shirt', color: V.linen, pose: 'bend', hat: 'none', skin: 0x6b4a33 }), -3, 29, 0.3);
    const shorn = E.sheep(); shorn.scale.set(0.9, 0.82, 0.9);
    place(shorn, -2.5, 29.8, 1.2);
    for (let i = 0; i < 6; i++) {
      place(E.sheep(), 1 + Math.sin(i * 2.1) * 3 + i * 0.8, 31 + Math.cos(i * 1.3) * 2.5, i * 0.8);
    }

    // ---- FIELDS AND FENCES (R.10) -----------------------------------------
    const wf = (ax: number, az: number, bx: number, bz: number) =>
      ctx.scene.add(E.wormFence(new THREE.Vector2(ax, az), new THREE.Vector2(bx, bz), g2));
    wf(-95, -14, -34, -14); wf(-34, -14, -34, -42); wf(-95, -42, -34, -42);
    wf(-95, 16, -36, 16); wf(-36, 16, -36, 40); wf(-95, 40, -36, 40);
    // corn planting on the ploughed ground
    for (let i = 0; i < 4; i++) {
      place(E.person({
        dress: 'shirt', color: i % 2 ? V.linen : 0xb3a683,
        pose: i % 2 ? 'hoe' : 'bend', hat: i === 2 ? 'straw' : 'none', skin: 0x6b4a33,
      }), -50 - i * 5, -24 + (i % 2) * 5, 0.3 + i * 0.5);
    }
    // cattle beyond the south fence
    for (let i = 0; i < 3; i++) place(E.cow(), -46 + i * 6, 26 + (i % 2) * 4, i);
    // crows working the fresh furrows
    const crows = E.birds(4, 12, 18);
    place(crows.group, -54, -26); animate(crows.animate);

    // ---- THE RIVER (R.9, R.10) --------------------------------------------
    const wharfG = E.wharf(10);
    wharfG.position.set(56, RIVER_LEVEL + 0.4, 12);
    wharfG.rotation.y = Math.PI / 2;
    ctx.scene.add(wharfG);
    const boat = E.sloop();
    boat.group.position.set(64, RIVER_LEVEL + 0.15, 18);
    boat.group.rotation.y = 0.5;
    ctx.scene.add(boat.group);
    animate((t) => { boat.animate(t, 0); boat.group.position.y = RIVER_LEVEL + 0.15 + Math.sin(t * 0.6) * 0.08; });
    // the fishery, tail of the herring run: net racks, salting barrels
    for (let i = 0; i < 3; i++) {
      const rack = new THREE.Group();
      for (const sx of [-1.4, 1.4]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 4), K.mat(V.postWood));
        p.position.set(sx, 0.8, 0); rack.add(p);
      }
      const net = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.1), K.mat(0x8a7f62));
      (net.material as THREE.Material).side = THREE.DoubleSide;
      net.position.y = 0.9; rack.add(net);
      place(rack, 50, 20 + i * 3, 0.35);
    }
    for (let i = 0; i < 5; i++) place(K.barrel(0.8, 0.36), 48 + (i % 2) * 1.3, 26 + i * 0.9);
    place(E.person({ dress: 'shirt', color: V.linen, pose: 'bend', hat: 'none', skin: 0x6b4a33 }), 51, 23, -1.9);
    place(E.person({ dress: 'shirt', color: 0xb3a683, pose: 'carry', hat: 'straw', skin: 0x6b4a33 }), 53.5, 19, 2.6);
    const gulls = E.birds(6, 10, 12);
    place(gulls.group, 56, 18); animate(gulls.animate);

    // ---- THE DEPARTURE (R.11) ---------------------------------------------
    // The chariot stands ready at the forecourt gate, the pair in the traces.
    // Martha at the west door. This is the last hour of the old life.
    const coach = E.chariot();
    place(coach, -16, 3.5, Math.PI); // team facing west, down the lane
    place(E.person({ dress: 'shirt', color: 0x8a7350, pose: 'stand', hat: 'none', skin: 0x6b4a33 }), -21, 2.8, -1.2);
    place(E.person({ dress: 'gown', color: 0x6a2f3a, pose: 'stand', hat: 'cap' }), -6, 1.8, -1.4);
    // paling closing the forecourt between the garden corners
    ctx.scene.add(E.palingFence(new THREE.Vector2(-12, -7), new THREE.Vector2(-12, -3), g2));
    ctx.scene.add(E.palingFence(new THREE.Vector2(-12, 3), new THREE.Vector2(-12, 7), g2));
  },
};
