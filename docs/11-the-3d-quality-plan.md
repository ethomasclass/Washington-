# 11 — The 3D Quality Plan

*Written 18 Aug 2026, after the full-game wiring (branch
`claude/3d-voxel-vs-2d-engine-ux0fpt`). This is the honest audit of every
asset class in the first-person build, measured against the bar the game
needs, and the ordered plan for closing the gap. The bar: a player should
forget the engine within a minute of walking, and a teacher should never
have to apologise for how it looks.*

## 1. What the engine has (inventory)

| Class | What exists | Verdict |
|---|---|---|
| Render pipeline | Toon ramp + outline pass (depth Laplacian + normal edges, ground excluded), per-scene sky/fog palettes, 4096 shadow map, wind vertex shader, weather overlay (snow/rain), water shader | **Solid.** The look is owned, not defaulted. |
| Terrain | Seeded fbm heightfield, vertex-painted wear/lanes/fields, clearings, seabed dives, landmass islands with plateaus | **Solid.** |
| Architecture | `building()` generator (bays, hip/gable, shutters, courses, cornice, dormers, chimneys, real door voids), two furnished walkable interiors, animated doors | **Good**, generator-grade. Hero buildings (the mansion) deserve one bespoke pass each. |
| Props | ~40 kit pieces: siege engineering (gabions/fascines/chandeliers/abatis/berms), camp life (tents ×4, fires, barrels, wagons), estate life (fences, wharf, sloop, chariot, laundry, haystack), ruins, ships at true scale | **Good.** Density passes done; the kit reads. |
| People | Procedural capsule-limb rig; dress/hat/pose/musket variants; idle/work animators | **The weakest class.** Faceless mannequins; named characters differ from extras only by coat colour. |
| Animals | Horse, cow, sheep, chicken, birds | Serviceable at distance; horse is close-up-tolerable only. |
| Vistas | Connected landmasses, burned Charlestown with ruins/chimneys/smolder, Boston with two districts, fleet, Neck + Mystic shore | **Good after this pass.** Next level is a painted silhouette ring + cloud cards. |
| Textures | 9 procedural canvas textures, low-contrast under cel | **Right approach.** Coverage could widen (interior wallpaper, worn floor, wet mud). |
| Interiors | Emissive-lining technique (no leakable lights), ceiling shadow-casters, two-storey collision | **Solid** after the eave-leak and lining fixes. |
| Audio | **None.** | **The cheapest huge win available.** |
| UI | The full print-style DOM overlay, shared verbatim with the 2D build | **Excellent.** Do not touch. |

## 2. The gap, ranked by what the player actually notices

1. **Humans.** Every conversation happens face-to-featureless-face. The whole
   game is people telling you hard things; the people must carry it.
2. **Silence.** A camp of sixteen thousand men makes no sound. Ambient audio
   is the single cheapest immersion multiplier in the codebase's future.
3. **Grounding.** Props sit ON the ground rather than IN the world: no
   contact occlusion, no grime ring at a building's foot, no wear decal
   under a fire.
4. **Selection feedback.** The chosen interactable is a floating label; the
   object itself never acknowledges being looked at.
5. **Sky theatre.** Skies are clean gradients; November needs low torn
   cloud, May needs cumulus over the Potomac.

## 3. The plan, in order

### P1 — People (the hero pass)
- Sculpt toon **heads**: brow/nose/jaw silhouette instead of a sphere; painted
  cel eyes and brows on a small face texture; hair masses under the hats.
- **Named-character silhouettes**: Martha's cap and gown line, Knox's bulk and
  bound arm (R-check first), Gates's spectacles, Washington unmistakable if he
  is ever shown. Distinct heights/builds are already supported — use them.
- **Gesture set** for dialogue: turn-to-face the player on approach (slerp the
  yaw), a talk loop (head nod, hand lift), and a walk cycle so cast can move.
- Keep it procedural (the kit's strength) unless a scene demands more; a GLTF
  path stays open but is not required for the bar.

### P2 — Sound
- Positional beds per scene: MV birdsong/river/wind-in-leaves; CB-01 camp
  murmur, axes, drill calls, fires; CB-02 room tone, fire, quill; CB-03 wind,
  surf, distant gull, canvas flap.
- Interaction foley: door creak, paper, footsteps by ground type, UI already
  has its own register.
- All synthesised or CC0, baked to short loops; WebAudio, distance-attenuated.
  One file, no streaming.

### P3 — Grounding
- Baked **contact discs** (soft dark gradient planes) under every kit prop and
  figure; grime/mud ring decals at building feet; trodden-earth decal under
  fires and tables. Cheap, transformative at eye level.
- Tree pass: replace icosahedron clusters with 2–3 authored toon canopy
  silhouettes (still low-poly, outline-friendly).

### P4 — Sky theatre & weather range
- A silhouette **backdrop ring** (distant treeline/hills card) per scene so no
  bearing meets raw horizon.
- Toon **cloud cards** with per-scene weather: May cumulus, July haze, November
  scud; drift with the wind uniform.
- Wire the existing rain/snow to scene moments (CB-03 first snow is already
  authored — lean in).

### P5 — Interaction polish
- Selected-object response: a subtle warm rim/outline pulse on the current
  target (the outline pass can take a per-object emissive nudge).
- Examine push-in: a short camera ease toward documents when a card opens.
- The map-table lift (CB-02's authored survey) as an in-world lean-over.

### P6 — Performance & shipping
- Merge static per-scene geometry; instance repeated props (tents, gabions).
- Texture atlas for the canvas textures; cap the single-file build ≤ 1.5 MB.
- A settings row: shadow quality, outline on/off, motion reduction.

## 4. What is deliberately NOT in the plan
- Photoreal materials, normal maps, PBR — the print/toon direction is the
  identity; fidelity comes from silhouette, value, and life, not microdetail.
- Character voice acting — the writing register is the voice.
- Open-world scope — four rooms of history done deeply beats a county done thin.

*Each phase lands as its own commit with before/after screenshots in the PR
description; the audit conventions (R-markers for researched fact, V-markers
for unverified) apply to art exactly as they do to text.*
