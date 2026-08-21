/**
 * The post stack, which IS the art direction.
 *
 * Strip these four passes off and what is left is a competent tile game. With
 * them the pixels sit inside weather and light and the eye goes where the
 * composition sends it. In order:
 *
 *   1. downsample to quarter resolution
 *   2. separable blur, two draws          → the soft copy
 *   3. bright-pass and blur the soft copy → the bloom
 *   4. composite: sharp scene, blurred by distance from the focus band,
 *      plus bloom, plus vignette, plus grade
 *
 * THE BUDGET. Everything but the composite runs at quarter resolution: six
 * quarter-res full-screen draws plus one native-res draw. On a 1366x768 panel
 * that is about 1.6 million shaded pixels a frame against a UHD 600's real
 * throughput of 1.5-2 GPix/s, which leaves the fill rate for the world. A
 * naive `UnrealBloomPass` plus a real depth-of-field would be six times that
 * and would put the reference machine under thirty frames.
 *
 * THE TILT-SHIFT IS A LIE, DELIBERATELY. It blurs by distance from a horizontal
 * band, not by depth. A real circle of confusion needs the depth buffer and a
 * scatter; this needs one lerp. At a fixed camera pitch the band and the depth
 * agree closely enough that nobody has ever noticed, and it is the single
 * cheapest thing in the renderer that makes the world read as a diorama.
 */

import * as THREE from 'three';
import type { Light } from '../palette';
import { parseHex } from './pixels';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const COPY = /* glsl */ `
  precision mediump float;
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() { gl_FragColor = texture2D(uTex, vUv); }
`;

/** Nine-tap Gaussian along one axis. Cheap, and at quarter res it is plenty. */
const BLUR = /* glsl */ `
  precision mediump float;
  uniform sampler2D uTex;
  uniform vec2 uDir;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uTex, vUv) * 0.2270270270;
    c += texture2D(uTex, vUv + uDir * 1.3846153846) * 0.3162162162;
    c += texture2D(uTex, vUv - uDir * 1.3846153846) * 0.3162162162;
    c += texture2D(uTex, vUv + uDir * 3.2307692308) * 0.0702702703;
    c += texture2D(uTex, vUv - uDir * 3.2307692308) * 0.0702702703;
    gl_FragColor = c;
  }
`;

/** Everything brighter than the threshold, smoothly, so it does not band. */
const BRIGHT = /* glsl */ `
  precision mediump float;
  uniform sampler2D uTex;
  uniform float uThreshold;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float k = smoothstep(uThreshold, uThreshold + 0.30, l);
    gl_FragColor = vec4(c * k, 1.0);
  }
`;

const COMPOSITE = /* glsl */ `
  precision mediump float;
  uniform sampler2D uScene;
  uniform sampler2D uBlur;
  uniform sampler2D uBloom;
  uniform float uBloomStrength;
  uniform float uFocus;        // where the sharp band sits, 0 top .. 1 bottom
  uniform float uBandTop;      // how far above the focus stays sharp
  uniform float uBandBottom;
  uniform float uTiltAmount;
  uniform float uVignette;
  uniform float uSaturation;
  uniform vec3  uLift;
  uniform vec3  uGain;
  uniform float uFade;         // 1 = full picture, 0 = black. Transitions.
  varying vec2 vUv;

  void main() {
    vec3 sharp = texture2D(uScene, vUv).rgb;
    vec3 soft  = texture2D(uBlur,  vUv).rgb;

    // Tilt-shift: sharp inside the band, blurred outside it, with a soft edge.
    float d = vUv.y - uFocus;
    float band = d < 0.0 ? uBandTop : uBandBottom;
    float k = smoothstep(0.0, 1.0, clamp((abs(d) - band) / max(0.0001, band * 1.6), 0.0, 1.0));
    vec3 c = mix(sharp, soft, k * uTiltAmount);

    /*
     * Grade the SCENE, then add the bloom on top of the graded scene.
     *
     * The order matters and it took a night at the Brooklyn ferry to find
     * out why. Bloom is light arriving at the lens from a source in frame;
     * exposure is how long the plate is open. Grading after the bloom was
     * added meant that exposing down for a night scene crushed the lanterns
     * along with everything else, and the first build of that map came out
     * as a black rectangle with three faint yellow smudges in it.
     *
     * This way, stopping the frame down darkens the world and leaves the
     * lanterns exactly where they were — which is both what a night
     * photograph looks like and the entire point of a night scene.
     */
    c = c * uGain + uLift;
    c += texture2D(uBloom, vUv).rgb * uBloomStrength;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, uSaturation);

    // Vignette, elliptical, keyed off the frame rather than the world.
    vec2 p = (vUv - 0.5) * vec2(1.05, 1.0);
    float v = 1.0 - uVignette * dot(p, p) * 1.9;
    c *= clamp(v, 0.0, 1.0);

    // Cheap filmic shoulder, so bloom highlights roll rather than clip.
    c = c / (c + vec3(0.72)) * 1.55;

    gl_FragColor = vec4(c * uFade, 1.0);
  }
`;

