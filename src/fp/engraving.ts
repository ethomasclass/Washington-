/**
 * The engraving pass — what makes the first-person world read as a print.
 *
 * Three render targets, composited once:
 *   1. COLOUR   the toon-shaded scene (flat fills, one soft shadow band).
 *   2. NORMAL   the same scene with a normal material, for crease detection.
 *   3. DEPTH    a depth texture on the colour target, for silhouette detection.
 *
 * The composite draws an INK line wherever depth or normals break between a
 * pixel and its neighbours — that is every silhouette and every hard crease,
 * which is exactly what a burin cuts — then lays warm laid-paper grain over the
 * whole frame. No line is authored per-object; the geometry's own edges are the
 * plate.
 */

import * as THREE from 'three';

const COMPOSITE_FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D uColor;
  uniform sampler2D uNormal;
  uniform sampler2D uDepth;
  uniform vec2  uRes;
  uniform float uNear;
  uniform float uFar;
  uniform float uInk;      // outline strength
  uniform vec3  uInkColor;
  uniform float uPaper;    // grain strength
  varying vec2 vUv;

  float linDepth(vec2 uv){
    float z = texture2D(uDepth, uv).x;
    float ndc = z * 2.0 - 1.0;
    return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear));
  }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }

  void main(){
    vec2 px = 1.0 / uRes;
    vec3 col = texture2D(uColor, vUv).rgb;

    // --- edge detection: depth (Laplacian) + normal discontinuity ---
    // A first-difference depth test paints the whole horizon black, because a
    // ground plane at a grazing angle has a huge depth gap between neighbouring
    // pixels. The SECOND difference (Laplacian) is ~0 on any smoothly receding
    // surface and spikes only at a real depth discontinuity — a silhouette.
    float dC = linDepth(vUv);
    float dL = linDepth(vUv - vec2(px.x,0.0));
    float dR = linDepth(vUv + vec2(px.x,0.0));
    float dU = linDepth(vUv - vec2(0.0,px.y));
    float dD = linDepth(vUv + vec2(0.0,px.y));
    float lap = abs(dL + dR - 2.0*dC) + abs(dU + dD - 2.0*dC);
    float depthEdge = step(0.02 + dC*0.004, lap);

    vec3  nC = texture2D(uNormal, vUv).rgb;
    float nE = 0.0;
    vec2 offs[4];
    offs[0]=vec2(px.x,0.0); offs[1]=vec2(-px.x,0.0);
    offs[2]=vec2(0.0,px.y); offs[3]=vec2(0.0,-px.y);
    for(int i=0;i<4;i++){
      nE = max(nE, length(texture2D(uNormal, vUv+offs[i]).rgb - nC));
    }
    float normEdge  = step(0.45, nE);
    float edge = clamp(max(depthEdge, normEdge*0.9), 0.0, 1.0) * uInk;

    // slightly thicken the near lines
    edge *= mix(1.0, 1.4, clamp(1.0 - dC/20.0, 0.0, 1.0));
    col = mix(col, uInkColor, edge);

    // grade: gentle saturation lift and a soft S-curve, so the toon fills
    // read vivid without repainting any material
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 1.12);
    col = mix(col, col * col * (3.0 - 2.0 * col), 0.18);

    // --- laid-paper grain, multiplied over everything ---
    float fibre = mix(0.9, 1.0, hash(floor(vUv*uRes*0.5)));
    float laid  = 0.98 + 0.02*sin(vUv.y*uRes.y*0.7);
    col *= mix(1.0, fibre*laid, uPaper);
    col = mix(col, col*vec3(1.04,1.0,0.93), 0.35*uPaper); // warm the sheet

    // gentle vignette — only in the paper (engraving) treatment
    float d = distance(vUv, vec2(0.5));
    col *= 1.0 - d*d*0.10*uPaper;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const FULL_VERT = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
`;

export interface EngravingOpts {
  ink?: number;
  inkColor?: number;
  paper?: number;
}

export class EngravingPass {
  private colorRT: THREE.WebGLRenderTarget;
  private normalRT: THREE.WebGLRenderTarget;
  private normalMat = new THREE.MeshNormalMaterial();
  private postScene = new THREE.Scene();
  private postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private uniforms: Record<string, THREE.IUniform>;

  constructor(
    private renderer: THREE.WebGLRenderer,
    w: number,
    h: number,
    opts: EngravingOpts = {},
  ) {
    const depth = new THREE.DepthTexture(w, h);
    depth.type = THREE.UnsignedIntType;
    this.colorRT = new THREE.WebGLRenderTarget(w, h, { depthTexture: depth });
    this.normalRT = new THREE.WebGLRenderTarget(w, h);
    this.uniforms = {
      uColor: { value: this.colorRT.texture },
      uNormal: { value: this.normalRT.texture },
      uDepth: { value: depth },
      uRes: { value: new THREE.Vector2(w, h) },
      uNear: { value: 0.1 },
      uFar: { value: 400 },
      uInk: { value: opts.ink ?? 1.0 },
      uInkColor: { value: new THREE.Color(opts.inkColor ?? 0x241c14) },
      uPaper: { value: opts.paper ?? 1.0 },
    };
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: FULL_VERT,
        fragmentShader: COMPOSITE_FRAG,
        uniforms: this.uniforms,
      }),
    );
    this.postScene.add(quad);
  }

  setSize(w: number, h: number) {
    this.colorRT.setSize(w, h);
    this.normalRT.setSize(w, h);
    (this.uniforms.uRes.value as THREE.Vector2).set(w, h);
  }

  render(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.uniforms.uNear.value = camera.near;
    this.uniforms.uFar.value = camera.far;

    // 1. colour + depth
    this.renderer.setRenderTarget(this.colorRT);
    this.renderer.render(scene, camera);

    // 2. normals
    const prev = scene.overrideMaterial;
    scene.overrideMaterial = this.normalMat;
    this.renderer.setRenderTarget(this.normalRT);
    this.renderer.render(scene, camera);
    scene.overrideMaterial = prev;

    // 3. composite to screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCam);
  }
}
