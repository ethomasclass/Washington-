# Where this is, as of the last session

Read this first. It is the handoff, not the design — the design is in `docs/`.

**Branch: `claude/hd-2d-game-approach-gwi5on`.** The 19 August rebuild lives
here. `main` still carries the old print-direction build; nothing on this branch
has been merged into it.

**Acts 1 through 5 are playable, end to end, and they run into each other.**
Act 1 closes on the boat at the landing, Act 2 opens on the common at Cambridge,
Act 3 opens behind the Brooklyn line, Act 4 opens on the road down to
McKonkey's Ferry, Act 5 opens on a bare plateau above the Schuylkill — and there
is no menu anywhere between them. Twenty-two maps.

**And it plays on a phone.** See *The thumb pad*, below.

---

## ACT 5 AND THE THUMB PAD — 21 August 2026

### Play it on a phone

`engine/touch.ts` is the whole of it, and it rests on one idea: **a finger
presses keys.** Every button on the pad dispatches a real `KeyboardEvent` at
`window`, so it arrives at the same listeners a keyboard's would, in the same
order, with the `stopImmediatePropagation()` fight between the modal panel and
the world already settled the way it was settled months ago. Nothing else in the
game needed changing and nothing else can tell the difference.

**The stick is the one exception** and writes an analogue vector straight into
`input.ts` through `setTouchAxis`, because a key is on or off and a thumb is
neither. It floats: put a thumb down anywhere in the lower-left and the stick
appears under it. A stick painted in one place is a stick you have to look at.

**Tap to continue** is one capture-phase listener that turns any tap not already
on something interactive into `Space`, but only while a panel is open — which
covers dialogue, narration, documents, notices, the reckoning and the letterbook
in one rule. It tells a tap from a drag by distance and duration, because without
that the first drag of a long document dismissed it instead of scrolling it.

`?touch=1` forces the pad on any machine, which is how you check the layout
without a phone in your hand.

Four things that had to change in the interface itself:

- **`#say > * { flex: 0 0 auto }`.** `#text` carries a min-height so a one-line
  answer does not make the panel jump, and a flex child's default shrink read
  that as permission to squeeze it *to* that height when the column is capped.
  Four lines of prompt rendered inside three lines of box and overflowed straight
  through the Council underneath, one sentence written over another.
- **The portrait goes at phone widths.** At 108px it is a third of the screen and
  the text it leaves room for is four words wide.
- **The rail, banner and reach hint hide** behind an open panel and behind the
  survey, because a clipped half-sentence under a conversation is not information.
- **The glass carries 30 tiles instead of 46 on a narrow frame**, and labels are
  clamped into it on both axes. Eight names across a mile of water is a legible
  survey at 1280 and a wall of text at 390.

### What is playable in Act 5

**One camp, three times, plus two interiors.**

| map | what it is |
|---|---|
| `VF-CAMP` | 78×66, 19 December 1777. A brigade street with nothing on it: the huts pegged out and three courses up, the hillside behind it cut over, and eleven thousand men in the open. |
| `VF-CAMP-M` | The same ground in March. Two thousand huts finished, in ranks, and a hundred men on the Grand Parade with a Prussian in front of them. |
| `VF-CAMP-S` | The same ground on 6 May. Green, and the whole line on the parade for the *feu de joie*. |
| `VF-POTTS` / `VF-POTTS-M` | The Isaac Potts house: two rooms and a passage, stone, board floors, and no floorcloth anywhere in it. |
| `VF-HOSPITAL` | One hut. Fourteen by sixteen, one window-hole, three tiers of berths, twelve men. |

