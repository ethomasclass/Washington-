/**
 * The cast of Act 3, as sprite specifications.
 *
 * Two of these people are captured on 27 August and the player meets them
 * both on the morning of the 26th. Nothing in their sprites forecasts it and
 * nothing should: a costume that telegraphs a man's capture the day before it
 * happens is a lie about how the morning felt, and the whole argument of this
 * act is that you cannot tell in advance.
 *
 * By August 1776 the army is beginning to look like an army. Congress voted
 * clothing; the hunting shirt is now something Washington RECOMMENDS rather
 * than something men happen to own; and there are regiments — Smallwood's
 * Marylanders above all — turned out in matching coats at their own colony's
 * expense. So the extras here are less ragged than Cambridge's and that is a
 * fact about the year, not a graphical upgrade.
 */

import { actor, type ActorSpec } from '../engine/actors';
import { P } from '../palette';

/* ---------------------------------------------------------------------- *
 * The generals
 * ---------------------------------------------------------------------- */

/**
 * Major General John Sullivan. A New Hampshire lawyer, thirty-six, brave,
 * touchy, and convinced almost every year of the war that he has been
 * slighted. He commands on the Brooklyn line when the Jamaica Pass is turned
 * behind him and is taken prisoner on 27 August.
 *
 * He is drawn as what he is on the 26th: a major general in a good coat who
 * believes the line is held.
 */
export const SULLIVAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'cocked',
  hatBand: P.buffL,
  coat: P.blueD,
  facings: P.buff,
  sash: P.wineD,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenL,
  build: 1.04,
  tall: 1.01,
  age: 'adult',
  boots: true,
});

/**
 * Brigadier General William Alexander, styling himself Lord Stirling.
 *
 * A New Jersey gentleman who spent a fortune pursuing a lapsed Scottish
 * earldom the House of Lords refused to grant him, and who then fought the
 * whole war under the title anyway. On 27 August, with the army being rolled
 * up, he turned about two hundred and fifty Marylanders and attacked a British
 * force many times their size, six separate times, at the Old Stone House, to
 * buy the rest of the division time to get across the Gowanus creek.
 *
 * Roughly two hundred and fifty-six of them died. Washington is supposed to
 * have watched it from the works and said something about brave men. The
 * quotation is not reliable and the game does not use it.
 *
 * He gets the finest coat in the act, and the scarlet-lined facings, because
 * he dressed like an earl and being an earl was the point.
 */
export const STIRLING: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'queue',
  hat: 'cocked',
  hatBand: P.buffL,
  coat: P.blueD,
  facings: P.scarlet,
  sash: P.wine,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenL,
  accent: P.brassL,
  build: 1.10,
  tall: 0.99,
  age: 'old',
  boots: true,
});

/**
 * Major General Israel Putnam. Fifty-eight, a Connecticut farmer and tavern
 * keeper, a legend before this war started — the wolf den, the escape from
 * the stake, riding down the stone steps at Horseneck — and, on Long Island,
 * a corps commander given ground he did not know four days before a battle.
 *
 * He is short, thick, and dressed like a man who does not care, because every
 * account of him says so.
 */
export const PUTNAM: ActorSpec = actor({
  skin: 'a',
  hair: P.hairGrey,
  hairStyle: 'short',
  hat: 'round',
  coat: P.blueD,
  facings: P.buffD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.18,
  tall: 0.92,
  age: 'old',
  boots: true,
});

/**
 * Brigadier General Thomas Mifflin, of Philadelphia. A Quaker merchant
 * disowned by his meeting for taking up arms, an excellent quartermaster, a
 * genuinely fine speaker, and the man whose premature withdrawal order on the
 * night of the 29th nearly destroyed the evacuation.
 *
 * He is planted here so that Act 5's Conway business has a face the student
 * already knows. Nothing about him here is sinister. He was popular, he was
 * useful, and he made a mistake in the dark.
 */
export const MIFFLIN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'cocked',
  coat: P.blueD,
  facings: P.linenL,
  waistcoat: P.linenL,
  breeches: P.linenD,
  stockings: P.linen,
  build: 0.98,
  tall: 1.00,
  age: 'adult',
  boots: true,
});

/**
 * Colonel John Glover, of Marblehead. A fisherman and shipowner, and the
 * commander of the 14th Continental Regiment — the Marbleheaders, who were
 * seamen, who were a documented mixed-race unit with Black and Wampanoag men
 * in the ranks, and who rowed the entire army off Long Island in one night.
 *
 * They wore short blue seamen's jackets and tarred trousers, which is a
 * genuinely different silhouette from every other soldier in the game, and
 * that difference is the point: the men who saved the army did not look like
 * soldiers.
 */
export const GLOVER: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'round',
  coat: P.blueD,
  facings: P.blueL,
  waistcoat: P.linenD,
  breeches: P.linenD,
  stockings: P.osnaD,
  build: 1.02,
  tall: 0.94,
  age: 'adult',
  boots: true,
});

/** A Marbleheader. Blue jacket, tarred trousers, and no pretence of drill. */
export const MARBLEHEADER: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBlack,
  hairStyle: 'short',
  hat: 'cap',
  coat: P.blueD,
  waistcoat: P.linenD,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.04,
  tall: 0.97,
  age: 'young',
});

/**
 * A Marbleheader, Black.
 *
 * WITNESS REGISTER — R5, §7.6 sign-off required, drafted and NOT approved.
 *
 * The 14th Continental was integrated and the record says so plainly: men of
 * colour served in Glover's ranks, from a town whose crews had always been
 * mixed because a fishing schooner does not care. He is here because the
 * crowd composition at the ferry landing has to show it (F-20), and because
 * the boats that took the army off Long Island were crewed by men several of
 * whom were not free anywhere south of Massachusetts.
 *
 * He is not a quest-giver, he grants nothing, and he asks the player for
 * nothing. §6.3 applies in full.
 */
