/**
 * The five Council emblems, drawn as 16x16 pixel marks.
 *
 * They exist because colour alone cannot carry the voices: five inks that must
 * stay distinguishable in greyscale and to a student with a red-green
 * deficiency is not a thing five inks can do. The emblem is the primary
 * channel and the ink reinforces it, never the other way round.
 */

import { hline, px, rect, surface, vline } from '../engine/pixels';
import { INK, type VoiceId } from '../palette';

const CACHE = new Map<VoiceId, string>();

function draw(v: VoiceId): string {
  const s = surface(16, 16);
  const g = s.g;
  const c = INK[v];
  const dim = '#00000000';
  rect(g, 0, 0, 16, 16, dim);

  switch (v) {
    case 'ambition': {          // a spur
      for (let i = 0; i < 7; i++) { px(g, 3 + i, 4 + i * 0.4 | 0, c); px(g, 3 + i, 12 - (i * 0.4 | 0), c); }
      vline(g, 3, 5, 7, c);
      // the rowel
      for (let a = 0; a < 8; a++) {
        const th = (a / 8) * Math.PI * 2;
        px(g, 12 + Math.round(Math.cos(th) * 3), 8 + Math.round(Math.sin(th) * 3), c);
      }
      px(g, 12, 8, c);
      break;
    }
    case 'restraint': {         // a bridle bit
      hline(g, 2, 8, 12, c);
      vline(g, 4, 5, 7, c);
      vline(g, 11, 5, 7, c);
      for (let a = 0; a < 10; a++) {
        const th = (a / 10) * Math.PI * 2;
        px(g, 2 + Math.round(Math.cos(th) * 2), 8 + Math.round(Math.sin(th) * 2), c);
        px(g, 13 + Math.round(Math.cos(th) * 2), 8 + Math.round(Math.sin(th) * 2), c);
      }
      break;
    }
    case 'temper': {            // a struck flint, and the sparks
      for (let i = 0; i < 6; i++) hline(g, 3 + i, 10 - i, 6 - i, c);
      hline(g, 3, 11, 8, c);
      px(g, 12, 4, c); px(g, 14, 2, c); px(g, 11, 6, c); px(g, 13, 6, c);
      break;
    }
    case 'duty': {              // a folded commission, sealed
      rect(g, 2, 4, 12, 9, c);
      hline(g, 2, 8, 12, '#00000000');
      hline(g, 3, 8, 10, c);
      px(g, 8, 10, c); px(g, 7, 11, c); px(g, 9, 11, c); px(g, 8, 12, c);
      break;
    }
    case 'vanity': {            // a hand mirror
      for (let a = 0; a < 16; a++) {
        const th = (a / 16) * Math.PI * 2;
        px(g, 8 + Math.round(Math.cos(th) * 4), 6 + Math.round(Math.sin(th) * 4), c);
      }
      vline(g, 8, 11, 4, c);
      hline(g, 7, 14, 3, c);
      break;
    }
  }
  return s.canvas.toDataURL();
}

export function emblem(v: VoiceId): string {
  let hit = CACHE.get(v);
  if (!hit) { hit = draw(v); CACHE.set(v, hit); }
  return hit;
}

/** A wax seal, for the eight decisions that carry one. */
export function sealMark(): string {
  const s = surface(24, 24);
  const g = s.g;
  for (let y = -10; y <= 10; y++) {
    const w = Math.round(Math.sqrt(Math.max(0, 100 - y * y)));
    hline(g, 12 - w, 12 + y, w * 2, '#7E2A22');
  }
  for (let a = 0; a < 14; a++) {
    const th = (a / 14) * Math.PI * 2;
    px(g, 12 + Math.round(Math.cos(th) * 10), 12 + Math.round(Math.sin(th) * 10), '#5E1C16');
  }
  for (let y = -6; y <= 6; y++) {
    const w = Math.round(Math.sqrt(Math.max(0, 36 - y * y)));
    hline(g, 12 - w, 11 + y, w * 2, '#96382C');
  }
  hline(g, 8, 9, 8, '#B8564A');
  hline(g, 9, 14, 6, '#5E1C16');
  return s.canvas.toDataURL();
}
