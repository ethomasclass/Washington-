# AI Image Generation Craft Guide
### "In Washington's Shoes" — production substrate for the ink-and-wash art set
**Version 1.0 — 14 August 2026**
**Owner:** Art Lead. **Audience:** anyone who generates, approves, or ships an image asset.

---

## 0. TL;DR for the impatient

**Primary pipeline:** train a project-owned style LoRA (`wash-v1`) on **public-domain 18th-century pen-and-wash artwork**, apply it to **FLUX.2 [klein-4B]** (Apache 2.0), and produce every asset locally in **ComfyUI** with ControlNet composition locking and hard seed discipline. Burst capacity and LoRA training on **fal.ai** (~$2–6 per training run).

**Fallback / hero-repair pipeline:** **Nano Banana Pro (`gemini-3-pro-image`)** via API for multi-reference character work and difficult single assets, colour-matched back to the LoRA look in post. **Midjourney V8.1** for art direction and style exploration only — its outputs never enter the LoRA training set and never ship.

**Single biggest risk:** *vendor model retirement mid-production*. Google's Imagen 4 endpoints hard-shutdown on **17 August 2026 — three days from this writing** — and Midjourney has no official API at all. If this project's canonical style lives inside a hosted vendor's `--sref` code or a model version ID, the art set becomes unfinishable and unpatchable the moment that vendor deprecates. Owning the weights and the LoRA is not an aesthetic preference; it is the continuity plan for a game a school district will still be running in 2030.

**Asset count this document is scoped to:** ~200 shipped finals, from an expected 2,500–4,000 generations (keep ratio ~15:1). See §6.2 for the full manifest.

---

# 1. Tool landscape, August 2026

The market has bifurcated. Hosted frontier models (GPT Image 2, Nano Banana Pro, Seedream 5) win on prompt comprehension and one-shot quality. Open-weight models (FLUX.2 klein, Qwen-Image, SD 3.5) win on control, reproducibility, cost at volume, and the ability to be *fine-tuned on a style you own*. This project needs the second thing far more than the first.

### 1.1 The table

| Tool | Style ref | Char ref | img2img | Inpaint | Alpha out | Trainable | API | Cost | Verdict here |
|---|---|---|---|---|---|---|---|---|---|
| **FLUX.2 [klein-4B]** | LoRA + up to 10 img refs | Multi-ref (2–10) | Yes | Yes | No (key it) | **Yes, Apache 2.0** | Self-host / fal / BFL | Free self-host; ~$0.014/img hosted | **PRIMARY** |
| **FLUX.2 [pro]** | Multi-ref | Multi-ref | Yes | Yes (Kontext edit) | No | No | BFL API | $0.03/MP gen, $0.045/MP edit | Hero plates |
| **FLUX.2 [dev 32B]** | LoRA + multi-ref | Multi-ref | Yes | Yes | No | Yes | Local only | Non-commercial licence; $999/mo commercial | Avoid — licence ambiguity |
| **Nano Banana Pro** (`gemini-3-pro-image`) | Ref images | **Up to 14 refs, 5 subjects** | Yes | Yes (conversational) | No | No | Gemini API | ~$0.134/img @1–2K, ~$0.24 @4K | **FALLBACK** |
| **Gemini 3.1 Flash Image** | Ref images | Yes | Yes | Yes | No | No | Gemini API | ~$0.02–0.04/img | Bulk drafts |
| **GPT Image 2** | Weak (prompt-only) | Weak | Yes | Yes (mask) | **No — errors on `transparent`** | No | OpenAI API | ~$0.005–0.21/img by tier | Not for this project |
| **GPT Image 1.5** | Weak | Weak | Yes | Yes (mask) | **Yes** | No | OpenAI API | ~$0.02–0.19/img | Only if you want native alpha |
| **Midjourney V8.1** | `--sref`, moodboards | `--cref`, `--oref` + `--ow` | Yes | Yes (Editor) | Partial (edit-region PNG) | No | **No official API** | $10–120/mo | **Art direction only** |
| **Ideogram 4** | Style codes | Weak | Yes | Yes | No | No | Yes | $0.03–0.09/img | Not needed (we render all type in-engine) |
| **Recraft V4.1** | 100+ styles + custom style upload | Weak | Yes | Yes | **Yes, clean** | Style-from-images | Yes | $0.04 raster / $0.08 SVG | UI iconography only |
| **Seedream 5.0** | Ref images | Yes | Yes | Yes | No | No | ByteDance / aggregators | ~$0.03–0.05/img | Strong but no reason to add a 4th vendor |
| **Qwen-Image (20B)** | LoRA | LoRA | Yes | Yes (edit model) | No | **Yes, Apache 2.0** | Self-host / fal | Free self-host; $0.02/MP fal | Best backup open model |
| **SD 3.5 / SDXL** | LoRA, IP-Adapter | LoRA, IP-Adapter | Yes | Yes | No | Yes | Self-host | Free | Deepest ControlNet ecosystem; keep SDXL for ControlNet passes |

### 1.2 Notes that matter

**FLUX.2 [klein-4B] is Apache 2.0.** This is the only genuinely unrestricted checkpoint in the FLUX.2 family — klein-9B and the 32B dev checkpoint both ship under the FLUX Non-Commercial Licence, which creates a question you do not want to answer to a school district's counsel. Klein-4B: no licence fee, no revenue threshold, no ToS review, runs on a 12 GB consumer GPU, LoRA-trainable in 1–3 hours locally or ~5–8 minutes on fal. You can commit the checkpoint hash to the repo and regenerate any asset in 2031.

**Nano Banana Pro is the best character-consistency tool that exists right now** — 14 reference images, identity preservation across 5 subjects, 2–5s generation. It is also $0.134/image, closed, and Google-versioned. Use it precisely where it wins (see §3.4) and nowhere else.

**GPT Image 2 does not support transparent output.** Requests with `background: "transparent"` return an error; the capability was in `gpt-image-1.5` and did not carry forward. This alone disqualifies it from the cutout pipeline, and its house style (crisp, high-contrast, slightly plastic) fights ink-and-wash anyway.

**Midjourney still has no official API** as of August 2026 — every "Midjourney API" is an unofficial Discord wrapper that can break without notice and is a ToS grey zone. Combined with the fact that Midjourney's terms prohibit using the Service to develop competing products (which a reasonable lawyer reads as covering training a model on its outputs), Midjourney cannot sit anywhere in an automated production pipeline. It is a *taste instrument*. Use it on the Standard plan ($30/mo, unlimited relaxed) for two months of art direction, then cancel.

**Imagen 4 is dead.** `imagen-4.0-generate-001` and siblings hard-shutdown 17 August 2026. Do not build on it. This is the concrete instance of the risk in §0.

### 1.3 PRIMARY RECOMMENDATION

**Generate everything on FLUX.2 [klein-4B] + a project-trained style LoRA, in ComfyUI, locally, with fal.ai for training and burst.**

Five reasons, in priority order:

1. **A trained LoRA is the only technique that holds a bespoke style across 200 assets.** Style-reference parameters (`--sref`, reference images) drift as prompts diverge — they are a nudge, not a constraint. A LoRA moves the model's weights toward your style, so the style survives prompts you haven't written yet. Everything in §2 depends on this.
2. **We can train it on public-domain 18th-century art.** The target style — pen-and-wash field sketch, tinted military survey map, copperplate engraving — is one of the best-documented public-domain corpora in existence (§2.2). That makes the LoRA legally clean, historically accurate *by construction*, and provenance-documentable in a way no prompt-only pipeline can match. This is the single strongest idea in this document.
3. **Seamless tiling is impossible on hosted APIs.** The project needs tiling paper, parchment, canvas, and map-linen textures. Only a local sampler with circular padding produces genuinely seamless output. This requirement alone forces a local track.
4. **Fixed-camera dioramas need composition locking, not prompt luck.** ComfyUI + ControlNet (depth/lineart/scribble from a hand-drawn blockout) lets the Art Lead *draw* the composition and let the model paint it. For 40 hand-composed dioramas with a defined walk-plane, this is the difference between art direction and gambling.
5. **Cost and continuity.** ~3,500 generations at $0.03–0.13 each is $100–450 on a hosted API, plus the risk that the model version changes underneath you mid-project. Local is $0 marginal and frozen.

