# Where this is, as of the last session

Read this first. It is the handoff, not the design — the design is in `docs/`.

**Branch:** `claude/washington-game-story-playability-xa9mh8` (previous work is on
`claude/game-ideation-ucj49o`). Everything is committed and pushed. Deploys to
GitHub Pages on every push.

**Read next:** `docs/08-progress-enlistment-and-playability.md` — the plan for what
the player is working toward, the Return as the one visible number, the enlistment
clock through Acts 1–3, and the player-facing writing register. Nothing in it is
built yet; §9 is the build order and steps 1–3 are the cheap ones.

**Run it:** `npm install && npm run dev`. `npm test` is the codec plus the
content linter and must be green before any commit. `npm run build` before
pushing.

---

## What is playable

Three scenes, each walkable, each with a briefing, objectives, a journal, and a
save code.

| id | scene | act | notes |
|---|---|---|---|
| `MV-01` | Mount Vernon, the west front | 1 | May 1775. Exits to CB-01. |
| `CB-01` | Cambridge, the camp street | 2 | July 1775. Exits to CB-03. |
| `CB-03` | The lines above Charlestown | 2 | November 1775. No exit yet. |

**Dev tab, bottom-left corner** (or `` ` `` / `F2`) jumps between scenes without
playing to them. `/sprites.html` is a contact sheet of every figure, walk cycle
and set piece at a size where the drawing can be judged. `/variants.html` is the
older decision-UI bench.

---

## The one idea the code is built on

Everything that has to agree about space goes through **`src/ground.ts`**. The
renderer walks figures over that curve, the plate painter paints scenery onto
it, and the content linter checks the result. Three private copies of those
numbers is how you get an avenue of hedges the player walks straight through —
which happened, and is why the module exists.

Practical consequences worth knowing before touching art:

- **Size painted scenery in man-heights**, via `figureAtPlateY()`. A wedge tent's
  ridge is about a man's height. Sizing by eye produced a camp of tents a third
  of a man tall that read as kennels.
- **`zAtPlateY()` / `xAtPlateX()`** convert plate pixels back to ground
  coordinates. Use them when something painted must meet something else painted,
  or when an interactable has to sit under the thing it names.
- **Plate depth comes from what the plate paints** (`PLATE_DEPTHS`), not from a
  hand-picked number. Getting this wrong made the player vanish at the back of
  the lawn.
- **A plate has no depth sorting.** Order of calls is the only thing deciding
  what covers what: ground furniture before buildings, far shelters before near
  ones.
- **The perspective is exact.** Scale is proportional to height below the
  horizon, which is why the walkable band stops 30% of the way up (`FAR_LIFT`)
  instead of running to the horizon.

## The art rule

Everything opaque: `solid()` for any mass, `wash()` only for shadows, haze and
weather. Figures, buildings, props and trees were each translucent at some point
and each looked wrong in the same way. Paper never lies on the ground — every
prop that holds a document carries its own furniture, because the scene is a
house being packed.

---

## Open decisions, in the order they will bite

1. **The passport code has a ceiling.** 29 payload characters now against a
   limit of 32; `npm test` prints the remaining headroom every run. At ~20 flags
   a scene and the eight acts this is specified for, the code reaches about a
   hundred characters. The fix is in the design already — a code should carry
   the run, not the browsing history. Most `obs.*` flags gate one contradiction
   inside a single scene and have no business surviving the act.
   `FLAG_REGISTRY` and `SCENE_ORDER` are **append-only**; reordering either
   invalidates every save code in every classroom.

2. **`V-` markers are unverified history.** Search the source for `V-A2` — three
   of them sit at the head of `src/scenes/cb03.ts`. Amos Doolittle's presence in
   November is a compression; no November 1775 strength return is quoted because
   none has been checked; Sergeant Starr is invented. Each says what to do about
   it.

3. **The William Lee thread is R5 / Witness Register material** behind a review
   gate. It needs named pedagogical sign-off before it goes near students. The
   gate is recorded at the head of `src/scenes/mv01.ts`.

4. **CB-02, the Vassall House parlour, is the missing scene.** It is the act's
   hub in the design and it is an *interior*, which wants a plate system that
   does not exist — everything built so far assumes a ground plane running to a
   horizon.

5. **Never let generated art produce readable text.** All period type renders
   in-engine over blank paper.

---

## Known rough edges

- Four document boxes in one Mount Vernon frame repeat noticeably, and they are
  the darkest things on the lawn so the eye goes to them first.
- The horse's tail reads as a block on the rump rather than hanging free.
- Martha's gown is dark enough that she reads as a silhouette at distance.
- Washington is bareheaded per the reference image; a general outdoors in July
  would wear a tricorne, and a hat is a much stronger silhouette at small size.
- His arms read only by their buff cuffs, since sleeve and coat are the same
  blue.
- The camp's near-field shelters are large plain masses with little detail.
