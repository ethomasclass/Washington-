/**
 * Environment demo — walk the reimagined scenes.
 *
 * ?scene=mount-vernon|valley-forge   ?weather=clear|rain|snow
 * ?shot=1&pose=a|b|c                 scripted vantages for screenshots
 * ?ink=0..2                          outline strength (toon line)
 *
 * Reuses the first-person controller and the outline pass; everything else is
 * the new environment engine (terrain, sky, weather, water, scatter).
 */

import * as THREE from 'three';
import { EngravingPass } from '../fp/engraving';
import { FirstPerson } from '../fp/controller';
import { SCENES, buildEnv } from './scene';
import type { WeatherKind } from './weather';

const p = new URLSearchParams(location.search);
const SCENE = p.get('scene') ?? 'mount-vernon';
const WEATHER = (p.get('weather') as WeatherKind) ?? SCENES[SCENE]?.defaultWeather ?? 'clear';
const SHOT = p.has('shot');
const INK = parseFloat(p.get('ink') ?? '0.7');

const def = SCENES[SCENE] ?? SCENES['mount-vernon'];
const env = buildEnv(def, WEATHER);

const canvas = document.getElementById('view') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
let W = innerWidth, H = innerHeight;
renderer.setSize(W, H, false);

const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 6000);
const fp = new FirstPerson(camera, canvas, [], env.bounds, env.boxes);
fp.eyeHeight = 1.7;
fp.setPose(env.spawn.x, env.spawn.z, env.spawn.yaw);

// Terrain everywhere, except where a scene declares walkable architecture —
// interior floors and stairs answer with an absolute height, chosen by the
// player's current foot height so two storeys can share an (x, z).
const groundFn = (x: number, z: number): number => {
  const o = env.heightOverride?.(x, z, fp.pos.y - fp.eyeHeight);
  return o ?? env.height(x, z);
};

const engraving = new EngravingPass(renderer, W * renderer.getPixelRatio(), H * renderer.getPixelRatio(), {
  ink: INK, paper: 0,
});

type Pose = { x: number; z: number; yaw: number; pitch: number; up?: boolean };
const SCENE_POSES: Record<string, Record<string, Pose>> = {
  'valley-forge': {
    a: { x: 0, z: 28, yaw: 0.0, pitch: 0.02 },     // into the camp
    b: { x: -22, z: 16, yaw: -0.6, pitch: 0.03 },  // along the hut row
    c: { x: 18, z: 18, yaw: 0.7, pitch: 0.03 },    // the other end + the wagon
  },
  'cambridge': {
    a: { x: -36, z: 2, yaw: -1.35, pitch: 0.0 },   // down the road into the camp
    b: { x: 4, z: 22, yaw: 0.6, pitch: 0.0 },      // the shelter sprawl from the fires
    c: { x: 10, z: -4, yaw: -2.5, pitch: 0.0 },    // the Rhode Island streets
    d: { x: 44, z: 4, yaw: -1.55, pitch: -0.02 },  // the flats: Boston across the water
  },
  'lines': {
    a: { x: -2, z: 6, yaw: -1.35, pitch: -0.02 },  // over the parapet: the whole vista
    b: { x: -8, z: 20, yaw: -0.9, pitch: 0.0 },    // the unfinished work
    c: { x: 2, z: -32, yaw: -1.2, pitch: 0.0 },    // along the line from the traverse
    d: { x: -20, z: 26, yaw: -0.5, pitch: 0.0 },   // the graves, the huts beyond
  },
  'mount-vernon': {
      a: { x: -66, z: 0, yaw: -Math.PI / 2, pitch: 0.02 },      // the west lane, walls either side
      b: { x: -32, z: 4, yaw: -1.42, pitch: 0.03 },             // forecourt: house, chariot, service rows
      c: { x: 27, z: 7, yaw: 1.35, pitch: 0.02 },               // from the bluff edge, east front
      d: { x: 38, z: 8, yaw: -1.75, pitch: -0.06 },             // down the track: wharf, sloop, fishery
      e: { x: -10.5, z: 5.5, yaw: -0.95, pitch: 0.0 },          // close: Martha, the chariot, the door
      f: { x: -3.4, z: 3.14, yaw: -Math.PI / 2, pitch: 0.0 },   // inside: the passage, from the west door
      g: { x: 1.8, z: 5.2, yaw: 1.92, pitch: 0.0 },             // inside: the study and the raw wing
      h: { x: 4.35, z: 4.3, yaw: 0.45, pitch: -0.05, up: true },// upstairs: the hall from the stairhead
      i: { x: 0.6, z: -5.0, yaw: 0.65, pitch: 0.0, up: true },  // upstairs: a bedchamber
    },
};
const POSES = SCENE_POSES[SCENE] ?? SCENE_POSES['mount-vernon'];
if (SHOT) {
  // ?px&pz&yaw&pitch override any named pose — the location scout's camera
  const q = POSES[p.get('pose') ?? 'a'] ?? POSES['a'];
  const px = p.has('px') ? parseFloat(p.get('px')!) : q.x;
  const pz = p.has('pz') ? parseFloat(p.get('pz')!) : q.z;
  fp.setPose(px, pz, p.has('yaw') ? parseFloat(p.get('yaw')!) : q.yaw);
  fp.pitch = p.has('pitch') ? parseFloat(p.get('pitch')!) : q.pitch;
  if (q.up || p.has('up')) fp.pos.y = fp.eyeHeight + 20;
}

addEventListener('resize', () => {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  engraving.setSize(W * renderer.getPixelRatio(), H * renderer.getPixelRatio());
});

const title = document.getElementById('title')!;
title.textContent = def.name.toUpperCase();
const hud = document.getElementById('hud')!;

let last = performance.now();
function loop(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now * 0.001;
  if (!SHOT) fp.update(dt, groundFn);
  else {
    camera.position.set(fp.pos.x, fp.eyeHeight + groundFn(fp.pos.x, fp.pos.z), fp.pos.z);
    const dir = new THREE.Vector3(Math.cos(fp.pitch) * -Math.sin(fp.yaw), Math.sin(fp.pitch), Math.cos(fp.pitch) * -Math.cos(fp.yaw));
    camera.lookAt(camera.position.clone().add(dir));
  }
  env.update(dt, camera, t);
  engraving.render(env.scene, camera);
  env.weather.render(renderer, camera); // particles over the composite, never through it
  if (SHOT) hud.style.display = 'none';
  else hud.classList.toggle('hidden', fp.isLocked);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
