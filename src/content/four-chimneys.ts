/**
 * FOUR CHIMNEYS — Philip Livingston's house on Brooklyn Heights, 29 August 1776.
 *
 * The council of war that decided the evacuation, and the flattest, most
 * claustrophobic room in the game so far.
 *
 * `docs/05` §3.3: nine officers standing round a table because there are not
 * enough chairs, one candle group, one window, rain on the glass and water
 * coming in under the door. Everything about this interior is built to be
 * SMALLER than the Vassall House: fewer rooms, lower ceiling, one lit table,
 * and no way back out except forward.
 *
 * The three interiors in the game are now three different houses in three
 * different colonies and they are meant to be told apart at a glance:
 *
 *   Mount Vernon   `panelled`, plaster, wide pine, wine carpet, mahogany
 *   the Vassall House  `papered`, blue-green, narrow oak, marble floorcloth
 *   Four Chimneys  `boarded`, a cold grey-buff, plain board throughout, and
 *                  almost nothing on the floor at all
 *
 * Livingston is a merchant prince and this is one of the best houses on Long
 * Island, and it is stripped: the family plate went to Kingston in July, the
 * books are in crates, and there is one carpet left because it was too big to
 * move. A rich house being emptied is a different room from a rich house, and
 * it is the room this act needs.
 */

import type { Interactable, MapDef, NpcDef, PropInstance } from '../types';
import { LIGHT } from '../palette';
import { NE_INDOOR_LEGEND } from './legend';
import { Canvas } from './paint';
import { GLOVER, HAMILTON, MIFFLIN, PUTNAM } from './act3-people';
import { GREENE } from './act2-people';
import { A3_D2_REARGUARD } from './act3-decisions';

const W = 34, H = 22;

/*
 * The plan. One storey of it, because the act does not need the chambers and
 * a stair to nowhere is worse than no stair.
 *
 *   the hall runs front to back with the parlour on the west of it and the
 *   dining room and the office on the east.
 */
const PASS_W = 15, PASS_E = 18;
const WALL_W = 14, WALL_E = 19;
const CROSS = 11;
const FRONT_Z = 19, BACK_Z = 2;

function tiles(): string[] {
  const cv = new Canvas(W, H, ' ');
  cv.rect(5, BACK_Z, 25, FRONT_Z - BACK_Z + 1, '.');
  cv.rect(PASS_W, BACK_Z + 1, PASS_E - PASS_W + 1, FRONT_Z - BACK_Z - 1, 'b');
  /*
   * ONE carpet, in the parlour, because it was too big to take. Everything
   * else in this house is bare board, and the difference between the two
   * rooms is the whole of what "being emptied" looks like from above.
   */
  cv.rect(6, BACK_Z + 1, WALL_W - 6, CROSS - BACK_Z - 1, 'c');
  return cv.lines();
}

function box(cv: Canvas, x: number, z: number, w: number, d: number): void {
  for (let c = x; c < x + w; c++) { cv.set(c, z, '#'); cv.set(c, z + d - 1, '#'); }
  for (let r = z; r < z + d; r++) { cv.set(x, r, '#'); cv.set(x + w - 1, r, '#'); }
}

function walls(): string[] {
  const cv = new Canvas(W, H, ' ');
  box(cv, 5, BACK_Z, 25, FRONT_Z - BACK_Z + 1);
  for (let r = BACK_Z + 1; r < FRONT_Z; r++) { cv.set(WALL_W, r, '#'); cv.set(WALL_E, r, '#'); }
  for (let c = 6; c < WALL_W; c++) cv.set(c, CROSS, '#');
  for (let c = WALL_E + 1; c < 29; c++) cv.set(c, CROSS, '#');

  const opening = (at: number, from: number, axis: 'v' | 'h' = 'v') => {
    for (let i = 0; i < 3; i++) {
      if (axis === 'v') cv.set(at, from + i, ' '); else cv.set(from + i, at, ' ');
    }
  };
  opening(WALL_W, 4);          // the parlour
  opening(WALL_W, 14);         // the office
  opening(WALL_E, 4);          // the dining room
  opening(WALL_E, 14);         // the back room
  opening(FRONT_Z, 15, 'h');   // the front door
  opening(BACK_Z, 15, 'h');    // the garden door, onto the bluff
  return cv.lines();
}

