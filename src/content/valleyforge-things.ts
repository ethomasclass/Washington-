/**
 * What there is to look at on the Valley Forge plateau.
 *
 * THE HUTTING ORDER IS THE MOST SURPRISING OBJECT IN THE ACT and it is the
 * first thing in this file for that reason. A student arrives at Valley
 * Forge expecting a story about suffering and the first thing they can pick
 * up is a set of building specifications with a cash prize attached. That
 * single object reframes the whole act before anybody has said a word, and
 * `docs/05` §5.3 is explicit that it should.
 *
 * TWO CONTRADICTIONS (C4) live here:
 *
 *   Waldo's diary says the men bear it with heroic patience. The desertion
 *   return in the same street says what a portion of them actually did. Both
 *   are true and both are his camp.
 *
 *   Cochran says smallpox is what ends this camp. The burying ground says
 *   most of these men did not die of smallpox, and did not die in the cold
 *   months either. Both are true, and the second is the one nobody is told.
 *
 * The map-table entry for the Northern Department — Saratoga, and the
 * alliance that came out of it — is `northern-table`, and it is the third
 * `opens` screen in the game.
 */

import type { Interactable } from '../types';
import type { Forge } from './valleyforge';
import { V_HUT_Z0, V_PARADE_N, V_RANK_E, V_RANK_W, V_STREET_E, V_STREET_W } from './valleyforge';

/* ---------------------------------------------------------------------- *
 * The brigade street
 * ---------------------------------------------------------------------- */

