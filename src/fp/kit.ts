/**
 * The prop kit — recognizable low-poly forms for the first-person camp.
 *
 * Rule of the kit: every prop must read by its SILHOUETTE alone, because the
 * engraving pass throws an ink line around that silhouette and fills the inside
 * flat. A barrel is staves and hoops, not a smooth drum; a tent has a ridge pole
 * poking out and guy lines to stakes; a soldier has a coat, a tricorne and legs,
 * not a stack of boxes. Faceted on purpose — flatShading gives the creases the
 * outline pass needs to find.
 *
 * Everything is built at world scale in metres, origin at the foot, +Y up, and
 * returned as a Group so the world can place and rotate it freely.
 */

import * as THREE from 'three';

// Muted period palette — these become the flat fills under the ink.
export const C = {
  canvas:   0xc9bd9b, // weathered sailcloth
  canvasSh: 0xb3a884,
  wood:     0x6f4d2e,
  woodPale: 0x8a6a41,
  woodDark: 0x4a3320,
  iron:     0x3c3a37,
  rope:     0x9c8b63,
  coatBlue: 0x33415e, // continental blue
  coatTan:  0x9c7f52, // hunting shirt
  coatBuff: 0xc2a878,
  breeches: 0xbfa876,
  waistcoat:0xd8c79a,
  skin:     0xc0906a,
  hat:      0x211a12,
  grass:    0xa7a066,
  grassDry: 0xb6ae74,
  mud:      0x84704a,
  stone:    0x77726a,
  flame:    0xdd7a26,
  ember:    0x7a2f14,
  water:    0x5a6b74,
  townRoof: 0x6a4a38,
  townWall: 0xa89a7c,
  steeple:  0x8f8570,
  linenMap: 0xd8cba6,
  paper:    0xe7dcc2,
} as const;

let MAT_CACHE = new Map<number, THREE.MeshToonMaterial>();
const ramp = (() => {
  const d = new Uint8Array([178, 178, 178, 255, 220, 220, 220, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

/**
 * Toon material with a detail texture. The map is near-white and low-contrast
 * (see env/textures.ts), so the colour still carries the hue and the cel bands
 * still read — the texture only supplies material grain. Cached per colour+map.
 */
const TEXMAT_CACHE = new Map<string, THREE.MeshToonMaterial>();
export function texMat(color: number, map: THREE.Texture, opts: { flat?: boolean; em?: number } = {}): THREE.MeshToonMaterial {
  const key = `${color}:${map.uuid}:${opts.flat ?? true}:${opts.em ?? 0}`;
  const hit = TEXMAT_CACHE.get(key);
  if (hit) return hit;
  const m = new THREE.MeshToonMaterial({ color, map });
  (m as unknown as { flatShading: boolean }).flatShading = opts.flat ?? true;
  if (opts.em) { m.emissive = new THREE.Color(color); m.emissiveIntensity = opts.em; }
  TEXMAT_CACHE.set(key, m);
  return m;
}

/** Toon material, cached by colour. Flat-shaded so facets read as creases. */
export function mat(color: number, opts: { flat?: boolean; emissive?: number } = {}): THREE.MeshToonMaterial {
  if (opts.emissive === undefined && MAT_CACHE.has(color)) return MAT_CACHE.get(color)!;
  const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
  // MeshToonMaterial honours flatShading via the standard flag.
  (m as unknown as { flatShading: boolean }).flatShading = opts.flat ?? true;
  if (opts.emissive !== undefined) { m.emissive = new THREE.Color(opts.emissive); }
  if (opts.emissive === undefined) MAT_CACHE.set(color, m);
  return m;
}

function mesh(geo: THREE.BufferGeometry, color: number, flat = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat(color, { flat }));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// TENTS
// ---------------------------------------------------------------------------

/** A ridge (wedge) tent: canvas body, gable ends, ridge pole, guy lines, stakes. */
export function ridgeTent(len = 4, span = 3, h = 2.2, tex?: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  // canvas body — triangular prism (extruded triangle)
  const sh = new THREE.Shape();
  sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, h); sh.lineTo(-span / 2, 0);
  const body = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  body.translate(0, 0, -len / 2);
  g.add(tex ? new THREE.Mesh(body, texMat(C.canvas, tex)) : mesh(body, C.canvas));
  // a darker door slit on the near gable
  const door = mesh(new THREE.PlaneGeometry(span * 0.28, h * 0.7), C.woodDark);
  door.position.set(0, h * 0.35, len / 2 + 0.01);
  g.add(door);
  // ridge pole poking out both ends
  const pole = mesh(new THREE.CylinderGeometry(0.05, 0.05, len + 0.7, 6), C.wood);
  pole.rotation.x = Math.PI / 2;
  pole.position.y = h;
  g.add(pole);
  // guy lines + stakes at four corners
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const eave = new THREE.Vector3(0, h, (sz * len) / 2);
    const stake = new THREE.Vector3(sx * (span / 2 + 0.8), 0, (sz * (len / 2 + 0.6)));
    g.add(rope(eave, stake, 0.02));
    const st = mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.35, 4), C.wood);
    st.position.copy(stake); st.position.y = 0.15; st.rotation.z = sx * 0.3;
    g.add(st);
  }
  return g;
}

