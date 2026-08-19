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
    'Go inside and answer Martha. She is in the house, waiting.',
    'Give the messenger your answer. He rides back to Philadelphia with it.',
    'Put the estate in order before you leave. You do not know for how long.',
  ],

  /** Two lines of atmosphere, after the facts. */
  opening: [
    'You have been home since the autumn, and you have not been still for a day of it.',
    'A rider came up from the ferry this morning with a letter from Philadelphia, and the ' +
      'house has been quiet in a particular way ever since.',
    'The west door is open. Your wife is somewhere behind it and has been all morning.',
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
      x: 0.71, z: 0.19, r: 0.10, minLoudness: 0.30,
      variants: {
        temper: 'Twenty years you asked them for a royal commission. Twenty years they gave you nothing.',
        ambition: 'Braddock died in your arms and you were twenty-three. Nobody else here has been shot at.',
        vanity: 'They printed the Great Meadows in London. Give them something else to print.',
      },
    },
    {
      id: 'amb.survey',
      x: 0.133, z: 0.30, r: 0.10, minLoudness: 0.34,
      variants: {
        ambition: 'You surveyed that country at seventeen. Nobody in Philadelphia has seen a mile of it.',
        duty: 'You were paid to draw those lines and you drew them true. That is the whole of your record.',
        restraint: 'You know what a hundred miles of it costs a column. Remember that when they ask for speed.',
      },
    },
    {
      id: 'amb.house',
      x: 0.553, z: 0.79, r: 0.11, minLoudness: 0.36,
      variants: {
        restraint: 'Sixteen years and it is not finished. You are not a man who leaves things half-built.',
        vanity: 'It is the north end that shows from the river. Of course it is the north end that is open.',
        duty: 'Lund will write to you about the roof, and you will answer from a tent, and it will get done.',
      },
    },
    {
      id: 'amb.river',
      x: 0.16, z: 0.80, r: 0.11, minLoudness: 0.32,
      variants: {
        duty: 'The herring will come up in April whether you are here to count them or not.',
        restraint: 'Everything here runs on a season. An army does not, and you have not learned that yet.',
      },
    },
    {
      id: 'amb.chariot',
      x: 0.80, z: 0.45, r: 0.10, minLoudness: 0.30,
      variants: {
        vanity: 'They will watch you arrive. Whatever you are wearing will be the first thing said of you.',
        ambition: 'Two days to Philadelphia. The vote will not wait for a man who sets out on Thursday.',
        temper: 'Ride in like a petitioner and they will treat you like one for four years.',
      },
    },
    {
      id: 'amb.mill',
      x: 0.92, z: 0.31, r: 0.10, minLoudness: 0.38,
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

  tasks: [
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
      prop: 'papers',
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
      prop: 'horse',
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
      prop: 'papers',
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
      prop: 'papers',
    },
    {
      id: 'bowling_green',
      label: 'the bowling green',
      x: 0.06,
      z: 0.68,
      examine:
        'You laid it out yourself, and the serpentine walks either side of it, and you moved grown ' +
        'trees to stand where you wanted them. Nothing on this side of the house grew where it ' +
        'chose to.',
    },
    {
      id: 'river_view',
      label: 'the river beyond',
      /* Moved west, off the line of the front door. The doorstep is an
         interactable now and the two were a thumb's width apart. */
      x: 0.16,
      z: 0.80,
      examine:
        'The Potomac shows over the roofline, near two miles across, with Maryland a low green ' +
        'line above it. The herring come up in April in numbers that beggar description. You will ' +
        'not be here to count them.',
      grants: 'obs.a1.river',
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
    /*
     * THE FRONT DOOR.
     *
     * The mansion is painted at the horizon and always will be — the plate puts
     * it past the end of the walkable ground, which is correct for a house seen
     * across its own lawn and useless for a house you are meant to live in. So
     * the door is staged at the far edge of the band, on the plate column the
     * painted door stands in (`xAtPlateX` of the house's centre bay), and it is
     * a door: it opens, and what is behind it is a room.
     */
    {
      id: 'front_door',
      label: 'the west door',
      x: 0.278,
      z: 0.78,
      examine:
        'Up two stone steps, and standing open on the passage. The house has been quiet in a ' +
        'particular way since the rider came, and every quiet thing in it is waiting on the same ' +
        'answer you are.',
      goTo: 'MV-02',
      arriveAt: { x: 0.50, z: 0.16 },
    },
    {
      id: 'kitchen',
      label: 'the kitchen',
      x: 0.70,
      z: 0.70,
      examine:
        'A separate building, as every kitchen here is, and smoking since four. Everything you ' +
        'have ever eaten in that house was carried across this yard in the weather, by somebody ' +
        'who was not asked.',
    },
    {
      id: 'stable',
      label: 'the stable yard',
      x: 0.72,
      z: 0.16,
      examine:
        'Bricked, swept, and better built than most houses in the county. You bred half the horses ' +
        'in it and you can name the dam of every one, which is more than you can do for the men ' +
        'in the Fairfax company.',
    },
    {
      id: 'well',
      label: 'the well',
      x: 0.44,
      z: 0.70,
      examine:
        'Windlass, bucket, and a rope gone furry with use. An army wants forty gallons a man a ' +
        'week and there is no windlass in Massachusetts that has been asked that question yet.',
    },
    {
      id: 'chariot',
      label: 'the chariot',
      // Under the painted chariot at 0.815 of the frame, a little nearer than
      // the art sits so a player walking the front of the yard meets it.
      x: 0.80,
      z: 0.45,
      examine:
        'Packed for Philadelphia. Whatever the Congress decides, you are going — the only question ' +
        'is what you are when you come back.',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'lund',
      look: { coat: '#6E5B45', hat: 'round', build: 1.10, tall: 0.97 },
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
      look: LEE_LOOK,
      name: 'William Lee',
      // Standing just forward of the chariot he has finished loading. The x has
      // to be near the bound: depth compresses the frame toward the centre, so
      // an actor at 0.70 lands nowhere near the painted chariot at 0.815.
      x: 0.93,
      z: 0.44,
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
      x: 0.5,
      z: 0.34,

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
