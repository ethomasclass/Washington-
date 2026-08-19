/**
 * People: a 32x48 walking sprite and a 64x80 dialogue portrait, both generated
 * from the same spec object so the man you talked to and the face in the panel
 * can never disagree about who he is.
 *
 * WHY 32x48 AND NOT 16x24.
 * Salem could carry a Puritan village at 16x24 because a Puritan village is
 * dressed in four colours and one silhouette. 1775 is not: the entire opening
 * act turns on a coat, and a student has to be able to see at a glance the
 * difference between blue faced buff, a plain brown coat, a livery of white
 * faced scarlet, and osnaburg. That needs a lapel, a cuff and a waistcoat
 * front, and a lapel is four pixels wide at this size and zero at the last one.
 *
 * PROPORTION.
 * Head to body is about 1:4.8 — a long way from chibi. These are adults in a
 * game about adults, and the elderly, the young and the worked-out have to read
 * as different bodies. The head is the only part drawn generously; everything
 * else is measured.
 */

import {
  hash, hline, outline, px, rect, shade, surface, vline,
  type Surface,
} from './pixels';
import { P } from '../palette';

export const SPR_W = 32;
export const SPR_H = 48;

/** Facing, in the order the frames are stored. */
export const DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 } as const;
export type Dir = 0 | 1 | 2 | 3;

/** Four frames: contact, left step, contact, right step. */
export const FRAMES = 4;

export type SkinTone = 'a' | 'b' | 'c' | 'd';
export type HatKind = 'none' | 'tricorne' | 'round' | 'cocked' | 'cap' | 'kerchief' | 'straw';
export type HairKind = 'queue' | 'short' | 'long' | 'cropped' | 'bald' | 'bun';
export type Age = 'child' | 'young' | 'adult' | 'old';

export interface ActorSpec {
  skin: SkinTone;
  hair: string;
  hairStyle: HairKind;
  hat: HatKind;
  /** Coat, or the bodice of a gown. */
  coat: string;
  /** Cuffs, lapels and collar. The single most legible thing on a soldier. */
  facings?: string;
  waistcoat?: string;
  breeches?: string;
  stockings?: string;
  /** Set for a gown: skirt colour. Suppresses breeches. */
  gown?: string;
  apron?: string;
  cap?: boolean;
  /**
   * A neckerchief, a ring, a bead. In the Quarter these are the only saturated
   * pixels the grade lets through, and that is deliberate — see LIGHT.witness.
   */
  accent?: string;
  sash?: string;
  hatBand?: string;
  boots?: boolean;
  build: number;
  tall: number;
  age: Age;
}

const SKIN: Record<SkinTone, readonly [string, string, string]> = {
  a: [P.skinAD, P.skinA, P.skinAL],
  b: [P.skinBD, P.skinB, P.skinBL],
  c: [P.skinCD, P.skinC, P.skinCL],
  d: [P.skinDD, P.skinD, P.skinDL],
};

export function actor(partial: Partial<ActorSpec>): ActorSpec {
  return {
    skin: 'a',
    hair: P.hairBrown,
    hairStyle: 'queue',
    hat: 'none',
    coat: P.brown,
    waistcoat: P.linen,
    breeches: P.linenD,
    stockings: P.linen,
    build: 1,
    tall: 1,
    age: 'adult',
    ...partial,
  };
}

/* ---------------------------------------------------------------------- *
 * Metrics
 * ---------------------------------------------------------------------- */

interface Metrics {
  headTop: number; headH: number; headW: number;
  shoulder: number; waist: number; hip: number; knee: number; sole: number;
  torsoW: number; cx: number;
}

function metrics(sp: ActorSpec): Metrics {
  const child = sp.age === 'child';
  const old = sp.age === 'old';
  // A child is short and large-headed; the old stand shorter without shrinking.
  const scale = sp.tall * (child ? 0.68 : 1);
  const sole = SPR_H - 1;
  const headH = child ? 11 : 10;
  const headW = child ? 11 : 10;
  const bodyTop = Math.round(SPR_H - 43 * scale) + (old ? 2 : 0);
  const headTop = bodyTop;
  const shoulder = headTop + headH + 2;
  const hip = Math.round(sole - (child ? 11 : 15) * scale);
  const waist = Math.round(shoulder + (hip - shoulder) * 0.62);
  const knee = Math.round(hip + (sole - hip) * 0.5);
  const torsoW = Math.round((child ? 10 : 13) * sp.build);
  return { headTop, headH, headW, shoulder, waist, hip, knee, sole, torsoW, cx: SPR_W / 2 };
}

