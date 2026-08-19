/**
 * A map definition becomes geometry.
 *
 * FLIP. Every texture sampled through `quad()` is uploaded with `flipY = false`.
 * `quad()` gives the top pair of vertices the smaller V, which lines up with
 * canvas row 0 only when the flip is off; with three.js's default flip on, the
 * whole tile atlas samples bottom-up and the lawn comes out as the carpet from
 * eighteen rows further down. Character sheets are the exception and keep the
 * default flip, because their geometry is built with the opposite UV winding.
 *
 * The whole world is four draw calls: ground, risers, structures, props. That
 * is not an optimisation flourish — the machine this has to be good on is a
 * Celeron Chromebook with an Intel UHD 600, where draw calls are the scarce
 * thing after fill rate, and a scene built the naive way (a mesh per tile)
 * would be forty thousand of them.
 *
 * LIGHT IS BAKED. Every vertex carries its own colour: sun times normal, plus
 * ambient, plus the shadow a building throws across the ground. There is not a
 * single real light in the scene and there is no shadow map. At this camera
 * pitch, with this much bloom, nobody can tell — and it means the mood system
 * is a vertex-colour rebuild rather than a shader full of uniforms.
 */

import * as THREE from 'three';
import type { Light } from '../palette';
import type { MapDef, StructureDef } from '../types';
import {
  TILE_LIQUID, TILE_PX, VARIANTS,
  riserTexture, tileAtlas, tileUV, type TileId,
} from './tiles';
import { propAtlas, PROPS } from './props';
import { hash, parseHex } from './pixels';
import { makeGrid, PPU, STEP, type Grid } from './collision';
import { ceilingTexture, chimneyTexture, facade, roofTexture } from './structures';

/** One tile is one world unit. A man is about 1.5 units tall. */
export const TILE = 1;
export { PPU, STEP };
export type { Grid };
/** The camera's pitch, baked into every billboard so sprites face it exactly. */
export const CAM_PITCH = 0.63;

const BILLBOARD_UP = new THREE.Vector3(0, Math.cos(CAM_PITCH), -Math.sin(CAM_PITCH));

/* ---------------------------------------------------------------------- *
 * Baked light
 * ---------------------------------------------------------------------- */

function tint(hex: string): THREE.Color {
  const [r, g, b] = parseHex(hex);
  return new THREE.Color(r / 255, g / 255, b / 255);
}

/** Sun direction on the ground plane, from the light's azimuth. */
function sunVec(light: Light): { sx: number; sz: number } {
  return { sx: Math.cos(light.sun), sz: Math.sin(light.sun) };
}

/**
 * The colour a surface gets, given how square-on it is to the sun.
 * `facing` runs -1 (turned away) to 1 (full in it).
 */
function faceColour(light: Light, facing: number, ao = 0): THREE.Color {
  // Wraparound rather than a hard terminator. A surface turned fully away from
  // the sun still gets the sky, and a surface square-on to the camera with the
  // sun raking across it is not thrown into the fill colour — which is what
  // used to make the west front of the Mansion read as cold blue stone at ten
  // in the morning. `n` runs 0 (turned away) to 1 (square on).
  const n = facing * 0.5 + 0.5;
  // Even a face turned away keeps a quarter of the key in it. Without that
  // floor the fill colour — which is sky, and sky is blue — owns every
  // camera-facing wall, and a sand-painted house comes out the colour of slate.
  const c = tint(light.fill).clone().lerp(tint(light.key), (0.28 + 0.72 * n) * light.contrast);
  c.multiplyScalar((0.62 + 0.38 * n) * (1 - ao));
  return c;
}

/* ---------------------------------------------------------------------- *
 * Ground
 * ---------------------------------------------------------------------- */

interface Buf {
  pos: number[];
  uv: number[];
  col: number[];
  idx: number[];
}

const emptyBuf = (): Buf => ({ pos: [], uv: [], col: [], idx: [] });

