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
  layerForeground,
  layerHills,
  layerHouse,
  layerSky,
  layerTrees,
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
}

export class DioramaRenderer {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private layers: Layer[] = [];
  private player!: THREE.Mesh;
  private npcs: { mesh: THREE.Mesh; t: number }[] = [];

  private target: THREE.WebGLRenderTarget;
  private postScene = new THREE.Scene();
  private postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private postMat: THREE.ShaderMaterial;

  private breath = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene.background = new THREE.Color(PAPER.WARM);

    this.camera = new THREE.OrthographicCamera(
      -VIEW_W / 2, VIEW_W / 2, VIEW_H / 2, -VIEW_H / 2, 0.1, 100,
    );
    this.camera.position.z = 20;

    const plates = [layerSky(), layerHills(), layerHouse(), layerTrees(), layerForeground()];
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
      this.layers.push({ mesh, parallax: PARALLAX[i] });
    });

    this.buildActors();

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

  private buildActors(): void {
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

    this.player = mk(characterCutout(MEANING.CONTINENTAL_BLUE, 101), -1.2);
    this.npcs.push({ mesh: mk(characterCutout('#6B4F35', 202), -1.25), t: 0.24 });
    this.npcs.push({ mesh: mk(characterCutout('#55627A', 303), -1.22), t: 0.78 });
  }

  /** Place an actor on the walk-plane: horizontal position, ground line, scale. */
  private place(mesh: THREE.Mesh, t: number): void {
    const x = (t - 0.5) * VIEW_W * 0.86;
    // The walk-plane rises slightly toward the centre of frame, so figures
    // further "back" sit higher and read smaller.
    const depth = 1 - Math.abs(t - 0.5) * 0.5;
    const scale = 0.82 + 0.18 * (1 - depth);
    mesh.scale.setScalar(scale);
    const h = 2.6 * scale;
    mesh.position.x = x;
    mesh.position.y = -VIEW_H / 2 + h / 2 + 0.9 + (1 - depth) * 0.5;
  }

  setPlayerT(t: number): void {
    this.place(this.player, t);
    for (const n of this.npcs) this.place(n.mesh, n.t);

    // Parallax breath: the frame shifts against the walk, capped at 64px.
    const target = (t - 0.5) * 2;
    this.breath += (target - this.breath) * 0.12;
    const px = (PARALLAX_MAX_PX / 1600) * VIEW_W;
    for (const l of this.layers) {
      l.mesh.position.x = -this.breath * l.parallax * px;
    }
  }

  npcPositions(): number[] {
    return this.npcs.map((n) => n.t);
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
