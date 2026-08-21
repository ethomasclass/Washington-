/**
 * The archive of Act 4.
 *
 * Two of these carry the act's real teaching and neither is about the
 * crossing.
 *
 * `DOC-A4.1` is *The American Crisis*, and it must look like what it was:
 * cheap coarse paper, wide-set type, badly inked, printed in a hurry and
 * sold for a few pence. It is not a founding document, it is mass
 * propaganda, and it worked.
 *
 * `DOC-A4.5` is the story of Rall's unread note, dated on its face to
 * decades after the event, and it is the object with which this game kills
 * the drunk-Hessians myth. Rall had been warned, twice. He had asked for a
 * redoubt and been refused. His men had been on alert for a week. What
 * nobody expected was an attack across a river running ice in a blizzard,
 * and that is a much better story than a garrison too drunk to stand up.
 */

import type { DocumentDef } from '../types';

export const ACT4_DOCUMENTS: Record<string, DocumentDef> = {

  'DOC-A4.1': {
    id: 'DOC-A4.1',
    title: 'The American Crisis, Number I',
    cite:
      'Thomas Paine — Philadelphia, printed by Styner and Cist, 19 December 1776; '
      + 'read to the regiments at the Delaware, 23 December',
    register: 'printed',
    gloss:
      'Written on the retreat across New Jersey, some of it on a drumhead, by a corset-maker&rsquo;s '
      + 'son from Thetford who had been in America two years. Sold for two pence. It is the most '
      + 'effective piece of writing produced by the Revolution and Paine took no money for any of it.',
    body: [
      'THESE are the times that try men&rsquo;s souls. The summer soldier and the sunshine patriot '
      + 'will, in this crisis, shrink from the service of his country; but he that stands it NOW, '
      + 'deserves the love and thanks of man and woman.',
      'Tyranny, like hell, is not easily conquered; yet we have this consolation with us, that the '
      + 'harder the conflict, the more glorious the triumph. What we obtain too cheap, we esteem '
      + 'too lightly: it is dearness only that gives every thing its value.',
      '&hellip;I call not upon a few, but upon all: not on this state or that state, but on every '
      + 'state: up and help us; lay your shoulders to the wheel&hellip; Say not that thousands are '
      + 'gone, turn out your tens of thousands.',
      '&mdash;&mdash;',
      'Look at the paper it is on. Coarse stock, wide-set type, badly inked, and gone brown in six '
      + 'weeks. This is not a document, it is a pamphlet, printed fast and cheap to be read aloud '
      + 'to men who mostly could not read.',
      'It was read to the regiments at the Delaware two days before the crossing. Whether it did '
      + 'anything is not measurable and everybody involved believed it did, which in an army about '
      + 'to expire on the thirty-first is not nothing.',
      'Paine assigned the copyright to the states and died poor.',
    ],
    grants: 'doc.a4.crisis',
  },

  'DOC-A4.2': {
    id: 'DOC-A4.2',
    title: 'A paper of re-engagement',
    cite: 'Camp above McConkey&rsquo;s Ferry, December 1776 — the form as issued',
    register: 'rough',
    gloss:
      'Six weeks. That is the whole offer. Every man in this camp is legally free to walk home on '
      + 'the thirty-first of December and most of them intend to.',
    body: [
      'I do hereby engage to continue in the service of the United States for the term of six '
      + 'weeks from the expiration of my present enlistment, and to receive therefor the sum of '
      + 'ten dollars in hard money&hellip;',
      '&mdash;&mdash;',
      'Ten dollars, in specie, not in Continental paper &mdash; which by December 1776 is worth '
      + 'about a third of its face and falling.',
      'There is no ten dollars. Congress has not voted it and could not pay it if it had.',
      'What there is, is Robert Morris in Philadelphia, and Washington&rsquo;s own name on a paper '
      + 'promising money that does not exist out of a treasury that does not exist. Both of them '
      + 'knew that if the army broke up they would be personally ruined and it would not matter, '
      + 'because there would be nothing left to be ruined about.',
    ],
    grants: 'doc.a4.reenlist',
  },

  'DOC-A4.3': {
    id: 'DOC-A4.3',
    title: 'Robert Morris, on finding the specie',
    cite: 'Philadelphia, 1 January 1777 — Robert Morris to Washington',
    register: 'secretary',
    gloss:
      'The war&rsquo;s financier, going round Philadelphia on New Year&rsquo;s Day borrowing hard '
      + 'money from private people on his own signature, because there is no other way to get any.',
    body: [
      'I was up very early this morning to dispatch a supply of &pound;50,000 to you&hellip; but '
      + 'it will not be in my power to send more than half that sum, and that in a variety of '
      + 'coin&hellip;',
      'Whatever I can do shall be done for the good of the service; if further occasional supplies '
      + 'of money are necessary, you may depend on my exertions either in a public or private '
      + 'capacity.',
      '&mdash;&mdash;',
      '&ldquo;In a variety of coin.&rdquo; Spanish dollars, English guineas, French crowns, '
      + 'anything with metal in it, collected in bags from neighbours on a public holiday and sent '
      + 'up the road under guard.',
      'This is what the Congress-cannot-pay thread looks like at its sharpest: the commander in '
      + 'chief pledges his own credit and the financier goes door to door, because the government '
      + 'they both serve has none.',
    ],
    grants: 'doc.a4.morris',
  },

  'DOC-A4.4': {
    id: 'DOC-A4.4',
    title: 'The parole and countersign',
    cite: 'Head Quarters, 25 December 1776 — General Orders',
    register: 'secretary',
    gloss:
      'The password for the night, chosen by the man who wrote it. Three words. He does not '
      + 'explain them and nobody asks.',
    body: [
      'The parole is <em>Victory</em>. The countersign, <em>or Death</em>.',
      'Each brigade to be furnished with two lanthorns, to be carried by the officers of the '
      + 'leading regiment. The men to keep by their divisions and to observe the profoundest '
      + 'silence.',
      'No man to quit his ranks on pain of instant punishment.',
      '&mdash;&mdash;',
      'It is a password. It is also, in three words, an accurate description of what is going to '
      + 'happen if this fails, and every man who is challenged on the road tonight has to say it '
      + 'out loud in the dark.',
      'The army is legally dissolved in six days. There is no third possibility and the password '
      + 'says so.',
    ],
    grants: 'doc.a4.password',
  },

  'DOC-A4.5': {
    id: 'DOC-A4.5',
    title: 'The story of Colonel Rall&rsquo;s unread note',
    cite:
      'A tale in circulation from the 1790s and printed in several histories thereafter; '
      + 'no contemporary source',
    register: 'printed',
    gloss:
      'The most-told story about the twenty-sixth of December, and the reason to be careful with '
      + 'it is on the line above. Read where it comes from before you decide what it is worth.',
    body: [
      'It is related that on the night of the twenty-fifth, a Loyalist farmer came to the '
      + 'Colonel&rsquo;s quarters with intelligence of the rebels&rsquo; crossing, and being '
      + 'denied admittance to a gentleman at cards, wrote his warning upon a paper and sent it '
      + 'in; and that the note was found upon the Colonel&rsquo;s person the next day, unopened.',
      '&mdash;&mdash;',
      'Nobody wrote this down at the time. It appears in print decades later and the details move '
      + 'about from telling to telling &mdash; sometimes it is cards, sometimes wine, sometimes a '
      + 'Christmas supper.',
      'What IS documented is worse for the legend and better for the history. Rall&rsquo;s brigade '
      + 'had been under arms and on alert for a week and was exhausted from it. He doubled his '
      + 'guards on the twenty-fourth after a raid on his outposts. He had twice asked his '
      + 'superiors for permission to build a redoubt at the head of the town and been refused. He '
      + 'was a thirty-year professional who had stormed a redoubt at White Plains in November.',
      'He was not drunk. His men were not drunk. What nobody in Trenton expected was that anybody '
      + 'would cross a river running ice, in a blizzard, on Christmas night, and march nine miles '
      + 'to attack them &mdash; because no reasonable officer would have.',
      'The drunk-Hessian story is more comfortable, which is exactly why it lasted.',
    ],
    grants: 'doc.a4.rall_note',
  },

  'DOC-A4.6': {
    id: 'DOC-A4.6',
    title: 'A Hessian grenadier&rsquo;s cap plate',
    cite: 'Brass, taken at Trenton, 26 December 1776 — Regiment von Rall',
    register: 'engrossed',
    gloss:
      'Not a document: an object, and the money object of the act. Nine hundred of these came '
      + 'across the Delaware on the twenty-sixth and about half of them never went home.',
    body: [
      'A brass front-plate off a grenadier&rsquo;s mitre cap, ten inches tall, with the '
      + 'Hesse-Cassel lion and a motto in relief. It weighs about a pound and it is worn shiny at '
      + 'the top edge where the man polished it.',
      '&mdash;&mdash;',
      'The Landgrave of Hesse-Cassel rented about nineteen thousand of his subjects to Great '
      + 'Britain over eight years and was paid roughly &pound;3 million for it, of which the '
      + 'soldiers received their ordinary pay and nothing else. They were not mercenaries in the '
      + 'sense of men who chose it; they were conscripts, hired out wholesale by their own prince.',
      'About a quarter of them never returned to Germany. Some died. A great many of the ones '
      + 'taken at Trenton were quartered among the Pennsylvania Germans, spoke the language, '
      + 'worked, and simply stayed.',
    ],
    grants: 'doc.a4.cap_plate',
  },

  'DOC-A4.7': {
    id: 'DOC-A4.7',
    title: 'To the President of Congress, of the affair at Trenton',
    cite: 'Newtown, Pennsylvania, 27 December 1776 — Washington to John Hancock',
    register: 'secretary',
    gloss:
      'Written the day after, having been awake for about fifty hours. Note what he says about '
      + 'the weather, and note the one sentence about his own men that he did not have to include.',
    body: [
      'Sir: I have the pleasure of congratulating you upon the success of an enterprize which I '
      + 'had formed against a detachment of the enemy lying in Trenton&hellip;',
      'The difficulty of passing the River in a very severe Night, and their march thro&rsquo; a '
      + 'violent Storm of Snow and Hail, did not in the least abate their Ardour, but when they '
      + 'came to the Charge, each seemed to vie with the other in pressing forward&hellip;',
      'In justice to the Officers and Men, I must add, that their Behaviour upon this Occasion '
      + 'reflects the highest honor upon them&hellip; Their Cheerfulness in bearing the Cold and '
      + 'Fatigue was as astonishing as their bravery in the Field.',
      '&mdash;&mdash;',
      'Two Continental soldiers froze to death on the march from the ferry. Four were wounded in '
      + 'the town, including a Virginia lieutenant shot through both hands named James Monroe, who '
      + 'will be President in forty-one years.',
      'Nine hundred and some Hessians were taken. The whole action lasted about forty-five minutes '
      + 'and the army marched straight back across the river with the prisoners the same night, '
      + 'because there was nothing in Trenton worth holding and everything on the far bank worth '
      + 'getting back to.',
    ],
    grants: 'doc.a4.trenton_report',
  },
};
