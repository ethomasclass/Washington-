/**
 * The cast of Act 1, as sprite specifications.
 *
 * Every person is documented, and where the record gives us a garment we use
 * it. Where it does not, we dress to station and say so in a comment rather
 * than inventing detail and letting it harden into fact by being drawn.
 *
 * The three people in the Quarter carry `sensitive: true` on their NPC
 * definitions and are subject to the pedagogical sign-off gate. Their sprites
 * are drawn with exactly the care everyone else's are, at the same size, with
 * the same number of colours. That is not a courtesy; a Witness Register whose
 * people are drawn worse than the gentry is an argument, and the wrong one.
 */

import { actor, portrait, type ActorSpec, type Mood } from '../engine/actors';
import { P } from '../palette';
import { ACT2_CAST, ACT2_SPEAKERS } from './act2-people';
import { ACT3_CAST, ACT3_SPEAKERS } from './act3-people';
import { ACT4_CAST, ACT4_SPEAKERS } from './act4-people';
import { ACT5_CAST, ACT5_SPEAKERS } from './act5-people';

/* ---------------------------------------------------------------------- *
 * The man himself
 * ---------------------------------------------------------------------- */

/**
 * Washington, May 1775. Forty-three, six foot two, and the tallest thing in
 * any frame he stands in — `tall: 1.06` is doing that, and it is deliberate:
 * every contemporary description of him leads with his size.
 *
 * Bareheaded is wrong for a Virginia gentleman outdoors in May, and it was a
 * known fault of the old build. He gets the hat.
 */
export const WASHINGTON: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'tricorne',
  coat: P.brownD,
  facings: P.buffD,
  waistcoat: P.linen,
  breeches: P.linenD,
  stockings: P.linenL,
  build: 1.02,
  tall: 1.06,
  age: 'adult',
  boots: true,
});

/** The same man in the blue-and-buff, for the moment the act turns on. */
export const WASHINGTON_REGIMENTALS: ActorSpec = actor({
  ...WASHINGTON,
  coat: P.blueD,
  facings: P.buff,
  waistcoat: P.buffL,
  breeches: P.buffL,
  sash: P.scarlet,
  hat: 'cocked',
  hatBand: P.buff,
});

/* ---------------------------------------------------------------------- *
 * The household
 * ---------------------------------------------------------------------- */

/**
 * Martha. A little under five feet against a husband of six foot two, and the
 * difference should be visible in the frame — `tall: 0.82` against his 1.06.
 * The white linen cap is in every portrait of her. She was the wealthiest
 * widow in Virginia and dressed like someone with nothing left to prove.
 */
export const MARTHA: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'bun',
  hat: 'none',
  cap: true,
  coat: P.wineD,
  gown: P.wineD,
  waistcoat: P.linenL,
  build: 0.94,
  tall: 0.82,
  age: 'adult',
});

/**
 * Lund Washington: a cousin, the estate manager, and the man who will run this
 * place for eight years on his own credit. Dressed as what he is — a working
 * gentleman farmer, not a servant and not quality.
 */
export const LUND: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'round',
  coat: P.brownD,
  waistcoat: P.osnaL,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 1.10,
  tall: 0.97,
  age: 'adult',
  boots: true,
});

/** Jenkins, of the Alexandria post. Two days on the road and it shows. */
export const JENKINS: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBlack,
  hairStyle: 'short',
  hat: 'tricorne',
  coat: P.greenD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 0.94,
  tall: 0.99,
  age: 'young',
  boots: true,
});

/**
 * William Lee, in the Mount Vernon livery: white faced scarlet, which are the
 * Washington arms. The coat says whose household he belongs to before it says
 * anything at all about him, and that is precisely the fact the scene is about.
 *
 * He goes to the war. He is at Washington's side for eight years, he is in
 * every campaign, and he is the only person Washington's will frees outright.
 * REVIEW GATE: R5 material. Sign-off recorded in the scene file.
 */
export const BILLY_LEE: ActorSpec = actor({
  skin: 'c',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'round',
  coat: P.linen,
  facings: P.scarlet,
  waistcoat: P.linenL,
  breeches: P.linenD,
  stockings: P.linenL,
  build: 0.99,
  tall: 1.00,
  age: 'young',
});

/**
 * Frank Lee, William's brother. Bought with him from the Mary Lee estate in
 * 1768. Head butler at the Mansion House: one brother goes to the war and one
 * does not, and neither of them chose.
 */