/** An officer's wall tent: vertical walls, then a hipped canvas roof. */
export function wallTent(len = 3.6, span = 3, wall = 1.1, h = 2.6): THREE.Group {
  const g = new THREE.Group();
  const walls = mesh(new THREE.BoxGeometry(span, wall, len), C.canvasSh);
  walls.position.y = wall / 2;
  g.add(walls);
  const sh = new THREE.Shape();
  sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, h - wall); sh.lineTo(-span / 2, 0);
  const roof = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  roof.translate(0, 0, -len / 2);
  const roofM = mesh(roof, C.canvas);
  roofM.position.y = wall;
  g.add(roofM);
  const pole = mesh(new THREE.CylinderGeometry(0.05, 0.05, len + 0.5, 6), C.wood);
  pole.rotation.x = Math.PI / 2; pole.position.y = h;
  g.add(pole);
  return g;
}

/** A ramshackle brush shelter — the nine-thousand-men-in-brush-piles kind. */
export function brushShelter(): THREE.Group {
  const g = new THREE.Group();
  // two forked front posts, one back — a lean-to
  const fh = 1.5, bh = 0.7, w = 2.4, d = 2.0;
  const post = (x: number, z: number, ht: number) => {
    const p = mesh(new THREE.CylinderGeometry(0.06, 0.08, ht, 5), C.wood);
    p.position.set(x, ht / 2, z);
    g.add(p);
    return ht;
  };
  post(-w / 2, d / 2, fh); post(w / 2, d / 2, fh);
  post(-w / 2, -d / 2, bh); post(w / 2, -d / 2, bh);
  // sloped roof of branches — several thin poles across the slope
  for (let i = 0; i <= 6; i++) {
    const x = -w / 2 + (i / 6) * w;
    const b = mesh(new THREE.CylinderGeometry(0.04, 0.04, d + 0.4, 4), C.woodPale);
    b.position.set(x, (fh + bh) / 2, 0);
    b.rotation.x = Math.atan2(fh - bh, d);
    g.add(b);
  }
  // sailcloth draped over part of it — irregular quad, sagging
  const cloth = mesh(new THREE.PlaneGeometry(w * 0.7, d + 0.3), C.canvasSh);
  cloth.position.set(-w * 0.1, (fh + bh) / 2 + 0.02, 0);
  cloth.rotation.x = -Math.PI / 2 + Math.atan2(fh - bh, d);
  cloth.rotation.z = 0.06;
  g.add(cloth);
  // a turf/earth mound low at the back
  const turf = mesh(new THREE.BoxGeometry(w, 0.4, 0.5), C.mud);
  turf.position.set(0, 0.2, -d / 2 - 0.1);
  g.add(turf);
  return g;
}

