# "In Washington's Shoes" — Game Design Brief
### An educational game for US History students, told through George Washington's leadership and decision-making during the American Revolution

---

## 1. Concept & Pedagogical Goal

A top-down, pixel-art exploration/narrative game (Zelda/Pokémon-style movement) where the student plays as George Washington across the arc of the Revolutionary War. The game blends three things:

1. **Exploration** — walk around historically-grounded maps, talk to NPCs, find collectible documents/objects
2. **Narrative decision points** — key historical moments framed as real choices with consequences, but **no fail state** — the war is always eventually won, but the *quality* of the outcome and the *kind of leader* Washington becomes varies
3. **Action/battle sequences** — three distinct battle formats (see Section 4), each triggered by and reflecting prior decisions/stats rather than raw player combat skill

**Target use case:** classroom unit spanning multiple class periods, roughly one Act per session. Not a single sit-down playthrough.

**Core design rule:** the player is *always* Washington. Historical events Washington wasn't present for (e.g. Saratoga) are folded in as news/documents/NPC dialogue rather than broken out into separate playable perspectives — this keeps the "in his shoes" premise intact throughout.

---

## 2. The Stat System (the backbone)

Four tracked stats, invisibly accumulated through exploration, dialogue choices, and decision points. No stat is ever shown as a "score" to the student mid-game — it should feel like consequence, not gamification.

- **Military Judgment** — quality of tactical/strategic decisions
- **Political Legitimacy** — trust from Congress and civilian authority
- **Troop Loyalty / Morale** — how the army feels about him
- **Personal Character** — restraint, honesty, integrity under pressure

These stats:
- Subtly change map appearance (better-supplied camps, brighter palettes, more NPCs present when stats are high; grayer, sparser, more desperate-looking when low)
- Change NPC dialogue tone and availability
- Gate which dialogue/tactical options are available in later decision points and battles
- Drive a final **epilogue** — a personalized "what kind of leader you became" summary compared against what Washington actually chose historically

---

## 3. Act-by-Act Map & Content Breakdown

### Act 1 — Mount Vernon
Small pastoral home map: manor house, fields, slave quarters, stable, dock.
- NPCs: Martha, an overseer, an enslaved worker (brief, respectful, not gamified as a fetch quest — meant to complicate the "great man" narrative honestly), a Congress messenger
- Collectibles: French & Indian War memorabilia, Congress letters, Boston news clippings
- Decision point: accept command of an untrained, unfunded army
- Tone: quiet, low stakes — sets up contrast with everything after

### Act 2 — Cambridge / Boston Siege
Sprawling muddy camp: tents, drill field, supply depot, distant view of British-held Boston.
- NPCs: raw militia recruits, Henry Knox, a visiting Congress delegate
- Collectibles: requisition forms, training manuals, a spyglass "scout Boston" mini-puzzle
- **Battle Type: Logistics puzzle** — haul Ticonderoga's cannons through winter terrain; route/pacing choices affect losses and timing

### Act 3 — Long Island / New York
Larger, chaotic map: Brooklyn Heights fortifications, ferry landing, a fog/night variant as things deteriorate.
- NPCs: panicked junior officers, an early spy character (sets up recurring intelligence mechanic), optional Nathan Hale cameo
- Collectibles: British troop movement reports (found vs. missed changes battle difficulty), evacuation manifests
- **Battle Type: Decision-battle hybrid** — evacuate under time pressure; choices determine what's saved vs. lost

### Act 4 — The Delaware Crossing / Trenton
Three-part map: riverside camp (tense, cold) → the crossing itself (dedicated action scene) → Trenton town (brief post-battle exploration).
- NPCs: soldiers questioning re-enlistment (ties to morale), an informant with Hessian garrison intel
- Collectibles: a Thomas Paine pamphlet as a readable in-game item
- **Battle Type: Scripted sequence, stat-weighted beats** — storm crossing, surprise attack; outcome quality shaped by accumulated stats
- This is the visual showpiece act — storm effects, ice, torchlight

