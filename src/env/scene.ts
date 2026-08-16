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
import { treeGeometry, rockGeometry, scatter } from './scatter';
import { fbm } from './noise';
import * as K from '../fp/kit';

// -- shared toon ramp for terrain + scatter --------------------------------
function makeRamp(): THREE.Texture {
  const d = new Uint8Array([188, 188, 188, 255, 222, 222, 222, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  return t;
}
const RAMP = makeRamp();

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const dist = (x: number, z: number, px: number, pz: number) => Math.hypot(x - px, z - pz);

export interface BuiltEnv {
  scene: THREE.Scene;
  sky: Sky;
  weather: Weather;
  water?: Water;
  height: (x: number, z: number) => number;
  spawn: { x: number; z: number; yaw: number };
  update: (dt: number, camera: THREE.Camera, t: number) => void;
  bounds: number;
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
}

interface BuildCtx {
  scene: THREE.Scene;
  height: (x: number, z: number) => number;
  slopeAt: (x: number, z: number) => number;
  place: (o: THREE.Object3D, x: number, z: number, yaw?: number) => void;
}

// ---------------------------------------------------------------------------
// STRUCTURES
// ---------------------------------------------------------------------------

/** Mount Vernon: white Georgian block, red roof, cupola, front piazza colonnade. */
function georgianHouse(): THREE.Group {
  const g = new THREE.Group();
  const white = 0xe8e4d6, roof = 0x7d4a3a, trim = 0xcfc8b6, chimney = 0x9a6a4e;
  const body = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 8), K.mat(white));
  body.position.y = 3.5; g.add(body);
  // hipped roof
  const rf = new THREE.Mesh(new THREE.ConeGeometry(9.2, 3.2, 4), K.mat(roof));
  rf.position.y = 8.6; rf.rotation.y = Math.PI / 4; g.add(rf);
  // cupola
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 8), K.mat(white));
  cup.position.y = 10.4; g.add(cup);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), K.mat(0xb5432f));
  dome.position.y = 11.2; g.add(dome);
  // front piazza colonnade (river side, +? we face -z)
  for (let i = 0; i < 6; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 6.2, 8), K.mat(trim));
    col.position.set(-6 + i * 2.4, 3.1, 4.6); g.add(col);
  }
  const porch = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 2), K.mat(roof));
  porch.position.set(0, 6.3, 4.6); g.add(porch);
  // chimneys
  for (const sx of [-5.5, 5.5]) {
    const ch = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1.4), K.mat(chimney));
    ch.position.set(sx, 9, 0); g.add(ch);
  }
  // windows (dark panes)
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.4), K.mat(0x3a4a52));
    w.position.set(-5.2 + i * 2.6, 2.2 + r * 3, -4.01); w.rotation.y = Math.PI; g.add(w);
  }
  return g;
}

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
// SCENE: MOUNT VERNON
// ---------------------------------------------------------------------------