function quad(
  b: Buf,
  a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3,
  u0: number, v0: number, uw: number, vh: number,
  colour: THREE.Color, flip = false,
): void {
  const base = b.pos.length / 3;
  for (const p of [a, bb, c, d]) b.pos.push(p.x, p.y, p.z);
  const uvs = flip
    ? [u0 + uw, v0 + vh, u0, v0 + vh, u0, v0, u0 + uw, v0]
    : [u0, v0 + vh, u0 + uw, v0 + vh, u0 + uw, v0, u0, v0];
  b.uv.push(...uvs);
  for (let i = 0; i < 4; i++) b.col.push(colour.r, colour.g, colour.b);
  b.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function toGeometry(b: Buf): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
  g.setIndex(b.idx);
  return g;
}

/**
 * Which ground tiles a building puts in shade, by walking its footprint along
 * the sun vector. Cheap, wrong in the way a painted shadow is wrong, and it is
 * the single largest thing that stops the world looking like a flat board.
 */
/**
 * Shadows fall down-screen and to the right, always, whatever the sun is doing.
 *
 * This is a lie and it is the same lie every game in this genre tells. The sun
 * azimuth is chosen to light the walls the camera can see, which puts it behind
 * the viewer, which would throw every shadow away from the viewer where none of
 * them can be seen. Decoupling the two costs nothing, and contact shadows on
 * the ground are the single largest thing separating a lit diorama from a board
 * with pictures on it.
 */
const SHADOW_DIR = { x: 0.55, z: 0.83 };

function bakeShadowMask(map: MapDef, grid: Grid): Float32Array {
  const mask = new Float32Array(grid.cols * grid.rows);
  const sx = -SHADOW_DIR.x, sz = -SHADOW_DIR.z;
  const push = (x0: number, z0: number, w: number, d: number, h: number) => {
    const len = Math.min(11, h * 1.9);
    for (let s = 0.5; s < len; s += 0.5) {
      const strength = 0.66 * (1 - s / len) + 0.14;
      for (let dx = 0; dx < w; dx += 0.5) {
        for (let dz = 0; dz < d; dz += 0.5) {
          const x = Math.floor(x0 + dx - sx * s);
          const z = Math.floor(z0 + dz - sz * s);
          const i = grid.at(x, z);
          if (i < 0) continue;
          mask[i] = Math.max(mask[i], strength);
        }
      }
    }
  };
  for (const s of map.structures ?? []) push(s.x, s.z, s.w, s.d, s.h + (s.pitch ?? 0));
  for (const p of map.props ?? []) {
    const def = PROPS[p.id];
    if (!def || def.flat) continue;
    const hTiles = def.h / PPU;
    if (hTiles < 1.2) continue;
    push(p.x - def.w / PPU / 2, p.z, def.w / PPU, 0.5, hTiles * 0.7);
  }
  return mask;
}

