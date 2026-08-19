/**
 * The colour of 1775, as a materials list.
 *
 * Not a colour wheel and not a mood board: the pigments a Virginia house, a
 * Virginia field and a Virginia coat were actually made of. Earth reds and
 * ochres, verdigris, indigo, lamp black, white lead, and the sand-and-paint
 * rustication Washington had put on his own siding.
 *
 * Everything drawn in this game picks from here. A colour that is not in this
 * file does not go in the frame, which is the only thing that has ever kept a
 * procedurally generated world from looking like a screensaver.
 */

/** The five Council inks. Kept from the old build — the writing depends on them. */
export type VoiceId = 'ambition' | 'restraint' | 'temper' | 'duty' | 'vanity';

export const INK: Record<VoiceId | 'settled' | 'floor' | 'fresh', string> = {
  ambition: '#C4553C',   // faded vermilion — a spur
  restraint: '#3E5F86',  // Prussian blue — a bridle bit
  temper: '#8A4A32',     // burnt iron-gall — a struck flint
  duty: '#2F3F6B',       // indigo — a folded commission
  vanity: '#C08F3C',     // yellow ochre — a hand mirror
  settled: '#3B2E22',
  floor: '#241C14',
  fresh: '#4A3A2A',
};

/**
 * The world palette.
 *
 * Ramps are always [dark, mid, light] and they are always used in that order:
 * shadow face, lit face, highlight edge. Three values is what makes a pixel
 * read as a solid; two makes it read as a sticker.
 */
export const P = {
  // --- ink and paper ---------------------------------------------------
  ink: '#241C14',
  inkSoft: '#3B2E22',
  paper: '#E8DFC8',
  paperDim: '#CFC4A8',

  // --- ground ----------------------------------------------------------
  grassD: '#4A6237', grass: '#6C8A45', grassL: '#87A65A',
  // The bowling green was mown and rolled. It is a different green from field.
  lawnD: '#557038', lawn: '#7A9A48', lawnL: '#98B863',
  dirtD: '#6A5638', dirt: '#8B7350', dirtL: '#A88E66',
  gravelD: '#7C7263', gravel: '#9C927F', gravelL: '#B8AE9A',
  sandD: '#9A8763', sand: '#BCA684', sandL: '#D6C3A2',
  mudD: '#4E4231', mud: '#6B5B44', mudL: '#837054',

  // --- water -----------------------------------------------------------
  waterD: '#3B5566', water: '#557488', waterL: '#7A99AC', foam: '#C6D8DF',

  // --- stone, brick, timber -------------------------------------------
  stoneD: '#6E6A60', stone: '#8E8A7E', stoneL: '#ADA89A',
  brickD: '#7A4034', brick: '#96513F', brickL: '#B0685020',
  woodD: '#5A4630', wood: '#7A6142', woodL: '#9A7E58',
  // Fresh-sawn yellow pine on the building site — much lighter than weathered.
  pineD: '#9A7F4E', pine: '#C0A268', pineL: '#DCC188',
  shingleD: '#4E4739', shingle: '#6B6252', shingleL: '#867C69',

  // --- the mansion ------------------------------------------------------
  // Rusticated siding: pine boards bevelled and painted, then sand thrown at
  // the wet paint so the house reads as cut stone from thirty yards. It is a
  // very deliberate lie and the game should let a student catch it.
  rustD: '#B5A88A', rust: '#D6CCAE', rustL: '#EDE4C8',
  trimD: '#C9BE9E', trim: '#E4DAC0', trimL: '#F5EEDA',
  glass: '#5F7480', glassL: '#93AAB4', glassDark: '#3E4C56',
  roofD: '#5C554A', roof: '#7C7466', roofL: '#988E7C',

  // --- foliage ---------------------------------------------------------
  leafD: '#3A5230', leaf: '#55743A', leafL: '#729152',
  leafDry: '#7E8A46',
  trunkD: '#4A3B2A', trunk: '#63503A', trunkL: '#7D6749',
  boxD: '#3D5533', box: '#547044', boxL: '#6C8B57',   // boxwood, clipped

  // --- cloth (the estate wears these) ----------------------------------
  blueD: '#28405E', blue: '#3A5A80', blueL: '#55779E',   // Continental blue
  buffD: '#A88B57', buff: '#C9AC77', buffL: '#E0C795',   // buff facings
  scarletD: '#7E3128', scarlet: '#9E4436', scarletL: '#BC5D48',
  linenD: '#B6AA8C', linen: '#D6CCB0', linenL: '#EDE6D0',
  osnaD: '#8F8264', osna: '#AEA286', osnaL: '#C7BDA4',   // osnaburg — issue cloth
  blackD: '#20201E', black: '#33322E', blackL: '#4A4842',
  brownD: '#4B3A28', brown: '#67513A', brownL: '#836A4D',
  greenD: '#3B4A32', green: '#526342', greenL: '#6D7E58',
  wineD: '#4E2630', wine: '#6B3742', wineL: '#8A4E58',

  // --- skin ------------------------------------------------------------
  // Four bases, each with its own shadow and highlight. Nobody in this game is
  // drawn from a single flesh colour.
  skinAD: '#B08260', skinA: '#D6A882', skinAL: '#EDC49E',
  skinBD: '#9A6A48', skinB: '#BC8A62', skinBL: '#D6A87E',
  skinCD: '#6E4A30', skinC: '#8C6242', skinCL: '#A87C58',
  skinDD: '#4A3020', skinD: '#63422C', skinDL: '#7E583C',
  hairBlack: '#241E18', hairBrown: '#4A3626', hairGrey: '#9A9184', hairWhite: '#D8D2C2',

  // --- interiors --------------------------------------------------------
  floorD: '#6A5335', floorB: '#8B6E48', floorL: '#A5875C',
  plasterD: '#C6BCA0', plaster: '#DFD6BC', plasterL: '#F0E9D4',
  // Washington's actual colours: the west parlour is Prussian blue, the small
  // dining room a hard verdigris green that visitors remarked on for a century.
  parlourD: '#2F4F72', parlour: '#3F6890', parlourL: '#5A82A8',
  verdigrisD: '#3E6B54', verdigris: '#54886B', verdigrisL: '#6FA486',
  ochreWallD: '#A6864C', ochreWall: '#C2A468', ochreWallL: '#D8BE88',
  fireD: '#8A4418', fire: '#C4732A', fireL: '#E8A94A', ember: '#F2D089',
} as const;

