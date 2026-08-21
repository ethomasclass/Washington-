/**
 * The archive of Act 3.
 *
 * Act 3 is the defeat, and its documents have a job the other acts' do not:
 * **one of them is wrong, and nothing marks it wrong.**
 *
 * `DOC-A3.2` is a British troop-movement report that places Howe's main body
 * where it is not. A player who reads it and acts on it at the map table pays
 * for it on the manifest. There is no tell, no italic aside, no "or is it?".
 * Intelligence in 1776 was mostly wrong, everybody acted on it anyway, and a
 * student who learns that from being burned once will not need telling twice.
 *
 * And one of them is a story about a story. Thacher's journal entry on Mrs.
 * Murray is charming, probably apocryphal, and dated years after the event by
 * a man who was not there. It is presented as exactly that, and it is the
 * only funny thing in the act.
 */

import type { DocumentDef } from '../types';

export const ACT3_DOCUMENTS: Record<string, DocumentDef> = {

  'DOC-A3.1': {
    id: 'DOC-A3.1',
    title: 'Resolution of Congress on the defence of New York',
    cite: 'Philadelphia, May 1776 — Journals of the Continental Congress',
    register: 'printed',
    gloss:
      'Congress orders the city held. It does not say how, and it cannot pay for it. '
      + 'Every military argument for the next four months runs into this piece of paper.',
    body: [
      '<em>Resolved,</em> that General Washington be directed to repair to New York, and to put '
      + 'that city and the passes of the North River into such a posture of defence as shall be '
      + 'judged best for the security of the said colony&hellip;',
      '<em>Resolved,</em> that the said city be by no means abandoned, but every means used for '
      + 'its preservation and defence which the circumstances of the place will admit.',
      '&mdash;&mdash;',
      'New York in 1776 is an island, beside another island, in a harbour, and the enemy has the '
      + 'largest fleet ever sent out of Britain &mdash; more than four hundred sail, thirty-two '
      + 'thousand men. Whoever holds the water holds the whole position, and the Continental Army '
      + 'does not have a ship.',
      'Charles Lee had already told Congress the place could not be held. Greene said burn it and '
      + 'go. Washington asked, in September, whether he might destroy the city rather than leave '
      + 'it to house the enemy, and Congress refused him.',
      'It burned anyway on the twenty-first of September, and nobody has ever established who '
      + 'started it.',
    ],
    grants: 'doc.a3.congress_ny',
  },

  'DOC-A3.2': {
    id: 'DOC-A3.2',
    title: 'A report of the enemy&rsquo;s movements',
    cite: 'Brooklyn, 25 August 1776 — from an officer of the guard, second hand',
    register: 'rough',
    gloss:
      'Intelligence, of the ordinary kind: somebody saw something, told somebody else, and it '
      + 'was written down by a third man who added a conclusion.',
    body: [
      'A countryman come in this morning reports the enemy in great force upon the road from the '
      + 'Narrows, with artillery, and moving upon the Flatbush pass. Their light troops are seen '
      + 'upon the heights above Flatbush.',
      'It is judged from the above that the main body designs to force the Flatbush road, and '
      + 'that the movements toward Bedford are a feint to draw off our left.',
      'The country people are much divided in their accounts and several are not to be depended '
      + 'upon.',
      '&mdash;&mdash;',
      'Six thousand men under Grant demonstrated on the coast road. Five thousand Hessians under '
      + 'von Heister held the centre at Flatbush. Neither was the main body.',
      'Ten thousand men under Howe, Clinton and Cornwallis marched all night to the east, through '
      + 'the Jamaica Pass, and came down behind the entire American position at nine in the '
      + 'morning on the twenty-seventh.',
    ],
    grants: 'doc.a3.enemy_report',
  },

  'DOC-A3.3': {
    id: 'DOC-A3.3',
    title: 'Orders for the patrol of the Jamaica Pass',
    cite: 'Brooklyn, 26 August 1776 — in the hand of the brigade major',
    register: 'secretary',
    gloss:
      'The order that lost the battle. Read what it asks five men to do, and then read what it '
      + 'does not say.',
    body: [
      'Five officers of the militia horse are to proceed this evening upon the Jamaica road and '
      + 'to patrol the same, giving notice of any movement of the enemy in that quarter.',
      '&mdash;&mdash;',
      'Five men. On horseback. On a road.',
      'No infantry at the pass. No relief through the night. No signal arranged, no rendezvous '
      + 'named, and no instruction as to what they were to do if they saw ten thousand men, which '
      + 'is what they saw.',
      'The British column took all five prisoners at about two in the morning without firing a '
      + 'shot, and then walked through the pass. Nobody on the American line knew anything about '
      + 'it until the guns went off behind them seven hours later.',
      'It was not treachery and it was not cowardice. It was a staff that had never done this '
      + 'before writing an order that did not say enough.',
    ],
    grants: 'doc.a3.jamaica_order',
  },

  'DOC-A3.4': {
    id: 'DOC-A3.4',
    title: 'The manifest of the boats',
    cite: 'Brooklyn ferry, the night of 29–30 August 1776 — kept at the landing',
    register: 'rough',
    gloss:
      'What went, and in what order, and what did not go. This sheet is the mechanic of the '
      + 'whole night: everything that is on it got across, and everything that is not on it did '
      + 'not.',
    body: [
      'The sick and the wounded first, by the general&rsquo;s order. Then the women and the '
      + 'children of the regiments, being upon the rations.',
      'Then the artillery so far as the boats will bear it, the light pieces before the heavy.',
      'Then the regiments in the order in which they can be brought off the line without the '
      + 'front being uncovered, the covering party to be last of all.',
      'Horses: the general&rsquo;s and the field officers&rsquo;. All others to be left.',
      '&mdash;&mdash;',
      'Nine thousand men crossed the East River in one night, in a scratch fleet, in the dark,'
      + ' rowed by Glover&rsquo;s Marblehead fishermen, without losing a man. The British had '
      + 'lines within six hundred yards and never heard it.',
      'The fog came down at dawn and held on the Long Island side after it had cleared on the New '
      + 'York side, which is the only piece of luck in this act and is not attributed to anybody.',
      'Washington went in the last boat. Every account agrees on that, which for once is not a '
      + 'reason to distrust it &mdash; there were several hundred people watching.',
    ],
    grants: 'doc.a3.manifest',
  },

  'DOC-A3.5': {
    id: 'DOC-A3.5',
    title: 'Dr. Thacher on Mrs. Murray&rsquo;s hospitality',
    cite:
      'James Thacher, <em>A Military Journal during the American Revolutionary War</em> &mdash; '
      + 'published 1823, of an event of 15 September 1776, which he did not witness',
    register: 'secretary',
    gloss:
      'The best story in the act, and the one with the least evidence behind it. Read the '
      + 'citation line before you read the story, and then read it again afterwards.',
    body: [
      'It has been said that Mrs. Murray treated them with cake and wine, and they were induced '
      + 'to tarry two hours or more, Governor Tryon frequently joking her about her American '
      + 'friends.',
      'By this happy incident General Putnam, by continuing his march, escaped a rencounter with '
      + 'a greatly superior force, which must have proved fatal to his whole party.',
      '&mdash;&mdash;',
      '&ldquo;It has been said.&rdquo; Thacher is a careful man and he tells you in four words '
      + 'that he is repeating something.',
      'The facts underneath are solid: Howe&rsquo;s advance did halt on the afternoon of the '
      + 'fifteenth; Putnam&rsquo;s division did get up the west side of Manhattan; the Murrays '
      + 'were Quakers with a fine house at Inclenberg and a son trading with the British.',
      'The cake is another matter. Thacher published this in 1823, forty-seven years after the '
      + 'afternoon in question, having heard it from somebody. It may be true. It is not '
      + 'evidence that it is true, and the difference between those two sentences is most of what '
      + 'a historian does for a living.',
    ],
    grants: 'doc.a3.murray',
  },

  'DOC-A3.6': {
    id: 'DOC-A3.6',
    title: 'General Arnold&rsquo;s dispatch from Lake Champlain',
    cite: 'Crown Point, October 1776 — Benedict Arnold to General Gates',
    register: 'secretary',
    gloss:
      'Four hundred miles north of Brooklyn, a man with no ships built ships out of standing '
      + 'timber and fought a fleet with them. Remember the name.',
    body: [
      'On the eleventh instant, at eight o&rsquo;clock A.M., the enemy&rsquo;s fleet appeared off '
      + 'Cumberland Head&hellip; we were of opinion it would be prudent to await them in the bay '
      + 'between Valcour Island and the main.',
      'The engagement became general and very warm. The <em>Congress</em> galley received seven '
      + 'shot between wind and water, was hulled a dozen times, and had her mainmast wounded in '
      + 'two places.',
      'On the whole, I think we have had a very fortunate escape, and have great reason to return '
      + 'our humble and hearty thanks to Almighty God for preserving and delivering so many of us '
      + 'from our more than savage enemies.',
      '&mdash;&mdash;',
      'He lost the battle and he lost most of the fleet. He also cost the British the campaign '
      + 'season: they could not push down Lake Champlain before winter, so the invasion from '
      + 'Canada waited a year, and when it came in 1777 it walked into Saratoga.',
      'Arnold built that fleet from nothing, in a forest, in four months, and then fought it '
      + 'against a stronger one because there was nothing else to do with it. In 1776 he is '
      + 'the most enterprising officer in the service and everybody in this army knows it.',
      'Keep the name. It comes back.',
    ],
    grants: 'doc.a3.arnold',
  },

  'DOC-A3.7': {
    id: 'DOC-A3.7',
    title: 'To John Hancock, President of Congress',
    cite: 'New York, 2 September 1776 — in Washington&rsquo;s own hand',
    register: 'secretary',
    gloss:
      'Written three days after the evacuation, at two in the morning, having not slept for '
      + 'forty-eight hours. It is the most candid letter he ever sent Congress.',
    body: [
      'Sir: I am obliged to acknowledge that our situation at this time is truly distressing&hellip;',
      'The check our detachment sustained on the twenty-seventh ultimo has dispirited too great a '
      + 'proportion of our troops and filled their minds with apprehension and despair. The '
      + 'militia, instead of calling forth their utmost efforts to a brave and manly opposition, '
      + 'are dismayed, intractable, and impatient to return.',
      'Great numbers of them have gone off; in some instances almost by whole regiments, by half '
      + 'ones and by companies at a time&hellip;',
      'I am, with great esteem and regard, sir, your most obedient servant, G. Washington.',
      '&mdash;&mdash;',
      'He tells them the truth, in writing, over his own signature, at the worst moment of his '
      + 'life so far. He does not tell them it was somebody else&rsquo;s fault, because it was '
      + 'not, and he does not resign.',
      'The militia figure is real: of some eight thousand Connecticut militia in the lines at the '
      + 'start of September, about two thousand were still there at the end of it.',
    ],
    grants: 'doc.a3.hancock',
  },
};