function props(): PropInstance[] {
  return [
    /* --- the hall: emptied ------------------------------------------------ */
    { id: 'chairLadderback', x: 15.5, z: 6.4 },
    { id: 'candleStand', x: 17.4, z: 4.6 },
    { id: 'trunkBox', x: 15.6, z: 16.4 },
    { id: 'crate', x: 17.4, z: 15.0 },
    { id: 'crate', x: 17.2, z: 17.4, flip: true },

    /* --- the parlour: the council of war ---------------------------------
     * Nine officers and four chairs. The table is a tavern table dragged in
     * from somewhere and the map is on it under a candle-branch, and the
     * whole room is arranged so the only lit thing is the table — which is
     * the same trick the Vassall council room uses and is doing the same
     * job in a much poorer room.
     * ------------------------------------------------------------------ */
    { id: 'tableTavern', x: 10.0, z: 6.4 },
    { id: 'chairLadderback', x: 7.4, z: 5.2 },
    { id: 'chairLadderback', x: 12.6, z: 5.2, flip: true },
    { id: 'chairWindsor', x: 7.4, z: 8.4 },
    { id: 'chairWindsor', x: 12.6, z: 8.4, flip: true },
    { id: 'candleStand', x: 10.0, z: 4.4 },
    { id: 'chimneyNE', x: 7.5, z: 3.2, scale: 0.68 },
    { id: 'papers', x: 10.6, z: 5.8 },
    { id: 'bookStack', x: 9.2, z: 5.6 },

    /* --- the office ------------------------------------------------------- */
    { id: 'bureauSlant', x: 7.4, z: 14.0 },
    { id: 'chairWindsor', x: 7.4, z: 15.4 },
    { id: 'crate', x: 11.4, z: 13.0 },
    { id: 'crate', x: 12.6, z: 14.4, flip: true },
    { id: 'bookStack', x: 10.4, z: 16.6 },
    { id: 'papers', x: 12.0, z: 17.0 },
    { id: 'candleStand', x: 12.6, z: 17.8 },

    /* --- the dining room, with the table gone ----------------------------- */
    { id: 'chimneyNE', x: 26.5, z: 3.2, scale: 0.62 },
    { id: 'cupboardCorner', x: 27.0, z: 8.2 },
    { id: 'chairLadderback', x: 22.0, z: 6.0 },
    { id: 'chairLadderback', x: 24.4, z: 7.4, flip: true },
    { id: 'trunkBox', x: 21.4, z: 9.0 },
    { id: 'washTub', x: 26.0, z: 5.4 },

    /* --- the back room: the boat return and the sick ---------------------- */
    { id: 'tableTavern', x: 24.0, z: 15.0, scale: 0.85 },
    { id: 'chairWindsor', x: 21.6, z: 15.4 },
    { id: 'bedSimple', x: 27.0, z: 17.0 },
    { id: 'kitPile', x: 22.0, z: 17.6 },
    { id: 'candleStand', x: 26.4, z: 13.4 },
    { id: 'papers', x: 24.6, z: 14.4 },
  ];
}

