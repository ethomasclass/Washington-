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
  characterCutout, characterFrames, cloudShadows, CLOUD_BANDS, motes,
  PLATE_SETS, paperTexture,
} from './art';
import { MEANING, PAPER } from './palette';

/** Parallax coefficients, L0..L5. */
const PARALLAX = [0.1, 0.26, 0.5, 0.74, 1.06, 1.6];
const PARALLAX_MAX_PX = 64; // "breath", not a camera move

const VIEW_W = 16;
const VIEW_H = 9;

const MOOD_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uScene;
  uniform sampler2D uPaper;
  uniform float uMood;      // 0 = sodden and grey, 1 = warm and confident
  uniform float uVignette;
  uniform vec2  uSun;       // where the light comes from, in uv
  uniform float uWarm;      // strength of the sunlight wash
  varying vec2 vUv;

  // Group D meaning colours are exempt from the mood transform. We approximate
  // that here by protecting strongly saturated blues and reds; the real build
  // carries an explicit mask channel rather than guessing from the pixel.
  float meaningMask(vec3 c) {
    float mx = max(c.r, max(c.g, c.b));
    float mn = min(c.r, min(c.g, c.b));
    return smoothstep(0.18, 0.34, mx - mn);
  }

  void main() {
    vec3 src = texture2D(uScene, vUv).rgb;
    float lum = dot(src, vec3(0.2126, 0.7152, 0.0722));

    // The line carries structure and never wavers. Dark pixels are line.
    float isInk = 1.0 - smoothstep(0.16, 0.42, lum);

    /*
     * Mood.
     *
     * The wash drains, cools and thins as morale falls — but the middle band
     * has to look like the world, not like a half-erased version of it. The
     * old curve took a quarter of the colour out at mid and the whole game
     * read as overcast regardless of how the run was going. Signal lives at
     * the ends: below about a third, and above about two thirds.
     */
    float m = smoothstep(0.06, 0.94, uMood);
    float drainAmt = smoothstep(0.55, 0.0, uMood);   // only really bites when low
    vec3 grey = vec3(lum);
    vec3 cool = vec3(lum * 0.94, lum * 0.97, lum * 1.06);
    vec3 drained = mix(cool, grey, 0.45);
    vec3 washed = mix(src, drained, drainAmt * 0.42);
    washed = mix(washed, vec3(0.937, 0.906, 0.835), drainAmt * 0.16);

    // A confident run gains a little warmth and depth rather than only losing
    // less — the top of the range should be worth reaching.
    float lift = smoothstep(0.62, 1.0, uMood);
    washed = mix(washed, washed * vec3(1.05, 1.01, 0.95), lift);
    washed = mix(washed, clamp((washed - 0.5) * 1.06 + 0.5, 0.0, 1.0), lift * 0.6);

    vec3 outc = mix(washed, src, max(isInk, meaningMask(src)));

    /*
     * Sunlight.
     *
     * Mid-morning, per the canonical view, throwing long shadows to the right.
     * One broad warm gradient falling from the light and a matching cool in the
     * lee of it. This is the cheapest thing that separates a lit place from a
     * flat one, and its absence was most of why the set read as overcast.
     */
    float d = distance(vUv * vec2(1.0, 0.62), uSun * vec2(1.0, 0.62));
    float sun = 1.0 - smoothstep(0.10, 1.05, d);
    outc *= mix(vec3(1.0), vec3(1.075, 1.035, 0.965), sun * uWarm);
    outc *= mix(vec3(1.0), vec3(0.965, 0.985, 1.03), (1.0 - sun) * uWarm * 0.8);

    // Paper grain as one screen-space overlay, never baked per layer.
    vec3 grain = texture2D(uPaper, vUv * vec2(3.0, 1.7)).rgb;
    outc *= mix(0.96, 1.02, grain.r);

    // A light hand on the vignette. It was doing the work of a storm cloud.
    float v = distance(vUv, vec2(0.5, 0.52));
    outc *= 1.0 - uVignette * smoothstep(0.42, 0.95, v);

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

/**
 * Standing figures shift their weight occasionally. Set false for a completely
 * static frame whenever the player is not moving.
 */
const IDLE_SHIFTS = true;

/**
 * Depth of each painted layer, so actors can pass behind them.
 *
 * Two midground bands (0.62 and 0.38) rather than one: a figure can now be
 * behind the far fence and in front of the near hedge at the same time, which
 * is what makes the ground feel occupied rather than empty.
 */
const LAYER_DEPTH = [1.0, 0.94, 0.80, 0.62, 0.38, 0.02];

export interface GroundPos {
  x: number;
  z: number;
}

/** A figure on the ground plane, with the build that distinguishes them. */
export interface Actor extends GroundPos {
  coat: string;
  hat?: 'tricorne' | 'round' | 'none';
  build?: number;
  tall?: number;
  seed: number;
}

const horizonY = (): number => 9 / 2 - HORIZON * 9;

export class DioramaRenderer {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private layers: Layer[] = [];
  private player!: THREE.Mesh;
  private npcs: {
    mesh: THREE.Mesh;
    pos: GroundPos;
    /** Seconds until the next weight shift. */
    wait: number;
    /** Current and target settle offset, in world units. */
    off: number;
    target: number;
  }[] = [];
  /** Walk-cycle textures for the player: index 0 is the standing pose. */
  private playerFrames: THREE.CanvasTexture[] = [];
  /** Cloud strip, scrolled rather than animated. */
  private clouds: THREE.Mesh | null = null;
  private cloudTex: THREE.CanvasTexture | null = null;
  private shadowMesh: THREE.Mesh | null = null;
  private shadowTex: THREE.CanvasTexture | null = null;
  private moteMesh: THREE.Mesh | null = null;
  private moteTex: THREE.CanvasTexture | null = null;
  private gait = 0;
  private bob = 0;


  private target: THREE.WebGLRenderTarget;
  private postScene = new THREE.Scene();
  private postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private postMat: THREE.ShaderMaterial;

  private breath = 0;
  private breathZ = 0;

  constructor(canvas: HTMLCanvasElement, plateSet: string, npcPositions: Actor[] = []) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene.background = new THREE.Color(PAPER.WARM);

    this.camera = new THREE.OrthographicCamera(
      -VIEW_W / 2, VIEW_W / 2, VIEW_H / 2, -VIEW_H / 2, 0.1, 100,
    );
    this.camera.position.z = 20;

    this.loadScene(plateSet, npcPositions);

    this.target = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    this.postMat = new THREE.ShaderMaterial({
      uniforms: {
        uScene: { value: this.target.texture },
        uPaper: { value: textureFrom(paperTexture()) },
        uMood: { value: 0.5 },
        uVignette: { value: 0.22 },
        uSun: { value: new THREE.Vector2(0.26, 0.16) },
        uWarm: { value: 0.9 },
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

  /**
   * Swap in a different composed view. Textures and geometry are disposed
   * rather than orphaned — an eight-act game that leaks a plate set per scene
   * change would not survive a class period on a Chromebook.
   */
  loadScene(plateSet: string, npcPositions: Actor[]): void {
    const drop = (mesh: THREE.Mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.map?.dispose();
      m.dispose();
    };
    for (const m of [this.clouds, this.shadowMesh, this.moteMesh]) if (m) drop(m);
    this.clouds = null;
    this.cloudTex = null;
    this.shadowMesh = null;
    this.shadowTex = null;
    this.moteMesh = null;
    this.moteTex = null;
    for (const l of this.layers) drop(l.mesh);
    for (const n of this.npcs) drop(n.mesh);
    if (this.player) drop(this.player);
    for (const t of this.playerFrames) t.dispose();
    this.layers = [];
    this.npcs = [];
    this.playerFrames = [];
    this.gait = 0;
    this.bob = 0;
    this.breath = 0;
    this.breathZ = 0;

    const build = PLATE_SETS[plateSet] ?? PLATE_SETS.vernon;
    build().forEach((plate, i) => {
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

    // Cloud strip, between the sky and the hills. It never occludes anything,
    // so it sits outside the sorted layer stack and just drifts.
    const cloudBuild = CLOUD_BANDS[plateSet] ?? CLOUD_BANDS.vernon;
    this.cloudTex = textureFrom(cloudBuild());
    this.cloudTex.wrapS = THREE.RepeatWrapping;
    this.clouds = new THREE.Mesh(
      new THREE.PlaneGeometry(VIEW_W * 1.14, VIEW_H * 1.14),
      new THREE.MeshBasicMaterial({ map: this.cloudTex, transparent: true, depthWrite: false }),
    );
    this.clouds.position.z = -0.25;
    this.clouds.renderOrder = 0.5;
    this.scene.add(this.clouds);

    // Cloud shadows on the ground, between the ground plate and the far
    // midground, drifting a little slower than the clouds that cast them.
    this.shadowTex = textureFrom(cloudShadows());
    this.shadowTex.wrapS = THREE.RepeatWrapping;
    this.shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(VIEW_W * 1.14, VIEW_H * 1.14),
      new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false }),
    );
    this.shadowMesh.position.z = -1.1;
    this.shadowMesh.renderOrder = 2.5;
    this.scene.add(this.shadowMesh);

    // Near-field motes, drifting diagonally in front of everything.
    this.moteTex = textureFrom(motes());
    this.moteTex.wrapS = THREE.RepeatWrapping;
    this.moteTex.wrapT = THREE.RepeatWrapping;
    this.moteTex.repeat.set(3.2, 1.8);
    this.moteMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(VIEW_W * 1.14, VIEW_H * 1.14),
      new THREE.MeshBasicMaterial({ map: this.moteTex, transparent: true, depthWrite: false, opacity: 0.5 }),
    );
    this.moteMesh.position.z = 1.5;
    this.moteMesh.renderOrder = 6;
    this.scene.add(this.moteMesh);

    this.buildActors(npcPositions);
  }

  private buildActors(npcPositions: Actor[]): void {
    const mk = (canvas: HTMLCanvasElement, z: number, tall = 1) => {
      const tex = textureFrom(canvas);
      const aspect = canvas.width / canvas.height;
      const h = 2.6 * tall;
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
    // Washington: the only Continental blue in the frame, and the tallest man
    // in it. He was six foot two in a room where that was remarkable.
    const frames = characterFrames(MEANING.CONTINENTAL_BLUE, 101, 320, 8, { build: 1.02 });
    this.playerFrames = frames.map(textureFrom);
    this.player = mk(frames[0], -1.2, 1.09);
    (this.player.material as THREE.MeshBasicMaterial).map = this.playerFrames[0];

    npcPositions.forEach((a, i) => {
      const mesh = mk(
        characterCutout(a.coat, a.seed, 320, -1, { hat: a.hat, build: a.build }),
        -1.25,
        a.tall ?? 1,
      );
      // Staggered so nobody moves at the same moment as anybody else.
      this.npcs.push({ mesh, pos: { x: a.x, z: a.z }, wait: 5 + i * 4.4, off: 0, target: 0 });
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
    // Weather moves whether or not the player does. It is the one thing in the
    // frame allowed to, because a sky that holds perfectly still reads as a
    // painted backdrop rather than as air.
    if (this.cloudTex) this.cloudTex.offset.x -= dt * 0.0022;
    if (this.shadowTex) this.shadowTex.offset.x -= dt * 0.0016;
    if (this.moteTex) {
      this.moteTex.offset.x -= dt * 0.0035;
      this.moteTex.offset.y -= dt * 0.0012;
    }
    if (this.clouds) this.clouds.position.x = -this.breath * 0.16 * ((PARALLAX_MAX_PX / 1600) * VIEW_W);

    this.place(this.player, pos);
    this.player.position.y += this.bob;

    /*
     * Standing idle.
     *
     * A continuous sway was wrong: figures that never stop moving read as
     * floating, and at a glance the whole frame looks like it is drifting. A
     * person waiting is still almost all of the time and then shifts their
     * weight. So each NPC holds a fixed offset, and every few seconds picks a
     * new one and eases across to it — then genuinely stops, snapped, so the
     * frame is completely static between shifts.
     */
    for (const n of this.npcs) {
      this.place(n.mesh, n.pos);
      if (!IDLE_SHIFTS) continue;
      n.wait -= dt;
      if (n.wait <= 0) {
        n.target = n.target > 0 ? 0 : 0.018;
        // Long holds. With several figures on screen, even an occasional shift
        // each overlaps into near-constant motion unless the gaps are large and
        // the moves are quick — the frame has to be genuinely static most of
        // the time or the whole scene reads as drifting.
        n.wait = 14 + Math.abs(Math.sin(n.pos.x * 91.7 + n.pos.z * 53.3)) * 12;
      }
      const d = n.target - n.off;
      if (Math.abs(d) < 0.0004) {
        n.off = n.target; // snap, so "still" means still
      } else {
        n.off += d * Math.min(1, dt * 9);
      }
      n.mesh.position.y -= n.off * n.mesh.scale.x;
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
    // Kept shallow throughout. A heavy vignette reads as weather, and weather
    // is the wash's job, not the lens's.
    this.postMat.uniforms.uVignette.value = 0.30 - 0.13 * mood;
    this.postMat.uniforms.uWarm.value = 0.55 + 0.55 * mood;
  }

  /** Where the light comes from, in uv. Set per scene. */
  setSun(x: number, y: number): void {
    this.postMat.uniforms.uSun.value.set(x, y);
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
