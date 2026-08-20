/**
 * The cast of Act 2, as sprite specifications.
 *
 * Same rule as Act 1: where the record gives us a garment we use it, and
 * where it does not we dress to station and say so in a comment rather than
 * inventing detail and letting it harden into fact by being drawn.
 *
 * There is one new problem here that Act 1 did not have. In July 1775 this
 * army has no uniform. Congress had not clothed it, the regiments came in
 * whatever their colonies had given them or whatever they owned, and the
 * hunting shirt — cheap, linen, and instantly legible at a distance — was the
 * nearest thing to a common garment the camp possessed. So the extras are
 * deliberately NOT a rank of blue coats. A student who looks down the camp
 * street should be able to count six different colours of man and understand
 * without being told that these are thirteen armies standing next to each
 * other, which is the whole difficulty of the act.
 */

import { actor, type ActorSpec } from '../engine/actors';
import { P } from '../palette';

/* ---------------------------------------------------------------------- *
 * The general officers
 * ---------------------------------------------------------------------- */

/**
 * Nathanael Greene. Thirty-three, a Rhode Island foundryman's son, lame in
 * one leg, expelled from his Quaker meeting for going to a military parade,
 * and the best administrator in the army by a distance nobody else is close
 * to. His Rhode Island regiments arrived at Cambridge better clothed, better
 * tented and better disciplined than anyone else's, and every contemporary
 * account of the camp says so.
 *
 * He gets a decent coat because his brigade could afford one. That is the
 * point being made.
 */
export const GREENE: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'cocked',
  hatBand: P.buffL,
  coat: P.blueD,
  facings: P.buff,
  waistcoat: P.linenL,
  breeches: P.linenL,
  stockings: P.linen,
  build: 1.06,
  tall: 1.01,
  age: 'adult',
  boots: true,
});

/**
 * Henry Knox. Twenty-five, a Boston bookseller, enormous — well over 250
 * pounds — and self-taught in artillery entirely out of the books in his own
 * shop. Two fingers of his left hand were gone from a fowling piece; the
 * sprite cannot show that at this size and no attempt is made to.
 *
 * `build: 1.22` is the largest figure in the game. It should be obvious in
 * the frame that the man proposing to drag sixty guns three hundred miles is
 * physically the size of a door.
 */
export const KNOX: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'round',
  coat: P.blueD,
  facings: P.scarlet,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenL,
  build: 1.22,
  tall: 1.02,
  age: 'young',
  boots: true,
});

/**
 * Horatio Gates. Adjutant General: a professional, English-born, twenty
 * years in the British service, and the only man at headquarters who has
 * actually run an army's paperwork before. He was competent, he was
 * indispensable in 1775, and within three years he will be the centre of the
 * one serious attempt to replace Washington.
 *
 * He is drawn as what he is in this act — the most experienced officer in
 * the room — and nothing in his sprite forecasts Conway or Camden. A
 * costume that telegraphs a betrayal three acts early is a lie about how it
 * felt at the time.
 */
export const GATES: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'tricorne',
  coat: P.blueD,
  facings: P.buffD,
  waistcoat: P.linen,
  breeches: P.linenD,
  stockings: P.linen,
  build: 1.04,
  tall: 0.96,
  age: 'old',
});

/**
 * Joseph Reed, military secretary. A Philadelphia lawyer, thirty-four,
 * educated at the Middle Temple, and for eight months the man who wrote what
 * Washington said. Dressed as a lawyer who has been put in a camp, because
 * that is exactly what he is: no facings, no sash, good cloth.
 */
export const REED: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'none',
  coat: P.brownD,
  waistcoat: P.linenL,
  breeches: P.blackD,
  stockings: P.linenL,
  build: 0.96,
  tall: 0.99,
  age: 'adult',
});

/**
 * Robert Hanson Harrison. Another secretary, an Alexandria lawyer, a
 * neighbour from home — Washington's own attorney before the war. He stayed
 * five years, which nobody else in that office did.
 */
export const HARRISON: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'none',
  coat: P.greenD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osna,
  build: 1.02,
  tall: 0.97,
  age: 'adult',
});

/**
 * William Prescott, who took a regiment up Breed's Hill in June with
 * entrenching tools and held it through three assaults on the powder the men
 * carried up with them. A Massachusetts farmer of fifty, and he wore a
 * banyan and a broad hat on the hill because it was hot, which every account
 * of that day mentions and which is why he is not in regimentals here.
 */
