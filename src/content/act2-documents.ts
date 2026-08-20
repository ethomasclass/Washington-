/**
 * The archive of Act 2.
 *
 * Same rule as Act 1 and it is the rule the whole progression system rests
 * on: the only way to open a knowledge-locked option is to find and read a
 * primary source, and a document never moves a stat. Every quotation here is
 * real and cited. Where the text is summarised rather than quoted, the
 * summary sits in the gloss and is marked as ours, never set as though it
 * were the source.
 *
 * Seven documents, and between them they carry the four things this act has
 * to teach that a textbook paragraph cannot:
 *
 *   A2.1  there is no powder, and the number is worse than anyone will say
 *   A2.2  the men are not clothed, sheltered or fed equally, by colony
 *   A2.3  the officer corps he was given is not the one he wanted
 *   A2.4  Congress can vote an army and cannot conjure one
 *   A2.5  the guns exist, three hundred miles away, in winter
 *   A2.6  the contracts end in December and that is not treachery
 *   A2.7  the bar on Black soldiers, and the order that partly lifted it
 */

import type { DocumentDef } from '../types';

export const ACT2_DOCUMENTS: Record<string, DocumentDef> = {

  /* --------------------------------------------------------------------
   * The fixed loss of the act, stated in a return.
   * ------------------------------------------------------------------ */
  'DOC-A2.1': {
    id: 'DOC-A2.1',
    title: 'Return of Powder in the Magazines',
    cite: 'Camp at Cambridge, 3 August 1775 — the Commissary of Stores',
    register: 'secretary',
    gloss:
      'On 3 August 1775 Washington learned that the army besieging Boston had '
      + 'about 36 barrels of powder — not the 300-odd he had been told. It came to '
      + 'roughly nine cartridges a man, and no reserve at all. He is said to have '
      + 'sat without speaking for half an hour.',
    body: [
      'Barrels of powder in store at Cambridge, Roxbury, and the several outposts, '
      + 'this third day of August 1775, exclusive of that already made into '
      + 'cartridges and issued&hellip; <em>thirty-six</em>.',
      'Whereof fit for service, the whole. Whereof reserved to the artillery, none.',
      '&mdash;&mdash;',
      'The Massachusetts Committee of Safety had reported over three hundred barrels. '
      + 'That figure counted every barrel the colony had received since April, and did '
      + 'not subtract what had been fired off at Concord, at Charlestown, and by every '
      + 'sentry in the lines who thought he saw something in the dark.',
      'Nine cartridges a man is not a shortage. It is one engagement, badly, and then '
      + 'nothing. A single serious assault on these lines and the army in front of '
      + 'Boston would have had to run or surrender, and the whole rebellion with it.',
      'He told nobody outside a handful of officers. The men on the lines were never '
      + 'informed, and the deception was maintained for months &mdash; including against '
      + 'his own Congress, in part. Nothing in this game lets you fix it, because he '
      + 'could not.',
    ],
    grants: 'doc.a2.powder_return',
  },

  /* --------------------------------------------------------------------
   * Greene, on what the camp actually looked like.
   * ------------------------------------------------------------------ */
  'DOC-A2.2': {
    id: 'DOC-A2.2',
    title: 'A description of the shelters in camp',
    cite:
      'Rev. William Emerson, Concord, to his wife — Cambridge camp, July 1775',
    register: 'rough',
    gloss:
      'Emerson was a chaplain and he walked the whole camp writing down what he saw. '
      + 'It is the best surviving description of what thirteen colonies&rsquo; worth of '
      + 'improvised army physically looked like standing next to itself.',
    body: [
      '&lsquo;Tis very diverting to walk among the camps. They are as different in their '
      + 'form as the owners are in their dress; and every tent is a portraiture of the '
      + 'temper and taste of the persons who encamp in it.',
      'Some are made of boards, and some of sailcloth. Some partly of one and partly of '
      + 'the other. Again, others are made of stone and turf, brick or brush. Some are '
      + 'thrown up in a hurry; others curiously wrought with doors and windows, done '
      + 'with wreaths and withes in the manner of a basket.',
      '&mdash;&mdash;',
      'The good ones are Rhode Island&rsquo;s. Nathanael Greene&rsquo;s brigade came up '
      + 'tented, clothed and drilled, because Rhode Island had spent the money and the '
      + 'other colonies had not. Two hundred yards further down the same street men are '
      + 'sleeping under brush.',
      'This is not an army. It is thirteen armies standing next to each other, each paid, '
      + 'clothed and commanded by its own colony, and the first year of the war is mostly '
      + 'the work of turning that sentence into a different one.',
    ],
    grants: 'doc.a2.emerson',
  },

  /* --------------------------------------------------------------------
   * What he wrote about them when he thought nobody would read it.
   * ------------------------------------------------------------------ */
  'DOC-A2.3': {
    id: 'DOC-A2.3',
    title: 'To Lund Washington, on the officers of this army',
    cite: 'Camp at Cambridge, 20 August 1775 — a private letter, later printed',
    register: 'secretary',
    gloss:
      'A private letter home. It was captured in copy and printed by his enemies, and '
      + 'it did him real political damage, because he had said in it what he would '
      + 'never have said in public.',
    body: [
      'The people of this government have obtained a character which they by no means '
      + 'deserved; their officers generally speaking are the most indifferent kind of '
      + 'people I ever saw&hellip;',
      'I have made a pretty good slam among such kind of officers as the Massachusetts '
      + 'government abound in since I came to this camp, having broke one colonel and '
      + 'two captains for cowardly behaviour in the action on Bunker&rsquo;s Hill, two '
      + 'captains for drawing more pay and provisions than they had men in their company, '
      + 'and one for being absent from his post when the enemy appeared there.',
      '&mdash;&mdash;',
      'A Virginia gentleman, forty-three years old, has been given command of an army of '
      + 'New England farmers whose officers were elected by the men they command &mdash; '
      + 'and who therefore, quite reasonably, do not care to give unpopular orders.',
      'He is right about the discipline. He is also a slaveholding planter describing '
      + 'men who shave their own captains, and both of those are in the letter at once. '
      + 'Read it as evidence of the writer as much as of the officers.',
    ],
    grants: 'doc.a2.lund_letter',
  },

  /* --------------------------------------------------------------------
   * What Congress could and could not do.
   * ------------------------------------------------------------------ */
  'DOC-A2.4': {
    id: 'DOC-A2.4',
    title: 'Resolution of the Continental Congress',
    cite: 'Philadelphia, 4 November 1775 — Journals of the Continental Congress',
    register: 'printed',
    gloss:
      'Congress resolves the army it wants. Note what a resolution is able to do and '
      + 'what it is not: it can fix a number, a term and a rate of pay, and it cannot '
      + 'make one man sign.',
    body: [
      '<em>Resolved,</em> that the army before Boston consist of twenty thousand and '
      + 'seventy-two men, officers included&hellip;',
      '<em>Resolved,</em> that the pay of the privates be forty shillings lawful money '
      + 'per calendar month, and that they find their own arms and clothing.',
      '<em>Resolved,</em> that the said army be engaged to serve until the last day of '
      + 'December, one thousand seven hundred and seventy-six.',
      '&mdash;&mdash;',
      '&ldquo;They find their own arms and clothing.&rdquo; A man is expected to bring '
      + 'a musket and a coat, and the country cannot supply either if he has not got '
      + 'them.',
      'And the term is one year. In twelve months every man in the resolution is free to '
      + 'go home again, and Congress will have to do this whole thing again, and again '
      + 'after that. Washington asked repeatedly for enlistment for the duration of the '
      + 'war. He did not get it until 1777, and never fully.',
    ],
    grants: 'doc.a2.congress',
  },

  /* --------------------------------------------------------------------
   * Knox. The one piece of good news in the act, and it is a proposal.
   * ------------------------------------------------------------------ */
  'DOC-A2.5': {
    id: 'DOC-A2.5',
    title: 'Colonel Knox&rsquo;s account of the train from Ticonderoga',
    cite: 'Henry Knox to Washington, Fort George, 17 December 1775',
    register: 'rough',
    gloss:
      'Knox was twenty-five and a bookseller. He proposed to bring the captured guns of '
      + 'Ticonderoga to Cambridge in winter, and then did it: about 59 pieces, near 60 '
      + 'tons, some 300 miles, in 56 days, by boat, ox-sledge and river ice.',
    body: [
      'I have had made forty two exceeding strong sleds, and have provided eighty yoke '
      + 'of oxen to drag them as far as Springfield, where I shall get fresh cattle to '
      + 'carry them to camp&hellip;',
      'I hope in sixteen or seventeen days to be able to present to your Excellency a '
      + 'noble train of artillery, the inventory of which I have enclosed.',
      '&mdash;&mdash;',
      'It took rather longer than sixteen days. A sledge went through the ice of the '
      + 'Hudson and had to be fished up; the thaw came at the wrong time and then the '
      + 'freeze came at the wrong time; the Berkshires had to be crossed with ropes '
      + 'checking the sledges downhill.',
      'The guns reached Cambridge in the last week of January 1776. In the night of 4 '
      + 'March they went up onto Dorchester Heights, and on 17 March the British fleet '
      + 'sailed out of Boston harbour and did not come back.',
      'One twenty-five-year-old with a good idea and no experience whatever is the '
      + 'difference between the siege ending and the siege not ending. That is a true '
      + 'sentence about this war and it is not a sentence about Washington.',
    ],
    grants: 'doc.a2.knox',
  },

  /* --------------------------------------------------------------------
   * The paper that takes his army away legally and on schedule.
   * ------------------------------------------------------------------ */
  'DOC-A2.6': {
    id: 'DOC-A2.6',
    title: 'An enlistment paper, and the roll it belongs to',
    cite:
      'Connecticut regiment, enlisted 1 May 1775 — form as printed for the colony',
    register: 'engrossed',
    gloss:
      'This is the contract. It is worth reading closely, because almost everything '
      + 'the winter of 1775 is about comes out of the last line of it.',
    body: [
      'I, the subscriber, do hereby engage to serve in the army now raising for the '
      + 'defence of the liberties of this Colony and of the United Colonies, under such '
      + 'officers as shall be appointed over me&hellip;',
      '&hellip;and to continue in the said service from the day of my enlistment until '
      + 'the <em>tenth day of December</em> next ensuing, and no longer, unless sooner '
      + 'discharged.',
      '&mdash;&mdash;',
      '<em>And no longer.</em> Eight months, signed for freely, in writing, by a free '
      + 'man who was under no obligation to sign at all.',
      'When the Connecticut regiments walked home in December 1775 they were not '
      + 'deserting and they were not mutinying. They were doing the thing the paper said '
      + 'they could do, in a war being fought over whether written agreements bind the '
      + 'people who make them.',
      'Washington was furious. He was also, on his own stated principles, in no position '
      + 'whatever to stop them, and he knew it, and that is the whole of the problem.',
    ],
    grants: 'doc.a2.enlistment',
  },

  /* --------------------------------------------------------------------
   * A2-D3's source. The hardest document in the act.
   * ------------------------------------------------------------------ */
  'DOC-A2.7': {
    id: 'DOC-A2.7',
    title: 'General Orders on the enlistment of free negroes',
    cite:
      'Head Quarters, Cambridge, 30 December 1775 — General Orders; and the '
      + 'council of war of 8 October 1775',
    register: 'engrossed',
    gloss:
      'Two decisions, eleven weeks apart, in opposite directions. Both are Washington&rsquo;s. '
      + 'Read them in order and do not let the second one erase the first.',
    body: [
      '<em>8 October 1775, a council of war at head quarters.</em> Agreed unanimously to '
      + 'reject all slaves, and by a great majority to reject negroes altogether.',
      '<em>12 November 1775, General Orders.</em> Neither negroes, boys unable to bear '
      + 'arms, nor old men unfit to endure the fatigues of the campaign, are to be '
      + 'enlisted.',
      '<em>30 December 1775, General Orders.</em> As the General is informed that numbers '
      + 'of free negroes are desirous of enlisting, he gives leave to the recruiting '
      + 'officers to entertain them, and promises to lay the matter before the Congress, '
      + 'who he doubts not will approve of it.',
      '&mdash;&mdash;',
      'What is between the second order and the third: on 7 November 1775 Lord Dunmore, '
      + 'the royal governor of Virginia, proclaimed freedom to any enslaved man belonging '
      + 'to a rebel who would leave and bear arms for the King. Thousands went. '
      + 'Washington called Dunmore &ldquo;that arch traitor to the rights of humanity&rdquo; '
      + 'and warned that if he were not crushed his force would grow &ldquo;like a '
      + 'snowball.&rdquo;',
      'The reversal of 30 December applies to <em>free</em> men, and only to those who '
      + 'had already served. It is not an emancipation, it was not argued for on moral '
      + 'grounds by anybody in that room, and it was decided because the other side had '
      + 'moved first.',
      'Black men had already fought at Lexington, at Concord and on Bunker Hill before '
      + 'any of these orders were written. Salem Poor was one of them, and fourteen '
      + 'officers petitioned the Massachusetts legislature that he &ldquo;behaved like an '
      + 'experienced officer as well as an excellent soldier.&rdquo; The order of 12 '
      + 'November had proposed to remove men like him from an army they were already in.',
      'By the end of the war roughly five thousand Black soldiers had served in the '
      + 'Continental forces. Rather more went to the British, who had offered them '
      + 'something the Continental Congress never did.',
    ],
    grants: 'doc.a2.black_enlistment',
  },
};
