/**
 * Painted portraits, and where they come from.
 *
 * 02 §6.1 ships portraits as DOM `<img>` in the overlay layer rather than as
 * GPU textures: zero texture cost, browser-managed decode, and the dialogue UI
 * stays plain accessible HTML.
 *
 * 03b §4.3 generates them **two to a sheet**, paired by shared scene, so that
 * two faces that appear in the same room match by construction in palette,
 * paper tone, ink weight and light. Two and not three or four: a 2-up at
 * 2048×1536 gives each cell exactly the locked 1024×1536 portrait size, and a
 * 3-up either shrinks the cells below spec or pushes the canvas off
 * distribution. So this module's whole job is to say which half of which sheet
 * a given face is, and to hand back a CSS background that shows that half.
 *
 * Nothing here is required for the game to run. Every face falls back to the
 * procedural placeholder until a real sheet is dropped in, and a sheet that is
 * missing at runtime shows the placeholder rather than a broken image.
 */

export type Cell = 'left' | 'right';

export interface PortraitRef {
  /** Sheet file under public/portraits/, or a full URL. */
  sheet: string;
  cell: Cell;
  /** For the alt text. Portraits of real people say who they are. */
  name: string;
}

/**
 * The registry.
 *
 * Keys are the ids scenes use. Add a row when a sheet lands; until then the
 * face is simply absent from this map and the placeholder stands in, which is
 * what every face in the build is doing today.
 *
 * Sheet names follow 03b §4.3's table: `a01_sheet1` is Act 1's first sheet,
 * Martha on the left and Lund on the right.
 */
export const PORTRAITS: Record<string, PortraitRef> = {
  // Sheet 1 — Mount Vernon, May 1775.
  // martha: { sheet: 'a01_sheet1.webp', cell: 'left',  name: 'Martha Washington' },
  // lund:   { sheet: 'a01_sheet1.webp', cell: 'right', name: 'Lund Washington' },
};

/** Where sheets live once they are dropped in. Relative, per the Vite base. */
const DIR = 'portraits/';

/**
 * The CSS for one cell of a 2-up sheet.
 *
 * `background-size: 200% 100%` scales the sheet so one half fills the well;
 * `background-position` then picks which half. No cropping in post, no second
 * asset, and the sheet on disk stays the thing that came out of the generator,
 * which is what makes it checkable against the prompt that produced it.
 */
export function cellStyle(ref: PortraitRef): string {
  const x = ref.cell === 'left' ? '0%' : '100%';
  return (
    `background-image:url(${DIR}${ref.sheet});` +
    `background-size:200% 100%;background-position:${x} 0;`
  );
}

export function portraitFor(id: string | undefined): PortraitRef | null {
  return id ? (PORTRAITS[id] ?? null) : null;
}