function things(): Interactable[] {
  return [
    {
      id: 'council-minutes',
      label: "the council's minutes",
      x: 10, z: 6,
      examine:
        'Taken down as it goes, in a secretary&rsquo;s hand, on the back of a return. Nine names, '
        + 'and against them a single sentence agreed unanimously: that under all the circumstances '
        + 'it was eligible to remove the army to New York.',
      grants: 'obs.a3.minutes',
    },
    {
      id: 'boat-return-house',
      label: 'the return of boats',
      x: 24, z: 15,
      examine:
        'Every craft on this side of the river, by kind and by burden, written out by Glover in a '
        + 'seaman&rsquo;s hand with the tides against them. Add the column up and it is not nine '
        + 'thousand men, and everybody in this room can add.',
      document: 'DOC-A3.4',
    },
    {
      id: 'rain-window',
      label: 'the window',
      x: 15, z: 3,
      examine:
        'It looks down the bluff at a mile of water and there is nothing to see but weather. It '
        + 'has been raining since Tuesday. Not a musket on the line will fire tonight and their '
        + 'fleet cannot beat up the river against this wind, and both of those facts are in this '
        + 'room whether anybody says them or not.',
      grants: 'obs.a3.window',
    },
    {
      id: 'water-door',
      label: 'water under the door',
      x: 16, z: 18,
      examine:
        'Coming in at the sill in a thin sheet and standing in the hall, and somebody has put a '
        + 'folded coat against it, which is not working. Nine general officers are stepping over '
        + 'it and nobody has mentioned it once.',
      grants: 'obs.a3.water',
    },
    {
      id: 'livingston-books',
      label: 'crated books',
      x: 11, z: 13,
      examine:
        'Nailed shut and addressed to Kingston, and never collected. Philip Livingston signed the '
        + 'Declaration seven weeks ago and is in Philadelphia. He will lose this house and the '
        + 'distillery inside two months and get neither back.',
      grants: 'obs.a3.books',
    },
    {
      id: 'childs-shoe',
      label: "a child's shoe",
      x: 27, z: 6,
      examine:
        'One, under the corner cupboard, where it went when the family packed in July and nobody '
        + 'went back for it. There were nine Livingston children in this house. There are nine '
        + 'general officers in it now.',
      grants: 'obs.a3.shoe',
    },
    {
      id: 'congress-copy',
      label: "Congress's resolution, again",
      x: 9, z: 8,
      examine:
        'A printed copy on the table with the minutes, because somebody thought it should be in '
        + 'the room. It resolves that the city be by no means abandoned, but every means used for '
        + 'its preservation and defence.',
      document: 'DOC-A3.1',
      contradicts: {
        heard: 'heard.a3.greene',
        line:
          'Greene has just said, in this room, in front of everybody, that the city cannot be '
          + 'held and should be burnt. The paper beside the minutes forbids it in terms. He is '
          + 'right about the military question and he does not have the authority, and neither do '
          + 'you, and the man who does is two hundred miles away and will take eleven days to '
          + 'answer.',
        grants: 'obs.a3.greene_contradiction',
        note: 'Greene says burn it — Congress has already resolved that it may not be abandoned',
      },
    },
    {
      id: 'ferry-chart',
      label: 'a chart of the crossing',
      x: 26, z: 14,
      examine:
        'The set of the ebb, the shoal off the ferry stairs, and the flat that dries at low '
        + 'water. Drawn by a ferryman, not by an officer, and it is the most useful piece of '
        + 'paper in this house.',
      grants: 'obs.a3.chart',
    },
    {
      id: 'candle-branch',
      label: 'the candles',
      x: 10, z: 4,
      examine:
        'Four of them in a branch, and they are Livingston&rsquo;s, and they are the only light '
        + 'in the room because the shutters are to. Nine faces round a table and none of them '
        + 'able to see the others properly, which is either a difficulty or a mercy.',
    },
    {
      id: 'the-sick',
      label: 'a man on a cot',
      x: 27, z: 17,
      examine:
        'Camp fever, and there are four hundred more like him on this side of the river. By your '
        + 'own order they go in the first boats, before the guns, before the regiments, and '
        + 'before you.',
      grants: 'obs.a3.sick',
    },
    {
      id: 'orders-house',
      label: 'an order not yet signed',
      x: 8, z: 14,
      examine:
        'Written out ready: every regiment to parade at seven with arms and packs, for a night '
        + 'attack upon the enemy&rsquo;s lines. It is a lie. It is the lie that gets nine thousand '
        + 'men down to the water without one of them knowing what is happening, and you are about '
        + 'to sign it.',
      grants: 'obs.a3.false_order',
    },
  ];
}

function npcs(): NpcDef[] {
  return [
    {
      id: 'mifflin',
      name: 'Thomas Mifflin',
      spec: MIFFLIN,
      x: 12, z: 7, facing: 1,
      hearFlag: 'heard.a3.mifflin',
      lines: [
        {
          speaker: 'Thomas Mifflin',
          text:
            'I will take the covering party, sir. Somebody has to stand in an empty line and look '
            + 'like nine thousand men, and I would rather it was me than somebody I have to '
            + 'explain it to afterwards.',
        },
        {
          speaker: 'Thomas Mifflin',
          text:
            'Their advanced sentries are six hundred yards from my works. When you send for me, '
            + 'send for me plainly, sir, because I shall be very tired and it will be very dark.',
          mood: 'hard',
        },
      ],
      decision: A3_D2_REARGUARD,
      after: [
        {
          speaker: 'Thomas Mifflin',
          text:
            'Understood, sir. We hold until we are sent for, and we are the last thing on this '
            + 'island that goes.',
        },
      ],
    },
    {
      id: 'greene-bk',
      name: 'General Greene',
      spec: GREENE,
      x: 8, z: 7, facing: 2,
      hearFlag: 'heard.a3.greene',
      lines: [
        {
          speaker: 'Nathanael Greene',
          text:
            'I have been three weeks on my back with a fever, sir, and I have missed the only '
            + 'battle fought on ground I knew. Sullivan had my command and Sullivan is a prisoner.',
        },
        {
          speaker: 'Nathanael Greene',
          text:
            'I said in July that the city could not be held and should be burnt, and I say it '
            + 'again in this room in front of everybody. Two thirds of it belongs to Tories. Leave '
            + 'them a black field and winter them in tents.',
          mood: 'hard',
        },
      ],
      after: [
        {
          speaker: 'Nathanael Greene',
          text:
            'Then get them off tonight, sir, and get them all off, and do not tell one man in this '
            + 'army what is happening until his feet are wet.',
        },
      ],
    },
    {
      id: 'putnam-house',
      name: 'General Putnam',
      spec: PUTNAM,
      x: 12, z: 9, facing: 1,
      hearFlag: 'heard.a3.putnam_house',
      lines: [
        {
          speaker: 'Israel Putnam',
          text:
            'I had the command four days and I have lost the island, sir, and I shall say so to '
            + 'anybody who asks me and to a good many who do not.',
        },
        {
          speaker: 'Israel Putnam',
          text:
            'What I will not do is stand on it another night. There is a river at our backs and '
            + 'a wind holding their ships out of it, and a wind is not a plan, it is a loan.',
        },
      ],
    },
    {
      id: 'glover-house',
      name: 'Colonel Glover',
      spec: GLOVER,
      x: 22, z: 15, facing: 3,
      hearFlag: 'heard.a3.glover_house',
      lines: [
        {
          speaker: 'John Glover',
          text:
            'You are asking me whether it can be done, sir, and I am the only man in this room '
            + 'who can answer it, so I shall answer it plainly. Yes, if the wind holds and the '
            + 'weather does not clear, and no if either of them goes.',
        },
        {
          speaker: 'John Glover',
          text:
            'A mile over and a mile back, in the dark, against an ebb, in every boat between here '
            + 'and Hell Gate. My men can row until Thursday. What they cannot do is make it '
            + 'darker for longer.',
          mood: 'hard',
        },
      ],
      after: [
        {
          speaker: 'John Glover',
          text:
            'Then I want every boat under my hand and no officer of yours giving my men orders '
            + 'about boats, sir. Not one. It is the whole of what I ask.',
        },
      ],
    },
    {
      id: 'hamilton-house',
      name: 'Captain Hamilton',
      spec: HAMILTON,
      x: 25, z: 6, facing: 1,
      hearFlag: 'heard.a3.hamilton_house',
      lines: [
        {
          speaker: 'Alexander Hamilton',
          text:
            'I am here to be told what happens to two field pieces, sir, and I have been standing '
            + 'against this wall for an hour listening to nine general officers, which is a good '
            + 'deal more useful.',
        },
      ],
    },
  ];
}

