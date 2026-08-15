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
export const FAR_SCALE = 0.46;

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
 */
export const FAR_SPREAD = 0.22;

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

/** How large a figure is drawn at depth z. */
export const scaleAt = (z: number): number => FAR_SCALE + (NEAR_SCALE - FAR_SCALE) * ease(z);

/** View-space position of a ground point: x, and the y of whatever stands on it. */
export function groundView(pos: GroundPos): { x: number; y: number; scale: number } {
  const f = ease(pos.z);
  const x = (pos.x - 0.5) * VIEW_W * 0.94 * spreadAt(pos.z);
  const y = horizonY() + (NEAR_Y - horizonY()) * f - SLOPE * (0.5 - pos.x) * f;
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
export const frameX = (x: number, z: number): number => (x - 0.5) * 0.94 * spreadAt(z);
