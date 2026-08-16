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

import { at } from '../types';
import type { Ambient, Business, Interactable, NpcThread, Scene, Task } from '../types';

const MARTHA = { portraitSeed: 202, coat: '#6B4F35' };

/**
 * Martha Washington, from the likenesses.
 *
 * Small — a little under five feet, against a husband of six foot two, and the
 * difference is worth seeing in the frame. Dark hair under the white linen cap
 * she wears in every portrait of her, and a plain gown of a good but sober
 * colour: she was the wealthiest widow in Virginia and dressed like someone who
 * had nothing left to prove.
 */
const MARTHA_LOOK = {
  coat: '#6B4F35',
  hat: 'none' as const,
  gown: true,
  cap: true,
  hair: '#3E3226',
  build: 0.96,
  tall: 0.84,
};

/**
 * William Lee, in the Mount Vernon livery.
 *
 * White faced scarlet, which are the Washington arms — argent, two bars gules
 * — and so the coat says whose household he belongs to before it says anything
 * about him, which is precisely the fact the scene is about.
 *
 * REVIEW GATE: this figure is R5 / Witness Register material along with the
 * thread it belongs to. Drawn with the same care as anyone else in the frame
 * and no caricature in it, but the framing still needs the sign-off recorded at
 * the head of this file before it goes near a classroom.
 */
