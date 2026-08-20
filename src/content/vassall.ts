/**
 * THE VASSALL HOUSE — headquarters, both floors, both seasons.
 *
 * John Vassall built it on Brattle Street in 1759 and left it in a hurry in
 * 1774, being a loyalist in a town that had stopped being safe for one. From
 * July 1775 to April 1776 the Continental Army was run out of it. Sixty years
 * later Longfellow lived in it for forty-five years, which is the only reason
 * it is still standing.
 *
 * PLAN. A centre passage from the street door to the garden door with the
 * stair in it, two rooms either side. West of the passage: the council room
 * at the garden end and the general's office at the street end. East of it:
 * the secretaries' room and the dining room. Upstairs, four chambers under
 * the same roof, and from December one of them has Martha in it.
 *
 * Orientation is the same as everywhere else in the game: low row = up the
 * screen = the garden and the hill beyond it; high row = the street and the
 * camp; low column = west; high column = east.
 *
 * WHY THE SEASONS ARE TWO MAPS AND NOT ONE. The house does not change. What
 * changes is who is in it: in the autumn Knox is at that table arguing for a
 * journey nobody believes in, and by the end of December he is somewhere west
 * of Albany with sixty guns on sledges and his chair is empty. Building that
 * out of visibility flags on one map would put a conditional on every person
 * and every object in the file. Two maps out of one builder is less code and
 * far less to get wrong.
 */

import type { Interactable, MapDef, NpcDef, PropInstance } from '../types';
import { LIGHT } from '../palette';
import { INDOOR_LEGEND } from './legend';
import { Canvas } from './paint';
import { MARTHA } from './people';
import { GATES, HARRISON, KNOX, REED } from './act2-people';
import { A2_D2_COUNCIL, A2_D3_ENLISTMENT } from './act2-decisions';
import type { Season } from './cambridge';

const W = 40, H = 24;

/*
 * The plan, as named numbers. Everything else in this file is derived.
 *
 * The stair is against the EAST wall of the passage here, where the mansion's
 * was against the west. That is not variety for its own sake: it is the same
 * lesson applied — a flight across the full width of a passage is a dam, and
 * a flight against one wall with three tiles of level walkway beside it is a
 * staircase you can climb and also walk past.
 */
const PASS_W = 17, PASS_E = 21;
const WALL_W = 16, WALL_E = 22;
const STAIR_W = 20, STAIR_E = 21;
const STAIR_FOOT = 12, STAIR_HEAD = 10;
const CROSS = 12;              // the cross wall in both side ranges
const FRONT_Z = 21, GARDEN_Z = 3;

/* ---------------------------------------------------------------------- *
 * GROUND FLOOR
 * ---------------------------------------------------------------------- */

function groundTiles(): string[] {
  const cv = new Canvas(W, H, ' ');
  cv.rect(6, GARDEN_Z, 29, FRONT_Z - GARDEN_Z + 1, '.');
  // The passage takes a painted floorcloth, as a fine hall did.
  cv.rect(PASS_W, GARDEN_Z + 1, PASS_E - PASS_W + 1, FRONT_Z - GARDEN_Z - 1, 'p');
  // The flight itself is boards, and this is not a detail. A stair whose
  // treads inherit the passage's painted checkerboard reads as a climbing
  // floorcloth, which is precisely what went wrong at Mount Vernon and had to
  // be fixed there. Bare walnut, and the risers do the rest.
  cv.rect(STAIR_W, STAIR_HEAD, 2, STAIR_FOOT - STAIR_HEAD + 1, '.');
  // The council room gets the carpet. It is the best room in the house and
  // fourteen general officers sit in it.
  cv.rect(7, GARDEN_Z + 1, WALL_W - 7, CROSS - GARDEN_Z - 1, 'c');
  return cv.lines();
}

function groundElevation(): string[] {
  const cv = new Canvas(W, H, '0');
  cv.rect(STAIR_W, STAIR_FOOT, 2, 1, '1');
  cv.rect(STAIR_W, STAIR_FOOT - 1, 2, 1, '2');
  cv.rect(STAIR_W, STAIR_HEAD, 2, 1, '3');
  cv.rect(STAIR_W, STAIR_HEAD - 1, 2, 1, '3');   // the landing under the head wall
  return cv.lines();
}

/** Three tiles wide, every doorway, for the reason recorded in mansion.ts. */
function opening(cv: Canvas, axis: 'v' | 'h', at: number, from: number): void {
  for (let i = 0; i < 3; i++) {
    if (axis === 'v') cv.set(at, from + i, ' '); else cv.set(from + i, at, ' ');
  }
}

