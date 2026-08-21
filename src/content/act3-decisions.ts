/**
 * The three decisions of Act 3.
 *
 * THE THING THIS ACT IS FOR, stated once, here, because every line below is
 * written to serve it:
 *
 *   **All three branches of `A3-D1` end with the army driven off Long
 *   Island.** The choice does not change the outcome. It changes what the
 *   outcome MEANS and what the player knew when they made it.
 *
 * This is stated nowhere in the game. There is no line of narration that
 * says "it would have happened anyway", no epilogue paragraph explaining the
 * design, and no achievement for finding out. A student who plays it twice
 * discovers it themselves, which is the only way anybody ever believes it.
 *
 * `docs/05` §3.1: this is the single most important thing Act 3 teaches, and
 * it is the reason the act is a defeat rather than a puzzle with a solution.
 */

import type { Decision } from '../types';

/* ---------------------------------------------------------------------- *
 * A3-D1 — NEW YORK.  SEALED.
 * ---------------------------------------------------------------------- */

/**
 * SEALED, and made at the top of the act, before anything has gone wrong.
 *
 * That placement is the design. Every other sealed decision in the game is
 * made in a crisis with the crisis visible; this one is made on a fine August
 * morning on a well-built earthwork by a man who has every reason to think
 * the position is sound. The student makes it in the same state of knowledge
 * he did — which is to say, badly informed and quite confident.
 *
 * The historical option is marked and it is the worst one militarily. Dividing
 * an army across a tidal river the enemy's navy controls is a mistake any
 * European staff officer would have caught, several people told him so, and he
 * did it anyway because Congress had ordered the city held and because
 * abandoning New York without a fight was politically impossible in the summer
 * the Declaration was read to the troops.
 */