/** A three-step ramp, for anything that has a lit face and a shadow face. */
export type Ramp = readonly [string, string, string];
export const ramp = (d: string, m: string, l: string): Ramp => [d, m, l];

export const RAMPS = {
  grass: ramp(P.grassD, P.grass, P.grassL),
  lawn: ramp(P.lawnD, P.lawn, P.lawnL),
  dirt: ramp(P.dirtD, P.dirt, P.dirtL),
  gravel: ramp(P.gravelD, P.gravel, P.gravelL),
  stone: ramp(P.stoneD, P.stone, P.stoneL),
  wood: ramp(P.woodD, P.wood, P.woodL),
  pine: ramp(P.pineD, P.pine, P.pineL),
  water: ramp(P.waterD, P.water, P.waterL),
  leaf: ramp(P.leafD, P.leaf, P.leafL),
  box: ramp(P.boxD, P.box, P.boxL),
  rust: ramp(P.rustD, P.rust, P.rustL),
  floor: ramp(P.floorD, P.floorB, P.floorL),
  plaster: ramp(P.plasterD, P.plaster, P.plasterL),
} as const;

/**
 * The light, per place and hour. This is the mood system's actual output now:
 * three colours and two scalars, not a shader full of paper uniforms.
 *
 * `key` is the sun, `fill` the sky bounce, `haze` what the distance goes to.
 */
export interface Light {
  key: string;
  fill: string;
  haze: string;
  /** Sun azimuth in radians, screen space. Decides which way shadows fall. */
  sun: number;
  /** 0 = flat overcast, 1 = hard raking light. */
  contrast: number;
  /** Bloom strength, 0..1. The Quarter runs this at zero. */
  bloom: number;
  /** Colour grade: saturation multiplier. The Quarter runs this near zero. */
  saturation: number;
}

export const LIGHT: Record<string, Light> = {
  /** Mid-morning in May on the west front. Warm, high, generous. */
  vernonMorning: {
    key: '#FFF3DC', fill: '#B4C0CC', haze: '#CFDCE2',
    sun: -2.90, contrast: 0.72, bloom: 0.60, saturation: 1.10,
  },
  /** The east lawn falling to the river — cooler, hazier, more air in it. */
  vernonRiver: {
    key: '#FFF0D8', fill: '#BAC6D2', haze: '#D8E3E8',
    sun: -2.90, contrast: 0.62, bloom: 0.78, saturation: 1.06,
  },
  /** Late afternoon at the dock. The act ends here and the light says so. */
  vernonAfternoon: {
    key: '#FFDDAC', fill: '#B0B8CA', haze: '#E0D6C4',
    sun: -0.55, contrast: 0.80, bloom: 0.70, saturation: 1.14,
  },
  /** Inside the mansion: one window, hard trapezoid, everything else falls off. */
  interiorDay: {
    key: '#FFF2D8', fill: '#7C88A0', haze: '#2A2119',
    sun: -2.60, contrast: 0.88, bloom: 0.34, saturation: 1.00,
  },
  /** The north wing shell — no roof on it, so it is lit like an exterior. */
  interiorOpen: {
    key: '#FFF0D0', fill: '#A6BCD6', haze: '#5E6A70',
    sun: -2.90, contrast: 0.74, bloom: 0.50, saturation: 1.04,
  },
  /**
   * THE WITNESS REGISTER.
   *
   * No bloom. No warmth. Saturation near zero, so the only colour left in the
   * frame is what the tint exemption puts back — a dyed neckerchief, a copper
   * ring, a blue glass bead. The style stops at this gate and the stopping is
   * the argument. Do not make this scene pretty.
   */
  witness: {
    key: '#E6E4DE', fill: '#9EA0A4', haze: '#B4B4B0',
    sun: -2.90, contrast: 0.34, bloom: 0.0, saturation: 0.16,
  },
};
