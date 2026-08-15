# The Painterly Direction
### *In Washington's Shoes* — the medium, restated. Supersedes `02-art-direction.md` §1, §4, and both style anchors.
**Version 1.0 — 15 August 2026**
**Owner:** Creative Director. **Audience:** everyone who generates, writes or renders an image.

---

## 0. What this document does, and the decision behind it

The project was specified in **pen and wash on paper** — an eighteenth-century military
topographical drawing, iron-gall line over graphite, transparent watercolour in three
values, 35–55% of every frame left as untouched paper. `02-art-direction.md` §9.3 listed
oil painting under **"Dead pivots — do not resurrect"** with the note *"Disco Elysium's
feel, never its surface."*

**That decision is reversed.** The game is now made in **alla prima oil** — painterly,
loaded-brush, wet-into-wet, left unfinished. This document is the new medium spec. It
supersedes the sections named in its title and nothing else.

> **The rule for reading the old documents.** `02` §2 (palette structure), §3 (the mood
> controller), §5 (composition and camera), §6 (portraits, *except* the medium clauses),
> §7 (type), §8 (UI and chrome) and §9 (anti-references, *as amended in §6 below*) all
> remain in force. So does every word of `historical-visual-reference.md`, which is about
> facts and has no opinion on paint. **§1, §4, and the `style-anchor-env-v2` and
> `char-style-block` texts are dead and are replaced here.**

### 0.1 What the project gives up, stated plainly so nobody has to discover it later

`02` §1 made an argument, and it was a good one:

> *"The bare paper is the argument. The unpainted half of the frame is the part of the past
> we do not have."*

That claim is gone. A finished oil surface cannot make it — paint covers the canvas, and a
covered canvas asserts that we know what was there. **Anyone who was selling this game to a
history department on the epistemology of the empty half of the sheet needs a new sentence,
and §1.2 is that sentence.**

### 0.2 What the project gains, which is more than it looks

Three things, and the second is the one that matters mechanically.

1. **It is generatable.** A trained officer's pen-and-wash topographical record is a narrow
   target that no image model hits reliably. A loaded-brush oil portrait is dense in every
   model's training data. The old direction needed a bespoke LoRA (`wash-v1`) before it
   produced anything usable; this one is close to in-distribution on day one.

2. **It makes the mood shader honest.** This is the real prize. `02` §3 drives wash
   density, chroma and grain off the player's hidden stats — the world darkens as Washington
   comes apart. Under the old direction that was a quiet cheat: *a record made by an officer
   in the field has no business changing because the commander's morale fell.* The document
   was supposed to be objective, and the shader made it subjective anyway.
   **An expressive oil painting is subjective by construction.** It is not a record of what
   was there; it is a painting of how it was. So the mood system stops fighting the medium
   and starts expressing it, and the four hidden stats acquire a visual channel that is
   philosophically theirs.

3. **It matches the interior.** The Council — five voices arguing inside one man — is the
   spine of this game. A medium that renders the world through a temperament is the right
   host for it.

### 0.3 The new pedagogical claim, since the old one is retired

> **The frame is not a record. It is a recollection, and it belongs to the man whose head
> you are inside.**
>
> The game says so and keeps saying so: the world looks the way it looks because of who
> Washington has become, and the student is told this by the paint before anyone explains
> it. Where the old direction taught *the past is partly missing*, this one teaches
> *the past reaches you through somebody*, which is the other half of the same discipline
> and is, if anything, the harder lesson to get across in a classroom.

**The corollary is binding and it is where this direction could go wrong:** the *facts* in
the frame are not subjective. A subjective medium is a licence about mood and never a
licence about content. Every costume, building, weapon, flag and face is still governed
by `historical-visual-reference.md`, still cited, still checked. **Paint how it felt;
draw what was there.**

---

# 1. THE MEDIUM

## 1.1 `style-anchor-oil-v1.txt` — replaces `style-anchor-env-v2.txt`

This is the most important text in the project and it appears verbatim in every environment
generation. Store it once, inject it, version-bump rather than edit.

