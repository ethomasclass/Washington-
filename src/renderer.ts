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
  characterCutout, cloudShadows, CLOUD_BANDS, insect, motes,
  PLATE_DEPTHS, PLATE_SETS, paperTexture, prop, PROP_H, washington, washingtonFrames,
} from './art';
import type { Facing, LookOpts, PropKind } from './art';
import { PAPER } from './palette';
import {
  FIGURE_H, groundView, VIEW_H, VIEW_W,
} from './ground';
export type { GroundPos } from './ground';
import type { GroundPos } from './ground';

/** Parallax coefficients, L0..L5. */
const PARALLAX = [0.1, 0.26, 0.5, 0.74, 1.06, 1.6];
const PARALLAX_MAX_PX = 64; // "breath", not a camera move
/*
 * The walkable ground is plate L2 (sky, hills, GROUND, farMid, midground,
 * foreground). Everything that stands ON the ground — the player, the NPCs, the
 * set pieces, even the insects — is glued to this same coefficient, so it breathes
 * WITH the ground instead of sliding across it. Without this the figures held
 * still while the ground swung under them as the player walked, and a man standing
 * beside a tent drifted off the tent — which is the whole "weird perspective".
 */
const GROUND_PARALLAX = PARALLAX[2];
/** Plate sets that are rooms, not open ground: no weather, no insects, no air. */
const INTERIOR_PLATES = new Set(['parlour']);


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

/*
 * The ground plane — actors live at (x, z), x across the frame and z into it —
 * is defined in ground.ts, because the plate painter and the content linter
 * need exactly the same curve.
 */

/**
 * Standing figures shift their weight occasionally. Set false for a completely
 * static frame whenever the player is not moving.
 */
const IDLE_SHIFTS = true;

/** A set piece standing on the ground plane. */
export interface PropPlacement extends GroundPos {
  kind: PropKind;
  seed: number;
}

