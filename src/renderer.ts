/**
 * The diorama renderer.
 *
 * A scene is one canonical composed view built from five layers (L0 sky ..
 * L4 foreground) plus billboarded character cutouts. The camera never orbits —
 * it breathes a little as the player walks, and that is all.
 *
 * The prototype uses an orthographic camera and applies the parallax offsets
 * directly. The real build uses a perspective camera with a corrective
 * translation per layer (06-technical-architecture.md §2.3); the on-screen
 * result is the same and this is far easier to reason about while the layer
 * stack is still being judged.
 */

import * as THREE from 'three';
import {
  characterCutout,
  characterFrames,
  layerForeground,
  layerHills,
  layerHouse,
  layerSky,
  layerMidground,
  paperTexture,
} from './art';
import { MEANING, PAPER } from './palette';

/** Parallax coefficients, L0..L4. */
const PARALLAX = [0.1, 0.3, 0.62, 1.0, 1.55];
const PARALLAX_MAX_PX = 64; // "breath", not a camera move

const VIEW_W = 16;
const VIEW_H = 9;

const MOOD_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uScene;
  uniform sampler2D uPaper;
  uniform float uMood;      // 0 = sodden and grey, 1 = warm and confident
  uniform float uVignette;
  varying vec2 vUv;

  // Group D meaning colours are exempt from the mood transform. We approximate
  // that here by protecting strongly saturated blues and reds; the real build
  // carries an explicit mask channel rather than guessing from the pixel.
  float meaningMask(vec3 c) {
    float mx = max(c.r, max(c.g, c.b));
    float mn = min(c.r, min(c.g, c.b));
    float sat = mx - mn;
    return smoothstep(0.18, 0.34, sat);
  }

  void main() {
    vec3 src = texture2D(uScene, vUv).rgb;
    float lum = dot(src, vec3(0.2126, 0.7152, 0.0722));

    // The line carries structure and never wavers. Dark pixels are line.
    float isInk = 1.0 - smoothstep(0.16, 0.42, lum);

    // The wash carries mood: it drains, cools and thins as morale falls.
    // The curve is deliberately flat through the middle band — a mid run should
    // look like the world, not like a half-erased version of it. The signal
    // lives at the ends.
    float m = smoothstep(0.10, 0.90, uMood);
    vec3 grey = vec3(lum);
    vec3 cool = vec3(lum * 0.94, lum * 0.97, lum * 1.06);
    vec3 drained = mix(cool, grey, 0.45);
    vec3 washed = mix(drained, src, 0.55 + 0.45 * m);

    // Low mood also thins the wash toward bare paper.
    washed = mix(washed, vec3(0.937, 0.906, 0.835), (1.0 - m) * 0.20);

    vec3 outc = mix(washed, src, max(isInk, meaningMask(src)));

    // Paper grain as one screen-space overlay, never baked per layer.
    vec3 grain = texture2D(uPaper, vUv * vec2(3.0, 1.7)).rgb;
    outc *= mix(0.94, 1.03, grain.r);

    float d = distance(vUv, vec2(0.5));
    outc *= 1.0 - uVignette * smoothstep(0.34, 0.86, d) * (1.0 - 0.35 * uMood);

    gl_FragColor = vec4(outc, 1.0);
  }