export const PRESCOTT: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'short',
  hat: 'round',
  coat: P.greenD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.08,
  tall: 1.02,
  age: 'old',
  boots: true,
});

/**
 * Amos Doolittle, of New Haven: an engraver, a member of the Governor's
 * Second Company of Guards, and the man who walked the ground at Lexington
 * and Concord with Ralph Earl and cut four plates of what he found.
 *
 * VERIFY BEFORE CLASSROOM USE (carried forward from the old CB-03 file,
 * unchanged, because it has not been resolved): Doolittle marched to
 * Cambridge after Lexington and published the four engravings in December
 * 1775. That he was on the lines in November is a compression. Either date
 * it, cut him, or find the evidence.
 */
export const DOOLITTLE: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'round',
  coat: P.brownD,
  waistcoat: P.buffD,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 0.94,
  tall: 0.96,
  age: 'young',
});

/* ---------------------------------------------------------------------- *
 * The ranks
 * ---------------------------------------------------------------------- */

/**
 * Bragg: a Virginia rifleman, one of Daniel Morgan's, arrived at Cambridge
 * in July after marching six hundred miles in three weeks.
 *
 * The hunting shirt is the point. It was fringed linen, dyed with walnut
 * hull, cheap and quick to make, and Washington eventually recommended it to
 * the whole army precisely because it cost nothing and frightened people.
 * The riflemen were also the worst-disciplined men in the camp, which the
 * dialogue handles and the sprite does not need to.
 */
export const BRAGG: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'long',
  hat: 'round',
  coat: P.osnaD,
  facings: P.brownD,
  waistcoat: P.osna,
  breeches: P.brownD,
  stockings: P.osnaD,
  accent: '#7E8A46',
  build: 1.04,
  tall: 1.03,
  age: 'young',
  boots: true,
});

/**
 * Benjamin Whitcomb, of New Hampshire. A scout, later a ranger captain, and
 * an unusually plain speaker in a camp full of men explaining themselves.
 */
export const WHITCOMB: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBlack,
  hairStyle: 'short',
  hat: 'cap',
  coat: P.greenD,
  waistcoat: P.osnaD,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 0.98,
  tall: 1.00,
  age: 'adult',
  boots: true,
});

/**
 * Sergeant Starr, of Connecticut. INVENTED, and the file says so plainly.
 *
 * The situation is not invented: the Connecticut regiments' terms ran out in
 * early December 1775 and a large part of them went home over the appeals of
 * Washington and of their own officers. He is a name put on a thing that
 * happened to eleven hundred men, which is the one kind of invention this
 * project allows and only when it is labelled.
 */
export const STARR: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'round',
  coat: P.osnaD,
  facings: P.wineD,
  waistcoat: P.osnaL,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 1.00,
  tall: 0.99,
  age: 'adult',
});

/**
 * Salem Poor, of Andover.
 *
 * WITNESS REGISTER. R5 material; the §7.6 pedagogical sign-off gate applies
 * to him as it does to the Mount Vernon three, and it has NOT been given.
 *
 * He is documented and the documentation is extraordinary: born enslaved,
 * bought his own freedom in 1769 for twenty-seven pounds — about a year's
 * wages for a working man — enlisted, fought at Bunker Hill, and in December
 * 1775 fourteen officers including Prescott petitioned the Massachusetts
 * legislature that he had "behaved like an experienced officer as well as an
 * excellent soldier" and asked that he be rewarded. The petition survives.
 * The reward does not appear to have come.
 *
 * He is in this act because A2-D3 is about men exactly like him and the
 * decision is unreadable if the student has not met one. He is not a
 * quest-giver, he grants nothing, and he asks the player for nothing —
 * §6.3 applies to him in full.
 */
export const SALEM_POOR: ActorSpec = actor({
  skin: 'c',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'round',
  coat: P.brownD,
  facings: P.osnaL,
  waistcoat: P.osnaL,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 1.02,
  tall: 1.00,
  age: 'adult',
  boots: true,
});

