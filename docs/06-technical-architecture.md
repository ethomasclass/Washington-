# Technical Architecture
### *In Washington's Shoes* — the Three.js implementation, the content schema, and the build
**Version 1.0 — 14 August 2026**
**Owner:** Engineering Lead. **Audience:** engineers, the content authors (§5, §6), and whoever inherits this in 2029.

---

## 0. How to read this, and what it overrides

This document is downstream of four others and assumes them:

| Doc | What it fixed that this document implements |
|---|---|
| `reference/ai-art-production-guide.md` | Asset formats (KTX2/UASTC + WebP), resolutions, the 85 MB art budget, the 120 MB GPU ceiling, the ledger |
| `reference/reference-game-analysis.md` | R1–R25, the binding design rules |
| `docs/02-art-direction.md` | The mood controller `W`, the nine uniforms, the six registers, the palette, typography |
| `docs/04-scene-architecture.md` | The scene model, the camera numbers, depth sorting, transitions, the map table, accessibility |

**Where this document conflicts with those, this document wins, and every conflict is listed in Appendix A.** There is exactly one substantive one: **`04-scene-architecture.md` assumed `ink`/`inkjs` for dialogue authoring, and this document replaces it with a declarative JSON node graph.** The reasoning is in §5.0 and it is not a matter of taste — it is what makes §6 possible.

**The one-paragraph summary.** Three.js + TypeScript + Vite, static build, no backend, no telemetry, no third-party requests. A scene is five textured planes at fixed Z under a nailed perspective camera, rendered to a two-attachment render target (colour + ink coverage), then run through a two-pass composite that implements the mood system. Characters are 11-quad paper puppets stepped at 12 fps. All content is declarative JSON validated by a build-time linter that fails the build on any unresolvable reference, unreachable node, or unsatisfiable condition. State is four 7-bit stats plus a 64-bit flag bitmap, serialised into a 28-character Crockford Base32 passport code with a CRC-16 that catches every single-character typo. Total build ≈ 96 MB, initial download 7.4 MB, title interactive in under 3 s.

---

# 1. STACK

## 1.1 The target machine, stated as a number

Every decision below is measured against one device, and it is not the developer's laptop.

**The reference Chromebook** — the machine the build must be good on, not merely run on:

```
CPU        Intel Celeron N4020 (2c/2t, 1.1 GHz base) or MediaTek MT8183 (ARM, 8c)
GPU        Intel UHD 600 (12 EU) or Mali-G72 MP3
RAM        4 GB, shared with the GPU
Panel      1366 × 768, no touch guaranteed, touch common
Storage    32 GB eMMC, typically 60–80% full
Browser    Chrome (ChromeOS), evergreen, WebGL2 guaranteed, WebGPU NOT guaranteed
Network    shared district wifi, 5–25 Mbps aggregate across 30 devices
```

The three hard consequences: **WebGL2, not WebGPU** (WebGPU on ChromeOS is behind driver allowlists that exclude the older Intel and Mali parts in every fleet we will see); **fill rate is the scarce resource**, not polygon count, because a UHD 600 at 1366×768 has perhaps 1.5–2 GPix/s of real-world fill and we are drawing full-screen quads; and **4 GB shared RAM means a tab discard** above roughly 200 MB of resident memory, which is why §4.6 exists.

## 1.2 Three.js, and the four things it beat

**Decision: Three.js r180 (pinned exactly), TypeScript 5.9, Vite 7.**

| Alternative | Why it loses |
|---|---|
| **PixiJS 8** | The obvious 2D answer, and it would render the dioramas beautifully and smaller. It loses on the map table: six scenes are a genuine displaced heightfield under an orbiting camera with slope-driven hachures (04 §7.2). Pixi would need a second renderer, a second asset path, a second shader dialect, and a second context on a device that struggles with one. One renderer for both modes is worth 90 KB. |
| **Raw WebGL2** | We would write, over four months, a worse version of `WebGLRenderer`'s state cache, KTX2 transcoder integration, and render-target management. The 148 KB of tree-shaken Three.js is cheaper than the bugs. |
| **Phaser 4** | The brief's original suggestion, and correct for the tile-based game the brief described. That game no longer exists. Phaser has no depth, no fog, no orbit camera, and its scene manager assumes a game loop we would fight. |
| **Godot 4 / Unity WebGL export** | Both produce 15–40 MB WASM/JS payloads before a single asset, both have documented ChromeOS memory-pressure problems, and neither gives us a build a district's IT can audit by reading it. Unity's export additionally cannot be made to load zero third-party resources without a fight. Disqualified on payload alone. |

Three.js earns its bytes by giving us, tree-shaken and with nothing unused: the WebGL2 state machine, `KTX2Loader` with the Basis transcoder, `WebGLRenderTarget` with MRT, `Data3DTexture` for LUTs, `PlaneGeometry`/`BufferGeometry`, and `ShaderMaterial`. We use approximately 30% of the library and tree-shaking removes the rest.

**TypeScript is not negotiable** for one specific reason beyond the usual: the content schema (§5) generates TypeScript types, so a JSON field rename breaks the compile rather than producing a silent `undefined` in Act 6 during a class period.

**Vite** for the dev server's sub-100 ms HMR (the content linter runs as a Vite plugin on save, §6.2), for `import.meta.glob` on the content tree, and because its Rollup build gives us deterministic per-act chunks (§4.3) with no configuration gymnastics.

## 1.3 The complete dependency list

Runtime dependencies — everything that ships to a student's browser:

| Package | Exact | Gzipped | Why it earns its payload |
|---|---|---|---|
| `three` | `0.180.0` | **~148 KB** | §1.2. Tree-shaken via `import { X } from 'three'` only; no `three/examples` barrel imports. |
| `three/examples/jsm/loaders/KTX2Loader.js` | (bundled) | ~9 KB | The only supported path to UASTC textures. |
| `basis_transcoder.wasm` + glue | (from three) | **~242 KB** | Transcodes UASTC → the device's native format (BC7 on Intel, ASTC on Mali, ETC2 fallback). Non-negotiable: without it a 2048×1152 layer costs 9.4 MB of VRAM as RGBA8 instead of 4.7 MB compressed, and five layers blows the ceiling. Loaded once, cached forever. |
| *(none)* | — | — | **That is the entire runtime dependency list.** |

Everything else is written in-repo. The things we deliberately did **not** install, with the reason each was rejected:

| Not installed | Would have cost | Why we wrote it instead |
|---|---|---|
| **React / Preact / Svelte** | 45–140 KB | The DOM layer is one dialogue panel, one letterbook, one document viewer and a title screen. It is ~900 lines of TypeScript against `<template>` elements. A framework would be the second-largest thing in the bundle to manage four views. |
| **`inkjs`** | ~50 KB | §5.0. Not a payload decision — a verifiability decision. |
| **`howler.js`** | ~9 KB | We need exactly: gapless loop, equal-power crossfade, one biquad low-pass, positional pan from a scalar, and a streamed score bus. That is 210 lines of Web Audio (§8.1). Howler's value is its HTML5-audio fallback for browsers we do not support. |
| **`gsap` / `tween.js`** | 12–60 KB | Six easing functions and a 40-line `Tween` class. All animation in this game is a scalar over a duration. |
| **`three/examples/jsm/postprocessing/EffectComposer`** | ~11 KB + a full-size ping-pong target | We have exactly two post passes with a fixed order (§2.6). `EffectComposer` allocates two full-resolution RGBA targets to support a pass chain we do not have; that is **11.6 MB of VRAM** to avoid writing 60 lines. |
| **`zod`** | ~14 KB | Validation is build-time only (§6). It never ships. |
| **A state-management library** | 3–12 KB | The state object is one plain object behind one module with four exported functions (§7.1). Adding a store to manage 4 integers and a bitmap would be comedy. |
| **A physics/ECS/pathfinding library** | any | The player has one degree of freedom, `t ∈ [0,1]` (04 §1.2.2). There is nothing to simulate. |

Build-time dependencies (never shipped):

| Package | Role |
|---|---|
| `typescript` `5.9.x` | Compile + type-gen |
| `vite` `7.x` | Dev server, build, per-act chunking |
| `ajv` `8.x` + `ajv-formats` | JSON Schema draft 2020-12 validation in the linter (§6) |
| `json-schema-to-typescript` | Schemas → `src/content/types.gen.ts`; the single source of truth is the schema file |
| `vitest` `3.x` | Unit + property tests (§11) |
| `fast-check` `4.x` | Property tests for the save codec and the condition evaluator |
| `@playwright/test` | One smoke path + the throttled performance harness (§11.3–11.4) |
| `sharp` | Build-time image work: LUT strip → 3D texture data, atlas packing verification |
| `fonttools` (Python, via `scripts/`) | Font subsetting to the archaic glyph set (02 §7.5) |

Node 22 LTS. `package-lock.json` committed. `npm ci`, never `npm install`, in CI.

**Version pinning is a preservation requirement, not hygiene.** This is a product a district will still be running in 2030. Every dependency is pinned to an exact version, the lockfile is committed, and `docs/BUILD-PROVENANCE.md` records the Node version, the OS, and the SHA-256 of `basis_transcoder.wasm`. The art guide made the same argument about model weights (§0); it applies identically to the code.

---

# 2. RENDERING ARCHITECTURE

## 2.1 The frame, in order

```
 1.  update      input → walkplane t → player transform (12 fps stepped, §3.5)
 2.  update      camera parallax spring (τ=250 ms, twice-applied) → cameraOffset
 3.  update      per-layer corrective offset (§2.3) → 5 mesh positions
 4.  update      mood uniforms — CONSTANT within a scene (02 §3.5); written once at scene load
 5.  RENDER A    5 layer quads + N character puppets + M prop quads
                 → sceneRT   attachment0 RGBA8 (premultiplied colour)
                             attachment1 R8    (composited ink coverage)
 6.  RENDER B    fullscreen triangle at HALF resolution
                 → bleedRT   RGBA8 (dilated wash rgb, granulation scalar in a)
 7.  RENDER C    fullscreen triangle at native resolution
                 sceneRT + bleedRT + paper grain (device px) → default framebuffer
 8.  DOM         dialogue layer, letterbook, glyph overlay — composited by the browser
```

Steps 5–7 are the only GPU work. Step 8 costs nothing on the GPU budget because the browser composites it, and it is where 60–70% of the student's time is spent (04 §6).

**Draw call count for a typical scene:** 5 layers + 4 characters + 6 props + 2 fullscreen = **17 draw calls**. On the reference Chromebook, draw-call overhead is irrelevant at this count; fill rate is everything, and §2.6 is where we spend it.

## 2.2 Camera: perspective, and why orthographic loses

**Decision: one `THREE.PerspectiveCamera`, fov 28° vertical, exactly as fixed in 04 §2.1.** Not orthographic.

Orthographic is the tempting choice for a layered 2D game — no perspective distortion on the plates, and parallax done by hand as a per-layer translation. It loses on three counts:

1. **The map table needs perspective anyway** (04 §7.3: an orbiting camera at 42–66° pitch over a displaced heightfield). Two camera types means two projection paths through every shader, two frustum-sizing helpers, and two sets of bugs.
2. **Distance-correct fragment fog is free with perspective and hand-rolled with orthographic.** We do not, in the end, use built-in fog (§2.4) — but the *portrait push* (04 §2.5, Z −0.7 over 400 ms) and the *scripted pullback* (Act 7, Z 24→38) are dolly moves, and a dolly under orthographic projection is a no-op. Act 7's apex move would have to be faked as a scale, which shears the layer stack.
3. **A 28° perspective frustum is already within 6% of orthographic across the plate.** At the L2 plane, the difference between the perspective and orthographic projection of the plate's corners is under 4 px at 1600 logical width. We get the correctness of perspective at the visual cost of orthographic. This is exactly why 04 §2.1 chose 28° and it is the reason the decision is easy.

Frustum arithmetic, which every other number in this section derives from:

```
fovY   = 28°                       tan(fovY/2) = 0.24933
aspect = 16/9                      tan(fovX/2) = 0.24933 × 1.7778 = 0.44325
camera at z = 24, target z = −6

frame HEIGHT in world units at depth d :  H(d) = 2 × 0.24933 × d
frame WIDTH  in world units at depth d :  W(d) = 2 × 0.44325 × d

at the L3 plane (z = 0, d = 24):  W = 21.276 world units ≡ 1600 logical px
                                  ⇒ PIXELS_PER_UNIT = 75.20 at L3
```

## 2.3 The layer stack, and the parallax that perspective does not give you for free

Each layer is a `PlaneGeometry(W(d) × 1.125, H(d) × 1.125)` at its authored Z — the 1.125 is the art guide's 12.5% overscan, and it exists solely to feed the dolly (04 §1.2.1).

```ts
const LAYERS = [
  { id:'L0', z:-40, parallax:0.10, fog:1.00, inkInAlpha:true,  aerial:0.55 },
  { id:'L1', z:-18, parallax:0.30, fog:0.72, inkInAlpha:true,  aerial:0.30 },
  { id:'L2', z: -6, parallax:0.62, fog:0.34, inkInAlpha:true,  aerial:0.08 },
  { id:'L3', z:  0, parallax:1.00, fog:0.10, inkInAlpha:false, aerial:0.00 },
  { id:'L4', z: +7, parallax:1.55, fog:0.00, inkInAlpha:false, aerial:0.00 },
] as const;
```

**Here is the part that is easy to get wrong.** A perspective camera translating laterally by `dx` already produces parallax: a plane at camera-distance `d` displaces by `dx / W(d)` of the frame, which normalised against L3 gives `d₃/d`. Those *free* factors are:

| Layer | d = 24 − z | free factor `d₃/d` | **authored** factor `k` |
|---|---|---|---|
| L0 | 64 | 0.375 | **0.10** |
| L1 | 42 | 0.571 | **0.30** |
| L2 | 30 | 0.800 | **0.62** |
| L3 | 24 | 1.000 | **1.00** |
| L4 | 17 | 1.412 | **1.55** |

The free spread is 0.375→1.412 (3.8×). The authored spread is 0.10→1.55 (15.5×). **Perspective alone gives us a quarter of the depth the art direction asked for.** Pushing the layers further apart in Z to close the gap would put L0 at z ≈ −190, at which point the plate would need to be 8× larger to fill the frame. So each layer carries a corrective translation.

Derivation. Camera at `x = dx` shifts a plane's image by `−dx/W(d)`. A plane translated by `tx` shifts its image by `+tx/W(d)`. We want the total to equal `−k · dx/W(d₃)`:

```
(tx − dx) / W(d)  =  −k · dx / W(d₃)
tx − dx           =  −k · dx · d/d₃            (because W ∝ d)
```
> **`tx_i = dx · (1 − kᵢ·dᵢ/d₃)`**

Sanity: L3 → `dx(1 − 24/24) = 0` (no correction, as it must be). L0 → `dx(1 − 0.10·64/24) = +0.733·dx` (the far plane rides along with the camera, killing most of its motion). L4 → `dx(1 − 1.55·17/24) = −0.098·dx` (the foreground pushes slightly against the camera, exaggerating its motion). The signs and magnitudes are what a matte painter would do by hand, which is the check that the algebra is right.

```ts
// per frame, after the spring has produced cameraOffset in world units
for (const layer of layers) {
  const d = CAM_Z - layer.z;
  layer.mesh.position.x = camOffset.x * (1 - layer.parallax * d / 24);
  layer.mesh.position.y = camOffset.y * (1 - layer.parallax * d / 24);
}
camera.position.set(camOffset.x, camOffset.y, CAM_Z + dollyZ);
```

The spring, per 04 §2.3: `MAX_OFFSET = 0.040 × 1600 px = 64 px = 0.851 world units` at L3's scale; vertical `0.010 × 1600 = 16 px = 0.213 units`. Exponential smoothing `α = 1 − exp(−dt/0.25)` applied **twice** per frame to the same value, which is what gives C¹ continuity and is why the camera has no arrival.

**Overscan check.** L4 at the maximum offset displaces 1.55 × 64 = **99 px**. Overscan gives 0.125 × 2048 / 2 = **128 px** of margin per side at ship resolution, which is 1600 × 0.125 / 2 = **100 logical px**. 99 < 100 by one pixel. That is uncomfortably tight, so: **L4's overscan is raised to 15% (2048 → the plate is composed with 15% bleed) and the runtime clamps L4's corrective offset to ±96 logical px.** Recorded here because it is the kind of number that produces a one-pixel transparent seam on one act six weeks before ship.

## 2.4 Fog: authored, not simulated

**Decision: `THREE.Fog` and `FogExp2` are both disabled. Fog is a per-layer scalar uniform from the manifest.**

The layer table's fog exposure column (1.00 / 0.72 / 0.34 / 0.10 / 0.00) is not the curve any distance fog produces at those Z values — `FogExp2` between d=64 and d=17 with any single density gives a much flatter ramp. More importantly, those numbers are **aerial perspective as an art decision**: the painter decided how much the far bank recedes, and it is baked into the plate's own value structure. Simulated fog would fight the painted recession and produce a doubled haze.

```glsl
wash = mix(wash, uFogColor, uFogAmount * uFogGain);
```

`uFogAmount` is the layer's authored constant. `uFogGain` is mood uniform #7 — the act's fog density value scaled 1.55 (low morale) → 0.80 (high), per 02 §3.4. `uFogColor` is per-scene from the manifest's `grade.fog.color`.

This costs one `mix` and buys exact art-direction control. The map table (§2.8) is the one place a genuine depth cue is needed and it uses none either — a survey plan has no atmosphere.

## 2.5 The layer material

Two shader programs exist for the whole game, selected by one `#define`:

- **`INK_IN_ALPHA`** — L0/L1/L2, whose ink mask ships in the texture alpha (02 §3.3: free, because UASTC carries alpha whether or not you use it)
- **derived** — L3/L4, whose alpha is spoken for by real cutout transparency, so ink is derived in-shader

Both are compiled and warmed at scene load via `renderer.compile(scene, camera)` **during the transition, before the first frame of the incoming scene** — a shader compile stall on an Intel UHD 600 is 60–180 ms and it must not land on a cut.