function fullscreen(material: THREE.ShaderMaterial): THREE.Mesh {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const m = new THREE.Mesh(g, material);
  m.frustumCulled = false;
  return m;
}

function rt(w: number, h: number): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: true,
    stencilBuffer: false,
  });
}

export interface PostSettings {
  bloom: number;
  bloomThreshold: number;
  tilt: number;
  focus: number;
  bandTop: number;
  bandBottom: number;
  vignette: number;
  saturation: number;
  lift: [number, number, number];
  gain: [number, number, number];
}

export const DEFAULT_POST: PostSettings = {
  bloom: 0.55,
  bloomThreshold: 0.58,
  // Lessened, and rebalanced. The top band was under half the size of the
  // bottom one (0.15 against 0.26), so the sky and the upper storeys were
  // carrying nearly twice the blur the foreground was — both are wider now,
  // and the top came up by more, since it was the worse-blurred of the two.
  tilt: 0.82,
  focus: 0.62,
  bandTop: 0.24,
  bandBottom: 0.32,
  vignette: 0.36,
  saturation: 1.06,
  lift: [0, 0, 0],
  gain: [1, 1, 1],
};

export class Post {
  private scene = new THREE.Scene();
  private cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  private sceneRT!: THREE.WebGLRenderTarget;
  private half!: THREE.WebGLRenderTarget;
  private blurA!: THREE.WebGLRenderTarget;
  private blurB!: THREE.WebGLRenderTarget;
  private bloomA!: THREE.WebGLRenderTarget;
  private bloomB!: THREE.WebGLRenderTarget;