```
STYLE: an alla prima oil painting, worked wet-into-wet on a mid-toned ground and
abandoned before it was finished.

THE PAINT: laid on with a loaded brush in large confident strokes that describe a form in
one pass and are not blended out afterwards. Thick and visibly worked where the light
falls, thinning to bare stained ground in the shadows, so the ground itself does the
darkest values. The mark stays visible as a mark: a stroke is allowed to be a stroke
before it is a roof, a sleeve or a face. Nothing is smoothed, nothing is polished, and no
edge is cut cleanly all the way round an object.

THE DRAWING: structure carried by mass and value rather than by contour. There is no
outline. Forms are found with the brush and are lost again wherever a shadow meets a
shadow, so at least one major edge in every picture dissolves completely into what is
behind it. Detail is asserted in two or three places and abandoned everywhere else; the
eye is told where to look by where the paint is thickest.

THE GROUND: a mid-toned scumbled field — dirty grey-green, raw umber, cold ochre — which
shows through the thin passages and is never fully covered. The canvas tooth breaks the
stroke where the paint is dragged.

VALUES: a dark, close, sombre range with one small area of genuine light. Shadows stay
transparent and coloured and are never black; the lights are never white.
```

## 1.2 `char-style-block-oil-v1.txt` — replaces `char-style-block.txt`

Same medium, different job: a person rather than ground. The old block's discipline about
*provincial stiffness* is kept, because it is about how the sitter is presented and not
about paint, and because it remains the cheapest defence against the model's default of
flattering London-society portraiture.

```
CHARACTER STYLE: an alla prima oil portrait study, painted wet-into-wet on a mid-toned
ground and left unfinished. The head is found with a loaded brush — the planes of the
brow, the cheekbone, the nose and the jaw stated as flat masses of colour laid side by
side and not blended into one another. The paint is thick and worked where the light
crosses the face and thins to bare ground in the shadow, which stays transparent and
coloured. The cloth is stated in three or four strokes and is never rendered: the coat is
described, not painted. The sitter is set down plainly and is not flattered — stiffer,
blunter and more literal than fashionable portraiture, closer to a working study than to a
commission. One hard low-angle light source only, with no reflected fill, no second key
and no rim light. The ground behind the head is a flat scumbled field worked with the same
brush, with no scenery, no drapery, no column, no sky and no frame. Some edge of the head
is lost entirely into that ground. Nothing is pure black and nothing is pure white.
```

## 1.3 The public-domain anchor rule

**No generation in this project names a living artist, a studio, or a shipped game as a
style reference.** The look is specified by qualities — loaded brush, lost edges, mid-toned
ground, acid accents against a muted range — and where a name is needed for calibration it
is a public-domain painter: **Ilya Repin, Valentin Serov, Joaquín Sorolla, John Singer
Sargent's oil studies, Anders Zorn.**

This is the same reasoning `02` §6 already applies to Washington's face, where Peale is the
anchor *because Peale is public domain* and Stuart is banned outright. It applied before the
pivot and it applies after it.

---

# 2. COLOUR, AND THE ONE THING THAT MAKES THIS STYLE WORK

`02` §2's palette **structure survives**: four channels with four jobs, and Group D
(MEANING) remains exempt from every mood transform — Continental blue does not wash out
because the player is doing badly, and that is still the point of it.

What changes is how colour is deployed. The old direction restricted chroma to keep a
watercolour honest. This one restricts it to make a small number of notes *shout*:

> **THE RULE. A muted, dirty, earth-dominated ground, carrying a very small number of
> unnaturally saturated accents that do not belong to the natural light.**

A sour green in the shadow under linen. A bruised violet in a jaw. A hot orange at the edge
of a flesh mass, where no light source could put it. Three or four such notes in a frame,
placed deliberately, never scattered.

This is the single technique most responsible for the register we are reaching for, and it
is also the one most likely to be lost — a model asked for "oil painting, muted palette"
returns brown mud, and a model asked for "vibrant" returns a poster. **The accents must be
named in the prompt as accents, with their locations, or they do not appear.**

Two prohibitions that follow:

- **No accent may carry meaning.** Group D is the meaning channel. If a sour green in a
  shadow could be mistaken for a fact about a uniform, it is repainted.
- **Never warm-nostalgic.** The image reads sombre and slightly unwell. Golden-hour
  amber over everything is this style's equivalent of the sepia ban (`02` §9.8), and it is
  banned on the same grounds.

---

# 3. THE SHADER, AND WHAT IT NOW DOES