export const FOUR_CHIMNEYS: MapDef = {
  id: 'BK-HOUSE',
  title: 'Four Chimneys',
  when: '29 August 1776',
  light: LIGHT.fourChimneys,
  interior: true,
  // Boarded, not panelled and not papered. Livingston could afford either;
  // the room the council sat in was the one with the table in it.
  wallStyle: 'boarded',
  wallTint: '#AFB2A6',
  wallHeight: 1.95,
  ground: tiles(),
  objects: walls(),
  legend: NE_INDOOR_LEGEND,
  props: props(),
  interactables: things(),
  npcs: npcs(),
  spawn: { x: 16, z: 18, facing: 3 },
  arrival: [
    'Rain on the glass, water under the door, and one branch of candles on a table somebody '
    + 'dragged in from the kitchen.',
    'Nine general officers, four chairs, and a question that has already been decided by the '
    + 'weather, the tide, and a road four miles east of the end of your line.',
  ],
  zones: [
    {
      /*
       * The parlour, once the council is sitting: the fill goes almost out
       * and the camera comes right in. It is the tightest camera in the
       * game — 13 against the Vassall council room's 15 — because `docs/05`
       * asks for the most claustrophobic composition before Act 7 and this
       * is the only lever the engine has that does it.
       */
      id: 'council3',
      x: 6, z: 2, w: WALL_W - 6, d: CROSS - 2,
      light: LIGHT.hqCouncil,
      dist: 13,
    },
  ],
  ambient: [
    {
      id: 'amb3.council', x: 10, z: 7, r: 4, minLoudness: 0.30,
      variants: {
        duty: 'Nine of them, and every one has to be able to say afterwards that he was asked.',
        restraint: 'You decided this before you came in the room. Ask them anyway, and mean it.',
        temper: 'Sullivan and Stirling are both prisoners tonight. Two major generals, in one morning.',
        vanity: 'Whatever is written in that book, the country will read that you decided it alone.',
      },
    },
    {
      id: 'amb3.house2', x: 24, z: 15, r: 4, minLoudness: 0.34,
      variants: {
        restraint: 'Four hundred sick go first. Say it once, in orders, and do not let it be argued.',
        duty: 'Somebody has to write the order that lies to the whole army. It will be you.',
      },
    },
  ],
  portals: [
    {
      id: 'out-of-house',
      x: 15, z: FRONT_Z, w: 3, d: 1,
      to: 'BK-FERRY', at: [46, 39], facing: 0,
      label: 'out to the bluff',
      transition: 'cut',
      /*
       * THE NIGHT, ON A DOOR — the same trick Act 2 used for the winter.
       *
       * You go in at four in the afternoon on the twenty-ninth and the
       * council decides the evacuation. You come out at eleven at night into
       * the rain with nine thousand men coming down the road behind you.
       * Nothing announces it, and `A3-D2` sets the flag on every branch, so
       * the night cannot be dodged.
       */
      alt: { requires: 'obs.a3.night_came', to: 'BK-FERRY-N', at: [46, 39] },
    },
  ],
};