/** A figure on the ground plane, with the build that distinguishes them. */
export interface Actor extends GroundPos, LookOpts {
  coat: string;
  tall?: number;
  seed: number;
}


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
  /**
   * Walk cycles, one set per facing, index 0 of each being the standing pose.
   *
   * Three sets rather than one because a man seen head-on does not walk like a
   * man seen from the side: the stride that reads as a stride in profile
   * foreshortens to almost nothing when he is coming toward you, and using the
   * profile cycle for all four directions makes him look like he is sidling.
   */
  private playerFrames: Record<Facing, THREE.CanvasTexture[]> = {
    front: [], back: [], side: [],
  };
  private facing: Facing = 'front';
  /** +1 when he faces frame-right, -1 when left. Only used by the side cycle. */
  private facingSign = 1;
  /** Cloud strip, scrolled rather than animated. */
  private clouds: THREE.Mesh | null = null;
  private cloudTex: THREE.CanvasTexture | null = null;
  private shadowMesh: THREE.Mesh | null = null;
  private shadowTex: THREE.CanvasTexture | null = null;
  private moteMesh: THREE.Mesh | null = null;
  private moteTex: THREE.CanvasTexture | null = null;
  /**
   * Foreground insects. Everything else in the frame either holds still or
   * moves because the player did; these are the only things with somewhere of
   * their own to be, which is most of why the air in front of the player reads
   * as air rather than as varnish.
   */
  private bugs: {
    mesh: THREE.Mesh;
    /** Wandering path: a slow Lissajous on the ground plane, plus height. */
    cx: number; cz: number; rx: number; rz: number;
    fx: number; fz: number; fy: number;
    phx: number; phz: number; phy: number;
    hy: number; hr: number;
    /** Wingbeat: rate in beats per second, and how far the sprite squeezes. */
    beat: number; squeeze: number;
    t: number;
  }[] = [];
  /**
   * Set pieces. Placed exactly like the figures, which is the point: a kettle
   * at the back of the scene takes its size and its position from the same
   * curve the man walking toward it does, so nobody has to choose a number and
   * nothing can drift out of agreement.
   */
  private props: { mesh: THREE.Mesh; pos: GroundPos; flicker: boolean; t: number }[] = [];
  private gait = 0;
  private bob = 0;


  private target: THREE.WebGLRenderTarget;
  private postScene = new THREE.Scene();
  private postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private postMat: THREE.ShaderMaterial;

  private breath = 0;
  private breathZ = 0;
  /*
   * The ground plate's current breath offset, mirrored here so screenPos() can
   * shift a DOM prompt by the same amount the prop under it just moved. Updated
   * every frame in setPlayerPos.
   */
  private groundOff = { x: 0, y: 0 };
  /** Size multiplier on all figures and props. 1 outdoors; larger in a room. */
  private figureScale = 1;

  constructor(
    canvas: HTMLCanvasElement,
    plateSet: string,
    npcPositions: Actor[] = [],
    props: PropPlacement[] = [],
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene.background = new THREE.Color(PAPER.WARM);

    this.camera = new THREE.OrthographicCamera(
      -VIEW_W / 2, VIEW_W / 2, VIEW_H / 2, -VIEW_H / 2, 0.1, 100,
    );
    this.camera.position.z = 20;

    this.loadScene(plateSet, npcPositions, props);

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
  loadScene(plateSet: string, npcPositions: Actor[], props: PropPlacement[] = []): void {
    const drop = (mesh: THREE.Mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.map?.dispose();
      m.dispose();
    };
    for (const m of [this.clouds, this.shadowMesh, this.moteMesh]) if (m) drop(m);
    for (const b of this.bugs) drop(b.mesh);
    this.bugs = [];
    for (const pr of this.props) drop(pr.mesh);
    this.props = [];
    this.clouds = null;
    this.cloudTex = null;
    this.shadowMesh = null;
    this.shadowTex = null;
    this.moteMesh = null;
    this.moteTex = null;
    for (const l of this.layers) drop(l.mesh);
    for (const n of this.npcs) drop(n.mesh);
    if (this.player) drop(this.player);
    for (const set of Object.values(this.playerFrames)) for (const t of set) t.dispose();
    this.layers = [];
    this.npcs = [];
    this.playerFrames = { front: [], back: [], side: [] };
    this.gait = 0;
    this.bob = 0;
    this.breath = 0;
    this.breathZ = 0;

    const build = PLATE_SETS[plateSet] ?? PLATE_SETS.vernon;
    // Depths come from the plate painter, which knows what it painted and where.
    const depths = PLATE_DEPTHS[plateSet] ?? PLATE_DEPTHS.vernon;
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
      this.layers.push({ mesh, parallax: PARALLAX[i], depth: depths[i] ?? 1 });
    });

    // Weather and insects belong to the open air. An interior plate set gets
    // none of it: no cloud strip, no cloud-shadows crossing the floor, no motes,
    // no bugs. The offset-advancing code in setPlayerPos is already guarded on
    // each texture being present, so leaving them null is enough.
    const interior = INTERIOR_PLATES.has(plateSet);

    if (!interior) {
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

      this.buildBugs(plateSet);
    }

    this.buildProps(props);
    this.buildActors(npcPositions, plateSet);
  }

  /**
   * Three insects per scene, in the strip of ground between the player and the
   * camera. They are placed with the same ground projection as the figures, so
   * one that wanders toward the horizon shrinks and rises exactly as a person
   * would — the whole point is that they occupy the same space, not a separate
   * "effects" layer floating over the picture.
   *
   * The wingbeat is a horizontal squeeze of the sprite. At Mount Vernon in May
   * that is butterflies over the garden; in camp it is flies, which is the
   * historically louder fact about that place and does not need saying out loud.
   */
  private buildBugs(plateSet: string): void {
    const kinds: ('butterfly' | 'fly' | 'dragonfly')[] =
      plateSet === 'camp'
        ? ['fly', 'fly', 'fly']
        : ['butterfly', 'butterfly', 'dragonfly'];
    // Sized as foreground, not as wildlife. These are nearer the lens than the
    // player is, so a butterfly reads at roughly a fifth of his height; drawn to
    // literal scale it disappears into the ground litter and looks like grit.
    const SIZE = { butterfly: 0.52, fly: 0.24, dragonfly: 0.46 };
    const BEAT = { butterfly: 4.2, fly: 13, dragonfly: 16 };
    // How far the wingbeat closes. Past about half the sprite the silhouette
    // stops being an insect and starts being a mark on the paper.
    const SQUEEZE = { butterfly: 0.52, fly: 0.40, dragonfly: 0.26 };

    kinds.forEach((kind, i) => {
      const canvas = insect(kind, 71 + i * 37);
      const h = SIZE[kind];
      const w = h * (canvas.width / canvas.height);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: textureFrom(canvas), transparent: true, depthWrite: false }),
      );
      mesh.position.z = -1.15;
      this.scene.add(mesh);

      // Three incommensurate rates per bug, so the path never visibly repeats.
      this.bugs.push({
        mesh,
        cx: 0.19 + i * 0.31,
        cz: 0.03 + (i % 2) * 0.035,
        rx: 0.17 + i * 0.04,
        rz: 0.022,
        fx: 0.21 + i * 0.037,
        fz: 0.53 + i * 0.11,
        fy: 0.81 + i * 0.19,
        phx: i * 2.1,
        phz: i * 1.3,
        phy: i * 0.7,
        hy: 0.34 + i * 0.30,
        hr: 0.22,
        beat: BEAT[kind],
        squeeze: SQUEEZE[kind],
        t: i * 3.7,
      });
    });
  }

  private buildProps(props: PropPlacement[]): void {
    for (const p of props) {
      const canvas = prop(p.kind, p.seed);
      // Height is given in man-heights, so the sprite is sized against a figure
      // at the same depth rather than against the frame.
      const h = FIGURE_H * PROP_H[p.kind];
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(h * (canvas.width / canvas.height), h),
        new THREE.MeshBasicMaterial({ map: textureFrom(canvas), transparent: true, depthWrite: false }),
      );
      mesh.position.z = -1.3;
      this.scene.add(mesh);
      this.props.push({ mesh, pos: { x: p.x, z: p.z }, flicker: p.kind === 'fire', t: p.seed % 7 });
    }
  }

  private buildActors(npcPositions: Actor[], plateSet: string): void {
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
    // His rank marker is documented from 14 July 1775, so Act 1 does not have it.
    const riband = plateSet !== 'vernon';
    for (const f of ['front', 'back', 'side'] as Facing[]) {
      this.playerFrames[f] = washingtonFrames(f, 8, 320, { riband }).map(textureFrom);
    }
    this.player = mk(washington('front', -1, { riband }), -1.2, 1.09);
    (this.player.material as THREE.MeshBasicMaterial).map = this.playerFrames.front[0];

    npcPositions.forEach((a, i) => {
      const mesh = mk(
        characterCutout(a.coat, a.seed, 320, -1, {
          hat: a.hat, build: a.build, gown: a.gown, skin: a.skin,
          hair: a.hair, facings: a.facings, cap: a.cap,
        }),
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
   *
   * `figureScale` multiplies the size only. It exists for interiors: the ground
   * curve is calibrated for people seen across a lawn, and the same numbers leave
   * a man a small figure on a parlour's floor. Scaling the size — not the feet
   * position, which stays on the ground — brings the camera into the room without
   * touching the plate geometry every other scene depends on.
   */
  private project(pos: GroundPos): { x: number; y: number; scale: number } {
    const v = groundView(pos);
    return { x: v.x, y: v.y, scale: v.scale * this.figureScale };
  }

  setFigureScale(k: number): void {
    this.figureScale = k;
  }

  /** Screen pixels for a ground position, for placing DOM prompts. */
  screenPos(pos: GroundPos): { x: number; y: number } {
    const { x, y, scale } = this.project(pos);
    // The prop under the prompt breathes with the ground; the prompt follows it.
    const v = new THREE.Vector3(
      x + this.groundOff.x,
      y + this.groundOff.y + FIGURE_H * scale,
      0,
    ).project(this.camera);
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
  /**
   * Which way he is facing, from which way he is going.
   *
   * Sideways wins ties by a margin, because a man walking mostly across the
   * frame reads far better in profile than three-quarters-on, and because
   * flipping between facings on every wobble of a diagonal looks like a
   * stutter. The sign is held when he stops, so a figure that walked in facing
   * left goes on facing left.
   */
  setFacing(dx: number, dz: number): void {
    if (Math.abs(dx) < 1e-6 && Math.abs(dz) < 1e-6) return;
    if (Math.abs(dx) > Math.abs(dz) * 0.75) {
      this.facing = 'side';
      this.facingSign = dx > 0 ? 1 : -1;
    } else {
      // z grows into the frame, so increasing z is walking away.
      this.facing = dz > 0 ? 'back' : 'front';
    }
  }

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
    const set = this.playerFrames[this.facing];
    const n = set.length - 1;
    const idx = dist > 1e-5 ? 1 + (Math.floor(this.gait * n) % n) : 0;
    const mat = this.player.material as THREE.MeshBasicMaterial;
    if (mat.map !== set[idx]) {
      mat.map = set[idx];
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

    /*
     * Parallax breath, computed here at the top so the figures can be placed
     * with it — walking across slides the stack sideways; walking into it pushes
     * the near layers down and out, which is what sells the ground as a plane
     * rather than a line.
     *
     * The vertical sign was once backwards: the camera holds the player, so it
     * tilts down when he is near the front and up when he is at the back, and
     * scenery moves against the camera, nearer layers moving most. Walking away
     * settles the near layers downward, letting him climb clear of them.
     */
    const targetX = (pos.x - 0.5) * 2;
    const targetY = (pos.z - 0.35) * 2;
    this.breath += (targetX - this.breath) * 0.12;
    this.breathZ += (targetY - this.breathZ) * 0.10;
    const px = (PARALLAX_MAX_PX / 1600) * VIEW_W;
    for (const l of this.layers) {
      l.mesh.position.x = -this.breath * l.parallax * px;
      l.mesh.position.y = -this.breathZ * l.parallax * px * 0.42;
    }
    // The offset the GROUND plate takes — and therefore the offset everything
    // standing on it must take, so the cast breathes with the ground and only
    // the nearer and farther plates parallax against it.
    const gpx = -this.breath * GROUND_PARALLAX * px;
    const gpy = -this.breathZ * GROUND_PARALLAX * px * 0.42;
    this.groundOff.x = gpx;
    this.groundOff.y = gpy;

    this.place(this.player, pos);
    this.player.position.x += gpx;
    this.player.position.y += this.bob + gpy;
    // The side cycle is drawn facing frame-left; mirror it to go the other way.
    if (this.facing === 'side' && this.facingSign > 0) {
      this.player.scale.x = -this.player.scale.x;
    }

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
      n.mesh.position.x += gpx;
      n.mesh.position.y += gpy;
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

    // Set pieces stand still. The one exception is a fire, which is the only
    // thing in the camp that would look wrong holding perfectly steady.
    for (const pr of this.props) {
      const { x, y, scale } = this.project(pr.pos);
      pr.mesh.position.x = x + gpx;
      pr.mesh.renderOrder = this.orderFor(pr.pos.z);
      if (pr.flicker) {
        pr.t += dt;
        const f = 1 + Math.sin(pr.t * 7.3) * 0.05 + Math.sin(pr.t * 17.1) * 0.03;
        pr.mesh.scale.set(scale * (2 - f), scale * f, 1);
        pr.mesh.position.y = y + gpy + (FIGURE_H * PROP_H.fire * scale * f) / 2;
      } else {
        pr.mesh.scale.setScalar(scale);
        pr.mesh.position.y = y + gpy + (pr.mesh.geometry as THREE.PlaneGeometry).parameters.height * scale / 2;
      }
    }

    /*
     * Insects. Unlike the NPCs these are always in motion, which is fine: they
     * are small, they are in front, and a butterfly that stopped dead would be
     * more distracting than one that does not. The mirror on x means each one
     * faces the way it is going, so the path reads as intent rather than drift.
     */
    for (const b of this.bugs) {
      b.t += dt;
      const x = b.cx + b.rx * Math.sin(b.t * b.fx + b.phx);
      const z = b.cz + b.rz * Math.sin(b.t * b.fz + b.phz);
      const p = this.project({ x, z });
      const facing = Math.cos(b.t * b.fx + b.phx) >= 0 ? 1 : -1;
      const beat = 1 - b.squeeze * (0.5 - 0.5 * Math.cos(b.t * b.beat * Math.PI * 2));
      b.mesh.scale.set(p.scale * beat * facing, p.scale, 1);
      b.mesh.position.x = p.x + gpx;
      b.mesh.position.y = p.y + gpy + (b.hy + b.hr * Math.sin(b.t * b.fy + b.phy)) * p.scale;
      b.mesh.renderOrder = this.orderFor(z);
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

  /**
   * A still of the current frame, safe to draw from.
   *
   * A WebGL drawing buffer is cleared the moment the browser composites, so
   * reading the canvas from any later task gives an empty image — which is
   * exactly what the spyglass got on its first attempt: a perfect brass rim
   * around nothing. Rendering and copying inside one call is valid, and costs
   * nothing when nobody is looking through a glass. The alternative,
   * preserveDrawingBuffer, taxes every frame of the game for the sake of the
   * few that get grabbed.
   */
  snapshot(): HTMLCanvasElement {
    this.render();
    const src = this.renderer.domElement;
    const out = document.createElement('canvas');
    out.width = src.width;
    out.height = src.height;
    out.getContext('2d')!.drawImage(src, 0, 0);
    return out;
  }

  render(): void {
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  }
}
