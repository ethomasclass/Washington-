# Scene & Camera Architecture
### "In Washington's Shoes" — how the game is staged, framed, walked and cut
**Version 1.0 — 14 August 2026**
**Owner:** Technical Director + Creative Director, jointly. **Audience:** engine, art, writing, audio, QA.
**Status:** binding. Supersedes the brief's §1 ("top-down, Zelda/Pokémon-style movement") and §5 (Phaser/tile-based).

**Upstream documents this one depends on and does not repeat:**
`reference/reference-game-analysis.md` (rules R1–R25), `reference/ai-art-production-guide.md` (§2 consistency stack, §6 hygiene), `reference/historical-visual-reference.md` (§0.2 Rule of the Canonical View, §5.2 the four registers, §7.2 Witness Register).

Where this document uses a rule ID like **R8**, it is citing the reference-game-analysis synthesis table and inheriting its rationale. Where this document gives a number, that number is the spec — not an example.

---

## 0. The three sentences that govern everything below

1. **A scene is one painted view that is never re-derived.** The camera does not discover the space; the space was composed for the camera, once, by a human, before the model ever ran.
2. **The player's only spatial verb is walking left and right along a plane inside that view.** Everything else — reading, examining, deciding — happens without moving.
3. **Depth is a stack of flat planes pretending, and the pretence survives only because the camera barely moves.** Every camera number in §2 is chosen to stay inside the illusion's tolerance, not to look impressive.

The failure mode this architecture exists to prevent is the one where a fixed-camera painted game starts wanting a second angle. It never gets one. Per the historical pack's §0.2: *if the script needs another side, it is a different location with its own canonical view.*

---

# 1. THE SCENE MODEL

## 1.1 Definition

A **scene** is the atomic authored, loadable, testable, shippable unit of the game. It is:

- exactly **one canonical composed view** of exactly one place at exactly one time,
- sliced into **five depth layers**,
- containing **one walk-plane**, **1–4 exits**, **≥12 interactables** (R3 density floor), **0–6 character spawn points**,
- with its own light/fog/LUT config, one ambient audio bed, and 3–6 spot sounds,
- authorable and testable in isolation, reading only from the global state object (**R24**).

A scene is **not** a level, not a room, not a location. Mount Vernon is a location; `a01_s01` (MV-01, "The Approach") is a scene. Valley Forge's Grand Parade in December and the same parade in May are **one plate, two scenes** — same `plate_id`, different `scene_id`, different props/figures/grade (**Pentiment lesson 2.3a**).

**Scene count: 41.** Fixed at act sign-off, and the number does not grow.

