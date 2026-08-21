/**
 * The three decisions of Act 4.
 *
 * THE FIXED LOSS (R20), stated first because both of the big decisions are
 * written against it:
 *
 *   **The enlistments still expire on 31 December, and Trenton does not fix
 *   it.** Even after the victory, most of the army walks. What the player's
 *   Trenton buys is six weeks, bought with a ten-dollar bounty pledged on
 *   Washington's own credit, and six weeks is not a solution.
 *
 *   And: **the crossing runs three hours late on every branch.** There is no
 *   option that gets across on time, because there was none. The ice took as
 *   long as it took.
 *
 * `A4-D2` is the sealed one and it is the best-known decision in American
 * history, which is a problem: every student already knows he went. So the
 * job of the writing is to make the alternative genuinely respectable. Several
 * officers urged turning back and they were not cowards and they were not
 * wrong on the facts — three hours late, sunrise at seven, nine miles to
 * march, and a garrison that had been warned. Turning back is NOT a fail
 * state. The act continues. The game never says the player was wrong.
 */

import type { Decision } from '../types';

/* ---------------------------------------------------------------------- *
 * A4-D1 — THE BOUNTY
 * ---------------------------------------------------------------------- */

/**
 * The third option here is the first time in the game that the SAME WORDS
 * produce a different outcome depending on a hidden stat.
 *
 * Appealing to the regiments on their honour, with no money, works if the
 * army loves him and fails if it does not — and the player is never told
 * which it was going to be, before or after. They said the same sentence
 * either way. This is the mechanic `docs/05` §4.4 asks for and it is the
 * cleanest possible demonstration that Loyalty is a thing that has been
 * accumulating for four hours of play.
 */
