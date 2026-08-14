/**
 * Prototype content for MV-01 — Mount Vernon, the west front, May 1775.
 *
 * In the real build this is JSON on disk, validated by the build-time linter
 * (06-technical-architecture.md §6). It is typed TypeScript here only so the
 * prototype compiles without a loader; the shape is the schema.
 *
 * Density: the scene architecture sets a floor of twelve interactables per
 * walkable scene, and CI fails the build below it. This scene meets it.
 *
 * Copy discipline: examine strings run 25-45 words. The decision UI carries
 * roughly 60 words at the moment of choosing. Both are deliberate — the old
 * decision screen was 175 words and read as a wall.
 *
 * REVIEW GATE: the William Lee thread below is R5 / Witness Register material.
 * reference/historical-visual-reference.md §7 requires named sign-off from the
 * pedagogical authority before this ships to students. It is drafted here, not
 * approved. Everything factual in it is documented; the framing is not yet
 * reviewed.
 */

import type { StatId } from './state';
import type { VoiceId } from './palette';

export interface Interactable {
  id: string;
  label: string;
  /** Position along the walk-plane, 0..1. */
  t: number;
  examine: string;
  /** Reading this sets a knowledge flag. Documents never move stats. */
  grants?: string;
}

export interface DialogueLine {
  speaker: string;
  portraitSeed: number;
  coat: string;
  text: string;
}

export interface Option {
  id: string;
  /** Short label — what the player scans. Two to five words. */
  label: string;
  /** The full sentence. Shown only for the focused option. */
  full: string;
  /** Which council voices would have it so. Rendered as emblems. */
  favoured: VoiceId[];
  /** Knowledge flag required. Without it the option is struck, not hidden. */
  requires?: string;
  lockNote?: string;
  effects: Partial<Record<StatId, number>>;
  result: string;
}

export interface Decision {
  id: string;
  prompt: string;
  speaker: string;
  portraitSeed: number;
  coat: string;
  voices: VoiceId[];
  interjections: Partial<Record<VoiceId, string>>;
  options: Option[];
}

export interface NpcThread {
  id: string;
  /** Shown on the interaction prompt. "speak" tells the player nothing. */
  name: string;
  t: number;
  lines: DialogueLine[];
  decision?: Decision;
  /** Lines shown once the thread's decision is done. */
  after?: DialogueLine[];
}

const MARTHA = { portraitSeed: 202, coat: '#6B4F35' };
const MESSENGER = { portraitSeed: 303, coat: '#55627A' };
const LUND = { portraitSeed: 404, coat: '#7A5C3E' };
const LEE = { portraitSeed: 505, coat: '#5C6673' };

/**
 * Business the act will not close without. Everything else in the scene is
 * optional, and the optional things are what open the locked choices — so a
 * student who only does the business gets a thinner version of the same act
 * rather than a shorter one.
 */
export interface Business {
  /** The decision that settles it. */
  decision: string;
  /** How Washington thinks about it while it is unsettled. */
  pending: string;
}