const MOUNT_VERNON: SceneDef = {
  id: 'mount-vernon',
  name: 'Mount Vernon — May 1775',
  bounds: 95,
  defaultWeather: 'clear',
  spawn: { x: 8, z: 28, yaw: Math.PI },
  water: { level: -3.4, extent: 260, color: 0x4a6f86, hi: 0x9fc0cf, pos: [-72, 0] },
  clearings: [
    { x: 20, z: -8, r: 24 },  // house plateau
    { x: 20, z: 22, r: 16 },  // the front lawn (the approach)
    { x: 2, z: 8, r: 7 },     // pose c vantage
    { x: -26, z: 6, r: 7 },   // pose b vantage on the bluff
    { x: -58, z: 0, r: 12 },  // the dock
  ],
  elevation(x, z) {
    let h = fbm(x * 0.012 + 10, z * 0.012 + 4, { seed: 7, octaves: 5 }) * 8 - 2;
    const bank = -38, river = -66;
    if (x < bank) { const t = clamp((bank - x) / (bank - river), 0, 1); h = mix(h, -3.6, smooth(t)); }
    // mansion plateau near (20,-8)
    const d = dist(x, z, 20, -8);
    h = mix(h, 3.2, clamp(1 - d / 24, 0, 1) * 0.85);
    return h;
  },
  sky: {
    zenith: 0x4f86c6, horizon: 0xcfe0e6, sunColor: 0xfff3d0,
    sunAzimuth: 2.4, sunElevation: 0.85, sunIntensity: 2.0, ambient: 0.9,
    fogColor: 0xdbe6e8, fogNear: 70, fogFar: 240, haze: 0.6,
  },
  build({ scene, height, place }) {
    // the mansion
    const house = georgianHouse();
    place(house, 20, -8, -0.1);
    // outbuildings
    for (const [ox, oz] of [[8, -18], [32, -16], [10, 2]] as const) {
      const shed = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3), K.mat(0xd8d2c0));
      const rf = new THREE.Mesh(new THREE.ConeGeometry(3, 1.6, 4), K.mat(0x7d4a3a));
      const g = new THREE.Group(); shed.position.y = 1.5; rf.position.y = 3.6; rf.rotation.y = Math.PI / 4;
      g.add(shed, rf); place(g, ox, oz);
    }
    // a rail fence line along the lawn
    for (let i = 0; i < 14; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.14), K.mat(0x6f5638));
      place(post, -2 + i * 2.4, 18);
      if (i < 13) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.08), K.mat(0x7a6040));
        place(rail, -0.8 + i * 2.4, 18); rail.position.y += 0.7;
      }
    }
    // Martha and a messenger on the lawn
    place(K.figure({ coat: 0x6a2f3a }), 14, 12, 0.4);   // Martha (deep rose)
    place(K.figure({ coat: K.C.coatBlue, musket: false }), 4, 16, -0.6);
    // a dock at the river
    const dock = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const pl = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 1.4), K.mat(0x6f4d2e));
      pl.position.set(0, 0.1, i * 1.4); dock.add(pl);
    }
    dock.position.set(-58, -3.2, 0); scene.add(dock);
    void height;
  },
};

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
  'mount-vernon': MOUNT_VERNON,
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
      paint: (x, z, h, slope, out) => paintFor(def, x, z, h, slope, out) },
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

  // scatter — trees and rock, seeded, avoiding steep ground and water
  const winter = (def.snow ?? 0) > 0.4;
  const trees = treeGeometry(0x6b4f2e, winter ? 0x7a684a : 0x6f9a40, winter);
  const treeMesh = scatter(trees, RAMP, elevation, slopeAt, {
    count: winter ? 90 : 150, area: def.bounds * 0.92, seed: 11, maxSlope: 0.5,
    minHeight: def.water ? def.water.level + 1.5 : -999, scaleMin: 0.9, scaleMax: 1.9,
    avoid: def.clearings,
  });
  scene.add(treeMesh);
  const rocks = scatter(rockGeometry(0x807a70), RAMP, elevation, slopeAt, {
    count: 60, area: def.bounds * 0.9, seed: 23, maxSlope: 1, minHeight: def.water ? def.water.level + 0.5 : -999,
    scaleMin: 0.6, scaleMax: 1.8, avoid: def.clearings,
  });
  scene.add(rocks);

  // dressing
  const place = (o: THREE.Object3D, x: number, z: number, yaw = 0) => {
    o.position.set(x, elevation(x, z), z);
    o.rotation.y = yaw;
    scene.add(o);
  };
  def.build({ scene, height: elevation, slopeAt, place });

  const weather = new Weather();
  weather.set(weatherKind, sky, scene);

  return {
    scene, sky, weather, water,
    height: elevation,
    spawn: def.spawn,
    bounds: def.bounds,
    update: (dt, camera, t) => { weather.update(dt, camera); water?.update(t); },
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
