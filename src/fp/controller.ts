/**
 * First-person controller — WASD + pointer-lock mouse-look.
 *
 * Eye height is fixed; there is no flying and no crouch. Movement is on the
 * ground plane only, damped, with a soft collision radius against a list of
 * blockers so the player cannot walk through a tent or the fire. Yaw is free;
 * pitch is clamped so the horizon never rolls out of frame.
 */

import * as THREE from 'three';

export interface Blocker { x: number; z: number; r: number; }
/**
 * An axis-aligned wall/furniture collider. Optional minY/maxY confine it to a
 * height band, so a rail on an upper floor does not wall off the room below.
 */
export interface BoxBlocker {
  minX: number; minZ: number; maxX: number; maxZ: number;
  minY?: number; maxY?: number;
}

export class FirstPerson {
  yaw = 0;
  pitch = 0;
  readonly pos = new THREE.Vector3();
  private vel = new THREE.Vector3();
  private keys = new Set<string>();
  private locked = false;
  eyeHeight = 1.68;
  speed = 6.5;
  sens = 0.0022;

  constructor(
    private camera: THREE.PerspectiveCamera,
    dom: HTMLElement,
    private blockers: Blocker[] = [],
    private bounds = 42,
    private boxes: BoxBlocker[] = [],
  ) {
    dom.addEventListener('click', () => dom.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === dom;
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.yaw -= e.movementX * this.sens;
      this.pitch -= e.movementY * this.sens;
      const lim = Math.PI / 2 - 0.05;
      this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
    });
    addEventListener('keydown', (e) => this.keys.add(e.code));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  get isLocked() { return this.locked; }

  setPose(x: number, z: number, yaw: number) {
    this.pos.set(x, this.eyeHeight, z);
    this.yaw = yaw;
  }

  private blocked(x: number, z: number): boolean {
    for (const b of this.blockers) {
      if (Math.hypot(x - b.x, z - b.z) < b.r + 0.4) return true;
    }
    const R = 0.28; // body radius against walls
    const footY = this.pos.y - this.eyeHeight;
    for (const b of this.boxes) {
      if (b.minY !== undefined && footY < b.minY) continue;
      if (b.maxY !== undefined && footY > b.maxY) continue;
      if (x > b.minX - R && x < b.maxX + R && z > b.minZ - R && z < b.maxZ + R) return true;
    }
    return false;
  }

  update(dt: number, groundHeight?: (x: number, z: number) => number) {
    const fwd = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0)
              - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    const str = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0)
              - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const boost = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 1.7 : 1;

    const sinY = Math.sin(this.yaw), cosY = Math.cos(this.yaw);
    // forward is -Z rotated by yaw
    const wish = new THREE.Vector3(
      fwd * -sinY + str * cosY,
      0,
      fwd * -cosY - str * -sinY,
    );
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(this.speed * boost);

    // exponential damping toward wish velocity
    const a = 1 - Math.exp(-dt / 0.09);
    this.vel.lerp(wish, a);

    let nx = this.pos.x + this.vel.x * dt;
    let nz = this.pos.z + this.vel.z * dt;
    // axis-separated collision so you slide along blockers
    if (this.blocked(nx, this.pos.z)) { nx = this.pos.x; this.vel.x = 0; }
    if (this.blocked(nx, nz)) { nz = this.pos.z; this.vel.z = 0; }
    nx = Math.max(-this.bounds, Math.min(this.bounds, nx));
    nz = Math.max(-this.bounds, Math.min(this.bounds, nz));
    this.pos.set(nx, this.eyeHeight + (groundHeight ? groundHeight(nx, nz) : 0), nz);

    this.camera.position.copy(this.pos);
    const dir = new THREE.Vector3(
      Math.cos(this.pitch) * -Math.sin(this.yaw),
      Math.sin(this.pitch),
      Math.cos(this.pitch) * -Math.cos(this.yaw),
    );
    this.camera.lookAt(this.pos.clone().add(dir));
  }
}
