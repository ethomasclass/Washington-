# AI Art Prompt Guide — Part 3: Documents, Map Table, UI & Textures
### *In Washington's Shoes* — the binding prompt substrate for every sheet of paper, every object, every map and every pixel of chrome
**Version 1.0 · 14 August 2026**
**Owner:** Art Lead. **Binding on:** every document, every collectible prop, every map-table asset, every UI element, every tiling texture.

---

## 0. What this document owns

`03a` owns **places**. `03b` owns **people**. This document owns **things** — and one particular kind of thing, paper, that the whole game is made of twice over: it is the medium the art is drawn in *and* it is the game's principal progression system.

| Document | Authority |
|---|---|
| `reference/historical-visual-reference.md` | What is **true** — §4.1 paper and ink, §4.2 the two-layer document, §4.5 camp equipment, §4.6 flags, §4.7 the collectible list, §5.2 the four period registers. Outranks this document on every question of fact. |
| `docs/02-art-direction.md` | What an image must **look like** — R2 and R4 in §1.5, the palette §2, the paper decision §4.4, deckles/stains/foxing §4.5, the UI law §8. |
| `docs/04-scene-architecture.md` | **How the map table is staged** — §7 construction, camera clamps, the lift; §4.6 the ink glyph system; §6.2 the dialogue page. |
| `docs/05-act-scene-inventory.md` | **What exists** — 51 documents + 1 epilogue, the findable objects in every scene, the six map tables. |
| `docs/06-technical-architecture.md` | **What ships** — `document.schema.json` §5.6, the map-table runtime §2.8, formats and budgets §4.6 / §9.5. |
| `docs/07-stat-and-voice-system.md` | **What the epilogue book is** — §5.1, the three conditions driven by Political Legitimacy. |
| `reference/ai-art-production-guide.md` | **How an image gets made** — §2.5 sheets, §5.1 the text ban, §5.7 seamless tiling, §6 hygiene, the ledger. |
| **This document** | The exact text that goes into the box, for every object in the game that is not a place and not a person. |

**The one-line law of this document, from which everything below is derived:**

> **The model makes the surface. The engine makes the sentence. They never meet in the same file.**

Everything in §1 is that sentence made enforceable. Everything in §2–§6 is the surface catalogue it implies.

### 0.1 The nine locked files this document creates

Nobody retypes these. The pipeline script concatenates them, exactly as it does `03b`'s eleven.

```
art/prompts/doc-style-block.txt        §1.4   the artefact-paper anchor
art/prompts/doc-framing.txt            §1.5   three framing lines, one per paper class
art/prompts/doc-negative.txt           §1.6   the document negative block
art/prompts/map-style-block.txt        §4.3   the R2 survey anchor (wshmap)
art/prompts/map-framing.txt            §4.4   two framing lines, sheet and token
art/prompts/map-negative.txt           §4.5   the map negative block
art/prompts/ui-style-block.txt         §5.2   the R4 engraved anchor
art/prompts/ui-negative.txt            §5.2   the engraving negative block
art/prompts/tile-style-block.txt       §6.3   the seamless-texture anchor
```

### 0.2 Assembly order — fixed, and different from `03b`'s in exactly one place

```
[SUBJECT LINE]                     per-asset, this document §2 / §3 / §4.6 / §5 / §6.4
[doc- | map- | ui- | tile-style-block.txt]   the class anchor
[  -framing.txt : one line]        by asset class
[style-block.txt]                  the shared world style block, unchanged, appended last
[  -negative.txt]                  last of all
```

The difference: `03b` puts the **identity sentence** first because a face is the thing that cannot be allowed to drift. Here the thing that cannot be allowed to drift is the **paper**, and the paper lives in the class anchor rather than in the subject line — so the subject line's job is smaller and more mechanical. A document subject line names a *manufacturing and handling history* and nothing else. It never describes ink, never describes writing, and never describes what the document says.

### 0.3 The one ownership transfer, stated so nobody generates it twice

**Collectible props belong to this document, not to `03a`.** They were budgeted in `05` §13.2 as 24 prop sheets and it is tempting to file them with environments because they appear in scenes. They do not belong there: a prop is generated on bare paper as a study, never inside a plate, and it ships through the *document* pipeline (DOM WebP) far more often than through the scene pipeline. `03a` paints props **into** plates as scenery; this document generates every prop the player can **examine**. The boundary is the interactable list: if `05` names it as findable, it is here.

**One sheet goes the other way.** The hands library (`03b` §5.6) was drawn from the prop budget. So this document owns **23** prop sheets, not 24, and `03b` owns the 24th. That reconciliation is carried into the master index.

---

# 1. THE CARDINAL RULE — NO TEXT IN IMAGES

## 1.1 The rule

> **No image asset in this project contains a readable glyph. Not a word, not a letter, not a numeral, not a monogram, not a signature, not a map label, not a cartouche motto, not a book spine, not a milestone, not a shop sign, not the game's own title.**
>
> **Every readable glyph in *In Washington's Shoes* is rendered in the DOM, in a licensed OFL typeface, over generated blank stock.**

This is `ai-art-production-guide.md` §5.1 and `historical-visual-reference.md` §4.2, restated here as the first line of the first section because this document is where it would be broken. It is the only rule in the art direction that is enforced by a build failure rather than by an eye (§1.7).

## 1.2 Why prompting harder does not work, in four parts

**One — the models are good at modern text and this is not modern text.** Ideogram 4, Nano Banana Pro and Qwen-Image can set a clean modern sentence. None of them can produce an eighteenth-century secretary hand, and what they produce instead is near-English: letterforms that resolve at a glance and dissolve on inspection. A student will screenshot it. A history teacher will spot it in two seconds. That is the exact failure the game exists to teach students to catch, arriving in our own art.

**Two — even a *correct* rendering would be wrong.** Period orthography is a system: the long ſ with its position rules, the ﬀ and ﬁ ligatures, `&c.`, `Honble`, the superscript contraction, period capitalisation of common nouns, the doubled terminal consonant. A model that produced beautiful legible period lettering would still get these wrong, and it would get them wrong *confidently and consistently*, which is worse than gibberish because it teaches the error.

**Three — the three side benefits are each independently sufficient.** In-engine type is **selectable, searchable and screen-reader accessible** — a hard requirement in US schools and the difference between adoption and rejection. It is **editable by the teaching client without regenerating art**, which means a factual correction is a text edit rather than a two-day re-bake. And it costs **~2 KB per document instead of a 400 KB image**: 51 documents of live text land at ~110 KB, against ~20 MB if each were a distinct painted sheet.

**Four — it is the only way the two-layer document works at all.** `02` §8.3 requires an artefact layer and a transcription layer *on the same paper ground*, cross-dissolving in 180 ms. If the writing were baked into the paper, the transcription would have to cover it, which means an opaque panel, which means the student leaves the object. The rule is not a workaround for a model limitation; it is the architecture.

## 1.3 The consequence: every document is three layers, and only one of them is generated

| Layer | What it is | Made by | Ships as |
|---|---|---|---|
| **1 — the stock** | blank paper: fibre, tone, deckle, folds, thumbing, stains | **generated**, §2.3 | one of 12 WebP files, shared |
| **2 — the hand** | illegible ink strokes standing for writing, in the document's register | **generated once as a strip library**, §2.4 | cells from one atlas, composited per document |
| **3 — the type** | the real words | **DOM text**, `06` §5.6 `body[]` runs | ~2 KB of JSON |

The artefact view shows layers 1 + 2. The `TRANSCRIPT` tab cross-dissolves layer 2 out and layer 3 in, over the same layer 1. **The student never leaves the object**, the paper never moves, and the model was never asked to write.

**All ruling is layer 3.** Ledger rules, form boxes, column rules, running-head rules and the underline beneath a heading are drawn in the DOM at device pixels. Models cannot rule a straight line across 1024 px — it wobbles, it converges, it changes weight — and a wobbling rule on an account book is a more damaging tell than bad handwriting, because ruling is *machine-regular* and the eye knows it. The stocks in §2.3 are therefore blank of ruling as well as blank of words, and they are differentiated by what a model is genuinely good at: fibre, tone, edge, fold and wear.

## 1.4 `art/prompts/doc-style-block.txt` — v1, locked

```
DOCUMENT STYLE: a single sheet of eighteenth-century handmade paper photographed
flat and square-on in even light, drawn as a pen-and-wash study. The sheet is the
whole subject and it is completely blank — an unused, unwritten sheet. Warm cream
laid rag paper made in a mould: fine parallel laid lines close together across the
sheet and stronger chain lines about an inch apart running the other way, both
visible as faint tonal ridges rather than as drawn lines. The surface has real
fibre — a slight tooth, occasional flecks and specks of undigested rag, and a
faint cloudiness where the pulp lay thicker. The paper's own colour carries the
image: warm cream to buff, never white, never grey-brown, never orange. Modelled
in transparent watercolour wash in no more than three values, with the untouched
paper standing for the light. Where the sheet is folded, the fold is a soft
compressed line with the faintest darkening along it. Where the sheet has been
handled, the wear is at the corners and the fore-edge and nowhere else. The
drawing is quiet and exact and it describes a material, not a mood. Nothing in
the image is pure black and nothing is pure white.
```

**Three clauses doing measurable work.** *"Completely blank — an unused, unwritten sheet"* is the strongest single anti-text phrasing tested: instructing the model about the sheet's **state** beats instructing it about the absence of letters, because a negative on `text` still puts the token in the conditioning. *"Both visible as faint tonal ridges rather than as drawn lines"* stops the model ruling the laid and chain lines as ink, which is the most common failure on this class. *"Never orange"* is there because "aged paper" is the single strongest attractor in the prior toward the fantasy-parchment register that `02` §9 bans by name.

## 1.5 `art/prompts/doc-framing.txt` — three lines

**`FRAMING-SHEET`** — the ten single-leaf stocks. P01–P05, P07–P09, P10–P11.
```
FRAMING: the single sheet fills the frame square-on with a narrow even margin of
plain neutral surface all round it, seen from directly above with no perspective,
no tilt and no foreshortening. The sheet is flat, not curled and not lifting. No
desk, no table, no hand, no props, no other papers, no shadow cast onto anything
else, no vignette, no frame.
```

**`FRAMING-OPENING`** — the two bound stocks, P06 and the book/ledger spreads in §5.11.
```
FRAMING: an open bound volume seen square-on from directly above, both leaves
flat and equal, the sewn gutter running exactly down the centre of the frame with
a soft shadow either side of it and the thread visible at the head and tail. The
leaves are completely blank. The binding edge and board are visible only as a
narrow band at the extreme left and right of the frame.
```

**`FRAMING-STUDY`** — the prop sheets, §3.
```
FRAMING: a page from a sketchbook — separate small studies of objects arranged in
a regular grid on bare cream paper, each object isolated and complete with clear
empty paper all round it and no overlapping, no shared ground line, no cast
shadows onto the paper, no scenery and no setting. Even flat frontal light on
every object, identical for all of them. Each object is drawn at its own natural
size relative to the others.
```

## 1.6 `art/prompts/doc-negative.txt` — v1, locked

```
NEGATIVE: text, lettering, letters, words, writing, handwriting, script,
calligraphy, cursive, print, printed text, typography, typeface, font, glyphs,
characters, numerals, numbers, dates, signature, monogram, initials, caption,
label, title, heading, watermark text, cartouche text, map legend, legend text,
scale text, banner text, book spine text, marginalia, annotation, stamp, seal
lettering, letterpress, movable type, newspaper columns, ruled lines, printed
rules, box rules, column rules, lined paper, grid lines, notebook lines,
gibberish text, faux latin, lorem ipsum,
burnt edges, torn scroll, rolled parchment, fantasy map, treasure map, wax and
string, aged sepia filter, coffee stain, tea stain, cigarette burn, heavy foxing,
mould, orange paper, brown paper, grey paper, modern printer paper, white paper,
bleached paper, glossy paper, plastic, laminated,
drop shadow, glow, bloom, vignette, bokeh, depth of field, 3d render, cgi,
photorealistic, hdr, oversaturated, oil impasto, canvas weave, thick brushstrokes
```

**`ruled lines` is in the negative and it is not a mistake.** Every rule in this game is DOM (§1.3). A generated ruled sheet is a rejected sheet even when the ruling is beautiful, because the DOM rules will land on top of it and the object will have two grids.

## 1.7 Enforcement: `scripts/no-text.mjs`, and it fails the build

An eye check on 400 assets will miss one. The rule gets a machine.

```
scripts/no-text.mjs
  for every file in art/dist/:
    render to greyscale PNG at 2× the shipped resolution
    run tesseract --psm 11 (sparse text) with tessdata_fast eng
    collect tokens with confidence >= 70 and length >= 4
    reject the asset if any surviving token is in /usr/share/dict/words
    reject unconditionally if >= 3 tokens survive at confidence >= 85
    write art/qa/ocr-report.json
```

- **Sparse-text mode (`--psm 11`)** because we are looking for *any* text anywhere, not a page of it.
- **The dictionary test is what makes this usable.** OCR hallucinates on ink texture — it always will, and a raw "any token" test would fail every honest asset. Requiring a real English word of four or more characters at 70% confidence draws the line exactly where "a student would read this as a word" is.
- **The illegible-hand library (§2.4) runs through this gate like everything else, and passing it is the proof it is illegible.** That is the check's second job and it is the more valuable one: it turns "does this look like unreadable writing?" from a matter of taste into a number.
- Runs on every PR touching `art/dist/`. ~90 s for the full set. Report is committed so a regression is a diff.

## 1.8 The one permitted exception, and its ceiling

Where a plate needs writing **as texture** — a stack of returns on a headquarters table, a distant regimental order nailed to a post, the pages of an open orderly book on `L3` — the positive phrasing is:

```
faint illegible marks of writing, fine broken ink strokes suggesting lines of
cursive at a distance, too small and too faint to resolve into letterforms
```

**Ceiling: the marks must occupy fewer than 20 logical pixels of height on screen at ship resolution.** Above that they must be either blank paper or a real document object. The check is mechanical — measure the region in the shipped plate — and it is on the `03a` diorama sign-off list as well as this one.

---

# 2. PAPER STOCKS, THE HAND LIBRARY, AND PAPER FURNITURE

## 2.1 Twelve stocks, and why twelve

`05` §13.2 budgeted 12 blank document papers for 51 documents and the number is right, but not for the reason it looks like. Twelve is not "enough variety." Twelve is **the number of distinct manufacturing-and-handling histories in the game's paper**, and every one of them is a fact the student can read off the object:

- A letter written at a desk and a letter carried in a coat for nine days are *the same paper* and different objects. That difference is `P01` versus `P08`, and it is the whole reason `DOC-A2.5` (Knox, from the Berkshires in December) feels different from `DOC-A2.6` (Washington, at his own table).
- A broadside and a treaty are different **materials**, not different layouts. `P03` is rag swept off the floor of a cheap mill; `P07` is a skin. That difference is why the Treaty of Alliance feels like an event.
- The two water-stained sheets get their own stock (`P09`) because `02` §4.5 permits exactly two and both are diegetically justified. Making it a stock rather than an overlay means **the linter can count them**: exactly two documents may declare `P09`, and a third is a build failure.

Anything a stock cannot express — folding, sealing, tearing, a broken seal, an ink blot — is an **overlay** from the furniture sheets in §2.5 and §2.6, composited in the DOM. Folding is deliberately not a stock: the same paper folded three ways would otherwise cost three generations.

## 2.2 The twelve stocks — the table the pipeline reads

Ship resolution 768 × 1024 WebP q82 unless noted. `type_frame` is `[x, y, w, h]` in shipped pixels, and it is the rectangle `06` §5.6 lays type into.

