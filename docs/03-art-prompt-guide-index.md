# AI Art Prompt Guide — Master Index & Workflow
### *In Washington's Shoes* — the one page that routes every asset, in the order it gets made
**Version 1.0 · 14 August 2026**
**Owner:** Art Lead. **Binding on:** the whole art set. **Supersedes:** nothing. **Superseded by:** nothing.

---

## 0. What this page is for

There are three prompt guides and they are long. This page exists so that nobody has to read them to find out **where a thing is, what shape it ships in, when it gets made, and whether it may ship.**

| I need to… | Go to |
|---|---|
| find the prompt for a specific asset | §2, the checklist — every asset class, with its section |
| know what to generate this week | §3, the generation order |
| record what I just made | §4, the ledger |
| decide whether to accept a generation | §5, the QA gate |
| turn an accepted generation into a shipped file | §6, the pipeline |
| find a locked prompt file | §7 |
| answer "does this fit?" | §8, budgets |
| find out which document is currently wrong | §9, consolidated errata |

**The three guides, and the one sentence each:**

| | Owns | The law it derives from |
|---|---|---|
| **`03a-art-prompts-environments.md`** | **places** — 27 diorama plates and their 135 layers, state variants, apex mood plates, the 8 Gilt Frames, the interlude still, the 8 per-act palette plates | *Every location is generated once, from one canonical angle, and never re-derived.* |
| **`03b-art-prompts-characters.md`** | **people** — 16 Washington portraits, 96 NPC portrait states, 26 stance sheets, 9 crowd sheets, the Council emblems, the hands library | *A face is never described into existence. It is generated once, signed off, and thereafter only ever edited.* |
| **`03c-art-prompts-documents-ui.md`** | **things** — 12 paper stocks, 51 documents, 207 collectible props, 6 map tables, the UI and chrome, 10 tiling textures | *The model makes the surface. The engine makes the sentence. They never meet in the same file.* |

Above all three sit `02-art-direction.md` (what an image must look like) and `reference/historical-visual-reference.md` (what is true — it outranks everything). Beside them sits `reference/ai-art-production-guide.md` (how an image gets made). **Nothing in the three prompt guides may contradict `02`, and `02` may not contradict the historical pack.**

### 0.1 Three boundary rules, because the boundaries are where work gets done twice

1. **Props belong to `03c`, not `03a`.** If `05` lists an object as *findable*, `03c` generates it as a study on bare paper. `03a` paints objects **into** plates as scenery and never generates them separately. The interactable list is the boundary.
2. **The hands library belongs to `03b`.** It was drawn from the prop budget, so `03c` owns **23** prop sheets and `03b` owns the 24th.
3. **Gilt Frame plates belong to `03a`; the gilt frame belongs to `03c`.** The painting is a place-and-people problem; the moulding, the plaque and the wall are chrome.

---

# 1. THE FIVE RULES THAT OUTRANK EVERY PROMPT

Restated here because a prompt guide is read at speed and these are the ones that cost a week when broken.

1. **No readable glyph in any image, ever** (`03c` §1). Enforced by `scripts/no-text.mjs`; a single dictionary word fails the build, with no override.
2. **One location, one canonical view, forever** (`02` §5.7). Variants come from img2img at denoise 0.28–0.38 off the master plate, never from a re-prompt. If the script needs a second angle, the scene is rewritten.
3. **One master per character, generated before anything else** (`03b` §3.5). Everything downstream references it. A signed-off master is never re-rolled, only edited.
4. **If two assets appear on screen at the same time, they should have been born in the same image** (`ai-guide` §2.5). This is why almost everything in `03b` and `03c` is a sheet.
5. **Nothing generated on a free tier of anything, and nothing trained on anything but public-domain and CC0 museum images** (`ai-guide` §7.2). This is the answer to the district's procurement question and it is not negotiable for one convenient asset.

---

# 2. THE CONSOLIDATED ASSET CHECKLIST

**Read the ID column as a pattern.** The naming convention is `{act}_{scene}_{type}_{subject}[_{qualifier}]_v{NN}.{ext}` (`ai-guide` §6.2), extended by `02` Appendix C and by §2.3 below.

**Gen** = distinct generations. **Files** = files in `art/dist/`. **Renders in** = DOM (an `<img>` over the canvas, zero GPU texture cost) or GL (a Three.js texture).

## 2.1 `03a` — places

| Asset class | ID pattern | Gen | Files | Generate | Ship | Format | Renders in | Prompt |
|---|---|---|---|---|---|---|---|---|
| Diorama layer, master | `aNN_sNN_bg_<subject>_L{0-4}_vNN` | 27 | 135 | 1536×864 | 2048×1152 | KTX2 UASTC | GL | `03a` §4 |
| Diorama state variant | `…_L{2,3}_<state>_vNN` | 5 | 9 | img2img 0.28–0.38 | 2048×1152 | KTX2 UASTC | GL | `03a` §5 |
| Apex mood plate (`L2` only) | `…_L2_m-{hope,grim}_vNN` | 8 | 8 | img2img 0.28–0.38 | 2048×1152 | KTX2 UASTC | GL | `03a` §5 |
| Gilt Frame plate (R6) | `aNN_xx_gf_<subject>_vNN` | 8 | 8 | 1536×864 | 2048×1152 | KTX2 UASTC | GL | `03a` §7 |
| Interlude still + 6 relights | `gl_xx_bg_writing-desk_i{1-7}_vNN` | 7 | 7 | 1536×864 | 2048×1152 | KTX2 UASTC | GL | `03a` §6 |
| Per-act palette plate → LUT | `aNN_xx_pl_<act>_vNN` | 8 | 8 | 1024×1024 | 32³ | PNG | GL | `03a` §3 |
| Authored ink masks (`L0`–`L2`) | `…_ik_…` | — | *in alpha* | — | — | — | GL | `02` §3.3 |
| **Subtotal** | | **63** | **175** | | | | | |

## 2.2 `03b` — people