```glsl
// layer.frag  —  GLSL3, WebGL2, MRT
precision mediump float;

uniform sampler2D  uMap;
uniform sampler3D  uLut;          // per-act, 32³, fixed identity — never mood-driven
uniform float      uLutAmount;    // 1.0 in all shipping scenes; 0.0 for the R6 Gilt Frame

uniform float uWashChroma;        // mood 1   0.34 → 1.00
uniform float uWashTemp;          // mood 2  −0.22 → +0.10
uniform float uWashLift;          // mood 3  +0.10 →  0.00
uniform float uWashGamma;         // mood 4   1.28 →  0.96

uniform vec3  uFogColor;
uniform float uFogAmount;         // per-layer authored aerial value
uniform float uFogGain;           // mood 7
uniform vec3  uAerialInk;         // the far layers' ink tint (fixed, not mood)
uniform float uAerialAmount;
uniform float uOpacity;           // used only by transitions (§5.4 lift, fades)

in vec2 vUv;
layout(location = 0) out vec4 oColor;   // premultiplied colour
layout(location = 1) out vec4 oInk;     // R8 attachment: ink coverage in .r

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 WARM = vec3(0.86, 0.72, 0.42);   // toward YELLOW-OCHRE
const vec3 COOL = vec3(0.42, 0.48, 0.58);   // toward SHADOW-SLATE

void main() {
  vec4 src = texture(uMap, vUv);

#ifdef INK_IN_ALPHA
  float ink   = src.a;
  float cover = 1.0;
#else
  float luma   = dot(src.rgb, LUMA);
  float chroma = max(max(src.r, src.g), src.b) - min(min(src.r, src.g), src.b);
  float ink    = smoothstep(0.42, 0.22, luma) * (1.0 - clamp(chroma * 3.0, 0.0, 1.0));
  float cover  = src.a;
  ink         *= cover;
#endif

  vec3 wash = src.rgb;

  // (a) per-act LUT — the act's fixed identity
  vec3 lutUv = clamp(wash, 0.0, 1.0) * (31.0/32.0) + (0.5/32.0);
  wash = mix(wash, texture(uLut, lutUv).rgb, uLutAmount);

  // (b) mood uniforms 1–4, applied to the WASH ONLY
  wash = mix(vec3(dot(wash, LUMA)), wash, uWashChroma);
  wash = mix(wash, wash * mix(COOL, WARM, step(0.0, uWashTemp)), abs(uWashTemp));
  wash = wash * (1.0 - uWashLift) + uWashLift;
  wash = pow(max(wash, 0.0), vec3(uWashGamma));

  // (c) authored aerial recession
  wash = mix(wash, uFogColor, uFogAmount * uFogGain);

  // (d) the line is re-asserted from the UNTOUCHED source colour.
  //     "Structure never wavers" is this mix() and nothing else. (02 §3.3)
  vec3 inkCol = mix(src.rgb, uAerialInk, uAerialAmount);
  vec3 rgb    = mix(wash, inkCol, ink);

  float a = cover * uOpacity;
  oColor = vec4(rgb * a, a);          // premultiplied
  oInk   = vec4(ink * a, 0.0, 0.0, ink * a);
}
```

**Why MRT, and what it replaces.** The composite pass (§2.6) needs the *composited* ink mask — the union of all five layers' ink, in screen space — to do the edge bleed and to re-assert the line at full resolution. There is no way to carry two independent coverage values through fixed-function blending in one RGBA attachment: the destination-attenuation factor `ONE_MINUS_SRC_ALPHA` reads the same `src.a` that the RGB blend uses.

So: `new THREE.WebGLRenderTarget(w, h, { count: 2 })`, attachment 1 set to `RedFormat`/`UnsignedByteType` (**1.44 MB at 1600×900**, not 5.8 MB), both attachments sharing one blend state — `blendFunc(ONE, ONE_MINUS_SRC_ALPHA)`, premultiplied over. Attachment 1 then accumulates ink-over-ink correctly because the ink is treated as its own premultiplied layer.

*Rejected alternative:* deriving the ink mask in the composite pass from the already-graded composited colour, using the same luma/chroma heuristic. It is free, and it is wrong — after mood uniforms 1–4 have lifted the blacks and dropped the gamma, the heuristic's thresholds no longer correspond to ink, so at low morale the mask would erode exactly where the design promises the line does not. *Spike risk:* if a driver in the fleet rejects mixed attachment formats, fall back to RGBA8 for attachment 1 and eat the 4.4 MB. Verify in week one on real hardware, not in an emulator.

## 2.6 The composite — the mood system's screen-space half

Uniforms 5, 6, 8 and 9 (edge bleed, granulation, vignette, grain) are screen-space, applied after compositing, at fixed device-pixel density — **R10**, the Obra Dinn dither-lock rule. Getting them wrong is the single most likely way to destroy the art direction, so the structure is specified rather than left open.

**Two passes, not one, and the reason is fill rate.** The edge bleed needs 8 taps of a 1600×900 target. Eight taps at native resolution is 11.5 Mtex per frame, 690 Mtex/s at 60 Hz, on a GPU with roughly 2 GTex/s of *theoretical* bandwidth already spending most of it on five full-screen textured layers. It does not fit. So:

**Pass B — half resolution (800×450), 6 taps.** Produces the dilated wash and the granulation modulation. 1.6 Mtex/frame. A quarter of the cost.

**Pass C — native resolution, 4 taps.** Upsamples B bilinearly, applies vignette and grain, and — critically — **re-asserts the ink from the full-resolution `oInk` attachment**, so the line survives the half-resolution round trip completely intact. The blur is half-res; the line is not. This is the entire reason the passes are split in this order, and it is worth writing down because a future engineer will be tempted to fold C into B.

```glsl
// composite_b.frag  —  half resolution, output: rgb = dilated wash, a = tooth modulation
uniform sampler2D uScene;      // attachment 0
uniform sampler2D uInk;        // attachment 1 (R8)
uniform sampler2D uPaper;      // tiling paper-tooth, 512², greyscale
uniform vec2  uTexel;          // 1/full-res
uniform float uEdgeBleedPx;    // mood 5 : 2.6 → 0.0
uniform float uGranulation;    // mood 6 : 0.75 → 0.22
uniform vec2  uPaperScale;

in vec2 vUv;
out vec4 oOut;

// 6 taps on a fixed rotated hexagon — no noise, no dither, no temporal anything
const vec2 TAPS[6] = vec2[6](
  vec2( 1.000, 0.000), vec2( 0.500, 0.866), vec2(-0.500, 0.866),
  vec2(-1.000, 0.000), vec2(-0.500,-0.866), vec2( 0.500,-0.866));

void main() {
  float r = uEdgeBleedPx;
  vec3  acc = vec3(0.0);
  float wsum = 1e-4;
  float inkBlur = 0.0;

  for (int i = 0; i < 6; i++) {
    vec2  o  = TAPS[i] * r * uTexel;
    vec3  c  = texture(uScene, vUv + o).rgb;
    float k  = texture(uInk,   vUv + o).r;
    // pull WASH colour only — the bleed is pigment moving, not line moving
    float w  = 1.0 - k;
    acc     += c * w;
    wsum    += w;
    inkBlur += k;
  }

  vec3  bleed = acc / wsum;
  float tooth = texture(uPaper, vUv * uPaperScale).r;
  // pigment settles into the tooth, and settles harder in the darker wash
  float gran  = mix(1.0, tooth, uGranulation * (1.0 - dot(bleed, vec3(0.2126,0.7152,0.0722))));

  oOut = vec4(bleed, gran * 0.5 + inkBlur / 12.0);   // .a packs tooth + the ink halo
}
```

```glsl
// composite_c.frag  —  native resolution, to the default framebuffer
uniform sampler2D uScene;
uniform sampler2D uInk;
uniform sampler2D uBleed;      // half-res, bilinear
uniform sampler2D uGrain;      // paper grain + chain lines, 512², DEVICE-PIXEL locked
uniform vec2  uGrainTexSize;
uniform float uEdgeBleed01;    // normalised mood 5
uniform float uVignette;       // mood 8 : 0.42 → 0.16
uniform float uGrainOpacity;   // mood 9 : 0.38 → 0.22
uniform vec3  uInkFloor;       // #241C14, or #16110D under R6

in vec2 vUv;
out vec4 oOut;

void main() {
  vec3  scene = texture(uScene, vUv).rgb;
  float ink   = texture(uInk,   vUv).r;
  vec4  b     = texture(uBleed, vUv);

  float halo  = clamp(b.a * 2.0 - ink, 0.0, 1.0);   // the ring around a line, not the line
  vec3  wash  = mix(scene, b.rgb, uEdgeBleed01 * halo);
  wash       *= (b.a * 2.0 - 1.0) * 0.5 + 1.0;      // unpack + apply granulation

  // THE LINE. Where ink coverage is 1, the composited scene colour IS the ink colour,
  // so re-asserting it is a mix back toward the untouched composite. Full resolution,
  // full opacity, never blurred, never lifted. (Obra Dinn §4.1 / R10)
  vec3 col = mix(wash, scene, ink);

  // vignette — a sheet darkening at the edges, not a lens
  vec2  q = (vUv - 0.5) * vec2(1.0, 0.5625);
  col *= 1.0 - uVignette * smoothstep(0.20, 0.62, dot(q, q) * 3.2);

  // paper grain, locked to DEVICE pixels — this is R10 and it is the whole illusion
  float g = texture(uGrain, gl_FragCoord.xy / uGrainTexSize).r;
  col = mix(col, col * (0.72 + 0.56 * g), uGrainOpacity);

  oOut = vec4(max(col, uInkFloor), 1.0);
}
```

**The composite order is exactly 02 §3.4's order and deviating from it produces subtly wrong results that are very hard to diagnose.** It is asserted in a unit test against a golden 16×16 render (§11.2).

**Uniform update policy: `W` is sampled at scene load, eased over 1.2 s, and then constant** (02 §3.5). All nine uniforms are written once per frame from one cached struct; there is no per-object uniform churn. The one authored exception — a `W` step of ≤0.25 over 3 s at an act's apex — is driven by the same easing path.

**Resolution policy.** The drawing buffer is `min(devicePixelRatio, 1.0)` capped at 1600×900. On the reference 1366×768 panel we render 1366×768 natively, which is 1.05 Mpix. If p95 frame time exceeds 22 ms over 60 consecutive frames, `sceneRT` and `bleedRT` drop to 0.85× **once** and never come back up within a scene; pass C stays native so the DOM-adjacent edges and the grain never soften. One step, one direction, no oscillation.

## 2.7 Characters in the scene, and depth sorting

Characters are billboarded quads at L3's Z (0) — no billboarding maths is needed, because the camera never rotates; they are simply co-planar quads. They are drawn in the same pass as the layers.

**Sorting is by declared integer, never by computed Z** (04 §4.4), which requires exactly three settings:

```ts
renderer.sortObjects = false;                    // Three's own sort is off, globally
material.depthTest  = false;
material.depthWrite = false;
mesh.renderOrder    = sortKey;                   // the integer table below
```

```
L0 sky                                    0
L1 far                                 1000
L2 mid                                 2000
  NPC billboards declared "behind mid"  2500
L3 near                                3000
  characters on the walk-plane         3500 + round(t × 100)
L4 fore                                4000
  (L4 t-range fragments, ≤2 in game)   3400 when outside their t_range
```

With `sortObjects = false`, Three.js draws in scene-graph insertion order *unless* `renderOrder` differs, in which case it sorts stably by `renderOrder` — which is precisely what we want and is why the value is an integer with wide gaps. The character key `3500 + round(t × 100)` is recomputed only when `round(t × 100)` changes, i.e. at most 40 times a second at full walk speed, and it is the only dynamic sort key in the game.

`depthTest: false` on coplanar quads is not an optimisation, it is a correctness requirement: painted layers have soft wash alpha at every edge, and a depth-tested alpha edge produces a hard cutout exactly where the style needs softness.

## 2.8 The map table — the one genuine 3D scene

A separate `MapTableRuntime` with its own scene graph, its own camera, and its own single-pass composite. Constructed per 04 §7.2:

```ts
const sheet = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 128, 128),          // 16,384 tris — trivial
  new THREE.ShaderMaterial({ /* map.vert + map.frag */ })
);
```

- **Displacement in the vertex shader** from a 256×256 R8 heightfield, amplitude 0–0.35 world units. Low relief: this is a survey plan gently lifted, not terrain.
- **Slope-driven hachures.** The fragment shader reconstructs the gradient from the heightfield (two extra taps) and multiplies the hachure alpha texture by `smoothstep(0.02, 0.14, length(grad))`. Hachures therefore appear where the ground actually falls, which is both period-correct and how the player reads elevation. This is the one place in the game where a shader is doing genuinely *representational* work rather than grading.
- **Grid, scale bar and compass rose** are drawn in the shader in map-sheet space at `IRON-GALL` 18%, so they stay ruled and 1 px regardless of camera distance.
- **Tokens**: max 24, from one shared 1024² atlas, billboarded to face the camera, 12 fps stepped when moving (§3), on 12 px stems. Shape-first faction encoding (04 §8.4): allied square, British circle, French square-with-bar, naval hull profile.
- **Camera**: `PerspectiveCamera`, fov 30°, pitch clamped 42–66°, yaw ±22°, zoom 1.0–2.2×, all damped τ = 180 ms. This is the only player-controlled camera in the game and its clamps are asserted at runtime in dev builds.
- **Composite**: pass C only, with `uEdgeBleed01 = 0`, `uGranulation = 0.30` fixed, and the map's own paper texture. The mood system does not touch the map table — a survey plan does not have a morale.

Per-map cost: 1 sheet KTX2 1536² (~2.6 MB VRAM) + hachure alpha (1.2 MB) + heightfield R8 256² (65 KB) + the shared token atlas. **~4 MB, well inside the ceiling**, and the map table is entered from a scene whose layers are already being faded out (04 §7.4), so the two never peak together.

## 2.9 The two special registers as parameter sets, not code paths

**R6, the Gilt Frame** (02 §1.2). One fullscreen quad, `uLutAmount = 0`, all four wash uniforms pinned to neutral, `uEdgeBleed01 = 0`, `uGranulation = 0`, `uGrainOpacity = 0.06` with the **canvas-weave** texture substituted for paper grain, `uInkFloor = #16110D`, parallax disabled, and a gilt border sprite drawn at `renderOrder 4500`. **One `#define GILT` and eight uniform values.** No second shader, no second pipeline. The art direction's claim that "a register is a parameter set, not a second art style" (02 §1.4) is true in the renderer as well as in the art, and that is not a coincidence — it is the reason the claim is affordable.

**R5, the Witness Register** (historical pack §7.2). Five parameter changes, all of them *manifest data*: `grade.lut = "lut_grey.png"`, `grade.fog.density_base = 0`, `camera.z` and `camera.y` overridden to eye level, `framing: "interior_elevation"` with a tighter frustum, `ambient_motion: false`. **Zero lines of renderer code.** The linter (§6) asserts that any scene with `register: "R5"` declares all five, because the register's ethical weight rests on it being *visibly* different and a half-applied register is worse than none.

## 2.10 What the renderer never does

No depth of field. No bloom, glow, rim light, lens flare, chromatic aberration. No screen shake, at Yorktown or anywhere. No motion blur. No temporal accumulation, TAA, or any effect with frame-to-frame history — the composite must be a pure function of the current frame, because the paper grain is device-locked and any temporal filter would make it crawl. No `requestAnimationFrame`-driven random. No shader that reads the clock except the four authored tweens.

Enforcement: `src/gfx/` has no `Math.random`, no `performance.now()` outside `Clock`, and the ESLint config bans both in that directory.

---

# 3. THE CUTOUT ANIMATION SYSTEM

## 3.1 What it is, stated as a limit

**Eleven parented quads per character, transformed on the CPU, resampled at 12 fps stepped, one draw call each.** It is not Spine, not DragonBones, not skeletal skinning, not mesh deformation, not IK, not physics. There is no runtime for it to be — the whole system is ~180 lines.

The reason this is not a compromise is Pentiment's (02 §2.1a): stepped, limited motion is what makes a painted figure read as a figure *living inside a page* rather than as a sprite laid over one. Smooth interpolation on a painted cutout reads as Flash animation and would actively damage the art direction. The cheap thing and the right thing are the same thing, which happens rarely enough to be worth naming.

## 3.2 The rig format

One file per character, emitted by the exporter in §3.3, shipped alongside the character's 1024² KTX2 atlas.

**`content/rigs/washington_st2.rig.json`** — complete and valid:

```json
{
  "$schema": "../../schemas/rig.schema.json",
  "rig_id": "washington_st2",
  "atlas": "char/gl_xx_ch_washington_st2_v05.ktx2",
  "atlas_size": [1024, 1024],
  "height_px": 900,
  "ship_height_px": 220,
  "facings": ["front", "three_quarter_left", "profile_left"],
  "mirrorable": true,
  "pieces": [
    { "name": "pelvis",      "parent": null,        "z": 4,
      "rect": [   2,   2, 148, 132 ], "pivot": [ 74,  18 ], "rest_deg":  0.0 },
    { "name": "torso",       "parent": "pelvis",    "z": 5,
      "rect": [ 154,   2, 196, 258 ], "pivot": [ 98, 244 ], "rest_deg":  0.0 },
    { "name": "head",        "parent": "torso",     "z": 6,
      "rect": [ 352,   2, 152, 186 ], "pivot": [ 76, 172 ], "rest_deg":  0.0 },
    { "name": "upper_arm_R", "parent": "torso",     "z": 1,
      "rect": [ 506,   2,  74, 152 ], "pivot": [ 37,  14 ], "rest_deg":  6.0 },
    { "name": "lower_arm_R", "parent": "upper_arm_R","z": 1,
      "rect": [ 582,   2,  66, 140 ], "pivot": [ 33,  12 ], "rest_deg":  4.0 },
    { "name": "hand_R",      "parent": "lower_arm_R","z": 1,
      "rect": [ 650,   2,  54,  60 ], "pivot": [ 27,  10 ], "rest_deg":  0.0 },
    { "name": "upper_arm_L", "parent": "torso",     "z": 8,
      "rect": [ 506, 156,  74, 152 ], "pivot": [ 37,  14 ], "rest_deg": -6.0 },
    { "name": "lower_arm_L", "parent": "upper_arm_L","z": 8,
      "rect": [ 582, 144,  66, 140 ], "pivot": [ 33,  12 ], "rest_deg": -4.0 },
    { "name": "hand_L",      "parent": "lower_arm_L","z": 8,
      "rect": [ 650,  64,  54,  60 ], "pivot": [ 27,  10 ], "rest_deg":  0.0 },
    { "name": "leg_R",       "parent": "pelvis",    "z": 2,
      "rect": [   2, 136, 108, 296 ], "pivot": [ 54, 282 ], "rest_deg":  0.0 },
    { "name": "leg_L",       "parent": "pelvis",    "z": 3,
      "rect": [ 112, 136, 108, 296 ], "pivot": [ 54, 282 ], "rest_deg":  0.0 }
  ],
  "hand_slots": {
    "hand_R": { "library": "gl_xx_pr_hands_v02", "default": "open_relaxed" },
    "hand_L": { "library": "gl_xx_pr_hands_v02", "default": "behind_back_stub" }
  },
  "attach": {
    "prop_R": { "piece": "hand_R", "offset": [ 26, 44 ], "rot_deg": -12.0 },
    "hat":   { "piece": "head",   "offset": [ 76, 168 ], "rot_deg":   0.0 }
  },
  "contact_mark": { "size_px": [40, 12], "opacity": 0.30, "offset_y": -2 }
}
```

Field semantics, once, because they are shared by every rig:

- `rect` is `[x, y, w, h]` in atlas pixels, top-left origin.
- `pivot` is in **piece-local** pixels from the piece's top-left — the joint the piece rotates about.
- `z` is the draw order **within the puppet**, 0 = furthest back. The far arm and far leg are behind the torso; the near arm is in front. This is a fixed 0–8 range and the whole puppet occupies one `renderOrder` slot in the scene (§2.7).
- `rest_deg` is the rotation baked into the source drawing, subtracted before clips apply. It is what lets one clip file drive every character despite their sheets being drawn at slightly different arm angles.
- `ship_height_px` is the figure's height at walk-plane scale 1.00. It is 220 for Washington and **8–12% less for every NPC** (04 §4.3) — asserted by the linter, because "Washington's head is above the crowd line, always" is a findability affordance, not a flourish.

## 3.3 Authoring a rig from an AI character sheet