**FALLBACK:** **Nano Banana Pro** (`gemini-3-pro-image`) for the ~30 assets where multi-reference character identity is doing the heavy lifting and the LoRA is fighting you — principally the Washington portrait matrix (§3.4) and any NPC that appears in more than three scenes. Post-process every NBP output back through a low-denoise img2img pass with `wash-v1` at 0.22–0.30 to re-seat it in the house style. If Google deprecates it, swap in **Qwen-Image + a second LoRA** with no change to the rest of the pipeline.

**Hardware floor for the local track:** one machine with ≥16 GB VRAM (RTX 4080 / 4090 / 5070 Ti or better). Klein-4B at 1536×864 with LoRA + ControlNet runs ~4–7 s/image on a 4090. If no such machine exists, run the identical ComfyUI graph on fal.ai serverless — the graph, LoRA, and seeds are portable, which is the whole point.

---

# 2. The consistency problem

This is the heart of the document. Style consistency across 200 assets is not achieved by writing good prompts. It is achieved by **removing degrees of freedom from the system**, layer by layer, until the only thing a prompt controls is *subject matter*.

There are five layers of lock, weakest to strongest. Use all five.

| Layer | Mechanism | Holds style across | Effort |
|---|---|---|---|
| 1 | Locked master prompt fragment | ~10 assets before drift | Minutes |
| 2 | Style reference image / `--sref` | ~25 assets | Hours |
| 3 | Seed + sampler discipline | Variants of one asset | Free |
| 4 | **Trained style LoRA** | **Unlimited, this project's answer** | 1–2 days |
| 5 | In-engine colour grade | Everything, after the fact | 1 day |

### 2.1 Layer 1 — the locked master prompt fragment

Every generation in the project carries an identical, byte-for-byte **style block**. It is stored once, in `art/prompts/style-block.txt`, and injected by the pipeline script. Nobody retypes it. Nobody "improves" it without a version bump and a re-bake of affected assets.

**`art/prompts/style-block.txt` — v1**

```
STYLE: eighteenth-century pen-and-wash field study. Confident dark brown iron-gall
ink line drawn with a quill over faint graphite underdrawing; the line carries all
structure. Transparent watercolour wash laid in three values only — pale, mid,
and a single dark accent — applied wet on dry with visible hard edges where the
wash pooled. Limited earth palette: bistre, raw umber, Prussian blue, indigo,
yellow ochre, faded vermilion. Large areas of untouched warm laid paper left bare.
Paper is cream-white handmade rag with visible chain lines and a soft deckle
feel. Restrained, unsaturated, atmospheric. Aged but not damaged: no foxing,
no tears, no burn marks.
RENDERING: no digital gradients, no airbrush, no glow, no bloom, no rim light,
no lens flare, no depth-of-field blur, no photographic texture, no oil impasto,
no visible canvas weave, no pixel art, no cel shading, no thick black outlines.
NEGATIVE: text, lettering, handwriting, script, calligraphy, signature, caption,
label, watermark, numbers, cartouche text, book spine text, map legend text,
banner text, modern clothing, zipper, wristwatch, eyeglasses with wire frames,
Napoleonic shako, kepi, Victorian frock coat, fifty-star flag, plastic, neon,
anime, 3d render, cgi, photorealistic, hdr, oversaturated
```

Rules:
- The style block is **appended**, never interleaved. Subject first, style block last.
- The NEGATIVE section is not optional and not editable per-asset. If an asset needs something on the negative list, that asset is wrong.
- Version bumps are `style-block-v2.txt` etc., never in-place edits. The ledger records which version produced each asset.

Layer 1 alone gets you maybe ten consistent images. It is table stakes, not a solution.

### 2.2 Layer 2 — build the style corpus (and why it's public domain)

Before training anything, assemble a curated corpus of **real 18th-century pen-and-wash work**. Do not use AI-generated images as training data: it bakes in the model's existing biases, compounds artefacts, and — in Midjourney's case — is a plausible ToS violation.

**Sources, all free and openly licensed:**

| Source | Licence | What to take |
|---|---|---|
| Yale Center for British Art, Online Collection | Public domain / CC0 | The core of the corpus — the largest holding of British pen-and-wash and tinted landscape drawing anywhere. Sandby, Cozens, Towne, Rooker. |
| The Met, Open Access | CC0 | Drawings & Prints department; American and British 18th-c. works on paper |
| Library of Congress, Prints & Photographs | No known restrictions (verify per-item) | Revolutionary-War-era maps, plans, engravings, the Rochambeau map collection |
| NYPL Digital Collections | Public domain flag | American topographical views, city plans |
| Anne S.K. Brown Military Collection, Brown University | Open access | **Uniform and military-figure reference — the accuracy backbone (§5.4)** |
| Rijksmuseum Rijksstudio | CC0 | Ink-and-wash technique breadth, high-resolution scans |

**Curation spec — this matters more than the count:**
- **Target 40–60 images for training.** Not 500. A tight, coherent set trains a tighter style. Over-large sets average toward mush.
- Every image must exhibit *all three* of: visible ink line, transparent wash in ≤3 values, significant bare paper.
- **Reject** anything with: legible text, heavy foxing/damage, a dominant human face (that biases the LoRA toward portraiture), oil or gouache opacity, or 19th-century colour habits.
- Aim for a subject spread of roughly 40% landscape/topography, 20% architecture, 20% figures at middle distance, 10% maps/plans, 10% still life/objects. This teaches the style, not a subject.
- Crop out mounts, mats, colour bars, and museum rulers. Normalise to ~1024–1536 px on the long edge. Strip EXIF.
- Store originals in `art/corpus/source/` with a `corpus-manifest.csv` recording: `corpus_id, institution, accession_no, title, artist, date, licence, source_url, retrieved_at`. This file is the provenance record referenced in §7.

**Captioning:** auto-caption with a VLM, then hand-edit. Captions should describe *subject*, never style — the style is what the trigger token is learning. Every caption begins with the trigger:

```
wshwash, a river landscape with a low wooden bridge and two figures on the near bank
wshwash, an artillery park seen from slightly above, tents behind, bare foreground
```

Trigger token: **`wshwash`** — a nonsense string with no prior meaning in the tokeniser. Do not use "watercolor" or "18th century" as a trigger; those tokens already carry meaning and will fight you.

### 2.3 Layer 3 — train `wash-v1`

**Recipe (fal.ai `flux-lora-fast-training` or local AI-Toolkit against FLUX.2-klein-4B-base):**

```
base model:      FLUX.2-klein-4B-base   (undistilled — required for training)
images:          48
resolution:      1024 (bucketed 768–1280)
steps:           1600
learning rate:   1e-4 (constant, 100-step warmup)
network dim:     32
network alpha:   16
trigger:         wshwash
caption dropout: 0.05
```

Cost: ~$3–4 per run on fal at $0.002/step. Budget **6 runs** ($20–25) to converge; you will not get it on the first try.

**Evaluation gate — the "seven plates" test.** After every training run, generate the same seven prompts at fixed seeds `[11, 22, 33]` and lay them out as a 7×3 contact sheet:

