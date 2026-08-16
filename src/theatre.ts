/**
 * The theatre map — the page that opens an act.
 *
 * NOT the map table. `04-scene-architecture.md` §7 specifies six map tables:
 * genuine 3D, an orbiting camera, annotations that open decisions, entered by
 * the lift from inside a scene and returning to the exact spot they were
 * entered from. All of that stands. This is the other object, and the two
 * should never be confused:
 *
 *   THE MAP TABLE            THE THEATRE MAP
 *   a table you stand at     a page you are shown
 *   lifted into, from a      shown at an act's opening, before you
 *     scene you are in         have control of anything
 *   orbits, 42°–66°          flat. no camera. it is a piece of paper
 *   one problem — a river,   the whole theatre, Montreal to the Chesapeake
 *     a route, ten miles
 *   you decide               you can only read
 *
 * WHY IT EXISTS. The war is bigger than the eight places Washington stands in,
 * and almost none of it is his. He is not at Saratoga, not at Charleston, not
 * at Cowpens or Guilford. `08` §4 gives the player one number to hold across
 * eight acts; this gives them one *picture*, so that when the tokens move
 * between acts — and they move without being touched — the player watches a war
 * go somewhere they are not. That is the whole of how this game intends to tell
 * the trajectory of the Revolution without making the Revolution the subject.
 *
 * THE ONE RULE, and everything else here serves it:
 *
 *   **THE MAP SHOWS WHAT WASHINGTON BELIEVED, NOT WHAT WAS TRUE.**
 *
 * Every token carries the date of the report that put it there and the date
 * that report arrived, and it is drawn in the confidence those two dates earn.
 * Something he can see from a hill is certain. Something eight weeks old is a
 * dashed outline. In July 1775 the guns at Ticonderoga — the thing Act 2 is
 * eventually solved by — are already on this map, and they are the faintest
 * thing on it, because nobody had counted them and nobody would for months.
 *
 * That is not a fog-of-war mechanic dressed as history. It is the reverse: it
 * is the history, and it happens to do the work a fog-of-war mechanic does.
 *
 * REGISTER. R2, and it is the one surface in this game that is not painterly.
 * `09-painterly-direction.md` governs every plate; this is ink, ruled lines and
 * a flat wash on a sheet of paper, and the contrast with seven acts of loaded
 * oil is deliberate. `06` §2.8 is right that a survey plan has no atmosphere
 * and no morale: nothing here is lit, nothing here is moody, and the mood
 * system must never touch it.
 *
 * Relief is read from HACHURES — strokes down the line of steepest fall,
 * heavier where the ground falls harder — and not from any lighting model. The
 * eighteenth century had already solved how to show a third dimension on a flat
 * page with no light in it, and their answer is better looking than ours.
 *
 * VERIFY BEFORE CLASSROOM USE
 * ---------------------------
 * V-TM.1 · Hachuring. Military survey plans of the Rochambeau/Berthier corpus
 *   (1780–82) are hachured, so the technique is in period for this game. The
 *   formal rule that steeper means darker is Lehmann, 1799 — just after. Ours
 *   follows the formal rule because it is legible; that is a small anachronism
 *   and it should be stated rather than quietly enjoyed.
 * V-TM.2 · Every token's two dates. The reported-on dates are of the documented
 *   order and the received dates are estimates from the period's known post
 *   times (Philadelphia to Cambridge ran about a week). None has been checked
 *   against a specific letter. The whole staleness reading depends on them, so
 *   this is the first thing to source.
 * V-TM.3 · The coastline is a hand-drawn approximation at about 40 points, not
 *   a survey. It is right to about ten miles, which is right enough for a page
 *   whose subject is distance, and wrong for anything else.
 */

import { INK } from './palette';

/**
 * The sheet's own paper, and it is NOT `PAPER.BRIGHT`.
 *
 * Every other surface in this game is a fresh sheet on a desk. This one is a
 * working map that has been folded into a saddlebag and opened on a table in
 * the wet, and at `PAPER.BRIGHT` it came out looking like something off a
 * printer — high, cold, and with no room underneath it for the sea to be a
 * different value from the land. A warm tan gives the wash something to sit
 * against and gives the ink somewhere to go.
 */
const SHEET = '#E2D6B6';
/** The same stock in the light, for the folded-back corners. */
const SHEET_LIT = '#F0E7CE';

/* ------------------------------------------------------------------ the sheet
 *
 * Equirectangular, which is what a plan of this extent effectively was, with
 * the east–west axis compressed by the cosine of the middle latitude so the
 * proportions are honest. Without that correction eleven degrees of longitude
 * draw a third wider than they are and New England comes out fat.
 */

const LON0 = -77.5;
const LON_SPAN = 11.5;
const LAT0 = 45.5;
const LAT_SPAN = 7.5;
const KX = Math.cos((42 * Math.PI) / 180);

/** Width over height for any sheet drawn by this module. */
export const SHEET_ASPECT = (LON_SPAN * KX) / LAT_SPAN;

/** Longitude and latitude to a fraction of the sheet. */
export function at(lon: number, lat: number): [number, number] {
  return [(lon - LON0) / LON_SPAN, (LAT0 - lat) / LAT_SPAN];
}

type Pt = [number, number];

/*
 * The Atlantic coast from the Bay of Fundy to the head of Delaware Bay, then up
 * the bay to Philadelphia. Cape Cod is drawn properly — round the bay shore to
 * the tip, down the outer arm, and back west along the sound — because the
 * shape of that cape is one of the two or three outlines a student will
 * actually recognise, and it is what tells them where they are.
 */
const COAST: Pt[] = [
  // Down east: the Bay of Fundy, Penobscot, and the Maine islands generalised
  // away — at this scale that coast is a texture, not a shape.
  [-66.2, 44.5], [-66.9, 44.72], [-67.6, 44.6], [-68.2, 44.42], [-68.5, 44.36],
  [-68.8, 44.5], [-69.05, 44.15], [-69.5, 43.92], [-69.8, 43.8], [-70.2, 43.62],
  [-70.5, 43.35], [-70.75, 43.08], [-70.82, 42.9], [-70.85, 42.82],
  // Cape Ann, then in behind it to Boston harbour.
  [-70.62, 42.66], [-70.95, 42.55], [-71.05, 42.35], [-70.95, 42.15], [-70.65, 41.98],
  // Cape Cod, and it gets the points it needs. The hook is the one outline on
  // this sheet a student is certain to recognise, and it is what tells them
  // where they are before they have read a single word.
  [-70.53, 41.83], [-70.5, 41.75], [-70.25, 41.85], [-70.1, 41.95], [-70.05, 42.02],
  [-70.19, 42.08], [-70.24, 42.03], [-70.06, 41.9], [-69.95, 41.7], [-70.0, 41.64],
  [-70.3, 41.6], [-70.55, 41.55], [-70.66, 41.52],
  // Buzzards Bay, then round Point Judith and up Narragansett to Providence.
  [-70.88, 41.74], [-71.05, 41.55], [-71.2, 41.48], [-71.35, 41.66], [-71.4, 41.82],
  [-71.46, 41.62], [-71.55, 41.35],
  // The Connecticut shore of the Sound, running west to the North River.
  [-72.0, 41.32], [-72.35, 41.28], [-72.9, 41.27], [-73.2, 41.16], [-73.5, 41.03],
  [-73.78, 40.87], [-73.95, 40.72],
  // The Jersey shore, and down to Cape May.
  [-74.05, 40.63], [-74.06, 40.47], [-74.1, 40.2], [-74.25, 39.95], [-74.42, 39.55],
  [-74.65, 39.3], [-74.85, 39.05], [-74.96, 38.93],
];