The art guide produces a three-facing stance sheet (§4.2) at 1536×1024. From there:

1. **Key** with `rembg -m birefnet-general -a -ae 12` (art guide §4.3).
2. **Open in Krita.** Cut the figure into the 11 pieces on separate layers, **8 px of overlap at every joint**, hand-painting the occluded shoulder and hip continuation. 45 minutes, per the art guide's budget.
3. **Name the layers exactly `piece.<name>`.** Add an 11-layer group of single-pixel dots named `pivot.<name>` marking each joint. This is the entire interface between the artist and the exporter, and it is deliberately something an artist can get right without being told twice.
4. **Run `npm run rig -- art/work/washington_st2.kra`.** The exporter (`tools/rig/export.mjs`) reads the layer stack, trims each piece to its bounding box, packs the 11 pieces into a 1024² atlas with 4 px padding, resolves each `pivot.*` dot to piece-local coordinates, reads `rest_deg` from a sidecar `.rigmeta.json` the artist fills in once, and emits both `.ktx2` and `.rig.json`.
5. **`npm run rig:check`** renders the rig at rest, at ship scale, as a **pure black silhouette**, and writes it to `art/qa/silhouettes/`. This is the KRZ silhouette test (reference analysis §3.5) automated: the Art Lead looks at a contact sheet of every character in the game as black shapes and must be able to name each one. Ten minutes, once per act, and it is what prevents a cast of interchangeable men in tricorns.

**No hands are ever cut from the sheet.** `hand_L` and `hand_R` rects point into the shared eight-shape hands library (art guide §4.4). The character sheet's hands are discarded at step 2. At 220 px ship height a hand is 12 px and nobody will ever know, and this removes the single most reliable AI failure mode from the pipeline entirely.

## 3.4 The clip format

**Six clips for the entire game**, in one shared file, driving every character. Clips address pieces by name, so any rig with the standard 11 pieces plays any clip.

**`content/rigs/clips.json`** — the `walk` clip complete, others elided for length but identical in form:

```json
{
  "$schema": "../../schemas/clips.schema.json",
  "fps": 12,
  "clips": {
    "walk": {
      "frames": 8,
      "loop": true,
      "channels": {
        "pelvis":      { "y":   [ 0, -2, -3, -2,  0, -2, -3, -2 ],
                         "rot": [ 0,  0,  0,  0,  0,  0,  0,  0 ] },
        "torso":       { "rot": [ 1.5,  2.0,  1.0,  0.0, -1.5, -2.0, -1.0,  0.0 ] },
        "head":        { "rot": [-0.5, -1.0, -0.5,  0.0,  0.5,  1.0,  0.5,  0.0 ] },
        "leg_R":       { "rot": [ 14,   4,  -8, -16,  -12,  -2,   8,  14  ] },
        "leg_L":       { "rot": [-12,  -2,   8,  14,   14,   4,  -8, -16  ] },
        "upper_arm_R": { "rot": [-10,  -3,   5,  11,   10,   3,  -5, -11  ] },
        "lower_arm_R": { "rot": [  6,   3,   1,   0,    2,    5,   7,   7  ] },
        "upper_arm_L": { "rot": [ 10,   3,  -5, -11,  -10,  -3,   5,  11  ] },
        "lower_arm_L": { "rot": [  2,   5,   7,   7,    6,    3,   1,   0  ] }
      }
    },

    "idle":            { "frames": 12, "loop": true,  "channels": { "…": {} } },
    "turn":            { "frames":  2, "loop": false, "channels": { "…": {} } },
    "stop":            { "frames":  3, "loop": false, "channels": { "…": {} } },
    "gesture_listen":  { "frames":  6, "loop": true,  "channels": { "…": {} } },
    "pause_threshold": { "frames":  4, "loop": false, "channels": { "…": {} } }
  },
  "per_act_overrides": {
    "a05": { "walk": { "step_hz": 6, "stride_gain": 1.33, "idle_sway_gain": 0.5 } }
  }
}
```

Channels are `rot` (degrees, added to `rest_deg`), `x`, `y` (piece-local px), and `scale`. A channel array's length must equal `frames`; the linter checks it. **There is no interpolation and no easing curve** — the array *is* the animation.

`per_act_overrides` is how 04 §4.2's Valley Forge exhaustion is achieved: step cadence drops 8→6 Hz and stride lengthens to compensate, so ground speed is unchanged and the R9 walk budget is untouched. He walks the same distance in the same time, more heavily.

## 3.5 The runtime

```ts
class Puppet {
  private frame = -1;                       // last SAMPLED 12 fps frame
  private geo   = new THREE.BufferGeometry(); // 11 quads = 44 verts, 66 indices
  private mesh: THREE.Mesh;                 // ONE draw call

  update(dt: number) {
    this.clock += dt;
    const f = Math.floor(this.clock * 12) % this.clip.frames;
    if (f === this.frame) return;           // ← the whole optimisation
    this.frame = f;
    this.compose(f);                        // 11 local→world 2D transforms
    this.writeVerts();                      // 44 vec3 + 44 vec2 into the buffer
    this.geo.attributes.position.needsUpdate = true;
  }
}
```

**The transforms change 12 times a second, not 60.** Eight characters on screen is 96 buffer writes per second of 44 vertices each — approximately nothing. The `if (f === this.frame) return;` line is the difference between this being free and this being the CPU hot spot on a Celeron, and it exists only because the animation is stepped. The aesthetic decision paid for the performance decision.

Composition is a 2D affine chain, not a matrix stack — each piece is `translate(parentWorld) ∘ rotate(rest + clip) ∘ translate(-pivot)`, computed as four floats. Depth within the puppet comes from `z`, resolved into vertex order in the index buffer, so the 11 quads draw back-to-front inside the single call.

**Scale** follows the walk-plane's scale curve, sampled at the puppet's `t` and **rounded to the nearest 1/64** — without that rounding, a continuously-varying scale makes the ink line shimmer as he walks, which is the exact failure R10 forbids at the layer level and would be embarrassing to commit at the character level.

**Facing** is one of three atlas facings; right-facing is the left atlas with `x` negated and UVs flipped. The art rule that makes this safe: **no character carries an asymmetric object that reads at 220 px** — sword hilts are drawn centred, the sash is drawn as a chest band, and Washington's hat is held in whichever hand the facing puts forward. Written into the character bible, checked at silhouette review.

**Clip transitions cut on the next 12 fps frame boundary.** No blending. A paper puppet flipping over is the correct reading (04 §4.2) and blending would produce a rubber one.

**Cost ceiling: 8 puppets on screen.** 8 × 11 quads = 88 quads, 8 draw calls, ~1.4 MB of atlas each. The population system (R13) instantiates 2/4/6 background figures plus Washington plus at most one speaking NPC, which is 8 exactly. The linter enforces `spawns.length ≤ 7`.

---

# 4. SCENE MANAGEMENT

## 4.1 The runtime object graph

```
App
├── Renderer          WebGLRenderer, sceneRT(×2 attachments), bleedRT, the two composite passes
├── Store             the global state object (§7.1) — the ONLY mutable game state
├── Content           immutable, loaded per act: scenes, dialogue, decisions, docs, beats
├── AssetStore        the ONLY thing in the codebase that constructs or disposes a GPU texture
├── AudioBus          §8.1
├── Director          the scene state machine (§4.2); owns transitions; the only caller of load/dispose
│   ├── SceneRuntime        a walkable diorama
│   ├── MapTableRuntime     §2.8
│   ├── InterludeRuntime    a still + a composing letter (04 §5.5)
│   └── GiltFrameRuntime    §2.9
└── UI (DOM)          DialoguePanel · Letterbook · DocumentViewer · GlyphLayer · PassportScreen
```

Two invariants that make the rest of §4 possible, both enforced by ESLint rules on import paths:

1. **`Store` is written only by `applyEffect()`** (§5.1). No runtime mutates a stat or a flag directly.
2. **`AssetStore` is the only module that may call `new THREE.Texture`, `KTX2Loader.load`, or `.dispose()`.** Every texture in the game has exactly one owner and a reference count.

## 4.2 The scene lifecycle

```
    ┌──────────────────────── Director.go(sceneId, spawnId, transition) ───────┐
    ▼                                                                          │
 RESOLVING ──▶ LOADING ──▶ WARMING ──▶ READY ──▶ ACTIVE ──▶ LEAVING ──▶ DISPOSED
    │            │           │                                │
    │            │           └─ renderer.compile()            └─ dispose OLD scene's
    │            │              + first-frame render              textures AFTER the new
    │            │              to a 1×1 scissor                  scene's first rendered
    │            └─ AssetStore.acquire() for 5 layers,             frame, BEFORE the 220 ms
    │               rig atlases, prop atlas, audio bed             audio crossfade ends
    └─ manifest lookup, condition evaluation for prop/population toggles
```

**The two-scene residency window is ≤ 240 ms** and it is asserted, not hoped: the transition harness in CI (§11.4) samples `renderer.info.memory.textures` every 16 ms across a scripted cut and fails if the count stays above the single-scene baseline for more than 15 frames.

**Preloading** per 04 §5.2: on entering a scene, the L2 and L3 layers of every exit target are acquired during the **first dialogue block after arrival** — the player is stationary and reading, which is 60%+ of playtime. L0/L1/L4 stream behind that at `priority: 'low'`. If a target is not resident when the player reaches an exit, the engine holds the outgoing frame for up to 500 ms with **no spinner**; past 500 ms it degrades to a 300 ms fade-through-paper. Instrumented: the dev overlay counts degraded cuts, and >1% on the reference device is a bug ticket.

## 4.3 The per-act bundle strategy

**Each class period loads its own act.** This is the natural fit the brief always had and the chunking falls out of it directly.

```
dist/
  index.html                      1.2 KB
  assets/shell-[hash].js          485 KB gz   engine + UI + act 1 content
  assets/shell-[hash].css          18 KB gz
  assets/basis_transcoder-[hash].wasm  242 KB
  fonts/*.woff2                   320 KB      (02 §7.5)
  content/act-01.json              78 KB gz   scenes+dialogue+decisions+docs for act 1
  content/act-0N.json             60–95 KB gz  ← fetched, not imported
  art/a01_*.ktx2 …                            ← fetched by the AssetStore
  audio/…
  sw.js
```

**Content is fetched JSON, not a dynamic `import()`.** This is deliberate: an act's content must be replaceable by a teacher or the client without a rebuild (the brief's §5 requirement, and the reason §5 is a data format at all). `content/act-05.json` can be edited on the host and the game picks it up on the next load, subject to the linter having been run — which is why `npm run lint:content` is documented in `README` as a thing a non-engineer can run.

**Prefetch policy.** Act N+1's content JSON and its Act-N+1-scene-1 layers begin fetching when the player enters **scene 3 of act N**, at `priority: 'low'`, throttled to one concurrent request so it never competes with the current act's streaming. By the interlude — 60–90 s of authored reading with no assets in flight — the next act is typically resident. This is why the interludes are the highest value-per-asset item in the project for the third distinct reason.