function buildGround(map: MapDef, grid: Grid): { mesh: THREE.Mesh; risers: THREE.Mesh } {
  const atlas = tileAtlas();
  const tex = new THREE.CanvasTexture(atlas.canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  // See FLIP below.
  tex.flipY = false;

  const shade = bakeShadowMask(map, grid);
  const flat = faceColour(map.light, 1, 0);
  const b = emptyBuf();
  const rb = emptyBuf();

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const i = r * grid.cols + c;
      const id = grid.tile[i];
      const line = map.ground[r] ?? '';
      if (!map.legend[line[c] ?? ' ']) continue;   // a hole is a hole
      const y = grid.height[i];
      const variant = Math.floor(hash(c, r, 17) * VARIANTS);
      const [u0, v0, uw, vh] = tileUV(id, variant);

      const sh = shade[i];
      const colour = flat.clone().multiplyScalar(1 - sh * 0.62);
      // A touch of per-tile variation so a big lawn is not one flat value.
      colour.multiplyScalar(0.978 + hash(c, r, 29) * 0.044);
      if (TILE_LIQUID[id]) colour.multiplyScalar(1.16);

      quad(
        b,
        new THREE.Vector3(c, y, r + 1),
        new THREE.Vector3(c + 1, y, r + 1),
        new THREE.Vector3(c + 1, y, r),
        new THREE.Vector3(c, y, r),
        u0, v0, uw, vh, colour,
      );

      /*
       * Risers, on the two faces that can show: south (toward camera) and east.
       *
       * Every level exterior terrace descends as the row index grows, so a
       * riser only ever had to face one way — this checked "is the south
       * neighbour lower," found it true, and drew exactly one face per
       * boundary. An interior stair climbing AWAY from the camera (the
       * passage's own north end sits higher than its south end) needed the
       * other case too: a north tile lower than its south neighbour is the
       * same missing wall in reverse, and without it there is a real hole in
       * the floor mesh at that row — not a texture mismatch, an unrendered
       * gap a player can see through. Checking the difference rather than
       * the sign covers both without drawing anything twice: each boundary
       * is still visited from exactly one side, row r's own check of r+1.
       */
      const south = grid.at(c, r + 1);
      if (south >= 0 && Math.abs(grid.height[south] - y) > 0.01) {
        const y2 = grid.height[south];
        pushRiser(rb, c, r + 1, Math.max(y, y2), Math.min(y, y2),
          riserKind(id, grid.tile[south]), faceColour(map.light, 0.15, sh * 0.5));
      }

      /*
       * And the same on the east face.
       *
       * Every exterior terrace steps along z only, so for a long time this
       * case genuinely did not arise and its absence cost nothing. A stair
       * set into ONE SIDE of a passage steps along x as well, and without
       * this there is an open seam running the length of the flight where
       * the treads meet the floor beside them — not a wrong texture, a hole
       * you can see the background through.
       */
      const east = grid.at(c + 1, r);
      if (east >= 0 && Math.abs(grid.height[east] - y) > 0.01) {
        const y2 = grid.height[east];
        pushRiserEW(rb, c + 1, r, Math.max(y, y2), Math.min(y, y2),
          riserKind(id, grid.tile[east]), faceColour(map.light, 0.55, sh * 0.5));
      }
    }
  }

  const mesh = new THREE.Mesh(
    toGeometry(b),
    new THREE.MeshBasicMaterial({ map: tex, vertexColors: true }),
  );
  mesh.frustumCulled = false;

  const risers = new THREE.Mesh(
    toGeometry(rb),
    // DoubleSide: a south riser and an east riser wind opposite ways, and an
    // east one flips again depending on which of the two tiles is the higher.
    // Rather than branch the winding four ways, draw both faces.
    new THREE.MeshBasicMaterial({
      map: riserAtlasTexture(), vertexColors: true, side: THREE.DoubleSide,
    }),
  );
  risers.frustumCulled = false;
  return { mesh, risers };
}

/** Three riser textures stacked into one strip, so risers are one draw call. */
let RISER_TEX: THREE.Texture | null = null;
const RISER_ROW: Record<'earth' | 'stone' | 'timber', number> = { earth: 0, stone: 1, timber: 2 };
function riserAtlasTexture(): THREE.Texture {
  if (RISER_TEX) return RISER_TEX;
  const cv = document.createElement('canvas');
  cv.width = TILE_PX; cv.height = TILE_PX * 3;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  (['earth', 'stone', 'timber'] as const).forEach((k, i) => {
    g.drawImage(riserTexture(k).canvas, 0, i * TILE_PX);
  });
  const t = new THREE.CanvasTexture(cv);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  RISER_TEX = t;
  return t;
}

/**
 * What a step between two tiles is made of. Either side of the boundary can
 * name the material — a board floor stepping down to a board floor is timber
 * whichever tile the loop happened to be standing on when it noticed.
 */
function riserKind(a: TileId, b: TileId): 'earth' | 'stone' | 'timber' {
  const stone = (t: TileId) => t === 'flag' || t === 'brickyard' || t === 'kitchenfloor';
  const timber = (t: TileId) =>
    t === 'deck' || t === 'board' || t === 'painted' || t === 'carpet';
  if (stone(a) || stone(b)) return 'stone';
  if (timber(a) || timber(b)) return 'timber';
  return 'earth';
}

/** A step whose face lies along z — the estate's terraces, and a stair's treads. */
function pushRiser(
  b: Buf, c: number, r: number, yTop: number, yBot: number,
  kind: 'earth' | 'stone' | 'timber', colour: THREE.Color,
): void {
  const v0 = RISER_ROW[kind] / 3;
  quad(
    b,
    new THREE.Vector3(c, yBot, r),
    new THREE.Vector3(c + 1, yBot, r),
    new THREE.Vector3(c + 1, yTop, r),
    new THREE.Vector3(c, yTop, r),
    0, v0, 1, (1 / 3) * Math.min(1, (yTop - yBot) / STEP),
    colour,
  );
}

