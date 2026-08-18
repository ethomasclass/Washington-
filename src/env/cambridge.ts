/**
 * CB-01 in three dimensions — the camp at Cambridge, July 1775.
 *
 * The art bible is Rev. William Emerson's letter: shelters "as different in
 * their form as the owners are in their dress" — boards, sailcloth, stone and
 * turf, brush, and huts woven "in the manner of a basket" — against ONE
 * brigade (Greene's Rhode Islanders) in proper tents in regular streets. The
 * scene's whole argument is that contrast: an army-shaped crowd, and inside
 * it one patch that already looks like an army.
 *
 * Dress is July 1775: browns, greys, homespun — no uniforms, no blue. The
 * riflemen's hunting shirts have not arrived yet.
 *
 * Geography: the Common and its camp on the high ground; Harvard's brick
 * blocks (emptied of scholars, full of soldiers) to the north; east the land
 * falls to the tidal Charles — a sheet of water and mudflat — and Boston sits
 * two miles off, a low silhouette pricked by steeples, Christ Church tallest.
 * You besiege a skyline you cannot touch.
 */

import * as THREE from 'three';
import type { SceneDef } from './scene';
import { fbm } from './noise';
import * as K from '../fp/kit';
import * as E from './vernon-kit';
import * as B from './boston-kit';
import { prng } from './noise';
import { canvasTex, brickTex, shingleTex } from './textures';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

const RIVER_LEVEL = -3.6;
const BANK = 46;      // x where the common falls toward the flats
const WATER = 78;     // x where the tide stands

function segDist(x: number, z: number, ax: number, az: number, bx: number, bz: number): number {
  const vx = bx - ax, vz = bz - az;
  const t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0, 1);
  return Math.hypot(x - (ax + vx * t), z - (az + vz * t));
}

function elevation(x: number, z: number): number {
  let h = fbm(x * 0.016 + 40, z * 0.016 + 7, { seed: 61, octaves: 5 }) * 4.2 + 2.2;
  const dCommon = Math.hypot(x * 0.7, z * 0.6);
  h = mixN(h, 4.0, clamp(1 - dCommon / 42, 0, 1) * 0.85);
  if (x > BANK) {
    const t = smooth(clamp((x - BANK) / (WATER - BANK), 0, 1));
    h = mixN(h, RIVER_LEVEL + 0.5, t);
  }
  return h;
}

const LANES: Array<[number, number, number, number]> = [
  [-110, 4, 40, 4],       // the road along the common, out to the flats
  [-30, 4, -34, -44],     // north to Harvard's yard
  [-6, 4, -2, 40],        // south into the shelter sprawl
  [16, 4, 22, -30],       // to the Rhode Island streets
];

function paint(x: number, z: number, h: number, slope: number, out: THREE.Color): void {
  const grass = new THREE.Color(0x8fae54);
  const worn = new THREE.Color(0xa8a060);   // July camp-trodden turf
  const lane = new THREE.Color(0x9a8a68);
  const flats = new THREE.Color(0x94886a);  // tidal mud
  const marsh = new THREE.Color(0x7d8a52);

  const n = fbm(x * 0.08, z * 0.08, { seed: 9 });
  out.copy(grass).lerp(worn, n * 0.45);
  // the camp has trodden the common bare around the fires and streets
  const wear = clamp(1 - Math.hypot((x - 2) * 0.9, (z - 8) * 0.8) / 34, 0, 1);
  out.lerp(worn, wear * 0.55);

  let laneT = 0;
  for (const [ax, az, bx, bz] of LANES) {
    laneT = Math.max(laneT, clamp(1 - segDist(x, z, ax, az, bx, bz) / 2.6, 0, 1));
  }
  out.lerp(lane, smooth(laneT) * 0.8);

  if (x > BANK + 4) {
    const t = clamp((x - BANK - 4) / (WATER - BANK - 4), 0, 1);
    out.lerp(marsh, smooth(t) * 0.8);
    if (h < RIVER_LEVEL + 1.2) out.lerp(flats, 0.75);
  }
  out.lerp(new THREE.Color(0x6d5638), clamp((slope - 0.35) * 2.2, 0, 1));
}