1. `wshwash, a muddy army camp of white canvas tents on a hillside, seen from slightly above`
2. `wshwash, the interior of a plain wooden meeting hall with tall windows, frontal view`
3. `wshwash, a standing man in a dark blue military coat, three-quarter view, middle distance`
4. `wshwash, a head and shoulders study of an older man, plain background`
5. `wshwash, a river with drifting ice at night, bare trees on the far bank`
6. `wshwash, a surveyor's plan of a fortified town with contour hachures`
7. `wshwash, a folded letter, a brass spyglass and an inkwell on a plain table`

Accept the LoRA when: (a) all 21 images read as one hand; (b) plates 1, 2 and 5 show bare paper, not filled-edge-to-edge rendering; (c) plate 4 does not collapse into generic portrait-model face; (d) no plate contains legible text. If (d) fails, the corpus still has text in it — go back and re-crop.

Ship `wash-v1.safetensors` into `art/models/` **committed via Git LFS**, alongside `wash-v1.trainconfig.json` and the corpus manifest. This file is the project's art style. Treat it like source code.

**Also train `wash-map-v1`** — a second, smaller LoRA (24 images, 1000 steps) trained only on 18th-c. survey maps, plans and hachured topography, for the map-table scenes in decision #5. Trigger `wshmap`. Maps have a genuinely different mark language (ruled lines, stipple, hachure) and dragging them out of the main style LoRA degrades both.

### 2.4 Layer 4 — seed discipline

**Rules, enforced by the pipeline script, not by discipline:**

- Every generation records its seed. No `-1`/random in production graphs; the script draws from a counter and logs it.
- **Seed families.** Each scene owns a seed base = `act*10000 + scene*100`. Act 4, scene 2 → base 40200. Layer variants of that scene use 40200, 40201, 40202… Time-of-day variants use base+50. This makes the ledger navigable by eye and makes "regenerate the mid layer of the Delaware camp" a one-line operation.
- **Never change two variables at once.** Prompt change → hold seed. Seed sweep → hold prompt byte-for-byte.
- Sampler, steps, guidance and scheduler are **frozen project-wide** and live in the ComfyUI graph, not in anyone's head:
  ```
  sampler: euler        scheduler: simple
  steps: 28             guidance: 3.2
  lora strength: 0.85   (0.70 for portraits, 0.95 for textures)
  ```
  Changing any of these requires a version bump on the graph file and a note in the ledger.

### 2.5 Layer 5 — generate SHEETS, not assets

The highest-leverage habit in the whole pipeline. **Anything that must be consistent with something else gets generated in the same image.**

- **Prop sheets.** One 1536×1536 generation containing 9 objects in a 3×3 grid on plain paper — inkwell, spyglass, tricorn, powder horn, ration tin, camp lantern, folded letter, drum, boot. All nine share lighting, palette, ink weight, and paper. Cut them apart in post. Nine consistent props for one generation instead of nine drifting ones.
  ```
  wshwash, a page from a sketchbook: nine separate small studies of objects arranged
  in a neat three by three grid on bare cream paper, each object isolated with clear
  space around it, no overlapping — an inkwell, a brass spyglass, a tricorn hat, a
  powder horn, a ration tin, a camp lantern, a folded letter, a side drum, a riding
  boot. Even flat light. [STYLE BLOCK]
  ```
- **Expression sheets.** One portrait generation containing the same face at 4 expressions (§3.3).
- **Crowd sheets.** Six background soldiers in one generation → six billboards that match.
- **Palette plates.** One generation per act establishing that act's colour temperature, used as an img2img reference for every scene in the act.

Rule of thumb: **if two assets appear on screen at the same time, they should have been born in the same image.**

### 2.6 The recommended production workflow, step by step

This is the actual order of operations. Steps 1–4 happen once. Steps 5–11 repeat per asset.

**PHASE A — establish the style (once, ~2 weeks)**

1. **Art direction in Midjourney V8.1.** Standard plan. Explore with `--sref` and moodboards until the Art Lead can point at 20 images and say "that." Output: a `art/direction/` folder of pinned references and a one-page written style statement. *These images never ship and never train anything.* They exist to align humans.
2. **Assemble the PD corpus** (§2.2). 300–600 candidates → curate to 48. Fill `corpus-manifest.csv`.
3. **Train `wash-v1`** (§2.3). Iterate to the seven-plates gate. Then train `wash-map-v1`.
4. **Freeze the ComfyUI graph.** `art/graphs/wash-prod-v1.json`. Commit. This graph is: FLUX.2-klein-4B → `wash-v1` LoRA → ControlNet (depth + lineart, both optional-bypass) → sampler → 2× latent-free upscale bypass → save with embedded metadata.

**PHASE B — per-asset production (repeat ~200×)**

5. **Blockout.** The Art Lead draws the composition — 5 minutes, grey shapes, in Krita or on paper photographed. It defines the walk-plane, the exits, the depth-layer boundaries and where the characters can stand. **This step is non-negotiable for dioramas.** It is also the human authorship that matters legally (§7.2).
6. **Generate at 1536×864** with the blockout driving ControlNet (depth weight 0.55, lineart weight 0.35). 8 candidates, seeds from the scene's seed family.
7. **Select 1.** If none work, adjust the blockout, not the prompt. Prompt churn is how style drifts.
8. **Repair.** Inpaint local failures with the same graph at denoise 0.45, masked. If a face or hands fail badly, escalate to Nano Banana Pro with the plate as reference, then re-seat with a 0.25 img2img pass through `wash-v1`.
9. **Upscale to 2304×1296.** Topaz Gigapixel, "Art & CG" model, 1.5×. Not Magnific — it invents brushwork that breaks the style (§6.4).
10. **Slice into depth layers** in Photoshop/Krita: `L0` sky/backdrop, `L1` far, `L2` mid, `L3` near, `L4` foreground occluders. Hand-paint the reveal behind each layer edge — the model cannot know what is behind the tent. Budget 20–40 min/scene of human paint-in. This is real work and it is also the strongest human-authorship evidence in the project.
11. **Log to the ledger** (§6.6), export (§6.3), commit.

**PHASE C — unification (once, at the end of each act)**

12. **In-engine grade.** Every act gets a per-act LUT + fog colour + exposure applied in the Three.js scene. Residual drift between assets — slightly warmer paper here, slightly cooler wash there — is normalised by the renderer, not by regenerating art. This is Layer 5 and it is the cheapest consistency you will ever buy. Do not skip it and do not attempt to fix in the model what a 3-line shader fixes for free.

---

# 3. Character consistency

Style consistency is a solved problem (train a LoRA). Character consistency is *not* solved and anyone who tells you it is has not shipped 50 portraits of the same man.

### 3.1 What actually works vs. what people wish worked

| Technique | Reality in Aug 2026 |
|---|---|
| **Character LoRA** | **Works.** The only method that reliably holds a face across arbitrary poses, framings and lighting. Requires a training set, which is the hard part (§3.2). |
| **Multi-reference (FLUX.2 2–10 refs, NBP up to 14)** | **Works well for close variants.** Same face, new pose/costume/scene: strong. Same face at a different age or in a very different framing: degrades. Best-in-class right now is Nano Banana Pro. |
| **Midjourney `--cref` / `--oref` with `--ow 400–600`** | Good for ~80% of shots. Locks facial geometry, hair, clothing. Fails on profile views and extreme age changes. No API, so unusable in an automated pipeline. |
| **Seed reuse** | Holds a face only if the prompt is nearly identical. Useless across scenes. Wishful thinking. |
| **Locked textual descriptor block** | Necessary but nowhere near sufficient. Gets you "a man of this general type," not "this man." |
| **Inpainting a face from a reference** | **Works, and is the most underrated tool.** Generate the body/pose/scene freely; mask the head; inpaint with the character reference at high strength. Fixes maybe 30% of near-misses. |
| **"Just describe him very precisely"** | Does not work. Never has. Two hundred words of facial description produce two hundred different men. |
| **IP-Adapter FaceID on SDXL** | Still useful as a cheap pre-check, but the identity it transfers is photographic — it fights the painterly style. Not recommended here. |

