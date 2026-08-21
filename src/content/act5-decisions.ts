/**
 * The four decisions of Act 5.
 *
 * THE FIXED LOSS (R20), stated first, because all four are written against
 * it:
 *
 *   **About two thousand men die at Valley Forge on every branch.** Nothing
 *   improves it. Not the inoculation, not the Committee at Camp, not von
 *   Steuben, not the alliance. The ration returns get better in March and
 *   men keep dying through April and May, because they were already sick and
 *   because sickness follows the thaw. Every death the reckoning names is a
 *   real cause from the record.
 *
 *   The inoculation decision is the one place where this needs stating very
 *   carefully, because it is easy to write it as a lifesaver and it was one:
 *   variolation cut smallpox mortality from roughly one in five to roughly
 *   one in seventy. But smallpox was not what killed most of the men here.
 *   Typhus, typhoid and dysentery were, and no eighteenth-century decision
 *   touches those. So `A5-D1` changes the CAUSE of death on part of the
 *   ledger and barely moves the total, and the reckoning shows both.
 *
 * `A5-D2` is the sealed one, and it is the most epistemologically honest
 * decision in the game: the player is asked to act on a quotation that has
 * reached them through three men, the last of whom was drinking, from a
 * letter nobody has ever produced. The first option — the one he actually
 * took — is knowledge-locked on `DOC-A5.3`, because you cannot send a man
 * his own reported words if you have not read them.
 */

import type { Decision } from '../types';

/* ---------------------------------------------------------------------- *
 * A5-D1 — THE INOCULATION
 * ---------------------------------------------------------------------- */

/**
 * The best "beyond the standards" item in the first half of this game, and
 * the reason is that almost nobody has heard of it.
 *
 * Every student has been told about Valley Forge and none of them have been
 * told that the commanding general ordered his entire army deliberately
 * infected with smallpox, in secret, in the face of an enemy, and that it
 * is one of the most consequential public-health decisions in American
 * history. It is a command decision with a body count on both sides of the
 * ledger and no comfortable answer, which is exactly the kind of decision
 * this game exists to put a student inside.
 */
