/**
 * The end of Act 1: the sealed decision, at the landing.
 *
 * SEALED means three things. It carries the wax and the line THIS WILL NOT
 * COME AGAIN. It bypasses the soft shoulder in `applyDelta`, so its numbers
 * land at full weight. And every student in the room meets it, which is what
 * makes it the thing a teacher can put on the board on Friday.
 *
 * The knowledge lock on the fourth option is the best demonstration in the
 * game of R2: reading the Fort Necessity capitulation does not give the player
 * points. It gives them a sentence they could not otherwise say.
 */

import type { Decision } from '../types';

export const A1_D4_UNIFORM: Decision = {
  id: 'A1-D4',
  sealed: true,
  prompt:
    'The coat is folded on the chest and the boat is alongside. You are riding to a deliberative '
    + 'assembly of sixty-five men, and not one of them is a soldier. What do you wear?',
  speaker: 'The landing',
  portrait: 'washington',
  // The only decision in Act 1 where all four of the arguing voices are loud.
  voices: ['vanity', 'ambition', 'restraint', 'duty'],
  interjections: {
    vanity:
      'You will be the only man in that room wearing a coat that means something. They will not '
      + 'have to be told what you are offering.',
    ambition: 'Sixty-five delegates and one soldier. The arithmetic asks for you. You need not.',
    restraint: 'A man who wants a thing should not dress as though he already has it.',
    duty: 'Virginia sent you to deliberate, not to audition.',
  },
  rejoinders: {
    vanity: 'They will describe the coat in their letters home. Every one of them will.',
    restraint: 'Wear it once and you cannot afterwards be a man who did not.',
    duty: 'Whatever you put on this afternoon, you will be wearing it for eight years.',
  },
  options: [
    {
      id: 'wear_it',
      label: 'Wear the uniform',
      full: 'Wear the blue-and-buff of the Fairfax Independent Company, and let the room draw its own conclusion.',
      favoured: ['vanity', 'ambition'],
      effects: { judgment: 3, legitimacy: 6, loyalty: 2, character: -5 },
      historical: true,
      result:
        'You wear it through every session. No one records you saying that you want the command, '
        + 'and no one in that room is in any doubt.',
    },
    {
      id: 'plain',
      label: 'Go plainly',
      full: 'Travel as what you are today: a Virginia planter in broadcloth, and nothing more.',
      favoured: ['restraint', 'duty'],
      effects: { legitimacy: -4, character: 5 },
      result:
        'You go in broadcloth. If they want a soldier they will have to say the word themselves, '
        + 'and there is a fortnight in which it looks as though they may not.',
    },
    {
      id: 'packed',
      label: 'Pack it, but do not wear it',
      full: 'Have the coat put in the trunk. It can be sent for.',
      favoured: ['restraint'],
      effects: { legitimacy: 1, judgment: -2 },
      result:
        'A hedge that nobody took, and it reads as one. The trunk goes to Philadelphia and stays shut, '
        + 'and by the time it is opened the question has been settled by other men.',
    },
    {
      /*
       * The knowledge lock. Fort Necessity is in the locked drawer of the study,
       * two hundred yards up the hill, and a player who never went inside the
       * house never sees this sentence exist.
       *
       * It is also what he actually did: he wore the uniform AND told Congress
       * he did not think himself equal to the command, and both were true at
       * once, which is the hardest thing about him to teach.
       */
      id: 'wear_and_own_it',
      label: 'Wear it — and say what you are',
      full:
        'Wear it, and tell them plainly that you do not think yourself equal to the command — and '
        + 'that they should know why before they vote.',
      favoured: ['duty', 'restraint'],
      requires: 'doc.a1.necessity',
      lockNote: 'you have not read what you signed at the Great Meadows',
      effects: { judgment: 3, legitimacy: 6, loyalty: 2, character: 2 },
      historical: true,
      result:
        'Both things are true at once and you say both. It is entered in the journal of the Congress '
        + 'and it will be quoted for two hundred years by people who cannot decide which half he meant.',
    },
  ],
};

/** What the act says on the way out, once the coat is settled. */
export const DEPARTURE_LINES: Record<string, string[]> = {
  wear_it: [
    'The boat takes the tide at two. The house goes out of sight round the point with the north end '
    + 'still open to the sky, and the scaffold is the last of it you can see.',
    'You will be back in six years, for four days. The wing will still not be finished.',
  ],
  plain: [
    'The boat takes the tide at two, and the coat stays in the press at the top of the house. The '
    + 'north end goes out of sight last, open to the sky, with the scaffold standing on it.',
    'You will be back in six years, for four days. The wing will still not be finished.',
  ],
  packed: [
    'The trunk goes aboard with the field case. The house goes out of sight round the point with the '
    + 'north end still open, and the scaffold is the last of it you can see.',
    'You will be back in six years, for four days. The wing will still not be finished.',
  ],
  wear_and_own_it: [
    'The boat takes the tide at two. The house goes out of sight round the point with the north end '
    + 'still open to the sky, and the scaffold is the last of it you can see.',
    'You will be back in six years, for four days. The wing will still not be finished.',
  ],
};
