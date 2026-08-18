/**
 * The Boston kit — set pieces for the two siege scenes, built from the
 * documentary record (research pass, 17 Aug 2026):
 *
 *   CAMBRIDGE, July 1775: Emerson's shelter menagerie — boards, sailcloth,
 *   stone-and-turf, brush, and huts "wrought in the manner of a basket";
 *   Harvard's brick blocks as barracks; no uniforms, browns and drab.
 *
 *   THE LINES, November 1775: fascines, gabions and Putnam's "chandeliers"
 *   (timber frames filled with fascines); embrasures standing EMPTY for want
 *   of guns and powder; the Appeal to Heaven standard on a ship's mast
 *   (the Grand Union is 1 January); burned Charlestown as a field of
 *   blackened chimney stacks; floating batteries on the water; the firewood
 *   famine's stumps and dismantled fences.
 */

import * as THREE from 'three';
import { mat, texMat } from '../fp/kit';
import { V, gableRoofGeo } from './vernon-kit';
import { wickerTex, plankTex, brickTex, canvasTex, earthTex } from './textures';
import { prng } from './noise';

function mesh(geo: THREE.BufferGeometry, color: number, flat = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat(color, { flat }));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

const EARTH = 0x81704a;
const CHARRED = 0x2a2320;

// ---------------------------------------------------------------------------
// SIEGE ENGINEERING
// ---------------------------------------------------------------------------

/**
 * A gabion: wicker basket the height of a man, filled with earth. `empty`
 * leaves it an open basket awaiting its fill — the unfinished work's look.
 */
export function gabion(h = 1.15, r = 0.42, empty = false): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.94, h, 9), texMat(0x9c8250, wickerTex()));
  body.castShadow = true;
  body.position.y = h / 2; g.add(body);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const stake = mesh(new THREE.CylinderGeometry(0.03, 0.035, h + (empty ? 0.4 : 0.18), 4), V.postWood);
    stake.position.set(Math.cos(a) * r, (h + (empty ? 0.3 : 0.1)) / 2, Math.sin(a) * r);
    g.add(stake);
  }
  if (empty) {
    // dark hollow mouth
    const mouth = mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.82, 0.04, 9), 0x2a2320);
    mouth.position.y = h - 0.02; g.add(mouth);
  } else {
    const fill = mesh(new THREE.CylinderGeometry(r * 0.88, r * 0.88, 0.1, 9), EARTH);
    fill.position.y = h + 0.02; g.add(fill);
  }
  return g;
}

/** A bundle of fascines — brushwood bound in six-foot lengths. */
export function fascines(n = 3): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 2), col = i % 2;
    const f = mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.9, 7), 0x7a6038);
    f.rotation.z = Math.PI / 2;
    f.position.set(0, 0.17 + row * 0.3, col * 0.34 - 0.08 + row * 0.16);
    g.add(f);
    for (const tx of [-0.6, 0.6]) {
      const tie = mesh(new THREE.TorusGeometry(0.17, 0.025, 4, 8), 0x59452a);
      tie.rotation.y = Math.PI / 2;
      tie.position.set(tx, f.position.y, f.position.z);
      g.add(tie);
    }
  }
  return g;
}

/** Putnam's chandelier: a timber frame packed with fascines — instant parapet. */
export function chandelier(): THREE.Group {
  const g = new THREE.Group();
  for (const sx of [-1.1, 1.1]) {
    for (const dz of [-0.35, 0.35]) {
      const post = mesh(new THREE.BoxGeometry(0.14, 1.5, 0.14), V.postWood);
      post.position.set(sx, 0.75, dz); g.add(post);
    }
    const sill = mesh(new THREE.BoxGeometry(0.16, 0.14, 1.0), V.postWood);
    sill.position.set(sx, 0.07, 0); g.add(sill);
  }
  for (let r = 0; r < 4; r++) {
    const f = mesh(new THREE.CylinderGeometry(0.17, 0.17, 2.4, 7), 0x7a6038);
    f.rotation.z = Math.PI / 2;
    f.position.set(0, 0.24 + r * 0.34, (r % 2) * 0.3 - 0.15);
    g.add(f);
  }
  return g;
}

