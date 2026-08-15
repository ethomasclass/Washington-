/**
 * The ground plane, in one place.
 *
 * Three things need this curve and they have to agree exactly:
 *
 *   - the renderer, which walks figures over it;
 *   - the plate painter, which paints the things they walk between;
 *   - the content linter, which checks two figures do not land on top of
 *     each other once depth has compressed the frame.
 *
 * Three private copies of these numbers is how you end up with an avenue of
 * hedges that the player walks straight through.
 */

export const VIEW_W = 16;
export const VIEW_H = 9;

/** Where the horizon sits, as a fraction of frame height. Locked project-wide. */
export const HORIZON = 0.34;

/**
 * Plates are drawn 14% wider than the view so they have room to slide for
 * parallax without showing an edge. Anything converting between plate pixels
 * and view units has to pay this.
 */
export const OVERSCAN = 1.14;

/** View-space y of the near edge of walkable ground. */
export const NEAR_Y = -3.45;
/** World height of a figure at scale 1. */
export const FIGURE_H = 2.6;
/** A character cutout is this fraction of its height wide. */
export const FIGURE_ASPECT = 0.46;

export const NEAR_SCALE = 1.0;

/**
 * How far up the frame the far edge of the walkable band sits, as a fraction of
 * the way from the near edge to the horizon.
 *
 * This is the number that makes the perspective honest. On a real ground plane
 * a figure's on-screen height is proportional to how far below the horizon his
 * feet are — walk twice as far up the picture and you are half the size. The
 * old curve set scale and vertical position from the same easing but through
 * *different* functions: an affine scale with a 0.46 floor against a lift that
 * ran all the way to the horizon. The ratio between them climbed fourfold
 * across the walkable band, so a figure rose toward the horizon far faster than
 * he shrank, and the eye reads that immediately as wrong without being able to
 * name it.
 *
 * Now scale and lift are the same quantity, so the relationship is exact by
 * construction. The cost is that the walkable band no longer runs to the
 * horizon — it stops 30% of the way up, because that is what it takes to keep a
 * figure at the back both correctly proportioned and big enough to read. Going
 * lower shrinks him further and buys vertical room; going higher flattens the
 * effect back toward the old mistake.
 */
export const FAR_LIFT = 0.30;

/** Derived, not chosen: what NEAR_SCALE times the far lift comes to. */
export const FAR_SCALE = NEAR_SCALE * FAR_LIFT;

/**
 * How much the walkable width narrows toward the horizon.
 *
 * A true one-point perspective would take this to zero at the vanishing point.
 * It stops short because a figure that converges all the way becomes
 * unclickable and unreadable — but it stops a good deal shorter than it used
 * to. At 0.40 the ground read as a shallow shelf and the painted architecture
 * could not converge with it; at 0.22 the lawn reads as a corridor running away
 * from the viewer, which is the whole staging trick of the period plates.
 *
 * The floor is set by the content, not by taste: below about 0.12 the existing
 * scenes start drawing two figures on top of each other at the back. The linter
 * measures this, so the number can be moved with evidence rather than nerve.
 *
 * Was 0.22, chosen to make a formal avenue converge hard. That avenue is gone —
 * the scenes are staged as working ground now, which wants a shallower, less
 * funnelled space — so this comes back up to 0.30. Still a good deal deeper than
 * the 0.40 it started at, and it buys back width for placing figures at the back.
 */
export const FAR_SPREAD = 0.30;

/**
 * How much of the frame the walkable band spans at the near edge.
 *
 * Was 0.94, which left the player able to cross only 76% of the picture — a
 * band with 127 pixels of dead ground at each side that he could see but never
 * reach. 1.12 opens that to 90% and still leaves him clear of the frame edge
 * with a figure's half-width to spare; 1.18 puts his shoulder off the picture.
 *
 * Painted ground furniture goes through the same projection, so it follows on
 * its own. Only the buildings, which are placed by plate column, hold still.
 */
export const BAND_WIDTH = 1.12;

/** The lawn falls away west toward the river. */
export const SLOPE = 0.22;

/** Easing on depth. Vertical placement and scale both come off this one curve. */
export const EASE = 1.55;

export interface GroundPos {
  x: number;
  z: number;
}

export const horizonY = (): number => VIEW_H / 2 - HORIZON * VIEW_H;