`;

const MOOD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

function textureFrom(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

interface Layer {
  mesh: THREE.Mesh;
  parallax: number;
  /** Where this layer sits in the world's depth, 0 = at the camera, 1 = horizon. */
  depth: number;
}

/**
 * The ground plane.
 *
 * Actors live at (x, z): x runs across the frame, z runs into it — 0 at the
 * near edge, 1 at the horizon. Both the vertical placement and the scale come
 * from z through the same easing curve, which is what makes walking "up" the
 * lawn read as walking away rather than as sliding upward.
 */
const HORIZON = 0.34; // fraction of frame height, locked project-wide
const NEAR_Y = -3.45; // view-space y of the near edge of walkable ground
const FIGURE_H = 2.6; // world height of a figure at scale 1
const NEAR_SCALE = 1.0;
const FAR_SCALE = 0.46;
/** How much the walkable width narrows toward the horizon. */
const FAR_SPREAD = 0.40;
/** The lawn falls away west toward the river. */
const SLOPE = 0.22;
const EASE = 1.55;

/** Depth of each painted layer, so actors can pass behind them. */
const LAYER_DEPTH = [1.0, 0.95, 0.82, 0.44, 0.02];

export interface GroundPos {
  x: number;
  z: number;
}

const horizonY = (): number => 9 / 2 - HORIZON * 9;

export class DioramaRenderer {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private layers: Layer[] = [];
  private player!: THREE.Mesh;
  private npcs: { mesh: THREE.Mesh; pos: GroundPos; phase: number }[] = [];
  private clock = 0;
  /** Walk-cycle textures for the player: index 0 is the standing pose. */
  private playerFrames: THREE.CanvasTexture[] = [];
  private gait = 0;
  private bob = 0;


  private target: THREE.WebGLRenderTarget;
  private postScene = new THREE.Scene();
  private postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private postMat: THREE.ShaderMaterial;

  private breath = 0;
  private breathZ = 0;

  constructor(canvas: HTMLCanvasElement, npcPositions: GroundPos[] = []) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene.background = new THREE.Color(PAPER.WARM);

    this.camera = new THREE.OrthographicCamera(
      -VIEW_W / 2, VIEW_W / 2, VIEW_H / 2, -VIEW_H / 2, 0.1, 100,
    );
    this.camera.position.z = 20;

    const plates = [layerSky(), layerHills(), layerHouse(), layerMidground(), layerForeground()];
    plates.forEach((plate, i) => {
      const geo = new THREE.PlaneGeometry(VIEW_W * 1.14, VIEW_H * 1.14);
      const mat = new THREE.MeshBasicMaterial({
        map: textureFrom(plate),
        transparent: i > 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = -i * 0.5;
      mesh.renderOrder = i;
      this.scene.add(mesh);
      this.layers.push({ mesh, parallax: PARALLAX[i], depth: LAYER_DEPTH[i] });
    });

    this.buildActors(npcPositions);

    this.target = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    this.postMat = new THREE.ShaderMaterial({
      uniforms: {
        uScene: { value: this.target.texture },
        uPaper: { value: textureFrom(paperTexture()) },
        uMood: { value: 0.5 },
        uVignette: { value: 0.5 },
      },
      vertexShader: MOOD_VERT,
      fragmentShader: MOOD_FRAG,
      depthTest: false,
      depthWrite: false,
    });
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));

    this.resize();
    addEventListener('resize', () => this.resize());
  }

  private buildActors(npcPositions: GroundPos[]): void {
    const mk = (canvas: HTMLCanvasElement, z: number) => {
      const tex = textureFrom(canvas);
      const aspect = canvas.width / canvas.height;
      const h = 2.6;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(h * aspect, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
      );
      mesh.position.z = z;
      mesh.renderOrder = 3; // between L3 and L4, per the layer contract
      this.scene.add(mesh);
      return mesh;
    };

    // Washington is the only figure in Continental blue. Everyone else wears
    // the earth range, so the eye finds him in one pass without a marker.
    const frames = characterFrames(MEANING.CONTINENTAL_BLUE, 101);
    this.playerFrames = frames.map(textureFrom);
    this.player = mk(frames[0], -1.2);
    (this.player.material as THREE.MeshBasicMaterial).map = this.playerFrames[0];

    const coats = ['#6B4F35', '#7A5C3E', '#5C6673', '#55627A', '#6E5B45'];
    npcPositions.forEach((pos, i) => {
      const mesh = mk(characterCutout(coats[i % coats.length], 202 + i * 101), -1.25);
      // Each idle runs on its own phase and rate, so a row of waiting figures
      // never breathes in unison — which is what makes a crowd read as painted
      // cardboard rather than as people.
      this.npcs.push({ mesh, pos, phase: (i * 2.399) % (Math.PI * 2) });
    });
  }

  /** Draw order for an actor at depth z: after every layer further away. */
  private orderFor(z: number): number {
    let n = 0;
    for (const l of this.layers) if (l.depth > z) n++;
    return n - 0.5;
  }

  /**
   * Ground projection. Returns view-space x, the y of the actor's feet, and the
   * scale — all three driven by the same easing of z, so a figure that halves
   * in size also rises toward the horizon by the matching amount.
   */
  private project(pos: GroundPos): { x: number; y: number; scale: number } {
    const f = Math.pow(1 - pos.z, EASE);
    const scale = FAR_SCALE + (NEAR_SCALE - FAR_SCALE) * f;
    const spread = FAR_SPREAD + (1 - FAR_SPREAD) * f;
    const x = (pos.x - 0.5) * VIEW_W * 0.94 * spread;
    const y = horizonY() + (NEAR_Y - horizonY()) * f - SLOPE * (0.5 - pos.x) * f;
    return { x, y, scale };
  }

  /** Screen pixels for a ground position, for placing DOM prompts. */
  screenPos(pos: GroundPos): { x: number; y: number } {
    const { x, y, scale } = this.project(pos);
    const v = new THREE.Vector3(x, y + FIGURE_H * scale, 0).project(this.camera);
    return {
      x: ((v.x + 1) / 2) * innerWidth,
      y: ((1 - v.y) / 2) * innerHeight,
    };
  }

  private place(mesh: THREE.Mesh, pos: GroundPos): void {
    const { x, y, scale } = this.project(pos);
    mesh.scale.setScalar(scale);
    mesh.position.x = x;
    mesh.position.y = y + (FIGURE_H * scale) / 2;
    mesh.renderOrder = this.orderFor(pos.z);
  }

  /**
   * Advance the gait by distance walked, not by time — so the legs keep pace
   * with the ground however fast or slow the figure moves, and stop dead when
   * it does. `dist` is in ground units.
   */
  setGait(dist: number, dt: number): void {
    const STRIDE = 0.055; // ground units per half-step
    if (dist > 1e-5) {
      this.gait = (this.gait + dist / STRIDE) % 1;
      // The body rises at the passing position and drops at each footfall.
      this.bob = 0.038 - Math.abs(Math.sin(this.gait * Math.PI * 2)) * 0.076;
    } else {
      this.gait = 0;
      this.bob += (0 - this.bob) * Math.min(1, dt * 9);
    }
    const n = this.playerFrames.length - 1;
    const idx = dist > 1e-5 ? 1 + (Math.floor(this.gait * n) % n) : 0;
    const mat = this.player.material as THREE.MeshBasicMaterial;
    if (mat.map !== this.playerFrames[idx]) {
      mat.map = this.playerFrames[idx];
      mat.needsUpdate = true;
    }
  }

  setPlayerPos(pos: GroundPos, dt = 0): void {
    this.clock += dt;
    this.place(this.player, pos);
    this.player.position.y += this.bob;

    for (const n of this.npcs) {
      this.place(n.mesh, n.pos);
      // A slow weight shift: a little rise and fall, and a lean that lags it.
      const t = this.clock * 0.9 + n.phase;
      const s = n.mesh.scale.x;
      n.mesh.position.y += Math.sin(t) * 0.022 * s;
      n.mesh.position.x += Math.sin(t * 0.62 + 1.1) * 0.030 * s;
      n.mesh.rotation.z = Math.sin(t * 0.62 + 1.1) * 0.012;
    }

    // Parallax breath on both axes. Walking across the frame slides the stack
    // sideways; walking into it pushes the near layers down and out, which is
    // what sells the ground as a plane rather than a line.
    const targetX = (pos.x - 0.5) * 2;
    const targetY = (0.35 - pos.z) * 2;
    this.breath += (targetX - this.breath) * 0.12;
    this.breathZ += (targetY - this.breathZ) * 0.10;
    const px = (PARALLAX_MAX_PX / 1600) * VIEW_W;
    for (const l of this.layers) {
      l.mesh.position.x = -this.breath * l.parallax * px;
      l.mesh.position.y = -this.breathZ * l.parallax * px * 0.42;
    }
  }

  setMood(mood: number): void {
    this.postMat.uniforms.uMood.value = mood;
    this.postMat.uniforms.uVignette.value = 0.62 - 0.28 * mood;
  }

  private resize(): void {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setSize(w, h, false);

    // Letterbox to 16:9 by widening the ortho frustum, never by cropping the plate.
    const aspect = w / h;
    const base = VIEW_W / VIEW_H;
    if (aspect > base) {
      const vw = VIEW_H * aspect;
      this.camera.left = -vw / 2;
      this.camera.right = vw / 2;
      this.camera.top = VIEW_H / 2;
      this.camera.bottom = -VIEW_H / 2;
    } else {
      const vh = VIEW_W / aspect;
      this.camera.left = -VIEW_W / 2;
      this.camera.right = VIEW_W / 2;
      this.camera.top = vh / 2;
      this.camera.bottom = -vh / 2;
    }
    this.camera.updateProjectionMatrix();

    const dpr = this.renderer.getPixelRatio();
    this.target.setSize(w * dpr, h * dpr);
  }

  render(): void {
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  }
}
