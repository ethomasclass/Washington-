# Where this is, as of the last session

Read this first. It is the handoff, not the design — the design is in `docs/`.

**Branch:** `claude/washington-game-story-playability-xa9mh8` (previous work is on
`claude/game-ideation-ucj49o`). Everything is committed and pushed.

**Deploys to GitHub Pages** — but only from the branches named in
`.github/workflows/deploy.yml`, which is this one, the old one, and `main`. A
push from any other branch builds nothing and publishes nothing, and the live
URL will quietly go on showing whatever was deployed last. If the site does not
look like your work, check that trigger list first.

**Read next:** `docs/08-progress-enlistment-and-playability.md` — the plan for what
the player is working toward, the Return as the one visible number, the enlistment
clock through Acts 1–3, and the player-facing writing register. **Steps 1–3 of its
build order are done** (interface strings rewritten, the Return on the HUD, the
two-line header). Step 4 — the ledger — is the next real work.

**ART DIRECTION PIVOT — 15 Aug 2026.** The project is no longer pen and wash. It
is alla prima oil: painterly, loaded brush, wet-into-wet, left unfinished, on a
mid-toned ground. `docs/09-painterly-direction.md` is the new medium spec and
supersedes `02` §1, §4 and both style anchors; §1 and §4 of `02` carry banners
saying so, and §9.3's "not oil impasto" is struck. Everything else in `02` — the
palette's meaning logic, the mood controller, composition, the portrait rules,
type, UI, and the rest of the anti-reference list — is still in force.

The live prompt substrate is in `art/prompts/`: `style-anchor-oil-v1.txt`,
`char-style-block-oil-v1.txt`, `negative-oil-v1.txt`, and one assembled
ready-to-paste sheet. **The negative list goes in every single generation** —
nineteenth-century history painting is an oil painting of this exact subject and
is now one adjective away.

Not yet done, in order: the bodies of `03a`/`03b`/`03c` still carry dead style
blocks (their subject lines are fine and unchanged); `src/art.ts` is 3,800 lines
of procedural placeholder that the pivot makes due for replacement by real
generated plates; the shader's paper uniforms want the redefinitions in `09` §3.
The DOM chrome stays paper and stays as built — see `09` §8.1 before touching it.

**The Council now matches `07-stat-and-voice-system.md` §3.** The five loudness
formulas were audited against the spec and three were wrong (Duty read no
Legitimacy at all); they are corrected. R4's floor of two, insistence/rejoinders,
voice-locked options and the ambient interjection budget are all built. The
selection rules live in `src/council.ts` as pure functions so the linter can
assert them — it checks R4 at four corners of the stat space and walks every
path through the authored decisions to prove each voice lock is reachable both
open and shut. Two voice locks exist: `A1-D1/decline` (restraint) and
`A2-D4/hold_them` (temper).

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
