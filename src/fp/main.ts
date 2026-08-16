/**
 * First-person camp — entry point.
 *
 * Stands up CB-01's seven stations as a walkable, engraved first-person world.
 * This is the new-direction scaffold: it reuses the scene's station layout and
 * renders it through the prop kit + engraving pass. Game logic (interactables,
 * dialogue, the Return) is NOT wired yet — this proves the world and the feel.
 *
 * URL params:
 *   ?shot=1        skip pointer-lock, park the camera at a scripted vantage
 *   ?pose=a|b|c    pick which scripted vantage (for screenshots)
 *   ?ink=0.0..2    outline strength
 *   ?paper=0..1    laid-paper grain — default 0 (clean toon); 1 = engraving
 */

import * as THREE from 'three';
import { EngravingPass } from './engraving';
import { FirstPerson } from './controller';
import { buildWorld, toWorld, type Station } from './world';

// CB-01's stations, mirrored from src/scenes/cb01.ts.
const CB01_STATIONS: Station[] = [
  { id: 'mess', label: 'a mess fire at the near end of the street', x: 0.15, z: 0.20, surface: 'fire' },
  { id: 'trestle', label: "the quartermaster's trestle", x: 0.36, z: 0.36, surface: 'table', focal: true },
  { id: 'shelters', label: 'the brush shelters', x: 0.17, z: 0.64, surface: 'stack' },
  { id: 'landing', label: 'the ground falling away to the water', x: 0.45, z: 0.72, surface: 'open' },
  { id: 'arms', label: 'the arms stacked by the guard', x: 0.62, z: 0.24, surface: 'stack' },
  { id: 'rhodeisland', label: 'the Rhode Island tent line', x: 0.72, z: 0.72, surface: 'stack' },
  { id: 'hq', label: 'the head of the lane to headquarters', x: 0.84, z: 0.44, surface: 'table' },
];

const params = new URLSearchParams(location.search);
const SHOT = params.has('shot');
const INK = parseFloat(params.get('ink') ?? '1.0');
const PAPER = parseFloat(params.get('paper') ?? '0.0');

const canvas = document.getElementById('view') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));

function size(): [number, number] {
  return [innerWidth, innerHeight];
}
let [W, H] = size();
renderer.setSize(W, H, false);
canvas.width = W * renderer.getPixelRatio();
canvas.height = H * renderer.getPixelRatio();

const { scene, blockers, groundHeight, spawn, stationMarks } = buildWorld(CB01_STATIONS);

const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 400);
const fp = new FirstPerson(camera, canvas, blockers);
fp.setPose(spawn.x, spawn.z, spawn.yaw);

const engraving = new EngravingPass(renderer, W * renderer.getPixelRatio(), H * renderer.getPixelRatio(), {
  ink: INK, paper: PAPER,
});

// scripted vantages for screenshots
const POSES: Record<string, { x: number; z: number; yaw: number; pitch: number }> = {
  a: { ...toWorld(0.26, 0.30), yaw: -0.35, pitch: -0.05 },        // looking up the street to HQ
  b: { ...toWorld(0.30, 0.55), yaw: 2.4, pitch: -0.02 },          // toward the brush shelters + water
  c: { ...toWorld(0.60, 0.40), yaw: 1.2, pitch: 0.03 },           // across to the arms + fire
};
if (SHOT) {
  const p = POSES[params.get('pose') ?? 'a'];
  fp.setPose(p.x, p.z, p.yaw);
  fp.pitch = p.pitch;
}

addEventListener('resize', () => {
  [W, H] = size();
  renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  engraving.setSize(W * renderer.getPixelRatio(), H * renderer.getPixelRatio());
});

// --- HUD ---
const hud = document.getElementById('hud')!;
const prompt = document.getElementById('prompt')!;
function nearestStation(): { label: string; d: number } | null {
  let best: { label: string; d: number } | null = null;
  for (const m of stationMarks) {
    const d = Math.hypot(fp.pos.x - m.x, fp.pos.z - m.z);
    if (!best || d < best.d) best = { label: m.label, d };
  }
  return best;
}

let last = performance.now();
function loop(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!SHOT) fp.update(dt, groundHeight);
  else { camera.position.set(fp.pos.x, fp.eyeHeight + groundHeight(fp.pos.x, fp.pos.z), fp.pos.z);
    const dir = new THREE.Vector3(Math.cos(fp.pitch) * -Math.sin(fp.yaw), Math.sin(fp.pitch), Math.cos(fp.pitch) * -Math.cos(fp.yaw));
    camera.lookAt(camera.position.clone().add(dir)); }

  engraving.render(scene, camera);

  if (!SHOT) {
    const near = nearestStation();
    if (near && near.d < 6) {
      prompt.textContent = near.label.toUpperCase();
      prompt.style.opacity = String(Math.max(0, 1 - near.d / 6));
    } else prompt.style.opacity = '0';
    hud.style.opacity = fp.isLocked ? '0' : '1';
  } else { hud.style.display = 'none'; prompt.style.display = 'none'; }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