export const CAMBRIDGE_CAMP: SceneDef = {
  id: 'cambridge',
  name: 'The camp at Cambridge — July 1775',
  bounds: 140,
  defaultWeather: 'clear',
  spawn: { x: -34, z: 6, yaw: -Math.PI / 2 },
  elevation,
  paint,
  treeCount: 120,
  water: { level: RIVER_LEVEL, extent: 480, color: 0x5d7a86, hi: 0xb0c8ce, pos: [200, 0] },
  clearings: [
    { x: 0, z: 8, r: 42 },      // the common and the camp
    { x: -34, z: -40, r: 20 },  // Harvard's yard
    { x: 24, z: -22, r: 20 },   // the Rhode Island streets
    { x: -60, z: 4, r: 10 },    // the west road
    { x: 60, z: 0, r: 30 },     // the flats stay open for the vista
  ],
  sky: {
    zenith: 0x4585c4, horizon: 0xdde8e0, sunColor: 0xfff0be,
    sunAzimuth: -2.0, sunElevation: 1.02, sunIntensity: 2.4, ambient: 1.2,
    fogColor: 0xe2ead8, fogNear: 120, fogFar: 420, haze: 0.65,
  },

  build(ctx) {
    const { place, height, animate } = ctx;
    const g2 = (x: number, z: number) => height(x, z);
    const rand = prng(775);
    const putPerson = (spec: E.PersonSpec, x: number, z: number, yaw: number) => {
      const pr = E.person(spec);
      place(pr.group, x, z, yaw);
      animate(pr.animate);
    };
    // July 1775 palette: browns, greys, homespun. No blue.
    const COATS = [0x6b5334, 0x7a6a4a, 0x59452a, 0x8a7350, 0x6d6248, 0x4f4438];
    const coat = () => COATS[Math.floor(rand() * COATS.length)];

    // ---- HARVARD'S YARD, a barracks now ------------------------------------
    for (const [hx, hz, hw] of [[-44, -44, 14], [-26, -48, 11], [-32, -32, 9]] as const) {
      const hall = E.building({
        w: hw, d: 7, stories: 3, storyH: 2.7,
        wall: 0x8d5138, roof: 0x5a4a3a, roofType: 'hip', roofH: 2.6, ridgeFrac: 0.6,
        windowsX: Math.max(3, Math.round(hw / 3)), door: { face: 's', bay: 1, pediment: true },
        chimneys: ['e', 'w'], plinth: 0.4, cornice: true,
        wallTex: brickTex(), roofTex: shingleTex(),
      });
      place(hall, hx, hz, 0.05);
      ctx.box(hx - hw / 2 - 0.3, hz - 3.8, hx + hw / 2 + 0.3, hz + 3.8);
    }
    // soldiers' laundry strung between the halls
    const yl = E.laundryLine(7);
    place(yl.group, -35, -40, 0.4);
    animate(yl.animate);
    putPerson({ dress: 'shirt', color: coat(), pose: 'carry', hat: 'none', seed: 21 }, -38, -37, 0.8);

    // ---- THE COMMON: the elm, the flag, the road ---------------------------
    const elm = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 5.5, 8), K.mat(0x5a4326));
    trunk.castShadow = true; trunk.position.y = 2.75; elm.add(trunk);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6 - (i % 2) * 0.5, 0), K.mat(0x577a36));
      crown.castShadow = true;
      crown.position.set(Math.cos(a) * 1.8, 6.2 + Math.sin(i * 2.2) * 1.1, Math.sin(a) * 1.8);
      elm.add(crown);
    }
    place(elm, -18, -6, 0);
    ctx.box(-18.9, -6.9, -17.1, -5.1);
    place(K.flagpole(7), -14, -3);

    // ---- THE MESS FIRES — the near end of the street -----------------------
    for (let i = 0; i < 3; i++) {
      const fx = -8 + i * 7, fz = 12 + (i % 2) * 4;
      place(K.campfire(), fx, fz);
      ctx.box(fx - 0.8, fz - 0.8, fx + 0.8, fz + 0.8);
      const sm = E.smokeColumn(0.8);
      place(sm.group, fx, fz); sm.group.position.y = g2(fx, fz) + 1.2;
      animate(sm.animate);
      putPerson({ dress: 'shirt', color: coat(), pose: i % 2 ? 'bend' : 'stand', hat: i === 1 ? 'straw' : 'none', seed: 30 + i }, fx + 1.6, fz + 0.6, -2.0 + i);
      putPerson({ dress: 'coat', color: coat(), pose: 'stand', hat: 'tricorne', seed: 40 + i }, fx - 1.5, fz + 1, 1.9 - i * 0.4);
    }

    // ---- THE QUARTERMASTER'S TRESTLE — the depot ---------------------------
    place(K.trestleTable(), 6, 2, -0.3);
    ctx.box(4.8, 1.3, 7.2, 2.7);
    for (let i = 0; i < 6; i++) place(K.barrel(), 9 + (i % 3) * 1.1, 0.5 + Math.floor(i / 3) * 1.2, i);
    place(K.crate(0.9), 12, 2.2, 0.4);
    place(K.crate(0.7), 12.6, 1.2, 0.9);
    place(K.wagon(), 16, 5, 0.3);
    ctx.box(14.5, 3.3, 17.5, 6.7);
    putPerson({ dress: 'coat', color: 0x4f4438, pose: 'stand', hat: 'tricorne', seed: 50 }, 5.5, 3.6, 2.6);
    putPerson({ dress: 'shirt', color: coat(), pose: 'carry', hat: 'none', seed: 51 }, 8.5, 3.4, -0.8);

    // ---- EMERSON'S SHELTERS — the sprawl, no two alike ---------------------
    // Dense on purpose: at eye level a camp is measured in shelters per
    // glance, and a sparse scatter reads as an empty park. Rough rows with
    // crooked gaps — pitched in a hurry, not surveyed.
    const placedShelters: Array<[number, number]> = [];
    let tries = 0;
    while (placedShelters.length < 58 && tries < 400) {
      tries++;
      const a = rand() * Math.PI * 2;
      const r = 5 + rand() * 21;
      const sx = -2 + Math.cos(a) * r * 1.25 + (rand() - 0.5) * 3;
      const sz = 23 + Math.sin(a) * r * 0.62 + (rand() - 0.5) * 3;
      if (sx > 32 || sz < 9) continue; // keep the road and the RI streets clear
      if (placedShelters.some(([px2, pz2]) => Math.hypot(sx - px2, sz - pz2) < 3.4)) continue;
      placedShelters.push([sx, sz]);
      const i = placedShelters.length;
      const kind = rand();
      const yaw = rand() * Math.PI * 2;
      if (kind < 0.3) place(B.boardHut(i), sx, sz, yaw);
      else if (kind < 0.55) place(B.sailclothTent(i), sx, sz, yaw);
      else if (kind < 0.75) place(K.brushShelter(), sx, sz, yaw);
      else place(B.turfHut(i), sx, sz, yaw);
      ctx.box(sx - 1.5, sz - 1.4, sx + 1.5, sz + 1.4);
      if (rand() < 0.3) {
        putPerson({
          dress: rand() < 0.5 ? 'shirt' : 'coat', color: coat(),
          pose: rand() < 0.5 ? 'stand' : 'bend', hat: rand() < 0.4 ? 'straw' : 'none',
          seed: 60 + i,
        }, sx + 2 + rand(), sz + rand() * 2 - 1, rand() * 6);
      }
    }
    // camp litter: barrels, crates, firewood, a kettle fire here and there —
    // the floor of a camp that sixteen thousand men are living on
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const r = 4 + rand() * 24;
      const lx = -2 + Math.cos(a) * r * 1.25, lz = 22 + Math.sin(a) * r * 0.6;
      if (lx > 33 || lz < 9) continue;
      const kind = rand();
      if (kind < 0.35) place(K.barrel(0.7 + rand() * 0.3, 0.3 + rand() * 0.12), lx, lz, rand() * 3);
      else if (kind < 0.6) place(K.crate(0.5 + rand() * 0.4), lx, lz, rand() * 3);
      else if (kind < 0.85) {
        // a firewood pile
        const pile = new THREE.Group();
        for (let w = 0; w < 5; w++) {
          const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 5), K.mat(0x7a6038));
          log.castShadow = true;
          log.rotation.z = Math.PI / 2; log.rotation.y = (rand() - 0.5) * 0.3;
          log.position.set(0, 0.08 + Math.floor(w / 2) * 0.14, (w % 2) * 0.16 - 0.08);
          pile.add(log);
        }
        place(pile, lx, lz, rand() * 3);
      } else place(B.stump(i + 40), lx, lz, 0);
    }
    // two more mess fires deeper in the sprawl
    for (const [fx, fz] of [[-16, 28], [8, 34]] as const) {
      place(K.campfire(), fx, fz);
      ctx.box(fx - 0.8, fz - 0.8, fx + 0.8, fz + 0.8);
      const sm2 = E.smokeColumn(0.65);
      place(sm2.group, fx, fz); sm2.group.position.y = g2(fx, fz) + 1.2;
      animate(sm2.animate);
    }
    // the wood's edge is being eaten for fuel: stumps at the camp fringe
    for (let i = 0; i < 12; i++) {
      place(B.stump(i), -40 + rand() * 20, 14 + rand() * 28, 0);
    }

    // ---- THE RHODE ISLAND STREETS — one patch that looks like an army ------
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        const tx = 16 + col * 4.2, tz = -14 - row * 6;
        place(K.ridgeTent(3.6, 2.9, 2.1, canvasTex()), tx, tz, 0.02);
        ctx.box(tx - 1.6, tz - 2, tx + 1.6, tz + 2);
      }
    }
    // the colour line and stacked arms at the street head
    for (let i = 0; i < 3; i++) place(K.musketStack(4), 15 + i * 5, -8.5, i);
    // a drill squad on the common, browns and greys in a rank
    for (let i = 0; i < 8; i++) {
      putPerson({ dress: i % 3 ? 'shirt' : 'coat', color: coat(), pose: 'stand', hat: i % 2 ? 'none' : 'tricorne', musket: true, seed: 80 + i },
        22 + i * 1.15, 6, Math.PI);
    }
    putPerson({ dress: 'coat', color: 0x4f4438, pose: 'stand', hat: 'tricorne', seed: 90 }, 26, 9.5, 0);

    // ---- the working camp: laundry, hay, sentries --------------------------
    const cl = E.laundryLine(6);
    place(cl.group, -2, 34, 0.9);
    animate(cl.animate);
    place(E.haystack(), -24, 20);
    place(E.horse(0x6e5136), -27, 22, 1.2);
    putPerson({ dress: 'shirt', color: coat(), pose: 'stand', hat: 'straw', musket: true, seed: 95 }, -46, 3, -1.5);
    putPerson({ dress: 'shirt', color: coat(), pose: 'stand', hat: 'none', musket: true, seed: 96 }, 40, 2.5, -1.6);

    // ---- BOSTON, two miles off, a skyline you cannot touch -----------------
    const boston = new THREE.Group();
    const town = K.distantTown(70);
    boston.add(town);
    // Christ Church — the tallest thing on the horizon
    const spire = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.2, 9, 2.2), K.mat(0x8d5138));
    tower.position.y = 4.5; spire.add(tower);
    const steeple = new THREE.Mesh(new THREE.ConeGeometry(1.5, 7, 6), K.mat(0xd8d2c0));
    steeple.position.y = 12.5; spire.add(steeple);
    spire.position.set(-6, 0, -8);
    boston.add(spire);
    // Beacon Hill and its mast
    const hill = new THREE.Mesh(new THREE.SphereGeometry(11, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), K.mat(0x7d8a52));
    hill.scale.set(1.6, 0.5, 1); hill.position.set(24, -0.5, 6);
    boston.add(hill);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 9, 5), K.mat(0x59452a));
    mast.position.set(24, 9.5, 6); boston.add(mast);
    boston.position.set(150, RIVER_LEVEL + 0.4, 10);
    boston.rotation.y = -0.15;
    ctx.scene.add(boston);
    // shipping in the stream
    const s1 = B.shipOfLine(0.9); s1.position.set(115, RIVER_LEVEL + 0.3, 34); s1.rotation.y = 0.4; ctx.scene.add(s1);
    const s2 = B.shipOfLine(0.7); s2.position.set(125, RIVER_LEVEL + 0.3, -26); s2.rotation.y = -1.1; ctx.scene.add(s2);
    // gulls over the flats
    const gulls = E.birds(7, 14, 13);
    place(gulls.group, 62, 6); animate(gulls.animate);
  },
};