export const A3_D1_NEW_YORK: Decision = {
  id: 'A3-D1',
  prompt:
    'Congress has ordered the city held. Greene says burn it and go. Your army is on two islands '
    + 'separated by a tidal river, and out past the Narrows there are four hundred sail and '
    + 'thirty-two thousand men waiting for a wind.',
  speaker: 'Lord Stirling',
  portrait: 'stirling',
  sealed: true,
  voices: ['duty', 'ambition', 'restraint', 'temper', 'vanity'],
  interjections: {
    duty:
      'Congress ordered the city held. You may tell them it cannot be done. You may not decide '
      + 'that it need not.',
    ambition:
      'Lose New York without a fight and you are a man who has lost two forts in twenty-two years.',
    restraint:
      'A river you cannot control is not a flank. It is a hole, and their navy is already in it.',
    temper:
      'They will burn it, quarter in it, and be warm all winter in houses your own countrymen '
      + 'built. Leave them a black field.',
    vanity:
      'The Declaration was read to this army seven weeks ago. Give the country a general who '
      + 'gives up its second city in the same summer.',
  },
  rejoinders: {
    restraint: 'Whatever you decide, decide it knowing the wind decides the rest.',
    duty: 'Stirling is waiting. He has to place his brigade on it.',
  },
  options: [
    {
      id: 'divide',
      label: 'Hold Brooklyn Heights',
      full:
        'Hold the Heights. Put half the army across the East River and fortify the line from '
        + 'Gowanus to Wallabout.',
      favoured: ['duty', 'vanity'],
      historical: true,
      effects: { judgment: -6, legitimacy: 4, loyalty: 1 },
      grants: ['obs.a3.divided'],
      ledger: [{ n: -1000, cause: 'taken or killed on Long Island on the twenty-seventh' }],
      result:
        'The line is well made and it is well made in the wrong place. On the twenty-seventh the '
        + 'enemy comes through the Jamaica Pass behind it with ten thousand men, and everything '
        + 'that was built to face south is facing the wrong way by nine in the morning.',
    },
    {
      id: 'concentrate',
      label: 'Concentrate on Manhattan',
      full:
        'Bring the whole army onto Manhattan and give up Brooklyn Heights without a fight.',
      favoured: ['restraint'],
      effects: { judgment: 6, legitimacy: -7, loyalty: -2 },
      grants: ['obs.a3.concentrated'],
      ledger: [{ n: -600, cause: 'lost covering the withdrawal from the Heights' }],
      result:
        'It is the soundest thing you could have done and it costs you almost everything you have '
        + 'with Congress. The Heights carry guns that reach the whole city; giving them up without '
        + 'a shot is read in Philadelphia as timidity, and the enemy takes them and mounts guns on '
        + 'them within the week. The army is still driven off Long Island. It is driven off '
        + 'without a battle, which is cheaper, and which nobody thanks you for.',
    },
    {
      id: 'burn',
      label: 'Burn it, per Greene',
      full:
        'Ask Congress for leave to destroy the city rather than winter the enemy in it, and '
        + 'prepare to go.',
      requires: 'doc.a3.congress_ny',
      lockNote: 'you have not read what Congress actually resolved, and cannot argue against a paper you have not seen',
      favoured: ['temper', 'ambition'],
      effects: { judgment: 4, legitimacy: -6, character: -3 },
      grants: ['obs.a3.burn_asked'],
      ledger: [{ n: -800, cause: 'lost on Long Island while the question went to Philadelphia' }],
      result:
        'Congress refuses, in terms, and the refusal takes eleven days to arrive. In the meantime '
        + 'the army fights on Long Island anyway and is driven off it anyway. The city burns on '
        + 'the twenty-first of September regardless, a quarter of it, and to this day nobody has '
        + 'established who started it. You are suspected. You are not asked.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A3-D2 — MIFFLIN'S REARGUARD
 * ---------------------------------------------------------------------- */

/**
 * The real incident, and one of the great near-disasters of the war.
 *
 * On the night of the evacuation a mistaken order pulled Mifflin's covering
 * party off the line hours early, and the entire rearguard — the men holding
 * the works so that nobody would notice nine thousand men leaving — marched
 * down to the ferry while the British lines were still six hundred yards
 * away and fully manned. Washington met them on the road and sent them back.
 * The works stood empty for the best part of an hour.
 *
 * The three branches are the three ways an order actually travelled in 1776,
 * and the third one — go yourself — is the one that costs the player the most
 * and is also what he did. It is a real cost, paid in the manifest, because
 * the general is not at the landing for two of the six loading beats.
 */
export const A3_D2_REARGUARD: Decision = {
  id: 'A3-D2',
  prompt:
    'The covering party has to hold the empty works until the last boat. Mifflin has it, and '
    + 'Mifflin has to be told when to come off. It is dark, it is raining, and the enemy is six '
    + 'hundred yards from a line with nobody behind it.',
  speaker: 'Thomas Mifflin',
  portrait: 'mifflin',
  voices: ['restraint', 'duty', 'ambition', 'temper'],
  interjections: {
    restraint:
      'An order given aloud in the dark, at a distance, to a tired man, is not an order. It is a '
      + 'noise that two people will remember differently.',
    duty:
      'He is a general officer and it is his command. Send him the order and let him execute it.',
    ambition:
      'You have nine thousand men to get across a river in one night. You cannot spend an hour of '
      + 'it walking up a hill.',
    temper:
      'If that line comes off early the whole thing is discovered and every man still on this '
      + 'shore is taken. Every one.',
  },
  rejoinders: {
    restraint: 'Whatever goes wrong tonight goes wrong in the dark, where nobody can fix it.',
  },
  options: [
    {
      id: 'in_writing',
      label: 'Send it in writing',
      full: 'Write the order out, sign it, and send it up by an officer who can read it back.',
      favoured: ['restraint', 'duty'],
      effects: { judgment: 3, legitimacy: 1 },
      grants: ['obs.a3.order_written', 'obs.a3.night_came'],
      result:
        'It arrives, it is read, it is understood, and the covering party stays on the line until '
        + 'it is sent for. Nothing whatever happens, which is the most expensive kind of success '
        + 'there is, because nobody will ever know it was close.',
    },
    {
      id: 'by_aide',
      label: 'Send an aide with it',
      full: 'Send a young man up the hill at a run with the order in his head.',
      favoured: ['ambition'],
      effects: { judgment: -2, loyalty: -1 },
      grants: ['obs.a3.night_came'],
      ledger: [{ n: -3, cause: 'left on the line when the covering party came off early' }],
      result:
        'It is delivered as "the general says come off", which is not what you said, and by '
        + 'midnight the whole covering party is on the road to the ferry with the works behind '
        + 'them standing empty and lit. You meet them coming down. You send them back up. Three '
        + 'men do not go back up and are not seen again.',
    },
    {
      id: 'go_yourself',
      label: 'Go up yourself',
      full: 'Leave the landing, ride up to the works, and tell Mifflin to his face.',
      favoured: ['duty', 'temper'],
      historical: true,
      effects: { judgment: 1, loyalty: 4, character: 2 },
      grants: ['obs.a3.went_himself', 'obs.a3.night_came'],
      ledger: [{ n: -120, cause: 'not embarked while the general was away from the landing' }],
      result:
        'He understands it perfectly because you are standing in front of him saying it. The line '
        + 'holds until it is sent for. And for the better part of an hour the man who is supposed '
        + 'to be running the embarkation is on a hill half a mile from the boats, and the boats '
        + 'notice, and the manifest notices.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * A3-D3 — NATHAN HALE.  CHARACTERIZATION ONLY.
 * ---------------------------------------------------------------------- */

/**
 * CHARACTERIZATION ONLY. Every option is `effects: {}`.
 *
 * Hale volunteers on every branch. He goes on every branch. He is taken on
 * every branch and hanged on every branch, on 22 September 1776, without a
 * trial, and the famous last words reach us second-hand through a British
 * officer who was there and wrote it down years later.
 *
 * What the branches change is what Washington knew, and when. That is the
 * whole of it, and it is the seed of the intelligence thread: the Culper
 * Ring, when it comes in 1778, is professional — codes, dead drops, a
 * cutout, a woman running the New York end — precisely because this was not.
 *
 * The second demonstration of R11 in the game, and it arrives four hours of
 * play after the first one, by which time the student has stopped expecting
 * a decision to be free.
 */
export const A3_D3_HALE: Decision = {
  id: 'A3-D3',
  prompt:
    'Knowlton wants a volunteer to go over to Long Island in disguise and count what is there. '
    + 'A captain of his Rangers has offered. He has no cover story, no contact on the other side, '
    + 'no cipher, no way back, and no training whatever, because there is none to be had.',
  speaker: 'Alexander Hamilton',
  portrait: 'hamilton',
  voices: ['ambition', 'restraint', 'duty'],
  interjections: {
    ambition:
      'You have been beaten twice by an enemy whose movements you could not see. Somebody has to '
      + 'go and look.',
    restraint:
      'A gentleman taken out of uniform behind the lines is hanged the same day. Not exchanged, '
      + 'not paroled. Hanged, in the morning, without a trial.',
    duty:
      'He volunteered. Nobody ordered him and nobody will order him. The question is whether you '
      + 'let a man do a thing you have not taught him to do.',
  },
  options: [
    {
      id: 'authorise',
      label: 'Let Knowlton send him',
      full: 'Authorise it, leave the arrangements to Knowlton, and do not ask the man&rsquo;s name.',
      favoured: ['ambition', 'duty'],
      historical: true,
      effects: {},
      grants: ['obs.a3.hale_sent'],
      result:
        'He goes over on the fifteenth. He is taken on the twenty-first, carrying his own '
        + 'drawings and his Yale diploma, and hanged on the morning of the twenty-second without a '
        + 'trial. You learn his name some weeks afterwards, from the enemy, in a newspaper.',
    },
    {
      id: 'meet_him',
      label: 'Meet him first',
      full: 'Have the man brought to you before he goes, and look at him.',
      favoured: ['duty', 'restraint'],
      effects: {},
      grants: ['obs.a3.hale_met'],
      result:
        'He is twenty-one, he is a schoolmaster from New London, and he tells you that every kind '
        + 'of service necessary to the public good becomes honourable by being necessary. He goes '
        + 'on the fifteenth and is hanged on the twenty-second. You knew his name before the '
        + 'enemy printed it, which is the only thing that is different.',
    },
    {
      id: 'refuse',
      label: 'Refuse it',
      full:
        'Tell Knowlton the thing cannot be done as he proposes it, and to find another way to see '
        + 'over the river.',
      favoured: ['restraint'],
      effects: {},
      result:
        'Knowlton takes the refusal and sends him anyway a week later, from Harlem, with the same '
        + 'arrangements and the same result. Knowlton is killed himself on the sixteenth at '
        + 'Harlem Heights and is not there to be asked about it. You find out afterwards, from a '
        + 'newspaper, like everybody else.',
    },
  ],
};

export const ACT3_DECISIONS: Decision[] = [A3_D1_NEW_YORK, A3_D2_REARGUARD, A3_D3_HALE];