/** An iron gun on a garrison carriage. `empty` builds the carriage alone. */
export function cannon(empty = false): THREE.Group {
  const g = new THREE.Group();
  const cheekC = 0x8a3c2c;
  for (const sz of [-0.3, 0.3]) {
    const cheek = mesh(new THREE.BoxGeometry(1.5, 0.55, 0.12), cheekC);
    cheek.position.set(-0.1, 0.5, sz); g.add(cheek);
  }
  const axle = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), 0x4a3320);
  axle.rotation.x = Math.PI / 2; axle.position.set(0.35, 0.24, 0); g.add(axle);
  for (const sz of [-0.42, 0.42]) {
    const wheel = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.09, 10), 0x5a4326);
    wheel.rotation.x = Math.PI / 2; wheel.position.set(0.35, 0.24, sz); g.add(wheel);
  }
  if (!empty) {
    const barrel = mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.9, 9), 0x33342f);
    barrel.rotation.z = Math.PI / 2 + 0.04;
    barrel.position.set(0.35, 0.72, 0);
    g.add(barrel);
    const ring = mesh(new THREE.TorusGeometry(0.11, 0.022, 5, 10), 0x33342f);
    ring.rotation.y = Math.PI / 2; ring.position.set(1.2, 0.75, 0); g.add(ring);
  }
  return g;
}

/**
 * A run of abatis: sharpened stakes planted in crossed pairs, points leaning
 * toward the enemy (+z), with a lashing rail along the crossings. Reads as a
 * fence with teeth, which is what it was.
 */
export function abatis(len = 6): THREE.Group {
  const g = new THREE.Group();
  const rand = prng(Math.floor(len * 977));
  const spike = (x: number, leanZ: number, leanX: number) => {
    const s = mesh(new THREE.CylinderGeometry(0.012, 0.055, 1.7, 5), 0x6a5334);
    // planted: base at ground, tip up and toward +z
    s.rotation.x = leanZ;
    s.rotation.z = leanX;
    s.position.set(x, Math.cos(leanZ) * 0.75, Math.sin(leanZ) * 0.75);
    g.add(s);
  };
  for (let x = -len / 2; x < len / 2; x += 0.85) {
    const jx = x + rand() * 0.3;
    // the crossed pair, both leaning forward, splayed apart
    spike(jx, 0.75 + rand() * 0.15, 0.5 + rand() * 0.12);
    spike(jx, 0.75 + rand() * 0.15, -0.5 - rand() * 0.12);
    // an occasional third, lower and meaner
    if (rand() < 0.4) spike(jx + 0.2, 1.05, rand() * 0.5 - 0.25);
  }
  // the lashing rail through the crossings
  const rail = mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 5), 0x59452a);
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, 1.05, 0.45);
  g.add(rail);
  return g;
}

/** The earthwork berm — thrown-up earth, textured and slightly irregular. */
export function berm(len = 10, h = 1.7, base = 3.2): THREE.Mesh {
  const geo = gableRoofGeo(len, base, h);
  // roughen the ridge and faces so it reads as spadework, not joinery
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i);
    const n = Math.sin(px * 2.7) * 0.5 + Math.sin(px * 6.3 + py * 4) * 0.5;
    if (py > 0.05) pos.setY(i, py * (1 + n * 0.09));
    pos.setZ(i, pos.getZ(i) + n * 0.1 * (py / h));
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, texMat(EARTH, earthTex()));
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** A blackened chimney stack standing in the ruins of Charlestown. */
export function chimneyRuin(seed = 1): THREE.Group {
  const g = new THREE.Group();
  const rand = prng(seed * 331);
  const h = 3.5 + rand() * 2.5;
  const stack = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 0.9), texMat(0x4a3430, brickTex()));
  stack.castShadow = true;
  stack.position.y = h / 2; g.add(stack);
  // the hearth shoulder at the base
  const shoulder = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.1), texMat(0x453230, brickTex()));
  shoulder.position.y = 0.7; g.add(shoulder);
  // charred rubble
  for (let i = 0; i < 3; i++) {
    const r = mesh(new THREE.DodecahedronGeometry(0.3 + rand() * 0.3), CHARRED);
    r.position.set(rand() * 2.4 - 1.2, 0.2, rand() * 2.4 - 1.2);
    r.rotation.set(rand() * 3, rand() * 3, 0);
    g.add(r);
  }
  return g;
}

/** A squat timber blockhouse with an overhanging upper storey (British, Bunker Hill). */
export function blockhouse(): THREE.Group {
  const g = new THREE.Group();
  const lower = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 3), texMat(0x6a5334, plankTex()));
  lower.castShadow = true; lower.position.y = 1.1; g.add(lower);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.8, 3.8), texMat(0x5f4a2e, plankTex()));
  upper.castShadow = true; upper.position.y = 3.1; g.add(upper);
  const roof = mesh(new THREE.ConeGeometry(2.9, 1.4, 4), 0x4a3a24);
  roof.position.y = 4.7; roof.rotation.y = Math.PI / 4; g.add(roof);
  return g;
}