const LEE_LOOK = {
  coat: '#DCD3BC',
  facings: '#8E4A44',
  hat: 'round' as const,
  skin: '#7A5237',
  hair: '#2B2118',
  build: 0.98,
  tall: 1.0,
};
const MESSENGER = { portraitSeed: 303, coat: '#8A7B5E' };
const LUND = { portraitSeed: 404, coat: '#7A5C3E' };
const LEE = { portraitSeed: 505, coat: '#5F5B4C' };

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
  // Mid-morning, long shadows to the right, per the canonical view.
  sun: [0.24, 0.14],
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

  /** Nothing to run out yet. The counter is empty all act, and that is the point. */
  expiring: null,

  where: 'Mount Vernon, Virginia',
  when: 'May 1775',

  /*
   * What a student needs before they can play this.
   *
   * The shooting has already started and most of them will not know that.
   * Lexington and Concord were three weeks ago; the Second Continental
   * Congress is sitting in Philadelphia right now and has to decide whether the
   * militia camped around Boston is an army and, if so, whose. Washington is
   * forty-three, has not held a command in sixteen years, and is one of the few
   * men in the colonies who has ever commanded anything at all.
   */
  situation: [
    'Three weeks ago, at Lexington and Concord, British regulars and Massachusetts militia ' +
      'shot at each other. Nobody has called it a war yet.',
    'About 15,000 New England men are camped around Boston right now. They have no ' +
      'commander, no supplies, and no authority over each other.',
    'Congress meets in Philadelphia and has to decide whether that is an army. You have worn ' +
      'your uniform to every session. That was not an accident, and everyone has noticed.',
  ],
  objectives: [
    'Answer Martha. She asked you a question a week ago and you have been avoiding it.',
    'Give the messenger your answer. He rides back to Philadelphia with it.',
    'Put the estate in order before you leave. You do not know for how long.',
  ],

  arrival: [
    'A View of Mount Vernon, the Seat of Colonel Washington, in Virginia, May 1775.',
    'A rider came up from the ferry this morning with a letter from Philadelphia, and ' +
      'the house has been quiet in a particular way ever since.',
    'Everything you own is here. You are expected in Philadelphia on the tenth.',
  ],

  /** Two lines of atmosphere, after the facts. */
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
      ...at('packing'), r: 0.10, minLoudness: 0.30,
      variants: {
        temper: 'Twenty years you asked them for a royal commission. Twenty years they gave you nothing.',
        ambition: 'Braddock died in your arms and you were twenty-three. Nobody else here has been shot at.',
        vanity: 'They printed the Great Meadows in London. Give them something else to print.',
      },
    },
    {
      id: 'amb.survey',
      ...at('chest'), r: 0.10, minLoudness: 0.34,
      variants: {
        ambition: 'You surveyed that country at seventeen. Nobody in Philadelphia has seen a mile of it.',
        duty: 'You were paid to draw those lines and you drew them true. That is the whole of your record.',
        restraint: 'You know what a hundred miles of it costs a column. Remember that when they ask for speed.',
      },
    },
    {
      id: 'amb.house',
      ...at('packing'), r: 0.11, minLoudness: 0.36,
      variants: {
        restraint: 'Sixteen years and it is not finished. You are not a man who leaves things half-built.',
        vanity: 'It is the north end that shows from the river. Of course it is the north end that is open.',
        duty: 'Lund will write to you about the roof, and you will answer from a tent, and it will get done.',
      },
    },
    {
      id: 'amb.river',
      ...at('lawn'), r: 0.11, minLoudness: 0.32,
      variants: {
        duty: 'The herring will come up in April whether you are here to count them or not.',
        restraint: 'Everything here runs on a season. An army does not, and you have not learned that yet.',
      },
    },
    {
      id: 'amb.chariot',
      ...at('drive'), r: 0.10, minLoudness: 0.30,
      variants: {
        vanity: 'They will watch you arrive. Whatever you are wearing will be the first thing said of you.',
        ambition: 'Two days to Philadelphia. The vote will not wait for a man who sets out on Thursday.',
        temper: 'Ride in like a petitioner and they will treat you like one for four years.',
      },
    },
    {
      id: 'amb.mill',
      ...at('paddock'), r: 0.10, minLoudness: 0.38,
      variants: {
        duty: 'Every acre of this runs because you stand over it. That will be true of an army too.',
        restraint: 'You can be absent from a mill for a season. Ask what an army does in a season alone.',
      },
    },
  ] as Ambient[],

  /**
   * Completing every task grants this. Setting a house in order before leaving
   * it for eight years is characterful, and the game should notice.
   */
  allTasksFlag: 'obs.a1.house_in_order',

  /*
   * MOUNT VERNON, STAGED.
   *
   * Slip-stage across the west front. The near rank is the working morning —
   * the piazza where the post is read and answered, the survey chest being
   * packed, the paddock where Nelson is looked over. The far rank is the place
   * itself: the trunk standing open by the scaffolding, the lawn falling to the
   * river, and the chariot waiting on the drive.
   *
   * Focal: the packing, on the left third. Everything in this scene is about a
   * man leaving a house he has spent fifteen years building, and the open trunk
   * with the old Braddock sash in it is the one object that says so without a
   * word of dialogue.
   *
   * The chariot stands alone on its station, which is the point — it is the
   * only thing on the drive, and a scene where the way out is unmistakable is a
   * scene where nobody hunts for the exit.
   */
  stations: [
    { id: 'piazza', label: 'the writing table on the piazza', x: 0.22, z: 0.24, surface: 'table' },
    { id: 'chest', label: "the surveyor's chest, half packed", x: 0.46, z: 0.24, surface: 'stack' },
    { id: 'paddock', label: 'the paddock rail', x: 0.72, z: 0.24, surface: 'open' },
    { id: 'packing', label: 'the trunk by the scaffolding', x: 0.29, z: 0.64, surface: 'stack', focal: true },
    { id: 'lawn', label: 'the lawn falling to the river', x: 0.55, z: 0.64, surface: 'open' },
    { id: 'drive', label: 'the chariot on the drive', x: 0.81, z: 0.64, surface: 'stack' },
  ],

  tasks: [
    {
      id: 'task.instruments',
      label: 'put up the instruments',
      ...at('chest'),
      done:
        'Chain, compass and the Ohio field books go back in the chest, and the chest goes under ' +
        'the stair. You will not be laying out any ground this year.',
      grants: 'task.a1.instruments',
      note: 'Put up the surveying instruments',
      prop: 'chest',
    },
    {
      id: 'task.weather',
      label: 'make the weather entry',
      ...at('chest'),
      done:
        'Fair. Wind southerly. Mercury at sixty-four at sunrise. You have written this line ' +
        'nearly every morning for sixteen years, and it takes you longer today than it should.',
      grants: 'task.a1.weather',
      note: 'Made the morning weather entry',
      prop: 'table',
    },
    {
      id: 'task.letter',
      label: 'write to Burwell Bassett',
      ...at('piazza'),
      done:
        'To your brother-in-law, because he will not repeat it. You write that you are going to ' +
        'Philadelphia, and that you do not know what you will be when you come back. Then you ' +
        'seal it before you can read it over.',
      grants: 'task.a1.letter',
      note: 'Wrote to Burwell Bassett — the first time you have said it in writing',
      prop: 'table',
    },
    {
      id: 'task.orders',
      label: 'leave standing orders',
      ...at('piazza'),
      done:
        'Wheat in the middle field, the fishery to run as it did last year, and nothing sold ' +
        'below its worth. Lund writes it all down. Neither of you says how long the orders are ' +
        'meant to cover.',
      grants: 'task.a1.orders',
      note: 'Left standing orders for the estate',
      requires: 'heard.a1.lund',
      requiresNote: 'you have not spoken to Lund yet',
      prop: 'papers',
    },
    {
      id: 'task.nelson',
      label: 'look over Nelson',
      ...at('paddock'),
      done:
        'Sound, shod, and already fed. Somebody was up before dawn seeing to that, and it was ' +
        'not you. You run a hand down his foreleg and find nothing wrong, which you knew before ' +
        'you bent down.',
      grants: 'task.a1.nelson',
      note: 'Looked over Nelson — sound, and already seen to',
      prop: 'horse',
    },
  ] as Task[],

  interactables: [
    {
      id: 'scaffolding',
      label: 'the scaffolding',
      ...at('packing'),
      examine:
        'The north wing stands open to the weather. Sixteen years you have been building this ' +
        'house and it is still not finished.',
      grants: 'obs.a1.scaffolding',
    },
    {
      id: 'newspaper',
      label: 'a Boston newspaper',
      ...at('piazza'),
      examine:
        'Three weeks old by the time it reached the Potomac. Concord and Lexington — a column of ' +
        'regulars harried nineteen miles back to Charlestown by farmers who would not stand and ' +
        'fight in the open.',
      grants: 'doc.a1.boston_clipping',
      prop: 'papers',
    },
    {
      id: 'ledger',
      label: 'the farm ledger',
      ...at('piazza'),
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
      prop: 'papers',
    },
    {
      id: 'commission',
      label: 'the Fairfax commission',
      ...at('piazza'),
      examine:
        'Command of the Fairfax Independent Company. You did not ask for it either. Four counties ' +
        'have now named you to something, and none of them waited for an answer.',
      grants: 'doc.a1.commission',
      prop: 'papers',
    },
    {
      id: 'uniform',
      label: 'the new uniform',
      ...at('packing'),
      examine:
        'Blue faced with buff, cut to your own specification, hanging where it can be seen. You ' +
        'have not said why you had it made. Neither has anyone asked.',
      grants: 'obs.a1.uniform',
      prop: 'uniform',
    },
    {
      id: 'surveyors_chest',
      label: "the surveyor's chest",
      ...at('chest'),
      examine:
        'Chain, compass, and the Ohio field books from when you were seventeen. You know that ' +
        'country better than any man in Virginia. Ground is a thing you can read.',
      grants: 'obs.a1.surveying',
      prop: 'chest',
    },
    {
      id: 'braddock',
      label: "Braddock's sash",
      ...at('packing'),
      examine:
        'Crimson silk, given to you as he was dying on the Monongahela road. Two horses shot ' +
        'under you that day, four balls through your coat, and nine hundred men lost in three hours.',
      grants: 'doc.a1.braddock',
      prop: 'sash',
    },
    {
      id: 'lund_letter',
      label: "Lund's accounts",
      ...at('packing'),
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
      prop: 'papers',
    },
    {
      id: 'bowling_green',
      label: 'the bowling green',
      ...at('lawn'),
      examine:
        'You laid it out yourself, and the serpentine walks either side of it, and you moved grown ' +
        'trees to stand where you wanted them. Nothing on this side of the house grew where it ' +
        'chose to.',
    },
    {
      id: 'river_view',
      label: 'the river beyond',
      ...at('lawn'),
      examine:
        'The Potomac shows over the roofline, near two miles across, with Maryland a low green ' +
        'line above it. The herring come up in April in numbers that beggar description. You will ' +
        'not be here to count them.',
      grants: 'obs.a1.river',
    },
    {
      id: 'paddock',
      label: 'the paddock rail',
      ...at('paddock'),
      examine: 'Nelson is in the near paddock and out of temper. He will be saddled before the week is out.',
    },
    {
      id: 'mill',
      label: 'the mill road',
      ...at('paddock'),
      examine:
        'The road runs three miles to the gristmill. Everything you have built here is a machine ' +
        'for turning this ground into money, and it only runs if someone is standing over it.',
    },
    {
      id: 'greenhouse',
      label: 'the garden wall',
      ...at('lawn'),
      examine:
        'Seedlings under glass, half of them experiments. You wrote to England for the seed and ' +
        'the war may well arrive before the answer does.',
    },
    {
      id: 'chariot',
      label: 'the chariot',
      // Under the painted chariot at 0.815 of the frame, a little nearer than
      // the art sits so a player walking the front of the yard meets it.
      ...at('drive'),
      examine:
        'Packed for Philadelphia. Whatever the Congress decides, you are going — the only question ' +
        'is what you are when you come back.',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'martha',
      look: MARTHA_LOOK,
      name: 'Martha',
      hearFlag: 'heard.a1.martha',
      ...at('piazza'),
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
        portrait: 'martha',
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
        rejoinders: {
          vanity: 'They will describe the coat in their letters home. Every one of them.',
          restraint: 'Wear it once and you cannot afterwards be a man who did not.',
          duty: 'She is asking what you mean to be. Answer that, not the coat.',
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
      look: { coat: '#6E5B45', hat: 'round', build: 1.10, tall: 0.97 },
      name: 'Lund',
      hearFlag: 'heard.a1.lund',
      ...at('packing'),
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
      look: LEE_LOOK,
      name: 'William Lee',
      // Standing just forward of the chariot he has finished loading. The x has
      // to be near the bound: depth compresses the frame toward the centre, so
      // an actor at 0.70 lands nowhere near the painted chariot at 0.815.
      ...at('paddock'),
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
      look: { coat: '#8A7B5E', hat: 'tricorne', build: 0.94, tall: 1.00 },
      name: 'the messenger',
      ...at('drive'),

      /*
       * THE FIRST CHOICE IN THE GAME, AND IT DOES NOTHING.
       *
       * The player spawns on this spot, so this man is reliably the first thing
       * anyone touches — which makes him the right place to teach the interface
       * (05 §1.1) with the stakes at zero.
       *
       * Every option is `effects: {}`. The council argues, the emblems show who
       * wants what, the choice commits and cannot be taken back, and then it
       * turns out to have cost nothing. What it leaves behind is a student who
       * has used the panel once before the panel matters, and a small true fact
       * about the man: how he treats somebody who has ridden two days to reach
       * him, before he knows what the letter says.
       *
       * It is recorded in `state.decisions` like any other choice, which is
       * what the epilogue's persisted characterization slots are for (07 §1.6).
       */
      warmup: {
        id: 'A1-D0',
        prompt:
          'He has ridden from Philadelphia and he is still holding his hat. The letter is in his ' +
          'other hand and he has not offered it yet.',
        speaker: 'Congress messenger',
        ...MESSENGER,
        voices: ['duty', 'vanity', 'restraint', 'temper'],
        interjections: {
          duty: 'He is not a servant. He carries the correspondence of the Congress and he is owed the civility of the door.',
          vanity: 'He will describe this house, and you in it, to men who have never seen either.',
          restraint: 'Whatever is in that letter, it is already true. Another minute will not alter it.',
          temper: 'Two days on the road and they could not spare a man who knows how to hand over a letter.',
        },
        options: [
          {
            id: 'ask_after_ride',
            label: 'Ask after his ride',
            full: 'Ask what the roads were like, and have something brought out to him, before anything else.',
            favoured: ['duty'],
            effects: {},
            result:
              'He tells you about the ferry at the Occoquan and a horse that went lame at Dumfries. ' +
              'It takes four minutes. The letter waits, and is not improved by waiting.',
          },
          {
            id: 'take_it_standing',
            label: 'Take it and read it standing',
            full: 'Put out your hand for the letter and read it where you are, in the yard, with him watching.',
            favoured: ['temper', 'restraint'],
            effects: {},
            result:
              'You read it standing in the grass with your hat still on. He watches your face and ' +
              'learns nothing from it, which is a thing people have remarked on since you were twenty.',
          },
          {
            id: 'finish_the_row',
            label: 'Have him wait',
            full: 'Finish what you were doing. He has come a long way; another quarter hour will not hurt him.',
            favoured: ['vanity'],
            effects: {},
            result:
              'You finish the row. It is not rudeness and it is not quite not-rudeness, and by the ' +
              'time you take the letter you have decided something, though not what you think.',
          },
        ],
      },

      lines: [
        {
          speaker: 'Congress messenger',
          ...MESSENGER,
          text:
            'Philadelphia has voted to raise an army before it has voted who is to command it. ' +
            'Some think the two questions have one answer.',
        },
        /*
         * The clock, planted where nobody can act on it.
         *
         * The whole army's terms ran to the end of 1775, and that single fact
         * very nearly ended the war twice. It is mentioned here in May, by a
         * man with no stake in it, as a piece of paperwork — so that when it
         * detonates in Act 2 the student has already been told and has already
         * failed to notice, which is exactly what happened to Congress.
         */
        {
          speaker: 'Congress messenger',
          ...MESSENGER,
          text:
            'They have the New England men down as enlisted to the end of the year, sir. ' +
            'December. After that it is a fresh sheet of paper and every name written again.',
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
        rejoinders: {
          restraint: 'You have commanded a regiment. They are offering you a continent.',
          duty: 'They will vote tomorrow whether you answer or not.',
          vanity: 'Say no slowly. Nobody remembers a quick refusal.',
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
            /*
             * The voice lock of Act 1.
             *
             * Refusing is a real historical position and he weighed it. But a
             * man can only decline the largest thing he has ever been offered
             * if the part of him that preserves is already the loudest part —
             * and at the opening vector it is not, by two thousandths.
             *
             * So the option is struck for a player who rides to the messenger
             * first, and open for one who has settled the house before
             * answering Philadelphia. Nothing in the game says so. What the
             * player sees is that a sentence they could not say this morning
             * is available to a man who put his affairs in order first.
             *
             * Note it is not the option Washington took, which is the point:
             * if every locked option were the historically correct one, the
             * lesson would be "raise the stat to find the right answer."
             */
            voiceLock: { voice: 'restraint', min: 0.58 },
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
