# AI Art Prompt Guide — Part 1: ENVIRONMENTS
### *In Washington's Shoes* — the working prompt book for every painted plate in the game
**Version 1.0 · 14 August 2026**
**Owner:** Art Lead. **Audience:** whoever is sitting at the machine generating plates.
**Binding on:** every diorama plate, every map sheet, every Gilt Frame, the interlude still.

---

## 0. How to use this document

This is not a theory document. It is a **paste book**. Sections 1–3 are read once. Section 4 is opened
every working day and copied out of.

**The whole system in five lines:**

1. Every environment prompt is `wshwash,` + the scene body from §4 + the **MASTER STYLE ANCHOR** (§1.1) + the **NEGATIVE BLOCK** (§1.2), in that order, with nothing between them.
2. The anchor is **never edited**. Not for one scene, not for one act, not "just this once."
3. If a plate is wrong, **fix the blockout, not the prompt.** Prompt churn is how a 27-plate set drifts apart.
4. Weather, season, hut-state and time-of-day variants come from **img2img off the accepted master**, never from a second prompt (§6.3).
5. **Mood is not generated. Mood is a shader.** There is exactly one canonical generation per plate (§6).

**Upstream documents this one obeys and does not restate.** Where this document conflicts with any of
them on a matter of fact, they win; where it gives a prompt string, that string is the spec.

| Document | Authority |
|---|---|
| `reference/historical-visual-reference.md` | What is true. Buildings, uniforms, dates, bans. Outranks everything here. |
| `docs/02-art-direction.md` | What a plate must look like to be accepted. Palette, bare-paper bands, edge law. |
| `docs/04-scene-architecture.md` | Camera degrees, framing declarations, layer stack, walk-plane. |
| `docs/05-act-scene-inventory.md` | Which plates exist and what is in them. **The corrected act order.** |
| `reference/ai-art-production-guide.md` | Models, LoRAs, seeds, slicing, encoding, the ledger. |

**Act order, for the avoidance of doubt: Act 6 is Yorktown. Act 7 is Newburgh.** Every filename,
light law and Gilt Frame in this document is already corrected. If you are holding a page that says
otherwise, that page is older than this one.

### 0.1 The generation stack this document assumes

```
base            FLUX.2 [klein-4B]        (frozen, hash in art/graphs/wash-prod-v1.json)
style LoRA      wash-v1        @ 0.85    trigger  wshwash
map LoRA        wash-map-v1    @ 0.90    trigger  wshmap        (map sheets only)
sampler         euler · simple · 28 steps · guidance 3.2
control         ControlNet depth 0.55 + lineart 0.35, both from the hand-drawn blockout
generate        1536 × 864   (dioramas, Gilt Frames, interlude)
                2048 × 2048  (map sheets)
```

**Nothing in that block is a per-scene decision.** If you are changing guidance to fix a plate, stop:
you are about to make plate 14 not match plates 1–13.

### 0.2 Four errata against documents already signed off

These are corrections this document makes and takes responsibility for. Each is mechanical.

| # | Where | The problem | The correction |
|---|---|---|---|
| **E-1** | `02-art-direction.md` §2.1 | "`PAPER-SMOKED` — interiors that have lived near a fire — Acts **4 and 6** interiors." Written under the old act numbering, and Act 4 has no interior at all. | `PAPER-SMOKED` is the ground of the **Act 7 (Newburgh) interiors only** — `NB-01` and `NW-01`. Full corrected ground table at §3.6. |
| **E-2** | AI guide §5.5 light laws | Newburgh's law says "single window, **frame-left**." The Hasbrouck House's principal room has its one window documented **stage right** (`historical-visual-reference.md` §3.6). A light law cannot move a window that survives. | Act 7's light law is **direction-agnostic**: "interior, one window, cold north light." The window's side is per-scene and is stage right in `NB-01`. |
| **E-3** | `02-art-direction.md` §3.6 | "Second painted plate — **eight** named apex scenes, one per act." Act 8's `W` is clamped to the single value 0.80, which is permanently band `HIGH`. A low-band variant of `AN-01` can never be displayed. | **Seven apex mood plates, not eight.** Act 8 gets none. Saves one generation and one shipped layer for zero loss, because the asset was unreachable. |
| **E-4** | AI guide §2.1 `style-block.txt` v1 | v1 predates the art bible. It names Prussian blue and indigo as general earth colours (both are reserved Group D meaning colours), asks for a "soft deckle feel" (banned in world plates, §4.5), and asks for paper that is "aged" (the paper is **fresh** — the war is happening now). | **`style-anchor-env-v2`, below, supersedes it for all environment work.** v1 remains in the repo and remains the record for anything already generated under it. Nothing has been. |

---

# 1. THE MASTER STYLE ANCHOR

## 1.1 The anchor — `art/prompts/style-anchor-env-v2.txt`

**This is the most important text in the project.** It appears verbatim, byte for byte, in every
environment generation. It is stored once, injected by the pipeline script, and version-bumped rather
than edited. Copy it; do not retype it.

```
STYLE: an eighteenth-century military topographical drawing — pen and wash on paper, made on the
ground by a trained officer who had forty minutes and no reason to fill the sheet.

THE LINE: drawn first and drawn confidently, in brown-black iron-gall ink with a quill, over a faint
graphite underdrawing. The line carries every structure in the picture. It is even in weight,
unbroken, never sketchy, never blurred, never doubled, never faded. Nothing in the image is pure
black.

THE WASH: transparent watercolour laid over the dry line in three values only — one pale tint, one
mid tone, and a single dark accent — in a restricted earth range: soot brown, cool grey-brown,
yellow ochre, grey-green, slate blue-grey, wet stone grey, dull brick red. Thin and unsaturated.
Laid wet on dry, so each wash stops with a visible hard tideline. Some edges are soft, where the
wash has run into damp paper. At least one major form dissolves into the paper with no boundary at
all, and the ink line does not follow it there.

THE PAPER: warm cream laid rag paper with faint chain lines. Roughly half the sheet is left
completely untouched, in one large unbroken area — the sky, the water, the snow, the fog, a
whitewashed wall. The sheet is new: clean, unstained, unfoxed, untorn, no burnt or ragged edges, no
visible paper edge. Nothing in the image is pure white.

RENDERING: no opaque paint, no oil, no impasto, no visible brushwork, no canvas weave, no digital
gradients, no airbrush, no glow, no bloom, no rim light, no lens flare, no depth-of-field blur, no
photographic texture, no pixel art, no cel shading, no heavy black outlines. No lettering anywhere.
```

**237 words. It does not get shorter and it does not get longer.**

## 1.2 The negative block — `NEG-BASE`

Also verbatim, also injected, also never edited per-asset. **If an asset needs something on this
list, that asset is wrong.** Scene entries in §4 append extra tokens after `NEG-BASE`; they never
remove any.

```
NEG-BASE:
text, lettering, handwriting, script, calligraphy, signature, caption, label, watermark, numbers,
map legend, cartouche text, banner text, book title, legible writing, gibberish text,
oil painting, impasto, thick paint, palette knife, canvas weave, gouache, opaque paint, acrylic,
digital painting, airbrush, glow, bloom, rim light, lens flare, bokeh, depth of field, motion blur,
photograph, photorealistic, hdr, 3d render, cgi, octane, unreal engine, isometric, pixel art,
cel shading, anime, manga, comic panel, speech bubble, vector art, flat design, thick black outline,
sepia, monochrome filter, instagram filter, colour grading,
foxing, foxed, mould, water stain, tea stain, coffee stain, burnt edges, torn paper, crumpled paper,
rolled scroll, parchment, fantasy map, treasure map, deckle edge, aged, antique, distressed, vintage,
Leutze, Washington Crossing the Delaware, Spirit of 76, Currier and Ives, N C Wyeth, Howard Pyle,
Norman Rockwell, nineteenth century history painting, bicentennial, patriotic poster,
Colonial Williamsburg costume photography, reenactor, living history, museum diorama,
Civil War, kepi, forage cap, sack coat, Gettysburg, Napoleonic, shako, tailcoat, high stiff collar,
Waterloo, 1812, Victorian, Regency, frock coat, top hat,
Betsy Ross flag, circle of stars, fifty star flag, modern American flag, eagle, bunting, fife and
drum, liberty bell,
pure black, pure white, high contrast, oversaturated, neon, plastic, modern clothing, zipper,
wristwatch, telephone pole, power line, asphalt, road markings, glass curtain wall, car
```

## 1.3 Why every clause is there

Read this once. Then never argue with the anchor again.

| Clause | What it is doing | What happens without it |
|---|---|---|
| `an eighteenth-century military topographical drawing` | Names the **genre**, which is a documented captioned category the model has seen, rather than a style adjective. This is the single highest-leverage phrase in the block. | You get "watercolour painting," which is a hobby genre, and the model gives you charm. |
| `made on the ground by a trained officer who had forty minutes and no reason to fill the sheet` | The epistemic frame from the art bible §1.1, converted into a **behavioural instruction the model can act on**. It is the clause that produces unfinished corners. | The model finishes the picture. Finished is wrong. |
| `THE LINE: drawn first` | Establishes causal order. Line-then-wash is a different image from wash-then-line, and the model knows the difference. | Coloured-in line art, or line drawn over a painting, both of which read as digital illustration. |
| `brown-black iron-gall ink with a quill` | Names the actual pigment and the actual instrument. Iron gall is a strong, well-captioned token in museum data. | `#000000` liner-pen outlines (F-15). |
| `over a faint graphite underdrawing` | Produces the ghost construction lines that make a drawing look drawn. Costs nothing, and it is the detail viewers cannot name but always register. | A clean vector-ish contour with no evidence of process. |
| `The line carries every structure` | The one-line law of the whole project, stated where the model can act on it. | Structure migrates into the wash, and the mood shader then destroys the drawing (§6.1). |
| `even in weight, unbroken, never sketchy, never blurred, never doubled, never faded` | Six explicit prohibitions, because "confident line" alone reliably produces a scratchy multi-pass sketch. Art bible §4.1's absolute prohibitions, in model language. | Sketchbook scribble, which cannot be depth-sliced and cannot be ink-masked. |
| `Nothing in the image is pure black` | Sets the `INK-FLOOR` `#241C14` clamp at generation instead of leaving it to CI. | CI rejects the plate an hour after you spent an hour on it. |
| `three values only — one pale tint, one mid tone, and a single dark accent` | The chroma cap and the value discipline, expressed as a countable instruction. Models obey counts far better than adjectives. | Continuous-tone rendering, which is oil painting wearing a watercolour hat. |
| the seven earth words | The Group C palette in plain English. **Deliberately excludes Prussian blue, indigo and vermilion**, which E-4 removed: those are Group D meaning colours and must never appear as atmosphere. | The wash eats the semantic colours and a blue coat stops meaning "Continental." |
| `Thin and unsaturated` | The 62% chroma cap, in model language. | A poster. |
| `Laid wet on dry, so each wash stops with a visible hard tideline` | Produces the hard-edge type, and it is also the visible half of the mood system's central metaphor (§6.1). | Airbrushed gradients that the edge-bleed uniform then has nothing to bleed *from*. |
| `Some edges are soft` / `at least one major form dissolves into the paper with no boundary at all, and the ink line does not follow it there` | Buys edge types two and three. The trailing clause is the fix for the single most common AI failure in this style: closing every contour. Art bible §4.3. | Every form outlined. A line drawing that has been coloured in. |
| `warm cream laid rag paper with faint chain lines` | Names the substrate. Chain lines are the detail that makes viewers say "that's paper" without knowing why. | Digital white, or worse, canvas. |
| `Roughly half the sheet is left completely untouched, in one large unbroken area — the sky, the water, the snow, the fog, a whitewashed wall` | The bare-paper gate (35–55%) **plus** the contiguity rule (one region ≥12%), plus five worked examples so the model knows *where* to put it. | Speckled negative space between painted objects, which fails art bible §4.2 even when the total is in band. |
| `The sheet is new: clean, unstained, unfoxed, untorn, no burnt or ragged edges, no visible paper edge` | Kills the fantasy-parchment prior dead, and enforces art bible §4.5's "the paper is fresh, the war is happening now." **No visible paper edge** is what keeps the deckle out of world plates. | A treasure map. Every single time. |
| `Nothing in the image is pure white` | The other half of the F-15 check, and it protects the paper ground `#EFE7D5` from being blown out. | Snow and sky at `#FFFFFF`, which makes the global paper overlay invisible. |
| the `RENDERING` list | Sixteen bans, all inherited from art bible §8.6 and §9. The renderer honours the identical list, so generation and engine cannot disagree. | Bloom on a pen drawing. |
| `No lettering anywhere` | The absolute rule from AI guide §5.1, restated in the positive block because negatives are a weak instrument. | Near-English gibberish a history teacher spots in two seconds. |

**On the negative block specifically.** Four of its groups exist for reasons that are not obvious:
the *ageing* group (`foxed, aged, antique, distressed`) fights the model's assumption that "18th
century" means "old-looking"; the *named-painting* group is the model's actual prior for "American
Revolution" and must be fought in every single generation, not just the ones you expect; the *wrong
century* group covers Napoleonic and Civil War drift, which is where the training data actually
lives; and `isometric` sits in the negative rather than the framing slot because it is the failure
the killed pixel-art pivot keeps trying to come back as.

## 1.4 The second anchor — map sheets only (`R2`)

Map tables are a different register, a different LoRA and a different mark language. Dragging them
out of the main style anchor degrades both. **This is the only permitted second anchor.**
Stored as `art/prompts/style-anchor-map-v1.txt`.

```
STYLE: an eighteenth-century manuscript survey plan, drawn with a ruling pen and tinted with
transparent watercolour, in the manner of a military engineer's campaign atlas.

THE LINE: ruled and drawn in fine brown-black iron-gall ink, thin and even. Coastlines and roads
drawn as single confident strokes. Relief indicated by hachures — short parallel ink strokes
running straight down the slope, dense where the ground is steep and absent where it is flat.
Marsh indicated by stipple and short horizontal ticks. Woodland indicated by small repeated
lollipop tree symbols, not by painted foliage. Cultivated ground indicated by fine parallel
ruled furrow lines.

THE WASH: flat transparent tints with no modelling and no shading — pale grey-green for land, pale
blue-grey for water, pale ochre for cleared ground, a single dull red for works and buildings. Each
tint is laid inside a drawn boundary and stops at it. No gradients, no atmosphere, no light source,
no shadows anywhere.

THE PAPER: warm cream laid rag paper. Two thirds of the sheet is untouched. The sheet lies flat on a
plain linen-backed board and is a physical object. The sheet is new: clean, unstained, unfoxed,
untorn.

RENDERING: no perspective, no horizon, no sky, no three-dimensional terrain, no relief shading, no
satellite imagery, no digital cartography. No lettering, no place names, no compass rose, no scale
bar, no cartouche, no border decoration, no legend — the sheet is completely blank of all writing
and all symbols of that kind.
```

Negative for map sheets: `NEG-BASE` + `perspective, horizon, sky, clouds, shaded relief, hillshade,
satellite, google maps, contour labels, compass rose, scale bar, cartouche, decorative border, sea
monsters, fantasy map, treasure map, parchment`.

**The compass rose, scale bar and every label are composited in-engine** (`04-scene-architecture.md`
§7.2). Do not let the model make them, however tempting the output looks — they will be wrong, they
will be unreadable, and they will be the one thing a teacher zooms in on.

## 1.5 The third anchor — Gilt Frame plates only (`R6`)

Eight plates, and they invert every rule above on purpose (art bible §1.2). **This is the only place
in the project where the ban list is deliberately reversed.** It is quarantined by being captioned,
uninteractive, and shown only after the student has played the honest version.

Stored as `art/prompts/style-anchor-gilt-v1.txt`.

```
STYLE: a large nineteenth-century academic history painting in oil on canvas, of the kind
commissioned for a national capitol — the heroic commemorative manner, painted decades after the
event by a painter who was not there.

EXECUTION: opaque oil paint edge to edge, with no bare ground and no visible drawing underneath.
Smooth blended modelling, glazed shadows, theatrical chiaroscuro with a single dramatic light
falling on the principal figure. Pyramidal composition. Every figure posed, every gaze converging
on the central man. Idealised faces, clean linen, unblemished uniforms, weather that flatters.
Deep warm varnished darks, cool luminous highlights.

FINISH: the paint fills the canvas completely from edge to edge. No paper, no bare ground, no
untouched area of any kind, no visible ink line. No lettering anywhere.
```

Negative for Gilt Frames: `text, lettering, signature, caption, watermark, numbers, pen and ink,
line drawing, watercolour, bare paper, sketch, unfinished, visible drawing, flat colour, cel
shading, pixel art, 3d render, photograph, modern illustration, comic`.

**Note what is missing from that negative: the entire named-painting ban list.** For these eight
plates only, Leutze and Trumbull are the target, not the hazard. Do not paste `NEG-BASE` into a Gilt
Frame prompt — it would fight the brief on every clause.

## 1.6 The Witness Register modifier — not a fourth anchor

`R5` is five parameter changes to the master anchor, not a separate style
(`historical-visual-reference.md` §7.2). It applies to **`MV-03` only** among the environment plates.
Insert this block **between the scene body and the anchor**:

```
WITNESS: this drawing is made at the height of a standing person's eyes, level with a face and never
above it, and closer than a landscape view — the people in it occupy more of the sheet than the
building does. It is tinted with a single grey wash only: there is no colour anywhere in it except
in small personal possessions. There is no haze, no mist, no golden light, no sunset, no weather
effect and no atmospheric softening of any kind. The light is clear, even, plain north light that
flatters nothing.
```

Every `R5` asset carries `sensitive: true` in the ledger and **does not ship without the written
sign-off gate at `historical-visual-reference.md` §7.6.** That gate is not a formality and it is not
the Art Lead's to waive.

---

# 2. THE PROMPT TEMPLATE

## 2.1 The six slots

```
wshwash, {SUBJECT}. {COMPOSITION}. {LIGHT}. {PALETTE}. {TECHNICAL}
[MASTER STYLE ANCHOR §1.1]
[NEG-BASE §1.2 + per-scene additions]
```

**Physical order matters and it is not the order the slots are named in.** The AI guide's frozen
convention is *subject first, style block appended last*, and the LoRA's trigger token leads the
caption because that is how the training captions were written. So the anchor — conceptually the
first thing and the thing that never changes — is physically the **last** thing in the string, with
`wshwash,` carrying the style from token one. Do not reorder this to make the document read better.

## 2.2 What goes in each slot, and the vocabulary that works

### Slot 1 — SUBJECT

**What it is:** the objects in the picture, named in the order the eye should find them: the focal
object first, then the mid-ground, then the far, then the foreground occluder last.

**Hard limit: 14 nouns.** This is the most useful number in the document. Above roughly fourteen
named objects the model stops leaving anything out, the bare-paper ratio collapses below 35%, and
the plate fails the art bible §4.2 gate. If your scene needs twenty objects, the extra six are
**props on the act atlas**, composited in-engine, not painted into the plate.

**Works:** concrete period nouns with a material attached — `a pole scaffold lashed with rope`, `an
open lime pit`, `bottomless wicker gabions filled with earth`, `a gambrel-roofed farmhouse`,
`shelters of boards and sailcloth`. Materials are what stop the model reaching for a generic.

**Does not work:** abstractions (`desperation`, `the weight of command`), scale adjectives
(`vast`, `sprawling`, `epic` — all three produce wide-angle distortion), and adjectives of quality
(`beautiful`, `atmospheric`, `moody`, `cinematic` — all four summon the exact illustration registers
§9 of the art bible bans).

**Never in this slot:** any object that will be a character cutout, and any object the player can
name and examine at readable size. See §4.0.2.

### Slot 2 — COMPOSITION / FRAMING

**What it is:** the camera line verbatim from §3, then the walk-plane band, then the recession, then
the L4 occluder, then the flatness instruction. It is the most formulaic slot and it should be:
**every exterior in the game carries the identical camera sentence**, which is what makes forty hard
cuts feel like one place.

Full vocabulary in §3. The only per-scene decisions are which way the recession runs and what the
foreground occluder is.

### Slot 3 — LIGHT / ATMOSPHERE

**What it is:** the act's light law, **verbatim**, plus season and weather. One sentence of each.

The eight light laws are in §3.5. They are appended without paraphrase, because paraphrase across 27
plates is how the sun ends up in four different places (AI guide §5.5). Residual drift is normalised
by the per-act LUT at Phase C; **gross** drift is not, which is why the law goes in the prompt.

**Works:** `key from frame left`, `long soft shadows falling to the right`, `flat overcast with no
directional light`, `the only light is what men are carrying`, `low winter sun very close to the
horizon`.

**Does not work:** `golden hour`, `dramatic lighting`, `volumetric light`, `god rays`, `rim light`,
`backlit` — all six are banned in the rendering block anyway, and naming them in a positive slot
overrides the negative more often than not.

### Slot 4 — PALETTE

**What it is:** the act's paper ground by name, the wash colours actually permitted in this scene,
and — critically — **which Group D meaning colours are allowed and where**.

**The two-colour rule is enforced here** (art bible §2.4): no more than two Group D colours may
occupy more than 5% of frame area in any scene. Exactly one scene in the game is permitted three,
and it is `YT-03`.

**Works:** naming a colour by its material — `dull warm brick red, the colour of madder-dyed wool`,
`a pale greyish yellow-tan, the colour of undyed chamois leather`. Hex values do nothing in a prompt
and are for the reviewer, not the model.

**Does not work:** `vibrant`, `rich colour`, `colourful`, `warm tones`, and the word `sepia`, which
produces a filter rather than a palette.

### Slot 5 — TECHNICAL

**What it is:** the four instructions that exist because of how this plate will be *used*, not how it
will look:

```
Composed with generous empty margin on all four sides, with nothing important near any edge.
Any writing shown is illegible: fine ink strokes suggesting cursive, not readable letterforms.
No people in the immediate foreground.
The open ground the figures will stand on is clear and unobstructed.
```

Line 1 protects the 12.5% overscan the parallax dolly eats (15% on L4). Line 2 is the F-24
corrective. Line 3 and 4 exist because characters are billboards composited at runtime and the plate
must have room for them.

### Slot 6 — the anchor and negative

Not a slot you write. A slot you paste.

## 2.3 The worked example — the whole string, once

Assembled `A1-S1 · MV-01`, exactly as it goes into the box. Every other entry in §4 is the body of
this and nothing else.

```
wshwash, Mount Vernon in Virginia as it stood in May 1775, seen from the land side to the west
across the open forecourt. The house is a plain two-and-a-half storey block of wooden siding
bevelled and sand-painted to imitate stone, with a flat unbroken roofline and no porch, no columns,
no veranda, no cupola and no weathervane of any kind. At stage right a small newly finished wing,
its boards clean. At stage left the north end of the house is an open building site: a pole
scaffold lashed with rope, an open lime pit, stacked yellow pine boards, a wheelbarrow, a heap of
sand. A low retaining wall runs from the lower left of the picture up to the right behind the house.
A brick kitchen chimney beyond, an outbuilding roof, and the tops of trees in first leaf.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame. The horizon sits about one third of the way down from the top.
The open forecourt is a clear unobstructed band of ground across the lower middle of the picture,
running from one side to the other; a standing man on the near edge of it would be about a quarter
of the height of the whole picture, and about half that on the far edge. In the immediate
foreground, cropped by the bottom and left edges, the dark trunk of a tulip poplar and a stack of
sawn boards, drawn at the heaviest ink weight and with almost no colour in them. Drawn flat:
shallow, nearly parallel orthogonals, no deep one-point perspective construction.

LIGHT: high warm late-morning sun, key from frame left at about fifty-five degrees, long soft
shadows falling to the right. Clear spring air, a faint band of river haze on the far horizon only.

PALETTE: warm cream paper ground. Wash restricted to soot brown, cool grey-brown, yellow ochre and
a single grey-green for the new leaf; the wall and scaffold shadows in slate blue-grey. No saturated
colour anywhere in this picture. The untouched sky is the largest single area in the frame.

TECHNICAL: composed with generous empty margin on all four sides, with nothing important near any
edge. Any writing shown is illegible: fine ink strokes suggesting cursive, not readable letterforms.
No people in the immediate foreground. The open ground the figures will stand on is clear and
unobstructed.

STYLE: an eighteenth-century military topographical drawing — pen and wash on paper, made on the
ground by a trained officer who had forty minutes and no reason to fill the sheet.
[…the rest of §1.1, verbatim…]
```