/* ---------------------------------------------------------------------- *
 * Walking sprite
 * ---------------------------------------------------------------------- */

/** Vertical step offset. The body rises a pixel mid-stride and it is most of
 *  what makes four frames read as walking. */
function bob(frame: number): number {
  return frame === 1 || frame === 3 ? -1 : 0;
}

function drawLegs(g: CanvasRenderingContext2D, sp: ActorSpec, m: Metrics, dir: Dir, frame: number): void {
  const stock = sp.stockings ?? P.linen;
  const stockD = shade(stock, -0.22);
  const shoe = P.ink;

  if (sp.gown) {
    // A gown to the ankle. The hem sways with the step, which is the whole of
    // the animation — there are no legs to swing.
    const sway = frame === 1 ? -1 : frame === 3 ? 1 : 0;
    const skirtTop = m.waist;
    const hemW = Math.round(m.torsoW * 1.85);
    for (let y = skirtTop; y <= m.sole; y++) {
      const t = (y - skirtTop) / Math.max(1, m.sole - skirtTop);
      const w = Math.round(m.torsoW * 0.9 + (hemW - m.torsoW * 0.9) * t);
      const x = Math.round(m.cx - w / 2 + sway * t * 1.2);
      hline(g, x, y, w, sp.gown);
      px(g, x, y, shade(sp.gown, -0.26));
      px(g, x + w - 1, y, shade(sp.gown, -0.26));
      // Two fold lines, so the skirt is not a triangle of flat colour.
      if (y > skirtTop + 2) {
        px(g, Math.round(m.cx - w * 0.18), y, shade(sp.gown, -0.16));
        px(g, Math.round(m.cx + w * 0.22), y, shade(sp.gown, 0.14));
      }
    }
    // Shoes just visible under the hem.
    if (dir !== DIR.UP) {
      px(g, m.cx - 3, m.sole, shoe);
      px(g, m.cx + 2, m.sole, shoe);
    }
    return;
  }

  // Breeches, stockings, shoes. Two legs, one swinging.
  const legW = Math.max(3, Math.round(4 * sp.build));
  const spread = dir === DIR.LEFT || dir === DIR.RIGHT ? 1 : 3;
  const lift = [0, 2, 0, 0];
  const back = [0, 0, 0, 2];
  const br = sp.breeches ?? P.linenD;

  for (const side of [-1, 1] as const) {
    const lead = side === -1 ? lift[frame] : back[frame];
    const x = Math.round(m.cx + side * spread - legW / 2);
    // breeches to just below the knee
    rect(g, x, m.hip, legW, m.knee - m.hip, br);
    vline(g, x, m.hip, m.knee - m.hip, shade(br, -0.2));
    // stocking
    const stockTop = m.knee;
    const stockBot = m.sole - 1 - lead;
    rect(g, x, stockTop, legW, Math.max(1, stockBot - stockTop), stock);
    vline(g, x + legW - 1, stockTop, Math.max(1, stockBot - stockTop), stockD);
    // shoe or boot
    if (sp.boots) {
      rect(g, x - 1, m.knee, legW + 2, m.sole - m.knee - lead + 1, P.brownD);
      hline(g, x - 1, m.knee, legW + 2, P.brown);
    }
    rect(g, x - 1, stockBot, legW + 2, 2, shoe);
    if (dir === DIR.DOWN) px(g, x + 1, stockBot, P.buffL); // buckle
  }
}

