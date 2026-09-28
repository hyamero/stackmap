import { describe, expect, it } from 'vitest';
import { polylineMidpoint, roundedOrthogonalPath } from '../src/geometry';

describe('roundedOrthogonalPath', () => {
  it('draws a straight segment', () => {
    expect(roundedOrthogonalPath([{ x: 0, y: 0 }, { x: 100, y: 0 }], 8)).toBe('M 0 0 L 100 0');
  });

  it('rounds a bend with a quadratic through the corner', () => {
    const d = roundedOrthogonalPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }], 8);
    expect(d).toBe('M 0 0 L 92 0 Q 100 0 100 8 L 100 100');
  });

  it('clamps the radius to half the shorter adjacent segment', () => {
    const d = roundedOrthogonalPath([{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 100 }], 8);
    expect(d).toBe('M 0 0 L 3 0 Q 6 0 6 3 L 6 100');
  });

  it('drops consecutive duplicate points (ELK section joins)', () => {
    const d = roundedOrthogonalPath([{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }], 8);
    expect(d).toBe('M 0 0 L 42 0 Q 50 0 58 0 L 100 0');
  });

  it('needs at least two distinct points', () => {
    expect(() => roundedOrthogonalPath([{ x: 1, y: 1 }], 8)).toThrow('at least 2 points');
    expect(() => roundedOrthogonalPath([{ x: 1, y: 1 }, { x: 1, y: 1 }], 8)).toThrow('at least 2 points');
  });
});

describe('polylineMidpoint', () => {
  it('finds the point at half the total length', () => {
    expect(polylineMidpoint([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }])).toEqual({ x: 100, y: 0 });
    expect(polylineMidpoint([{ x: 0, y: 0 }, { x: 0, y: 40 }])).toEqual({ x: 0, y: 20 });
  });
});
