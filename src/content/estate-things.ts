/**
 * What there is to look at on the estate.
 *
 * R3: every place contains at least one examinable object whose text
 * contradicts something a person in that place says, with neither marked as
 * true. There are two on this map — Lund's promise against his own account
 * book, and the Fairfax letter against what is said in the Quarter.
 *
 * The examine strings run 25-45 words. Longer than that and the student is
 * reading a label rather than looking at a thing.
 */

import type { Interactable } from '../types';

export function estateThings(): Interactable[] {
  return [
    /* --- the building site: the act's argument ------------------------ */
    {
      id: 'north-wing',
      label: 'the north end',
      x: 28, z: 36,
      examine:
        'The wing is framed and part sheathed and open to the weather. You can stand in the yard '
        + 'and see straight through your own house to the sky behind it.',
      grants: 'obs.a1.northwing',
    },
    {
      id: 'venetian',
      label: 'the great window',
      x: 30, z: 35,
      examine:
        'The frame for a Venetian window, three lights, standing in a wall that has no glass and no '
        + 'plaster. You drew it yourself. It will be twelve years before anyone eats a dinner under it.',
      grants: 'obs.a1.venetian',
    },
    {
      id: 'lime-pit',
      label: 'the lime pit',
      x: 20, z: 35,
      examine:
        'Oyster shell burnt on the place and slaked in the pit, and the crust on it is cracked and '
        + 'dry. Nobody has drawn from it in a week. The work has stopped and nobody has said so.',
      grants: 'obs.a1.limepit',
    },
    {
      id: 'timber',
      label: 'the stacked pine',
      x: 21, z: 34,
      examine:
        'Yellow pine, sawn and stickered to season, and it is the brightest thing on the estate. '
        + 'It came up the river on your own account and it is not paid for.',
      grants: 'obs.a1.scaffolding',
    },
    {
      id: 'accounts',
      label: "Lund's accounts",
      x: 24, z: 39,
      examine:
        'The account book, left on the tool chest with a stone on it. What the house has cost and '
        + 'what is owed on it, in his hand.',
      document: 'DOC-A1.4',
      contradicts: {
        heard: 'heard.a1.lund',
        line:
          'He has been paying the joiners out of his own wages since February. He did not mention '
          + 'that when he said he could hold the place.',
        grants: 'obs.a1.lund_pays',
        note: 'Lund said he could hold the estate — his own accounts say he is already paying for it',
      },
    },

    /* --- the forecourt ------------------------------------------------ */
    {
      id: 'chariot',
      label: 'the chariot',
      x: 46, z: 45,
      examine:
        'Packed for Philadelphia: both trunks, the field case, and the green paint newly touched. '
        + 'Whatever the Congress decides you are going. The question is what you are when you come back.',
    },
    {
      id: 'broadside',
      label: 'a Salem broadside',
      x: 44, z: 46,
      examine:
        'On top of the mail, still folded. Forty coffins cut along the head of it and a name in each. '
        + 'Three weeks old by the time it reached the Potomac.',
      document: 'DOC-A1.3',
    },
    {
      id: 'survey-chest',
      label: "the surveyor's chest",
      x: 42, z: 46,
      examine:
        'Chain, circumferenter, and the Ohio field books from when you were seventeen. You know that '
        + 'country better than any man in Virginia. Ground is a thing you can read.',
      grants: 'obs.a1.surveying',
    },
    {
      id: 'bowling-green',
      label: 'the bowling green',
      x: 39, z: 51,
      examine:
        'You laid it out yourself, and the serpentine walks either side of it, and you moved grown '
        + 'trees to stand where you wanted them. Nothing on this side of the house grew where it chose to.',
    },
    {
      id: 'gate',
      label: 'the west gate',
      x: 39, z: 59,
      examine:
        'The road runs from here to Alexandria, and from Alexandria to Philadelphia, and it is two '
        + 'days if the ferries are running. You are expected on the tenth.',
    },

    /* --- the east lawn and the river ---------------------------------- */
    {
      id: 'haha',
      label: 'the ha-ha wall',
      x: 40, z: 26,
      examine:
        'A wall sunk in a ditch so the cattle stay off the lawn without a fence interrupting the '
        + 'view. It is the most eighteenth-century object you own: the labour is hidden and the '
        + 'prospect is not.',
      grants: 'obs.a1.haha',
    },
    {
      id: 'river',
      label: 'the river below',
      x: 42, z: 20,
      examine:
        'The Potomac, near two miles across, with Maryland a low green line above it. The herring '
        + 'come up in April in numbers that beggar description. You will not be here to count them.',
      grants: 'obs.a1.river',
    },
    {
      id: 'nets',
      label: 'the shad nets',
      x: 37, z: 16,
      examine:
        'Hung to dry on the rack, mended in three places with a lighter twine. The fishery took a '
        + 'hundred thousand herring last season and it is the second-largest thing this estate does.',
    },
    {
      id: 'lading',
      label: 'a bill of lading',
      x: 39, z: 15,
      examine:
        'Flour, to the West Indies, in your own hand. Every entry on it assumes you will be here in '
        + 'the autumn to make the next one. The last is dated three weeks ago.',
      grants: 'doc.a1.ledger',
      contradicts: {
        heard: 'heard.a1.jenkins',
        line:
          'You stopped writing them the week the news came from Boston — before the uniform came '
          + 'down from the press, and before you said a word to anyone.',
        grants: 'obs.a1.ledger_stops',
        note: 'The ledger stops the week the Boston news came — you decided earlier than you have admitted',
      },
    },
    {
      id: 'uniform',
      label: 'the new uniform',
      x: 43, z: 12,
      examine:
        'Blue faced with buff, cut to your own specification, folded on the chest where the boat can '
        + 'take it. You have not said why you had it made. Neither has anyone asked.',
      grants: 'obs.a1.uniform',
    },

    /* --- the south ground --------------------------------------------- */
    {
      id: 'kitchen',
      label: 'the new kitchen',
      x: 55, z: 46,
      examine:
        'Going up this spring, and the servants’ hall opposite it. When the colonnades are built '
        + 'they will make one composition of the whole front. They are not built.',
    },
    {
      id: 'nelson',
      label: 'Nelson',
      x: 62, z: 42,
      examine:
        'Sound, shod, and already fed. Somebody was up before dawn seeing to that and it was not you. '
        + 'You run a hand down his foreleg and find nothing wrong, which you knew before you bent down.',
    },
    {
      id: 'smokehouse',
      label: 'the smokehouse',
      x: 50, z: 34,
      examine:
        'Brick, and full. Six hundred hogs killed here in a good year and the hams go to Philadelphia '
        + 'as presents, which is a cheaper kind of politics than most.',
    },

    /* --- THE QUARTER --------------------------------------------------- *
     * Nothing here grants a stat, opens a task, or rewards anybody. The
     * archaeology is furnished exactly: this is what was actually dug out of
     * the cellar of the House for Families.
     * ------------------------------------------------------------------ */
    {
      id: 'cellar',
      label: 'the root cellar',
      x: 11, z: 35,
      examine:
        'A hole dug under the floorboards and lined with brick. In it: colonoware, a white '
        + 'salt-glazed teabowl, a pewter spoon, a bone-handled knife, a clay pipe, and oyster shells. '
        + 'None of it was issued.',
      grants: 'obs.a1.cellar',
    },
    {
      id: 'pot',
      label: 'a cooking pot',
      x: 10, z: 38,
      examine:
        'Iron, three-legged, mended at the rim with a rivet somebody made. It is not on any inventory '
        + 'of this estate, which means it belongs to whoever mended it.',
      grants: 'obs.a1.pot',
    },
    {
      id: 'garden',
      label: 'a garden plot',
      x: 6, z: 38,
      examine:
        'Beans, squash, and something else coming up in rows. It is worked before the working day and '
        + 'after it. Whatever it grows is sold or eaten by the people who grew it.',
      grants: 'obs.a1.garden',
    },
    {
      id: 'invoice',
      label: 'a London invoice',
      x: 15, z: 37,
      examine:
        'Left on the trestle with the issue cloth. Osnaburg by the yard, out of London, on your '
        + 'account. The quantity is on it and so is the number of people it is meant to cover.',
      document: 'DOC-A1.5',
      contradicts: {
        heard: 'doc.a1.fairfax',
        line:
          'You wrote, last August, that submission to Parliament would make Virginians as tame and '
          + 'abject slaves as the blacks we rule over with such arrogant power. You wrote it in this '
          + 'house. Nobody here has said anything about liberty at all.',
        grants: 'obs.a1.quarter_contradiction',
        note: 'What you wrote to Bryan Fairfax, against what is said in this yard',
      },
    },
    {
      id: 'fiddle',
      label: 'a fiddle',
      x: 13, z: 31,
      examine:
        'Hung on a peg inside the door, out of the damp. Gourd body, a carved neck, four strings and '
        + 'a horsehair bow. Somebody made it here and somebody plays it here.',
      grants: 'obs.a1.fiddle',
    },
  ];
}