/** A step whose face lies along x — the open flank of a stair in a passage. */
function pushRiserEW(
  b: Buf, c: number, r: number, yTop: number, yBot: number,
  kind: 'earth' | 'stone' | 'timber', colour: THREE.Color,
): void {
  const v0 = RISER_ROW[kind] / 3;
  quad(
    b,
    new THREE.Vector3(c, yBot, r + 1),
    new THREE.Vector3(c, yBot, r),
    new THREE.Vector3(c, yTop, r),
    new THREE.Vector3(c, yTop, r + 1),
    0, v0, 1, (1 / 3) * Math.min(1, (yTop - yBot) / STEP),
    colour,
  );
}

/* ---------------------------------------------------------------------- *
 * Structures
 * ---------------------------------------------------------------------- */

type Face = 'south' | 'north' | 'east' | 'west';
const FACE_NORMAL: Record<Face, [number, number]> = {
  south: [0, 1], north: [0, -1], east: [1, 0], west: [-1, 0],
};

function buildStructure(s: StructureDef, map: MapDef, grid: Grid): THREE.Group {
  const group = new THREE.Group();
  const { sx, sz } = sunVec(map.light);
  const y0 = grid.heightAt(s.x + s.w / 2, s.z + s.d / 2);
  const roofTex = new THREE.CanvasTexture(roofTexture(s.seed ?? 3).canvas);
  roofTex.magFilter = THREE.NearestFilter;
  roofTex.minFilter = THREE.NearestMipmapNearestFilter;
  roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping;
  roofTex.colorSpace = THREE.SRGBColorSpace;
  roofTex.flipY = false;

  const faces: Face[] = ['south', 'north', 'east', 'west'];
  for (const f of faces) {
    const wide = f === 'south' || f === 'north' ? s.w : s.d;
    const tex = new THREE.CanvasTexture(
      facade({
        style: s.style,
        wide,
        high: s.h,
        openings: s.faces?.[f],
        cornice: s.cornice,
        plinth: s.plinth,
        storeyH: s.storeyH,
        seed: (s.seed ?? 7) + faces.indexOf(f),
      }).canvas,
    );
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestMipmapNearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    // The open north wing wants its gaps to be gaps.
    const transparent = s.style === 'frameOpen';

    const n = FACE_NORMAL[f];
    const facing = n[0] * sx + n[1] * sz;
    const col = faceColour(map.light, facing);

    const b = emptyBuf();
    const x0 = s.x, z0 = s.z, x1 = s.x + s.w, z1 = s.z + s.d;
    const yTop = y0 + s.h;
    const corners: Record<Face, [THREE.Vector3, THREE.Vector3]> = {
      south: [new THREE.Vector3(x0, y0, z1), new THREE.Vector3(x1, y0, z1)],
      north: [new THREE.Vector3(x1, y0, z0), new THREE.Vector3(x0, y0, z0)],
      east: [new THREE.Vector3(x1, y0, z1), new THREE.Vector3(x1, y0, z0)],
      west: [new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x0, y0, z1)],
    };
    const [a, bb] = corners[f];
    quad(
      b, a, bb,
      new THREE.Vector3(bb.x, yTop, bb.z),
      new THREE.Vector3(a.x, yTop, a.z),
      0, 0, 1, 1, col,
    );
    const mesh = new THREE.Mesh(
      toGeometry(b),
      new THREE.MeshBasicMaterial({
        map: tex, vertexColors: true, transparent, alphaTest: transparent ? 0.5 : 0,
        side: THREE.DoubleSide,
      }),
    );
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  // Roof.
  if (s.roof && s.roof !== 'none') {
    const pitch = s.pitch ?? 1.0;
    const yE = y0 + s.h;
    const yR = yE + pitch;
    const b = emptyBuf();
    const x0 = s.x - 0.18, z0 = s.z - 0.18, x1 = s.x + s.w + 0.18, z1 = s.z + s.d + 0.18;
    const rep = Math.max(1, Math.round(s.w * 0.8));
    if (s.roof === 'gable' || s.roof === 'hip') {
      // Ridge running east-west, so the long slopes face the camera and away.
      const mz = (z0 + z1) / 2;
      const inset = s.roof === 'hip' ? s.d * 0.32 : 0;
      const rx0 = x0 + inset, rx1 = x1 - inset;
      // South slope (toward the camera) catches the least sun in a west light.
      quad(b,
        new THREE.Vector3(x0, yE, z1), new THREE.Vector3(x1, yE, z1),
        new THREE.Vector3(rx1, yR, mz), new THREE.Vector3(rx0, yR, mz),
        0, 0, rep, pitch * 1.6, faceColour(map.light, -0.34 + 0.30 * Math.max(0, sz)));
      quad(b,
        new THREE.Vector3(x1, yE, z0), new THREE.Vector3(x0, yE, z0),
        new THREE.Vector3(rx0, yR, mz), new THREE.Vector3(rx1, yR, mz),
        0, 0, rep, pitch * 1.6, faceColour(map.light, 0.62 - 0.30 * Math.min(0, sz)));
      if (s.roof === 'hip') {
        quad(b,
          new THREE.Vector3(x1, yE, z1), new THREE.Vector3(x1, yE, z0),
          new THREE.Vector3(rx1, yR, mz), new THREE.Vector3(rx1, yR, mz),
          0, 0, rep * 0.4, pitch * 1.6, faceColour(map.light, sx));
        quad(b,
          new THREE.Vector3(x0, yE, z0), new THREE.Vector3(x0, yE, z1),
          new THREE.Vector3(rx0, yR, mz), new THREE.Vector3(rx0, yR, mz),
          0, 0, rep * 0.4, pitch * 1.6, faceColour(map.light, -sx));
      } else {
        // Gable ends, in the wall material rather than the roof.
        for (const [zz, fc] of [[z1, 0.2], [z0, 0.5]] as const) {
          quad(b,
            new THREE.Vector3(x0, yE, zz), new THREE.Vector3(x1, yE, zz),
            new THREE.Vector3((x0 + x1) / 2, yR, zz), new THREE.Vector3((x0 + x1) / 2, yR, zz),
            0, 0, rep, pitch, faceColour(map.light, fc));
        }
      }
    } else {
      // Shed: one slope, falling north.
      quad(b,
        new THREE.Vector3(x0, yE, z1), new THREE.Vector3(x1, yE, z1),
        new THREE.Vector3(x1, yR, z0), new THREE.Vector3(x0, yR, z0),
        0, 0, rep, pitch * 2, faceColour(map.light, 0.5));
    }
    const roof = new THREE.Mesh(
      toGeometry(b),
      new THREE.MeshBasicMaterial({ map: roofTex, vertexColors: true, side: THREE.DoubleSide }),
    );
    roof.frustumCulled = false;
    group.add(roof);
  }

  // Chimneys.
  for (const ch of s.chimneys ?? []) {
    const tex = new THREE.CanvasTexture(chimneyTexture().canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    const cw = 0.8, cd = 0.7;
    const cx = ch.on === 'east' ? s.x + s.w - cw / 2 - 0.1
      : ch.on === 'west' ? s.x + cw / 2 + 0.1
        : s.x + ch.at;
    const cz = ch.on === 'ridge' ? s.z + s.d / 2 : s.z + ch.at;
    const yb = y0 + s.h;
    const yt = yb + ch.h;
    const b = emptyBuf();
    const push = (ax: number, az: number, bx: number, bz: number, facing: number) =>
      quad(b,
        new THREE.Vector3(ax, yb, az), new THREE.Vector3(bx, yb, bz),
        new THREE.Vector3(bx, yt, bz), new THREE.Vector3(ax, yt, az),
        0, 0, 1, 1, faceColour(map.light, facing));
    push(cx - cw / 2, cz + cd / 2, cx + cw / 2, cz + cd / 2, sz);
    push(cx + cw / 2, cz - cd / 2, cx - cw / 2, cz - cd / 2, -sz);
    push(cx + cw / 2, cz + cd / 2, cx + cw / 2, cz - cd / 2, sx);
    push(cx - cw / 2, cz - cd / 2, cx - cw / 2, cz + cd / 2, -sx);
    const m = new THREE.Mesh(toGeometry(b), new THREE.MeshBasicMaterial({ map: tex, vertexColors: true }));
    m.frustumCulled = false;
    group.add(m);
  }

  return group;
}

/* ---------------------------------------------------------------------- *
 * Interior walls, from the object layer
 * ---------------------------------------------------------------------- */

/**
 * Walls in an interior are drawn full height when they are the far side of a
 * room, and knee-high when they are the near side.
 *
 * That is the whole trick behind a top-down interior you can actually see into,
 * and it is why the player never has to rotate a camera this game does not
 * have. A wall with floor to the SOUTH of it (toward the viewer) is a back
 * wall: draw it. A wall with floor only to the NORTH is between the eye and
 * the room: cut it down to a sill.
 */
function buildInteriorWalls(map: MapDef, grid: Grid): THREE.Group {
  const group = new THREE.Group();
  if (!map.objects) return group;
  const rows = map.objects.length;
  const H = map.wallHeight ?? 2.4;
  const { sx, sz } = sunVec(map.light);

  const isFloor = (c: number, r: number) => {
    const o = map.objects?.[r]?.[c] ?? ' ';
    const g = map.ground[r]?.[c] ?? ' ';
    return !!map.legend[g] && o !== '#';
  };
  const isWall = (c: number, r: number) => (map.objects?.[r]?.[c] ?? ' ') === '#';

  const tex = new THREE.CanvasTexture(
    facade({ style: map.wallStyle ?? 'plaster', wide: 1, high: 3, seed: 11 }).canvas,
  );
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;

  const b = emptyBuf();
  for (let r = 0; r < rows; r++) {
    const line = map.objects[r];
    for (let c = 0; c < line.length; c++) {
      if (!isWall(c, r)) continue;
      const y = grid.height[grid.at(c, r)] ?? 0;
      const nearFloor = isFloor(c, r + 1);
      const farFloor = isFloor(c, r - 1);
      const h = nearFloor ? H : farFloor ? 0.42 : H * 0.55;
      const yTop = y + h;
      // The wall texture is authored three tiles high with the skirting at the
      // bottom, so a shorter wall samples the bottom slice, not the top.
      const uvH = Math.min(1, h / 3);
      const uvTop = 1 - uvH;

      // South face — the one the camera sees on a back wall.
      if (nearFloor) {
        quad(b,
          new THREE.Vector3(c, y, r + 1), new THREE.Vector3(c + 1, y, r + 1),
          new THREE.Vector3(c + 1, yTop, r + 1), new THREE.Vector3(c, yTop, r + 1),
          0, uvTop, 1, uvH, faceColour(map.light, sz * 0.7 + 0.35));
      }
      // North face — seen across a cut-down near wall.
      if (farFloor) {
        quad(b,
          new THREE.Vector3(c + 1, y, r), new THREE.Vector3(c, y, r),
          new THREE.Vector3(c, yTop, r), new THREE.Vector3(c + 1, yTop, r),
          0, uvTop, 1, uvH, faceColour(map.light, -sz * 0.7 + 0.2));
      }
      // Side faces, where the wall ends or turns.
      if (isFloor(c + 1, r)) {
        quad(b,
          new THREE.Vector3(c + 1, y, r + 1), new THREE.Vector3(c + 1, y, r),
          new THREE.Vector3(c + 1, yTop, r), new THREE.Vector3(c + 1, yTop, r + 1),
          0, uvTop, 1, uvH, faceColour(map.light, sx * 0.8 + 0.25));
      }
      if (isFloor(c - 1, r)) {
        quad(b,
          new THREE.Vector3(c, y, r), new THREE.Vector3(c, y, r + 1),
          new THREE.Vector3(c, yTop, r + 1), new THREE.Vector3(c, yTop, r),
          0, uvTop, 1, uvH, faceColour(map.light, -sx * 0.8 + 0.25));
      }
      // Cap, so a cut-down wall reads as a wall seen from above.
      quad(b,
        new THREE.Vector3(c, yTop, r + 1), new THREE.Vector3(c + 1, yTop, r + 1),
        new THREE.Vector3(c + 1, yTop, r), new THREE.Vector3(c, yTop, r),
        0, 0, 1, 0.12, faceColour(map.light, 0.9));
    }
  }
  const mesh = new THREE.Mesh(toGeometry(b), new THREE.MeshBasicMaterial({ map: tex, vertexColors: true }));
  mesh.frustumCulled = false;
  group.add(mesh);
  return group;
}

/* ---------------------------------------------------------------------- *
 * Props
 * ---------------------------------------------------------------------- */

function buildProps(map: MapDef, grid: Grid): THREE.Group {
  const group = new THREE.Group();
  const atlas = propAtlas();
  const tex = new THREE.CanvasTexture(atlas.surface.canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  const AW = atlas.surface.w, AH = atlas.surface.h;

  const standing = emptyBuf();
  const flat = emptyBuf();
  const lit = faceColour(map.light, 0.55);

  for (const inst of map.props) {
    const packed = atlas.entries.get(inst.id);
    if (!packed) continue;
    const def = packed.def;
    const scale = inst.scale ?? 1;
    const w = (def.w / PPU) * scale;
    const h = (def.h / PPU) * scale;
    const y = grid.heightAt(inst.x, inst.z) - (def.sink ?? 0) / PPU;
    const u0 = packed.x / AW, v0 = packed.y / AH;
    const uw = packed.w / AW, vh = packed.h / AH;

    // Vertical variation, so a row of the same prop is not a row of clones.
    const jitter = 0.94 + hash(Math.round(inst.x * 4), Math.round(inst.z * 4), 5) * 0.12;
    const colour = lit.clone().multiplyScalar(jitter);

    if (def.flat) {
      quad(flat,
        new THREE.Vector3(inst.x - w / 2, y + 0.02, inst.z + h / 2),
        new THREE.Vector3(inst.x + w / 2, y + 0.02, inst.z + h / 2),
        new THREE.Vector3(inst.x + w / 2, y + 0.02, inst.z - h / 2),
        new THREE.Vector3(inst.x - w / 2, y + 0.02, inst.z - h / 2),
        u0, v0, uw, vh, colour, inst.flip);
    } else {
      const up = BILLBOARD_UP.clone().multiplyScalar(h * jitter);
      const bl = new THREE.Vector3(inst.x - w / 2, y, inst.z);
      const br = new THREE.Vector3(inst.x + w / 2, y, inst.z);
      quad(standing,
        bl, br,
        br.clone().add(up), bl.clone().add(up),
        u0, v0, uw, vh, colour, inst.flip);
    }

  }

  for (const [buf, depthWrite] of [[flat, false], [standing, true]] as const) {
    if (!buf.pos.length) continue;
    const m = new THREE.Mesh(
      toGeometry(buf),
      new THREE.MeshBasicMaterial({
        map: tex, vertexColors: true, transparent: true, alphaTest: 0.45,
        depthWrite, side: THREE.DoubleSide,
      }),
    );
    m.frustumCulled = false;
    m.renderOrder = depthWrite ? 1 : 0;
    group.add(m);
  }
  return group;
}

/* ---------------------------------------------------------------------- *
 * Assembly
 * ---------------------------------------------------------------------- */

export interface BuiltMap {
  root: THREE.Group;
  grid: Grid;
  def: MapDef;
}

export function buildMap(map: MapDef): BuiltMap {
  const grid = makeGrid(map);
  const root = new THREE.Group();

  const { mesh, risers } = buildGround(map, grid);
  root.add(mesh);
  root.add(risers);

  for (const s of map.structures ?? []) root.add(buildStructure(s, map, grid));
  root.add(buildInteriorWalls(map, grid));
  root.add(buildProps(map, grid));
  return { root, grid, def: map };
}

/** A ceiling plane for an interior, so the room has a lid at the far edge. */
export function ceilingFor(map: MapDef, grid: Grid): THREE.Mesh | null {
  if (!map.ceiling) return null;
  const tex = new THREE.CanvasTexture(ceilingTexture().canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(grid.cols / 2, grid.rows / 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  const h = (map.wallHeight ?? 2.4) + 0.02;
  const g = new THREE.PlaneGeometry(grid.cols, grid.rows);
  g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
    map: tex, color: tint(map.light.fill).multiplyScalar(0.5), side: THREE.BackSide,
  }));
  m.position.set(grid.cols / 2, h, grid.rows / 2);
  m.frustumCulled = false;
  return m;
}

export { BILLBOARD_UP };