export const SCENE = {
  id: 'MV-01',
  act: 1,
  title: 'Mount Vernon — the west front',
  subtitle: 'May 1775',

  /** Shown once, on arrival, before the player has control. */
  opening: [
    'You have been home since the autumn, and you have not been still for a day of it.',
    'A rider came up from the ferry this morning with a letter from Philadelphia, and the ' +
      'house has been quiet in a particular way ever since.',
  ],

  business: [
    { decision: 'A1-D2', pending: 'Martha is waiting on an answer you have not given her' },
    { decision: 'A1-D1', pending: 'the messenger is waiting on an answer for Philadelphia' },
  ] as Business[],

  /** The object that ends the act. */
  exit: 'chariot',

  /** What Washington thinks when there is nothing left to settle. */
  settled: 'Nothing is left here to settle. The chariot is packed.',

  interactables: [
    {
      id: 'scaffolding',
      label: 'the scaffolding',
      t: 0.553,
      examine:
        'The north wing stands open to the weather. Sixteen years you have been building this ' +
        'house and it is still not finished.',
      grants: 'obs.a1.scaffolding',
    },
    {
      id: 'newspaper',
      label: 'a Boston newspaper',
      t: 0.29,
      examine:
        'Three weeks old by the time it reached the Potomac. Concord and Lexington — a column of ' +
        'regulars harried nineteen miles back to Charlestown by farmers who would not stand and ' +
        'fight in the open.',
      grants: 'doc.a1.boston_clipping',
    },
    {
      id: 'ledger',
      label: 'the farm ledger',
      t: 0.395,
      examine:
        'Wheat, herring, flour to the West Indies, in your own hand. Every entry assumes you will ' +
        'be here in the autumn to make the next one.',
      grants: 'doc.a1.ledger',
    },
    {
      id: 'commission',
      label: 'the Fairfax commission',
      t: 0.343,
      examine:
        'Command of the Fairfax Independent Company. You did not ask for it either. Four counties ' +
        'have now named you to something, and none of them waited for an answer.',
      grants: 'doc.a1.commission',
    },
    {
      id: 'uniform',
      label: 'the new uniform',
      t: 0.448,
      examine:
        'Blue faced with buff, cut to your own specification, hanging where it can be seen. You ' +
        'have not said why you had it made. Neither has anyone asked.',
      grants: 'obs.a1.uniform',
    },
    {
      id: 'surveyors_chest',
      label: "the surveyor's chest",
      t: 0.133,
      examine:
        'Chain, compass, and the Ohio field books from when you were seventeen. You know that ' +
        'country better than any man in Virginia. Ground is a thing you can read.',
      grants: 'obs.a1.surveying',
    },
    {
      id: 'braddock',
      label: "Braddock's sash",
      t: 0.71,
      examine:
        'Crimson silk, given to you as he was dying on the Monongahela road. Two horses shot ' +
        'under you that day, four balls through your coat, and nine hundred men lost in three hours.',
      grants: 'doc.a1.braddock',
    },
    {
      id: 'lund_letter',
      label: "Lund's accounts",
      t: 0.605,
      examine:
        'What the estate owes and what it is owed. The joiners are unpaid. Whoever runs this ' +
        'place next will be running it on credit.',
      grants: 'doc.a1.accounts',
    },
    {
      id: 'dock',
      label: 'the landing',
      t: 0.08,
      examine:
        'The Potomac runs flat and brown below the bluff. The herring come up in April in numbers ' +
        'that beggar description. You will miss them next year.',
    },
    {
      id: 'paddock',
      label: 'the paddock rail',
      t: 0.868,
      examine: 'Nelson is in the near paddock and out of temper. He will be saddled before the week is out.',
    },
    {
      id: 'mill',
      label: 'the mill road',
      t: 0.92,
      examine:
        'The road runs three miles to the gristmill. Everything you have built here is a machine ' +
        'for turning this ground into money, and it only runs if someone is standing over it.',
    },
    {
      id: 'greenhouse',
      label: 'the garden wall',
      t: 0.185,
      examine:
        'Seedlings under glass, half of them experiments. You wrote to England for the seed and ' +
        'the war may well arrive before the answer does.',
    },
    {
      id: 'chariot',
      label: 'the chariot',
      t: 0.763,
      examine:
        'Packed for Philadelphia. Whatever the Congress decides, you are going — the only question ' +
        'is what you are when you come back.',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'martha',
      name: 'Martha',
      t: 0.238,
      lines: [
        {
          speaker: 'Martha',
          ...MARTHA,
          text: 'You have read it four times. It says the same thing each time.',
        },
        {
          speaker: 'Martha',
          ...MARTHA,
          text:
            'You had Lund bring the uniform down from the press before the letter ever came. ' +
            'I saw him carry it. You have not said a word about it since.',
        },
      ],
      decision: {
        id: 'A1-D2',
        prompt: 'She is not asking whether you will go. She is asking what you mean to wear.',
        speaker: 'Martha',
        ...MARTHA,
        voices: ['vanity', 'restraint', 'duty', 'temper'],
        interjections: {
          vanity:
            'A room full of lawyers in broadcloth, and one man dressed as a soldier. They will ' +
            'not need to be told.',
          restraint:
            'To wear it is to ask for the thing while pretending not to. Say what you want or ' +
            'want nothing.',
          duty: 'You hold a commission. It is not a costume.',
          temper: 'Let them ask you plainly, or let them find another man.',
        },
        options: [
          {
            id: 'wear_uniform',
            label: 'Wear it',
            full: 'Wear the uniform to Philadelphia and let the room draw its own conclusion.',
            favoured: ['vanity', 'duty'],
            effects: { legitimacy: 5, character: -3, judgment: 2 },
            result:
              'He wore it through every session. No one recorded him saying he wanted the command, ' +
              'and no one in that room was in any doubt.',
          },
          {
            id: 'wear_plain',
            label: 'Wear plain clothes',
            full: 'Go dressed as what you are today — a Virginia planter, and nothing more.',
            favoured: ['restraint'],
            effects: { character: 5, legitimacy: -3 },
            result:
              'You go in broadcloth. If they want a soldier they will have to say the word ' +
              'themselves, and they may not.',
          },
          {
            id: 'tell_martha',
            label: 'Tell her the truth',
            full:
              'Say that you had it made because you expect to be asked, and that you do not know ' +
              'whether you should be.',
            favoured: ['restraint', 'temper'],
            requires: 'obs.a1.uniform',
            lockNote: 'you have not looked at it yourself',
            effects: { character: 7, loyalty: 2 },
            result:
              'It is the first time you have said it aloud. She does not tell you it will be all ' +
              'right, which is why you told her.',
          },
        ],
      },
      after: [
        {
          speaker: 'Martha',
          ...MARTHA,
          text: 'Then go and see Lund about the accounts. If you are leaving, he should hear it from you.',
        },
      ],
    },

    {
      id: 'lund',
      name: 'Lund',
      t: 0.658,
      lines: [
        {
          speaker: 'Lund Washington',
          ...LUND,
          text:
            'The joiners want paying and the wing is open to the sky. If you go, I can hold the ' +
            'place — but I cannot hold it on promises.',
        },
        {
          speaker: 'Lund Washington',
          ...LUND,
          text:
            'And whoever pays this army they are raising will find the same. Men do not stay for ' +
            'a cause once the flour runs out. You will learn that faster than I will.',
        },
      ],
    },

    {
      id: 'lee',
      name: 'William Lee',
      t: 0.815,
      lines: [
        {
          speaker: 'William Lee',
          ...LEE,
          text: 'The chariot is packed, sir. Both trunks and the field case.',
        },
        {
          speaker: 'William Lee',
          ...LEE,
          text:
            'I am to come with you, then. However long it runs.',
        },
      ],
    },

    {
      id: 'messenger',
      name: 'the messenger',
      t: 0.5,
      lines: [
        {
          speaker: 'Congress messenger',
          ...MESSENGER,
          text:
            'Philadelphia has voted to raise an army before it has voted who is to command it. ' +
            'Some think the two questions have one answer.',
        },
      ],
      decision: {
        id: 'A1-D1',
        prompt:
          'An army that does not exist, in a currency that does not hold, against the best ' +
          'infantry in the world. Well?',
        speaker: 'Congress messenger',
        ...MESSENGER,
        voices: ['ambition', 'restraint', 'duty', 'vanity', 'temper'],
        interjections: {
          ambition:
            'No man in these colonies has held a field command like it. There will not be a ' +
            'second offer.',
          restraint:
            'You lost more men than you saved at the Monongahela, and you have never commanded ' +
            'above a regiment.',
          duty: 'Virginia sent you. Whether you want it was never the question.',
          vanity: 'Let them arrive at the name themselves. It is not asking if they say it first.',
          temper: 'Twenty years they passed you over for a royal commission. Twenty years.',
        },
        options: [
          {
            id: 'accept_plain',
            label: 'Accept — plainly',
            full: 'Accept, and say plainly that you do not think yourself equal to it.',
            favoured: ['restraint', 'duty'],
            effects: { character: 6, legitimacy: 4, judgment: -1 },
            result:
              'You say it in the chamber and mean it. It is written down, and it will be quoted ' +
              'both against you and for you for the rest of your life.',
          },
          {
            id: 'accept_pay',
            label: 'Accept — refuse the pay',
            full: 'Accept, and take no salary. Expenses only, accounted to the last shilling.',
            favoured: ['restraint', 'vanity'],
            effects: { legitimacy: 7, character: 5, loyalty: -2 },
            result:
              'It will cost Congress more in the end than the salary would have. It also means ' +
              'no man can say you took the war for a living.',
          },
          {
            id: 'accept_informed',
            label: 'Accept — and warn them',
            full:
              'Tell them what Concord means: the regulars can be bled on a road. This will be a ' +
              'long war, not a short one.',
            favoured: ['ambition', 'duty'],
            requires: 'doc.a1.boston_clipping',
            lockNote: 'you have not read the Boston paper',
            effects: { judgment: 8, legitimacy: 3, character: 2 },
            result:
              'They wanted reassurance and you gave them arithmetic. In three years some of them ' +
              'will remember it as the first honest thing said in that room.',
          },
          {
            id: 'decline',
            label: 'Decline',
            full: 'Say the command should go to a man the New England troops already trust.',
            favoured: ['restraint', 'temper'],
            effects: { character: 3, legitimacy: -6, judgment: 1 },
            result:
              'You say it, and they do not accept it, and the saying of it is remembered as ' +
              'modesty rather than as the refusal you intended.',
          },
        ],
      },
      after: [
        {
          speaker: 'Congress messenger',
          ...MESSENGER,
          text: 'I will carry it back tonight, sir. They will have your answer before they have an army.',
        },
      ],
    },
  ] as NpcThread[],
};
