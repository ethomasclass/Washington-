/**
 * The cast of Act 4.
 *
 * This is the worst-dressed army in the game and that is the point. On 25
 * December 1776 the Continental Army has been beaten out of New York, chased
 * across New Jersey, and reduced by expiry, capture and desertion to about
 * two and a half thousand men fit for duty. Congress has left Philadelphia.
 * Nothing that could be replaced has been. The extras here are shorter, older
 * and dirtier than Brooklyn's, wear whatever they have, and several of them
 * have rag on their feet instead of shoes — which is documented, repeatedly,
 * and is not an exaggeration for effect.
 *
 * And on the far side of the river there is a Hessian garrison in matching
 * blue coats with brass-fronted mitre caps, and the contrast is the whole of
 * why the twenty-sixth of December mattered.
 */

import { actor, type ActorSpec } from '../engine/actors';
import { P } from '../palette';

/* ---------------------------------------------------------------------- *
 * The army
 * ---------------------------------------------------------------------- */

/**
 * Private Joseph Plumb Martin, of Connecticut. Sixteen years old.
 *
 * He enlisted in 1776 at fifteen, served to the end of the war, and in 1830
 * published a memoir — *A Narrative of Some of the Adventures, Dangers and
 * Sufferings of a Revolutionary Soldier* — which is by a distance the best
 * enlisted man's account of this war that exists. He is funny, he is exact
 * about food and feet, and he is entirely unimpressed by generals.
 *
 * He is introduced here and carried to Act 5 and Act 7. `age: 'child'` and
 * `tall: 0.86`: he is sixteen and the sprite should say so before he does.
 */
export const MARTIN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'round',
  coat: P.brownD,
  waistcoat: P.osnaD,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 0.88,
  tall: 0.86,
  age: 'child',
});

/**
 * Sergeant William Young, of Pennsylvania, whose diary records the weather
 * on the night of the crossing and very little else, which is exactly what a
 * sergeant's diary is for and exactly why it is useful.
 */
export const YOUNG: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'tricorne',
  coat: P.brownD,
  facings: P.buffD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.04,
  tall: 0.98,
  age: 'adult',
});

/**
 * John Honeyman — GENUINELY CONTESTED, and the game says so.
 *
 * The story is that Honeyman was a weaver and cattle dealer at Griggstown
 * who spied for Washington inside Trenton, was arrested as a Tory, escaped
 * on a conveniently unlocked door, and brought back the intelligence that
 * the garrison was at ease. It is a good story.
 *
 * It rests almost entirely on an account published by his grandson in 1873,
 * ninety-seven years afterwards, in a magazine. There is no contemporary
 * document. Serious historians divide on it and several think it is family
 * legend.
 *
 * So he is in the game, he says what the story says he said, and the object
 * that carries him is dated 1873 on its face. The player is given a
 * contradiction — his account against the Hessian picket order — and neither
 * is marked true. That is the honest way to keep a contested figure.
 */
export const HONEYMAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'short',
  hat: 'round',
  coat: P.greenD,
  waistcoat: P.osnaD,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.06,
  tall: 0.96,
  age: 'old',
  boots: true,
});

/** A private of the Pennsylvania line, with rag on his feet. */
export const RAGGED_PRIVATE: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'long',
  hat: 'none',
  coat: P.brownD,
  waistcoat: P.osnaD,
  breeches: P.osnaD,
  stockings: P.linenD,
  build: 0.96,
  tall: 0.97,
  age: 'young',
});

/** A Virginia man of the remnant, in a hunting shirt gone the colour of mud. */
export const VIRGINIA_REMNANT: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBlack,
  hairStyle: 'long',
  hat: 'round',
  coat: P.osnaD,
  facings: P.brownD,
  waistcoat: P.osna,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.00,
  tall: 1.01,
  age: 'adult',
});

/**
 * A Black soldier of the Continental line.
 *
 * WITNESS REGISTER — R5, §7.6 sign-off required, drafted and NOT approved.
 *
 * By the end of 1776 the bar of the previous December has been quietly
 * abandoned in practice: the army needs men, the states are filling quotas
 * however they can, and free Black soldiers are serving in the Continental
 * regiments in numbers that will keep rising until Rhode Island raises a
 * whole regiment in 1778. Two of Glover's Marbleheaders are in the boats
 * tonight for the second time in four months.
 *
 * He is not a quest-giver, he grants nothing, and he asks the player for
 * nothing. §6.3 applies in full.
 */
export const CONTINENTAL_BLACK: ActorSpec = actor({
  skin: 'c',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'round',
  coat: P.brownD,
  facings: P.osnaL,
  waistcoat: P.osnaD,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 1.00,
  tall: 0.99,
  age: 'adult',
});

/* ---------------------------------------------------------------------- *
 * The other side
 * ---------------------------------------------------------------------- */

/**
 * Colonel Johann Rall, commanding at Trenton.
 *
 * The "drunk Hessians" story is a myth and this game kills it. Rall was a
 * career soldier of thirty years' service who had stormed a redoubt at White
 * Plains; his brigade had been on constant alert for a week; he doubled his
 * guards on the twenty-fourth; and he had asked twice for a redoubt to be
 * built at the head of the town and been refused by his superiors. What he
 * did not do was patrol far enough out, and what nobody did was expect an
 * attack across a river running ice in a blizzard.
 *
 * He was shot on the twenty-sixth in an orchard behind the town and died the
 * next day in the Methodist church.
 */
export const RALL: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'cocked',
  hatBand: P.brassL,
  coat: P.hessianD,
  facings: P.scarlet,
  sash: P.buffL,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenL,
  build: 1.06,
  tall: 1.00,
  age: 'old',
  boots: true,
});

/**
 * A Hessian grenadier. Blue coat, brass-fronted mitre cap, and a bayonet on
 * the barrel — which is three things at once that this army cannot match,
 * and all three are visible in the sprite at thirty pixels.
 */
export const HESSIAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'cap',
  hatBand: P.brassL,
  coat: P.hessianD,
  facings: P.scarlet,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenL,
  build: 1.04,
  tall: 1.01,
  age: 'adult',
  boots: true,
});

/** A Hessian, taken. The cap is off and it is under his arm. */
export const HESSIAN_PRISONER: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'none',
  coat: P.hessianD,
  facings: P.scarlet,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenD,
  build: 1.02,
  tall: 0.99,
  age: 'young',
  boots: true,
});

/* ---------------------------------------------------------------------- *
 * Registry
 * ---------------------------------------------------------------------- */

export const ACT4_CAST: Record<string, ActorSpec> = {
  martin: MARTIN,
  young: YOUNG,
  honeyman: HONEYMAN,
  ragged: RAGGED_PRIVATE,
  virginia: VIRGINIA_REMNANT,
  continentalB: CONTINENTAL_BLACK,
  rall: RALL,
  hessian: HESSIAN,
  hessianPrisoner: HESSIAN_PRISONER,
};

export const ACT4_SPEAKERS: Record<string, string> = {
  'Joseph Plumb Martin': 'martin',
  'Sergeant Young': 'young',
  'John Honeyman': 'honeyman',
  'A Pennsylvania private': 'ragged',
  'A Virginia man': 'virginia',
  'A soldier of the line': 'continentalB',
  'Colonel Rall': 'rall',
  'A Hessian': 'hessianPrisoner',
};