/** A floating battery: a low barge with sloped timber sides and three guns. */
export function floatingBattery(): THREE.Group {
  const g = new THREE.Group();
  const hull = mesh(new THREE.BoxGeometry(13, 1.6, 5.4), 0x4a3a28);
  hull.position.y = 0.5; g.add(hull);
  const casemate = new THREE.Mesh(new THREE.BoxGeometry(10.5, 2.1, 4.2), texMat(0x59452a, plankTex()));
  casemate.castShadow = true; casemate.position.y = 2.1; g.add(casemate);
  for (const dx of [-3.2, 0, 3.2]) {
    const muzzle = mesh(new THREE.CylinderGeometry(0.14, 0.17, 1.4, 7), 0x33342f);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(dx, 2.1, 2.5); g.add(muzzle);
  }
  const staff = mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 5), V.postWood);
  staff.position.set(-6, 3.6, 0); g.add(staff);
  return g;
}

/**
 * A ship of the line at anchor, yards crossed, sails furled. Built at REAL
 * dimensions — a 64 like HMS Somerset ran ~49 m on the gundeck with her main
 * truck near 55 m over the water. The first build was 16 m long: a launch
 * wearing three masts. Scale 1 = full size; use `scale` only for smaller
 * consorts, not for distance.
 */
export function shipOfLine(scale = 1): THREE.Group {
  const g = new THREE.Group();
  // hull: 46 m between the curves, freeboard ~7 m to the rail
  const hull = mesh(new THREE.CylinderGeometry(4.4, 2.4, 46, 8), 0x3a2e22);
  hull.rotation.z = Math.PI / 2; hull.scale.y = 0.5; hull.position.y = 2.6; g.add(hull);
  // the wales and the two gun-deck stripes — dull 1775 ochre, not the
  // high-contrast chequer of the Nelson era
  for (const [sy, sc] of [[4.4, 0x87724a], [6.1, 0x87724a]] as const) {
    const stripe = mesh(new THREE.BoxGeometry(42, 1.1, 7.6), sc);
    stripe.position.y = sy; g.add(stripe);
    // gunports along the stripe
    for (let i = 0; i < 12; i++) {
      for (const sz of [-1, 1]) {
        const port = mesh(new THREE.BoxGeometry(1.3, 0.65, 0.2), 0x241c14);
        port.position.set(-18 + i * 3.3, sy, sz * 3.75);
        g.add(port);
      }
    }
  }
  // quarterdeck and stern cabin
  const stern = mesh(new THREE.BoxGeometry(7, 3.4, 7.2), 0x3a2e22);
  stern.position.set(-20, 7.2, 0); g.add(stern);
  const gallery = mesh(new THREE.BoxGeometry(1.2, 2.2, 6.2), 0xb09a5e);
  gallery.position.set(-23.4, 7.4, 0); g.add(gallery);
  // three masts with fighting tops, crossed yards, furled sails
  for (const [mx, mh] of [[-13, 40], [1.5, 47], [15, 36]] as const) {
    const mast = mesh(new THREE.CylinderGeometry(0.28, 0.45, mh, 7), 0x59452a);
    mast.position.set(mx, mh / 2 + 5.5, 0); g.add(mast);
    const top = mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 7), 0x4a3a28);
    top.position.set(mx, 5.5 + mh * 0.42, 0); g.add(top);
    for (const [fy, yl] of [[0.38, 22], [0.62, 17], [0.82, 12]] as const) {
      const yard = mesh(new THREE.CylinderGeometry(0.14, 0.14, yl, 5), 0x59452a);
      yard.rotation.x = Math.PI / 2;
      yard.position.set(mx, 5.5 + mh * fy, 0);
      g.add(yard);
      const furl = mesh(new THREE.CylinderGeometry(0.3, 0.3, yl * 0.9, 5), V.linen);
      furl.rotation.x = Math.PI / 2;
      furl.position.set(mx, 5.1 + mh * fy, 0);
      g.add(furl);
    }
  }
  const bowsprit = mesh(new THREE.CylinderGeometry(0.2, 0.32, 16, 5), 0x59452a);
  bowsprit.rotation.z = -0.55; bowsprit.position.set(27, 7.5, 0); g.add(bowsprit);
  // an ensign at the stern
  const staff = mesh(new THREE.CylinderGeometry(0.08, 0.08, 6, 4), 0x59452a);
  staff.position.set(-24.5, 11.5, 0); g.add(staff);
  const ensign = mesh(new THREE.PlaneGeometry(3.4, 2), 0x8c2f3a);
  (ensign.material as THREE.Material).side = THREE.DoubleSide;
  ensign.position.set(-26.4, 13.6, 0); g.add(ensign);
  g.scale.setScalar(scale);
  return g;
}

/**
 * The Appeal to Heaven standard on a ship's-mast pole — what actually flew on
 * Prospect Hill in November 1775 (the Grand Union comes on 1 January).
 */