### Act 5 — Valley Forge
Static, grim winter camp. No battle — deliberate tonal break, possibly slower player movement to sell exhaustion. Map visually improves over the course of the level as training takes hold.
- NPCs: sick/dying soldiers, Baron von Steuben (teaches an in-game "drill" minigame), a Congress inspector (honest vs. diplomatic dialogue choices)
- Collectibles: ration logs, soldiers' journal entries (primary-source flavor text)
- **Saratoga handled here (Option C):** folded in as news/documents and NPC conversation, not a separate map — "did you hear about Gates up north?" Also introduces the **Conway Cabal** thread: rivals maneuvering to have Gates replace Washington, tied to Political Legitimacy and Personal Character stats. Teaches Saratoga's importance (the French alliance) and adds a "leadership under threat from rivals" beat without a new battle system or breaking the "always Washington" rule.

### Act 6 — Newburgh Encampment
Small, claustrophobic map: officers' quarters, a meeting hall. Deliberate contrast to Trenton's spectacle.
- NPCs: angry officers (tone reflects accumulated Troop Loyalty), Congress messengers with bad news about pay
- Collectibles: the anonymous "Newburgh Address" letter, found before the climactic speech scene
- Climax: the famous glasses moment ("I have grown gray... and now find myself growing blind") — a quiet, powerful set-piece, not an action beat. Best single "beyond the standards" moment in the game for teaching civilian control of the military.

### Act 7 — Yorktown
Largest map: American lines, French lines, British-held town, French fleet visible offshore.
- NPCs: Lafayette, French officers (richer dialogue if the relationship was built earlier), Cornwallis's surrender surrogate (O'Hara) as background
- **Battle Type: Combined-arms scripted sequence** — biggest battle set-piece; French naval support gated by earlier alliance-building choices

### Act 8 — Annapolis / Congress (Resignation)
Small, symmetrical formal map: a state house chamber, maybe one hallway.
- NPCs: Congress delegates, watching in stunned silence
- No collectibles, no battle — the entire act is the single act of voluntarily surrendering power
- Should look/feel completely different from every other map: bright, still, quiet, museum-like
- Leads into the stat-driven epilogue

---

## 4. Three Battle/Action Formats

1. **Logistics puzzle** (Act 2) — resource/timing puzzle, no direct combat
2. **Decision-battle hybrid** (Act 3, and could repeat) — real-time-feeling choice points layered on an animated pixel battle scene; each choice branches to a different short animated outcome
3. **Scripted sequence with stat-weighted beats** (Acts 4 & 7) — battle plays out as pre-authored short animations (advance/retreat/casualties/victory) selected based on accumulated stats rather than simulated combat/AI

All three read from the same global stats/decision-state object — no separate combat engine needed.

---

## 5. Technical Approach (for Claude Code to evaluate/propose)

- Likely stack: HTML5 canvas or a lightweight framework (e.g. Phaser) for tile-based movement + sprite animation
- JSON-driven dialogue, decision trees, and battle-outcome tables, so content is editable without touching engine code
- A single global state object (the four stats + flags for which documents/NPCs were found) passed between all scene types (exploration, dialogue, decision, battle)
- Map "mood" driven by stat values via palette swaps / sprite density rather than bespoke art per stat combination (keep this cheap)
- Pixel art style throughout; scope art asks realistically per act (reusable tile sets, modular NPC sprites)

---

## 6. Open Questions for Claude Code to Help Think Through

- Best lightweight engine/library choice for a browser-based, classroom-deployable build
- How granular should the stat-to-outcome mapping be (discrete thresholds vs. continuous scoring)?
- How to structure the JSON schema so acts/dialogue/battles can be authored independently and iterated on
- How to handle save state across multiple class periods (a multi-day unit) — per-student saves?
- Scope-appropriate way to build the "map mood shifts with stats" effect
- Any additional "beyond the standards" extension threads worth planting (open to suggestions)

---

## 7. Design Principles to Preserve

- Player is always Washington — no perspective breaks
- No fail state — always reach the end, but the *quality* of the outcome varies
- Consequences should be legible through mood/dialogue/map changes, not scoreboards
- Content that's "required learning" should be discoverable through play (documents, NPC dialogue) rather than delivered as exposition dumps
- Quiet acts (Valley Forge, the Resignation) are intentional — spectacle should be earned by contrast, not constant