export function campThings(state: Forge): Interactable[] {
  const december = state === 'december';

  const common: Interactable[] = [
    {
      id: 'hutting-order',
      label: 'the hutting order',
      x: V_STREET_W + 1, z: 10,
      examine:
        'Nailed to a post at the head of the street. Fourteen feet by sixteen, six and a half to '
        + 'the eaves, door to the street, fireplace at the rear, gaps daubed eighteen inches, '
        + 'twelve men to a hut. Twelve dollars to the first party in each regiment that builds one '
        + 'to it. Build it wrong and you pull it down.',
      grants: 'obs.a5.order',
    },
    {
      id: 'the-street',
      label: 'the brigade street',
      x: 38, z: 26,
      examine:
        'Half a mile up the plateau, with ranks of huts either side at a regular interval, all '
        + 'the same size, all with the door to the street. Six hundred by February. Four towns in '
        + 'America are bigger than this, and it was built in six weeks by men with no nails.',
      grants: 'obs.a5.town',
    },
    {
      id: 'the-graves',
      label: 'the burying ground',
      x: 11, z: 53,
      examine:
        'Rows of them on the slope, not marked with names. About two thousand men die here, and '
        + 'how matters: not of cold and not directly of hunger, but of typhus, dysentery and '
        + 'smallpox in a camp with no drains. More go in April than in January. The worst month of '
        + 'Valley Forge is after the winter.',
      grants: 'obs.a5.dead',
      contradicts: {
        heard: 'heard.a5.cochran',
        line:
          'Dr. Cochran told you the smallpox is the thing that ends this camp, and he is right '
          + 'that it could. He also told you plainly that the fever and the flux will kill more '
          + 'men than the pox will, and that what he was asking you for does nothing about either '
          + 'of them. He was not softening the case for the inoculation. He was making sure you '
          + 'could not mistake it for a cure for this.',
        grants: 'obs.a5.cochran_contradiction',
        note: 'the pox is not what most of these men die of, and he said so first',
      },
    },
    {
      id: 'the-stumps',
      label: 'the felled ground',
      x: 30, z: 5,
      examine:
        'The whole shoulder of the hill, cut over, with the stumps still white. Six hundred huts '
        + 'is an acre of oak a week and it came off here, and it is why every wall in this camp is '
        + 'green wood that will shrink as it dries and open a gap you can see daylight through.',
      grants: 'obs.a5.stumps',
    },
    {
      id: 'the-clay',
      label: 'a daubed wall',
      x: V_RANK_W + 8, z: V_HUT_Z0 + 3,
      examine:
        'Red Pennsylvania clay rammed into every gap between the courses, eighteen inches deep, '
        + 'to the order. It has to be done again as the wood dries, and again after that. Half of '
        + 'what the men of this camp did all winter was daub a wall they had already daubed.',
      grants: 'obs.a5.clay',
    },
    {
      id: 'the-bakehouse',
      label: 'the bake house',
      x: 5, z: 27,
      examine:
        'Stone, with an oven at the end of it, and it is the busiest building on the plateau '
        + 'because flour is what there is. What comes out of it, when there is anything, is bread. '
        + 'What the men make in the huts when there is not is flour and water on a hot stone, and '
        + 'they call it fire cake.',
      grants: 'obs.a5.bake',
    },
    {
      id: 'the-hospital-hut',
      label: 'the flying hospital',
      x: 72, z: 23,
      examine:
        'A hut like the others and a little longer, with the berths built up the walls in three '
        + 'tiers. Twelve men in fourteen feet by sixteen with one window-hole. There are several '
        + 'of these and they are always full.',
      grants: 'obs.a5.hospital',
    },
  ];

  /* --- December ---------------------------------------------------------- */

  if (december) {
    return [
      ...common,
      {
        id: 'naked-return',
        label: 'the field return',
        x: V_STREET_E - 1, z: 14,
        examine:
          'Taken today, by men walking down the line and counting. Two thousand eight hundred and '
          + 'ninety-eight unfit for duty because they are barefoot and otherwise naked. That is '
          + 'one man in four, on the day the army marched onto this ground.',
        document: 'DOC-A5.1',
      },
      {
        id: 'ration-return',
        label: 'a return of provisions',
        x: 24, z: 26,
        examine:
          'A working sheet in a clerk&rsquo;s hand, week ending the third of January. Bread or '
          + 'flour, issued. Beef or pork, none. Peas, none. Rice, none. Vinegar, none. Soap, none. '
          + 'Candles, none. Rum, none. Vegetables, none.',
        document: 'DOC-A5.7',
      },
      {
        id: 'waldos-diary',
        label: "Dr. Waldo's diary",
        x: V_RANK_W + 9, z: V_HUT_Z0 + 8,
        examine:
          'Open on a barrel head, in a small hand. &ldquo;They bear it with a fortitude and '
          + 'patience which I should call heroic in any other men.&rdquo; And, four pages earlier: '
          + '&ldquo;Poor food &mdash; hard lodging &mdash; cold weather &mdash; fatigue &mdash; '
          + 'nasty cloaths &mdash; nasty cookery &mdash; vomit half my time.&rdquo;',
        grants: 'obs.a5.waldo_diary',
        contradicts: {
          heard: 'heard.a5.waldo',
          line:
            'He has just told you both of those to your face, one after the other, without '
            + 'noticing that they sit oddly together &mdash; and they do not, in fact, sit oddly '
            + 'together at all. A man can be furious about the cookery and awed by the men eating '
            + 'it, in the same week, in the same handwriting. The desertion return two huts down '
            + 'says what a portion of them did about it, and that is also this camp.',
          grants: 'obs.a5.waldo_contradiction',
          note: 'the patience and the desertion return are the same winter',
        },
      },
      {
        id: 'desertion-return',
        label: 'the desertion return',
        x: V_RANK_E + 3, z: V_HUT_Z0 + 12,
        examine:
          'Names, regiments, dates, and the note &ldquo;went off&rdquo; against each. Some hundreds '
          + 'over the winter, and the number rises with the weather rather than with the cold, '
          + 'because a man cannot walk to Philadelphia in a drift. Several of these names are '
          + 'crossed through and marked returned.',
        grants: 'obs.a5.desertion',
      },
      {
        id: 'no-shoes',
        label: 'a man&rsquo;s feet',
        x: V_RANK_E + 5, z: V_HUT_Z0 + 10,
        examine:
          'Rag, wound and tied. On the man beside him, nothing. The bloody footprints in the '
          + 'snow are not a legend &mdash; the line is in his own letter to Congress, and it is a '
          + 'report on the state of the road from the last camp, written by a man who had been '
          + 'asked to explain a slow march.',
        grants: 'obs.a5.feet',
      },
      {
        id: 'fire-cake',
        label: 'a flat stone by the fire',
        x: V_STREET_W + 3, z: 33,
        examine:
          'Flour and water mixed on it, and the stone put in the ashes. That is fire cake and '
          + 'that is the whole recipe. It is grey, it is hard, and there are men in this camp who '
          + 'have eaten nothing else for eleven days.',
        grants: 'obs.a5.firecake_seen',
      },
      {
        id: 'the-brush',
        label: 'a brush shelter',
        x: 26, z: 46,
        examine:
          'Boughs over a frame, with a blanket where one could be got. This is what a man sleeps '
          + 'under until his hut is roofed, and on the nineteenth of December that is every man on '
          + 'this hill. The order was given on the eighteenth.',
        grants: 'obs.a5.brush',
      },
      {
        id: 'the-prize',
        label: 'a hut with a board on it',
        x: 31, z: 17,
        examine:
          'Fourth Pennsylvania, roofed in four days, and somebody has chalked the number on a '
          + 'board and nailed it over the door. The twelve dollars was paid. There is an argument '
          + 'going on in the next rank about whether a hut counts as finished before it is daubed.',
        grants: 'obs.a5.prize',
      },
      {
        id: 'the-drains',
        label: 'the ground between the ranks',
        x: V_RANK_E - 3, z: V_HUT_Z0 + 15,
        examine:
          'Eleven thousand men on eight acres, and no drain anywhere on the plateau. The order '
          + 'covers the dimensions of a hut to the inch and says nothing whatever about where the '
          + 'waste goes, because in 1777 nobody knew that was the question. This is what kills '
          + 'two thousand men, and it is not in any painting of this place.',
        grants: 'obs.a5.sanitation',
      },
    ];
  }

  /* --- March ------------------------------------------------------------- */

  if (state === 'march') {
    return [
      ...common,
      {
        id: 'the-model-company',
        label: 'the model company',
        x: 34, z: V_PARADE_N + 5,
        examine:
          'A hundred men taken out of the line at random and drilled by a Prussian in person, '
          + 'every day, in the mud. They are dressed in whatever they own and not one of them '
          + 'matches another, and they are moving as one unit. Watch the intervals rather than the '
          + 'clothes: the intervals are the thing that is new.',
        grants: 'obs.a5.model',
      },
      {
        id: 'the-blue-book',
        label: 'a manual, in draft',
        x: 44, z: V_PARADE_N + 1,
        examine:
          'Written at night in French, turned into English by Duponceau, turned into orders by '
          + 'Walker, copied out by hand for each brigade. Chapter four says the commanding officer '
          + 'of each company is charged with the instruction of his recruits. Not the serjeant. '
          + 'Him.',
        document: 'DOC-A5.2',
      },
      {
        id: 'the-bayonet',
        label: 'a bayonet, on a post',
        x: 24, z: V_PARADE_N + 6,
        examine:
          'A straw bundle on a pole with three holes punched through it. He had to teach the use '
          + 'of the bayonet from nothing, because the Continental soldier used his as a spit for '
          + 'roasting, a tent peg and a candle holder, and had never once been shown what else it '
          + 'was for.',
        grants: 'obs.a5.bayonet',
      },
      {
        id: 'the-intervals',
        label: 'the line, dressed',
        x: 40, z: V_PARADE_N + 9,
        examine:
          'The head turned right so far that a man can see the buttons on the breast of the '
          + 'second man from him. That one instruction, obeyed by everybody at once, is what a '
          + 'dressed line is, and it is why a brigade can change front without becoming a crowd.',
        grants: 'obs.a5.intervals',
      },
      {
        id: 'northern-table',
        label: 'a map of the northern department',
        x: 46, z: 42,
        examine:
          'Spread on a drum head outside the commissary, weighted with two stones. Burgoyne&rsquo;s '
          + 'line of advance from Canada, St. Leger from the west, and the force that was supposed '
          + 'to come up the Hudson from New York and did not.',
        opens: 'northern',
        grants: 'obs.a5.northern',
      },
      {
        id: 'the-officers',
        label: 'officers, at the edge of the field',
        x: 52, z: V_PARADE_N + 2,
        examine:
          'Standing at the edge of it with their arms folded, watching a foreigner do a '
          + 'serjeant&rsquo;s work in front of the men. Several of them have said, out loud, that '
          + 'they did not buy a commission in order to teach loading. Two of them will resign over '
          + 'it and one will write to a Philadelphia paper about it.',
        grants: 'obs.a5.officers',
      },
      {
        id: 'ration-march',
        label: 'a return of provisions, March',
        x: 24, z: 26,
        examine:
          'Beef, issued. Not every day and not to everybody, but issued. The Committee at Camp '
          + 'went home in April and their report recommended a reorganisation of the commissariat, '
          + 'and some of it was adopted, and this is what &ldquo;marginally, and late&rdquo; looks '
          + 'like on a working sheet.',
        grants: 'obs.a5.beef',
      },
    ];
  }

  /* --- May --------------------------------------------------------------- */

  return [
    ...common,
    {
      id: 'the-treaty',
      label: 'the general orders for today',
      x: 38, z: V_PARADE_N - 4,
      examine:
        'France has recognised the United States. Signed at Paris on the sixth of February, '
        + 'ratified by Congress on the fourth of May, read at the head of every regiment this '
        + 'morning. It was signed because of Saratoga and for no other reason on earth.',
      document: 'DOC-A5.6',
    },
    {
      id: 'the-feu',
      label: 'the line, before the running fire',
      x: 30, z: V_PARADE_N + 6,
      examine:
        'Two lines across the whole field. On the signal gun the fire runs from the right of the '
        + 'front line to the left and back along the second, man after man, and if one fires early '
        + 'the whole thing is a noise instead of a sound.',
      grants: 'obs.a5.feu',
    },
    {
      id: 'the-green',
      label: 'the ground',
      x: V_RANK_W + 6, z: V_HUT_Z0 + 14,
      examine:
        'Green, between the ranks and behind the huts and everywhere nobody walks. The street is '
        + 'still mud and always will be. It is the same eight acres you walked onto in December '
        + 'and the difference is five months and nothing else.',
      grants: 'obs.a5.green',
    },
    {
      id: 'the-finished-town',
      label: 'the huts, finished',
      x: 42, z: 27,
      examine:
        'Two thousand of them, in ranks, doors to the street, chimneys drawing. It is unmistakably '
        + 'a town and it was a hillside of oak trees in December. Nobody built this for them and '
        + 'nobody paid them for it.',
      grants: 'obs.a5.finished',
    },
    {
      id: 'the-still-dead',
      label: 'a burial party, in May',
      x: 14, z: 51,
      examine:
        'Still going out, in May, in the sun, on the day of the *feu de joie*. April and May are '
        + 'the worst months on this hill. Nothing that was decided this winter changed that '
        + 'number, and the treaty being read on the field below does not change it either.',
      grants: 'obs.a5.still_dying',
    },
    {
      id: 'the-culper-line',
      label: 'a man on the Philadelphia road',
      x: 60, z: 60,
      examine:
        'A rider going out with nothing written on him. There is to be a network in New York this '
        + 'year, run out of Setauket, with numbered names and a sympathetic ink. That is all that '
        + 'is said about it here, which is about what was said at the time.',
      grants: 'obs.a5.culper',
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * Potts's house
 * ---------------------------------------------------------------------- */

export function pottsThings(state: Forge): Interactable[] {
  const common: Interactable[] = [
    {
      id: 'the-house',
      label: 'the room',
      x: 16, z: 14,
      examine:
        'Stone, two storeys, about twenty-four feet square, rented from the Potts family for a '
        + 'hundred pounds of Pennsylvania currency. A life guard, a family of aides, the whole '
        + 'correspondence of an army, and Mrs. Washington from February, in this. He did not move '
        + 'in until the huts were finished, because he had said he would not.',
      grants: 'obs.a5.house',
    },
    {
      id: 'the-pay-abstract',
      label: 'a pay abstract',
      x: 24, z: 12,
      examine:
        'Made up, signed, submitted, and not honoured. The men of this army have not been paid in '
        + 'five months. Congress cannot pay them because Congress cannot tax; it can only ask the '
        + 'states, and the states are not asking themselves.',
      grants: 'obs.a5.pay',
    },
    {
      id: 'the-marquee',
      label: 'the marquee, folded',
      x: 10, z: 18,
      examine:
        'Fourteen feet by twenty-three, twelve feet at the peak, in linen. He lived in it from the '
        + 'nineteenth of December until the huts were up, in a field, within sight of the men doing '
        + 'the building. The object itself survives and is in a museum, which is a strange thing to '
        + 'know while looking at it folded in a corner.',
      grants: 'obs.a5.marquee',
    },
    {
      id: 'the-returns',
      label: 'the returns of men fit for duty',
      x: 4, z: 7,
      examine:
        'Bound, by brigade, by week. The line that matters is not the total but the difference '
        + 'between men present and men fit, and this winter that difference runs at about a '
        + 'quarter and touches a third in February.',
      grants: 'obs.a5.returns',
    },
  ];

  if (state === 'december') {
    return [
      ...common,
      {
        id: 'stirlings-letter',
        label: "Lord Stirling's letter",
        x: 16, z: 8,
        examine:
          'Copied fair by Hamilton and lying square on the table. Read the citation before you '
          + 'read the sentence. Wilkinson told McWilliams, over wine, what he says he read in a '
          + 'letter from Conway to Gates. McWilliams told Stirling. Stirling has told you.',
        document: 'DOC-A5.3',
      },
      {
        id: 'the-naked-letter',
        label: 'a letter to Congress, in draft',
        x: 4, z: 14,
        examine:
          'To Henry Laurens, dated the twenty-third. It says the army must starve, dissolve or '
          + 'disperse, and it says two thousand eight hundred and ninety-eight men are unfit for '
          + 'duty because they are barefoot and otherwise naked. It is a count, not a phrase.',
        document: 'DOC-A5.1',
      },
      {
        id: 'lafayettes-letter',
        label: 'a letter from Lafayette',
        x: 26, z: 8,
        examine:
          'Twenty years old, a major general, and writing to say that he has been offered the '
          + 'command of an expedition into Canada by a Board of War that did not think to mention '
          + 'it to the commander-in-chief, and that he does not intend to take it on those terms.',
        grants: 'obs.a5.lafayette',
      },
      {
        id: 'the-inoculation-order',
        label: 'the inoculation order',
        x: 4, z: 10,
        examine:
          'From last winter at Morristown, and still standing. Necessity not only authorises but '
          + 'seems to require the measure &mdash; and, at the end: the matter is to be kept as '
          + 'secret as possible.',
        document: 'DOC-A5.5',
      },
      {
        id: 'the-committee-report',
        label: "the Committee at Camp's papers",
        x: 20, z: 12,
        examine:
          'Five men of Congress, appointed to inquire into the state of the army, sitting in this '
          + 'room in February. They will see it, and write it down accurately, and recommend a '
          + 'reorganisation of the commissariat that Congress will partly adopt. They cannot fix '
          + 'supply, because supply runs through thirteen states and none of them has to do '
          + 'anything.',
        grants: 'obs.a5.committee',
      },
    ];
  }

  return [
    ...common,
    {
      id: 'conways-resignation',
      label: "Conway's resignation",
      x: 16, z: 8,
      examine:
        'Written in a temper, offering to resign, and plainly expecting to be asked to reconsider. '
        + 'Congress accepted it by return of post. He will be shot through the mouth in a duel by '
        + 'a brother officer in July, survive it, write an apology, and go back to France.',
      grants: 'obs.a5.conway_gone',
      contradicts: {
        heard: 'heard.a5.conway',
        line:
          'He stood in this room and said he was entirely and warmly attached to your person, and '
          + 'that whatever had been reported of him could not be produced by the men reporting it. '
          + 'Both of those may have been true. The letter has still never been found, and he has '
          + 'still resigned rather than serve under you, and neither of those facts settles the '
          + 'other.',
        grants: 'obs.a5.conway_contradiction',
        note: 'the warm attachment, and the resignation, three months apart',
      },
    },
    {
      id: 'the-saratoga-papers',
      label: 'two accounts of one battle',
      x: 4, z: 7,
      examine:
        'Gates&rsquo;s despatch to Congress about Saratoga, and Arnold&rsquo;s account of the '
        + 'seventh of October. Count the names in the first one. Gates sent it to Congress '
        + 'directly rather than through his commander-in-chief, which is a breach of every '
        + 'convention of the service, and it was noticed.',
      document: 'DOC-A5.4',
    },
    {
      id: 'the-alliance-packet',
      label: 'a packet from Paris',
      x: 26, z: 8,
      examine:
        'Three months at sea. France has recognised the United States and undertakes not to make '
        + 'peace without her, and will not lay down her arms until independence is assured. It was '
        + 'signed on the sixth of February because Burgoyne surrendered in October.',
      document: 'DOC-A5.6',
    },
    {
      id: 'the-blue-book-fair',
      label: 'a fair copy of the regulations',
      x: 20, z: 12,
      examine:
        'Copied out by hand for each brigade, because there is no press in this camp. It will be '
        + 'printed at Philadelphia next year and the army will drill by it for thirty years, and '
        + 'the man who wrote it did it at night in a language nobody here reads.',
      document: 'DOC-A5.2',
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * The hospital hut
 * ---------------------------------------------------------------------- */

export function hospitalThings(): Interactable[] {
  return [
    {
      id: 'the-hut',
      label: 'the hut',
      x: 10, z: 10,
      examine:
        'Fourteen feet by sixteen. Six and a half feet to the ridge. One window-hole and a '
        + 'fireplace at the rear, exactly to the order, because a hospital hut is a hut. Berths in '
        + 'three tiers up both long walls. Twelve men.',
      grants: 'obs.a5.hut_inside',
    },
    {
      id: 'the-mortality',
      label: 'the mortality return',
      x: 9, z: 12,
      examine:
        'By cause, by week. Camp fever. Flux. Putrid fever. Smallpox. Debility. The last column is '
        + 'the largest and the word in it means a man who was not strong enough to survive being '
        + 'ill, which is what five months of flour and water does before anything else gets to '
        + 'him.',
      grants: 'obs.a5.mortality',
    },
    {
      id: 'the-inoculation-lancet',
      label: 'a lancet and a thread',
      x: 12, z: 7,
      examine:
        'A shallow cut in the arm, matter from a pustule worked into it on a thread, a bandage. '
        + 'That is the whole of variolation. The man is genuinely ill for three weeks and '
        + 'contagious for all of them, which is why it is done by whole regiments, in isolation, '
        + 'and in secret.',
      document: 'DOC-A5.5',
    },
    {
      id: 'the-discharge',
      label: 'a discharge, made out',
      x: 6, z: 14,
      examine:
        'Written out in full, signed, and lying on the berth of a man who will not use it. The '
        + 'surgeon writes them in advance when he is certain, because a discharge in a dead '
        + 'man&rsquo;s hand is worth something to his family and a discharge never written is not.',
      grants: 'obs.a5.discharge',
    },
    {
      id: 'the-letter-home',
      label: 'a letter, unfinished',
      x: 6, z: 12,
      examine:
        'Under the straw, in a hand that stops in the middle of the second line. To a mother at '
        + 'Elizabethtown. The surgeon has said he will finish it. Nobody has said out loud what '
        + 'that means and everybody in this hut has understood it.',
      grants: 'obs.a5.letter_home',
    },
    {
      id: 'the-four-names',
      label: 'four names on a board',
      x: 14, z: 12,
      examine:
        'Chalked at the end of the berths: Harrow, Pike, Dandridge, Sole. Three of the four die '
        + 'this winter whatever is decided here in the next five minutes, because they are already '
        + 'sick with things nothing in 1778 can touch. That is not a reason to decide nothing.',
      grants: 'obs.a5.four_names',
    },
  ];
}