export const A4_D1_BOUNTY: Decision = {
  id: 'A4-D1',
  prompt:
    'Every enlistment in this army expires on the thirty-first of December, which is six days '
    + 'away. There are about two and a half thousand men here fit for duty. There is no money, '
    + 'and Congress has left Philadelphia.',
  speaker: 'Sergeant Young',
  portrait: 'young',
  voices: ['duty', 'temper', 'ambition', 'restraint', 'vanity'],
  interjections: {
    duty:
      'You are promising money that does not exist, out of a treasury that does not exist, in '
      + 'your own name.',
    temper:
      'They have been paid in paper for eighteen months. Try paper again and see what the drum '
      + 'sounds like.',
    ambition:
      'Ten dollars a man for six weeks. Six weeks is one campaign, and one campaign is all this '
      + 'needs to be.',
    restraint:
      'Ask Congress and wait for an answer, and the men you are asking about will have gone home '
      + 'before it comes.',
    vanity:
      'Stand in front of them and ask. They will not refuse you to your face and you know it.',
  },
  rejoinders: {
    temper: 'Say a number out loud in front of them or do not open your mouth.',
    duty: 'Whatever you pledge tonight, somebody has to pay in February.',
  },
  options: [
    {
      id: 'own_credit',
      label: 'Pledge it yourself',
      full:
        'Ten dollars in hard money to every man who stays six weeks, on your own credit, and write '
        + 'to Morris in the morning to find it.',
      favoured: ['ambition', 'duty'],
      historical: true,
      effects: { loyalty: 6, character: 4, legitimacy: -2 },
      grants: ['obs.a4.bounty_pledged', 'obs.a4.bounty_settled'],
      ledger: [{ n: 1400, cause: 'who took the ten dollars and stayed six weeks' }],
      result:
        'Morris goes round Philadelphia on New Year&rsquo;s Day borrowing coin from private people '
        + 'on his own signature and sends up what he can in a variety of coin. The men take it. '
        + 'Rather more than half of them stay, which is more than anybody in this camp expected '
        + 'and a very long way from all of them.',
    },
    {
      id: 'ask_congress',
      label: 'Ask Congress and wait',
      full: 'Write to Philadelphia for authority and money, and put the question to the men after.',
      requires: 'doc.a4.reenlist',
      lockNote: 'you have not read the engagement they would be signing and cannot ask for authority over a form you have not seen',
      favoured: ['restraint'],
      effects: { loyalty: -5, legitimacy: 1 },
      grants: ['obs.a4.bounty_referred', 'obs.a4.bounty_settled'],
      ledger: [{ n: 600, cause: 'who re-engaged while the question was still in Philadelphia' }],
      result:
        'Congress is at Baltimore, the roads are what they are in December, and the answer will '
        + 'take twelve days. On the thirty-first the papers run out on schedule and about two in '
        + 'five of the men who might have stayed have already gone, because nobody had anything '
        + 'to offer them on the day they were asked.',
    },
    {
      id: 'appeal',
      label: 'Ask them, with nothing',
      full:
        'No money and no promise of any. Ride down the line, tell them plainly what six weeks '
        + 'means, and ask them to stay.',
      favoured: ['vanity', 'duty'],
      /*
       * THE SAME WORDS, TWO OUTCOMES.
       *
       * There is no lock on this option and no warning. The result text is
       * chosen at resolution time from the player's Loyalty — see
       * `main.ts`'s `resultFor`. Above 55 they stay; below it they do not,
       * and the player is never told which case they were in, before or
       * after.
       *
       * The effects listed here are the FAVOURABLE case. `main.ts` swaps in
       * the other set when the stat is short, which is the only place in
       * the game where an option's arithmetic is not fully authored on the
       * option — and it is the point of the option.
       */
      effects: { loyalty: 2, character: 3 },
      grants: ['obs.a4.bounty_appeal', 'obs.a4.bounty_settled'],
      ledger: [{ n: 900, cause: 'who stayed because they were asked and for no other reason' }],
      result:
        'You are not a speaker and everybody knows it. You tell them what the thirty-first means, '
        + 'and that you have nothing whatever to give them, and you ask. The drums beat. The '
        + 'sergeants call for men to step forward.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A4-D2 — GO ON.  SEALED.
 * ---------------------------------------------------------------------- */

/**
 * SEALED, at four in the morning, on the far bank, three hours behind.
 *
 * The alternative is genuinely defensible and the writing has to keep it
 * that way. Turning back is not punished with a fail state, a lecture or a
 * lower score. It produces a different act: a smaller, later, uglier action
 * at Trenton on 2 January instead, the war goes on, and Washington writes a
 * letter to Congress he does not want to write.
 *
 * `docs/05` §4.4: *"That is the whole of the punishment and it is enough."*
 */
export const A4_D2_GO_ON: Decision = {
  id: 'A4-D2',
  prompt:
    'It is four in the morning. The last of the guns came over an hour ago and you are three '
    + 'hours behind. Sunrise is at seven, Trenton is nine miles down that road, and it has been '
    + 'sleeting since midnight.',
  speaker: 'Colonel Glover',
  portrait: 'glover',
  sealed: true,
  voices: ['restraint', 'ambition', 'duty', 'temper', 'vanity'],
  interjections: {
    restraint:
      'Three hours late. Sunrise at seven. You will be marching in daylight toward men who have '
      + 'been warned.',
    ambition:
      'Two thousand four hundred men are on the wrong bank. There is no version of this where you '
      + 'take them back and keep them.',
    duty:
      'The enlistments expire on the thirty-first. After that you do not command an army. You '
      + 'command a rumour.',
    temper:
      '<em>Victory or Death.</em> You gave them that for a password. Say the second half out loud '
      + 'in front of them and see what it costs.',
    vanity:
      'Nobody has beaten a European regiment in the field in this war. Not once, not anywhere.',
  },
  rejoinders: {
    restraint: 'Glover is waiting. His men have been in the water since eleven.',
    ambition: 'Whatever you do in the next minute, you do it in the dark and alone.',
  },
  options: [
    {
      id: 'go_on',
      label: 'Go on',
      full:
        'Form the columns on the road and march. Accept that you will attack in daylight against '
        + 'a garrison that has been warned.',
      favoured: ['ambition', 'duty', 'temper'],
      historical: true,
      effects: { judgment: 5, loyalty: 8, legitimacy: 6, character: 2 },
      grants: ['obs.a4.went_on'],
      ledger: [
        { n: -2, cause: 'frozen to death on the road between the ferry and Birmingham' },
        { n: -4, cause: 'wounded in the town, one of them shot through both hands' },
      ],
      result:
        'Nine miles in four hours in sleet, in two columns, on a road with ice on it. Sullivan '
        + 'sends word that his men cannot keep their powder dry and you send back that they are to '
        + 'use the bayonet. It is eight in the morning and full daylight when the first shot is '
        + 'fired at the head of King Street, and it is over in forty-five minutes.',
    },
    {
      id: 'turn_back',
      label: 'Turn back',
      full:
        'Recross while it is still dark, get the men under cover, and take the enemy another day '
        + 'on better terms.',
      favoured: ['restraint'],
      effects: { judgment: -2, loyalty: -8, legitimacy: -6 },
      grants: ['obs.a4.turned_back'],
      ledger: [{ n: -9, cause: 'lost to exposure recrossing in the dark' }],
      result:
        'It is the correct decision on the facts in front of you and every officer who urged it '
        + 'was right about all of them. The army recrosses. It holds together, barely, through the '
        + 'thirty-first, and on the second of January there is a smaller, later, uglier action at '
        + 'Trenton that costs more and is never painted. The war goes on. Nobody says you were '
        + 'wrong, then or since, except you.',
    },
    {
      id: 'half',
      label: 'Send only what is across',
      full:
        'Send the column already formed and hold the rest on this bank against the road back.',
      favoured: ['vanity'],
      effects: { judgment: -5, loyalty: -3, legitimacy: -3 },
      grants: ['obs.a4.went_on', 'obs.a4.split_force'],
      ledger: [
        { n: -2, cause: 'frozen to death on the road between the ferry and Birmingham' },
        { n: -70, cause: 'lost in a town entered by one road instead of two' },
      ],
      result:
        'One column into a town with two streets, and the other two thousand men standing in the '
        + 'sleet on the wrong side of a river listening to it. It works, at a price, because Rall '
        + 'forms in the street instead of getting out of the town. Ewing never crossed at all and '
        + 'Cadwalader got men over and no guns, and neither of those was ever going to be '
        + 'different.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A4-D3 — THE PRISONERS
 * ---------------------------------------------------------------------- */

/**
 * Nine hundred men, and all three of these things happened.
 *
 * They were marched through Philadelphia as a spectacle, in the streets, for
 * the effect on public opinion — and it worked, and it was a humiliation
 * arranged deliberately. They were also quartered among the Pennsylvania
 * Germans, who spoke to them in their own language, and a substantial number
 * never went home. And the baggage was plundered.
 *
 * The player picks the emphasis. None of the options is clean.
 */
export const A4_D3_PRISONERS: Decision = {
  id: 'A4-D3',
  prompt:
    'Nine hundred and some prisoners forming up in the sleet in a street they were quartered in '
    + 'yesterday. They are conscripts rented out by their own prince, they do not speak English, '
    + 'and they are the first thing this war has produced that looks like a victory.',
  speaker: 'A Hessian',
  portrait: 'hessianPrisoner',
  voices: ['vanity', 'ambition', 'restraint', 'duty'],
  interjections: {
    vanity:
      'March them down Market Street. Every man in Philadelphia who has been saying this army is '
      + 'finished can stand on the pavement and count them.',
    ambition:
      'Nine hundred prisoners is nine hundred arguments for the recruiting officers. Use them '
      + 'while they are worth something.',
    restraint:
      'What you do to prisoners is read by the men who hold four thousand of yours in the hulks '
      + 'at Wallabout.',
    duty:
      'They did not choose to come. Their prince was paid seven pounds a head for them and they '
      + 'were not.',
  },
  rejoinders: {
    restraint: 'Your own men are in prison ships in New York this morning.',
  },
  options: [
    {
      id: 'parade',
      label: 'March them through Philadelphia',
      full:
        'Send them down to Philadelphia under guard and through the streets, where the whole city '
        + 'can see them.',
      favoured: ['vanity', 'ambition'],
      historical: true,
      effects: { legitimacy: 4, character: -3 },
      grants: ['obs.a4.paraded'],
      result:
        'It is a spectacle and it is arranged to be one, and it does more for recruiting in a '
        + 'fortnight than anything since the Declaration. It is also nine hundred exhausted men '
        + 'walked through a jeering city because it is useful, and everybody involved knows the '
        + 'difference between the two sentences.',
    },
    {
      id: 'quarter',
      label: 'Quarter them in the German country',
      full:
        'Send them into Pennsylvania among the German farmers, as prisoners of war, and let them '
        + 'work.',
      favoured: ['duty', 'restraint'],
      historical: true,
      effects: { character: 5, judgment: 3 },
      grants: ['obs.a4.quartered'],
      result:
        'They go up into Lancaster and York counties among people who speak to them in their own '
        + 'language, and a great many of them work, and a substantial number of them never go '
        + 'home at all. It is the cheapest recruiting the American cause ever does and nobody '
        + 'plans it.',
    },
    {
      id: 'plunder',
      label: 'Let the men have the baggage',
      full:
        'Say nothing about the Hessian baggage, and let the army take what it finds.',
      favoured: ['ambition'],
      effects: { loyalty: 3, character: -6, judgment: -2 },
      grants: ['obs.a4.plundered'],
      result:
        'They take everything and some of them take it off men still standing there. You have '
        + 'issued eleven general orders against plunder since August and this is the twelfth time '
        + 'you have not enforced one, and the men have learned exactly as much from that as from '
        + 'any of the eleven.',
    },
  ],
};

export const ACT4_DECISIONS: Decision[] = [A4_D1_BOUNTY, A4_D2_GO_ON, A4_D3_PRISONERS];

/**
 * The `A4-D1` appeal, when the army does not love him enough.
 *
 * Same words, same option, different afternoon. `main.ts` substitutes this
 * for the authored result when Loyalty is under 55 at the moment of choosing,
 * and nothing anywhere tells the player which case they were in.
 */
export const A4_D1_APPEAL_COLD = {
  effects: { loyalty: -4, character: 1 } as const,
  ledger: [{ n: 250, cause: 'who stayed when they were asked, and they were the few' }],
  result:
    'You are not a speaker and everybody knows it. You tell them what the thirty-first means, and '
    + 'that you have nothing whatever to give them, and you ask. The drums beat. A few step '
    + 'forward, and then it stops, and the silence goes on a good deal longer than it takes to '
    + 'understand it. You ride back up the line without saying anything else.',
};
/** Loyalty at or above this and the same sentence lands. Below it, it does not. */
export const A4_APPEAL_FLOOR = 55;
