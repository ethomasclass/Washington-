# Where this is, as of the last session

Read this first. It is the handoff, not the design — the design is in `docs/`.

**Branch: `claude/hd-2d-game-approach-gwi5on`.** The 19 August rebuild lives
here. `main` still carries the old print-direction build; nothing on this branch
has been merged into it.

**Acts 1 and 2 are both playable, end to end, and they run into each other.**
Act 1 closes on the boat at the landing and Act 2 opens on the common at
Cambridge without a menu in between.

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

**`F1` opens the travel panel.** Thirty-five named places across both acts —
the Quarter, the burying ground, the council room, the parapet on the first of
January — grouped by act, with a dot against every destination on the map you
are currently standing in. Up/down to choose, left/right to jump a whole act,
Enter to go, Escape to stay. It opens over anything, including mid-conversation,
and lands you at a position rather than at the map's spawn.

Destinations are content, in `ui/travel.ts`, and `npm test` checks every one of
them the way it checks a portal: the map exists, the tile exists, it is not
inside a wall, and it is connected to the rest of the map. A build tool that
lands you inside a wall costs more time than it saves.

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

2. **Acts 3–8 do not exist in the new engine.** `content/` is Acts 1 and 2. The
   engine is act-agnostic; the rest of the content is not written. Act 3 is
   New York, and on the evidence of this act it wants the same shape: one
   continuous place, one interior, one instrument, one fixed loss.

3. **The Witness Register is still behind a review gate, and it is now larger.**
   Frank Lee, Doll and Harry at Mount Vernon; **William Lee in the field and
   Salem Poor in the camp** at Cambridge; the Quarter notice; and the whole of
   `A2-D3` and `DOC-A2.7`. All carry `sensitive: true` or the R5 marking and the
   §7.6 named pedagogical sign-off **has not been given**. It is drafted. It is
   not approved. Budget the review before budgeting anything else.

4. **`V-A2.1` — Amos Doolittle is a documented compression, and it is not
   resolved.** He marched to Cambridge after Lexington and published the four
   engravings in December 1775. That he was on the lines in the autumn is a
   compression, recorded at the head of `content/act2-people.ts`. Either date it,
   cut him, or find the evidence.

5. **`ledger.ts`'s Act 2 figures are unverified and marked so.** The opening
   strength is `CB-01`'s sourced return of 3 July 1775; the fixed losses under it
   are of the documented order but no line has been checked against a primary
   source, and `08` §10 makes that blocking for classroom use.

6. **The passport code has headroom again but the rule has not changed.**
   27 characters at full knowledge against a limit of 32. `FLAG_REGISTRY` and
   `PASSPORT_FLAGS` are **append-only**; reordering either invalidates every
   save code in every classroom. Act 2 appended 62 registry flags and 3 passport
   flags, and left the pre-rebuild Act 2 names above them where they were — a
   dead flag costs one bit, and a renumbering costs somebody's lesson.

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
- `docs/05-act-scene-inventory.md` is now out of step for Act 2 as well as Act 1:
  it describes `A2-S1` to `A2-S5` as five separate scenes.