function box(cv: Canvas, x: number, z: number, w: number, d: number): void {
  for (let c = x; c < x + w; c++) { cv.set(c, z, '#'); cv.set(c, z + d - 1, '#'); }
  for (let r = z; r < z + d; r++) { cv.set(x, r, '#'); cv.set(x + w - 1, r, '#'); }
}

function groundWalls(): string[] {
  const cv = new Canvas(W, H, ' ');
  box(cv, 6, GARDEN_Z, 29, FRONT_Z - GARDEN_Z + 1);
  for (let r = GARDEN_Z + 1; r < FRONT_Z; r++) { cv.set(WALL_W, r, '#'); cv.set(WALL_E, r, '#'); }
  for (let c = 7; c < WALL_W; c++) cv.set(c, CROSS, '#');
  for (let c = WALL_E + 1; c < 34; c++) cv.set(c, CROSS, '#');

  // The head of the flight: a blank wall it turns against, so the top tread is
  // a landing rather than a three-step drop back into the passage.
  for (let c = STAIR_W; c <= STAIR_E; c++) cv.set(c, STAIR_HEAD - 1, '#');

  opening(cv, 'v', WALL_W, 5);            // the council room
  opening(cv, 'v', WALL_W, 15);           // the office
  opening(cv, 'v', WALL_E, 5);            // the secretaries
  opening(cv, 'v', WALL_E, 15);           // the dining room
  opening(cv, 'h', FRONT_Z, 18);          // the street door
  opening(cv, 'h', GARDEN_Z, 18);         // the garden door
  return cv.lines();
}

function groundProps(season: Season): PropInstance[] {
  const w = season === 'winter';
  return [
    // --- the passage ------------------------------------------------------
    // The stair is ground, not a prop. No door frames either: a billboard
    // always faces the camera and every one of these openings is in a wall
    // running the other way, so a frame prop reads as turned a quarter-turn
    // from the opening it stands in. See the note in `props.ts`.
    { id: 'chairSide', x: 17.5, z: 6.4 },
    { id: 'chairSide', x: 17.5, z: 17.4, flip: true },
    { id: 'candleStand', x: 18.6, z: 4.6 },
    { id: 'framedPortrait', x: 19.4, z: 20.4 },
    { id: 'trunkBox', x: 18.0, z: 14.6 },

    /* --- the council room. Fourteen chairs, and a table they do not fit ---
     *
     * Two aisles are kept absolutely clear and every piece of furniture in
     * here is placed against them: column 7, down the west wall, and row 11,
     * along the south wall. Together with the door's own column they make a
     * loop, and a loop is the only arrangement of a furnished room that
     * cannot be sealed by adding one more chair.
     *
     * This took two passes. The first put everything in the middle and
     * walled off sixteen tiles of the west end; the second moved the
     * sideboard to the south-east corner and walled off everything BUT the
     * east end. Both looked handsome. Neither could be walked, and only the
     * reachability flood ever said so.
     */
    { id: 'mantel', x: 8.5, z: 4.5, scale: 0.6 },
    { id: 'tableLong', x: 12.0, z: 8.0 },
    { id: 'chairSide', x: 10.4, z: 6.6 },
    { id: 'chairSide', x: 12.0, z: 6.4 },
    { id: 'chairSide', x: 13.6, z: 6.6, flip: true },
    { id: 'chairSide', x: 10.4, z: 9.6 },
    { id: 'chairSide', x: 12.0, z: 9.8 },
    { id: 'chairSide', x: 13.6, z: 9.6, flip: true },
    { id: 'armchair', x: 12.0, z: 5.0 },
    { id: 'candleStand', x: 14.4, z: 8.2 },
    { id: 'sideboard', x: 8.6, z: 4.4 },

    /* --- the general's office, at the street end ------------------------- */
    { id: 'mapTable', x: 11.0, z: 16.0 },
    { id: 'desk', x: 8.6, z: 19.0 },
    { id: 'chairSide', x: 8.6, z: 20.2 },
    { id: 'bookcase', x: 13.6, z: 14.0 },
    { id: 'globe', x: 14.2, z: 19.4 },
    { id: 'papers', x: 9.6, z: 17.6 },
    { id: 'chestSurveyor', x: 7.6, z: 14.2 },
    { id: 'mantel', x: 8.5, z: 13.5, scale: 0.6 },

    /* --- the secretaries' room, at the garden end ----------------------- */
    { id: 'tableLong', x: 27.0, z: 7.0 },
    { id: 'chairSide', x: 25.0, z: 7.0 },
    { id: 'chairSide', x: 29.0, z: 7.0, flip: true },
    { id: 'bookcase', x: 24.0, z: 4.6 },
    { id: 'bookStack', x: 27.2, z: 6.0 },
    { id: 'papers', x: 28.6, z: 6.2 },
    { id: 'chestDrawers', x: 32.0, z: 5.0 },
    { id: 'candleStand', x: 31.6, z: 9.4 },
    { id: 'mantel', x: 30.5, z: 4.5, scale: 0.55 },

    /* --- the dining room, at the street end ----------------------------- */
    { id: 'tableRound', x: 27.0, z: 16.4 },
    { id: 'chairSide', x: 25.0, z: 16.4 },
    { id: 'chairSide', x: 29.0, z: 16.4, flip: true },
    { id: 'chairSide', x: 27.0, z: 14.6 },
    { id: 'sideboard', x: 30.4, z: 14.0 },
    { id: 'dresserPlates', x: 24.4, z: 19.6 },
    { id: 'mantel', x: 30.5, z: 13.5, scale: 0.55 },
    { id: 'candleStand', x: 32.0, z: 18.6 },

    // The one seasonal object on this floor: in December the fires are the
    // reason anybody comes in here, and the wood is stacked in the passage
    // because it is being burnt faster than it can be brought round.
    ...(w
      ? [{ id: 'woodpile', x: 18.4, z: 11.6 }, { id: 'woodpile', x: 31.4, z: 11.4 }]
      : []),
  ];
}