---

# 3. FRAMING VOCABULARY

## 3.1 The two camera lines, verbatim

`04-scene-architecture.md` §3.1 and §3.2 ratified these strings and this document does not improve
them. **They are written for a diffusion model, not for a cinematographer. Do not convert them to
technical language — it makes them worse.** A model has seen ten thousand captions containing "on a
low rise looking down"; it has seen none containing "20° pitch, 40 mm equivalent."

**EXTERIOR — `framing: exterior_3q` — used on 15 plates**

```
CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame.
```

**INTERIOR — `framing: interior_elevation` — used on 10 plates**

```
CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person. The back wall is parallel to the picture plane. Very slight downward
angle only. The floor is a shallow band across the bottom of the frame. Symmetrical, flat, and
deliberately without deep perspective recession.
```

## 3.2 Translating the numbers into language the model answers to

| The spec says | Type this | Never type this |
|---|---|---|
| camera 4.0–5.0 m above the walk-plane | `as if standing on a low rise about four metres above the ground` | `elevated camera`, `high angle`, `drone` |
| pitch 20° (18–22) | `looking down at roughly twenty degrees` | `20 degree pitch`, `bird's eye`, `overhead`, `top-down`, `aerial` |
| ~40 mm equivalent | `normal lens, no wide-angle distortion, no fisheye` | `35mm`, `wide shot`, `establishing shot`, `cinematic` |
| horizon at y = 0.34 | `horizon high in the frame, about one third of the way down from the top` | `high horizon line` alone — it drifts |
| walk-plane band y 0.56–0.78 | `a clear unobstructed band of open ground across the lower middle of the picture, running from one side to the other` | `a path`, `a road` (both become the subject) |
| Washington 220 px near / 130 px far in a 900 px frame | `a standing man on the near edge of it would be about a quarter of the height of the whole picture, and about half that on the far edge` | any pixel figure; the model has no frame height |
| L4 occluders, 15–25% of frame height, heaviest ink, lowest chroma | `in the immediate foreground, cropped by the bottom and [left/right] edges, [the object], drawn at the heaviest ink weight and with almost no colour in it` | `foreground element`, `framing device`, `vignette` |
| no vanishing-point construction | `drawn flat: shallow, nearly parallel orthogonals, no deep one-point perspective construction` | `flat perspective` alone, which produces an orthographic elevation |
| the single receding element | `a line of [huts / tents / gabions / boats] running from the lower left of the picture into the upper right` | `leading lines`, `depth`, `perspective` |
| camera height 1.5–1.7 m, pitch 3° (interiors) | `from the height of a standing person`, `very slight downward angle only` | `eye level` alone, which flattens to 0° and loses the floor |
| interior floor band 0.30–0.40 | `the floor is a shallow band across the bottom of the frame` | `wide floor`, `tiled floor` |
| R5 camera, 1.6 m, pitch 0° | `at the height of a standing person's eyes, level with a face and never above it` | `eye level portrait`, `low angle` |

**The one word that ruins an exterior: `isometric`.** It is in `NEG-BASE` for that reason. The second
worst is `sprawling`, which the brief used and which produces a wide-angle lens every time. The third
is `epic`.

## 3.3 The recession: pick one and only one

Every exterior gets **exactly one** receding element, running lower-left → upper-right or mirrored
(art bible §5.3, SLIP-STAGE). Depth comes from that one recession plus aerial ink weight, and from
nothing else. Two recessions produce a perspective grid, which is what §5.3 forbids and what models
are worst at.

The eleven recessions in the game, so nobody invents a twelfth:

| Plate | The receding element | Direction |
|---|---|---|
| `MV-01` | the ha-ha retaining wall and the drive | lower-left → upper-right |
| `MV-04` | the wharf and the shoreline | lower-right → upper-left |
| `CB-01` | the lane between shelters | lower-left → upper-right |
| `CB-03` | the earthwork parapet | lower-right → upper-left |
| `BK-01` | the earthwork parapet and abatis line | lower-left → upper-right |
| `DL-03` | the run of the river bank | lower-right → upper-left |
| `DL-02` | the line of ice plates in the current | lower-left → upper-right |
| `TR-01` | King Street | lower-left → upper-right |
| `VF-01` | the brigade street of huts | lower-left → upper-right |
| `VF-03` | the fence line at the edge of the parade | lower-right → upper-left |
| `NW-02` | the hut street | lower-right → upper-left |

`DL-01`, `BK-02` and `YT-02` are near-frontal exteriors (waterline and night assault) and take the
**interior** camera line with an exterior subject. `YT-03` is a near-frontal exterior whose recession
is a true axial corridor and is the one deliberate exception, spec'd at its entry.

## 3.4 The painted-crowd rule — read before generating `VF-03′`, `YT-01` or `YT-03`

Art bible §5.5 caps a diorama at **nine background figures**. That cap counts **resolvable figures** —
people the eye separates and the writing could name. It does not cap painted mass.

> **A body of troops drawn at `L1` or far `L2` distance, in which individual men are not separable,
> is one form, not one hundred figures.** It is painted into the plate. Every figure the player can
> walk up to, target, or hear speak is a **billboard cutout** and is never in the plate.

This is what lets `YT-03` have two full lines of troops and `VF-03′` have a company of a hundred
drilling, without either breaking the nine-figure rule or requiring a hundred cutouts. The test at
review: **can you count them?** If yes, they are figures and there are too many. If they read as a
blue mass with hats along the top edge, they are a form and the plate is correct.

## 3.5 The eight light laws, corrected for the act order

Appended verbatim to every prompt in the act. `AI guide §5.5`, with the Act 6/7 swap applied and
erratum **E-2** folded in.

| Act | Light law — paste this string |
|---|---|
| **1** Mount Vernon | `high warm sun, key from frame left at about fifty-five degrees, long soft shadows falling to the right` |
| **2** Cambridge | `flat overcast with no directional light and no shadows, cool even grey daylight` |
| **3** Brooklyn | `low sun from frame right dropping into fog` — night variant: `moonlight from frame right, and lanterns carried within the picture` |
| **4** Delaware / Trenton | `night: the only light is torchlight from within the picture, warm and low and from frame left; the sky is lit only by the snow` — `TR-01` and `TR-01′` override to `thin grey daylight an hour after sunrise, no visible sun, driving sleet` |
| **5** Valley Forge | `low winter sun from frame left, very close to the horizon, cold, with long blue shadows` |
| **6** Yorktown | `high hazy sun near overhead, dust-warm, almost no shadow` |
| **7** Newburgh | `interior daylight from one window only, cold north light, no sun` — `NW-02` override: `thin early-spring sun, high overcast, weak shadows` |
| **8** Annapolis | `bright, even and almost shadowless; light from everywhere; deliberately flat and still` |

## 3.6 The paper ground, per act — corrected (erratum E-1)

The ground is named in the palette slot of every prompt. It never changes value by more than 6 L\*
across the whole game (art bible §2.1), which is why the game reads as one continuous sheet.

| Act | Ground | Hex | Say it in the prompt as |
|---|---|---|---|
| 1, 2, 3 | `PAPER-WARM` | `#EFE7D5` | `warm cream paper ground` |
| 4, 5 | `PAPER-COOL` | `#E5E3DB` | `cool grey-cream paper ground` |
| 6 Yorktown | `PAPER-WARM` | `#EFE7D5` | `warm cream paper ground` |
| 7 Newburgh — `NB-01`, `NW-01` | `PAPER-SMOKED` | `#DCD2BC` | `a warm smoked cream paper ground, slightly darkened` |
| 7 Newburgh — `NW-02` | `PAPER-WARM` | `#EFE7D5` | `warm cream paper ground` |
| 8 Annapolis | `PAPER-BRIGHT` | `#F6F2E6` | `a very pale bright cream paper ground` |

---

# 4. THE PROMPT BOOK — EVERY ENVIRONMENT PLATE IN THE GAME

## 4.0 How to read an entry

### 4.0.1 The count

**47 environment generations.** That is the whole environment art of the game and there is no
forty-eighth without a Creative Director sign-off and a decision-log entry.

| Class | Count | Where |
|---|---|---|
| Diorama masters (`R1`) | **27** | §4.1 – §4.8 |
| Map sheets (`R2`) | **6** | one per act that has a map table |
| State variants (img2img off an accepted master) | **5** | `CB-03′`, `TR-01′`, `VF-03′`, `VF-01′`, `MV-04′` |
| Gilt Frame plates (`R6`) | **8** | §4.9 |
| Interlude still (`R1`, 1 plate + 7 relights) | **1** | §4.10 |
| **Total generations** | **47** | |
| Prop-toggle revisits — **generate nothing** | 1 | `NB-01′` |
| Apex mood plates (`L2` only, img2img) | 7 | §6.4 — not new compositions |
| Surveyor's overlays | 12 | §4.11 — traced, not prompted |

### 4.0.2 What is *not* in a plate, ever

Four categories of thing the model must never be asked to put in an environment. This is the single
biggest reduction in failure surface available to the project.

1. **Any character the player can name, target, talk to, or walk up to.** All of them are billboard
   cutouts, composited at runtime, generated on stance sheets. Part 2 of this guide owns them. A plate
   that contains Washington is a plate that has to be repainted when his Stage II atlas ships.
2. **Any examinable object at readable size.** The ≥12 interactables per scene are props from the act
   atlas or in-engine glyph anchors. The plate paints the *place*; the props are separate generations
   at 1024².
3. **Any legible text, on anything.** Documents, signs, flag devices, map labels, gravestones,
   regimental colours. All type is DOM-rendered (`AI guide §5.1`, no exception, including the game's
   own title).
4. **Any element that straddles a depth-layer boundary.** Decided at blockout, not at prompt. See
   §5.2 and troubleshooting failure **T-10**.

Painted mass is permitted under §3.4. Two or three anonymous figures at `L1` distance are permitted
where the entry says so, and are drawn as silhouetted mass, not as people.

### 4.0.3 The entry format

Every entry gives: the scene and plate ID, the shipping filename stem, register, framing, seed base,
aspect, act ground, the **full prompt body** (paste after `wshwash,` and before the anchor), the
per-scene negative additions, and the reject conditions.

**Seed families** follow AI guide §2.4: `act × 10000 + scene × 100`. Layer and repair variants take
`base + 1, 2, 3…`; the state variant of a plate takes `base + 50`. Map sheets use their own scene
index. Gilt Frames use `act × 10000 + 900`.

**Aspect and generation size**, from AI guide §6.3, are constant by class and are not repeated per
entry: dioramas, Gilt Frames and the interlude generate at **1536 × 864 (16:9)**, master at 2304×1296,
ship at 2048×1152 (L4 at 15% bleed); map sheets generate at **2048 × 2048 (1:1)** and ship at 1536².

---

## 4.1 ACT 1 — MOUNT VERNON

**Ground** `PAPER-WARM #EFE7D5` · **Light law** `high warm sun, key from frame left at about
fifty-five degrees, long soft shadows falling to the right` · **Generate at `W` = 0.85** (act ceiling)
· **Group D permitted:** none, except `BUFF` on one folded coat in `MV-04`.

**Act negative additions — append to `NEG-BASE` on all four plates:**
`porch, colonnade, columns, cupola, weathervane, piazza, veranda, brick mansion, stone mansion,
symmetrical wings, white columns, antebellum, plantation nostalgia, magnolia, cotton, spanish moss,
manicured lawn, boxwood parterre`

> **`MV-01` is the highest-risk single asset in the project.** Every photograph the model has seen of
> Mount Vernon is the finished house. In May 1775 there is no piazza, no cupola and no weathervane,
> and the north end is a building site. Budget eight candidate batches for this plate, not one, and
> reject on the roofline before you look at anything else.

---

### `A1-S1` · `MV-01` "The Approach"
**File** `a01_s01_bg_the-approach` · **R1** · `exterior_3q` · **Seed base** 10100

**PROMPT BODY**
```
Mount Vernon in Virginia as it stood in May 1775, seen from the land side to the west across the
open forecourt. The house is a plain two-and-a-half storey block of wooden siding bevelled and
sand-painted to imitate stone, with a flat unbroken roofline and no porch, no columns, no veranda,
no cupola and no weathervane of any kind. At stage right a small newly finished wing, its boards
clean. At stage left the north end of the house is an open building site: a pole scaffold lashed
with rope, an open lime pit, stacked yellow pine boards, a wheelbarrow, a heap of sand. A low
retaining wall runs from the lower left of the picture up to the right behind the house. A brick
kitchen chimney beyond, an outbuilding roof, and the tops of trees in first leaf.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame. The horizon sits about one third of the way down from the top.
The open forecourt is a clear unobstructed band of ground across the lower middle of the picture,
running from one side to the other; a standing man on the near edge of it would be about a quarter
of the height of the whole picture, and about half that on the far edge. In the immediate
foreground, cropped by the bottom and left edges, the dark trunk of a tulip poplar and a stack of
sawn boards, drawn at the heaviest ink weight and with almost no colour in them. Drawn flat:
shallow, nearly parallel orthogonals, no deep one-point perspective construction.

LIGHT: high warm late-morning sun, key from frame left at about fifty-five degrees, long soft
shadows falling to the right. Clear spring air, a faint band of river haze on the far horizon only.

PALETTE: warm cream paper ground. Wash restricted to soot brown, cool grey-brown, yellow ochre and
a single grey-green for the new leaf; the wall and scaffold shadows in slate blue-grey. No saturated
colour anywhere in this picture. The untouched sky is the largest single area in the frame.

TECHNICAL: composed with generous empty margin on all four sides, with nothing important near any
edge. Any writing shown is illegible: fine ink strokes suggesting cursive, not readable letterforms.
No people in the immediate foreground. The open ground the figures will stand on is clear and
unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `finished house, restored historic house, tourist
photograph, symmetrical facade`

**WATCH FOR — reject and regenerate if:**
- **Any** porch, column, cupola, weathervane, or a curved/broken roofline. This is F-09 and it is
  automatic rejection, not a repair. Do not inpaint it out — the model that produced it has produced
  the wrong house underneath as well.
- The north end reads as a *ruin* rather than a *building site*. A ruin has no scaffold and no
  stacked new lumber. If in doubt the lime pit is the tell — it must be a neat rectangular pit, not
  a hole.
- The forecourt has objects standing in it. That band is the walk-plane; it must be empty.
- Bare paper outside 35–55%, or no single untouched region ≥12% of frame. Run `bare-paper.mjs`
  **before** you spend an hour slicing.
- Silhouette test fails: composite a flat grey Washington at the near and far edges of the forecourt.
  Near must land 210–230 px in a 900 px frame, far 125–140 px. A 220/190 result is a flat camera —
  redraw the blockout, do not re-prompt.

---

### `A1-S2` · `MV-02` "The Study"
**File** `a01_s02_bg_the-study` · **R1** · `interior_elevation` · **Seed base** 10200

**PROMPT BODY**
```
The small private study of an eighteenth-century Virginia gentleman-planter, 1775: a plain panelled
room with a single tall sash window at stage left, wide bare floorboards, a writing desk with a
slant lid, one Windsor chair, a terrestrial globe on a stand, a wall of open bookshelves at stage
right filled with plain calf-bound volumes, a fowling piece resting on hooks above a simple mantel,
and a plain plastered chimney breast. A dark travelling chest against the back wall.

CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person. The back wall is parallel to the picture plane. Very slight downward
angle only. The floor is a shallow band across the bottom of the frame. Symmetrical, flat, and
deliberately without deep perspective recession. In the immediate foreground, cropped by the bottom
and right edges, the dark edge of a doorframe and its architrave, drawn at the heaviest ink weight
with almost no colour in it.

LIGHT: hard morning sun entering through the single window at stage left and thrown across the
floorboards as one clean-edged trapezoid of light. The rest of the room is in even, gentle shade.
No candles, no fire lit.

PALETTE: warm cream paper ground. The whitewashed plaster of the far wall is left as untouched bare
paper. Wash restricted to soot brown and cool grey-brown for the panelling, boards and furniture,
yellow ochre in the light on the floor, slate blue-grey in the shaded corners. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides, with nothing important near any
edge. Any writing shown is illegible: fine ink strokes suggesting cursive, not readable letterforms.
No people. The floorboards in front of the desk are clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `library, grand study, oil portraits on the wall, ornate
carving, gilt mirror, chandelier, oriental rug, Victorian study, leather armchair, fireplace roaring`

**WATCH FOR:**
- Deep one-point perspective. This is the commonest interior failure and it is the one that makes an
  interior read as "AI couldn't do vanishing points." **Push flatter than feels right.** If the side
  walls converge visibly, reject.
- The room becoming grand. It is a small room in a modest house. Reject chandeliers, carved
  overmantels, and anything upholstered.
- Bare paper below 25% — interiors run 25–40%, and the whitewashed wall is where you get it. If the
  model has painted the wall, regenerate with `the far wall is left as bare untouched paper` moved to
  the front of the palette slot.
- The window light landing as a soft glow rather than a hard-edged shape. It is a *drawn* trapezoid
  with a tideline, not a gradient.

---

### `A1-S3` · `MV-03` "The Quarter" — **WITNESS REGISTER `R5` · `sensitive: true`**
**File** `a01_s03_bg_the-quarter` · **R5** · `exterior_3q` overridden to eye level · **Seed base** 10300

> **This asset does not ship without the written sign-off at `historical-visual-reference.md` §7.6.**
> Generate it, review it, and do not slice it or encode it until the gate has cleared. The Art Lead
> cannot waive this gate and neither can the schedule.

**PROMPT BODY** — insert the **WITNESS block (§1.6)** between this body and the anchor.
```
The work yard of the House for Families at a large Virginia estate in 1775: one substantial
two-storey timber dwelling of weathered clapboard with a shingled roof and a plain brick chimney —
a single sizeable building, not a row of cabins. In front of it an open swept dirt yard with a
brick-lined cellar hatch set into the ground, a low paling fence, a cooking hearth of stacked
fieldstone with an iron pot hanging over it, a plain wooden bench, a rough-sawn work table, and a
worked garden plot of turned earth and bean poles at stage right.

CAMERA: the drawing is made at the height of a standing person's eyes, level with a face and never
above it, and closer than a landscape view. The building occupies less than half the picture; the
open yard where people stand fills the lower and central part of the frame and is clear and
unobstructed. Normal lens, no wide-angle distortion. Drawn flat: shallow, nearly parallel
orthogonals, no deep one-point perspective construction. In the immediate foreground, cropped by
the bottom and left edges, the dark corner post of the paling fence, drawn at the heaviest ink
weight.

LIGHT: clear even plain north light, flat, with no strong shadows. No haze, no mist, no golden hour,
no sunset, no atmospheric softening of any kind.

PALETTE: warm cream paper ground, and a single neutral grey wash. There is no colour anywhere in
this drawing.

TECHNICAL: composed with generous empty margin on all four sides. No people in the picture. The
yard is clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `row of cabins, log cabin, shanty, ruin, derelict, squalor,
picturesque, romantic, golden light, warm glow, mist, haze, sunset, moonlight, plantation scene,
cotton field, field workers in the distance, sentimental`

**WATCH FOR:**
- **Any warmth at all.** Warm light is the failure mode this entire register exists to prevent. If
  the plate is pretty, it is wrong (`historical-visual-reference.md` §7.1).
- **Any grimness added in compensation.** Ruin, squalor, bare boards and straw are the opposite
  failure and equally rejected. The archaeology says this was a household: the plate must be as
  carefully furnished as the mansion's study.
- A **row of cabins**. There is one building at the Mansion House Farm in 1775 and the greenhouse
  quarters do not exist until 1792.
- The camera creeping above eye level. Composite a standing figure: their eyes must be at or above
  the horizon.
- Colour of any kind, including a warm cast in the grey. The single wash is neutral. Colour appears
  **only** on the character cutouts, in personal possessions — a dyed neckerchief, a copper ring, a
  blue glass bead — and those are Part 2 assets, not this plate.

---

### `A1-S4` · `MV-04` "The Dock" — **shared plate, reused as `A8-S3`**
**File** `a01_s04_bg_the-dock` · **R1** · `exterior_3q` · **Seed base** 10400

This is the only composition the game shows twice, eight years apart, and it carries the payoff of
the first shot in the game. **Generate it to a higher standard than its Act 1 role justifies**, and
compose it knowing that in `MV-04′` the house on the slope acquires a piazza and a cupola.

**PROMPT BODY**
```
A private wharf on a wide tidal river in Virginia, late afternoon in May 1775: a timber landing on
piles running out into the water at stage right, a single-masted sloop moored alongside with her
sail brailed up, a low shingled fish house on the bank, stacked herring barrels, a coil of rope, a
drawn-up flat-bottomed skiff. A grassy slope rises from the landing toward the left, and small in
the distance at the top of the slope stands a plain two-and-a-half storey house with a flat
roofline, a pole scaffold at its far end. The river is a broad pale emptiness filling the upper
half of the picture.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The bank in front
of the landing is a clear unobstructed band of open ground across the lower middle of the picture,
running from one side to the other; a standing man on the near edge of it would be about a quarter
of the height of the whole picture, and about half that on the far edge. The wharf and the shoreline
run from the lower right of the picture into the upper left. In the immediate foreground, cropped by
the bottom and right edges, a dark mooring post and a heap of net, drawn at the heaviest ink weight
with almost no colour in them. Drawn flat, shallow nearly parallel orthogonals, no deep one-point
perspective.

LIGHT: warm late-afternoon sun, key from frame left, long soft shadows falling to the right.
Clear air, a faint haze on the far shore only.

PALETTE: warm cream paper ground. The river and the sky are both left as untouched bare paper,
divided only by the faintest ruled line of the far shore. Wash restricted to soot brown and
cool grey-brown for the timber, yellow ochre on the grass slope, one grey-green for the trees.
No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides, with nothing important near any
edge. No people. The bank in front of the landing is clear and unobstructed. Any writing shown is
illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `harbour, port, busy dock, tall ship, schooner, warehouse,
crane, lighthouse, seagulls, ocean waves, surf`

**WATCH FOR:**
- The river painted. It and the sky are the plate's bare-paper reserve and together they are more
  than half the frame. If the model has washed the water blue, regenerate; do not paint it out.
- A *harbour*. This is one private landing on a river. One sloop, one skiff, nothing else afloat.
- The house on the slope drifting into the finished Mount Vernon. It is small and distant here, but
  it must still be flat-roofed and scaffolded — a student who sees the finished house in Act 1 loses
  the entire Act 8 reveal.
- Waves. It is a tidal river, and the water surface is bare paper with at most three ruled lines.

---

## 4.2 ACT 2 — CAMBRIDGE AND THE BOSTON LINES

**Ground** `PAPER-WARM #EFE7D5` · **Light law** `flat overcast with no directional light and no
shadows, cool even grey daylight` · **Generate at `W` = 0.62** (act ceiling) · **Group D permitted:**
`BRITISH-MADDER` only, and only at the far horizon at under 1% of frame. **There is no Continental
blue anywhere in Act 2** and that absence is the act's thesis.