// ---------------------------------------------------------------------------
// BARRELS, CRATES, THE TRESTLE
// ---------------------------------------------------------------------------

/** A barrel: bulged staves + iron hoops. Reads unmistakably. */
export function barrel(h = 0.95, r = 0.42): THREE.Group {
  const g = new THREE.Group();
  const staves = 12;
  for (let i = 0; i < staves; i++) {
    const a = (i / staves) * Math.PI * 2;
    const st = mesh(new THREE.CylinderGeometry(r * 0.16, r * 0.16, h, 4), C.wood);
    // bulge: stave bows out at the middle — approximate with a thin box leaned
    st.position.set(Math.cos(a) * r * 0.98, h / 2, Math.sin(a) * r * 0.98);
    st.scale.z = 0.5;
    st.lookAt(Math.cos(a) * r * 2, h / 2, Math.sin(a) * r * 2);
    st.rotation.x += Math.PI / 2;
    g.add(st);
  }
  for (const y of [h * 0.15, h * 0.85]) {
    const hoop = mesh(new THREE.TorusGeometry(r * 1.02, 0.035, 4, 14), C.iron);
    hoop.rotation.x = Math.PI / 2; hoop.position.y = y;
    g.add(hoop);
  }
  // lid
  const lid = mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.06, 12), C.woodPale);
  lid.position.y = h; g.add(lid);
  return g;
}

/** A plank crate with inset panels. */
export function crate(s = 0.8): THREE.Group {
  const g = new THREE.Group();
  const box = mesh(new THREE.BoxGeometry(s, s, s), C.woodPale);
  box.position.y = s / 2; g.add(box);
  // corner battens
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const b = mesh(new THREE.BoxGeometry(0.08, s + 0.02, 0.08), C.woodDark);
    b.position.set(sx * s / 2, s / 2, sz * s / 2); g.add(b);
  }
  return g;
}

/** A trestle table with a splayed A-frame, papers and a small box on top. */
export function trestleTable(len = 2.2, w = 0.8, h = 0.85): THREE.Group {
  const g = new THREE.Group();
  const top = mesh(new THREE.BoxGeometry(len, 0.08, w), C.woodPale);
  top.position.y = h; g.add(top);
  for (const sx of [-1, 1]) {
    // A-frame legs
    for (const dz of [-1, 1]) {
      const leg = mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 5), C.wood);
      leg.position.set(sx * (len / 2 - 0.25), h / 2, dz * (w / 2 - 0.12));
      leg.rotation.z = -sx * 0.14;
      g.add(leg);
    }
    const brace = mesh(new THREE.CylinderGeometry(0.04, 0.04, w, 4), C.wood);
    brace.position.set(sx * (len / 2 - 0.25), h * 0.4, 0);
    brace.rotation.x = Math.PI / 2; g.add(brace);
  }
  // scattered papers
  for (let i = 0; i < 4; i++) {
    const p = mesh(new THREE.PlaneGeometry(0.3, 0.4), C.paper);
    p.rotation.x = -Math.PI / 2; p.rotation.z = (Math.random() - 0.5) * 0.6;
    p.position.set(-len / 2 + 0.4 + i * 0.42, h + 0.045, (i % 2) * 0.12 - 0.06);
    g.add(p);
  }
  const box = crate(0.34); box.position.set(len / 2 - 0.4, h + 0.005, 0); g.add(box);
  return g;
}

// ---------------------------------------------------------------------------
// FIRE, ARMS, WAGON, FLAG
// ---------------------------------------------------------------------------