function drawTorso(g: CanvasRenderingContext2D, sp: ActorSpec, m: Metrics, dir: Dir, frame: number): void {
  const w = m.torsoW;
  const x = Math.round(m.cx - w / 2);
  const top = m.shoulder;
  const skirtBot = sp.gown ? m.waist : Math.round(m.hip + (m.knee - m.hip) * 0.55);
  const coatD = shade(sp.coat, -0.26);
  const coatL = shade(sp.coat, 0.16);

  // The body of the coat. Below the waist it flares into skirts — the single
  // most period-specific silhouette available at this size.
  for (let y = top; y <= skirtBot; y++) {
    let ww = w;
    if (!sp.gown && y > m.waist) {
      const t = (y - m.waist) / Math.max(1, skirtBot - m.waist);
      ww = Math.round(w * (1 + 0.42 * t));
    }
    const xx = Math.round(m.cx - ww / 2);
    hline(g, xx, y, ww, sp.coat);
    vline(g, xx + ww - 1, y, 1, coatD);
    vline(g, xx, y, 1, coatL);
  }

  // Waistcoat / stomacher showing down the front, and the lapels either side.
  if (dir === DIR.DOWN) {
    const wc = sp.waistcoat ?? P.linen;
    const vw = Math.max(3, Math.round(w * 0.34));
    rect(g, Math.round(m.cx - vw / 2), top + 2, vw, m.waist - top, wc);
    vline(g, Math.round(m.cx - vw / 2), top + 2, m.waist - top, shade(wc, -0.2));
    // buttons
    for (let y = top + 4; y < m.waist - 1; y += 3) px(g, m.cx, y, shade(wc, -0.45));
    if (sp.facings) {
      // Turned-back lapels. Four pixels wide, and the whole act is about them.
      const lw = Math.max(2, Math.round(w * 0.2));
      rect(g, x + 1, top + 1, lw, Math.round((m.waist - top) * 0.7), sp.facings);
      rect(g, x + w - 1 - lw, top + 1, lw, Math.round((m.waist - top) * 0.7), sp.facings);
    }
    // Shirt at the throat.
    rect(g, m.cx - 2, top - 1, 4, 2, P.linenL);
  } else if (dir === DIR.UP) {
    // Centre back seam and a pleat either side.
    vline(g, m.cx, top + 1, skirtBot - top, coatD);
    vline(g, Math.round(m.cx - w * 0.3), m.waist, skirtBot - m.waist, coatD);
    vline(g, Math.round(m.cx + w * 0.3), m.waist, skirtBot - m.waist, coatD);
  } else {
    // Profile: the front edge of the coat, and a hint of waistcoat.
    const front = dir === DIR.LEFT ? x + 1 : x + w - 2;
    vline(g, front, top + 1, m.waist - top, shade(sp.waistcoat ?? P.linen, 0));
    if (sp.facings) rect(g, front - (dir === DIR.LEFT ? 0 : 1), top + 1, 2, 5, sp.facings);
  }

  // Apron, over everything.
  if (sp.apron) {
    const aw = Math.round(w * 1.15);
    const ax = Math.round(m.cx - aw / 2);
    for (let y = m.waist - 1; y <= (sp.gown ? m.sole - 3 : skirtBot); y++) {
      const t = (y - (m.waist - 1)) / Math.max(1, (sp.gown ? m.sole - 3 : skirtBot) - (m.waist - 1));
      const ww = Math.round(aw * (0.8 + 0.35 * t));
      hline(g, Math.round(m.cx - ww / 2), y, ww, sp.apron);
    }
    hline(g, ax, m.waist - 1, aw, shade(sp.apron, 0.18));
  }

  // A sash worn across the breast. Crimson silk, and it means something.
  if (sp.sash && dir !== DIR.UP) {
    for (let i = 0; i < w + 2; i++) {
      const yy = top + 2 + Math.round((i / (w + 2)) * (m.waist - top - 3));
      px(g, x - 1 + i, yy, sp.sash);
      px(g, x - 1 + i, yy + 1, shade(sp.sash, -0.2));
    }
  }

  // Arms. They hang, and they swing a pixel against the legs.
  const swing = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const armW = Math.max(3, Math.round(3 * sp.build));
  const armTop = top + 1;
  const armBot = m.waist + 3;
  for (const side of [-1, 1] as const) {
    if ((dir === DIR.LEFT && side === 1) || (dir === DIR.RIGHT && side === -1)) continue;
    const ax = Math.round(m.cx + side * (w / 2 + armW / 2 - 1) - armW / 2);
    const off = side === -1 ? swing : -swing;
    rect(g, ax, armTop + off, armW, armBot - armTop, sp.coat);
    vline(g, ax + (side === -1 ? 0 : armW - 1), armTop + off, armBot - armTop, coatD);
    // The cuff — deep, turned back, and in the facing colour if there is one.
    const cuff = sp.facings ?? shade(sp.coat, 0.1);
    rect(g, ax, armBot - 4 + off, armW, 4, cuff);
    // The hand.
    rect(g, ax, armBot + off, armW, 2, SKIN[sp.skin][1]);
  }
}

