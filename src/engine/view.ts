/**
 * The view: renderer, camera, and everything that stands up and moves.
 *
 * The camera is a long lens at a fixed pitch. It never rotates and the player
 * never controls it — the one piece of the old design that survives the pivot
 * intact, because a nailed camera is what lets an interior be readable without
 * a single wall ever being in the way, and it is why the north wing can be
 * drawn open and stay open.
 */

import * as THREE from 'three';
import { CAM_PITCH, BILLBOARD_UP, PPU } from './build';
import { blobShadow, type Surface } from './pixels';
import { actorSheet, packSheet, FRAMES, SPR_H, SPR_W, type ActorSpec, type Dir } from './actors';
import { parseHex } from './pixels';
import type { Light } from '../palette';

/** Long lens: it flattens the view while keeping the depth, which is the trick. */
export const FOV = 26;
/** How far ahead of the player the camera aims, in tiles. */
export const LOOK_AHEAD = 3.2;
export const CAM_DIST_EXTERIOR = 30.5;
export const CAM_DIST_INTERIOR = 17;

let SHADOW_TEX: THREE.Texture | null = null;
function shadowTexture(): THREE.Texture {
  if (SHADOW_TEX) return SHADOW_TEX;
  const s: Surface = blobShadow(48);
  const t = new THREE.CanvasTexture(s.canvas);
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  SHADOW_TEX = t;
  return t;
}

/** A standing sprite that walks: player, or anyone else. */
export class ActorView {
  readonly group = new THREE.Group();
  private mesh: THREE.Mesh;
  private shadow: THREE.Mesh;
  private tex: THREE.CanvasTexture;
  private dir: Dir = 0;
  private frame = 0;
  private phase = 0;

  x = 0;
  z = 0;
  y = 0;

  constructor(key: string, spec: ActorSpec) {
    const sheet = actorSheet(key, spec);
    this.tex = new THREE.CanvasTexture(packSheet(sheet).canvas);
    this.tex.magFilter = THREE.NearestFilter;
    this.tex.minFilter = THREE.NearestFilter;
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.repeat.set(1 / FRAMES, 1 / 4);
    this.tex.wrapS = this.tex.wrapT = THREE.ClampToEdgeWrapping;

    const w = SPR_W / PPU;
    const h = SPR_H / PPU;
    const g = new THREE.BufferGeometry();
    const up = BILLBOARD_UP.clone().multiplyScalar(h);
    // Base at the origin, top leaning away from the camera by exactly the
    // camera's own pitch, so the sprite is square-on to the lens and its feet
    // are on the ground. Both of those matter; only one is obvious.
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      -w / 2, 0, 0,
      w / 2, 0, 0,
      w / 2, up.y, up.z,
      -w / 2, up.y, up.z,
    ], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);

    this.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      map: this.tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide,
    }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;

    const sg = new THREE.PlaneGeometry(w * 0.78, w * 0.42);
    sg.rotateX(-Math.PI / 2);
    this.shadow = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({
      map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.85,
    }));
    this.shadow.position.y = 0.03;
    this.shadow.renderOrder = 1;

    this.group.add(this.shadow);
    this.group.add(this.mesh);
    this.setFrame();
  }

  /** Tint the sprite so a figure in shade is in shade. */
  setLight(light: Light, shaded = false): void {
    const [r, g, b] = parseHex(light.key);
    const [fr, fg, fb] = parseHex(light.fill);
    const t = shaded ? 0.25 : 0.82;
    const m = this.mesh.material as THREE.MeshBasicMaterial;
    m.color.setRGB(
      ((fr + (r - fr) * t) / 255) * 0.98,
      ((fg + (g - fg) * t) / 255) * 0.98,
      ((fb + (b - fb) * t) / 255) * 0.98,
    );
  }

  private setFrame(): void {
    this.tex.offset.set(this.frame / FRAMES, (3 - this.dir) / 4);
  }

  face(d: Dir): void {
    if (this.dir === d) return;
    this.dir = d;
    this.setFrame();
  }

  /**
   * Step the walk clock. Eight frames a second, stepped, never interpolated —
   * a smoothly-sliding pixel figure is the one thing that instantly gives away
   * that the sprite is not really a sprite.
   */
  animate(dt: number, moving: boolean): void {
    if (!moving) {
      if (this.frame !== 0) { this.frame = 0; this.setFrame(); }
      this.phase = 0;
      return;
    }
    this.phase += dt * 8;
    const f = Math.floor(this.phase) % FRAMES;
    if (f !== this.frame) { this.frame = f; this.setFrame(); }
  }

  place(x: number, y: number, z: number): void {
    this.x = x; this.y = y; this.z = z;
    this.group.position.set(x, y, z);
  }

  get facing(): Dir { return this.dir; }

  dispose(): void {
    this.tex.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.mesh.geometry.dispose();
  }
}