| Asset class | ID pattern | Gen | Files | Generate | Ship | Format | Renders in | Prompt |
|---|---|---|---|---|---|---|---|---|
| Washington portrait matrix | `gl_xx_pt_washington_st{1-3}_band-{lo,mid,hi}_vNN` | 9 | 9 | 1024×1536 | 768×1024 | WebP q82 | DOM | `03b` §3.4 |
| — Act 1 no-sash + spectacled variants | `…_nosash_`, `…_spec_` | — | 6 | masked inpaint | 768×1024 | WebP q82 | DOM | `03b` §3.6–3.7 |
| Washington Gilt Frame myth face | `gl_xx_pt_washington_myth_vNN` | 1 | 1 | 1024×1536 | 768×1024 | WebP q82 | DOM | `03b` §3.8 |
| NPC portrait master sheets (2-up) | `gl_xx_pt_<subject>_vNN` | 18 | 36 | 1536×1024 | 768×1024 | WebP q82 | DOM | `03b` §4.4 |
| NPC age pairs | `…_age2_` | 3 | 3 | 1024×1536 | 768×1024 | WebP q82 | DOM | `03b` §4.4 |
| Expression + re-coat variants | `…_{speak,angry,down}_` | — | 44 | masked img2img | 768×1024 | WebP q82 | DOM | `03b` §4.6 |
| Council emblem sheet (R4) | `gl_xx_em_council-sheet_vNN` | 1 | 11 cells | 1536×1536 | 1024² atlas | KTX2 | DOM | `03b` §6.2 |
| Attribute well sheet | `gl_xx_em_attribute-well_vNN` | 1 | 16 cells | 1536×1536 | 1024² atlas | KTX2 | DOM | `03b` §4.5 |
| Character stance sheets | `gl_xx_ch_<subject>_st{1-3}_vNN` | 26 | 26 atlases | 1536×1024 | 1024² | KTX2 UASTC | GL | `03b` §5.3 |
| Crowd sheets (6 figures each) | `aNN_xx_ch_crowd-<n>_vNN` | 9 | 5 atlases | 1536×1024 | 1024² | KTX2 UASTC | GL | `03b` §5.8 |
| Hands library (+ gloved) | `gl_xx_ch_hands_vNN` | 1 | 1 atlas | 1536×1536 | 512² | KTX2 | GL | `03b` §5.6 |
| **Subtotal** | | **69** (+50 masked) | **158** | | | | | |

## 2.3 `03c` — things

| Asset class | ID pattern | Gen | Files | Generate | Ship | Format | Renders in | Prompt |
|---|---|---|---|---|---|---|---|---|
| Paper stocks `P01`–`P12` | `gl_xx_doc_<stock>_vNN` | 12 | 12 | 1024×1536 | per stock | WebP q82 | DOM | `03c` §2.3 |
| Illegible-hand strips (5 registers) | `gl_xx_hn_hand-{ms,pr}_vNN` | 2 | 1 atlas | 2048×2048 | 2048² | WebP + α | DOM | `03c` §2.4 |
| Seals, ribbons, ties (`DOC-F1`) | `gl_xx_fx_seals_vNN` | 1 | *in atlas* | 1536×1536 | 1024² atlas | WebP + α | DOM | `03c` §2.5 |
| Edges, folds, damage (`DOC-F2`) | `gl_xx_fx_edges_vNN` | 1 | 1 atlas | 1536×1536 | 1024² atlas | WebP + α | DOM | `03c` §2.6 |
| Prop sheets → cabinet | `aNN_xx_pr_<subject>_vNN` | 23 | 4 atlases | 1536×1536 | 2048² atlas | WebP + α | DOM | `03c` §3.3 |
| Prop sheets → toggles | (same source) | — | 8 atlases | — | 1024² atlas | KTX2 UASTC | GL | `03c` §3.1 |
| Map sheets `MT-01`–`MT-06` | `aNN_xx_mp_<subject>_vNN` | 6 | 6 | 2048×2048 | 1536² | KTX2 UASTC | GL | `03c` §4.6 |
| Hachure alphas | `…_hx_…` | — | 6 | *extracted* | 1536² | KTX2 ETC1S | GL | `03c` §4.7 |
| Heightfields | `…_hf_…` | — | 6 | *hand-painted* | 256² | PNG R8 | GL | `03c` §4.8 |
| Map token sheet | `gl_xx_mp_tokens_vNN` | 1 | 1 atlas | 1536×1536 | 1024² | KTX2 UASTC | GL | `03c` §4.9 |
| Surveyor's overlays | `aNN_sNN_ov_<scene>_vNN` | **0** | 12 | *hand-drawn* | 1600×900 | **SVG** | GL | `03c` §4.11 |
| Tiling textures `T01`–`T10` | `gl_xx_tx_<subject>_vNN` | 10 | 10 | 1024² seamless | 512² | KTX2 | GL | `03c` §6.4 |
| Ink glyph sheet (`UI-1`) | `gl_xx_ui_glyphs_vNN` | 1 | *in atlas* | 1536×1536 | 1024² atlas | KTX2 | GL | `03c` §5.3 |
| Printers' ornaments (`UI-2`) | `gl_xx_ui_ornaments_vNN` | 1 | 1 atlas | 1536×1536 | 1024² atlas | WebP + α | DOM | `03c` §5.4 |
| Binding sheet (`UI-3`) | `gl_xx_ui_binding_vNN` | 1 | 1 atlas | 1536×1536 | 1024² atlas | KTX2/WebP | both | `03c` §5.5 |
| Letterbook spread | `gl_xx_ui_letterbook-spread_vNN` | 1 | 1 | 2048×1280 | 1200×760 | WebP q82 | DOM | `03c` §5.6 |
| Epilogue book spread (3 conditions) | `gl_xx_ui_epilogue-book_vNN` | 1 | 1 | 2048×1280 | 1200×760 | WebP q82 | DOM | `03c` §5.10 |
| Epilogue ledger spread | `gl_xx_ui_epilogue-ledger_vNN` | 1 | 1 | 2048×1280 | 1200×760 | WebP q82 | DOM | `03c` §5.10 |
| **Subtotal** | | **62** | **72** | | | | | |

