/**
 * The world builder — turns a scene's stations into a walkable first-person camp.
 *
 * Station coordinates come from the existing scene files (x, z in 0..1). This
 * module maps that unit square onto world metres and dresses each station
 * according to its `surface`, using the prop kit. Nothing here picks a
 * coordinate by hand except the mapping constants — the layout still comes from
 * the authored stations, exactly as the 2D engine reads them.
 */

import * as THREE from 'three';
import * as K from './kit';
import type { Blocker } from './controller';

export interface Station {
  id: string;
  label: string;
  x: number;
  z: number;
  surface: 'table' | 'stack' | 'fire' | 'wall' | 'open';
  focal?: boolean;
}

// unit square (x,z in 0..1) -> world metres. z=0 is near the player, z=1 far.
const SPAN_X = 34;
const SPAN_Z = 44;
export function toWorld(x: number, z: number): { x: number; z: number } {
  return { x: (x - 0.5) * SPAN_X, z: (0.5 - z) * SPAN_Z + 6 };
}

export interface BuiltWorld {
  scene: THREE.Scene;
  blockers: Blocker[];
  groundHeight: (x: number, z: number) => number;
  spawn: { x: number; z: number; yaw: number };
  stationMarks: Array<{ id: string; label: string; x: number; z: number }>;
}

export function buildWorld(stations: Station[]): BuiltWorld {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa8cbdd); // clean daylight sky
  scene.fog = new THREE.Fog(0xbcd6e0, 55, 150);

  const blockers: Blocker[] = [];
  const stationMarks: BuiltWorld['stationMarks'] = [];
  const mud = stations.map((s) => { const w = toWorld(s.x, s.z); return { x: w.x, z: w.z, r: 3.5 }; });

  // --- ground, water, town ------------------------------------------------
  const groundMesh = K.ground(96, mud);
  scene.add(groundMesh);
  // sample the ground undulation the same way the mesh was built
  const groundHeight = (x: number, z: number) =>
    Math.sin(x * 0.12) * 0.25 + Math.cos((-z) * 0.09) * 0.3 + Math.sin((x + (-z)) * 0.3) * 0.08;

  // the water sits low, off to the west (−x) and beyond the far edge
  const w = K.water(160);
  w.position.set(-46, -1.2, -20);
  scene.add(w);
  const town = K.distantTown(90);
  town.position.set(-64, -1.0, -34);
  scene.add(town);
  // a couple of framing trees
  const t1 = K.tree(6); t1.position.set(15, 0, 12); scene.add(t1);
  const t2 = K.tree(5); t2.position.set(-14, 0, 16); scene.add(t2);

  // a flag over headquarters
  const flag = K.flagpole(7);

  // --- dress each station -------------------------------------------------
  for (const s of stations) {
    const p = toWorld(s.x, s.z);
    const y = groundHeight(p.x, p.z);
    const place = (g: THREE.Object3D, dx = 0, dz = 0, block = 0, rot = 0) => {
      g.position.set(p.x + dx, y, p.z + dz);
      g.rotation.y = rot;
      scene.add(g);
      if (block > 0) blockers.push({ x: p.x + dx, z: p.z + dz, r: block });
    };
    stationMarks.push({ id: s.id, label: s.label, x: p.x, z: p.z });

    switch (s.surface) {
      case 'fire': {
        place(K.campfire(), 0, 0, 0.9);
        // a couple of soldiers warming themselves
        place(K.figure({ coat: K.C.coatTan, musket: false }), 1.6, 0.4, 0.4, -2.2);
        place(K.figure({ coat: K.C.coatBlue }), -1.4, 0.8, 0.4, 2.4);
        place(K.barrel(), 2.0, -1.6, 0.5);
        break;
      }
      case 'table': {
        const rot = s.focal ? -0.3 : Math.PI;
        place(K.trestleTable(), 0, 0, 1.2, rot);
        place(K.crate(), 1.8, 0.6, 0.5);
        place(K.barrel(), -1.9, 0.3, 0.5);
        place(K.figure({ coat: s.focal ? K.C.coatBuff : K.C.coatBlue }), 0.2, 1.1, 0.4, s.focal ? 2.9 : 0.2);
        if (s.id === 'hq') { flag.position.set(p.x + 3, y, p.z - 1); scene.add(flag); }
        break;
      }
      case 'stack': {
        if (s.id === 'arms') {
          place(K.musketStack(4), 0, 0, 0.6);
          place(K.figure({ coat: K.C.coatBlue, musket: true }), 1.4, 0.5, 0.4, -1.9);
          place(K.barrel(), -1.6, -0.8, 0.5);
        } else if (s.id === 'rhodeisland') {
          // the one regiment in proper tents — a neat line of wall tents
          for (let i = 0; i < 3; i++) place(K.wallTent(), i * 4 - 4, i * 1.2, 1.4, 0.0);
        } else { // brush shelters
          for (let i = 0; i < 4; i++) {
            place(K.brushShelter(), (i % 2) * 3.2 - 1.6, Math.floor(i / 2) * 3 - 1.5, 1.2, i * 0.5);
          }
          place(K.figure({ coat: K.C.coatTan, hat: false }), 0.5, 2.5, 0.4, 1.5);
        }
        break;
      }
      case 'open': {
        // the ground falling away to the water — a bank, a bucket, one figure looking out
        place(K.barrel(0.7, 0.35), 1.2, 0.4, 0.4);
        place(K.figure({ coat: K.C.coatBlue }), 0, 0, 0.4, Math.PI); // facing the water
        break;
      }
      case 'wall':
        place(K.wallTent(), 0, 0, 1.4);
        break;
    }
  }

  // a wandering ridge-tent line to fill the mid-ground between stations
  for (let i = 0; i < 4; i++) {
    const g = K.ridgeTent(3.6, 2.8, 2.0);
    const wx = 8 + i * 3.5, wz = -6 - i * 2;
    g.position.set(wx, groundHeight(wx, wz), wz);
    g.rotation.y = -0.3;
    scene.add(g);
    blockers.push({ x: wx, z: wz, r: 1.5 });
  }

  // --- light --------------------------------------------------------------
  const sun = new THREE.DirectionalLight(0xfff3d8, 1.55);
  sun.position.set(-24, 52, 22);
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xe4e8e0, 0x7c7454, 1.05));

  // spawn between the fire and the trestle, facing up the street (into −z)
  const spawn = toWorld(0.26, 0.30);
  return { scene, blockers, groundHeight, spawn: { x: spawn.x, z: spawn.z, yaw: 0 }, stationMarks };
}