**Act chunk contents and sizes** (from the art guide's ≤12 MB per-act ceiling):

| Chunk | Content JSON | Layers | Chars | Props/docs | Audio | Total |
|---|---|---|---|---|---|---|
| shell + act 1 | 78 KB | 4 scenes × 5 | 6 rigs | 1 atlas + 14 docs | 1.1 MB | **7.4 MB** |
| act 2 | 82 KB | 5 × 5 + 1 map | 5 | 1 + 11 | 1.2 MB | 9.8 MB |
| act 4 | 95 KB | 7 × 5 + 1 map | 7 | 1 + 9 | 1.4 MB | **11.6 MB** |
| act 8 | 61 KB | 3 × 5 | 4 | 1 + 6 | 0.6 MB | 5.2 MB |

Act 4 is the tightest and it is the one the CI budget check will fail first; that is correct, because it is the showpiece and the place scope will try to grow.

## 4.4 Offline: a hand-written service worker

**Decision: ~120 lines in `public/sw.js`. No Workbox.** Workbox is 12 KB gz to express five rules, and its runtime caching strategies are configured through an API that is harder to audit than the five `if` statements it replaces. A district IT reviewer can read our service worker in ninety seconds; that is worth more than the convenience.

```
install    precache: index.html, shell js/css, wasm, fonts, ui atlas,
                     content/act-01.json, and act 1's 20 layer files
activate   delete any cache whose key !== BUILD_ID
fetch      /index.html            → network-first, 2 s timeout, cache fallback
           /assets/*-[hash].*     → cache-first, immutable
           /art/**, /audio/**     → cache-first, then network, then put
           /content/act-*.json    → stale-while-revalidate
           anything cross-origin  → do not intercept (there is nothing cross-origin)
```

**The offline contract, stated in one sentence for the teacher's documentation:** *once a student has played an act on a device, that act works with no network at all; an act they have never played needs about 30 seconds of connection to start.* That sentence is in `README` and in the teacher guide, and it is the honest version — promising full offline before first play would be a lie about a 96 MB payload.

## 4.5 Memory discipline

Three rules, all mechanically enforced:

1. **One owner.** `AssetStore.acquire(id)` returns a ref-counted handle; `release(id)` decrements; the texture is disposed at zero, after a **one-scene grace period** so a back-and-forth between two adjacent scenes does not thrash the transcoder. The grace cache holds at most 6 layer textures.
2. **Dispose before fade-in completes** (art guide §6.5, hard rule; §4.2 above).
3. **Nothing outside `AssetStore` may allocate GPU memory.** Enforced by an ESLint `no-restricted-imports` rule on `three`'s texture constructors outside `src/assets/`.

The dev overlay (stripped by the production `define`) shows, updated at 2 Hz: `renderer.info.memory.textures`, `.geometries`, estimated VRAM, `performance.memory.usedJSHeapSize`, p50/p95 frame time, degraded-cut count, and the current `W`.

## 4.6 The texture budget, worked out

Per-scene VRAM on the reference device, using the art guide's UASTC-transcoded figures:

```
5 diorama layers  2048×1152, UASTC→BC7/ASTC      5 × 4.72 MB   = 23.60 MB
  + mip chains (~33%)                                          =  7.79 MB
ink attachment (R8, 1366×768 native)                           =  1.05 MB
sceneRT attachment 0 (RGBA8, 1366×768)                         =  4.20 MB
bleedRT (RGBA8, 683×384)                                       =  1.05 MB
character atlases         8 × 1024², UASTC       8 × 1.40 MB   = 11.20 MB
  + mips                                                       =  3.70 MB
act prop atlas            2048², UASTC                         =  4.72 MB
UI atlas                  1024², shared, resident              =  1.40 MB
paper grain + tooth       2 × 512², R8                         =  0.52 MB
per-act LUT               32³ RGB                              =  0.10 MB
─────────────────────────────────────────────────────────────────────────
PEAK, ONE SCENE                                                = 65.33 MB
CEILING (art guide §6.5)                                       = 120.00 MB
TRANSITION PEAK (two scenes' layers, ≤240 ms)                  = 96.72 MB   ✓
```

**JS heap**, against the 180 MB ceiling:

```
content for one act (parsed JSON)              ~2.5 MB
transcoder wasm heap                           ~24  MB
decoded audio: 2 beds + 6 spots (§8.3)         ~18  MB
DOM + portraits (browser-managed, off-heap)     —
engine + Three.js runtime structures            ~9  MB
transcode staging buffers (transient)          ~12  MB
─────────────────────────────────────────────────────
                                               ~66  MB   ✓
```

**The low-memory policy.** If `navigator.deviceMemory <= 4`, the AssetStore calls `trimTopMip()` on L0 and L1 — the KTX2 transcode result is a `CompressedTexture` with a `mipmaps[]` array, so dropping entry 0 and halving the recorded dimensions yields a 1024×576 far layer at **25% of the memory**, which is invisible behind fog exposure 1.00 and 0.72 respectively. Saves 7.1 MB per scene for zero additional assets and zero visual cost. This is the fallback and there is no other; we do not ship a second set of textures.

## 4.7 The teacher entry point

`?act=5` must work, and R24 (every scene reads only the global state object) is what makes it possible. `Director.jumpToAct(n)` constructs a synthetic state from `content/act-0N.entry.json` — a committed, linted state fixture giving the median stat line and the flag set a player would plausibly arrive with. There are 8 of these, they are authored at act sign-off, and **the smoke test boots every one of them** (§11.3), which is also how we know R24 has not been quietly violated.

## 4.8 The frame budget

Target 16.6 ms; hard floor 22 ms before the resolution step fires.

```
input + walkplane + interaction targeting        0.15 ms
puppet update (12 Hz, amortised)                 0.20 ms
uniform writes + parallax                        0.10 ms
RENDER A  5 layers + 8 puppets + 6 props        ~6.8  ms   ← fill-rate bound
RENDER B  half-res, 6 taps                      ~1.9  ms
RENDER C  native, 4 taps                        ~3.4  ms
DOM (browser compositor, off our budget)          —
────────────────────────────────────────────────────────
                                                ~12.6 ms   ✓ on UHD 600 at 1366×768
```

Measured on the reference device in week one, not estimated in month five. If RENDER A exceeds 9 ms, the first thing to cut is L1's overscan, not a layer.

---

# 5. THE CONTENT SCHEMA

This is the section the rest of the project is built on top of. Everything here is data. **There is no embedded code in any content file, anywhere, ever** — not an expression string, not a JS snippet, not a template with logic in it.

## 5.0 Why JSON and not ink

`04-scene-architecture.md` §1.2.3 and §1.3 assumed `ink` and `inkjs`, following the reference analysis §4.4. **That decision is reversed here.** Three reasons, in priority order:

1. **The linter is the highest-value non-gameplay component in the project (§6), and it cannot be built over ink.** Compiled ink is a container format for a stack machine with mutable variables, `VAR`/`~` logic, external function bindings, and computed diverts. Asking "is this knot reachable?" or "can this outcome ever fire?" over ink bytecode is a general program-analysis problem — undecidable in the limit and expensive in practice. Over a declarative graph with a closed condition grammar, both questions are a graph traversal and a small interval solve, which is §6.5 and §6.4's `L3xx`. **We are trading authoring convenience for the ability to prove the content is not broken**, and in a product where eight acts are authored months apart by people who will not all still be on the project, that is not close.
2. **The condition/effect grammar is the same in dialogue, decisions, interactables, props, populations, letters, beat tables and scene manifests.** With ink, dialogue would use ink's logic and everything else would use a JSON grammar, which means two condition languages, two evaluators, two sets of semantics for "is this flag set", and one of them invisible to the linter. One grammar, evaluated by one 90-line function, checked by one solver.
3. **Effects must be data for the save system to be honest.** §7's determinism guarantee — same start state plus same choices yields the same end state — is provable when every mutation is a declared `{"stat": …, "flags": […]}` object applied in array order. It is not provable when an author can write `~ loyalty = loyalty + RANDOM(1,3)` in a knot.

The costs of this reversal are real and should be stated: we lose Inky, the writer's tool; we lose ink's weave syntax, which is genuinely pleasant for branching prose; and we spend perhaps two engineer-weeks on the evaluator and the schema tooling. The mitigations: every schema ships with a JSON Schema file, VS Code is configured via `.vscode/settings.json` to give autocomplete and inline validation on every content file (so a writer gets red squiggles on a bad flag name as they type), and the linter runs on save in the dev server with sub-second feedback. A writer working in VS Code against a schema is a worse experience than Inky and a much better experience than discovering in Act 6 that Act 3 set a flag nobody reads.

**Consequential edit to `04-scene-architecture.md`:** the interactable field `"knot": "a02_s01_barrel"` becomes `"node": "dlg_a02_s01_barrel"`, and `content/ink/act02.ink` becomes `content/acts/a02/dialogue/*.json`. Appendix A logs it.

## 5.1 The common grammar

### 5.1.1 Identifiers

Every ID in the project matches `^[a-z][a-z0-9_]{2,63}$` and carries a type prefix. Uniqueness is global per type and enforced by the linter (`L101`).

| Prefix | Type | Example |
|---|---|---|
| `a0N_s0N` | scene | `a02_s01` |
| `il_N` | interlude | `il_2` |
| `…_int_…` | interactable | `a02_s01_int_beef_barrel` |
| `dlg_` | dialogue graph | `dlg_a02_s01_knox` |
| `dec_` | decision | `dec_a02_ticonderoga` |
| `doc_` | document | `doc_dunmore_proclamation` |
| `let_` | letterbook letter | `let_a02_close` |
| `beat_` | beat table | `beat_a04_trenton` |
| `f_` | flag | `f_knox_route_chosen_south` |
| `chr_` | character | `chr_knox` |
| `gilt_` | Gilt Frame plate | `gilt_a02_cambridge_elm` |

Dialogue nodes are local to their graph and referenced as `graph_id#node_id` when crossing a file boundary, e.g. `dlg_a02_s01_knox#n_route_offer`.

### 5.1.2 Stats

Four stats, **integers 0–127**, not 0–100. The range is 7 bits because that is what the passport code packs (§7.3) and choosing the range to fit the encoding rather than scaling at the boundary removes a whole class of round-trip bug.

```json
{ "judgment": 60, "legitimacy": 52, "loyalty": 44, "character": 72 }
```

Those are the **start values**, committed in `content/state-init.json` and justified: Washington begins competent and respected but with an army that does not know him (`loyalty` low) and a reputation, post–Fort Necessity, that is more fragile than his self-regard (reference analysis §6.2). A typical decision moves a stat by 3–8. Effects clamp to `[0,127]` after every application.

The mood controller reads normalised values: `norm(s) = s / 127`, then 02 §3.2's weighting.

### 5.1.3 The condition grammar — complete

A condition is a JSON object. There are exactly **three combinators** and **eight leaves**. Nothing else parses.

```jsonc
// combinators
{ "all":  [ <cond>, … ] }     // AND, empty array = true
{ "any":  [ <cond>, … ] }     // OR,  empty array = false
{ "none": [ <cond>, … ] }     // NOR

// leaves
{ "stat": "loyalty", "gte": 40 }              // also lt, gt, lte, eq
{ "flag": "f_read_dunmore" }                  // true if set
{ "flag": "f_read_dunmore", "is": false }     // true if NOT set
{ "doc":  "doc_dunmore_proclamation" }        // true if the document has been READ
{ "band": "low" }                             // "low" | "mid" | "high" — derived from W
{ "act":  { "gte": 3 } }                      // also lt, gt, lte, eq
{ "visited": "a02_s03" }                      // scene has been entered at least once
{ "choice": "dec_a02_ticonderoga", "is": "south_route" }
```

Rules that make the grammar tractable:

- **No arithmetic.** No `{"stat":"a","gte":{"stat":"b"}}`. A condition compares a state value to a literal, full stop.
- **No negation operator on leaves** except the explicit `"is": false` on `flag`. Use `none`. This keeps the solver's job small.
- **Every referenced ID must exist** in the symbol table, or the build fails (`L1xx`).
- **`doc` is not a flag.** Reading a document does not set a flag and never grants a stat (**R2**). `{"doc": …}` reads the `docs_read` set directly. This is a schema-level enforcement of the project's most important mechanic: if documents were flags, someone would eventually attach a stat effect to one.
- **Evaluation is total and pure.** `evaluate(cond, state) → boolean`, no exceptions, no side effects, no clock, no randomness. It is 90 lines and it is the most-tested function in the codebase (§11.2).

### 5.1.4 The effect grammar — complete

```jsonc
{
  "stat":    { "loyalty": 5, "character": -3 },   // signed deltas, clamped to [0,127]
  "flags":   [ "f_knox_route_chosen_south" ],     // set
  "unflags": [ "f_congress_expects_assault" ],    // clear
  "doc":     "doc_ticonderoga_return",            // mark READ (also grants it to the letterbook)
  "letter":  "let_a02_close",                     // queue a letterbook entry for the next interlude
  "beat":    "beat_a02_haul",                     // arm a beat table (§5.7)
  "counter": { "c_men_lost": 300 }                // named integer accumulators, for the letterbook
}
```

- **Every key is optional; an empty effect object is legal** and is how a characterization-only choice with no state consequence is written (rare — most characterization choices still move a stat by 1–2).
- **Effects apply in array order**, deterministically. Two effects touching the same stat sum.
- **Nothing here can branch.** There is no `goto`, no `set scene`, no conditional effect. Structure lives in the graph; effects only mutate state. Conditional consequence is expressed as multiple outcomes with guards (§5.4), which is exactly the form the linter can analyse.
- **`counter`** exists solely for the letterbook: casualty numbers, days without pay, men who deserted. They are not stats, they are never compared in conditions, and they do not enter the passport code (§7.2) — they are recomputed from flags at letter-assembly time or, where that is impossible, carried in localStorage only.

## 5.2 `scene.schema.json` — and a complete scene

The manifest implements 04 §1.2's eight parts exactly. One file per scene at `content/acts/a02/scenes/a02_s01.json`.

```json
{
  "$schema": "../../../../schemas/scene.schema.json",
  "id": "a02_s01",
  "act": 2,
  "index": 0,
  "title": "Camp Street",
  "plate_id": "cb01_camp_street",
  "register": "R1",
  "framing": "exterior_3q",
  "camera": { "z_offset": 0.0 },
  "ambient_motion": true,

  "layers": {
    "L0": "bg/a02_s01_bg_camp-street_L0_v04.ktx2",
    "L1": "bg/a02_s01_bg_camp-street_L1_v04.ktx2",
    "L2": "bg/a02_s01_bg_camp-street_L2_v04.ktx2",
    "L3": "bg/a02_s01_bg_camp-street_L3_v04.ktx2",
    "L4": "bg/a02_s01_bg_camp-street_L4_v04.ktx2"
  },
  "apex_plate": null,

  "walkplane": {
    "points":     [[0.06,0.78],[0.34,0.74],[0.61,0.69],[0.94,0.66]],
    "scale":      [1.00, 0.92, 0.78, 0.62],
    "length_px":  3180,
    "speed_px_s": 400
  },

  "spawns": [
    { "id": "spawn_default",  "t": 0.08, "facing": "three_quarter_left" },
    { "id": "spawn_from_hq",  "t": 0.61, "facing": "front" },
    { "id": "spawn_from_lines","t": 0.94, "facing": "profile_left" }
  ],

  "grade": {
    "light_law": "act02",
    "key":  { "azimuth_deg": 0, "elevation_deg": 90, "color": "#C9CBC6", "intensity": 0.55 },
    "fog":  { "color": "#C6CBC9", "density_base": 0.022, "density_mood_gain": 0.014 },
    "lut":  "lut_act02.png",
    "lut_mood_mix": [0.15, 0.35, 0.60],
    "palette": { "dominant": "#8E8A7C", "recessive": "#EFE7D5", "accent": "#5A4632" }
  },

  "audio": {
    "bed": "bed_camp_open",
    "score": "cue_act02_theme",
    "spots": [
      { "id": "spot_axe_distant",   "anchor_t": 0.85, "min_s": 14, "max_s": 38 },
      { "id": "spot_drum_call",     "anchor_t": 0.40, "min_s": 22, "max_s": 40 },
      { "id": "spot_cough",         "anchor_t": 0.22, "min_s": 10, "max_s": 26 },
      { "id": "spot_cart_wheel",    "anchor_t": 0.66, "min_s": 18, "max_s": 34 }
    ]
  },

  "population": {
    "sheet": "a02_s01_ch_crowd_v02",
    "count_expr": "band",
    "poses_low":  ["seated_hunched", "seated_hunched", "standing_wrapped"],
    "poses_mid":  ["standing_wrapped", "standing_talking", "walking", "seated_hunched"],
    "poses_high": ["standing_talking", "walking", "working_axe", "standing_wrapped",
                   "seated_eating", "walking"],
    "anchors_t":  [0.18, 0.31, 0.47, 0.58, 0.72, 0.88]
  },

  "props": [
    { "id": "prop_fallen_tent",  "layer": "L3", "anchor_t": 0.29,
      "when": { "band": "low" } },
    { "id": "prop_ration_barrel_empty", "layer": "L3", "anchor_t": 0.42,
      "when": { "any": [ { "band": "low" }, { "band": "mid" } ] } },
    { "id": "prop_drill_stakes", "layer": "L3", "anchor_t": 0.55,
      "when": { "all": [ { "band": "high" }, { "flag": "f_steuben_arrived" } ] } },
    { "id": "prop_brazier_lit",  "layer": "L4", "anchor_t": 0.12, "when": { "all": [] } }
  ],

  "interactables": [
    { "id": "a02_s01_int_beef_barrel",
      "name": "the empty beef barrel from Wethersfield",
      "kind": "examine", "anchor_t": 0.42, "anchor_offset": [0, -34],
      "layer": "L3", "radius_t": 0.055,
      "node": "dlg_a02_s01_barrel", "sensitive": false },

    { "id": "a02_s01_int_knox",
      "name": "Colonel Henry Knox, late of the London Book-Store",
      "kind": "converse", "anchor_t": 0.61, "anchor_offset": [0, -96],
      "layer": "L3", "radius_t": 0.088,
      "character": "chr_knox",
      "node": "dlg_a02_s01_knox", "sensitive": false },

    { "id": "a02_s01_int_return_of_ordnance",
      "name": "a return of ordnance, folded twice",
      "kind": "document", "anchor_t": 0.30, "anchor_offset": [12, -28],
      "layer": "L3", "radius_t": 0.050,
      "document": "doc_ticonderoga_return", "sensitive": false },

    { "id": "a02_s01_int_map_table",
      "name": "the parlour table, and Montresor's plan of Boston",
      "kind": "maptable", "anchor_t": 0.61, "anchor_offset": [-40, -50],
      "layer": "L3", "radius_t": 0.050,
      "maptable": "mt_cb_ticonderoga", "sensitive": false },

    { "id": "a02_s01_exit_hq",
      "name": "the door of the Vassall house",
      "kind": "exit", "anchor_t": 0.63, "anchor_offset": [0, -60],
      "layer": "L2", "radius_t": 0.060,
      "target_scene": "a02_s02", "target_spawn": "spawn_from_street",
      "transition": "cut", "sensitive": false },

    { "id": "a02_s01_exit_lines",
      "name": "the road up to the works on Prospect Hill",
      "kind": "exit", "anchor_t": 0.97, "anchor_offset": [0, -30],
      "layer": "L3", "radius_t": 0.060,
      "target_scene": "a02_s03", "target_spawn": "spawn_from_camp",
      "transition": "cut", "sensitive": false }
  ],

  "scripted_moves": [],
  "surveyor_overlay": "a02_s01_ov_camp-street_v01.ktx2"
}
```

> The example is trimmed to 6 interactables for readability; **a shipping scene declares ≥12** and the linter fails on fewer (`L401`). Interactables 7–12 are `examine` entries in the same form.

Notes on fields not self-explanatory:

- `apex_plate` is the R12 second painted plate, `null` in all but eight scenes. When present it is an object of five layer paths plus a `when` condition, and the linter enforces the eight-scene cap game-wide (`L412`).
- `population.count_expr: "band"` is the only permitted value in v1; it evaluates to `2 + band × 2` (R13). It is a field rather than a constant so a future act can declare a fixed count without a schema change.
- `props[].when` with `{"all": []}` means always-on. The empty-`all`-is-true rule makes "unconditional" expressible without a special case.
- `transition` on an exit is `"cut" | "fade" | "lift"`, and R7 is enforced mechanically: a `fade` is legal only if the scene pair appears in `content/time-skips.json` (`L409`).

## 5.3 `dialogue.schema.json` — the node graph

A dialogue graph is a flat map of nodes with explicit `next` edges. Four node kinds. That is the entire language.

```json
{
  "$schema": "../../../../schemas/dialogue.schema.json",
  "id": "dlg_a02_s01_knox",
  "scene": "a02_s01",
  "entry": "n_open",
  "nodes": {

    "n_open": {
      "kind": "say",
      "speaker": "chr_knox",
      "portrait": "chr_knox_neutral",
      "variants": [
        { "when": { "band": "low" },
          "text": "The men are burning the fence rails again, sir. I have stopped it twice this week and I do not think I shall stop it a third time." },
        { "when": { "all": [] },
          "text": "Sir. I have the returns you asked for, and I have something else besides, which you did not ask for and will not like." }
      ],
      "next": "n_council_open"
    },

    "n_council_open": {
      "kind": "council",
      "pool": "cnc_a02_knox_open",
      "next": "n_first_choice"
    },

    "n_first_choice": {
      "kind": "choice",
      "prompt": null,
      "options": [
        { "id": "o_ask_returns",
          "text": "\"The returns first, Colonel.\"",
          "effect": { "stat": { "judgment": 2 } },
          "next": "n_returns" },

        { "id": "o_ask_other",
          "text": "\"Then give me the thing I will not like.\"",
          "effect": { "stat": { "loyalty": 2, "character": 1 } },
          "next": "n_the_guns" },

        { "id": "o_rebuke",
          "text": "\"You will give me what I asked for and nothing else.\"",
          "when": { "stat": "character", "lt": 55 },
          "lock": { "type": "voice", "voice": "temper",
                    "note": "Temper is not loud enough to say this." },
          "effect": { "stat": { "loyalty": -4, "character": -2 } },
          "next": "n_returns_cold" }
      ]
    },

    "n_returns": {
      "kind": "say",
      "speaker": "chr_knox",
      "portrait": "chr_knox_neutral",
      "text": "Fourteen thousand nine hundred and twelve on the rolls. Nine thousand and change fit for duty. Powder for nine rounds a man, which is not a siege, sir, it is a rumour of one.",
      "next": "n_the_guns"
    },

    "n_returns_cold": {
      "kind": "say",
      "speaker": "chr_knox",
      "portrait": "chr_knox_downcast",
      "text": "Fourteen thousand nine hundred and twelve. Nine rounds a man. Sir.",
      "effect": { "flags": ["f_knox_rebuked"] },
      "next": "n_the_guns"
    },

    "n_the_guns": {
      "kind": "say",
      "speaker": "chr_knox",
      "portrait": "chr_knox_speaking",
      "text": "There are guns at Ticonderoga. Fifty-nine pieces, near sixty ton of brass and iron, and between them and this camp there are three hundred miles of December.",
      "next": "n_council_guns"
    },

    "n_council_guns": {
      "kind": "council",
      "pool": "cnc_a02_the_guns",
      "next": "n_guns_choice"
    },

    "n_guns_choice": {
      "kind": "choice",
      "options": [
        { "id": "o_who_would_go",
          "text": "\"And who would go and fetch them?\"",
          "effect": { "flags": ["f_knox_volunteered"] },
          "next": "n_knox_volunteers" },

        { "id": "o_cost",
          "text": "\"What does Congress imagine that would cost?\"",
          "effect": { "stat": { "legitimacy": 2 } },
          "next": "n_cost" },

        { "id": "o_read_the_return",
          "text": "\"Your return says fifty-nine pieces. It says nothing of the roads.\"",
          "when": { "doc": "doc_ticonderoga_return" },
          "lock": { "type": "knowledge", "document": "doc_ticonderoga_return",
                    "note": "you have not read the return of ordnance." },
          "effect": { "stat": { "judgment": 4 }, "flags": ["f_knox_impressed"] },
          "next": "n_knox_impressed" }
      ]
    },

    "n_knox_volunteers": {
      "kind": "say", "speaker": "chr_knox", "portrait": "chr_knox_speaking",
      "text": "I would, sir. I have read about it. That is not nothing — most of the men who say a thing cannot be done have not read about it either.",
      "next": "n_to_decision"
    },
    "n_cost": {
      "kind": "say", "speaker": "chr_knox", "portrait": "chr_knox_neutral",
      "text": "Congress imagines it costs a letter, sir. Congress imagines everything costs a letter.",
      "effect": { "flags": ["f_congress_pay_beat_a02"] },
      "next": "n_to_decision"
    },
    "n_knox_impressed": {
      "kind": "say", "speaker": "chr_knox", "portrait": "chr_knox_speaking",
      "text": "You have read it. Nobody reads it. Then you know the road is the whole of the problem and the guns are the easy part.",
      "next": "n_to_decision"
    },

    "n_to_decision": {
      "kind": "branch",
      "branches": [
        { "when": { "flag": "f_seen_map_table_a02" }, "next": "n_end_to_decision" },
        { "when": { "all": [] }, "next": "n_end_go_look" }
      ]
    },

    "n_end_to_decision": { "kind": "end", "decision": "dec_a02_ticonderoga" },
    "n_end_go_look":     { "kind": "end" }
  }
}
```

**The four node kinds, exhaustively:**

| kind | Required | Optional | Semantics |
|---|---|---|---|
| `say` | `speaker`, `next`, and one of `text` \| `variants` | `portrait`, `effect` | Renders one transcript block. `variants` is an ordered list; **first matching `when` wins**; the last entry must be unconditional or the linter fails (`L215`). `next` is mandatory — a `say` never terminates a graph; that is what `end` is for. |
| `choice` | `options` (1–5) | `prompt`, `sealed` | Presents the option list. Each option has `id`, `text`, `next`; optional `when`, `lock`, `effect`. An option whose `when` is false renders **locked** per R1 if it has a `lock` block, and is **hidden entirely** if it does not. |
| `council` | `pool` | `next` | Draws 2–4 voices from the named pool (§5.5). Never presents a choice (**R6**). |
| `branch` | `branches` | — | Silent. Ordered; first matching `when` wins; the last must be unconditional (`L214`). This is the only control-flow node and it exists so that conditional routing is visible to the linter as an edge. |
| `end` | — | `decision`, `beat`, `goto_scene` | Terminates the graph. `decision` hands off to a decision (§5.4); `beat` to a beat table (§5.7); `goto_scene` is the **only** structural branch in the content system and it is capped at 10 game-wide (**R11**, `L411`). |

**`lock` is presentation, not logic.** `when` decides availability; `lock` decides how unavailability is *shown*. An option with `when` and no `lock` disappears; an option with both is struck through, prefixed with the voice emblem or the folded-letter glyph, and carries the margin note. This split is what lets the writer choose, per option, between "the road you cannot take" and "a road that is simply not there" — and R1's whole payload is in the first.

**`sealed: true`** on a `choice` node renders the wax seal and *"This will not come again."* Exactly eight in the game, one per act, enforced (`L413`).

## 5.4 `decision.schema.json`

Decisions are separate from dialogue because they are the eight-plus moments the teacher will stop the room for, and they need a form that is inspectable on its own.

```json
{
  "$schema": "../../../../schemas/decision.schema.json",
  "id": "dec_a02_ticonderoga",
  "act": 2,
  "scene": "a02_s01",
  "sealed": true,
  "title": "The guns at Ticonderoga",
  "staging": "maptable",
  "maptable": "mt_cb_ticonderoga",
  "council_pool": "cnc_dec_a02_ticonderoga",
  "seal_note": "This will not come again.",

  "options": [
    { "id": "send_knox_north",
      "text": "\"Colonel Knox will go north, and he will have whatever I can give him.\"",
      "effect": { "stat": { "judgment": 6, "loyalty": 3 },
                  "flags": ["f_knox_sent_north", "f_guns_expected"] },
      "outcome": "out_knox_goes" },

    { "id": "send_officer_of_engineers",
      "text": "\"I will send an officer of engineers. Knox is a bookseller.\"",
      "effect": { "stat": { "judgment": -2, "loyalty": -4 },
                  "flags": ["f_engineer_sent_north", "f_guns_expected", "f_knox_slighted"] },
      "outcome": "out_engineer_goes" },

    { "id": "hold_the_lines",
      "text": "\"Three hundred miles in winter is a fantasy. We hold what we have.\"",
      "when": { "stat": "judgment", "lt": 70 },
      "lock": { "type": "voice", "voice": "restraint",
                "note": "Restraint is not loud enough to say this." },
      "effect": { "stat": { "judgment": -4, "legitimacy": -3, "loyalty": -5 },
                  "flags": ["f_no_guns_sent"] },
      "outcome": "out_no_guns" }
  ],

  "outcomes": [
    { "id": "out_knox_goes",
      "resolutions": [
        { "when": { "all": [ { "stat": "loyalty", "gte": 55 },
                             { "doc": "doc_ticonderoga_return" } ] },
          "text_key": "res_knox_fast",
          "effect": { "stat": { "loyalty": 4 }, "flags": ["f_guns_arrive_early"],
                      "counter": { "c_oxen_lost": 2 } },
          "beat": "beat_a02_haul" },

        { "when": { "stat": "loyalty", "gte": 30 },
          "text_key": "res_knox_slow",
          "effect": { "flags": ["f_guns_arrive_late"], "counter": { "c_oxen_lost": 8 } },
          "beat": "beat_a02_haul" },

        { "when": { "all": [] },
          "text_key": "res_knox_grim",
          "effect": { "stat": { "loyalty": -2 },
                      "flags": ["f_guns_arrive_late", "f_sled_lost_lake"],
                      "counter": { "c_oxen_lost": 14 } },
          "beat": "beat_a02_haul" }
      ] },

    { "id": "out_engineer_goes",
      "resolutions": [
        { "when": { "all": [] },
          "text_key": "res_engineer_slow",
          "effect": { "flags": ["f_guns_arrive_late"], "counter": { "c_oxen_lost": 11 } },
          "beat": "beat_a02_haul" }
      ] },

    { "id": "out_no_guns",
      "resolutions": [
        { "when": { "all": [] },
          "text_key": "res_no_guns",
          "effect": { "stat": { "legitimacy": -4 }, "flags": ["f_dorchester_delayed"] },
          "beat": null }
      ] }
  ],

  "fixed_loss": {
    "flag": "f_congress_will_not_pay_a02",
    "note": "R20: no option, no stat line, and no document prevents Congress failing to fund the train. Every run sets this flag."
  }
}
```

Structure and why it is shaped this way:

- **`options` → `outcome` → `resolutions`.** The option is what the player says. The outcome is what is decided. The resolution is what the accumulated state makes of it. That third layer is where "no fail state, but outcome quality varies" actually lives, and separating it from the option list is what stops the writer from having to enumerate `options × stat bands` by hand.
- **`resolutions` is ordered and the last must be unconditional** (`L218`). This is the shadowing rule the linter checks in `L206`: a resolution preceded by an unconditional one is unreachable and fails the build.
- **`fixed_loss`** makes R20 mechanical. Every act's decision file must declare one, and `L420` fails the act otherwise. It is a flag that every path sets — the structural guarantee against triumphalism, expressed as data.
- **`text_key`** points into the act's prose bundle rather than inlining the resolution text, because resolutions are long and the decision file should be readable as a *structure* on one screen.

## 5.5 `council.schema.json`

```json
{
  "$schema": "../../../../schemas/council.schema.json",
  "id": "cnc_dec_a02_ticonderoga",
  "scene": "a02_s01",
  "select": { "min": 2, "max": 4 },
  "lines": [
    { "voice": "ambition",
      "text": "Sixty tons of brass. Put it on the heights above the town and the fleet leaves or burns. That is the whole war in one winter.",
      "weight": { "stat": "judgment", "gain": 1.0 },
      "when": { "all": [] } },

    { "voice": "ambition",
      "text": "Nobody has done this. That is not an argument against it. That is the argument for it.",
      "weight": { "stat": "judgment", "gain": 0.7 },
      "when": { "stat": "judgment", "gte": 70 } },

    { "voice": "restraint",
      "text": "Three hundred miles. Frozen lakes that are not frozen enough. You are wagering the artillery of a country that has none.",
      "weight": { "stat": "character", "gain": 0.8 },
      "when": { "all": [] } },

    { "voice": "duty",
      "text": "Knox asked. He is twenty-five and a bookseller and he asked, which is more than any officer of engineers has done.",
      "weight": { "stat": "legitimacy", "gain": 0.9 },
      "when": { "all": [] } },

    { "voice": "temper",
      "text": "Congress sends letters. Let them read one written in eighteen-pounders.",
      "weight": { "stat": "loyalty", "gain": 0.6 },
      "when": { "stat": "legitimacy", "lt": 50 } },

    { "voice": "vanity",
      "text": "And when it is done they will say a Virginian planter took Boston with guns he stole from a lake.",
      "weight": { "stat": "legitimacy", "gain": -1.0, "invert": true },
      "when": { "all": [] } }
  ]
}
```

**Selection algorithm — specified here because it is the mechanism by which four hidden stats become legible (R4, R5):**

```
1. Filter to lines whose `when` is satisfied.
2. Group by voice; a voice contributes at most one line (its highest-scoring).
3. loudness(voice) = Σ over that voice's weight terms of:
       invert ? (1 - norm(stat)) * |gain| : norm(stat) * gain
   plus a fixed 0.15 base so a voice at zero stat is quiet, not silent.
4. VANITY additionally: loudness += 0.55 * (1 - norm(legitimacy))     ← R5
5. Sort by loudness descending. Take the top n where
       n = 2 + (number of voices whose loudness ≥ 0.55), clamped to [2,4].
6. Render in the fixed luminance order (VANITY→DUTY, 02 §6.5), not in loudness order,
   so the reader's eye learns a stable arrangement.
```

Step 4 is R5 in one line, and it is the single best "consequence, not scoreboard" mechanism in the project: a player whose standing has collapsed does not see a red number, they notice that a preening voice will not shut up. Step 6 is a small but real usability decision — sorting by loudness would make the band jump around and the student would read it as noise.

The linter enforces: **every line ≤28 words** (`L403`, R6); **every pool can produce ≥2 and ≤4 voices for at least one reachable state** (`L404`, R4); **no council line contains a question mark followed by an option-like construction** — a heuristic for R6's "voices never present a choice", reported as a warning for human review rather than an error.

## 5.6 `document.schema.json`

Documents are the progression system (**R2**). They are physical objects with typographic registers, they never grant stats, and **every document must unlock something** or it is cut (reference analysis §2.5).

```json
{
  "$schema": "../../../../schemas/document.schema.json",
  "id": "doc_ticonderoga_return",
  "act": 2,
  "title": "A Return of Ordnance at Fort Ticonderoga",
  "attribution": "Col. Henry Knox to His Excellency, 17 December 1775",
  "register": "SECRETARY",
  "paper": "doc/a02_xx_doc_return-of-ordnance_v02.webp",
  "paper_size": [768, 1024],
  "type_frame": [86, 120, 596, 800],
  "sensitive": false,
  "body": [
    { "run": "heading", "text": "A Return of the Cannon, Mortars &c. at Fort Ticonderoga and Crown Point" },
    { "run": "body",    "text": "Iron cannon, of eighteen pounds — ten." },
    { "run": "body",    "text": "Iron cannon, of twelve pounds — six." },
    { "run": "body",    "text": "Brass cannon, of twenty-four pounds — three." },
    { "run": "body",    "text": "Mortars, brass and iron, of divers weights — fourteen." },
    { "run": "body",    "text": "In all fifty-nine pieces, weighing as near as I can compute one hundred and nineteen thousand pounds." },
    { "run": "note",    "text": "The roads are the difficulty and not the guns. I shall want sleds, and oxen, and the lakes to hold." }
  ],
  "unlocks": [
    { "graph": "dlg_a02_s01_knox", "node": "n_guns_choice", "option": "o_read_the_return" },
    { "decision": "dec_a02_ticonderoga", "option": "send_knox_north" }
  ],
  "contradicts": "a02_s01_int_beef_barrel",
  "glossary_optout": []
}
```

- **`body` is an array of typed runs, never a blob of HTML.** Runs are `heading | body | note | signature | struck`, mapped to the four typographic registers by `register` (R16). This is what makes a document simultaneously period-typeset, selectable, screen-reader-navigable, and re-renderable in plain type by the accessibility control (04 §8.2).
- **`type_frame`** is the rectangle inside the blank generated paper where type is laid. The art never contains a glyph (art guide §5.1).
- **`unlocks` is mandatory and non-empty** (`L405`). A document that unlocks nothing fails the build. The linter cross-checks that every referenced option's `when` actually tests `{"doc": <this id>}`, so an unlock claim cannot rot.
- **`contradicts`** names an interactable or character line this document disagrees with, satisfying **R3** at the data level; the linter counts one per scene (`L401`).

## 5.7 `beats.schema.json` — battles and map-table sequences

All three of the brief's battle formats are the same data structure: an ordered list of beats, each selecting one of several pre-authored short outcomes by condition. No simulation, no combat engine, no dice.

```json
{
  "$schema": "../../../../schemas/beats.schema.json",
  "id": "beat_a04_trenton",
  "act": 4,
  "kind": "scripted_stat_weighted",
  "staging": "scene",
  "scene": "a04_s05",
  "beats": [
    { "id": "b_approach",
      "label": "The two columns, three hours late",
      "outcomes": [
        { "when": { "all": [ { "stat": "judgment", "gte": 70 },
                             { "flag": "f_informant_intel_taken" } ] },
          "text_key": "trenton_approach_clean",
          "effect": { "flags": ["f_trenton_surprise_full"] },
          "art": { "plate": "a04_s05_bg_king-street_L2_v03", "council_pool": null } },

        { "when": { "stat": "judgment", "gte": 45 },
          "text_key": "trenton_approach_late",
          "effect": { "flags": ["f_trenton_surprise_partial"] },
          "art": { "plate": "a04_s05_bg_king-street_L2_v03", "council_pool": null } },

        { "when": { "all": [] },
          "text_key": "trenton_approach_scattered",
          "effect": { "flags": ["f_trenton_surprise_none"], "counter": { "c_men_lost": 4 } },
          "art": { "plate": "a04_s05_bg_king-street_L2_v03", "council_pool": null } }
      ] },

    { "id": "b_rall",
      "label": "Rall's brigade forms in King Street",
      "council_pool": "cnc_a04_rall",
      "outcomes": [
        { "when": { "flag": "f_trenton_surprise_full" },
          "text_key": "trenton_rall_broken",
          "effect": { "stat": { "loyalty": 6, "judgment": 4 },
                      "counter": { "c_men_lost": 2, "c_prisoners": 896 } } },
        { "when": { "flag": "f_trenton_surprise_partial" },
          "text_key": "trenton_rall_contested",
          "effect": { "stat": { "loyalty": 4, "judgment": 2 },
                      "counter": { "c_men_lost": 5, "c_prisoners": 868 } } },
        { "when": { "all": [] },
          "text_key": "trenton_rall_costly",
          "effect": { "stat": { "loyalty": 2 },
                      "counter": { "c_men_lost": 9, "c_prisoners": 741 } } }
      ] },

    { "id": "b_after",
      "label": "The prisoners, and the two men found frozen on the road",
      "outcomes": [
        { "when": { "all": [] },
          "text_key": "trenton_after",
          "effect": { "flags": ["f_trenton_won", "f_two_frozen_on_the_road"],
                      "counter": { "c_men_lost": 2 } },
          "fixed": true } ]
    }
  ],
  "fixed_loss": {
    "flag": "f_two_frozen_on_the_road",
    "note": "R20: two men freeze to death on the march in every run. They are named in the letterbook."
  }
}
```

`kind` is `logistics_puzzle | decision_battle | scripted_stat_weighted`, corresponding to the brief's three formats; all three share this structure and differ only in `staging` (`scene` | `maptable`) and in whether beats carry player-facing `options` (the decision-battle hybrid does; it reuses the `choice` node's option schema verbatim). **`fixed: true`** marks an outcome the player cannot improve, and `L420` requires at least one per act across decisions and beats combined.

