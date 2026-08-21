/**
 * What there is to look at on the Delaware and in Trenton.
 *
 * R3: two contradictions, and they are the two the act is built on.
 *
 *   Honeyman says the garrison is at ease and unprepared. The intercepted
 *   Hessian picket order shows Rall doubled his guards on the twenty-fourth.
 *   Neither is marked true. THIS IS WHERE THE GAME KILLS THE DRUNK-HESSIAN
 *   STORY, and it does it by putting two pieces of paper next to each other
 *   rather than by telling anybody anything.
 *
 *   And Knox, after, gives the tactical account in forty-five minutes and
 *   two guns — against a casualty list on which two of the four American
 *   dead were killed by the weather before a shot was fired.
 */

import type { Interactable } from '../types';
import type { Bank, Street } from './delaware';
import { D_CAMP_N, D_SHORE, T_HEAD } from './delaware';

/* ---------------------------------------------------------------------- *
 * The bank
 * ---------------------------------------------------------------------- */

export function ferryCampThings(state: Bank): Interactable[] {
  const night = state === 'night';

  const common: Interactable[] = [
    {
      /*
       * THE F-17 CORRECTIVE, delivered as an examine string on an object the
       * player has already looked at from thirty feet.
       */
      id: 'durham-boat',
      label: 'a Durham boat',
      x: 18, z: D_SHORE + 3,
      examine:
        'Sixty feet long, eight wide, four deep, and black with tar. It carries pig iron down from '
        + 'the Durham furnace and it is poled, not rowed &mdash; two men a side walking the '
        + 'gunwale from bow to stern. There is nothing to sit on. Everybody stands.',
      grants: 'obs.a4.durham',
    },
    {
      id: 'the-river-dl',
      label: 'the river',
      x: 34, z: D_SHORE - 1,
      examine:
        'Three hundred yards, and it is not frozen and it is not clear. It is running ice: plates '
        + 'of it coming down on the current, some of them big enough to stave a boat, and they '
        + 'come out of the dark without any warning at all.',
      grants: 'obs.a4.running_ice',
    },
    {
      id: 'wrapped-feet',
      label: "a man's feet",
      x: 24, z: D_CAMP_N + 3,
      examine:
        'Rag, and a piece of raw hide off a dead ox, tied on with twine. He has been like this '
        + 'since Hackensack. The line about being able to follow this army by the blood on the '
        + 'road is not a figure of speech; it is what the road looks like.',
      grants: 'obs.a4.feet',
    },
    {
      id: 'wet-musket',
      label: 'a musket that will not fire',
      x: 44, z: D_CAMP_N + 4,
      examine:
        'The priming is soaked and the pan is rusted shut, and there is no dry powder in this camp '
        + 'to reprime it with. In four hours every firelock in this army is going to be in exactly '
        + 'this condition, and somebody is going to have to say so out loud.',
      grants: 'obs.a4.wet_musket',
    },
    {
      id: 'christmas-ration',
      label: "the Christmas ration",
      x: 30, z: D_CAMP_N + 6,
      examine:
        'Flour, and beef that was salted a long way from here, and that is the whole of it. It is '
        + 'the same as yesterday&rsquo;s and it will be the same tomorrow. Nobody in this camp has '
        + 'mentioned the date all day.',
      grants: 'obs.a4.ration',
    },
    {
      id: 'password-order',
      label: "the day's orders",
      x: 38, z: D_CAMP_N + 2,
      examine:
        'Copied out for the brigades. Two lanthorns to a brigade and no other light; the '
        + 'profoundest silence; no man to quit his ranks. And at the bottom, the parole and the '
        + 'countersign for the night.',
      document: 'DOC-A4.4',
    },
  ];

  if (!night) {
    return [
      ...common,
      {
        id: 'crisis-pamphlet',
        label: 'a pamphlet, much handled',
        x: 34, z: D_CAMP_N + 4,
        examine:
          'Two pence, off a Philadelphia press six days ago, on paper you could see daylight '
          + 'through. It has been read aloud to the regiments twice and it is coming apart at the '
          + 'fold. It begins with a sentence everybody in this camp can already recite.',
        document: 'DOC-A4.1',
      },
      {
        id: 'reenlistment-paper',
        label: 'a paper of re-engagement',
        x: 32, z: D_CAMP_N + 4,
        examine:
          'Blank, in a bundle, waiting. Six weeks past the expiry of a present enlistment, for ten '
          + 'dollars in hard money. There is no ten dollars, there is no hard money, and Congress '
          + 'is at Baltimore.',
        document: 'DOC-A4.2',
      },
      {
        id: 'morris-note',
        label: 'a letter from Philadelphia',
        x: 48, z: D_SHORE + 12,
        examine:
          'From Robert Morris, who is going round the city on his own signature borrowing coin '
          + 'from private people because the government he serves has none, and who will keep '
          + 'doing it for six years.',
        document: 'DOC-A4.3',
      },
      {
        id: 'picket-order',
        label: "an intercepted order",
        x: 42, z: D_SHORE + 11,
        examine:
          'Taken off a Hessian courier on the twenty-fourth, in German, translated on the back by '
          + 'somebody at headquarters. It doubles the guards at every post in Trenton and orders '
          + 'the brigade to lie on its arms.',
        grants: 'obs.a4.picket_order',
        contradicts: {
          heard: 'heard.a4.honeyman',
          line:
            'Honeyman has just told you the garrison is at its ease, that the officers are dining, '
            + 'and that he has not seen a patrol on the Pennington road in two days. The order in '
            + 'your hand doubles every guard in the town and was written the day before yesterday. '
            + 'Neither of them is lying to you and one of them is wrong.',
          grants: 'obs.a4.honeyman_contradiction',
          note: 'Honeyman says they are at ease — Rall doubled the guard on the twenty-fourth',
        },
      },
      {
        id: 'rall-story',
        label: 'a story about the Hessian colonel',
        x: 36, z: D_SHORE + 12,
        examine:
          'Going round the camp: that the enemy over there are drunk on Christmas beer and will '
          + 'not get out of bed. Somebody heard it from somebody. It is a very comfortable thing '
          + 'to believe on the afternoon before you attack them.',
        document: 'DOC-A4.5',
      },
      {
        id: 'the-shelters',
        label: 'the shelters',
        x: 16, z: D_CAMP_N + 2,
        examine:
          'Brush, board, a sail, and one contrived out of a door. There is not a tent in this camp '
          + 'and there has not been since the eighth of December. The fires are small because the '
          + 'wood has to be carried and there are not enough axes.',
        grants: 'obs.a4.shelters',
      },
      {
        id: 'the-strength',
        label: 'the strength return',
        x: 36, z: D_CAMP_N + 3,
        examine:
          'Present and fit for duty, by regiment, and the column at the bottom comes to about two '
          + 'thousand four hundred. In July there were nineteen thousand men on this establishment. '
          + 'That is not a casualty list. Most of that difference walked home legally.',
        grants: 'obs.a4.strength',
      },
      {
        id: 'the-newtown-road',
        label: 'the road from Newtown',
        x: 34, z: D_ROWS_MINUS_8,
        examine:
          'It comes down through the trees from the camps at Newtown and it is the only way '
          + 'anything reaches this bank. Every gun, every barrel and every man came down it, in '
          + 'the last four days, in this weather.',
      },
    ];
  }

  return [
    ...common,
    {
      id: 'the-storm',
      label: 'the storm',
      x: 30, z: D_SHORE + 5,
      examine:
        'It came on at about eleven, which is the hour the first boat went over. Sleet, then hail, '
        + 'then snow, and a north-east wind driving all three of them up the river into the faces '
        + 'of the men in the boats.',
      grants: 'obs.a4.storm',
    },
    {
      id: 'the-timetable',
      label: 'the timetable',
      x: 38, z: D_SHORE + 4,
      examine:
        'Across by midnight, formed by one, at Trenton by five, and the attack an hour before '
        + 'first light. It is eleven o&rsquo;clock and the first brigade is not over, and every '
        + 'line on this paper is going to be wrong by three hours.',
      grants: 'obs.a4.timetable',
    },
    {
      id: 'the-guns-over',
      label: 'the guns, going over',
      x: 26, z: D_SHORE + 4,
      examine:
        'Eighteen of them, and each one goes in a boat by itself with the horses swum alongside. '
        + 'They came three hundred miles on a sledge in January to get here and Knox is on the '
        + 'bank shouting at everybody, which is the only reason it is being done at all.',
      grants: 'obs.a4.guns_over',
    },
    {
      id: 'the-silence',
      label: 'the silence',
      x: 42, z: D_SHORE + 7,
      examine:
        'Two thousand four hundred men on a riverbank in the dark and not one of them speaking. '
        + 'The order was for the profoundest silence. This army has never obeyed an order in its '
        + 'life and it is obeying this one, and that ought to tell you something.',
      grants: 'obs.a4.silence',
    },
    {
      /*
       * The night's contradiction. Knox on the bank says he is not losing a
       * gun in a river; the timetable on the barrel says he has already lost
       * three hours doing it. Neither is wrong.
       */
      id: 'the-count',
      label: 'the tally of what is over',
      x: 30, z: D_SHORE + 6,
      examine:
        'Chalked on a boat&rsquo;s thwart and rubbed out and written again: regiments over, guns '
        + 'over, horses over. It is the only record anybody is keeping tonight and it is going to '
        + 'be wrong.',
      grants: 'obs.a4.tally',
      contradicts: {
        heard: 'heard.a4.knox',
        line:
          'Knox has just told you he is not losing a gun in a river, and he has not, and he will '
          + 'not. What the tally says is that each one has cost him about eleven minutes, and '
          + 'that eighteen of them is three hours, and that three hours is the difference between '
          + 'attacking in the dark and attacking in daylight.',
        grants: 'obs.a4.knox_contradiction',
        note: 'Knox will not lose a gun — and each one he saves costs eleven minutes of dark',
      },
    },
    {
      id: 'the-lanthorns',
      label: 'two lanthorns',
      x: 42, z: D_SHORE + 4,
      examine:
        'Two to a brigade, carried by the officers of the leading regiment, and every other light '
        + 'on this bank is out by order. A man three files back is walking to Trenton by the sound '
        + 'of the man in front of him.',
      grants: 'obs.a4.lanthorns',
    },
    {
      id: 'the-poles',
      label: 'the setting poles',
      x: 22, z: D_SHORE + 3,
      examine:
        'Eighteen feet of ash with an iron shoe. Two men a side walk the gunwale from bow to '
        + 'stern with their shoulders on them, and that is how a Durham boat crosses a river with '
        + 'ice coming down it. Nobody rows anything tonight.',
      grants: 'obs.a4.poles',
    },
  ];
}

