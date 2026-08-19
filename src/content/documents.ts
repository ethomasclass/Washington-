/**
 * The archive of Act 1.
 *
 * R2: the only way to open a knowledge-locked option is to find and read a
 * primary source. Documents never grant stats. This file is therefore the act's
 * progression system, wearing a costume.
 *
 * Every quotation here is real and cited. Where a document is summarised rather
 * than quoted, the summary is in the gloss and marked as ours, never set as if
 * it were the source. Nothing generated ever renders readable period text as an
 * image; it is all set here, in the engine, over blank paper.
 */

import type { DocumentDef } from '../types';

export const DOCUMENTS: Record<string, DocumentDef> = {

  /* --------------------------------------------------------------------
   * The one that matters most, and the one he does not want found.
   * ------------------------------------------------------------------ */
  'DOC-A1.1': {
    id: 'DOC-A1.1',
    title: 'Articles of Capitulation, Fort Necessity',
    cite: 'Great Meadows, 3 July 1754 — signed G. Washington, Ja. Mackay',
    register: 'printed',
    gloss:
      'He was twenty-two. He surrendered a fort in the rain, at night, to a French officer, '
      + 'and signed a document in French that he could not read. The interpreter was a Dutchman '
      + 'whose French was poor and whose English was worse.',
    body: [
      '<em>Article 1.</em> As our intentions have never been to trouble the peace and good harmony '
      + 'which subsists between the two princes in amity, but only to avenge the assassination '
      + 'which has been committed upon one of our officers, bearer of a summons, and upon his escort&hellip;',
      '<em>Article 7.</em> &hellip;and that for surety of the performance of this article, as well as of '
      + 'this treaty, Messrs. Jacob Van Braam and Robert Stobo, both captains, shall be delivered '
      + 'to us as hostages until the arrival of our Canadians and Frenchmen.',
      '&mdash;&mdash;',
      'The French word in Article 1 is <em>l&rsquo;assassinat</em>. Washington understood it to mean '
      + 'the death, or the loss. It does not. It means the murder.',
      'The document was printed in London within the year. He was twenty-two years old and he had '
      + 'signed a confession to murdering a French diplomat, and he spent the rest of his life '
      + 'insisting he had not read what he signed &mdash; which was true, and which is not a defence '
      + 'anyone in London was interested in.',
      'He has never mentioned it to his wife.',
    ],
    grants: 'doc.a1.necessity',
  },

  'DOC-A1.2': {
    id: 'DOC-A1.2',
    title: 'The Fairfax County Resolves',
    cite: 'Alexandria, 18 July 1774 — drafted by George Mason; chaired by G. Washington',
    register: 'printed',
    gloss:
      'Twenty-four resolutions, adopted at a meeting Washington chaired in the Alexandria '
      + 'courthouse. He signed his name at the head of them. Anyone who says he was drawn '
      + 'reluctantly into this has not read the minutes.',
    body: [
      '<em>Resolved,</em> that this Colony and Dominion of Virginia can not be considered as a '
      + 'conquered Country; and if it was, that the present Inhabitants are the Descendants not '
      + 'of the Conquered, but of the Conquerors.',
      '<em>Resolved,</em> that the Claim lately assumed and exercised by the British Parliament, of '
      + 'making all such Laws as they think fit, to govern the People of these Colonies&hellip; is '
      + 'diametrically contrary to the first Principles of the Constitution.',
      '<em>Resolved,</em> that it is the Opinion of this Meeting, that during our present Difficulties '
      + 'and Distress, no Slaves ought to be imported into any of the British Colonies on this '
      + 'Continent; and we take this Opportunity of declaring our most earnest Wishes to see an '
      + 'entire Stop for ever put to such a wicked cruel and unnatural Trade.',
      '&mdash;&mdash;',
      'The last of those is the twenty-fourth resolve. It closes the trade. It does not free '
      + 'anybody, and the men who voted for it went home to estates worked by the people it does '
      + 'not free. Mount Vernon is one of them.',
    ],
    grants: 'doc.a1.resolves',
  },

  'DOC-A1.3': {
    id: 'DOC-A1.3',
    title: 'Bloody Butchery, by the British Troops',
    cite: 'Salem, Massachusetts, printed by E. Russell, April 1775 — a broadside',
    register: 'printed',
    gloss:
      'A single sheet, sold for a penny, with forty coffins cut along the top of it and a name '
      + 'in each. It reached the Potomac about three weeks after the event it describes.',
    body: [
      'A PARTICULAR ACCOUNT of the VICTORIOUS BATTLE fought at CONCORD, between two thousand '
      + 'Regular Troops belonging to His Britannick Majesty, and a few hundred Provincial Troops '
      + 'belonging to the Province of Massachusetts-Bay.',
      'Together with an ACCOUNT of the Barbarous Cruelties committed by said Troops on their '
      + 'Retreat to Boston, in burning of Houses, wounding and killing the aged and infirm.',
      '&mdash;&mdash;',
      'The column marched nineteen miles back to Charlestown under fire from behind walls and '
      + 'houses by men who never once stood in the open. That is what actually happened and it is '
      + 'the useful thing in this sheet.',
      'The casualty figures are not. They are high, they were printed to be high, and the coffins '
      + 'along the top were cut for an earlier broadside and used again because cutting new ones '
      + 'was slow. A printer with forty coffins in his case prints forty coffins.',
    ],
    grants: 'doc.a1.boston_clipping',
  },

  'DOC-A1.4': {
    id: 'DOC-A1.4',
    title: "Lund Washington's building account",
    cite: 'Mount Vernon, running account, 1774&ndash;1775 — in Lund Washington&rsquo;s hand',
    register: 'rough',
    gloss:
      'What the house has cost so far, and what is owed on it. The joiners are Goin Lanphier&rsquo;s '
      + 'men. The north addition is not framed, the south wing is finished this spring, and the '
      + 'date by which the whole is to be done has now been written down twice.',
    body: [
      'To Goin Lanphier, joiner, on acct. of the So. addition &mdash; part paid.',
      'To scantling, yellow pine, deliv&rsquo;d at the landing &mdash; unpaid.',
      'To lime, burnt on the place &mdash; to acct.',
      'To nails, 10d &amp; 20d, of Alexandria &mdash; unpaid.',
      '<em>Memorandum.</em> The No. addition to be rais&rsquo;d and cover&rsquo;d before the frosts, as was '
      + 'likewise agreed for the last autumn.',
      '&mdash;&mdash;',
      'The last line has been written before. The same promise, in the same hand, appears against '
      + 'the previous autumn, and the autumn before that.',
      'The wing will not be closed in for four more years. Its interior will not be finished for '
      + 'twelve. He will be in Cambridge, and then in Brooklyn, and then at Valley Forge, and Lund '
      + 'will write to him about the roof, and he will answer from a tent.',
    ],
    grants: 'doc.a1.accounts',
  },

  'DOC-A1.5': {
    id: 'DOC-A1.5',
    title: 'Invoice, Robert Cary &amp; Co., London',
    cite: 'Shipped to Mount Vernon on account of G. Washington, Esq.',
    register: 'printed',
    gloss:
      'Cloth, bought by the yard. Osnaburg is coarse German linen, and it is what the estate '
      + 'issues. The quantity is the useful number: divide it and it tells you the annual '
      + 'allowance of cloth for one person.',
    body: [
      'To 450 ells Osnabrigs, coarse &mdash; for the People.',
      'To 200 yds Kendal Cotton, blue.',
      'To 3 doz. felt hats, mens, plain.',
      'To 2 doz. pr. shoes, negro, strong.',
      'To 1 piece superfine broadcloth, blue, for a suit &mdash; and buff shalloon for the facings '
      + 'and lining of the same.',
      '&mdash;&mdash;',
      'The last line is the uniform. It is on the same invoice as the shoes, and it costs more '
      + 'than all of them together.',
      'The word on the ledger is <em>the People</em>. It is what this estate&rsquo;s paperwork calls the '
      + 'hundred and thirty-five human beings on it, and it is worth noticing that the paperwork '
      + 'says people and the law says property, and both of those are this house&rsquo;s handwriting.',
    ],
    grants: 'doc.a1.osnaburg',
  },

  'DOC-A1.6': {
    id: 'DOC-A1.6',
    title: 'G. Washington to Bryan Fairfax',
    cite: 'Mount Vernon, 24 August 1774',
    register: 'secretary',
    gloss:
      'Fairfax is a friend and a neighbour, and he has written urging one more petition to the '
      + 'King. This is the reply. It is the plainest statement Washington ever made of what he '
      + 'thought was at stake, and of what he thought he was.',
    body: [
      '&hellip;that the crisis is arrived when we must assert our rights, or submit to every imposition, '
      + 'that can be heaped upon us, till custom and use shall make us as tame and abject slaves, '
      + 'as the blacks we rule over with such arrogant power.',
      'Shall we, after this, whine and cry for relief, when we have already tried it in vain?',
      '&mdash;&mdash;',
      'He wrote that sentence in this house. The people it compares him to were in the next '
      + 'building when he wrote it, and he did not think the comparison needed explaining, because '
      + 'to the man he was writing to, it did not.',
      'The game will not tell you what to do with this. It will hand it to you before you walk '
      + 'down to the Quarter, and that is all it intends to do.',
    ],
    grants: 'doc.a1.fairfax',
  },

  /* --------------------------------------------------------------------
   * Sourced humour (R23). It is entirely in his own hand.
   * ------------------------------------------------------------------ */
  'DOC-A1.7': {
    id: 'DOC-A1.7',
    title: 'Diary, three days',
    cite: 'The diaries of George Washington, first week of May 1775',
    register: 'rough',
    gloss:
      'He kept the weather every morning for forty years. These are the entries for the days '
      + 'immediately before he rode to Philadelphia.',
    body: [
      '<em>Monday.</em> Cool &amp; clear in the Morning with the Wind at No. West. Went to the Plantations '
      + 'at Dogue Run &amp; Muddy hole. Sowed Lucerne in the Inclosure by the Stable.',
      '<em>Tuesday.</em> Wind Southerly &amp; warm. Mercury at 64 at Sunrise. Finished sowing. The Wheat '
      + 'at the Ferry looks but indifferently.',
      '<em>Wednesday.</em> Very warm. A good deal of Rain in the Night. Rid to the Mill.',
      '&mdash;&mdash;',
      'Lexington was a fortnight ago. Fifteen thousand men are camped around Boston. He has been '
      + 'named to a command by four counties and is expected in Philadelphia on the tenth.',
      'The wheat at the Ferry looks but indifferently.',
    ],
    grants: 'doc.a1.diary',
  },
};

export function documentById(id: string): DocumentDef | undefined {
  return DOCUMENTS[id];
}