function groundThings(season: Season): Interactable[] {
  const w = season === 'winter';
  return [
    /* --- the office: the densest few square metres in the act ---------- */
    {
      /*
       * THE MAP TABLE.
       *
       * The only object in the game that opens a screen of its own. Looking
       * at it pushes in on the real table and then a drawn survey of the
       * country between Ticonderoga and Cambridge opens full size, with
       * tokens on it that the player moves with the keyboard.
       */
      id: 'map-table',
      label: 'the map table',
      x: 11, z: 16,
      examine:
        'A survey of the country between here and Ticonderoga, weighted at the corners. Three '
        + 'hundred miles of it: a lake, a portage, a river that may or may not bear a load, and '
        + 'a range of hills nobody has ever taken a gun over.',
      grants: 'obs.a2.map',
      opens: 'survey',
    },
    {
      id: 'inkstand',
      label: 'a silver inkstand',
      x: 9, z: 19,
      examine:
        'Vassall&rsquo;s, left on his own desk when he went. You write orders to burn his '
        + 'neighbours&rsquo; hay out of his inkwell, and the housekeeper still dusts it, and '
        + 'nobody in this house has ever remarked on any of that aloud.',
      grants: 'obs.a2.inkstand',
    },
    {
      id: 'knox-plan',
      label: "Colonel Knox's proposal",
      x: 10, z: 17,
      examine:
        'Six pages in a bookseller&rsquo;s hand, with the weights of every gun at Ticonderoga '
        + 'and an estimate in oxen. The man who wrote it has never moved a cannon and has read '
        + 'every book in Boston about how it is done.',
      document: 'DOC-A2.5',
    },
    {
      id: 'gunnery-books',
      label: "the gunnery books",
      x: 14, z: 14,
      examine:
        'Muller, Le Blond, and a French treatise with the pages cut. They are Knox&rsquo;s own '
        + 'stock out of his own shop on Cornhill, and they are the entire artillery education of '
        + 'the Continental Army.',
      grants: 'obs.a2.books',
    },
    {
      id: 'lund-letter',
      label: 'a letter to Lund',
      x: 8, z: 14,
      examine:
        'In your own hand, copied into the letter book, about the officers of this army. You '
        + 'would not say a syllable of it in the street outside, and you have written every '
        + 'syllable of it down and sent it four hundred miles.',
      document: 'DOC-A2.3',
    },

    /* --- the council room ------------------------------------------------ */
    {
      id: 'council-chairs',
      label: 'fourteen chairs',
      x: 12, z: 6,
      examine:
        'Fourteen, brought in from three rooms, because that is how many general and field '
        + 'officers sit at a council of war. The vote of the fourteen is advisory. You have '
        + 'never once said out loud what you would do if it went the other way.',
      grants: 'obs.a2.chairs',
    },
    {
      id: 'returns',
      label: 'the weekly returns',
      x: 14, z: 8,
      examine:
        'Every regiment, every week, present fit for duty. They do not agree with the ration '
        + 'returns, they do not agree with each other, and three colonels have not sent one at '
        + 'all this month. You have complained about this in writing eleven times.',
      grants: 'obs.a2.returns',
    },
    {
      id: 'congress-letter',
      label: 'a letter from Philadelphia',
      x: 9, z: 10,
      examine:
        'A resolution of the Continental Congress, votes and figures, fixing the size of this '
        + 'army and the term of every man in it.',
      document: 'DOC-A2.4',
      contradicts: {
        heard: 'heard.a2.gates',
        line:
          'Gates has just assured you that Congress will extend the enlistments the moment they '
          + 'understand the case. The resolution in your hand ends on the last day of December '
          + '1776 and was voted eight days ago by men who had the case in front of them.',
        grants: 'obs.a2.congress_contradiction',
        note: 'Gates says Congress will extend the term — the resolution in your hand already fixed it',
      },
    },
    {
      id: 'window-north',
      label: 'the garden window',
      x: 19, z: 4,
      examine:
        'It looks straight up the hill to the works, and past them, on a clear day, to the '
        + 'spires of a town you have never set foot in. You have stood at it every morning since '
        + 'July and it has never once shown you anything new.',
      grants: 'obs.a2.window',
    },
    {
      id: 'portrait-turned',
      label: 'a portrait turned to the wall',
      x: 8, z: 11,
      examine:
        'Face in, on the floor behind the sideboard, and nobody will say who turned it or when. '
        + 'It is presumably Vassall, or his father, or his King. Everyone in this house has '
        + 'walked past it for five months and left it exactly as it is.',
      grants: 'obs.a2.portrait',
    },

    /* --- the secretaries' room ------------------------------------------ */
    {
      id: 'orders-book',
      label: 'the orderly book',
      x: 27, z: 7,
      examine:
        'Every general order since the third of July, copied fair and issued to the regiments. '
        + 'You can read the whole first summer of this war in it and most of it is about latrines, '
        + 'firewood and men firing their muskets in camp for amusement.',
      grants: 'obs.a2.orders_book',
    },
    {
      id: 'commissary-ledger',
      label: 'the commissary ledger',
      x: 29, z: 6,
      examine:
        'What has been bought, from whom, and at what price, in a colony where the army has no '
        + 'money and the currency is a piece of paper Congress printed last month. Every honest '
        + 'entry in it is a farmer taking a risk.',
      grants: 'obs.a2.commissary',
    },
    {
      id: 'dispatch-box',
      label: 'the dispatch box',
      x: 25, z: 7,
      examine:
        'Locked, with a copy of the cipher in it, and a note of what has gone out and on which '
        + 'day. Ten days to Philadelphia and ten days back, so every question you ask is answered '
        + 'about a situation that ended three weeks ago.',
      grants: 'obs.a2.dispatch',
    },
    {
      id: 'cipher',
      label: 'a sheet of substitutions',
      x: 32, z: 5,
      examine:
        'Names against numbers, in Harrison&rsquo;s hand, because a courier can be taken and has '
        + 'been. It is a poor cipher. Anyone with an afternoon and a taste for puzzles could '
        + 'break it, and somebody in New York almost certainly has.',
    },

    /* --- the dining room -------------------------------------------------- */
    {
      id: 'dinner-table',
      label: 'the dinner table',
      x: 27, z: 16,
      examine:
        'You dine at three, with whichever officers are about and any stranger who has ridden in '
        + 'with a letter. It is the only hour of the day when this house is not a headquarters, '
        + 'and you have never once cancelled it.',
      grants: 'obs.a2.dinner',
    },
    {
      id: 'vassall-plate',
      label: "the Vassalls' plate",
      x: 24, z: 19,
      examine:
        'On the dresser, with the family arms on it, being used every day by men who are at war '
        + 'with the family. It is inventoried, and the inventory is signed, and one day somebody '
        + 'is going to be asked to account for it.',
      grants: 'obs.a2.plate',
    },
    {
      id: 'chimney-glass',
      label: 'a looking glass',
      x: 30, z: 14,
      examine:
        'Over the chimney, and it shows you a man of forty-three in a blue coat he had made in '
        + 'February on the chance of exactly this. You do not stop in front of it. You have '
        + 'noticed that you do not stop in front of it.',
      grants: 'obs.a2.glass',
    },

    /* --- seasonal --------------------------------------------------------- */
    ...(w
      ? [
        {
          id: 'petition',
          label: 'a petition, and two orders',
          x: 11, z: 18,
          examine:
            'Three papers on the same table. A petition from free negroes turned away at the '
            + 'recruiting table; your own general order of the twelfth of November that turned '
            + 'them away; and a printed copy of Dunmore&rsquo;s proclamation offering them '
            + 'freedom for a musket.',
          document: 'DOC-A2.7',
        },
        {
          id: 'empty-chair',
          label: "Knox's chair",
          x: 13, z: 16,
          examine:
            'Pushed back from the map table and nobody has moved it. He went west on the '
            + 'seventeenth of November with a warrant, a brother, and no experience whatever, '
            + 'and there has been no word for eighteen days.',
          grants: 'obs.a2.knox_gone',
        },
      ]
      : [
        {
          id: 'powder-return-hq',
          label: 'the return of powder',
          x: 12, z: 9,
          examine:
            'Folded twice and put under the inkstand where the servants do not go. You have shown '
            + 'it to four men. Every other person in this house, this camp and this Congress '
            + 'believes there are three hundred barrels.',
          document: 'DOC-A2.1',
        },
        {
          id: 'emerson-account',
          label: "the chaplain's account",
          x: 29, z: 9,
          examine:
            'Emerson of Concord walked the whole camp and wrote down what the men were living in, '
            + 'tent by tent, because he had never seen anything like it and did not expect to '
            + 'again.',
          document: 'DOC-A2.2',
        },
      ]),
  ];
}

