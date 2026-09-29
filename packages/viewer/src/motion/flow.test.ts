import { describe, expect, it } from 'vitest';
import { buildGraph } from '../explore/graph';
import { FLOW, hopFlow, hopRanks, pointAlong, pulseAt, waveFlow } from './flow';

const line = (x: number) => [
  { x, y: 0 },
  { x: x + 100, y: 0 },
];

describe('flow timing', () => {
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

  it('sets a whole diagram off as one wave in reading order', () => {
    const flow = waveFlow([
      { id: 'b', from: 'n', points: line(200), at: 200 },
      { id: 'a', from: 'n', points: line(0), at: 0 },
      { id: 'dot', from: 'n', points: [{ x: 0, y: 0 }], at: 0 },
    ]);
    expect(flow.pulses.map((p) => [p.id, p.delay])).toEqual([
      ['b', FLOW.wave],
      ['a', 0],
    ]);
    expect(flow.period).toBe(FLOW.wave + FLOW.travel);
  });

  it('runs each pulse for `travel` ms per loop, then rests', () => {
    const flow = waveFlow([{ id: 'a', from: 'n', points: line(0), at: 0 }]);
    const [p] = flow.pulses;
    expect(pulseAt(flow, p!, 0)).toEqual({ x: 0, y: 0 });
    expect(pulseAt(flow, p!, FLOW.travel / 2)).toEqual({ x: 50, y: 0 });
    expect(pulseAt(flow, p!, FLOW.travel + 1)).toBeNull();
    expect(pulseAt(flow, p!, flow.period + FLOW.travel / 2)).toEqual({ x: 50, y: 0 });
  });

  it('chains a focused flow hop by hop, squeezing long chains into the span', () => {
    const edges = ['a', 'b', 'c'].map((id, i) => ({ id, from: 'n', points: line(i * 100) }));
    const short = hopFlow(edges, new Map([['a', 0], ['b', 1], ['c', 2]]));
    expect(short.pulses.map((p) => p.delay)).toEqual([0, FLOW.travel, 2 * FLOW.travel]);
    expect(short.period).toBe(3 * FLOW.travel + FLOW.rest);
    const long = hopFlow(edges, new Map([['a', 0], ['b', 1], ['c', 20]]));
    expect(long.pulses.at(-1)!.delay).toBe(FLOW.span);
    // Edges the ranks leave out don't play.
    expect(hopFlow(edges, new Map([['a', 0]])).pulses.map((p) => p.id)).toEqual(['a']);
  });
});

describe('hop ranks', () => {
  //   x ─► a ─► b ─► c,  c ⇢ a (a reply),  b ─► d
  const g = buildGraph(['x', 'a', 'b', 'c', 'd'], [
    { id: 'xa', from: 'x', to: 'a' },
    { id: 'ab', from: 'a', to: 'b' },
    { id: 'bc', from: 'b', to: 'c' },
    { id: 'ca', from: 'c', to: 'a', kind: 'return' },
    { id: 'bd', from: 'b', to: 'd' },
  ]);
  const all = new Set(['xa', 'ab', 'bc', 'ca', 'bd']);

  it('counts hops from the nodes nothing flows into; a reply follows its call', () => {
    expect(Object.fromEntries(hopRanks(g, all, { fallback: 'b' }))).toEqual({ xa: 0, ab: 1, bc: 2, bd: 2, ca: 3 });
  });

  it('starts at `start` when given (a route)', () => {
    expect(Object.fromEntries(hopRanks(g, new Set(['ab', 'bc']), { start: 'a', fallback: 'a' }))).toEqual({ ab: 0, bc: 1 });
  });

  it('falls back to the given node inside a pure cycle', () => {
    const loop = buildGraph(['p', 'q'], [
      { id: 'pq', from: 'p', to: 'q' },
      { id: 'qp', from: 'q', to: 'p' },
    ]);
    expect(Object.fromEntries(hopRanks(loop, new Set(['pq', 'qp']), { fallback: 'q' }))).toEqual({ qp: 0, pq: 1 });
  });

  it('ranks a sequence by time, one message at a time', () => {
    const seq = buildGraph(['u', 'api', 'db'], [
      { id: 'm1', from: 'u', to: 'api' },
      { id: 'm2', from: 'api', to: 'db' },
      { id: 'm3', from: 'db', to: 'api', kind: 'return' },
      { id: 'm4', from: 'api', to: 'u', kind: 'return' },
    ], { timed: true });
    expect(Object.fromEntries(hopRanks(seq, new Set(['m4', 'm2', 'm1']), { fallback: 'u' }))).toEqual({ m1: 0, m2: 1, m4: 2 });
  });
});