/**
 * William Lee, in the field.
 *
 * The same man as Act 1 and deliberately the same sprite build, but the
 * livery is gone: on campaign he is dressed as what he is doing rather than
 * as whose household he belongs to. He rode with Washington for eight years,
 * through every campaign, and he is the only person Washington's will frees
 * outright and immediately, with a pension of thirty dollars a year.
 *
 * REVIEW GATE: R5. Sign-off requirement carried from Act 1, still owing.
 */
export const BILLY_FIELD: ActorSpec = actor({
  skin: 'c',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'round',
  coat: P.brownD,
  waistcoat: P.buffD,
  breeches: P.buffD,
  stockings: P.osna,
  build: 0.99,
  tall: 1.00,
  age: 'young',
  boots: true,
});

/* ---------------------------------------------------------------------- *
 * The camp at large
 * ---------------------------------------------------------------------- */

/** A New England private. Whatever his town could put on his back. */
export const PRIVATE_NE: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'round',
  coat: P.brownD,
  waistcoat: P.osnaL,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 1.00,
  tall: 0.98,
  age: 'young',
});

/** A rifleman, in the fringed shirt the whole army will end up copying. */
export const RIFLEMAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBlack,
  hairStyle: 'long',
  hat: 'round',
  coat: P.osnaD,
  facings: P.brownD,
  waistcoat: P.osna,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.02,
  tall: 1.02,
  age: 'young',
  boots: true,
});

/**
 * A woman of the camp.
 *
 * The army had women with it from the first summer — wives, widows, and the
 * washing and nursing establishment without which nobody's shirt got clean
 * and nobody's wound got dressed. They were on the rations, at half a man's
 * allowance, which is a documented fact and a better one than any adjective.
 *
 * NOTE ON A CUT: docs/05 lists Sarah Osborn among the camp people. She is not
 * here, and should not be added back. Her account is one of the best first-
 * person sources for the Revolution and she was not with the army until
 * about 1780 — five years after this scene. The old build caught this and cut
 * her; the cut stands.
 */
export const CAMP_WOMAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'bun',
  hat: 'none',
  cap: true,
  coat: P.osnaD,
  gown: P.osnaD,
  apron: P.linenD,
  build: 0.98,
  tall: 0.87,
  age: 'adult',
});

/** A boy on the drum. The army was full of them and most were about fourteen. */
export const DRUMMER: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'cap',
  coat: P.wineD,
  facings: P.buffL,
  waistcoat: P.osnaL,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 0.86,
  tall: 0.78,
  age: 'child',
});

/** A sentry, at the headquarters gate. */
export const SENTRY: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBlack,
  hairStyle: 'queue',
  hat: 'tricorne',
  coat: P.blueD,
  facings: P.linenL,
  waistcoat: P.linenL,
  breeches: P.linenD,
  stockings: P.linen,
  build: 1.02,
  tall: 1.01,
  age: 'young',
});

/* ---------------------------------------------------------------------- *
 * Registry
 * ---------------------------------------------------------------------- */

/** Added to `CAST` in people.ts, so `portraitOf` finds them. */
export const ACT2_CAST: Record<string, ActorSpec> = {
  greene: GREENE,
  knox: KNOX,
  gates: GATES,
  reed: REED,
  harrison: HARRISON,
  prescott: PRESCOTT,
  doolittle: DOOLITTLE,
  bragg: BRAGG,
  whitcomb: WHITCOMB,
  starr: STARR,
  salem: SALEM_POOR,
  billyfield: BILLY_FIELD,
  privateNe: PRIVATE_NE,
  rifleman: RIFLEMAN,
  campwoman: CAMP_WOMAN,
  drummer: DRUMMER,
  sentry: SENTRY,
};

/** Speaker names as they appear in dialogue, mapped to their portrait key. */
export const ACT2_SPEAKERS: Record<string, string> = {
  'Nathanael Greene': 'greene',
  'General Greene': 'greene',
  'Henry Knox': 'knox',
  'Horatio Gates': 'gates',
  'General Gates': 'gates',
  'Joseph Reed': 'reed',
  'Robert Harrison': 'harrison',
  'William Prescott': 'prescott',
  'Colonel Prescott': 'prescott',
  'Amos Doolittle': 'doolittle',
  'Bragg': 'bragg',
  'Whitcomb': 'whitcomb',
  'Sergeant Starr': 'starr',
  'Salem Poor': 'salem',
  'A woman of the camp': 'campwoman',
  'A drummer': 'drummer',
  'The sentry': 'sentry',
};