**Act negative additions:**
`blue uniform coats, uniformed army, matching uniforms, neat rows of white tents everywhere, parade
ground, drilling soldiers, fortress, castle, stone walls, sunshine, blue sky, long shadows`

---

### `A2-S1` · `CB-01` "The Camp Street"
**File** `a02_s01_bg_camp-street` · **R1** · `exterior_3q` · **Seed base** 20100

**PROMPT BODY**
```
A rough lane running between improvised soldiers' shelters on a hillside outside Boston in the
summer of 1775. The shelters are all different and none of them is a tent: one of nailed boards,
one of sailcloth stretched over poles, one of boards and sailcloth mixed, one of stacked turf and
fieldstone, one of bent birch saplings, one a heap of piled brush. Cooking fires, a stack of
firewood, a barrel, a line of washing. At stage right in the middle distance, in complete contrast,
about a dozen proper white canvas ridge tents pitched in exact ordered rows with their guy lines
squared. Far beyond, across water, the low pale shape of a town on a peninsula, drawn with the
thinnest line and almost no wash.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The lane is a
clear unobstructed band of open muddy ground across the lower middle of the picture, running from
the lower left of the picture into the upper right; a standing man on the near edge of it would be
about a quarter of the height of the whole picture, and about half that on the far edge. In the
immediate foreground, cropped by the bottom and left edges, a dark leaning shelter post and a
stack of split firewood, drawn at the heaviest ink weight and with almost no colour. Drawn flat,
shallow nearly parallel orthogonals, no deep one-point perspective.

LIGHT: flat overcast with no directional light and no shadows, cool even grey daylight. Damp air,
low smoke lying along the ground.

PALETTE: warm cream paper ground. The overcast sky is untouched bare paper across the whole top of
the picture. Wash restricted to cool grey-brown mud, soot brown timber, wet stone grey for the
weathered boards, one pale grey-green for the trampled grass. The canvas of the ordered tents is
left almost bare, only faintly toned. No saturated colour anywhere.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible.
No people in the immediate foreground. The lane is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `refugee camp, slum, medieval village, thatched cottage,
teepee, wigwam, campsite, tourist camping`

**WATCH FOR:**
- The shelters becoming uniform. **Six shelters, six different materials** — that variety is the
  whole content of the plate. If they have regularised into a row of similar huts, regenerate with
  the six materials moved to the front of the subject slot and the tent line moved to the back.
- The ordered tents dominating. They are a *dozen*, in the middle distance, at stage right. If they
  fill the frame the plate has argued the opposite of what it is for.
- Boston rendered with any detail or any red. It is a pale band on the horizon at the thinnest ink
  weight. The red coats are a spyglass event in `CB-03`, not here.
- Shadows. The act has none. A cast shadow anywhere is an act-consistency failure that the LUT
  cannot fix.

---

### `A2-S2` · `CB-02` "Headquarters Parlour"
**File** `a02_s02_bg_hq-parlour` · **R1** · `interior_elevation` · **Seed base** 20200

**PROMPT BODY**
```
The fine front parlour of a large Georgian colonial mansion in 1775, taken over as a soldier's
headquarters. Full-height painted wood panelling with a moulded cornice and a dentil chimneypiece,
two tall sash windows at stage left, a good patterned carpet, and a handsome mahogany table
standing in the middle of the room completely buried under loose papers, folded returns, a large
unrolled sheet, an inkstand, and a pair of dividers. Two plain camp stools drawn up to it. A fine
upholstered chair pushed back against the panelling and not being used. A large gilt-framed family
portrait on the far wall, turned around to face the wall.

CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person. The back wall is parallel to the picture plane. Very slight downward
angle only. The floor is a shallow band across the bottom of the frame. Symmetrical, flat, and
deliberately without deep perspective recession. In the immediate foreground, cropped by the bottom
and both side edges, the dark edges of a doorframe on the left and a tall case clock on the right,
drawn at the heaviest ink weight with almost no colour.

LIGHT: flat cool grey daylight from the two windows at stage left, no direct sun, no shadows,
no candles.

PALETTE: warm cream paper ground. The panelling above the chair rail is left largely as bare
untouched paper. Wash restricted to soot brown for the mahogany and the panel mouldings, cool
grey-brown, yellow ochre for the papers, a dull brick red used only in the carpet's pattern and
nowhere else. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible:
fine ink strokes suggesting cursive, not readable letterforms — the papers on the table must not
carry readable words. No people. The floor in front of the table is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `war room, tactical map table, generals conferring,
candlelight, fireplace roaring, tavern, log cabin interior, rustic`

**WATCH FOR:**
- **Readable text on the papers.** This plate has more paper in it than any other and it is the most
  likely place in the game to produce gibberish. Zoom every sheet at 200%. Any near-word is a reject.
  If the plate is otherwise perfect, inpaint the table surface at denoise 0.45 with the illegibility
  clause alone.
- The room going rustic. The joke of the shot is that this is a *fine* room full of paperwork. Log
  walls, exposed beams or a stone hearth all destroy it.
- Candlelight. Act 2 has no warm light source anywhere.
- Bare paper below 25%. The panelling above the chair rail is the reserve.

---

### `A2-S3` · `CB-03` "The Lines"
**File** `a02_s03_bg_the-lines` · **R1** · `exterior_3q` · **Seed base** 20300

**PROMPT BODY**
```
An earthwork siege line on a low hill above water, autumn 1775. A long raised earth parapet runs
across the picture with a row of bottomless wicker gabions — woven cylindrical baskets about three
feet high, filled with earth and spilling a little over their rims — set along its crest, and
bundles of brushwood fascines stacked behind them. A firing step of trodden earth runs along the
inside. At stage right the parapet is cut down to a low embrasure where a man would stand to look
out. Beyond and below, a broad stretch of pale water, and on the far side the low grey shape of a
town on a peninsula with steeples and masts, drawn at the very thinnest line weight with almost no
wash at all.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The trodden firing
step behind the parapet is a clear unobstructed band of open ground across the lower middle of the
picture; the parapet runs from the lower right of the picture into the upper left. A standing man on
the near end of the step would be about a quarter of the height of the whole picture, and about half
that at the far end. In the immediate foreground, cropped by the bottom and right edges, a stacked
pile of unfilled gabions and a spade driven into the earth, drawn at the heaviest ink weight and
with almost no colour. Drawn flat, shallow nearly parallel orthogonals, no deep one-point
perspective.

LIGHT: flat overcast with no directional light and no shadows, cool even grey daylight. Still, cold,
damp air.

PALETTE: warm cream paper ground. The sky and the water are both left as untouched bare paper,
separated only by the thinnest line of the far shore. Wash restricted to cool grey-brown raw earth,
soot brown for the wicker and brushwood, wet stone grey in the shadow of the parapet. No saturated
colour anywhere in this picture.

TECHNICAL: composed with generous empty margin on all four sides. No people. The firing step is
clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `trench warfare, sandbags, barbed wire, WWI, stone fort,
castle wall, battlements, cannon firing, smoke of battle, explosion`

**WATCH FOR:**
- **Gabions rendering as sandbags or as barrels.** They are woven wicker cylinders and the weave must
  be drawn. If the model has produced smooth cylinders, add `woven basketwork, the weave of the
  willow rods clearly drawn` to the front of the subject slot and regenerate.
- Twentieth-century trench vocabulary — a revetted trench with a firing parapet reads as 1916.
  This is a low earth bank, not a dug trench.
- The town on the far side acquiring detail or colour. Thinnest line, no wash. Its only job is to be
  far away.
- Water painted. Sky and water together are the bare-paper reserve.

---

### `A2-S4` · `MT-01` "The Survey Sheet: Knox's Route" — **MAP SHEET `R2`**
**File** `a02_s04_mp_knox-route` · **R2** · `wshmap` · **Seed base** 20400 · **2048 × 2048, 1:1**

Uses **`wshmap`** as the trigger and the **map anchor (§1.4)**, not the master anchor.

**PROMPT BODY**
```
wshmap, a manuscript survey plan of the country between the upper Hudson valley and the coast of
Massachusetts in winter: a large irregular lake at the top left with a small star-shaped fortified
work drawn at its southern end, a river running south from it, a second broad river, a range of
hills crossing the middle of the sheet drawn in dense hachures, extensive woodland shown as small
repeated lollipop tree symbols, scattered cleared farmland shown as fine ruled furrow lines, a
handful of small settlements each drawn as five or six tiny plan-view rectangles, a thin road
running east across the hills, and at the right-hand edge a coastline with a bay and a peninsula.

The sheet lies flat on a plain linen-backed board. Two thirds of it is untouched paper.

There is no writing on this sheet of any kind: no place names, no numbers, no compass rose, no scale
bar, no cartouche, no border, no legend, no title.
```

**NEGATIVE** map negative (§1.4) + `mountains in perspective, snowy peaks, terrain mesh, isometric
map, video game map, hex grid, battle map, arrows, dotted route line`

**WATCH FOR:**
- **Any lettering.** Map sheets are the highest-risk text asset in the game, because every map in
  the training data has names on it. Zoom the whole sheet. One near-word is a reject.
- Hachures rendering as shading. They are discrete parallel ink strokes running down the slope, not
  a grey tone. If the hills look airbrushed, regenerate.
- Perspective creeping in — a mountain drawn in profile, a horizon, a sky. This is a plan. It is
  seen from directly above and it has no light source.
- A route drawn. **The route is a token path composited in-engine**, and the whole point of the scene
  is that the player chooses it. A pre-drawn dotted line makes the puzzle a formality.

---

### `A2-S5` · `CB-03′` "Prospect Hill, 1 January 1776" — **STATE VARIANT, img2img**
**File** `a02_s03_bg_the-lines_s-newyear` · **R1** · **Seed** 20350 · **denoise 0.34**

**Do not generate this from a prompt.** It is `CB-03`'s accepted master, run back through `wash-v1`
at **denoise 0.34** with the modified body below. Above ~0.45 the earthwork moves and it stops being
the same place (AI guide §5.3). Only `L2` is re-sliced and re-shipped; `L0`, `L1`, `L3` and `L4` are
the master's files, unchanged.

**IMG2IMG BODY** — same string as `CB-03` with these three substitutions:
```
… autumn 1775 → midwinter, 1 January 1776, thin snow lying in the hollows of the earthwork and
along the tops of the gabions, the ground frozen hard and rutted …

… ADD, at stage left on the parapet: a tall bare flagstaff carrying one flag — thirteen alternating
horizontal red and white stripes with a small blue rectangle in the upper corner next to the staff
bearing the crossed red and white saltires and cross of the British union. The flag hangs almost
still in a light air.

… ADD, in the middle distance behind the parapet: two heavy iron cannon barrels lashed on low wooden
sledges, hauled up and standing where they have been dragged, ropes slack, the snow churned around
them.
```

**NEGATIVE** as `CB-03`, plus `stars, star spangled banner, thirteen stars, circle of stars, Betsy
Ross, waving flag, wind, flag flying dramatically`

**WATCH FOR:**
- **The canton.** This is the Grand Union — the *full British union* in the corner, no stars of any
  kind. It is the best teaching object in Act 2 and the model's prior will fight you on every
  generation. If any star appears, reject; do not repair, because a repaired canton is usually wrong
  in a subtler way.
- The flag flying heroically. It hangs. A snapping flag is patriotic iconography (art bible §9.12)
  and it is banned.
- Architecture drift. Overlay the variant on the master at 50% opacity: the parapet crest, the gabion
  positions and the far shoreline must not move by more than a few pixels. If they have, your denoise
  was too high — rerun at 0.30.

---

## 4.3 ACT 3 — BROOKLYN

**Ground** `PAPER-WARM #EFE7D5` · **Light law** `low sun from frame right dropping into fog`; night
variant `moonlight from frame right, and lanterns carried within the picture` · **Generate at
`W` = 0.40** (act ceiling — Act 3 cannot look like a good day and the shader enforces it) ·
**Group D permitted:** `CONTINENTAL-BLUE` at under 5% of frame; nothing else.

**The act's controlling instruction: the paper gets wet.** Fog is **unpainted paper**, not white
paint, and the ink line dissolves at the frame edges. Both belong in the palette slot of all three
plates.

**Act negative additions:**
`white fog, painted mist, smoke machine, volumetric fog, god rays, blue hour, cinematic haze,
skyline, modern city, Brooklyn Bridge, skyscraper`

---

### `A3-S1` · `BK-01` "The Parapet"
**File** `a03_s01_bg_the-parapet` · **R1** · `exterior_3q` · **Seed base** 30100

**PROMPT BODY**
```
An American earthwork line across low ground above a wide river, late August 1776. A long raised
earth parapet with a ditch in front of it runs across the picture. In the middle distance, laid in
front of the ditch, an abatis: felled trees dragged into a continuous tangled thicket with their
sharpened branch ends turned outward toward the viewer's right, raw pale timber, thorny and
disordered — not neat rows of pointed stakes. At stage left, a five-sided star-shaped earthwork
salient with an embrasure cut in it. Beyond the parapet, flat marsh with reed and standing water at
stage right, then a broad river, and on the far side the low pale shape of a town with steeples and
masts, drawn at the very thinnest line weight with almost no wash.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The trodden ground
inside the parapet is a clear unobstructed band of open earth across the lower middle of the
picture; the parapet and the abatis line run together from the lower left of the picture into the
upper right. A standing man on the near end would be about a quarter of the height of the whole
picture, and about half that at the far end. In the immediate foreground, cropped by the bottom and
left edges, a dark heap of spoil earth with two spades stuck upright in it, drawn at the heaviest
ink weight and with almost no colour. Drawn flat, shallow nearly parallel orthogonals, no deep
one-point perspective.

LIGHT: low sun from frame right, sinking into a rising bank of fog, so the light is weak, level and
without warmth. Long weak shadows to the left. Heavy damp air.

PALETTE: warm cream paper ground. The sky, the river and the fog are all left as untouched bare
paper — the fog is not painted, it is the bare sheet showing through, and the drawing simply stops
where the fog begins. Wash restricted to cool grey-brown earth, soot brown for the felled timber,
wet stone grey in the ditch, one dull grey-green in the marsh reed. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. No people. The ground inside the
parapet is clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `pointed stakes in rows, palisade, wooden fence, chevaux de
frise, barbed wire, sandbags, trench, WWI, stone fort`

**WATCH FOR:**
- **The abatis becoming a palisade.** This is the single most likely error in the plate. An abatis is
  a tangled thicket of whole felled trees with branch ends outward; a row of pointed stakes is wrong
  and is a specific catchable error. Reject and re-prompt with `whole felled trees dragged into a
  tangle, branches outward, disordered` at the front of the subject slot.
- Manhattan acquiring a skyline. It is a low pale eighteenth-century town of steeples and masts.
  Any tall block silhouette is an instant reject.
- Fog painted as white or grey. It must be the untouched sheet. If the model has painted it, the
  plate cannot be sliced with a usable `L0`.
- Bare paper high rather than low — this plate can overshoot 55% because sky, river and fog are all
  reserved. If it lands above 55%, the parapet needs more drawn structure, not more wash.

---

### `A3-S2` · `MT-02` "The East River" — **MAP SHEET `R2`**
**File** `a03_s02_mp_east-river` · **R2** · `wshmap` · **Seed base** 30200 · **2048 × 2048, 1:1**

**PROMPT BODY**
```
wshmap, a manuscript survey plan of a large tidal estuary and two islands: a broad channel of open
water running from the lower left of the sheet to the upper right, narrowing at the bottom into a
strait between two headlands; a long island on the right side of the channel and a second land mass
on the left; on the left island, at the water's edge, a compact grid of plan-view city blocks; on
the right island a line of small star-shaped and square fortified works drawn across the neck of a
peninsula, with a fine ruled line joining them; a marsh at the southern end shown as stipple and
short horizontal ticks; woodland shown as small repeated lollipop tree symbols; cleared farmland
shown as fine ruled furrow lines; roads as single thin lines; a ferry crossing marked only as a
short line of dashes between two small landing rectangles.

The sheet lies flat on a plain linen-backed board. Two thirds of it is untouched paper. The open
water is entirely untouched paper except for a pale flat blue-grey tint along its edges.

There is no writing on this sheet of any kind: no place names, no numbers, no compass rose, no scale
bar, no cartouche, no border, no legend, no title.
```

**NEGATIVE** map negative (§1.4) + `modern city grid, Manhattan skyline, bridges, tunnels, subway,
arrows, dotted route line, ships drawn in perspective`

**WATCH FOR:**
- Ship symbols. **The fleet tokens and the wind arrow are in-engine objects** — the sheet is drawn
  empty of both, because the whole mechanic is that the player rotates the wind and watches the
  reachable positions change.
- Lettering. Same standard as `MT-01`.
- A modern street grid. The blocks are irregular, small, and confined to the southern tip of the
  left-hand island.

---

### `A3-S3` · `BK-03` "Four Chimneys"
**File** `a03_s03_bg_four-chimneys` · **R1** · `interior_elevation` · **Seed base** 30300

The flattest and most claustrophobic composition before Act 7. Push the flatness harder than
anywhere else in the first half of the game.

**PROMPT BODY**
```
The parlour of a substantial colonial house at night, 29 August 1776, in heavy rain. A low-ceilinged
panelled room with one tall sash window at stage right streaming with rain on the outside of the
glass and black beyond it. A large plain table stands square in the middle of the room, with a
single unrolled chart lying on it and a group of three candles in plain brass sticks at its centre.
Only two chairs in the room, and both pushed back and empty. A plain fireplace at stage left with a
small fire nearly out. Water has come in under the door at stage left and lies in a dark spreading
patch on the floorboards. A shelf of abandoned books along the back wall.

CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person. The back wall is parallel to the picture plane. Very slight downward
angle only. The floor is a shallow band across the bottom of the frame. Symmetrical, flat, and
deliberately without deep perspective recession — the room feels shallow and pressed, its back wall
close to the viewer. In the immediate foreground, cropped by the bottom and both side edges, the
dark vertical edges of a doorframe on the left and a tall press cupboard on the right, drawn at the
heaviest ink weight and with almost no colour, closing the picture in on both sides.

LIGHT: one small group of candles on the table, low and warm, throwing the only light in the room
upward and outward a short distance; the corners of the room in deep even shade. Cold black rain
beyond the window. No moonlight, no lamp, no fire glow beyond a dull ember.

PALETTE: cool grey-cream paper ground. Wash restricted to soot brown for the panelling and
furniture, wet stone grey for the wet boards and the shadow, one narrow pass of warm ochre only
where the candlelight actually falls on the table and the chart. No saturated colour. The rain on
the window is drawn as fine ink lines over bare paper, not painted.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible:
the chart on the table carries no readable words or numbers. No people. The floor in front of the
table is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `war council painting, generals around a table, dramatic
candlelight, chiaroscuro, Rembrandt, tavern, inn, cosy, warm glow filling the room, fireplace
blazing, lightning`

**WATCH FOR:**
- **Chiaroscuro.** The plate wants one small warm pool and a lot of even shade, not a Baroque light
  effect. If the candles are throwing dramatic modelled light up the walls, the plate has become
  history painting and belongs in Act 3's Gilt Frame, not in Act 3.
- Too many chairs. **Two chairs and nine officers is the shot** — the emptiness of chairs is the
  content. The officers are cutouts.
- The room getting comfortable. It is wet, cold and too small.
- A deep perspective box. If you can see two side walls converging, reject.

---

### `A3-S4` · `BK-02` "The Ferry Landing, Night" — **act apex**
**File** `a03_s04_bg_ferry-landing` · **R1** · `interior_elevation` camera on an exterior subject ·
**Seed base** 30400

The showpiece of Act 3, and the plate that holds an eleven-second unmoving camera. It has to survive
being looked at.

**PROMPT BODY**
```
A river ferry landing at night, 30 August 1776. A rough timber landing stage runs across the bottom
of the picture, wet and dark. Drawn up broadside along it, filling the width of the frame, are four
open flat-bottomed boats of different sizes, their oars shipped and their thwarts empty, riding low.
A few small ship's lanterns hang on poles and on the boats' sterns, each throwing a small close
pool of warm light and no more. Behind the boats the water, and beyond the water nothing at all —
the far shore is not drawn. A heap of stores on the landing at stage left: barrels, a coil of cable,
a wooden chest. Thick fog lying on the water and rising.

CAMERA: near-frontal, the camera low and close to the level of the landing, as if looking straight
along a shallow stage from just above the boards. The line of boats is parallel to the picture
plane. Very slight downward angle only. Symmetrical, flat, and deliberately without deep perspective
recession. In the immediate foreground, cropped by the bottom and left edges, a dark mooring bollard
with cable turned round it and a stack of oars, drawn at the heaviest ink weight and with almost no
colour.

LIGHT: moonless. The only light in the picture is the lanterns hanging within it, small, low, warm
and reaching almost nowhere. Everything more than a few feet from a lantern is in even darkness.
No moonlight, no sky glow, no fires.

PALETTE: warm cream paper ground. The fog and the water above the boats are left entirely as
untouched bare paper, and the far shore is not drawn at all — the drawing simply stops, the ink line
dissolving away at the top and at both side edges of the picture with nothing beyond it. Wash
restricted to soot brown and wet stone grey for the boats and the timber, and one narrow warm ochre
pass only in the small circles where lantern light actually falls. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. No people. The landing boards in
front of the boats are clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `moonlight, moon, stars, starry sky, dramatic night sky,
torch flames, bonfire, burning, glowing water, reflections on water, lens flare, silhouetted crowd,
epic scale`

**WATCH FOR:**
- **The far shore appearing.** The composition's argument is that there is nothing on the other side.
  If the model has drawn a bank, a treeline or a light over there, reject.
- Moonlight. The night is moonless and the act's night law says the lanterns are the only light. A
  moonlit river is the picturesque version of this scene and the whole act is against it.
- The boats becoming small rowing boats or a fleet. Four boats, open, flat-bottomed, broadside, empty.
- **Reflections.** Painted reflections on water are the fastest way to lose the bare-paper reserve and
  they are also a nineteenth-century habit. The water is paper.
- Bare paper above 55%. This plate is the most likely in the game to overshoot. If it does, the
  answer is more drawn structure on the landing and in the boats, never more wash on the water.

---

## 4.4 ACT 4 — THE DELAWARE AND TRENTON

**Ground** `PAPER-COOL #E5E3DB` · **Light law** `night: the only light is torchlight from within the
picture, warm and low and from frame left; the sky is lit only by the snow`, with `TR-01`/`TR-01′`
overriding to `thin grey daylight an hour after sunrise, no visible sun, driving sleet` · **Generate
at `W` = 0.55** (act ceiling) · **Group D permitted:** `FLAME` and `CONTINENTAL-BLUE`; `TR-01` may
additionally carry `PRUSSIAN-BLUE` because the Hessians are read by the mitre cap, not the coat.

**The act's controlling instruction: sleet is scraped, not painted.** Every Act 4 palette slot
carries the scratched-white clause verbatim. It is a real eighteenth-century technique — a knife
point through dried wash — and it is the act's signature mark.

**Act negative additions:**
`Leutze, Washington Crossing the Delaware, rowboat, dinghy, standing heroically in a boat, flag in a
boat, ice floes like arctic, iceberg, snowfall dots, snow specks, blizzard particles, Christmas card,
picturesque snow, moonlit snow, sleigh, warm windows glowing`

---

### `A4-S1` · `DL-03` "McConkey's Ferry Camp"
**File** `a04_s01_bg_ferry-camp` · **R1** · `exterior_3q` · **Seed base** 40100

**PROMPT BODY**
```
The bank above a river ferry on the afternoon of 25 December 1776, in wet snow. Low improvised
shelters of boards and brush along the slope, none of them proper tents, with three or four small
inadequate fires between them and men's blankets slung as windbreaks. Hauled up on the shingle at
the water's edge, three long black open cargo boats with high straight sides — each one much longer
than a man could span, forty to sixty feet, flat-bottomed and empty, with long poles laid along
their gunwales. A stack of barrels, a wagon with one wheel off, a rail fence broken up for firewood.
Beyond, the river, running with flat plates of drifting ice, and the far bank a low bare line.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The trodden snow
along the top of the bank is a clear unobstructed band of open ground across the lower middle of the
picture; the run of the bank and the boats goes from the lower right of the picture into the upper
left. A standing man on the near edge would be about a quarter of the height of the whole picture,
and about half that at the far edge. In the immediate foreground, cropped by the bottom and right
edges, a dark broken fence rail and a heap of wet firewood, drawn at the heaviest ink weight and
with almost no colour. Drawn flat, shallow nearly parallel orthogonals, no deep one-point
perspective.

