/**
 * Scene definitions — places, authored from what happened there.
 *
 * Each scene is a terrain shape, a sky, optional water, a scatter budget, and a
 * dressing pass that places buildings and people on the ground the terrain
 * computed. No flat plane, no station grid — the land leads and everything sits
 * on it. Two are built here as the proof of range:
 *
 *   Mount Vernon — May 1775. Rolling green bluff above the Potomac, full sun.
 *                  Vibrant. The quiet before. (docs/00 Act 1)
 *   Valley Forge — winter 1777-78. High cold hills, log huts, snow, grey light.
 *                  Grim, and meant to improve as the act goes on. (Act 5)
 */

import * as THREE from 'three';
import { Terrain } from './terrain';
import { Sky, type SkyConfig } from './sky';
import { Water } from './water';
import { Weather, type WeatherKind } from './weather';
import { treeGeometry, rockGeometry, tuftGeometry, stickGeometry, scatter, WIND } from './scatter';
import { fbm } from './noise';
import * as K from '../fp/kit';
import { MOUNT_VERNON_1775 } from './vernon';
import { CAMBRIDGE_CAMP } from './cambridge';
import { THE_LINES } from './lines';

// -- shared toon ramp for terrain + scatter --------------------------------
function makeRamp(): THREE.Texture {
  const d = new Uint8Array([188, 188, 188, 255, 222, 222, 222, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  return t;
}
export const RAMP = makeRamp();

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export interface BuiltEnv {
  scene: THREE.Scene;
  sky: Sky;
  weather: Weather;
  water?: Water;
  height: (x: number, z: number) => number;
  spawn: { x: number; z: number; yaw: number };
  update: (dt: number, camera: THREE.Camera, t: number) => void;
  bounds: number;
  boxes: Array<{ minX: number; minZ: number; maxX: number; maxZ: number; minY?: number; maxY?: number }>;
  heightOverride: ((x: number, z: number, footY: number) => number | null) | null;
}

export interface SceneDef {
  id: string;
  name: string;
  bounds: number;
  sky: SkyConfig;
  defaultWeather: WeatherKind;
  build: (env: BuildCtx) => void;
  spawn: { x: number; z: number; yaw: number };
  elevation: (x: number, z: number) => number;
  snow?: number;
  water?: { level: number; extent: number; color: number; hi: number; pos: [number, number] };
  clearings?: Array<{ x: number; z: number; r: number }>; // keep scatter out of these
  /** Scene-owned ground colouring (lanes, lawns, worn earth). Falls back to paintFor. */
  paint?: (x: number, z: number, h: number, slope: number, out: THREE.Color) => void;
  /** Cap on scattered forest trees (a tended estate is not a wilderness). */
  treeCount?: number;
  /** Drives bare trees and clutter colour; falls back to snow amount. */
  season?: 'summer' | 'winter';
}

interface BuildCtx {
  scene: THREE.Scene;
  height: (x: number, z: number) => number;
  slopeAt: (x: number, z: number) => number;
  place: (o: THREE.Object3D, x: number, z: number, yaw?: number) => void;
  /** Register a per-frame animator (smoke, birds, laundry, doors that open). */
  animate: (fn: (t: number, dt: number, cam?: THREE.Vector3) => void) => void;
  /** Register an axis-aligned wall/furniture collider, optionally bounded in height. */
  box: (minX: number, minZ: number, maxX: number, maxZ: number, minY?: number, maxY?: number) => void;
  /**
   * Register a walkable-height override (interior floors, stairs). Returns an
   * absolute floor height, or null where the terrain rules. `footY` is the
   * player's current foot height, so a two-storey building can answer with
   * whichever floor the player is actually on.
   */
  setHeightOverride: (fn: (x: number, z: number, footY: number) => number | null) => void;
}

// ---------------------------------------------------------------------------
// STRUCTURES
// ---------------------------------------------------------------------------

/** A Valley Forge log hut: stacked-log walls, board roof, stone chimney. */
function logHut(): THREE.Group {
  const g = new THREE.Group();
  const log = 0x6a4a30, board = 0x4f3a26, stone = 0x77726a;
  const W = 4, D = 3.4, H = 2.2;
  // log walls: stacked horizontal logs on four sides (front has a gap for door)
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    const y = 0.18 + r * (H / rows);
    // back + front
    for (const zz of [-D / 2, D / 2]) {
      const isFront = zz > 0;
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, W, 6), K.mat(log));
      l.rotation.z = Math.PI / 2; l.position.set(0, y, zz);
      if (isFront && r < 4) { l.scale.x = 0.42; l.position.x = -W * 0.29; } // door gap
      g.add(l);
    }
    for (const xx of [-W / 2, W / 2]) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, D, 6), K.mat(log));
      l.rotation.x = Math.PI / 2; l.position.set(xx, y, 0); g.add(l);
    }
  }
  // gable roof of boards
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2 - 0.2, 0); sh.lineTo(W / 2 + 0.2, 0); sh.lineTo(0, 1.3); sh.lineTo(-W / 2 - 0.2, 0);
  const roofGeo = new THREE.ExtrudeGeometry(sh, { depth: D + 0.4, bevelEnabled: false });
  roofGeo.translate(0, 0, -(D + 0.4) / 2);
  const rmesh = new THREE.Mesh(roofGeo, K.mat(board)); rmesh.position.y = H; g.add(rmesh);
  // stone chimney with smoke
  const chim = new THREE.Mesh(new THREE.BoxGeometry(1, H + 1.6, 1), K.mat(stone));
  chim.position.set(W / 2 + 0.4, (H + 1.6) / 2, -D / 3); g.add(chim);
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.3 + i * 0.12, 6, 5), K.mat(0xd8d8dc));
    (s.material as THREE.MeshToonMaterial).transparent = true;
    (s.material as THREE.MeshToonMaterial).opacity = 0.5 - i * 0.12;
    s.position.set(W / 2 + 0.4, H + 1.8 + i * 0.7, -D / 3); g.add(s);
  }
  return g;
}

