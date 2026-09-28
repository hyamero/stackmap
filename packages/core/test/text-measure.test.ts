import { describe, expect, it } from 'vitest';
import { FONT_METRICS } from '../src/font-metrics.gen';
import { measureText } from '../src/text-measure';

const { faces, kerning } = FONT_METRICS;

describe('measureText', () => {
  it('is zero for an empty string', () => {
    expect(measureText('', 'sans400', 12)).toBe(0);
  });

  it('scales a glyph advance to the font size', () => {
    expect(measureText('H', 'sans500', 10)).toBeCloseTo((faces.sans500[72]! * 10) / 1000, 6);
  });

  it('applies the pair kerning between adjacent glyphs', () => {
    const av = kerning.sans400[65 * 0x10000 + 86]!;
    expect(av).toBeLessThan(0);
    expect(measureText('AV', 'sans400', 1000)).toBeCloseTo(faces.sans400[65]! + faces.sans400[86]! + av, 6);
  });

  it('scales linearly with size', () => {
    expect(measureText('orders-svc', 'sans400', 24)).toBeCloseTo(2 * measureText('orders-svc', 'sans400', 12), 6);
  });

  it('measures mono text at a fixed 0.6em per glyph', () => {
    expect(measureText('10.44.0.11', 'mono400', 12)).toBeCloseTo(10 * 0.6 * 12, 6);
  });

  it('measures code points outside the table wide: 1.1em, emoji 1.3em, astral ones counted once', () => {
    expect(measureText('数', 'sans400', 10)).toBeCloseTo(11, 6);
    expect(measureText('🚀', 'sans400', 10)).toBeCloseTo(13, 6);
    expect(measureText('✅', 'sans400', 10)).toBeCloseTo(13, 6);
    expect(measureText('🇩🇪', 'sans400', 10)).toBeCloseTo(26, 6);
    expect(measureText('a🚀', 'sans400', 10)).toBeCloseTo(13 + (faces.sans400[97]! * 10) / 1000, 6);
  });
});