## 2.4 The totals

| | Generations | Masked passes | Shipped files | Payload |
|---|---|---|---|---|
| `03a` places | 63 | — | 175 | 108.9 MB |
| `03b` people | 69 | 50 | 158 | 22.1 MB |
| `03c` things | 62 | — | 72 | 39.5 MB |
| **PROJECT** | **194** | **50** | **405** | **170.5 MB** |

**194 distinct generations.** At the guide's 15:1 candidate ratio that is **~2,900 generations**, inside the 2,500–4,000 expectation and five under `05` §13.2's estimate of 199 — the twelve surveyor's overlays that should never have been generated (`03c` E-D4) paying for the seven assets nobody had counted.

**Type codes in use**, extending `ai-guide` §6.2 and `02` Appendix C:

```
bg  diorama layer      ch  character cutout    pt  portrait        pr  prop
tx  tiling texture     mp  map-table sheet     ui  interface       doc paper stock
gf  Gilt Frame plate   em  emblem vignette     ik  authored ink mask  pl  palette plate
hn  illegible-hand strips   fx  document furniture   hx  hachure alpha
hf  heightfield             ov  surveyor's overlay
```

---

# 3. THE GENERATION ORDER

Sequence matters more than throughput. Almost every asset in this project references an upstream one, and generating out of order means regenerating.

## 3.1 The dependency spine, in one diagram

```
        PD corpus ──▶ wash-v1 ──┬──▶ wash-map-v1 ──▶ MT-01 ──▶ MT-02…06
                                │
                                ├──▶ gw-face-v1 ──▶ W5 master ──┬──▶ 8 Washington derivations
                                │                               ├──▶ 3 stance sheets ──▶ hands library
                                │                               └──▶ (every NPC sheet)
                                │
                                ├──▶ P01 paper ──┬──▶ T01 grain ──▶ (the whole composite)
                                │                ├──▶ P02…P12
                                │                └──▶ hand strips ──▶ every document
                                │
                                └──▶ palette plate, Act 1 ──▶ MV-01 blockout ──▶ MV-01 L0–L4
                                                                    │
                                                                    └──▶ A1 prop sheets ──▶ A1 toggles
```

**Two anchors are not obvious and both are load-bearing:**

- **`P01`, the writing stock, is generated before any painted plate.** It sets the tone that `PAPER-WARM #EFE7D5` is measured against, `T01` is derived from it, and `T01` is the screen-space grain that every frame in the game passes through. Getting the paper wrong after 27 plates exist means regrading 27 plates. Getting it right first means the world and the documents are visibly the same sheet, which is R10's whole claim.
- **`MT-01` is generated in wave 3, long before Act 2 needs it.** The map table is the only genuinely novel technical path in the project — displaced quad, extracted hachure alpha, hand-painted heightfield, slope-driven shader, a second LoRA — and every part of it is unproven. De-risk it on one sheet in week five, not on six sheets in month four.

## 3.2 The six waves

### Wave 0 — establish the style · ~2 weeks · nothing ships
1. Midjourney V8.1 Standard, two weeks of art direction. Output: `art/direction/` and a one-page written style statement. **These images never ship and never train anything.**
2. Assemble the PD corpus: 400 candidates → 48. Fill `corpus-manifest.csv`.
3. Train **`wash-v1`**. Run the seven-plates gate (`ai-guide` §2.3). ≤6 runs.
4. Train **`wash-map-v1`** (24 images, 1000 steps, trigger `wshmap`) and **`gw-face-v1`** (30 images, 1200 steps, trigger `gwface`, same base so it composes).
5. Freeze `art/graphs/wash-prod-v1.json`. Commit all three LoRAs via Git LFS with their `trainconfig.json` and the corpus manifest.
6. **Build `verify-ledger.mjs`, `no-text.mjs`, `bare-paper.mjs`, `seam-check.mjs` and the size-budget CI check — before the first asset ships.** Week one, not week twenty.

### Wave 1 — the anchors · everything downstream references these
7. **`P01`** the writing stock (`03c` §2.3) — acceptance is the ΔE-3 and σ-1.8–4.5 test.
8. **`T01`** paper grain and **`T02`** paper tooth, derived from `P01` at denoise 0.30.
9. **`W5`**, the canonical Washington master, Stage II / MID, seed 20000 (`03b` §3.2). **Nothing with Washington in it is generated until it is signed.**
10. The five costume plates and `ref_deverger_four-soldiers.png` (`03b` §4.0) — mandatory references on every figure generation thereafter.
11. `art/blockout/char-sheet-template.png`, the scale template.
12. The **Act 1 palette plate**, which is the img2img reference for every Act 1 plate.
13. **`GP-2`, the surveyor's instruments** (`03c` §3.3) — out of act order, because they are found in minute four of Act 1 and they are the seed of the map-table motif.

### Wave 2 — one scene end to end · the number the schedule hangs on
14. `MV-01` blockout → generate → select → repair → upscale → slice `L0`–`L4` → ink masks → encode → ledger → in-engine.
15. Washington `st1` stance sheet → hands library → rig.
16. `A1P-1`/`A1P-2` prop sheets; paper stocks `P03`, `P05`, `P07`; the hand-strip sheets.
17. `UI-1` glyph sheet and the letterbook spread — the first scene is not playable without an exit glyph or a letterbook.

> **Time this wave and write the number down.** `ai-guide` Appendix A: that number × 27 is the diorama schedule and it is what the whole project plan hangs on. Expect 6–9 hours for the first scene and 3–4 for the tenth.

### Wave 3 — de-risk the map table
18. `MT-01` sheet → extract hachure alpha → hand-paint heightfield → token sheet → `T05`, `T06` → in-engine, with the lift. **Do not proceed to wave 5 until the lift runs at 60 fps on the reference Chromebook.**