/** A campfire: stone ring, crossed logs, flame, and a kettle on a tripod. */
export function campfire(): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const st = mesh(new THREE.DodecahedronGeometry(0.16), C.stone);
    st.position.set(Math.cos(a) * 0.6, 0.1, Math.sin(a) * 0.6);
    st.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(st);
  }
  for (let i = 0; i < 4; i++) {
    const log = mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), C.ember);
    log.position.set(0, 0.12, 0);
    log.rotation.set(Math.PI / 2 - 0.4, (i / 4) * Math.PI, 0);
    g.add(log);
  }
  // flame — stacked emissive octahedra
  for (let i = 0; i < 3; i++) {
    const f = mesh(new THREE.OctahedronGeometry(0.34 - i * 0.09), C.flame);
    (f.material as THREE.MeshToonMaterial).emissive = new THREE.Color(C.flame);
    f.position.y = 0.35 + i * 0.28; f.rotation.y = i;
    g.add(f);
  }
  // tripod + kettle
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4), C.wood);
    leg.position.set(Math.cos(a) * 0.5, 1.0, Math.sin(a) * 0.5);
    leg.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35 + (a < Math.PI ? 0.15 : -0.15));
    // aim legs to meet at apex
    leg.lookAt(0, 2.0, 0); leg.rotateX(Math.PI / 2); leg.position.set(Math.cos(a) * 0.5, 1.0, Math.sin(a) * 0.5);
    g.add(leg);
  }
  const kettle = mesh(new THREE.SphereGeometry(0.24, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.7), C.iron);
  kettle.position.y = 0.95; kettle.scale.y = 0.85; g.add(kettle);
  return g;
}

/** A stand of stacked muskets — the tripod of arms by the guard. */
export function musketStack(n = 4): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = new THREE.Group();
    // full-length walnut stock with the barrel lying along it — reads as a
    // firelock at arm's length instead of a bare pole
    const stock = mesh(new THREE.BoxGeometry(0.075, 1.25, 0.06), C.woodDark);
    stock.position.y = 0.62; m.add(stock);
    const barrel_ = mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.45, 5), C.iron);
    barrel_.position.set(0, 0.85, 0.035); m.add(barrel_);
    const lock = mesh(new THREE.BoxGeometry(0.05, 0.14, 0.09), C.iron);
    lock.position.set(0, 0.72, 0.02); m.add(lock);
    const butt = mesh(new THREE.BoxGeometry(0.09, 0.34, 0.11), C.woodDark);
    butt.position.set(0, 0.16, 0); m.add(butt);
    const bayonet = mesh(new THREE.ConeGeometry(0.018, 0.35, 4), C.iron);
    bayonet.position.set(0, 1.72, 0.035); m.add(bayonet);
    m.position.set(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3);
    m.rotation.z = Math.cos(a) * 0.24;
    m.rotation.x = -Math.sin(a) * 0.24;
    g.add(m);
  }
  return g;
}

/** A supply wagon: bed, sideboards, four wheels, shafts. */
export function wagon(): THREE.Group {
  const g = new THREE.Group();
  const bed = mesh(new THREE.BoxGeometry(1.6, 0.4, 3.0), C.woodPale);
  bed.position.y = 0.9; g.add(bed);
  for (const sx of [-1, 1]) {
    const side = mesh(new THREE.BoxGeometry(0.08, 0.5, 3.0), C.wood);
    side.position.set(sx * 0.8, 1.15, 0); g.add(side);
  }
  const wheel = (x: number, z: number, r: number) => {
    const w = new THREE.Group();
    w.add(mesh(new THREE.TorusGeometry(r, 0.06, 5, 12), C.woodDark));
    for (let i = 0; i < 6; i++) {
      const sp = mesh(new THREE.CylinderGeometry(0.03, 0.03, r * 2, 4), C.wood);
      sp.rotation.z = (i / 6) * Math.PI; w.add(sp);
    }
    w.rotation.y = Math.PI / 2; w.position.set(x, r, z); g.add(w);
  };
  wheel(-0.9, 1.0, 0.55); wheel(0.9, 1.0, 0.55);
  wheel(-0.9, -1.0, 0.45); wheel(0.9, -1.0, 0.45);
  for (const sx of [-0.4, 0.4]) {
    const shaft = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 5), C.wood);
    shaft.rotation.x = Math.PI / 2; shaft.position.set(sx, 0.8, 2.2); g.add(shaft);
  }
  return g;
}