| ID | File stem | Ground | Generate | Ship | `type_frame` | Deckle | Serves |
|---|---|---|---|---|---|---|---|
| `P01` | `gl_xx_doc_writing-laid_v01` | `PAPER-WARM` | 1024×1536 | 768×1024 | `[86,120,596,800]` | 2 of 4 | 15 |
| `P02` | `gl_xx_doc_writing-halfsheet_v01` | `PAPER-WARM` | 1024×1024 | 768×640 | `[76,86,616,470]` | 2 of 4 | 4 |
| `P03` | `gl_xx_doc_press-coarse_v01` | `PAPER-SMOKED` | 1024×1536 | 768×1088 | `[64,72,640,948]` | 0 of 4 | 11 |
| `P04` | `gl_xx_doc_pamphlet-leaf_v01` | `PAPER-SMOKED` | 1024×1536 | 640×1024 | `[72,96,496,840]` | 0 of 4 | 3 |
| `P05` | `gl_xx_doc_ledger-folio_v01` | `PAPER-COOL` | 1024×1536 | 896×1152 | `[58,92,780,996]` | 0 of 4 | 4 |
| `P06` | `gl_xx_doc_orderly-book_v01` | `PAPER-WARM` | 1536×1024 | 1200×760 | 2 frames, §2.3 | n/a | 4 |
| `P07` | `gl_xx_doc_engrossing-skin_v01` | `PAPER-BRIGHT` | 1024×1536 | 768×1024 | `[104,132,560,760]` | 0 of 4 | 5 |
| `P08` | `gl_xx_doc_carried-smoked_v01` | `PAPER-SMOKED` | 1024×1536 | 768×1024 | `[92,128,584,780]` | 2 of 4 | 5 |
| `P09` | `gl_xx_doc_water-stained_v01` | `PAPER-SMOKED` | 1024×1536 | 768×1024 | `[90,126,588,784]` | 2 of 4 | **2, capped** |
| `P10` | `gl_xx_doc_french-laid_v01` | `PAPER-COOL` | 1024×1536 | 768×1024 | `[96,132,576,772]` | 2 of 4 | 3 |
| `P11` | `gl_xx_doc_newspaper-folio_v01` | `PAPER-SMOKED` | 1024×1536 | 896×1216 | `[48,56,800,1104]` | 0 of 4 | 2 |
| `P12` | `gl_xx_doc_plan-sheet_v01` | `PAPER-COOL` | 1536×1024 | 1200×800 | `[64,64,1072,672]` | 4 of 4 | 3 |

**The deckle column is load-bearing and it is `02` §4.5's rule made mechanical.** Period sheets were guillotined on the two edges where they were cut from the mould-pair and left deckled on two. A stock that shows four deckled edges is either a whole uncut sheet — which `P12`, a plan sheet, correctly is — or it is a fantasy prop. `P03`, `P04`, `P05`, `P07` and `P11` show **no** deckle at all, because broadsides, pamphlet leaves, account books, engrossing skins and newspapers were all trimmed. This one column kills the single most common period-paper cliché before a prompt is written.

## 2.3 The twelve prompts

Each is `[SUBJECT LINE]` + `doc-style-block.txt` + the named framing line + `style-block.txt` + `doc-negative.txt`. Seed family: `art/prompts` assets use base `90000`; `P01` is 90001, `P12` is 90012.

---

### `P01` — the writing stock. **Generate this first, before any other asset in the project except the LoRA gate.** §7 of the index explains why.

```
wshwash, a single sheet of fine handmade laid writing paper, blank and unused,
of the quality a Virginia gentleman kept on his desk: evenly formed, well sized
so the surface is smooth and slightly hard rather than absorbent, warm cream in
colour, the laid and chain lines even and regular, one faint watermark device
showing as a slightly thinner place in the sheet toward the upper centre. The
sheet has been folded once across the middle and the fold has been opened flat
again, leaving one soft horizontal crease. Two edges are cleanly cut and two are
softly irregular where the pulp met the edge of the mould.
FRAMING-SHEET
```

**Acceptance is stricter for this asset than for any other in §2.** Everything printed, written, ruled and typeset in the game sits on paper whose tone was set here, the world's grain texture is extracted from it (§6.4 `T01`), and `PAPER-WARM #EFE7D5` is measured against it. Sample the flat centre 200 × 200 px: mean must land within ΔE 3 of `#EFE7D5`, and the standard deviation of luminance across that patch must be **between 1.8 and 4.5** — below 1.8 the paper is dead flat and will look like a fill, above 4.5 the fibre noise will fight the DOM type at 20/32 px.

---

### `P02` — the half-sheet

```
wshwash, a small half sheet of the same fine cream laid writing paper, blank and
unused, wider than it is tall, folded twice across into three equal parts and
opened flat again so two firm horizontal creases cross it. The paper is fresh and
lightly handled, one thumb-mark at the lower right corner. Two edges cut clean,
two edges softly irregular.
FRAMING-SHEET
```

---

### `P03` — the press stock

```
wshwash, a single large sheet of cheap coarse handmade printing paper, blank and
unused, of the grade a country printing office bought by the ream: badly beaten
pulp with visible specks and dark fibre flecks through it, unevenly formed so the
sheet is thin and translucent in some places and cloudy and thick in others,
poorly sized so the surface is soft and absorbent, the colour a dull greyish buff
rather than cream. All four edges trimmed straight with a knife. The sheet has
been folded once and opened out.
FRAMING-SHEET
```

---

### `P04` — the pamphlet leaf

```
wshwash, a single thin leaf from a cheaply stitched pamphlet, blank and unused,
taller than it is wide, the left edge showing three small stitch holes and a
short length of coarse thread where it was sewn into the gathering, the other
three edges trimmed. The paper is thin and soft and shows a faint cloudy
mottling. One corner is dog-eared and has been folded back and flattened again.
FRAMING-SHEET
```

---

### `P05` — the ledger folio

```
wshwash, a single large blank leaf of heavy account-book paper, taller than it is
wide, thicker and harder than writing paper and slightly cool greenish grey in
colour, very evenly formed with a smooth burnished surface, all four edges cut
perfectly straight and square. The leaf is completely flat with no folds. Along
the left edge a narrow band is very slightly darker where the leaf was bound.
FRAMING-SHEET
```

---

### `P06` — the orderly book opening. Uses `FRAMING-OPENING`; ships two `type_frame` rectangles, `[92,84,468,600]` and `[640,84,468,600]`.

```
wshwash, a small bound manuscript book lying open at a blank opening, both facing
leaves completely blank and unused, the paper a plain serviceable cream laid
stock. The book is bound in worn limp leather over thin boards; the sewn gutter
runs down the centre with the linen thread visible at head and tail and a soft
shadow falling into the fold. The fore-edges of the block are dirtied and rounded
from thumbing. The book lies flat and open of its own accord.
FRAMING-OPENING
```

---

### `P07` — the engrossing skin

```
wshwash, a single sheet of heavy engrossing parchment, blank and unused, of the
quality used for a formal instrument: thick, stiff, very smooth and slightly
translucent, pale warm ivory with the faintest variation of tone across it and a
few fine hair follicle marks catching the light. All four edges cut perfectly
straight. Near the lower edge, two narrow horizontal slits have been cut through
the sheet a hand's breadth apart, where a ribbon would be threaded. No fold of
any kind.
FRAMING-SHEET
```

---

### `P08` — carried paper

```
wshwash, a single sheet of good cream laid writing paper, blank and unused, that
has been carried folded in a coat pocket for many days: folded twice into
quarters and opened flat again so two hard creases cross it, the paper softened
and slightly furred along both creases and beginning to separate at their
crossing, the four corners rounded and dark with handling, the whole sheet
faintly smoke-darkened and warmer than fresh paper. Two edges cut, two softly
irregular.
FRAMING-SHEET
```

---

### `P09` — the water-stained sheet. **Exactly two documents may use it: `DOC-A3.2` and `DOC-A7.1`.** The linter (§8.1) fails a third.

```
wshwash, a single sheet of cream laid writing paper, blank and unused, that has
been wet and dried: one broad irregular water stain spreading in from the lower
left corner across about a third of the sheet, its outer boundary a distinct
darker tideline where the water stopped and the dissolved sizing settled, the
stained area very slightly cooler and duller than the dry paper and faintly
cockled so the surface no longer lies perfectly flat. The rest of the sheet is
clean and unmarked. Two edges cut, two softly irregular.
FRAMING-SHEET
```

The stain is at the **lower left** on both, and it must be, because the DOM `type_frame` is authored around it once and used twice.

---

### `P10` — French laid

```
wshwash, a single sheet of fine French handmade laid writing paper, blank and
unused, distinctly cooler and greyer in tone than English cream paper, very
smoothly and evenly formed, the chain lines spaced noticeably wider apart than in
an English sheet and the laid lines finer, one watermark device showing faintly
as a thinner place in the sheet near the centre of one half. The sheet has been
folded once and opened flat. Two edges cut, two softly irregular.
FRAMING-SHEET
```

---

### `P11` — the newspaper folio

```
wshwash, a single very large thin blank leaf of cheap newspaper stock, taller
than it is wide, so thin that light comes through it and the surface behind shows
faintly, poorly formed with visible fibre clumps and dark specks, dull grey-buff
in colour, soft and slightly furred at all four trimmed edges where a blunt knife
cut it. One long horizontal fold across the middle where the sheet was folded for
carrying.
FRAMING-SHEET
```

---

### `P12` — the plan sheet

```
wshwash, a single very large blank sheet of good cartridge paper laid down on a
backing of fine linen, seen flat: the paper a cool pale cream, smooth and evenly
formed, all four edges softly irregular where the pulp met the mould, and the
linen backing showing as a narrow woven border a finger's breadth wide all round
the paper's edge. The sheet has been folded into eight rectangles and opened out
again, so a regular grid of soft creases crosses it, one crease slightly split
where the folds intersect at the centre. The paper is blank and unmarked.
FRAMING-SHEET
```

## 2.4 The illegible-hand library — two generations, thirty strips

**This is the asset the design would otherwise have forgotten**, and without it the two-layer document does not exist: the artefact view has to *look written on* while the transcription view has to be clean, and both have to be the same object.

**Two generations, each a 2048 × 2048 sheet of stroke bands.** Cut into 30 strips, each a single line of illegible marks 1600 × 64 px, packed into one 2048² WebP with alpha. The engine composites `n` strips down the `type_frame` at the line height the transcription will use, so the artefact's line count *is* the transcript's line count and the cross-dissolve registers.

| Sheet | Registers | Strips |
|---|---|---|
| `HL-1` manuscript | SECRETARY ×8, ROUGH ×8, ENGROSSED ×4 | 20 |
| `HL-2` printed | PRINTED-fine ×5, PRINTED-rough ×5 | 10 |

```
wshwash, a study sheet of twenty separate horizontal bands of ink marks on plain
cream paper, each band a single unbroken line of small quill strokes made with
brown-black iron gall ink, running the full width of the band with even spacing
above and below it. The strokes are the rhythm and pressure of eighteenth-century
handwriting reduced to abstract marks — loops, ascenders, descenders, ligatures
and the shading of a flexible quill nib — but they form no letters and no words
and nothing in them can be read. The first eight bands are an even, fluent,
well-spaced educated hand written slowly with a well-cut nib. The next eight are
a hurried uneven hand written with a worn nib, the pressure varying, the ink
running dry twice within each band and being taken up again darker. The last four
are large, wide, deliberately formed ceremonial strokes, twice the height of the
others, evenly spaced and very regular. Clear bare paper between every band.
FRAMING-STUDY
```

```
wshwash, a study sheet of ten separate horizontal bands of printed ink marks on
plain cream paper, each band a single line of small dense marks impressed into
the paper by metal type, running the full width of the band. The marks have the
even vertical rhythm, uniform height and hard squared ends of letterpress
printing and the paper is visibly bruised where they bit into it — but they form
no letters and no words and nothing in them can be read. The first five bands are
cleanly and evenly inked with fine even marks and generous spacing. The last five
are coarse and battered: heavier marks, unevenly inked so that some parts of the
band are black and clogged and others are grey and starved, with the marks
sitting slightly crooked on the line and the impression punched unevenly into the
paper. Clear bare paper between every band.
FRAMING-STUDY
```

**Anti-repetition, and its one prohibition.** The engine draws strips by a hash of the document ID and line index, with a random horizontal offset of 0–380 px and a right-hand crop to the transcript's actual line length. **Mirroring is forbidden.** Mirrored handwriting is instantly recognisable and would turn a subtle economy into a visible trick. Offsets and crops only.