/**
 * Up Delaware Bay to Philadelphia — held apart from the ocean coast because the
 * water is on the OTHER SIDE of the line here.
 *
 * The shading routine offsets along one normal, so a coast walked in one
 * direction gets its hatching in the sea and a coast walked back up a bay gets
 * it inland. Rather than guess a side per segment, each run says which one it
 * is. This is why Delaware Bay came out as a bare loop in the first cut: it was
 * on the end of the ocean path, inheriting the ocean's answer.
 */
const DELAWARE_BAY: Pt[] = [
  [-74.96, 38.93], [-75.15, 39.1], [-75.35, 39.35], [-75.45, 39.55], [-75.4, 39.72],
  [-75.25, 39.85], [-75.16, 39.95],
];

/** Everything the eye has to read as water, and which flank to hatch. */
const SHORES: { pts: Pt[]; side: 1 | -1 }[] = [];

/**
 * Long Island, closed, and drawn thin.
 *
 * The first cut gave it eight points and the smoothing turned it into a lens
 * that swallowed the Sound. It needs the length: the reason it is on this page
 * at all is that it is what makes New York indefensible, and a student has to
 * be able to see that it is a hundred miles long and lies right across the
 * harbour's throat.
 */
const LONG_ISLAND: Pt[] = [
  [-74.03, 40.65], [-73.7, 40.82], [-73.4, 40.93], [-73.0, 40.96], [-72.6, 40.97],
  [-72.3, 41.03], [-72.1, 41.05], [-71.86, 41.07],
  [-72.0, 40.94], [-72.4, 40.85], [-72.9, 40.77], [-73.3, 40.68], [-73.6, 40.6],
  [-73.9, 40.58],
];

/**
 * The Chesapeake, as one line up the western shore and back down the eastern.
 * It runs off the bottom of the sheet because the bay does — this page stops at
 * the Potomac, and in 1775 so did the war.
 */
const CHESAPEAKE: Pt[] = [
  [-76.0, 38.0], [-76.25, 38.35], [-76.4, 38.6], [-76.5, 38.85], [-76.4, 39.1],
  [-76.2, 39.3], [-76.05, 39.45], [-75.95, 39.35], [-76.0, 39.1], [-75.95, 38.8],
  [-75.85, 38.4], [-75.8, 38.0],
];

SHORES.push({ pts: COAST, side: 1 }, { pts: DELAWARE_BAY, side: -1 },
  { pts: CHESAPEAKE, side: -1 });

/**
 * The sea, as a closed shape: the ocean coast, then out to the sheet's edges.
 *
 * Coastal hatching alone was not enough. It is the right *language* — a plan of
 * this date shades its water rather than filling it — but at 1,100 pixels for
 * four hundred miles the bands land two pixels apart and the eye reads the
 * whole sheet as blank paper with some lines on it. So there is a wash under
 * the hatching now, at a tenth of an opacity: barely a tint, and enough that
 * land and water are never in question.
 *
 * The top-right corner stays paper on purpose. That is Nova Scotia, and it is
 * the one piece of land on this sheet the sea polygon cannot reach.
 */
const SEA: Pt[] = [
  ...COAST,
  [-74.96, 36.0], [-60.0, 34.0], [-60.0, 48.0], [-66.0, 46.4],
];

/**
 * Fresh water, and only the water that carries an army.
 *
 * The Mohawk, the Merrimack and the Schuylkill were all on this sheet and all
 * came off it. They are real rivers and they were making the page busy for a
 * fifteen-year-old, which is the trade this map is always making: every line
 * that does not carry a fact is a line competing with the six that do.
 *
 * What is left is the Hudson–Champlain corridor (the spine of the northern
 * war, and the road the guns have to come down), the Connecticut, the Delaware,
 * and the Potomac, which is on the page because Act 1 begins on it.
 */
const RIVERS: { name: string; path: Pt[]; weight: number }[] = [
  {
    name: 'Hudson',
    weight: 1.5,
    path: [[-73.75, 43.3], [-73.76, 42.9], [-73.76, 42.65], [-73.85, 42.3],
      [-73.93, 41.9], [-73.95, 41.5], [-73.92, 41.2], [-74.02, 40.9], [-74.02, 40.7]],
  },
  {
    name: 'Champlain',
    weight: 2.2,
    path: [[-73.42, 43.6], [-73.39, 43.84], [-73.35, 44.2], [-73.3, 44.6],
      [-73.35, 45.0], [-73.5, 45.3]],
  },
  {
    name: 'George',
    weight: 1.6,
    path: [[-73.71, 43.42], [-73.55, 43.62], [-73.44, 43.72], [-73.39, 43.84]],
  },
  {
    name: 'Connecticut',
    weight: 1.3,
    path: [[-72.1, 45.1], [-72.3, 44.5], [-72.45, 44.0], [-72.55, 43.5], [-72.4, 43.0],
      [-72.55, 42.6], [-72.6, 42.2], [-72.6, 41.9], [-72.55, 41.6], [-72.35, 41.28]],
  },
  {
    name: 'Delaware',
    weight: 1.3,
    path: [[-75.16, 39.95], [-74.85, 40.1], [-74.74, 40.22], [-75.05, 40.55],
      [-75.21, 40.69], [-75.1, 41.0], [-74.85, 41.4], [-75.05, 41.8]],
  },
  {
    name: 'Potomac',
    weight: 1.4,
    path: [[-76.3, 38.0], [-76.7, 38.35], [-77.0, 38.6], [-77.09, 38.71],
      [-77.35, 39.0], [-77.75, 39.3]],
  },
];

/*
 * Ridges, for hachuring. Not terrain data — a handful of lines saying "the
 * ground rises along here", which is all a plan at this scale ever claimed.
 *
 * The first of them is doing real work. The Berkshire and Green Mountain wall
 * is the thing standing between Ticonderoga and Cambridge, and it is why Act 2
 * is a logistics problem rather than a fetch quest. A student who looks at this
 * page in July should be able to see, without being told, that the guns are on
 * the wrong side of a mountain range in the wrong season.
 */