## 5.8 `letterbook.schema.json`

Washington's authored correspondence, assembled from state at each interlude. Fragments are conditional; assembly is ordered; there is no templating language.

```json
{
  "$schema": "../../../../schemas/letter.schema.json",
  "id": "let_a02_close",
  "act": 2,
  "interlude": "il_2",
  "register": "SECRETARY",
  "to": "The Honourable John Hancock, President of Congress",
  "place": "Head Quarters, Cambridge",
  "date": "26 January 1776",
  "paper": "doc/gl_xx_doc_letter-quarto_v03.webp",
  "fragments": [
    { "id": "fr_open", "when": { "all": [] },
      "text": "Sir, I do myself the honour to acquaint you with the state of this army, which I have now commanded these seven months." },

    { "id": "fr_guns_early", "when": { "flag": "f_guns_arrive_early" },
      "text": "Colonel Knox is returned from Ticonderoga with fifty-nine pieces of ordnance, and has done in eight weeks what I had thought the work of a season. I have not words for the service." },

    { "id": "fr_guns_late", "when": { "flag": "f_guns_arrive_late" },
      "text": "Colonel Knox is at length returned from Ticonderoga. The train is come, though later than I had hoped and lighter by what the lake took." },

    { "id": "fr_no_guns", "when": { "flag": "f_no_guns_sent" },
      "text": "The heights above the town remain as they were, and so do we. I am sensible that a general who waits is a general who is written about unkindly, and I shall bear it." },

    { "id": "fr_oxen", "when": { "counter": "c_oxen_lost", "gte": 8 },
      "text": "We have lost oxen on the road, and one sled through the ice at Half Moon, and the men who went in after it came out again, which I count the whole of our good fortune this month." },

    { "id": "fr_pay", "when": { "flag": "f_congress_will_not_pay_a02" },
      "text": "I must again represent to Congress that the men are unpaid. I have made this representation four times. I do not expect this letter to be the one that answers it." },

    { "id": "fr_knox_slighted", "when": { "flag": "f_knox_slighted" },
      "text": "I have given the business of the ordnance to an officer of engineers, and I find I am not easy about it, though I cannot say the choice was wrong." },

    { "id": "fr_close", "when": { "all": [] },
      "text": "I have the honour to be, with great respect, Sir, your most obedient humble servant,",
      "signature": "G. Washington" }
  ],
  "max_fragments": 6
}
```

- **Fragments render in declaration order**, filtered by `when`, capped at `max_fragments` (drop from the middle, never the first or last). This is the only place a condition may test a `counter`, and the schema restricts it accordingly.
- The assembled letter is written into `state.letterbook[]` and is the **assessment artefact** (04 §8.8). It is also plain text, so the printable transcript falls out for free.
- The linter checks that every `flag` referenced by a fragment is set by at least one reachable effect (`L303`) — which is how we catch a letter fragment that can never appear, the most likely and least visible content bug in the game.

## 5.9 The registries

Three small files that the linter treats as authoritative and that everything else must agree with.

**`content/flags.json`** — the flag registry, and the reason the passport code is possible:

```json
{
  "$schema": "../schemas/flags.schema.json",
  "version": 1,
  "run_flag_capacity": 64,
  "flags": [
    { "index": 0,  "id": "f_accepted_command",           "scope": "run",  "act": 1 },
    { "index": 1,  "id": "f_refused_pay",                "scope": "run",  "act": 1 },
    { "index": 2,  "id": "f_billy_lee_spoken_to",        "scope": "run",  "act": 1 },
    { "index": 3,  "id": "f_knox_sent_north",            "scope": "run",  "act": 2 },
    { "index": 4,  "id": "f_engineer_sent_north",        "scope": "run",  "act": 2 },
    { "index": 5,  "id": "f_no_guns_sent",               "scope": "run",  "act": 2 },
    { "index": 6,  "id": "f_guns_arrive_early",          "scope": "run",  "act": 2 },
    { "index": 7,  "id": "f_guns_arrive_late",           "scope": "run",  "act": 2 },
    { "index": 8,  "id": "f_read_dunmore",               "scope": "run",  "act": 3 },
    { "index": 9,  "id": "f_black_enlistment_reversed",  "scope": "run",  "act": 3 },
    { "index": 63, "id": "f_resigned_without_condition", "scope": "run",  "act": 8 },

    { "index": null, "id": "f_knox_rebuked",             "scope": "act",  "act": 2 },
    { "index": null, "id": "f_seen_map_table_a02",       "scope": "act",  "act": 2 },
    { "index": null, "id": "f_congress_pay_beat_a02",    "scope": "act",  "act": 2 }
  ]
}
```

**`scope` is the load-bearing field.** `run`-scoped flags survive between class periods and are packed into the passport code — **there are exactly 64 of them and the linter fails the build at 65** (`L510`). `act`-scoped flags exist only within an act, live in localStorage, and are discarded at the interlude. This split is what keeps the code at 28 characters instead of 40, and it is a legitimate model of the fiction: whether Washington rebuked Knox in a particular conversation does not need to be true in Act 7; whether he sent Knox north does.

Indices are **permanent**. Reusing a freed index is forbidden; the linter stores a hash of the `(index, id)` pairs in `content/flags.lock` and fails on any change to an existing pairing without a `version` bump (`L511`). Getting this wrong silently converts every student's saved code into a different game state, which is the worst bug this project can ship.

**`content/voices.json`** — the five voices with ink, hex, luminance and emblem, exactly as 02 §6.5 fixes them. Referenced by ID everywhere; never inlined.

**`content/glossary.json`** — ~180 entries, `{term, gloss, act_first_seen, aliases[]}`, auto-linked on first appearance per scene (04 §6.6).

## 5.10 Authoring ergonomics

- Every content file carries `$schema` as a relative path. `.vscode/settings.json` maps `content/**/scenes/*.json` → `schemas/scene.schema.json` and so on, so a writer gets completion on `voice`, `kind`, `register`, and red squiggles on an unknown flag the moment they type it.
- `npm run types` regenerates `src/content/types.gen.ts` from the schemas. **The schema is the source of truth; the TypeScript is generated.** A schema change that breaks the engine breaks the compile, which is the point.
- One file per scene, per dialogue graph, per decision. Never a mega-file. The 80 Days lesson (R24) is a filesystem layout as much as it is a rule.
- `npm run lint:content` runs the full linter in under a second and is documented in the README as a command a non-engineer runs before committing.

---

# 6. THE CONTENT LINTER

## 6.1 Why this is the most valuable thing we build