function groundNpcs(season: Season): NpcDef[] {
  if (season === 'winter') {
    return [
      {
        id: 'reed',
        name: 'Joseph Reed',
        spec: REED,
        x: 12, z: 18, facing: 2,
        hearFlag: 'heard.a2.reed',
        lines: [
          {
            speaker: 'Joseph Reed',
            text:
              'Three papers, sir, and they are on your table because I could not think of an '
              + 'order to put them in that made them easier.',
          },
          {
            speaker: 'Joseph Reed',
            text:
              'Free men, sir. Men who stood in the redoubt in June, turned away last month by '
              + 'officers holding your signature, while Dunmore is offering their freedom to '
              + 'everybody else&rsquo;s.',
            mood: 'hard',
          },
        ],
        decision: A2_D3_ENLISTMENT,
        after: [
          {
            speaker: 'Joseph Reed',
            text:
              'I will have it copied out tonight and in the orderly book at reveille. It will be '
              + 'read to every regiment on the lines by noon, sir, whatever it says.',
          },
        ],
      },
      {
        id: 'gates-w',
        name: 'General Gates',
        spec: GATES,
        x: 12, z: 7, facing: 0,
        hearFlag: 'heard.a2.gates_w',
        lines: [
          {
            speaker: 'Horatio Gates',
            text:
              'Twenty years in the King&rsquo;s service, sir, and I never once saw an army '
              + 'dissolve itself by arithmetic on a fixed day and reassemble the next morning. '
              + 'There is no drill for it because nobody has ever needed one.',
          },
          {
            speaker: 'Horatio Gates',
            text:
              'I would sooner keep four thousand men who chose to stay than eleven thousand who '
              + 'were told they could not go. So, I believe, would you. We shall see whether '
              + 'Philadelphia agrees with either of us.',
          },
        ],
      },
      {
        id: 'harrison-w',
        name: 'Robert Harrison',
        spec: HARRISON,
        x: 28, z: 7, facing: 3,
        hearFlag: 'heard.a2.harrison',
        lines: [
          {
            speaker: 'Robert Harrison',
            text:
              'Eleven letters out today, sir, and nine of them ask for something we have already '
              + 'asked for twice. I have stopped varying the wording. It seemed like vanity.',
          },
          {
            speaker: 'Robert Harrison',
            text:
              'Mrs Washington came up from Virginia on the eleventh, sir, over five hundred miles '
              + 'of December road. She is upstairs. She has said nothing whatever about the road.',
          },
        ],
      },
    ];
  }
  return [
    {
      id: 'knox',
      name: 'Henry Knox',
      spec: KNOX,
      x: 13, z: 16, facing: 1,
      hearFlag: 'heard.a2.knox',
      lines: [
        {
          speaker: 'Henry Knox',
          text:
            'Fifty-nine pieces at Ticonderoga, sir, doing nothing, and a lake and a river and a '
            + 'range of hills between them and this hill. I have never moved a gun. I have read '
            + 'everything ever written about moving them.',
        },
        {
          speaker: 'Henry Knox',
          text:
            'Sledges, sir, not wagons. You want the ground frozen, not soft. Every man who tells '
            + 'you winter makes it impossible is thinking about a wagon, and a wagon is exactly '
            + 'the wrong idea.',
          mood: 'warm',
        },
      ],
      after: [
        {
          speaker: 'Henry Knox',
          text:
            'Then I will want a warrant, sir, and money, and your name on a paper that says I may '
            + 'take what I need from anybody between here and the lake.',
        },
      ],
    },
    {
      id: 'gates',
      name: 'General Gates',
      spec: GATES,
      x: 12, z: 7, facing: 0,
      hearFlag: 'heard.a2.gates',
      lines: [
        {
          speaker: 'Horatio Gates',
          text:
            'Twenty years in the King&rsquo;s service, sir, and I know what that army over there '
            + 'can do on a bad day, which is more than any man at this table who has only read '
            + 'about it.',
        },
        {
          speaker: 'Horatio Gates',
          text:
            'A council of war is not a formality and it is not an insult. It is fourteen men '
            + 'putting their names to a thing so that no one man has to carry it alone. Congress '
            + 'will extend the enlistments the moment they understand the case.',
        },
      ],
      decision: A2_D2_COUNCIL,
      after: [
        {
          speaker: 'Horatio Gates',
          text:
            'It is entered in the minutes as you gave it, sir. I have signed under it, as have '
            + 'the others. Whatever comes of it, no man at this table can say afterwards that he '
            + 'was not asked.',
        },
      ],
    },
    {
      id: 'harrison',
      name: 'Robert Harrison',
      spec: HARRISON,
      x: 28, z: 7, facing: 3,
      hearFlag: 'heard.a2.harrison',
      lines: [
        {
          speaker: 'Robert Harrison',
          text:
            'Fourteen letters out today, sir. Congress, Governor Trumbull, the Massachusetts '
            + 'Council, two colonels who wish to resign and one who wishes not to have resigned.',
        },
        {
          speaker: 'Robert Harrison',
          text:
            'I was your attorney in Alexandria, sir. I drew your leases. I did not expect to be '
            + 'writing to a Congress about firewood, but the hand is the same and so is the '
            + 'want of anybody else to do it.',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * UPPER FLOOR
 * ---------------------------------------------------------------------- */

function upperTiles(): string[] {
  const cv = new Canvas(W, H, ' ');
  cv.rect(6, GARDEN_Z, 29, FRONT_Z - GARDEN_Z + 1, '.');
  cv.rect(PASS_W, GARDEN_Z + 1, PASS_E - PASS_W + 1, FRONT_Z - GARDEN_Z - 1, 'p');
  cv.rect(STAIR_W, STAIR_HEAD, 2, 1, '.');
  cv.rect(7, CROSS + 1, WALL_W - 7, FRONT_Z - CROSS - 1, 'c');
  return cv.lines();
}

function upperWalls(): string[] {
  const cv = new Canvas(W, H, ' ');
  box(cv, 6, GARDEN_Z, 29, FRONT_Z - GARDEN_Z + 1);
  for (let r = GARDEN_Z + 1; r < FRONT_Z; r++) { cv.set(WALL_W, r, '#'); cv.set(WALL_E, r, '#'); }
  for (let c = 7; c < WALL_W; c++) cv.set(c, CROSS, '#');
  for (let c = WALL_E + 1; c < 34; c++) cv.set(c, CROSS, '#');

  // The stairwell. The tiles the flight climbs through are floor below and
  // open air here, so they are closed — which also gives the head of the
  // stair the enclosing box a real one has.
  for (let r = STAIR_HEAD + 1; r <= STAIR_FOOT; r++) {
    for (let c = STAIR_W; c <= STAIR_E; c++) cv.set(c, r, '#');
  }

  opening(cv, 'v', WALL_W, 5);
  opening(cv, 'v', WALL_W, 15);
  opening(cv, 'v', WALL_E, 5);
  opening(cv, 'v', WALL_E, 15);
  return cv.lines();
}

function upperThings(season: Season): Interactable[] {
  const w = season === 'winter';
  return [
    {
      id: 'camp-bed',
      label: 'a camp bed',
      x: 12, z: 6,
      examine:
        'Iron, folding, and made up in a room with a proper bedstead standing empty beside it. '
        + 'You have slept in this house since July and you have not once slept in the Vassalls&rsquo; '
        + 'bed, and you would find it difficult to say why if anybody asked.',
      grants: 'obs.a2.camp_bed',
    },
    {
      id: 'field-desk',
      label: 'the field desk',
      x: 14, z: 9,
      examine:
        'A box of drawers on a stand, hinged to fold flat and go on a packhorse in four minutes. '
        + 'Everything you have written since Philadelphia has been written on it, and it will '
        + 'still be in use at Newburgh in eight years.',
      grants: 'obs.a2.field_desk',
    },
    {
      id: 'garret',
      label: "the secretaries' garret",
      x: 27, z: 6,
      examine:
        'Two truckle beds, a table, and candles burnt down to the socket. Reed and Harrison sleep '
        + 'here when they sleep. The wastepaper basket has three drafts of the same paragraph in '
        + 'it, each one shorter than the last.',
      grants: 'obs.a2.garret',
    },
    {
      id: 'guest-chamber',
      label: 'a chamber, made ready',
      x: 27, z: 17,
      examine:
        'Aired, turned down, and a fire laid in the grate that nobody has lit. It has been ready '
        + 'like this for some weeks. Nobody in this house has said out loud who it is ready for.',
    },
    {
      id: 'hill-window',
      label: 'the window over the garden',
      x: 19, z: 4,
      examine:
        'From up here you can see the whole works at once, the burying ground behind them, and '
        + 'the water past that. It is the only place in Cambridge where the shape of the problem '
        + 'is visible in one look.',
      grants: 'obs.a2.upper_window',
    },
    ...(w
      ? [{
        id: 'martha-trunk',
        label: 'a corded trunk',
        x: 12, z: 17,
        examine:
          'Come five hundred miles from Virginia in December, in a chariot, over roads that were '
          + 'not roads by Baltimore. It has been unpacked. That means she is not going back '
          + 'before the spring, and nobody has said that out loud either.',
        grants: 'obs.a2.martha_came',
      }]
      : [{
        id: 'empty-room',
        label: 'an empty room',
        x: 12, z: 17,
        examine:
          'Swept, and nothing in it but a chair. The housekeeper asks once a week whether it is '
          + 'to be got ready and you have said not yet, once a week, since August.',
      }]),
  ];
}

function upperNpcs(season: Season): NpcDef[] {
  if (season !== 'winter') return [];
  return [
    {
      /*
       * Martha arrived at Cambridge on 11 December 1775, having come up from
       * Mount Vernon by chariot — about five hundred miles, in winter, at
       * forty-four. She came every winter of the war after this one, to every
       * camp, including Valley Forge.
       *
       * She is here and she has no decision, which is deliberate: Act 1 gave
       * her the game's first choice and it moved nothing. This is the same
       * argument made the other way round. She is the only person in Act 2
       * who wants nothing from him.
       */
      id: 'martha-cambridge',
      name: 'Martha',
      spec: MARTHA,
      x: 12, z: 16, facing: 0,
      hearFlag: 'heard.a2.martha',
      lines: [
        {
          speaker: 'Martha',
          text:
            'The roads were what you would expect in December and the chariot held, and I would '
            + 'rather not be asked about it again by anybody.',
          mood: 'warm',
        },
        {
          speaker: 'Martha',
          text:
            'You have written to me about the powder, the officers, the returns and the '
            + 'enlistments. You have not once written to me about you, and I did not come five '
            + 'hundred miles to read the letters again.',
          mood: 'hard',
        },
      ],
      after: [
        {
          speaker: 'Martha',
          text:
            'Then I shall stay until the spring, and I shall come again next winter, and we will '
            + 'not discuss it as though it were in question.',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * The maps
 * ---------------------------------------------------------------------- */

export function vassallGround(season: Season): MapDef {
  const w = season === 'winter';
  return {
    id: w ? 'CB-HQ-W' : 'CB-HQ',
    title: 'Head Quarters, Cambridge',
    when: w ? '30 December 1775' : 'October 1775',
    light: LIGHT.hqParlour,
    interior: true,
    wallStyle: 'panelled',
    wallHeight: 2.2,
    ground: groundTiles(),
    elev: groundElevation(),
    objects: groundWalls(),
    legend: INDOOR_LEGEND,
    props: groundProps(season),
    interactables: groundThings(season),
    npcs: groundNpcs(season),
    spawn: { x: 19, z: 20, facing: 3 },
    arrival: w
      ? [
        'The house is warm for the first time since you took it, because the wood is being burnt '
        + 'faster than it can be carted, and the bill for it is on the table with everything else.',
      ]
      : [
        'A centre passage, a good stair, and four rooms belonging to a man who is in Boston '
        + 'behind the enemy&rsquo;s lines wondering what has become of them.',
      ],
    zones: [
      {
        /*
         * The council room, when the council is sitting.
         *
         * Fourteen men and one branch of candles. The fill goes almost black,
         * the camera comes in, and the only lit thing in the frame is the
         * table — which is the only thing in the room that matters. It is the
         * same mechanism the Quarter uses at Mount Vernon and it is doing the
         * opposite job: there the grade drains to refuse to make a place
         * beautiful, and here it concentrates to say that a decision is being
         * made in this rectangle and nowhere else.
         */
        id: 'council',
        x: 7, z: 3, w: WALL_W - 7, d: CROSS - 3,
        light: LIGHT.hqCouncil,
        dist: 15,
      },
    ],
    portals: [
      {
        id: 'out-to-camp',
        x: 18, z: FRONT_Z, w: 3, d: 1,
        to: 'CB-CAMP', at: [49, 43], facing: 0,
        label: 'out to the forecourt',
        transition: 'cut',
        /*
         * THE SEASON, ON A DOOR.
         *
         * You go in at this door in the autumn and the council of war settles
         * what the army is going to do about Boston. You come out of it into
         * December. Nothing announces the change; the door is the same door
         * and the flag on it is set by A2-D2, which is the decision that ends
         * the autumn whichever way it goes.
         */
        alt: { requires: 'obs.a2.winter_came', to: 'CB-CAMP-W', at: [49, 43] },
      },
      {
        id: 'up-stair',
        x: STAIR_W, z: STAIR_HEAD, w: 2, d: 1,
        // Lands in the passage BESIDE the head of the flight, not on the
        // stairwell — which on this floor is walled off, because the tiles
        // the flight climbs through are floor below and open air here.
        to: w ? 'CB-HQ-UP-W' : 'CB-HQ-UP', at: [PASS_W + 1, STAIR_HEAD], facing: 0,
        label: 'up the stair',
        transition: 'cut',
      },
    ],
  };
}

export function vassallUpper(season: Season): MapDef {
  const w = season === 'winter';
  return {
    id: w ? 'CB-HQ-UP-W' : 'CB-HQ-UP',
    title: 'Head Quarters — the chambers',
    when: w ? '30 December 1775' : 'October 1775',
    light: LIGHT.interiorDay,
    interior: true,
    wallStyle: 'plaster',
    wallHeight: 2.05,
    ground: upperTiles(),
    objects: upperWalls(),
    legend: INDOOR_LEGEND,
    props: [
      { id: 'bedSimple', x: 12.0, z: 5.4 },
      { id: 'chestDrawers', x: 14.2, z: 8.6 },
      { id: 'desk', x: 8.6, z: 9.0 },
      { id: 'chairSide', x: 8.6, z: 10.2 },
      { id: 'trunkBox', x: 8.0, z: 5.2 },
      { id: 'mantel', x: 8.5, z: 4.5, scale: 0.5 },

      { id: 'bedTester', x: 11.6, z: 15.0 },
      { id: 'chestDrawers', x: 8.4, z: 18.6 },
      { id: 'candleStand', x: 14.2, z: 18.6 },
      { id: 'chairSide', x: 13.4, z: 15.6, flip: true },

      { id: 'bedSimple', x: 26.0, z: 5.4 },
      { id: 'bedSimple', x: 30.4, z: 5.4, flip: true },
      { id: 'workTable', x: 28.0, z: 9.0 },
      { id: 'candleStand', x: 24.4, z: 9.4 },
      { id: 'bookStack', x: 28.0, z: 8.2 },

      { id: 'bedSimple', x: 27.0, z: 15.4 },
      { id: 'chestDrawers', x: 31.4, z: 18.4 },
      { id: 'washTub', x: 24.4, z: 19.0 },
      { id: 'mantel', x: 30.5, z: 13.5, scale: 0.5 },

      { id: 'chairSide', x: 18.4, z: 5.4 },
      { id: 'candleStand', x: 18.6, z: 18.6 },
      { id: 'framedPortrait', x: 19.4, z: 4.4 },
    ],
    interactables: upperThings(season),
    npcs: upperNpcs(season),
    spawn: { x: PASS_W + 1, z: STAIR_HEAD, facing: 0 },
    arrival: ['Four chambers under one roof, and a passage between them with a cold draught in it.'],
    portals: [
      {
        id: 'down-stair',
        x: STAIR_W, z: STAIR_HEAD, w: 2, d: 1,
        to: w ? 'CB-HQ-W' : 'CB-HQ', at: [STAIR_W - 2, STAIR_FOOT], facing: 0,
        label: 'down the stair',
        transition: 'cut',
      },
    ],
  };
}

export const HQ_AUTUMN = vassallGround('summer');
export const HQ_WINTER = vassallGround('winter');
export const HQ_UP_AUTUMN = vassallUpper('summer');
export const HQ_UP_WINTER = vassallUpper('winter');
