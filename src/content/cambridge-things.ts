/**
 * What there is to look at at Cambridge.
 *
 * R3: every place contains at least one examinable object whose text
 * contradicts something a person in that place says, with neither marked as
 * true. There are three on this map — Greene's tents against Greene's own
 * account of the camp, Congress's resolution against what Gates says Congress
 * will do, and Doolittle's plates against what Prescott says about how the
 * country rose.
 *
 * The examine strings run 25-45 words. Longer and the student is reading a
 * label rather than looking at a thing.
 *
 * SEASONS. Most of these objects are on the map in both states, because they
 * are the same objects — a gun is a gun in December. The ones that are not
 * are gathered at the bottom of the file and gated, and each one says why.
 */

import type { Interactable } from '../types';
import type { Season } from './cambridge';
import { C_ROWS, PARADE_Z, STREET_N, STREET_S, TENTS_N, TENTS_S, WORKS_S } from './cambridge';

/* ---------------------------------------------------------------------- *
 * The works
 * ---------------------------------------------------------------------- */

function theWorks(season: Season): Interactable[] {
  const w = season === 'winter';
  return [
    {
      /*
       * The instrument the hill is built around.
       *
       * Seven bearings, each named once, and this is the only place in the
       * game where knowledge is gathered by looking rather than by reading a
       * document or being told by a person — which is exactly what scouting
       * is. Every one of the seven is a thing a student can afterwards be
       * shown on a real map of Boston harbour.
       *
       * The seven are handled by the surveyor's overlay rather than by seven
       * separate interactables: pressing the survey key while standing at the
       * glass names them in turn. Here it is one object, and looking at it is
       * what tells you the overlay exists.
       */
      id: 'spyglass',
      label: 'the spyglass',
      x: 40, z: 14,
      examine:
        'A good glass on a rest, pointed at a town you cannot enter. From here you can count '
        + 'their guns, their spires and their shipping, and reach not one of them. Hold the '
        + 'survey key and it will name what it is looking at.',
      grants: 'obs.a2.spyglass',
    },
    {
      id: 'parapet',
      label: 'the parapet',
      x: 34, z: 13,
      examine:
        'Six feet of earth against the sky with a firing step cut into the back of it. It was '
        + 'thrown up in a fortnight by men who had never seen a fortification, and it is better '
        + 'than it has any right to be.',
      grants: 'obs.a2.parapet',
    },
    {
      id: 'boston-across',
      label: 'the town across the water',
      x: 44, z: 13,
      examine:
        'Six thousand regulars and about as many townspeople who could not get out, all on a '
        + 'peninsula, all fed by sea. You have them shut in on the land side, and the land side '
        + 'was never the question.',
      grants: 'obs.a2.boston',
    },
    {
      id: 'charlestown',
      label: 'what is left of Charlestown',
      x: 54, z: 13,
      examine:
        'They burned it on the seventeenth of June to clear their way up the hill, and they hold '
        + 'every foot of the ashes. Four hundred houses. The people who lived in them are in the '
        + 'country towns, being fed by subscription.',
      grants: 'obs.a2.charlestown',
    },
    {
      id: 'gabion',
      label: 'a gabion, half filled',
      x: 28, z: 17,
      examine:
        'A wicker basket the height of a man, stood on end and filled with earth. Twenty of them '
        + 'set side by side is a wall, and any farmer who has made a hurdle can make one. These '
        + 'have been filled with loose earth and no stones.',
      grants: 'obs.a2.gabion',
    },
    {
      id: 'unfinished-work',
      label: 'the unfinished work',
      x: 31, z: 19,
      examine:
        'The line of gabions runs eleven baskets and then stops, and the tools are where the '
        + 'party left them. Nobody has been ordered off this work. They have simply gone, a few '
        + 'at a time, and nobody has counted them out.',
      grants: 'obs.a2.unfinished',
    },
    {
      id: 'abatis',
      label: 'the abatis',
      x: 11, z: 13,
      examine:
        'Felled trees laid with their sharpened branches outward, the whole length of the slope. '
        + 'Ugly, cheap, and worth more than any number of muskets to men who cannot yet be '
        + 'relied on to stand and reload.',
    },
    {
      id: 'guns',
      label: 'the two field guns',
      x: 48, z: 17,
      examine:
        'Two, and neither of them is heavy enough to reach the town. Beside them a pyramid of '
        + 'round shot for pieces this army does not have. Somebody stacked it neatly, which is '
        + 'either discipline or a joke.',
      grants: 'obs.a2.guns',
    },
    {
      id: 'powder-cask',
      label: 'a powder cask',
      x: 46, z: 19,
      examine:
        'One cask, on a hill with two guns on it. You have been told there are three hundred and '
        + 'eight barrels in this army. Yesterday the commissary handed you a return, and you '
        + 'have not yet been able to put it down.',
      document: 'DOC-A2.1',
    },
    {
      id: 'graves',
      label: 'the graves on the reverse slope',
      x: 46, z: WORKS_S - 1,
      examine:
        'Eleven of them, named on boards, and not one of them shot. Camp fever and the bloody '
        + 'flux have taken more of this army in five months than the King has, and both come '
        + 'from the state of the camp, which is your business and nobody else&rsquo;s.',
      grants: 'obs.a2.graves',
    },
    {
      id: 'deserters-coat',
      label: "a deserter's coat",
      x: 14, z: 18,
      examine:
        'Regimental red with buff facings, off a man who swam the Charles at night and asked for '
        + 'bread. He says there are more who would come. He also says their bread is better than '
        + 'yours, which you believe.',
      grants: 'obs.a2.deserter',
    },
    {
      id: 'rum',
      label: "the day's rum",
      x: 62, z: 19,
      examine:
        'A gill a man, measured out where everyone can see it measured. It is the only part of '
        + 'the ration nobody has ever complained was short, because it is the only part anybody '
        + 'watches being issued.',
      grants: 'obs.a2.rum',
    },
    {
      id: 'letter-home',
      label: 'an unfinished letter',
      x: 50, z: WORKS_S - 2,
      examine:
        '&ldquo;Dear Mother, we are all in health except&rdquo; &mdash; and there it stops, in '
        + 'the middle of the line, and the ink has been dry a fortnight. Somebody folded it, put '
        + 'it under a stone, and did not come back for it.',
      grants: 'obs.a2.letter_home',
    },
    {
      id: 'covered-way',
      label: 'the covered way',
      x: 34, z: 24,
      examine:
        'A path worn down the reverse of the hill toward the huts, dug deep enough in two places '
        + 'that a man can walk it without being seen from the water. In the other places nobody '
        + 'has finished digging it, so you walk fast.',
    },
    /*
     * WINTER ONLY. The roll is what A2-D4 unlocks off, and it cannot exist in
     * July, because in July none of the dates on it have come near.
     */
    ...(w
      ? [{
        id: 'enlistment-roll',
        label: 'the enlistment roll',
        x: 26, z: 18,
        examine:
          'Every man on this hill, and against each name a date. Most of the dates are in '
          + 'December. It is not a mutiny and it is not desertion &mdash; it is the paper they '
          + 'signed, and it is going to take your army away from you legally and on schedule.',
        grants: 'obs.a2.enlistment_roll',
        document: 'DOC-A2.6',
      }]
      : []),
    /*
     * SUMMER ONLY. The plates were advertised in December, which is precisely
     * the compression flagged in `act2-people.ts` — so they are here in
     * summer, where Doolittle is, and the contradiction with Prescott is
     * where the teaching is.
     */
    ...(w
      ? []
      : [{
        id: 'doolittle-plates',
        label: 'four engraved plates',
        x: 60, z: 18,
        examine:
          'Lexington green, the North Bridge, and the retreat, in four sheets. They are stiff, '
          + 'the figures are wooden, and they are the only pictures of that morning made by '
          + 'anyone who went and looked.',
        grants: 'obs.a2.plates',
        contradicts: {
          heard: 'heard.a2.prescott',
          line:
            'Prescott has just told you the country turned out of its own accord, needing no '
            + 'telling. The third plate shows the militia forming by companies with their '
            + 'officers in front of them. Somebody had told them, and somebody had drilled them, '
            + 'for years.',
          grants: 'obs.a2.plates_contradiction',
          note: 'Prescott says the country rose of itself — the plates show trained companies',
        },
      }]),
  ];
}