  private copyMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: COPY, uniforms: { uTex: { value: null } },
    depthTest: false, depthWrite: false,
  });
  private blurMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: BLUR,
    uniforms: { uTex: { value: null }, uDir: { value: new THREE.Vector2() } },
    depthTest: false, depthWrite: false,
  });
  private brightMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: BRIGHT,
    uniforms: { uTex: { value: null }, uThreshold: { value: 0.62 } },
    depthTest: false, depthWrite: false,
  });
  private compMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: COMPOSITE,
    uniforms: {
      uScene: { value: null }, uBlur: { value: null }, uBloom: { value: null },
      uBloomStrength: { value: 0.55 },
      uFocus: { value: 0.6 }, uBandTop: { value: 0.16 }, uBandBottom: { value: 0.2 },
      uTiltAmount: { value: 1 }, uVignette: { value: 0.42 },
      uSaturation: { value: 1.06 },
      uLift: { value: new THREE.Vector3() },
      uGain: { value: new THREE.Vector3(1, 1, 1) },
      uFade: { value: 1 },
    },
    depthTest: false, depthWrite: false,
  });

  private quad = fullscreen(this.copyMat);
  private w = 1;
  private h = 1;

  constructor(private renderer: THREE.WebGLRenderer) {
    this.scene.add(this.quad);
    this.resize(1, 1);
  }

  resize(w: number, h: number): void {
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    for (const t of [this.sceneRT, this.half, this.blurA, this.blurB, this.bloomA, this.bloomB]) t?.dispose();
    this.sceneRT = rt(w, h);
    const qw = Math.max(1, Math.floor(w / 4)), qh = Math.max(1, Math.floor(h / 4));
    this.half = rt(qw, qh);
    this.blurA = rt(qw, qh);
    this.blurB = rt(qw, qh);
    this.bloomA = rt(qw, qh);
    this.bloomB = rt(qw, qh);
  }

  /** The target the world should be drawn into. */
  get target(): THREE.WebGLRenderTarget { return this.sceneRT; }

  private draw(mat: THREE.ShaderMaterial, into: THREE.WebGLRenderTarget | null): void {
    this.quad.material = mat;
    this.renderer.setRenderTarget(into);
    this.renderer.render(this.scene, this.cam);
  }

  /** Everything after the world. Call with the world already in `target`. */
  run(s: PostSettings, fade = 1): void {
    const qw = this.half.width, qh = this.half.height;

    this.copyMat.uniforms.uTex.value = this.sceneRT.texture;
    this.draw(this.copyMat, this.half);

    this.blurMat.uniforms.uTex.value = this.half.texture;
    this.blurMat.uniforms.uDir.value.set(1 / qw, 0);
    this.draw(this.blurMat, this.blurA);
    this.blurMat.uniforms.uTex.value = this.blurA.texture;
    this.blurMat.uniforms.uDir.value.set(0, 1 / qh);
    this.draw(this.blurMat, this.blurB);

    if (s.bloom > 0.001) {
      this.brightMat.uniforms.uTex.value = this.blurB.texture;
      this.brightMat.uniforms.uThreshold.value = s.bloomThreshold;
      this.draw(this.brightMat, this.bloomA);
      this.blurMat.uniforms.uTex.value = this.bloomA.texture;
      this.blurMat.uniforms.uDir.value.set(2.2 / qw, 0);
      this.draw(this.blurMat, this.bloomB);
      this.blurMat.uniforms.uTex.value = this.bloomB.texture;
      this.blurMat.uniforms.uDir.value.set(0, 2.2 / qh);
      this.draw(this.blurMat, this.bloomA);
    }

    const u = this.compMat.uniforms;
    u.uScene.value = this.sceneRT.texture;
    u.uBlur.value = this.blurB.texture;
    u.uBloom.value = s.bloom > 0.001 ? this.bloomA.texture : this.blurB.texture;
    u.uBloomStrength.value = s.bloom;
    u.uFocus.value = s.focus;
    u.uBandTop.value = s.bandTop;
    u.uBandBottom.value = s.bandBottom;
    u.uTiltAmount.value = s.tilt;
    u.uVignette.value = s.vignette;
    u.uSaturation.value = s.saturation;
    (u.uLift.value as THREE.Vector3).set(...s.lift);
    (u.uGain.value as THREE.Vector3).set(...s.gain);
    u.uFade.value = fade;
    this.draw(this.compMat, null);
    this.renderer.setRenderTarget(null);
  }
}

/** Turn a Light into post settings. This is the mood controller now. */
export function postFor(light: Light, over: Partial<PostSettings> = {}): PostSettings {
  const [hr, hg, hb] = parseHex(light.haze);
  return {
    ...DEFAULT_POST,
    bloom: light.bloom,
    saturation: light.saturation,
    /*
     * A darker frame needs a lower bloom threshold, or nothing in it is
     * bright enough to bloom at all and the one light source in the scene
     * stops being a light source.
     */
    bloomThreshold: DEFAULT_POST.bloomThreshold * (0.5 + 0.5 * (light.exposure ?? 1)),
    // The haze tints the lift, so distance goes to the sky's colour rather
    // than to grey — which is the only bit of aerial perspective a flat
    // renderer gets for free.
    lift: [(hr / 255) * 0.045, (hg / 255) * 0.045, (hb / 255) * 0.05],
    /*
     * Exposure, tinted a hair cool.
     *
     * A night frame is not a day frame with a dark fill; it is the same
     * frame exposed three stops down with the lanterns left where they are.
     * The blue channel is held up slightly because everything the eye reads
     * as night is a very dark blue and never a grey.
     */
    gain: light.exposure === undefined
      ? [1, 1, 1]
      : [light.exposure, light.exposure * 1.01, light.exposure * 1.09],
    ...over,
  };
}
