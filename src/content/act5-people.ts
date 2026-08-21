/**
 * The cast of Act 5 — Valley Forge, December 1777 to June 1778.
 *
 * TWO ARMIES IN ONE CAMP, FOUR MONTHS APART.
 *
 * In December these people are what Act 4's people became: the same men,
 * two winters further in, and worse off. Waldo's diary for 14 December
 * 1777 — "I am Sick — discontented — and out of humour. Poor food — hard
 * lodging — Cold Weather — fatigue — Nasty Cloaths — nasty Cookery" — is
 * the tone of the December cast and it is not exaggeration for effect.
 *
 * In May the same sprites are standing on green grass in a finished town,
 * and one company of them can move as a unit. Nothing about the *people*
 * changes; the light changes and what they can do changes. That is the
 * act, and the cast is built so the difference cannot be attributed to a
 * costume swap.
 *
 * WHO IS AND IS NOT HERE
 *
 * **Sarah Osborn is here, and this is the first act she belongs in.** She
 * was cut from Acts 2 and 3 — `docs/05` lists her at Cambridge in 1775 and
 * at Brooklyn in 1776 and she was at neither; her own 1837 pension
 * deposition (W.4558) puts her with the army from about 1780 and at
 * Yorktown in 1781. Placing her at Valley Forge in 1778 is still two years
 * early and so she is NOT drawn as Sarah Osborn: she is *a laundress of the
 * Pennsylvania line*, unnamed, doing documented work — women drew a ration
 * and were carried on the returns — and the Osborn name is held for Act 6,
 * where it is hers by right. `V-A5.1`.
 *
 * **Horatio Gates is not here either, and his absence is the point.** He is
 * at York with Congress, as President of the new Board of War, senior to
 * the man whose army this is. Every word of him in this act arrives on
 * paper. The player met him at Cambridge in Act 2, warm and competent and
 * useful, which is why this hurts.
 *
 * **Conway appears in person exactly once.** He rode into camp, professed
 * complete loyalty to Washington's face, and left. `DOC-A5.3` is what he is
 * reported to have written. Neither is marked true.
 */

import { actor, type ActorSpec } from '../engine/actors';
import { P } from '../palette';

/* ---------------------------------------------------------------------- *
 * The army
 * ---------------------------------------------------------------------- */

/**
 * Private Joseph Plumb Martin, of Connecticut, now seventeen.
 *
 * Carried forward from Act 4 with one change: he is a year older and the
 * sprite is a shade taller. His 1830 narrative is the source for most of
 * what an enlisted man at Valley Forge actually ate, and the sentence
 * everybody quotes from it — that he made his fire cake by mixing flour
 * and water on a flat stone — is in this act as an object rather than as
 * a caption.
 */
export const MARTIN_VF: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'round',
  coat: P.brownD,
  waistcoat: P.osnaD,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 0.92,
  tall: 0.90,
  age: 'child',
});

/**
 * Dr. Albigence Waldo, surgeon of the 1st Connecticut.
 *
 * His diary is the source everyone quotes and it is worth being precise
 * about why: he was there, he wrote daily, and he was a doctor, so his
 * account of what was wrong with the men is technical rather than
 * literary. He is also, in the middle of it, capable of writing that the
 * men bear their hardships "with the most heroic patience" — which the
 * desertion return standing four tiles away flatly contradicts. Both are
 * his camp. That is `C4`, and it is the contradiction this scene is built
 * around.
 */
export const WALDO: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'cocked',
  coat: P.brownD,
  facings: P.greenD,
  waistcoat: P.osnaL,
  breeches: P.osnaD,
  stockings: P.osna,
  accent: P.linen,
  build: 0.98,
  tall: 1.00,
  age: 'adult',
});

/**
 * Dr. John Cochran, physician and surgeon-general of the middle department.
 *
 * He ran the inoculation. Washington had ordered the army variolated in
 * early 1777 — in secret, by regiment, so the enemy would not learn that a
 * third of the army was unfit at any given moment — and it continued
 * through this winter. It is the most consequential public-health decision
 * of the war and almost nobody has heard of it.
 */
