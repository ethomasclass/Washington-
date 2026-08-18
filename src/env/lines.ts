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
import { landmass } from './landmass';

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
  // and under the water the ground keeps falling — the channel is a channel
  if (x > SLOPE_FOOT + 4) {
    h = mixN(h, WATER_LEVEL - 4, smooth(clamp((x - SLOPE_FOOT - 4) / 22, 0, 1)));
  }
  // the trench floor: a shallow cut just behind the crest, along the line
  const lineMask = clamp(1 - Math.abs(z) / 46, 0, 1);
  const trench = clamp(1 - Math.abs(x - (CREST - 2.2)) / 2.2, 0, 1);
  h -= trench * 0.7 * lineMask;
  // and the DITCH in front — the earth the parapet was made of came from
  // somewhere, and a work without its ditch reads as a garden wall
  const ditch = clamp(1 - Math.abs(x - (CREST + 3.8)) / 1.8, 0, 1);
  h -= ditch * ditch * 0.95 * lineMask;
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

    // ---- THE WORKS — one continuous earthwork along the crest --------------
    // A real siege parapet: an unbroken irregular rampart (overlapping,
    // jittered, sunk segments so no seam or clean prism reads), gabions
    // embedded IN its face, embrasures CUT THROUGH it with gabion cheeks, the
    // ditch it was dug from in front, a firing step behind. One embrasure has
    // a gun; one has an empty carriage waiting for a gun that does not exist;
    // one is blinded with gabions. That ratio is the powder famine.
    const EMB: number[] = [-30, -11, 21];
    const inGap = (z: number) => EMB.some((e) => Math.abs(z - e) < 2.1);
    for (let bz = -46; bz <= 46; bz += 5.8) {
      if (inGap(bz)) continue;
      const seg = B.berm(8.6 + rand() * 1.6, 1.55 + rand() * 0.5, 3.5);
      seg.rotation.y = Math.PI / 2 + (rand() - 0.5) * 0.05;
      place(seg, CREST + (rand() - 0.5) * 0.7, bz, Math.PI / 2);
      seg.position.y -= 0.35; // grown out of the ground, not laid on it
    }
    // gabions embedded in the forward face
    for (let bz = -44; bz <= 44; bz += 4.3) {
      if (inGap(bz)) continue;
      const gb = B.gabion(1.05, 0.4);
      place(gb, CREST + 1.3 + rand() * 0.3, bz + rand() * 0.8, rand() * 3);
      gb.position.y -= 0.42;
    }
    // the embrasures: gabion cheeks either side of each cut
    for (const e of EMB) {
      for (const s of [-1, 1]) {
        const g1 = B.gabion(1.1, 0.42);
        place(g1, CREST + 0.2, e + s * 1.8, rand() * 3);
        g1.position.y -= 0.2;
        const g2 = B.gabion(1.0, 0.4);
        place(g2, CREST + 1.1, e + s * 1.6, rand() * 3);
        g2.position.y -= 0.35;
      }
    }
    place(B.cannon(), CREST - 1.4, EMB[1], Math.PI / 2);        // the gun
    place(B.cannon(true), CREST - 1.4, EMB[2], Math.PI / 2);    // the carriage
    for (let i = 0; i < 3; i++) {                                // the blind
      const gb = B.gabion(1.1, 0.42);
      place(gb, CREST + 0.3, EMB[0] - 1 + i, rand() * 3);
      gb.position.y -= 0.15;
    }
    // the firing step behind the parapet
    for (let bz = -44; bz <= 44; bz += 8.4) {
      if (inGap(bz + 2)) continue;
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.42, 8), K.mat(0x77653f));
      step.receiveShadow = true;
      place(step, CREST - 1.8, bz, 0);
      step.position.y -= 0.06;
    }
    // collision: the rampart is solid except at the cuts
    let cStart = -46.5;
    for (const e of [...EMB, 47]) {
      if (e - 2.1 > cStart) ctx.box(CREST - 2.2, cStart, CREST + 2.2, e - 2.1);
      cStart = e + 2.1;
    }
    // abatis beyond the ditch
    for (const bz of [-38, -20, 2, 30]) {
      const ab = B.abatis(11);
      ab.rotation.y = Math.PI / 2;
      place(ab, CREST + 7, bz, Math.PI / 2);
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
      // half of them stand empty, waiting on earth nobody has time to dig
      place(B.gabion(1.1, 0.42, i % 2 === 0), workX + (i % 3) * 1.1, workZ + Math.floor(i / 3) * 1.4, rand() * 3);
    }
    place(B.gabion(1.05, 0.42, true), workX + 3.4, workZ + 0.4, 1); // an empty basket
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
    // the Appeal to Heaven mast, working in the wind
    const mast = B.appealFlag(12);
    place(mast, -6, -12);
    animate((t) => {
      mast.rotation.y = Math.sin(t * 0.5) * 0.12 + Math.sin(t * 1.7) * 0.05;
    });
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

    // ---- THE VISTA — a mile off, across real water -------------------------
    // The Charlestown peninsula sits FAR out: its near shore starts ~140 m
    // past the ditch, and the fog does the rest — silhouettes and smoke read,
    // windows do not. Plateaus keep the ruins and the fort from burying
    // their edges in the hillside.
    const penC = { x: 215, z: -62 };
    const pen = landmass({
      w: 150, d: 105, peak: 15, seed: 21, crestX: 0.45, crestZ: -0.5,
      shore: 0xa89a6e, field: 0x8f8a5c, crest: 0x7d7a4c,
      plateaus: [
        { x: -30, z: 24, r: 30, h: 2.2 },   // the burned town's ground
        { x: 30, z: -26, r: 22, h: 12.5 },  // Bunker Hill's crown
      ],
    });
    pen.mesh.position.set(penC.x, WATER_LEVEL, penC.z);
    ctx.scene.add(pen.mesh);
    const onPen = (o: THREE.Object3D, lx: number, lz: number, yaw = 0) => {
      o.position.set(penC.x + lx, WATER_LEVEL + pen.heightAt(lx, lz), penC.z + lz);
      o.rotation.y = yaw;
      ctx.scene.add(o);
    };
    // the heap of chimneys on the town plateau, in the old street grid
    for (let i = 0; i < 30; i++) {
      const lx = -46 + (i % 6) * 7 + rand() * 2.5;
      const lz = 12 + Math.floor(i / 5) * 6 + rand() * 2;
      onPen(B.chimneyRuin(i), lx, lz, rand() * 0.5 - 0.2);
    }
    // five months cold, still smoking faintly where the cellars smoulder
    for (const [sx, sz] of [[-38, 20], [-22, 28], [-10, 16]] as const) {
      const sm = E.smokeColumn(0.28);
      sm.group.scale.setScalar(3.2);
      onPen(sm.group, sx, sz);
      sm.group.position.y += 1.5;
      animate(sm.animate);
    }
    // Bunker Hill's crown: the fort, the blockhouses, their colours
    const fortWall = new THREE.Mesh(new THREE.BoxGeometry(18, 2.6, 14), K.mat(0x6d5a3c));
    onPen(fortWall, 30, -26); fortWall.position.y += 1.1;
    const b1 = B.blockhouse(); onPen(b1, 25, -29);
    const b2 = B.blockhouse(); onPen(b2, 34, -22);
    const ukPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 10, 5), K.mat(0x59452a));
    onPen(ukPole, 30, -26); ukPole.position.y += 6.5;
    const ukFly = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.6), K.mat(0x8c2f3a));
    (ukFly.material as THREE.Material).side = THREE.DoubleSide;
    onPen(ukFly, 31.4, -26); ukFly.position.y += 10.5;

    // Boston: farther still, to the south-east — a hazed silhouette with the
    // spire and the beacon mast doing the talking
    const bosC = { x: 290, z: 85 };
    const bos = landmass({
      w: 150, d: 115, peak: 12, seed: 33, crestX: 0.25, crestZ: 0.25,
      shore: 0xa39872, field: 0x8f8763, crest: 0x837c52,
      plateaus: [{ x: -8, z: -10, r: 34, h: 4.2 }],
    });
    bos.mesh.position.set(bosC.x, WATER_LEVEL, bosC.z);
    ctx.scene.add(bos.mesh);
    const onBos = (o: THREE.Object3D, lx: number, lz: number, yaw = 0) => {
      o.position.set(bosC.x + lx, WATER_LEVEL + bos.heightAt(lx, lz), bosC.z + lz);
      o.rotation.y = yaw;
      ctx.scene.add(o);
    };
    onBos(K.distantTown(70), -6, -8, -0.35);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 11, 2.6), K.mat(0x8d5138));
    onBos(tower, -20, -22); tower.position.y += 5.5;
    const steeple = new THREE.Mesh(new THREE.ConeGeometry(1.8, 9, 6), K.mat(0xd8d2c0));
    onBos(steeple, -20, -22); steeple.position.y += 15.5;
    const copps = new THREE.Mesh(new THREE.BoxGeometry(11, 3.4, 7), K.mat(0x6d5a3c));
    onBos(copps, -34, -30); copps.position.y += 1.4;
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 13, 5), K.mat(0x59452a));
    onBos(beacon, 10, 12); beacon.position.y += 6;

    // the far shore closes the horizon so water never meets bare sky
    const far = landmass({
      w: 120, d: 420, peak: 10, seed: 55,
      shore: 0x9a9070, field: 0x84805a, crest: 0x6d7048, segments: 32,
    });
    far.mesh.position.set(380, WATER_LEVEL - 0.4, 0);
    ctx.scene.add(far.mesh);

    // the water: floating batteries close in (documented), the fleet riding
    // FAR out in the stream at true scale
    const fb1 = B.floatingBattery(); fb1.position.set(80, WATER_LEVEL + 0.3, -20); fb1.rotation.y = 2.6; ctx.scene.add(fb1);
    const fb2 = B.floatingBattery(); fb2.position.set(92, WATER_LEVEL + 0.3, 10); fb2.rotation.y = -0.6; ctx.scene.add(fb2);
    const s1 = B.shipOfLine(1); s1.position.set(170, WATER_LEVEL + 0.2, -4); s1.rotation.y = 0.55; ctx.scene.add(s1);
    const s2 = B.shipOfLine(0.85); s2.position.set(225, WATER_LEVEL + 0.2, 30); s2.rotation.y = 0.3; ctx.scene.add(s2);
    const s3 = B.shipOfLine(0.75); s3.position.set(250, WATER_LEVEL + 0.2, -35); s3.rotation.y = -0.8; ctx.scene.add(s3);
    // crows over the graves; nothing over the water in November
    const crows = E.birds(4, 10, 15);
    place(crows.group, -26, 24); animate(crows.animate);
    // the Appeal to Heaven standard works in the wind
    void 0;
  },
};
