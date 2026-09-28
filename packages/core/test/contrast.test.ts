import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../src/contrast';

describe('contrast', () => {
  it('black on white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('is symmetric and 1:1 for identical colors', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });

  it('matches the WCAG reference for #767676 on white (4.54)', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });

  it('rejects anything that is not #rrggbb', () => {
    expect(() => relativeLuminance('#fff')).toThrow('Expected #rrggbb');
    expect(() => relativeLuminance('red')).toThrow('Expected #rrggbb');
  });
});