export const COCHRAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'none',
  coat: P.blueD,
  facings: P.buffD,
  waistcoat: P.linen,
  breeches: P.osnaL,
  stockings: P.osnaL,
  build: 1.02,
  tall: 1.00,
  age: 'old',
});

/**
 * Baron von Steuben — and the title is the first thing to be honest about.
 *
 * He was Friedrich Wilhelm von Steuben, a competent Prussian staff captain
 * who had been out of work for years. The rank of lieutenant-general and
 * the "Baron" were, at best, generously rounded up by Beaumarchais and
 * Franklin in Paris to get him hired. He then proceeded to be worth every
 * inch of the exaggeration, which is a more interesting fact than either
 * the myth or the debunking.
 *
 * He is drawn conspicuously well-dressed, because he was: he arrived with
 * a large dog, a French chef, an aide, and the star of a Prussian order on
 * his coat, into a camp where two men in five had no shoes.
 */
export const STEUBEN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'cocked',
  coat: P.blueD,
  facings: P.buffL,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linen,
  accent: P.brassL,
  sash: P.scarlet,
  boots: true,
  build: 1.14,
  tall: 1.02,
  age: 'adult',
});

/**
 * Captain Benjamin Walker, who could swear in German.
 *
 * `R23` — sourced humour — rests on him. Von Steuben, having exhausted his
 * French and German profanity on a Virginia regiment that would not dress
 * its line, called across the parade: *"Viens, mon ami Walker, and swear
 * for me in English — these fellows won't do what I bid them."* It is
 * documented, it is genuinely funny, and it is also the exact moment the
 * army starts working, which is why it is in the game and not in a
 * footnote.
 */
export const WALKER: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'cocked',
  coat: P.blueD,
  facings: P.buffD,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linen,
  build: 0.98,
  tall: 1.00,
  age: 'adult',
});

/**
 * Alexander Hamilton, aide-de-camp, twenty-three, and writing most of it.
 *
 * The family of aides did the correspondence, and Hamilton did more of it
 * than anybody. He is in this act because the Cabal ran on letters and
 * because the person who read them first was him.
 */
export const HAMILTON_VF: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'cocked',
  coat: P.blueD,
  facings: P.buffL,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linen,
  build: 0.90,
  tall: 0.94,
  age: 'adult',
});

/**
 * Thomas Conway, inspector general, in person and exactly once.
 *
 * An Irish-born officer of the French service, promoted over the heads of
 * twenty-three American brigadiers by a Congress that had never seen him
 * command anything. He came into camp, was received, professed his
 * complete devotion, and rode away. What he is reported to have written to
 * Gates is in `DOC-A5.3` and the game does not tell you whether he wrote
 * it, because nobody knows.
 */
export const CONWAY: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBlack,
  hairStyle: 'queue',
  hat: 'cocked',
  coat: P.blueD,
  facings: P.scarlet,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linen,
  accent: P.brassL,
  build: 1.00,
  tall: 1.02,
  age: 'adult',
});

/**
 * Francis Dana, of the Committee at Camp.
 *
 * Congress sent five men to the camp in January to find out what was
 * wrong. They stayed three months, saw it, wrote it down accurately, and
 * could not fix it — because supply depended on the states requisitioning
 * and the states would not. That is the shape of `A5-D4`: the honest
 * option works, and works late and marginally, and the game does not
 * pretend otherwise.
 */
export const DANA: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'tricorne',
  coat: P.brownD,
  waistcoat: P.linen,
  breeches: P.brownD,
  stockings: P.osnaL,
  build: 1.06,
  tall: 0.98,
  age: 'old',
});