const RIDGES: { path: Pt[]; weight: number }[] = [
  // The Green Mountains running down into the Berkshires.
  { weight: 1.5, path: [[-72.9, 45.0], [-72.95, 44.4], [-73.05, 43.8], [-73.15, 43.2],
    [-73.2, 42.7], [-73.25, 42.3], [-73.3, 41.9]] },
  // The White Mountains.
  { weight: 1.2, path: [[-71.6, 44.4], [-71.3, 44.2], [-71.1, 43.95]] },
  // The Catskills and the Hudson Highlands — the other wall, and the reason
  // holding the river mattered so much to both sides.
  { weight: 1.25, path: [[-74.6, 42.3], [-74.4, 42.0], [-74.2, 41.75], [-74.0, 41.4],
    [-73.9, 41.3]] },
  // The Pennsylvania ridges north-west of Philadelphia.
  { weight: 1.0, path: [[-75.9, 40.6], [-75.5, 40.75], [-75.15, 40.9]] },
  // The Blue Ridge, off at the bottom-left corner behind Mount Vernon.
  { weight: 1.0, path: [[-78.3, 38.6], [-77.9, 39.0], [-77.6, 39.35]] },
];

/**
 * Places named whether or not anything is happening at them — cut to ten.
 *
 * Worcester, New London, Annapolis and Falmouth were all here and are gone.
 * Springfield stays because the guns have to come through it. The test for a
 * name on this page is not "was it a town" — it is "will a student need it to
 * understand a distance".
 */
const PLACES: { lon: number; lat: number; name: string; anchor?: 'l' | 'r' }[] = [
  { lon: -74.01, lat: 40.71, name: 'New York', anchor: 'r' },
  { lon: -73.76, lat: 42.65, name: 'Albany', anchor: 'r' },
  { lon: -72.59, lat: 42.10, name: 'Springfield', anchor: 'r' },
  { lon: -72.68, lat: 41.76, name: 'Hartford', anchor: 'r' },
  { lon: -71.41, lat: 41.82, name: 'Providence' },
  { lon: -71.31, lat: 41.49, name: 'Newport' },
  { lon: -70.76, lat: 43.07, name: 'Portsmouth' },
  { lon: -73.57, lat: 45.5, name: 'Montreal', anchor: 'r' },
  { lon: -74.74, lat: 40.22, name: 'Trenton', anchor: 'r' },
  { lon: -76.61, lat: 39.29, name: 'Baltimore', anchor: 'r' },
];

/** Provinces, set in spaced letters across open ground the way a plan does. */
const PROVINCES: { lon: number; lat: number; name: string; rot?: number }[] = [
  { lon: -72.4, lat: 42.45, name: 'MASSACHUSETTS' },
  { lon: -72.5, lat: 41.62, name: 'CONNECTICUT' },
  { lon: -74.9, lat: 41.5, name: 'NEW YORK' },
  { lon: -74.6, lat: 40.35, name: 'THE JERSIES', rot: -0.5 },
  { lon: -76.5, lat: 40.4, name: 'PENNSYLVANIA' },
  { lon: -71.95, lat: 44.65, name: 'THE GRANTS' },
  { lon: -76.9, lat: 39.15, name: 'MARYLAND' },
];

/* ------------------------------------------------------------------- tokens */

/**
 * What a marker is. Shapes, not colours — the register is ink on paper and the
 * game's one colour rule (Group D, `02`) has no business on a survey plan.
 */
export type TokenKind =
  /** A body of troops. A period plan drew these as blocks and so do we. */
  | 'foot'
  /** Ships. */
  | 'ship'
  /** A fortified place — drawn as a bastioned trace, which is what it was. */
  | 'work'
  /** A seat of government. */
  | 'seat';

export interface Token {
  lon: number;
  lat: number;
  kind: TokenKind;
  /**
   * Whose. `theirs` draws filled, `ours` draws hollow, and that is not a
   * decoration either: a manuscript plan filled the enemy and outlined itself,
   * and it means the British are the solid thing on every page of this game
   * without one word being spent saying so.
   */
  side: 'ours' | 'theirs' | 'neither';
  /** Four words at most. It sits beside the marker in the margin of a page. */
  label: string;
  /** What he knows, in his own register. Read when the marker is focused. */
  note: string;
  /** ISO. When the thing being reported happened, or was last true. */
  dated: string;
  /** ISO. When the report reached him. Blank when nothing ever confirmed it. */
  received?: string;
  /**
   * He is looking at it. Trumps both dates: the British lines at Boston were
   * three weeks stale as *intelligence* and entirely certain as *eyesight*,
   * and the difference between those two is most of what this page teaches.
   */
  seen?: boolean;
  /**
   * A provenance line written by hand, for the marks the two-date model does
   * not fit.
   *
   * Most things on this page are intelligence and age like it. A few are not.
   * The Congress meets on the tenth of May because the Congress before it said
   * so last October — that is not a report and it is not stale, it is an
   * appointment, and running it through the post-times model prints "nobody has
   * confirmed any of this" under a fact he has known for six months.
   *
   * Use it sparingly. Every mark that takes this escape hatch is one the
   * staleness reading no longer teaches anything with.
   */
  known?: string;
  /** Nudge the label off the marker where two sit on top of each other. */
  labelAt?: 'l' | 'r' | 'above' | 'below';
  /**
   * Exact nudge, in sheet units, when the four directions are not enough.
   *
   * Boston needs it. Four of Act 2's six marks are inside twelve miles of each
   * other — the army, the town, the ground at Charlestown and the fleet in the
   * roads — and at this scale twelve miles is eleven pixels. Rather than move
   * the marks, which would be a lie about distance on a page whose whole
   * subject is distance, the labels move and a leader line goes back to the
   * mark. That is what the engravers did with the same problem.
   */
  labelDx?: number;
  labelDy?: number;
}

/** Where a marker's label sits, in sheet units, for canvas and DOM alike. */
export function labelOffset(t: Token): [number, number] {
  if (t.labelDx !== undefined || t.labelDy !== undefined) {
    return [t.labelDx ?? 0, t.labelDy ?? 0];
  }
  if (t.labelAt === 'l') return [-104, 0];
  if (t.labelAt === 'r') return [104, 0];
  if (t.labelAt === 'above') return [0, -34];
  if (t.labelAt === 'below') return [0, 34];
  return [0, 24];
}

export interface Theatre {
  act: number;
  /** ISO. The day the sheet is drawn as of. */
  asOf: string;
  /** What the caption calls it, in modern English. */
  title: string;
  /**
   * What the SHEET calls itself, printed on it as a cartouche.
   *
   * Two registers on one screen and both are wanted. The caption says *The army
   * before Boston*, which is a fifteen-year-old's sentence about what is going
   * on; the paper says *THE SEAT OF WAR*, which is what a map of 1775 with this
   * on it was actually titled. A student reads the first and absorbs the second,
   * and the second is the one that will look familiar in a museum.
   */
  sheetTitle: string;
  sheetSub: string;
  /**
   * One sentence under the map, in the world's register. Never an objective,
   * never a summary of what the player is about to do — the state of the war
   * as he would describe it to himself, and nothing more.
   */
  standing: string;
  tokens: Token[];
}

