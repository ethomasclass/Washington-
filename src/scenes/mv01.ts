/**
 * MV-01 — Mount Vernon, the west front, May 1775.
 *
 * Density: the scene architecture sets a floor of twelve interactables per
 * walkable scene, and CI fails the build below it.
 *
 * Copy discipline: examine strings run 25-45 words; the decision UI carries
 * roughly 60 words at the moment of choosing.
 *
 * REVIEW GATE: the William Lee thread is R5 / Witness Register material.
 * reference/historical-visual-reference.md §7 requires named sign-off from the
 * pedagogical authority before this ships to students. It is drafted here, not
 * approved. Everything factual in it is documented; the framing is not.
 */

import type { Ambient, Business, Interactable, NpcThread, Scene, Task } from '../types';

const MARTHA = { portraitSeed: 202, coat: '#6B4F35' };
const MESSENGER = { portraitSeed: 303, coat: '#55627A' };
const LUND = { portraitSeed: 404, coat: '#7A5C3E' };
const LEE = { portraitSeed: 505, coat: '#5C6673' };

export const MV01: Scene = {
  id: 'MV-01',
  act: 1,
  title: 'Mount Vernon — the west front',
  subtitle: 'May 1775',

  /**
   * What this act is for, in one line.
   *
   * The goal of the game is that the army still exists at the end — not that it
   * wins battles, which it mostly did not. Washington's achievement was that
   * the Continental Army was continuously in being from 1775 to 1783, and the
   * British could never finish it. Each act states its share of that.
   *
   * Act 1 is the exception, and deliberately so: there is no army yet. The only
   * thing at stake this morning is which man goes to Philadelphia.
   */
  purpose: 'Decide what kind of man goes to Philadelphia.',
  plates: 'vernon',
  exitTo: 'CB-01',
  exitPrompt: 'Ride for Philadelphia?',

  /**
   * The return: strength present and fit for duty.
   *
   * Visible, unlike the four stats, and the distinction is the point. He could
   * count his army to the man and wrote returns to Congress constantly; he
   * could not count his own character. So what you HAVE is shown and what you
   * ARE is not.
   *
   * Null here because in May 1775 there is no army to count — which is the
   * first thing Act 2 will teach, when the first return arrives and the number
   * is enormous and useless.
   */
  strength: null as { fit: number; onRolls: number; dated: string } | null,
  noStrength: 'There is no army. That is the whole of the difficulty.',

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

  /**
   * Interior voices, spoken as he passes. Each fires once. Placed on the
   * ground rather than on objects, so they can catch him crossing open lawn.
   */
  ambient: [
    {
      id: 'amb.braddock',
      voice: 'temper',
      line: 'Twenty years you asked them for a royal commission. Twenty years they gave you nothing.',
      x: 0.71, z: 0.19, r: 0.10, minLoudness: 0.30,
    },
    {
      id: 'amb.survey',
      voice: 'ambition',
      line: 'You surveyed that country at seventeen. Nobody in Philadelphia has seen a mile of it.',
      x: 0.133, z: 0.30, r: 0.10, minLoudness: 0.34,
    },
    {
      id: 'amb.house',
      voice: 'restraint',
      line: 'Sixteen years and it is not finished. You are not a man who leaves things half-built.',
      x: 0.553, z: 0.79, r: 0.11, minLoudness: 0.36,
    },
    {
      id: 'amb.landing',
      voice: 'duty',
      line: 'The herring will come up in April whether you are here to count them or not.',
      x: 0.08, z: 0.72, r: 0.11, minLoudness: 0.32,
    },
    {
      id: 'amb.chariot',
      voice: 'vanity',
      line: 'They will watch you arrive. Whatever you are wearing will be the first thing said of you.',
      x: 0.763, z: 0.55, r: 0.10, minLoudness: 0.30,
    },
    {
      id: 'amb.mill',
      voice: 'duty',
      line: 'Every acre of this runs because you stand over it. That will be true of an army too.',
      x: 0.92, z: 0.31, r: 0.10, minLoudness: 0.38,
    },
  ] as Ambient[],

  /**
   * Completing every task grants this. Setting a house in order before leaving
   * it for eight years is characterful, and the game should notice.
   */
  allTasksFlag: 'obs.a1.house_in_order',

  tasks: [
    {
      id: 'task.instruments',
      label: 'put up the instruments',
      x: 0.10, z: 0.16,
      done:
        'Chain, compass and the Ohio field books go back in the chest, and the chest goes under ' +
        'the stair. You will not be laying out any ground this year.',
      grants: 'task.a1.instruments',
      note: 'Put up the surveying instruments',
    },
    {
      id: 'task.weather',
      label: 'make the weather entry',
      x: 0.21, z: 0.14,
      done:
        'Fair. Wind southerly. Mercury at sixty-four at sunrise. You have written this line ' +
        'nearly every morning for sixteen years, and it takes you longer today than it should.',
      grants: 'task.a1.weather',
      note: 'Made the morning weather entry',
    },
    {
      id: 'task.letter',
      label: 'write to Burwell Bassett',
      x: 0.37, z: 0.14,
      done:
        'To your brother-in-law, because he will not repeat it. You write that you are going to ' +
        'Philadelphia, and that you do not know what you will be when you come back. Then you ' +
        'seal it before you can read it over.',
      grants: 'task.a1.letter',
      note: 'Wrote to Burwell Bassett — the first time you have said it in writing',
    },
    {
      id: 'task.orders',
      label: 'leave standing orders',
      x: 0.555, z: 0.13,
      done:
        'Wheat in the middle field, the fishery to run as it did last year, and nothing sold ' +
        'below its worth. Lund writes it all down. Neither of you says how long the orders are ' +
        'meant to cover.',
      grants: 'task.a1.orders',
      note: 'Left standing orders for the estate',
      requires: 'heard.a1.lund',
      requiresNote: 'you have not spoken to Lund yet',
    },
    {
      id: 'task.nelson',
      label: 'look over Nelson',
      x: 0.84, z: 0.16,
      done:
        'Sound, shod, and already fed. Somebody was up before dawn seeing to that, and it was ' +
        'not you. You run a hand down his foreleg and find nothing wrong, which you knew before ' +
        'you bent down.',
      grants: 'task.a1.nelson',
      note: 'Looked over Nelson — sound, and already seen to',
    },
  ] as Task[],

  interactables: [
    {
      id: 'scaffolding',
      label: 'the scaffolding',
      x: 0.553,
      z: 0.79,
      examine:
        'The north wing stands open to the weather. Sixteen years you have been building this ' +
        'house and it is still not finished.',
      grants: 'obs.a1.scaffolding',
    },
    {
      id: 'newspaper',
      label: 'a Boston newspaper',
      x: 0.29,
      z: 0.2,
      examine:
        'Three weeks old by the time it reached the Potomac. Concord and Lexington — a column of ' +
        'regulars harried nineteen miles back to Charlestown by farmers who would not stand and ' +
        'fight in the open.',
      grants: 'doc.a1.boston_clipping',
    },
    {
      id: 'ledger',
      label: 'the farm ledger',
      x: 0.395,
      z: 0.27,
      examine:
        'Wheat, herring, flour to the West Indies, in your own hand. Every entry assumes you will ' +
        'be here in the autumn to make the next one.',
      grants: 'doc.a1.ledger',
      contradicts: {
        heard: 'heard.a1.martha',
        line:
          'The last entry is three weeks old. You stopped writing them the week the news came ' +
          'from Boston — before the uniform came down from the press, and before you said nothing.',
        grants: 'obs.a1.ledger_stops',
        note: 'The ledger stops the week the Boston news came — you decided earlier than you have admitted',
      },
    },
    {
      id: 'commission',
      label: 'the Fairfax commission',
      x: 0.343,
      z: 0.5,
      examine:
        'Command of the Fairfax Independent Company. You did not ask for it either. Four counties ' +
        'have now named you to something, and none of them waited for an answer.',
      grants: 'doc.a1.commission',
    },
    {
      id: 'uniform',
      label: 'the new uniform',
      x: 0.448,
      z: 0.58,
      examine:
        'Blue faced with buff, cut to your own specification, hanging where it can be seen. You ' +
        'have not said why you had it made. Neither has anyone asked.',
      grants: 'obs.a1.uniform',
    },
    {
      id: 'surveyors_chest',
      label: "the surveyor's chest",
      x: 0.133,
      z: 0.3,
      examine:
        'Chain, compass, and the Ohio field books from when you were seventeen. You know that ' +
        'country better than any man in Virginia. Ground is a thing you can read.',
      grants: 'obs.a1.surveying',
    },
    {
      id: 'braddock',
      label: "Braddock's sash",
      x: 0.71,
      z: 0.19,
      examine:
        'Crimson silk, given to you as he was dying on the Monongahela road. Two horses shot ' +
        'under you that day, four balls through your coat, and nine hundred men lost in three hours.',
      grants: 'doc.a1.braddock',
    },
    {
      id: 'lund_letter',
      label: "Lund's accounts",
      x: 0.605,
      z: 0.24,
      examine:
        'What the estate owes and what it is owed. The joiners are unpaid. Whoever runs this ' +
        'place next will be running it on credit.',
      grants: 'doc.a1.accounts',
      contradicts: {
        heard: 'heard.a1.lund',
        line:
          'He has been paying the joiners out of his own wages since February. He did not ' +
          'mention that when he said he could hold the place.',
        grants: 'obs.a1.lund_pays',
        note: 'Lund said he could hold the estate — his own accounts say he is already paying for it',
      },
    },
    {
      id: 'dock',
      label: 'the landing',
      x: 0.08,
      z: 0.72,
      examine:
        'The Potomac runs flat and brown below the bluff. The herring come up in April in numbers ' +
        'that beggar description. You will miss them next year.',
    },
    {
      id: 'paddock',
      label: 'the paddock rail',
      x: 0.868,
      z: 0.69,
      examine: 'Nelson is in the near paddock and out of temper. He will be saddled before the week is out.',
    },
    {
      id: 'mill',
      label: 'the mill road',
      x: 0.92,
      z: 0.31,
      examine:
        'The road runs three miles to the gristmill. Everything you have built here is a machine ' +
        'for turning this ground into money, and it only runs if someone is standing over it.',
    },
    {
      id: 'greenhouse',
      label: 'the garden wall',
      x: 0.185,
      z: 0.63,
      examine:
        'Seedlings under glass, half of them experiments. You wrote to England for the seed and ' +
        'the war may well arrive before the answer does.',
    },
    {
      id: 'chariot',
      label: 'the chariot',
      x: 0.763,
      z: 0.55,
      examine:
        'Packed for Philadelphia. Whatever the Congress decides, you are going — the only question ' +
        'is what you are when you come back.',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'martha',
      name: 'Martha',
      hearFlag: 'heard.a1.martha',
      x: 0.238,
      z: 0.38,
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
            requires: 'obs.a1.ledger_stops',
            lockNote: 'you have not admitted to yourself when you decided',
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
      hearFlag: 'heard.a1.lund',
      x: 0.658,
      z: 0.46,
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
      x: 0.815,
      z: 0.41,
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
      x: 0.5,
      z: 0.34,
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