`02` §3's nine controller uniforms **survive as a system** and gain a justification they did
not have. Three of them are retired or redefined because they describe paper.

| Uniform | Was | Now |
|---|---|---|
| `uWashChroma` | wash saturation | **unchanged** — and now honest, per §0.2 |
| `uWashDensity` | wash coverage over bare paper | **redefined**: how far the paint covers the mid-toned ground. Low mood = more bare ground showing, which is a colder, emptier, more abandoned picture |
| `uGranulation` | pigment settling in paper tooth | **redefined**: canvas tooth breaking the dragged stroke |
| `uGrainOpacity` | paper grain asserting itself | **redefined**: ground tone asserting itself through thin paint |
| chain lines (`02` §4.4) | 1px verticals at 96px, laid paper | **retired.** There is no laid paper. Delete the second overlay |
| deckles, foxing (`02` §4.5) | paper edges in the letterbook | **retired** for the world; see §5 for the letterbook |
| aerial ink value | the line never wavers | **retired.** There is no line to keep uniform |

**The one rule of §3 that becomes more important, not less:** portraits stay exempt from
every mood uniform (`02` §6.1). One signal, one cause. A student must never be unable to
tell whether Washington looks worse because of what they did or because it is raining —
and in a medium where the world *is* expressive, that firewall is the only thing keeping
the portrait channel readable.

---

# 4. WHAT THIS BREAKS IN THE BUILD

Honest inventory, in descending order of cost. None of it is done.

| # | Thing | State | Note |
|---|---|---|---|
| 1 | `src/art.ts` — the plates | **Repainted, not replaced** | Every mass in the game goes through one primitive, `solid()`, and every thin form through `inkLine()`. Both were rewritten: an opaque base coat, a worked ground of low-opacity strokes, then a few near-opaque loaded strokes biased to where the light falls, and a broken boundary. 172 call sites changed behaviour without one of them being edited. **This buys the surface, not the picture** — see row 1a |
| 1a | The value structure of the plates | **Not done, and it is the real gap** | The compositions were authored for flat fill: they are evenly lit, with no chiaroscuro, no atmospheric recession and no large dark mass anchoring the frame. Brushwork over a flat picture is a flat picture with brushwork. Getting the rest of the way means retuning each scene painter's light direction and value range — and that is per-scene work, not another primitive |
| 2 | The paper grain on the DOM chrome | **Correct for now, pending §8.1** | Built this session against `02` §4.4 — laid-paper tooth and chain lines on the panels. It is *not* a casualty: by §5 the chrome is paper, and paper chrome should have paper grain. It only becomes wrong if §8.1 decides the chrome follows the world into paint, and then it is a one-tile swap. **Do not touch it before that decision** |
| 3 | `03a` (3,435 lines) and `03b` (2,003 lines) prompt bodies | **Style blocks dead, subjects alive** | Every subject line, composition, costume and historical clause survives untouched. Only the injected style/negative blocks change, which is what makes this affordable |
| 4 | `03c` documents and UI | **Partly dead** | The documents are still paper — see §5 |
| 5 | The renderer's paper uniforms | **Redefinable in place** | Per §3. No architecture change |

**The order is: anchors, then plates.** The anchors first so that nothing generated from
here on is made against a dead spec — done, they are in `art/prompts/`. Then the long
replacement of `src/art.ts`'s procedural scaffolding with real generated plates, which is
the actual work and is measured in weeks, not sessions. The chrome is not on the list
because it is not yet broken (row 2).

---

# 5. THE ONE THING THAT STAYS PAPER

**Documents are still paper, and the letterbook is still a book.**

This is not an inconsistency; it is the point. The world is now a painting of how it felt.
A primary source is a physical object that survived. The two registers being made of
different stuff is exactly the distinction the game is trying to teach, and after the pivot
it is *more* legible than it was, not less — before, the document and the world were the
same medium and the difference had to be carried by framing alone.

So `02` §8.2's letterbook, §8.3's document viewer, the deckle-on-two-edges rule, the four
typographic registers of `02` §7 and every word of `03c`'s document prompts **survive
unchanged**. R2 (documents) and R4 (emblems, copperplate engraving) are untouched by this
document.

The only consequence: the transition between world and document is now a change of medium
as well as a change of frame, and it should be allowed to feel like one.

