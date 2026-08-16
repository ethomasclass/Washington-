/**
 * Water — a rivers-and-harbours plane with a moving surface.
 *
 * Stylised to sit with the toon world: a flat colour with a lighter reflected
 * band toward the sun and a gentle animated ripple in the vertices. Not a
 * mirror — a river read as a river, which is all the scene needs.
 */

import * as THREE from 'three';

const WATER_VERT = /* glsl */`
  uniform float uTime;
  varying float vShore;
  varying vec3 vWorld;
  void main(){
    vec3 p = position;
    p.z += sin(p.x * 0.15 + uTime) * 0.12 + cos(p.y * 0.2 + uTime * 1.3) * 0.08;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const WATER_FRAG = /* glsl */`
  precision highp float;
  uniform vec3 uColor;
  uniform vec3 uHi;
  uniform vec3 uSunDir;
  uniform float uTime;
  varying vec3 vWorld;
  void main(){
    // banded highlight sweeping with the sun direction
    float b = sin(vWorld.x * 0.08 + vWorld.z * 0.05 + uTime * 0.6);
    float band = smoothstep(0.6, 1.0, b);
    vec3 col = mix(uColor, uHi, band * 0.6);
    gl_FragColor = vec4(col, 0.92);
  }
`;

export class Water {
  readonly mesh: THREE.Mesh;
  private uniforms: Record<string, THREE.IUniform>;

  constructor(level: number, extent: number, color: number, hi: number, sunDir: THREE.Vector3) {
    const geo = new THREE.PlaneGeometry(extent, extent, 64, 64);
    geo.rotateX(-Math.PI / 2);
    this.uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uHi: { value: new THREE.Color(hi) },
      uSunDir: { value: sunDir.clone() },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERT, fragmentShader: WATER_FRAG,
      uniforms: this.uniforms, transparent: true, fog: false,
    });
    // give the vertex shader the pre-rotate plane coords in .xy
    const g2 = new THREE.PlaneGeometry(extent, extent, 64, 64);
    this.mesh = new THREE.Mesh(g2, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = level;
    void geo;
  }

  update(t: number) { this.uniforms.uTime.value = t; }
}