### Wave 4 — start the sign-off clock on sensitive assets · **calendar, not effort**
19. `03b` sheets 2 and 3 (the Quarter portraits, R5) and `03c` `A1P-3` (the Quarter objects) and `A5P-2` (the hospital hut).

> These require external written sign-off (`hist-ref` §7.6) and **two weeks of calendar that cannot be compressed by working harder.** Six assets. Start them in month one. This is the single most commonly mis-sequenced item in the plan.

### Wave 5 — production, in act order
20. Per act: palette plate → blockouts → diorama plates → depth slices → prop sheets → map sheet → crowd sheet → portraits for that act's speakers → state variants → apex mood plate → surveyor's overlays for that act's exteriors.
21. Character stance sheets gated behind that act's costume-plate confirmation.
22. Remaining paper stocks and document furniture as the acts that need them arrive.

### Wave 6 — unification and the things that must be made last
23. **Per-act LUTs**, produced at each act's Phase C unification pass. This is Layer 5 of the consistency system and it is the cheapest consistency in the project — do not attempt to fix in the model what a three-line shader fixes for free.
24. **The eight Gilt Frames — generated last, and deliberately not colour-matched to anything.** Every other asset in the project is unified toward one hand. These eight must read as a foreign body, and generating them at the end, after the house style is fully settled, is what guarantees they do.
25. The epilogue book, the epilogue ledger, `T09`, `T10` — the only assets in the game permitted to look old.
26. Remaining UI, `UI-2`, `UI-3`, the Council emblem sheet.

---

# 4. THE PROMPT-TO-ASSET LEDGER

> **Every shipped asset must be regenerable by someone who has never met you, in 2031, on hardware that does not exist yet.**

One append-only JSON Lines file, `art/ledger.jsonl`, one record per shipped asset **and one per generation that produced cells**.

```json
{
  "asset_id": "a04_s02_bg_river-camp_L2_v03",
  "class": "diorama-layer",
  "file": "art/dist/bg/a04_s02_bg_river-camp_L2_v03.ktx2",
  "raw":  "art/raw/a04_s02_bg_river-camp_v03.png",
  "work": "art/work/a04_s02_bg_river-camp_v03.kra",
  "created": "2026-09-14T11:02:33Z",
  "operator": "kdm",

  "engine": {
    "tool": "comfyui",
    "graph": "art/graphs/wash-prod-v1.json",
    "graph_sha256": "9f2c…",
    "base_model": "FLUX.2-klein-4B",
    "base_sha256": "c41a…",
    "loras": [{"name": "wash-v1", "sha256": "77be…", "strength": 0.85}]
  },
  "params": {
    "seed": 40201, "steps": 28, "guidance": 3.2,
    "sampler": "euler", "scheduler": "simple",
    "width": 1536, "height": 864, "denoise": 1.0, "tiling": false
  },

  "prompt": "wshwash, a riverside army camp at night, low canvas tents…",
  "prompt_files": ["style-block.txt@v1", "light-laws.md#act04"],
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
    "ink mask authored, packed to alpha (8 min)",
    "toktx uastc q3 zstd18"
  ],

  "qa": {
    "bare_paper": 0.44,
    "darkest_pixel": "#2A211A",
    "ocr": {"tokens": 0, "max_confidence": 38, "verdict": "pass"},
    "seam": null,
    "three_second_test": {"by": "rjm", "verdict": "pass"}
  },
  "hist_check": {"by": "client", "date": "2026-09-19", "verdict": "pass",
                 "notes": "tent form ok; drum moved out of frame"},
  "sensitive": false,
  "supersedes": "a04_s02_bg_river-camp_L2_v02",
  "bytes": 1687432
}
```

**Per-guide extensions, all optional and all validated when present:**

| Field | Guide | Meaning |
|---|---|---|
| `identity_master` | `03b` | the signed master this face derives from. Non-null on every character asset except the eleven masters |
| `metrics` | `03b` | M1–M4 identity ratios against the master; out of tolerance blocks the record |
| `register` | `03b`, `03c` | `R1`–`R6`, or `R3∩R5`. Drives which sign-off gate applies |
| `stock_id`, `type_frame`, `deckle_edges` | `03c` | paper stocks |
| `cells` | `03c`, `03b` | `[{name, rect, ships_to}]` on any sheet |
| `cut_from` | `03c`, `03b` | on any cell's own record, pointing back at the sheet |
| `serves` | `03c` | consumers of a shared asset; cross-checked both ways against content JSON |
| `restricted` | `03c` | whitelist of permitted consumers. Two assets carry it |
| `tileable` | `03c` | true for `T01`–`T10` only; requires a `qa.seam` result |
| `derived` | `03c` | `"extracted"` \| `"hand-painted"` \| `"hand-drawn"` for the 24 assets with no generation |

**Six rules on the ledger, and `scripts/verify-ledger.mjs` asserts all of them:**

1. **Append only.** Superseded records stay forever; `supersedes` chains them. `v03` replacing `v02` leaves `v02` in `raw/` and in the ledger.
2. **Hashes, not names.** "FLUX.2 klein" in 2031 will not mean what it means today. Model and LoRA `sha256` are mandatory.
3. **`post` must be complete enough to redo**, including the human paint-in minutes — which are both a scheduling input and the strongest authorship evidence in the project (`ai-guide` §7.1).
4. **Every file in `dist/` has a record; every record's file exists.** Both directions.
5. **Every record has a `qa.ocr` result.** No exceptions, including for assets that obviously contain no text — the assertion is what makes it an assertion.
6. **`sensitive: true` requires a `hist_check` from someone other than the `operator`.**

**ComfyUI embeds the full graph in output PNG metadata.** Keep it in `raw/`; strip it in `dist/` (`-metadata none`). The ledger is the durable record; the embedded metadata is the belt-and-braces copy.

---