LIGHT: failing grey late-afternoon light with no visible sun and no shadows, and within the picture
three or four small low fires giving a little warm light close around themselves and nothing more.

PALETTE: cool grey-cream paper ground. The snow, the ice and the sky are left as untouched bare
paper. Wash restricted to soot brown for the boats and timber, wet stone grey for the water and the
churned snow, cool grey-brown for the mud; one narrow warm orange pass only in the immediate circle
of each fire. Falling sleet is drawn as fine white lines scratched through the dried wash with a
knife point, all running in one consistent diagonal, never as painted white dots or specks.

TECHNICAL: composed with generous empty margin on all four sides. No people. The trodden ground
along the bank is clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `rowing boat, canoe, longship, viking, gondola, sailing
boat, mast, campfire party, cosy camp, tents in rows`

**WATCH FOR:**
- **The boats.** This plate exists to establish the correct boat before the crossing. A Durham boat is
  *long, black, open, high-sided and flat-bottomed* — if what you have is a rowing boat, the plate
  has failed its only structural job. Compare against the length test: the boat must be longer than
  eight men standing shoulder to shoulder.
- Sleet as dots. Instant reject; see **T-9**.
- A cosy camp. The fires are too small and there are too few of them. If the plate looks warm,
  reduce the fires to three and move `inadequate` to the front of the clause.
- Snow painted. The snow is bare paper with drawn contour only.

---

### `A4-S2` · `MT-03` "The Order of March" — **MAP SHEET `R2`**
**File** `a04_s02_mp_order-of-march` · **R2** · `wshmap` · **Seed base** 40200 · **2048 × 2048, 1:1**

**PROMPT BODY**
```
wshmap, a manuscript survey plan of a small river town and the country north of it: at the lower
right of the sheet a compact town of perhaps sixty plan-view building rectangles arranged along two
long streets that converge at the town's north end, with a long narrow two-storey barrack block
drawn beside the upper street and a stone bridge over a small creek at the town's southern edge; a
broad river running along the whole right-hand edge of the sheet, tinted flat pale blue-grey; a
ferry landing on the far bank about ten miles upstream drawn as two small rectangles; two roads
running south from that landing toward the town, one following the river closely and one swinging
inland through rolling ground drawn in light hachures; woodland shown as small repeated lollipop
tree symbols; farmland as fine ruled furrow lines; a scatter of isolated farmsteads.

The sheet lies flat on a plain linen-backed board. Two thirds of it is untouched paper.

There is no writing on this sheet of any kind: no place names, no numbers, no compass rose, no scale
bar, no cartouche, no border, no legend, no title.
```

**NEGATIVE** map negative (§1.4) + `battle map, arrows, unit symbols, NATO symbols, dotted route
line, red and blue lines, wargame counters`

**WATCH FOR:** the two roads must be clearly separable along their whole length and must converge only
at the town — the entire puzzle is that the player assigns a column to each. Column tokens and the
timetable are in-engine.

---

### `A4-S3` · `DL-01` "The Embarkation"
**File** `a04_s03_bg_embarkation` · **R1** · `interior_elevation` camera on an exterior subject ·
**Seed base** 40300

**PROMPT BODY**
```
A river ferry landing at night in a sleet storm, 25 December 1776. One long black open cargo boat
with high straight sides lies broadside across the whole width of the picture, close to the viewer,
made fast to a low timber landing stage; long poles and a few oars stand upright against her side.
Two pitch torches are set on staves at stage left, guttering hard in the wind. Behind the boat, the
river, running with flat plates of drifting ice, and beyond that nothing drawn at all. On the
landing at stage right, a stack of ammunition boxes and a heap of knapsacks under a tarpaulin
stiff with ice.

CAMERA: near-frontal, the camera low and close to the level of the landing, looking straight along a
shallow stage from just above the boards. The boat is parallel to the picture plane. Very slight
downward angle only. Symmetrical, flat, and deliberately without deep perspective recession. In the
immediate foreground, cropped by the bottom and both side edges, a dark mooring post with frozen
cable turned round it at the left and the corner of a stone-built ferry house at the right, drawn at
the heaviest ink weight and with almost no colour.

LIGHT: the only light in the picture is the two torches within it at stage left, warm and low and
violently moving, reaching a few feet and no further. Everything beyond that is in even darkness.
No moon, no stars, no sky glow.

PALETTE: cool grey-cream paper ground. The sky, the ice and the water above the boat are left as
untouched bare paper, and the far bank is not drawn at all. Wash restricted to soot brown and wet
stone grey for the boat, the landing and the ice; one narrow warm orange pass only where the torch
light actually falls, on the boat's near gunwale and the wet boards. Driving sleet is drawn as fine
white lines scratched through the dried wash with a knife point, all running in one consistent
steep diagonal, never as painted white dots or specks.

TECHNICAL: composed with generous empty margin on all four sides. No people. The landing boards in
front of the boat are clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `crowd boarding, soldiers in the boat, hero pose, standing
figure in prow, flag, moonlight, dramatic sky, glowing torch flare, sparks, embers, fire particles`

**WATCH FOR:**
- Anyone in the boat. The boat is empty; the men are cutouts and this is a nine-beat scripted
  sequence that populates it at runtime.
- The torch producing bloom, flare or flying sparks. Banned in the rendering block; a warm pool with
  a hard tideline is what is wanted.
- The far bank appearing. Same rule as `BK-02`.

---

### `A4-S4` · `DL-02` "The Ice" — **act apex**
**File** `a04_s04_bg_the-ice` · **R1** · `exterior_3q` · **Seed base** 40400

**PROMPT BODY**
```
The middle of a wide river at night in late December, seen from just above the water. Flat irregular
plates of river ice, some tilted and riding up over one another, drift across the picture in a long
diagonal line; black open water shows in the lanes between them. The water is running hard. Along
the top of the picture the far bank is barely indicated at all — a single faint broken line and
nothing more. Nothing else is in the picture: no boats, no buildings, no trees.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the surface and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The line of ice
plates runs from the lower left of the picture into the upper right, and there is a clear
unobstructed band of open water and low flat ice across the lower middle of the picture. Drawn flat,
shallow nearly parallel orthogonals, no deep one-point perspective. In the immediate foreground,
cropped by the bottom and right edges, one large dark tilted ice plate with a wet black edge, drawn
at the heaviest ink weight and with no colour at all.

LIGHT: no moon and no sky. The picture is lit only by the pallor of the ice itself, which is the
brightest thing in it, and by a very small amount of warm torchlight entering from beyond the left
edge of the frame and falling on the nearest ice only.

PALETTE: cool grey-cream paper ground. The ice is untouched bare paper, its form given entirely by
the drawn line and by one wet stone grey wash in the open water between the plates. The sky is
untouched bare paper. Wash restricted to wet stone grey and the darkest soot brown in the open
water; one very small warm orange pass at the extreme left edge only. Sleet is drawn as fine white
lines scratched through the dried wash with a knife point, all in one consistent steep diagonal,
never as painted white dots or specks.

TECHNICAL: composed with generous empty margin on all four sides. No people, no boats. The band of
water and low ice across the lower middle of the picture is clear and unobstructed. Any writing
shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `iceberg, arctic, glacier, polar, frozen lake, skating,
boat, ship, aurora, moon, stars, dramatic sky, epic, sublime, Caspar David Friedrich`

**WATCH FOR:**
- Arctic scale. These are river ice plates a few feet across, not floes. If it looks polar, the sense
  of the crossing is gone.
- A sky. There is no sky in this picture. If the model has painted one, reject — the top of the frame
  is bare paper with one broken line across it.
- Anything in the frame besides ice and water. This is the emptiest plate in the game and its
  emptiness is the point; the boats are billboards and the camera pushes into nothing in particular.
- The near ice plate not dark enough. The `L4` occluder here is a single ice plate and it must carry
  the heaviest ink in the plate or the depth will not read.

---

### `A4-S5` · `TR-01` "King Street"
**File** `a04_s05_bg_king-street` · **R1** · `exterior_3q` · **Seed base** 40500

**PROMPT BODY**
```
A small American town street on the morning of 26 December 1776, in driving sleet. The street runs
away from the viewer between plain two-storey clapboard and brick houses with shuttered windows and
tall end chimneys. At the head of the street, closing the view, a long low two-storey stone barrack
block of about 1758 with a continuous ground-floor arcade of identical round-headed doorways running
its full length. Snow trodden to brown slush in the roadway, a broken rail fence, a water trough, a
stack of firewood against a wall, one overturned handcart. Two field guns stand unlimbered in the
roadway pointing down the street, their trails on the ground.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The roadway is a
clear unobstructed band of open ground across the lower middle of the picture, running from the
lower left of the picture into the upper right. A standing man on the near edge would be about a
quarter of the height of the whole picture, and about half that at the far edge. In the immediate
foreground, cropped by the bottom and left edges, a dark house corner with a shuttered window and
the end of a woodpile, drawn at the heaviest ink weight and with almost no colour. Drawn flat,
shallow nearly parallel orthogonals, no deep one-point perspective.

LIGHT: thin grey daylight an hour after sunrise, no visible sun, no shadows, everything evenly and
weakly lit. Driving sleet across the whole picture.

PALETTE: cool grey-cream paper ground. The sky is untouched bare paper down to the roofline. Wash
restricted to cool grey-brown slush, soot brown timber, wet stone grey for the barrack stone and the
wet walls, a dull brick red used only on one house wall and the roof tiles. No other saturated
colour. Sleet is drawn as fine white lines scratched through the dried wash with a knife point, all
in one consistent steep diagonal, never as painted white dots or specks.

TECHNICAL: composed with generous empty margin on all four sides. No people. The roadway is clear
and unobstructed. Any writing shown is illegible — no shop signs, no inn signs, no house numbers.
```

**NEGATIVE** `NEG-BASE` + act additions + `shop signs, inn sign, tavern sign, house numbers, cobbled
European street, medieval town, half-timbered, Dickens, Christmas market, snow globe, church spire
dominating, battle, smoke, explosion, bodies`

**WATCH FOR:**
- **Signs.** A street is where the model most wants to write. Any hanging sign, painted fascia or
  number is a reject.
- The barracks losing its arcade. The continuous run of identical round-headed doorways is the one
  identifying feature of the surviving building and it is what anchors the shot.
- A European old town — cobbles, half-timbering, an overhanging upper storey. This is a plain
  colonial New Jersey street.
- Battle. There is no fighting in the plate. The seven beats are figures and text over a held plate.

---

### `A4-S6` · `TR-01′` "After" — **STATE VARIANT, img2img**
**File** `a04_s05_bg_king-street_s-after` · **R1** · **Seed** 40550 · **denoise 0.30**

Re-slices `L2` **and** `L3` — the roadway itself changes state. `L0`, `L1`, `L4` are the master's.

**IMG2IMG BODY** — `TR-01`'s string with these substitutions:
```
… ADD: the two field guns are now limbered up and turned about, facing back down the street; a
second overturned handcart; three abandoned knapsacks and two dropped muskets lying in the slush
where they fell; the shutters of two houses standing open.

… ADD, in the middle distance where the street meets the barracks: a long dense mass of standing
men formed up four deep across the roadway, drawn as one continuous silhouetted form with a
broken line of hats along its upper edge — individual men are not separable and no face is drawn.

… the sleet continues, unchanged.
```

**NEGATIVE** as `TR-01`, plus `victory, celebration, cheering, flags, bodies, blood, wounded,
corpses, gore`

**WATCH FOR:**
- Individual prisoners resolving. Per §3.4 that mass is **one form**, not nine hundred figures. If you
  can count them, regenerate at lower denoise.
- Any victory iconography — a raised flag, a cheering group, a drum. The act's fixed loss is that the
  enlistments still expire; the plate must not celebrate.
- Bodies. Violence in this game is in the text and in the casualty list, never in the plate.
- Architecture drift. Overlay at 50%: the barrack arcade must not move.

---

## 4.5 ACT 5 — VALLEY FORGE

**Ground** `PAPER-COOL #E5E3DB` · **Light law** `low winter sun from frame left, very close to the
horizon, cold, with long blue shadows` · **Generate at `W` = 0.58** (act ceiling — Valley Forge never
looks like a good time and the ceiling enforces it) · **Group D permitted:** `CONTINENTAL-BLUE` at
under 5% only. Most of this army is **not** in blue in the winter of 1777–78; the coats arrive later.

**The act's controlling instruction: it is a grid, not a frontier.** Valley Forge is a regulated town
of identical log huts — fourteen feet by sixteen, six and a half feet high, doors all facing the same
street, chimneys at the rear, gaps sealed with clay — built to a written specification by an army
that was starving. The order and the misery in one frame is the act's whole argument, and it is also
the most AI-friendly location in the game, because a repeating module at a fixed size is exactly what
generation is good at. Use that.

**Act negative additions:**
`Lincoln log cabin, frontier cabin, log cabin in the woods, scattered huts, rustic homestead, cosy
cabin, chimney smoke curling picturesquely, Christmas, snowfall dots, snow specks, pine forest,
mountains, wilderness`

---

### `A5-S1` · `VF-01` "Brigade Street, December"
**File** `a05_s01_bg_brigade-street` · **R1** · `exterior_3q` · **Seed base** 50100

**Compose this plate knowing it must survive `VF-01′`**, the spring state variant, in which the same
huts are finished and green comes back. Do not put anything in `L2` that could not plausibly be
completed.

**PROMPT BODY**
```
A street of army huts under construction on a bare hillside in late December 1777. Along both sides
of a rutted muddy lane stand about a dozen identical small log huts in a strictly regular row, all
the same size, all with their single doorway facing the lane, all with a low chimney at the back —
but only some are finished: the nearest three are complete with clay-sealed walls and a shingled
roof, the next four are built up to three or four courses of log with the walls still open to the
sky, and the furthest are only a rectangle of foundation logs pegged out on the ground. Green
unbarked timber stacked in piles, a saw pit, an axe in a stump, a heap of grey clay with a puddle in
it. Two thin threads of smoke from two of the finished chimneys. Bare hillside beyond, and a bare
treeline on the ridge.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The lane is a
clear unobstructed band of open muddy ground across the lower middle of the picture, running from
the lower left of the picture into the upper right; the row of huts recedes along it. A standing man
on the near edge would be about a quarter of the height of the whole picture, and about half that at
the far edge. In the immediate foreground, cropped by the bottom and left edges, a dark stack of
sawn green logs and the corner of the nearest hut's wall, drawn at the heaviest ink weight and with
almost no colour. Drawn flat, shallow nearly parallel orthogonals, no deep one-point perspective.

LIGHT: low winter sun from frame left, very close to the horizon, cold and without warmth, throwing
long blue-grey shadows to the right across the snow.

PALETTE: cool grey-cream paper ground. The snow and the sky are left as untouched bare paper, the
snow's form given only by the drawn line and by the long blue-grey shadows laid across it. Wash
restricted to soot brown and cool grey-brown for the logs and mud, one pale yellow ochre on the
newly cut timber ends, slate blue-grey in the shadows. No saturated colour anywhere in this picture.

TECHNICAL: composed with generous empty margin on all four sides. No people. The lane is clear and
unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `stone cottage, thatched roof, medieval village, alpine
chalet, dense forest, deep snow drifts, blizzard`

**WATCH FOR:**
- **Irregularity.** The huts must be the *same size*, in *rows*, with doors on *one side*. If they
  have become a picturesque scatter of different cabins, the plate has told the wrong story about the
  army and it is a reject, not a repair. Re-prompt with `identical, the same size, in a strict row,
  built to a specification` moved to the front of the subject slot.
- Round-log Lincoln-cabin construction with crossed notched corners at every level. These are squared
  green timber with clay chinking; the clay is visible as grey bands between the logs.
- Deep snow. There is a thin cover, and it is bare paper.
- Smoke from every chimney. **Two threads, from two huts.** The number of smoking chimneys is a
  content signal and it changes in the spring variant.

---

### `A5-S2` · `VF-02` "Potts House, Interior"
**File** `a05_s02_bg_potts-house` · **R1** · `interior_elevation` · **Seed base** 50200

**PROMPT BODY**
```
The plain ground-floor room of a small two-storey stone farmhouse in winter, used as an office. Bare
whitewashed plaster over rough stone, a low beamed ceiling, deep window reveals with small panes in
two windows at stage left. A plain oak table set square in the room and covered in loose papers,
bound letter-books, a brass inkstand, a sand caster and a candlestick. Three plain rush-seated
chairs. A small open fireplace in the back wall with a low fire. A folded mass of heavy off-white
canvas — a large tent, struck and folded — stacked in the corner at stage right, taking up a
surprising amount of the room. A leather portmanteau. Bare wide floorboards.

CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person. The back wall is parallel to the picture plane. Very slight downward
angle only. The floor is a shallow band across the bottom of the frame. Symmetrical, flat, and
deliberately without deep perspective recession. In the immediate foreground, cropped by the bottom
and both side edges, the dark edge of a plank door on the left and the corner of a press cupboard on
the right, drawn at the heaviest ink weight with almost no colour.

LIGHT: cold low winter daylight from the two windows at stage left, weak and blue, throwing two pale
shapes onto the floorboards. A very small warm glow at the fireplace that reaches almost nowhere.

PALETTE: cool grey-cream paper ground. The whitewashed plaster of the walls is left largely as bare
untouched paper. Wash restricted to soot brown for the beams, table and floorboards, wet stone grey
in the window reveals, slate blue-grey in the corners, one small warm ochre pass at the hearth only.
The folded canvas is left almost bare, faintly toned. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible:
fine ink strokes suggesting cursive, not readable letterforms. No people. The floor in front of the
table is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `mansion, grand room, panelled study, four poster bed,
cosy cottage, hearth blazing, cauldron, rustic kitchen, dried herbs hanging`

**WATCH FOR:**
- The room becoming a mansion or a cottage. It is a small, plain, stone, *unremarkable* room, and it
  is deliberately not a headquarters out of a painting.
- The fire providing real light. It is a low fire in a cold room and the light is daylight.
- The folded marquee reading as bedding or sacks. It is a large mass of heavy canvas, folded, with
  the fold lines drawn — a surviving object, and worth the extra thirty seconds of prompt.

---

### `A5-S3` · `VF-04` "The Hospital Hut" — **`sensitive: true`**
**File** `a05_s03_bg_hospital-hut` · **R1 with the Witness Register's restraint** ·
`interior_elevation` at eye level · **Seed base** 50300

Not an `R5` scene — it keeps the earth wash — but it borrows `R5`'s camera height and framing and
**its ban on atmosphere**. No haze, no shafts of light, no golden anything. Marked `sensitive`, and
carries the §7.6 review gate before slicing.

**PROMPT BODY**
```
The interior of a single small army log hut, fourteen feet by sixteen and only six and a half feet
to the ridge, so the roof is close overhead. Squared log walls with grey clay pressed into the gaps,
a beaten earth floor, a small rough stone fireplace in the end wall with a low fire, and one small
unglazed window-hole with a board propped beside it. Twelve rough bunk frames of unbarked poles
lashed together in two tiers along both side walls, with straw and blankets on them. A bucket, a tin
cup on the floor, a folded blanket, a pair of worn shoes set together by the hearth. A canvas
knapsack hanging from a peg.

CAMERA: the drawing is made from the height of a standing person's eyes and level, never looking
down. Near-frontal theatrical elevation into a shallow, low, cramped space; the end wall is parallel
to the picture plane. The floor is a shallow band across the bottom of the frame. Flat, deliberately
without deep perspective recession, and pressed close. In the immediate foreground, cropped by the
bottom and both side edges, the dark ends of the nearest bunk frames on each side, drawn at the
heaviest ink weight and with almost no colour.

LIGHT: one small window-hole and one low fire. Even, plain, unflattering. No shafts of light, no
haze, no dust in the air, no golden glow, no atmospheric softening of any kind.

PALETTE: cool grey-cream paper ground. Wash restricted to soot brown and cool grey-brown for the
logs and the earth floor, wet stone grey in the shade, one small warm ochre pass at the hearth only,
one pale straw ochre in the bedding. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. No people. The floor down the
middle of the hut is clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `hospital ward, iron bedsteads, white sheets, nurses,
lantern glow, shafts of light, dust motes, dramatic lighting, suffering figures, corpses, blood,
bandages, gore, squalor, rats`

**WATCH FOR:**
- **Any beauty.** Shafts of light through the window-hole, glowing embers, dust motes: all three are
  the aestheticising apparatus this composition removes on purpose. Reject.
- Any *gore*. Nothing in this plate depicts illness. The twelve men are cutouts and the writing does
  the work; the plate is a room.
- A hospital. There are no bedsteads, no linen, no equipment. It is a hut with bunks in it.
- The ceiling too high. Six and a half feet to the ridge is *low* — a standing man's hat would touch
  it, and that is the feeling.

---

### `A5-S4` · `MT-04` "The Northern Department" — **MAP SHEET `R2`**
**File** `a05_s04_mp_northern-dept` · **R2** · `wshmap` · **Seed base** 50400 · **2048 × 2048, 1:1**

This sheet does double duty: the northern theatre, and then the Atlantic. Generate **one sheet** with
the theatre; the alliance's second sheet is the same generation re-cropped and re-tinted in post
(§5.6), not a second call.

**PROMPT BODY**
```
wshmap, a manuscript survey plan of a long river valley running north to south down the centre of
the sheet, with a chain of narrow lakes at its northern end continuing off the top edge; steep
ground on both sides of the valley drawn in dense hachures; extensive woodland shown as small
repeated lollipop tree symbols covering most of the sheet; a narrow strip of cleared farmland along
the river shown as fine ruled furrow lines; a single road running south along the west bank; three
small settlements each drawn as a handful of tiny plan-view rectangles; two low ranges of heights
close to the river about two thirds of the way down the sheet, drawn in careful hachure; a portage
route between two of the northern lakes drawn as a single fine line.

The sheet lies flat on a plain linen-backed board. Two thirds of it is untouched paper.