export const FRANK_LEE: ActorSpec = actor({
  skin: 'c',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'none',
  coat: P.linen,
  facings: P.scarlet,
  waistcoat: P.linenL,
  breeches: P.linenD,
  stockings: P.linenL,
  build: 1.02,
  tall: 0.99,
  age: 'adult',
});

/**
 * Doll, cook at the Mansion House, at Mount Vernon since 1759. Osnaburg —
 * the issue cloth, bought by the yard against an invoice the player can read.
 * The blue glass bead at her throat is hers, and the Quarter's colour grade
 * lets it through when it lets nothing else through.
 */
export const DOLL: ActorSpec = actor({
  skin: 'd',
  hair: P.hairBlack,
  hairStyle: 'bun',
  hat: 'kerchief',
  coat: P.osnaD,
  gown: P.osnaD,
  apron: P.osnaL,
  accent: '#4E7FA8',
  build: 1.00,
  tall: 0.88,
  age: 'adult',
});

/**
 * Harry. Stable hand, purchased 1763, worked the Dismal Swamp survey.
 *
 * He is the most important person in this game and the student will not find
 * that out for eight acts. In 1776 he leaves for Dunmore's lines. He serves as
 * a corporal in the Black Pioneers. His name is written into the Book of
 * Negroes in 1783 and he sails for Nova Scotia, then in 1792 for Sierra Leone,
 * and in 1800 he takes up arms against the company governing it and is exiled.
 *
 * Nothing in Act 1 hints at any of it. He is a man by a stable with a copper
 * ring, and the copper ring is the only saturated thing in the frame.
 */
export const HARRY: ActorSpec = actor({
  skin: 'd',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'none',
  coat: P.osnaD,
  waistcoat: P.osna,
  breeches: P.osnaD,
  stockings: P.osnaL,
  accent: '#B87333',
  build: 1.04,
  tall: 1.01,
  age: 'young',
});

/** Simms, who runs the boat down to the ferry and back. */
export const SIMMS: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'short',
  hat: 'straw',
  coat: P.blueD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.08,
  tall: 0.94,
  age: 'old',
});

/** Goin Lanphier's joiners, on the north wing. Two of them, varied by seed. */
export const JOINER: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'cap',
  coat: P.osnaD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osna,
  build: 1.06,
  tall: 1.00,
  age: 'adult',
});

export const HOUSEMAID: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'bun',
  cap: true,
  hat: 'none',
  coat: P.osnaD,
  gown: P.osnaD,
  apron: P.linenL,
  build: 0.95,
  tall: 0.88,
  age: 'young',
});

/* ---------------------------------------------------------------------- *
 * Portraits
 * ---------------------------------------------------------------------- */

export const CAST: Record<string, ActorSpec> = {
  washington: WASHINGTON,
  regimentals: WASHINGTON_REGIMENTALS,
  martha: MARTHA,
  lund: LUND,
  jenkins: JENKINS,
  billy: BILLY_LEE,
  frank: FRANK_LEE,
  doll: DOLL,
  harry: HARRY,
  simms: SIMMS,
  joiner: JOINER,
  maid: HOUSEMAID,
  ...ACT2_CAST,
  ...ACT3_CAST,
  ...ACT4_CAST,
  ...ACT5_CAST,
};

/** Speaker names as they appear in dialogue, mapped to their portrait key. */
export const SPEAKER_KEY: Record<string, string> = {
  'Martha': 'martha',
  'Lund Washington': 'lund',
  'Lund': 'lund',
  'Jenkins': 'jenkins',
  'Congress messenger': 'jenkins',
  'William Lee': 'billy',
  'Frank Lee': 'frank',
  'Doll': 'doll',
  'Harry': 'harry',
  'Simms': 'simms',
  'A joiner': 'joiner',
  ...ACT2_SPEAKERS,
  ...ACT3_SPEAKERS,
  ...ACT4_SPEAKERS,
  ...ACT5_SPEAKERS,
};

const PORTRAITS = new Map<string, string>();

/** Portrait as a data URL, generated once. */
export function portraitOf(key: string, mood: Mood = 'neutral'): string | null {
  const spec = CAST[key] ?? CAST[SPEAKER_KEY[key] ?? ''];
  if (!spec) return null;
  const id = `${key}:${mood}`;
  let hit = PORTRAITS.get(id);
  if (!hit) {
    hit = portrait(spec, mood).canvas.toDataURL();
    PORTRAITS.set(id, hit);
  }
  return hit;
}