/* ---------------------------------------------------------------------- *
 * Headquarters, outside
 * ---------------------------------------------------------------------- */

function theHouse(): Interactable[] {
  return [
    {
      id: 'vassall-house',
      label: 'the house',
      x: 44, z: 42,
      examine:
        'John Vassall built it in 1759 and left it in a hurry last summer, being a loyalist in a '
        + 'town that had stopped being safe for one. You are running a war out of a house you '
        + 'took from a man on the other side, and half the good houses on this street are empty '
        + 'for the same reason.',
      grants: 'obs.a2.vassall',
    },
    {
      id: 'marquee',
      label: 'the marquee',
      x: 25, z: 41,
      examine:
        'Your own tent, still pitched. You lived in it for a fortnight before the house was made '
        + 'ready and you have not had it struck, because an army that sees its general under '
        + 'canvas thinks something different from an army that does not.',
      grants: 'obs.a2.marquee',
    },
    {
      id: 'sentry-post',
      label: 'the sentry at the door',
      x: 45, z: 43,
      examine:
        'A countersign, a written pass, and a man who has been told to ask for both from anyone, '
        + 'without exception. He asked you for them on the second day and was commended for it '
        + 'in general orders the same evening.',
    },
    {
      id: 'express-rider',
      label: 'a horse still saddled',
      x: 67, z: 42,
      examine:
        'Ridden in hard and not yet rubbed down. Everything you know about Philadelphia, about '
        + 'Ticonderoga and about the country west of the Hudson arrives on a horse, ten days '
        + 'behind whatever happened.',
      grants: 'obs.a2.express',
    },
    {
      id: 'guard-house',
      label: 'the guard house',
      x: 27, z: 50,
      examine:
        'Where the passes are written and the drunk are kept until morning. The book on the '
        + 'table is a list of men confined, and the commonest entry against a name is not '
        + 'cowardice or theft. It is absence.',
    },
    {
      id: 'firewood-bill',
      label: 'a bill for firewood',
      x: 39, z: 41,
      examine:
        'Presented by a farmer at Watertown, for wood already cut and already burnt. The army '
        + 'has no money in Cambridge and its credit is a piece of paper signed by a Virginian '
        + 'nobody here had heard of a year ago.',
      grants: 'obs.a2.firewood',
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * The camp street
 * ---------------------------------------------------------------------- */

function theCamp(season: Season): Interactable[] {
  const w = season === 'winter';
  return [
    {
      /* R3. The contradiction of the camp street, and the best one in the act. */
      id: 'greene-tents',
      label: "the Rhode Island tents",
      x: 22, z: TENTS_N + 2,
      examine:
        'Nine wedge tents, dressed by the line, pegged square, with the regimental numbers '
        + 'painted on the flies. Rhode Island bought them. No other colony did, and no other '
        + 'colony&rsquo;s men are dry tonight.',
      grants: 'obs.a2.greene_tents',
      contradicts: {
        heard: 'heard.a2.greene',
        line:
          'Greene has just told you his brigade wants for nothing that the others have not '
          + 'wanted for. Two hundred yards down this same street men are sleeping under cut '
          + 'brush. He is not lying to you. He genuinely has not walked down there.',
        grants: 'obs.a2.greene_contradiction',
        note: 'Greene says his brigade is no better found than the rest — the street says otherwise',
      },
    },
    {
      id: 'brush-shelter',
      label: 'a shelter of brush',
      x: 44, z: TENTS_S + 2,
      examine:
        'Poles, brushwood and one salvaged board, and three men live in it. Emerson the chaplain '
        + 'walked this street and wrote it all down, because he had never seen anything like it '
        + 'and did not expect to again.',
      document: 'DOC-A2.2',
    },
    {
      id: 'kettle',
      label: 'a mess kettle',
      x: 20, z: STREET_N + 2,
      examine:
        'One to six men, and what is in it is beef, flour and whatever the mess has been able to '
        + 'find. They cook by companies because nobody has taught them to cook by messes, and '
        + 'half of them are eating half-raw meat and paying for it in the hospital.',
      grants: 'obs.a2.kettle',
    },
    {
      id: 'musket-no-bayonet',
      label: 'a musket with no bayonet',
      x: 26, z: STREET_N + 1,
      examine:
        'A fowling piece off a farm, bored for birdshot, with no bayonet lug and nowhere to put '
        + 'one. Perhaps a third of the muskets in this army will take a bayonet. The other side '
        + 'has one on every barrel and has practised the use of it.',
      grants: 'obs.a2.no_bayonet',
    },
    {
      id: 'hunting-shirt',
      label: 'a hunting shirt',
      x: 52, z: STREET_S - 1,
      examine:
        'Fringed linen, dyed with walnut hull, cut to the same pattern by every rifleman who came '
        + 'up from Virginia. It costs almost nothing, it can be made anywhere, and the enemy has '
        + 'decided it means the wearer can shoot. Two of those three are true.',
      grants: 'obs.a2.hunting_shirt',
    },
    {
      id: 'general-orders',
      label: 'the general orders book',
      x: 44, z: STREET_N + 1,
      examine:
        'The day&rsquo;s orders, copied out for the regiments. Half of them are about the sinks, '
        + 'the filth and the firing of muskets in camp for amusement. You are commanding an army '
        + 'and you are writing about latrines, and the latrines are what is killing them.',
      grants: 'obs.a2.orders',
    },
    {
      id: 'necessary',
      label: 'the necessary',
      x: 9, z: C_ROWS - 5,
      examine:
        'Two of them, for an army the returns say is sixteen thousand strong. Men are going where '
        + 'they please instead, and the wells are downhill of where they please. Every grave on '
        + 'that hill begins somewhere near this spot.',
      grants: 'obs.a2.necessary',
    },
    {
      id: 'magazine',
      label: 'the magazine',
      x: 75, z: 50,
      examine:
        'Brick, thick-walled, double-doored and set well away from every fire in the camp. It is '
        + 'built like a bank vault, it is guarded day and night, and what is inside it would not '
        + 'fill a farm cart.',
      grants: 'obs.a2.magazine',
    },
    {
      id: 'parade',
      label: 'the parade',
      x: 30, z: PARADE_Z + 2,
      examine:
        'The only level ground in this camp that is level on purpose. You took command on it '
        + 'under an elm on the third of July, in front of men who did not cheer, which was '
        + 'sensible of them, because nothing had changed yet.',
      grants: 'obs.a2.parade',
    },
    {
      id: 'wagons',
      label: 'the wagon park',
      x: 68, z: PARADE_Z + 2,
      examine:
        'Hired wagons, hired teams, hired drivers, and every one of them on a contract this army '
        + 'cannot pay this month. The men who own them are patient. They will not be patient in '
        + 'February.',
    },
    {
      id: 'washing',
      label: 'the washing lines',
      x: 21, z: STREET_S - 1,
      examine:
        'The women of the camp are on the rations at half a man&rsquo;s allowance, and in return '
        + 'this army has clean shirts and dressed wounds. Take them off the rolls and the hospital '
        + 'fills in a week. Nobody has ever written that down as a fact about strength.',
      grants: 'obs.a2.camp_women',
    },
    /* WINTER ONLY: the train, and the thing that ends the siege. */
    ...(w
      ? [
        {
          id: 'gun-sledge',
          label: 'a gun on a sledge',
          x: 38, z: PARADE_Z + 1,
          examine:
            'Twenty-four pounds of ball, sixty tons of iron in the train behind it, three hundred '
            + 'miles of it, over the Berkshires, in winter, on ox sledges. A twenty-five-year-old '
            + 'bookseller said he could do it and nobody could think of a reason to stop him.',
          document: 'DOC-A2.5',
        },
        {
          id: 'empty-ground',
          label: 'where four tents stood',
          x: 40, z: TENTS_N + 2,
          examine:
            'Four squares of flattened, yellowed grass in a rank that used to run to nine, and '
            + 'the peg holes still in the ground. Connecticut. They went on the tenth, with their '
            + 'passes signed, and they were entitled to.',
          grants: 'obs.a2.empty_ground',
        },
        {
          id: 'hut',
          label: 'a log hut',
          x: 28, z: TENTS_S + 4,
          examine:
            'Fourteen feet by sixteen, notched at the corners, chinked with clay, and twelve men '
            + 'live in it. They built it in four days out of a wood that belongs to somebody at '
            + 'Watertown who has not been paid for it.',
          grants: 'obs.a2.huts',
        },
      ]
      : [
        {
          id: 'ration-return',
          label: 'the ration return',
          x: 36, z: STREET_N + 1,
          examine:
            'What was drawn yesterday, by regiment. Add it up and it does not agree with the '
            + 'strength return, and the difference is nine hundred men who are either dead, sick, '
            + 'at home, or were never there.',
          grants: 'obs.a2.ration_return',
        },
        {
          id: 'congress-resolution',
          label: 'a printed resolution',
          x: 54, z: STREET_N + 2,
          examine:
            'Off the Philadelphia press and nailed to a post where the men can read it. It votes '
            + 'this army into existence, fixes its pay, and requires every man to find his own '
            + 'arms and clothing.',
          document: 'DOC-A2.4',
        },
      ]),
  ];
}

export function campThings(season: Season): Interactable[] {
  return [...theWorks(season), ...theHouse(), ...theCamp(season)];
}
