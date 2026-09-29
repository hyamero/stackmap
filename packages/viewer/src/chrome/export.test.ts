import { describe, expect, it } from 'vitest';
import { CANVAS_AREA_MAX, CANVAS_MAX, effectiveScale, exportFileName, pointAlong, videoExtension } from './export';

describe('export', () => {
  it('keeps the requested scale while the canvas fits', () => {
    expect(effectiveScale(2000, 1000, 2)).toBe(2);
    expect(effectiveScale(CANVAS_MAX, 10, 1)).toBe(1);
  });

  it('scales down so the longest side stays within the browser canvas limit', () => {
    for (const [w, h, scale] of [[2344, 18636, 1], [2344, 18636, 2], [10000, 500, 2]] as const) {
      const s = effectiveScale(w, h, scale);
      expect(Math.max(w, h) * s).toBeLessThanOrEqual(CANVAS_MAX);
      expect(w * s * h * s).toBeLessThanOrEqual(CANVAS_AREA_MAX + 1e-6);
      expect(s).toBeLessThan(scale);
    }
  });

  it("also stays within WebKit's canvas area limit (~16.7 Mpx)", () => {
    const s = effectiveScale(6000, 6000, 2);
    expect(6000 * s * (6000 * s)).toBeLessThanOrEqual(CANVAS_AREA_MAX);
    expect(effectiveScale(1000, 800, 2)).toBe(2);
  });

  it('names files after the title', () => {
    expect(exportFileName('Commerce API', 'png')).toBe('commerce-api.png');
    expect(exportFileName('  !!  ', 'svg')).toBe('diagram.svg');
  });
});

describe('video helpers', () => {
  it('finds the point a fraction of the way along a polyline', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 30 },
    ];
    expect(pointAlong(pts, 0)).toEqual({ x: 0, y: 0 });
    expect(pointAlong(pts, 0.25)).toEqual({ x: 10, y: 0 });
    expect(pointAlong(pts, 0.5)).toEqual({ x: 10, y: 10 });
    expect(pointAlong(pts, 2)).toEqual({ x: 10, y: 30 });
  });

  it('names the file after the container', () => {
    expect(videoExtension('video/webm;codecs=vp9')).toBe('webm');
    expect(videoExtension('video/mp4')).toBe('mp4');
  });
});
