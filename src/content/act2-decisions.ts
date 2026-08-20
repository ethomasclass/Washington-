/**
 * The four decisions of Act 2.
 *
 * They are kept together, out of the people files, for one reason: they have
 * to be read against each other. Act 2's argument is that command is mostly
 * arithmetic and mostly bad news, and the four questions are deliberately the
 * same shape — a thing you have discovered, a number that will not change,
 * and a choice about who is told and on what authority. A writer editing one
 * of them needs the other three on the same screen.
 *
 * A2-D1  the powder            who is told there is none
 * A2-D2  the council of war    SEALED — whether the army attacks Boston
 * A2-D3  Black enlistment      the bar, and the order that partly lifted it
 * A2-D4  the enlistments       eleven hundred men whose paper runs out
 */

import type { Decision } from '../types';

/* ---------------------------------------------------------------------- *
 * A2-D1 — THE POWDER
 * ---------------------------------------------------------------------- */

/**
 * 3 August 1775. He has just been handed the real return: thirty-six barrels,
 * not the three hundred the Committee of Safety reported. Nine cartridges a
 * man and nothing behind them.
 *
 * R20 — THE ACT'S FIXED LOSS. There is no option here that produces powder.
 * There is no supply mission, no smuggling run, no clever accounting. Every
 * branch is a decision about who knows, because that is the only variable
 * the historical man actually had. If a future edit adds an option that
 * conjures a barrel, it has removed the act's spine.
 */
