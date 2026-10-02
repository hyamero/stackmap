import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Flow } from '../motion/flow';
import { FlowLayer, playingClock, type FlowClock } from './FlowLayer';

const flow: Flow = {
  period: 2000,
  pulses: [
    {
      id: 'ab',
      from: 'a',
      to: 'b',
      kind: 'sync',
      tint: 'service',
      path: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      length: 100,
      delay: 0,
      travel: 500,
      glow: null,
    },
  ],
};

describe('FlowLayer', () => {
  it('draws the frame an outside clock asks for, and nothing when it asks for none', () => {
    let draw: (ms: number | null) => void = () => {};
    const clock: FlowClock = (d) => {
      draw = d;
      return () => {};
    };
    const { container } = render(<FlowLayer flow={flow} width={100} height={10} clock={clock} />);
    const pulse = container.querySelector<SVGGElement>('[data-pulse="ab"]')!;
    const head = container.querySelector<SVGGElement>('[data-part="head"]')!;
    draw(250);
    expect(pulse.style.visibility).toBe('');
    expect(head.getAttribute('transform')).toMatch(/^translate\(75 0\)$/);
    draw(null);
    expect(pulse.style.visibility).toBe('hidden');
  });
});

describe('playingClock', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('runs at the current speed, and a change of speed carries on from where playback is', () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => frames.push(f));
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const at = (now: number) => frames.shift()!(now);
    let speed = 2;
    const drawn: (number | null)[] = [];
    playingClock(() => speed)((ms) => drawn.push(ms));
    at(1000);
    at(1100);
    speed = 0.5;
    at(1300);
    expect(drawn).toEqual([0, 200, 300]);
  });
});
