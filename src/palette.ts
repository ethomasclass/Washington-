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

  // --- Cambridge, 1775-76 ------------------------------------------------
  // Snow is never white. A white tile at this bloom level blows out and takes
  // the sprite standing on it with it, so the lit value tops out well short of
  // paper and the shadow side goes blue.
  snowD: '#9FAEBE', snow: '#C6D2DE', snowL: '#E2E9F0',
  slushD: '#6E7480', slush: '#8B9099', slushL: '#A6AAB0',
  // Turf cut and stacked: the parapet, the gabions, the graves.
  turfD: '#4A4A33', turf: '#63614A', turfL: '#7E7A5E',
  // Canvas. Officers' marquees were bleached; a private's tent was not.
  canvasD: '#A79B80', canvasM: '#C8BDA1', canvasL: '#E0D7BC',
  // Iron: gun barrels, kettles, the trail of a carriage.
  ironD: '#2E3236', iron: '#464B50', ironL: '#646A70',
  // Bright steel — a bayonet, a blade, a barrel with the light on it.
  // The `iron` ramp is what iron looks like in the rain; this is what a
  // sixteen-inch bayonet looks like held above a rank, which is the only
  // thing in a grey frame that has any shine on it at all.
  steel: '#8E979E', steelL: '#BFC7CC',
  // The gun carriages at Ticonderoga were painted with red ochre and lampblack.
  carriageD: '#5E3A28', carriage: '#7C4E34', carriageL: '#986344',

  // --- Brooklyn, and the Delaware ----------------------------------------
  // Salt marsh: cordgrass in August is a yellow-green nothing like a lawn,
  // and the mud under it is the colour that gets on everybody's legs.
  marshD: '#5A6438', marsh: '#7A8248', marshL: '#9CA05E',
  siltD: '#4A4438', silt: '#645C4A', siltL: '#807561',
  // Tidal flat, at low water. Half of Gowanus is this twice a day.
  flatD: '#6A6656', flat: '#8A8674', flatL: '#A6A28E',
  // Cobbles and plank, which is what a ferry road and a ferry stair are.
  cobbleD: '#5E5A54', cobble: '#7C7770', cobbleL: '#9A948B',
  // Night. Nothing at night is black; it is a very dark blue with a green
  // bias, and the only warm thing in the frame is a lantern.
  nightD: '#151C26', night: '#233043', nightL: '#374A63',
  lantern: '#F2C86A', lanternD: '#C08A2E', lanternHalo: '#7A5A1E',
  // Hessian blue, and the brass of a grenadier cap plate.
  hessianD: '#1E2A44', hessian: '#2E3F60', hessianL: '#46587C',
  brassD: '#8A6A22', brass: '#B8933C', brassL: '#DCBE6A',

  /* --- Valley Forge, 1777-78 --------------------------------------------
   *
   * THE ACT'S WHOLE ARGUMENT IS IN THESE FOUR RAMPS, AND IT IS A COLOUR
   * ARGUMENT BEFORE IT IS ANYTHING ELSE.
   *
   * Green timber is the first: an oak felled on Monday and built into a
   * wall on Tuesday is a raw, wet, pale yellow-white on the cut face and
   * grey-brown on the bark, and it is nothing like the weathered brown of
   * every other structure in this game. Six hundred huts of it, all cut in
   * three weeks off the same hillside, is the most visually specific thing
   * about the place — and the reason the walls would not close, because
   * green wood shrinks as it dries and leaves a gap you can see daylight
   * through in February.
   *
   * The clay is the answer to that: eighteen inches of it, rammed into
   * every gap, in the order that specified it. Red-brown Pennsylvania clay
   * over pale wood is what a Valley Forge hut actually looked like, and it
   * is a stripe, not a wash.
   *
   * And `spring`, which is only used at the end. Sixty per cent of what the
   * paper shows is how far into the winter we are, and the thaw happens for
   * everyone: the last state of this map is the first one with a green in
   * it that is not the green of standing water. It is deliberately not the
   * lawn green of Mount Vernon — it is the thin, acid, first green of a
   * Pennsylvania May, and it is the loveliest thing in the act.
   * -------------------------------------------------------------------- */
  greenwoodD: '#7A6E52', greenwood: '#A99B76', greenwoodL: '#CFC49E',
  clayD: '#6A4230', clay: '#8C5A3E', clayL: '#A87553',
  /*
   * Camp mud in a wet winter: churned, frozen at night, never dry.
   *
   * LIGHTENED, TWICE, AND THE SECOND TIME BY A LOT.
   *
   * The first ramp ran #3A3228 to #6E6250, which is what wet earth looks
   * like held in the hand and is nothing like what an acre of it looks like
   * under an overcast sky. Multiplied by `forgeDecember`'s deliberately flat
   * key it came out near-black, the whole of Act 5's opening frame read as
   * a night scene, and the huts the act is about could not be seen at all.
   * Ground is almost always lighter than the eye expects, because ground is
   * mostly sky bouncing off it.
   */
  campD: '#4E4438', camp: '#6E6250', campL: '#8E8068',
  // The first green, in May, on ground that was mud in February.
  springD: '#4E6A2E', spring: '#6E8E3A', springL: '#96B356',
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
  snow: ramp(P.snowD, P.snow, P.snowL),
  slush: ramp(P.slushD, P.slush, P.slushL),
  turf: ramp(P.turfD, P.turf, P.turfL),
  canvas: ramp(P.canvasD, P.canvasM, P.canvasL),
  iron: ramp(P.ironD, P.iron, P.ironL),
  carriage: ramp(P.carriageD, P.carriage, P.carriageL),
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
  /**
   * Overall exposure, 1 = as lit. Below 1 the whole frame goes down.
   *
   * Every light before Act 3 was a daylight, so nothing needed this: a
   * daylight scene is a question of WHICH colours, not how much of them. A
   * night scene is the other way round — the lanterns have to be the only
   * things in the frame that are lit, and no amount of choosing a dark fill
   * gets you there while the grade is still exposing for noon.
   *
   * The first night at the Brooklyn ferry was built without it and came out
   * looking like a warm afternoon with lamps on.
   */
  exposure?: number;
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

  /* --------------------------------------------------------------------
   * CAMBRIDGE, 1775-76.
   *
   * Act 1 is a May morning in Virginia and every light in it is generous.
   * Act 2 is New England going into winter, and the whole act's arc is a
   * light arc: the camp opens in a hard July glare, the lines are a low
   * November sun with no warmth left in it, and by the end the key and the
   * fill are nearly the same colour, which is what a snow day looks like.
   * Nothing else has to say the season out loud.
   * ------------------------------------------------------------------ */

  /** July on the common. Hard, high, dusty — a summer camp on beaten ground. */
  campSummer: {
    key: '#FFF6E2', fill: '#AEBCCE', haze: '#D2DCE4',
    sun: -2.20, contrast: 0.84, bloom: 0.52, saturation: 1.04,
  },
  /** The lane up to headquarters, under elms. Cooler, greener, quieter. */
  campLane: {
    key: '#FCEFD2', fill: '#98AABE', haze: '#C4D0D8',
    sun: -2.20, contrast: 0.66, bloom: 0.62, saturation: 1.00,
  },
  /**
   * November on the works. The sun is round to the south-west and weak with
   * it — `sun: 0.72` is lifted straight off the recovered CB-03 file, where
   * the number was chosen for exactly this hour.
   */
  linesNovember: {
    key: '#F2E2C2', fill: '#8C9AAE', haze: '#B8C2CC',
    sun: 0.72, contrast: 0.58, bloom: 0.44, saturation: 0.88,
  },
  /** December. Key and fill within a few values of each other; no warmth. */
  campWinter: {
    key: '#E8EEF4', fill: '#B0BCCA', haze: '#D6DDE4',
    sun: -1.90, contrast: 0.40, bloom: 0.30, saturation: 0.70,
  },
  /** The works in January. The coldest frame in the game so far. */
  linesWinter: {
    key: '#DEE8F2', fill: '#9AA8BA', haze: '#C6CFD8',
    sun: 0.72, contrast: 0.34, bloom: 0.22, saturation: 0.58,
  },
  /** Inside the Vassall House: a good room, borrowed, with the fires lit. */
  hqParlour: {
    key: '#FFEFC8', fill: '#6E7A92', haze: '#241C18',
    sun: -2.40, contrast: 0.86, bloom: 0.38, saturation: 1.02,
  },
  /**
   * The council room, when the council is sitting.
   *
   * Fourteen men round a table and one candle-branch. The fill goes almost
   * black so the only thing lit in the frame is the table, which is the only
   * thing in the room that matters.
   */
  hqCouncil: {
    key: '#FFE2A2', fill: '#3A4256', haze: '#160F0C',
    sun: -2.40, contrast: 0.94, bloom: 0.52, saturation: 1.06,
  },

  /* --------------------------------------------------------------------
   * BROOKLYN, AUGUST 1776.
   *
   * Act 3's tone note in `docs/05` is "the paper gets wet", and the whole
   * act is a light arc downward: a hot hazy August morning on the works, a
   * wet grey afternoon of driving rain, and then a night on the water with
   * nothing in the frame but lanterns and fog.
   *
   * The act carries a FLOOR AND A CEILING. `docs/05` §3.1 fixes it at the
   * shader level: "the act cannot look like a good day no matter what the
   * player does." None of these five lights is allowed to be cheerful, and
   * the brightest of them has less bloom than Mount Vernon's shadiest.
   * ------------------------------------------------------------------ */

  /** Late August on Long Island. Hot, hazy, and already wrong. */
  brooklynAugust: {
    key: '#F6E8C6', fill: '#93A0AE', haze: '#C0C8CC',
    sun: -2.05, contrast: 0.66, bloom: 0.40, saturation: 0.92,
  },
  /** The marsh at Gowanus. Flatter, greener, and full of standing water. */
  brooklynMarsh: {
    key: '#E8E4C4', fill: '#8A9A96', haze: '#B4BEB8',
    sun: -2.05, contrast: 0.48, bloom: 0.34, saturation: 0.86,
  },
  /**
   * 29 August, and it rained all day.
   *
   * Contrast almost off, saturation well down, and the haze pulled right
   * in toward the key so the distance goes to nothing. This is the light
   * the council of war sat in.
   */
  brooklynRain: {
    key: '#C8CCCE', fill: '#78828C', haze: '#9BA4AA',
    sun: -1.60, contrast: 0.22, bloom: 0.18, saturation: 0.54,
  },
  /**
   * THE NIGHT OF THE 29TH, AND THE ACT'S SHOWPIECE.
   *
   * Nine thousand men taken off an island in one night, in the dark, in
   * silence, without losing a man, under an enemy who never noticed. The
   * key is a lantern and nothing else: `key` is warm and small, `fill` is
   * the sky over water, and the haze is the fog, which in the old print
   * direction was bare paper and here is simply a very near fog plane.
   */
  brooklynNight: {
    key: '#E8B855', fill: '#141C2A', haze: '#0F1620',
    sun: -0.90, contrast: 0.90, bloom: 0.66, saturation: 0.70,
    exposure: 0.58,
  },
  /** Inside Four Chimneys, with the rain on the windows and one candle group. */
  fourChimneys: {
    key: '#F0D9A0', fill: '#3A4450', haze: '#10141A',
    sun: -1.60, contrast: 0.82, bloom: 0.32, saturation: 0.80,
    exposure: 0.78,
  },

  /* --------------------------------------------------------------------
   * THE DELAWARE, 25–26 DECEMBER 1776.
   *
   * The darkest act. `docs/05` §4.1: iron-gall at maximum weight, the wash
   * almost monochrome, and the only warmth from torch and musket flash.
   * ------------------------------------------------------------------ */

  /** The Pennsylvania bank, late afternoon, 25 December. The worst camp in the game. */
  ferryCamp: {
    key: '#D6D2C6', fill: '#7A8088', haze: '#A8ADB2',
    sun: 0.95, contrast: 0.36, bloom: 0.22, saturation: 0.48,
  },
  /**
   * The crossing. Sleet, snow, running ice, and no horizon at all.
   *
   * THE KEY HERE IS COLD, AND THAT IS THE POINT.
   *
   * It was warm (`#E8AC4A`) on the first pass, on the theory that a night
   * lit by lanterns wants a lantern-coloured key. Brooklyn gets away with
   * that because Brooklyn's ground is mud. This ground is snow and river
   * ice, and a blue-white tile multiplied by an orange key comes out
   * *olive* — the Delaware read as a field of pond scum for a whole
   * afternoon before anybody said the word "green" out loud.
   *
   * The warmth belongs to the lanterns and the cook fires, and since
   * `PropDef.glow` those carry it themselves: a glowing prop is drawn at
   * full brightness regardless of the map light, so it is the only warm
   * thing in the frame and it reads as a light source rather than as a
   * tint everything shares. That is what a lantern in the dark actually
   * looks like, and the key is free to be what the sky is: cold.
   */
  delawareNight: {
    key: '#9FB4D2', fill: '#0E1420', haze: '#080D14',
    sun: -0.70, contrast: 0.92, bloom: 0.62, saturation: 0.56,
    exposure: 0.50,
  },
  /** King Street, an hour after sunrise, in sleet. Daylight, and thin with it. */
  trentonMorning: {
    key: '#E4E2DA', fill: '#767E8A', haze: '#B2B6BA',
    sun: 1.35, contrast: 0.42, bloom: 0.26, saturation: 0.56,
  },
  /**
   * The same street, after.
   *
   * Deliberately a shade warmer and a shade more saturated than the fight
   * that preceded it — not cheerful, but not the same grey either, because
   * something did in fact happen and the light is allowed to know it. This
   * is the only place in Acts 3 and 4 where the grade moves upward.
   */
  trentonAfter: {
    key: '#F2E6CA', fill: '#7E8492', haze: '#B8BAB8',
    sun: 1.35, contrast: 0.50, bloom: 0.34, saturation: 0.70,
  },

  /* --------------------------------------------------------------------
   * VALLEY FORGE, DECEMBER 1777 – JUNE 1778.
   *
   * THE ONLY ACT WHOSE LIGHT IS THE STORY.
   *
   * `docs/05` §5.1 sets it out: snow as bare paper, ink at its coldest and
   * thinnest, wash reserved for smoke and mud — and then, across the act,
   * the wash comes back. First the ochre of new-cut logs, then green.
   * `kAct = 0.60`: sixty per cent of what you are looking at is how far
   * into the winter you are, and forty per cent is what kind of leader you
   * have been. **The thaw happens for everyone**, which is the one mercy
   * this act contains and the reason it is in the light rather than in a
   * line of dialogue.
   *
   * The three states below are the same numbers walked in one direction:
   * saturation 0.34 → 0.52 → 0.86, contrast 0.34 → 0.44 → 0.58, and the key
   * from a grey-white nothing to actual sun. Nobody is told this is
   * happening. The whole point is that a student who plays the act straight
   * through feels the frame warm up and could not say when.
   *
   * AND THE FILLS ARE ALL LIGHT, WHICH IS THE PART THAT WAS WRONG FIRST.
   *
   * December was built with `fill: '#6E747C'` on the theory that the
   * worst winter of the war ought to be a dark frame. It is not: an
   * overcast December day is FLAT, not dark, and it is in fact very bright
   * — the light is coming off the whole sky at once. With a dark fill and
   * a contrast of 0.30 every surface was dragged three-quarters of the way
   * to the fill colour and the opening frame of the act came out as a night
   * scene with a mud floor, in which the two thousand huts the act is
   * about could not be seen at all.
   *
   * The misery in these frames is carried by the saturation, which is the
   * lowest of any daylight scene in the game, and by what is standing in
   * them. It is not carried by turning the lights off.
   * ------------------------------------------------------------------ */

  /**
   * Brigade Street in December. The bottom of the act and of the war.
   *
   * The lowest saturation of any daylight scene in the game — under the
   * Quarter's, which is the only other place the colour is taken out on
   * purpose. Here it is weather and hunger rather than a moral register,
   * and the difference is that this one comes back.
   */
  forgeDecember: {
    key: '#F0F2F2', fill: '#BEC3C8', haze: '#CFD3D6',
    sun: 1.15, contrast: 0.34, bloom: 0.20, saturation: 0.34,
  },
  /**
   * The Grand Parade in February. Mud, and a low sun that means it.
   *
   * The first frame in the act with any warmth in the key at all, and it
   * arrives on the day von Steuben walks onto the parade with a hundred
   * men — which is the correct day for the light to change, and is why
   * this state exists rather than a straight December-to-May cut.
   */
  forgeFebruary: {
    key: '#F6EFDC', fill: '#B2B4B0', haze: '#C4C6C0',
    sun: 1.05, contrast: 0.44, bloom: 0.26, saturation: 0.52,
  },
  /**
   * Brigade Street in May, and the *feu de joie*.
   *
   * The most saturated exterior in the first five acts, and every bit of it
   * is earned by the two states above. Yorktown will beat it; nothing
   * before it comes close.
   */
  forgeMay: {
    key: '#FFF6DA', fill: '#8EA274', haze: '#CBD8B4',
    sun: 0.85, contrast: 0.58, bloom: 0.40, saturation: 0.86,
  },
  /**
   * The Potts house: two rooms of stone, a fire, and a great many papers.
   *
   * Deliberately not the Vassall house. Cambridge headquarters was a
   * confiscated Tory mansion with a Palladian front; this is a small plain
   * ironmaster's dwelling that Washington rented for a hundred pounds of
   * Pennsylvania currency, and he did not move into it until the huts were
   * built because he had said he would not.
   */
  pottsHouse: {
    key: '#F0DCA8', fill: '#4A4C4A', haze: '#14161A',
    sun: -1.35, contrast: 0.74, bloom: 0.30, saturation: 0.72,
    exposure: 0.88,
  },
  /**
   * The hospital hut. One window-hole, twelve men, and a camera at eye
   * level rather than above it.
   *
   * `docs/05` §5.3 marks this scene `sensitive` and gives it R5's framing
   * without R5's grey wash. The light does that work: the exposure is the
   * lowest of any interior in the game and the one source is a fire that
   * is not enough, because the hut had one window-hole and a hearth at the
   * back and that is all the light there was.
   */
  hospitalHut: {
    key: '#E8B472', fill: '#2A2622', haze: '#0C0A08',
    sun: -1.10, contrast: 0.88, bloom: 0.22, saturation: 0.46,
    exposure: 0.62,
  },
};