| Act | Scenes | IDs | Canonical views (historical pack §3) |
|---|---|---|---|
| 1 Mount Vernon | 4 | `a01_s01`–`s04` | MV-01 Approach, MV-02 Study, MV-03 The Quarter *(Witness Register)*, MV-04 The Dock |
| 2 Cambridge | 5 | `a02_s01`–`s05` | CB-01 Camp Street, CB-02 HQ Parlour, CB-03 The Lines, CB-04 Knox's Yard, **CB-MT map table** |
| 3 Long Island | 5 | `a03_s01`–`s05` | BK-01 Parapet, BK-02 Ferry Landing Night, BK-03 Parapet *(fog variant, same plate)*, BK-04 The Boats, **BK-MT** |
| 4 Delaware / Trenton | 7 | `a04_s01`–`s07` | DL-01 Embarkation, DL-02 The Ice, DL-03 The Far Bank, TR-01 King Street, TR-02 Old Barracks Yard, TR-03 The Prisoners, **DL-MT** |
| 5 Valley Forge | 6 | `a05_s01`–`s06` | VF-01 Brigade Street *(winter)*, VF-01b Brigade Street *(spring, same plate)*, VF-02 Potts House Interior, VF-03 Grand Parade *(mud)*, VF-03b Grand Parade *(model company, same plate)*, VF-04 The Hospital Hut |
| 6 Newburgh | 4 | `a06_s01`–`s04` | NB-01 Seven Doors, NW-01 The Temple Interior, NW-02 The Cantonment, NB-02 The Anteroom |
| 7 Yorktown | 6 | `a07_s01`–`s06` | YT-01 Second Parallel, YT-02 Redoubt 10 Night, YT-03 Surrender Road, YT-04 Allied Camp, **YT-MT**, YT-05 Headquarters Marquee |
| 8 Annapolis | 3 | `a08_s01`–`s03` | AN-01 The Chamber, AN-02 The Corridor *(one NPC — KRZ's short scene, §3.1)*, AN-03 The Chamber *(post, same plate)* |
| Interludes | 7 | `il_1`–`il_7` | Writing desk, one plate, seven light configs (**§5.5**) |

That is 40 walkable/map scenes + 7 interlude stills, using **34 unique painted plates** because 7 scenes are same-plate revisits. Thirty-four plates × 5 layers = **170 diorama layer images**, which sits inside the art guide's ~200-asset envelope with room for the eight apex-scene mood plates (**R12**).

## 1.2 Anatomy — the eight parts

Every scene manifest declares all eight. A scene that omits one fails the load-time validator in dev builds.

```
1. plate            the canonical painted view, sliced to L0–L4
2. walkplane        one polyline + a depth-scale curve
3. interactables    ≥12, each with a proper name (R22)
4. exits            1–4, each an interactable of type "exit"
5. spawns           entry points, one per inbound exit + one default
6. grade            light law, fog, LUT, per-scene 3-colour palette commit
7. audio            1 bed, 3–6 spots, 0–1 score cue
8. register         R1 | R2 | R3 | R4 | R5 — which visual register governs
```

### 1.2.1 The layer stack — exactly five, always five

**Naming convention: `L0`–`L4`, back to front. This is the art guide's §2.6 step-10 convention and it does not change here.** Every scene has all five layers even when a layer is nearly empty; an empty layer ships as a 4 KB transparent KTX2 rather than as an absent file, because a variable layer count means a variable shader path, and a variable shader path on a Chromebook means a shader compile stall at scene load.

| Layer | Name | Z (world units) | Parallax factor | Contents | Fog exposure |
|---|---|---|---|---|---|
| **L0** | `sky` | −40 | 0.10 | Sky, distant water, the far horizon wash. Often bare `PAPER`. | 1.00 |
| **L1** | `far` | −18 | 0.30 | Hills, treeline, the far bank, Boston across the water, town beyond the siege lines. | 0.72 |
| **L2** | `mid` | −6 | 0.62 | **The subject.** Buildings, tents, the earthwork, the hut street. The thing the scene is of. | 0.34 |
| **L3** | `near` | 0 | 1.00 | The walk-plane's own ground, near tents, the parapet the player walks behind. **Characters billboard at this Z.** | 0.10 |
| **L4** | `fore` | +7 | 1.55 | Foreground occluders: a gabion stack, a cart wheel, a tent flap, a tree trunk at frame edge. Player passes *behind* these. | 0.00 |

**Why five and not three, and not seven.**

Three layers cannot both (a) hold a far horizon and (b) give the player something to walk behind, which are the two things parallax is actually for here. Seven layers costs 2 more full-frame 2048×1152 textures per scene — at UASTC ~4.7 MB VRAM each that is **+9.4 MB per scene against a 120 MB ceiling**, plus 2 more draw calls per frame on integrated GPUs, and buys motion the player cannot perceive: at our maximum parallax offset (§2.3) the apparent displacement between adjacent layers in a 7-stack is under 2 px, which is below the threshold at which parallax reads as depth rather than as texture crawl. Five is where the curve flattens. It is also the number the art guide already priced and the number the slicing workflow already budgets 20–40 min/scene for.

**L4 is the layer artists will want to skip and must not.** A scene with no foreground occluder has no proof of depth — the player walks in front of a painting instead of inside one. Every exterior ships at least one L4 element that the player's cutout passes behind during normal traversal. This is a content-review gate.

**Layer files** follow the art guide's §6.2 convention exactly:
```
a04_s02_bg_river-camp_L0_v03.ktx2   … L4
a04_s02_bg_river-camp_L2_m-grim_v03.ktx2      (apex-scene mood variant, R12)
```
Layers ship at **2048×1152** — 12.5% overscan on a 1600×900 logical frame — and that overscan exists solely to feed the parallax dolly of §2.3. There is no budget for more.

### 1.2.2 The walk-plane

The walk-plane is a **polyline in scene space, not a polygon.** This is a deliberate simplification and it is the single decision that makes the whole thing cheap.

The player has one degree of freedom: a scalar `t ∈ [0,1]` along the polyline. Left/right input moves `t`. There is no free 2D movement, no pathfinding, no collision mesh. The polyline may curve — a road receding, a trench angling away — and the player's screen position and scale follow it, which reads as walking into depth without any of the cost of walking into depth.

```jsonc
"walkplane": {
  "points": [[0.06,0.78],[0.34,0.74],[0.61,0.69],[0.94,0.66]],  // normalized frame coords
  "scale":  [1.00, 0.92, 0.78, 0.62],                            // player cutout scale at each point
  "length_px": 3180,                                             // computed, for the R9 check
  "speed_px_s": 400
}
```

**Scale range is locked project-wide: `1.00` at the nearest point, never below `0.58` at the farthest.** This binds directly to the art guide's §5.6 validation — a 220 px near silhouette to a 130 px far silhouette is a 0.59 ratio, so a walk-plane that asks for more than that is asking for a plate whose camera is inconsistent with the rest of the game. The validator rejects it.

**R9 is enforced mechanically.** At scene load in dev builds, the engine walks the polyline, finds the farthest interactable's anchor `t`, and computes `distance / speed`. If any interactable is more than **8.0 s** from the default spawn, the scene fails to load with a console error naming the offending interactable. At 400 px/s on a 1600 px frame that permits ~3,200 px of walk-plane, or two screen widths. This check ships in dev, not in production, and it has caught the "Where the Water Tastes Like Wine" failure before the art is made rather than after.

**Multi-plane scenes: no.** A scene has exactly one walk-plane. If the composition wants an upper terrace and a lower yard, those are two scenes with a cut between them. This is not a limitation to work around; a second plane doubles the depth-sort problem (§4.4) and adds a traversal affordance the player has to learn.

### 1.2.3 Interactables

```jsonc
{
  "id": "a02_s01_int_ration_barrel",
  "name": "the empty beef barrel from Wethersfield",   // R22: proper name, never a category
  "anchor_t": 0.42,                                     // position along walk-plane
  "anchor_offset": [0, -34],                            // px offset from walk-plane for the glyph
  "layer": "L3",                                        // which layer it visually belongs to
  "radius_t": 0.055,                                    // proximity band, ~140 px at typical length
  "kind": "examine" | "converse" | "document" | "exit" | "maptable" | "decision",
  "ink": "art/dist/ui/glyph_examine.webp",
  "knot": "a02_s01_barrel",                            // ink knot name
  "variants": ["band_hi","band_mid","band_lo"],         // R12 text variants
  "sensitive": false
}
```

Density floor per scene, enforced at content review, inherited verbatim from the reference analysis §1.3: **≥12 interactables; ≥8 with ≥40 words of unique examine text; ≥1 that contradicts an NPC in the same scene (R3); ≥3 with stat-band or act-progression variants; ≥1 primary source that unlocks a knowledge-locked option elsewhere in the act (R2).**

### 1.2.4 Exits, spawns, grade, audio, register

**Exits** are interactables of `kind: "exit"` with a `target_scene` and a `target_spawn`. They sit at the extreme ends of the walk-plane in 80% of scenes and mid-plane (a doorway the player walks *into*) in the rest.

**Spawns** are `{id, t, facing}`. Every scene declares `spawn_default` plus one spawn per inbound exit, so arriving from the parlour puts Washington at the parlour door, not at the scene's left edge. A scene reachable from three places has three spawns. This is the only piece of inter-scene coupling permitted under **R24**, and it is data, not logic.

**Grade** carries the act's light law verbatim from the art guide §5.5, the per-scene palette commit (KRZ §3.5 — one dominant, one recessive, one accent, enforced by LUT), fog colour/density, and the mood binding:
```jsonc
"grade": {
  "light_law": "act05",
  "key": {"azimuth_deg": -35, "elevation_deg": 15, "color": "#D8CBB0", "intensity": 0.72},
  "fog": {"color": "#C6CBC9", "density_base": 0.020, "density_mood_gain": 0.014},
  "lut": "lut_act05.png",
  "lut_mood_mix": [0.15, 0.35, 0.60],     // hi / mid / lo morale bands
  "palette": {"dominant":"#9C8C74","recessive":"#EFE7D5","accent":"#243B5E"}
}
```

**Audio** per the reference analysis §1.5: one 30–60 s seamless mono bed, 3–6 spot one-shots on randomised 10–40 s timers panned to their source interactable's `anchor_t`, and an optional score cue. **≥1 scene per act declares `"score": null`** (**R15**); Act 8 declares `null` on all three until its final beat.

**Register** names which of the five visual registers governs the scene: R1 topographical pen-and-wash (default, all exteriors), R2 tinted survey map (map tables), R3 painted portrait (portrait layer only), R4 engraved print (UI, council, letterbook), **R5 Witness Register** (`a01_s03` and the two later enslaved-people scenes). The register is not decoration — it changes the camera (§3.4), the ambient motion, and the wash, per the historical pack §7.2.

## 1.3 The scene manifest, complete

One file per scene, `content/scenes/a02_s01.json`, hand-authored, schema-validated in CI. Ink knots live separately in `content/ink/act02.ink` and compile to `act02.json`; the manifest references knot names only. This is the 80 Days separation (**R24**) and it is what lets the writer work in Inky while the engine ships.

---

# 2. THE CAMERA

## 2.1 The camera is a lie and here is its exact shape

There is a `THREE.PerspectiveCamera` in the scene. It is not there to be a camera. It is there so that (a) five parallax planes at different Z produce correct relative displacement for free, and (b) fog is per-fragment and distance-correct. It is otherwise nailed down.

```
fov:            28°  (vertical)
aspect:         16:9, letterboxed on non-16:9 panels
near / far:     0.1 / 120
position:       (0, 0, 24) at rest, per-scene Z override ±3
target:         (0, 0, -6)   — always looking at L2, the subject layer
up:             (0,1,0), locked
roll:           0.000, locked, no exceptions
```

**Why 28° and not 50°.** A wide FOV makes the parallax planes fan out — the edges of L4 and L1 diverge sharply from the centre, and the painted plate, which was generated as a flat image under an implied *normal lens* (art guide §5.6: "normal lens, no wide-angle distortion"), starts to disagree with the geometry it is mapped onto. At 28° vertical the planes are close enough to orthographic that the plate's own internal perspective and the scene's geometric perspective never visibly fight, while retaining enough divergence that a 4% dolly produces readable relative motion. Below ~22° the parallax dies; above ~35° the plates start to shear. 28° is the middle of the working band, and it is frozen project-wide so that a character cutout's on-screen size is identical in every scene.

**Camera Z is the only per-scene camera parameter**, permitted to vary ±3 units to accommodate compositions that need a slightly tighter or looser read. It is set once at scene sign-off and recorded in the manifest. It is not animated.

## 2.2 The permitted moves — a closed list

The camera may do exactly four things. Anything not on this list is a bug.

| # | Move | Frequency | Trigger |
|---|---|---|---|
| 1 | **Parallax breath** — damped lateral offset following the player | Continuous, always on | Player position on walk-plane |
| 2 | **Scripted move** — a slow dolly or push at an act's apex | **≤1 per act** (**R8**) | Authored beat |
| 3 | **Cut** — instantaneous replacement of the whole scene | On exit traversal | Player |
| 4 | **Portrait push** — a 3% push-in during a dialogue block | Per dialogue entry | Dialogue system |

No rotation. No orbit. No player zoom. No shake. No handheld noise. No look-at retargeting. No debug free-cam in a shipped build (strip it at the Vite `define` level; a fly-cam that ships is a fly-cam a student finds).

## 2.3 Move 1 — the parallax breath, numerically

```
input:            player.t  ∈ [0,1]
mapped:           x_target = (player.t − 0.5) × 2 × MAX_OFFSET
MAX_OFFSET:       0.040 × frame_width  =  64 px at 1600 logical  (R8: ≤4%)
damping:          critically damped spring, ζ = 1.0, τ = 250 ms
                  (ω = 4.0 rad/s; implement as an exponential smoothing
                   with α = 1 − exp(−dt/0.25), applied twice for C¹ continuity)
vertical:         y_target = −0.010 × frame_width × (player.t − 0.5)  = ∓16 px
                  (a slight rise as the player walks into depth; sells the ground plane)
clamp:            hard clamp at ±64 px x, ±16 px y — the 12.5% overscan gives 128 px
                  of margin per side, so we use half of it and never expose a seam
```

The camera's world-space translation is `x_target / pixels_per_unit`. Because L0 sits at parallax factor 0.10 and L4 at 1.55, a full 64 px camera move displaces L0 by ~6 px and L4 by ~99 px relative to the frame — a 93 px spread across the stack. That spread is the entire depth illusion, and it is large enough to read and small enough that no layer ever runs out of overscan.

**The `τ = 250 ms` lag is not a technical artefact; it is the whole feel.** The camera arrives after the player does. A 1:1 camera makes the painting feel like a background sliding behind a sprite. A late camera makes the player feel like they are moving through something that has weight.

**Never 1:1. Never snap. Never ease-out-only.** A camera that catches up and stops has an arrival; a critically damped camera has none, which is what "breathing" means.

## 2.4 Move 2 — the scripted move

**One per act, maximum, at the act's emotional apex (R8).** Eight in the whole game. They are authored in the scene manifest as a named clip and they are the only place a camera keyframe exists.

```jsonc
"scripted_moves": [{
  "id": "a07_apex_pullback",
  "trigger": "ink_tag:CAM_APEX",
  "duration_ms": 6000,
  "ease": "cubic-in-out",
  "from": {"z": 24, "y": 0,   "fov": 28},
  "to":   {"z": 38, "y": 2.5, "fov": 28},
  "parallax": "suppressed",       // breath is disabled for the duration + 800 ms
  "input": "locked_walk"          // player may not walk; may still open the letterbook
}]
```

**Duration is 4,000–7,000 ms. Nothing shorter reads as deliberate; nothing longer survives a classroom.** The eight moves, nominated now and not expanded:

| Act | Move | Duration | What it discloses |
|---|---|---|---|
| 1 | Lateral drift left→right across the forecourt as Washington mounts | 5,000 ms | The unfinished north wing entering frame; he is leaving a building site |
| 2 | Slow push toward the spyglass position on CB-03 | 4,500 ms | Boston resolving out of the horizon wash |
| 3 | Slow push down toward the waterline at BK-02 | 5,500 ms | The boats; the scale of what must be moved before dawn |
| 4 | Slow lateral along the Durham boat at DL-01 | 6,000 ms | The length of it — 40–60 ft crossing the whole frame |
| 5 | **Push-in on VF-03 so slow the student is unsure it is moving** | 7,000 ms | Nothing. That is the point. The field does not change. |
| 6 | Push toward the seven doors at NB-01 | 4,000 ms | The doors, one at a time, as pressure |
| 7 | **The pullback at YT-01** — the game's most expensive camera moment | 6,000 ms | The siege lines resolve into the map-table view (§7.4) |
| 8 | **Pullback from the bar of the house at AN-01, disclosing the gallery** | 7,000 ms | Molly Ridout watching from above. The room is half empty. |

Acts 5 and 8 spend theirs on near-imperceptibility, per the reference analysis §1.4. Act 7's is the transition-into-map-table and is spec'd fully in §7.4.

**During a scripted move, the parallax breath is suppressed and re-enabled over 800 ms afterwards** so the camera does not lurch back to its player-driven offset at the end of the clip.

## 2.5 Move 4 — the portrait push

When a dialogue block opens (§6), the camera pushes **3% (Z −0.7 units) over 400 ms, cubic-out**, and holds. When dialogue closes it returns over 600 ms. This is small enough to be subliminal and it does one job: it separates *the world* from *the conversation* without a fade, a blur, or a vignette, all three of which fight the ink-and-wash style.

Simultaneously the scene's L0/L1 layers desaturate by 12% and fog density rises by 0.006 — again subliminal, again free, and it buys contrast behind the dialogue panel without dimming the plate, which would look like a UI scrim and read as a different game.

## 2.6 What the camera never does, restated for the record

**No depth-of-field.** The style block forbids `depth-of-field blur` in generation (art guide §2.1) and the renderer must honour the same ban. A bokeh pass on a pen-and-wash plate looks like a photograph of a drawing.

**No bloom, no glow, no rim light, no lens flare.** Same source, same reason. Torchlight in Act 4 is painted into L2/L3, not simulated.

**No screen shake, ever, including at Yorktown.** The reference analysis' whole argument is that this game's violence is off-frame and in the ledger. Shake is the grammar of on-frame violence.

**No motion blur.** Cutouts animate at 12 fps stepped (Pentiment §2.1a); blur on stepped animation is incoherent.

---

# 3. PERSPECTIVE SPEC

Two framings. Every scene in the game is one or the other, declared in the manifest as `framing: "exterior_3q" | "interior_elevation"`, with the Witness Register (§3.4) as a documented modifier on either.

## 3.1 Exterior — shallow elevated three-quarter

**The number: the camera is 4.0–5.0 m above the walk-plane, pitched down 18–22°, target 20°. Normal lens (~40 mm equivalent, ~50° horizontal FOV in the *painted* image). Horizon high in the frame, at 0.22–0.32 of frame height from the top.**

**Rationale.** 20° is the shallowest pitch at which a walk-plane reads as ground rather than as a line, and the steepest at which a standing figure still reads as a *figure* rather than as a shape seen from above. Below ~14° the ground plane collapses and the player cannot tell where they can walk; above ~28° you are approaching the top-down view decision #3 killed, foreshortening starts eating the figures' heads, and — decisively — you leave the register. **The period's own military topographical draughtsmen drew from exactly this station point**: a man on a low rise, recording ground he intends to fight over. Sandby, Davies, Robertson and Berthier all sit in the 15–25° band. Choosing 20° is not a compositional preference, it is inheriting a documented drawing convention, which is precisely what makes the AI model's job tractable — the corpus the `wash-v1` LoRA trains on is *already* full of this angle.

**The prompt line. This is the exact text, byte-for-byte, appended to every exterior generation** (it is the art guide's §5.6 camera line, and this document ratifies it unchanged rather than inventing a competing one):

```
CAMERA: shallow elevated three-quarter view, as if standing on a low rise about
four metres above the ground and looking down at roughly twenty degrees. Normal
lens, no wide-angle distortion, no fisheye, horizon high in the frame.
```

**Written for the model, not for us.** "About four metres above the ground," "roughly twenty degrees" and "horizon high in the frame" are all things a diffusion model has seen captioned; "20° pitch, 40 mm equivalent" is not. Do not improve this line into technical language — it will get worse.

**Validation before acceptance** (art guide §5.6, restated as a gate this document owns): composite a flat grey Washington silhouette at three points along the intended walk-plane. **Near must be 210–230 px; far must be 125–140 px, in a 900 px frame.** Outside that band the plate is rejected and the blockout is redrawn — not the prompt.

## 3.2 Interior — near-frontal theatrical elevation

**The number: the camera is at 1.5–1.7 m — standing eye height — pitched down 0–6°, target 3°. Frontal to within ±12° of the room's principal wall. The floor occupies 0.30–0.40 of frame height. Deliberately flatter than correct.**

**Rationale.** This is Pentiment's frontality (reference analysis §2.1b) and it is an *assertion*, not a compromise. A near-frontal elevation with a slightly-too-shallow floor and slightly-too-parallel orthogonals reads as period draughtsmanship — the way an 18th-century architectural elevation or a stage set is drawn. A *nearly* correct one-point perspective reads as an image model that couldn't quite hold vanishing points, which is the single most common tell of AI interiors. **Push flatter than is comfortable.** The style must look chosen.

This framing also solves Newburgh for free: NB-01 "Seven Doors" is dead-on frontal, and seven doors ranged across a wall is a composition that only works frontally. A three-quarter view of that room throws four of the doors into foreshortening and the whole scene loses its argument.

**The prompt line, exact text:**

```
CAMERA: near-frontal theatrical elevation, as if looking straight into a shallow
stage set from the height of a standing person. The back wall is parallel to the
picture plane. Very slight downward angle only. The floor is a shallow band across
the bottom of the frame. Symmetrical, flat, and deliberately without deep
perspective recession.
```

**Interior walk-planes are near-horizontal** — scale range compresses to 1.00 → 0.86 rather than 1.00 → 0.58, because a frontal room has almost no depth to walk into. This is correct and expected; the manifest validator uses a separate scale band for `interior_elevation`.

**Act 8 is frontal and symmetrical to the pixel.** AN-01 is dead-on, mirror-symmetric, camera on the room's centreline. The historical pack's note is the direction: *symmetry is the argument — the room is balanced because power is being balanced.* Everything else in the game is asymmetric; this one shot is not, and it lands because of the 40 scenes before it.

## 3.3 The two framings in one table (for the art bible's front page)

| | Exterior 3Q | Interior elevation |
|---|---|---|
| Camera height above walk-plane | **4.0–5.0 m** | **1.5–1.7 m** |
| Pitch (down from horizontal) | **20°** (18–22) | **3°** (0–6) |
| Yaw from principal plane | 25–40° | **0°** (±12 max) |
| Horizon height in frame | 0.22–0.32 from top | 0.42–0.50 from top |
| Floor/ground band | 0.35–0.50 of frame | 0.30–0.40 of frame |
| Walk-plane scale range | 1.00 → 0.58 | 1.00 → 0.86 |
| Player near-silhouette height | 210–230 px @900 | 250–280 px @900 |
| Register | R1 topographical | R1 / R3-adjacent |
| Used in | 24 scenes | 16 scenes |

## 3.4 The Witness Register modifier

Per the historical pack §7.2, scenes depicting enslaved people use **R5**, which changes the camera in two of its five parameters:

- **Camera height drops to eye level with the standing figure** — 1.6 m, pitch 0°, *even for an exterior*. MV-03 "The Quarter" is an exterior shot taken at interior height. The camera is level with a person's face and never above it.
- **Framing tightens**: the figure occupies more of the frame than the building does.

Plus the three non-camera parameters: single grey wash only (colour reserved for personal possession), no atmospheric haze/fog/golden light, and **no ambient motion** — which is a scene-architecture instruction, not just an art one. In an R5 scene the engine sets `ambient_motion: false`, which disables the parallax breath's vertical component, all idle animation on billboards, and every spot audio one-shot that is decorative rather than caused. **Figures move when they act, and stop.**

**R5 scenes: `a01_s03` (MV-03, The Quarter), `a02_s04b` (the Dunmore decision antechamber), `a07_s04b` (the 1st Rhode Island at the allied camp).** Three scenes. Each carries `sensitive: true` in the ledger and does not ship without the §7.6 sign-off.

---

# 4. MOVEMENT & CONTROL

## 4.1 The control scheme

**Keyboard-first. The entire game is completable with four keys.** This is a Chromebook product; trackpads on district hardware are bad and mice are not guaranteed.

| Input | Action |
|---|---|
| **← / →** or **A / D** | Walk left/right along the walk-plane |
| **↑ / ↓** or **W / S** | Cycle the interaction target (§4.5); in dialogue, move the option cursor |
| **Space** or **Enter** | Interact with the targeted thing; advance dialogue; confirm an option |
| **Esc** | Close dialogue / close letterbook / open the pause page of the letterbook |
| **Tab** | Open the letterbook (the one meta-UI object, **R19**) |
| **Hold `M`** | The surveyor's overlay on the 12 scenes that have one (reference analysis §1.4) |
| **`.` (period)** | Skip the current text reveal to complete — same as any key, listed for discoverability |

**No modifier keys. No key combinations. No mouse required. No double-tap. No hold-to-run.** A student with a motor accommodation who uses a single-switch or a head pointer needs every action to be one discrete press, and every action here is.

**Mouse/trackpad, where present, is a convenience layer only:** click an interactable's glyph to walk to it and interact; click a dialogue option to select it; click the ribbon to open the letterbook. Nothing is mouse-only. The engine never requires a hover state to reveal information (hover reveals the glossary gloss, but so does keyboard focus — §8.6).

**Touch** (Chromebooks in the fleet are frequently touchscreen convertibles, and the client may want tablets):
- **Tap left / right third of the screen** → walk that direction while held. **Tap the centre third** → interact with the current target.
- **Tap an interactable glyph directly** → walk to it and interact.
- **Tap a dialogue option** → select. Options are laid out with **≥44 px minimum touch height** at all text scales (§8.1).
- **Swipe down from the top** → letterbook. No other gestures. No pinch, no long-press, no two-finger anything.

**Gamepad:** left stick / d-pad = walk, up-down = target cycle, A = interact, B = back, Y = letterbook. Twenty lines of code via the Gamepad API, and it makes the game playable on a classroom TV. Not a priority, but not excluded.

## 4.2 Walk speed and its consequences

**400 px/s at 1600 logical width, constant. No run. No accelerate.**

Derivation: the R9 budget is 8 s to the farthest interactable; a comfortable maximum walk-plane is ~2 screen widths ≈ 3,200 px; 3,200 / 8 = 400. The number falls out of the density rule rather than out of feel, which is correct — feel is what you tune when you have no constraint, and here we have one.

At 400 px/s a typical 2,400 px walk-plane crosses in 6 s. Washington's cutout is ~220 px tall; he covers about 1.8 body-heights per second, which is a purposeful walk, not a stroll and not a jog. The historical pack's characterisation — *"he is still; in a scene full of motion he is the one figure at rest"* — is honoured by the animation (§4.3), not by making him slow.

**Acceleration:** 0 → full over **120 ms**, full → 0 over **140 ms**, both cubic. Long enough that a tap doesn't teleport him, short enough that the control never feels floaty. Turning is instantaneous — the cutout swaps facing on a single 12 fps step, which is a *paper puppet flipping over*, and it is the correct reading.

**Act 5's exhaustion.** The brief wants Valley Forge to feel slower. **Do not reduce walk speed** — it breaks the R9 budget and it is an annoyance, not an emotion. Instead: in Act 5 the puppet's step cadence drops from 8 steps/s to 6, the stride lengthens to compensate so ground speed is unchanged, and the idle-sway amplitude halves. He is walking the same distance in the same time, more heavily. This is free, it works, and it does not cost the student a second of their class period.

**One exception to constant speed, and it is scripted:** during a scripted camera move with `input: "locked_walk"` the player cannot walk at all. There is no slow-walk state anywhere in the game.

## 4.3 The player cutout in the scene

Washington is an 11-piece segmented paper puppet (art guide §4.3) on a billboarded quad at **L3's Z (0)**. Three facings exist — front, three-quarter-left, profile-left — mirrored horizontally for right. Because the camera is fixed, three is genuinely all that is needed.

- **Animation: 12 fps stepped** (**Pentiment §2.1a**). The puppet's transforms are quantised to 1/12 s. Never interpolated to render framerate.
- **Clips:** `idle` (12 f loop, a sway and a coat-shift), `walk` (8 f loop), `turn` (2 f), `stop` (3 f), `gesture_listen` (6 f, used at conversation range), `mount` (Act 1 only, 14 f). Six clips for the whole game.
- **Scale** is driven by the walk-plane's scale curve, applied to the quad, sampled at the puppet's `t` and **rounded to the nearest 1/64** to prevent shimmer as he walks.
- **He does not have a shadow.** A cast shadow on a wash plate needs to match the plate's painted shadows exactly and will not. Instead: a **painted contact mark** — a soft 40×12 px iron-gall smudge at his feet, at 30% opacity, scaled with him. It grounds him and it is drawn, not simulated.
- **Washington's head is above the crowd line, always** (historical pack §2.1). NPC billboards at the same walk-plane `t` are authored 8–12% shorter. This is the free findability affordance a fixed-camera game gets from the man being 6'2", and it means the player never loses themselves in a crowd scene.

## 4.4 Depth sorting

This is the part that goes wrong in every parallax game, so it is specified exactly.

**Rule: sorting is by declared layer, never by computed Z, and never by the renderer's automatic transparency sort.**

Every drawable in a scene carries an integer `sort_key`:

```
L0 sky          =    0
L1 far          = 1000
L2 mid          = 2000
  (NPC billboards declared "behind mid" = 2500)
L3 near         = 3000
  characters on the walk-plane = 3500 + round(t × 100)
L4 fore         = 4000
  screen-space overlays (grain, vignette) = 9000
```

Materials render with `depthTest: false, depthWrite: false`, and the renderer draws strictly in `sort_key` order via `renderOrder`. Three.js's own transparency sorting is disabled for the scene graph (`renderer.sortObjects = false`). Reasons: (1) painted layers have soft wash alpha at every edge, and depth-tested alpha produces hard cutouts exactly where the style needs softness; (2) a computed-Z sort on coplanar quads Z-fights on integrated GPUs, which is the most common visual bug on the target fleet; (3) an explicit integer order is inspectable, diffable, and cannot surprise you at 3 a.m.

**Characters sort among themselves by walk-plane position**: `3500 + round(t × 100)` means a character further along the plane (deeper) draws first, and the player walking past an NPC correctly passes in front of or behind them. Two characters at the same `t` are prohibited by a load-time validator (spawn points must be ≥0.02 apart in `t`).

**Passing behind an L4 occluder** needs no special case: L4 has `sort_key 4000`, the player has ≤3600, so the player is always drawn before L4 and therefore always behind it. **This is why L4 is mandatory** (§1.2.1) — it is the only mechanism by which the player is ever occluded, and occlusion is the only unambiguous depth cue a flat-layer scene has.

**Where a character must appear in front of a mid-ground element but behind a near one**, the answer is not a new layer — it is that the element belongs on the other side of L3. Slice accordingly at art time. If a scene genuinely needs an occluder mid-walk-plane (a tent the player walks behind at `t=0.4` and in front of at `t=0.7`), it ships as an **L4 fragment with a `t_range`**: the fragment's `sort_key` drops from 4000 to 3400 outside `[0.35, 0.75]`. **Budget: at most two such fragments in the entire game.** They are a maintenance liability and almost every desire for one is a composition problem.

## 4.5 Interaction targeting

**Hybrid: proximity determines the candidate set, `↑/↓` cycles within it, and the choice is always explicit.**

How it works:

1. As the player walks, the engine computes which interactables have `|player.t − anchor_t| ≤ radius_t`. That is the **candidate set** — typically 0–3 things.
2. The **nearest** candidate becomes the **active target** automatically.
3. Its ink glyph (§4.6) transitions from resting to active state over 180 ms.
4. **`↑` / `↓` cycles the active target** through the candidate set, in walk-plane order. If the set has one member, the keys do nothing (and the glyph gives a 1-frame nudge so the player learns the set size).
5. **Space/Enter** acts on the active target.
6. If the candidate set is empty, Space/Enter does nothing. There is no "nothing here" message — an unresponsive key with no glyph on screen is self-explanatory and a message would be noise.

**Why not pure proximity (auto-trigger).** Auto-triggering on approach means the player cannot walk past something, which is intolerable in a scene with 12 interactables inside two screen widths — they would be interrupted every 200 px.

**Why not pure cursor.** A cursor requires a mouse, which the target hardware does not guarantee, and it puts a reticle over a painting.

**Why not pure tab-cycling across the whole scene.** Cycling 12 interactables from a standing start means the player never has to walk, which deletes the only spatial verb the game has and makes the walk-plane decorative.

The hybrid gives: walking is how you find things, a key press is how you choose among them, and nothing happens without a deliberate press. It is also trivially screen-reader compatible (§8.5) because the candidate set is a DOM list.

**Conversation range** is a special case: an NPC's `radius_t` is 1.6× a prop's, and when an NPC is the active target the player's puppet plays `gesture_listen` instead of `idle`. That is the entire "you are near enough to talk" affordance and it needs no UI.

## 4.6 How the player knows an exit exists — the ink glyph system

**The problem:** a HUD arrow cluttering a painting is unacceptable. **The solution:** the affordance is drawn in the same ink as the world, in the R4 engraved-print register, and it behaves like a printer's ornament rather than like a game icon.

**Every interactable has an ink glyph.** Not a highlight, not an outline, not a shader pulse — a small drawn mark, 24×24 logical px, in `IRON-GALL` `#3B2E22`, from a single 4×4 sheet generated once (art guide's sheet method, §2.5).

| Kind | Glyph | Resting | Active |
|---|---|---|---|
| `examine` | a small open bracket, like a manuscript marginal mark | 26% opacity | 100%, +1 px vertical rise |
| `converse` | a curved speech-stroke, engraved | 26% | 100% |
| `document` | a folded letter | 34% (documents advertise harder — **R2** depends on the player finding them) | 100% |
| `decision` | a red wax seal, if the decision is sealed (**R1**) | 40% | 100% |
| `maptable` | a pair of dividers | 30% | 100% |
| **`exit`** | **a drawn arc — an engraved flourish curving off-frame in the exit's direction** | **18%** | **100%, and it draws itself on** over 240 ms as if inked |

**Exits get three additional affordances beyond their glyph, all diegetic:**

1. **The composition points at them.** This is a blockout requirement, not an engine feature: every exit sits at a natural terminus of the painted view — a road leaving frame, a doorway, a gate, a slope down to water. The Art Lead's blockout (art guide §2.6 step 5) marks exits before generation, and the plate is composed so the eye already goes there. **A scene whose exit is not compositionally legible is rejected at blockout review**, which costs five minutes, rather than at playtest, which costs a plate.
2. **The walk-plane ends there.** In 80% of scenes the exit is at a walk-plane terminus. When the player reaches the last 6% of the plane, the exit glyph rises to 55% opacity and Washington's puppet plays a 4-frame `pause_at_threshold` — he slows and half-turns toward the exit. That is a human being noticing a door, and it teaches the affordance with zero UI.
3. **A first-scene-of-the-game tutorial that is one line of ink.** In `a01_s01` only, the first time the player reaches the exit band, a single SECRETARY-hand line appears in the lower margin — *"the river road"* — and fades after 4 s. It names the destination, it is in Washington's own hand so it reads as his thought rather than as the game's instruction, and it never appears again. One tutorial, one line, one scene.

**Nothing pulses. Nothing bounces. Nothing glows.** The glyph's only animation is the 180 ms opacity/rise transition on becoming active and the 240 ms ink-on draw for exits. Motion in the ink layer would break the Obra Dinn discipline (**R10-adjacent**: the ink line is our outline and it is never blurred, faded below its stated opacity, or given bloom).

**Glyph placement** is `anchor_offset` from the interactable's walk-plane anchor, authored per-interactable, and validated to sit at least 40 px from any frame edge and at least 30 px from another glyph.

---

# 5. SCENE TRANSITIONS

## 5.1 The grammar, in one line

> **Cut means space. Fade means time. Lift means abstraction.**

Three transition types, total. The player learns this in Act 1 without being told (**R7**), and every subsequent transition then carries meaning for free.

## 5.2 The cut — moving between adjacent places

**Spec:**
```
visual:         hard cut. ONE frame. No crossfade, no dip, no wipe.
audio bed:      220 ms equal-power crossfade (outgoing bed → incoming bed)
audio spots:    outgoing spots stop instantly; incoming spots start after 400 ms
score cue:      continues uninterrupted if both scenes share a cue; else 400 ms crossfade
player:         appears at target_spawn, facing away from the exit he came through,
                idle for 200 ms before input is accepted
camera:         parallax offset initialised to the spawn's t, no settle animation
```

**The 220 ms audio crossfade is the entire trick.** A hard visual cut with a hard audio cut reads as a glitch. A hard visual cut with a short audio bleed reads as a film cut, which is what it is. The ear is what makes a cut feel intentional; the eye just registers change.

**Loading.** A cut must be instantaneous, so the incoming scene must already be resident. **Every scene preloads all of its exit-target scenes' L2 and L3 layers during the first dialogue block after arrival** — dialogue is when the player is stationary and reading, which is 60%+ of playtime and is exactly the window the art guide's per-act chunking assumes. L0/L1/L4 stream in behind that. If a target is not resident when the player hits an exit (fast walker, no dialogue yet), the engine holds on the outgoing frame for up to 500 ms with **no spinner** — a still frame that holds a beat reads as a deliberate hold, a spinner reads as a broken game. Past 500 ms it does a 300 ms fade-through-paper (§5.3) instead, which is the only place the grammar bends, and it should occur in <1% of transitions on target hardware.

**Texture disposal** (art guide §6.5, hard rule): the outgoing scene's textures are disposed **after** the incoming scene's first rendered frame and **before** the 220 ms audio crossfade completes. Two scenes are resident for ≤240 ms. Verified in the dev overlay via `renderer.info.memory.textures`.

## 5.3 The fade — time passing

**Spec:**
```
visual:         900 ms fade to PAPER (#EFE7D5), hold 250 ms, 900 ms fade in
                — fade to PAPER, never to black. Black is not in this game's palette
                  and a fade to black is the grammar of a different medium.
audio:          full fade out over 700 ms; 900 ms silence; incoming bed fades in over 900 ms
grain overlay:  stays at full strength through the fade — the paper is always there,
                even when nothing is drawn on it. This is the single best two-second
                statement the art direction makes and it costs nothing.
```

**Permitted uses, exhaustively:** act breaks, the seven interludes, and the four in-act time skips (Valley Forge December→May; Trenton night→morning; Yorktown 6 Oct→14 Oct; Annapolis before→after). **Twenty-two fades in the game.** Never between two adjacent rooms. Never on a normal exit.

## 5.4 The lift — into and out of the map table

Fully spec'd in §7.4. It is the game's one non-literal transition (reference analysis §3.4) and it exists exactly six times.

## 5.5 The interlude — the seventh transition that is actually a scene

Between each pair of acts: a single still of Washington's writing desk, one plate, seven light configurations, over which a letter composes itself in SECRETARY hand from what the player actually did (reference analysis §2.3). 60–90 s, skippable after 5 s, **no walking, no choices, no camera move except a 2% push over the full duration**.

Architecturally an interlude is a scene with `walkplane: null`, `interactables: []`, `framing: "interior_elevation"`, and a `letter_knot`. It is the natural save point (§8.7), the natural end of a class period, and the highest value-per-asset item in the project. It is entered on a **fade** and exited on a **fade**, because it is time passing.

## 5.6 The transition table

| From → To | Transition | Duration | Used |
|---|---|---|---|
| Scene → adjacent scene | **Cut** + 220 ms audio bleed | ~1 frame | ~90% of all transitions |
| Scene → same plate, later | **Fade** to paper | 2,050 ms | 4× (time skips) |
| Act end → interlude | **Fade** | 2,050 ms | 7× |
| Interlude → act start | **Fade** | 2,050 ms | 7× |
| Scene → map table | **Lift** (§7.4) | 2,400 ms | 6× |
| Map table → scene | **Lift, reversed** | 1,800 ms | 6× |
| Anywhere → letterbook | **Overlay**, not a transition | 260 ms | unlimited |
| Title → Act 1 | **Fade** | 2,050 ms | 1× |
| Act 8 → epilogue | **Fade**, held 1,200 ms | 3,000 ms | 1× |

**Not in the vocabulary and never to be added:** wipes, irises, page-turns, dissolves between two dioramas, ink-blot transitions, quill-scratch transitions, any transition that draws attention to itself as a transition. The temptation toward an ink-bleed wipe will be strong and it must be refused: it makes the paper an *effect*, and the paper is the *ground*. R10's whole argument is that the paper is one continuous sheet the entire game happens on; a transition that treats it as a surface to animate breaks that in the most visible way available.

---

# 6. THE DIALOGUE PRESENTATION LAYER

**This is where the student spends 60–70% of their time in this game, and it therefore gets more design attention than the dioramas do.** It is also the part that is pure DOM and pure typography — no Three.js, no textures, no GPU cost, and no AI-generated pixels except the portrait image itself.

## 6.1 The architectural decision: dialogue is DOM

The dialogue layer is **HTML and CSS in an overlay above the WebGL canvas**, not rendered into the 3D scene. The art guide already made half this call for portraits (§6.3, "portraits and documents ship as WebP and render in the DOM layer"). This document extends it to the entire dialogue presentation layer, for five reasons:

1. **Text is selectable, searchable, and screen-reader-navigable for free** — a US school accessibility requirement, not a nicety.
2. **Text scaling (§8.1) is a CSS custom property**, not a texture regeneration.
3. **Browser text rendering with subpixel antialiasing beats anything we would do in canvas** at 19 px on a 1366×768 panel, which is the exact reader we are designing for.
4. **Zero GPU texture memory.** ~50 portraits as `<img>` costs nothing against the 120 MB ceiling and gets browser-managed decode and eviction.
5. **It can be styled, tested, and iterated by someone who does not know Three.js.**

The overlay sits in a `<div id="dialogue" role="region" aria-live="polite">` with the canvas as `aria-hidden`. Everything the student must read is in the accessibility tree.

## 6.2 Layout — the composed page

The dialogue layer composes as a **printed page laid over the painting**, not as a floating window. Measurements are on the 1600×900 logical grid; everything scales with a single root `--ui-scale`.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │  ← the diorama, still
│                                                                      │     visible, pushed 3%,
│   ┌────────┐                                                         │     fog +0.006
│   │        │  ┌──────────────────────────────────────────────┐       │
│   │PORTRAIT│  │ HENRY KNOX                                   │       │  ← speaker rule
│   │ 300×400│  │                                              │       │
│   │        │  │ Body text, 19 px, humanist sans, 58–66 char  │       │
│   │        │  │ measure, ≤55 words per block.                │       │
│   └────────┘  │                                              │       │
│               └──────────────────────────────────────────────┘       │
│               ┌──────────────────────────────────────────────┐       │
│               │ ▪ AMBITION   Interior line, ≤28 words.       │       │  ← council band
│               │ ▪ RESTRAINT  Interior line, ≤28 words.       │       │
│               └──────────────────────────────────────────────┘       │
│               ┌──────────────────────────────────────────────┐       │
│               │  1  "Then we shall have to make do."         │       │
│               │  2  "How many guns, exactly?"                │       │  ← option list
│               │  3  ~~struck option~~  ⊙ Temper is not loud  │       │
│               └──────────────────────────────────────────────┘       │
│                                                              📕      │  ← ribbon glyph, 32px
└──────────────────────────────────────────────────────────────────────┘
```

**Exact zones:**

| Zone | Position | Size | Notes |
|---|---|---|---|
| **Portrait well** | x 96, bottom-anchored y 140 | **300 × 400** | Chest-up crop (art guide §5.2 route 1 — no hands in frame). Slides in from x 60 over 260 ms, cubic-out. |
| **Speaker rule** | above the transcript | full transcript width × 1 px | `IRON-GALL` at 60%, with the name in 15 px letterspaced small caps sitting on it |
| **Transcript** | x 436 → 1424 | **988 wide**, height auto | Body text. Bottom-anchored at y 140. Grows upward. |
| **Council band** | directly below transcript | same width, 8 px gap | 0–4 entries. Distinct treatment (§6.5). |
| **Option list** | below council band | same width, 14 px gap | 2–5 options. Bottom-anchored at y 44. |
| **Ribbon glyph** | x 1544, y 828 | **32 × 32** | The only persistent UI in the game (**R19**). |
| **Paper panel** | behind transcript+council+options | inset −20 px all sides | `PAPER` `#EFE7D5` at **92% opacity**, with a 1 px `IRON-GALL` rule at 45% on the top edge only, and a 2 px deckle-irregular bottom edge from a repeating SVG path. **No drop shadow. No rounded corners. No blur-behind.** It is a sheet of paper laid on the picture, and it should look laid, not floated. |

**Why the portrait is left and the text is right**, and why it never swaps: a fixed reading origin is worth more than variety. Every line of dialogue in the game begins at x 436. A student's eye returns to the same place 3,000 times across the unit. Swapping sides for "the other speaker" is a novelty that costs reading speed on every single line.

**The world stays visible.** The paper panel occupies the bottom 42% of the frame at default scale. The diorama's upper 58% — sky, horizon, the tops of buildings, the composition's subject — remains visible throughout. This is deliberate: the reference analysis' whole thesis is density in a small place, and a dialogue box that blacks out the world is a dialogue box that could have been in any game.

## 6.3 Typography

Per **R17**, and this is binding:

| Element | Face | Size | Weight | Colour | Measure |
|---|---|---|---|---|---|
| **Body / NPC dialogue** | **Source Sans 3** (OFL, humanist sans) | **19 px** | 400 | `#2A241C` | **58–66 ch** |
| **Speaker name** | Source Sans 3 | 15 px | 600, +0.08em tracking, small caps | `#3B2E22` | — |
| **Dialogue options** | Source Sans 3 | 19 px | 400 | `#2A241C` | 58–66 ch |
| **Council interjection** | Source Sans 3 **Italic** | **18 px** | 400 italic | per-voice (§6.5) | 52–58 ch |
| **Margin notes** (*"Temper is not loud enough"*) | Source Sans 3 Italic | 15 px | 400 | `#6B5F4E` | — |
| **Glossary gloss** | Source Sans 3 | 16 px | 400 | `#2A241C` on `#F4EEE0` | 40–48 ch |
| **Document body** (in the letterbook / document viewer) | **IM Fell English** / **Libre Caslon Text** / **Petit Formal Script** per register (**R16**) | 20–24 px | — | `#3B2E22` | 52–60 ch |

**Line height 1.55 for body**, 1.45 for options, 1.5 for council. **Paragraph spacing 0.75em.** These are large; that is intentional and it is the accommodation that helps the most students for the least design cost.

**Source Sans 3 rather than the more obvious Atkinson Hyperlegible as the default**, with Atkinson available as an option (§8.2): Source Sans 3 has a genuine italic (not an oblique), which the council band depends on for its primary non-colour differentiator; it has small caps; it has a 400/600 weight pair that reads cleanly at 15 px on a 1366×768 panel; and it subsets small. Atkinson Hyperlegible is the better face for a dyslexic reader and it is one toggle away — but it has no true small-cap set and its italic is weaker, so as a default it would cost the council band its clearest signal.

**Never set a dialogue option in IM Fell English.** The period faces are for objects the fiction says are physical — documents, letters, the letterbook. Dialogue and system text are for reading. This is R17 and it is the line between Pentiment's achievement and Pentiment's cost.

**Font payload:** Source Sans 3 (400/600 + italic, Latin-1 subset, WOFF2) ≈ 78 KB; the four period faces subsetted ≈ 240 KB (**R16**); Atkinson Hyperlegible loaded **only on toggle** ≈ 42 KB. Total ≈ 320 KB in the initial shell, 42 KB conditional.

## 6.4 Text reveal and chunking

- **45 characters/second** (**R18**). Any key, click, or tap **instantly completes the current block**.
- **A global instant-text toggle** lives in the letterbook's endpapers and **persists in the passport code**.
- **≤55 words on screen at once.** A longer authored line breaks into blocks; the transcript shows one block at a time with a small engraved `▾` at the lower right of the paper panel indicating continuation.
- **No timed anything.** No auto-advance. No countdown. No timed choice. Ever. Not at Trenton, not at the ferry evacuation, not during the Newburgh address. This is a hard accessibility line (§8.3) and it also happens to be a better pedagogical position — a student pressured into a decision has learned about pressure, not about the decision.
- **The transcript scrolls and retains.** Prior blocks in the current conversation remain, scrolled up and faded to 55% opacity. `PageUp`/`PageDown` and the scroll wheel move through them. DE's re-readable log, at a classroom scale: the last **12 blocks** are retained, then the oldest are dropped.

## 6.5 The internal council — how a voice reads differently from a person

This is the most important visual distinction in the game, because it is how four hidden stats become legible without a number (**R4, R5, R6**).

**The council band is a materially different register: the world is painted, the voices are printed** (historical pack §5.2). Six simultaneous differentiators, so that no single channel is load-bearing:

| Channel | NPC line | Council line |
|---|---|---|
| **1. Position** | Transcript zone, x 436 | **Council band, indented +28 px**, below the transcript |
| **2. Face** | Roman | **Italic** |
| **3. Size** | 19 px | **18 px** |
| **4. Attribution** | Name in small caps on a rule, with a **portrait** | Name in small caps inline, with a **16×16 engraved emblem glyph**, no portrait |
| **5. Colour** | `#2A241C` for all speakers | **Per-voice ink**, five colours (below) |
| **6. Ground** | On the paper panel | On the paper panel with a **1 px vertical rule** in the voice's ink at the left edge of the indent, and the panel tinted 4% toward the voice's hue |

**The five voices**, with emblem and locked luminance ordering (reference analysis §1.1):

| Voice | Ink | Hex | Relative luminance | Emblem (R4 engraved) |
|---|---|---|---|---|
| **VANITY** | yellow ochre | `#8A6D2B` | **0.58 — lightest** | a hand mirror |
| **AMBITION** | faded vermilion | `#8C3A2A` | 0.44 | a spur |
| **TEMPER** | burnt iron-gall red-brown | `#6B3524` | 0.36 | a struck flint |
| **RESTRAINT** | Prussian blue | `#2B4258` | 0.28 | a bridle bit |
| **DUTY** | indigo | `#232C4A` | **0.20 — darkest** | a folded commission |

**Colourblind safety is achieved by three redundant channels, not by choosing safe colours** (§8.4): the emblem glyph is *always* present and is a distinct silhouette; the five luminances are spaced ≥0.07 apart so they separate in greyscale; and the name is always written out. Vermilion and burnt red-brown — the deuteranopia collision — are 0.08 apart in luminance and their emblems (a spur, a struck flint) are unmistakably different shapes. **Never ship a build where colour is the only difference between two voices.**

**Composition rules, enforced by the dialogue system, not by the writer's discipline:**
- **2–4 voices per decision point. Never 1. Never 5.** (**R4**) The runtime asserts this and throws in dev builds.
- **≤28 words per interjection** (**R6**), enforced by a lint pass on the compiled ink JSON in CI.
- Voices appear **sequentially, 320 ms apart**, each fading in over 200 ms plus a 4 px rise. The stagger is what makes it read as an argument breaking out rather than as a list appearing.
- **Council lines never present a choice** (**R6**). They are never clickable, never focusable as options, and carry `aria-role="note"`.
- Council lines are **never retained in the scrollback**. They are intrusive thoughts; they do not persist. This is also how the player learns that the transcript is *what was said* and the band is *what was thought*.

**Locked options** (**R1**) render in the option list as:
```
  3  ̶"̶Y̶o̶u̶ ̶w̶i̶l̶l̶ ̶h̶a̶n̶g̶ ̶f̶o̶r̶ ̶t̶h̶i̶s̶,̶ ̶s̶i̶r̶.̶"̶     ⊙
     — Temper is not loud enough to say this.
```
Struck with a **single 1 px rule at 50% opacity through the text** (not `text-decoration: line-through`, which renders at inconsistent weights across browsers — an absolutely-positioned 1 px div), text at 45% opacity, prefixed with the responsible voice's emblem. Margin note in 15 px italic `#6B5F4E`. **Knowledge-locked** options use a folded-letter glyph and the note names the document: *"— you have not read Dunmore's Proclamation."* Locked options are **focusable and screen-reader-announced** ("unavailable: …") but not selectable — a student using a screen reader must be able to hear the road they cannot take, because that is the mechanic.

**Sealed decisions** (8 in the game) display a **red wax seal glyph** above the option list plus a margin line: *"This will not come again."* The seal is 28×28, in `SCARLET` `#C0392B` — the only saturated red the UI ever uses, which is why it works.

## 6.6 The glossary

Any period term, office, unit, or person is wrapped in `<button class="gloss">` with a **faint dotted underline, 1 px, `#6B5F4E` at 55%**. Hover, tap, or keyboard focus opens a **25–60 word margin gloss** in a small paper card anchored below the term, 40–48 ch wide, with a 1 px ink rule. Esc or blur closes it. It never covers the option list.

**~180 glossary entries**, authored in one `content/glossary.json`, keyed by term, with `{term, gloss, act_first_seen}`. Terms auto-link on first appearance per scene and remain linked; the system does not require the writer to mark them up inline, which is what keeps the coverage honest.

## 6.7 Small-screen behaviour

At 1366×768 (the modal Chromebook panel) the logical 1600×900 grid scales to 0.854. At default `--ui-scale: 1.0` that puts body text at an effective **16.2 CSS px**, which is at the floor of comfortable. Therefore:

**The engine detects a viewport below 1400 CSS px wide and sets `--ui-scale: 1.15` by default**, restoring body text to ~18.6 effective px and reflowing the measure to hold 58–66 ch by narrowing the transcript to 880 logical px. The portrait well shrinks to 260×346. This is automatic, it is announced nowhere, and the student never has to discover a setting to be able to read.

Below 900 CSS px wide (a tablet in portrait, or a heavily-zoomed browser): the portrait moves **above** the transcript at 180×240, centred, and the transcript takes full width. This is the only layout reflow in the game.

---

# 7. THE MAP TABLE

## 7.1 What it is and why it is different

Six scenes in the game are **genuine 3D**: a period survey map, rendered as an animated tinted plan with hachures, contours, camp plans and tokens, on which strategic facts become visible that the ground-level diorama cannot show. Washington was a surveyor; the historical pack calls this "thematically load-bearing," and the Rochambeau/Berthier corpus gives us an exact documented visual model (register **R2**, `wash-map-v1` LoRA, trigger `wshmap`).

**The map table is the only place in the game where the camera moves under player control, and it moves in exactly two axes.** It is a different visual register, a different control scheme, a different audio treatment, and it is deliberately *not* the same game for ninety seconds. That contrast is what makes it a set-piece rather than a menu.

**The six:**

| ID | Act | Question the map answers |
|---|---|---|
| `CB-MT` | 2 | The route from Ticonderoga to Cambridge. **Washington decides from Cambridge** (historical pack §3.2) — he was never on the trail, and the map table is what makes that historically correct instead of a compromise. |
| `BK-MT` | 3 | The Brooklyn line, the East River, and where the British fleet can and cannot go |
| `DL-MT` | 4 | Two columns, ten miles, three hours behind schedule |
| `VF-MT` | 5 | Supply lines, the Schuylkill, and Congress's inability to move flour. *(Optional; cut first if scope bites.)* |
| `NW-MT` | 6 | Cantonment plan; the distance from Hasbrouck House to the Temple. Two places, several miles apart — the map is how the player learns that. |
| `YT-MT` | 7 | **De Grasse in the Chesapeake.** The fleet is a strategic fact, not a sensory one (historical pack §3.7). |

## 7.2 Construction

**The map is a real 3D object: a single quad, subdivided 128×128, displaced by a heightfield.**

```
sheet:        1536×1536 KTX2, generated by wash-map-v1, R2 register.
              Blank of all text (art guide §5.1) — every label is in-engine type.
heightfield:  256×256 R8 PNG, hand-painted from the same blockout as the sheet.
              Displacement amplitude 0.0 → 0.35 world units. Terrain is LOW RELIEF —
              this is a survey plan that has been gently lifted, not a terrain mesh.
hachures:     a second 1536×1536 alpha texture of drawn hachure strokes, multiplied
              over the sheet, its opacity driven by |slope| so hachures appear where
              the ground actually falls. This is period-correct AND it is how the
              player reads elevation.
grid:         a shader-drawn 1 px ruled grid in IRON-GALL at 18%, in map-sheet space,
              with a drawn scale bar and compass rose composited in-engine.
edges:        the sheet has painted deckle edges and lies on a linen backing
              (tx_linen-map-backing) on a plain board. It is a physical object.
tokens:       flat painted markers on 12 px stems — infantry blocks, ship shapes,
              redoubt squares — billboarded to face the camera, at 12 fps stepped
              motion when they move. Max 24 tokens on any sheet.
```

**Total per map table: 1 sheet (1536² KTX2, ~2.6 MB VRAM) + 1 hachure alpha + 1 heightfield + tokens from one shared 1024² atlas.** Well inside budget, and the tokens atlas is shared across all six.

## 7.3 Camera and control

**This is the exception to §2's camera lock, and it is bounded.**

```
camera:       PerspectiveCamera, fov 30°, orbiting a fixed target at the sheet's centre
pitch:        clamped 42° – 66°. Default 55°. This is the range in which a survey plan
              still reads AS a plan while having visible relief. Below 42° it becomes a
              landscape (wrong register); above 66° it becomes flat orthographic (loses
              the hachures' point).
yaw:          clamped ±22° from north-up. NORTH IS ALWAYS UP-ISH. A rotatable map is a
              map the player gets lost on, and every period plan in the reference corpus
              is oriented.
zoom:         dolly along the view vector, clamped to 1.0× – 2.2× sheet width in frame.
speed:        pitch/yaw 40°/s; zoom 0.9×/s. All damped, τ = 180 ms.
controls:     ←/→ yaw · ↑/↓ pitch · +/− or PageUp/PageDown zoom · Space to select the
              focused annotation · Tab cycles annotations · Esc exits the map table
              Mouse: drag to orbit, wheel to zoom. Touch: one finger orbit, pinch zoom.
```

**Annotations, not interactables.** A map table carries **4–9 annotations** — a redoubt, a ford, a fleet position, a supply depot — each a small drawn marker with an in-engine SECRETARY-hand label that fades in when focused. Selecting one opens a dialogue block in the standard §6 layer, *over the map*, with the council band available. **The map table's decisions are the same decision system as everywhere else**; only the staging changes.

**Audio:** the bed drops to a near-silence — paper, a chair, a distant camp — and the score cue for the act continues at −6 dB, low-passed at 3 kHz, as though heard from the next room. The map table is quieter than the world, which is how the player knows it is inside Washington's attention rather than outside it.

## 7.4 The lift — cutting to and from

**This is the game's one non-literal transition** (reference analysis §3.4) and it must be identical every time so it reads as a grammar rather than as an effect.

**Into the map table (2,400 ms):**

```
   0 –  400 ms   The diorama's layers desaturate to 22% chroma and fog rises to 0.06.
                 No blur. The world does not go out of focus; it goes quiet.
 200 –  900 ms   L0–L2 slide back along Z (−6 units) and fade to 25% opacity.
                 L3/L4 slide back and fade to 0. The player's cutout fades out at
                 300–700 ms — he is the first thing to go.
 700 – 1900 ms   The map sheet rises into frame from below the lower edge, translating
                 up 8 units and rotating from 78° (nearly edge-on) to the default 55°,
                 cubic-in-out. It arrives lit by its own key.
1600 – 2400 ms   Tokens ink themselves onto the sheet, staggered 90 ms apart, each
                 drawing on over 200 ms. Labels fade in last.
audio            World bed low-passes from 20 kHz to 800 Hz over 900 ms and drops to
                 −14 dB. Paper handling one-shot at 900 ms. Map bed in at 1400 ms.
```

**Out (1,800 ms):** exactly the reverse, with the token ink-off compressed to 400 ms and the world bed's low-pass opening over 700 ms. The player's cutout fades back in **last**, at 1,400–1,800 ms, at the exact `t` he left. He never moves while the map is up.

**Why this is allowed when nothing else non-literal is.** It is justified diegetically — this is a surveyor's mind, and the game has spent seven acts establishing that Washington reads ground for a living. It also *only* moves between "the world" and "a piece of paper on a table," which is a move a real person makes. It is not a magic-realist room-change; it is a man looking down.

**Exiting the map table always returns to the exact scene and walk-plane position it was entered from.** A map table is never an exit. It has no `target_scene`.

## 7.5 Act 7's exception — the pullback that becomes a lift

Act 7's single scripted camera move (§2.4) is the game's most expensive moment and it **chains a pullback into a lift**: YT-01's siege-line diorama pulls back over 6,000 ms disclosing the York River, and at 5,200 ms — while still moving — the lift begins, so the receding diorama and the rising sheet overlap for 800 ms. It resolves into `YT-MT` with de Grasse's blockade already drawn.

**This is the only place in the game where two camera moves overlap.** It is authored as a single named clip, `a07_apex_pullback_lift`, and it is not a reusable system.

---

## 7.6 The theatre map — the other object, and it is not this one

**Built. `src/theatre.ts`, `Overlay.showTheatre`.** Everything in §7.1–§7.5 stands unchanged; this is a second thing, and the two must never be conflated.

| | **The map table** (§7.1–7.5) | **The theatre map** |
|---|---|---|
| What it is | A table you stand at | A page you are shown |
| Entered by | The lift, from inside a scene | An act opening, before you have control |
| Camera | Orbits, 42°–66°, under the player | None. Flat. It is a piece of paper |
| Scale | One problem — a river, a route, ten miles | The whole theatre, Montreal to the Chesapeake |
| You can | Decide | Only read |
| Count | 6 | 8, one per act |

**Why it exists.** The war is bigger than the eight places Washington stands in and almost none of it is his — he is not at Saratoga, Charleston, Cowpens or Guilford. `08` §4 gives the player one *number* to hold across eight acts. This gives them one *picture*, and when the marks move between acts, without being touched, the player watches a war go somewhere they are not. It is how this game intends to tell the trajectory of the Revolution without making the Revolution the subject — and it is where the southern campaign will live, since Washington experienced that campaign as paper arriving late and so will the student.

### The rule the whole thing serves

> **The map shows what Washington believed, not what was true.**

Every mark carries the date of the report that put it there and the date that report reached him, and it is drawn in the confidence those two dates earn: seen and certain draw solid, a fortnight old draws lighter, six weeks draws dashed, unconfirmed draws faint and broken. In Act 2's page — 3 July 1775, the morning he takes command — Boston is exact because it is a mile off and he has a glass, Charlestown is a fortnight old and second-hand, and **Ticonderoga, which is the thing Act 2 is eventually solved by, is the least legible mark on the sheet.** The answer is on the map on the first morning and nobody can read it.

This is not a fog-of-war mechanic dressed as history. It is the history, and it happens to do a fog-of-war mechanic's job. It also gives the reading loop (`R2` — documents are the progression system) somewhere to pay off at full-screen size: **reading is not acting**, and this is the screen that says so.

### It is an object, not a screen

The whole viewport is a **wooden table**, running off all four edges. On it lies a **torn sheet**, casting a shadow, with **two corners curled up** off the wood on opposite diagonals — the back of the paper showing, brightest along the fold. The caption is a plate of smoked glass laid on the table below the sheet: the only thing on this screen that is not in the world, and it does not pretend to be.

The first cut framed the map neatly in a dark field with the caption underneath and read as a slide in a presentation. This reads as a thing lying in front of you, which is what it has to be — the player is standing over a table, not looking at an interface.

The sheet is pinned to the top of the frame rather than centred, so it can be as large as the room above the caption allows and no larger. The paper is a warm tan (`#E2D6B6`), deliberately **not** `PAPER.BRIGHT`: at the game's brightest white it looked like printer stock and left the sea no room to be a different value from the land.

### The lettered grid — the change that matters most for a fifteen-year-old

The sheet was ruled at whole degrees with the figures in the margin, which is what surveyors did and which is **useless in a classroom**. Nobody says *"the fleet is at forty-two degrees twenty minutes north."*

Five columns by four rows, **A–E across the top and bottom, 1–4 down both sides**, and every mark now has a name you can say out loud. Boston is **C2**. Ticonderoga is **B1**. The caption prints the square as a chip beside the mark's name, so two people looking at the same page — a teacher and a class, two students on one laptop — have a shared vocabulary for it. It is also period: plans of this date carry lettered borders for exactly this reason, so a despatch could refer to a square.

### Simplified, on purpose

Three rivers came off the sheet (Mohawk, Merrimack, Schuylkill), five place names (Worcester, New London, Annapolis, Falmouth, and Virginia's province label, which was nine-tenths off the page). They were all true and they were all making the page busy. **The test for a name on this map is not "was it a town" — it is "will a student need it to understand a distance."**

What is left is the Hudson–Champlain corridor (the road the guns have to come down), the Connecticut, the Delaware, the Potomac, and ten places. Everything that stayed got bolder: the coast doubled in weight, the markers are half again as large, the type went up two or three points across the board.

### Register and construction

R2, and it is the one surface in the game that is not painterly — `09` governs every plate, and this is ink, ruled lines and a flat wash. `06` §2.8 is right that a survey plan has no atmosphere and no morale; nothing here is lit and the mood system must never touch it. The one exception is the sheet itself, which has a cast shadow and lit curls, because the *paper* is an object in a room even though the *map* is not a place.

Relief is **hachured**, not cel-shaded: strokes down the fall line, denser where the ground drops harder, no light source anywhere. The eighteenth century had already solved showing a third dimension on a flat page with no light in it, and it works identically in greyscale and for a colourblind student, which no lighting ramp does. The Berkshire wall between Ticonderoga and Cambridge is on the page from Act 2's first frame, and it is why that act is a logistics problem rather than a fetch quest.

Hachures are drawn as a **band** — three rows of strokes down each flank, heaviest against the crest and thinning outward. A single row either side of the ridge line drew two combs facing each other, which reads as a railway rather than as ground.

Everything is procedural canvas, in keeping with the `09` pivot — no `wash-map-v1` sheet is needed, and the hachures are computed from the ridge data rather than painted to match it. The projection is equirectangular with the east–west axis compressed by cos 42°, so distance on the page is honest. Marks are drawn in canvas; **labels are DOM**, so a screen reader can read them and a student can select them.

Shapes and fill carry the meaning, never colour: **theirs draws solid, ours draws hollow**, which is what a manuscript plan did and which makes the British the solid thing on every page of this game without a word being spent on it.

### Verify before classroom use

- **V-TM.1** Hachuring is in period for the Rochambeau/Berthier corpus (1780–82); the formal *steeper is darker* rule is Lehmann, 1799, just after. We follow the formal rule because it is legible. Small anachronism, stated rather than quietly enjoyed.
- **V-TM.2** Every mark's two dates. The reported-on dates are of the documented order and the received dates are estimated from known post times. **None is checked against a specific letter, and the entire staleness reading depends on them.** First thing to source.
- **V-TM.3** The coastline is a hand-drawn approximation at about seventy points. Right to roughly ten miles.
- **V-TM.4** Act 1's *ships from England* mark — that London papers reaching Virginia over the winter of 1774–75 named three major-generals — is of the documented order (Howe, Burgoyne and Clinton sailed in April 1775) but the specific claim about what colonial readers knew, and when, is not sourced.

### Known limits

Delaware Bay reads as a narrow loop rather than as a bay, because at this scale it is fifteen pixels wide and the shading routine offsets along one normal per run. The Chesapeake is a sliver in the corner. Both are cosmetic and both are on the page rather than hidden.

The sheet is portrait-ish (about 1.12 wide to tall) on a landscape screen, so there is a good deal of table showing either side. That is the honest shape of the theatre and it will get **more** portrait, not less, as the war goes south — Yorktown is at 37.2° and Charleston at 32.8°, both below this sheet's bottom edge. When the southern acts are built the projection will have to grow downward, and the extra sheet has to come out of the north rather than out of the aspect.

---

# 8. ACCESSIBILITY

Not a polish pass. These are IEP/504 requirements that determine whether a district can adopt the product at all, and several of them are load-bearing on decisions already made above.

## 8.1 Text scaling

**A single root custom property `--ui-scale` drives everything in the DOM layer.** Five steps, exposed in the letterbook's endpapers and bound to `Ctrl +` / `Ctrl −` as well:

| Step | `--ui-scale` | Body text (effective @1366) | Layout consequence |
|---|---|---|---|
| Small | 0.90 | 14.6 px | — |
| **Default @≥1400 px** | 1.00 | 16.2 px | — |
| **Default @<1400 px** | **1.15** | 18.6 px | Transcript narrows to 880 logical to hold measure |
| Large | 1.35 | 21.9 px | Portrait 240×320; council band gets its own scroll |
| **Largest** | **1.60** | 25.9 px | Portrait moves above transcript; paper panel takes 62% of frame |

**The measure is held at 58–66 characters at every step** by reflowing the transcript width, not by letting lines run long. A 25.9 px line at 988 px wide is 38 characters, which reads badly; the system narrows nothing and instead *raises* the panel, letting the transcript grow vertically into the space the diorama was using. At Largest the world is 38% visible and that is an acceptable trade — a student who needs 26 px text needs the text more than the painting.

**Nothing in the WebGL layer scales.** The diorama, the player cutout and the ink glyphs are unaffected, which is why this is cheap. The one exception: **ink glyphs scale with `--ui-scale` above 1.35**, because at Large and Largest a student is likely to have a visual accommodation and a 24 px glyph is too small.

**Browser zoom works too** and is not fought. The layout is in `rem`-relative units with no fixed-px breakpoint below 900.

## 8.2 The dyslexia-friendly font option

**Atkinson Hyperlegible Next**, one toggle in the letterbook endpapers, persisted in the passport code. Chosen over OpenDyslexic on evidence: OpenDyslexic's efficacy is not well supported in the literature, while Atkinson was designed by the Braille Institute specifically for low-vision and letterform-confusion legibility and has unambiguously distinct `I/l/1`, `O/0`, `b/d/p/q`. It is OFL and 42 KB subsetted.

When enabled:
- Body, options, council, margin notes, and glossary all switch to Atkinson.
- **`letter-spacing: 0.02em` and `word-spacing: 0.06em` are added**, and line height goes from 1.55 to 1.68. The spacing change is separately evidenced as helpful and it comes free with the toggle.
- **The council band loses its italic differentiator** (Atkinson's italic is weak), so it compensates: the per-voice vertical rule goes from 1 px to **3 px**, and the indent from 28 px to 40 px. The differentiation budget is maintained; the channels are just re-allocated.
- **The four period document faces do NOT switch.** They are the *content*, not the interface — the Rough hand's illegibility is the historical argument (**R16**). Instead, **every document has a "set in plain type" control** in its own corner: one press re-renders that document's text in the current UI face at the current scale, preserving the line breaks and the misspellings. The student still sees that the spelling is wrong; they are not also fighting the letterforms. This is the correct accommodation and it costs one CSS class.

**A third option: `system` — the OS/browser default font stack.** Some students have a district-configured accessible font. Respect it.

## 8.3 No timed reading, anywhere

Stated as an absolute so no future feature request breaches it:

- **No auto-advancing text.** Ever.
- **No timed choices.** Not one, in eight acts. The Long Island evacuation and the Trenton crossing are *narratively* time-pressured and are **not** mechanically timed; pressure is carried by the writing, the council, and the fact that the consequences are already fixed.
- **No text that disappears on a timer.** The one exception is the Act 1 exit tutorial line (§4.6), which fades after 4 s — and it is repeated on every subsequent approach to that exit until the player uses it once.
- **No QTEs, no reflex checks, no minigames with a clock.** The brief's "drill minigame" at Valley Forge is re-specified elsewhere as an untimed sequencing exercise; it is named here so nobody re-adds a timer to it.
- **Scripted camera moves are skippable** with any key after 1,200 ms. A student who has seen the Yorktown pullback once should not sit through it again on a replay.
- **Pause is instant and total** (Esc → letterbook), including during scripted moves, and it never loses state.

## 8.4 Colourblind safety

The palette is already largely safe by accident of the period — it is earth pigments, and the whole game runs at low chroma. The risks are specific and each has a specific mitigation:

| Risk | Where | Mitigation |
|---|---|---|
| **AMBITION vermilion vs TEMPER burnt red-brown** | Council band | Emblem glyph (always present, distinct silhouette) + 0.08 luminance separation + written name. Three redundant channels. |
| **RESTRAINT Prussian blue vs DUTY indigo** | Council band | Same three channels; 0.08 luminance separation. |
| **Red wax seal on a warm paper ground** (protanopia: reads as dark brown) | Sealed decisions | The seal is also a **distinct shape** (a lobed wax blob with an impressed device) and is **always** accompanied by the text *"This will not come again."* The colour is never the message. |
| **British madder-red vs Continental blue at diorama scale** | Acts 2, 3, 7 | The scenes never require the player to *distinguish* forces by colour. Where allegiance matters — the surrender road, the siege lines — it is stated in text and legible by silhouette (French white coats vs American ragged) rather than by hue. |
| **Map-table token factions** | Six map scenes | Tokens differ by **shape first**: allied = square, British = circle, French = square with a bar, naval = a hull profile. Colour is secondary. All tokens carry an in-engine label on focus. |

**The gate:** a CI step renders the dialogue layer and each map sheet through **protanopia, deuteranopia, tritanopia and greyscale** simulation matrices and fails on any pair of semantically-distinct elements whose simulated ΔE falls below 12. It runs on every PR that touches UI colour. Fifteen lines of code, and it prevents the entire class of bug.

**Rule, stated once:** *colour is always the second channel and never the first.*

## 8.5 Keyboard-only operability

Already true by construction (§4.1) — the game was designed keyboard-first because of the hardware, and the accessibility benefit is a consequence rather than a retrofit. The specifics that make it real:

- **Every interactive element is a real focusable DOM element** — options are `<button>`, glossary terms are `<button>`, letterbook ribbons are `<button>`, map annotations are `<button>` in a hidden-but-focusable list mirroring the 3D markers.
- **Visible focus ring everywhere:** a 2 px `IRON-GALL` rule offset 3 px, never `outline: none`. It is drawn as an engraved bracket rather than a browser default, so it belongs to the art direction, but it is always present and always at ≥3:1 contrast.
- **Focus order is document order**, and the dialogue layer traps focus while open (the diorama is inert), releasing on Esc.
- **No hover-only information.** The glossary gloss opens on focus as well as hover. The interaction glyph's active state is driven by the target system, not by a mouse.
- **`prefers-reduced-motion: reduce`** → parallax breath disabled (camera static), scripted moves become a 900 ms fade to the end state, the portrait push is removed, council entries appear simultaneously rather than staggered, the map-table lift becomes a 600 ms crossfade, and token ink-on is instant. **Nothing becomes unreachable and no information is lost** — that is the test.
- **Screen reader:** the canvas is `aria-hidden`. Each scene exposes a `<nav>` list of its candidate interactables with proper names (**R22** pays off here — "the empty beef barrel from Wethersfield" is a far better screen-reader string than "barrel"), a `role="log" aria-live="polite"` transcript, council lines as `role="note"`, and locked options announced as *"unavailable: [text]. Temper is not loud enough to say this."* Tested against NVDA + Firefox and ChromeVox + Chrome, because ChromeVox is what is actually on the Chromebooks.

## 8.6 The glossary as an accessibility feature

§6.6 spec'd the mechanism. Stated here as the requirement it satisfies: **~180 period terms, glossed in 25–60 words, reachable by hover, tap, or keyboard focus, and additionally browsable as a full A–Z list in the letterbook's Documents ribbon.** The browsable list matters — a student who encountered *"gabion"* in Act 7 and needs it again in Act 7's assessment should not have to find the sentence it was in.

Glosses are written at a **grade 7–8 reading level** regardless of the reading level of the dialogue around them. This is differentiated instruction: the dialogue can be demanding because the scaffolding is not.

## 8.7 Saving, and why it is an accessibility issue

Per decision #10: a compact URL-safe **passport code** plus localStorage autosave. Two architecture requirements land here:

- **Autosave on every scene entry and every interlude**, silently. A student whose Chromebook sleeps mid-period loses at most one scene.
- **The passport code carries accessibility settings** — `--ui-scale` step, font choice, instant-text toggle, reduced-motion override — not just game state. A student who set up their accommodations in period 2 on one device must not have to set them up again in period 4 on another. This is the single highest-impact accessibility decision in this document and it costs 6 bits in the code.

## 8.8 The teacher affordances that ride along

- **Jump-to-act** entry points (`?act=5`), which **R24**'s isolation rule makes trivially possible. A teacher who has 30 minutes and needs Newburgh can have Newburgh.
- **A printable transcript** of everything the student has read this session, generated from the retained log — legible evidence for an IEP goal, and a homework artefact.
- **The letterbook's Correspondence ribbon is a writing sample.** Washington's letters, assembled from what the student actually did, in the student's own playthrough. It is the assessment instrument the game gets for free.

---

# 9. THE VALIDATOR — what fails a build

Everything in this document that can be checked mechanically, is. This list is the CI spec.

| # | Check | Fails on |
|---|---|---|
| 1 | Layer completeness | Any scene without exactly 5 layer files `L0`–`L4` |
| 2 | **R9** walk distance | Any interactable >8.0 s from the default spawn |
| 3 | Scale band | Walk-plane scale range outside 1.00→0.58 (exterior) or 1.00→0.86 (interior) |
| 4 | **R3** density floor | <12 interactables, <8 with ≥40-word examine text, 0 contradictions, <3 variants, 0 unlocking documents |
| 5 | **R22** naming | Any interactable whose `name` matches a bare category noun (word list) |
| 6 | **R6** council length | Any council line >28 words in the compiled ink JSON |
| 7 | **R4** council count | Any decision knot tagging fewer than 2 or more than 4 voices |
| 8 | **R8** camera moves | >1 scripted move per act, or any move outside 4,000–7,000 ms |
| 9 | **R7** transition grammar | A `fade` on a non-time-skip exit, or a `cut` across a declared time skip |
| 10 | **R15** silence | Any act with 0 scenes declaring `score: null` |
| 11 | Spawn separation | Two spawns or two characters within 0.02 `t` |
| 12 | Glyph placement | Any glyph <40 px from a frame edge or <30 px from another glyph |
| 13 | Colour separation | Simulated ΔE <12 between semantically distinct UI elements under 4 vision models |
| 14 | Measure | Any text zone whose computed measure falls outside 58–66 ch at any `--ui-scale` step |
| 15 | Focusability | Any interactive element without a focusable DOM mirror or a visible focus style |
| 16 | Size budget | Per-act chunk >12 MB, initial shell >8 MB, total art >85 MB (art guide §6.5) |
| 17 | Texture residency | Two scenes resident >240 ms in the transition harness |
| 18 | Ledger | Any file in `art/dist/` without a ledger record (art guide §6.6) |

Checks 1–12 and 14–15 are cheap and should exist in week one, before there is any content to fail them. A validator written after the content is a validator that gets disabled.

---

## Appendix A — Open items for the next document

1. **The eight apex scenes** (**R12**, second painted plate) are nominated per-act at act sign-off. This document reserves the budget (40 additional layer images) and does not name them. → act design docs.
2. **The 12 surveyor's-overlay exteriors** (reference analysis §1.4, hold-`M`) need selecting. They must be scenes where terrain is legible and load-bearing; Acts 1 and 8 get none.
3. **`VF-MT`** is the cuttable map table. Decide at Act 5 sign-off.
4. **The drill sequence at Valley Forge** is referenced in §8.3 as untimed and is otherwise out of scope here. → mechanics doc.
5. **Epilogue staging** — three passes (Obra Dinn grouping, reference analysis §4.1) — is a presentation problem in the §6 layer, not a scene. → epilogue doc.
6. Hessian facings at Trenton remain the most urgent open item in the historical pack §8, and it blocks `TR-01`'s character generation, not its composition.
