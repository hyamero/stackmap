import { FONT_METRICS, type FontFace } from './font-metrics.gen';

/** The faces NodeCard renders text in (Geist Sans 400/500, tabular-digit 500, Geist Mono 400). */
export type { FontFace };

/**
 * Rendered width in CSS px, headless, with pair kerning. A code point outside the inlined Latin subset
 * counts as 1em, the width of the full-width CJK fallback.
 */
export function measureText(text: string, face: FontFace, sizePx: number): number {
  const advances: Record<number, number | undefined> = FONT_METRICS.faces[face];
  const kerning: Record<number, number | undefined> = FONT_METRICS.kerning[face];
  let units = 0;
  let prev = -1;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    units += (advances[cp] ?? FONT_METRICS.unitsPerEm) + (prev < 0 ? 0 : (kerning[prev * 0x10000 + cp] ?? 0));
    prev = cp;
  }
  return (units * sizePx) / FONT_METRICS.unitsPerEm;
}
