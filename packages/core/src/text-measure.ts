import { FONT_METRICS, type FontFace } from './font-metrics.gen';

/** The faces NodeCard renders text in (Geist Sans 400/500, tabular-digit 500, Geist Mono 400). */
export type { FontFace };

// Outside the inlined Latin subset the browser falls back to system fonts. Measured in Chromium: CJK
// ≈ 1.02em, colour emoji ≈ 1.26em (macOS) / 1.2–1.28em (Noto). Round up so overflow is never missed.
const FALLBACK_EM = 1.1;
const EMOJI_EM = 1.3;
const EMOJI = /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u;

/** Rendered width in CSS px, headless, with pair kerning. */
export function measureText(text: string, face: FontFace, sizePx: number): number {
  const advances: Record<number, number | undefined> = FONT_METRICS.faces[face];
  const kerning: Record<number, number | undefined> = FONT_METRICS.kerning[face];
  const em = FONT_METRICS.unitsPerEm;
  let units = 0;
  let prev = -1;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    const advance = advances[cp] ?? (EMOJI.test(ch) ? EMOJI_EM : FALLBACK_EM) * em;
    // Kerning pairs are ASCII-only, so the packed key never collides.
    units += advance + (prev < 0 || prev > 0x7e ? 0 : (kerning[prev * 0x10000 + cp] ?? 0));
    prev = cp;
  }
  return (units * sizePx) / em;
}