function drawHead(g: CanvasRenderingContext2D, sp: ActorSpec, m: Metrics, dir: Dir): void {
  const sk = SKIN[sp.skin];
  const hw = m.headW - (dir === DIR.LEFT || dir === DIR.RIGHT ? 2 : 0);
  const hx = Math.round(m.cx - hw / 2);
  const hy = m.headTop;
  const hh = m.headH;

  // Neck.
  rect(g, m.cx - 2, hy + hh - 1, 4, 3, sk[0]);
  // Stock — the white band at the throat every man in this game wears.
  if (sp.age !== 'child') rect(g, m.cx - 3, hy + hh + 1, 6, 2, P.linenL);

  // Skull.
  rect(g, hx, hy + 1, hw, hh - 1, sk[1]);
  hline(g, hx + 1, hy, hw - 2, sk[1]);
  // Light comes from the left in every sprite; the right side of the face is
  // the shadow. Constant across the game so nobody reads as lit differently.
  vline(g, hx + hw - 1, hy + 1, hh - 1, sk[0]);
  vline(g, hx, hy + 2, hh - 3, sk[2]);

  if (dir === DIR.DOWN) {
    const ey = hy + Math.round(hh * 0.5);
    px(g, hx + 2, ey, P.ink);
    px(g, hx + hw - 3, ey, P.ink);
    // A single pixel of brow does more for character than a whole eye does.
    px(g, hx + 2, ey - 2, shade(sp.hair, -0.2));
    px(g, hx + hw - 3, ey - 2, shade(sp.hair, -0.2));
    px(g, m.cx - 1, ey + 2, sk[0]);              // nose
    hline(g, hx + 3, ey + 4, hw - 6, sk[0]);     // mouth
    if (sp.age === 'old') {
      hline(g, hx + 1, ey + 6, 3, sk[0]);
      hline(g, hx + hw - 4, ey + 6, 3, sk[0]);
    }
  } else if (dir !== DIR.UP) {
    const ey = hy + Math.round(hh * 0.5);
    const front = dir === DIR.LEFT ? hx + 1 : hx + hw - 2;
    px(g, front + (dir === DIR.LEFT ? 1 : -1), ey, P.ink);
    px(g, front, ey + 2, sk[0]);
  }

  // Hair. In 1775 a gentleman's hair is dressed, clubbed and tied at the nape —
  // and the queue is the strongest single silhouette cue available from behind.
  const hr = sp.hair;
  const hrD = shade(hr, -0.28);
  if (sp.hairStyle !== 'bald') {
    hline(g, hx, hy, hw, hr);
    hline(g, hx + 1, hy - 1, hw - 2, hr);
    vline(g, hx, hy, 3, hr);
    vline(g, hx + hw - 1, hy, 3, hr);
    if (sp.hairStyle === 'queue' || sp.hairStyle === 'bun') {
      // Side rolls above the ear — the thing that makes a 1770s head read.
      rect(g, hx - 1, hy + 2, 2, 3, hr);
      rect(g, hx + hw - 1, hy + 2, 2, 3, hr);
      if (dir === DIR.UP) {
        const qh = sp.hairStyle === 'bun' ? 4 : 7;
        rect(g, m.cx - 1, hy + hh - 1, 2, qh, hr);
        px(g, m.cx - 1, hy + hh - 1, P.ink); // the ribbon
        px(g, m.cx, hy + hh - 1, P.ink);
      }
    } else if (sp.hairStyle === 'long') {
      rect(g, hx - 1, hy + 2, 2, hh - 1, hr);
      rect(g, hx + hw - 1, hy + 2, 2, hh - 1, hr);
      if (dir === DIR.UP) rect(g, hx, hy + 2, hw, hh, hr);
    } else if (sp.hairStyle === 'cropped') {
      hline(g, hx, hy + 1, hw, hrD);
    }
    if (dir === DIR.UP) { rect(g, hx, hy, hw, hh - 2, hr); vline(g, hx + hw - 1, hy, hh - 2, hrD); }
  }

  // A woman's linen cap, worn under or instead of a hat.
  if (sp.cap) {
    hline(g, hx - 1, hy - 1, hw + 2, P.linenL);
    rect(g, hx - 1, hy, hw + 2, 3, P.linen);
    vline(g, hx - 1, hy, 4, P.linenD);
    vline(g, hx + hw, hy, 4, P.linenD);
  }

  // Hats.
  const band = sp.hatBand ?? P.ink;
  if (sp.hat === 'tricorne' || sp.hat === 'cocked') {
    const bw = hw + 8;
    const bx = Math.round(m.cx - bw / 2);
    const by = hy - 2;
    rect(g, bx, by, bw, 3, P.blackD);
    hline(g, bx + 1, by, bw - 2, P.black);
    // The cocked front point, which is what tells a tricorne from a round hat.
    if (dir === DIR.DOWN) { hline(g, bx + 2, by + 3, bw - 4, P.blackD); px(g, m.cx, by + 4, P.blackD); }
    rect(g, hx, by - 4, hw, 5, P.black);
    hline(g, hx + 1, by - 4, hw - 2, P.blackL);
    if (sp.hat === 'cocked') hline(g, bx + 1, by + 1, bw - 2, sp.hatBand ?? P.buff);
    vline(g, hx + hw - 1, by - 4, 5, P.blackD);
  } else if (sp.hat === 'round') {
    const bw = hw + 5;
    const bx = Math.round(m.cx - bw / 2);
    rect(g, bx, hy - 1, bw, 2, P.brownD);
    rect(g, hx, hy - 5, hw, 5, P.brown);
    hline(g, hx + 1, hy - 5, hw - 2, P.brownL);
    hline(g, hx, hy - 1, hw, band);
  } else if (sp.hat === 'straw') {
    const bw = hw + 9;
    const bx = Math.round(m.cx - bw / 2);
    rect(g, bx, hy - 1, bw, 2, P.sandD);
    hline(g, bx + 1, hy - 1, bw - 2, P.sand);
    rect(g, hx, hy - 4, hw, 4, P.sandL);
    hline(g, hx, hy - 1, hw, P.sandD);
  } else if (sp.hat === 'cap') {
    rect(g, hx - 1, hy - 3, hw + 2, 5, sp.coat);
    hline(g, hx, hy - 3, hw, shade(sp.coat, 0.2));
  } else if (sp.hat === 'kerchief') {
    // Tied at the back, and one of the few places colour survives the Quarter's
    // grade. That is the point of it.
    const k = sp.accent ?? P.linen;
    rect(g, hx - 1, hy - 2, hw + 2, 5, k);
    hline(g, hx, hy - 2, hw, shade(k, 0.2));
    vline(g, hx + hw, hy + 2, 3, shade(k, -0.2));
  }

  // A neckerchief at the throat. Same exemption, same reason.
  if (sp.accent && sp.hat !== 'kerchief' && dir !== DIR.UP) {
    rect(g, m.cx - 3, hy + hh + 1, 6, 2, sp.accent);
    px(g, m.cx + 2, hy + hh + 3, sp.accent);
  }
}

