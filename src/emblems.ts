/**
 * Council voice emblems.
 *
 * The historical reference pack recommends the council be rendered as engraved
 * emblem vignettes rather than faces: it is period-correct, it removes five
 * consistent faces from the AI generation problem, and it puts the voices in a
 * different material register from the world.
 *
 * These are placeholder line-art stand-ins at UI scale. Drawn as inline SVG so
 * they inherit currentColor and stay crisp at any text size.
 */

import type { VoiceId } from './palette';

const S = (body: string): string =>
  `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" ` +
  `stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const EMBLEM: Record<VoiceId, string> = {
  // A spur — the goad, the thing that drives the horse forward.
  ambition: S(`<circle cx="16" cy="12" r="3.4"/>
    <path d="M16 6.6v-1.6M16 19v-1.6M21.4 12h1.6M9 12h1.6M19.5 8.5l1.1-1.1M19.5 15.5l1.1 1.1"/>
    <path d="M11 7.5C7.5 8.6 5 10.1 5 12s2.5 3.4 6 4.5"/>`),

  // A bridle bit — the restraint you put in the mouth of something powerful.
  restraint: S(`<path d="M7 12h10"/><circle cx="4.6" cy="12" r="2.6"/><circle cx="19.4" cy="12" r="2.6"/>
    <path d="M12 9.4v5.2"/>`),

  // A struck flint — the spark before the powder.
  temper: S(`<path d="M6 15.5l4.5-8 3.2 4.2 2.1-2.4 2.4 6.2z"/>
    <path d="M18.5 6.5l1.8-2M20.6 10.2l2.4-.7M15.6 4.6l.3-2.4"/>`),

  // A hand mirror — how you look to others, held at arm's length.
  vanity: S(`<ellipse cx="12" cy="9" rx="5.2" ry="6"/><path d="M12 15v6.4"/>
    <path d="M9.6 21.4h4.8"/>`),

  // A folded commission — the order that is not yours to refuse.
  duty: S(`<path d="M5 4.5h11.5L19 7v12.5H5z"/><path d="M16.5 4.5V7H19"/>
    <path d="M8 11h8M8 14.5h8"/><circle cx="16.4" cy="17" r="1.6"/>`),
};

/**
 * Lock glyph, for options gated behind an unread primary source.
 *
 * A key rather than a document: Duty's emblem is a folded commission, and at
 * UI scale two rectangles-with-writing are indistinguishable. The shape has to
 * differ, not just the meaning.
 */
export const LOCK_GLYPH = S(`<circle cx="8" cy="8.5" r="4.2"/>
  <path d="M11 11.5L19.5 20M16.5 17l-2.2 2.2M19 14.5l-2 2"/>`);