# 5. THE QA GATE — accept or reject

Run in this order. **The cheap checks come first because they are the ones that catch the expensive mistakes**, and every one of them is cheaper than the depth-slicing hour that follows acceptance.

## 5.1 Automated — CI, ~90 s for the full set

| # | Check | Applies to | Script | Fails on |
|---|---|---|---|---|
| A1 | **No readable text** | everything | `no-text.mjs` | any dictionary word ≥ 4 chars at conf ≥ 70; or 3 tokens at conf ≥ 85 |
| A2 | **Bare-paper ratio in band** | all painted classes | `bare-paper.mjs` | outside the register's band (`02` §4.2) |
| A3 | **Ink floor** | everything | `ink-floor.mjs` | any pixel darker than `#241C14` (R6 clamps `#16110D`) |
| A4 | **No pure black, no pure white** | everything | `ink-floor.mjs` | any `#000000` or `#FFFFFF` |
| A5 | **Resolution and format** | everything | `formats.mjs` | mismatch against §2's table |
| A6 | **Seamlessness** | `*_tx_*` | `seam-check.mjs` | seam > 1.35× mean; autocorrelation peak > 0.55 |
| A7 | **Meaning-colour fidelity** | wax, coats, facings | `palette-check.mjs` | ΔE > 6 from the Group D hex |
| A8 | **Identity metrics** | character assets | `verify-ledger.mjs` | M1–M4 outside tolerance vs `identity_master` |
| A9 | **Restricted consumers** | `restricted` assets | `verify-ledger.mjs` | more than the whitelisted consumer |
| A10 | **Ledger completeness** | everything | `verify-ledger.mjs` | missing record, missing file, missing `qa.ocr` |
| A11 | **Size budget** | per act, total | `budget.mjs` | over §8's limits |
| A12 | **Colourblind separation** | UI, map sheets | `cvd-check.mjs` | any semantically distinct pair below simulated ΔE 12 (`04` §8.4) |

## 5.2 Human, 60 seconds, in this order

**Universal — every asset:**
- [ ] Register declared, and the asset obeys that register's line, wash, camera and motion rules (`02` §1.5)
- [ ] Nothing is pure black; the darkest value is warm (`hist-ref` F-15)
- [ ] Period correct at a glance: no shako, no kepi, no wig, no beard, no ring of stars, no piazza (`hist-ref` §6)

**Places (`03a`):**
- [ ] Horizon at y = 0.34; walk-plane band 0.56–0.78; `L4` occluders 15–25% of frame height
- [ ] Washington silhouette composited at 220 px near / 130 px far reads correctly at both
- [ ] All three edge types present; at least one major form has a lost edge; the line never crosses it
- [ ] One contiguous bare region ≥ 12% of frame
- [ ] One focal object, on a third, where the darkest ink meets a meaning colour
- [ ] ≤ 2 Group D colours above 5% of frame (`YT-03` excepted); ≤ 9 background figures; his head above the crowd line
- [ ] **The three-second test**, passed by someone who has not read the script: indoors or out? season and weather? where do I walk? which one is Washington?

**People (`03b`):**
- [ ] Reads as the same person as the `identity_master`, printed side by side
- [ ] Clean-shaven; own hair with a visible hairline and exposed ears; coat skirt at mid-thigh; hat brim one folded plane
- [ ] No hands in frame on any portrait; no scenery, drapery, column or sky behind any head
- [ ] Integer age stated in the prompt and legible in the face

**Things (`03c`):**
- [ ] Deckle count matches the stock's row; paper is cream to buff, never orange
- [ ] Laid and chain lines are value changes, not hue changes
- [ ] Map: every tint flat; no hill outlined or shaded; **zero** compass roses on the sheet
- [ ] Prop sheet: every object rectangle-separable; relative scale sane; act light law obeyed
- [ ] Engraved sheet: every mid-tone is countable lines, not continuous tone

## 5.3 Gated — cannot be waived by anyone on the art team

- [ ] `hist_check` verdict recorded in the ledger
- [ ] `sensitive: true` → written sign-off per `hist-ref` §7.6, **from someone other than the operator**
- [ ] The Quarter sheets: **is anything here picturesque?** If yes, reject
- [ ] Arnold, Armstrong, Harry: **does the face telegraph what is coming?** If yes, reject
- [ ] The nine-portrait Washington contact sheet has been **printed** and looked at by the Art Lead

## 5.4 The three rejections that are not repairs

Some failures cannot be inpainted and attempting it wastes the day:

1. **Wrong camera** — the near/far silhouette test fails. *Re-blockout, do not re-prompt.* The composition is wrong, and a prompt change will produce a different wrong composition.
2. **Fused objects on a prop sheet** — the wash edges are already merged and no mask recovers them. *Regenerate at a different seed with the same prompt.*
3. **A face that reads as a different man** — no amount of inpainting fixes identity, and the consequence mechanic dies the moment a student cannot tell it is the same person. *Re-derive from the master.*

---

# 6. THE POST-PROCESSING PIPELINE

Eight classes, eight paths. Commands are exact; the ledger's `post` array is these lines.

## 6.1 Diorama layers — the only class that upscales

```bash
# 1  upscale — GAN, never diffusion. Magnific invents brushwork that desyncs one asset from 199.
topaz-gigapixel --model "Art & CG" --scale 1.5 in.png -o up.png

# 2  recover the ink line, which every upscaler softens
magick up.png -unsharp 0x0.8+0.40+0 sharp.png

# 3  down to ship resolution. The round trip is what gives a crisp line at 2048;
#    generating directly at 2048 gives a soft one.
magick sharp.png -filter Lanczos -resize 2048x1152! ship.png

# 4  slice L0–L4 by hand in Krita; hand-paint the reveal behind each layer edge.
#    20–40 min/scene. This is the strongest human-authorship evidence in the project.

# 5  author the ink mask for L0–L2 (luminance+chroma threshold, then hand-correct, 8 min/layer)
#    and pack it into the layer's alpha — free, UASTC carries alpha regardless.

# 6  encode
toktx --t2 --encode uastc --uastc_quality 3 --zcmp 18 --genmipmap out.ktx2 ship.png
```