/* ---------------------------------------------------------------------- *
 * The camera rig
 * ---------------------------------------------------------------------- */

export class Rig {
  readonly camera: THREE.PerspectiveCamera;
  private tx = 0;
  private tz = 0;
  private ty = 0;
  dist = CAM_DIST_EXTERIOR;
  /** Clamp so the camera never walks off the edge of a small map. */
  bounds: { x0: number; x1: number; z0: number; z1: number } | null = null;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(FOV, aspect, 1, 220);
  }

  snapTo(x: number, y: number, z: number): void {
    this.tx = x; this.ty = y; this.tz = z;
    this.apply();
  }

  /** Critically damped follow. The lag is what makes it feel like a camera. */
  follow(x: number, y: number, z: number, dt: number): void {
    const k = 1 - Math.exp(-dt * 6.5);
    this.tx += (x - this.tx) * k;
    this.ty += (y - this.ty) * k;
    this.tz += (z - this.tz) * k;
    this.apply();
  }

  private apply(): void {
    let x = this.tx, z = this.tz;
    if (this.bounds) {
      x = Math.max(this.bounds.x0, Math.min(this.bounds.x1, x));
      z = Math.max(this.bounds.z0, Math.min(this.bounds.z1, z));
    }
    // Look past him, not at him. The aim point sits a man's height up and a
    // few tiles further into the scene, which drops the figure into the lower
    // third and gives the world ahead of him the rest of the frame. Without
    // this the bottom of every shot is the ground he has already crossed.
    //
    // It scales with the camera distance, or the same 3.2 tiles that reads as
    // "a little ahead" on the bowling green puts him off the bottom of a room
    // eight tiles across.
    z -= LOOK_AHEAD * (this.dist / CAM_DIST_EXTERIOR);
    const ly = this.ty + 1.1;
    this.camera.position.set(
      x,
      ly + Math.sin(CAM_PITCH) * this.dist,
      z + Math.cos(CAM_PITCH) * this.dist,
    );
    this.camera.lookAt(x, ly, z);
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}

/* ---------------------------------------------------------------------- *
 * The renderer
 * ---------------------------------------------------------------------- */

export function makeRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const r = new THREE.WebGLRenderer({
    canvas,
    antialias: false,        // pixel art: never
    powerPreference: 'low-power',
    stencil: false,
    alpha: false,
  });
  // Cap at 1. A Chromebook panel that reports 2 is asking for four times the
  // fill rate to draw pixel art that wants to be chunky anyway.
  r.setPixelRatio(1);
  r.setClearColor(0x0b0d10, 1);
  return r;
}

/** Haze. Aerial perspective for the price of one line. */
export function applyFog(scene: THREE.Scene, light: Light, near: number, far: number): void {
  const [r, g, b] = parseHex(light.haze);
  scene.fog = new THREE.Fog(new THREE.Color(r / 255, g / 255, b / 255), near, far);
  scene.background = new THREE.Color(r / 255, g / 255, b / 255).multiplyScalar(0.92);
}

/** Where a walking figure should sit in frame, as a 0..1 screen fraction. */
export const FOCUS_BAND = 0.58;