Four decisions (`A5-D1` the inoculation, `A5-D2` **sealed** — the Cabal,
`A5-D3` von Steuben's method, `A5-D4` the Committee at Camp), seven documents,
thirteen speaking characters, the Northern Department map table, and the act ends
walking down a street the player first saw as mud.

### The act's argument is a specification, not a blizzard

Everything a student has been told about Valley Forge is a picture of suffering.
What the record shows is a **construction project**: the hutting order of 18
December 1777 gave the dimensions — fourteen by sixteen, six and a half to the
eaves, door to the street, fireplace at the rear, gaps daubed eighteen inches —
and offered twelve dollars to the first squad in each regiment to build one to
it. Squads that got it wrong pulled theirs down. Two thousand huts in six weeks,
on a grid, by an army with no nails.

So the map is a grid and the huts are identical, because they were. The hutting
order is the first thing on the map you can pick up.

**There is no snow on most of this ground and that is not an oversight.** The
winter was mild by the standards of that decade. What killed two thousand men was
typhus, typhoid, dysentery and smallpox in a camp of eleven thousand with no
drains, and most of them died in *April and May*. A picturesque blizzard would be
a comfortable lie.

### `A5-D2` and a document that does not exist

The Conway letter is the best epistemological object in the game. Everybody knows
the sentence — *"a weak General and bad Counsellors would have ruined it"* — and
it survives because Wilkinson, drinking at Reading, repeated to another officer
what he said he had read. That officer told Stirling; Stirling wrote to
Washington. The letter was never produced by anybody, and Gates's account of what
happened to it changed twice.

`DOC-A5.3`'s register is `secretary` and its body is one hand quoting another
quoting a third. **The typography is the teaching.** The historical option — send
Conway the sentence, one line, no comment — is knowledge-locked on having read
it, because you cannot send a man his own reported words if you have not read
them.

### What went wrong building it, in the order it was found

- **The camp came out as a night scene.** `forgeDecember` was built with a dark
  fill on the theory that the worst winter of the war ought to be a dark frame.
  An overcast December day is *flat*, not dark, and is in fact very bright. With
  a dark fill and a contrast of 0.30 every surface was dragged three-quarters of
  the way to the fill and the huts the act is about could not be seen at all. The
  misery is carried by the saturation — the lowest of any daylight scene in the
  game — and by what is standing in the frame.
- **The player spawned at the wrong end.** Up-screen is toward the felled
  hillside, so the huts have to be *between* the player and it. The establishing
  shot of the act was a bare hill with two sawhorses on it.
- **The street was 110 feet wide**, which pushed both ranks off the sides of the
  frame. It is eight tiles now, with four huts a side per row at a six-tile
  interval.
- **The December frame was still empty**, because on 19 December almost nothing
  was standing. What fills it is the *work* — timber where it fell, sawhorses in
  the road, stumps, chips, a fire every forty feet.
- **Four buildings were sitting inside huts.** The flood fill found every one in a
  single run. `V_BAND_W` / `V_BAND_E` and the comment above them exist so it does
  not happen again.
- **The Potts house came out with red tiled floors** — `'k'` in the New England
  legend is the kitchen floor. It is `'b'`, board, in every room, and the absence
  of any floorcloth is the point.

### The third map table

`ui/northern.ts` — the Northern Department, and the only table about a battle the
player was not at. Three sheets: which of the three armies actually reached
Albany (one), where the seventh of October was decided (not where Gates was), and
what the alliance meant materially. Then Gates's despatch and Arnold's account of
the same afternoon, side by side, disagreeing.

**The Arnold seed is why it is here.** When he turns in 1780 the student will
already have read a despatch about a battle he won that does not contain his
name. The game never excuses him and never has to.

The linter's map-table bound went from two kinds to three, with the reasoning
recorded in `passport.test.ts` rather than in a commit message nobody will read.

---

## ACTS 3 AND 4 — BROOKLYN AND THE DELAWARE — 21 August 2026

### What is playable

**Act 3, as two adjoining maps and a house.**

| map | what it is |
|---|---|
| `BK-LINES` | 80×56, 26 August 1776. The Brooklyn works, the parapet over the Flatbush plain, the Gowanus marsh and the mill dam, the camp behind, and the road going east to the pass nobody is watching. |
| `BK-FERRY` / `BK-FERRY-N` | 70×54, 29 August, day and night. The road down off the Heights, the ferry yard, and the same yard again in the dark with nine thousand men going through it and nobody speaking. |
| `BK-HOUSE` | Four Chimneys: the room the council of war sat in, with the rain coming under the door. |

**Act 3 is two maps and not one, and that is a rule now.** The line faces
south-east at the enemy; the ferry faces north-west at the river. A map has
exactly one up-screen direction, so a single map cannot hold both views — you
would be standing on the parapet looking at the back of the army. Any act whose
two halves face opposite ways is two maps.

Three decisions (`A3-D1` **sealed** — hold the city or burn it, `A3-D2` when to
call Mifflin off the empty works, `A3-D3` Hale), seven documents, fourteen
speaking characters, the East River wind rose, and the act ends in the fog on
the last boat.

**Act 4, as a river bank in two states and a street in two states.**

| map | what it is |
|---|---|
| `DL-BANK` / `DL-BANK-N` | 72×54, 25 December 1776, afternoon and night. The worst camp in the game, the ferry road, the landing, and the Durham boats going out into running ice. |
| `TR-STREET` / `TR-STREET-A` | 64×58, the morning of the 26th, during and after. King Street downhill to the barracks and the Assunpink bridge, with the guns at the head of it. |

Three decisions (`A4-D1` the enlistments that expire in six days, `A4-D2`
**sealed** — three hours behind, nine miles to go, sunrise at seven, `A4-D3`
what becomes of nine hundred prisoners), seven documents, seventeen speaking
characters, and the act ends in the orchard with the enlistments still expiring.

### `A4-D1`'s appeal is conditional on what you have been

The bounty appeal — standing in front of men whose enlistments run out on
Thursday and asking them to stay — reads differently depending on
`stats.loyalty`. Below `A4_APPEAL_FLOOR` the same option is spliced with
`A4_D1_APPEAL_COLD` and the men hear a general they have no reason to trust.
It is the only place in the game where an option's *text and outcome* change
under a stat rather than its availability, and it is deliberate: the historical
appeal worked because of who was making it, and a player who has spent four acts
being expedient should not get the same result from the same words.

### The four things Acts 3 and 4 added to the engine

**1. `Light.exposure`, and the grade moved in front of the bloom.** A night frame
is not a day frame with a dark fill; it is the same frame exposed three stops
down with the lanterns left where they are. `exposure` drives the composite gain,
tinted a hair cool. The grade used to run *after* the bloom was added, which
crushed every lantern in the frame back to nothing — it runs before it now, and
that reordering is most of why the ferry at night reads at all.

**2. `PropDef.glow`.** A prop that is its own light source is drawn at full
brightness with a warm bias and the map light does not dim it, so it clears the
bloom threshold on its own and throws a halo. Ship lanterns, cook fires and camp
kettles carry it. This is what lets a night light have a *cold* key: the warmth
belongs to the lanterns and they carry it themselves. `delawareNight` learned
that the hard way — a warm key over snow and river ice came out olive, and the
Delaware read as a field of pond scum for an afternoon.

**3. `hessianFile`, and why Act 4 needed it.** The whole argument of Trenton is
that the garrison was *not* asleep: it turned out under arms and formed by
companies in the street while round shot came down it. The text said so in six
places and the street was empty, so a player stood at the head of King Street,
saw two guns and a well, and concluded the story about the drunk Hessians was
true after all. Five men shoulder to shoulder, deliberately not individuated,
with a bayonet over every cap — because a third of the muskets in the American
column would not take one, and that difference is the argument.

**4. `ragged` on the elevation grid.** Every terrace here is a full-width
rectangle, and a full-width rectangle of elevation draws a riser that runs from
one edge of the map to the other in a dead straight line. Props hide it in a
camp; on an open snow road it reads as a drawing error. `ragged` only converts
cells already on a boundary, so the terraces keep their heights and lose their
straight edges — work downward from the high ground.

### Two cuts worth knowing about

**Sarah Osborn is not in Acts 2 or 3**, though `docs/05` lists her at both. She
was not with the army until about 1780. The cut is recorded in both cast files
so nobody re-adds her from the design doc.

**`ledger.ts`'s Act 2, 3 and 4 figures are unverified and marked so**, which is
blocking for classroom use per `08` §10.

---

## ACT 2 — CAMBRIDGE AND THE LINES BEFORE BOSTON — 20 August 2026

**The art direction changed and the engine changed under it.** `docs/11-the-lit-diorama.md`
is the medium spec and it supersedes `09` and `10` entirely, and `02` §1/§3/§4.

**The world is a lit diorama.** Pixel figures, 32×48, four directions, standing in
a small three-dimensional place under one raking light, seen through a long lens
at a fixed 36° pitch, with tilt-shift, bloom, vignette and a grade over the top.
The reference is Octopath Traveler and the Dragon Quest III remake. **The archive
stays print**: documents, the letterbook and the four typographic registers keep
the engraved language, because that is where the pedagogy actually lives.

**Nothing ships as an image.** Every sprite, tile, facade, roof and portrait is
drawn procedurally into a canvas at boot. That is Salem's pipeline
(`ethomasclass/salem-witch-experience-`), inherited and scaled up, and it is why
this direction is affordable: art costs lines, not megabytes, and
`npm run build:single` is still one file for a USB stick.

### What is playable

**Act 1 entire, as one continuous estate plus two floors of the house.**

| map | what it is |
|---|---|
| `MV-ESTATE` | 76×62. The west gate, the bowling green, the forecourt, the building site, the north lane, the Quarter, the east lawn, the ha-ha, the landing. No scene breaks anywhere in it. |
| `MV-HOUSE-1` | The ground floor: passage, two parlours, chamber, dining room, the new study, and the open shell of the north wing. |
| `MV-HOUSE-2` | The chambers, over the study. |

Five decisions (`A1-D0` warm-up, `A1-D1` Martha, `A1-D2` Lund, `A1-D3` the
answer to Philadelphia, `A1-D4` **sealed** — the uniform, at the landing), seven
documents, eleven speaking characters, and the act ends on the boat.

**Act 2 entire, as one continuous camp in two seasons plus a headquarters.**

| map | what it is |
|---|---|
| `CB-CAMP` | 86×70, July–November. The camp street, the lane to headquarters, the covered way up to the works, and half a mile of parapet over the water. No scene breaks anywhere in it. |
| `CB-HQ` / `CB-HQ-UP` | The Vassall House: council room, the general's office with the map table, the secretaries' room, the dining room, and four chambers over them. |
| `CB-CAMP-W` | The same 86×70, December. Snow, slush, bare elms, log huts where the brush shelters were, four gaps in a rank of nine tents, and the Grand Union on the staff. |
| `CB-HQ-W` / `CB-HQ-UP-W` | The same house in December. Knox's chair is empty and Martha is upstairs. |

Four decisions (`A2-D1` the powder, `A2-D2` **sealed** — the council of war,
`A2-D3` the enlistment of Black soldiers, `A2-D4` the enlistments), seven
documents, sixteen speaking characters, the Knox logistics sequence, and the act
ends on the parapet on the first of January.

### The Vassall House is not Mount Vernon, and had to be made not to

The first build of Cambridge used the Virginia interior legend, the Virginia
wall style and the Virginia furniture, and it came out looking like the Mount
Vernon parlour with different people standing in it — which is a claim about
the eighteenth century that is simply false. A Potomac planter sat on
upholstered mahogany from London under fielded panelling; a Cambridge merchant
sat on turned maple made forty miles away under imported printed paper.

Four levers, all of them period rather than decorative, and all of them
available to any future interior:

| lever | Virginia | New England |
|---|---|---|
| `wallStyle` | `panelled` — fielded panels, dado, chair rail | `papered` — a printed lozenge repeat with a printed border where a cornice would be, and visible roll seams |
| `wallTint` | plaster | `#8FA79C`, a blue-green ground |
| legend | `INDOOR_LEGEND`: wide pine, ochre floorcloth, wine carpet | `NE_INDOOR_LEGEND`: narrow dark oak, black-and-white diamond floorcloth imitating marble, blue-green carpet |
| seats | side chairs and armchairs, wine upholstery | ladder-backs, green Windsors, one wing chair |
| hearth | `mantel` — carved chimneypiece, overmantel panel | `chimneyNE` — plain bolection surround, deep opening, iron fireback |

**Different forms, not recolours.** A red chair painted green is still a red
chair; a ladder-back has a different silhouette at thirty pixels. `wallTint`
had existed on `MapDef` since the interiors were written and nothing had ever
read it — one line in `build.ts` was most of the fix.

Also new: `boarded` (feather-edged sheathing, for a plain room — the chambers
upstairs, and every barracks and farmhouse from here on).

### The three things Act 2 added to the engine

**1. Seasons, as one map function in two states.** `cambridge('summer')` and
`cambridge('winter')` are the same function. Ground layout, buildings, paths and
every coordinate are identical; what changes is the tile a surface is painted
with, the light, the trees and who is standing in the street. The linter asserts
the two agree row for row and share an elevation layer, because the whole point
is that it is the same place four months later and half the men are gone.

**The season is reached through a door.** You go into headquarters in the autumn,
the council of war settles what the army will do about Boston, and you come out
into December. `Portal.alt` carries it and `A2-D2` sets the flag on every branch,
so the winter cannot be dodged and nothing announces it.

**2. The surveyor's overlay (`engine/overlay.ts`).** Hold SHIFT on any exterior
and the ground is read the way the man in it would read it: contours off the
elevation grid, sightlines to the marks that are visible and broken lines to the
ones that are not, and ranges in feet and chains. He was a surveyor for
twenty-seven years before he was a general and no other game about him has ever
given the player that. It is held, never toggled, it never consumes a key, and
**Act 1 gets it retroactively** — `ESTATE.marks` is eight lines of content.

It is also how the seven British positions across the water are learned: stand
on the parapet, hold the key, and the glass names them with the range to each.
The old build made that seven separate interactables pressed at the same spot.

**3. The map table (`ui/survey.ts`).** The only object in the game that opens a
screen of its own: a drawn survey of the country between Ticonderoga and
Cambridge, with a token you move by keyboard. Four decisions — the teams, the
route, the load, the money — and five dispatches, resolving to
`guns ∈ {23, 38, 51, 59}` and `days late ∈ {0, 9, 17, 26}`.

**Fifty-nine guns and not a day late is reachable and it is not the obvious
path.** Leaving the heavy mortars looks prudent and costs you the only guns that
could reach the shipping; haggling over the teams looks responsible and costs a
fortnight. The one that lands it needs `doc.a2.knox` — you have to have read
Knox's own account to know that Schuyler had been paying for this out of his own
pocket. That inversion is the teaching, and it is why it is a screen and not a
paragraph.

### Act 2's fixed loss (R20)

**There is no powder.** Thirty-six barrels, not the three hundred and eight the
Committee of Safety reported — about nine cartridges a man and no reserve at all.
No option anywhere on any branch produces a barrel, because none was available to
the historical man; every branch of `A2-D1` is a decision about *who is told*.
The linter asserts that nothing in the game conjures powder.

### `A2-D3` carries a binding production note, and the linter enforces it

Four clauses, asserted rather than trusted, at the head of
`content/act2-decisions.ts`:

1. **No voice argues it on moral grounds**, because none did in that room. The
   council of 8 October voted it down unanimously; the reversal of 30 December
   was argued on manpower and on Dunmore.
2. **Three voices, not five.** Temper and Vanity have nothing to say and their
   silence is the design.
3. **Personal Character does not move on any branch.** No branch is a moral
   improvement, because none of them was.
4. **The player can never choose to exclude.** The bar is already in force when
   they arrive — taught as narration and as `DOC-A2.7` — and their only agency is
   in ending it, formalising it, or handing it to Congress.

`npm test` fails if a future edit breaks any of the four.

### The one historical fact this build is built around

**In May 1775 Mount Vernon is a building site, and that is documented.** The
south wing — the study — was finished this year. The north wing was begun about
now and its interior will not be done until c.1787. The kitchen and the
servants' hall are both going up in 1775 and the colonnades that will tie them
to the house do not exist. No piazza (1777), no cupola (1778).

So the largest object on the map is an unfinished house you can walk into, and
Act 1's fixed loss — *he will not see it finished* — is geometry rather than a
line of dialogue. `northWing` is `style: 'frameOpen'`, `roof: 'none'`,
`passable: true`: studs with transparent gaps, and you can stand inside it.

### The Witness Register survived the pivot

`MV-03` used to be a separate scene. The world is continuous now, so the Quarter
is a **zone** carrying its own `Light`. Walk north past the timber and over about
eight paces the bloom goes to zero, saturation falls to a sixth, the warmth
leaves the key and the camera comes in from thirty units to twenty-two. The only
colour left is what people own — a neckerchief, a copper ring, a blue bead.

Nothing announces it. **The prettiness of this style stops at that gate and the
stopping is the argument.** `npm test` asserts all of it, including that nobody
in that yard has a decision, a task or a reward attached to them.

### Run it

```
npm install && npm run dev      # the game
npm test                        # the linter — must be green before any commit
npm run build                   # tsc + vite
npm run build:single            # dist-single/washington.html, one file, no assets
```

`/sprites.html` is the contact sheet: every figure, every facing, every frame of
the walk, the whole prop library, every ground tile and every wall style at 2–4×.
**Judge the drawing there before judging it in the frame.**

**`F1` opens the travel panel.** Eighty-six named places across all five acts —
the Quarter, the burying ground, the council room, the parapet on the first of
January, the landing in the dark, the head of King Street, the Grand Parade —
in thirteen groups, with a dot against every destination on the map you are
currently standing in. Up/down to choose, left/right to jump a whole act,
Enter to go, Escape to stay. It opens over anything, including mid-conversation,
and lands you at a position rather than at the map's spawn.

Destinations are content, in `ui/travel.ts`, and `npm test` checks every one of
them the way it checks a portal: the map exists, the tile exists, it is not
inside a wall, and it is connected to the rest of the map. A build tool that
lands you inside a wall costs more time than it saves. It caught three the day
it was written — a barrel at the landing, the round table in the west parlour, a
chair in the council room — and two more on King Street since, and it is the
reason the panel cannot rot as the maps change.

It stops every key it sees with `stopImmediatePropagation()` while it is open,
because `stopPropagation()` does nothing at all to a sibling listener on the same
`window` node — that is the bug that made Space-to-dismiss also queue an interact
and restart every conversation you tried to leave.

`` ` `` or F2 still cycles the map list, which is one key and sometimes one key
is what you want. In the browser console, `__game.warp(x, z)` and
`__game.go('MV-HOUSE-1', x, z)`.

---

## The three ideas the code is built on

**1. The map is painted, not typed.** The estate is 4,712 tiles across two
layers. Typed as aligned ASCII it shears the first time anyone inserts a
character, so `content/paint.ts` has `rect`, `path`, `ellipse`, `ring` and
`ragged`, and the ASCII is generated. **Do not hand-edit a generated layer.**

**2. Collision is a pure function, and the linter walks the map.** `engine/collision.ts`
takes a `MapDef` and nothing else. `npm test` floods every map from its spawn and
asserts that every person, object and door is reachable. This exists because the
servants' hall was placed across the north lane and sealed the Quarter off from
the rest of the estate, and the build was green and the types were clean and
nothing said a word.

**3. Every texture through `quad()` is uploaded with `flipY = false`.** `quad()`
gives the top pair of vertices the smaller V, which lines up with canvas row 0
only when the flip is off. With three.js's default on, the tile atlas samples
bottom-up and the lawn comes out as the carpet from eighteen rows further down.
Character sheets are the exception and keep the default flip, because their
geometry is wound the other way. If a texture ever renders as the wrong thing
entirely rather than as a wrong colour, this is why.

## Two lies the renderer tells on purpose

- **Shadows fall down-screen and to the right whatever the sun is doing.** The
  sun azimuth is chosen to light the walls the camera can see, which puts it
  behind the viewer, which would throw every shadow where nobody can see it.
- **The tilt-shift blurs by distance from a horizontal band, not by depth.** A
  real circle of confusion needs the depth buffer and a scatter. At a fixed
  camera pitch the band and the depth agree closely enough that nobody notices.

## The wall rule that makes interiors work

A wall with floor on the *near* side of it is a back wall and draws full height.
A wall with floor only on the far side is between the eye and the room, and is
cut down to a sill. That is the whole trick behind a top-down interior you can
see into, and it is why this game does not need a camera it does not have.

---

## Open decisions, in the order they will bite

1. **`docs/05-act-scene-inventory.md` is now out of step with the build.** It
   describes Act 1 as four separate scenes, `MV-01` to `MV-04`, and numbers the
   decisions `D1`–`D3`. The build has one continuous estate, two interiors and
   `D0`–`D4`. The *content* is the same content; the structure is not. `05`
   should be revised act by act as each act is rebuilt, not all at once.

2. **Acts 6–8 do not exist in the new engine.** `content/` is Acts 1 through 5.
   The engine is act-agnostic; the rest is not written. Every act so far has
   wanted the same shape — a continuous place, an interior, one instrument, one
   fixed loss — and two rules have been added to it since: **an act whose two
   halves face opposite ways is two maps, not one** (Act 3), because a map has
   exactly one up-screen direction; and **an act that spans a season builds one
   map function in N states and never a second map** (Acts 2 and 5). Act 6 is
   Yorktown, and `docs/05` §6 says the enslaved-people thread arrives at its
   worst and truest moment there.

3. **The Witness Register is still behind a review gate, and it is larger
   again.** Frank Lee, Doll and Harry at Mount Vernon; **William Lee in the
   field** in Acts 2, 3, 4 and 5; Salem Poor at Cambridge; the Black
   Marbleheader at the ferry; the Black Continental on the Delaware; **the
   soldier of the 1st Rhode Island at Valley Forge**; the Quarter notice; and
   the whole of `A2-D3` and `DOC-A2.7`. All carry `sensitive: true` or the R5
   marking and the §7.6 named pedagogical sign-off **has not been given**. It is
   drafted. It is not approved. Budget the review before budgeting anything else.

   The Rhode Island man carries a fact the register was written for: the 1st
   Rhode Island's reorganisation in February 1778 was the **exception**, and
   most Black soldiers in this army served in ordinary integrated regiments, a
   few to a company, across the whole line. A student who leaves with only the
   regiment leaves believing Black service was segregated and unusual. He says
   so himself, in the third of his three lines, and it is the only place in the
   act where a character corrects the history rather than living in it.

4. **`V-A2.1` — Amos Doolittle is a documented compression, and it is not
   resolved.** He marched to Cambridge after Lexington and published the four
   engravings in December 1775. That he was on the lines in the autumn is a
   compression, recorded at the head of `content/act2-people.ts`. Either date it,
   cut him, or find the evidence.

5. **`ledger.ts`'s Act 2, 3, 4 and 5 figures are unverified and marked so.**
   Act 2's opening strength is `CB-01`'s sourced return of 3 July 1775;
   everything under it, and everything in Acts 3 to 5, is of the documented
   order but no line has been checked against a primary source, and `08` §10
   makes that blocking for classroom use. This is the largest single piece of
   unfinished work in the build.

   Act 5 makes it worse in one specific way worth flagging: `A5-D1`'s ledger
   lines assert that inoculation saved about eleven hundred men and killed
   forty-seven. Both are plausible against the mortality ratios and **neither is
   sourced**. Of everything in this file, that is the pair a historian would
   object to first.

6. **The passport code still has headroom and the rule has not changed.**
   `FLAG_REGISTRY` and `PASSPORT_FLAGS` are **append-only**; reordering either
   invalidates every save code in every classroom. Acts 3 and 4 appended only —
   including eight flags added after the fact when Act 4's contradiction objects
   were written, which is exactly the case the rule exists for. A dead flag
   costs one bit; a renumbering costs somebody's lesson.

7. **Never let generated art produce readable text.** Still true, and now easier
   to break: `props.ts` draws books, papers and a globe. None of them carry
   letters and none of them should. All period type renders in-engine.

## The camera arithmetic every slope obeys

Screen-up is `dy * cos(pitch) - dz * sin(pitch)`, and at `CAM_PITCH` 0.63 that is
`0.808 dy + 0.589 dz`. One row further from the camera lifts a tile 0.589 up the
screen; one elevation step (0.42) drops it 0.339.

**So a slope that falls more than 1.74 steps per row is invisible** — it draws in
the same place as the row in front of it. The parapet's forward glacis fell two
steps a row on the first attempt and could not be seen at all; it is flat now,
one step below the crest and four rows deep, and the bank finally reads as a bank
rather than as gabions standing in the sea. That number governs every slope in
this game.

## Known rough edges

- Gable roofs on the small outbuildings read as one grey slab from close up;
  the ridge needs a drawn board rather than only a value change.
- The sloop's rigging is three lines and reads thin at the landing.
- The chariot's body sits high above its wheels.
- The east lawn is large and under-furnished between the ha-ha and the river.
- Interior side walls eat a lot of frame in the narrower rooms.
- No music. `engine/audio.ts` is effects only, and R14 still stands: fife and
  drum are diegetic or they do not happen.
- Charlestown across the water is nineteen chimney stacks and four low walls, and
  it is 233 unreachable tiles. That is deliberate — the linter asserts you
  *cannot* walk to it — but it means the flood-fill ratio on both Cambridge maps
  sits at about 94% rather than 100%.
- The winter tiles still show a faint orthogonal staircase where slush meets
  snow. Two light `ragged` passes helped; a proper two-tile transition set would
  help more.
- The Vassall House's council room is furnished around two guaranteed-clear
  aisles (column 7 and row 11) because it sealed itself twice. Any new furniture
  in that room goes against those, not across them.
- **Fog is measured from the camera, which sits 30.5 units back.** A `fogNear`
  under about 31 hazes the player himself. The Brooklyn ferry at night was built
  with `fogNear: 8` and came out an even black with a grey figure in the middle
  of it; it is 33/56 now. Anything below 31 is a bug, not a mood.
- The Gowanus marsh and the Delaware's ice cost both those maps their flood-fill
  ratio the same way Charlestown costs Cambridge — about 92% on `BK-FERRY` and
  `DL-BANK`. The linter asserts the water is *not* walkable, so the gap is the
  point.
- `TR-STREET` after the fight reads almost identically to `TR-STREET` during it
  with the ranks removed. The emptiness is the story, but a distinct prisoner
  sprite — capless, unarmed, and not the `hessianFile` — would carry it better.
- The road up from Newtown on `DL-BANK` is a large empty field of snow with a
  milestone in it. Period-correct, and still a lot of nothing.
- **`VF-CAMP`'s camera only holds about 24 tiles across**, which is the street
  plus one hut a side. The ranks recede correctly up-screen but a player never
  sees more than two huts abreast, and the grid reads better in the wide
  screenshots than it does while walking. A wider `CAM_DIST` on this map alone
  would fix it and would make every other map on the same setting look wrong.
- The hospital hut's floor is 16×12 tiles, which at this game's loose tile scale
  is generous for a room the text insists is fourteen feet by sixteen. It reads
  cramped, which is what matters, but the arithmetic does not survive being
  checked.
- `continentalFile` and `hessianFile` are the only crowds in the game and they
  are props, so they do not move, do not turn, and cannot be spoken to. On the
  Grand Parade in March that is exactly right. On the parade in May, where
  eleven thousand men are supposed to be firing a running volley, fourteen
  static files and the fog are doing a lot of work.
- **Act 5 has no ambient winter sound and no drum.** R14 still stands — fife and
  drum are diegetic or they do not happen — and the *feu de joie* is the one
  event in this game that is a sound before it is a picture.
- `docs/05-act-scene-inventory.md` is now out of step for Act 2 as well as Act 1:
  it describes `A2-S1` to `A2-S5` as five separate scenes.