export const A2_D1_POWDER: Decision = {
  id: 'A2-D1',
  prompt:
    'Thirty-six barrels. Not three hundred and eight — thirty-six, for the whole army, and '
    + 'Greene is standing in front of you waiting to be told what his brigade is to do about '
    + 'its cartridge boxes.',
  speaker: 'Nathanael Greene',
  portrait: 'greene',
  voices: ['restraint', 'temper', 'duty', 'vanity', 'ambition'],
  interjections: {
    restraint:
      'Nobody outside this tent can know. Not the men, not the colonies, and not, in full, '
      + 'the Congress. A secret this size stops being one the moment it is shared.',
    temper:
      'Massachusetts reported three hundred barrels. Somebody counted every keg that ever '
      + 'came through and subtracted nothing that was fired off.',
    duty:
      'Greene is a general officer of this army and he is asking you a fair question. Lying '
      + 'to him is not the same as keeping the enemy in the dark.',
    vanity:
      'If this gets out you are the general who lost Boston without a shot, and that is the '
      + 'sentence they will print.',
    ambition:
      'They cannot storm what they think is strong. Make the works look expensive and let '
      + 'them count the spadefuls instead of the barrels.',
  },
  rejoinders: {
    restraint: 'Whatever you decide today you are still deciding it in November.',
    temper: 'Being lied to by a committee is not a reason to lie to your own officers.',
  },
  options: [
    {
      id: 'tell_officers',
      label: 'The general officers only',
      full:
        'Tell the general officers, under an oath of secrecy, and no one else in the army or '
        + 'out of it.',
      favoured: ['restraint', 'duty'],
      historical: true,
      effects: { judgment: 5, legitimacy: 2, loyalty: -2 },
      ledger: [{ n: -400, cause: 'lost to sickness in works dug to look expensive' }],
      result:
        'It holds. It holds for months, through two councils and a Congress, and the men on '
        + 'the lines are never told what they are standing behind. You have bought the winter '
        + 'with a silence, and you will pay for it in every letter you write that has to be '
        + 'true and cannot be complete.',
    },
    {
      id: 'tell_nobody',
      label: 'No one at all',
      full: 'Tell Greene nothing. Order more entrenching and let the returns say what they say.',
      favoured: ['vanity', 'ambition'],
      effects: { judgment: -3, legitimacy: 3, loyalty: -5 },
      ledger: [{ n: -700, cause: 'worn out digging for a reason nobody would give them' }],
      result:
        'Greene digs. Greene keeps digging, and writes to Rhode Island that the works are '
        + 'unaccountably urgent, and does not know why his men are being spent on earth '
        + 'instead of drill. You have kept the secret perfectly and made your best officer '
        + 'useless for a month.',
    },
    {
      id: 'tell_congress',
      label: 'Write to Congress plainly',
      full:
        'Set the true figure down in a letter to Philadelphia and ask them, in terms, for '
        + 'powder.',
      favoured: ['duty', 'temper'],
      effects: { legitimacy: -6, judgment: 3, character: 4 },
      ledger: [{ n: 300, cause: 'sent up with the powder the colonies scraped together' }],
      result:
        'Some powder comes. Not enough, and later than the need. The letter is read aloud in '
        + 'a room with no locks on it, copied by three clerks, and discussed at dinner in a '
        + 'city with British sympathisers in half the good houses. Nothing is intercepted. '
        + 'It very easily could have been.',
    },
    {
      id: 'tell_informed',
      label: 'Show Greene the arithmetic',
      full:
        'Put the return in his hand, work the cartridges out in front of him, and set him to '
        + 'finding out how a colony came to report three hundred barrels that were not there.',
      requires: 'doc.a2.powder_return',
      lockNote: 'you have not read the return yourself, and cannot show a man what you have not read',
      favoured: ['duty', 'restraint'],
      effects: { judgment: 7, loyalty: 3, legitimacy: -1 },
      ledger: [{ n: -400, cause: 'lost to sickness in works dug to look expensive' }],
      result:
        'He goes white, and then he goes to work. Within a fortnight there is a system of '
        + 'returns that adds up, which this army has never had, and which is the beginning of '
        + 'the man who will run its supply for the rest of the war. The powder situation is '
        + 'exactly as bad as it was this morning.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A2-D2 — THE COUNCIL OF WAR.  SEALED.
 * ---------------------------------------------------------------------- */

/**
 * SEALED. The red wax, THIS WILL NOT COME AGAIN, and no soft shoulder on the
 * arithmetic.
 *
 * Historically he put an assault on Boston to his council of war more than
 * once — in September, in October, and again in January over the ice — and
 * was voted down every time, unanimously or nearly so. He abided by it every
 * time. That is the option marked `historical`, and it is the one that costs
 * him least and teaches most.
 *
 * The sealing is doing something specific. Every other decision in the act is
 * about who is told. This one is about whether a commander who is certain he
 * is right accepts being outvoted by men who are not his equals in law and
 * are his equals in that room. He never had to accept it. Nothing compelled
 * him. That he did, repeatedly, from 1775 to 1783, is the single most
 * consequential fact about him, and it is the reason this decision does not
 * come round again.
 */
export const A2_D2_COUNCIL: Decision = {
  id: 'A2-D2',
  prompt:
    'Fourteen officers round a table and one candle-branch. You have put the assault on '
    + 'Boston to them and they have voted it down — not narrowly. You are the commander in '
    + 'chief and the vote is advisory.',
  speaker: 'Horatio Gates',
  portrait: 'gates',
  sealed: true,
  voices: ['ambition', 'temper', 'restraint', 'duty', 'vanity'],
  interjections: {
    ambition:
      'They are six thousand on a peninsula and the water will be hard by January. One night, '
      + 'one column, and the war is over before the spring.',
    temper:
      'Not one man at that table has commanded a storm. They voted against it because they '
      + 'are afraid of it, and they are right to be, and it still needs doing.',
    restraint:
      'You asked them. Asking a question you mean to answer yourself is not asking, and every '
      + 'officer in that room will know which one you did.',
    duty:
      'Congress gave you an army and gave you a council. Overruling it once makes the next '
      + 'vote a formality, and the one after that a performance.',
    vanity:
      'Howe will be remembered for taking a hill. You will be remembered for a winter spent '
      + 'watching one.',
  },
  rejoinders: {
    ambition: 'Every week you wait, another regiment&rsquo;s paper runs out.',
    restraint: 'What you do at this table, you are teaching them to do at every table after it.',
    temper: 'Say it to Gates. He is still sitting there.',
  },
  options: [
    {
      id: 'abide',
      label: 'Abide by the vote',
      full:
        'Record the council&rsquo;s opinion, tell them you are governed by it, and put the '
        + 'assault away.',
      favoured: ['restraint', 'duty'],
      historical: true,
      effects: { legitimacy: 9, character: 7, judgment: 2, loyalty: -3 },
      grants: ['obs.a2.winter_came', 'obs.a2.council_abided'],
      ledger: [{ n: -1200, cause: 'who went home while the army waited out the winter' }],
      result:
        'It is written into the minutes and it is read in Philadelphia within the week: the '
        + 'commander in chief was overruled by his own council and submitted. Nobody thanks '
        + 'you for it. It is the most important thing you do all winter and it does not look '
        + 'like anything at all.',
    },
    {
      id: 'press_it',
      label: 'Press it again tomorrow',
      full:
        'Accept the vote, then reopen the question at the next council, and the one after, '
        + 'until somebody changes their mind.',
      favoured: ['ambition', 'duty'],
      effects: { judgment: 4, legitimacy: -2, loyalty: 2, character: -2 },
      grants: ['obs.a2.winter_came', 'obs.a2.council_pressed'],
      ledger: [{ n: -1200, cause: 'who went home while the army waited out the winter' }],
      result:
        'You put it to them three times and lose three times, and by the third the argument '
        + 'has stopped being about Boston and started being about you. Gates begins writing '
        + 'to people in Philadelphia about the general&rsquo;s judgment, and does not stop for '
        + 'three years.',
    },
    {
      id: 'overrule',
      label: 'Overrule them',
      full:
        'Tell them the decision is yours in law, thank them for their opinions, and order the '
        + 'assault prepared.',
      favoured: ['temper', 'vanity'],
      /*
       * The voice lock of the act.
       *
       * It works the same way Act 2's other lock does and the opposite way to
       * a reward: the worst option on the page is available only to a
       * Washington in whom the fury is genuinely present. A player who has
       * governed himself is quietly protected from the blunder by the man he
       * has become, and is never told he was. A player who has been spending
       * character for the army's love gets it handed to him and has to refuse
       * it himself, which is the actual lesson of the life.
       *
       * 0.46, and the number is not arbitrary. At the opening vector —
       * judgment 48, legitimacy 55, loyalty 40, character 60 — Temper is
       * exactly 0.40, so a threshold of 0.40 would have this option OPEN on
       * the first decision a player ever reaches with it, and a lock that is
       * never shut is decoration. The linter asserts it is shut at the
       * opening vector for precisely this reason, and caught it at 0.40.
       * 0.46 puts it a real distance up the ladder: reachable, and only by a
       * player who has been spending self-government on the army's love.
       */
      voiceLock: { voice: 'temper', min: 0.46 },
      effects: { legitimacy: -14, character: -9, loyalty: 4, judgment: -5 },
      grants: ['obs.a2.winter_came', 'obs.a2.council_overruled'],
      ledger: [
        { n: -1200, cause: 'who went home while the army waited out the winter' },
        { n: -900, cause: 'ordered onto the ice, and not ordered back' },
      ],
      result:
        'The preparations begin and the thaw stops them before the men do, which is the only '
        + 'reason this is not the end of the war. What does not stop is what the fourteen men '
        + 'at that table now know: that the council is a courtesy. Every one of them behaves '
        + 'differently for the rest of the war, and so do you.',
    },
    {
      id: 'write_it_out',
      label: 'Put your reasons in writing',
      full:
        'Abide by it, and set down for Congress exactly why you wanted the assault and exactly '
        + 'why you have not made it — the powder included.',
      requires: 'doc.a2.powder_return',
      lockNote: 'you cannot give Congress your reasons while the chief one is a secret you are keeping from them',
      favoured: ['duty', 'restraint'],
      effects: { legitimacy: 11, character: 6, judgment: 6, loyalty: -4 },
      grants: ['obs.a2.winter_came', 'obs.a2.council_abided', 'obs.a2.reasons_written'],
      ledger: [{ n: -1200, cause: 'who went home while the army waited out the winter' }],
      result:
        'The letter is the reason anyone in Philadelphia still trusts this army in February. '
        + 'It is also, for the first time, the whole truth about the powder in a document you '
        + 'do not control, and you sign it knowing that. Nothing comes of the risk. You take '
        + 'it anyway, which is the point.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A2-D3 — THE ENLISTMENT OF BLACK SOLDIERS
 * ---------------------------------------------------------------------- */

/**
 * PRODUCTION NOTE (BINDING). Do not edit this decision without reading all of
 * this, and do not soften it.
 *
 *  1. NO VOICE ARGUES THIS ON MORAL GROUNDS, because none did in that room.
 *     The council of 8 October voted unanimously to reject enslaved men and
 *     by a great majority to reject Black men altogether, and the reversal on
 *     30 December was argued on manpower and on Dunmore. Writing a
 *     conscience into the Council here would be a lie about the meeting, and
 *     it would be a comfortable lie, which is worse.
 *
 *  2. THREE VOICES. Not four, not five. Temper and Vanity have nothing to say
 *     about this and their silence is the design: the student should be able
 *     to feel that the loudest parts of him are simply not interested. Do not
 *     add a fifth voice to make the page look balanced.
 *
 *  3. PERSONAL CHARACTER DOES NOT MOVE ON ANY BRANCH. No branch is a moral
 *     improvement, because none of them was. Every option here is a
 *     calculation about an army, made by a man who owned people at the time
 *     he made it.
 *
 *  4. THE PLAYER CAN NEVER CHOOSE TO EXCLUDE. There is no option on this
 *     page that bars Black soldiers. The bar is already in force when the
 *     player arrives — voted in October, ordered in November, taught here as
 *     narration and as DOC-A2.7 — and the player's only agency is in ending
 *     it, formalising it, or handing it to somebody else. A branch where a
 *     student gets to vote for the bar turns a historical atrocity into a
 *     gameplay option, and this project does not do that.
 *
 *  5. REVIEW GATE. R5 material. Requires the §7.6 named pedagogical sign-off
 *     before classroom use. Drafted; NOT approved.
 */
export const A2_D3_ENLISTMENT: Decision = {
  id: 'A2-D3',
  prompt:
    'Your own order of the twelfth of November bars them. Dunmore&rsquo;s proclamation is three '
    + 'weeks old and men are already going to him. And free Black men who stood at Concord and '
    + 'on Bunker Hill are being turned away from the recruiting table by officers holding your '
    + 'signature.',
  speaker: 'Joseph Reed',
  portrait: 'reed',
  voices: ['ambition', 'restraint', 'duty'],
  interjections: {
    ambition:
      'Dunmore is offering freedom for a musket and we are offering forty shillings and a '
      + 'refusal. Every man we turn away is a man he does not have to recruit.',
    restraint:
      'The council voted this in October and the southern colonies will read any reversal as '
      + 'you legislating for them from a camp in Massachusetts.',
    duty:
      'They were in the line at Charlestown before you were in this colony. You signed an '
      + 'order removing men from an army they were already serving in.',
  },
  rejoinders: {
    duty: 'Salem Poor is on the roll of that hill. Fourteen officers signed to say so.',
    restraint: 'Whatever you write today, Virginia reads by the fifteenth.',
  },
  options: [
    {
      id: 'free_who_served',
      label: 'Those who have served',
      full:
        'Give the recruiting officers leave to entertain free negroes who have already served '
        + 'in this army, and lay the matter before Congress.',
      favoured: ['duty', 'restraint'],
      historical: true,
      effects: { judgment: 5, legitimacy: 2, loyalty: 3 },
      grants: ['obs.a2.enlistment_opened'],
      ledger: [{ n: 500, cause: 'free Black soldiers who re-enlisted when the order was reversed' }],
      result:
        'It goes into General Orders on the thirtieth of December, in fifty-one words, and it '
        + 'is the narrowest possible reversal: free men, already served, subject to a Congress '
        + 'that has not been asked yet. Congress lets it stand by not objecting. Men who were '
        + 'turned away in November are in the ranks in January under exactly the same officers.',
    },
    {
      id: 'all_free_men',
      label: 'Any free man',
      full:
        'Strike the bar entirely as to free men, served or not, on your own authority and '
        + 'without waiting for Philadelphia.',
      favoured: ['ambition', 'duty'],
      effects: { loyalty: 6, judgment: 4, legitimacy: -7 },
      grants: ['obs.a2.enlistment_opened', 'obs.a2.enlistment_wide'],
      ledger: [{ n: 900, cause: 'free Black men who enlisted when the bar came off' }],
      result:
        'The regiments fill faster than they have all winter. Two southern delegates write to '
        + 'ask by what authority the commander in chief has set aside a resolution of his own '
        + 'council, and the answer — that he had none — is true and is not given. It stands '
        + 'because nobody with the power to reverse it wants the argument in public.',
    },
    {
      id: 'send_to_congress',
      label: 'Send it to Congress',
      full:
        'Decide nothing. Put the whole question to Philadelphia and enlist no one either way '
        + 'until they answer.',
      favoured: ['restraint'],
      effects: { legitimacy: 4, judgment: -6, loyalty: -4 },
      ledger: [{ n: -600, cause: 'turned away at the recruiting table while the question was referred' }],
      result:
        'Congress takes eleven weeks and answers narrowly, and in those eleven weeks the '
        + 'recruiting officers go on turning men away because your November order is still the '
        + 'standing one. Referring a question is not the same as not answering it. The men at '
        + 'the table were answered.',
    },
    {
      id: 'answer_dunmore',
      label: 'Say why, in orders',
      full:
        'Open it, and state the reason in General Orders in plain terms: the enemy has offered '
        + 'freedom for service and this army will not be outbid for men.',
      requires: 'doc.a2.black_enlistment',
      lockNote: 'you have not read your own orders on this and cannot cite what you have not read',
      favoured: ['ambition', 'duty'],
      effects: { judgment: 7, loyalty: 4, legitimacy: -3 },
      grants: ['obs.a2.enlistment_opened', 'obs.a2.dunmore_named'],
      ledger: [{ n: 700, cause: 'free Black men who enlisted when the bar came off' }],
      result:
        'It is the clearest thing you write all winter and the least creditable. Set down in '
        + 'orders, for every officer to read, is the sentence that these men are wanted because '
        + 'the other side wants them — and every man who enlists under it can read it too, and '
        + 'does, and enlists anyway.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A2-D4 — THE ENLISTMENTS
 * ---------------------------------------------------------------------- */

/**
 * Carried over, almost word for word, from the authored CB-03. The situation
 * is documented: the Connecticut regiments' terms ran out in early December
 * 1775 and a large part of them went home over the appeals of Washington and
 * of their own officers. Sergeant Starr is invented and labelled as invented
 * in `act2-people.ts`; the position he is standing in is not.
 */
export const A2_D4_ENLISTMENTS: Decision = {
  id: 'A2-D4',
  prompt:
    'His time is up on the tenth of December, and it is up for eleven hundred others on the '
    + 'same page. He has not asked to desert. He has asked whether the paper he signed means '
    + 'what it says.',
  speaker: 'Sergeant Starr',
  portrait: 'starr',
  voices: ['duty', 'temper', 'restraint', 'ambition', 'vanity'],
  interjections: {
    duty:
      'He signed for eight months and he has served eight months. A contract you keep only '
      + 'while it suits you is not a contract, and this whole quarrel is about contracts.',
    temper:
      'Eleven hundred men walking down that road in December, in front of the enemy, and we '
      + 'are to shake their hands for it.',
    restraint:
      'Hold one man past his term and you have told the other eleven hundred exactly what '
      + 'their paper is worth. They will not wait for December.',
    ambition:
      'Offer them money. Congress will find it, and a man who re-enlists for a bounty is '
      + 'still a man standing on this hill in January.',
    vanity:
      'It will be said of you either that you kept an army or that you let one walk home. '
      + 'Only one of those is said kindly.',
  },
  rejoinders: {
    duty: 'Eight months is what the paper says. You have read it.',
    restraint: 'Whatever you do on the tenth, you will do again next December.',
    temper: 'Starr is standing there. Say it to him, not to the roll.',
  },
  options: [
    {
      id: 'let_go',
      label: 'Their time is their own',
      full:
        'Say it plainly and in orders: every man goes on the day his paper says, with his pass '
        + 'signed and no word against him.',
      favoured: ['duty', 'restraint'],
      historical: true,
      effects: { character: 6, legitimacy: 4, loyalty: -5 },
      ledger: [{ n: 900, cause: 'who meant to go, and did not' }],
      result:
        'They go, and it is worse than you feared and better than it might have been — the '
        + 'ones who go say where they are going, and a few hundred who meant to go do not. You '
        + 'have kept the thing the paper stood for, and paid for it in men.',
    },
    {
      id: 'hold_them',
      label: 'Hold them to the spring',
      full: 'Nobody leaves this hill while the enemy is a mile off it, paper or no paper.',
      favoured: ['temper'],
      /*
       * 0.44. The recovered draft of this decision had 0.38, chosen against
       * an older opening vector; under the shipped one Temper starts at
       * exactly 0.40 and 0.38 would have left the worst option on the page
       * open from the first minute of the act. Raised, and the linter now
       * asserts every voice lock is shut at the opening vector so it cannot
       * drift back.
       */
      voiceLock: { voice: 'temper', min: 0.44 },
      effects: { loyalty: 3, legitimacy: -6, character: -4 },
      ledger: [
        { n: 1400, cause: 'held past the date on their paper' },
        { n: -1100, cause: 'who left in January without asking anybody' },
      ],
      result:
        'The order goes out and by nightfall every man in camp knows what his enlistment is '
        + 'worth, which is nothing. Two companies go anyway. You cannot try them all, and not '
        + 'trying them is worse than the going.',
    },
    {
      id: 'bounty',
      label: 'Offer a bounty to stay',
      full: 'Ask Congress for money and furloughs, and buy the winter one regiment at a time.',
      favoured: ['ambition', 'vanity'],
      effects: { judgment: 5, legitimacy: -2, character: -1 },
      ledger: [{ n: 2600, cause: 're-enlisted for the bounty' }],
      result:
        'It works, at a price you will be paying for eight years: from now on the men know the '
        + 'army bids for them, and every December it will have to bid higher.',
    },
    {
      id: 'appeal',
      label: 'Stand up and ask them',
      full:
        'No order and no money. Go along the line, tell them exactly what December means, and ask.',
      requires: 'obs.a2.enlistment_roll',
      lockNote: 'you have not read the roll, and cannot ask for what you cannot count',
      favoured: ['duty', 'vanity', 'restraint'],
      effects: { character: 5, loyalty: 4, legitimacy: 2, judgment: -2 },
      ledger: [{ n: 1100, cause: 'who stayed because you asked them to' }],
      result:
        'You are not a speaker and everybody knows it, which is most of why it lands. Some '
        + 'stay. Not enough. But the ones who stay have chosen it in front of the ones who did '
        + 'not, and that is a different army from the one you had this morning.',
    },
  ],
};

/** Every Act 2 decision, for the linter and for the ledger. */
export const ACT2_DECISIONS: Decision[] = [
  A2_D1_POWDER, A2_D2_COUNCIL, A2_D3_ENLISTMENT, A2_D4_ENLISTMENTS,
];
