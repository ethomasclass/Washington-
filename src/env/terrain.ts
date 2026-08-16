/**
 * Terrain — real rolling ground, not a plane.
 *
 * A single elevation function drives everything: the mesh displacement, the
 * vertex colouring, the height the player and every prop sit at, and the
 * collision. One curve, read by all — the same discipline the old ground.ts had,
 * now in three dimensions and with weather in mind.
 *
 * A scene shapes the land by passing an `elevation` closure and a `paint`
 * closure. The module owns the geometry, the normals and the height query.
 */

import * as THREE from 'three';

export interface TerrainConfig {
  size: number;           // metres across
  segments: number;       // grid resolution
  /** world (x,z) -> height in metres. */
  elevation: (x: number, z: number) => number;
  /** world (x,z,height,slope) -> vertex colour. */
  paint: (x: number, z: number, h: number, slope: number, out: THREE.Color) => void;
  /** how much snow has settled, 0..1 — whitens flat ground. */
  snow?: number;
}

export class Terrain {
  readonly mesh: THREE.Mesh;
  private cfg: TerrainConfig;

  constructor(cfg: TerrainConfig, ramp: THREE.Texture) {
    this.cfg = cfg;
    const { size, segments, elevation, paint } = cfg;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2); // into XZ plane, +Y up
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const c = new THREE.Color();
    const snow = cfg.snow ?? 0;
    const eps = size / segments;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = elevation(x, z);
      pos.setY(i, h);
    }
    geo.computeVertexNormals();
    const nrm = geo.attributes.normal as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = pos.getY(i);
      const slope = 1 - nrm.getY(i); // 0 flat, ->1 vertical
      paint(x, z, h, slope, c);
      if (snow > 0) {
        // snow settles thick on near-flat ground, thinner on slopes; even the
        // steep keeps a dusting so the land reads as winter, not bare earth.
        const settle = (Math.max(0, 1 - slope * 2.6) * 0.85 + 0.2) * snow;
        c.lerp(new THREE.Color(0xf2f5f9), Math.min(1, settle));
      }
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp });
    (mat as unknown as { flatShading: boolean }).flatShading = false;
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    void eps;
  }

  heightAt(x: number, z: number): number {
    return this.cfg.elevation(x, z);
  }
}