**Two registers on one page is free and it is used twice.** `DOC-A5.2` (von Steuben's drill, French with English interlineation) composites PRINTED-fine strips at full line height with SECRETARY strips at half height between them. `DOC-A5.3` (the Conway letter as reported by Wilkinson) composites SECRETARY strips inside a block of *different* SECRETARY strips at 88% scale with a wider left indent — the quoted hand inside the reporting hand. **The typography is the lesson and the artefact layer tells it before the transcript does.**

## 2.5 `DOC-F1` — seals, ribbons and ties. One 1536 × 1536 sheet, 3 × 3.

```
wshwash, a page from a sketchbook: nine separate small studies of the fastenings
of letters and documents arranged in a neat three by three grid on bare cream
paper, each object isolated with clear space around it and no overlapping — first
a blob of dark red sealing wax freshly impressed with a small oval signet device,
the wax still glossy and squeezed out unevenly at the edges; second the same seal
cracked across in two places but still holding; third a broken seal, the wax
split into two pieces with a torn fibre of paper lifted between them; fourth a
small oval paper wafer used as a cheap seal, pressed flat and slightly
translucent; fifth a short length of narrow blue silk ribbon with a cut end,
lying in a soft curve; sixth the same in a drab olive silk; seventh a woven linen
tape tie, flat and slightly frayed at the end; eighth a heavy plaited silk cord
with a large disc of wax hanging from it in a turned wooden case; ninth a small
brass pin bent into a paper. Even flat light. No shadows on the paper.
FRAMING-STUDY
```

**The wax is `SEAL-RED #8C2F2A` and nothing else in the game is.** `02` §2.4 makes this the strictest colour in the palette: one colour, one meaning, game-wide. Sample every wax cell at acceptance; anything outside ΔE 6 gets colour-corrected in post rather than regenerated.

## 2.6 `DOC-F2` — edges, folds, damage, and the foxing ban. One 1536 × 1536 sheet, 3 × 3.

```
wshwash, a page from a sketchbook: nine separate small studies of the condition
of old paper arranged in a neat three by three grid on bare cream paper, each
study isolated with clear space around it — first a long strip of a deckled paper
edge, softly irregular and slightly thinner where the pulp thinned at the mould;
second a long strip of a cleanly guillotined edge, straight and hard with the cut
fibres showing; third a torn edge, the paper pulled apart so the tear shows a
soft feathered lip of fibre along one face; fourth a hard fold crease seen close,
the paper compressed and slightly darker in the line and beginning to split at
one point; fifth a corner worn round and darkened by thumbing; sixth a small
spatter of ink, one large drop and three fine satellites; seventh a passage of
writing scraped out of the paper with a knife, the surface roughened and lifted
and slightly paler than the paper round it; eighth a scatter of fine drying sand
caught in a still-wet mark; ninth a group of small rust-coloured spots spreading
in the paper's fibre. Even flat light. No shadows on the paper.
FRAMING-STUDY
```

**Cell nine is foxing and it is banned everywhere except one place.** `02` §4.5 bans foxing outright — *the game is not set in an archive, the paper is fresh, the ink is wet, the war is happening now* — and that ban stands. It is generated once because `07` §5.1 requires *foxing at the gutter* on the **LOW-band epilogue book**, which is a printed volume of the 1790s seen from a much later vantage and is therefore the only object in the game entitled to be old. The cell is marked `restricted: ["epilogue-book-low"]` in the ledger, and the linter fails any other consumer. **One asset, one consumer, and the exception proves the rule loudly.**

## 2.7 The complete document → stock assignment

All 51 documents plus the epilogue ledger. `overlays` are cells from `DOC-F1`/`DOC-F2`, composited in the DOM. `hand` is the strip register from §2.4.

| Doc | Source | Stock | Hand | Overlays |
|---|---|---|---|---|
| `DOC-A1.1` | Articles of Capitulation, Fort Necessity 1754 | `P10` | SECRETARY | fold-quarto · seal-broken · ink-blot |
| `DOC-A1.2` | The Fairfax Resolves | `P03` | PRINTED-rough | — |
| `DOC-A1.3` | *Bloody Butchery*, Salem broadside | `P03` | PRINTED-rough | coffin-cut row (`UI-2`) |
| `DOC-A1.4` | Lund Washington's building account | `P05` | ROUGH | thumb-corner |
| `DOC-A1.5` | Invoice to Robert Cary & Co. | `P03` | PRINTED-fine | fold-quarto |
| `DOC-A1.6` | GW to Bryan Fairfax, 24 Aug 1774 | `P01` | SECRETARY | — |
| `DOC-A1.7`* | Commission, Fairfax Independent Company | `P07` | ENGROSSED | ribbon-drab · seal-fresh |
| `DOC-A2.1` | Rev. William Emerson, 17 Jul 1775 | `P01` | SECRETARY | — |
| `DOC-A2.2` | The powder return, August 1775 | `P03` | PRINTED-rough | ink-blot |
| `DOC-A2.3` | **Dunmore's Proclamation, 7 Nov 1775** | `P03` | PRINTED-rough | — |
| `DOC-A2.4` | General Orders, 30 Dec 1775 | `P06` | SECRETARY | — |
| `DOC-A2.5` | Knox to GW, 17 Dec 1775 | `P08` | ROUGH | fold-quarto · seal-broken |
| `DOC-A2.6` | GW to Joseph Reed, 1775 | `P01` | SECRETARY | scrape-out |
| `DOC-A2.7` | General Orders, 4 Jul 1775 | `P03` | PRINTED-fine | — |
| `DOC-A3.1` | Congress's resolution to hold New York | `P03` | PRINTED-fine | — |
| `DOC-A3.2` | British troop-movement report — **inaccurate** | **`P09`** | ROUGH | fold-quarto · torn-edge |
| `DOC-A3.3` | The Jamaica Pass patrol order | `P08` | SECRETARY | thumb-corner |
| `DOC-A3.4` | The evacuation manifest | `P05` | ROUGH | ink-blot · sand |
| `DOC-A3.5` | Thacher's journal on Mrs. Murray | `P06` | SECRETARY | — |
| `DOC-A3.6` | Arnold's dispatch, Lake Champlain | `P08` | SECRETARY | fold-quarto · seal-cracked |
| `DOC-A3.7` | GW to Hancock, 2 Sep 1776 | `P01` | SECRETARY | — |
| `DOC-A4.1` | Paine, *The American Crisis* No. I | `P04` | PRINTED-rough | dog-ear |
| `DOC-A4.2` | A re-enlistment paper | `P03` | PRINTED-rough + ROUGH | thumb-corner |
| `DOC-A4.3` | Robert Morris's note advancing specie | `P02` | SECRETARY | fold-thirds · wafer |
| `DOC-A4.4` | The password order, *Victory or Death* | `P02` | SECRETARY | fold-thirds |
| `DOC-A4.5` | The story of Rall's unread note | `P04-late`† | PRINTED-fine | — |
| `DOC-A4.7` | GW to Congress, 27 Dec 1776 | `P01` | SECRETARY | — |
| `DOC-A5.1` | GW to Congress, 23 Dec 1777 | `P01` | SECRETARY | — |
| `DOC-A5.2` | Von Steuben's drill, in draft | `P01` | PRINTED-fine **+** SECRETARY interlinear | — |
| `DOC-A5.3` | The Conway letter, as reported by Wilkinson | `P01` | SECRETARY **inside** SECRETARY-88% | — |
| `DOC-A5.4a` | Arnold's account of Bemis Heights | `P08` | SECRETARY | fold-quarto |
| `DOC-A5.4b` | Gates's despatch, as published | `P11` | PRINTED-rough | — |
| `DOC-A5.5` | The inoculation order | `P06` | SECRETARY | — |
| `DOC-A5.6` | Treaty of Alliance, 6 Feb 1778 | `P07` | ENGROSSED | silk-cord · pendant-seal |
| `DOC-A5.7` | A ration return: *fire cake and water* | `P03` | PRINTED-rough + ROUGH | — |
| `DOC-A6.1` | De Grasse to Washington | `P10` | SECRETARY | fold-quarto · seal-broken |
| `DOC-A6.2a` | The Chatham bake-oven return | `P03` | PRINTED-rough + ROUGH | — |
| `DOC-A6.2b` | A letter written to be intercepted | `P01` | SECRETARY | fold-quarto · seal-broken |
| `DOC-A6.3` | Articles of Capitulation, 19 Oct 1781 | `P07` | ENGROSSED | ribbon-blue · seal-fresh |
| `DOC-A6.4` | The HMS *Savage* list | `P05` | ROUGH | — |
| `DOC-A6.5` | The siege journal; the unloaded-muskets order | `P06` | SECRETARY | — |
| `DOC-A6.6` | The Charleston terms, May 1780 | `P03` | PRINTED-fine | — |
| `DOC-A6.7` | GW to Thomas McKean, 19 Oct 1781 | `P01` | SECRETARY | — |
| `DOC-A7.1` | **The anonymous Newburgh Address** | **`P09`** | ROUGH | fold-quarto |
| `DOC-A7.2` | The officers' memorial, Dec 1782 | `P07` | ENGROSSED | ribbon-drab |
| `DOC-A7.3` | GW to Joseph Jones | `P01` | SECRETARY | — |
| `DOC-A7.4` | The commutation resolution, 22 Mar 1783 | `P03` | PRINTED-fine | — |
| `DOC-A7.5` | Bounty-land warrants | `P03` | PRINTED-fine + ROUGH | cartouche border (`UI-2`) · seal-fresh |
| `DOC-A7.6` | Washington's address and speech notes | `P01` | SECRETARY | scrape-out · ink-blot |
| `DOC-A7.7` | The Circular Letter to the States | `P03` | PRINTED-fine | — |
| `DOC-A8.1` | The resignation address, 23 Dec 1783 | `P07` | ENGROSSED | — |
| `DOC-EP.1` | **The Book of Negroes, 1783** | `P05` | ROUGH | — |
| — | Every map document laid on a table (×3) | `P12` | — | fold-eight |

\* `DOC-A1.7` is a findable paper object in `MV-02`/`MV-04` that `05` §1.5 lists among the scene's findables rather than in its document table. It needs a stock and a viewer entry like any other, and it is the object `A1-D3` is about.
† `P04-late` is the **same generation** as `P04`, rendered by the engine with a cold tint toward `PAPER-COOL`, a guillotined edge on all four sides, and no dog-ear. Zero art cost, and the paper itself dates the telling: the object that reports Rall's unread note is made of paper that did not exist in 1776. `05` calls this document "a lesson in provenance"; this is that lesson delivered in the material before a word is read.

**Stock utilisation:** `P01`×15 `P02`×2 `P03`×13 `P04`×3 `P05`×4 `P06`×4 `P07`×5 `P08`×5 `P09`×**2** `P10`×3 `P11`×1 `P12`×3. `P11` earns its generation on one document because a printed despatch in a *newspaper* — versus Arnold's own account on carried writing paper, on the same table, disagreeing about the same battle — is the entire teaching payload of `MT-04`.

## 2.8 Erratum against `06` §5.6

`document.schema.json` gives `paper` as a file path (`"paper": "doc/a02_xx_doc_return-of-ordnance_v02.webp"`), which implies one generated sheet per document — 51 sheets, ~20 MB, and a re-bake every time a document's text changes length.

**Corrected schema, and the linter checks it:**

```json
"paper":    "P03",
"paper_variant": null,
"hand":     "PRINTED-rough",
"overlays": ["fold-quarto", "seal-broken"],
"type_frame": [64, 72, 640, 948]
```

- `paper` is a **stock ID from §2.2**, resolved through `registry/paper-stocks.json`.
- `paper_variant` is `null` or `"late"` (§2.7 †). Two documents may not declare the same variant of `P09`; **`L512`: at most two documents may declare `P09` at all.**
- `hand` selects the strip register; a document with `body[]` runs but no `hand` fails `L513`.
- `type_frame` defaults from the stock and is overridden only for the two `P06` leaves and `P09`'s stain avoidance.

---

# 3. THE COLLECTIBLE PROPS — 23 SHEETS, 207 OBJECTS

## 3.1 Two channels, and the finding that pays for them

A prop in this game is consumed in two completely different ways and the design has been treating them as one:

| Channel | What it is | Pipeline | Ships as |
|---|---|---|---|
| **Cabinet** | the examine close-up, the letterbook *Documents* tip-in, the Persons entry object | **DOM** `<img>`, exactly like portraits (`06` §6.3) | 4 shared 2048² WebP atlases, 52 cells each |
| **Toggle** | the mood-driven prop that appears or disappears in the scene (`02` §3.6: six per scene) | Three.js sprite on `L2`/`L3` | 8 per-act 1024² KTX2 atlases |

**Both come from the same 23 generations.** A prop is cut once, then exported twice: at 256 × 256 into a cabinet atlas and, if it is one of the ~40 per act that a scene toggles, trimmed and packed into that act's toggle atlas.

**The finding:** props overwhelmingly do **not** need GPU textures. `05` §13.3 budgeted "prop atlases 4 × 1024²" and `06` §4.6 budgeted a 2048² act prop atlas as though every prop were in the scene. Most are not — a prop the player *examines* is a DOM image over a still frame, and a prop that is *scenery* was painted into the plate by `03a` and costs nothing. Only the toggles are textures. That correction is what makes 207 objects affordable; the cost is 9.6 MB of toggle atlases, which is +4.8 MB against `05` and lands at 1.2 MB per act chunk.

## 3.2 The sheet method, restated with the one rule that makes it work

Nine objects per sheet, 3 × 3, `FRAMING-STUDY`, generated at **1536 × 1536**. Nine objects that share lighting, palette, ink weight and paper *by construction* (`ai-art-production-guide.md` §2.5) instead of nine that drift.

> **Objects are grouped onto a sheet by the scene they appear in, never by what kind of object they are.**

A sheet of "all the game's hats" would be efficient to prompt and useless in production, because those hats appear in six different acts under six light laws and would have to be regraded individually. A sheet of "everything on the table in `CB-02`" is generated once under Act 2's flat overcast and drops into the scene as a set. **The grouping is the scene, and the sheet is therefore a set-dressing decision made at blockout, not a taxonomy.**

Two consequences: each sheet appends **its act's light law verbatim** (`ai-art-production-guide.md` §5.5) after the framing line; and each sheet's seed is its act's family — `a01` sheets use 10001–10003, `a05` sheets 50001–50003, globals 90101–90103.

## 3.3 The 23 sheets

Every prompt below is `wshwash,` + the subject line + `FRAMING-STUDY` + the act light law + `style-block.txt` + `doc-negative.txt`. The negative block is the document one, not the character one: these are objects on paper and the failure mode is the same (a model wants to write on the ration return).

---

### Global — `GP-1` · The writing desk · `gl_xx_pr_writing-desk_v01`

Light law: **flat even frontal, no directional key.** Globals are graded per-act at runtime and must ship neutral.

```
a page from a sketchbook: nine separate small studies of the furniture of an
eighteenth-century writing desk arranged in a neat three by three grid on bare
cream paper, each object isolated with clear space around it and no overlapping —
a lidded brass and mahogany inkstand with a glass well; a goose quill cut to a
nib with the barbs stripped from the shaft so it is a bare white shaft, not a
plume; a small folding penknife with a horn handle, open; a perforated pewter
sand caster for drying ink; a stick of dark red sealing wax and a short lit taper
in a small brass stand; an oval brass seal matrix with a turned wooden handle; a
shallow wooden box of fine drying sand; a small round tin box of paper wafers,
lid off; an iron spike on a lead base with folded papers impaled on it.
```

**The stripped quill shaft is a required correction**, not a flourish: `historical-visual-reference.md` §4.1 is explicit that period quills had the barbs cut away and a fluffy plume is a cartoon. This sheet's quill is the reference for every quill in the game, including the one in the interlude still.

---

### Global — `GP-2` · The surveyor's instruments · `gl_xx_pr_surveying_v01`

Light law: flat even frontal.

```
a page from a sketchbook: nine separate small studies of a land surveyor's
instruments arranged in a neat three by three grid on bare cream paper, each
object isolated with clear space around it — a brass circumferenter, a flat
compass dial with two upright slit sights, mounted on a socket; a jointed wooden
staff with an iron shoe; a Gunter's chain of a hundred flat iron links with brass
tally tags, gathered into a folded bundle; a small plane table with a boxwood
alidade laid across it; a pair of heavy brass dividers; a pair of proportional
compasses with a sliding pivot; a flat boxwood scale rule; a small limp-bound
field notebook, closed, its cover rubbed; a pocket compass in a turned wooden
case with the lid open.
```

**These are seeded in Act 1 before the map table exists.** `05` §10.4's justification for the whole map-table mechanic — *the game teaches the player who this man is by how he looks at ground* — depends on the player finding these on the forecourt at Mount Vernon in minute four, so they are generated in the first production wave (index §3) and not with the rest of Act 1.

---

### Global — `GP-3` · Books, bindings and the spectacles · `gl_xx_pr_books_v01`

Light law: flat even frontal.

```
a page from a sketchbook: nine separate small studies of books and reading things
arranged in a neat three by three grid on bare cream paper, each object isolated
with clear space around it — a quarto letterbook bound in plain calf, closed,
with four narrow silk ribbon markers of different drab colours hanging from the
fore-edge; a flat ivory paper knife; a small octavo volume bound in cheap sheep,
closed and slightly warped; a larger quarto bound in good calf with a plain
gilt-tooled border, closed; a tall ruled manuscript ledger bound in vellum,
closed, with linen ties; a single sheet of marbled paper in drab combed patterns;
a small brass book clasp; a pair of oval steel-framed spectacles with straight
temple arms, folded; a shagreen spectacle case, open and empty.
```

**The spectacles are here, not in Act 7.** They are planted unworn in a drawer in `MV-02` in Act 1 and paid off at Newburgh eight acts later, and `05` says explicitly: *do not remark on it*. Generating them globally guarantees the object in the drawer and the object in his hand at the Temple are the same object, pixel for pixel, which is the only way that payoff survives.

---

### Act 1 — `A1P-1` · The gentleman's rooms · `a01_xx_pr_study_v01`
Light law: **high warm sun, key from frame-left, 55° elevation.**

```
a page from a sketchbook: nine separate small studies of the contents of a
Virginia planter's study arranged in a neat three by three grid on bare cream
paper, each object isolated with clear space around it — a small octavo volume in
plain calf lying closed; a japanned tin document box with a hasp, closed; a
leather-bound account book with brass corners; a heavy vellum-bound company
ledger, closed and lying flat; a turned brass candlestick with a half-burnt
candle; a silver-hilted small sword in its scabbard; a long fowling piece with a
walnut stock and brass furniture, lying flat; a terrestrial globe on a turned
mahogany stand; a mahogany chair with a shield back and a slip seat.
```

---

### Act 1 — `A1P-2` · The Virginia colonel · `a01_xx_pr_colonel_v01`
Light law: as Act 1.

```
a page from a sketchbook: nine separate small studies of a provincial officer's
old campaign things arranged in a neat three by three grid on bare cream paper,
each object isolated with clear space around it — a crescent-shaped engraved
brass gorget on a narrow ribbon; a wide crimson silk officer's sash, folded; a
folded dark blue coat with pale buff facings and turned-back cuffs, folded so the
facings show; a black felt hat with its flat brim folded up against a low crown
on three sides, bound at the edge and with a black cockade at the left side; a
pair of leather saddle holsters with the pistol butts showing; a curb bit with
its chain; a folded fringed linen hunting shirt of undyed cloth; a leather
portmanteau with two straps; a plaited riding whip.
```

---

### Act 1 — `A1P-3` · The Quarter · `a01_xx_pr_quarter_v01` · **`sensitive: true`**
Light law: as Act 1, but **eye-level and flat** — this sheet is R5-adjacent.

```
a page from a sketchbook: nine separate small studies of possessions and
household things arranged in a neat three by three grid on bare cream paper, each
object isolated with clear space around it — a low round earthenware bowl of
coarse dark hand-built pottery with a burnished surface; a small white
salt-glazed stoneware teabowl with a moulded rim, chipped at one side; a worn
pewter spoon; a knife with a shaped bone handle; a short clay tobacco pipe with a
broken stem; a small heap of oyster shells; an iron cooking pot with three feet
and a bail handle, older and different in make from estate ironwork; a fiddle
with a shaped pegbox and a repaired crack in its belly; a blue glass bead and a
plain copper ring threaded together on a cord.
```

**This sheet is `sensitive: true` and carries the `historical-visual-reference.md` §7.6 gate.** It is the archaeology of the House for Families, furnished exactly, and it is the material argument of `MV-03`. Two rules on it, both binding: **nothing on this sheet may be picturesque** — no artful arrangement, no charm, no folk-art prettiness — and **the objects are drawn with the same care and the same line weight as the silver-hilted sword on `A1P-1`.** The difference in the two sheets must be entirely a difference in what the objects are, never in how well they were looked at.

---

### Act 2 — `A2P-1` · The shanty camp · `a02_xx_pr_shanty_v01`
Light law: **flat overcast, no directional key, cool grey.**

```
a page from a sketchbook: nine separate small studies of improvised shelters and
camp gear arranged in a neat three by three grid on bare cream paper, each object
isolated with clear space around it — a small lean-to shelter built of mismatched
boards and scraps of sailcloth nailed together; a low hut of stacked turf and
field stone with a sailcloth roof; a rough shelter of bent brush and cut birch
saplings; a black iron camp kettle with a bail handle; a turned wooden mess bowl;
a horn spoon; a dented tin cup; a flat wooden canteen bound with two iron hoops;
a felling axe with a worn helve.
```

---

### Act 2 — `A2P-2` · The headquarters · `a02_xx_pr_headquarters_v01`
Light law: as Act 2.

```
a page from a sketchbook: nine separate small studies of the working furniture of
an army headquarters arranged in a neat three by three grid on bare cream paper,
each object isolated with clear space around it — a japanned tin dispatch case
with a carrying strap; a thick bundle of folded papers tied crosswise with linen
tape; a brass spyglass of three draws, closed; the same spyglass fully extended;
a pair of brass dividers lying open; a long boxwood ruler; a brass candle branch
with two arms; a low Windsor chair with turned legs; a rolled bedroll of grey
blanket with a strap round it.
```

The spyglass gets two cells because `05` §3.3 hangs a knowledge lock on it — the `A2-D2` observation flag is set by *using* it, so it must read as an instrument in two states rather than as a decoration in one.

---

### Act 2 — `A2P-3` · The lines · `a02_xx_pr_lines_v01`
Light law: as Act 2.

```
a page from a sketchbook: nine separate small studies of field fortification and
artillery gear arranged in a neat three by three grid on bare cream paper, each
object isolated with clear space around it — a gabion, a bottomless cylindrical
basket of woven withies about waist high, filled with earth that spills over the
rim; a fascine, a long bundle of cut branches bound at intervals with withy ties;
a sharpened stake cut to a point at one end; a small wooden powder keg with iron
hoops; a black leather cartridge box on a buff shoulder belt; a linstock with a
length of slow match wound round it; a rammer and a sponge on long staves, laid
together; a large spoked wooden field-carriage wheel with an iron tyre; a furled
flag on a plain staff, the cloth wrapped and tied so no device shows.
```

**The flag is furled and no device shows, deliberately.** The Grand Union is `CB-03′`'s teaching object and it is painted into that plate by `03a` under controlled conditions. A prop-sheet flag would be the single most likely place in the entire project for the model to produce a Betsy Ross ring of stars (`historical-visual-reference.md` F-08), and the cheapest defence is to never let it draw a canton at all.

---

### Act 3 — `A3P-1` · The Brooklyn line · `a03_xx_pr_line_v01`
Light law: **low sun from frame-right dropping to fog.**

```
a page from a sketchbook: nine separate small studies of entrenching work
arranged in a neat three by three grid on bare cream paper, each object isolated
with clear space around it — a section of abatis, several felled young trees laid
with their sharpened branch ends turned outward in a tangled thicket; a long
spade with an iron-shod wooden blade; a pickaxe; a single-wheeled wooden barrow;
a heavy curved fascine knife; a squared oak timber cut and notched for a gun
embrasure; a side drum with rope tensioners and a painted hoop, the device
indistinct; a linen haversack with a flap and a single button; a wooden bucket
with two iron hoops and a rope bail.
```

---

### Act 3 — `A3P-2` · The ferry, night · `a03_xx_pr_ferry_v01`
Light law: **moonlight from frame-right**, and the sheet ships with the lowest chroma in the game.

```
a page from a sketchbook: nine separate small studies of boats and boat gear
arranged in a neat three by three grid on bare cream paper, each object isolated
with clear space around it — a flat-bottomed open ferry scow with square ends and
low sides; a long ash oar with a shaped loom; an iron boat hook on a pole; a horn
lantern with a hinged door and a candle inside; a coil of tarred rope; a folded
sail of coarse canvas, roughly bundled; a small sea chest with rope beckets at
the ends; a short blue woollen sailor's jacket with flat pewter buttons, folded;
a wooden bailing scoop.
```

---

### Act 4 — `A4P-1` · The river camp · `a04_xx_pr_river_v01`
Light law: **night; torchlight from within the frame, warm, low, from frame-left.**

```
a page from a sketchbook: nine separate small studies of things on the bank of a
winter river arranged in a neat three by three grid on bare cream paper, each
object isolated with clear space around it — a Durham boat, a long narrow open
cargo boat with high straight sides, a shallow flat bottom, square ends and
thwarts along its length, drawn small and complete; a long iron-shod setting
pole; a smoking fire of green wood on a bed of stones; a knapsack crusted with
frozen sleet; a shoe with the sole entirely gone from it; a foot wrapped in
strips of blanket and tied with cord; a rolled paper with a broken wafer; a small
canvas purse spilling a few silver coins; a leather cartridge box with its flap
torn away.
```

**The Durham boat is drawn small and complete** so that its proportion is unmistakable — `historical-visual-reference.md` F-17 says the QA check is *"is the boat longer than eight men standing shoulder to shoulder?"*, and a cropped study cannot be checked.

---

### Act 4 — `A4P-2` · Trenton · `a04_xx_pr_trenton_v01`
Light law: as Act 4, and **hold generation until V-1 (Hessian facings) closes** — see §9.

```
a page from a sketchbook: nine separate small studies of German military
equipment arranged in a neat three by three grid on bare cream paper, each object
isolated with clear space around it — a grenadier's cap, a tall stiff pointed
cloth mitre with a large embossed brass front plate, brass side supports and a
brass finial at the tip; a short curved brass-hilted hanger sword in its
scabbard; a small brass field gun barrel on a low wooden carriage; a side drum
with brass shell and painted hoops, its device indistinct; a short flintlock
fusil with brass furniture; a curved cow-horn powder flask with a turned wooden
plug; a spontoon with a leaf-shaped head on a long shaft; a heavy spoked cart
wheel; a regimental colour rolled tightly and sewn into an oilcloth case so no
device shows.
```

---

### Act 4 — `A4P-3` · The winter soldier · `a04_xx_pr_winter_v01`
Light law: as Act 4.

```
a page from a sketchbook: nine separate small studies of a soldier's winter kit
arranged in a neat three by three grid on bare cream paper, each object isolated
with clear space around it — a coat cut and sewn from a grey blanket, the
selvedge stripe still visible, folded; a mitten made from the same blanket cloth;
a wooden canteen with ice in its mouth; a pierced tin candle lantern; a flat hard
cake of baked flour and water on a board; a flint and steel with a tin of charred
linen; a flintlock lock plate glazed with ice, the cock and frizzen frozen shut;
a rolled grey greatcoat with a strap; a pair of loose linen overalls patched at
both knees with mismatched cloth.
```

---

### Act 5 — `A5P-1` · The hut · `a05_xx_pr_hut_v01`
Light law: **low winter sun from frame-left, 15°, cold and blue-shadowed.**

```
a page from a sketchbook: nine separate small studies of the inside of a log
soldiers' hut arranged in a neat three by three grid on bare cream paper, each
object isolated with clear space around it — a small complete log hut drawn from
outside, squared logs notched at the corners, a low door in the long side, gaps
between the logs sealed with clay, a chimney of sticks and clay at the far end; a
short section of that clay-and-stick chimney seen close; a bunk frame of poles
lashed together; a straw palliasse, thin and flattened; a turned wooden trencher;
a besom broom of twigs bound to a stick; a fine double-sided comb of horn; a
cobbler's iron last with an awl and a length of waxed thread; a small limp-bound
notebook, closed, its cover water-marked.
```

---

### Act 5 — `A5P-2` · The hospital hut · `a05_xx_pr_hospital_v01` · **`sensitive: true`**
Light law: as Act 5, but **flat** — no directional key, per the Witness Register's restraint that `05` §5.3 applies to `VF-04`.

```
a page from a sketchbook: nine separate small studies of the equipment of a camp
hospital arranged in a neat three by three grid on bare cream paper, each object
isolated with clear space around it — a straw pallet with a folded coarse
blanket; a horn drinking cup; a small folding lancet with a tortoiseshell case; a
shallow white tin bleeding bowl with a graduated interior; a squat glass bottle
with a paper-covered cork; a wooden crutch with a padded crosspiece; a roll of
torn linen bandage; a shallow wooden box of dried bark; a long-handled spade with
fresh earth still on the blade.
```

**Nothing on this sheet depicts a wound, a body or blood, and nothing ever will.** `02` §9 rule 10 is exact about it — a three-value wash over a confident line is constitutionally incapable of rendering gore and looks wrong when pushed toward it. The spade is the last cell for the same reason the game delivers Act 3's casualties as numbers Washington writes himself: **the object carries what the picture must not.**

---

### Act 5 — `A5P-3` · The Grand Parade · `a05_xx_pr_parade_v01`
Light law: as Act 5.

```
a page from a sketchbook: nine separate small studies of drill and supply
arranged in a neat three by three grid on bare cream paper, each object isolated
with clear space around it — a flintlock musket with a brass-mounted walnut stock
and a fixed triangular socket bayonet, held vertical; a small limp-bound
manuscript book, closed, its cover plain; a serjeant's halberd with a small axe
blade and a spike; a furled and cased regimental colour on its staff; a wooden
fife in a brass-mounted case; a side drum with a buff sling; a second flintlock
musket with iron barrel bands and iron furniture instead of brass, held vertical;
a bale of coarse woollen cloth bound with cord; a wooden cask with iron hoops and
a burnt brand on the head, the brand indistinct.
```

The two muskets are the pedagogy: **brass furniture and pipes is a Brown Bess, iron bands is a Charleville**, and after the alliance the army has both. `historical-visual-reference.md` §4.3 calls the furniture the fastest tell at a glance, and putting them on one sheet is what makes it a glance.

---

### Act 6 — `A6P-1` · The siege · `a06_xx_pr_siege_v01`
Light law: **high hazy sun near-overhead, dust-warm, minimal shadow.**

```
a page from a sketchbook: nine separate small studies of siege engineering
arranged in a neat three by three grid on bare cream paper, each object isolated
with clear space around it — a filled gabion, a woven withy cylinder packed with
earth; a saucisson, a very long thick bundle of branches bound at intervals; a
stack of fascines laid crosswise; a sap roller, a huge cylinder of bound brushwood
taller than a man; a heavy timber mortar bed with a squat wide-mouthed brass
mortar in it; a siege gun carriage with small solid wheels and a long timber trail;
a hollow iron shell with a wooden fuse plug; a brass gunner's quadrant with a
plumb line; a bundle of sharpened stakes tied at the middle.
```

---

### Act 6 — `A6P-2` · The marquee and the alliance · `a06_xx_pr_marquee_v01`
Light law: as Act 6.

```
a page from a sketchbook: nine separate small studies of a commander's field
quarters and French things arranged in a neat three by three grid on bare cream
paper, each object isolated with clear space around it — a large oval field
marquee of unbleached linen with a ridge, rounded ends, walls and a fly over it,
its guy lines fanning out, drawn small and complete and noticeably wider than it
is deep; a folding iron camp bedstead with a canvas bottom; a folding wooden camp
table with crossed legs; a small silver card case; a dark green glass wine bottle
with two plain stemmed glasses; a folded white regimental coat with coloured
facings, folded so the facings show; a black bearskin-fronted grenadier cap with
a brass plate; a leather map case, cylindrical, with a shoulder strap and a
buckled cap; a small silver camp cup with two handles.
```

**The marquee is drawn to the surviving object's proportions — 14 ft across the ends by 23 ft long, 12 ft to the ridge** (`historical-visual-reference.md` §4.5). It survives, it is on display in Philadelphia, and "noticeably wider than it is deep" in the prompt is what stops the model producing a circus tent.

---

### Act 6 — `A6P-3` · The surrender · `a06_xx_pr_surrender_v01`
Light law: as Act 6.

```
a page from a sketchbook: nine separate small studies of the objects of a
capitulation arranged in a neat three by three grid on bare cream paper, each
object isolated with clear space around it — a regimental colour furled tight on
its staff and sewn into a leather case so no device shows; a straight-bladed
officer's sword with a gilt hilt and a knuckle bow, in its scabbard; a side drum
with a fitted leather cover laced over the head; a second cased colour, shorter
and on a lighter staff; a stack of muskets leaned together in a pyramid with
their bayonets crossed at the top; a heavy wooden ox yoke with its bows and
chain; a crescent-shaped gilt gorget on a ribbon; a folded document with a broad
ribbon through it and a large seal hanging; a long spade left standing upright in
loose earth.
```

---

### Act 7 — `A7P-1` · The cantonment · `a07_xx_pr_cantonment_v01`
Light law: **interior, single window frame-left, cold north light.**

```
a page from a sketchbook: nine separate small studies of an officers' winter
cantonment arranged in a neat three by three grid on bare cream paper, each
object isolated with clear space around it — a squared-log hut with a shingled
roof, a plank door and a stone chimney, drawn small and complete; a tightly
rolled paper tied with a narrow tape; a thick bundle of folded papers tied
crosswise, the bundle much thicker than one hand can span; a black riding boot
worn through at the heel; a black felt cocked hat with a black cockade and a
narrow white binding at the brim; a tall lidded tin coffee pot; a folding
chessboard with a few turned bone men set on it; a leather dice cup with three
bone dice; a roll of stiff printed papers with a broken seal, spread slightly
open so the sheets fan.
```

---

### Act 7 — `A7P-2` · The Temple · `a07_xx_pr_temple_v01`
Light law: as Act 7.

```
a page from a sketchbook: nine separate small studies of the fittings of a plain
assembly building arranged in a neat three by three grid on bare cream paper,
each object isolated with clear space around it — a long low building of squared
logs and rough boards with a shingled roof and a single doorway, drawn small and
complete; a plain deal table on trestles; a backless plank bench; a brass
candlestick with a guttered candle and a fall of hardened wax down one side; a
pair of oval steel-framed spectacles lying open on a shagreen case; a folded
sheet of paper creased into quarters, lying closed; a black cocked hat set down
crown-downward on a bench; a sword belt with a frog, hanging from a wooden peg; a
small window sash of twelve panes, the old glass uneven and rippled.
```

**The spectacles cell repeats `GP-3`'s object under Act 7's light** and is the only intentional duplicate in the 207. It is worth one cell: the object the player found in a drawer in minute nine of Act 1 has to arrive at the Temple looking like the same steel and the same shagreen, and matching a global prop into a cold north-lit interior by grade alone is exactly the kind of near-miss the eye catches.

---

### Act 8 — `A8P-1` · Annapolis and home · `a08_xx_pr_annapolis_v01`
Light law: **bright, even, near-shadowless, light from everywhere.**

```
a page from a sketchbook: nine separate small studies of plain furniture and
homecoming things arranged in a neat three by three grid on bare cream paper,
each object isolated with clear space around it — a plain Windsor chair with a
bow back and turned legs; a short turned baluster from a gallery rail; a length
of unfinished pine floorboard, unpainted and unvarnished, with the saw marks
still on it; a folded document with a broad ribbon and a pendant seal; a leather
travelling trunk with iron corners and two straps buckled; a saddle with a pair
of holsters at the pommel; a shad net gathered on its poles; a herring barrel
with iron hoops; a mason's trowel and a wooden bucket with dried lime in it.
```

The last two cells close Act 1's building site. The trowel and the lime bucket are the same objects as the lime pit on `A1P` — Act 8's `MV-04′` is the same plate as Act 1's with prop toggles (`05` §8.3), and **these two cells are the toggle**: the tools have been put down, and the house is finished.

## 3.4 Packing and export

```
cabinet:  cut → trim to content + 8 px → resize longest edge to 240 px →
          pack 52 cells into 2048² with 4 px padding →
          cwebp -q 82 -m 6 -alpha_q 90 -sharp_yuv -metadata none
          → art/dist/prop/cabinet-{1..4}.webp + cabinet.json (cell rects)

toggle:   cut → trim to content + 4 px → keep native scale →
          pack that act's ~40 toggles into 1024² →
          toktx --t2 --encode uastc --uastc_quality 3 --zcmp 18 --genmipmap
          → art/dist/prop/a{NN}_toggle.ktx2 + a{NN}_toggle.json
```

**The four cabinet atlases are grouped by act pair** — `cabinet-1` = Acts 1–2, `-2` = 3–4, `-3` = 5–6, `-4` = 7–8 + globals — so a cabinet loads with its act chunk and the globals ride with Act 7, by which point they are all long since resident. Keying is a luminance key against the sheet's bare paper, not `rembg`: these objects sit on a known flat tone that the same generation produced, so a threshold plus 6 px of manual cleanup per cell beats a segmentation model that will eat the pale end of a linen bundle.

---

# 4. THE MAP TABLE REGISTER (R2)

## 4.1 Why it is a different language, and what the difference means

The map table is not a UI screen with a map on it and it is not a diorama seen from above. It is the game's second visual register, and the reason it exists is epistemological, exactly as `02` §1.1 says the first one is:

> **R1 says: someone was there, and this is what could be seen.**
> **R2 says: someone measured this, and drew it to scale, and was not there when it happened.**

Every stylistic difference below follows from that sentence, and the sentence is why the map table is allowed to show the player things Washington's eyes could not reach — de Grasse in the Chesapeake, Burgoyne coming down from Canada, the Ohio country — without breaking the "always Washington, no perspective breaks" rule. **He is not seeing those things. He is reading a sheet of paper about them.** The register change is the honesty gate on the whole mechanic, and if the map looked like the world, the game would be quietly claiming he could see two hundred miles.

The strongest single consequence, and it is already in the renderer: **the mood system does not touch the map table** (`06` §2.8 — *a survey plan does not have a morale*). Washington can be at his lowest ebb and the sheet is exactly as clean and exactly as cold as it was in Act 2. That is not a technical convenience; it is the argument. The world reflects how he feels. The map does not care how he feels. Sitting inside a man's despair and looking at a document that is indifferent to it is the most precise thing this game does with a shader, and it costs one branch in the composite.

## 4.2 R1 against R2 — the difference table, and what each row is *for*

| | **R1 — the world** | **R2 — the sheet** | What the difference says |
|---|---|---|---|
| Line | **drawn**, `INK-SETTLED`, 2.5–3.5 px contour, variable pressure | **ruled**, `INK-LIGHT`, 1.0–1.5 px, even weight | a hand describing vs. an instrument recording |
| Wash | 3 values, modelled, wet-on-dry edges | **flat tints, no modelling, no value change within a tint** | observation vs. classification |
| Bare paper | 35–55% | **55–75%** | the map knows less and admits more |
| Perspective | shallow elevated three-quarter, 20° | orthographic plan, gently lifted | a viewpoint vs. no viewpoint |
| Light | a declared light law per act, cast shadows | **none.** No sun, no shadows, no time of day | a moment vs. a fact |
| Aerial perspective | ink lightens with depth | **none.** The far edge is as sharp as the near | there is no air in a plan |
| Atmosphere | fog, per-act LUT, mood uniforms | **none of it.** `uEdgeBleed = 0`, `uGranulation` fixed at 0.30 | the sheet has no weather |
| Orientation | composed | **north up, ±22°** | maps are oriented; views are chosen |
| Colour | Group C earth + reserved Group D | flat conventional tints; **Group D unchanged** | the coats still mean what they mean |
| Motion | parallax breath, ambient life | **tokens only**, 12 fps stepped | the paper does not move |

**The one thing that does not change is Group D.** `CONTINENTAL-BLUE`, `BRITISH-MADDER`, `FRENCH-WHITE` and `PRUSSIAN-BLUE` are the same hexes on the sheet as on the ground, exempt from R2's flattening exactly as they are exempt from the mood transform. A student who has learned that blue is us and dull red is them in Act 2's camp street reads the tokens at Yorktown without a legend. **Meaning colour is the one channel that survives the register change, and it survives it precisely because it is the only channel that is about naming rather than about seeing.**

## 4.3 `art/prompts/map-style-block.txt` — v1, locked. Trigger `wshmap`.

Generated with `wash-map-v1` (`ai-art-production-guide.md` §2.3), **not** `wash-v1`. The two LoRAs are not composed; the mark language is genuinely different and mixing them degrades both.

```
MAP STYLE: an eighteenth-century military survey plan drawn in pen and
watercolour on paper by a trained engineer officer. Every line is ruled or drawn
with an even, controlled, unvarying pen stroke in pale brown-grey iron gall ink,
of one weight throughout, with no pressure variation and no expressive
handling — the line is an instrument, not a hand. Ground form is given entirely
by hachures: short, fine, parallel pen strokes running straight down the line of
steepest slope, packed close and dark where the ground is steep and thinning to
bare paper where it is level, with no outline round the hill and no shading
across it. Water is given by fine parallel shore lines following the bank, and
soundings by small stipple dots. Woodland is a repeated small drawn tree symbol,
identical every time. Cultivated ground is fine ruled hatching at a constant
angle. Colour is applied as flat transparent tint only — a single even wash of
one value within each closed area, never modelled, never graded, never blended,
with a slightly darker line of settled pigment where the wash met the pen line:
pale blue-grey for water, pale buff for cleared ground, pale grey-green for
woodland, thin pink-buff for built ground. More than half the sheet is untouched
bare paper. There is no sun, no shadow, no time of day, no weather, no
atmosphere, no haze and no perspective: the sheet is seen square-on from directly
above and everything on it is equally sharp from edge to edge. The paper is cool
cream cartridge laid down on linen. Nothing in the image is pure black and
nothing is pure white.
```

**Three clauses that are the whole block.** *"The line is an instrument, not a hand"* is what separates this from `wash-v1`'s output more reliably than any other phrasing tested — the model understands the distinction between expressive and mechanical mark-making and will hold it. *"With no outline round the hill and no shading across it"* is the anti-cartoon clause: every model's default for "hills on a map" is a shaded bump, which is nineteenth-century relief shading, not hachure. And *"never modelled, never graded, never blended"* three times over, because a flat tint is the single hardest thing to get out of a model trained on paintings.

## 4.4 `art/prompts/map-framing.txt` — two lines

**`FRAMING-MAPSHEET`** — the six sheets.
```
FRAMING: the survey sheet fills the frame square-on, seen from directly above,
flat, with north at the top and a narrow even margin of bare paper inside all
four edges. No table, no hands, no instruments, no other papers, no frame, no
border ornament, no decorative cartouche, no compass rose, no scale bar, no
title panel and no key.
```

**`FRAMING-TOKEN`** — the token sheet.
```
FRAMING: a page from a sketchbook — separate small drawn map symbols arranged in
a regular grid on bare cream paper, each symbol isolated with clear space around
it and no overlapping. Each is a flat drawn mark seen square-on from directly
above, built from ruled pen line and one flat tint, with no shading, no
modelling, no shadow, no perspective and no thickness.
```

The exclusion of the compass rose and scale bar from `FRAMING-MAPSHEET` is deliberate and it reverses a line in `04` §7.2 — see §4.10.

## 4.5 `art/prompts/map-negative.txt` — v1, locked

```
NEGATIVE: text, lettering, place names, labels, legend, key, scale text,
numbers, latitude, longitude, graticule numerals, cartouche, cartouche text,
title panel, compass rose lettering, signature, watermark text, gibberish text,
relief shading, hillshade, shaded relief, bump shading, drop shadow, cast shadow,
perspective, three quarter view, tilted view, isometric, bird's eye painting,
landscape painting, aerial photograph, satellite image, terrain render,
heightmap render, contour fill, choropleth, modern map, road atlas, tourist map,
fantasy map, treasure map, parchment scroll, burnt edges, sea monsters, ships in
perspective, rhumb lines, decorative border, gilt border, compass rose,
oil painting, impasto, canvas weave, glow, bloom, neon, 3d render, cgi
```

`compass rose` appears in both the framing exclusion and the negative because it is the strongest attractor in the entire map prior and it will otherwise appear four times on one sheet.

## 4.6 The six sheets

Generate **2048 × 2048**, ship **1536 × 1536 KTX2 UASTC**. Seed family `70000 + act*100`. Each is `wshmap,` + the subject line + `FRAMING-MAPSHEET` + `map-style-block.txt` + `style-block.txt` + `map-negative.txt`.

**Every one of these is generated from a hand-drawn blockout through ControlNet lineart at weight 0.45**, higher than the diorama's 0.35, because a map's geography is not negotiable and the Art Lead is tracing a real period source. Twenty minutes of tracing from the Rochambeau collection buys accuracy no prompt will (`ai-art-production-guide.md` §5.4).

---

### `MT-01` — Knox's route · Act 2 · `a02_xx_mp_knox-route_v01`

```
wshmap, a survey plan of a long overland route through mountainous country in
winter, drawn small in scale so that three hundred miles fit on one sheet. At the
top of the sheet a long narrow lake running north and south between steep ridges,
with a smaller lake below it, and a star-shaped fort at the neck between them. A
broad river runs south from the lakes down the left of the sheet through a wide
cultivated valley to a town at a bend. East of the river the ground rises into a
mass of high broken hills, the hachures heavy and dense across the whole belt of
them, falling away eastward into gentler country and then to a low coastal plain
at the right edge where a bay opens. A road is drawn as a pair of fine parallel
broken lines from the fort down the lake shore, across the river, over the hills
and eastward to the bay. Frozen water is a flatter, paler tint than open water.
```

**The single most important thing on this sheet is that the Berkshire belt is the darkest area of hachure in the entire game.** `MT-01` is a logistics puzzle about weight and ground; the player must be able to see, in one glance and with no numbers, that the middle third of the route is where sixty tons of iron will be lost. Composition instruction to the blockout: the hachure belt runs corner to corner and occupies 22–28% of the sheet.

---

### `MT-02` — The East River · Act 3 · `a03_xx_mp_east-river_v01`

```
wshmap, a survey plan of a harbour and the two shores that enclose it. On the
right of the sheet a long low island running north-east, its southern end built
over with a close-packed grid of small blocks; on the left, opposite it across a
strait about half a mile wide, a broader shore rising to a range of low heights
that run parallel to the water. Across the neck of that shore, from a creek and
marsh at the south to a shallow bay at the north, a continuous line of
fortification is drawn: a chain of small star-shaped works joined by a ruled
double line of entrenchment, with a fine broken band of abatis drawn outside it
along its whole length. A ferry crossing is marked at the narrowest point of the
strait by a fine dotted line between two small landing stages. Below and to the
right the water opens between two headlands into a wide outer bay with sandbanks
shown in stipple. Deep water is a flat blue-grey tint, shoal water a paler tint,
marsh a stipple of short broken strokes.
```

---

### `MT-03` — The order of march · Act 4 · `a04_xx_mp_order-of-march_v01`

```
wshmap, a survey plan at large scale of a river and a small town ten miles below
it. The river runs diagonally across the sheet from upper left to lower right
with a ferry landing marked on each bank near the top. From the near landing two
roads run south, drawn as pairs of fine parallel lines, diverging for most of
their length and converging again at the town: the western road running inland
over rolling ground, the eastern road following the river bank closely. The town
is a small grid of blocks where two long streets meet at a shallow angle and run
together toward a bridge over a creek at the far side; a large barrack building
stands as a plain rectangle at the junction. Two more crossing places are marked
on the river well below the town. The ground between the roads is gently rolling,
the hachures light and open, with two small watercourses crossing the western
road. Cleared fields are ruled hatching at a constant angle; woodland is repeated
tree symbols in three blocks.
```

---

### `MT-04` — The Northern Department · Act 5 · `a05_xx_mp_northern-dept_v01`

```
wshmap, a survey plan of a great river-and-lake corridor running from north to
south down the length of the sheet, drawn small in scale. At the top a long
narrow lake between mountain walls, with a second lake below it; below them a
portage and then a broad river running south past two towns to a wide bay at the
foot of the sheet. From the west, a second river valley comes in through hill
country to join the corridor at a fork about a third of the way down. On the west
bank of the main river, above the middle of the sheet, a bluff rises from the
water with a farm clearing on its crest and broken wooded ravines cut into its
face; the hachures there are dense and the woodland symbols crowd right to the
river. Roads are pairs of fine broken parallel lines; three of them converge at
the fork. Woodland covers more than half the sheet as repeated tree symbols and
the cleared ground is confined to narrow strips along the water.
```

`MT-04` also lifts a **second, much smaller sheet** for the alliance — the Atlantic between two coasts, with distances. It is not a seventh generation: it is a `1536 × 768` crop and re-tint of `MT-04`'s own bare-paper margin with an ocean tint and two coastlines painted in during the depth pass, 25 minutes of hand work. The point of the alliance sheet is scale, not detail, and a nearly empty sheet makes it better.

---

### `MT-05` — The Chesapeake · Act 6 · `a06_xx_mp_chesapeake_v01`

```
wshmap, a survey plan of a great tidal bay and the peninsulas around it. The bay
runs up the sheet from a narrow entrance between two capes at the lower right,
widening as it goes, with many drowned river valleys branching off it on both
sides. On the western shore, about a third of the way up, two broad rivers run
roughly parallel with a low narrow peninsula between them; at the tip of that
peninsula a small town is drawn as a grid of blocks, ringed by a continuous line
of entrenchment with small star-shaped works at intervals, and a second smaller
work on the opposite bank of the nearer river. Two parallel siege lines are drawn
outside the town's works, the nearer one shorter and closer. Roads run north from
the peninsula up the western shore and away off the top of the sheet. The whole
bay and all its branches are one flat pale blue-grey tint with fine parallel
shore lines following every bank, and stipple soundings across the entrance
between the capes.
```

---

### `MT-06` — The bounty lands · Act 7 · `a07_xx_mp_bounty-lands_v01`

```
wshmap, a survey plan of a great interior river basin, drawn small in scale and
very largely empty. A broad river enters at the upper right at a forked junction
of two smaller rivers and runs south-west across the whole sheet, with five or
six large tributaries joining it from the north and west, each drawn as a fine
double line dividing again and again into a fan of small branches. A long
mountain chain runs from lower right to upper right, its hachures dense along the
crest, and the ground falls away west of it into open rolling country where the
hachures are very light and often absent altogether. Woodland symbols cover most
of the basin. Two or three tiny clusters of blocks mark settlements on the river.
Across the eastern quarter of the sheet, following the crest of the mountains, a
single continuous ruled line is drawn in a heavier pen than anything else on the
sheet, running from top to bottom. Over the emptiest part of the basin, a grid of
large ruled rectangles is laid across the ground in a fine pale line, cutting
across the rivers and the woodland without regard to either.
```

**The two overlaid line systems are the entire teaching payload of `MT-06`** and they are the only place in the game where a generated map is asked to make an argument. The heavy ruled line is the Proclamation Line of 1763. The pale rectangle grid is the bounty-land survey. They ignore each other, and they both ignore the rivers, and the sheet says — before a single in-engine label loads — that Congress is paying its army in a country drawn on top of another country. `05` §7.3 calls this the strongest single argument the game makes for existing. It is carried by two pen weights.

## 4.7 Hachures are extracted, not generated

`04` §7.2 specifies a second 1536² alpha texture of hachure strokes, multiplied over the sheet with its opacity driven by `smoothstep(0.02, 0.14, |grad|)`. Generating that alpha separately is the obvious reading and it is wrong: a separately generated hachure field would have strokes running in directions that have nothing to do with the heightfield's actual slopes, and the shader would then reveal them in the wrong places.

**The hachure alpha is extracted from the sheet.** The model has already drawn the strokes down the slopes the blockout told it about, so the correct strokes in the correct directions already exist in the accepted image. Pull them out with the same two-threshold pass that produces the diorama ink masks (`02` §3.3) — luminance below 0.42 and chroma below 0.33, dilated 1 px, hand-corrected in Krita — and the resulting alpha registers with the sheet by construction.

```
scripts/extract-hachure.mjs  in.png → out_hachure.png (R8)
  luma  = 0.2126R + 0.7152G + 0.0722B
  chroma= max(rgb) - min(rgb)
  mask  = smoothstep(0.42, 0.22, luma) * (1 - clamp(chroma*3, 0, 1))
  subtract the ruled-line layer (drawn separately in the blockout, so it is known)
  → 12 min of hand correction per sheet
```

**Zero additional generations, exact registration, and it is the same code path as the ink mask.** Ships as ETC1S greyscale (`--encode etc1s --clevel 4 --qlevel 255`) at 1536², 0.29 MB on disk and 1.18 MB of VRAM: banding is invisible after the slope smoothstep multiplies it.

## 4.8 Heightfields are hand-painted, and they are tiny

Six 256 × 256 R8 PNGs, hand-painted in Krita from the same blockout as the sheet, displacement amplitude 0 → 0.35 world units. **Do not generate these and do not derive them from the sheet's luminance.** A luminance-derived heightfield lifts the *ink* rather than the *ground* — every hachure stroke becomes a ridge and every road becomes a trench — and the result is a relief map of the drawing instead of the country. Budget 40 minutes each. 65 KB each. This is the cheapest asset in the project and the one that most obviously repays being done by a person with the blockout open beside them.

**Low relief is a hard rule.** `04` §7.2: *a survey plan that has been gently lifted, not a terrain mesh.* At amplitude 0.35 across a 10-unit sheet, the steepest ground in the game rises less than 4% of the sheet's width. If the player can perceive it as terrain, it is wrong; they should perceive it as a piece of paper that is very slightly not flat, which is exactly what a period draughtsman's hachures were invented to substitute for.

## 4.9 The token sheet — one generation, 24 cells, shared by all six maps

`gl_xx_mp_tokens_v01`, generate 1536 × 1536, ship 1024² KTX2. Faction is encoded by **shape first** (`04` §8.4), colour second, label third.

```
wshmap, a page from a sketchbook: twenty-four separate small drawn map symbols
arranged in a neat grid on bare cream paper, each isolated with clear space
around it and no overlapping — a plain filled rectangle twice as wide as it is
tall; the same rectangle in outline only; a plain filled circle; a filled
rectangle with a single bar across it; the hull profile of a ship of the line
seen from directly above, pointed at one end and square at the other; the same
hull profile at half the size; a small five-pointed star-shaped earthwork in
plan; a shallow crescent-shaped battery in plan with three small marks along its
face; a squat barrel seen from above; a low sledge with two runners seen from
above; a four-wheeled wagon seen from above; a close cluster of eight small hull
profiles at anchor; a long slender arrow with a feathered tail; a shorter arrow
with a plain head; a broad chevron; a short double line across a stream, being a
ford; a short double line with two abutments, being a bridge; a lozenge with a
line of small tent marks inside it; an eight-pointed compass star with one point
longer and shaped as a fleur-de-lis; a plain ruled bar divided into six equal
segments alternately filled and open; a pair of brass dividers lying open; a
round lead weight with a turned knob; a plain steel pin; a small oval of dark red
wax pressed flat.
FRAMING-TOKEN
```

Cells 19 and 20 are the **compass rose and scale bar**, and cells 21–24 are the **table furniture** that lies on the sheet — dividers, a weight, a pin, a wax blob holding a corner. Both groups are discussed below.

## 4.10 The table surround, the candle, and one erratum against `04` §7.2

**The board and the linen.** The sheet lies on a linen backing on a plain oak board — `T05 tx_linen-map-backing` and `T06 tx_board-oak-worn` from §6.4, both tiling, both tinted in-shader. The board extends 1.4 sheet-widths in every direction and is the only thing visible past the sheet's deckle. **Nothing else is in the frame.** No room, no walls, no window, no chairs, no candlestick modelled in 3D, no hands. The map table is a sheet and a board, and the camera's 42–66° pitch clamp means the board's far edge is never in shot.

**The candle is a light, not an object.** Acts 4, 6 and 7 light their sheets with a warm key from frame-left at `FLAME #D98C3C`, 0.22 intensity over a neutral 0.9 fill. `02` §8.6 bans bloom and glow absolutely, so there is no visible flame, no halo, no flicker beyond a ±3% intensity wander at 0.4 Hz, and no cast shadow from anything except the four furniture objects sitting on the sheet. **The candle is legible entirely as a warm gradient across the paper and a set of four small hard shadows**, which is exactly what a candle at a map table does and is one-tenth of the work of drawing one.

**Erratum against `04` §7.2.** That section specifies *"a shader-drawn 1 px ruled grid in IRON-GALL at 18%, in map-sheet space, with a drawn scale bar and compass rose composited in-engine."* The grid stands — a ruled graticule at constant 1 px regardless of camera distance is exactly right and no model would hold it. **The scale bar and compass rose do not.** They are drawings, not type; the model draws a fleur-de-lis north point better than a shader can and it costs two cells on a sheet that is being generated anyway. They ship as cells 19–20 of the token atlas, placed by the engine at fixed sheet-space coordinates. **Their numerals and their labels remain type**, so the cardinal rule is untouched: the rose is art, the letters N-E-S-W beside it are DOM.

**And the four furniture objects are the map table's entire sense of physical presence.** A pair of dividers laid open across the sheet, a lead weight on a curling corner, a pin through a road junction, a blob of wax holding the far edge down. They cast the only shadows in the scene, they do not move, and they are what make a survey plan read as *a thing on a table in a room where a decision is being made* rather than as a menu. Four cells, one generation, and they are the difference.

## 4.11 The surveyor's overlays — twelve files, **zero generations**

`05` §10.4 scopes the surveyor's overlay to **12 exteriors**: after `MT-01`, holding a key draws contour hachures, sightlines and distances over the diorama in the `wshmap` style. `05` §13.2 budgeted these as 12 generations. **They should not be generated at all.**

Two reasons, both decisive. **Registration:** an overlay must align to its plate within a pixel or the illusion collapses into a smear, and no img2img pass registers to that tolerance — you would be hand-correcting twelve generated overlays for longer than it takes to draw twelve. **Content:** an overlay is nothing but ruled lines, hachure strokes at a constant angle, and dotted sightlines, which is the one category of mark a person draws faster, straighter and more consistently than a model, directly over the blockout that produced the plate.

**They ship as SVG.** Twelve hand-drawn overlays, authored in Inkscape over the plate at 1600 × 900 logical, ~15 KB each, **180 KB for all twelve** against ~4.8 MB if they shipped as textures. Rasterised once at scene load into a single R8 texture and drawn at `renderOrder 3200` under the character layer. The line stays crisp at any resolution because it is a line, which is also the only way it obeys `02` §4.1's prohibition on ever blurring or non-uniformly scaling the ink.

Stroke spec, so the twelve match: hachures `INK-LIGHT #6E6152` at 1.0 px, spacing 4 px, constant 90° to the contour; contours 1.0 px dashed `6 2`; sightlines 1.0 px dotted `1 3`; distance leaders 1.0 px solid with a 3 px tick at each end. Nothing thicker than 1.0 px appears in an overlay — it is a transparency laid over a drawing, and if it competes with the drawing's own line it has failed.

## 4.12 Erratum against `04` §7.1

`04` §7.1's map-table table predates the act-order correction in `05` §0.1 and disagrees with `05` in three of six rows. **`05` wins on all of them.** Recorded here because the sheets are being generated from this document and the filenames are permanent:

| `04` §7.1 | `05` | Resolution |
|---|---|---|
| `CB-MT`, `BK-MT`, `DL-MT`, `VF-MT`, `NW-MT`, `YT-MT` | `MT-01` … `MT-06` | **`MT-nn` IDs**; the `xx-MT` forms are retired |
| `VF-MT` (Act 5) = supply lines and the Schuylkill, *optional, cut first* | `MT-04` = the Northern Department, Saratoga and the alliance | **`MT-04` as `05` specifies.** It is not optional: it carries the Arnold seed's payoff and the alliance, and cutting it would leave `DOC-A5.4` with no table to be read at |
| `NW-MT` (Act 6) = the cantonment plan and the distance from Hasbrouck House to the Temple | `MT-06` = the bounty lands, Act 7 | **`MT-06` as `05` specifies.** The Hasbrouck-to-Temple distance is real and important and it is carried by `NW-02`'s establishing dialogue, not by a table |
| Yorktown at Act 7, Newburgh at Act 6 | Yorktown Act 6, Newburgh Act 7 | **`05` §0.1.** Filenames are `a06_…_chesapeake` and `a07_…_bounty-lands` |

---

# 5. UI AND CHROME (R4 — engraved print)

## 5.1 The rule this section serves

> **A UI element is a physical object in the fiction, or it does not exist.** (`02` §8.1)

Which for this document means something narrower and more useful: **every generated UI asset in this game is a printer's or binder's product** — an engraved vignette, a cast ornament, a rule, a piece of silk, a marbled endpaper, a length of gilt moulding. Not an icon. Not a symbol. Not a glyph designed for this game. The whole chrome vocabulary comes out of an eighteenth-century printing office and a bindery, and the test on any proposed new element is: **could this have been ordered from a typefounder's specimen book?** If not, it is not made.

R4 rules, from `02` §1.5 and §4.1: crosshatch only, `INK-SETTLED`, **no wash at all**, 60–80% bare paper, 1.0 px line at 2–4 px spacing.

## 5.2 `art/prompts/ui-style-block.txt` and `ui-negative.txt` — v1, locked

```
ENGRAVED STYLE: a small copperplate engraved ornament of the kind cut for an
eighteenth-century printing office, printed in brown-black ink on bare cream
paper. The image is built entirely from ruled and crosshatched lines of even
weight cut with a burin — parallel lines for a flat tone, crossed lines for a
deeper one, lines that swell and taper only where the burin was pushed harder,
and dots flicked between the lines where the tone must be lightest. There is no
wash, no paint, no solid filled area, no grey: every value is made by the spacing
of lines and the paper does all the lighting. The cutting is confident and
slightly mechanical, the hatching regular, the whole ornament small, self
contained and evenly weighted with generous bare paper around it. Nothing in the
image is pure black and nothing is pure white.
```

```
NEGATIVE: text, lettering, letters, words, motto, initials, monogram, signature,
caption, label, numerals, banner text, scroll with writing, watercolour, wash,
paint, colour, gradient, airbrush, soft shading, blur, glow, bloom, drop shadow,
3d render, cgi, embossed, chrome, gloss, vector art, flat design, clip art, icon,
app icon, logo, emblem badge, heraldry with text, modern illustration,
art nouveau, art deco, victorian scrollwork, celtic knot, tattoo flash
```

`victorian scrollwork` is on the list because "printer's ornament" pulls hard toward 1880s job printing, which is the wrong century by a hundred years and is instantly recognisable to anyone who has seen a period title page.

## 5.3 `UI-1` — the ink glyph sheet · `gl_xx_ui_glyphs_v01` · 4 × 4

The affordance system in `04` §4.6. Sixteen cells, generated 1536², cut to 24 × 24 logical.

```
wshwash, a page of sixteen separate small engraved printers' marks arranged in a
neat four by four grid on bare cream paper, each mark isolated with clear space
around it and no overlapping, all sixteen cut at the same scale and the same line
weight — an open angular bracket of the kind used as a manuscript marginal mark;
a short curved stroke like the opening of a scribe's flourish; a small letter
folded into three and sealed, seen flat; a small oval blob of wax with an
impressed device; a pair of dividers standing open; a slender arc curving away to
the right and tapering to a point; the same arc curving to the left; the same arc
curving upward; the same arc curving downward; a narrow ribbon end with a
V-shaped cut, hanging; a short row of three fine dots; a small tapered rule
thickening at the centre; a small six-petalled printer's flower; a plain
lozenge; a short hand-shaped pointer with the index finger extended; a small
turned finial. Even flat light, no shadows, no wash, no colour.
[ui-style-block] [style-block] [ui-negative]
```

Sixteen cells for six glyph kinds because exits need four directions, the ribbon-end is the game's only persistent HUD element, and the pointing hand and the flower are needed by `UI-2`'s consumers. **The wax seal cell here is the small one at 24 px; the 24 × 24 sealed-decision glyph in `02` §8.5 is this cell, and the large wax on `DOC-F1` is a different object at a different scale.** They are generated apart on purpose: a 24 px seal that is a downscaled 400 px seal reads as mud.

## 5.4 `UI-2` — the ornament sheet · `gl_xx_ui_ornaments_v01` · 4 × 4

Serves the letterbook, the document viewer, the act title cards, the epilogue book's running heads, and `DOC-A1.3`'s coffin cuts.

```
wshwash, a page of sixteen separate engraved printers' ornaments arranged in a
neat four by four grid on bare cream paper, each isolated with clear space around
it and no overlapping — a long plain head rule tapering to a point at both ends;
a long rule with a small lozenge at its centre; a wide symmetrical tailpiece of
foliage narrowing to a point at the bottom; a small basket of flowers cut as a
tailpiece; a square factotum block with a foliage border and a blank centre; a
horizontal brace with curled ends; a corner ornament of a ruled double border,
mitred, with a small foliage boss at the angle; the same corner mirrored; a
narrow decorative border strip that repeats; a row of four small identical
upright coffins with their lids shown, cut plainly and crudely as a jobbing
woodcut; a single larger coffin cut in the same crude manner; a small ship under
sail cut as a shipping-notice block; a small crown; a small clenched fist with
the index finger pointing right; a printer's flower of six lobes; a plain
diamond. Even flat light, no shadows, no wash, no colour.
[ui-style-block] [style-block] [ui-negative]
```

**Two cells are the coffin cuts and they are prompted as crude on purpose.** `DOC-A1.3` is the *Bloody Butchery* broadside — a real Salem sheet that ran a row of forty small coffin blocks above a casualty list whose figures are propaganda and wrong. The whole point of that document is that the object is designed to produce a feeling before it produces a fact, and a beautifully engraved coffin would undo it. Cut plainly, cut crudely, cut like a jobbing block a country printer already owned. The other fourteen cells on this sheet are fine work; these two are not, and the difference is legible on the sheet before it is legible in the game.

**Everything a "menu" needs is on this sheet.** Act title cards are 44 px ENGRAVED small caps between a head rule and a tailpiece (`02` §8.6). The title screen is a period title page set entirely in type with a rule and an imprint line. The document viewer's `TRANSCRIPT` tab is a paper tab with a 1 px ink rule. **There are no other menu assets and none will be made.**

## 5.5 `UI-3` — the binding sheet · `gl_xx_ui_binding_v01` · 4 × 4

The only sheet in this section that is not R4: bindings are objects, so this one is R1 pen-and-wash, generated with `wash-v1` and the ordinary `style-block.txt`.

```
wshwash, a page of sixteen separate small studies of bookbinder's materials
arranged in a neat four by four grid on bare cream paper, each isolated with
clear space around it and no overlapping — four short lengths of narrow silk
ribbon with cut ends, in four different drab colours running from pale to dark:
a pale stone grey, a mid drab olive, a deeper snuff brown, a dark slate; a square
of marbled paper in a combed pattern of drab browns and blue-greys; a second
square of marbled paper in a different combed pattern; a narrow strip of the deep
shadow that falls into the gutter of an open book; a squared corner of a
leather-covered board with the leather turned in over the edge; a small brass
book clasp with a hinged catch; a long strip of a deckled paper edge; a long
strip of a cleanly cut paper edge; a short length of plain gilt picture-frame
moulding seen straight on, a simple ogee with a bead, the gilding rubbed to show
the red bole beneath at the high points; a mitred corner of the same moulding; a
small oval gilt name plaque with a plain moulded rim and a blank centre; a plain
brass hanging ring.
```

**The four ribbons are the letterbook's four ribbons and their order is fixed by value, light to dark, top to bottom: Correspondence · Documents · Persons · Maps** (`02` §8.2). Position and printed label carry the identification; the value ladder only reinforces it, and no Group D or E colour appears on any of them — which is why they are specified as four drabs and not four colours.

## 5.6 The letterbook spread · `gl_xx_ui_letterbook-spread_v01`

Generate 2048 × 1280, ship 1200 × 760 WebP. `FRAMING-OPENING`, `wash-v1`.

```
wshwash, a bound quarto letterbook lying open at a blank opening, seen square-on
from directly above. Both facing leaves are completely blank plain cream laid
paper, unruled and unwritten. The book is bound in plain worn calf over boards;
the sewn gutter runs exactly down the centre with the linen thread visible at
head and tail and a soft shadow falling into the fold on both sides. The
fore-edges of the block are visible as narrow bands of stacked leaf edges at the
extreme left and right, slightly dirtied and rounded from handling, and four
narrow silk ribbon markers of four different drab colours emerge from between the
leaves and lie across the fore-edge at four different heights. The book lies flat
and open of its own accord on a plain dark surface.
```

The four ribbon-ends are generated **in this image as well as on `UI-3`**, deliberately: the ones in the spread establish how a ribbon lies against this paper under this light, and the `UI-3` cells are the ones the engine animates. Matching a separately-generated ribbon into an established spread is the exact class of near-miss the sheet method exists to prevent, so it is prevented twice.

## 5.7 The document viewer

**Zero new assets.** The viewer is a paper stock from §2.2 at 1200 × 760 over a flat 62%-opacity `INK-SETTLED` scrim, with the artefact's hand strips (§2.4) composited into the `type_frame`, a `TRANSCRIPT` paper tab in the lower right, and the deckle from `UI-3` on two edges. Every element already exists. **There is no blur behind the scrim** (`02` §8.2 — blur is the fastest available signal that you are looking at a modern game engine) and no page-turn animation: 180 ms cross-dissolve between artefact and transcript, and nothing else moves.

## 5.8 The passport code screen

**Zero new assets, and it is the best-value screen in the game.** `02` §8.4 stages the save code as *a pass, signed by Washington* — a real period object, and it turns the most administrative screen into the most charming one.

- **The paper** is `P03` at half-sheet crop, the press stock, because a printed pass form is exactly what it was.
- **The form** — rules, boxes and the printed wording — is DOM type in PRINTED-rough with the blanks filled in SECRETARY.
- **The code** is Libre Caslon Text at 26 px, +12% tracking, in seven groups of four, on a DOM-drawn rule. Real selectable text with a screen-reader label (`06` §7.2).
- **The copy button is a wax seal** — `DOC-F1` cell 1, stamped in `SEAL-RED`, and the seal's presence on the page *is* the confirmation. No toast, no tick, no animation beyond the stamp.

## 5.9 The Gilt Frame furniture — the Trumbull-register title treatment

Eight plates, one per act, in R6 (`02` §1.2). The plates themselves are `03a`'s. **The frame around them is this document's**, and it is where the register's argument is delivered:

| Element | Spec | Source |
|---|---|---|
| **Moulding** | a plain ogee-and-bead gilt moulding, 44 logical px wide, mitred at the corners | `UI-3` cells 12–13, tiled along each edge with the mitre sprite at each corner |
| **Rebate shadow** | 3 px, hard, inside the moulding's inner edge, `#16110D` | drawn |
| **Plaque** | a blank oval gilt name plaque, 260 × 64, centred below the frame | `UI-3` cell 14 |
| **Caption** | title · painter · medium · place · date · *and the number of years* | **DOM type**, Petit Formal Script ENGROSSED at 30 px |
| **Wall** | flat `PAPER-SHADOW #C6BCA6` at 88% — a gallery wall, not a void | fill |

**And this section adds two colours to the palette, which is a change to `02` Appendix B.** There is no gold in the game's palette, because there is no gold in the honest register: a topographical draughtsman had ochre and he had bistre. But the Gilt Frame is the one register that obeys none of the honest register's rules — it is already the only thing allowed below the ink floor — and rendering its moulding in `YELLOW-OCHRE` would soften exactly the vulgarity the plate needs. Gilding it in earth pigment would be tasteful, and tasteful is the wrong answer.

```
R6 ONLY   GILT-FRAME-FLOOR  #16110D   the only value below INK-FLOOR
          GILT              #A98A4B   gilt moulding, mid tone         [NEW]
          GILT-HIGH         #D8C489   gilt moulding, catch light      [NEW]
          GILT-DEEP         #6B5426   gilt moulding, rebate and bole  [NEW]
```

Three colours, one register, one consumer, and they may not appear anywhere else in the game — the same restriction `SEAL-RED` carries. `GILT` never touches type (contrast on `PAPER-SHADOW` is 2.6 : 1 and it would fail); the caption beneath the plaque is `INK-SETTLED` on `PAPER-SHADOW` at 6.72 : 1. **The gold is decoration and the words are readable, which is the correct division of labour and is also, precisely, the criticism the Gilt Frame is making of the paintings it quotes.**

## 5.10 The epilogue book and the ledger

`07` §5.1: the epilogue is a book, and its physical condition is driven by Political Legitimacy alone. Two generations, three shipped conditions.

### `gl_xx_ui_epilogue-book_v01` — generate 2048 × 1280, ship 1200 × 760

```
wshwash, a printed book lying open at a blank opening, seen square-on from
directly above. Both facing leaves are completely blank — no text of any kind —
of good white-cream printing paper, generously proportioned with wide clean
margins. The book is sewn in gathered signatures and bound in plain boards; the
gutter runs down the centre with the thread visible at head and tail. The
fore-edge is uncut, so the leaf edges are rough and slightly uneven where the
sheets were folded and never trimmed. The paper is fresh and unfoxed and lies
flat. The book rests on a plain dark surface.
```

**The three conditions are made in the shader from this one generation**, which is the whole reason it can exist:

| `band(pl)` | The object | How |
|---|---|---|
| **HIGH** | a subscription quarto | the plate as generated; type at wide measure; the Gilt Frame Washington portrait tipped in as frontispiece |
| **MID** | a plain octavo | plate scaled to 0.86 with the margins cropped in; `T10 tx_showthrough-verso` multiplied at 0.14; a `UI-2` tailpiece substituted for the head rule |
| **LOW** | a cheap pirated octavo | as MID, plus `T10` at 0.30, `DOC-F2` cell 9 (**foxing** — its only permitted consumer, §2.6) masked into the gutter, DOM type set in IM Fell English with per-glyph alpha 0.55–1.0 and baseline jitter ±1.8 px, and the frontispiece run through the existing R6 path at 4-level posterise with a coarse hatch overlay |

At LOW the frontispiece is **the same plate** as at HIGH, degraded — and it produces the best silent joke in the game: at low standing, the myth image itself has decayed into a bad woodcut of a man the printer never saw. **Zero new assets** (`07` §5.1), and this document's only contribution is the two textures and the foxing cell that make it true.

### `gl_xx_ui_epilogue-ledger_v01` — generate 2048 × 1280, ship 1200 × 760

Pass 3. The object changes and the change is the argument.

```
wshwash, a large manuscript ledger lying open at a blank opening, seen square-on
from directly above. Both facing leaves are completely blank and unruled, of
heavy hard cool-grey account paper, larger and squarer than a printed book, all
edges cut straight. It is bound in limp vellum with two pairs of linen ties at
the fore-edge, the vellum discoloured and slightly cockled. The sewn gutter runs
down the centre. The paper lies flat and hard. The ledger rests on a plain dark
surface.
```

**Everything about this object is colder than the book beside it** — cool grey against warm cream, hard against soft, unruled and enormous against a comfortable octavo, vellum ties against calf boards. `07` §5.2 states the reason in one line and it should govern the acceptance of this asset: **Harry's life was recorded in a ledger, not in a book.** If the two objects feel like the same object in different sizes, this one is rejected and redone.

---

# 6. TEXTURES AND OVERLAYS

## 6.1 The consumer table — no texture ships without a named consumer

Ten tiling textures. Every one names the shader uniform or the object that reads it. **A texture with no consumer is not made**, which is the check that killed two of the ten in `ai-art-production-guide.md` §5.7 (see §6.6).

| ID | File stem | Ship | Fmt | Consumer |
|---|---|---|---|---|
| `T01` | `gl_xx_tx_paper-laid-warm` | 512² | KTX2 R8 | `uGrainOpacity`, screen-space, **1:1 device px** (`02` §4.4) |
| `T02` | `gl_xx_tx_paper-tooth` | 512² | KTX2 R8 | `uGranulation` — pigment settling |
| `T03` | `gl_xx_tx_wash-bloom` | 512² | KTX2 R8 | modulates `uEdgeBleed`'s dilation so wet-into-wet blooms unevenly |
| `T04` | `gl_xx_tx_canvas-weave` | 512² | KTX2 R8 | **R6 only** — substituted for `T01` at `uGrainOpacity = 0.06` (`06` §2.9) |
| `T05` | `gl_xx_tx_linen-map-backing` | 512² | KTX2 | map table sheet backing (`04` §7.2) |
| `T06` | `gl_xx_tx_board-oak-worn` | 512² | KTX2 | map table board; the interlude writing desk |
| `T07` | `gl_xx_tx_paper-wove-cheap` | 512² | KTX2 R8 | document viewer ground for `P03`/`P04`/`P11` past the sheet edge |
| `T08` | `gl_xx_tx_vellum-engrossing` | 512² | KTX2 R8 | document viewer ground for `P07`; the epilogue ledger's binding |
| `T09` | `gl_xx_tx_paper-foxed-light` | 512² | KTX2 R8 | **epilogue book LOW only** — one consumer, `restricted` in the ledger |
| `T10` | `gl_xx_tx_showthrough-verso` | 512² | KTX2 R8 | epilogue book MID and LOW (§5.10) |

**Not in this list and never baked:** chain lines. `02` §4.4 specifies them as a *second* screen-space overlay — 1 px vertical `INK-LIGHT` at 96 px spacing, 5% opacity — drawn procedurally in the composite for 4 KB and one draw call. They are the single detail that makes viewers say "that's paper" without being able to say why, and they must never enter a texture, because a chain line that parallaxes is a chain line that is inside the picture rather than on the sheet.

## 6.2 What tiles, what does not, and the rule that decides

> **A texture tiles if and only if the surface it represents is larger than the frame and has no edge in the fiction.**

Paper grain tiles: the sheet is bigger than the screen. Linen backing tiles: the board is bigger than the sheet. A document stock does **not** tile — it is an object with four edges, two of them deckled, and tiling it would produce a sheet of infinite paper, which is the same category error as a deckle inside the world (`02` §4.5). Prop sheets do not tile. Map sheets do not tile.

So: **`T01`–`T10` tile. Nothing else in this document does.** Ten of roughly 416 shipped files, and the ten that must be generated locally with circular padding because no hosted API can do it (`ai-art-production-guide.md` §5.7).

## 6.3 `art/prompts/tile-style-block.txt` — v1, locked

Generated in ComfyUI with **circular VAE tiling enabled**, `wash-v1` at strength **0.95** (higher than any other class — a texture is pure style with no subject to protect), at 1024², downsampled to 512² with Lanczos. Never upscaled: an upscaler invents structure, and invented structure in a tiling texture repeats.

```
TEXTURE STYLE: a flat, even, seamless surface texture filling the whole frame
edge to edge, seen square-on from directly above under completely flat, even,
shadowless light. There is no object in the picture, no composition, no focal
point, no centre, no border and no edge — only the continuous material, uniform
in scale and density across the whole frame, so that any part of it could be
exchanged with any other part. The variation is fine and constant, never clumped
into features and never forming a pattern the eye can name. Very low contrast:
the whole image sits in a narrow band of value with no dark accents and no bright
highlights. Nothing in the image is pure black and nothing is pure white.
```

```
NEGATIVE (append to doc-negative): object, subject, composition, focal point,
centred, vignette, border, frame, edge, corner, horizon, tiling seam, repeated
motif, wallpaper pattern, damask, floral pattern, geometric pattern, symmetry,
mirrored, kaleidoscope, high contrast, dark corners, spotlight
```

`symmetry` and `mirrored` are on the list because "make it tile" in a prompt produces a suspiciously symmetrical composition — the model's way of faking edge-matching — and the circular padding makes that unnecessary as well as wrong.

## 6.4 The ten prompts

Subject lines only; each is `wshwash,` + the line + `tile-style-block.txt` + `style-block.txt` + the tile negative. Seed family `95001`–`95010`.

**`T01` paper-laid-warm** — extracted-and-regenerated from `P01`, and the most important texture in the game.
```
the surface of warm cream handmade laid rag paper seen very close: fine parallel
laid lines running close together across the whole surface, stronger chain lines
about a hand's breadth apart running the other way, a fine irregular tooth, a
scatter of small dark fibre specks, and a faint cloudiness where the pulp lay
thicker and thinner. Greyscale.
```
**Acceptance is tied to `P01`.** Generate this from `P01`'s accepted flat centre as an img2img reference at denoise 0.30. The world's grain and the documents' paper must be the same paper — a student sees both within four seconds of opening a letter, and if the fibre scale differs the paper stops being one continuous sheet, which is R10's entire claim.

**`T02` paper-tooth**
```
the raised tooth of a rough watercolour paper seen very close and lit from
directly in front so the texture reads as a fine dense irregular grain of small
raised and hollow places, with no directional lines and no fibre specks.
Greyscale.
```

**`T03` wash-bloom**
```
a broad flat area of transparent watercolour wash that has dried unevenly on damp
paper, showing soft irregular blooms, cauliflower edges where the water pushed
pigment outward, and fine granular settling of pigment into the paper's hollows.
No brush marks, no edges, no shapes. Greyscale.
```

**`T04` canvas-weave**
```
the woven surface of a fine artist's linen canvas seen very close, a regular
over-and-under weave of even threads with slight irregularities in the spinning,
primed smooth so the weave shows as low relief rather than as texture. Greyscale.
```
**Its only consumer is the Gilt Frame** (`06` §2.9), and that is the entire joke: the register that is not painted on paper is given the surface of the thing it actually is.

**`T05` linen-map-backing**
```
a plain coarse linen cloth used to back a map, seen very close: an open even
weave of thick natural-coloured threads, slightly slubbed and uneven, unbleached
and warm grey-buff, softened and slightly furred from folding.
```

**`T06` board-oak-worn**
```
the surface of a plain scrubbed oak board seen very close, cut along the grain:
long straight open grain lines, a few small knots, the surface worn smooth and
slightly hollowed by use, the colour a dull mid brown-grey with no varnish and no
polish.
```

**`T07` paper-wove-cheap**
```
the surface of cheap coarse printing paper seen very close: no laid lines and no
chain lines at all, an uneven cloudy formation with thin translucent patches and
thicker opaque ones, many dark fibre specks and small undigested flecks through
it, the surface soft and absorbent. Greyscale.
```
Note the absence of laid lines: cheap eighteenth-century press stock was often wove or so badly formed that its laid lines were lost, and the difference from `T01` is the fastest available way to make a broadside feel cheaper than a letter without changing its colour.

**`T08` vellum-engrossing**
```
the surface of fine prepared parchment seen very close: very smooth and slightly
translucent with a faint waxy sheen, a scatter of fine hair follicle marks in
regular groups, and broad extremely soft variations of tone across it. No fibre,
no grain, no weave. Greyscale.
```

**`T09` paper-foxed-light**
```
a scatter of small rust-brown spots and blooms spreading in the fibre of old
paper, irregular in size and unevenly distributed, each with a soft diffuse edge,
over otherwise clean paper. Greyscale.
```
**`restricted: ["epilogue-book-low"]`.** The linter fails any other consumer, per §2.6.

**`T10` showthrough-verso**
```
the faint ghost of printed matter showing through from the other side of a thin
sheet of paper: soft blurred horizontal bands of pale grey at a regular rhythm,
with no readable marks and no letterforms, very low contrast. Greyscale.
```
The one texture whose subject is text and which must contain none: it is what type looks like from the *wrong side* of a thin leaf, which is bands, not glyphs. It also runs the §1.7 OCR gate, and passing it is the point.

## 6.5 The seam test — automated, and it fails the build

```
scripts/seam-check.mjs  (runs on every file matching *_tx_*)
  1. roll the image by (W/2, H/2)
  2. compute per-pixel |Laplacian| along the two seam lines that are now central
  3. compare to the mean |Laplacian| of the whole image
  4. FAIL if either seam line exceeds 1.35× the image mean
  5. also FAIL if the image's 2D autocorrelation shows a peak > 0.55
     at any offset other than (0,0) — that is a visible repeat
```

Step 5 is the one that matters and the one people forget. A texture can be perfectly seamless and still be unusable because it has one memorable feature that the eye tracks across a 4 × 4 tiling. The autocorrelation test catches exactly that, it takes 300 ms, and it is why `tile-style-block.txt` says *never clumped into features*.

## 6.6 Erratum against `ai-art-production-guide.md` §5.7

The guide's ten-texture list is:
```
paper_laid_warm  paper_laid_cool  paper_foxed_light  parchment_vellum
canvas_tent  linen_map_backing  wood_plank_worn  ink_wash_grain
snow_crust  mud_churned
```
Four changes, each with its reason:

| Change | Reason |
|---|---|
| **`paper_laid_cool` dropped** | `02` §4.4 tints the grain in-shader by the act's ground tone. A second grain at a different hue would double the asset and desynchronise the two halves of the game's paper |
| **`snow_crust` and `mud_churned` dropped** | **They have no consumer.** Dioramas are painted plates, not textured 3D; the only genuine 3D surface in the game is the map sheet, and it is neither snowy nor muddy. Two textures were budgeted for a rendering architecture the project does not have |
| **`canvas_tent` dropped, `canvas-weave` added** | Tent canvas is painted into plates by `03a`. Artist's canvas weave is required by `06` §2.9 for R6 and was not on the list |
| **`paper-tooth`, `wash-bloom`, `paper-wove-cheap`, `showthrough-verso` added** | `uGranulation` and `uEdgeBleed` (`02` §3.4, uniforms 5 and 6) each need an input texture and neither was budgeted; the document viewer needs two grounds |

Net: still ten. The guide's count was right; four of its entries were guesses made before the shader and the document model existed.

---

# 7. TROUBLESHOOTING — the ten failures of this document's classes

Each: what the model does, why, the positive language that fixes it, and the check.

**`D-01` · Text appears anyway.** *Why:* every training image of a document has writing on it; "blank paper" is a rarer caption than "letter." *Fix:* describe the sheet's **state** — `blank and unused`, `unwritten`, `an unused sheet` — rather than negating text; put it in the subject line as well as the block. *Check:* §1.7. Automated. **A single surviving dictionary word fails the asset; there is no override.**

**`D-02` · The fantasy-parchment collapse.** Burnt edges, curled corners, orange tone, a rolled scroll. *Why:* "old paper" is dominated by game and film props. *Fix:* `warm cream to buff, never white, never orange`, `flat, not curled and not lifting`, `two edges cut clean`. *Check:* is the sheet flat, cream, and cut on at least two edges? If it looks like a treasure map, reject — do not repair.

**`D-03` · Ruled lines drawn as ink.** The laid and chain lines come out as pen strokes; ledger paper arrives pre-ruled. *Why:* "lined paper" is a strong attractor and the model cannot distinguish a mould's laid lines from drawn rules. *Fix:* `visible as faint tonal ridges rather than as drawn lines`; `ruled lines` and `lined paper` in the negative. *Check:* sample a laid line — is it a *value* change or a *hue* change? A hue change means ink and the sheet is rejected.

**`D-04` · The wash arrives on a map.** `MT-` sheets come back with modelled, graded, blended tints and shaded hills. *Why:* `wash-map-v1` is a small LoRA and the base model's landscape prior is enormous. *Fix:* `never modelled, never graded, never blended`; `no outline round the hill and no shading across it`; raise LoRA strength to 0.95 for maps and drop guidance to 2.9. *Check:* sample a single tinted region at five points — the spread must be under 4 L\*. If the hills read as bumps, the sheet is a landscape and is rejected.

**`D-05` · The compass rose plague.** Four roses, a cartouche, a decorative border and a sea monster. *Why:* it is the single strongest attractor in the map prior. *Fix:* excluded in `FRAMING-MAPSHEET` **and** in `map-negative.txt`; the real rose comes from the token sheet. *Check:* count the roses. The correct number on a generated sheet is zero.

**`D-06` · Prop-sheet objects fuse.** Nine objects become six, overlapping, sharing a ground line and casting shadows on each other. *Why:* "arranged on a page" pulls toward still-life composition. *Fix:* `each object isolated with clear space around it and no overlapping, no shared ground line, no cast shadows onto the paper`. *Check:* can every object be cut out with a rectangle that touches nothing else? If not, regenerate — do not attempt to separate them in post; the wash edges are already merged.

**`D-07` · Scale drift within a sheet.** A camp kettle the size of a hut; a spoon the size of an axe. *Why:* the model draws each cell to fill its cell. *Fix:* `each object is drawn at its own natural size relative to the others` in `FRAMING-STUDY`. *Check:* composite the sheet's largest and smallest object side by side at their generated scale. If a horn spoon is more than one-third the length of a felling axe, reject.

**`D-08` · The engraving turns into a wash drawing.** `UI-` cells come back with soft grey tone. *Why:* `wash-v1` is trained on wash and R4 is the one register that has none. *Fix:* `every value is made by the spacing of lines and the paper does all the lighting`; `no solid filled area, no grey`; drop LoRA strength to 0.60 for R4 and rely on the block. *Check:* zoom to 400% on any mid-tone — can you count the lines? If it is continuous tone, reject.

**`D-09` · The tiling texture grows a subject.** A hero fibre, a memorable knot, a dark corner. *Why:* the model composes; composition is what it is for. *Fix:* `no object, no composition, no focal point, no centre`; `any part could be exchanged with any other part`. *Check:* §6.5 step 5, autocorrelation. Automated.

**`D-10` · The prop sheet drifts out of its act.** Act 5's kit arrives under warm afternoon light. *Why:* the light law was appended after the framing line, where it is weakest. *Fix:* append the light law verbatim *immediately after* `FRAMING-STUDY` and before `style-block.txt`. *Check:* composite the sheet's cells against that act's palette plate. If the shadow direction disagrees with the act's law, reject before cutting — a re-cut is 40 minutes.

**Five more, cheap to check:** wax that is not `SEAL-RED` within ΔE 6 (§2.5) · a deckle on a stock whose §2.2 row says none · a flag with a visible canton on any prop sheet (§3.3, `A2P-3`) · a hand-library strip that OCRs as a word (§1.7) · a `P09` third consumer (§2.8, `L512`).

---

# 8. LEDGER, SIGN-OFF, AND PAYLOAD

## 8.1 Ledger fields this document adds

Every asset carries the standard record (`ai-art-production-guide.md` §6.6). These classes add six fields:

```json
{
  "asset_id": "gl_xx_doc_press-coarse_v01",
  "class": "paper-stock",
  "stock_id": "P03",
  "type_frame": [64, 72, 640, 948],
  "deckle_edges": 0,
  "tileable": false,
  "restricted": null,
  "cells": null,
  "serves": ["DOC-A1.2","DOC-A1.3","DOC-A1.5","DOC-A2.2","DOC-A2.3","DOC-A2.7",
             "DOC-A3.1","DOC-A4.2","DOC-A5.4b","DOC-A5.7","DOC-A6.2a",
             "DOC-A6.6","DOC-A7.4","DOC-A7.5","DOC-A7.7"],
  "ocr_report": {"tokens": 0, "max_confidence": 41, "verdict": "pass"}
}
```

- **`class`** — `paper-stock | hand-strip | furniture | prop-sheet | map-sheet | map-token | tiling | ui | book`. Drives which sign-off gate applies.
- **`cells`** — for any sheet, an array of `{name, rect, ships_to}`. **A sheet's ledger record and its cut cells' records are separate**, and each cell record carries `cut_from`. This is what makes "regenerate the spyglass" a resolvable request three years from now.
- **`serves`** — for stocks and shared assets, the list of consumers. `scripts/verify-ledger.mjs` asserts it matches the content JSON both ways, so a stock cannot silently lose a consumer and a document cannot silently point at a stock that no longer exists.
- **`restricted`** — a whitelist of permitted consumers, or `null`. Two assets in the game carry it: `DOC-F2` cell 9 and `T09`, both `["epilogue-book-low"]`.
- **`ocr_report`** — written by §1.7 and required on every record. A record without one fails CI.

## 8.2 The sign-off checklist

**Automated — CI, cheapest first:**
- [ ] `no-text.mjs`: zero dictionary tokens ≥ 4 chars at confidence ≥ 70 (§1.7)
- [ ] Bare-paper ratio in band: R2 55–75%, R4 60–80%, documents n/a (the stock *is* the paper)
- [ ] No pixel darker than `INK-FLOOR #241C14`; no pure `#000000`, no pure `#FFFFFF`
- [ ] Resolution and format per §8.4; ledger record exists and its file exists
- [ ] `seam-check.mjs` on every `*_tx_*`: both seams < 1.35× mean, autocorrelation peak < 0.55 (§6.5)
- [ ] Wax cells within ΔE 6 of `SEAL-RED #8C2F2A`
- [ ] `restricted` assets have exactly one consumer, and it is the named one
- [ ] `P09` has exactly two consumers

**Human, 60 seconds:**
- [ ] Deckle count matches the stock's §2.2 row
- [ ] Paper is cream to buff — not white, not grey, not orange (`D-02`)
- [ ] Laid/chain lines are value changes, not hue changes (`D-03`)
- [ ] Map: every tint is flat; no hill is outlined or shaded; zero compass roses (`D-04`, `D-05`)
- [ ] Prop sheet: every object rectangle-separable; relative scale sane; light law obeyed (`D-06`, `D-07`, `D-10`)
- [ ] Engraved sheet: every mid-tone is countable lines, not continuous tone (`D-08`)
- [ ] No flag with a visible canton anywhere
- [ ] The object would be at home in the Berthier atlas / a printer's specimen book / a bindery, as applicable

**Gated — cannot be waived:**
- [ ] `A1P-3` (the Quarter) and `A5P-2` (the hospital hut): written sign-off per `historical-visual-reference.md` §7.6, **from someone other than the operator**
- [ ] `A1P-3`: is anything on this sheet picturesque? If yes, reject (§3.3)
- [ ] `A4P-2` (Trenton): **V-1** Hessian facings closed
- [ ] `MT-06`: both line systems present, at two distinct pen weights, ignoring the rivers (§4.6)
- [ ] The epilogue book and the epilogue ledger, printed and laid side by side: do they read as two different kinds of object? (§5.10)

## 8.3 Payload

| Bucket | Files | Bytes |
|---|---|---|
| Document paper stocks | 12 | 1.1 MB |
| Illegible-hand strip atlas | 1 | 0.9 MB |
| Document furniture atlas (`DOC-F1` + `DOC-F2`, 18 cells) | 1 | 0.3 MB |
| Prop cabinet atlases (DOM, 2048², 52 cells each) | 4 | 4.8 MB |
| Prop toggle atlases (GPU, 1024² UASTC, per act) | 8 | 9.6 MB |
| Map sheets (1536² UASTC) | 6 | 14.2 MB |
| Hachure alphas (1536² ETC1S greyscale) | 6 | 1.7 MB |
| Heightfields (256² R8 PNG) | 6 | 0.4 MB |
| Map token atlas (1024² UASTC) | 1 | 1.2 MB |
| Surveyor's overlays (SVG) | 12 | 0.2 MB |
| Tiling textures (512²) | 10 | 2.5 MB |
| UI atlases (glyphs + ornaments + binding) | 2 | 1.5 MB |
| Letterbook / epilogue book / epilogue ledger spreads | 3 | 1.1 MB |
| **TOTAL** | **72** | **39.5 MB** |

Against `05` §13.3's allocation for the same scope — map 12.0 + documents 2.4 + props 4.8 + tiling 3.5 + UI 1.0 = **23.7 MB** — this is **+15.8 MB**, from two places: the map bucket was costed before hachure alphas and heightfields existed (+7.7 MB), and props were costed as one channel rather than two (+9.6 MB of toggle atlases, offset by cabinet atlases coming in on budget).

**Recommendation, and it is a small one on top of `05`'s.** `05` §13.3 already recommends raising total shipped art from 85 MB to 155 MB. With this document's real numbers the project lands at **≈169 MB**. The distribution of the increase is what makes it a non-event: **+1.2 MB per act chunk for props and +1.3 MB per act for map assets, against a chunk prefetched over forty minutes of prior play.** Peak act chunk goes from 17.4 MB to ≈19.9 MB — 66 kbps of the available bandwidth. **Initial download is unchanged at 5.6 MB**, because Act 1 has no map table and its toggle atlas is 1.2 MB. Revised asks: **total ≤ 175 MB, per-act ≤ 21 MB, initial ≤ 8 MB (met), GPU peak ≤ 120 MB (met at ~9 MB per scene, and a map table costs ~4 MB against a scene whose layers are already fading out).**

## 8.4 Resolution and format, one table

| Class | Generate | Ship | Format | Renders in |
|---|---|---|---|---|
| Paper stock | 1024×1536 / 1536×1024 | per §2.2 | WebP q82 | DOM |
| Hand strip atlas | 2048×2048 | 2048² | WebP q82 + alpha | DOM |
| Document furniture | 1536×1536 | 1024² | WebP q82 + alpha | DOM |
| Prop sheet → cabinet | 1536×1536 | 2048² atlas | WebP q82 + alpha | DOM |
| Prop sheet → toggle | (same source) | 1024² atlas | KTX2 UASTC | Three.js |
| Map sheet | 2048×2048 | 1536² | KTX2 UASTC | Three.js |
| Hachure alpha | — (extracted) | 1536² | KTX2 ETC1S grey | Three.js |
| Heightfield | — (hand-painted) | 256² | PNG R8 | Three.js |
| Map token sheet | 1536×1536 | 1024² atlas | KTX2 UASTC | Three.js |
| Surveyor overlay | — (hand-drawn) | 1600×900 logical | **SVG** | rasterised at load |
| Tiling texture | 1024×1024 seamless | 512² | KTX2 UASTC / R8 | Three.js |
| UI sheet | 1536×1536 | 1024² atlas | KTX2 / WebP | both |
| Book / ledger spread | 2048×1280 | 1200×760 | WebP q82 | DOM |

---

# 9. ERRATA AND THE VERIFICATION QUEUE

## 9.1 Errata issued by this document

| # | Against | Issue | Resolution |
|---|---|---|---|
| **E-D1** | `06` §5.6 | `document.schema.json`'s `paper` is a file path, implying 51 generated sheets | `paper` is a **stock ID**; adds `paper_variant`, `hand`, `overlays`. §2.8. Saves ~39 generations and ~18 MB |
| **E-D2** | `04` §7.2 | Scale bar and compass rose specified as engine-drawn | They are **drawings**, not type: token-atlas cells 19–20, placed by the engine. Numerals and letters stay type. §4.10 |
| **E-D3** | `04` §7.2 | The hachure alpha implied as a separate generation | **Extracted** from the accepted sheet by the ink-mask pass. Zero generations, exact registration. §4.7 |
| **E-D4** | `05` §13.2 | Surveyor's overlays budgeted as 12 generations | **Zero generations.** Hand-drawn SVG; a model cannot register to an existing plate. Saves 12 generations and 4.6 MB. §4.11 |
| **E-D5** | `04` §7.1 | Map-table IDs, Act 5's and Act 6's subjects, and the act order all predate `05` §0.1 | `05` wins on all four rows. §4.12 |
| **E-D6** | `ai-art-production-guide.md` §5.7 | Four of the ten tiling textures have no consumer in this architecture; two required ones are missing | Ten replaced, one-for-one, each with a named consumer. §6.6 |
| **E-D7** | `05` §13.3, `06` §4.6 | Props costed as one channel | **Two channels** — DOM cabinet + GPU toggle. §3.1. +9.6 MB, and it is what makes 207 objects affordable |
| **E-D8** | `02` Appendix B | No gold in the palette; the Gilt Frame requires gilding | **`GILT #A98A4B`, `GILT-HIGH #D8C489`, `GILT-DEEP #6B5426`** — R6 only, decoration only, never under type. §5.9 |
| **E-D9** | `05` §1.5 | `DOC-A1.7`, the Fairfax Independent Company commission, is a findable paper object with no document ID | Assigned `DOC-A1.7`, stock `P07`. It is the object `A1-D3` is about and it needs a viewer entry |
| **E-D10** | `05` §13.2 | 24 prop sheets, and `03b` §5.6 also draws the hands library from that budget | **23 sheets here, 1 in `03b`.** Reconciled in the index |

## 9.2 Verification queue

| # | Item | Owner | Blocks |
|---|---|---|---|
| **V-D1** | Hessian facing colours at Trenton — **V-1**, still open in `hist-ref` §8 | History | `A4P-2` |
| **V-D2** | Whether a watermark device should be specific (a Strasbourg lily, a fool's cap, a posthorn) or generic. A specific device is checkable by a teacher and therefore either a gift or a liability | History + Art Lead | `P01`, `P10`. Generated generic pending resolution |
| **V-D3** | The physical form of the *Bloody Butchery* broadside: coffin count, sheet size, whether the coffin blocks run in one row or several | History | `DOC-A1.3`'s composition; `UI-2` cells 10–11 are unaffected |
| **V-D4** | Whether the Treaty of Alliance copy the game shows carries a pendant seal on cord or an applied seal | History | `DOC-A5.6`'s overlay choice only |
| **V-D5** | The Book of Negroes' physical format — leaf size, whether ruled in red or black, binding | History | `DOC-EP.1`'s stock. **This is the last object in the game and it is the one nobody should get wrong** |
| **V-D6** | Whether the New Windsor Temple's windows were glazed with old crown glass by March 1783 | History | `A7P-2` cell 9 only |
| **V-D7** | A period source for the exact Ohio-country survey rectangle grid predating the 1785 Land Ordinance, or confirmation that `MT-06`'s grid is a legitimate anticipation | History | **`MT-06`.** The sheet's entire argument rests on the grid being defensible |

---

# Appendix A — The complete `03c` asset manifest

| Class | Generations | Derived | Files shipped | Payload |
|---|---|---|---|---|
| Paper stocks | 12 | — | 12 | 1.1 MB |
| Illegible-hand sheets | 2 | 30 strips | 1 | 0.9 MB |
| Document furniture (`DOC-F1`, `DOC-F2`) | 2 | 18 cells | 1 | 0.3 MB |
| Prop sheets | 23 | 207 objects | 12 | 14.4 MB |
| Map sheets | 6 | 6 hachure alphas | 12 | 15.9 MB |
| Map heightfields | — | 6 hand-painted | 6 | 0.4 MB |
| Map token sheet | 1 | 24 cells | 1 | 1.2 MB |
| Surveyor's overlays | — | 12 hand-drawn | 12 | 0.2 MB |
| Tiling textures | 10 | — | 10 | 2.5 MB |
| UI sheets (`UI-1`, `UI-2`, `UI-3`) | 3 | 48 cells | 2 | 1.5 MB |
| Letterbook spread | 1 | — | 1 | 0.4 MB |
| Epilogue book spread | 1 | 3 conditions | 1 | 0.4 MB |
| Epilogue ledger spread | 1 | — | 1 | 0.3 MB |
| **TOTAL** | **62** | | **72** | **39.5 MB** |

Against `05` §13.2's allocation for the same scope — 6 map sheets + 1 token sheet + 12 overlays + 24 prop sheets + 12 document papers + 10 tiling + 3 UI = **68** — this document ships the scope in **62**, having removed 12 overlays that should never have been generated and added 6 (two hand sheets, two furniture sheets, two book spreads) that the design needs and nobody had counted.

# Appendix B — Every locked prompt file, in assembly order

```
1  [SUBJECT LINE]                     per-asset, §2.3 / §2.4 / §3.3 / §4.6 / §5 / §6.4
2  art/prompts/doc-style-block.txt    §1.4  — documents, paper, hands, furniture
   art/prompts/map-style-block.txt    §4.3  — map sheets and tokens  (wshmap, wash-map-v1)
   art/prompts/ui-style-block.txt     §5.2  — glyphs and ornaments   (R4)
   art/prompts/tile-style-block.txt   §6.3  — the ten tiling textures
3  art/prompts/doc-framing.txt        §1.5  — one of three lines
   art/prompts/map-framing.txt        §4.4  — one of two lines
4  [ACT LIGHT LAW]                    prop sheets only, verbatim, §3.2
5  art/prompts/style-block.txt        shared, unchanged, appended last
6  art/prompts/doc-negative.txt       §1.6  — or map-negative §4.5 / ui-negative §5.2
```

**Subject first. Class anchor second. Light law before the shared style block, never after. Shared style last. Negative last of all. Nobody retypes any of it.**