`L0` and `L1` may use `--encode etc1s --clevel 4 --qlevel 200` — they are behind fog and out of focus. **Test each one; if you see banding in a sky, promote it back to UASTC.**

## 6.2 Character sheets → rigged atlas

```bash
rembg i -m birefnet-general -a -ae 12 sheet.png cut.png     # BEN v2 for hats/hair failures
# hand-segment 12 pieces + 1 alternate head rect, 8 px overlap at every joint,
# hand-paint the occluded shoulder/hip continuation (45 min)
node scripts/pack.mjs --in pieces/ --out washington_st2 --size 1024 --pad 4
toktx --t2 --encode uastc --uastc_quality 3 --zcmp 18 --genmipmap washington_st2.ktx2 washington_st2.png
# → washington_st2.ktx2 + washington_st2.rig.json
```

## 6.3 Portraits — no upscale, no atlas, DOM

```bash
magick in.png -filter Lanczos -resize 768x1024! ship.png
cwebp -q 82 -m 6 -sharp_yuv -metadata none ship.png -o out.webp
```

A 768×1024 RGBA texture costs 3.1 MB of VRAM and there are 96 of them. As DOM `<img>` they cost **zero GPU memory**, get browser-managed decode and eviction, and keep the dialogue layer plain accessible HTML — which the in-engine-type decision already requires.

## 6.4 Paper stocks — no upscale, no trim, exact crop

```bash
magick in.png -filter Lanczos -resize 768x1024! ship.png
cwebp -q 82 -m 6 -sharp_yuv -metadata none ship.png -o P01.webp
node scripts/type-frame.mjs P01.webp   # asserts the declared type_frame is inside the sheet
```

## 6.5 Sheets → atlases (props, furniture, tokens, glyphs, ornaments)

```bash
node scripts/cut-cells.mjs sheet.png cells.json          # luminance key vs the sheet's own paper
node scripts/pack.mjs --in cells/ --out cabinet-1 --size 2048 --pad 4 --trim
# DOM destination:
cwebp -q 82 -m 6 -alpha_q 90 -sharp_yuv -metadata none cabinet-1.png -o cabinet-1.webp
# GL destination:
toktx --t2 --encode uastc --uastc_quality 3 --zcmp 18 --genmipmap a04_toggle.ktx2 a04_toggle.png
```

**`scripts/pack.mjs` is a 60-line MaxRects packer we own**, not a dependency. The runtime needs a specific JSON shape that the rig loader and the cabinet loader both read, and adding a package to a project with exactly one runtime dependency in order to place rectangles would be silly.

**Key against the sheet's own paper, not with `rembg`.** These objects sit on a known flat tone that the same generation produced; a threshold plus 6 px of manual cleanup per cell beats a segmentation model that eats the pale end of a linen bundle.

## 6.6 Map sheets

```bash
node scripts/extract-hachure.mjs sheet.png hachure.png     # then 12 min hand-correction
magick sheet.png -filter Lanczos -resize 1536x1536! sheet_ship.png
toktx --t2 --encode uastc --uastc_quality 3 --zcmp 18 --genmipmap MT-01.ktx2 sheet_ship.png
toktx --t2 --encode etc1s --clevel 4 --qlevel 255 --genmipmap MT-01_hx.ktx2 hachure.png
# heightfield is hand-painted in Krita and shipped as a raw 256² R8 PNG — 65 KB, no encode
```

## 6.7 Tiling textures — generated seamless, never upscaled

```bash
# ComfyUI: circular VAE tiling ON, wash-v1 strength 0.95, 1024×1024
magick in.png -filter Lanczos -resize 512x512! ship.png
node scripts/seam-check.mjs ship.png                       # must pass before encode
toktx --t2 --encode uastc --uastc_quality 3 --zcmp 18 --genmipmap --assign_oetf linear T01.ktx2 ship.png
```

`--assign_oetf linear` on the R8 masks: they are data, not colour, and sRGB-decoding a granulation mask shifts every wash in the game by a few percent in a way that is very hard to diagnose.

## 6.8 Surveyor's overlays — no raster stage at all

Authored in Inkscape over the plate at 1600×900 logical. Stroke spec in `03c` §4.11. `svgo --multipass`, commit, rasterise once at scene load into an R8 texture. ~15 KB each.

## 6.9 File naming, one convention, no exceptions

```
{act}_{scene}_{type}_{subject}[_{qualifier}]_v{NN}.{ext}

act        a01–a08, or gl for global/shared
scene      s01–s99, or xx for non-scene assets
type       the 16 codes in §2.4
subject    kebab-case
qualifier  layer L0–L4 · stage st1–st3 · band lo/mid/hi · mood m-hope/m-grim ·
           state · pose · variant
```

**Version numbers never reset and never get reused.** `v03` superseding `v02` means `v02` stays in `raw/` and in the ledger forever. This is what makes the `supersedes` chain a history rather than a claim.

## 6.10 Directory layout

```
art/
  corpus/source/ · corpus-manifest.csv     # provenance
  models/  wash-v1 · wash-map-v1 · gw-face-v1 · *.trainconfig.json    [Git LFS]
  graphs/  wash-prod-v1.json               # frozen
  prompts/ style-block.txt · char-*.txt · doc-*.txt · map-*.txt · ui-*.txt ·
           tile-style-block.txt · light-laws.md · npc/*.txt
  refs/    costume plates · master portraits · palette plates
  blockout/                                # hand-drawn compositions — authorship evidence
  raw/     every accepted generation, untouched, PNG          [Git LFS, not shipped]
  work/    PSD/KRA layered files                              [Git LFS, not shipped]
  overlay/ 12 surveyor SVGs
  dist/    shipped assets only                                # what the build consumes
  qa/      ocr-report.json · seam-report.json · budget-report.json
  ledger.jsonl
```