There is no writing on this sheet of any kind: no place names, no numbers, no compass rose, no scale
bar, no cartouche, no border, no legend, no title.
```

**NEGATIVE** map negative (§1.4) + `battle map, arrows, unit symbols, red lines, front line, dotted
route`

**WATCH FOR:** the two ranges of heights near the river must be legible as *high ground beside the
road*, because that is the whole strategic reading the scene teaches. If the hachures are decorative
rather than describing a slope that commands the road, regenerate.

---

### `A5-S5` · `VF-03` "The Grand Parade"
**File** `a05_s05_bg_grand-parade` · **R1** · `exterior_3q` · **Seed base** 50500

Holds the game's slowest camera move — a seven-second push in which nothing changes. It has to be
worth looking at for seven seconds while remaining almost empty. That is a hard brief and it is why
this plate gets its structure from the fence line and the ground, not from objects.

**PROMPT BODY**
```
A large empty field of churned mud on a hillside in February, used as a drill ground. The field
fills most of the picture and is nearly featureless: rutted, trampled, standing water in the
hollows, patches of thin dirty snow. A rough post-and-rail fence runs along its far edge. Beyond the
fence, low and small in the distance, an ordered row of identical log huts with smoke from their
chimneys, and beyond them a bare treeline on the ridge. A single bare tree stands alone at stage
left inside the field. Two abandoned barrels and a broken cart at the field's edge.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The near part of
the field is a clear unobstructed band of open ground across the lower middle of the picture; the
fence line runs from the lower right of the picture into the upper left. A standing man on the near
edge of the field would be about a quarter of the height of the whole picture, and about half that
at the far edge. In the immediate foreground, cropped by the bottom and right edges, a dark fence
post with two rails and a churned rut of mud, drawn at the heaviest ink weight and with almost no
colour. Drawn flat, shallow nearly parallel orthogonals, no deep one-point perspective.

LIGHT: low winter sun from frame left, very close to the horizon, cold, throwing long blue-grey
shadows to the right across the mud.

PALETTE: cool grey-cream paper ground. The sky is untouched bare paper across the whole top of the
picture, and the patches of snow are untouched bare paper within the field. Wash restricted to cool
grey-brown and soot brown mud in three values, wet stone grey in the standing water, slate blue-grey
in the shadows. No saturated colour anywhere in this picture.

TECHNICAL: composed with generous empty margin on all four sides. No people. The near part of the
field is clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `parade ground, drilling soldiers, ranks of troops, flags,
grandstand, marching, sports field, meadow, wildflowers, sunset`

**WATCH FOR:**
- Anything happening. The plate is empty on purpose and the empty state is `A5-S5`. Troops belong
  only in the variant.
- The mud becoming flat. Three values of wash in the ground, with the ruts drawn, or the seven-second
  push has nothing to hold the eye.
- A picturesque field. If it looks like a meadow at golden hour, the light law has been ignored.

---

### `A5-S6` · `VF-03′` "The Grand Parade, April" — **STATE VARIANT, img2img**
**File** `a05_s05_bg_grand-parade_s-drill` · **R1** · **Seed** 50550 · **denoise 0.32**

`L2` only. The ground, fence, huts and treeline are the master's `L1`/`L3`.

**IMG2IMG BODY** — `VF-03`'s string with these substitutions:
```
… February → mid-April: the standing water gone, the mud dried and cracked into a hard pale surface,
the snow gone entirely, the first thin green showing along the fence line and on the ridge, and the
single bare tree now in early leaf.

… ADD, in the middle distance of the field: one compact rectangular body of about a hundred men
formed up in three ranks, drawn as a single continuous silhouetted form with a straight unbroken
line of hats along its upper edge and a straight line of legs beneath — individual men are not
separable, no faces and no detail of dress are drawn, and the edges of the block are geometrically
straight.

… LIGHT: the same low sun from frame left, a little higher and a little warmer.
```

**NEGATIVE** as `VF-03`, plus `individual soldiers, faces, detailed uniforms, parade spectacle,
flags, band, drums, crowd watching`

**WATCH FOR:**
- The block resolving into countable men. §3.4: it is **one form**. Straightness of its edges is what
  sells "these men now move as one unit," and a ragged crowd says the opposite of what the scene is
  for.
- The green arriving too hard. This is the first green in three acts and the act ceiling is 0.58 —
  one pale grey-green pass, no more.
- Ground drift. Overlay at 50%: the ruts and the fence must not move.

---

### `A5-S7` · `VF-01′` "Brigade Street, May" — **STATE VARIANT, img2img · act apex**
**File** `a05_s01_bg_brigade-street_s-may` · **R1** · **Seed** 50150 · **denoise 0.36**

Re-slices `L2` **and** `L3`. The highest denoise permitted anywhere in the project, because more
changes here than in any other variant — and 0.36 is still below the 0.45 line at which architecture
starts to move.

**IMG2IMG BODY** — `VF-01`'s string with these substitutions:
```
… late December 1777 → late May 1778. Every hut in the row is now finished: clay-sealed walls,
shingled roofs, a door in every doorway, a low chimney smoking at the back of nearly every one. The
stacked green timber, the saw pit and the clay heap are gone. The lane is dry, hard, swept, with a
shallow drainage cut along one side. Grass has come back at the foot of the walls, and the treeline
on the ridge is in full leaf.

… LIGHT: the same sun from frame left, higher, warmer, with shorter shadows.

… PALETTE: the snow is gone. The sky remains untouched bare paper. One pale grey-green enters the
picture for the first time, at the foot of the walls and on the ridge; the ochre of the new timber
has weathered to grey-brown.
```

**NEGATIVE** as `VF-01`, plus `lush, summer, flowers, bright green, sunny day, celebration, flags,
crowds`

**WATCH FOR:**
- **Too much spring.** The act ceiling is 0.58 and the fixed loss is that two thousand men died. A
  lush green plate is a lie about the act. One pale wash of grey-green, and the sky stays bare.
- Huts moving. Overlay at 50%. If a doorway has shifted, rerun at 0.30 and accept a slightly less
  finished look — geometry matters more than the state change here, because this plate exists to be
  compared with the December one.
- The lane losing its recession. It is the same lane and it must still run lower-left to upper-right.

---

## 4.6 ACT 6 — YORKTOWN

**Ground** `PAPER-WARM #EFE7D5` · **Light law** `high hazy sun near overhead, dust-warm, almost no
shadow` · **Generate at `W` = 0.90** (act ceiling — the most saturated act in the game, earned by
contrast with Acts 4, 5 and 7) · **Group D permitted:** `CONTINENTAL-BLUE` and `FRENCH-WHITE`; and
**`YT-03` alone in the entire game is permitted a third**, `BRITISH-SCARLET`.

**Act negative additions:**
`green fields, lush vegetation, jungle, mud, rain, overcast, long shadows, sunset, dramatic sky,
naval battle, ships in the harbour, fleet, sea, tall ships`

---

### `A6-S1` · `YT-04` "The Marquee"
**File** `a06_s01_bg_the-marquee` · **R1** · `interior_elevation` · **Seed base** 60100

Washington's own marquee is a **surviving object** with exact dimensions: an oval fourteen feet by
twenty-three, twelve feet at the peak. Get it right and it becomes a set piece a student may one day
stand in front of in Philadelphia.

**PROMPT BODY**
```
The inside of a large eighteenth-century officer's field marquee by day, looking down its length: a
long oval tent of heavy off-white linen canvas, fourteen feet across and twenty-three feet long and
twelve feet to its ridge, with a single ridge pole running away from the viewer, two upright poles,
and rounded ends. Canvas walls hang from the ridge in long vertical folds, with the seams and rope
loops visible and daylight showing through the weave. A folding camp table of plain wood in the
centre with a rolled sheet and a few loose papers on it, two folding camp stools, a folding camp
bedstead against the wall at stage right with a blanket folded on it, a small leather-covered chest,
a tin canteen and a plain lantern hanging from the ridge pole. The tent floor is bare trodden earth
with a strip of canvas laid on it.

CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person. The far end of the tent is parallel to the picture plane. Very slight
downward angle only. The floor is a shallow band across the bottom of the frame. Flat, symmetrical,
deliberately without deep perspective recession. In the immediate foreground, cropped by the bottom
and both side edges, the dark vertical fall of the entrance canvas on each side, drawn at the
heaviest ink weight and with almost no colour, framing the picture like a pair of curtains.

LIGHT: bright hazy daylight coming through the canvas itself, so the whole tent glows evenly and
warmly and there are almost no shadows. One brighter shape where the entrance is open behind the
viewer.

PALETTE: warm cream paper ground. The canvas walls and roof are left largely as untouched bare
paper, their form given only by the drawn line of the folds and seams. Wash restricted to soot brown
for the furniture, cool grey-brown on the earth floor, one pale yellow ochre in the warm canvas
light. No saturated colour except a small amount of deep greyed indigo blue on one folded coat.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible.
No people. The floor down the middle of the tent is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `circus tent, yurt, teepee, bell tent, medieval pavilion,
heraldic banners, campaign furniture ornate, oriental rug, brazier, candlelight, dark tent interior`

**WATCH FOR:**
- A **pointed** tent. This is an oval marquee with a *ridge*, not a bell tent or a pavilion. If the
  roof comes to a single point, reject.
- Heraldry, pennants, or any decoration. It is plain working canvas.
- Darkness. The whole point of the shot is that a canvas tent in daylight is *luminous*; this is the
  brightest interior in the first seven acts.
- Bare paper below 25%: the canvas is the reserve and if the model has washed it, the plate has lost
  its light.

---

### `A6-S2` · `MT-05` "The Chesapeake" — **MAP SHEET `R2`**
**File** `a06_s02_mp_chesapeake` · **R2** · `wshmap` · **Seed base** 60200 · **2048 × 2048, 1:1**

**PROMPT BODY**
```
wshmap, a manuscript survey plan of a very large drowned river estuary opening to the ocean: a wide
irregular body of water running up the centre of the sheet from the lower right to the upper left,
with many long branching tidal rivers reaching inland on both sides; at the lower right the estuary
narrows between two low capes and opens into the open sea, which occupies the bottom right corner as
flat untouched paper with a pale blue-grey tint at its margin; soundings indicated only as fine
stipple in the shallows; a low peninsula on the south shore with a small town drawn as thirty
plan-view rectangles at its tip and a line of small square and star-shaped fortified works drawn
across its neck; marsh shown as stipple and short horizontal ticks; woodland as small repeated
lollipop tree symbols; cleared ground as fine ruled furrow lines; a few thin roads.

The sheet lies flat on a plain linen-backed board. Two thirds of it is untouched paper.

There is no writing on this sheet of any kind: no place names, no numbers, no compass rose, no scale
bar, no cartouche, no border, no legend, no title.
```

**NEGATIVE** map negative (§1.4) + `ships, fleet, sails, naval symbols, anchors, sea monsters,
rhumb lines, arrows, blockade line`

**WATCH FOR:** **no ships.** The fleet is the scene's entire payload and it arrives as tokens that ink
themselves onto the sheet during the lift. A pre-drawn fleet gives away the answer to `A6-D1` before
the player reaches it.

---

### `A6-S3` · `YT-01` "The Second Parallel" — **act apex**
**File** `a06_s03_bg_second-parallel` · **R1** · `exterior_3q` · **Seed base** 60300

Carries the game's most expensive camera moment: a six-second pullback that chains directly into the
map-table lift. **Compose with the top third of the frame able to survive being pulled back into** —
the river and the peninsula must be present in `L0`/`L1`, not implied.

**PROMPT BODY**
```
A siege trench in dry sandy red clay ground, October 1781, seen from behind the parapet. A broad
excavated trench with a raised earth parapet on its far side runs across the picture. Along the top
of the parapet stands a continuous row of gabions — bottomless woven wicker baskets about three feet
high, filled with earth, the willow weave clearly drawn, earth spilling a little over their rims —
and behind them, stacked in the trench, long bundles of brushwood fascines with rough cut ends. The
trench floor is trodden dry earth with spades and a wheelbarrow left in it. Beyond the parapet, flat
open ground scarred with older workings, and far off a low pale town of plain houses and one church
tower, drawn at the thinnest line weight with almost no wash. Beyond the town, a broad pale water,
and beyond that a low far shore. A thin column of dark smoke rising from the water in the far
distance.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The trench floor
is a clear unobstructed band of open ground across the lower middle of the picture, running from the
lower left of the picture into the upper right. A standing man on the near end would be about a
quarter of the height of the whole picture, and about half that at the far end. In the immediate
foreground, cropped by the bottom and left edges, a dark stack of unfilled gabions and a heap of
fresh spoil earth, drawn at the heaviest ink weight and with almost no colour. Drawn flat, shallow
nearly parallel orthogonals, no deep one-point perspective.

LIGHT: high hazy sun near overhead, dust-warm, almost no shadow. Dry still air with dust hanging in
it.

PALETTE: warm cream paper ground. The sky and the distant water are left as untouched bare paper.
Wash restricted to a warm red-brown clay, yellow ochre in the dust and the fresh earth, soot brown
for the wicker and brushwood, one pale slate blue-grey on the far shore. The most colour of any
picture in the game, but still thin and unsaturated in three values.

TECHNICAL: composed with generous empty margin on all four sides. No people. The trench floor is
clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `WWI trench, sandbags, duckboards, barbed wire, dugout,
concrete, cannon firing, muzzle flash, explosion, battle smoke, bodies`

**WATCH FOR:**
- **Gabions as sandbags.** Same failure as `CB-03`, and here they are foreground objects at full ink
  weight, so it is unmissable. The woven willow must be drawn.
- Twentieth-century trench grammar. No duckboards, no revetment timber, no dugout.
- The distant smoke becoming a burning ship in detail. It is a thread of smoke on the water at the
  thinnest line weight — the burning *Charon* as a fact, not a spectacle.
- Colour running away. This is the most saturated act and that is a *relative* statement; three
  values, still under the chroma cap.

---

### `A6-S4` · `YT-02` "Redoubt 10, Night"
**File** `a06_s04_bg_redoubt-ten` · **R1** · `interior_elevation` camera on an exterior subject ·
**Seed base** 60400

**PROMPT BODY**
```
The outer face of a small earthwork redoubt at night, seen from the flat ground in front of it. A
low steep earth bank runs across the picture. In front of it, filling the middle of the frame, an
abatis: whole felled trees dragged into a continuous tangled thicket with their sharpened branch
ends turned outward toward the viewer, drawn almost entirely as a dense mass of dark interlocking
ink lines. A dry ditch at the foot of the bank. Above the bank, a row of pointed stakes driven in
and angled outward. Bare trodden ground in the foreground. Nothing else: no buildings, no trees
standing, no horizon detail.

CAMERA: near-frontal, the camera low and close to the ground, looking straight at the face of the
work as into a shallow stage. The bank is parallel to the picture plane. Very slight downward angle
only. Flat, and deliberately without deep perspective recession. In the immediate foreground,
cropped by the bottom and both side edges, dark broken branch ends of the nearest abatis, drawn at
the heaviest ink weight and with no colour at all.

LIGHT: moonless and almost entirely dark. There is no light source in the picture. Forms are given
by the drawn line alone, and by the faintest difference in wash value between the earth bank and the
sky behind it.

PALETTE: warm cream paper ground, but very little of it shows. Wash restricted to the darkest soot
brown and wet stone grey in two values only. There is no colour in this picture at all. The sky
above the bank is a single flat dark wash, the darkest large area in the game, and the bank is
drawn against it as a slightly lighter silhouette.

TECHNICAL: composed with generous empty margin on all four sides. No people. The bare ground in
front of the abatis is clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `moon, moonlight, stars, torches, lanterns, fire, muzzle
flash, explosion, battle, soldiers charging, silhouetted heroes, dramatic sky, blue night, teal`

**WATCH FOR:**
- **Bare paper.** This is the one plate in the game that will legitimately land near the 35% floor,
  because the sky is washed. It must not go below it. If it does, lift the sky wash rather than
  adding drawn detail — the darkness is the subject.
- Blue night. Cinema colours night blue; ink-and-wash does not. Two values of warm-neutral dark.
- Any light source. The men are carrying almost nothing and their muskets are unloaded and unprimed
  so that no accidental shot gives warning; a torch in this plate contradicts the scene's central
  fact.
- Anything darker than `INK-FLOOR #241C14`. The CI clamp will catch it but this is the plate most
  likely to trip it. Check the darkest pixel is warm.

---

### `A6-S5` · `YT-03` "The Surrender Road" — **the game's one three-colour plate**
**File** `a06_s05_bg_surrender-road` · **R1** · `interior_elevation` camera, axial recession ·
**Seed base** 60500

The one composition in the game permitted three Group D colours above 5% of frame, and the only
exterior with a true axial vanishing point. Both exceptions are here because the history staged it
for us: two allied lines facing each other along a road, one immaculate and one ragged, with the
defeated column marching out between them. **It requires no invention.**

**PROMPT BODY**
```
A wide dirt road in open country in autumn, seen straight down its length, with a long line of
standing troops drawn up along each side of it facing inward. The two lines run away from the viewer
and converge toward a point on the horizon. The line on the left is exact and unbroken: identical
long white coats, identical black hats, identical spacing, drawn as one continuous even form with a
perfectly straight upper edge. The line on the right is ragged and irregular: mismatched coats and
shirtsleeves in dull blues, browns and undyed linen, uneven spacing, uneven heights, drawn as one
continuous uneven form. Between them the empty road recedes, and far down it a dense column of men
in dull brick-red coats is marching away from the viewer, growing small, drawn at the thinnest line
weight. Bare trodden ground, a rail fence beyond the lines, low autumn trees, dust.

CAMERA: near-frontal theatrical elevation, the camera on the centreline of the road and level with a
standing person, looking straight down the axis. Symmetrical left and right. Normal lens, no
wide-angle distortion, no fisheye, horizon high in the frame, about one third of the way down from
the top. The near part of the road is a clear unobstructed band of open ground across the lower
middle of the picture. In the immediate foreground, cropped by the bottom and both side edges, the
dark nearest ends of the two lines, drawn at the heaviest ink weight — a shoulder and a hat brim on
each side, no faces.

LIGHT: high hazy sun near overhead, dust-warm, almost no shadow. Fine dust hanging in the air down
the length of the road.

PALETTE: warm cream paper ground. The sky is untouched bare paper. Three colours only are permitted
to be saturated in this picture, and they are the three uniforms: a warm unbleached wool white on
the left line, a deep greyed indigo blue on the right line, and a dull warm brick red in the
receding column. Everything else — the road, the ground, the fence, the trees, the dust — is washed
in yellow ochre and cool grey-brown at low chroma.

TECHNICAL: composed with generous empty margin on all four sides. No individual faces anywhere. The
near part of the road is clear and unobstructed. Any writing shown is illegible.
```

**NEGATIVE** `NEG-BASE` + act additions + `individual faces, portraits, officers on horseback,
sword surrender, ceremony, flags flying, band, crowd of spectators, triumph, cheering, Trumbull,
history painting`

**WATCH FOR:**
- **The contrast between the two lines is the entire content.** If both lines are equally neat, or
  equally ragged, the plate has failed and no amount of colour work will save it. Regenerate with
  `identical, exact, unbroken, perfectly straight` and `mismatched, ragged, uneven` both moved to the
  front of the subject slot.
- Faces. Nobody in this plate has a face. The named figures — O'Hara, Lincoln, Rochambeau — are
  cutouts placed at the near end of the road.
- Ceremony. No sword being offered, no horses, no group of officers. That beat is played with
  billboards and text.
- The three colours exceeding their allowance elsewhere. Nothing else in this plate may be saturated,
  including the leaves. Autumn is ochre and grey-brown here, not red.

---

## 4.7 ACT 7 — NEWBURGH