export const THEATRES: Record<number, Theatre> = {
  /*
   * ACT 1 — 4 May 1775. The control sample, and it is nearly an empty page.
   *
   * `08` §5 makes Act 1 the act where the Return reads blank because there is
   * no army. The map says the same thing in the same breath and says it harder:
   * three marks on four hundred miles of coast, one of them a rumour off a road
   * in Massachusetts that nobody has got straight yet, and the man himself down
   * in the bottom corner, as far from any of it as the page will allow.
   */
  1: {
    act: 1,
    asOf: '1775-05-04',
    title: 'The seat of the disturbances',
    sheetTitle: 'THE BRITISH COLONIES',
    sheetSub: 'from the Chesapeake to the Province of Maine',
    standing:
      'Something has happened in Massachusetts and the accounts do not agree. ' +
      'You are expected in Philadelphia on the tenth.',
    tokens: [
      {
        lon: -71.06, lat: 42.36, kind: 'foot', side: 'theirs',
        label: 'the King’s troops in Boston',
        note:
          'General Gage has an army in a town on a neck of land, and the whole ' +
          'countryside has come down and sat around it. Nobody can tell you how ' +
          'many are on either side. Both figures are being printed anyway.',
        dated: '1775-04-20', received: '1775-04-28',
      },
      {
        lon: -71.23, lat: 42.45, kind: 'work', side: 'neither',
        label: 'the nineteenth of April',
        note:
          'A column went out to a village to take powder and came back down the ' +
          'road under fire the whole way. Which side fired first is already the ' +
          'argument, and both sides have got a version of it into print.',
        dated: '1775-04-19', received: '1775-05-02',
        labelAt: 'above',
      },
      {
        lon: -75.16, lat: 39.95, kind: 'seat', side: 'neither',
        label: 'the Congress',
        note:
          'They meet on the tenth. You have been elected to attend and you do ' +
          'not know what they will ask of you, which has not stopped you ' +
          'thinking about it.',
        dated: '1775-05-10',
        known: 'Fixed last October, and you have had the summons since.',
      },
      /*
       * The stalest mark on the first page a player ever sees, and it is doing
       * the argument that runs the whole game.
       *
       * Britain's constraint is money and three thousand miles of ocean;
       * America's is time and consent. That is a better idea than "they had
       * more men", it is true, and it cannot be *said* to a fifteen-year-old
       * without sounding like a textbook. So it is drawn instead: a mark out in
       * open water, ten weeks old, that nobody can confirm and nobody can do
       * anything about, and which will still be there — larger — in Act 3.
       */
      {
        lon: -68.5, lat: 41.5, kind: 'ship', side: 'theirs',
        label: 'ships from England',
        note:
          'The London papers that came in over the winter say regiments are ' +
          'being sent and name three major-generals. When they sailed, how ' +
          'many, and where they will land, nobody on this side of the water ' +
          'will know until the sails are on the horizon.',
        dated: '1775-02-10', received: '1775-04-15',
        labelAt: 'below',
      },
      {
        lon: -77.09, lat: 38.71, kind: 'seat', side: 'ours',
        label: 'Mount Vernon',
        note:
          'Here. Eight thousand acres, a house you have been rebuilding for ' +
          'sixteen years, and something over a hundred people who have no say ' +
          'in any of this.',
        dated: '1775-05-04', seen: true, labelAt: 'below',
      },
    ],
  },

  /*
   * ACT 2 — 3 July 1775, the morning he takes command. Six marks, and the
   * spread of their dates is the lesson.
   *
   * Boston is exact because it is a mile away and he has a glass. Charlestown
   * is a fortnight old and second-hand. Philadelphia is a room he was standing
   * in a fortnight ago and has no idea about now. And Ticonderoga — the thing
   * this act is eventually *solved by* — is eight weeks old, unnumbered, and
   * drawn as faintly as this page can draw anything.
   *
   * That is the whole design in one sheet: the answer is already on the map on
   * the first morning, and it is the least legible mark on it.
   */
  2: {
    act: 2,
    asOf: '1775-07-03',
    title: 'The army before Boston',
    sheetTitle: 'THE SEAT OF WAR',
    sheetSub: 'in New England, with the northern posts',
    standing:
      'You have been given an army that was already sitting where you found it, ' +
      'and a town you cannot go into and cannot walk away from.',
    tokens: [
      {
        lon: -71.06, lat: 42.36, kind: 'foot', side: 'theirs',
        label: 'the King’s army',
        note:
          'In the town, and you can count their tents from Prospect Hill. ' +
          'Eleven regiments, more coming, and every man of them enlisted for as ' +
          'long as the King wants him. Not one of their papers has a date on it.',
        dated: '1775-07-03', received: '1775-07-03', seen: true,
        labelDx: 112, labelDy: 16,
      },
      {
        lon: -70.85, lat: 42.33, kind: 'ship', side: 'theirs',
        label: 'the fleet',
        note:
          'Nobody has told you how many and nobody needs to. They can put ' +
          'soldiers on any part of this coast inside a week and there is not one ' +
          'thing on your side of the water that can stop them doing it.',
        dated: '1775-07-03', received: '1775-07-03', seen: true,
        labelDx: 54, labelDy: 46,
      },
      {
        lon: -71.11, lat: 42.375, kind: 'foot', side: 'ours',
        label: 'your army',
        note:
          'Sixteen thousand seven hundred and seventy on the rolls this morning, ' +
          'and thirteen thousand of them fit to stand a post. Every enlistment ' +
          'in it ends in December.',
        dated: '1775-07-03', received: '1775-07-03', seen: true,
        labelDx: -104, labelDy: -10,
      },
      {
        lon: -71.06, lat: 42.38, kind: 'work', side: 'theirs',
        label: 'the ground at Charlestown',
        note:
          'Fought over on the seventeenth of June, a fortnight before you came. ' +
          'They hold it. They lost something over a thousand men taking a hill ' +
          'from farmers, and the men who were there will tell you the number ' +
          'twice if you let them.',
        dated: '1775-06-17', received: '1775-06-25',
        labelDx: 8, labelDy: -40,
      },
      {
        lon: -73.39, lat: 43.84, kind: 'work', side: 'ours',
        label: 'Ticonderoga',
        note:
          'Taken in May by men nobody had sent, and there are said to be cannon ' +
          'in it. Nobody has counted them. Nobody has said what condition they ' +
          'are in, or how a gun of that weight is supposed to cross the ' +
          'Berkshires, or who would be asked to try.',
        dated: '1775-05-10', received: '1775-05-18',
      },
      {
        lon: -75.16, lat: 39.95, kind: 'seat', side: 'ours',
        label: 'the Congress',
        note:
          'They made you general on the fifteenth of June and voted no money to ' +
          'pay anybody with. You were in that room a fortnight ago. What they ' +
          'have done since, you will hear when the post comes, and the post is ' +
          'a week each way.',
        dated: '1775-06-19', received: '1775-06-19',
      },
    ],
  },
};

/* ---------------------------------------------------------------- staleness */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

const DAY = 86400000;
const parse = (iso: string): number => Date.parse(`${iso}T00:00:00Z`);