/**
 * A soldier of the 1st Rhode Island.
 *
 * TWO FACTS, BOTH TRUE, AND THE SECOND IS THE ONE NOBODY IS TOLD.
 *
 * The first: in February 1778 the Rhode Island Assembly authorised the
 * reorganisation of the 1st Rhode Island to enlist enslaved and free Black
 * men and Narragansett men, with freedom for those who served and
 * compensation to their owners. It happens in this act, in this winter,
 * and it produced a regiment of roughly two hundred Black soldiers.
 *
 * The second: it was the EXCEPTION. Most Black soldiers in the Continental
 * Army served in ordinary integrated regiments alongside white soldiers,
 * scattered a few to a company across the whole line — which is why the
 * camp crowd in this act contains integrated files and why the man of the
 * 1st is one man rather than a set. A student who leaves with only the
 * first fact leaves believing Black service was segregated and unusual,
 * and it was neither.
 *
 * `sensitive` in the Witness Register sense, and behind the same §7.6 gate
 * as everything else in it.
 */
export const RHODE_ISLANDER: ActorSpec = actor({
  skin: 'c',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'cocked',
  coat: P.brownD,
  facings: P.buffD,
  waistcoat: P.osnaD,
  breeches: P.osnaD,
  stockings: P.osna,
  accent: P.linen,
  build: 1.02,
  tall: 1.00,
  age: 'adult',
});

/**
 * A laundress of the Pennsylvania line. Unnamed, and see the header.
 *
 * Women were on the returns and drew rations — half a ration, generally,
 * and a quarter for a child — and the army could not have washed, nursed
 * or cooked without them. She is here doing that, and she is not called
 * Sarah Osborn, because Sarah Osborn was not here.
 */
export const LAUNDRESS: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'long',
  hat: 'none',
  cap: true,
  coat: P.osnaD,
  gown: P.brownD,
  apron: P.linen,
  build: 0.96,
  tall: 0.94,
  age: 'adult',
});

/** A private of the line in December: whatever he owns, and no shoes. */
export const HUTTING_PRIVATE: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'none',
  coat: P.osnaD,
  waistcoat: P.osnaD,
  breeches: P.osnaD,
  stockings: P.canvasD,
  build: 0.94,
  tall: 0.96,
  age: 'adult',
});

/**
 * A sick man of the Virginia line, in the hospital hut.
 *
 * `A5-D1` is decided in front of him. Three of the four men named in that
 * hut die in this act on every branch, because two thousand men died at
 * Valley Forge on every branch and the inoculation decision changes the
 * cause of death of some of them and not the number.
 */
export const SICK_MAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'long',
  hat: 'none',
  coat: P.canvasD,
  waistcoat: P.osnaD,
  breeches: P.osnaD,
  stockings: P.canvasD,
  build: 0.84,
  tall: 0.96,
  age: 'adult',
});

/** William Lee, who is here as he is everywhere, and is still not paid. */
export const BILLY_VF: ActorSpec = actor({
  skin: 'b',
  hair: P.hairBlack,
  hairStyle: 'queue',
  hat: 'round',
  coat: P.brownD,
  facings: P.buffL,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osnaL,
  accent: P.linen,
  build: 1.00,
  tall: 1.00,
  age: 'adult',
});

/* ---------------------------------------------------------------------- *
 * Registry
 * ---------------------------------------------------------------------- */

export const ACT5_CAST: Record<string, ActorSpec> = {
  martinVF: MARTIN_VF,
  waldo: WALDO,
  cochran: COCHRAN,
  steuben: STEUBEN,
  walker: WALKER,
  hamiltonVF: HAMILTON_VF,
  conway: CONWAY,
  dana: DANA,
  rhodeIsland: RHODE_ISLANDER,
  laundress: LAUNDRESS,
  hutting: HUTTING_PRIVATE,
  sickMan: SICK_MAN,
  billyVF: BILLY_VF,
};

export const ACT5_SPEAKERS: Record<string, string> = {
  'Dr. Waldo': 'waldo',
  'Dr. Cochran': 'cochran',
  'Baron von Steuben': 'steuben',
  'Captain Walker': 'walker',
  'General Conway': 'conway',
  'Francis Dana': 'dana',
  'A soldier of the 1st Rhode Island': 'rhodeIsland',
  'A laundress': 'laundress',
  'A man of the hutting party': 'hutting',
  'A sick man': 'sickMan',
};