export function appealFlag(h = 12): THREE.Group {
  const g = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.09, 0.14, h, 7), V.postWood);
  pole.position.y = h / 2; g.add(pole);
  const fly = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6, 6, 1), mat(0xe9e6da, { flat: false }));
  (fly.material as THREE.Material).side = THREE.DoubleSide;
  const pos = fly.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, Math.sin((pos.getX(i) / 2.6 + 0.5) * Math.PI * 2) * 0.14);
  }
  fly.geometry.computeVertexNormals();
  fly.position.set(1.4, h - 1.1, 0);
  g.add(fly);
  // the pine tree
  const pine = mesh(new THREE.ConeGeometry(0.28, 0.7, 6), 0x3e5c34);
  pine.position.set(0.9, h - 0.95, 0.02); g.add(pine);
  const trunk = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 4), 0x59452a);
  trunk.position.set(0.9, h - 1.4, 0.02); g.add(trunk);
  return g;
}

// ---------------------------------------------------------------------------
// THE EMERSON SHELTERS — Cambridge's improvised architecture
// ---------------------------------------------------------------------------

/** A hut of boards, thrown up in a hurry. */
export function boardHut(seed = 1): THREE.Group {
  const g = new THREE.Group();
  const rand = prng(seed * 173);
  const w = 2.4 + rand() * 0.8, d = 2 + rand() * 0.6, h = 1.6 + rand() * 0.4;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), texMat(0x8a7350, plankTex()));
  body.castShadow = true; body.position.y = h / 2; body.rotation.z = (rand() - 0.5) * 0.04;
  g.add(body);
  const roof = mesh(gableRoofGeo(w + 0.3, d + 0.4, 0.7), 0x6f5a38);
  roof.position.y = h; roof.rotation.y = rand() < 0.5 ? 0 : Math.PI;
  g.add(roof);
  const door = mesh(new THREE.PlaneGeometry(0.7, h * 0.8), 0x2e2418);
  door.position.set(w * 0.1, h * 0.4, d / 2 + 0.01); g.add(door);
  return g;
}

/** A shelter of stone and turf, half dug in. */
export function turfHut(seed = 1): THREE.Group {
  const g = new THREE.Group();
  const rand = prng(seed * 449);
  const body = mesh(new THREE.BoxGeometry(2.6, 1.1, 2.2), 0x6d6248);
  body.position.y = 0.55; g.add(body);
  const cap = mesh(gableRoofGeo(2.8, 2.5, 0.6), 0x5d6a42);
  cap.position.y = 1.05; g.add(cap);
  for (let i = 0; i < 4; i++) {
    const st = mesh(new THREE.DodecahedronGeometry(0.22 + rand() * 0.1), V.stone);
    st.position.set(-1.3 + i * 0.8, 0.2, 1.15);
    g.add(st);
  }
  return g;
}

/** A sailcloth shelter — recycled ship canvas over a ridge pole. */
export function sailclothTent(seed = 1): THREE.Group {
  const g = new THREE.Group();
  const rand = prng(seed * 89);
  const w = 2.2 + rand() * 0.8, len = 2.6 + rand() * 1.0, h = 1.5 + rand() * 0.3;
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(rand() * 0.3 - 0.15, h); sh.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  const body = new THREE.Mesh(geo, texMat(0xb8ad90, canvasTex()));
  body.castShadow = true;
  body.rotation.y = (rand() - 0.5) * 0.2;
  g.add(body);
  const pole = mesh(new THREE.CylinderGeometry(0.05, 0.06, len + 0.6, 5), V.postWood);
  pole.rotation.x = Math.PI / 2; pole.position.y = h; g.add(pole);
  return g;
}

/** A stump — the firewood famine's signature. */
export function stump(seed = 1): THREE.Group {
  const g = new THREE.Group();
  const rand = prng(seed * 37);
  const s = mesh(new THREE.CylinderGeometry(0.22 + rand() * 0.12, 0.3 + rand() * 0.12, 0.4 + rand() * 0.3, 7), 0x8a7350);
  s.position.y = 0.25; g.add(s);
  const top = mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.06, 7), 0xc0aa78);
  top.position.y = 0.52; g.add(top);
  return g;
}

/** A grave board — eleven of them stand behind the lines. */
export function graveBoard(seed = 1): THREE.Group {
  const g = new THREE.Group();
  const rand = prng(seed * 53);
  const board = mesh(new THREE.BoxGeometry(0.5, 0.7, 0.05), 0x9a8a68);
  board.position.y = 0.42; board.rotation.z = (rand() - 0.5) * 0.16;
  board.rotation.y = (rand() - 0.5) * 0.3;
  g.add(board);
  const mound = mesh(new THREE.SphereGeometry(0.55, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), EARTH);
  mound.scale.set(1, 0.35, 1.6);
  g.add(mound);
  return g;
}