/** `1775-05-10` to `10 May 1775`. The form a student would copy down. */
export function longDate(iso: string): string {
  const d = new Date(parse(iso));
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export type Confidence = 'seen' | 'certain' | 'recent' | 'old' | 'stale';

/**
 * How much of this he actually knows, from the two dates and nothing else.
 *
 * The bands are the post times. A week is the Philadelphia mail and counts as
 * current; a fortnight is a report he would still act on; six weeks is a thing
 * he has heard about; past that it is a story. There is no accuracy model
 * underneath — a token is not secretly right or wrong. It is only *aged*, which
 * is all a commander could tell about his own information and all this page
 * claims to show.
 */
export function confidenceOf(t: Token, asOf: string): Confidence {
  if (t.seen) return 'seen';
  if (t.known) return 'certain';
  if (!t.received) return 'stale';
  const days = (parse(asOf) - parse(t.received)) / DAY;
  if (days <= 3) return 'certain';
  if (days <= 14) return 'recent';
  if (days <= 42) return 'old';
  return 'stale';
}

/** The line under a focused marker. Plain, and it never uses the word "fog". */
export function provenanceOf(t: Token, asOf: string): string {
  if (t.seen) return 'You can see it from where you stand.';
  if (t.known) return t.known;
  if (!t.received) return 'Nobody has confirmed any of this.';
  const days = Math.round((parse(asOf) - parse(t.received)) / DAY);
  const age =
    days <= 1 ? 'today' :
    days <= 13 ? `${days} days old` :
    days <= 60 ? `${Math.round(days / 7)} weeks old` :
    `${Math.round(days / 30)} months old`;
  return `Reported ${longDate(t.dated)} · reached you ${longDate(t.received)} · ${age}`;
}

const ALPHA: Record<Confidence, number> = {
  seen: 1, certain: 1, recent: 0.82, old: 0.6, stale: 0.4,
};

/* --------------------------------------------------------------- the object
 *
 * The map is not a rectangle of pixels. It is a torn sheet lying on a table,
 * and the canvas holds all three things: the shadow it casts, the paper, and
 * the two corners that have curled up off the wood.
 *
 * Three nested boxes, all in BASE UNITS. Every size in this file is one of
 * these units and the context is scaled once at the top of `theatreSheet`, so
 * an `11px` here is eleven pixels on the player's screen at any resolution.
 *
 *   CANVAS   the whole drawing, with transparent bleed for the shadow and the
 *            curls. The wood shows through it — the table is CSS, and it fills
 *            the viewport rather than stopping at the canvas.
 *   PAPER    the sheet. Torn edges, chamfered at two corners where it has
 *            lifted, and the printed border rule sits inside it.
 *   MAP      the geography. Everything the projection knows about.
 */

/** The geography, in base units. */
export const MAP_W = 1100;
export const MAP_H = MAP_W / SHEET_ASPECT;
/** The printed margin: border rule, and the letters and figures of the grid. */
const MARGIN = 54;
/** Transparent bleed for the cast shadow and the curled corners. */
const BLEED = 46;
/** How far in the two lifted corners are cut. */
const CURL = 104;

const PAPER_W = MAP_W + MARGIN * 2;
const PAPER_H = MAP_H + MARGIN * 2;
export const CANVAS_W = PAPER_W + BLEED * 2;
export const CANVAS_H = PAPER_H + BLEED * 2;
export const CANVAS_ASPECT = CANVAS_W / CANVAS_H;

/** Map fractions to canvas fractions, for anything positioned in the DOM. */
export function canvasAt(lon: number, lat: number): [number, number] {
  const [x, y] = at(lon, lat);
  return [
    (BLEED + MARGIN + x * MAP_W) / CANVAS_W,
    (BLEED + MARGIN + y * MAP_H) / CANVAS_H,
  ];
}

/*
 * THE GRID, and it is the change that matters most for a fifteen-year-old.
 *
 * The sheet used to be ruled at whole degrees of latitude and longitude with
 * the figures in the margin, which is what the surveyors did and which is
 * useless to a student: nobody in a classroom says "the fleet is at forty-two
 * degrees twenty minutes north". Five columns by four rows, lettered and
 * numbered, and now every mark on the page has a name you can say out loud —
 * *Boston is C2* — which is how two people looking at the same map talk.
 *
 * It is also period. Plans of this date carry lettered borders for exactly the
 * same reason: so that a despatch could refer to a square.
 */
const COLS = 5;
const ROWS = 4;
const LETTERS = 'ABCDE';

/** Which square a position falls in — `C2`. */
export function gridRef(lon: number, lat: number): string {
  const [x, y] = at(lon, lat);
  const c = Math.min(COLS - 1, Math.max(0, Math.floor(x * COLS)));
  const r = Math.min(ROWS - 1, Math.max(0, Math.floor(y * ROWS)));
  return `${LETTERS[c]}${r + 1}`;
}

/* ------------------------------------------------------------------ drawing */

/** Longitude and latitude to base units, in MAP space. */
const bu = (lon: number, lat: number): Pt => {
  const [x, y] = at(lon, lat);
  return [x * MAP_W, y * MAP_H];
};

/** Repeatable noise, so a torn edge is torn the same way every frame. */
const wobble = (n: number): number => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return ((v % 1) + 1) % 1;
};

/**
 * A coastline is not a polygon.
 *
 * Straight segments between forty points made New England look like it had been
 * surveyed with a ruler, and made Cape Cod self-intersect. Running a quadratic
 * through the midpoints costs nothing and turns the same forty points into a
 * drawn line — which is what a coast on a plan of this date actually was, since
 * the engraver was tracing a shape rather than plotting soundings.
 */
function smooth(c: CanvasRenderingContext2D, pts: Pt[], close = false): void {
  if (pts.length < 3) {
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    return;
  }
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    c.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
  }
  const last = pts[pts.length - 1];
  c.quadraticCurveTo(last[0], last[1], last[0], last[1]);
  if (close) c.closePath();
}

const geo = (pts: Pt[]): Pt[] => pts.map(([lo, la]) => bu(lo, la));

/**
 * The silhouette of the sheet: torn on all four sides, and cut back at the
 * top-left and bottom-right where it has curled up off the table.
 *
 * Returned rather than stroked, because three separate passes need it — the
 * shadow, the fill, and the clip that stops the map printing off the paper.
 */