---

# 6. THE ANTI-REFERENCE LIST, AMENDED

`02` §9 stays in force with these changes.

**Struck:**
- **§9.3** *"Not oil impasto… Disco Elysium's feel, never its surface."* — reversed by this
  document.
- **§9.7's** *"not storybook watercolour"* — moot; there is no watercolour.
- **§9.9** *"not fantasy-map parchment"* — retained for documents only (§5), moot for the world.

**Retained and now more dangerous, in order of risk:**

1. **§9.4 — not nineteenth-century history painting.** *This was partly a medium defence and
   the medium defence is gone.* Leutze, Trumbull's Rotunda cycle, *Spirit of '76* and
   Currier & Ives are the model's default for this subject **and they are oil paintings**.
   Pen-and-wash made them hard to reach by accident; alla prima makes them one bad adjective
   away. **The negative list is now the only thing standing between this project and
   `Washington Crossing the Delaware`, and it must be in every single generation.**
2. **§9.5 — not golden-age illustration.** Pyle and Wyeth painted in oil, in this period, on
   this subject. Same problem, same defence.
3. **§9.10 — not grimdark.** The old direction was *constitutionally incapable* of rendering
   gore — a three-value wash simply could not do it. Oil can. The ban is now a discipline
   rather than a property of the medium, and `reference-game-analysis.md` §6.4's content
   limits are load-bearing on their own.
4. **§9.12, §9.17, §9.18, §9.19** — patriotic iconography, the dollar-bill Washington, the
   face locks, and *Assassin's Creed III*. Unchanged, and unaffected by paint.

**New anti-references, specific to this medium:**

20. **Not concept art.** No keyframe illustration, no splash art, no trading-card framing,
    no "hero shot" lighting, no rendered-then-textured digital painting pretending to be
    oil. The tell is smoothness under the brushwork.
21. **Not fantasy oil.** No Frazetta, no book-cover romanticism, no heroic upward camera on
    a figure against a sky.
22. **Not a filter.** A photograph with a brushstroke overlay is not this style and is
    detectable in one glance at the edges, which will be uniformly sharp.
23. **Not finished.** A fully rendered, evenly detailed, edge-to-edge painting has failed
    even if every brushstroke is convincing. **The unfinished passages are the style.**

---

# 7. THE ACCEPTANCE GATE

Before any generated plate or portrait is accepted, five questions. They are deliberately
answerable by someone who cannot paint.

1. **Is there a lost edge?** Find the place where the figure or the building dissolves into
   what is behind it. If every edge is closed, reject.
2. **Does the ground show?** Find the thin passage where the mid-tone comes through. If the
   canvas is fully covered, reject.
3. **Are there three or four saturated notes, and no more?** Count them. If you cannot find
   them, reject. If you cannot stop counting, reject.
4. **Are the shadows coloured?** Sample the darkest area. If it is neutral black, reject.
5. **Could this be a nineteenth-century history painting?** If yes — if it is heroic,
   evenly finished, warmly lit and centrally composed — reject, and add to the negative.

And the sixth, which is not about paint: **is everything in it true?** Costume, building,
weapon, flag and face against `historical-visual-reference.md`. A subjective medium buys no
latitude here whatsoever (§0.3).

---

# 8. WHAT IS NOT DECIDED

Named so nobody assumes silence is consent.

1. **The DOM chrome.** The UI is currently paper with a full-opacity ink line (`02` §8.1),
   built this session. Paper chrome around a painted world is defensible — it is the
   letterbook logic of §5 — but it has not been looked at against a real painted plate.
   **Decide after the first environment lands, not before.**
2. **Whether the line survives anywhere.** `02` §4's iron-gall contour is retired for the
   world. Whether R4 emblems keep their copperplate engraving is settled (yes, §5); whether
   anything else does is open.
3. **The Gilt Frame.** `02` §1.2's device — the mythologised painting, captioned and
   quarantined — worked by being a *different medium* from the game around it. Now that the
   game is also oil, the contrast has to be rebuilt out of finish, colour and composition
   instead. This is the single most interesting unsolved problem the pivot creates.
4. **Whether `wash-v1` is retrained or retired.** Probably retired; the whole point of §0.2
   is that this direction may not need a LoRA.
