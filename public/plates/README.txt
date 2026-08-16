SCENE PLATES — drop generated scene paintings here.

  vernon.jpg    Mount Vernon, the west front       (MV-01)
  camp.jpg      Cambridge, the camp street         (CB-01)
  parlour.jpg   the headquarters parlour           (CB-02)
  lines.jpg     the lines above Charlestown        (CB-03)

.png and .jpg are both fine. The names are the plate-set names the scenes
already carry, so nothing needs wiring: a scene picks up its painting through
the field it already has.

ONE PAINTING, CUT INTO BANDS. src/scenery.ts slices each image into the layer
stack the renderer parallaxes — sky and far ground, the walkable ground, and a
near-field occluder off the bottom edge. Each band keeps a strip of what lies
behind it, faded out, so when the bands breathe against one another the gap
fills with painted pixels instead of a hole.

The prompt, and the five composition rules the cut depends on, are in
art/prompts/READY-scene-plates-v1.txt. The one that matters most: THE HORIZON
MUST SIT ONE THIRD DOWN and be a clean horizontal, because every other number in
the game is measured from it.

IF THE FIGURES LOOK LIKE THEY ARE FLOATING, the painting's horizon is not where
the cutter thinks it is. Measure where it actually landed as a fraction of the
image height and set `horizon` for that plate set in SCENERY, in src/scenery.ts.
That is the only number that usually needs touching.

Nothing here is required. A missing or unreadable painting leaves the procedural
plates showing and the game runs exactly as before.