function paperOutline(): Pt[] {
  const x1 = BLEED;
  const y1 = BLEED;
  const x2 = BLEED + PAPER_W;
  const y2 = BLEED + PAPER_H;
  const pts: Pt[] = [];
  const STEP = 26;

  // Each edge is walked in small steps with the deckle riding in and out. A
  // torn edge is not a wavy edge: the amplitude itself varies, so some stretches
  // are nearly straight and others have taken a real bite out of the sheet.
  const edge = (
    ax: number, ay: number, bx: number, by: number, seed: number,
  ): void => {
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(len / STEP));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const w1 = wobble(seed + i * 3.1);
      const w2 = wobble(seed + i * 0.37);
      const amp = (1.5 + w2 * 6.5) * Math.sin(Math.PI * Math.min(1, t * 1.4));
      const nx = (by - ay) / len;
      const ny = -(bx - ax) / len;
      pts.push([
        ax + (bx - ax) * t + nx * (w1 - 0.5) * amp,
        ay + (by - ay) * t + ny * (w1 - 0.5) * amp,
      ]);
    }
  };

  edge(x1 + CURL, y1, x2, y1, 11);            // top, starting past the TL curl
  edge(x2, y1, x2, y2 - CURL, 29);            // right, stopping at the BR curl
  edge(x2 - CURL, y2, x1, y2, 47);            // bottom, starting past the BR curl
  edge(x1, y2, x1, y1 + CURL, 63);            // left, stopping at the TL curl
  return pts;
}

/**
 * A corner that has lifted.
 *
 * The chamfer taken out of the outline is folded back across its own hypotenuse
 * — the reflection works out to a right triangle inside the sheet, which is why
 * this is eight lines rather than a matrix. The flap is the BACK of the paper,
 * so it carries none of the printing and takes a gradient from the fold line
 * outward, and it drops a shadow on the map underneath it.
 *
 * Two corners, on opposite diagonals. Four would read as a decorative frame
 * rather than as a sheet somebody has been handling.
 */
function curl(c: CanvasRenderingContext2D, corner: 'tl' | 'br'): void {
  const x1 = BLEED;
  const y1 = BLEED;
  const x2 = BLEED + PAPER_W;
  const y2 = BLEED + PAPER_H;
  const [a, b, folded]: [Pt, Pt, Pt] =
    corner === 'tl'
      ? [[x1 + CURL, y1], [x1, y1 + CURL], [x1 + CURL, y1 + CURL]]
      : [[x2 - CURL, y2], [x2, y2 - CURL], [x2 - CURL, y2 - CURL]];

  c.save();
  // What the flap casts on the sheet it is lying on.
  c.globalAlpha = 0.3;
  c.fillStyle = '#4B3B27';
  c.beginPath();
  c.moveTo(a[0], a[1]);
  c.lineTo(b[0], b[1]);
  c.lineTo(folded[0] + (corner === 'tl' ? 9 : -9), folded[1] + (corner === 'tl' ? 9 : -9));
  c.closePath();
  c.fill();
  c.restore();

  // The flap itself: the reverse of the sheet, brightest along the fold where
  // it is standing closest to the light and falling off toward the loose edge.
  const g = c.createLinearGradient(a[0], a[1], folded[0], folded[1]);
  g.addColorStop(0, SHEET_LIT);
  g.addColorStop(0.55, '#DDD0AE');
  g.addColorStop(1, '#B0A07C');
  c.save();
  c.beginPath();
  c.moveTo(a[0], a[1]);
  c.lineTo(b[0], b[1]);
  c.lineTo(folded[0], folded[1]);
  c.closePath();
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(90, 72, 48, 0.55)';
  c.lineWidth = 1.2;
  c.stroke();
  c.restore();
}

/**
 * Coastal shading: lines run parallel to the shore on the seaward side,
 * spreading and fading outward.
 *
 * This is how a period plan says "this is the water" without filling it, and it
 * is why the sheet can stay bare paper nearly everywhere. Offsetting along one
 * normal means each run has to declare which flank its water is on.
 */
function shoreShading(c: CanvasRenderingContext2D, pts: Pt[], side: 1 | -1): void {
  const scr = geo(pts);
  for (let band = 1; band <= 7; band++) {
    const off = band * band * 1.1 + band * 1.9;
    const offset: Pt[] = scr.map((p, i) => {
      const a = scr[Math.max(0, i - 1)];
      const b = scr[Math.min(scr.length - 1, i + 1)];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      return [p[0] + ((dy * side) / len) * off, p[1] + ((-dx * side) / len) * off];
    });
    c.beginPath();
    smooth(c, offset);
    c.strokeStyle = INK.FADED;
    c.globalAlpha = 0.5 / band;
    c.lineWidth = 1;
    c.stroke();
  }
  c.globalAlpha = 1;
}

/**
 * Hachures — the whole reason this page is not cel-shaded.
 *
 * Strokes run down the fall line on both sides of a ridge, heavier and closer
 * where the ground drops harder. No light source is involved and none is
 * wanted: relief is carried entirely by how much ink is on the paper, which is
 * a technique that works identically in a screenshot, in greyscale, and for a
 * colourblind student, and which no lighting ramp can say the same of.
 */
function hachure(c: CanvasRenderingContext2D, pts: Pt[], weight: number): void {
  const scr = geo(pts);
  c.strokeStyle = INK.SETTLED;
  c.lineCap = 'butt';

  for (let i = 0; i < scr.length - 1; i++) {
    const [ax, ay] = scr[i];
    const [bx, by] = scr[i + 1];
    const seg = Math.hypot(bx - ax, by - ay);
    const dx = (bx - ax) / seg;
    const dy = (by - ay) / seg;

    for (let d = 0; d < seg; d += 1.5) {
      const t = d / seg;
      // A ridge is not a wall. Strokes shorten toward each end of a run so the
      // range dies away instead of stopping square, which is the one difference
      // between hachuring and a hatched rectangle.
      const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 0.5 + 0.5;
      const r = wobble(d * 12.9 + i * 78.2);
      const x = ax + dx * d;
      const y = ay + dy * d;

      /*
       * Three rows of strokes down each flank, not one.
       *
       * A single row on either side of the ridge line drew two combs facing
       * each other, which reads as a railway and not as ground. Hachuring is a
       * BAND: strokes packed side by side, heaviest against the crest and
       * thinning outward, so the range has a dense spine and a soft foot. Three
       * rows is the fewest that gets there.
       */
      for (const side of [1, -1]) {
        for (let row = 0; row < 3; row++) {
          const j = wobble(d * 3.71 + side * 19.3 + i * 5.1 + row * 41.7);
          const fall = 1 - row * 0.3;
          const start = 1.4 + row * 4.6;
          const len = start + (2.6 + j * 3.4) * weight * taper * fall;
          const skew = (j - 0.5) * 0.55;
          const nx = dy * side + dx * skew;
          const ny = -dx * side + dy * skew;
          const n = Math.hypot(nx, ny) || 1;
          c.beginPath();
          c.moveTo(x + (nx / n) * start, y + (ny / n) * start);
          c.lineTo(x + (nx / n) * len, y + (ny / n) * len);
          c.globalAlpha = (0.4 + r * 0.4) * weight * taper * fall;
          c.lineWidth = 0.85 + r * 0.55;
          c.stroke();
        }
      }
    }
  }
  c.globalAlpha = 1;
}

