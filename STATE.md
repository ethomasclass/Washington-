# Where this is, as of the last session

Read this first. It is the handoff, not the design — the design is in `docs/`.

**Branch: `claude/hd-2d-game-approach-gwi5on`.** The 19 August rebuild lives
here. `main` still carries the old print-direction build; nothing on this branch
has been merged into it.

---

## THE REBUILD — 19 August 2026

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

In the browser console, `__game.warp(x, z)` and `__game.go('MV-HOUSE-1', x, z)`.
`` ` `` or F2 cycles the maps.

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

2. **Acts 2–8 do not exist in the new engine.** Everything under `content/` is
   Act 1. The engine is act-agnostic; the content is not written.

3. **The William Lee / Quarter thread is still behind a review gate.** Frank
   Lee, Doll and Harry carry `sensitive: true` and the sign-off recorded in
   `content/estate-people.ts` has not been given. **It is drafted. It is not
   approved.** Budget the review before budgeting anything else.

4. **The passport code has headroom again but the rule has not changed.**
   26 characters at full knowledge against a limit of 32. `FLAG_REGISTRY` and
   `PASSPORT_FLAGS` are **append-only**; reordering either invalidates every
   save code in every classroom.

5. **Never let generated art produce readable text.** Still true, and now easier
   to break: `props.ts` draws books, papers and a globe. None of them carry
   letters and none of them should. All period type renders in-engine.

## Known rough edges

- Gable roofs on the small outbuildings read as one grey slab from close up;
  the ridge needs a drawn board rather than only a value change.
- The sloop's rigging is three lines and reads thin at the landing.
- The chariot's body sits high above its wheels.
- The east lawn is large and under-furnished between the ha-ha and the river.
- Interior side walls eat a lot of frame in the narrower rooms.
- No music. `engine/audio.ts` is effects only, and R14 still stands: fife and
  drum are diegetic or they do not happen.