### 3.2 The Washington problem, and its solution

Washington needs **9 portrait states** (3 war stages × 3 stat bands) plus cutout bodies at 3 war stages. He is on screen more than anything else in the game. He must be recognisably the same man in all of them, and recognisably *Washington*, and must visibly age and harden.

**Do not generate him from scratch. Anchor him to Charles Willson Peale.**

Peale painted Washington from life seven times between 1772 and 1795. Those paintings are public domain and are, conveniently, *exactly* the aging reference this project needs — the 1772 Virginia colonel, the 1779 Princeton commander, the 1787 statesman. Build the character corpus from:

- Peale's Washington portraits (1772, 1776, 1779, 1780, 1783, 1787)
- Peale's miniatures and the Peale family replicas (there are dozens; they are consistent by construction because they are copies of each other — *this is a pre-made character-consistency dataset*)
- Trumbull's Washington studies for cross-angle coverage
- Houdon's 1785 life mask–derived bust for the true 3D head geometry, photographed from multiple angles (Mount Vernon publishes these)

**Train `gw-face-v1`** — a character LoRA, 30 images, 1200 steps, dim 16, trigger `gwface`, on the same FLUX.2-klein-4B base so it composes with `wash-v1`. Run both LoRAs together: `wash-v1` at 0.70, `gw-face-v1` at 0.80.

This solves three problems at once: identity lock, historical accuracy of the likeness, and provenance (the training set is a documented list of PD museum works, listed in `corpus-manifest.csv` — see §7).

### 3.3 The locked descriptor block

Even with a LoRA, every prompt mentioning Washington carries an identical descriptor. Stored in `art/prompts/char-washington.txt`:

```
gwface, George Washington: a tall large-framed man, long oval face, heavy jaw,
wide-set grey-blue eyes deep under a heavy brow, prominent straight nose, thin
firmly-set mouth, pitted complexion, high forehead. Hair worn back, powdered
grey-white, clubbed and tied at the nape with a black silk ribbon — never a wig
curl over the ear, never loose hair. Standing very straight. Reserved,
unsmiling, watchful.
```

Per-stage additions:

```
STAGE 1 (1775–76): mid-forties. Full face, unlined, upright colour. Coat is a new
dark blue regimental coat, buff facings, buff waistcoat and breeches, clean.
STAGE 2 (1777–80): early fifties. Thinner. Lines from nose to mouth. Shadowed
under the eyes. Coat worn, blue faded toward slate at the shoulders, buff gone grey.
STAGE 3 (1781–83): early fifties, harder. Hollow under the cheekbone, jaw set,
eyes narrowed. Hair thinner at the temple. Coat is well kept but old, the cloth
soft and rubbed at the cuff.
```