export const A5_D1_POX: Decision = {
  id: 'A5-D1',
  prompt:
    'Variolation. Cut smallpox matter into a healthy man&rsquo;s arm on purpose. He is ill for '
    + 'three weeks, he is contagious for all of them, and a small number of them die of it. The '
    + 'alternative is what the disease does when it is left to itself.',
  speaker: 'Dr. Cochran',
  portrait: 'cochran',
  voices: ['duty', 'ambition', 'restraint'],
  interjections: {
    duty:
      'You will make three thousand men unfit for duty on purpose, in front of an enemy, and you '
      + 'cannot tell one person outside this hut why.',
    ambition:
      'Howe is twenty miles away in Philadelphia with a healthy army. This is the only weapon in '
      + 'this camp you can actually use this winter.',
    restraint:
      'Some of them will die of it, and there will be a name and a regiment against each one, and '
      + 'you will have signed the order that put it there.',
  },
  rejoinders: {
    ambition:
      'It is one man in seventy against one man in five. You have made worse bets than that with '
      + 'less arithmetic behind them.',
  },
  options: [
    {
      id: 'whole',
      label: 'The whole army, in secret',
      full:
        'Inoculate the whole army, by regiment, in rotation, and let nothing about it appear in '
        + 'any letter that could be read by anybody.',
      favoured: ['ambition', 'duty'],
      historical: true,
      effects: { judgment: 6, loyalty: -4, character: 3 },
      grants: ['obs.a5.pox_all', 'obs.a5.pox_settled'],
      ledger: [
        { n: -47, cause: 'died of the inoculation itself, in the hospital huts' },
        { n: 1100, cause: 'who did not take the smallpox, because they had already had it on purpose' },
      ],
      result:
        'Regiment by regiment, into isolation, in rotation, so that never more than a part of the '
        + 'army is down at once. Forty-seven men die of it and their names are in the returns. '
        + 'Smallpox does not sweep this camp, and no one will ever be able to prove that it would '
        + 'have, which is the permanent condition of a decision that works.',
    },
    {
      id: 'recruits',
      label: 'New recruits only',
      full:
        'Inoculate the new men as they come in, and leave the veterans alone. Most of them have '
        + 'had it already and the ones who have not have been lucky for two years.',
      favoured: ['restraint'],
      effects: { judgment: 2, loyalty: -1 },
      grants: ['obs.a5.pox_recruits', 'obs.a5.pox_settled'],
      ledger: [
        { n: -12, cause: 'died of the inoculation, among the recruits' },
        { n: -180, cause: 'died of smallpox in the regiments that were not inoculated' },
      ],
      result:
        'A real compromise, and it is the one most of the medical men would have advised. The '
        + 'recruits come through. It goes through two of the older regiments in March anyway, '
        + 'because luck is not a policy, and a hundred and eighty men are buried out of them.',
    },
    {
      id: 'quarantine',
      label: 'Quarantine only',
      full:
        'No inoculation. Isolate every case as it appears, burn the bedding, and keep the sick '
        + 'out of the huts.',
      favoured: ['restraint'],
      effects: { judgment: -5, loyalty: 2 },
      grants: ['obs.a5.pox_none', 'obs.a5.pox_settled'],
      ledger: [
        { n: -420, cause: 'died of smallpox, which was not inoculated against' },
      ],
      result:
        'This was the policy before 1777 and it is not stupid: it is what every army in Europe '
        + 'did. Quarantine in a camp of eleven thousand men with no drains does what quarantine '
        + 'does in a camp of eleven thousand men with no drains. Four hundred and twenty men are '
        + 'buried out of it and Dr. Cochran stops asking.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A5-D2 — THE CABAL.  SEALED.
 * ---------------------------------------------------------------------- */

/**
 * SEALED, on the edge of the Grand Parade, in April.
 *
 * THE TIMING IS THE DESIGN. `docs/05` §5.2 puts this decision here rather
 * than in the Potts house, and it is right to: the answer to the Cabal was
 * only possible to give because the army on the field below was visibly
 * becoming an army. A man who had nothing to show could not have written
 * that letter. The player makes this decision looking at a hundred men
 * moving as one unit, and the game does not say a word about why they are
 * standing there.
 *
 * THE FIRST OPTION IS KNOWLEDGE-LOCKED and the lock is the whole teaching:
 * you cannot send Conway his own reported words back if you have not read
 * what he is reported to have said.
 */
export const A5_D2_CABAL: Decision = {
  id: 'A5-D2',
  prompt:
    'Conway. Gates. Mifflin, who held the rearguard for you on Long Island. A sentence you have '
    + 'seen only in somebody&rsquo;s account of somebody&rsquo;s account of a letter. And Congress '
    + 'has made your critic Inspector General over your head without asking you.',
  speaker: 'Alexander Hamilton',
  portrait: 'hamiltonVF',
  sealed: true,
  voices: ['temper', 'vanity', 'restraint', 'duty'],
  interjections: {
    temper:
      'Gates has never once written to you directly about any of this. He writes to Congress '
      + 'about you. Answer the man, not the committee.',
    vanity:
      'They are saying at York that Saratoga was won by a better general. Let that stand a month '
      + 'longer and it will simply be true.',
    restraint:
      'One sentence, at third hand, from a man who was drinking when he repeated it. Build nothing '
      + 'on that you would not build on rumour.',
    duty:
      'Congress appointed him. If you fight Congress&rsquo;s appointment you are fighting '
      + 'Congress, and you will lose that whoever wins this.',
  },
  rejoinders: {
    restraint:
      'And note what you are not being offered: a way to find out. There is no way to find out. '
      + 'There was never going to be.',
  },
  options: [
    {
      id: 'sentence',
      label: 'Send him the sentence',
      full:
        'Write to Conway. Quote the one sentence, exactly as it reached you, with no comment '
        + 'whatever on it. Forward everything to Congress. Say nothing in public and nothing to '
        + 'the army.',
      favoured: ['restraint', 'duty'],
      historical: true,
      requires: 'doc.a5.conway',
      lockNote: 'you have not read what Conway is reported to have written',
      effects: { judgment: 4, legitimacy: 7, character: 5, loyalty: 2 },
      grants: ['obs.a5.cabal_letter', 'obs.a5.cabal_settled'],
      result:
        'Three lines. The sentence, and the words &ldquo;I am, Sir, your most obedient servant.&rdquo; '
        + 'Conway receives a quotation of himself with no accusation attached to it and no request '
        + 'for explanation, and has to decide alone what is known and by whom. He answers badly, '
        + 'then worse, then resigns in April expecting to be begged to stay, and is not. Everything '
        + 'else goes to Congress unedited. You never mention it to the army.',
    },
    {
      id: 'silence',
      label: 'Say nothing at all',
      full: 'Let it burn out. Answer no letters, make no complaint, and continue.',
      favoured: ['restraint'],
      effects: { legitimacy: -3, character: 2, judgment: -2 },
      grants: ['obs.a5.cabal_silent', 'obs.a5.cabal_settled'],
      result:
        'It very nearly does burn out on its own, and the risk was real: it burns out slowly, and '
        + 'while it is burning a Board of War with Gates at its head plans a winter expedition to '
        + 'Canada under Lafayette without consulting you at all. Nobody is ever able to say that '
        + 'you fought it, which is worth something, and nobody is ever quite sure you could have.',
    },
    {
      id: 'resign',
      label: 'Offer to resign',
      full:
        'Write to Congress that if they have found a better man they should have him, and that '
        + 'you will go home when they say so.',
      favoured: ['vanity', 'duty'],
      effects: { legitimacy: 2, character: -4, loyalty: 5, judgment: -3 },
      grants: ['obs.a5.cabal_resign', 'obs.a5.cabal_settled'],
      result:
        'He hinted at this obliquely, more than once, in his own letters, and never did it. Done '
        + 'plainly it works, and it works the way a threat works. Congress will not take it. The '
        + 'army hears about it within a week and is furious on your behalf, which is exactly what '
        + 'you wanted and is exactly what you will not be able to say you did not want.',
    },
    {
      id: 'public',
      label: 'Answer in general orders',
      full:
        'Name them. In general orders, to the whole army, in writing, and let the country read it '
        + 'in the newspapers a fortnight from now.',
      favoured: ['temper'],
      effects: { legitimacy: -8, loyalty: 6, character: -6 },
      grants: ['obs.a5.cabal_public', 'obs.a5.cabal_settled', 'obs.a5.temper_loud'],
      result:
        'The army adores it. It is read at the head of every regiment and cheered at most of them. '
        + 'It is also a general officer using the army&rsquo;s own parade as a platform against '
        + 'the civil government that appointed him, on the strength of a sentence he cannot '
        + 'source, and there are men in Congress who will remember it for twenty years. Temper is '
        + 'louder in this man from today onward, and he will not get it back down.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A5-D3 — VON STEUBEN'S METHOD
 * ---------------------------------------------------------------------- */

/**
 * This looks like an administrative footnote and it is the reason the army
 * worked.
 *
 * In every European army an officer held a commission and a serjeant
 * drilled the men, and an officer who drilled his own company personally
 * was doing a serjeant's job in front of gentlemen. Von Steuben's system
 * required exactly that. `DOC-A5.2` chapter IV says so in one line, and the
 * officers of this army read that line and understood precisely what it
 * meant about them.
 *
 * The option to enforce it costs Legitimacy, because several officers
 * resigned over it and said why, and it is still the right answer.
 */
export const A5_D3_DRILL: Decision = {
  id: 'A5-D3',
  prompt:
    'His system requires that officers drill their own companies. Personally, on the field, in '
    + 'front of everybody, in the mud, every day. Not the serjeants. Them.',
  speaker: 'Baron von Steuben',
  portrait: 'steuben',
  voices: ['duty', 'ambition', 'vanity'],
  interjections: {
    duty:
      'An officer who cannot teach a man to load has no business ordering him to. That has been '
      + 'true in this army since Kip&rsquo;s Bay and nobody has said it out loud.',
    ambition:
      'It is the only thing anybody has proposed all winter that costs nothing and changes '
      + 'something. Take it.',
    vanity:
      'Half of them bought their way to those commissions on the understanding that this was '
      + 'precisely the work they would not be doing.',
  },
  options: [
    {
      id: 'enforce',
      label: 'Order it, and enforce it',
      full:
        'In general orders. Every officer drills his own company, beginning tomorrow, and an '
        + 'officer who will not may consider whether he wants the commission.',
      favoured: ['duty', 'ambition'],
      historical: true,
      effects: { judgment: 5, loyalty: 6, legitimacy: -2 },
      grants: ['obs.a5.drill_all', 'obs.a5.drill_settled'],
      result:
        'It goes out in general orders and it is obeyed, sullenly at first. Several officers '
        + 'resign and one of them writes to a Philadelphia paper about it. By the end of May a '
        + 'brigade of this army can change front under fire, which not one brigade of it could do '
        + 'in September, and the men know exactly who taught them.',
    },
    {
      id: 'model',
      label: 'The model company only',
      full:
        'Let him have his hundred men and let him do as he likes with them. Nothing is ordered '
        + 'for anybody else.',
      favoured: ['vanity'],
      effects: { judgment: 2 },
      grants: ['obs.a5.drill_model', 'obs.a5.drill_settled'],
      result:
        'The model company becomes very good and nothing else does. It spreads anyway, slowly, '
        + 'because officers who watch it want their own companies to look like that — but it '
        + 'spreads through envy rather than through orders, which takes until autumn instead of '
        + 'until June, and June is when it is needed.',
    },
    {
      id: 'refuse',
      label: 'Refuse it',
      full:
        'The Baron may write his regulations. He may not tell the gentlemen of this army to do '
        + 'the work of serjeants.',
      favoured: ['vanity'],
      effects: { judgment: -4, loyalty: -3, legitimacy: 2 },
      grants: ['obs.a5.drill_none', 'obs.a5.drill_settled'],
      result:
        'The officer corps is grateful and says so. The manual is written anyway and printed next '
        + 'year and used by the army for thirty years, and the men who need it this June are '
        + 'taught it by serjeants who half understand it. At Monmouth, in three weeks, the line '
        + 'holds — but it holds because Lee&rsquo;s retreat was stopped by one man on a horse, and '
        + 'that is not a system.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A5-D4 — THE COMMITTEE AT CAMP
 * ---------------------------------------------------------------------- */

/**
 * Congress sent five men to find out what was wrong. They stayed three
 * months, saw it, wrote it down accurately, and could not fix it, because
 * supply depended on the states requisitioning and the states would not.
 *
 * That is what makes this decision honest: the historical option produces a
 * marginal, late improvement and the game says so in the result text. A
 * game that rewarded candour with a full commissariat would be teaching
 * something false about how the Confederation worked.
 */
export const A5_D4_COMMITTEE: Decision = {
  id: 'A5-D4',
  prompt:
    'Five men of Congress are in this camp for three months to find out why the army complains so '
    + 'much. One of them has already asked whether the returns are exaggerated.',
  speaker: 'Francis Dana',
  portrait: 'dana',
  voices: ['temper', 'duty', 'restraint'],
  interjections: {
    temper:
      'Exaggerated. Walk him up the second rank and let him count the men who cannot come out of '
      + 'the hut because they have nothing to put on.',
    duty:
      'They came. That is more than the last committee did. Whatever else they are, they are here '
      + 'in February and they did not have to be.',
    restraint:
      'They cannot fix it whatever they see. Supply runs through thirteen states and not one of '
      + 'them has to do anything. Be careful what you spend on making a point.',
  },
  options: [
    {
      id: 'show',
      label: 'Show them',
      full:
        'Take them through the huts. All of them. Let them count, let them read the returns '
        + 'against what they can see, and do not clean anything up first.',
      favoured: ['duty', 'temper'],
      historical: true,
      requires: 'doc.a5.naked',
      lockNote: 'you have not the return in front of you to walk them through',
      effects: { legitimacy: 5, character: 4 },
      grants: ['obs.a5.committee_shown', 'obs.a5.committee_settled'],
      ledger: [{ n: 260, cause: 'who lived because the supply improved in March, marginally and late' }],
      result:
        'They see it, and they write it down, and their report to Congress is accurate and '
        + 'unsparing and recommends a reorganisation of the commissariat. Some of it is adopted. '
        + 'Beef reaches the camp more often from March. It is a marginal improvement and it is '
        + 'late and it is real, and it is the most that could be got, because Congress could ask '
        + 'the states and could not make them.',
    },
    {
      id: 'paper',
      label: 'A return and a good dinner',
      full:
        'Give them the figures in writing, feed them properly, and let them go home with a clear '
        + 'sense that the army is being well handled.',
      favoured: ['restraint'],
      effects: { legitimacy: 2, character: -2 },
      grants: ['obs.a5.committee_paper', 'obs.a5.committee_settled'],
      result:
        'They go away satisfied and their report is temperate and recommends very little. Nothing '
        + 'changes in the commissariat. Nobody in this camp ever learns that the choice was made, '
        + 'which is the only merciful thing about it.',
    },
    {
      id: 'threat',
      label: 'Let them infer a threat',
      full:
        'Tell them plainly that this army will dissolve, and let them work out for themselves '
        + 'what a general with a dissolving army and no orders might do about it.',
      favoured: ['temper', 'ambition'],
      effects: { legitimacy: -4, loyalty: 3, judgment: 2 },
      grants: ['obs.a5.committee_threat', 'obs.a5.committee_settled'],
      result:
        'It moves them faster than candour did, and the supply improves a fortnight sooner than it '
        + 'otherwise would have. It also puts into the head of every man on that committee the '
        + 'idea that the Continental Army is a thing that might one day have to be managed rather '
        + 'than commanded, and there are five of them, and they go back to Congress and stay there '
        + 'for years.',
    },
  ],
};

export const ACT5_DECISIONS: Decision[] = [
  A5_D1_POX, A5_D2_CABAL, A5_D3_DRILL, A5_D4_COMMITTEE,
];