Eight acts, authored over months, by a writer who is not an engineer, referencing assets produced by an artist who is not either, against a state model with 64 permanent flags. The failure mode is not a crash — it is **Act 6 quietly referencing a flag Act 3 stopped setting**, discovered by a student in a classroom in November. That bug is invisible to a type checker, invisible to a test suite that does not know the content, and invisible to playtesting unless the playtester happens to take the exact path.

The linter converts that entire class of failure into a red build. It is what makes independent, parallel act authoring possible, which is the schedule assumption the whole project plan rests on. **Build it in week one, before there is any content to fail it.** A validator written after the content is a validator that gets disabled.

## 6.2 Architecture

```
tools/lint/
  index.mjs          entry: parse argv, run passes, format, exit code
  passes/
    p1-parse.mjs     read + JSON.parse + ajv validate against schemas
    p2-symbols.mjs   build the symbol table
    p3-refs.mjs      resolve every reference
    p4-graph.mjs     reachability, shadowing, orphans
    p5-satisfy.mjs   condition satisfiability
    p6-rules.mjs     the R-rules
    p7-assets.mjs    filesystem + ledger + budgets
  report/
    text.mjs         human output, with file:line:col
    sarif.mjs        SARIF 2.1.0 for GitHub code scanning annotations
  rules/             one file per check, exporting { id, severity, run }
```

- **Pure Node ESM, zero dependency on the engine.** The linter must run without a browser, without Three.js, and without a build. It reads `content/`, `schemas/`, `art/ledger.jsonl` and an index of `dist/` produced by the asset bake.
- **Three invocations.** `npm run lint:content` (CI, full, SARIF + text); a Vite plugin in dev that runs the affected subset on save and pushes errors into the HMR overlay; and a pre-commit hook running the fast passes (1–3) only.
- **Exit codes:** `0` clean, `1` errors present, `2` linter crashed. CI treats 2 as a linter bug, not a content bug, and says so.
- **Severities:** `error` fails the build; `warn` is reported and tracked but does not fail; `info` is advisory. **There are no configurable severities** — a rule that can be turned off is a rule that will be turned off in week eleven.

## 6.3 The pass structure

**P1 — parse and schema-validate.** Every file in `content/` against its `$schema`. Ajv in strict mode with `additionalProperties: false` everywhere, so a typo'd field name is an error, not silence. Failures here abort the run: there is no point analysing a graph that did not parse.

**P2 — build the symbol table.** One flat map of every declared ID → `{type, file, jsonPointer}`. Duplicate IDs across the whole project fail here (`L101`), including across types — `dlg_x` and `dec_x` may not both exist, because a human reading an error message should never have to ask which namespace.

**P3 — resolve references.** Every ID used anywhere is looked up. This is the bulk of the `L1xx` block and it is what "fails the build on unknown IDs" means in practice: 23 distinct reference kinds, each with a specific error message naming the expected type.

**P4 — graph analysis.** §6.5.

**P5 — condition satisfiability.** §6.6.

**P6 — the R-rules.** The design rules from the reference analysis that are mechanically checkable, plus 04 §9's list.

**P7 — assets and budgets.** Filesystem existence, ledger cross-check, per-act and total byte budgets.

## 6.4 The check catalogue

Complete. `E` = error, `W` = warn.

### L0xx — parse and schema

| ID | Sev | Fails on |
|---|---|---|
| L001 | E | File is not valid JSON |
| L002 | E | File does not declare `$schema` |
| L003 | E | Schema validation failure (ajv message passed through with JSON Pointer) |
| L004 | E | Unknown property (strict mode; catches `"whern"`, `"critera"`, `"effects"`) |
| L005 | E | ID does not match `^[a-z][a-z0-9_]{2,63}$` or lacks its type prefix |
| L006 | W | File is in `content/` but referenced by nothing and is not a registry |

### L1xx — reference integrity ("unknown IDs")