/** A flagpole with a stiffened flag (a Grand Union hint via colour blocks). */
export function flagpole(h = 6): THREE.Group {
  const g = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 6), C.woodPale);
  pole.position.y = h / 2; g.add(pole);
  // flag as a gently waved strip
  const seg = 8, fw = 2.2, fh = 1.3;
  const geo = new THREE.PlaneGeometry(fw, fh, seg, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, Math.sin((x / fw + 0.5) * Math.PI * 2) * 0.12);
  }
  geo.computeVertexNormals();
  const flag = mesh(geo, C.coatBlue, false);
  flag.position.set(fw / 2 + 0.06, h - fh / 2 - 0.2, 0);
  g.add(flag);
  const canton = mesh(new THREE.PlaneGeometry(fw * 0.4, fh * 0.5), C.linenMap);
  canton.position.set(0.2, h - fh * 0.25 - 0.2, 0.02);
  g.add(canton);
  return g;
}

// ---------------------------------------------------------------------------
// FIGURES — soldiers that read as people
// ---------------------------------------------------------------------------

export interface FigureOpts {
  coat?: number;
  musket?: boolean;
  hat?: boolean;
}

/** A soldier: head, coat with tails, breeches, legs, tricorne, optional musket. */
export function figure(opts: FigureOpts = {}): THREE.Group {
  const g = new THREE.Group();
  const coat = opts.coat ?? C.coatBlue;
  // legs (breeches + lower leg + shoe) x2
  for (const sx of [-1, 1]) {
    const thigh = mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.5, 6), C.breeches);
    thigh.position.set(sx * 0.12, 0.55, 0); g.add(thigh);
    const shin = mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.45, 6), C.canvasSh);
    shin.position.set(sx * 0.12, 0.15, 0.0); g.add(shin);
    const shoe = mesh(new THREE.BoxGeometry(0.14, 0.09, 0.26), C.hat);
    shoe.position.set(sx * 0.12, 0.05, 0.05); g.add(shoe);
  }
  // torso: waistcoat core + coat body tapering to skirts
  const waist = mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.55, 8), C.waistcoat);
  waist.position.y = 1.05; g.add(waist);
  const body = mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.6, 8), coat);
  body.position.y = 1.08; g.add(body);
  // coat skirts (flare below the waist)
  const skirt = mesh(new THREE.CylinderGeometry(0.20, 0.26, 0.35, 8), coat);
  skirt.position.y = 0.7; g.add(skirt);
  // lapels — two angled planes on the chest
  for (const sx of [-1, 1]) {
    const lap = mesh(new THREE.BoxGeometry(0.1, 0.42, 0.04), C.coatBuff);
    lap.position.set(sx * 0.09, 1.12, 0.19); lap.rotation.z = sx * 0.12; g.add(lap);
  }
  // arms
  for (const sx of [-1, 1]) {
    const arm = mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.62, 6), coat);
    arm.position.set(sx * 0.28, 1.05, 0.02); arm.rotation.z = sx * 0.18; g.add(arm);
    const cuff = mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 6), C.coatBuff);
    cuff.position.set(sx * 0.34, 0.78, 0.05); g.add(cuff);
  }
  // neck + head
  const neck = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 6), C.skin);
  neck.position.y = 1.42; g.add(neck);
  const stock = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 8), C.paper); // neck stock
  stock.position.y = 1.45; g.add(stock);
  const head = mesh(new THREE.SphereGeometry(0.15, 8, 7), C.skin);
  head.position.y = 1.6; head.scale.y = 1.1; g.add(head);
  // hair tie at back
  const queue = mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.2, 5), C.woodDark);
  queue.position.set(0, 1.55, -0.14); queue.rotation.x = 0.3; g.add(queue);
  // tricorne
  if (opts.hat ?? true) {
    const crown = mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.14, 6), C.hat);
    crown.position.y = 1.73; g.add(crown);
    const brim = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 3), C.hat);
    brim.position.y = 1.68; brim.rotation.y = Math.PI / 6; g.add(brim);
  }
  // musket
  if (opts.musket) {
    const m = new THREE.Group();
    m.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 5), C.iron));
    const stk = mesh(new THREE.BoxGeometry(0.05, 0.5, 0.04), C.woodDark);
    stk.position.y = -0.5; m.add(stk);
    m.position.set(0.34, 1.0, 0.14); m.rotation.z = -0.08;
    g.add(m);
  }
  return g;
}