/** 1 at the near edge, 0 at the horizon. */
export const ease = (z: number): number => Math.pow(1 - z, EASE);

/** How much of the full frame width the walkable band spans at depth z. */
export const spreadAt = (z: number): number => FAR_SPREAD + (1 - FAR_SPREAD) * ease(z);

/**
 * How far the ground at depth z sits below the horizon, as a fraction of the
 * near edge's distance below it. Scale and vertical placement both come off
 * this one number, which is what makes them agree.
 */
export const liftAt = (z: number): number => FAR_LIFT + (1 - FAR_LIFT) * ease(z);

/** How large a figure is drawn at depth z. Proportional to the lift, exactly. */
export const scaleAt = (z: number): number => NEAR_SCALE * liftAt(z);

/** View-space position of a ground point: x, and the y of whatever stands on it. */
export function groundView(pos: GroundPos): { x: number; y: number; scale: number } {
  const l = liftAt(pos.z);
  const x = (pos.x - 0.5) * VIEW_W * BAND_WIDTH * spreadAt(pos.z);
  const y = horizonY() + (NEAR_Y - horizonY()) * l - SLOPE * (0.5 - pos.x) * l;
  return { x, y, scale: scaleAt(pos.z) };
}

/**
 * The same ground point in plate pixels, so painted scenery can be laid out on
 * the curve the actors actually walk. This is what lets an avenue of hedges
 * have a player walking down the middle of it rather than through the side.
 */
export function platePx(pos: GroundPos, w: number, h: number): { x: number; y: number; scale: number } {
  const v = groundView(pos);
  return {
    x: (v.x / (VIEW_W * OVERSCAN) + 0.5) * w,
    y: (0.5 - v.y / (VIEW_H * OVERSCAN)) * h,
    scale: v.scale,
  };
}

/**
 * Half the on-screen width of a figure at depth z, in frame widths. Used by the
 * linter to tell whether two people overlap once projected.
 */
export const figureHalfW = (z: number): number =>
  (scaleAt(z) * FIGURE_H * FIGURE_ASPECT) / VIEW_W / 2;

/** Horizontal position in frame widths, measured from the centre. */
export const frameX = (x: number, z: number): number => (x - 0.5) * BAND_WIDTH * spreadAt(z);

/**
 * The inverse of platePx's y: what depth a given plate row stands at.
 *
 * Needed whenever something painted has to agree with something else painted —
 * an avenue that terminates at a doorstep, a fence that meets a wall. Placing
 * the two by eye is how you end up with a row of hedges running across the
 * front of the house it was supposed to lead to.
 *
 * Exact on the centre line, where the cross-slope term vanishes.
 */
export function zAtPlateY(y: number, h: number): number {
  const v = (0.5 - y / h) * VIEW_H * OVERSCAN;
  const lift = (v - horizonY()) / (NEAR_Y - horizonY());
  const f = (lift - FAR_LIFT) / (1 - FAR_LIFT);
  return 1 - Math.pow(Math.min(1, Math.max(0, f)), 1 / EASE);
}

/**
 * The inverse of platePx's x: what ground x a plate column sits at, at depth z.
 *
 * The companion to zAtPlateY. Between them, "put this on the ground under that
 * painted building" becomes a calculation instead of a guess.
 */
export function xAtPlateX(px: number, z: number, w: number): number {
  return 0.5 + ((px / w - 0.5) * OVERSCAN) / (BAND_WIDTH * spreadAt(z));
}

/**
 * How tall a standing man is, in plate pixels, at a given plate row.
 *
 * The unit painted structures should be measured in. A wedge tent's ridge is
 * about a man's height; a lean-to you crawl into is a bit under one. Sizing
 * them by eye instead produced a camp of tents a third of a man tall, which
 * read as kennels and made the whole scene look like it was being viewed from
 * far away rather than stood in.
 */
export function figureAtPlateY(y: number, h: number): number {
  // Straight from the geometry: height below the horizon, times a constant.
  // Clamped at the top so scenery painted above the walkable band still gets a
  // sane unit rather than zero.
  const v = (0.5 - y / h) * VIEW_H * OVERSCAN;
  const lift = Math.max(FAR_LIFT * 0.5, (v - horizonY()) / (NEAR_Y - horizonY()));
  return NEAR_SCALE * lift * FIGURE_H * (h / (VIEW_H * OVERSCAN));
}
