/**
 * Sky and sun.
 *
 * A gradient sky dome with a real sun disc and a horizon haze band, plus the
 * DirectionalLight that matches it. Time of day sets the sun's elevation and
 * colour; weather can override the whole palette toward overcast. Fog colour is
 * taken from the horizon so the land dissolves into the same air the sky is made
 * of — the single cheapest trick for atmosphere.
 */

import * as THREE from 'three';

export interface SkyConfig {
  zenith: number;
  horizon: number;
  sunColor: number;
  sunAzimuth: number;   // radians, 0 = +x
  sunElevation: number; // radians above horizon
  sunIntensity: number;
  ambient: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  haze?: number;        // 0..1 strength of horizon glow
}

const SKY_FRAG = /* glsl */`
  precision highp float;
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform float uHaze;
  varying vec3 vDir;
  void main(){
    vec3 d = normalize(vDir);
    float up = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(up, 0.55));
    // sun disc + glow
    float m = max(dot(d, normalize(uSunDir)), 0.0);
    float disc = smoothstep(0.9975, 0.9990, m);
    float glow = pow(m, 90.0) * 0.6 + pow(m, 8.0) * 0.15 * uHaze;
    col += uSunColor * glow;
    col = mix(col, uSunColor, disc);
    // horizon haze band
    float band = pow(1.0 - up, 6.0) * uHaze * 0.5;
    col = mix(col, uHorizon, band);
    gl_FragColor = vec4(col, 1.0);
  }
`;
const SKY_VERT = /* glsl */`
  varying vec3 vDir;
  void main(){
    vDir = position;
    vec4 p = projectionMatrix * mat4(mat3(modelViewMatrix)) * vec4(position, 1.0);
    gl_Position = p.xyww; // force to far plane
  }
`;

export class Sky {
  readonly dome: THREE.Mesh;
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly sunDir = new THREE.Vector3();
  private uniforms: Record<string, THREE.IUniform>;

  constructor(cfg: SkyConfig) {
    this.sunDir.set(
      Math.cos(cfg.sunElevation) * Math.cos(cfg.sunAzimuth),
      Math.sin(cfg.sunElevation),
      Math.cos(cfg.sunElevation) * Math.sin(cfg.sunAzimuth),
    );
    this.uniforms = {
      uZenith: { value: new THREE.Color(cfg.zenith) },
      uHorizon: { value: new THREE.Color(cfg.horizon) },
      uSunColor: { value: new THREE.Color(cfg.sunColor) },
      uSunDir: { value: this.sunDir.clone() },
      uHaze: { value: cfg.haze ?? 0.5 },
    };
    this.dome = new THREE.Mesh(
      new THREE.SphereGeometry(4000, 32, 16),
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
        uniforms: this.uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
      }),
    );
    this.dome.frustumCulled = false;

    this.sun = new THREE.DirectionalLight(cfg.sunColor, cfg.sunIntensity);
    this.sun.position.copy(this.sunDir).multiplyScalar(200);
    // real cast shadows — the single biggest grounding cue the renderer has
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const ext = 130;
    this.sun.shadow.camera.left = -ext; this.sun.shadow.camera.right = ext;
    this.sun.shadow.camera.top = ext; this.sun.shadow.camera.bottom = -ext;
    this.sun.shadow.camera.near = 10; this.sun.shadow.camera.far = 500;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.6;
    this.hemi = new THREE.HemisphereLight(cfg.zenith, cfg.horizon, cfg.ambient);
  }

  addTo(scene: THREE.Scene, cfg: SkyConfig) {
    scene.add(this.dome, this.sun, this.hemi);
    scene.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar);
    scene.background = new THREE.Color(cfg.horizon);
  }
}