---

# 7. THE LOCKED PROMPT FILES — the complete registry

Twenty-two files. **Nobody retypes any of them; the pipeline script concatenates them.** Editing one in place without a version bump is the fastest way to desynchronise the art set, and the ledger records which version produced each asset.

| File | Guide | Applies to |
|---|---|---|
| `style-block.txt` | `ai-guide` §2.1 | **every generation in the project**, appended last |
| `light-laws.md` | `ai-guide` §5.5 | every act-scoped generation, verbatim |
| `env-style-block.txt` | `03a` | diorama plates, Gilt Frames, interludes |
| `env-camera.txt` | `03a` | the exterior camera line, byte-identical on all 27 |
| `env-framing.txt` | `03a` | proscenium / slip-stage |
| `env-negative.txt` | `03a` | places |
| `char-style-block.txt` | `03b` §1.1 | every character generation |
| `char-framing.txt` | `03b` §1.2 | portrait / witness / cutout / emblem |
| `char-negative.txt` | `03b` §1.4 | people |
| `char-negative-german.txt` | `03b` §1.5 | the one permitted variant |
| `char-washington.txt` **v2** | `03b` §2.1 | 16 portraits, 3 stance sheets |
| `char-washington-stage.txt` | `03b` §2.3 | three war stages |
| `char-washington-band.txt` | `03b` §2.4 | three stat bands |
| `npc/<subject>.txt` × 36 | `03b` §4 | one per portrait subject |
| `doc-style-block.txt` | `03c` §1.4 | paper, hands, furniture |
| `doc-framing.txt` | `03c` §1.5 | sheet / opening / study |
| `doc-negative.txt` | `03c` §1.6 | things |
| `map-style-block.txt` | `03c` §4.3 | six sheets + tokens (`wshmap`) |
| `map-framing.txt` | `03c` §4.4 | mapsheet / token |
| `map-negative.txt` | `03c` §4.5 | maps |
| `ui-style-block.txt` | `03c` §5.2 | R4 engraved |
| `ui-negative.txt` | `03c` §5.2 | R4 engraved |
| `tile-style-block.txt` | `03c` §6.3 | the ten tiling textures |

**Assembly, universal:**

```
[SUBJECT LINE]        →  [CHARACTER LOCK, Washington only]  →  [CLASS ANCHOR]
→  [FRAMING LINE]  →  [ACT LIGHT LAW]  →  [style-block.txt]  →  [NEGATIVE]
```

Subject first. Identity token first of all where there is one. Light law before the shared style block, never after. Shared style last. Negative last of all.

**Frozen sampler settings, project-wide**, living in the graph file and not in anyone's head:

```
sampler euler · scheduler simple · steps 28 · guidance 3.2
lora strength: 0.85 default · 0.70 portraits · 0.60 R4 engraved
               0.95 tiling textures · 0.95 map sheets (wash-map-v1)
seed families: act*10000 + scene*100 · portraits 20000 · props act*10000+1
               maps 70000+act*100 · prompts/paper 90000 · tiling 95000
```

**Never change two variables at once.** Prompt change → hold seed. Seed sweep → hold the prompt byte-for-byte.

---

# 8. BUDGETS, AND THE ONE ASK

| Bucket | `ai-guide` §6.5 | `05` §13.3 asked | **This guide's actual** | Verdict |
|---|---|---|---|---|
| Initial download (shell + Act 1 Scene 1) | ≤ 8 MB | ≤ 8 MB | **5.6 MB** | ✓ met, unchanged |
| Per-act lazy chunk | ≤ 12 MB | ≤ 18 MB | **peak 19.9 MB (Act 4)** | **raise to ≤ 21 MB** |
| Total shipped art | ≤ 85 MB | ≤ 155 MB | **170.5 MB** | **raise to ≤ 175 MB** |
| Total audio | ≤ 12 MB | — | 9.5 MB (Opus, `06` §8.2) | ✓ met |
| Peak GPU texture, one scene | ≤ 120 MB | ≤ 120 MB | **~9 MB** typical, 65 MB worst | ✓ met, 1.8× headroom |
| Peak JS heap | ≤ 180 MB | ≤ 180 MB | ~66 MB | ✓ met |

**The ask, stated once so it can be granted or refused as a decision.** The total is never downloaded at once: the game is eight lazy-loaded chunks and the only numbers a student experiences are the **initial** one and the **prefetch** one. Initial download is 5.6 MB and interactive in under 15 s on 5 Mbps shared district wifi. The peak per-act chunk of 19.9 MB is prefetched during the *previous* act's forty minutes of play — **66 kbps against a prefetch window three orders of magnitude larger than the requirement.** The constraint that could actually crash a 4 GB Chromebook is peak GPU texture, and it has 1.8× headroom at its worst and 13× at its typical.

**The 85 MB figure was a guess made before a scene inventory, a shader, or a document model existed. Raise total to 175 MB and per-act to 21 MB. Hold initial at 8 MB, which is the one that matters and which we are 30% under.**

If the total is genuinely immovable, `05` §13.4 names the seven plates that die in order and recommends against it. That recommendation stands: items 5 and 6 on that list remove the Grand Union flag beat and the finished-house reveal — two of the six best pedagogical moments in the game — to save 24 MB that no student ever waits for.

---

# 9. CONSOLIDATED ERRATA — what is currently wrong in which document

Every erratum raised by the three prompt guides, in one place, so a reader of an older document knows what has moved. **In every row, the prompt guide wins.**