/** The lettered grid, ruled across the map. Five columns, four rows. */
function grid(c: CanvasRenderingContext2D): void {
  c.save();
  c.strokeStyle = INK.FLOOR;
  c.globalAlpha = 0.2;
  c.lineWidth = 1.4;
  for (let i = 1; i < COLS; i++) {
    const x = (i / COLS) * MAP_W;
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, MAP_H);
    c.stroke();
  }
  for (let i = 1; i < ROWS; i++) {
    const y = (i / ROWS) * MAP_H;
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(MAP_W, y);
    c.stroke();
  }
  c.restore();
}

/**
 * The printed border: a heavy rule, a hair rule inside it, and the letters and
 * figures of the grid in the space between them.
 *
 * Drawn in PAPER space, not map space, so it frames the geography rather than
 * sitting on top of it.
 */
function border(c: CanvasRenderingContext2D): void {
  const x1 = BLEED + MARGIN;
  const y1 = BLEED + MARGIN;
  c.save();
  c.strokeStyle = INK.FLOOR;
  c.lineWidth = 3.4;
  c.strokeRect(x1 - 12, y1 - 12, MAP_W + 24, MAP_H + 24);
  c.lineWidth = 1.2;
  c.strokeRect(x1 - 20, y1 - 20, MAP_W + 40, MAP_H + 40);

  c.fillStyle = INK.FLOOR;
  c.font = 'bold 22px Georgia, "Times New Roman", serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  for (let i = 0; i < COLS; i++) {
    const x = x1 + ((i + 0.5) / COLS) * MAP_W;
    c.fillText(LETTERS[i], x, y1 - 32);
    c.fillText(LETTERS[i], x, y1 + MAP_H + 32);
  }
  for (let i = 0; i < ROWS; i++) {
    const y = y1 + ((i + 0.5) / ROWS) * MAP_H;
    c.fillText(String(i + 1), x1 - 34, y);
    c.fillText(String(i + 1), x1 + MAP_W + 34, y);
  }
  c.textBaseline = 'alphabetic';
  c.restore();
}

/** North, drawn as the period drew it: a long point and a short one. */
function compass(c: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  c.save();
  c.translate(cx, cy);
  c.strokeStyle = INK.SETTLED;
  c.globalAlpha = 0.85;
  c.lineWidth = 1.6;
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.stroke();
  c.lineWidth = 1;
  c.beginPath();
  c.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  c.stroke();

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const inner = i % 4 === 0 ? r * 0.56 : r * 0.69;
    c.beginPath();
    c.moveTo(Math.sin(a) * inner, -Math.cos(a) * inner);
    c.lineTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78);
    c.stroke();
  }

  c.globalAlpha = 1;
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(0, -r * 0.64);
  c.lineTo(r * 0.15, 0);
  c.lineTo(0, r * 0.52);
  c.lineTo(-r * 0.15, 0);
  c.closePath();
  c.stroke();
  c.beginPath();
  c.moveTo(0, -r * 0.64);
  c.lineTo(r * 0.15, 0);
  c.lineTo(0, 0);
  c.closePath();
  c.fillStyle = INK.SETTLED;
  c.fill();

  c.font = `bold ${Math.round(r * 0.44)}px Georgia, "Times New Roman", serif`;
  c.textAlign = 'center';
  c.fillText('N', 0, -r * 0.88);
  c.restore();
}

/** A scale bar in statute miles, divided the way a plan divided one. */
function scaleBar(c: CanvasRenderingContext2D, x: number, y: number): void {
  // A degree of latitude is 69.05 statute miles, and the sheet's vertical scale
  // is the honest one — the horizontal is compressed by the projection.
  const unit = (20 * MAP_H) / LAT_SPAN / 69.05;
  c.save();
  c.translate(x, y);
  c.strokeStyle = INK.FLOOR;
  c.fillStyle = INK.FLOOR;
  c.lineWidth = 1.4;
  const bh = 8;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.rect(i * unit, 0, unit, bh);
    c.stroke();
    if (i % 2 === 0) c.fill();
  }
  c.font = 'bold 13px Georgia, "Times New Roman", serif';
  c.textAlign = 'center';
  for (let i = 0; i <= 5; i++) c.fillText(String(i * 20), i * unit, -7);
  c.textAlign = 'left';
  c.font = 'italic 14px Georgia, "Times New Roman", serif';
  c.fillText('English Miles', 0, bh + 18);
  c.restore();
}

/**
 * The cartouche: what the sheet calls itself.
 *
 * Set large and low in the open water, the way an engraver filled a dead corner
 * with the title rather than leaving it blank. It is also the fastest possible
 * answer to "what am I looking at" for a student who has just sat down, which
 * is the job the reference image's own title block is doing.
 */
function cartouche(c: CanvasRenderingContext2D, title: string, sub: string): void {
  const x = MAP_W * 0.79;
  const y = MAP_H * 0.76;
  c.save();
  c.textAlign = 'center';
  c.fillStyle = INK.FLOOR;
  c.font = '38px Georgia, "Times New Roman", serif';
  c.fillText(title, x, y);

  const w = Math.max(c.measureText(title).width, 230) / 2 + 16;
  c.strokeStyle = INK.FLOOR;
  c.globalAlpha = 0.75;
  c.lineWidth = 1.6;
  c.beginPath();
  c.moveTo(x - w, y + 13);
  c.lineTo(x + w, y + 13);
  c.stroke();
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(x - w * 0.72, y + 18);
  c.lineTo(x + w * 0.72, y + 18);
  c.stroke();

  c.globalAlpha = 0.8;
  c.font = 'italic 15px Georgia, "Times New Roman", serif';
  c.fillText(sub, x, y + 38);
  c.restore();
}