| ID | Sev | Fails on |
|---|---|---|
| L101 | E | Duplicate ID anywhere in the project |
| L102 | E | Unknown scene ID (in an exit's `target_scene`, a dialogue's `scene`, an act manifest) |
| L103 | E | Unknown spawn ID on an exit's `target_spawn`, or a spawn that exists in a different scene |
| L104 | E | Unknown dialogue graph ID on an interactable's `node` |
| L105 | E | Unknown node ID within a graph (`next`, `entry`, `branches[].next`, an unlock target) |
| L106 | E | Unknown decision ID on an `end` node or an act manifest |
| L107 | E | Unknown document ID (interactable, `{"doc":…}` condition, `effect.doc`, unlock) |
| L108 | E | Unknown flag ID — **anywhere**: condition, `effect.flags`, `effect.unflags`, fragment `when` |
| L109 | E | Unknown character ID on a speaker, interactable, or spawn |
| L110 | E | Unknown portrait ID, or a portrait that does not exist for that character's war stage |
| L111 | E | Unknown council pool ID |
| L112 | E | Unknown voice (not one of the five in `voices.json`) |
| L113 | E | Unknown beat table ID |
| L114 | E | Unknown letter ID, or a letter assigned to an interlude that does not exist |
| L115 | E | Unknown map-table ID |
| L116 | E | Unknown `text_key` (not present in the act's prose bundle) |
| L117 | E | Unknown counter ID in an `effect.counter` or a fragment `when` |
| L118 | E | Unknown LUT, light law, bed, spot, score cue, or population sheet |
| L119 | E | Unknown Gilt Frame plate ID, or an act declaring two |
| L120 | E | Unknown interactable ID in a `contradicts` field |
| L121 | E | An unlock claims a dialogue option whose `when` does not test the unlocking document |
| L122 | W | A `text_key` exists in the prose bundle but is referenced by nothing |

### L2xx — graph

| ID | Sev | Fails on |
|---|---|---|
| L201 | E | **Unreachable dialogue node** — no incoming edge from the graph's `entry` under optimistic traversal (§6.5) |
| L202 | E | Dialogue graph with no `end` node reachable from `entry` |
| L203 | E | Cycle in a dialogue graph containing no `choice` node (an infinite loop the player cannot break) |
| L204 | E | `say`/`council` node with no `next` and `kind !== "end"` |
| L205 | E | **Unreachable decision outcome** — no option routes to it |
| L206 | E | **Unreachable resolution** — shadowed by an earlier unconditional resolution, or its `when` is unsatisfiable (§6.6) |
| L207 | E | Decision with an option whose `outcome` names a non-existent outcome |
| L208 | E | **Orphaned scene** — not reachable from its act's entry scene by any chain of exits or `goto_scene` |
| L209 | E | Scene with zero exits that is not the act's terminal scene |
| L210 | E | Exit whose `target_scene` is in a different act (only the act's terminal scene may do this, and only to the next act's entry) |
| L211 | E | Act entry scene declared in the act manifest does not exist or has no `spawn_default` |
| L212 | E | Two scenes both claiming `index: 0` in one act |
| L213 | W | Scene reachable only via a `goto_scene` (structurally legal, worth a human look) |
| L214 | E | `branch` node whose last branch is conditional |
| L215 | E | `say` node with `variants` whose last variant is conditional |
| L216 | E | More than 10 `goto_scene` edges game-wide (**R11**) |
| L217 | E | Beat table whose beats reference an outcome that no earlier beat can produce |
| L218 | E | Decision `resolutions` list whose last entry is conditional |

### L3xx — condition satisfiability

| ID | Sev | Fails on |
|---|---|---|
| L301 | E | Condition contains a provable contradiction on one stat (`gte:70` ∧ `lt:40`) |
| L302 | E | Condition requires a flag both set and unset |
| L303 | E | **Condition requires a flag that no reachable effect anywhere sets** |
| L304 | E | Condition requires a document that no reachable interactable grants |
| L305 | E | Condition requires `{"visited": X}` where X is unreachable before this point in act order |
| L306 | E | Condition requires `{"choice": D, "is": O}` where option `O` does not exist on decision `D` |
| L307 | W | Flag is written but never read (dead effect) |
| L308 | W | Flag is read only in an act earlier than the act that sets it |
| L309 | E | Condition tests an act range that excludes the act the file belongs to (`{"act":{"gte":5}}` in `a02_*`) |
| L310 | W | Two options on the same `choice` node have identical `when` and identical `effect` |

### L4xx — the design rules

| ID | Sev | Rule | Fails on |
|---|---|---|---|
| L401 | E | R3 | Scene with <12 interactables, <8 carrying ≥40-word examine text, 0 `contradicts`, <3 stat-band variants, or 0 unlocking documents |
| L402 | E | R4 | Council pool that cannot produce 2–4 voices for any reachable state |
| L403 | E | R6 | Council line >28 words |
| L404 | E | R6 | Council line ending in a question mark immediately followed by a `choice` node with matching option text (heuristic; W if uncertain) |
| L405 | E | R2 | Document with an empty `unlocks` array, **or any effect that grants a stat on the same node as a `doc`** |
| L406 | E | R9 | Interactable >8.0 s from `spawn_default` at 400 px/s along the walk-plane polyline |
| L407 | E | — | Walk-plane scale range outside 1.00→0.58 (exterior) or 1.00→0.86 (interior) |
| L408 | E | R8 | >1 scripted move in an act, or a move outside 4,000–7,000 ms |
| L409 | E | R7 | `fade` on an exit not listed in `time-skips.json`, or `cut` across one that is |
| L410 | E | R15 | Act with no scene declaring `"score": null` |
| L411 | E | R11 | <40% of all `choice` options game-wide are characterization-only (no `flags`, no `goto_scene`, |Δstat| ≤ 2) |
| L412 | E | R12 | More than 8 scenes declaring `apex_plate`, or two in one act |
| L413 | E | — | More than 8 `sealed: true` decisions, or an act with two, or an act with none |
| L414 | E | R13 | Population block whose `poses_low` is not biased toward seated/hunched (≥50% of entries) |
| L415 | E | R22 | Interactable `name` matching the bare-category word list (`barrel`, `soldier`, `cannon`, `door`, `man`, `letter`, … 60 entries) with no qualifier |
| L416 | E | — | Character whose `ship_height_px` is not 8–12% below Washington's 220 (04 §4.3) |
| L417 | E | — | Two spawns, or two character anchors, within 0.02 `t` |
| L418 | E | — | Glyph placement <40 px from a frame edge or <30 px from another glyph |
| L419 | E | R5 | Scene with `register: "R5"` not declaring all five Witness Register parameters |
| L420 | E | R20 | Act with no `fixed_loss` across its decisions and beat tables |
| L421 | E | R23 | Act with no beat tagged `"humour_sourced"` (the tag carries a required `source` citation) |
| L422 | E | R19 | Any UI surface declared outside the letterbook's four ribbons |
| L423 | W | R21 | Prose containing a congratulatory string from a 40-phrase list (`well done`, `excellent work`, `you have succeeded`) |
| L424 | E | — | Clip channel array whose length ≠ the clip's `frames` |
| L425 | E | — | >7 spawns in a scene (the 8-puppet ceiling, §3.8) |

### L5xx — assets and budgets

| ID | Sev | Fails on |
|---|---|---|
| L501 | E | Referenced asset file absent from `dist/` |
| L502 | E | Scene without exactly five layer files `L0`–`L4` |
| L503 | E | Asset in `dist/` with no record in `art/ledger.jsonl` (art guide §6.6) |
| L504 | E | Ledger record whose `file` does not exist |
| L505 | E | Asset with `sensitive: true` and no `hist_check.verdict === "pass"` and no sign-off record |
| L506 | E | Per-act chunk >12 MB, initial shell >8 MB, total art >85 MB, total audio >12 MB |
| L507 | E | Texture whose dimensions do not match the art guide's ship table for its class |
| L508 | W | Asset in `dist/` referenced by no content file |
| L509 | E | Rig referencing an atlas rect outside the atlas bounds, or a `parent` that is not a declared piece |
| L510 | E | More than 64 `run`-scoped flags |
| L511 | E | `flags.lock` mismatch: an existing flag's index changed without a registry `version` bump |
| L512 | E | Font subset missing a glyph used in any content string |

### L6xx — accessibility

| ID | Sev | Fails on |
|---|---|---|
| L601 | E | Computed measure outside 58–66 ch at any `--ui-scale` step (04 §8.1) |
| L602 | E | Simulated ΔE <12 between semantically distinct UI elements under protanopia/deuteranopia/tritanopia/greyscale |
| L603 | E | Interactive element with no focusable DOM mirror or no visible focus style |
| L604 | E | Locked-option text colour below 4.5:1 on `PAPER-WARM` (02 §8.5) |
| L605 | E | Any content string implying a timed choice (word list) |
| L606 | E | Glossary entry above grade 8 on Flesch–Kincaid |
| L607 | W | Text block >55 words (**R17**) that the runtime will have to auto-chunk |

## 6.5 The reachability algorithm

Stated precisely, because "unreachable" has three different meanings in this codebase and conflating them produces false positives that get the linter disabled.

**Dialogue node reachability (`L201`) — optimistic traversal.**

```
visited ← {}
queue   ← [ graph.entry ]
while queue:
    n ← pop(queue)
    if n ∈ visited: continue
    visited ← visited ∪ {n}
    for each outgoing edge e of n:
        # OPTIMISTIC: we do NOT evaluate e's condition here.
        # A node guarded by a condition is reachable if the condition is
        # SATISFIABLE (checked separately by P5), not if it is currently true.
        push(queue, e.target)
unreachable ← graph.nodes − visited
```

Edges are: `say.next`, `council.next`, every `choice.options[].next`, every `branch.branches[].next`. `end` nodes have no outgoing edges. **Optimism is the correct policy here** because a pessimistic traversal would need to solve the condition system to know whether an edge is live, and a false "unreachable" on a node the writer can plainly reach is exactly the kind of wrong that makes a team stop trusting the tool. Unsatisfiable guards are P5's job and they get their own error IDs, so the writer sees the *real* reason.

**Decision resolution reachability (`L206`) — the shadowing check.** Resolutions are an ordered list evaluated first-match-wins. A resolution at index `i` is unreachable if:

1. any resolution at index `j < i` has an unconditional guard (`{"all":[]}` or absent), **or**
2. its own guard is unsatisfiable (P5), **or**
3. its guard is *subsumed* by the disjunction of all earlier guards.

Case 3 is where the real bugs live and full subsumption is expensive, so we implement a **sound but incomplete** check covering the two forms that occur in practice: a later guard whose stat interval is entirely contained in an earlier guard's on the same stat with no other differing terms; and a later guard that is a literal duplicate of an earlier one modulo term order. Anything more subtle is reported as `info`, not `error`. **Incomplete and trusted beats complete and disbelieved.**

**Scene orphan detection (`L208`).** A directed graph over scenes, edges from every exit's `target_scene` and every `goto_scene`. BFS from the act's declared entry scene. Anything unvisited is orphaned. Interludes are nodes with a single edge to the next act's entry. This check is what catches the classic failure: a scene is written, art is made for it, and no exit ever points at it — which has happened on every narrative game ever shipped.

## 6.6 Condition satisfiability

A deliberately small solver. Three-valued flags, interval arithmetic on stats, set membership for documents and choices. No SAT engine, no Z3, no dependency.

```
Domain for a condition:
  stats     4 intervals over [0,127], initialised to full range
  flags     map flag → {TRUE, FALSE, UNKNOWN}
  docs      set of possibly-read documents (from P3's "which interactables grant what")
  choices   map decision → set of possible option ids
  act       interval over [1,8]

Walk the condition tree:
  all  → intersect child domains; empty interval or a flag forced both ways ⇒ UNSAT
  any  → SAT if any child is SAT
  none → SAT if any child is not TAUTOLOGICAL (conservative: we only prove UNSAT
         for `none` when a child is provably always true, which is rare)
  leaf → narrow the domain
```

It proves **unsatisfiability**, never satisfiability. Reporting an error requires a proof of impossibility, which is the correct asymmetry for a build gate.

**The single most valuable check in the whole linter is `L303`:** a condition requiring a flag that no reachable effect sets. It is computed by taking the union of `effect.flags` over every reachable node, decision resolution, and beat outcome in the entire project, and then checking every `{"flag": X}` leaf against it. This catches the exact failure §6.1 describes — Act 6 reading a flag Act 3 stopped setting — for free, at build time, in about 4 ms.

Its complement, `L307` (write-only flags), is a *warning* rather than an error because a flag written in Act 7 and read only in the epilogue is legitimate during development, and a hard error would make it impossible to author the epilogue last.

## 6.7 Error messages

The output format is a product decision, not a formatting detail. A writer who cannot act on an error will ping an engineer, and the linter's whole value is that they do not have to.

```
ERROR  L303  content/acts/a06/dialogue/dlg_a06_s01_officers.json:71:9
       Condition requires flag "f_pay_promised_in_writing", which no effect
       anywhere in the project sets.

         at #/nodes/n_officers_angry/options/1/when/all/0

       Nearest declared flags by name:
         f_pay_promised_verbally   (set in a05/decisions/dec_a05_inspector.json)
         f_pay_petition_signed     (set in a06/beats/beat_a06_petition.json)

       If this flag is intended, add an effect that sets it, or remove the
       condition. Flags are declared in content/flags.json; a flag that is
       declared but never set is legal and is what this error is about.
```

Every error carries: the rule ID (searchable in this document), the file and a real line and column (from a JSON source-map produced during parse, not guessed), the JSON Pointer, the nearest plausible alternatives by Levenshtein distance, and one sentence of what to do. The "nearest declared" block is worth the fifteen lines it costs — the overwhelming majority of `L1xx` errors are typos and the fix is on screen.

## 6.8 Performance

**Target: full lint of 41 scenes, ~1,200 dialogue nodes, ~90 documents and ~40 decisions in under 900 ms** on the developer's machine, because the Vite plugin runs it on save and anything slower gets debounced into uselessness.

Achieved by: parsing once into a shared AST with source positions; building the symbol table once; running P3–P6 over the in-memory model with no filesystem access; and running P7 against a cached `dist/` index that is only rebuilt when the asset bake runs. Measured in CI and asserted — a linter that becomes slow becomes optional.

## 6.9 What the linter deliberately does not check

- **Prose quality, tone, or historical accuracy.** These are the human gates: the Creative Director's read, and the teaching client's contact-sheet review (art guide §5.4). A linter that pretended to check history would be trusted to, and it would be wrong.
- **Balance.** Whether the stat economy is well-tuned is a playtest question. The linter checks that effects are *declared*, not that they are *right*.
- **Shader output.** §11.6.
- **Whether an act is fun.** Named explicitly, because someone will eventually propose a heuristic for it.

---

# 7. THE STATE OBJECT & SAVE SYSTEM

## 7.1 The state shape

```ts
// src/state/types.ts — the ONE mutable object in the game
export interface GameState {
  readonly version: 1;

  stats: { judgment: number; legitimacy: number; loyalty: number; character: number }; // 0–127

  runFlags: Uint8Array;      // 8 bytes = 64 bits, indexed by flags.json
  actFlags: Set<string>;     // act-scoped; cleared at each interlude; NOT in the passport code

  act: number;               // 1–8
  sceneIndex: number;        // 0–31, index within the act
  sceneId: string;           // derived; stored for localStorage convenience only

  docsRead: Set<string>;     // document IDs
  visited: Set<string>;      // scene IDs
  choices: Map<string, string>;   // decisionId → optionId
  counters: Map<string, number>;  // letterbook accumulators

  letterbook: Array<{ letterId: string; text: string; date: string }>;

  prefs: {
    uiScale: 0|1|2|3|4;      // 0.90 / 1.00 / 1.15 / 1.35 / 1.60
    font: 0|1|2;             // Source Sans 3 / Atkinson Hyperlegible Next / system
    instantText: boolean;
    motion: 0|1|2;           // auto (respect prefers-reduced-motion) / force on / force off
  };

  // derived, never stored, recomputed at scene load
  readonly W?: number;
  readonly band?: 'low'|'mid'|'high';
}
```

**What is stored versus derived.** `W` and `band` are derived from stats + act + scene index at scene load (02 §3.2) and are never persisted — persisting a derived value is how two sources of truth are born. `docsRead`, `visited` and `choices` are *fully recoverable from `runFlags`* in the shipping content, because every document that matters sets a run flag, every decision outcome sets a run flag, and scene visitation is implied by act/scene position. They exist as separate structures at runtime for query convenience and are **not** in the passport code. This is a design constraint on the content, enforced by `L303`/`L304`: if a condition depends on a document read, that document's being read must be observable through a run flag, or the state cannot survive a passport round trip. The linter proves it.

**The only writer:**

```ts
export function applyEffect(s: GameState, e: Effect): void {
  if (e.stat)    for (const [k, d] of Object.entries(e.stat))
                   s.stats[k] = clamp(s.stats[k] + d, 0, 127);
  if (e.flags)   for (const f of e.flags)   setFlag(s, f);
  if (e.unflags) for (const f of e.unflags) clearFlag(s, f);
  if (e.doc)     s.docsRead.add(e.doc);
  if (e.letter)  queueLetter(s, e.letter);
  if (e.beat)    armBeat(s, e.beat);
  if (e.counter) for (const [k, v] of Object.entries(e.counter))
                   s.counters.set(k, (s.counters.get(k) ?? 0) + v);
}
```

Sixteen lines, pure apart from the state argument, no clock, no randomness. **Determinism guarantee: the same initial state plus the same ordered sequence of choices always produces the same final state.** That is testable (§11.2) and it is what makes the passport code honest.

## 7.2 The passport code

A student carries a code between class periods. It must be short enough to type from a slip of paper, robust against mistyping, and impossible to corrupt into a silently-wrong state.

**Format: 28 characters of Crockford Base32, in 7 groups of 4.**

```
H4T7-K2M9-3XVB-0R6P-Q8ZN-5DJW-A1YC
```

**Crockford Base32**, not standard Base32 or Base64URL, for three reasons: its alphabet excludes `I`, `L`, `O` and `U` (so `1`/`I`/`l` and `0`/`O` cannot be confused, and no code can accidentally spell an unfortunate word); it defines case-insensitive decoding and aliases `i`,`I`,`l`,`L`→`1` and `o`,`O`→`0`, so the most common transcription errors decode correctly rather than failing; and it is a published specification we can point at rather than a bespoke alphabet.

### The bit layout — exact

140 bits total: 124 payload + 16 CRC. 140 / 5 = 28 characters exactly, which is why the reserved field is 12 bits and not 8.

| Bits | Width | Field | Encoding |
|---|---|---|---|
| 0–3 | 4 | `version` | 1 in v1. Decoder rejects unknown versions. |
| 4–10 | 7 | `judgment` | 0–127, raw |
| 11–17 | 7 | `legitimacy` | 0–127, raw |
| 18–24 | 7 | `loyalty` | 0–127, raw |
| 25–31 | 7 | `character` | 0–127, raw |
| 32–34 | 3 | `act` | 0–7 (act 1 = 0) |
| 35–39 | 5 | `sceneIndex` | 0–31 |
| 40–103 | **64** | `runFlags` | bit `i` = flag with `index: i` |
| 104–106 | 3 | `prefs.uiScale` | 0–4 used, 5–7 reserved |
| 107–108 | 2 | `prefs.font` | 0–2 used |
| 109 | 1 | `prefs.instantText` | |
| 110–111 | 2 | `prefs.motion` | 0 auto / 1 on / 2 off |
| 112–123 | 12 | `reserved` | **must be zero**; nonzero with a known version ⇒ reject |
| 124–139 | 16 | `crc` | CRC-16/CCITT-FALSE over the 124 payload bits, zero-padded to 16 bytes |

The 7-bit stat fields are the reason §5.1.2 made stats 0–127 rather than 0–100: the range is the encoding, so there is no scaling step and therefore no rounding drift across a save/load cycle. The 64-bit flag field is the reason §5.9 splits `run` from `act` scope and caps the registry at 64.

### The checksum, and what it guarantees

**CRC-16/CCITT-FALSE** — polynomial `0x1021`, init `0xFFFF`, no input or output reflection, no final XOR. Computed over the 124 payload bits left-aligned and zero-padded into 16 bytes.

This is not a probabilistic claim. CRC-16 detects **all** burst errors of 16 bits or fewer. A single mistyped Base32 character corrupts at most 5 bits within one aligned group — a 5-bit burst, **always detected**. Two adjacent mistyped characters, or a transposition of two adjacent characters, is at most a 10-bit burst — **always detected**. A character dropped or added changes the length and is rejected before the CRC runs. For arbitrary random input of the correct length, the false-accept rate is 1 in 65,536, and that case is additionally caught by the range checks below.

**Decoder rejection order** (fail early, fail loudly, never partially apply):

```
1. Normalise: uppercase, strip everything not in the Crockford alphabet,
   apply the I/L→1 and O→0 aliases.
2. Length must be exactly 28. Else: "That code is too short/long."
3. Decode to 140 bits.
4. CRC check.        Else: "That code has a typo in it. Check it and try again."
5. version === 1.    Else: "That code is from a different version of the game."
6. reserved === 0.   Else: reject as above.
7. act ≤ 7, sceneIndex < sceneCount(act).  Else: reject.
8. runFlags bits above the registry's declared count must be 0. Else: reject.
9. ONLY NOW construct a GameState and swap it in.
```

Step 9 is the whole point of the ordering: **a bad code never touches live state.** The student sees one clear sentence and their existing session is untouched.

### Encoder and decoder

```ts
const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';   // Crockford

export function encode(s: GameState): string {
  const bits = new BitWriter(140);
  bits.u(1, 4);
  bits.u(s.stats.judgment, 7);   bits.u(s.stats.legitimacy, 7);
  bits.u(s.stats.loyalty,  7);   bits.u(s.stats.character,   7);
  bits.u(s.act - 1, 3);          bits.u(s.sceneIndex, 5);
  bits.bytes(s.runFlags, 8);                       // 64 bits
  bits.u(s.prefs.uiScale, 3);    bits.u(s.prefs.font, 2);
  bits.u(s.prefs.instantText ? 1 : 0, 1);
  bits.u(s.prefs.motion, 2);
  bits.u(0, 12);                                   // reserved
  bits.u(crc16ccitt(bits.payloadBytes()), 16);
  return group(base32(bits.buffer), 4);            // 7 groups of 4
}
```

`BitWriter` writes MSB-first. `base32` reads the 140-bit buffer in 5-bit groups, MSB-first, so the mapping is stable and independent of platform endianness. Golden vectors for eight representative states are committed in `tests/fixtures/passport-golden.json` and asserted byte-for-byte (§11.2) — this is the one piece of the codebase where a refactor that changes output by one bit invalidates every code a student is carrying, so the test exists to make that impossible to do by accident.

**URL form:** `?p=H4T7K2M93XVB0R6PQ8ZN5DJWA1YC` (hyphens are display only, stripped on input). A teacher can hand out a link. The code is not encrypted and is trivially decodable by anyone — which is correct and worth stating in the provenance doc: **it contains no student identity, no name, no timestamp, and nothing that could identify a person.** It is a game state and nothing else. A student can also forge one, and that is fine, because the assessment artefact is the letterbook (04 §8.8), not the code.

### Size sanity

28 characters plus 6 hyphens is 34 glyphs. At Libre Caslon Text 26 px with +12% tracking (02 §8.4) that is roughly 540 px on a ruled line inside a 988 px panel. It fits, on one line, at every UI scale step up to Large; at Largest it wraps to two lines of 14 characters, which the passport screen handles by design.

## 7.3 localStorage autosave

The passport code is for **between class periods, between devices**. localStorage is for **within a session and across a sleep**, and it stores strictly more.

```
key      wshoes.save.v1.slot{0|1|2}
value    JSON, ~6–30 KB depending on letterbook length
```

```jsonc
{
  "v": 1,
  "buildId": "2026-09-02.a41f0c",
  "contentVersion": 7,
  "savedAt": "2026-09-18T14:22:07.331Z",
  "label": "period 4 — J.M.",         // student-entered, local only, never transmitted
  "passport": "H4T7K2M93XVB0R6PQ8ZN5DJWA1YC",
  "act": 2, "sceneId": "a02_s01", "sceneIndex": 0,
  "actFlags": ["f_seen_map_table_a02"],
  "docsRead": ["doc_ticonderoga_return"],
  "visited": ["a01_s01","a01_s02","a01_s03","a01_s04","a02_s01"],
  "choices": { "dec_a01_command": "accept_without_pay" },
  "counters": { "c_oxen_lost": 8 },
  "letterbook": [ { "letterId": "let_a01_close", "date": "4 May 1775", "text": "…" } ],
  "transcript": [ "…last 200 blocks, for the printable transcript…" ]
}
```

- **The passport string is embedded** rather than re-derived, so a student who has lost their slip can recover it from the device even if the content version has since moved on.
- **Three slots**, because Chromebook carts are shared and two students may use one device in different periods. The slot picker is the first thing on the title screen if any slot is occupied. Labels are free text, stored locally, never transmitted, and the UI says so on the screen where they are entered.
- **Write policy:** on scene entry, on interlude entry, on decision commit, and on `visibilitychange → hidden`. Never on a timer. Writes are debounced to 400 ms and wrapped in try/catch — a `QuotaExceededError` degrades to "your progress is saved in your code" with the passport screen shown, rather than throwing.
- **Corruption handling:** parse failure or `v` mismatch → the slot is renamed `wshoes.save.v1.slot0.broken` (not deleted, so it can be recovered by hand) and the student is offered the passport-code entry screen.
- **Private browsing / storage disabled:** detected at boot by a write-read-delete probe. If it fails, the game runs entirely in memory and the passport screen is surfaced at every interlude with a one-line explanation. Nothing breaks; the student just has to write the code down. This is the correct behaviour on a locked-down district image and it must be tested on one.

## 7.4 Migration

`contentVersion` is bumped whenever the flag registry version changes. A save with an older `contentVersion` runs through `src/state/migrations/`, a map of `n → n+1` pure functions committed alongside the registry change. **Passport codes carry only the 4-bit format `version`, not the content version** — which means a content change that reassigns a flag index breaks every outstanding code, which is exactly why `L511` makes that a build error. Within a school term, content deploys are **additive only**: new flags may be appended at unused indices, existing indices never move. That policy is written into `docs/RELEASE-POLICY.md` and it is the difference between a Tuesday patch and thirty students losing a week.

---

# 8. AUDIO

## 8.1 Architecture — 210 lines of Web Audio, no library

```
                                        ┌── beds (AudioBufferSourceNode, loop)
                                        │      └─ bedGain ─┐
AudioContext                            │                  ├─ bedLowpass (BiquadFilter)
  └── masterGain (0.9) ── destination ──┤                  │     └─ used ONLY by the map table
                                        ├── spots (one-shot buffers) ─ spotPan (StereoPanner)
                                        ├── score (MediaElementAudioSourceNode) ─ scoreGain
                                        └── ui (short buffers) ─ uiGain
```

Everything the game needs is four gain nodes, one biquad, one stereo panner, and a crossfade helper. Howler's value is an HTML5-audio fallback for browsers we do not support; we would use none of it.

**Crossfades are equal-power**, not linear: `gain = cos((1-t)·π/2)` in, `cos(t·π/2)` out. A linear crossfade between two ambient beds produces an audible dip in the middle, which on a 220 ms cut (04 §5.2) reads as a glitch — the exact thing the 220 ms bleed exists to prevent.

**Autoplay policy.** The title screen's *Begin* button is the user gesture; `ctx.resume()` fires there. If the context is still suspended (some managed ChromeOS profiles), the game runs silently with no error and no dialog. Audio is never load-bearing for comprehension — there is no voice acting and no audio-only information — so silence is a degraded experience, not a broken one.

## 8.2 Format: Opus, not Vorbis

The reference analysis specified OGG Vorbis. **We ship Opus in WebM containers**, and this changes the budget enough to matter.

Opus at 32 kbps mono is perceptually comparable to Vorbis at 64 kbps for the sparse acoustic material the instrumentation law describes (solo viola da gamba, low woodwind, drone, fortepiano — reference analysis §1.5). Chrome decodes Opus natively on every device in the fleet. The result is that the audio budget goes from *not achievable* to *comfortable*:

| Class | Count | Length | Encoding | Payload |
|---|---|---|---|---|
| Score cues | 10 | 90–150 s (avg 110) | Opus 48 kbps stereo | **6.6 MB** |
| Ambient beds | **14 shared**, mapped to 41 scenes | 40 s seamless | Opus 32 kbps mono | **2.24 MB** |
| Spot one-shots | 60 shared | 1–4 s (avg 2.5) | Opus 32 kbps mono | **0.60 MB** |
| UI | 12 | 0.2–0.6 s | Opus 32 kbps mono | **0.02 MB** |
| | | | **Total** | **≈ 9.5 MB** |

**Fourteen shared beds, not forty-one.** This is the art guide's sheet method applied to audio: a bed is *a place-type* (open camp, interior wood, interior stone, riverbank night, winter field, siege line, formal chamber, …), and per-scene identity comes from the spot layer, not from a bespoke bed. Fourteen beds mixed once, well, beats forty-one beds mixed hastily, and it saves 12 MB. The linter maps every scene's `bed` to one of the fourteen (`L118`).

**Decode residency policy**, because `decodeAudioData` produces float32 PCM and that lands on the JS heap:

- **Score is streamed** through `MediaElementAudioSourceNode` — a `<audio>` element, seekable, loopable via `loop` plus a small `timeupdate` guard for gapless. Heap cost ≈ 0. This is the whole reason the score does not blow the 180 MB budget.
- **Beds are decoded** to `AudioBuffer`. 40 s mono at 48 kHz f32 = 7.7 MB. **At most two are resident** (current + crossfading), so 15.4 MB.
- **Spots: only the current scene's 3–6.** ~2.9 MB. Released on scene disposal alongside the textures.

## 8.3 Mixing and the rules that are not negotiable

- Beds at **−18 LUFS**, score at **−22 LUFS**, spots peaking −12 dBFS. Mastered to those targets, verified by a build script (`ffmpeg -af ebur128`), and failed in CI if a cue is more than 1.5 LU off. Consistency across 40 scenes cannot be achieved by ear across a production.
- **One duck rule, total:** a spot ducks the bed by −2.5 dB for its duration plus 300 ms. The score never ducks, for anything. Complex ducking is where game audio goes to become mush.
- **The map-table filter:** bed low-pass sweeps 20 kHz → 800 Hz over 900 ms and drops −14 dB; score continues at −6 dB, low-passed at 3 kHz, as though heard from the next room (04 §7.3). One `BiquadFilterNode`, two `linearRampToValueAtTime` calls.
- **R14, enforced:** fife and drum are diegetic only. Mechanically checkable — the linter fails any asset ID matching `fife|drum` used as a `score` value (`L410`-adjacent). Non-diegetic fife and drum converts the game into a patriotic documentary montage and vaporises the melancholy we are buying, and a rule this important should not rest on someone remembering it.
- **R15, enforced:** every act declares ≥1 scene with `"score": null`; Act 8 declares `null` on all three until its final beat (`L410`).

## 8.4 Spot scheduling

Spots fire on randomised 10–40 s timers, panned from their `anchor_t` relative to the player's `t` (`pan = clamp((anchor_t − player_t) × 2.2, −1, 1)`), per 04 §1.2.4.

**The randomness is seeded**: `mulberry32(hash(sceneId, visitCount))`. Two consequences, both wanted. A bug report that says "the cart wheel fires over Knox's first line" is reproducible. And two students at neighbouring desks on their first visit to Camp Street hear the same camp, which makes the place feel like a place rather than like a noise generator. On a second visit the seed changes, so it does not become a loop.

## 8.5 No voice acting, and the two things that replace it

Pentiment demonstrates this is fine (reference analysis §2.5), but "fine" is load-bearing on two specific substitutes and both are already built: **typography carries performance** (four registers, R16 — the Rough hand *is* a voice), and **the 45 ch/s reveal is a delivery**, which is why the reveal survived the accessibility pass as an effect that is free to skip rather than being removed. Audio's job in a game with no VO is therefore the melancholy, and that is what the instrumentation law and the silence rule are for.

---

# 9. BUILD, DEPLOY, AND CLASSROOM DELIVERY

## 9.1 The pipeline

```
npm run build
 ├ 1  types        schemas/*.json          → src/content/types.gen.ts
 ├ 2  bake         art/dist/, audio/src/   → dist/art, dist/audio  (toktx, cwebp, opusenc)
 ├ 3  lint:content content/ + dist index   → SARIF + text          ← FAILS THE BUILD
 ├ 4  tsc          typecheck, noEmit
 ├ 5  vite build   shell + per-act chunks, hashed filenames
 ├ 6  budget       walk dist/, sum per-act bytes                   ← FAILS THE BUILD
 ├ 7  sw           generate precache manifest into sw.js with BUILD_ID
 └ 8  provenance   write BUILD-PROVENANCE.md (node, os, dep hashes, wasm sha256)
```

Steps 3 and 6 fail the build. That is the point of both of them, and neither has a `--force`.

## 9.2 Output and caching

Everything except `index.html` and `sw.js` is content-hashed and served `Cache-Control: public, max-age=31536000, immutable`. `index.html` is `no-cache`; `sw.js` is `max-age=0`. This is the standard immutable-asset arrangement and it is what makes the second load 1.5 s.

## 9.3 Hosting

**Primary: GitHub Pages.** Free, HTTPS by default, custom domain, no backend to secure, no server to be responsible for in 2030, and — the decisive property — **a district can fork the repository and host it themselves**, which converts "can we rely on this vendor?" from a procurement blocker into a two-minute answer.

`vite.config.ts` sets `base: './'`, so the build is fully relative-path and runs from any subdirectory. Three deployment targets are documented and tested:

1. **GitHub Pages** — `gh-pages` branch, one workflow.
2. **District static host / LMS file area** — unzip `dist/` anywhere, no configuration.
3. **A teacher's laptop** — `npx serve dist` for a classroom with no network at all.

**`file://` is not supported** and the README says so plainly: service workers, `fetch` of content JSON, and WASM instantiation all require an origin. A student double-clicking `index.html` gets a one-paragraph page explaining what to do, not a blank screen.

**Iframe embedding** (Google Sites, Canvas, Schoology) works, with one caveat that has to be handled rather than documented away: an iframe does not have keyboard focus until it is clicked, and this game is keyboard-first. The build detects `window.self !== window.top` and shows a full-frame *"Click here to play"* panel that takes focus on click and never appears again in that session. `Content-Security-Policy: frame-ancestors` is left permissive; there is nothing to protect.

## 9.4 Offline behaviour

Per §4.4. The contract for the teacher guide, verbatim:

> Once a student has played an act on a device, that act works with no network at all. An act they have never opened needs about thirty seconds of connection to begin. If the wifi drops mid-act, nothing happens — everything for the current act is already on the device.

Tested by the smoke suite with the network offline after a warm load.

## 9.5 The payload budget

| Bucket | Budget | Actual |
|---|---|---|
| Engine JS (three + app, gz) | — | **243 KB** |
| Basis transcoder WASM | — | 242 KB |
| CSS | — | 18 KB |
| Fonts (Source Sans 3 + 4 period faces, subset WOFF2) | ≤340 KB | 320 KB |
| Act 1 content JSON | — | 78 KB |
| Act 1 art (4 scenes × 5 layers, 6 rigs, atlas, 14 docs) | — | 6.0 MB |
| Act 1 audio | — | 0.5 MB |
| **Initial download** | **≤ 8 MB** | **≈ 7.4 MB** ✓ |
| Per-act chunk, acts 2–8 | ≤ 12 MB | 5.2–11.6 MB ✓ |
| Total shipped art | ≤ 85 MB | ~82 MB |
| Total audio | ≤ 12 MB | 9.5 MB |
| **Total build** | **≤ 100 MB** | **≈ 96 MB** |

## 9.6 First-load time, and the honest classroom arithmetic

**Targets on the reference device:**

| | Cold | Warm (service worker) |
|---|---|---|
| Title screen interactive | **≤ 3.0 s** | ≤ 1.2 s |
| Act 1, scene 1 walkable | **≤ 15 s** | ≤ 1.8 s |
| Any subsequent scene cut | ≤ 1 frame | ≤ 1 frame |

The title screen needs only 850 KB (engine + CSS + fonts + a type-set title page — 02 §8.6: the title is set in type, so it costs nothing). At 5 Mbps that is 1.4 s of transfer plus parse and WASM instantiation. Act 1's 6.5 MB of art and audio streams during the title screen and the first two dialogue blocks, which is why 15 s is achievable rather than optimistic.

**The number the client needs to hear.** Thirty students opening the game simultaneously on a 5 Mbps shared link is 30 × 7.4 MB = 222 MB, which takes **about six minutes** if the link is the bottleneck, and that is a real thing that will happen in period 1 on day 1. Mitigations, in order of effectiveness:

1. **Ask the district to host it locally** (option 2 in §9.3). Then it is a LAN transfer and the problem disappears. This is the recommendation, and the reason the build is a folder of static files with relative paths.
2. **Have students open the game once for homework or in the previous period.** The service worker caches Act 1 and every later act as it is played, so the six minutes happens once per device, not once per period.
3. If neither is possible, the first session's first five minutes are a title screen and an interlude-style opening card. That is a scheduling reality, not an engineering failure, and the teacher guide states it rather than hiding it.

## 9.7 Browser support

**Required:** WebGL2, ES2020, Web Audio, Cache Storage, `WebGLRenderTarget` MRT (core WebGL2). **Not required:** WebGPU, WebAssembly SIMD, OffscreenCanvas, WebCodecs, any permission.

Chrome/Edge 111+, Firefox 113+, Safari 16.4+. Anything older gets a static page with the requirement list and no partial experience — a half-rendered game in a classroom costs the teacher more than an honest refusal.

## 9.8 Telemetry: none

Stated as an architectural property, because it is one:

**The shipped game makes zero third-party network requests.** No analytics, no error reporting, no font CDN, no image-model API, no API key, no cookie, no `localStorage` key that leaves the device. Fonts are self-hosted. The only requests are to the origin serving the game.

Enforced by a CSP served with the page and asserted in the smoke test:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; media-src 'self'; font-src 'self';
connect-src 'self'; frame-ancestors *; base-uri 'none'; form-action 'none'
```

The smoke test additionally installs a request interceptor and fails on any request to a host other than the origin. This is the technical substance behind decision #10, and it is what makes the FERPA/COPPA conversation a paragraph instead of a review.

## 9.9 Updating during a term

`docs/RELEASE-POLICY.md`, in three rules:

1. **Within a school term, content changes are additive only.** New flags take new indices; existing indices never move; `L511` enforces it.
2. **A change that must break passport codes bumps the code `version` nibble**, and the passport screen then says *"That code is from an earlier version of the game"* and offers a fresh start at the beginning of the current act — never a silent partial load.
3. **Deploys are announced in the repo's release notes with the `BUILD_ID`,** which the game shows in the letterbook's endpapers. When a teacher reports a bug, the first question has an answer on screen.

---

# 10. REPO STRUCTURE

```
washington/
├── README.md                       what this is, how to run it, how to lint content
├── package.json  package-lock.json  tsconfig.json  vite.config.ts
├── .github/workflows/ci.yml        lint · typecheck · test · build · budget · deploy
│
├── docs/                           the design documents. 00 brief … 06 this file.
│   ├── 00-original-brief.md
│   ├── 02-art-direction.md
│   ├── 04-scene-architecture.md
│   ├── 06-technical-architecture.md
│   ├── ART-PROVENANCE.md           art guide §7.3 — AI disclosure, corpus, licences
│   ├── BUILD-PROVENANCE.md         generated; node/os/dep hashes
│   └── RELEASE-POLICY.md           §9.9
│
├── reference/                      the three Phase-1 research documents
│
├── schemas/                        JSON Schema 2020-12. THE SOURCE OF TRUTH for content.
│   ├── scene.schema.json  dialogue.schema.json  decision.schema.json
│   ├── council.schema.json  document.schema.json  beats.schema.json
│   ├── letter.schema.json  rig.schema.json  clips.schema.json
│   ├── flags.schema.json  act.schema.json  common.schema.json   ← condition/effect grammar
│
├── content/                        ALL authored content. No code. Hand-edited.
│   ├── flags.json  flags.lock  voices.json  glossary.json
│   ├── state-init.json  time-skips.json
│   ├── rigs/           *.rig.json · clips.json
│   └── acts/
│       ├── a01/
│       │   ├── act.json            entry scene, gilt frame, interlude, entry fixture
│       │   ├── scenes/             a01_s01.json … a01_s04.json
│       │   ├── dialogue/           dlg_*.json
│       │   ├── decisions/          dec_*.json
│       │   ├── council/            cnc_*.json
│       │   ├── documents/          doc_*.json
│       │   ├── beats/              beat_*.json
│       │   ├── letters/            let_*.json
│       │   └── prose/              text_keys.json    long-form resolution/examine text
│       └── a02/ … a08/
│
├── src/
│   ├── main.ts                     boot, feature detect, slot picker, Director
│   ├── gfx/                        NO Math.random, NO clock reads (ESLint-enforced)
│   │   ├── Renderer.ts             targets, MRT, resolution policy
│   │   ├── LayerStack.ts           §2.3 parallax correction
│   │   ├── Composite.ts            §2.6 the two passes
│   │   ├── Puppet.ts               §3.5
│   │   ├── MapTable.ts             §2.8
│   │   ├── GiltFrame.ts            §2.9
│   │   └── shaders/                layer.vert/frag · composite_b/c.frag · map.vert/frag
│   ├── scene/
│   │   ├── Director.ts             the state machine (§4.2), the ONLY caller of load/dispose
│   │   ├── SceneRuntime.ts  InterludeRuntime.ts
│   │   ├── Walkplane.ts  Targeting.ts  Transitions.ts
│   ├── state/
│   │   ├── types.ts  store.ts  effects.ts  conditions.ts   ← the 90-line evaluator
│   │   ├── mood.ts                 W, bands, hysteresis (02 §3.2)
│   │   ├── passport.ts             §7.2 codec
│   │   ├── autosave.ts             §7.3
│   │   └── migrations/
│   ├── content/
│   │   ├── loader.ts  index.ts  types.gen.ts (generated — do not edit)
│   ├── audio/AudioBus.ts  Spots.ts
│   ├── ui/                         DOM only. No Three.js imports permitted here.
│   │   ├── DialoguePanel.ts  CouncilBand.ts  OptionList.ts
│   │   ├── Letterbook.ts  DocumentViewer.ts  Glossary.ts
│   │   ├── PassportScreen.ts  TitleScreen.ts  GlyphLayer.ts
│   │   └── styles/                 CSS custom properties, --ui-scale (04 §8.1)
│   └── dev/                        overlay, W readout, free-cam — STRIPPED by define
│
├── tools/
│   ├── lint/                       §6
│   ├── rig/export.mjs              §3.3 Krita layer stack → atlas + rig.json
│   ├── bake/                       toktx · cwebp · opusenc · LUT strip → 3D data
│   ├── budget.mjs                  §9.1 step 6
│   └── verify-ledger.mjs           art guide §6.6
│
├── tests/
│   ├── unit/                       vitest
│   ├── fixtures/
│   │   ├── broken-content/         ~50 files, each triggering exactly one lint rule
│   │   └── passport-golden.json    committed encoder vectors
│   ├── e2e/                        playwright: smoke, offline, throttled perf
│   └── visual/                     DOM-layer golden screenshots only
│
├── public/
│   ├── sw.js                       §4.4
│   ├── fonts/                      self-hosted WOFF2 subsets
│   └── unsupported.html            §9.7
│
└── art/                            per the AI art guide §6.1 — Git LFS
    ├── corpus/  models/  graphs/  prompts/  refs/  blockout/  raw/  work/  dist/
    ├── qa/silhouettes/             §3.3 step 5
    └── ledger.jsonl
```

Three boundaries worth naming because they are enforced and will otherwise erode:

- **`content/` contains no code and `src/` contains no content.** A string a student reads lives in `content/`. Always.
- **`src/ui/` may not import `three`; `src/gfx/` may not touch the DOM.** The dialogue layer is DOM (04 §6.1) and keeping the import graph honest is what guarantees it stays testable without a GPU.
- **`schemas/` is upstream of `src/content/types.gen.ts`.** Editing the generated file is a lint error.

---

# 11. TESTING

## 11.1 What is worth testing in a game like this

Three properties make something worth a test here: **it is pure**, **it is high-consequence**, and **it is invisible when broken**. Rendering fails all three — a broken shader is obvious in half a second and a screenshot test of a watercolour composite would be a flaky maintenance tax. The linter, the state machine, the save codec and the condition evaluator pass all three, and they are where every test-hour goes.

## 11.2 Unit and property tests (vitest)

**The linter's own test suite is the most important one in the project.** `tests/fixtures/broken-content/` contains ~50 deliberately broken content files, one per rule, each asserting that *exactly* that rule fires and no other. Adding a rule without adding its fixture fails a meta-test that compares the rule registry to the fixture directory. This is what stops the linter from silently rotting into a thing that passes everything.

| Target | Kind | What is asserted |
|---|---|---|
| **Condition evaluator** | table + property | ~120 table cases across all 8 leaves and 3 combinators. Properties (fast-check, 10k cases each): purity (same input → same output, no state mutation); `all([])` is true and `any([])` is false; `none(X) === !any(X)`; total (never throws on any schema-valid condition). |
| **Effect applicator** | table + property | Clamping at 0 and 127 from both directions; order-dependence of summed deltas; `flags` then `unflags` in one effect leaves the flag clear; idempotence of setting a set flag. |
| **Passport codec** | property + golden | **Round trip**: 10k random valid states encode→decode to an identical state. **Mutation**: for 5k random codes, flip one character to a different valid character — decode must reject, asserted at **100%** (the CRC's burst guarantee makes this exact, not statistical). Transpose two adjacent characters — reject at 100%. Truncate/extend — reject. **Golden vectors**: 8 committed states must encode to their committed strings byte-for-byte. |
| **Flag registry** | golden | A hash of the ordered `(index, id)` pairs, committed. Any reordering fails with a message pointing at `L511` and §7.4. |
| **Mood controller `W`** | table | Act 3 never exceeds 0.40 and Act 5 never exceeds 0.58 for any of 128⁴-sampled stat lines (sampled, not exhaustive); Act 8 is exactly 0.80 always; band hysteresis requires a 0.04 crossing; `W` does not change within a scene. These are R20 asserted at the shader's input. |
| **Scene state machine** | table | Every legal transition path; disposal happens after the incoming first frame and before the crossfade ends; a cut to an unloaded scene degrades to a fade after 500 ms and increments the counter. |
| **Transition grammar** | table | R7: a `fade` is only constructible for a pair in `time-skips.json`; a `cut` throws in dev for a time-skip pair. |
| **Clip sampling** | table | `sample(0.00) === sample(0.04) === sample(0.08)` and `!== sample(0.09)` — i.e. stepped at exactly 12 fps, never interpolated. |
| **Rig composition** | table | A 3-piece synthetic rig's world transforms against hand-computed values; a pivot at the origin produces pure rotation. |
| **Composite order** | golden | A 16×16 offscreen render with known inputs, compared to a committed buffer, asserting the nine uniforms apply in 02 §3.4's exact order. This is the one graphics test worth having, because the order is invisible when wrong and catastrophic. |
| **Walkplane** | property | Arc-length parameterisation is monotonic; `t=0` and `t=1` land on the endpoints; the R9 distance computation matches a brute-force integration to within 1 px. |

## 11.3 Integration smoke (Playwright)

**One path, run on every PR, catching most integration rot:**

```
boot → feature detect passes → title screen interactive
     → Begin → Act 1 scene 1 walkable
     → walk right → glyph appears → Space → examine text renders
     → walk to Knox → converse → council band shows 2–4 voices
     → choose an option → effect applied (assert via the dev state hook)
     → walk to exit → cut → scene 2 resident, scene 1 textures disposed
     → autosave written → reload → resume at scene 2 with identical state
     → open letterbook → 4 ribbons → close
     → passport screen → copy code → clear storage → paste code → identical state
```

Plus **eight boot tests**, one per `?act=N` entry fixture, each asserting the act's first scene loads and its entry state is linter-clean. Those eight are how we know R24 has not been quietly violated by a scene that started reading `previousScene`.

Plus **one offline test**: warm load, `context.setOffline(true)`, reload, play a scene.

Plus **one CSP test**: intercept all requests, fail on any non-origin host (§9.8).

## 11.4 Performance regression

A Playwright run with `--cpu-throttling-rate=4` and a forced-low-power GPU profile, on three representative scenes (a02_s01 dense exterior, a04_s02 night showpiece, a07_mt map table), measuring p95 frame time over 600 frames. **Fails above 22 ms.** Also asserts the two-scene texture residency window stays under 240 ms across a scripted cut.

This is a coarse instrument and it is deliberately coarse: its job is to catch the 40% regression somebody introduces by adding a sixth layer, not to measure a 3% change.

## 11.5 Visual regression: DOM only

Golden screenshots of the **dialogue layer, letterbook and document viewer** at three `--ui-scale` steps and two fonts — 18 images, deterministic, no GPU involved. These catch the real visual regressions: a measure that drifts out of 58–66 ch, a council band that loses its indent, an option list that stops meeting the 44 px touch target.

**No screenshot testing of the diorama.** Float-precision differences between GPUs make it flaky, the art itself churns during production, and a mood shader that is 1/255 different in one channel is not a bug. The composite-order golden test (§11.2) covers the part that is actually fragile.

## 11.6 What is deliberately not tested

- **Prose, tone, and historical accuracy.** Human gates: the Creative Director, and the teaching client's per-act contact-sheet review. §6.9 applies.
- **Whether the art looks right.** The Art Lead's eye, and the seven-plates and silhouette gates.
- **Three.js.** It has its own test suite.
- **The audio mix.** Loudness is checked numerically in the bake (§8.3); whether the Valley Forge bed is *sad enough* is not a CI question.
- **Balance.** Playtest.
- **The shaders' visual output**, beyond composite order. See §11.5.

## 11.7 CI

```
lint (eslint + content linter, SARIF annotations)     ~40 s
typecheck                                             ~25 s
unit + property (vitest)                              ~55 s
build + budget check                                  ~90 s
e2e smoke + offline + CSP (playwright)               ~110 s
visual (DOM goldens)                                  ~35 s
perf (throttled, main branch and release PRs only)   ~180 s
──────────────────────────────────────────────────────────────
PR total (perf excluded)                              ≈ 5 min
```

Under six minutes, because a CI run that takes fifteen is a CI run people learn to ignore.

---

# Appendix A — Overrides against the earlier documents

| # | Source | Original | This document | Why |
|---|---|---|---|---|
| 1 | 04 §1.2.3, §1.3, §9 checks 6–7 | Dialogue authored in **ink**, compiled with **inkjs**; interactables carry a `knot` | Declarative JSON node graphs; interactables carry a `node` | §5.0 — the linter (§6) is not constructible over ink bytecode, and one condition grammar must serve all content types |
| 2 | 04 §1.2.1 | Layers ship at 2048×1152, 12.5% overscan | **L4 ships at 15% overscan**; its runtime offset clamps to ±96 logical px | §2.3 — at 1.55 parallax, 12.5% overscan gives 100 px of margin against a 99 px maximum offset. One pixel is not a margin. |
| 3 | 04 §2.1 | The perspective camera exists so the planes "produce correct relative displacement for free" | Perspective supplies ~25% of the authored parallax; each layer carries a corrective translation `tx = dx(1 − k·d/24)` | §2.3 — the free spread is 3.8×, the authored spread is 15.5×. The camera is still perspective and still fov 28°. |
| 4 | reference analysis §1.5 | Audio encoded **OGG Vorbis**, ~40 bespoke scene beds, ≤12 MB | **Opus/WebM**, **14 shared beds** mapped across 41 scenes, 9.5 MB | §8.2 — Vorbis at the stated bitrates does not fit inside 12 MB; Opus does, with headroom, and shared beds are the art guide's sheet method applied to sound |
| 5 | 04 §8.7 | Accessibility settings "cost 6 bits in the code" | **8 bits** (uiScale 3, font 2, instantText 1, motion 2) | §7.2 — the third motion state (force-on) is needed because `prefers-reduced-motion` cannot be *overridden upward* by a student whose district image sets it globally |
| 6 | 02 §7.5 / 04 §6.3 | — | Stats are **0–127**, not 0–100 | §5.1.2 — the range is the encoding; scaling at the boundary is a rounding-drift bug waiting to happen |

# Appendix B — Open items owned elsewhere

1. **The 14 shared ambient beds** need naming and mapping to all 41 scenes. → audio design doc / act sign-offs.
2. **The eight `?act=N` entry-state fixtures** (§4.7) are authored at act sign-off and are the only place a "typical" stat line is committed. → act design docs.
3. **The bare-category word list for `L415`** (R22 naming) needs its 60 entries agreed with the Narrative Lead before the check can be an error rather than a warning.
4. **MRT mixed attachment formats** (§2.5) must be verified on a real Mali-G72 and a real UHD 600 in week one. If a driver rejects `RedFormat` on attachment 1, the fallback is RGBA8 and +4.4 MB per scene, which fits but should be known rather than discovered.
5. **`VF-MT`** remains the cuttable map table (04 App. A). If it is cut, `beat_a05_supply` moves to scene staging and the map-table count drops to five.
6. **The eight apex scenes** (R12, `L412`'s cap) are nominated per-act at sign-off; the budget is reserved here and the names are not.
7. **The prose bundle format** (`content/acts/aNN/prose/text_keys.json`) is specified only as "keys → strings with typographic runs" in §5.4 and needs the same schema treatment as the rest of §5 before Act 2 authoring begins.