| # | Against | Issue | Resolution |
|---|---|---|---|
| **E-A1** | `05` §0.1 propagation | `02` §3.2's act table and `02` §1.3's Gilt Frame rows 6/7 are still in the pre-correction act order | Yorktown is **Act 6**, Newburgh **Act 7**. Filenames `a06_…yorktown`, `a07_…newburgh` |
| **E-C1** | `ai-guide` §3.3 | Washington's Stage 2 and Stage 3 both given as "early fifties" | He is **45** at Valley Forge, **49–51** in Acts 6–8. Integer ages in words, never decade words |
| **E-C2** | `02` §6.2 | Stage I carries the light blue ribband, but Act 1 is 4 May 1775 and the ribband was ordered 14 July | Stage I ships **six** files; three Act 1 variants without the sash. Zero generations |
| **E-C3** | `02` §6.2 | Portrait count 9 + 1; the Newburgh spectacles need a variant in all three Stage III bands | **16 Washington files.** Zero generations; three masked inpaints |
| **E-C4** | `ai-guide` §2.5 | 4-up expression sheets guarantee palette but not identity | Expression variants are **masked img2img off the signed master.** Saves 12 generations |
| **E-C6** | `05` §13.2 | 26 stance sheets → 26 rigged atlases | 26 sheets → **12 rigged atlases + 14 static billboard sets.** Segmentation drops 11 hours |
| **E-C7** | `ai-guide` §4.3 | 11-piece rig | **12 pieces + 1 alternate head rect** — the full-skirted coat earns `coat_skirt` as a swinging piece |
| **E-S1** | `04` §6 | Dialogue assumed inkjs | **JSON replaces ink** (`06` §5.0). Reachability and satisfiability over a closed grammar is a BFS; over bytecode it is program analysis |
| **E-S2** | `02` §3.6 | The portrait band bound to the mood controller `W`, which contains a time term | Portraits use a separate snapshot scalar **`C`**, exempt from everything (`07` §4.1). One signal, one cause |
| **E-S3** | `02` §2.5 vs `04` §6.5 | The five Council ink hexes disagree | **`02` wins** |
| **E-D1** | `06` §5.6 | `document.schema.json`'s `paper` is a file path, implying 51 generated sheets | `paper` is a **stock ID**. Saves ~39 generations and ~18 MB |
| **E-D2** | `04` §7.2 | Scale bar and compass rose specified as engine-drawn | They are **drawings** — token-atlas cells. Their numerals stay type |
| **E-D3** | `04` §7.2 | Hachure alpha implied as a separate generation | **Extracted** from the accepted sheet. Zero generations, exact registration |
| **E-D4** | `05` §13.2 | Surveyor's overlays budgeted as 12 generations | **Zero.** Hand-drawn SVG — a model cannot register to an existing plate. Saves 12 generations, 4.6 MB |
| **E-D5** | `04` §7.1 | Map-table IDs and two of six subjects predate the act-order correction | **`05` wins.** `MT-01`–`MT-06` |
| **E-D6** | `ai-guide` §5.7 | Four of ten tiling textures have no consumer; two required ones missing | Ten replaced one-for-one, each with a named consumer |
| **E-D7** | `05` §13.3 | Props costed as one channel | **Two channels** — DOM cabinet + GPU toggle. +9.6 MB, and it is what makes 207 objects affordable |
| **E-D8** | `02` App. B | No gold in the palette; the Gilt Frame requires gilding | **`GILT #A98A4B` / `GILT-HIGH #D8C489` / `GILT-DEEP #6B5426`** — R6 only, never under type |
| **E-D10** | `05` §13.2 | 24 prop sheets, and `03b` also draws the hands library from that budget | **23 in `03c`, 1 in `03b`** |

## 9.1 The open verification queue — items that block generation

| # | Item | Owner | Blocks |
|---|---|---|---|
| **V-1** | Hessian facing colours at Trenton | History | `A4P-2` prop sheet · Rall's portrait · the Trenton crowd sheet |
| **V-C2** | A documented name from the 1st Rhode Island muster rolls | History | the soldier's *name*; the portrait is not blocked |
| **V-C5** | Whether Horatio Gates habitually wore spectacles | History | Gates's portrait and the Act 7 spectacles rhyme |
| **V-C6** | The green ribband for aides-de-camp, GO 14 July 1775 | History | Hamilton's re-coat pass |
| **V-D2** | Whether paper watermarks should be a specific documented device | History + Art Lead | `P01`, `P10`. Generated generic pending resolution |
| **V-D5** | The Book of Negroes' physical format | History | `DOC-EP.1`. **The last object in the game, and the one nobody should get wrong** |
| **V-D7** | A period source for `MT-06`'s Ohio survey grid predating the 1785 Land Ordinance | History | **`MT-06`** — the sheet's entire argument rests on the grid being defensible |
| **V-13** | The 3 June 1776 congressional pressure on New York | History | the game's single most important Council line (`07`) |

---

# 10. WEEK ONE, ON ONE PAGE

1. Subscribe Midjourney Standard ($30). Art-direct for two weeks. Cancel after step 3.
2. Pull 400 candidates from YCBA, the Met, the Rijksmuseum, the Anne S. K. Brown collection and the Rochambeau maps. Curate to 48 for `wash-v1` and 24 for `wash-map-v1`. Fill `corpus-manifest.csv`.
3. Train `wash-v1` on fal.ai (~$3–4/run, budget 6). Run the seven-plates gate.
4. Freeze `wash-prod-v1.json`. Commit all models via Git LFS.
5. **Build `verify-ledger.mjs`, `no-text.mjs`, `bare-paper.mjs`, `seam-check.mjs` and `budget.mjs` before the first asset ships.**
6. Generate **`P01`**, then **`T01`**, then **`W5`**. Three assets, and everything else in the project is downstream of them.
7. Produce **Act 1, Scene 1** end to end — blockout → generate → slice → mask → encode → ledger → in-engine. **Time it. That number × 27 is the schedule.**
8. Start the sign-off clock on the six `sensitive` assets. It is two weeks of calendar and it cannot be compressed.

**And the one thing to put on the wall:**

> **194 generations. 405 files. Four locked LoRAs, twenty-two locked prompt files, one frozen graph, one append-only ledger.**
> **Nothing in this game is generated twice, and nothing readable is generated at all.**
