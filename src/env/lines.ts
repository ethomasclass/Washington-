/**
 * CB-03 in three dimensions — the lines above Charlestown, November 1775.
 *
 * The scene is Prospect Hill's sector of the siege: half a mile of earth
 * thrown up by men who were not paid to dig, and beyond it a mile of water
 * you cannot cross. Its five authored stations survive intact: the traverse,
 * the parapet, the guard post, the unfinished work, and the graves.
 *
 * From the research pass (17 Aug 2026), the details that carry the history:
 *  - The works are fascines, gabions and Putnam's CHANDELIERS — timber frames
 *    packed with brushwood, earthed over. Field engineering as basketry.
 *  - EMBRASURES STAND EMPTY. The army has almost no guns and less powder;
 *    one gun in three is real. That is the whole Act 2 lesson, in artillery.
 *  - The flag on the mast is the APPEAL TO HEAVEN pine — the Grand Union
 *    does not fly until 1 January.
 *  - Across the water: burned Charlestown, "nothing standing but a heap of
 *    chimneys"; Bunker Hill crowned with a British work and blockhouses;
 *    Boston beyond with Christ Church tallest and the Copp's Hill battery;
 *    floating batteries close in, the fleet's yards crossed in the stream.
 *  - The firewood famine: stumps where trees were, fences carried off.
 *  - November: frost on the ground, bare trees, browns and blanket coats.
 */

import * as THREE from 'three';
import type { SceneDef } from './scene';
import { fbm, prng } from './noise';
import * as K from '../fp/kit';
import * as E from './vernon-kit';
import * as B from './boston-kit';
import { plankTex, shingleTex } from './textures';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

const WATER_LEVEL = -6.4;
const CREST = 8;      // x of the firing line
const SLOPE_FOOT = 58; // x where the forward slope meets the water

function elevation(x: number, z: number): number {
  // the hill: high ground behind the crest, falling east to the water
  let h = fbm(x * 0.015 + 80, z * 0.015 + 21, { seed: 77, octaves: 5 }) * 5 + 1;
  const behind = clamp(1 - Math.abs(x - (CREST - 16)) / 48, 0, 1);
  h += behind * 5.2;
  if (x > CREST) {
    const t = smooth(clamp((x - CREST) / (SLOPE_FOOT - CREST), 0, 1));
    h = mixN(h, WATER_LEVEL + 0.6, t);
  }
  // the trench floor: a shallow cut just behind the crest, along the line
  const trench = clamp(1 - Math.abs(x - (CREST - 2.2)) / 2.2, 0, 1);
  h -= trench * 0.7 * clamp(1 - Math.abs(z) / 46, 0, 1);
  return h;
}

function paint(x: number, z: number, h: number, slope: number, out: THREE.Color): void {
  const frostGrass = new THREE.Color(0x9aa06a);
  const dun = new THREE.Color(0xa89a70);
  const mud = new THREE.Color(0x6d5a3c);
  const flats = new THREE.Color(0x8a7f62);

  const n = fbm(x * 0.09, z * 0.09, { seed: 15 });
  out.copy(frostGrass).lerp(dun, n * 0.6);
  // the works and the ground behind them are churned to mud
  const churn = clamp(1 - Math.abs(x - (CREST - 3)) / 7, 0, 1) * clamp(1 - Math.abs(z) / 50, 0, 1);
  out.lerp(mud, churn * 0.7);
  if (x > SLOPE_FOOT - 6) {
    const t = clamp((x - (SLOPE_FOOT - 6)) / 10, 0, 1);
    out.lerp(flats, smooth(t) * 0.8);
  }
  out.lerp(new THREE.Color(0x5d4e34), clamp((slope - 0.33) * 2.2, 0, 1));
  void h;
}