export const MARBLEHEADER_BLACK: ActorSpec = actor({
  skin: 'c',
  hair: P.hairBlack,
  hairStyle: 'cropped',
  hat: 'cap',
  coat: P.blueD,
  waistcoat: P.linenD,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 1.03,
  tall: 0.99,
  age: 'young',
});

/**
 * Captain Alexander Hamilton, of the New York provincial artillery company.
 *
 * Twenty-one, an immigrant from Nevis by way of a hurricane and a subscription
 * raised by strangers, and at this moment a very junior officer with two guns
 * who has been noticed by exactly nobody the student has heard of. He gets one
 * line in this act and it is remembered later.
 *
 * `tall: 0.96` and `build: 0.90`. He was slight and everyone said so.
 */
export const HAMILTON: ActorSpec = actor({
  skin: 'a',
  hair: '#7A5A32',
  hairStyle: 'queue',
  hat: 'cocked',
  coat: P.blueD,
  facings: P.buff,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenL,
  build: 0.90,
  tall: 0.96,
  age: 'young',
  boots: true,
});

/* ---------------------------------------------------------------------- *
 * The line
 * ---------------------------------------------------------------------- */

/**
 * Lieutenant Nathaniel Ford, of the Jamaica Pass patrol. INVENTED, and
 * labelled.
 *
 * The patrol is not invented. Five mounted militia officers were posted to
 * watch the Jamaica Pass on the night of 26 August with no relief, no
 * infantry, and no orders about what to do if they saw anything. A British
 * column of ten thousand men marched through the pass at two in the morning
 * and collected all five of them without a shot. That is the hinge of the
 * battle and it is a documented administrative failure, not a betrayal.
 */
export const FORD: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'tricorne',
  coat: P.greenD,
  facings: P.buffD,
  waistcoat: P.osnaL,
  breeches: P.brownD,
  stockings: P.osnaD,
  build: 0.96,
  tall: 0.98,
  age: 'young',
  boots: true,
});

/**
 * A Maryland private of Smallwood's battalion.
 *
 * Scarlet-faced buff coats bought by their own colony, and by a long way the
 * best-turned-out men in the army — which is why they are drawn as the only
 * really uniform figures on this map, and why what happens to them at the Old
 * Stone House lands as hard as it does.
 */
export const MARYLANDER: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'queue',
  hat: 'tricorne',
  hatBand: P.buffL,
  coat: P.buffD,
  facings: P.scarlet,
  waistcoat: P.buffL,
  breeches: P.buffL,
  stockings: P.linenL,
  build: 1.00,
  tall: 1.01,
  age: 'young',
});

/** A Pennsylvania rifleman, still in the shirt, a year on and dirtier. */
export const RIFLE_PA: ActorSpec = actor({
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

/** A Connecticut militiaman, six weeks from home and looking it. */
export const MILITIA_CT: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'short',
  hat: 'round',
  coat: P.brownD,
  waistcoat: P.osnaL,
  breeches: P.osnaD,
  stockings: P.osna,
  build: 0.98,
  tall: 0.97,
  age: 'young',
});

/**
 * A woman of the army, at the ferry.
 *
 * NOTE ON A CUT, carried forward from Act 2 and repeated here because
 * `docs/05` §3.3 lists her at this scene as well: **Sarah Osborn is not in
 * this game.** Her narrative is one of the great enlisted-side sources for
 * the Revolution and she was not with the army until about 1780 — four years
 * after this night. Putting her on the Brooklyn ferry would be inventing a
 * witness, which is the one thing this project will not do.
 *
 * The women on the manifest are real and unnamed, which is exactly the
 * historical situation, and the game says so rather than fixing it with a
 * name it does not have.
 */
export const FERRY_WOMAN: ActorSpec = actor({
  skin: 'a',
  hair: P.hairBrown,
  hairStyle: 'bun',
  hat: 'none',
  cap: true,
  coat: P.brownD,
  gown: P.brownD,
  apron: P.linenD,
  build: 0.99,
  tall: 0.88,
  age: 'adult',
});

/* ---------------------------------------------------------------------- *
 * Registry
 * ---------------------------------------------------------------------- */

export const ACT3_CAST: Record<string, ActorSpec> = {
  sullivan: SULLIVAN,
  stirling: STIRLING,
  putnam: PUTNAM,
  mifflin: MIFFLIN,
  glover: GLOVER,
  marblehead: MARBLEHEADER,
  marbleheadB: MARBLEHEADER_BLACK,
  hamilton: HAMILTON,
  ford: FORD,
  marylander: MARYLANDER,
  riflePa: RIFLE_PA,
  militiaCt: MILITIA_CT,
  ferrywoman: FERRY_WOMAN,
};

export const ACT3_SPEAKERS: Record<string, string> = {
  'John Sullivan': 'sullivan',
  'General Sullivan': 'sullivan',
  'Lord Stirling': 'stirling',
  'William Alexander': 'stirling',
  'Israel Putnam': 'putnam',
  'General Putnam': 'putnam',
  'Thomas Mifflin': 'mifflin',
  'John Glover': 'glover',
  'Colonel Glover': 'glover',
  'Alexander Hamilton': 'hamilton',
  'Lieutenant Ford': 'ford',
  'A Marylander': 'marylander',
  'A Marbleheader': 'marblehead',
  'A woman at the ferry': 'ferrywoman',
};
