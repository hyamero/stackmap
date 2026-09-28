import { describe, expect, it } from 'vitest';
import { clampZoom, fitTransform, MAX_ZOOM, MIN_ZOOM, viewportRect } from './viewport';

describe('viewport math', () => {
  it('clamps zoom to [0.2, 2]', () => {
    expect(clampZoom(0.01)).toBe(MIN_ZOOM);
    expect(clampZoom(9)).toBe(MAX_ZOOM);
    expect(clampZoom(1.3)).toBe(1.3);
  });

  it('fits like React Flow: k = min(W / (w·1.15), H / (h·1.15)), content centred', () => {
    const t = fitTransform({ x: 100, y: 50, width: 1000, height: 400 }, { width: 800, height: 600 });
    const k = 800 / (1000 * 1.15);
    expect(t.k).toBeCloseTo(k, 6);
    expect(t.x).toBeCloseTo((800 - 1000 * k) / 2 - 100 * k, 6);
    expect(t.y).toBeCloseTo((600 - 400 * k) / 2 - 50 * k, 6);
  });

  it('clamps the fitted zoom and still centres', () => {
    const t = fitTransform({ x: 40, y: 40, width: 200, height: 100 }, { width: 600, height: 400 });
    expect(t).toEqual({ x: 20, y: 20, k: 2 });
  });

  it('returns identity for a zero-size stage or empty content', () => {
    expect(fitTransform({ x: 0, y: 0, width: 500, height: 300 }, { width: 0, height: 0 })).toEqual({ x: 0, y: 0, k: 1 });
    expect(fitTransform({ x: 0, y: 0, width: 0, height: 0 }, { width: 800, height: 600 })).toEqual({ x: 0, y: 0, k: 1 });
  });

  it('maps the visible stage back into diagram coordinates', () => {
    expect(viewportRect({ x: -100, y: 40, k: 2 }, { width: 800, height: 600 })).toEqual({ x: 50, y: -20, width: 400, height: 300 });
  });
});
