import { describe, expect, it } from 'vitest';
import { transformVars } from '../components/landing/timeline';

describe('board transforms as GSAP properties', () => {
  it('reads the transform functions the boards use', () => {
    expect(transformVars('translateY(-90px)')).toEqual({ y: -90 });
    expect(transformVars('translate(-50%, 12px) scale(0.92)')).toEqual({ xPercent: -50, y: 12, scale: 0.92 });
    expect(transformVars('translateZ(560px)')).toEqual({ z: 560 });
    expect(transformVars('scale(1, 0.5)')).toEqual({ scaleX: 1, scaleY: 0.5 });
  });

  it('turns none into the identity, so a frame can return to rest', () => {
    expect(transformVars('none')).toEqual({ x: 0, y: 0, z: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0 });
  });

  it('keeps a translate written after a tilt inside the tilted frame', () => {
    // GSAP translates before it rotates, so the board's order becomes the same move in world space.
    const v = transformVars('rotateX(58deg) translateY(-20px) scale(0.92)');
    expect(v.rotationX).toBe(58);
    expect(v.y as number).toBeCloseTo(-20 * Math.cos((58 * Math.PI) / 180), 5);
    expect(v.z as number).toBeCloseTo(-20 * Math.sin((58 * Math.PI) / 180), 5);
    expect(v.scale).toBe(0.92);
  });
});
