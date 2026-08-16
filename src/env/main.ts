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
let W = innerWidth, H = innerHeight;
renderer.setSize(W, H, false);

const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 6000);
const fp = new FirstPerson(camera, canvas, [], env.bounds);
fp.eyeHeight = 1.7;
fp.setPose(env.spawn.x, env.spawn.z, env.spawn.yaw);

const engraving = new EngravingPass(renderer, W * renderer.getPixelRatio(), H * renderer.getPixelRatio(), {
  ink: INK, paper: 0,
});

const POSES: Record<string, { x: number; z: number; yaw: number; pitch: number }> = SCENE === 'valley-forge'
  ? {
      a: { x: 0, z: 28, yaw: 0.0, pitch: 0.02 },     // into the camp
      b: { x: -22, z: 16, yaw: -0.6, pitch: 0.03 },  // along the hut row
      c: { x: 18, z: 18, yaw: 0.7, pitch: 0.03 },    // the other end + the wagon
    }
  : {
      a: { x: -42, z: 0, yaw: -Math.PI / 2, pitch: 0.02 },      // the west lane, walls either side
      b: { x: -25, z: 2, yaw: -1.45, pitch: 0.03 },             // forecourt: house, chariot, dependencies
      c: { x: 27, z: 7, yaw: 1.35, pitch: 0.02 },               // from the bluff edge, east front
      d: { x: 38, z: 8, yaw: -1.75, pitch: -0.06 },             // down the track: wharf, sloop, fishery
    };
if (SHOT) { const q = POSES[p.get('pose') ?? 'a']; fp.setPose(q.x, q.z, q.yaw); fp.pitch = q.pitch; }

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
  if (!SHOT) fp.update(dt, env.height);
  else {
    camera.position.set(fp.pos.x, fp.eyeHeight + env.height(fp.pos.x, fp.pos.z), fp.pos.z);
    const dir = new THREE.Vector3(Math.cos(fp.pitch) * -Math.sin(fp.yaw), Math.sin(fp.pitch), Math.cos(fp.pitch) * -Math.cos(fp.yaw));
    camera.lookAt(camera.position.clone().add(dir));
  }
  env.update(dt, camera, t);
  engraving.render(env.scene, camera);
  env.weather.render(renderer, camera); // particles over the composite, never through it
  if (SHOT) hud.style.display = 'none';
  else hud.style.opacity = fp.isLocked ? '0' : '1';
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