/* This file may not read `D_ROWS` from the map module at top level — see the
 * note in `delaware-people.ts` — so the one place that wants it uses the
 * literal, with the constant named beside it. */
const D_ROWS_MINUS_8 = 46;

/* ---------------------------------------------------------------------- *
 * King Street
 * ---------------------------------------------------------------------- */

export function trentonThings(state: Street): Interactable[] {
  const after = state === 'after';

  const common: Interactable[] = [
    {
      id: 'old-barracks',
      label: 'the Old Barracks',
      x: 15, z: 18,
      examine:
        'Stone, two storeys, built in 1758 for the last war, with a continuous arcade of doorways '
        + 'along the whole front. It housed the Hessian brigade last night and it is the only '
        + 'building in this town anybody will remember.',
      grants: 'obs.a4.barracks',
    },
    {
      id: 'king-street',
      label: 'King Street',
      x: 31, z: 30,
      examine:
        'It runs down the hill from here to the barracks and the bridge, and Queen Street runs '
        + 'parallel to it. Two streets, two columns, converging at the bottom. A regiment cannot '
        + 'form up in a street with round shot coming along it, and both of you know that.',
      grants: 'obs.a4.king_street',
    },
    {
      id: 'the-bridge',
      label: 'the Assunpink bridge',
      x: 31, z: 8,
      examine:
        'A stone bridge over a creek at the bottom of the town, and it is the only way out to the '
        + 'south. Whoever holds it decides whether this is a victory or a morning&rsquo;s work. It '
        + 'will matter again on the second of January and rather more.',
      grants: 'obs.a4.bridge',
    },
    {
      id: 'the-sleet',
      label: 'the weather',
      x: 27, z: 34,
      examine:
        'Still coming down and it has been for nine hours. It is in the men&rsquo;s faces marching '
        + 'in and in the Hessians&rsquo; faces forming up, and it is the reason not one musket on '
        + 'either side is worth anything this morning.',
      grants: 'obs.a4.sleet',
    },
  ];

  if (!after) {
    return [
      ...common,
      {
        id: 'hessians-forming',
        label: 'the Hessians, turning out',
        x: 31, z: 18,
        examine:
          'Under arms, in the street, forming by companies with their officers in front of them, '
          + 'in matching blue coats with brass caps, and every barrel has a bayonet on it. They '
          + 'are not asleep. They are not drunk. They have been on alert for a week and they are '
          + 'doing exactly what they were trained to do.',
        grants: 'obs.a4.hessians_forming',
      },
      {
        id: 'the-guns-street',
        label: 'the guns at the head of the street',
        x: 31, z: 39,
        examine:
          'Two of them, unlimbered across the top of King Street, firing straight down it. Both '
          + 'came from Ticonderoga on an ox sledge eleven months ago. This is what the whole of '
          + 'that journey was for and it takes about six minutes.',
        grants: 'obs.a4.guns_street',
      },
      {
        id: 'queen-street',
        label: 'Queen Street',
        x: 48, z: 26,
        examine:
          'Running parallel to King Street and down to the same bridge. Sullivan is at the head of '
          + 'it and both columns came in within four minutes of each other after nine miles on '
          + 'separate roads, which nobody planned and nobody could have.',
        grants: 'obs.a4.queen_street',
      },
      {
        id: 'the-houses',
        label: 'the houses',
        x: 20, z: 24,
        examine:
          'About a hundred of them, and the brigade was quartered in them last night. There are '
          + 'people at the upstairs windows watching two armies fight in the street they live in, '
          + 'and nobody has asked them anything about any of it.',
        grants: 'obs.a4.houses',
      },
      {
        id: 'the-column',
        label: 'the head of the column',
        x: 34, z: T_HEAD - 4,
        examine:
          'Nine miles in four hours in sleet and they came in at a trot at the end of it. Two men '
          + 'are not here who set out, and they are back on the road between Birmingham and the '
          + 'ferry, and they froze.',
        grants: 'obs.a4.column',
      },
      {
        id: 'rall-quarters',
        label: "the colonel's quarters",
        x: 42, z: 30,
        examine:
          'Stacey Potts&rsquo; house, where Rall was billeted, and where a story says a Loyalist '
          + 'farmer&rsquo;s warning was handed in and not read. Nobody wrote that down at the time. '
          + 'What is documented is that he doubled the guard on the twenty-fourth.',
        document: 'DOC-A4.5',
        contradicts: {
          heard: 'heard.a4.knox_fight',
          line:
            'Knox has just told you they cannot form in a street with round shot coming up it and '
            + 'that they know they cannot. They are forming anyway, in the sleet, under fire, by '
            + 'companies, with their officers in front of them. Whatever this is, it is not a '
            + 'garrison that was asleep.',
          grants: 'obs.a4.forming_contradiction',
          note: 'Knox says they cannot form under the guns — they are forming',
        },
      },
      {
        id: 'hessian-guns',
        label: 'two brass field pieces',
        x: 29, z: 16,
        examine:
          'Rall&rsquo;s own guns, run out into King Street and served long enough to fire a handful '
          + 'of rounds up it before a rush of Virginians took them at the muzzle. A lieutenant of '
          + 'that party is carried off with a ball through his shoulder. His name is Monroe, and a '
          + 'surgeon standing in the street keeps him alive.',
        grants: 'obs.a4.hessian_guns',
      },
      {
        id: 'the-bayonets',
        label: 'a stand of arms',
        x: 34, z: 21,
        examine:
          'Hessian muskets, grounded, and every one of them has a bayonet fixed. Perhaps a third '
          + 'of the muskets in your column will take one at all. The order that came down the road '
          + 'an hour ago was to use the bayonet, and it was given by a man who knew that.',
        grants: 'obs.a4.bayonets',
      },
    ];
  }

  return [
    ...common,
    {
      id: 'the-prisoners',
      label: 'the prisoners',
      x: 31, z: 24,
      examine:
        'Nine hundred and some, forming up in the sleet in a street they were quartered in last '
        + 'night. They are conscripts whose prince was paid about seven pounds a head for them and '
        + 'who have never seen a shilling of it.',
      grants: 'obs.a4.prisoners',
    },
    {
      id: 'cap-plate',
      label: 'a brass cap plate',
      x: 30, z: 26,
      examine:
        'Off a grenadier&rsquo;s mitre cap, ten inches of brass with a lion on it, worn shiny at '
        + 'the top edge where its owner polished it. It weighs about a pound and it is lying in '
        + 'the road.',
      document: 'DOC-A4.6',
    },
    {
      id: 'casualty-list',
      label: 'the return of killed and wounded',
      x: 35, z: 30,
      examine:
        'Four names. Two of them were frozen to death on the road from the ferry before a shot was '
        + 'fired, and they are written down as killed, which is correct. The other two were shot '
        + 'in the street, and one of them is a Virginia lieutenant of twenty who took a ball '
        + 'through both hands.',
      grants: 'obs.a4.casualties',
      contradicts: {
        heard: 'heard.a4.knox_after',
        line:
          'Knox has just given you the tactical account: two guns, forty-five minutes, six pieces '
          + 'and a thousand stand of arms taken. Both of those are true. Half the men on this '
          + 'sheet were killed by the weather before either army saw the other, and the weather is '
          + 'not in the tactical account at all.',
        grants: 'obs.a4.cost_contradiction',
        note: 'Knox counts guns and minutes — half the dead on the list never saw the enemy',
      },
    },
    {
      id: 'the-orchard',
      label: 'the orchard',
      x: 48, z: T_HEAD + 4,
      examine:
        'Bare apple trees behind the houses at the head of the town. Rall was hit here, twice, '
        + 'getting his regiments out the only way that was still open, and his men carried him '
        + 'back down to the church.',
      grants: 'obs.a4.orchard',
    },
    {
      id: 'methodist-church',
      label: 'the Methodist church',
      x: 47, z: 18,
      examine:
        'They have laid him on a bench inside. He will not see tomorrow. He asked that his people '
        + 'be treated well and was told that they would be, and that turned out to be true, which '
        + 'is not something anybody could have promised honestly at the time.',
      grants: 'obs.a4.church',
    },
    {
      id: 'the-report',
      label: 'a report begun',
      x: 27, z: 36,
      examine:
        'To the President of Congress, started on a drum head and not finished, because the army '
        + 'is going straight back over the river tonight with nine hundred prisoners and there is '
        + 'no time to write anything properly until Newtown.',
      document: 'DOC-A4.7',
    },
    {
      id: 'the-baggage',
      label: 'the Hessian baggage',
      x: 44, z: 22,
      examine:
        'Forty waggons of it, and the men are standing round it not quite touching it yet. There '
        + 'have been eleven general orders against plunder since August. The men know how many '
        + 'there have been and they also know how many times one has been enforced.',
      grants: 'obs.a4.baggage',
    },
    {
      id: 'the-thirty-first',
      label: 'a calendar on a wall',
      x: 22, z: 32,
      examine:
        'Chalked up in somebody&rsquo;s hall. The twenty-sixth of December, and five days after it '
        + 'the thirty-first, and on the thirty-first every enlistment in the army standing in this '
        + 'street runs out. This morning has not changed one word of that.',
      grants: 'obs.a4.still_expires',
    },
  ];
}