/** One frame. */
function drawActor(sp: ActorSpec, dir: Dir, frame: number): Surface {
  const s = surface(SPR_W, SPR_H);
  const m = metrics(sp);
  const dy = bob(frame);
  s.g.save();
  s.g.translate(0, dy);
  drawLegs(s.g, sp, m, dir, frame);
  drawTorso(s.g, sp, m, dir, frame);
  drawHead(s.g, sp, m, dir);
  s.g.restore();
  outline(s, P.ink);
  return s;
}

export interface ActorSheet {
  /** [dir][frame] */
  frames: Surface[][];
  spec: ActorSpec;
}

const SHEETS = new Map<string, ActorSheet>();

/** Build (or fetch) every frame for one person. Cached by spec identity. */
export function actorSheet(key: string, sp: ActorSpec): ActorSheet {
  const hit = SHEETS.get(key);
  if (hit) return hit;
  const frames: Surface[][] = [];
  for (let d = 0; d < 4; d++) {
    const row: Surface[] = [];
    for (let f = 0; f < FRAMES; f++) row.push(drawActor(sp, d as Dir, f));
    frames.push(row);
  }
  const sheet = { frames, spec: sp };
  SHEETS.set(key, sheet);
  return sheet;
}

/**
 * Pack a sheet into one strip texture, 4 frames across by 4 directions down.
 * One texture per person, sampled with a UV offset — so a crowd is one material
 * per body rather than sixteen.
 */
