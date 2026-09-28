import { describe, expect, it } from 'vitest';
import { CANVAS_MAX, effectiveScale, exportFileName } from './export';

describe('export', () => {
  it('keeps the requested scale while the canvas fits', () => {
    expect(effectiveScale(2000, 1000, 2)).toBe(2);
    expect(effectiveScale(CANVAS_MAX, 10, 1)).toBe(1);
  });

  it('scales down so the longest side stays within the browser canvas limit', () => {
    expect(effectiveScale(2344, 18636, 1)).toBeCloseTo(CANVAS_MAX / 18636, 6);
    expect(effectiveScale(2344, 18636, 2)).toBeCloseTo(CANVAS_MAX / 18636, 6);
    expect(effectiveScale(10000, 500, 2) * 10000).toBeLessThanOrEqual(CANVAS_MAX);
  });

  it('names files after the title', () => {
    expect(exportFileName('Commerce API', 'png')).toBe('commerce-api.png');
    expect(exportFileName('  !!  ', 'svg')).toBe('diagram.svg');
  });
});
