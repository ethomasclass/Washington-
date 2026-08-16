FIGURE SHEETS — drop generated walk cycles here.

washington-sheet.png
  The sheet the engine looks for. One image, nine columns by three rows:

      col 1 = idle, cols 2..9 = the eight walk phases
      row 1 = front, row 2 = side, row 3 = back

  The generator's own labels ("front", "idle", "1"...) may stay in the margins;
  src/figures.ts trims them off with WASHINGTON_SHEET.margin. It also keys out
  the flat background — sampling the colour from the sheet itself, so a
  regenerated sheet in a slightly different grey-green needs no code change —
  and mirrors the side row, because the renderer walks that cycle to frame-left
  and flips it in the engine to walk the other way.

  Nothing here is required. If the file is missing or will not cut, the engine
  falls back to the procedural figures in art.ts and says nothing. A missing
  asset must never be able to break a class period.

CHECKING THE CUT
  Open /sprites.html. The top section is the cut sheet, frame by frame, at a
  size where the walk can actually be judged. If the frames are clipped, or the
  man drifts up and down the cell as the cycle plays, the grid is mis-measured:
  adjust `margin` in src/figures.ts and reload. That is the only honest way to
  set those numbers.