export function packSheet(sheet: ActorSheet): Surface {
  const s = surface(SPR_W * FRAMES, SPR_H * 4);
  for (let d = 0; d < 4; d++) {
    for (let f = 0; f < FRAMES; f++) {
      s.g.drawImage(sheet.frames[d][f].canvas, f * SPR_W, d * SPR_H);
    }
  }
  return s;
}

/* ---------------------------------------------------------------------- *
 * Dialogue portrait
 * ---------------------------------------------------------------------- */

export const POR_W = 64;
export const POR_H = 80;

/**
 * Head and shoulders at four times the sprite's pixel budget for the face.
 *
 * Generated from the same spec, so a player who has been told "the man in the
 * brown coat by the sawpit" can find him. This is the only place in the game
 * that draws a face large enough to have an expression, and it has four:
 * neutral, warm, hard, and tired.
 */
export type Mood = 'neutral' | 'warm' | 'hard' | 'tired';

export function portrait(sp: ActorSpec, mood: Mood = 'neutral'): Surface {
  const s = surface(POR_W, POR_H);
  const g = s.g;
  const sk = SKIN[sp.skin];
  const cx = POR_W / 2;

  // A plain ground the panel can key against — not a scene, not a vignette.
  rect(g, 0, 0, POR_W, POR_H, P.paperDim);
  for (let y = 0; y < POR_H; y++) {
    const t = y / POR_H;
    hline(g, 0, y, POR_W, shade(P.paperDim, -0.18 + 0.22 * t));
  }

  // Shoulders and coat.
  const shoulderY = 54;
  for (let y = shoulderY; y < POR_H; y++) {
    const t = (y - shoulderY) / (POR_H - shoulderY);
    const w = Math.round(34 + 26 * t);
    hline(g, Math.round(cx - w / 2), y, w, sp.gown ?? sp.coat);
  }
  if (sp.facings) {
    for (let y = shoulderY + 2; y < POR_H; y++) {
      const t = (y - shoulderY) / (POR_H - shoulderY);
      const w = Math.round(34 + 26 * t);
      const lw = Math.round(6 + 4 * t);
      rect(g, Math.round(cx - w / 2) + 2, y, lw, 1, sp.facings);
      rect(g, Math.round(cx + w / 2) - 2 - lw, y, lw, 1, sp.facings);
    }
  }
  // Shirt and stock.
  rect(g, cx - 8, shoulderY, 16, 8, P.linenL);
  rect(g, cx - 7, shoulderY + 1, 14, 3, P.linen);
  if (sp.accent) rect(g, cx - 9, shoulderY + 1, 18, 4, sp.accent);

  // Head.
  const hw = 30, hh = 34, hx = cx - hw / 2, hy = 16;
  rect(g, hx, hy + 3, hw, hh - 3, sk[1]);
  hline(g, hx + 3, hy, hw - 6, sk[1]);
  hline(g, hx + 1, hy + 1, hw - 2, sk[1]);
  hline(g, hx + 1, hy + 2, hw - 2, sk[1]);
  // Jaw: taper the last six rows so the head is not a brick.
  for (let i = 0; i < 7; i++) {
    const w = hw - (i + 1) * 2;
    rect(g, cx - w / 2, hy + hh - 7 + i, w, 1, sk[1]);
    rect(g, cx - hw / 2, hy + hh - 7 + i, (hw - w) / 2, 1, 'rgba(0,0,0,0)');
    g.clearRect(hx, hy + hh - 7 + i, (hw - w) / 2, 1);
    g.clearRect(cx + w / 2, hy + hh - 7 + i, (hw - w) / 2, 1);
  }
  // Modelling: light from the left, shadow down the right and under the brow.
  rect(g, hx + hw - 6, hy + 4, 5, hh - 12, sk[0]);
  rect(g, hx + 1, hy + 4, 3, hh - 14, sk[2]);
  rect(g, hx + 5, hy + 12, hw - 12, 2, sk[0]);   // brow shadow
  rect(g, cx - 2, hy + 15, 4, 7, sk[0]);          // nose
  rect(g, cx - 3, hy + 21, 6, 2, sk[2]);

  // Eyes.
  const ey = hy + 16;
  const squint = mood === 'hard' ? 1 : 0;
  const tired = mood === 'tired' ? 1 : 0;
  for (const side of [-1, 1] as const) {
    const ex = cx + side * 8;
    rect(g, ex - 3, ey - 1 + squint, 6, 3 - squint, P.linenL);
    rect(g, ex - 1, ey + squint, 2, 2 - squint, P.ink);
    // Brow — the whole expression lives here, not in the mouth.
    const browY = ey - 5 + (mood === 'hard' ? 1 : 0) + tired;
    rect(g, ex - 4, browY + (mood === 'hard' ? side * -0.5 : 0) | 0, 8, 2, shade(sp.hair, -0.15));
    if (tired) rect(g, ex - 3, ey + 3, 6, 1, sk[0]);
  }

  // Mouth.
  const my = hy + 26;
  if (mood === 'warm') { hline(g, cx - 5, my, 10, sk[0]); px(g, cx - 6, my - 1, sk[0]); px(g, cx + 5, my - 1, sk[0]); }
  else if (mood === 'hard') { hline(g, cx - 6, my, 12, shade(sk[0], -0.2)); }
  else { hline(g, cx - 5, my, 10, sk[0]); }
  if (sp.age === 'old') {
    hline(g, hx + 2, hy + 20, 4, sk[0]);
    hline(g, hx + hw - 6, hy + 20, 4, sk[0]);
    hline(g, cx - 7, my + 4, 14, sk[0]);
  }

  // Hair and cap and hat, in that order.
  const hr = sp.hair;
  if (sp.hairStyle !== 'bald') {
    rect(g, hx - 1, hy - 2, hw + 2, 8, hr);
    hline(g, hx + 2, hy - 3, hw - 4, shade(hr, 0.18));
    rect(g, hx - 3, hy + 4, 4, sp.hairStyle === 'long' ? 26 : 12, hr);
    rect(g, hx + hw - 1, hy + 4, 4, sp.hairStyle === 'long' ? 26 : 12, hr);
    if (sp.hairStyle === 'queue') {
      rect(g, hx - 4, hy + 8, 5, 6, hr);
      rect(g, hx + hw - 1, hy + 8, 5, 6, hr);
    }
  }
  if (sp.cap) {
    rect(g, hx - 3, hy - 5, hw + 6, 9, P.linen);
    hline(g, hx - 2, hy - 6, hw + 4, P.linenL);
    hline(g, hx - 3, hy + 3, hw + 6, P.linenD);
  }
  if (sp.hat === 'tricorne' || sp.hat === 'cocked') {
    rect(g, cx - 26, hy - 4, 52, 5, P.blackD);
    hline(g, cx - 25, hy - 4, 50, P.black);
    rect(g, hx - 2, hy - 12, hw + 4, 9, P.black);
    hline(g, hx, hy - 12, hw, P.blackL);
    if (sp.hat === 'cocked') hline(g, cx - 24, hy - 2, 48, sp.hatBand ?? P.buff);
  } else if (sp.hat === 'round') {
    rect(g, cx - 22, hy - 3, 44, 4, P.brownD);
    rect(g, hx - 1, hy - 12, hw + 2, 10, P.brown);
    hline(g, hx, hy - 12, hw, P.brownL);
  } else if (sp.hat === 'kerchief') {
    const k = sp.accent ?? P.linen;
    rect(g, hx - 3, hy - 6, hw + 6, 11, k);
    hline(g, hx - 2, hy - 7, hw + 4, shade(k, 0.2));
    rect(g, hx + hw + 1, hy + 3, 5, 6, shade(k, -0.15));
  } else if (sp.hat === 'straw') {
    rect(g, cx - 28, hy - 3, 56, 4, P.sandD);
    hline(g, cx - 27, hy - 3, 54, P.sand);
    rect(g, hx - 1, hy - 11, hw + 2, 9, P.sandL);
  }

  outline(s, P.ink);
  // A single ruled line under the portrait, the one thing kept from the print
  // direction: the panel is a printed page and the face is an inserted plate.
  hline(g, 0, POR_H - 1, POR_W, P.inkSoft);
  return s;
}

/** Deterministic small variation, so a crowd is not eight identical men. */
export function varyActor(base: ActorSpec, seed: number): ActorSpec {
  return {
    ...base,
    build: base.build * (0.94 + hash(seed, 1, 7) * 0.14),
    tall: base.tall * (0.95 + hash(seed, 2, 7) * 0.11),
    hair: hash(seed, 3, 7) < 0.3 ? P.hairBlack : hash(seed, 3, 7) < 0.75 ? P.hairBrown : P.hairGrey,
  };
}