export const THE_LINES: SceneDef = {
  id: 'lines',
  name: 'The lines above Charlestown — November 1775',
  bounds: 160,
  defaultWeather: 'clear',
  snow: 0.16, // first frost, not yet winter
  season: 'winter', // November: the trees are bare even before the snow
  spawn: { x: -14, z: 10, yaw: -Math.PI / 2 },
  elevation,
  paint,
  treeCount: 70,
  water: { level: WATER_LEVEL, extent: 560, color: 0x4d6472, hi: 0x9db4bc, pos: [220, 0] },
  clearings: [
    { x: 2, z: 0, r: 52 },      // the works and the ground behind them
    { x: 40, z: 0, r: 30 },     // the forward slope stays open — it is a field of fire
    { x: -30, z: 24, r: 14 },   // the graves and the huts
  ],
  sky: {
    zenith: 0x8fa3b4, horizon: 0xd8dcd6, sunColor: 0xf0e4bc,
    sunAzimuth: 2.6, sunElevation: 0.8, sunIntensity: 1.9, ambient: 1.5,
    fogColor: 0xd4d8d0, fogNear: 90, fogFar: 380, haze: 0.5,
  },

  build(ctx) {
    const { place, height, animate } = ctx;
    const g2 = (x: number, z: number) => height(x, z);
    const rand = prng(1775);
    const putPerson = (spec: E.PersonSpec, x: number, z: number, yaw: number) => {
      const pr = E.person(spec);
      place(pr.group, x, z, yaw);
      animate(pr.animate);
    };
    const COATS = [0x59452a, 0x6d6248, 0x4f4438, 0x6b5334, 0x7a6a4a];
    const coat = () => COATS[Math.floor(rand() * COATS.length)];

    // ---- THE WORKS — berm, gabions, embrasures along the crest -------------
    // Five berm segments with embrasure gaps between them; gabions crown the
    // berm; one gun in three is real, and it shows.
    const segZ = [-38, -20, -2, 16, 34];
    for (const bz of segZ) {
      const seg = B.berm(15, 1.8, 3.4);
      seg.rotation.y = Math.PI / 2;
      place(seg, CREST, bz, Math.PI / 2);
      ctx.box(CREST - 1.9, bz - 7.8, CREST + 1.9, bz + 7.8);
      for (let i = 0; i < 5; i++) {
        place(B.gabion(1.1, 0.4), CREST - 0.6, bz - 6 + i * 3 + rand() * 0.5, rand() * 3);
      }
    }
    // the embrasures: two guns, one empty carriage, one blinded with gabions
    const emb = [(segZ[0] + segZ[1]) / 2, (segZ[1] + segZ[2]) / 2, (segZ[2] + segZ[3]) / 2, (segZ[3] + segZ[4]) / 2];
    place(B.cannon(), CREST - 1.6, emb[0], Math.PI / 2);
    place(B.cannon(), CREST - 1.6, emb[2], Math.PI / 2);
    place(B.cannon(true), CREST - 1.6, emb[1], Math.PI / 2);   // carriage, no gun
    place(B.gabion(1.1, 0.42), CREST - 0.3, emb[3], 1);        // blinded
    place(B.gabion(1.1, 0.42), CREST - 0.3, emb[3] + 0.9, 2);
    // abatis down the forward slope
    for (const bz of [-30, -12, 6, 24]) {
      const ab = B.abatis(9);
      ab.rotation.y = Math.PI / 2;
      place(ab, CREST + 6.5, bz, Math.PI / 2);
    }

    // ---- THE TRAVERSE — where the trench turns back ------------------------
    const trav = B.berm(9, 1.5, 2.8);
    place(trav, CREST - 5, -44, 0.15);
    ctx.box(CREST - 9.5, -45.5, CREST - 0.5, -42.5);
    place(B.fascines(4), CREST - 7, -41, 0.4);
    putPerson({ dress: 'coat', color: coat(), pose: 'stand', hat: 'tricorne', musket: true, seed: 11 }, CREST - 3, -40, -1.3);

    // ---- THE PARAPET — the spyglass stands here ----------------------------
    // A rest of crossed poles and the glass, pointed at the town you cannot enter.
    const glass = new THREE.Group();
    const tripodLegs = 3;
    for (let i = 0; i < tripodLegs; i++) {
      const a = (i / tripodLegs) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.5, 5), K.mat(0x59452a));
      leg.position.set(Math.cos(a) * 0.35, 0.72, Math.sin(a) * 0.35);
      leg.rotation.z = Math.cos(a) * 0.4; leg.rotation.x = -Math.sin(a) * 0.4;
      glass.add(leg);
    }
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.9, 7), K.mat(0x6b5334));
    tube.rotation.z = Math.PI / 2 - 0.12; tube.rotation.y = -0.2;
    tube.position.y = 1.45;
    glass.add(tube);
    place(glass, CREST - 1.2, -2, 0);
    putPerson({ dress: 'coat', color: 0x3d4a5c, pose: 'stand', hat: 'tricorne', seed: 12 }, CREST - 2.2, -3.2, -1.2);

    // ---- THE GUARD POST — the far end of the line --------------------------
    place(K.campfire(), CREST - 5, 42);
    const gs = E.smokeColumn(0.7);
    place(gs.group, CREST - 5, 42); gs.group.position.y = g2(CREST - 5, 42) + 1.2;
    animate(gs.animate);
    place(K.musketStack(4), CREST - 3.5, 44, 0.4);
    putPerson({ dress: 'coat', color: coat(), pose: 'stand', hat: 'none', musket: true, seed: 13 }, CREST - 6.5, 43.5, 2.5);
    putPerson({ dress: 'coat', color: coat(), pose: 'stand', hat: 'tricorne', seed: 14 }, CREST - 4, 41, -2.2);

    // ---- THE UNFINISHED WORK — the scene's argument ------------------------
    // Gabions half set, chandeliers waiting for earth, fascine piles, and the
    // men still digging in November. Nobody paid them to dig.
    const workX = CREST - 12, workZ = 14;
    for (let i = 0; i < 6; i++) {
      place(B.gabion(1.1, 0.42), workX + (i % 3) * 1.1, workZ + Math.floor(i / 3) * 1.4, rand() * 3);
    }
    place(B.gabion(0.6, 0.42), workX + 3.4, workZ + 0.4, 1); // half built
    place(B.chandelier(), workX + 1, workZ + 3.6, 0.2);
    place(B.chandelier(), workX + 4.2, workZ + 3.9, -0.1);
    place(B.fascines(5), workX - 2.2, workZ + 2, 0.9);
    putPerson({ dress: 'shirt', color: coat(), pose: 'hoe', hat: 'none', seed: 15 }, workX + 2, workZ - 1.6, 0.4);
    putPerson({ dress: 'shirt', color: coat(), pose: 'carry', hat: 'straw', seed: 16 }, workX - 1, workZ + 4.8, -0.7);
    putPerson({ dress: 'coat', color: coat(), pose: 'bend', hat: 'none', seed: 17 }, workX + 4.6, workZ + 1.2, 2.2);

    // ---- THE GRAVES — eleven boards on the reverse slope -------------------
    for (let i = 0; i < 11; i++) {
      place(B.graveBoard(i), -28 + (i % 4) * 1.7, 22 + Math.floor(i / 4) * 2.2, (rand() - 0.5) * 0.4);
    }
    putPerson({ dress: 'coat', color: 0x4f4438, pose: 'stand', hat: 'none', seed: 18 }, -25, 27.5, -0.5);

    // ---- BEHIND THE LINE: huts, the mast, the famine -----------------------
    for (let i = 0; i < 3; i++) {
      const hut = E.building({
        w: 5, d: 3.6, stories: 1, storyH: 2.3,
        wall: 0x8a7350, roof: 0x5f4a2e, roofType: 'gable', roofH: 1.5,
        windowsX: 1, door: { face: 's', bay: 0 }, chimneys: i === 1 ? ['e'] : [],
        plinth: 0.15, wallTex: plankTex(), roofTex: shingleTex(),
      });
      place(hut, -20 - i * 7, -18 - i * 3, 0.1 * i);
      ctx.box(-22.8 - i * 7, -20 - i * 3, -17.2 - i * 7, -16 - i * 3);
    }
    const hs = E.smokeColumn(0.6);
    place(hs.group, -29.5, -21.5); hs.group.position.y = g2(-27, -21) + 3.6;
    animate(hs.animate);
    for (let i = 0; i < 3; i++) place(K.ridgeTent(3.4, 2.7, 2.0), -14 - i * 4.4, -26, 0.05);
    // the Appeal to Heaven mast
    place(B.appealFlag(12), -6, -12);
    // engineering litter along the whole line: spare gabions, fascine piles,
    // earth baskets — a work site, not a museum wall
    for (let i = 0; i < 12; i++) {
      const lz = -42 + rand() * 84;
      const lx = CREST - 4 - rand() * 6;
      if (rand() < 0.55) place(B.gabion(0.5 + rand() * 0.7, 0.38), lx, lz, rand() * 3);
      else place(B.fascines(2 + Math.floor(rand() * 3)), lx, lz, rand() * 3);
    }
    // the firewood famine: stumps everywhere the wood used to be
    for (let i = 0; i < 24; i++) {
      place(B.stump(i), -44 + rand() * 52, -34 + rand() * 66, 0);
    }
    for (let i = 0; i < 4; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.9, 0.13), K.mat(0x7a6a4a));
      post.castShadow = true;
      place(post, -40 + i * 3.1, 8, 0); // posts stand; the rails are burned
    }
    place(K.wagon(), -36, -6, 0.5);
    ctx.box(-37.5, -7.7, -34.5, -4.3);

    // ---- THE VISTA — everything the spyglass names -------------------------
    // Charlestown: a heap of chimneys, directly across the water.
    const ruins = new THREE.Group();
    for (let i = 0; i < 24; i++) {
      const cr = B.chimneyRuin(i);
      cr.position.set((i % 6) * 7 + rand() * 3, 0, Math.floor(i / 6) * 6.5 + rand() * 2.5);
      cr.rotation.y = rand() * 0.5;
      ruins.add(cr);
    }
    ruins.position.set(84, WATER_LEVEL + 1.1, -42);
    ruins.rotation.y = -0.2;
    ctx.scene.add(ruins);
    // redcoat pickets in the ruins
    // (kept as colour only — tiny at this range)
    for (let i = 0; i < 3; i++) {
      const picket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.3, 0.4), K.mat(0x9c3428));
      picket.position.set(100 + i * 6, WATER_LEVEL + 1.8, -40 + i * 3);
      ctx.scene.add(picket);
    }
    // Bunker Hill: the crowned work, blockhouses, their flag
    const bunker = new THREE.Group();
    const hill = new THREE.Mesh(new THREE.SphereGeometry(20, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), K.mat(0x8a8a5e));
    hill.scale.set(1.5, 0.42, 1); bunker.add(hill);
    const fortWall = new THREE.Mesh(new THREE.BoxGeometry(16, 2.2, 12), K.mat(0x6d5a3c));
    fortWall.position.y = 8.6; bunker.add(fortWall);
    const b1 = B.blockhouse(); b1.position.set(-4, 9.7, -2); bunker.add(b1);
    const b2 = B.blockhouse(); b2.position.set(4, 9.7, 3); bunker.add(b2);
    const ukPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 8, 5), K.mat(0x59452a));
    ukPole.position.set(0, 14, 0); bunker.add(ukPole);
    const ukFly = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), K.mat(0x8c2f3a));
    (ukFly.material as THREE.Material).side = THREE.DoubleSide;
    ukFly.position.set(1.3, 16.8, 0); bunker.add(ukFly);
    bunker.position.set(124, WATER_LEVEL, -68);
    ctx.scene.add(bunker);
    // Boston: the town, Christ Church tallest, Copp's Hill, Beacon Hill's mast
    const boston = new THREE.Group();
    boston.add(K.distantTown(80));
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 10, 2.4), K.mat(0x8d5138));
    tower.position.set(-10, 5, -6); boston.add(tower);
    const steeple = new THREE.Mesh(new THREE.ConeGeometry(1.6, 8, 6), K.mat(0xd8d2c0));
    steeple.position.set(-10, 14, -6); boston.add(steeple);
    const copps = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 6), K.mat(0x6d5a3c));
    copps.position.set(-24, 1.8, -2); boston.add(copps);
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 10, 5), K.mat(0x59452a));
    beacon.position.set(20, 8, 8); boston.add(beacon);
    boston.position.set(150, WATER_LEVEL + 0.5, 42);
    boston.rotation.y = -0.35;
    ctx.scene.add(boston);
    // the water: floating batteries close in, the fleet in the stream
    const fb1 = B.floatingBattery(); fb1.position.set(76, WATER_LEVEL + 0.3, -18); fb1.rotation.y = 2.6; ctx.scene.add(fb1);
    const fb2 = B.floatingBattery(); fb2.position.set(82, WATER_LEVEL + 0.3, 6); fb2.rotation.y = -0.6; ctx.scene.add(fb2);
    const s1 = B.shipOfLine(1); s1.position.set(120, WATER_LEVEL + 0.3, 10); s1.rotation.y = 0.5; ctx.scene.add(s1);
    const s2 = B.shipOfLine(0.85); s2.position.set(132, WATER_LEVEL + 0.3, 28); s2.rotation.y = 0.3; ctx.scene.add(s2);
    const s3 = B.shipOfLine(0.7); s3.position.set(140, WATER_LEVEL + 0.3, -8); s3.rotation.y = -0.9; ctx.scene.add(s3);
    // crows over the graves; nothing over the water in November
    const crows = E.birds(4, 10, 15);
    place(crows.group, -26, 24); animate(crows.animate);
  },
};
