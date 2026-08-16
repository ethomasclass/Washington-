/**
 * Weather — rain and snow as living particle fields.
 *
 * The particles live in their OWN scene and are drawn as an overlay AFTER the
 * toon/outline composite, never through it — otherwise the edge detector draws
 * an ink box around every snowflake. They follow the camera in a box so the
 * field is dense where it is seen and never runs out.
 *
 * The atmosphere shift is the other half: weather thickens the fog, cools the
 * sky and changes the light. Snow is bright and flat (overcast daylight off a
 * white ground); rain is dim and grey. Rain without that shift is confetti.
 */

import * as THREE from 'three';
import type { Sky } from './sky';

export type WeatherKind = 'clear' | 'rain' | 'snow';

export class Weather {
  readonly pScene = new THREE.Scene();
  private points?: THREE.Points;
  private velocities!: Float32Array;
  private box = 60;
  private kind: WeatherKind = 'clear';
  private wind = new THREE.Vector3();

  set(kind: WeatherKind, sky: Sky, world: THREE.Scene) {
    this.kind = kind;
    if (this.points) { this.pScene.remove(this.points); this.points.geometry.dispose(); this.points = undefined; }
    if (kind === 'clear') return;

    const count = kind === 'rain' ? 9000 : 5500;
    const pos = new Float32Array(count * 3);
    this.velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * this.box;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * this.box;
      this.velocities[i] = kind === 'rain' ? 34 + Math.random() * 14 : 2.2 + Math.random() * 1.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: kind === 'rain' ? 0xaab8c4 : 0xf4f8fb,
      size: kind === 'rain' ? 0.11 : 0.17,
      transparent: true,
      opacity: kind === 'rain' ? 0.5 : 0.9,
      depthWrite: false,
      fog: false,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.pScene.add(this.points);
    this.wind.set(kind === 'rain' ? -8 : -2.5, 0, kind === 'rain' ? 3 : 1.5);

    // atmosphere shift on the WORLD scene + its sun
    if (world.fog instanceof THREE.Fog) {
      const f = world.fog;
      if (kind === 'rain') { f.near = 18; f.far = 90; f.color.set(0x8a94a0); }
      else { f.near = 20; f.far = 110; f.color.set(0xd0d6db); }
    }
    if (kind === 'rain') { sky.sun.intensity *= 0.5; sky.hemi.intensity *= 0.85; }
    else { sky.sun.intensity *= 0.9; sky.hemi.intensity *= 1.7; } // snow: bright + flat
  }

  update(dt: number, camera: THREE.Camera) {
    if (!this.points) return;
    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const swirl = this.kind === 'snow';
    const t = performance.now() * 0.001;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3 + 1] -= this.velocities[i] * dt;
      arr[i * 3] += this.wind.x * dt + (swirl ? Math.sin(t + i) * 0.4 * dt : 0);
      arr[i * 3 + 2] += this.wind.z * dt + (swirl ? Math.cos(t * 1.3 + i) * 0.4 * dt : 0);
      const dx = arr[i * 3] - camera.position.x;
      const dz = arr[i * 3 + 2] - camera.position.z;
      if (Math.abs(dx) > this.box / 2) arr[i * 3] -= Math.sign(dx) * this.box;
      if (Math.abs(dz) > this.box / 2) arr[i * 3 + 2] -= Math.sign(dz) * this.box;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 34 + Math.random() * 8;
        arr[i * 3] = camera.position.x + (Math.random() - 0.5) * this.box;
        arr[i * 3 + 2] = camera.position.z + (Math.random() - 0.5) * this.box;
      }
    }
    pos.needsUpdate = true;
  }

  /** Draw the particles over the already-composited frame. */
  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    if (!this.points) return;
    const prev = renderer.autoClear;
    renderer.autoClear = false;
    renderer.render(this.pScene, camera);
    renderer.autoClear = prev;
  }
}
