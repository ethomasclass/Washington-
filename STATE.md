# Where this is, as of the last session

Read this first. It is the handoff, not the design — the design is in `docs/`.

**Branch: `main`, and only `main`.** Everything was consolidated onto it on 16
Aug 2026 — the old `claude/*` working branches are retired and no longer deploy.
Work on `main`, push to `main`.

**Deploys to GitHub Pages** from `main`, via `.github/workflows/deploy.yml`.
Two repository settings have to be right, and both have bitten this project:

- **Settings → Pages → Source must be "GitHub Actions"**, not "Deploy from a
  branch". On "branch" Pages serves the repo's own `index.html`, which points at
  `/src/main.ts` — TypeScript the browser cannot execute — and the site
  white-screens with a syntax error at `main.ts:1`. Nothing in the code can fix
  this; it is a setting.
- **Settings → Environments → `github-pages` → Deployment branches must include
  `main`.** If it does not, the build job passes, the deploy job fails in about
  a second with *"Branch main is not allowed to deploy to github-pages due to
  environment protection rules"*, and the live URL silently keeps serving
  whatever was published last.

**`npm run build:single` is the escape hatch**, and the better answer for a
classroom: it emits `dist-single/washington.html`, the entire game in one file
with no assets beside it and no host to fetch from. Put it on a district server,
a shared drive, a USB stick or an LMS that accepts a single upload. Use it
whenever hosting is wedged or the URL is not ours to pick — which `vite.config.ts`
has assumed from the start.

**THE 3D EXPLORATION — branch `claude/3d-voxel-vs-2d-engine-ux0fpt` only.**
A first-person, low-poly, clean-toon direction is being explored in parallel
with the print engine; nothing on `main` is touched. Three layers, each a
standalone page: `fp.html` (CB-01's stations walked in first person),
`env.html` (the environment engine: terrain, sky, weather, water, scatter —
`src/env/`), and within it a research-grounded **Mount Vernon, May 1775**
(`src/env/vernon.ts` + `vernon-kit.ts`): asymmetric mansion with the raw
scaffolded south wing, slate-blue roof, NO piazza/cupola (both post-1775),
angled dependencies, view-blocking walled gardens, the two-story House for
Families, chariot departure, shearing, the herring-run fishery. The research
brief (mountvernon.org, verified dates + a must-not-appear list) is recorded in
`vernon.ts`'s header; the enslaved-population figure is marked unverified
(V.1). The mansion interior is walkable (two floors, a stair, animated front
doors); `cambridge.ts` and `lines.ts` add CB-01 and CB-03 as researched
environments (Emerson's shelter menagerie, the Appeal to Heaven flag, burned
Charlestown's chimneys, empty embrasures — sources in each header; low-contrast
procedural textures in `textures.ts` under the cel shading). One-file playable
builds: `node scripts/build-fp-single.mjs` and the env equivalent inside it —
output in `dist-single/`.

**The game IS wired into 3D** (`game3d.html` → `src/game3d/main.ts`): the full
loop from `src/main.ts` — state, flags, Council, decisions, dialogue, examine,
tasks, spyglass survey (raised over a live 3D still, oriented at the harbour),
journal, Return, reckoning, passport saves, theatre map, dev bar — running on
the first-person environments for all four scenes. Content anchors to the
2D stations via per-scene anchor tables in `game3d/main.ts` (ENV); NPCs stand
as articulated `vernon-kit` figures. CB-02's parlour lives INSIDE the Cambridge
world (`src/env/vassall.ts`): the Vassall house stands up its own lane west of
the camp — pale yellow (V.1 unverified for 1775), five bays, animated front
door, sentries at the paling fence — with a furnished walkable hall and parlour
(map table with a drawn map, secretary's desk, council chairs, hearth, the
portrait turned to the wall, the stair blocked with baggage). CB-01's exit
stands in the entry hall, so reaching the parlour means finding the house and
walking in; CB-02's map-table exit carries on to CB-03. Interior lighting note:
the ceiling slab casts shadow (the shell's own shadow leaks at the sunward
eave), and Cambridge aims its shadow box between camp and house (sky.ts
`shadowFocus`). One-file build: `node scripts/build-game3d-single.mjs` →
`dist-single/washington-3d.html`. **The 3D quality audit and staged plan
live in `docs/11-the-3d-quality-plan.md`** — people first, then sound, then
grounding; read it before any art work on this branch.

**Read next:** `docs/08-progress-enlistment-and-playability.md` — the plan for what
the player is working toward, the Return as the one visible number, the enlistment
clock through Acts 1–3, and the player-facing writing register. **Steps 1–3 of its
build order are done** (interface strings rewritten, the Return on the HUD, the
two-line header). Step 4 — the ledger — is the next real work.

**ART DIRECTION — 16 Aug 2026. THE GAME IS A PRINT.** Line first, flat colour
second, on laid rag paper. `docs/10-the-print-direction.md` is the medium spec
and supersedes `09` entirely — the alla prima oil pivot lasted one day and is
reversed. `src/manuscript.ts` DRAWS scenes rather than generating them, which is
why: twenty-seven plates are consistent by construction, and a procedural
engraver works where a procedural oil painter never will. The camp is drawn and
in the game; the other three scenes are owed.

The superseded oil note follows, kept for the record only. `docs/09` carries a
banner saying it is dead; §1 and §4 of `02` carry banners
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

## The second idea: scenes are STAGED, not scattered

**17 Aug 2026.** Nothing in a scene carries a hand-picked coordinate any more.
An author declares four to seven **stations** — a mess fire, a quartermaster's
trestle, the brush shelters, the head of the lane — and every interactable,
task, person and extra names the one it belongs to (`...at('trestle')`).
`content.ts` `stage()` computes the positions from that, and `separate()`
relaxes the figures until none of them overlaps in the frame.

This was a fix to a layout that nobody had chosen. The old rule was pure
repulsion — no two things within arm's reach — which passes for every even
scatter and fails for every real arrangement, and the interaction model backed
it up by only ever addressing the single nearest thing. So the only legal
layout in the game was one object every few feet across the whole floor, which
is exactly what all four scenes were, and why they read as items strewn about.

Three things changed together, and none of them works without the other two:

- **`Station` in `types.ts`**, with a `surface` (`table`, `stack`, `fire`,
  `wall`, `open`) that decides what furniture gets drawn under the group and
  whether its things are lifted onto a tabletop. A table and a wall are *lines*,
  so their members lay out along a row rather than on a ring.
- **`inReach()` in `main.ts`** returns every target within reach, nearest first,
  and **Tab** steps through them. Clusters are only usable because of this.
- **The linter** now checks the staging and the composition rules from
  `02-art-direction.md` §5.4–5.5 that had been written down and never enforced:
  one focal station standing on a third, the exit at the depth of the walk band,
  no more than nine figures, and R9's eight-second walk.

Practical: **do not type an `x` or a `z` into a scene file.** If something is in
the wrong place, move its station or move it to another one.

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
  ones. The same is true of props: station furniture is emitted before the
  things standing on it, in `propsFor()`.
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