// ---------------------------------------------------------------------------
// GROUND, WATER, DISTANT TOWN, TREES
// ---------------------------------------------------------------------------

/** Rutted, undulating camp ground with worn mud paths near stations. */
export function ground(size = 90, muddy: Array<{ x: number; z: number; r: number }> = []): THREE.Mesh {
  const seg = 96;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col: number[] = [];
  const base = new THREE.Color(C.grass);
  const dry = new THREE.Color(C.grassDry);
  const mud = new THREE.Color(C.mud);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i); // plane is XY before rotate; y is world -z
    // gentle rolling + a slope down toward the water (world -x side handled by world)
    const h = Math.sin(x * 0.12) * 0.25 + Math.cos(y * 0.09) * 0.3
            + Math.sin((x + y) * 0.3) * 0.08;
    pos.setZ(i, h);
    // vertex colour: mud near station centres, else grass mottle
    const c = base.clone().lerp(dry, (Math.sin(x * 0.7) * 0.5 + 0.5) * 0.6);
    let m = 0;
    for (const p of muddy) {
      const d = Math.hypot(x - p.x, y - (-p.z));
      m = Math.max(m, Math.max(0, 1 - d / p.r));
    }
    c.lerp(mud, m * 0.55);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp }));
  (m.material as unknown as { flatShading: boolean }).flatShading = true;
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

/** A flat sheet of water for the harbour. */
export function water(size = 120): THREE.Mesh {
  const m = mesh(new THREE.PlaneGeometry(size, size), C.water, false);
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** A distant town silhouette — Boston across the water. Low, simple, ranked. */
export function distantTown(width = 60): THREE.Group {
  const g = new THREE.Group();
  let x = -width / 2;
  while (x < width / 2) {
    const w = 1.4 + Math.random() * 2.2;
    const h = 2 + Math.random() * 4;
    const house = mesh(new THREE.BoxGeometry(w, h, 2 + Math.random() * 2), C.townWall);
    house.position.set(x + w / 2, h / 2, (Math.random() - 0.5) * 4);
    g.add(house);
    // pitched roof
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.001, w * 0.75, 0.9, 3), mat(C.townRoof));
    roof.position.set(x + w / 2, h + 0.4, house.position.z); roof.rotation.y = Math.PI / 4;
    g.add(roof);
    // occasional steeple
    if (Math.random() < 0.15) {
      const tower = mesh(new THREE.BoxGeometry(1, h * 0.8, 1), C.steeple);
      tower.position.set(x + w / 2, h * 0.9, house.position.z);
      g.add(tower);
      const spire = mesh(new THREE.ConeGeometry(0.7, 3, 4), C.steeple);
      spire.position.set(x + w / 2, h * 1.3 + 1.5, house.position.z);
      g.add(spire);
    }
    x += w + 0.3;
  }
  return g;
}

/** A faceted low-poly tree. */
export function tree(h = 5): THREE.Group {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.18, 0.28, h * 0.5, 6), C.wood);
  trunk.position.y = h * 0.25; g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const blob = mesh(new THREE.IcosahedronGeometry(1.2 - i * 0.2, 0), C.grass);
    blob.position.y = h * 0.5 + i * 0.9; blob.scale.y = 0.8;
    blob.rotation.y = i; g.add(blob);
  }
  return g;
}

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

/** A thin taut rope between two world points. */
export function rope(a: THREE.Vector3, b: THREE.Vector3, r = 0.02): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r, r, len, 4);
  const m = mesh(geo, C.rope);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

/** Reset caches (for hot-reload safety). */
export function disposeKit() { MAT_CACHE = new Map(); }
