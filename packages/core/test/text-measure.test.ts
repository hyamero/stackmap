import { describe, expect, it } from 'vitest';
import { FONT_METRICS } from '../src/font-metrics.gen';
import { kerningPairs, measureText, textWidths } from '../src/text-measure';

const exact = (t: string, f: Parameters<typeof measureText>[1], size: number) => textWidths(t, f, size).exact;

const { faces } = FONT_METRICS;

describe('measureText', () => {
  it('is zero for an empty string', () => {
    expect(measureText('', 'sans400', 12)).toBe(0);
  });

  it('scales a glyph advance to the font size', () => {
    expect(exact('H', 'sans500', 10)).toBeCloseTo((faces.sans500[72]! * 10) / 1000, 6);
  });

  it('applies the pair kerning between adjacent glyphs', () => {
    const av = kerningPairs('sans400')[65 * 0x10000 + 86]!;
    expect(av).toBeLessThan(0);
    expect(exact('AV', 'sans400', 1000)).toBeCloseTo(faces.sans400[65]! + faces.sans400[86]! + av, 6);
  });

  it('the fractional model scales linearly with size; the Linux one snaps each glyph', () => {
    expect(exact('orders-svc', 'sans400', 24)).toBeCloseTo(2 * exact('orders-svc', 'sans400', 12), 6);
    expect(Number.isInteger(textWidths('orders-svc', 'sans400', 11.5).snapped)).toBe(true);
    expect(measureText('orders-svc', 'sans400', 12)).toBe(Math.max(exact('orders-svc', 'sans400', 12), textWidths('orders-svc', 'sans400', 12).snapped));
  });

  it('measures mono text at a fixed 0.6em per glyph', () => {
    expect(measureText('10.44.0.11', 'mono400', 12)).toBeCloseTo(10 * 0.6 * 12, 6);
  });

  it('measures code points outside the table wide: 1.1em, emoji 1.3em, astral ones counted once', () => {
    expect(exact('数', 'sans400', 10)).toBeCloseTo(11, 6);
    expect(exact('🚀', 'sans400', 10)).toBeCloseTo(13, 6);
    expect(exact('✅', 'sans400', 10)).toBeCloseTo(13, 6);
    expect(exact('🇩🇪', 'sans400', 10)).toBeCloseTo(26, 6);
    expect(exact('a🚀', 'sans400', 10)).toBeCloseTo(13 + (faces.sans400[97]! * 10) / 1000, 6);
  });

  it('gives joiners, variation selectors and combining marks no width of their own', () => {
    // Worst case, a sequence the system font can't join renders as its parts side by side.
    expect(exact('👩‍👩‍👧', 'sans400', 10)).toBeCloseTo(3 * 13, 6);
    expect(exact('❤️', 'sans400', 10)).toBeCloseTo(13, 6);
    expect(exact('a​b', 'sans400', 10)).toBeCloseTo(exact('a', 'sans400', 10) + exact('b', 'sans400', 10), 6);
    expect(exact('é', 'sans400', 10)).toBeCloseTo(exact('e', 'sans400', 10), 6);
  });

  // Linux Chromium snaps every glyph advance to whole pixels and skips kerning; these are the widths it
  // rendered in CI (Playwright v1.63 image). The measure must never come in under either platform.
  it.each([
    ['sans400', 11.5, 'Round robin', 67],
    ['sans400', 12, 'commerce-api-1', 94],
    ['sans400', 12, 'PostgreSQL cluster', 112],
    ['sans400', 12, 'The quick brown fox jumps over the lazy dog', 250],
    ['sans500', 13.5, 'commerce-api-1', 104],
    ['sans500tnum', 15, 'The quick brown fox jumps over the lazy dog', 318],
    ['sans500', 13, 'Primary shards', 92],
    ['sans400', 11.5, 'OpenShip Edge', 83],
    ['sans400', 11.5, 'Open cluster', 69],
    ['sans500', 13, 'OpenShip Edge', 95],
  ] as const)('is never narrower than Linux rendering: %s %spx "%s"', (face, size, text, linux) => {
    expect(measureText(text, face, size)).toBeGreaterThanOrEqual(linux - 0.25);
  });
});