**Ground** `PAPER-SMOKED #DCD2BC` for `NB-01` and `NW-01`; `PAPER-WARM #EFE7D5` for `NW-02`
(erratum **E-1**) · **Light law** `interior daylight from one window only, cold north light, no sun`,
with `NW-02` overriding to `thin early-spring sun, high overcast, weak shadows` (erratum **E-2**:
the law does not specify a side, because the Hasbrouck House's one window is documented stage right)
· **Generate at `W` = 0.70** (act ceiling) · **Group D permitted:** `CONTINENTAL-BLUE` only — this is
the best-dressed the army has ever been, 1779 regulation, and the cleanness is the tone.

**Act negative additions:**
`grand hall, palace, marble, chandelier, gilt, throne, courtroom, church interior, stained glass,
cathedral, warm firelight filling the room, cosy, candlelit banquet`

---

### `A7-S1` · `NB-01` "Seven Doors" — **the most important composed shot in the act**
**File** `a07_s01_bg_seven-doors` · **R1** · `interior_elevation`, dead-on · **Seed base** 70100

Seven doors ranged across a wall is a composition that **only works frontally** — a three-quarter
view throws four of them into foreshortening and the shot loses its argument. This is the plate that
justifies the whole interior framing spec.

**PROMPT BODY**
```
The principal room of a low one-storey Dutch colonial stone farmhouse, converted to an office: a
broad squarish room with whitewashed rough stone walls, a low ceiling of exposed dark beams, and
wide plain floorboards. Set into the walls, ranged across the picture, are seven identical plain
panelled doors, evenly spaced and all closed but one. There is exactly one window, at stage right,
small and deep-set with many small panes. In the back wall a Dutch jambless fireplace: a wide open
hearth at floor level with no side jambs and no surround at all, only a broad flat plastered hood
projecting above it and hanging free from the wall, with a low fire beneath. A plain table with
papers and a candlestick, three plain chairs, a small writing desk in the corner.

CAMERA: dead-on near-frontal theatrical elevation, as if looking straight into a shallow stage set
from the height of a standing person, on the room's centreline. The back wall is exactly parallel to
the picture plane. Very slight downward angle only. The floor is a shallow band across the bottom of
the frame. Flat, and deliberately without deep perspective recession, so that all seven doors read
at nearly the same width. In the immediate foreground, cropped by the bottom and both side edges,
the dark vertical edges of an eighth doorframe on each side, drawn at the heaviest ink weight and
with almost no colour, closing the picture in.

LIGHT: cold north daylight from the one window at stage right, weak, blue and even; the fire gives a
small warm glow at the hearth that does not reach the walls. No sun, no shadows cast across the room.

PALETTE: a warm smoked cream paper ground, slightly darkened. The whitewashed stone above the doors
is left largely as bare untouched paper. Wash restricted to soot brown for the beams, doors and
floorboards, cool grey-brown on the plaster hood, slate blue-grey in the window light and the
corners, one small warm ochre pass at the hearth only. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible.
No people. The floor across the middle of the room is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `English fireplace, mantelpiece, chimneypiece with
surround, fire surround, brick fireplace, hearth with columns, arched doorways, double doors, French
windows, many windows, bright room`

**WATCH FOR:**
- **Count the doors.** There are seven and it is the name of the scene. Six or eight is a reject.
  Models regularise counts above about five, so expect to run several batches; if seven will not
  hold, drop the subject slot to `seven identical plain panelled doors ranged across the walls,
  evenly spaced` as the *first* clause and remove two other nouns to stay under the fourteen-noun
  limit.
- **The fireplace.** A Dutch jambless hearth is an open fire at floor level with a free-hanging hood
  and *no surround whatever*. If the model has given it a mantelpiece, jambs or a mantel shelf, it
  has built an English fireplace and the room is wrong. This is a documented distinctive feature and
  a teacher will know.
- More than one window. There is one, at stage right, and the whole scene is about pressure with one
  way out.
- Any convergence in the side walls. Dead-on means dead-on.

---

### `A7-S2` · `NW-02` "The Cantonment"
**File** `a07_s02_bg_cantonment` · **R1** · `exterior_3q` · **Seed base** 70200

The same hut grammar as Valley Forge, **built better**. The army has learned to build, and that is a
piece of characterisation delivered entirely by carpentry.

**PROMPT BODY**
```
A street of army log huts on a hillside in early spring, 1783. The huts are identical, well built
and neatly finished — squared logs closely fitted, clay chinking straight and even, shingled roofs
with proper eaves, a plank door and a small shuttered window in each, and a well-built stone chimney
at the back of every one. They stand in a strict row along a dry rutted lane, and behind them,
receding over the shoulder of the hill, the roofs of many hundreds more in ordered ranks. A neat
timber rack for muskets, a swept firewood store, a plank noticeboard nailed by a doorway with a
single blank sheet on it, a water barrel. Bare early-spring trees on the ridge, and thin grass
coming through the mud.

CAMERA: shallow elevated three-quarter view, as if standing on a low rise about four metres above
the ground and looking down at roughly twenty degrees. Normal lens, no wide-angle distortion, no
fisheye, horizon high in the frame, about one third of the way down from the top. The lane is a
clear unobstructed band of open ground across the lower middle of the picture, running from the
lower right of the picture into the upper left. A standing man on the near edge would be about a
quarter of the height of the whole picture, and about half that at the far edge. In the immediate
foreground, cropped by the bottom and right edges, a dark corner of the nearest hut and the end of
the firewood store, drawn at the heaviest ink weight and with almost no colour. Drawn flat, shallow
nearly parallel orthogonals, no deep one-point perspective.

LIGHT: thin early-spring sun under high overcast, weak shadows, cold clear air.

PALETTE: warm cream paper ground. The sky is untouched bare paper across the whole top of the
picture. Wash restricted to soot brown and cool grey-brown for the logs and the lane, one pale
grey-green for the first grass, wet stone grey on the chimneys and the shingles, slate blue-grey in
the shadows. No saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible —
the sheet on the noticeboard carries no readable words. No people. The lane is clear and
unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `Lincoln log cabin, frontier settlement, ruined huts,
abandoned, ghost town, snow, winter, lush summer, flowers`

**WATCH FOR:**
- **The noticeboard sheet.** It is the second diegetic clock in the game — the officers' petition,
  gathering signatures across the act — and the signatures are drawn in-engine as a rising count of
  illegible ink marks. The plate ships it **blank**. Any writing on it is a reject.
- Huts as good as Valley Forge's. They must be visibly *better*: straight chinking, proper eaves,
  real chimneys, shutters. The comparison is the point and it is only legible if `VF-01` is open in
  the next window while you review.
- The receding ranks of roofs resolving into individual huts. Beyond the first row they are a
  repeating texture at `L1`, not architecture.

---

### `A7-S3` · `MT-06` "The Bounty Lands" — **MAP SHEET `R2`**
**File** `a07_s03_mp_bounty-lands` · **R2** · `wshmap` · **Seed base** 70300 · **2048 × 2048, 1:1**

The strongest single argument this game makes for existing, and it is a map. It shows that the
Articles' fiscal impotence and the next twenty years of westward expansion are the same fact.

**PROMPT BODY**
```
wshmap, a manuscript survey plan of a vast interior river country, almost entirely unsettled: a
great river running from the upper right of the sheet down to the lower left with many long
tributaries branching north and south, immense unbroken woodland shown as small repeated lollipop
tree symbols covering nine tenths of the sheet, a low range of hills drawn in hachure along the
right-hand edge, three or four tiny settlements at river confluences each drawn as five or six plan
rectangles, two or three fine lines of trail, and a scatter of small marsh symbols. Across the whole
sheet, drawn over everything else in a finer and paler ink and clearly at a different time from the
rest of the drawing, a network of straight ruled survey lines dividing the country into a grid of
large regular rectangular lots.

The sheet lies flat on a plain linen-backed board. Two thirds of it is untouched paper.

There is no writing on this sheet of any kind: no place names, no numbers, no compass rose, no scale
bar, no cartouche, no border, no legend, no title.
```

**NEGATIVE** map negative (§1.4) + `state borders, modern boundaries, county lines, national park,
highway, railroad, arrows, coloured territories`

**WATCH FOR:**
- The survey grid must sit **visibly on top of** the country, in a paler, finer, later hand. That
  visual relationship — a ruled abstraction laid over occupied land — *is* the lesson, and it is
  delivered without a word of exposition.
- Territory tinting. No coloured regions. Nations, warrants and acreages are all in-engine tokens.

---

### `A7-S4` · `NW-01` "The Temple, Interior" — **act apex**
**File** `a07_s04_bg_the-temple` · **R1** · `interior_elevation` · **Seed base** 70400

A hall built by an army for its own use in the first months of 1783. **It smells of resin** — the
timber is brand new, unpainted, unweathered, still pale.

**PROMPT BODY**
```
The inside of a large plain new-built timber meeting hall, about eighty feet long and forty wide,
seen from the end opposite the dais. Walls and roof of freshly sawn unpainted pine boards, pale and
clean, with the framing timbers and the plank joints plainly visible and the sap still showing at
the knots. An open truss roof overhead. Rows of plain backless benches on a boarded floor, running
away from the viewer. At the far end a low simple platform of the same new pine with a plain table
on it and a single plain chair. Tall plain windows down both side walls, unglazed in part and
shuttered. No decoration of any kind: no panelling, no mouldings, no paint, no hangings, no
lectern carving.

CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person, on the hall's centreline. The far wall and the dais are parallel to the
picture plane. Very slight downward angle only. The floor is a shallow band across the bottom of the
frame. Flat, and deliberately without deep perspective recession — the benches recede only slightly
and the far wall is close. In the immediate foreground, cropped by the bottom and both side edges,
the dark ends of the two nearest benches, drawn at the heaviest ink weight and with almost no
colour.

LIGHT: cold even north daylight from the tall side windows, weak, blue and shadowless. No candles,
no fire, no sun.

PALETTE: a warm smoked cream paper ground, slightly darkened. The new pine of the walls and roof is
left very largely as untouched bare paper, its form given by the drawn line of the boards and
framing alone. Wash restricted to a single pale yellow ochre in the new timber, soot brown in the
benches and the floor, slate blue-grey in the roof shadows and the window reveals. No saturated
colour anywhere in this picture.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible.
No people. The central aisle between the benches is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `church, chapel, pews, altar, pulpit, stained glass,
cathedral, courtroom, theatre, ornate, gilded, old dark timber, barn, hayloft, ruins`

**WATCH FOR:**
- Old timber. The building is weeks old. If the wood is dark, weathered, or has the character of a
  barn, reject — pale, clean, raw pine is the whole material fact of the scene.
- A church. Benches, not pews; a platform, not an altar or a pulpit; nothing on the walls.
- The hall reading too small. Eighty by forty is a big room for its period, and the five hundred
  officers who fill it are cutouts and painted mass — the plate must have room for them.

---

### `A7-S5` · `NB-01′` "After" — **PROP TOGGLE ONLY · GENERATE NOTHING**
**File** — none. No new asset. **Seed** — none.

Same room, that night. What changes is handled entirely by the engine from the Act 7 prop atlas and
the scene manifest:

| Change | How |
|---|---|
| All seven doors closed | `L2` prop toggle — the one open door's plate is a prop, not part of the layer |
| Candle lit on the table, fire down to embers | prop toggle + the scene's own `grade.key` intensity |
| The papers gone from the table | prop toggle |
| The signature sheet gone from the anteroom door | prop toggle |
| Night beyond the window | `L1` swap to the shared night-window prop |

**This entry exists so that nobody generates it.** It is listed in the inventory as a scene and it is
not an art asset. If a fifth Newburgh plate appears in the ledger, someone has misread this page.

---

## 4.8 ACT 8 — ANNAPOLIS

**Ground** `PAPER-BRIGHT #F6F2E6` · **Light law** `bright, even and almost shadowless; light from
everywhere; deliberately flat and still` · **`W` is clamped to 0.80 for every student in the room** —
so **generate at 0.80 and no mood variant is ever made** (erratum **E-3**) · **Group D permitted:**
`CONTINENTAL-BLUE` only.

Act 8 is the inverse of the whole game: the paper at its brightest, the ink at its finest and most
even, the wash almost absent. It should look like a different chapter of the same book, not a
different book.

**Act negative additions:**
`grand, imperial, marble, gilt, chandelier, red carpet, throne, crowd, packed chamber, dramatic
lighting, spotlight, ceremony, flags, eagles, patriotic, capitol dome, neoclassical grandeur`

---

### `A8-S1` · `AN-02` "The Corridor"
**File** `a08_s01_bg_the-corridor` · **R1** · `interior_elevation` · **Seed base** 80100

The smallest scene in the game: four metres of walk-plane and one conversation. It is doing almost
nothing on purpose, and it must be beautiful while doing it, because the student will look at it for
four minutes.

**PROMPT BODY**
```
A short plain whitewashed passage in a public building in December: bare lime-washed plaster walls,
a plain moulded chair rail, wide unvarnished floorboards, and a simple cornice. One tall sash window
with many small panes at the far end, filled with flat cold winter daylight. Two plain panelled
doors, one in the left wall and one in the right wall, both closed. A single plain wooden bench
against the left wall beneath a row of pegs. Nothing else at all in the passage.

CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow stage set from the
height of a standing person, on the passage's centreline. The far wall with its window is parallel
to the picture plane. Very slight downward angle only. The floor is a shallow band across the bottom
of the frame. Flat, symmetrical, and deliberately without deep perspective recession. In the
immediate foreground, cropped by the bottom and both side edges, the dark vertical edges of an
archway on each side, drawn at the heaviest ink weight and with almost no colour.

LIGHT: bright, even and almost shadowless; cold December daylight from the window at the end and
from beyond both foreground edges; light from everywhere; deliberately flat and still.

PALETTE: a very pale bright cream paper ground. The whitewashed walls are left almost entirely as
untouched bare paper — this is the emptiest and brightest picture in the game. Wash restricted to a
single pale slate blue-grey in the window light and along the base of the walls, and one thin cool
grey-brown in the floorboards. There is almost no wash in this picture at all and no saturated
colour whatsoever.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible.
No people. The floor down the middle of the passage is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `hotel corridor, hospital corridor, long perspective
hallway, doors receding, paintings on the wall, carpet runner, sconces, dark wood panelling`

**WATCH FOR:**
- A long receding hallway. It is **short** — four metres — and if the model has produced a corridor
  vanishing into the distance the walk-plane and the scene's intimacy are both gone.
- Bare paper below 30%. This plate should sit at the very top of the interior band, 38–40%, and it is
  the only interior in the game permitted to feel underpainted. If it lands at 26% it has been
  overworked.
- Ornament. Nothing hangs on these walls. The emptiness is the argument the act makes before the
  chamber makes it louder.

---

### `A8-S2` · `AN-01` "The Chamber" — **symmetry is mandatory · act apex**
**File** `a08_s02_bg_the-chamber` · **R1** · `interior_elevation`, mirror-symmetric · **Seed base**
80200

The only symmetrical composition in the game. Everything else is asymmetric, for forty scenes, and
then this one is not: **the room is balanced because power is being balanced.** Do not soften it, do
not offset the camera "for interest," and do not fill the room.

Use the Maryland State House Old Senate Chamber restoration photography as a **ControlNet lineart
pass from a traced photograph** (AI guide §5.4). Twenty minutes of tracing buys architectural
accuracy no prompt will, and this room has been professionally restored to its documented 1783
appearance.

**PROMPT BODY**
```
The interior of a small late-eighteenth-century American legislative chamber, seen dead-on from the
back of the room. Plain classical woodwork painted a pale colour: fluted pilasters, a simple
entablature, and a shallow apsidal recess in the centre of the far wall. Large tall sash windows
with many small panes on both side walls, filling the room with flat winter light. A raised
presiding officer's desk and chair set centrally in the apse, with two plain tables and a scatter of
plain Windsor chairs arranged in a shallow arc facing it — far fewer chairs than the room could
hold, and many of them empty and pushed back. Above and behind, running across the upper part of the
picture, a plain railed visitors' gallery supported on slender columns. The floor is wide
unpainted, unvarnished pine boards, plainly unfinished. A low wooden bar rail across the near end of
the room.

CAMERA: dead-on near-frontal theatrical elevation, exactly on the room's centreline, from the height
of a standing person. The far wall is exactly parallel to the picture plane and the composition is
mirror-symmetrical, left and right. Very slight downward angle only. The floor is a shallow band
across the bottom of the frame. Flat, and deliberately without deep perspective recession. In the
immediate foreground, cropped by the bottom and both side edges, the dark ends of the bar rail on
each side, drawn at the heaviest ink weight and matched left and right.

LIGHT: bright, even and almost shadowless; cold December daylight entering from the windows on both
sides equally; light from everywhere; deliberately flat and still. No candles, no fire, no dramatic
key.

PALETTE: a very pale bright cream paper ground. The pale walls and the ceiling are left very largely
as untouched bare paper, and the ink line is at its finest and most even anywhere in the game. Wash
restricted to a single pale slate blue-grey in the shadows of the woodwork and under the gallery, a
thin cool grey-brown in the raw pine floor, and soot brown only in the furniture. No saturated
colour whatsoever.

TECHNICAL: composed with generous empty margin on all four sides. Any writing shown is illegible.
No people. The floor between the bar and the desk is clear and unobstructed.
```

**NEGATIVE** `NEG-BASE` + act additions + `full chamber, packed benches, crowd, tiered seating,
parliament, congress hall grand, dome, rotunda, murals, statues, polished floor, marble floor,
red velvet, dais with steps, Trumbull, history painting`

**WATCH FOR:**
- **Asymmetry.** Mirror the plate horizontally and flick between the two: window heights, pilaster
  spacing and gallery columns should be near-identical. If they are not, this is the one plate in the
  game where you should fix it in post rather than regenerate — copy the better half and mirror it,
  then hand-vary the furniture only.
- A full room. **About twenty delegates from seven states were present.** Fewer chairs than the room
  holds, several empty, is a historical fact and it is free emptiness. Do not fill it.
- A **finished floor**. The floorboards were unpainted and unvarnished in 1783, the 2007–2015
  restoration reinstated that, and it is a detail worth being right about.
- Grandeur. No dome, no marble, no murals. This is a small plain provincial chamber and the most
  consequential act of the war happened in it.

---

### `A8-S3` · `MV-04′` "Home" — **STATE VARIANT, img2img**
**File** `a01_s04_bg_the-dock_s-1783` · **R1** · **Seed** 10450 · **denoise 0.34**

**The payoff of the first shot in the game.** The student watched him leave before any of this
existed. Re-slices `L1` (the house on the slope) and `L2`; `L0`, `L3` and `L4` are the Act 1 master's
files, unchanged, which is what makes it read as the same place.

**IMG2IMG BODY** — `MV-04`'s string with these substitutions:
```
… late afternoon in May 1775 → the afternoon of Christmas Eve, 1783: the slope brown and bare, the
trees leafless, a thin cover of old snow in the hollows, the river running grey.

… the house at the top of the slope is CHANGED: it is now longer and symmetrical, with a wing at
each end and no scaffold anywhere; a two-storey open colonnaded porch of square pillars runs the
full length of its river front; and a small square cupola with a low dome stands on the ridge of
the roof. It is small in the distance but it is unmistakably a finished house.

… LIGHT: low pale winter sun, key from frame left, long weak shadows to the right.

… PALETTE: the grass ochre gone to grey-brown; the grey-green of the trees removed entirely; the
river and the sky still untouched bare paper.
```

**NEGATIVE** as `MV-04`, plus `scaffold, building site, lime pit, stacked lumber, spring, green
leaves, summer`

**WATCH FOR:**
- **The scaffold surviving.** It must be gone. This whole variant exists to remove it.
- The piazza reading as a modern veranda. It is a two-storey colonnade of plain square pillars along
  the river front, and it is now correct where in 1775 it was an anachronism — the same feature,
  eight years and one act apart, is the best architectural joke in the project and it only lands if
  both plates are right.
- The shoreline moving. Overlay at 50% against the Act 1 master. The wharf, the fish house and the
  slope must be pixel-close, or the reveal reads as a different place rather than the same one.

---

## 4.9 THE EIGHT GILT FRAME PLATES — `R6`

Everything in §§4.1–4.8 is inverted here, deliberately, once per act. These eight plates use the
**Gilt Frame anchor (§1.5)** and its **own negative** — do **not** paste `NEG-BASE` into them.

**Binding grammar** (art bible §1.2), restated because it is easy to lose in production:

1. The plate is generated **without a frame**. The gilt frame is a border sprite composited in-engine.
2. **Paint to all four edges.** Bare ground 0–3%. This is the only place in the game where filling the
   frame is correct.
3. **No ink line anywhere.** Structure is carried by painted mass.
4. **No text.** The caption — painter, date, and the number of years between the event and the
   picture — is in-engine `ENGROSSED` type. It is the payload and the model cannot render it.
5. Darkest value clamps to `#16110D`, the only value in the game below `INK-FLOOR`.
6. **Generate all eight in one sitting, at consecutive seeds, in one session.** They must read as one
   nineteenth-century gallery wall, and the cheapest way to get that is not to leave the room.

**Common negative for all eight:** `text, lettering, signature, caption, watermark, numbers, pen and
ink, line drawing, watercolour, bare paper, sketch, unfinished, visible drawing, flat colour, cel
shading, pixel art, 3d render, photograph, modern illustration, comic, frame, picture frame, gilt
frame, ornate border, museum wall`.

| # | Act | `File` / **Seed** | **PROMPT BODY** (after `wshwash,` — the LoRA still supplies the hand) | Watch for |
|---|---|---|---|---|
| **GF1** | 1 | `a01_xx_gf_cincinnatus` · 10900 | `a heroic neoclassical history painting: a powerfully built middle-aged man in a Roman toga and sandals standing beside a wooden plough in a golden field, one hand resting on the plough handle, a short sword and a bundle of fasces laid on the ground at his feet; a young woman in classical drapery offers him a laurel wreath; distant classical temples on a hill behind; warm golden evening light, theatrical shadow, idealised anatomy, everyone looking at the central man; opaque oil paint filling the canvas edge to edge` | Anything American. This plate is **entirely Roman** — the joke is that the myth arrived in fancy dress. No blue coat, no tricorn, no Virginia. |
| **GF2** | 2 | `a02_xx_gf_cambridge-elm` · 20900 | `a nineteenth-century commemorative lithograph in oil-painting manner: a general in a blue and buff uniform on a white horse beneath an enormous spreading elm tree, drawing his sword as he takes command; ranks of neat uniformed soldiers formed in perfect lines around him, officers with plumed hats, civilians and ladies watching from the right, a boy waving a hat; dappled sunlight through the leaves, a clear blue sky, everyone looking at the central man; opaque paint edge to edge` | The white horse and the ceremonial sword are **required** here and banned everywhere else. If it looks like the rest of the game, it has failed. |
| **GF3** | 3 | `a03_xx_gf_hale-martyrdom` · 30900 | `a late nineteenth-century monumental bronze memorial statue rendered as a dark heroic painting: a slender young man in shirtsleeves and breeches standing bound at the wrists and ankles with a coil of rope at his feet, chin lifted, eyes to the sky, defiant and serene, on a plain stone plinth against a stormy dark sky; low dramatic light from below; no other figures; opaque paint edge to edge` | It must read as a **statue**, not a man — the whole point is that the record we have is a monument, not a witness. Bronze surface, plinth, and no setting. |
| **GF4** | 4 | `a04_xx_gf_leutze-crossing` · 40900 | `the most famous nineteenth-century academic history painting of the American Revolution: a general standing upright in the bow of a small crowded rowing boat, one boot on the gunwale, gazing forward into the dawn; a young officer beside him holding a large striped flag with a circle of stars aloft; twelve straining oarsmen of assorted types breaking huge slabs of arctic ice with their oars; pink and gold dawn light behind, heavy dramatic sky, monumental pyramidal composition, everyone in the boat looking forward at the central man; opaque oil paint edge to edge` | **Every element must be wrong**, and specifically wrong: the small boat, the stars flag, the dawn, the standing pose, the arctic ice. The student has just spent forty minutes in the correct version. Do not correct anything. |
| **GF5** | 5 | `a05_xx_gf_valley-forge-prayer` · 50900 | `a sentimental nineteenth-century devotional history painting: a general in a blue and buff uniform kneeling bare-headed in deep snow in a bare winter wood beside his white horse, hands clasped in prayer, face lifted, a shaft of golden light falling through the trees onto him alone; snow-covered ground, bare birches, a distant camp barely visible; reverent, hushed, idealised; opaque paint edge to edge` | The golden shaft of light is **mandatory** — it is the exact device the honest register bans, and its presence here is the argument. There is no contemporary source for this event of any kind. |
| **GF6** | **6 Yorktown** | `a06_xx_gf_cornwallis-surrender` · 60900 | `a large nineteenth-century capitol rotunda history painting: two long lines of mounted and standing officers in blue and buff and in white facing each other along a road under a great sky, a mounted general in blue at the centre of the composition receiving a defeated officer who advances on foot with his hat in his hand; regimental colours and a national striped flag flying above the American line; a white marquee on the left, cannon on the right; even golden light, everyone in the picture turned toward the central mounted man; opaque paint edge to edge` | Trumbull put Washington at the centre. Protocol had put him at the edge. **Centre him.** The caption does the rest. |
| **GF7** | **7 Newburgh** | `a07_xx_gf_newburgh-address` · 70900 | `a nineteenth-century steel-engraving history scene rendered as a painting: an elderly general standing at a small table on a low platform in a plain hall, one hand raising a pair of small oval spectacles to his face and the other holding an open letter, addressing a crowd of seated and standing officers in blue uniforms whose faces are turned to him in visible emotion, several with heads bowed; a single dramatic shaft of light falling on the general; deep engraved shadows, tightly packed composition, everyone looking at the central man; opaque paint edge to edge` | The room must be **grand and full**. It was neither: it was a new pine hall miles from headquarters, and the address itself failed. The gap is the payload. |
| **GF8** | 8 | `a08_xx_gf_resignation` · 80900 | `a large nineteenth-century capitol rotunda history painting: a general in blue and buff standing alone at the bar of a grand classical legislative chamber, holding out a rolled document in an extended hand; the chamber is full — thirty or forty seated delegates in dark coats ranged in a deep arc, a crowded gallery of ladies above, standing spectators filling every space; tall columns, rich draperies, warm even light; every face turned toward the standing man; opaque paint edge to edge` | **Fill the room.** Trumbull filled it; Molly Ridout, watching from the gallery, described a handful of people. This is the direct visual contradiction of `AN-01`, which the student played ninety seconds earlier, and it must be unmistakable. |

**Aspect** 16:9 for all eight, generate 1536 × 864. **Ship** 2048 × 1152, no overscan and no layers —
a Gilt Frame is one flat image and it does not breathe.

---

## 4.10 THE INTERLUDE STILL — one plate, seven relights

**File** `gl_xx_bg_writing-desk` · **R1** · `interior_elevation` · **Seed base** 99000 ·
**Ground** `PAPER-WARM` · Aspect 16:9

The highest value-per-asset item in the project: one generation, seven appearances, sixty to ninety
seconds of authored reading each time, and it is the game's natural save point and end-of-period
break. **The letter that composes itself over it is DOM type**, so the plate ships blank.

**PROMPT BODY**
```
A plain writing desk seen close and straight on in a dim room at night: a slant-topped wooden desk
with its lid open flat, a sheet of blank paper laid squarely on it, a brass inkstand with a quill
standing in it, a sand caster, a penknife, a folded pocket-book, and a single candle in a plain
brass stick at the left. A plain chair drawn up. Behind the desk, a bare wall in shadow and the
corner of a shuttered window. Nothing else in the picture.

CAMERA: near-frontal theatrical elevation, close to the desk, from the height of a seated person's
eye. The desk and the wall behind are parallel to the picture plane. Very slight downward angle
only. Flat, symmetrical, and deliberately without deep perspective recession. In the immediate
foreground, cropped by the bottom and both side edges, the dark front edge of the desk, drawn at the
heaviest ink weight and with almost no colour.

LIGHT: one candle at the left, warm and low, lighting the desk top and the blank sheet and reaching
almost nowhere else. The rest of the room is in even quiet shade.

PALETTE: warm cream paper ground. The blank sheet on the desk is untouched bare paper and is the
brightest thing in the picture. Wash restricted to soot brown for the desk and chair, cool grey-brown
and slate blue-grey in the room behind, one narrow warm ochre pass in the candlelight only. No
saturated colour.

TECHNICAL: composed with generous empty margin on all four sides. The sheet of paper on the desk is
completely blank — no writing, no marks, no ruling of any kind. No people. No hands.
```

**NEGATIVE** `NEG-BASE` + `handwriting, letter with writing, quill writing, hands, arms, person
writing, open book with text, candlelight glow bloom, romantic, cosy study, library`

**The seven relights are not seven generations.** They are seven `grade` blocks in the scene
manifests — key colour, key intensity, fog and LUT — over the same five sliced layers:

| Interlude | After act | Relight |
|---|---|---|
| `I1` | 1 | warm candle, steady, the room barely dark — early summer |
| `I2` | 2 | colder, one shutter open on grey daylight behind |
| `I3` | 3 | the candle guttering, the room's shade deepened, key intensity down 30% |
| `I4` | 4 | coldest; the candle small; a blue cast on the wall |
| `I5` | 5 | the candle steady again and daylight returning at the shutter |
| `I6` | 6 | warmest of the seven; two candles' worth of key, though only one is drawn |
| `I7` | 7 | flat, even, almost shadowless — anticipating Act 8 |

Because these are grade blocks, the interlude's identity survives eight class periods without a
second asset, and the change is felt rather than noticed. **That is the whole design of it.**

---

## 4.11 THE TWELVE SURVEYOR'S OVERLAYS — traced, not prompted

Twelve exteriors carry a hold-`M` overlay that draws contour hachures, sightlines and distances over
the diorama in the `wshmap` register. **These are not generations.** Each is a single-channel
transparent PNG traced by hand in Krita over the accepted plate, at 2048 × 1152, using the same
hachure and ruled-line vocabulary as the map sheets.

Budget **25 minutes each**, 5 hours total. Reasons this is hand work and not a prompt:

- The overlay must register **exactly** with the plate's ground. A generated overlay will not, and
  a misregistered contour is worse than no contour.
- It is one ink colour at one weight (`INK-LIGHT #6E6152`), which is trivial to draw and impossible
  to ask a model for without it inventing terrain.
- It is the strongest single piece of human-authorship evidence in the environment pipeline
  (AI guide §7.1), and it costs five hours.

**The twelve:** `MV-01`, `MV-04`, `CB-01`, `CB-03`, `BK-01`, `DL-03`, `DL-02`, `TR-01`, `VF-01`,
`VF-03`, `YT-01`, `NW-02`. Interiors get none — there is no ground to read.

---

# 5. THE LAYER PROBLEM

## 5.1 The rule, first, because everything else follows from it

> **Generate ONE plate. Then cut it. Never generate five layers from five prompts.**

The AI guide's §2.5 rule — *if two assets appear on screen at the same time, they should have been
born in the same image* — is at its most binding here, because **all five layers of a diorama are on
screen at once, always, in every frame.** Five separately generated layers will differ in light
direction, in wash temperature, in line weight and in paper tone, and the differences will be visible
the instant the parallax dolly moves them relative to one another. No LUT fixes that; the per-act
grade normalises drift *between scenes*, not *within a frame*.

There is exactly one exception, spec'd at §5.5: the reveal painted **behind** a layer edge, which by
definition was never in the source image and has to come from somewhere.

## 5.2 The blockout is where layers are decided

Layer separation is a **composition** decision and it is made with a pencil, before the model runs.
The blockout (AI guide §2.6 step 5, ~30 minutes) is drawn on the 1600 × 900 grid with the horizon at
`y = 0.34` and the walk-plane band at `y = 0.56–0.78` printed on the template, and it carries five
flat grey values — one per layer — plus the walk-plane polyline and the exits.

**The three things the blockout must resolve, all of which are unfixable later:**

1. **No layer boundary may cross the walk path.** If the walk-plane passes behind a tent on `L3` and
   then in front of it, the character will pop between planes as he walks. Move the tent to `L4` and
   cut the walk-plane short, or move the walk-plane. `04-scene-architecture.md` §5.2.
2. **`L4` exists.** Every exterior ships at least one foreground occluder that the player's cutout
   passes behind during normal traversal, covering 15–25% of frame height at the bottom, at the
   heaviest ink weight and the lowest chroma. This is the layer artists want to skip and it is the
   one that makes a diorama read as a diorama instead of as wallpaper. It is a content-review gate.
3. **Nothing straddles a boundary.** A cart whose wheel is on `L3` and whose shaft is on `L2` cannot
   be cut without inventing the middle of a cart. Draw the gap.

The blockout drives ControlNet at **depth 0.55 / lineart 0.35**. If the plate comes back with the
layers tangled, **adjust the blockout and regenerate at the same seed.** Do not adjust the prompt —
prompt churn is how a 27-plate set drifts apart, and the composition is not what the prompt is for.

## 5.3 The full workflow, step by step

Per plate. Steps 1–4 are AI guide §2.6 with the environment specifics filled in; steps 5–10 are the
slicing work this section owns.

```
 1  BLOCKOUT            30 min   5 grey values + walk-plane + exits, on the 1600×900 template
 2  GENERATE            15 min   1536×864, ControlNet depth 0.55 / lineart 0.35, 8 candidates
                                 from the scene's seed family
 3  SELECT               5 min   pick 1. If none work, go back to step 1, not to the prompt
 4  GATE                 2 min   run bare-paper.mjs and the Washington silhouette test NOW,
                                 before any time is spent downstream
 5  REPAIR              20 min   masked inpaint at denoise 0.45, same graph, for local failures
 6  UPSCALE              5 min   Topaz Gigapixel "Art & CG" 1.5× → 2304×1296;
                                 unsharp r0.8 a40 to recover the ink line; Lanczos → 2048×1152
 7  SLICE            20–40 min   cut L0–L4 on the blockout's boundaries in Krita
 8  PAINT-IN         included    hand-paint the reveal behind every layer edge (§5.5)
 9  INK MASKS         8 min/lyr  luminance + chroma threshold, hand-corrected (§5.7)
10  TRIM + ENCODE      10 min    crop each layer to its band, KTX2 UASTC + Zstd, ledger, commit
```

**Total ≈ 2.5 hours of human time per plate**, of which about 90 minutes is slicing and paint-in.
Across 27 masters and 5 variants that is the 55–60 hours the inventory budgeted, and it is the real
schedule, not the generation time.

**Step 4 is where the discipline lives.** The gate costs two minutes and it is placed before the
ninety-minute step on purpose.

## 5.4 What lives on each layer, per the architecture

| Layer | Z | Parallax | Contents | Ink weight | Ship size |
|---|---|---|---|---|---|
| `L0` | −40 | 0.10 | sky, distant water, the far horizon wash — usually mostly bare paper | absent, or 0.8–1.0 px `INK-LIGHT` | **1024 × 576** |
| `L1` | −18 | 0.30 | hills, treeline, far bank, the town across the water | 1.0–1.5 px `INK-LIGHT` | horizontal band |
| `L2` | −6 | 0.62 | **the subject** — buildings, tents, the earthwork, the hut street. Characters billboard in this plane's neighbourhood. | full weight `INK-SETTLED` | **2048 × 1152**, full frame |
| `L3` | 0 | 1.00 | the walk-plane's own ground and near objects | full weight, heavier | horizontal band |
| `L4` | +7 | 1.55 | foreground occluders the player passes behind | heaviest, lowest chroma | horizontal band, **15% bleed** |

**Only `L2` ships full-frame.** `L0` drops to 1024 × 576 because it is behind full fog exposure and
nobody has ever seen a sky's mip detail; `L1`, `L3` and `L4` are trimmed to the horizontal band they
actually occupy, with transparent margins discarded. That trimming is what takes peak GPU texture per
scene from ~24 MB to ~9 MB, and it is done in step 10, never by the model.

**`L4` is composed with 15% bleed, not 12.5%** (`06-technical-architecture.md` §2.3). At parallax
1.55 a 64 px camera offset displaces `L4` by 99 px against 100 px of margin, and one pixel is not a
margin. Compose the `L4` element knowing 15% of it will never be seen.

## 5.5 Extracting the layers — the three methods, in order of preference

### Method A — cut and hand-paint the reveal (default; use this for `L2`, `L3`, `L4`)

Cut on the blockout's boundary, then **paint what is behind the cut.** The model cannot know what is
behind the tent because in the source image there is nothing behind the tent — the pixels do not
exist. A human paints twenty to forty minutes of continuation per plate: the ground running on under
the hut, the parapet continuing behind the gabion stack, the wall behind the doorframe.

Three rules that keep the paint-in invisible:

- **Continue the wash, not the line.** Occluded areas are almost always open ground or open wall,
  which in this style means one flat wash pass and no drawing at all. If you find yourself drawing
  detail into a reveal, the layer boundary is in the wrong place.
- **Reveal depth: 120 px minimum** beyond the cut edge on `L2` and `L3`, 180 px on `L4`. At maximum
  parallax the largest relative displacement in the stack is 93 px; 120 gives margin, and a
  too-short reveal shows as a hard edge of nothing on the first dolly.
- **Never feather the cut.** A feathered alpha edge on a wash plate reads as a blur, and there is no
  blur in this game. Cut hard on the ink line, which is what the ink line is for.

This is also the **strongest human-authorship evidence in the project** (AI guide §7.1). Record the
minutes in the ledger's `post` array. It is a scheduling input and a legal one.

### Method B — the empty-stage pass (use when a reveal is larger than about 15% of frame)

Some plates hide a lot: `TR-01`'s roadway behind the near house corner, `VF-01`'s lane behind the
first hut, `YT-01`'s trench floor behind the gabion stack. Painting 15% of a frame by hand is an
hour. Generate the material instead, **from the same seed, from the same plate.**

Run the accepted master back through `wash-v1` as **img2img at denoise 0.45**, same seed, with the
near objects removed from the subject slot and this clause added:

```
… the middle distance is open and empty: the ground runs on unbroken across the whole width of the
picture with nothing standing on it.
```

The result is the same place with the foreground missing. Composite its ground under the cut, then
hand-correct the seam. **Twelve minutes instead of sixty, and it matches by construction** because it
came from the same seed and the same LoRA.

Denoise 0.45 is the ceiling here and it is higher than the 0.28–0.38 used for state variants, because
we *want* the near objects gone — but the far architecture must not move, so check the horizon line
and the `L1` silhouette against the master before you use the output.

### Method C — the `L4` element sheet (secondary occluders only)

The hero `L4` element is always cut from the plate, because it must belong to the light and the
ground it stands in. But scenes often want a second or third occluder at the frame edge, and those
can come from a shared sheet — one generation per act, nine elements, all born in the same image,
all sharing that act's light law:

```
wshwash, a page from a sketchbook: nine separate studies of single objects arranged in a neat three
by three grid on bare cream paper, each object isolated with clear space around it and no overlap,
each drawn close and large and cropped as if seen from very near — a tent flap hanging open, a gun
carriage wheel, a stack of woven wicker gabions, the corner of a doorframe with its architrave, a
broken fence rail, a heap of firewood, a mooring post with rope turned round it, the trunk of a
tree, a barrel on its side. Even flat light. Every object drawn at the heaviest ink weight and with
almost no colour in it.
[LIGHT LAW for the act]
[STYLE ANCHOR §1.1]
```

Cut the nine, key them, and keep them in the act's prop atlas. **Four sheets cover the whole game**
(Acts 1–2, 3–4, 5–6, 7–8), and they are already inside the 24 prop-sheet budget.

### And the method that is not on the list

**Do not use a depth-estimation model to auto-slice.** MiDaS and its descendants produce a smooth
continuous depth field; this art has five discrete planes chosen by a human for gameplay reasons —
where the player can walk, what he passes behind, where the exits are. An auto-slice will put the
boundary in the middle of a tent and will not know that the walk-plane goes behind it. It is faster
and it is wrong, and it fails the same content-review gate every time.

## 5.6 `L0` is usually not generated at all

For 21 of the 27 masters, `L0` is sky — which in this style means **bare paper with at most one
graded wash band and one or two ruled lines**. That is four minutes of hand work in Krita and it is
better than anything a generation will give you, because a model asked for sky will put clouds in it,
and this game does not have clouds except where an entry asks for them.

**Generate `L0` only where it carries actual content:** `MV-04` and `CB-01` (water to a high horizon),
`BK-01` (river and far town), `YT-01` (the distant water and far shore), `YT-02` (the flat dark sky
that the redoubt is drawn against), `DL-02` (the far bank's single broken line). Six plates. The rest
are hand-made, and the four minutes are already inside step 7.

The same logic applies to the map sheets: `MT-01`–`MT-06` have **no layers at all**. A map table is a
displaced quad with a hachure alpha and a heightfield, not a five-plane stack.

## 5.7 Ink masks — 8 minutes a layer, and they are not optional

The mood system is only honest if the line is genuinely untouched, and on a flat painted plate the
line and the wash are the same pixels. The separation happens **at bake time**:

- **`L0`, `L1`, `L2`** are opaque full-frame or band plates whose alpha channel is otherwise unused.
  Their ink mask is **packed into alpha and costs literally zero bytes** — UASTC is a fixed 8 bpp
  block format that carries alpha whether you use it or not.
- **`L3`, `L4`** need real cutout alpha, so their mask is derived in-shader from luminance and chroma
  (art bible §3.3). Nothing to author — but it means **those two layers must have enough contrast for
  the derivation to work.** A pale, low-contrast `L4` breaks the mood system silently. This is the
  second reason `L4` is drawn at the heaviest ink weight and the lowest chroma; the first was depth.

Authoring an `L0`–`L2` mask: luminance threshold + chroma threshold in Krita, then hand-correct the
places where a dark wash was mistaken for line (deep shadow under a parapet, a dark doorway) and
where a light line was missed (`INK-LIGHT` on `L1`). Eight minutes, and if it is wrong the wash will
bleed through the drawing at low morale and the whole "structure never wavers" claim dies.

## 5.8 The layer checklist — run before encoding

- [ ] Five layers exist, including any that are nearly empty (an empty layer ships as a 4 KB
      transparent KTX2 — a variable layer count means a variable shader path and a compile stall)
- [ ] No layer boundary crosses the walk-plane polyline
- [ ] At least one `L4` element that the player passes behind during normal traversal
- [ ] `L4` composed at 15% bleed; `L1`/`L3` at 12.5%
- [ ] Every reveal painted to ≥120 px (`L2`/`L3`) or ≥180 px (`L4`) behind the cut
- [ ] No feathered alpha edges anywhere
- [ ] Ink masks authored for `L0`–`L2`; `L3`/`L4` contrast checked against the shader derivation
- [ ] `L0` trimmed to 1024 × 576; `L1`/`L3`/`L4` trimmed to their bands; only `L2` full frame
- [ ] Ledger record written, with paint-in minutes in `post`

---

# 6. MOOD VARIANTS

## 6.1 The prior is correct, and here is the arithmetic

> **Confirmed: mood is a shader, not an asset. Do not generate mood variants.**

Four reasons, in order of decisiveness.

**1. It does not fit, by a factor of three and a half.** 27 masters × 5 layers = 135 shipped layers.
Three mood bands would be 405, plus 15 for the state variants, against a payload that is already
1.8× over the AI guide's original ceiling and asking for a raise to 155 MB. Mood-as-asset takes total
shipped art past 400 MB. That is not a negotiation; it is a different product.

**2. It would break the one rule the whole art direction rests on.** *Stats drive the wash; they
never touch the line.* A shader guarantees this with a single `mix(gradedWash, inkColor, ink)` — the
line is sampled from the untouched source texture and is never multiplied, desaturated, lifted or
fogged. An img2img pass at any denoise high enough to change mood **also redraws the line**, and it
redraws it differently in each band. The student would then see Washington's competence waver with
his morale, which is precisely the thing the art direction exists to deny.

**3. Three bands would shimmer where one scalar is continuous.** `W` is a continuous scalar eased in
over 1.2 s at scene load, with 0.04 hysteresis. Three baked variants are three discrete steps, and a
student who crosses a threshold between two class periods sees a jump-cut in the weather rather than
a change in the world.

**4. The uniform values are already derived and the shader already exists.** Nine uniforms, exact
values at both ends, exact composite order, full GLSL. The work is done. Generating variants would
be paying twice for something already paid for.

## 6.2 What the shader does, so you know what you do not have to paint

At `W = 0.0` — nine uniforms, all subtractive from the plate you delivered:

| | `W = 1.0` | `W = 0.0` | Visible as |
|---|---|---|---|
| `uWashChroma` | 1.00 | 0.34 | the colour drains out of the world |
| `uWashTemp` | +0.10 | −0.22 | the day goes cold |
| `uWashLift` | 0.00 | +0.10 | greys flatten, nothing is deep |
| `uWashGamma` | 0.96 | 1.28 | the wash thins toward the paper in patches |
| `uEdgeBleed` | 0.0 px | 2.6 px | **wet-into-wet — the wash spreads past the ink** |
| `uGranulation` | 0.22 | 0.75 | pigment settles and blooms in the paper's tooth |
| `uFogDensity` | act × 0.80 | act × 1.55 | the weather closes in |
| `uVignette` | 0.16 | 0.42 | the sheet darkens at its edges |
| `uGrainOpacity` | 0.22 | 0.38 | the paper asserts itself |

Read the whole right-hand column at once: seven earth colours converging on one blue-grey mud, the
wash spreading past its own edges, the paper coming up through the image. **That is a wash laid into
damp paper by a man drawing in a tent in the rain**, and it is produced from *your* plate, which was
a wash laid wet-on-dry by a man with a steady hand.

## 6.3 The one canonical generation — what `W` to paint at

**Every uniform's `W = 1.0` end is its identity value or close to it.** Chroma multiplies by 1.00,
lift adds 0.00, bleed is 0.0 px, vignette and grain are at their minimums. Every path away from the
top of the range is **subtractive**. The shader can take colour out; it cannot put colour in. It can
spread a wash past a line; it cannot un-spread one. It can raise fog; it cannot clear it.

> **Therefore: generate every plate at the top of its act's `W` band — the act's best day. The
> shader can only take away.**

| Act | `actFloor` | `actCeil` | **Generate at** |
|---|---|---|---|
| 1 Mount Vernon | 0.55 | 0.85 | **0.85** |
| 2 Cambridge | 0.30 | 0.62 | **0.62** |
| 3 Brooklyn | 0.12 | 0.40 | **0.40** |
| 4 Delaware / Trenton | 0.05 | 0.55 | **0.55** |
| 5 Valley Forge | 0.03 | 0.58 | **0.58** |
| 6 Yorktown | 0.45 | 0.90 | **0.90** |
| 7 Newburgh | 0.25 | 0.70 | **0.70** |
| 8 Annapolis | 0.80 | 0.80 | **0.80** — fixed |

**In prompt terms, "generate at the act ceiling" means four things:**

1. **Paint the good day.** Act 3's plate is drawn as an overcast late-summer afternoon with the fog
   just rising — not as the drowned grey it will be at `W = 0.12`. Act 5's brigade street is drawn as
   a clear cold morning, not as a whiteout.
2. **Lay the wash wet-on-dry with hard tidelines**, which the anchor already demands. Those tidelines
   are what `uEdgeBleed` has to work *on*. A plate generated soft has nothing to dissolve and looks
   identical at both ends of the range.
3. **Do not pre-fog.** Fog is a uniform, and the act's base density is in the scene manifest. A plate
   that arrives already hazy gets fogged twice at low morale and turns to soup. The only "fog" the
   plate may contain is **reserved bare paper** — Act 3's fog is the untouched sheet, which is a
   drawing decision, not an atmospheric one, and the shader does not touch it.
4. **Pre-compensate the temperature by a hair.** `uWashTemp` is `+0.10` toward ochre even at the
   ceiling, so a plate painted at its intended on-screen warmth will read slightly warm in play.
   Generate **fractionally cooler than you want it** — one notch of slate blue-grey more in the
   shadow passes. This is a two-minute adjustment at review, and it is the only place where you paint
   for the shader rather than for the eye.

And the corollary, which is the sentence to keep: **a plate that already looks miserable has thrown
away half the game's range.** Misery is free at runtime. Composure is not.

## 6.4 The seven apex plates — the only permitted exception

Art bible §3.6 allows a second painted `L2` at each act's emotional apex, band-selected. That
exception survives, **reduced to seven** (erratum **E-3**: Act 8's `W` is clamped to a single value,
so a variant of `AN-01` can never be displayed).

These are not mood variants in the shader's sense. They are **content** variants: what the shader
cannot express is *how many people are here and what state the objects are in*. No amount of chroma
reduction puts fewer men on the parade ground or blows a shelter down.

| Act | Apex scene | Plate | What differs in the `m-grim` `L2` |
|---|---|---|---|
| 1 | `A1-S4` | `MV-04` | the sloop's gear stowed carelessly; two barrels open and spilled; the far house's scaffold sagging |
| 2 | `A2-S5` | `CB-03′` | one gun still on its sledge and not brought up; the flag halyard slack; fewer footprints in the snow |
| 3 | `A3-S4` | `BK-02` | one boat swamped and part-sunk at the landing; stores left on the stage; two lanterns out |
| 4 | `A4-S4` | `DL-02` | the ice heavier and more continuous; the lane of open water narrower |
| 5 | `A5-S7` | `VF-01′` | four huts unroofed and dark; the drainage cut choked; less grass |
| 6 | `A6-S3` | `YT-01` | the gabion row incomplete with a gap; spoil unbanked; more spades abandoned |
| 7 | `A7-S4` | `NW-01` | benches disordered and pushed out of line; two shutters hanging |
| ~~8~~ | — | — | **cut — unreachable** |

**Production recipe, identical for all seven:** img2img from the accepted master `L2` through
`wash-v1` at **denoise 0.30**, same seed + 60, with only the differences above appended to the
subject slot. Re-slice `L2` only. Filename qualifier `_m-grim`. Ship as
`a05_s01_bg_brigade-street_L2_m-grim_v01.ktx2`.

**Never re-prompt an apex variant from scratch.** At 0.30 the architecture holds and the plate is
provably the same place; the whole mechanic depends on the student not being able to say what changed
while being certain something did.

## 6.5 The three kinds of variation, and which mechanism owns each

The clearest way to keep this straight, and the one table to remember:

| Kind | Example | Mechanism | Cost |
|---|---|---|---|
| **Mood** — the same world, felt differently | Act 5 at high vs low morale | **Shader.** Nine uniforms off one scalar. | **Zero.** Already built. |
| **State** — the world has actually changed | December huts → May huts; the Grand Union going up; the finished house | **img2img at 0.28–0.38** off the accepted master, re-slice the changed layers only | 5 generations, 9 shipped layers |
| **Apex** — the same moment, differently populated | the seven above | **img2img at 0.30**, `L2` only | 7 generations, 7 shipped layers |
| **Angle** — a second view of a place | — | **Does not exist.** If the script needs one, the scene is cut or rewritten. | — |

---

# 7. TROUBLESHOOTING — the ten failures you will actually hit

Ordered by how often they occur, not by severity. Each gives the symptom, the cause, the **exact
text** that fixes it, and whether the fix is a prompt at all — because for three of these ten it is
not, and reaching for the prompt is how the set drifts.

---

### T-1 · The plate fills up. Bare paper below 35%.

**Symptom.** `scripts/bare-paper.mjs` reports 22%. The picture is competent and completely wrong: it
reads as illustration, the paper has stopped being the ground, and the mood shader's granulation has
nothing to come up through.

**Cause.** Too many nouns. The model will not leave anything out, so every object you name gets
painted, and painted objects displace paper one for one. This is the most common failure in the set
and it is arithmetic, not aesthetics.

**Fix — count your nouns and cut to fourteen.** Then move the reserve to the front of the palette
slot and name it as a specific thing rather than a proportion:

```
PALETTE: … The sky is untouched bare paper across the whole top of the picture, down to the
roofline, and it is the largest single area in the frame.
```

"Roughly half the sheet" in the anchor is a global instruction; naming *which* half, *bounded by
what*, is what actually moves the pixel count. If it is still over, the second lever is to demote
objects to `L1` distance — `drawn at the thinnest line weight with almost no wash` costs almost no
paper.

**Not a fix:** lowering guidance, raising steps, or adding `minimalist` (which produces modern
graphic design), `negative space` (which produces a poster layout), or `simple` (which produces a
children's book).

---

### T-2 · Every contour is closed. No lost edge anywhere.

**Symptom.** Technically correct pen-and-wash in which every single form is outlined and filled. It
looks like a line drawing that has been coloured in, because that is what it is. Art bible §4.3
rejects it.

**Cause.** The model's strongest prior for "ink and watercolour" is exactly this — the illustration
convention where line defines and colour fills. Lost edges are rare in that training data.

**Fix.** The anchor's clause is generic; make it specific and located:

```
… at the [right] edge of the picture the drawing simply stops: the wash thins away into the bare
paper and the ink line does not follow it there, so the [treeline / far bank / crowd] is completed
by the viewer and not by the drawing.
```

Naming *which* form has the lost edge works; asking for lost edges in general does not.

**The two-second review check:** trace the lost edge with a finger. **If the line goes there, the
edge is not lost** — it is a hard edge somebody forgot to paint up to.

---

### T-3 · The camera is flat. Near silhouette 220 px, far silhouette 190 px.

**Symptom.** The plate looks fine and feels wrong to walk in: the ground reads as a wall, the far
end of the walk-plane is the same size as the near end, and Washington will appear to slide sideways
rather than into depth.

**Cause.** The model averaged toward a straight-on landscape view. It does this whenever the subject
slot describes a *scene* rather than *ground*.

**THIS IS NOT A PROMPT FIX.** `04-scene-architecture.md` §3.1 is explicit: outside the 210–230 px
near / 125–140 px far band the plate is **rejected and the blockout is redrawn**. Re-prompting a flat
camera produces a differently flat camera and burns an afternoon.

**What does help, in the blockout:** push the far edge of the walk-plane further up the frame, and
make the receding element genuinely converge. **What helps in the prompt**, once the blockout is
right, is the scale clause — and it must name both ends:

```
… a standing man on the near edge of it would be about a quarter of the height of the whole picture,
and about half that on the far edge.
```

Validate before slicing: composite a flat grey Washington silhouette at three points on the intended
walk-plane. Two minutes, and it saves the ninety-minute step.

---

### T-4 · It has become a nineteenth-century history painting.

**Symptom.** Everyone is posed. There is a dramatic key light. The composition is pyramidal. Someone
is gesturing. The sky has weather in it that means something. It is a *good picture* and it is the
exact register the Gilt Frame exists to quarantine.

**Cause.** This is the model's default prior for "American Revolution" and it is built overwhelmingly
from 1817–1876 painting, not from 1770s drawing. **It must be actively fought in every single
generation**, including the ones where you would not expect it.

**Fix — positive first, because negatives are weak here.** Add to the end of the subject slot:

```
… This is a working record made on the spot by an officer, not a finished picture: nobody is posed,
nothing is arranged, no one is looking at the artist, and nothing in the composition is dramatic.
```

Then confirm `NEG-BASE`'s named-painting group is actually in the string. It contains `Leutze, Spirit
of 76, Currier and Ives, N C Wyeth, Howard Pyle, Norman Rockwell, nineteenth century history
painting, bicentennial` and it is not optional.

**The review question:** if this plate were captioned with a painter's name and a date fifty years
after the event, would anyone doubt it? If no, reject.

---

### T-5 · Legible gibberish text.

**Symptom.** Near-English words on a document, a sign, a flag, a barrel head, a map. A history
teacher spots it in two seconds and a student screenshots it.

**Cause.** Every source image of a street, a desk or a map has writing in it.

**Fix, in three escalating steps:**

1. Confirm the technical slot's clause is present, verbatim: `Any writing shown is illegible: fine
   ink strokes suggesting cursive, not readable letterforms.`
2. Add the offending object to the negative explicitly — `shop sign, inn sign, house numbers,
   painted fascia, banner`.
3. If the plate is otherwise perfect, **inpaint the region** at denoise 0.45 with the illegibility
   clause as the entire prompt. This works and it is much cheaper than a regeneration.

**The structural fix, which is better than all three:** **do not put a readable-size document, sign,
map or flag device in a plate at all.** Documents are DOM objects; signs are props; the map sheet
ships blank; regimental colours are cutouts. The plate paints the place.

**Zoom every plate to 200% before accepting it.** One near-word is a reject.

---

### T-6 · Pure black line, pure white paper.

**Symptom.** The darkest pixel samples `#0A0A0A`; the sky samples `#FFFFFF`. CI fails the asset on
the `INK-FLOOR` clamp and the no-pure-white check.

**Cause.** The digital-illustration prior. Every liner-and-watercolour tutorial in the training data
uses a black fineliner on white cartridge paper.

**Fix.** Both halves of the clause are already in the anchor (`Nothing in the image is pure black` /
`Nothing in the image is pure white`) — if you are seeing this, they are being outweighed by the
subject. Strengthen with the material, which is more effective than the prohibition:

```
… drawn in brown-black iron gall ink on warm cream laid rag paper; the darkest line in the picture is
a warm dark brown and the palest paper is a warm cream, not white.
```

**Review check:** eyedropper the darkest pixel. Is it *warm*? Eyedropper the sky. Is it the act's
ground tone rather than white? Both take five seconds and CI will do it anyway.

---

### T-7 · The interior has a deep vanishing point, and it looks like a failed 3D render.

**Symptom.** Side walls converging hard, a floor rushing away, orthogonals that *nearly* meet at a
point. This is the single most recognisable tell of an AI interior, because a *nearly* correct
one-point perspective reads as a model that could not quite hold vanishing points.

**Cause.** Asking for an interior at all. Interiors in training data are photographs, and photographs
have real perspective.

**Fix.** Use the interior camera line verbatim — it is doing more work than it looks like — and then
push harder than is comfortable:

```
CAMERA: … The back wall is parallel to the picture plane … Flat, and deliberately without deep
perspective recession — the room is shallow and its back wall is close to the viewer, and the side
walls are barely visible.
```

Add to the negative: `one point perspective, vanishing point, wide angle interior, fisheye, room
tour, real estate photograph, architectural render`.

**A flat interior reads as period draughtsmanship. A nearly-correct one reads as a mistake. The style
must look chosen.** If it feels too flat to you, it is probably right.

---

### T-8 · Fog, snow or water has been painted instead of reserved.

**Symptom.** White or grey paint where the plate specified bare paper. The plate may look good and it
cannot be used: `L0` has no reserve, the paper overlay has nothing to come through, and Act 3's
central visual claim — that fog is the part of the past we do not have — is gone.

**Cause.** "Fog" and "snow" are painted effects in essentially all training data.

**Fix — stop using the noun as a thing and describe it as an absence:**

```
… the fog is not painted: it is the bare paper of the sheet showing through, and the drawing simply
stops where the fog begins. Nothing beyond it is drawn at all.
```

Same construction for snow (`the snow is untouched bare paper, its form given only by the drawn line
and by the shadows laid across it`) and for water (`the water is untouched bare paper, separated from
the sky only by the thinnest ruled line of the far shore`).

Add to the negative: `white fog, painted mist, volumetric fog, god rays, cinematic haze, painted
snow, snow texture, water reflections, rippled water`.

**This is worth being stubborn about.** Three of the game's best plates — `BK-01`, `BK-02`, `DL-02` —
are more than half reserved paper, and a painted version of any of them is a different game.

---

### T-9 · The crowd is uniform, white, and wearing the wrong century.

**Symptom.** A perfectly matched line of identical soldiers, all white, in Napoleonic shakos or Civil
War kepis.

**Cause.** Three separate priors compounding: models regularise crowds (F-11), Black soldiers are
underrepresented in the training data (F-20), and 1800–15 and 1861–65 are vastly better represented
than 1775–83 (F-01, F-06).

**Fix, and it is mostly structural.** **Almost no environment plate should contain figures at all.**
Every person the player can name, target or hear is a billboard cutout generated from a stance sheet
(Part 2 of this guide), and every crowd is a six-figure crowd sheet. That removes this failure from
26 of the 27 masters outright.

Where a plate does carry painted mass — `VF-03′`, `TR-01′`, `YT-03` — apply §3.4: it is **one form,
not many figures**, and the prompt says so:

```
… drawn as one continuous silhouetted form with a broken line of hats along its upper edge;
individual men are not separable, and no faces and no detail of dress are drawn.
```

Where individuals genuinely appear at `L1` distance, the correctives are:

```
… no two men dressed alike; one in four out of regulation; mixed coats, hunting shirts, waistcoats
worn as outer garments and shirtsleeves in the same file; different hats; visible patching and
mismatched buttons; an integrated file with Black soldiers serving alongside white soldiers in the
same rank.
```

plus `1770s cut: full-skirted knee-length coats with turned-back cuffs, low collars, three-cornered
cocked hats with low crowns, knee breeches` and the negative `shako, tailcoat, high collar, kepi,
forage cap, sack coat, uniform ranks, identical soldiers, toy soldiers`.

**Review question:** could de Verger's four soldiers all fit in this crowd? If not, reject.

---

### T-10 · The plate cannot be sliced.

**Symptom.** You reach step 7 and discover that the cart's wheel is on `L3` and its shaft is on `L2`;
or the walk-plane passes behind a tent and then in front of it; or there is no foreground occluder at
all and `L4` would ship empty.

**Cause.** The blockout did not resolve the layer boundaries, or the model was allowed to interpolate
across one.

**THIS IS NOT A PROMPT FIX EITHER**, and it is the most expensive failure on this list because you
find it ninety minutes downstream. **Go back to the blockout, redraw the boundary, regenerate at the
same seed.** ControlNet at depth 0.55 will honour a corrected gap.

The prompt does have one useful lever, used in the composition slot **after** the blockout is right:

```
… there is clear open ground between the objects in the foreground and the objects in the middle
distance, and nothing stands across that gap.
```

**And the three prevention rules, which cost nothing at blockout time:**
- Draw the gap. Layers are separated by *space*, not by a line.
- Put the `L4` element in the blockout as a solid black shape before you generate anything.
- Trace the walk-plane polyline across the blockout and check every layer boundary it crosses. It
  should cross none.

---

### Two more you will hit, which are act-local rather than general

**Sleet as painted dots (Act 4).** Every generation will try. The corrective is in all five Act 4
palette slots and it is worth restating because it is a real period technique and it is the act's
signature mark: `sleet is drawn as fine white lines scratched through the dried wash with a knife
point, all running in one consistent diagonal, never as painted white dots or specks`. Negative:
`snowfall dots, snow specks, particles, bokeh snow, blizzard`. If the model will not do it, **do it
by hand in Krita in four minutes** — a scratched line is a straight white stroke and it is faster to
draw than to argue about.

**The finished Mount Vernon (Acts 1 and 8).** Every photograph the model has seen is the 1787 house.
Reject on the roofline before you look at anything else, and reject rather than repair: a plate that
grew a cupola has usually got the massing wrong underneath as well. Budget eight candidate batches
for `MV-01`, not one. It is the highest-risk single asset in the project and it is also the first
thing the student sees.

---

# Appendix A — The paste card

Pin this above the machine.

```
1.  wshwash,                       ← always first
2.  {scene body from §4}           ← subject · camera · light · palette · technical
3.  {STYLE ANCHOR §1.1}            ← verbatim, appended last, never edited
4.  {NEG-BASE §1.2 + additions}    ← into the negative field

MAP SHEETS:    wshmap,  + body + MAP ANCHOR §1.4  + map negative
GILT FRAMES:   wshwash, + body + GILT ANCHOR §1.5 + gilt negative (NOT NEG-BASE)
WITNESS (MV-03 only): body + WITNESS BLOCK §1.6 + anchor + negative

Frozen:  euler · simple · 28 steps · guidance 3.2 · wash-v1 @ 0.85 (wash-map-v1 @ 0.90)
Size:    1536×864 dioramas / 2048×2048 maps
Control: blockout → depth 0.55 + lineart 0.35
Seeds:   act×10000 + scene×100   (+50 = state variant, +60 = apex mood, +900 = Gilt Frame)

Plate wrong?   → fix the BLOCKOUT and regenerate at the same seed.
Style wrong?   → you edited the anchor. Put it back.
Angle wanted?  → there is no second angle. Cut or rewrite the scene.
```

# Appendix B — The plate register

Every environment generation in the game, with its seed base and shipping filename stem. This is the
table the ledger is checked against.

| # | Scene | Plate | File stem | Reg | Framing | Seed |
|---|---|---|---|---|---|---|
| 1 | `A1-S1` | `MV-01` | `a01_s01_bg_the-approach` | R1 | ext | 10100 |
| 2 | `A1-S2` | `MV-02` | `a01_s02_bg_the-study` | R1 | int | 10200 |
| 3 | `A1-S3` | `MV-03` | `a01_s03_bg_the-quarter` | **R5** | eye | 10300 |
| 4 | `A1-S4` | `MV-04` | `a01_s04_bg_the-dock` | R1 | ext | 10400 |
| 5 | `A8-S3` | `MV-04′` | `a01_s04_bg_the-dock_s-1783` | R1 | ext | 10450 · i2i 0.34 |
| 6 | — | GF1 | `a01_xx_gf_cincinnatus` | **R6** | — | 10900 |
| 7 | `A2-S1` | `CB-01` | `a02_s01_bg_camp-street` | R1 | ext | 20100 |
| 8 | `A2-S2` | `CB-02` | `a02_s02_bg_hq-parlour` | R1 | int | 20200 |
| 9 | `A2-S3` | `CB-03` | `a02_s03_bg_the-lines` | R1 | ext | 20300 |
| 10 | `A2-S5` | `CB-03′` | `a02_s03_bg_the-lines_s-newyear` | R1 | ext | 20350 · i2i 0.34 |
| 11 | `A2-S4` | `MT-01` | `a02_s04_mp_knox-route` | **R2** | plan | 20400 |
| 12 | — | GF2 | `a02_xx_gf_cambridge-elm` | **R6** | — | 20900 |
| 13 | `A3-S1` | `BK-01` | `a03_s01_bg_the-parapet` | R1 | ext | 30100 |
| 14 | `A3-S2` | `MT-02` | `a03_s02_mp_east-river` | **R2** | plan | 30200 |
| 15 | `A3-S3` | `BK-03` | `a03_s03_bg_four-chimneys` | R1 | int | 30300 |
| 16 | `A3-S4` | `BK-02` | `a03_s04_bg_ferry-landing` | R1 | int-cam | 30400 |
| 17 | — | GF3 | `a03_xx_gf_hale-martyrdom` | **R6** | — | 30900 |
| 18 | `A4-S1` | `DL-03` | `a04_s01_bg_ferry-camp` | R1 | ext | 40100 |
| 19 | `A4-S2` | `MT-03` | `a04_s02_mp_order-of-march` | **R2** | plan | 40200 |
| 20 | `A4-S3` | `DL-01` | `a04_s03_bg_embarkation` | R1 | int-cam | 40300 |
| 21 | `A4-S4` | `DL-02` | `a04_s04_bg_the-ice` | R1 | ext | 40400 |
| 22 | `A4-S5` | `TR-01` | `a04_s05_bg_king-street` | R1 | ext | 40500 |
| 23 | `A4-S6` | `TR-01′` | `a04_s05_bg_king-street_s-after` | R1 | ext | 40550 · i2i 0.30 |
| 24 | — | GF4 | `a04_xx_gf_leutze-crossing` | **R6** | — | 40900 |
| 25 | `A5-S1` | `VF-01` | `a05_s01_bg_brigade-street` | R1 | ext | 50100 |
| 26 | `A5-S7` | `VF-01′` | `a05_s01_bg_brigade-street_s-may` | R1 | ext | 50150 · i2i 0.36 |
| 27 | `A5-S2` | `VF-02` | `a05_s02_bg_potts-house` | R1 | int | 50200 |
| 28 | `A5-S3` | `VF-04` | `a05_s03_bg_hospital-hut` | R1† | eye | 50300 |
| 29 | `A5-S4` | `MT-04` | `a05_s04_mp_northern-dept` | **R2** | plan | 50400 |
| 30 | `A5-S5` | `VF-03` | `a05_s05_bg_grand-parade` | R1 | ext | 50500 |
| 31 | `A5-S6` | `VF-03′` | `a05_s05_bg_grand-parade_s-drill` | R1 | ext | 50550 · i2i 0.32 |
| 32 | — | GF5 | `a05_xx_gf_valley-forge-prayer` | **R6** | — | 50900 |
| 33 | `A6-S1` | `YT-04` | `a06_s01_bg_the-marquee` | R1 | int | 60100 |
| 34 | `A6-S2` | `MT-05` | `a06_s02_mp_chesapeake` | **R2** | plan | 60200 |
| 35 | `A6-S3` | `YT-01` | `a06_s03_bg_second-parallel` | R1 | ext | 60300 |
| 36 | `A6-S4` | `YT-02` | `a06_s04_bg_redoubt-ten` | R1 | int-cam | 60400 |
| 37 | `A6-S5` | `YT-03` | `a06_s05_bg_surrender-road` | R1 | axial | 60500 |
| 38 | — | GF6 | `a06_xx_gf_cornwallis-surrender` | **R6** | — | 60900 |
| 39 | `A7-S1` | `NB-01` | `a07_s01_bg_seven-doors` | R1 | int | 70100 |
| 40 | `A7-S2` | `NW-02` | `a07_s02_bg_cantonment` | R1 | ext | 70200 |
| 41 | `A7-S3` | `MT-06` | `a07_s03_mp_bounty-lands` | **R2** | plan | 70300 |
| 42 | `A7-S4` | `NW-01` | `a07_s04_bg_the-temple` | R1 | int | 70400 |
| — | `A7-S5` | `NB-01′` | — **prop toggle, no asset** | — | — | — |
| 43 | — | GF7 | `a07_xx_gf_newburgh-address` | **R6** | — | 70900 |
| 44 | `A8-S1` | `AN-02` | `a08_s01_bg_the-corridor` | R1 | int | 80100 |
| 45 | `A8-S2` | `AN-01` | `a08_s02_bg_the-chamber` | R1 | int-sym | 80200 |
| 46 | — | GF8 | `a08_xx_gf_resignation` | **R6** | — | 80900 |
| 47 | `I1`–`I7` | interlude | `gl_xx_bg_writing-desk` | R1 | int | 99000 |

† `R1` with the Witness Register's camera and atmosphere restraint, keeping the earth wash.
**`sensitive: true`:** #3 (`MV-03`) and #28 (`VF-04`). Neither ships without the §7.6 written gate.

**Derived shipping counts:** 27 masters × 5 = **135 layers**; 5 state variants = **9 layers**
(`CB-03′` L2; `TR-01′` L2+L3; `VF-03′` L2; `VF-01′` L2+L3; `MV-04′` L1+L2, plus one re-cut `L3`);
7 apex `L2` plates; 6 map sheets; 8 Gilt Frames; 1 interlude × 5 layers; 12 traced overlays.

# Appendix C — Acceptance gate for an environment plate

Run in this order. The cheap checks come first, and the two-minute checks are placed before the
ninety-minute step on purpose.

**Automated, before anything else (2 min):**
- [ ] Bare-paper ratio in band: R1 ext **35–55%** · R1 int **25–40%** · R2 **55–75%** · R6 **0–3%**
- [ ] One contiguous bare region ≥ **12%** of frame
- [ ] No pixel darker than `INK-FLOOR #241C14` (R6 clamps to `#16110D` instead)
- [ ] No pure `#000000`, no pure `#FFFFFF`
- [ ] Resolution and aspect correct for class

**Human, 60 seconds:**
- [ ] Washington silhouette composited: near **210–230 px**, far **125–140 px** in a 900 px frame
- [ ] Horizon at `y = 0.34` (exteriors); walk-plane band `0.56–0.78`; `L4` band 15–25% of height
- [ ] All three edge types present; at least one major form has a **lost** edge, and the line does
      not follow it there
- [ ] One focal object, on a third, where the darkest ink meets a meaning colour — or, in plates with
      no meaning colour, carried by ink weight alone and **not** by invented saturation
- [ ] ≤ 2 Group D colours above 5% of frame (`YT-03` excepted, which is permitted three)
- [ ] Zoomed to 200%: **no legible text anywhere**
- [ ] The act's light law is obeyed and the shadows fall the right way
- [ ] Generated at the act **ceiling**, not its floor (§6.3) — the plate is the good day
- [ ] Layers slice cleanly against the blockout; nothing straddles a boundary
- [ ] Three-second test passed by someone who has not read the script: indoors or out? season and
      weather? where does the person walk? which figure is Washington? (the fourth is answered with
      the cutout composited in)

**Gated:**
- [ ] `hist_check` verdict recorded in the ledger
- [ ] `sensitive: true` assets carry the written §7.6 sign-off **before slicing**

# Appendix D — Where the numbers came from

| Number in this document | Source |
|---|---|
| bare paper 35–55% ext / 25–40% int / 55–75% map / 0–3% Gilt | `02-art-direction.md` §4.2 |
| one contiguous bare region ≥ 12% | `02-art-direction.md` §4.2 |
| horizon `y = 0.34`, walk-plane 0.56–0.78, `L4` 15–25% | `02-art-direction.md` §5.1 |
| near 210–230 px / far 125–140 px | `04-scene-architecture.md` §3.1 |
| camera 4–5 m, pitch 20°, interior 1.5–1.7 m, pitch 3° | `04-scene-architecture.md` §3.3 |
| the two camera prompt lines, verbatim | `04-scene-architecture.md` §3.1, §3.2 |
| five layers, Z, parallax coefficients | `04-scene-architecture.md` §1.2.1 |
| `L4` at 15% bleed, offset clamp ±96 px | `06-technical-architecture.md` §2.3 |
| `L0` at 1024×576, band-trimmed `L1`/`L3`/`L4` | `05-act-scene-inventory.md` §13.3 |
| nine mood uniforms and their end values | `02-art-direction.md` §3.4 |
| `actFloor` / `actCeil` per act | `02-art-direction.md` §3.2, act order corrected per `05` §0.1 |
| palette hexes and the Group A–E rules | `02-art-direction.md` §2, Appendix B |
| the eight light laws | `ai-art-production-guide.md` §5.5, corrected per `05` §0.1 and E-2 |
| generation sizes, formats, seed families, ledger | `ai-art-production-guide.md` §2.4, §6.2, §6.3, §6.6 |
| denoise 0.28–0.38 for variants, ≤0.45 before architecture moves | `ai-art-production-guide.md` §5.3 |
| 27 plates, 6 maps, 5 variants, 8 Gilt Frames, 7 interludes | `05-act-scene-inventory.md` §13.1, §13.2 |
| every building, uniform, boat, flag and date | `historical-visual-reference.md` §§1, 3, 4 |
| the Witness Register's five parameters and its review gate | `historical-visual-reference.md` §7.2, §7.6 |
| F-01 … F-24 correctives quoted in §7 | `historical-visual-reference.md` §6 |

---

**Part 2 — Characters, Portraits and Props** owns everything this document deliberately keeps out of
the plates: the Washington aging matrix, the stance sheets, the crowd sheets, the hands library, the
prop sheets and the blank document papers. Nothing in that document may change the master style
anchor. If it needs to, it is wrong and this document is the one that holds.