/** The markers themselves. Shapes and fill, never colour. */
function drawToken(c: CanvasRenderingContext2D, t: Token, conf: Confidence): void {
  const [x, y] = bu(t.lon, t.lat);
  const solid = t.side === 'theirs';

  c.save();
  c.globalAlpha = ALPHA[conf];
  c.strokeStyle = INK.FLOOR;
  c.fillStyle = INK.FLOOR;
  c.lineWidth = conf === 'stale' || conf === 'old' ? 1.8 : 2.4;
  // Anything he has not had confirmed is drawn broken. A dashed outline is what
  // a careful hand did with a position it did not trust, and it needs no key.
  c.setLineDash(conf === 'stale' ? [3, 3] : conf === 'old' ? [6, 4] : []);

  if (t.kind === 'foot') {
    c.beginPath();
    c.rect(x - 12, y - 6, 24, 12);
    c.stroke();
    if (solid) {
      c.globalAlpha = ALPHA[conf] * 0.85;
      c.fill();
    }
  } else if (t.kind === 'work') {
    // A five-pointed bastioned trace — a star fort seen from above, which is
    // exactly how the period drew a fortified place.
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 5.5 : 13;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.closePath();
    c.stroke();
    if (solid) {
      c.globalAlpha = ALPHA[conf] * 0.8;
      c.fill();
    }
  } else if (t.kind === 'ship') {
    c.setLineDash([]);
    c.beginPath();
    c.moveTo(x - 13, y);
    c.quadraticCurveTo(x, y + 9, x + 13, y);
    c.closePath();
    c.stroke();
    if (solid) c.fill();
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(x - 5, y - 1);
    c.lineTo(x - 5, y - 14);
    c.moveTo(x + 5, y - 1);
    c.lineTo(x + 5, y - 11);
    c.stroke();
  } else {
    // A seat of government: a ringed dot, the oldest map mark there is.
    c.beginPath();
    c.arc(x, y, 9, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    c.beginPath();
    c.arc(x, y, 3.6, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

/**
 * The leader from a marker to its label. Only drawn where the label has been
 * pushed off the mark, and it stops short at both ends so it never touches
 * either. Without it the four marks around Boston have four captions floating
 * in the sea with nothing to say which belongs to which.
 */
function leader(c: CanvasRenderingContext2D, t: Token, conf: Confidence): void {
  const [dx, dy] = labelOffset(t);
  if (Math.hypot(dx, dy) < 30) return;
  const [x, y] = bu(t.lon, t.lat);
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  c.save();
  c.globalAlpha = ALPHA[conf] * 0.6;
  c.strokeStyle = INK.SETTLED;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(x + ux * 16, y + uy * 16);
  c.lineTo(x + dx - ux * 14, y + dy - uy * 14);
  c.stroke();
  c.restore();
}

/**
 * Draw the whole object: the shadow, the sheet, the map on it, and the corners
 * that have lifted.
 *
 * Everything except the token labels, which are DOM — this is the one place the
 * project's rule that type is never textured pays a dividend, because a label
 * the browser sets is one a screen reader can read and a student can select.
 */
export function theatreSheet(theatre: Theatre, w: number, h: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const c = cv.getContext('2d')!;
  c.scale(w / CANVAS_W, w / CANVAS_W);

  const outline = paperOutline();

  // What the sheet casts on the table. Down and to the right, because the light
  // in this room comes from over the reader's left shoulder, as it does in
  // every painting in the rest of the game.
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.55)';
  c.shadowBlur = 26;
  c.shadowOffsetX = 10;
  c.shadowOffsetY = 14;
  c.fillStyle = SHEET;
  c.beginPath();
  smooth(c, outline, true);
  c.fill();
  c.restore();

  // Inside the paper from here on. Nothing prints off the torn edge.
  c.save();
  c.beginPath();
  smooth(c, outline, true);
  c.clip();

  c.fillStyle = SHEET;
  c.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // A sheet this size was never evenly toned, and the edges are where it
  // browned first.
  const tone = c.createRadialGradient(
    CANVAS_W * 0.44, CANVAS_H * 0.42, CANVAS_H * 0.18,
    CANVAS_W * 0.5, CANVAS_H * 0.5, CANVAS_H * 0.82);
  tone.addColorStop(0, 'rgba(0,0,0,0)');
  tone.addColorStop(1, 'rgba(126, 92, 48, 0.38)');
  c.fillStyle = tone;
  c.fillRect(0, 0, CANVAS_W, CANVAS_H);

  border(c);

  // Into map space.
  c.save();
  c.translate(BLEED + MARGIN, BLEED + MARGIN);
  c.lineJoin = 'round';
  c.lineCap = 'round';

  // Water first: the wash, the islands punched back out of it, then the
  // hatching that does the actual telling.
  c.save();
  c.fillStyle = 'rgba(70, 92, 120, 0.22)';
  c.beginPath();
  smooth(c, geo(SEA), true);
  c.fill();
  c.beginPath();
  smooth(c, geo(CHESAPEAKE), true);
  c.fill();
  c.restore();

  c.save();
  c.fillStyle = SHEET;
  c.beginPath();
  smooth(c, geo(LONG_ISLAND), true);
  c.fill();
  c.restore();

  for (const sh of SHORES) shoreShading(c, sh.pts, sh.side);
  grid(c);

  c.beginPath();
  smooth(c, geo(LONG_ISLAND), true);
  c.strokeStyle = INK.FLOOR;
  c.lineWidth = 2;
  c.stroke();

  for (const line of [COAST, DELAWARE_BAY, CHESAPEAKE]) {
    c.beginPath();
    smooth(c, geo(line));
    c.strokeStyle = INK.FLOOR;
    c.lineWidth = 2.6;
    c.stroke();
  }

  for (const r of RIVERS) {
    c.beginPath();
    smooth(c, geo(r.path));
    c.strokeStyle = INK.SETTLED;
    c.globalAlpha = 0.9;
    c.lineWidth = r.weight * 1.5;
    c.stroke();
  }
  c.globalAlpha = 1;

  for (const r of RIDGES) hachure(c, r.path, r.weight);

  // Province names, spaced out across open ground the way an engraver set them.
  c.save();
  c.fillStyle = INK.SETTLED;
  c.textAlign = 'center';
  for (const p of PROVINCES) {
    const [x, y] = bu(p.lon, p.lat);
    c.save();
    c.translate(x, y);
    if (p.rot) c.rotate(p.rot);
    c.globalAlpha = 0.62;
    c.font = '16px Georgia, "Times New Roman", serif';
    // letterSpacing is not universal; spacing the string is, and on a map this
    // is what the engraver did anyway.
    c.fillText(p.name.split('').join(' '), 0, 0);
    c.restore();
  }
  c.restore();

  // Places that are only places.
  c.save();
  c.fillStyle = INK.FLOOR;
  c.font = 'italic 16px Georgia, "Times New Roman", serif';
  for (const p of PLACES) {
    const [x, y] = bu(p.lon, p.lat);
    c.beginPath();
    c.arc(x, y, 3, 0, Math.PI * 2);
    c.fill();
    c.textAlign = p.anchor === 'r' ? 'right' : 'left';
    c.fillText(p.name, x + (p.anchor === 'r' ? -9 : 9), y + 5.5);
  }
  c.restore();

  c.save();
  c.fillStyle = INK.SETTLED;
  c.globalAlpha = 0.5;
  c.font = 'italic 20px Georgia, "Times New Roman", serif';
  c.textAlign = 'center';
  c.fillText('T H E   A T L A N T I C   O C E A N', MAP_W * 0.80, MAP_H * 0.46);
  c.restore();

  cartouche(c, theatre.sheetTitle, theatre.sheetSub);
  compass(c, MAP_W * 0.925, MAP_H * 0.135, MAP_H * 0.072);
  scaleBar(c, MAP_W * 0.62, MAP_H * 0.905);

  for (const t of theatre.tokens) {
    const conf = confidenceOf(t, theatre.asOf);
    leader(c, t, conf);
    drawToken(c, t, conf);
  }

  c.restore();  // out of map space

  // A little wear along the torn edge, so the paper looks handled rather than
  // die-cut. Inside the clip, so it never bleeds onto the table.
  c.save();
  c.strokeStyle = 'rgba(122, 96, 62, 0.5)';
  c.lineWidth = 7;
  c.beginPath();
  smooth(c, outline, true);
  c.stroke();
  c.restore();

  c.restore();  // out of the paper clip

  curl(c, 'tl');
  curl(c, 'br');

  return cv;
}