Stat-band additions (this is the mechanic in decision #7 — it must be a *pose and light* change, not a face change, or the identity breaks):

```
BAND HIGH: chin level, shoulders square, three-quarter turn toward the viewer,
light from the front left and slightly above. Wash is warmer, more ochre.
BAND MID: chin level, body squared to the viewer, flat even light, neutral wash.
BAND LOW: chin fractionally lowered, shoulders dropped, turned slightly away,
light from behind and to the right so the face is in half shadow. Wash is cooler,
more indigo, and greyer.
```

### 3.4 The portrait production recipe

For all 9 Washington portraits:

1. Generate **one canonical master** first: Stage 2 / Band MID, seed 20000. Iterate until the Art Lead signs it off. This image is now the reference for all others.
2. Generate the other 8 as **Nano Banana Pro multi-reference calls**, passing: the canonical master, two Peale source paintings for the target age, and the stage/band descriptor. NBP's identity preservation is the best available and the ~$0.13/image cost is irrelevant at 8 images.
3. Re-seat each output through `wash-v1` img2img at denoise **0.24** to restore the house style NBP will have partly overwritten.
4. Final head-only inpaint pass in ComfyUI at denoise 0.30 if the eyes drift.
5. Lay all 9 out as a 3×3 contact sheet and look at it. **If any one of them reads as a different man, redo it.** The whole mechanic in decision #7 dies if the player can't tell it's the same person.

For the ~20 NPCs: one master portrait each, generated in **pairs** (Lafayette + a French officer in one image; three militia recruits in one image) so their palettes match. Expression variants come from a single 4-up expression sheet:

```
wshwash, four small head-and-shoulders studies of the same man on one sheet of
plain paper, arranged in a row, identical lighting and identical scale, the same
face in each: first neutral, second speaking, third angry, fourth downcast.
[CHAR BLOCK] [STYLE BLOCK]
```

### 3.5 Rules

- **One master per character, generated before anything else.** Everything downstream references it.
- **Never regenerate a signed-off master.** If it needs a change, edit it; don't re-roll it.
- Characters who share a scene are generated in the same image where possible.
- Log every character asset's `refs[]` array in the ledger so the chain back to the master is inspectable.
- **Budget 3× the time for Washington that you budget for anyone else.** He is the game.

---

# 4. Cutout / alpha workflow

Characters are 2D painted cutouts, billboarded, animated as segmented paper puppets (decision #6). That means each character must be generated as a clean, evenly-lit, isolable figure that can be cut into ~11 pieces.

### 4.1 Generate on a chroma plate, not on transparency

No model in this list produces a genuinely clean alpha channel for painterly art with soft wash edges. `gpt-image-1.5` and Recraft will give you *an* alpha, but the matte is hard-edged and eats the wash bleed that makes the style work. **Generate on a flat background and key it.**

Key colour: **flat mid-value warm grey, `#8C8578`.** Not green (contaminates the earth palette and the ink line picks up green fringing), not white (the style has bare white paper *inside* the figure — you'd key holes through him), not black (kills the dark ink line). A mid-value neutral is far enough from every colour in the palette to matte cleanly and close enough in value that the model doesn't blow out the figure's edges.

Prompt suffix, appended after the style block for all character assets:

```
The figure is isolated and complete, standing alone against a completely flat,
even, featureless warm grey background of a single uniform tone. No cast shadow,
no ground line, no horizon, no scenery, no vignette, no framing. Even diffuse
frontal light with no strong directional shadow. Full figure, head to feet, with
clear empty margin on all four sides.
```

### 4.2 The character sheet prompt

Do not generate poses one at a time. Generate a **stance sheet** so every pose shares the same figure.

```
wshwash, a costume study sheet: the same man drawn three times in a row on one
sheet, at identical scale and identical lighting, against a flat uniform warm
grey ground. First: standing squarely facing the viewer, arms hanging relaxed and
slightly away from the body, legs straight and slightly apart, hands open and
clear of the coat. Second: the same man in three-quarter view turned to his left,
same relaxed stance. Third: the same man in profile facing left, same relaxed
stance. Clear space between the three figures, no overlap, no shadow, no ground.
[CHAR BLOCK] [STYLE BLOCK]
```

Three facings is all a fixed-camera game needs (decision #6). The "arms hanging relaxed and slightly away from the body, hands clear of the coat" phrasing is doing real work — it produces limbs that are separable without reconstructing what's underneath. A literal T-pose fights the style badly (18th-century figure drawing has no such convention, and the model will produce something that looks like a scarecrow); this relaxed A-stance is the closest thing that both reads as period drawing and cuts apart cleanly.

Generate at **1536×1024** (the three figures need horizontal room). Each figure ends up ~500×900.

### 4.3 Keying and segmentation

**Tooling: `rembg` with the `birefnet-general` model, run locally.** BiRefNet is MIT-licensed, is the engine behind several commercial removers, handles the soft wash edges and stray ink strokes far better than U2Net, and runs ~17 fps at 1024² on a 4090. Use `-a` (alpha matting) for figures with hats, feathers, or loose hair.

```bash
rembg i -m birefnet-general -a -ae 12 \
  art/raw/a01_ch_washington_st1_sheet_v01.png \
  art/cut/a01_ch_washington_st1_sheet_v01.png
```

Keep **BEN v2** as the escalation path for the six or seven figures where hats and hair defeat BiRefNet, and **Bria RMBG-2.0** as the paid option if you need a commercially-licensed-training-data guarantee for the district's procurement paperwork.

**Then segment by hand.** There is no automated tool that cuts a painted figure into animation-ready limbs correctly, and there will not be one that respects your rig. Budget 45 minutes per character. Standard 11-piece rig:

```
head  torso  pelvis
upper_arm_L  lower_arm_L  hand_L
upper_arm_R  lower_arm_R  hand_R
leg_L  leg_R
```

Cut with ~8 px of overlap at every joint so rotation doesn't open a seam. Hand-paint the occluded shoulder/hip continuation — 5 minutes per character and it removes every "paper doll gap" artefact.

### 4.4 The hands library

**Do not let the model generate hands, ever** (§5.2). Generate **one** sheet of 8 hand shapes in the house style, hand-clean it, and reuse those 8 across every character in the game:

```
open_relaxed  pointing  gripping_vertical  gripping_horizontal
flat_palm_down  fist  holding_paper  behind_back_stub
```

At the scale characters appear on screen (~200 px tall in a 900 px frame), a hand is 12 px. Nobody will ever know, and you will never again lose an hour to a six-fingered general.

### 4.5 Packing

Each character's 11 pieces pack into one **1024×1024** atlas, trimmed, with 4 px padding, exported as a KTX2 (UASTC) + a JSON rig descriptor:

```
art/dist/char/washington_st2.ktx2
art/dist/char/washington_st2.rig.json
```

`rig.json` holds each piece's atlas rect, pivot point, parent, and default rotation. Same schema for every character so one runtime component drives them all.

---

# 5. What AI image models are still bad at, and how the design routes around it

The correct response to a model weakness is almost never a better prompt. It is a design decision that makes the weakness unreachable.

### 5.1 Text and typography — **NEVER generate readable text**

The strong prior in the brief is correct and should be an absolute rule. Even the models that are good at text (Ideogram 4, Nano Banana Pro, Qwen-Image) are good at *modern* text. None of them can produce authentic 18th-century secretary hand, correct period orthography (the long ſ, the ligatures, the abbreviation marks), or a plausible copperplate map cartouche. What they produce is uncanny — near-English gibberish that a history teacher will spot in two seconds and a student will screenshot.

**Design rule: every readable glyph in this game is rendered in-engine.**

- The model generates **blank aged paper** — letters, orders, broadsides, the Newburgh Address, the Paine pamphlet, map sheets, all of it, generated with nothing written on them.
- Type is composited at runtime: DOM/canvas text in a licensed period-appropriate typeface (recommend **IM Fell English** and **IM Fell English SC**, OFL, digitised from a 17th-c. English foundry — it is right for the era and free), with a per-glyph slight rotation/opacity jitter and a multiply blend so it sits *into* the paper rather than on it.
- This has three side benefits: primary-source text is **selectable, searchable, and screen-reader accessible** (a real accessibility requirement in US schools); it is **editable by the teacher/client without regenerating art**; and it costs ~2 KB per document instead of a 400 KB image.
- Where a scene needs *illegible* text as texture (a distant sign, a stack of paperwork), prompt for `faint illegible marks of writing, too small and too faint to read` and keep it below ~20 px on screen.
- The negative block in §2.1 carries the full text-suppression list. Enforce it.

**Do not make an exception for the game's own title card.** Set it in type.

### 5.2 Hands

Still bad, still the tell. Five design routes, all in use:

1. **Portraits are chest-up crops.** No hands in frame. All 9 Washington portraits and all 20 NPC portraits. Free.
2. **The hands library** (§4.4). Eight hand shapes, hand-authored once, reused everywhere.
3. **Give every character a prop or a place to put their hands.** Washington holds his hat, holds a folded letter, holds a spyglass, rests a hand on a table edge, or clasps hands behind his back — which is both a documented Washington habit and a hand-free silhouette. Officers hold sword hilts. Soldiers hold muskets. Write this into the character bible, not into prompts.
4. **Gloves.** Period-correct, and a glove is a mitten-shaped mass the model gets right because it has no fingers to miscount.
5. **Distance.** At the diorama scale (characters ~200 px tall), hands are sub-pixel-detail. Only the portrait layer is close enough to matter, and route 1 handles that.

### 5.3 Repeated architecture across angles

**Already solved by decision #3, and this is the single best decision in the design.** Fixed cameras mean every location has exactly one canonical view, so the model is never asked to hold a building consistent across an angle change — the thing it categorically cannot do.

Reinforce it with two rules:

- **One plate per location, forever.** If Act 5 returns to the Valley Forge parade ground three times, it is the *same generated plate* three times, not three generations of the same place.
- **Variants come from img2img off the master plate, never from a re-prompt.** Weather, season, time of day, and stat-driven mood shifts are produced by running the master plate back through `wash-v1` at denoise **0.28–0.38** with a modified prompt. Denoise above ~0.45 starts moving architecture and the location stops being the same place. This is exactly how the brief's "map mood shifts with stats" (which becomes "scene mood shifts with stats") gets built cheaply — one plate, four moods, four img2img passes, all provably the same geometry.

Corollary: if a scene *must* be seen from two angles for narrative reasons, cut it. That's a writing problem, not an art problem.

### 5.4 Historical accuracy

Models confidently produce: Napoleonic shakos on Continental soldiers, Civil War kepis, 1860s frock coats, the 50-star flag, Brown Bess muskets with the wrong furniture, buttons on the wrong side, powdered wigs instead of clubbed natural hair, and Mount Vernon with the wrong number of windows. They will do this *while* the prompt says "1777."

Three-part workaround:

1. **Costume plates as mandatory references.** Build five reference sheets from the Anne S.K. Brown Military Collection — `ref_continental_regular.png`, `ref_continental_militia.png`, `ref_british_regular.png`, `ref_hessian.png`, `ref_french_regular.png` — and pass the relevant one as a reference image on **every single** character generation. Never trust a prompt to specify a uniform.
2. **A human accuracy gate in the ledger.** Every asset carries `hist_check: {by, date, verdict, notes}`. Nothing ships un-checked. The teaching client is the final authority; build a contact-sheet review into each act's sign-off so they can reject in bulk rather than asset-by-asset.
3. **Lean on the style.** This is a real, under-appreciated benefit of the ink-and-wash pivot: a loose three-value wash over a confident line is *allowed* to be ambiguous about buttons. A photoreal style commits to every detail and is therefore wrong in every detail. The style has a higher accuracy floor for the same reason it has a higher quality floor.

Do not attempt architectural fidelity to real surviving buildings (Mount Vernon, the Maryland State House) from prompts. For those three or four hero locations, do a ControlNet lineart pass from a traced photograph. Twenty minutes of tracing buys accuracy no prompt will.

### 5.5 Consistent lighting direction

Models drift the key light. Across 40 dioramas you will get sun from the left, right, behind, and nowhere.

**Declare a light law per act, put it in the prompt, and then fix the residue in the renderer.**

| Act | Light law |
|---|---|
| 1 Mount Vernon | High warm sun, key from frame-left, 55° elevation. Long soft shadows to the right. |
| 2 Cambridge | Flat overcast, no directional key, cool grey. |
| 3 Long Island | Low sun from frame-right dropping to fog; night variant is moonlight from frame-right. |
| 4 Delaware | Night. Torchlight from within the frame, warm, low, from frame-left. Sky lit only by snow. |
| 5 Valley Forge | Low winter sun from frame-left, 15° elevation, cold and blue-shadowed. |
| 6 Newburgh | Interior. Single window, frame-left, cold north light. |
| 7 Yorktown | High hazy sun near-overhead, dust-warm, minimal shadow. |
| 8 Annapolis | Bright, even, near-shadowless. Light from everywhere. Deliberately flat and still. |

Every prompt for an act appends its light law verbatim.

**Then grade in-engine.** Each act's Three.js scene applies a directional light matching the law, a per-act fog colour, and a per-act LUT over the composited frame. Residual per-asset drift gets normalised by the grade. This is the correct place to solve it: a shader fixes 40 assets at once, a re-generation fixes one.

### 5.6 Scale and the walk-plane (project-specific, and it will bite you)

Every exterior must share the same implied camera or Washington's sprite will be the wrong size when he walks between scenes. Models do not hold a camera spec.

**Fix:** every exterior prompt carries an identical camera line, and every plate is validated before acceptance.

```
CAMERA: shallow elevated three-quarter view, as if standing on a low rise about
four metres above the ground and looking down at roughly twenty degrees. Normal
lens, no wide-angle distortion, no fisheye, horizon high in the frame.
```

**Validation:** composite a flat grey Washington silhouette at three depths (near, mid, far walk-plane) onto the candidate plate before accepting it. If the near silhouette is 220 px and the far is 190 px, the camera is too flat and the scene will feel wrong to walk in; target roughly 220 px near → 130 px far. Reject and re-blockout. Do this at step 7 of §2.6, before you spend an hour on depth slicing.

### 5.7 Seamless tiling

Hosted APIs cannot produce genuinely seamless textures — they have no circular-padding option, and "make it tile" in a prompt produces an image with visible seams and a suspiciously symmetrical composition. Generate all tiling textures locally with ComfyUI's seamless/circular-VAE tiling nodes at `wash-v1` strength 0.95.

Needed tiling set (10 textures, 1024×1024, greyscale where possible so they can be tinted in-shader):

```
paper_laid_warm   paper_laid_cool   paper_foxed_light   parchment_vellum
canvas_tent       linen_map_backing  wood_plank_worn    ink_wash_grain
snow_crust        mud_churned
```

---

# 6. Production hygiene

### 6.1 Directory layout

```
art/
  corpus/
    source/                  # PD training images, by corpus_id
    corpus-manifest.csv      # provenance record (§7.3)
  models/
    wash-v1.safetensors      # Git LFS
    wash-map-v1.safetensors
    gw-face-v1.safetensors
    *.trainconfig.json
  graphs/
    wash-prod-v1.json        # frozen ComfyUI graph
  prompts/
    style-block.txt
    char-*.txt
    light-laws.md
  refs/                      # costume plates, master portraits, palette plates
  blockout/                  # hand-drawn composition sketches (authorship evidence)
  raw/                       # every accepted generation, untouched, PNG
  work/                      # PSD/KRA layered files
  dist/                      # shipped assets only
  ledger.jsonl               # §6.6
```

`raw/` and `work/` are **not** shipped and live in Git LFS. `dist/` is what the build consumes.

### 6.2 File naming

One convention, no exceptions:

```
{act}_{scene}_{type}_{subject}[_{qualifier}]_v{NN}.{ext}
```

- `act`: `a01`–`a08`, or `gl` for global/shared
- `scene`: `s01`–`s99`, or `xx` for non-scene assets
- `type`: `bg` background layer · `ch` character cutout · `pt` portrait · `pr` prop · `tx` tiling texture · `mp` map-table · `ui` interface · `doc` blank document paper
- `subject`: kebab-case
- `qualifier`: layer (`L0`–`L4`), stage (`st1`–`st3`), band (`hi`/`mid`/`lo`), mood (`m-hope`/`m-grim`), pose

Examples:
```
a04_s02_bg_river-camp_L2_v03.ktx2
a04_s02_bg_river-camp_L2_m-grim_v03.ktx2
gl_xx_ch_washington_st2_v05.ktx2
gl_xx_pt_washington_st2_band-lo_v04.webp
a05_s01_pr_ration-log_v01.webp
gl_xx_tx_paper-laid-warm_v02.ktx2
a07_s03_mp_yorktown-siege_v02.webp
```

Version numbers never reset and never get reused. `v03` superseding `v02` means `v02` stays in `raw/` and in the ledger forever.

### 6.3 Resolution and aspect targets

Logical render resolution: **1600×900**, letterboxed 16:9. Chromebook panels are overwhelmingly 1366×768 and 1920×1080; 1600×900 sits between them and scales acceptably to both.

| Asset class | Generate | Master (raw) | Ship | Format |
|---|---|---|---|---|
| Diorama layer `L0`–`L4` | 1536×864 | 2304×1296 | 2048×1152 | KTX2 |
| — reason | | 1.5× upscale | 12.5% overscan for parallax dolly | |
| Character cutout atlas | 1536×1024 sheet | — | 1024×1024 | KTX2 |
| Portrait | 1024×1536 | 1536×2048 | 768×1024 | **WebP** |
| Prop / document paper | 1024×1024 | — | 512×512 or 768×768 | WebP |
| Tiling texture | 1024×1024 | — | 512×512 | KTX2 |
| Map-table sheet | 2048×2048 | — | 1536×1536 | KTX2 |
| UI element | 512×512 | — | native, ≤256 | WebP |

**Portraits and documents ship as WebP and render in the DOM layer over the canvas, not as Three.js textures.** This is a deliberate engineering call: a 768×1024 RGBA texture costs 3.1 MB of GPU memory, and there are ~50 portraits. Rendering them as `<img>` elements in an overlay costs zero GPU texture memory, gets free browser-managed decode/eviction, and lets the dialogue UI be plain accessible HTML — which the §5.1 in-engine-type decision already requires. Only things that need to sit *inside* the parallax scene go into Three.js.

### 6.4 Upscaling

**Topaz Gigapixel, "Art & CG" model, 1.5×.** GAN-family upscalers reconstruct; they add sharpness and texture without inventing content. Magnific and other diffusion-based "creative" upscalers *reimagine* detail — they will add brushwork, crosshatching and micro-detail that is not in your style and will visibly desync one asset from the other 199. Do not use them.

Never upscale more than 1.5×. If you need more resolution, generate bigger.

After upscaling, run a **light unsharp mask (radius 0.8, amount 40%)** to recover the ink line, which upscalers soften. Then resize down to ship resolution with Lanczos. The upscale-then-downscale round trip is what gives you a crisp ink line at 2048 px; generating directly at 2048 gives you a soft one.

### 6.5 Encoding, atlasing, and the size budget

**Two formats, two purposes:**

- **KTX2 / UASTC + Zstd** for everything that becomes a Three.js texture. UASTC (not ETC1S) because watercolour is nothing but smooth gradients and fine dark lines, which is precisely what ETC1S's block compression destroys — you will see banding in every sky and stippling on every ink stroke. UASTC + Zstd lands ~1.4–2.2 MB on disk for 2048×1152 RGB and transcodes to a GPU-native format (~4.7 MB VRAM) at load.
  ```bash
  toktx --t2 --encode uastc --uastc_quality 3 --zcmp 18 --genmipmap \
        a04_s02_bg_river-camp_L2_v03.ktx2 input.png
  ```
  Exception: far background layers (`L0`, `L1`) and the map-table sheets may use ETC1S (`--encode etc1s --clevel 4 --qlevel 200`) — they are behind fog and out of focus. Test each one; if you see banding, promote it back to UASTC.

- **WebP q82** for DOM-layer images (portraits, documents, UI). AVIF encodes ~20% smaller but decodes measurably slower on the low-end ARM and Celeron Chromebooks in the target fleet, and this project's bottleneck is decode time on a cold scene transition, not bandwidth. WebP is the right trade.
  ```bash
  cwebp -q 82 -m 6 -sharp_yuv -metadata none in.png -o out.webp
  ```
  Alpha-bearing WebP: add `-alpha_q 90`.

**Atlasing.** Atlas aggressively — every draw call costs on integrated GPUs.
- One atlas per character (11 limb pieces, 1024²).
- One atlas per act for props and small scene elements (2048², ~30 items).
- One shared atlas for UI (1024²).
- **Do not atlas diorama layers.** They are full-frame and want their own mip chains.

**Size budget — hard limits, enforced in CI:**

| Bucket | Budget | Notes |
|---|---|---|
| Initial download (shell + Act 1) | **≤ 8 MB** | Must be interactive in <15 s on 5 Mbps shared district wifi |
| Per-act lazy chunk (Acts 2–8) | **≤ 12 MB** | Prefetched during the preceding act's dialogue |
| Total shipped art | **≤ 85 MB** | Whole game, all 8 acts |
| Peak GPU texture memory, any one scene | **≤ 120 MB** | 5 diorama layers + 6 character atlases + props |
| Peak JS heap | **≤ 180 MB** | Chromebooks with 4 GB RAM will tab-discard above this |

Derivation for the per-scene GPU figure: 5 layers × 2048×1152 UASTC-transcoded (~4.7 MB each) = 23.5 MB, + 6 character atlases × 1024² (~1.4 MB) = 8.4 MB, + prop atlas 2048² (~4.7 MB), + mipmaps ~33% = **~49 MB**. The 120 MB ceiling is 2.4× headroom for transitions where two scenes are resident simultaneously. Enforce a **hard rule: dispose the outgoing scene's textures before the incoming scene finishes fading in**, and verify with `renderer.info.memory.textures` in a dev overlay.

CI check: a build script that walks `dist/`, sums per-act bytes, and fails the build over budget. Add it in week one, not week twenty.

### 6.6 The prompt-to-asset ledger

**Every shipped asset must be regenerable by someone who has never met you.** One append-only JSON Lines file, `art/ledger.jsonl`, one record per shipped asset.

```json
{
  "asset_id": "a04_s02_bg_river-camp_L2_v03",
  "file": "art/dist/bg/a04_s02_bg_river-camp_L2_v03.ktx2",
  "raw": "art/raw/a04_s02_bg_river-camp_v03.png",
  "work": "art/work/a04_s02_bg_river-camp_v03.kra",
  "created": "2026-09-14T11:02:33Z",
  "operator": "kdm",
  "engine": {
    "tool": "comfyui",
    "graph": "art/graphs/wash-prod-v1.json",
    "graph_sha256": "9f2c…",
    "base_model": "FLUX.2-klein-4B",
    "base_sha256": "c41a…",
    "loras": [
      {"name": "wash-v1", "sha256": "77be…", "strength": 0.85}
    ]
  },
  "params": {
    "seed": 40201, "steps": 28, "guidance": 3.2,
    "sampler": "euler", "scheduler": "simple",
    "width": 1536, "height": 864, "denoise": 1.0
  },
  "prompt": "wshwash, a riverside army camp at night, low canvas tents…",
  "style_block": "style-block.txt@v1",
  "light_law": "act04",
  "controlnet": [
    {"type": "depth",   "image": "art/blockout/a04_s02_blockout_v02.png", "weight": 0.55},
    {"type": "lineart", "image": "art/blockout/a04_s02_blockout_v02.png", "weight": 0.35}
  ],
  "refs": [],
  "post": [
    "topaz gigapixel art-cg 1.5x",
    "unsharp r0.8 a40",
    "lanczos -> 2048x1152",
    "manual depth-slice L2 + paint-in behind tent line (38 min)",
    "toktx uastc q3 zstd18"
  ],
  "hist_check": {"by": "client", "date": "2026-09-19", "verdict": "pass", "notes": "tent form ok; drum moved out of frame"},
  "sensitive": false,
  "supersedes": "a04_s02_bg_river-camp_L2_v02",
  "bytes": 1687432
}
```

Rules:
- **Append only.** Superseded records stay. `supersedes` chains them.
- Model and LoRA **hashes**, not just names. "FLUX.2 klein" in 2029 will not mean what it means today.
- The `post` array is prose but must be complete enough to redo. Include the human paint-in time — it is both a scheduling input and authorship evidence (§7.2).
- `sensitive: true` on any asset depicting an enslaved person, a wounded or dying soldier, or violence (§7.5). These require sign-off before shipping.
- ComfyUI embeds the full graph in output PNG metadata by default. **Keep it** in `raw/`; strip it in `dist/` (`-metadata none` in the cwebp line above). The ledger is the durable record; the embedded metadata is the belt-and-braces copy.
- A `scripts/verify-ledger.mjs` in CI asserts that every file in `dist/` has a ledger record and every ledger record's file exists.

---

# 7. Legal and classroom considerations

Factual, not alarmist. Three real issues, one real ethics gate, and a documentation practice that resolves most of it.

### 7.1 Copyright status of the art

**Purely AI-generated images are not copyrightable in the United States.** The Copyright Office's position has been consistent, its January 2025 guidance formalised it, and *Thaler v. Perlmutter* settled the human-authorship requirement (cert denied). The Office has registered works containing AI images where the *human-authored* elements — text, selection, coordination, arrangement — were protectable, while expressly excluding the AI images themselves.

Practical consequences for this project:

- The **game** is protectable: the code, the writing, the dialogue trees, the act structure, and the selection and arrangement of assets are all human-authored.
- Individual generated plates, taken alone, likely are not. Someone could lift them. For a classroom product this is a low-stakes exposure, and it is worth knowing rather than worrying about.
- **The human work in this pipeline is substantial and should be documented, because it strengthens the claim.** Blockout drawings, ControlNet inputs, depth-layer slicing, hand-painted reveals behind layer edges, hand-cut limb segmentation, the hands library, in-engine typography — this is materially more human authorship than "typed a prompt." The `blockout/` folder and the `post` array in the ledger are the evidence. Keep them.

### 7.2 Model terms of service

| Tool | Output rights | Constraint that matters here |
|---|---|---|
| **FLUX.2 klein-4B** | Apache 2.0 — unrestricted | **None. This is why it's primary.** |
| FLUX.2 dev / klein-9B | Non-commercial model licence | Avoid. Do not build the pipeline on a licence that needs interpreting. |
| FLUX.2 pro (BFL API) | Commercial use permitted | Fine for hero assets; API-metered |
| Nano Banana Pro / Gemini API | Google does not claim ownership of outputs | Paid API tier outputs carry **no visible watermark**; all carry invisible **SynthID**. Free/Pro consumer tiers stamp a visible Gemini mark — **never generate shipping assets from a consumer tier.** |
| OpenAI GPT Image | You own outputs per OpenAI Terms of Use | Not in the pipeline |
| **Midjourney** | Paid plans grant ownership/commercial licence; **free tier grants none** | Terms prohibit using the Service to develop competing products — **this is why Midjourney outputs never enter the LoRA training set.** Also: if the shipping entity has >$1M annual revenue, Pro or Mega is required, not Standard. |
| Recraft | Paid plans grant commercial use | UI icons only |

**Two hard rules:**
1. **Never generate a shipping asset on a free tier of anything.** Free tiers uniformly grant no commercial rights and often watermark.
2. **The LoRA training corpus contains only public-domain and CC0 museum images.** No AI outputs, no scraped contemporary art, no living artists' work. This makes `wash-v1` defensible in a way a scraped LoRA never is, and it is the answer to any procurement question about where the style came from.

### 7.3 Provenance documentation

Ship a `ART-PROVENANCE.md` in the repo and surface a plain-language version on an in-game credits screen. Minimum contents:

- A statement that the visual art is AI-generated, naming the pipeline: FLUX.2 klein-4B with project-trained LoRAs.
- The training corpus: a link to `corpus-manifest.csv` listing every source image with institution, accession number, and licence.
- A statement that Washington's likeness derives from public-domain portraits by Charles Willson Peale and the Houdon life mask.
- A statement that all in-game text is human-written and rendered in-engine, not generated as image content.
- A note that C2PA Content Credentials and SynthID watermarks may be present in assets sourced from hosted models, and are preserved where present.

**On watermarks:** OpenAI joined the C2PA steering committee in May 2026 and now embeds SynthID alongside C2PA Content Credentials; Google's SynthID is in everything Gemini produces. **Do not strip them.** Stripping provenance markers from a product for a K-12 classroom is exactly the wrong signal, some tools' terms prohibit it, and C2PA metadata does not survive the WebP/KTX2 conversion anyway — the pixel-domain SynthID mark will remain, which is fine and correct. Document it and move on.

Many districts now require disclosure of AI-generated content in instructional materials. Having this file ready turns a potential adoption blocker into a two-minute conversation. It is also pedagogically useful: a history game that is transparent about how its own images were made is modelling exactly the source-criticism habit the unit teaches.

### 7.4 Third-party IP and likeness

Two prompting rules, enforced in review:

- **Never name a living person, a contemporary artist, a studio, a film, or a game in a prompt.** Not "in the style of [artist]", not "like Disco Elysium", not "Pentiment style." Describe the qualities. Midjourney is currently litigating with Disney and Universal over training data; that risk sits with the model provider, but a prompt that names a protected property moves it toward you. The style block in §2.1 is deliberately written entirely in terms of *technique*, with no artist names.
- **Historical figures are fine.** Washington, Lafayette, von Steuben, Knox, Arnold and Cornwallis are long dead and have no publicity rights. Depict them from public-domain portraits.

### 7.5 The ethics gate — depictions of enslaved people

The brief carries an enslaved-people thread through Act 1 and (per decision #12) past it, including the documented reversal on Black enlistment after Dunmore's Proclamation. This is the highest-reputational-risk art in the project and it needs a process, not a prompt.

Image models produce, unprompted, either grotesque caricature or a sanitised pastoral that erases the subject — both drawn from the historical illustration corpus they were trained on, which is itself full of both. You cannot prompt your way out of this.

**Required process:**
1. Every asset depicting an enslaved person is marked `sensitive: true` in the ledger.
2. Generation is reference-driven, using documented research on the specific people at Mount Vernon — Mount Vernon's Ladies' Association has published extensive material on the individuals enslaved there, including names, roles, and in some cases physical descriptions. Depict *specific documented people*, not a generic type. This is better history and better art direction, and it removes the model's freedom to invent.
3. No such asset ships without explicit written sign-off from the teaching client, who is the pedagogical authority here.
4. Portrait-level framing (individual, named, at eye level, looking at the viewer) rather than background-labour framing wherever the writing allows it. The design's own principle — "complicate the great-man narrative honestly" — is an art-direction instruction as much as a writing one.

Apply the same `sensitive: true` gate to wounded and dying soldiers at Valley Forge and to the Trenton and Yorktown battle sequences. It costs almost nothing and it prevents the one screenshot that ends the project's classroom adoption.

### 7.6 Student data

Trivially clean, and worth stating in the provenance doc: **all art is generated offline and baked at build time.** The shipped game makes zero image-model API calls, carries zero API keys, and transmits nothing. This is consistent with decision #10 and means no vendor's terms of service reach the student at all.

---

## Appendix A — Week-one checklist

1. Subscribe Midjourney Standard ($30). Art-direct for two weeks. Cancel after step 3.
2. Pull 400 candidate images from YCBA + Met + Rijksmuseum. Curate to 48. Fill `corpus-manifest.csv`.
3. Train `wash-v1` on fal.ai. Run the seven-plates gate. Iterate ≤6 times.
4. Freeze `wash-prod-v1.json`. Commit models via Git LFS.
5. Build `scripts/verify-ledger.mjs` and the size-budget CI check **before** the first asset ships.
6. Produce Act 1, Scene 1 end to end — blockout → generate → slice → encode → ledger → in-engine. Time it. That number × 40 is the diorama schedule, and it is the number the whole project plan hangs on.

## Appendix B — Sources consulted (August 2026)

- [Best AI Image Models 2026: 10 Compared](https://www.teamday.ai/blog/best-ai-image-models-2026)
- [Best AI Image Generators July 2026: GPT Image 2, Nano Banana Pro & FLUX.2](https://www.buildmvpfast.com/articles/best-llms-2026-guide/image-generation-ai)
- [Midjourney Style Reference docs](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference) · [Character Reference](https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference) · [Omni Reference](https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference) · [Editor](https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor)
- [Midjourney V8.1: 7 Features Practitioners Should Use Today](https://www.ud.hk/en/blogs/insight/article/2026-05-13-midjourney-v81-power-guide)
- [Flux 2 and Flux Kontext Explained: Every Variant, License, and Price (August 2026)](https://invideo.io/blog/flux-ai-image-generator/)
- [FLUX.2 Klein 4B — Hugging Face](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) · [flux2 licensing](https://deepwiki.com/black-forest-labs/flux2/7.4-licensing-and-terms)
- [BFL: Character & Style Consistency](https://docs.bfl.ml/guides/usecases_editing_character_consistency)
- [Nano Banana Pro (Gemini 3 Pro Image) — OpenRouter](https://openrouter.ai/google/gemini-3-pro-image) · [Google announcement](https://blog.google/innovation-and-ai/products/nano-banana-pro/)
- [Imagen 4 — Gemini API docs (deprecation)](https://ai.google.dev/gemini-api/docs/models/imagen) · [Google Model Retirements](https://vorplabs.com/models/google-model-retirements)
- [GPT Image 2 — Replicate](https://replicate.com/openai/gpt-image-2) · [GPT Image 2 API pricing](https://unifically.com/blogs/gpt-image-2)
- [Recraft AI models](https://www.recraft.ai/ai-models) · [Flux vs Ideogram vs Recraft APIs 2026](https://apiscout.dev/guides/flux-vs-ideogram-vs-recraft-image-gen-api-2026)
- [Qwen-Image (GitHub)](https://github.com/QwenLM/Qwen-Image) · [Best Open-Source Image Generation Models 2026](https://www.thundercompute.com/blog/best-open-source-image-generation-models)
- [fal.ai FLUX LoRA Fast Training](https://fal.ai/models/fal-ai/flux-lora-fast-training) · [Qwen Image Trainer](https://fal.ai/models/fal-ai/qwen-image-trainer)
- [AI Background Removal Models: SAM 3.1, Bria, BEN v2, BiRefNet Compared (2026)](https://invideo.io/blog/ai-background-removal-models/) · [ComfyUI-RMBG](https://github.com/1038lab/ComfyUI-RMBG)
- [Best AI Image Upscalers 2026 — Topaz, Magnific, Crystal](https://rangy.ai/blog/best-ai-image-upscaler-2026/)
- [Midjourney Terms of Service](https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service) · [Using Images & Videos Commercially](https://docs.midjourney.com/hc/en-us/articles/27870375276557-Using-Images-Videos-Commercially) · [Midjourney Commercial Use Rights: 2026 Guide](https://terms.law/2026/01/15/midjourney-commercial-use-rights-complete-2026-guide/)
- [OpenAI: Advancing content provenance](https://openai.com/index/advancing-content-provenance/) · [OpenAI and Google Align on C2PA and SynthID](https://c2paviewer.com/articles/openai-google-c2pa-synthid-2026)
- [Can You Copyright AI-Generated Art? What the Law Says in 2026](https://editorsweblog.org/2026/06/30/can-you-copyright-ai-generated-art-2026)