// ---------------------------------------------------------------------------
// SCENE: VALLEY FORGE
// ---------------------------------------------------------------------------

const VALLEY_FORGE: SceneDef = {
  id: 'valley-forge',
  name: 'Valley Forge — winter 1777',
  bounds: 95,
  defaultWeather: 'snow',
  snow: 0.92,
  spawn: { x: 0, z: 26, yaw: Math.PI },
  clearings: [{ x: -2, z: 2, r: 36 }], // the camp; the wood rings it
  elevation(x, z) {
    return fbm(x * 0.02, z * 0.02, { seed: 19, octaves: 5 }) * 12 - 3
         + fbm(x * 0.06, z * 0.06, { seed: 3 }) * 2.2;
  },
  sky: {
    zenith: 0x9fb0bf, horizon: 0xdadfe3, sunColor: 0xe6e9ec,
    sunAzimuth: 1.9, sunElevation: 0.34, sunIntensity: 1.15, ambient: 1.5,
    fogColor: 0xd0d6db, fogNear: 24, fogFar: 130, haze: 0.35,
  },
  build({ height, place }) {
    // two rows of log huts along the slope, the way they were laid out by brigade
    let n = 0;
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 5; i++) {
        const x = -22 + i * 10 + row * 3;
        const z = -6 + row * 12;
        place(logHut(), x, z, row * 0.2);
        n++;
        // a fire and a huddled soldier between some huts
        if (i < 4) {
          const fx = x + 5, fz = z + 2;
          place(K.campfire(), fx, fz);
          place(K.figure({ coat: K.C.coatTan, hat: true }), fx + 1.5, fz + 0.5, -2.0);
          if (i % 2 === 0) place(K.figure({ coat: K.C.coatBlue }), fx - 1.4, fz + 1, 2.2);
        }
      }
    }
    // a flag on the high ground
    place(K.flagpole(7), 6, -20);
    // stacked firewood and a broken cart
    for (let i = 0; i < 3; i++) place(K.barrel(), -26 + i * 1.2, 14);
    place(K.wagon(), 18, 16, 0.5);
    void n; void height;
  },
};

export const SCENES: Record<string, SceneDef> = {
  'mount-vernon': MOUNT_VERNON_1775,
  'cambridge': CAMBRIDGE_CAMP,
  'lines': THE_LINES,
  'valley-forge': VALLEY_FORGE,
};

// ---------------------------------------------------------------------------
// ASSEMBLER
// ---------------------------------------------------------------------------

