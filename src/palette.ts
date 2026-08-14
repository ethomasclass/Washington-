/**
 * The palette from docs/02-art-direction.md.
 *
 * Four channels, four jobs, no overlap: the line carries structure, the wash
 * carries mood, the paper carries truth, saturation carries meaning.
 *
 * Group D (MEANING) is exempt from every mood transform. Continental blue does
 * not wash out because the player is doing badly — that is the point of it.
 */

export const PAPER = {
  WARM: '#EFE7D5',
  COOL: '#E5E3DB',
  BRIGHT: '#F6F2E6',
  SMOKED: '#DCD2BC',
  SHADOW: '#C6BCA6',
} as const;

export const INK = {
  FLOOR: '#241C14',
  FRESH: '#2B2B36',
  SETTLED: '#3B2E22', // primary line, and all body type (10.66:1 on PAPER.WARM)
  FADED: '#6B4F35',
  LIGHT: '#6E6152',
  LOCKED: '#4A3B2C', // struck options — full opacity, never greyed (8.74:1)
} as const;

export const EARTH = {
  BISTRE: '#7A5C3E',
  RAW_UMBER: '#6E5B45',
  YELLOW_OCHRE: '#9E7B3D',
  TERRE_VERTE: '#7C8570',
  SHADOW_SLATE: '#55627A',
  WET_STONE: '#5C6673',
  MADDER_LAKE: '#8F4A44',
} as const;

/** Group D — exempt from all mood transforms. */
export const MEANING = {
  CONTINENTAL_BLUE: '#243B5E',
  BUFF: '#C9B489',
  BRITISH_MADDER: '#9E3B32',
  BRITISH_SCARLET: '#C0392B',
  PRUSSIAN_BLUE: '#1F3048',
  FRENCH_WHITE: '#E8E2D4',
  SEAL_RED: '#8C2F2A',
  FLAME: '#D98C3C',
} as const;

/** Council voice inks. These colour the voice's NAME only, never its line. */
export const VOICE_INK = {
  vanity: '#875E0F',
  ambition: '#9E2E12',
  temper: '#762C29',
  restraint: '#223746',
  duty: '#1B1E5A',
} as const;

export type VoiceId = keyof typeof VOICE_INK;

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