export function buildEnv(def: SceneDef, weatherKind: WeatherKind): BuiltEnv {
  const scene = new THREE.Scene();

  const elevation = def.elevation;
  const slopeAt = (x: number, z: number) => {
    const e = 1.2;
    const hx = elevation(x + e, z) - elevation(x - e, z);
    const hz = elevation(x, z + e) - elevation(x, z - e);
    return clamp(Math.hypot(hx, hz) / (2 * e), 0, 1);
  };

  const terrain = new Terrain(
    { size: def.bounds * 2.4, segments: 200, elevation, snow: def.snow,
      paint: def.paint ?? ((x, z, h, slope, out) => paintFor(def, x, z, h, slope, out)) },
    RAMP,
  );
  scene.add(terrain.mesh);

  const sky = new Sky(def.sky);
  sky.addTo(scene, def.sky);

  let water: Water | undefined;
  if (def.water) {
    water = new Water(def.water.level, def.water.extent, def.water.color, def.water.hi, sky.sunDir);
    water.mesh.position.x = def.water.pos[0];
    water.mesh.position.z = def.water.pos[1];
    scene.add(water.mesh);
  }

  // scatter — trees, rock and ground clutter, seeded, avoiding steep ground
  // and water. Two tree species, clumped by a noise field so the horizon
  // reads as woods-with-clearings instead of an even orchard rim.
  const winter = def.season === 'winter' || (def.snow ?? 0) > 0.4;
  const treeN = def.treeCount ?? (winter ? 90 : 150);
  const minH = def.water ? def.water.level + 1.5 : -999;
  const broad = treeGeometry(0x6b4f2e, winter ? 0x7a684a : 0x6f9a40, winter, 'broad');
  const tall = treeGeometry(0x755632, winter ? 0x827052 : 0x5d8c3a, winter, 'tall');
  scene.add(scatter(broad, RAMP, elevation, slopeAt, {
    count: Math.round(treeN * 0.6), area: def.bounds * 0.92, seed: 11, maxSlope: 0.5,
    minHeight: minH, scaleMin: 0.9, scaleMax: 1.9, avoid: def.clearings,
    cluster: { scale: 0.045, threshold: 0.46 }, wind: 0.012,
  }));
  scene.add(scatter(tall, RAMP, elevation, slopeAt, {
    count: Math.round(treeN * 0.4), area: def.bounds * 0.92, seed: 31, maxSlope: 0.5,
    minHeight: minH, scaleMin: 0.85, scaleMax: 1.6, avoid: def.clearings,
    cluster: { scale: 0.045, threshold: 0.52 }, wind: 0.012,
  }));
  scene.add(scatter(rockGeometry(0x807a70), RAMP, elevation, slopeAt, {
    count: 60, area: def.bounds * 0.9, seed: 23, maxSlope: 1, minHeight: def.water ? def.water.level + 0.5 : -999,
    scaleMin: 0.6, scaleMax: 1.8, avoid: def.clearings,
  }));

  // ground clutter — the eye-level layer. Everywhere, including the camps;
  // this is what keeps open ground from reading as an empty lawn.
  const snowy = (def.snow ?? 0) > 0.4;
  const tuftC = snowy ? 0xb0ac96 : winter ? 0x9a9062 : 0x84a84e;
  scene.add(scatter(tuftGeometry(tuftC), RAMP, elevation, slopeAt, {
    count: 4200, area: def.bounds * 0.95, seed: 41, maxSlope: 0.6,
    minHeight: minH, scaleMin: 0.7, scaleMax: 1.6,
    cluster: { scale: 0.09, threshold: 0.34 }, wind: 0.09,
  }));
  scene.add(scatter(rockGeometry(0x8a847a), RAMP, elevation, slopeAt, {
    count: 520, area: def.bounds * 0.95, seed: 43, maxSlope: 0.9,
    minHeight: minH, scaleMin: 0.08, scaleMax: 0.28,
  }));
  scene.add(scatter(stickGeometry(0x6a5334), RAMP, elevation, slopeAt, {
    count: 380, area: def.bounds * 0.95, seed: 47, maxSlope: 0.7,
    minHeight: minH, scaleMin: 0.6, scaleMax: 1.4,
  }));

  // dressing
  const animators: Array<(t: number, dt: number, cam?: THREE.Vector3) => void> = [];
  const boxes: BuiltEnv['boxes'] = [];
  let heightOverride: BuiltEnv['heightOverride'] = null;
  // settle: seat each prop at the LOWEST of five ground samples under its
  // footprint, slightly sunk — so no corner ever hovers on curved ground
  const place = (o: THREE.Object3D, x: number, z: number, yaw = 0) => {
    const r = 0.7;
    let y = elevation(x, z);
    for (const [dx, dz] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
      y = Math.min(y, elevation(x + dx, z + dz));
    }
    o.position.set(x, y - 0.03, z);
    o.rotation.y = yaw;
    scene.add(o);
  };
  def.build({
    scene, height: elevation, slopeAt, place,
    animate: (fn) => animators.push(fn),
    box: (minX, minZ, maxX, maxZ, minY, maxY) => boxes.push({ minX, minZ, maxX, maxZ, minY, maxY }),
    setHeightOverride: (fn) => { heightOverride = fn; },
  });

  const weather = new Weather();
  weather.set(weatherKind, sky, scene);

  return {
    scene, sky, weather, water,
    height: elevation,
    spawn: def.spawn,
    bounds: def.bounds,
    boxes,
    heightOverride,
    update: (dt, camera, t) => {
      WIND.value = t;
      weather.update(dt, camera);
      water?.update(t);
      for (const fn of animators) {
        fn(t, dt, (camera as THREE.Camera & { position: THREE.Vector3 }).position);
      }
    },
  };
}

// biome colouring per scene
function paintFor(def: SceneDef, x: number, z: number, h: number, slope: number, out: THREE.Color) {
  if (def.id === 'mount-vernon') {
    const grass = new THREE.Color(0x6f9a4a).lerp(new THREE.Color(0x86a856), fbm(x * 0.1, z * 0.1, { seed: 2 }));
    const soil = new THREE.Color(0x7a5f3c);
    const sand = new THREE.Color(0xa89a6e);
    out.copy(grass);
    if (h < -2.0) out.lerp(sand, clamp((-2.0 - h) / 2, 0, 1)); // river bank
    out.lerp(soil, clamp((slope - 0.35) * 2.4, 0, 1));         // exposed earth on slopes
  } else {
    // valley forge — cold earth under the snow, mud where trampled low
    const earth = new THREE.Color(0x5f5340).lerp(new THREE.Color(0x6e6048), fbm(x * 0.12, z * 0.12, { seed: 5 }));
    const rock = new THREE.Color(0x6b665e);
    out.copy(earth);
    out.lerp(rock, clamp((slope - 0.4) * 2.5, 0, 1));
  }
}
