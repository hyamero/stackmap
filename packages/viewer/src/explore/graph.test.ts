import { describe, expect, it } from 'vitest';
import type { Rect } from '@stackmap/core';
import { buildGraph, neighbourInDirection, reachable, routeBetween } from './graph';

const edges = [
  { id: 'ab', from: 'a', to: 'b' },
  { id: 'bc', from: 'b', to: 'c' },
  { id: 'xb', from: 'x', to: 'b' },
  { id: 'cy', from: 'c', to: 'y' },
  { id: 'ca', from: 'c', to: 'a' },
];
const g = buildGraph(['a', 'b', 'c', 'x', 'y', 'lone'], edges);

describe('graph', () => {
  it('indexes incoming and outgoing edges per node', () => {
    expect(g.out.get('b')).toEqual(['bc']);
    expect(g.in.get('b')).toEqual(['ab', 'xb']);
    expect(g.out.get('lone')).toEqual([]);
  });

  it('collects everything upstream and downstream, terminating on cycles', () => {
    const r = reachable(g, 'b');
    expect([...r.nodes].sort()).toEqual(['a', 'b', 'c', 'x', 'y']);
    expect([...r.edges].sort()).toEqual(['ab', 'bc', 'ca', 'cy', 'xb']);
  });

  it('a leaf reaches only its ancestors', () => {
    const r = reachable(g, 'y');
    expect([...r.nodes].sort()).toEqual(['a', 'b', 'c', 'x', 'y']);
    expect(reachable(g, 'lone')).toEqual({ nodes: new Set(['lone']), edges: new Set() });
  });

  it('ignores edges to unknown nodes', () => {
    const h = buildGraph(['a'], [{ id: 'e', from: 'a', to: 'ghost' }]);
    expect(reachable(h, 'a').nodes).toEqual(new Set(['a']));
  });
});

describe('neighbourInDirection', () => {
  const rects: Record<string, Rect> = {
    mid: { x: 400, y: 400, width: 100, height: 50 },
    right: { x: 700, y: 410, width: 100, height: 50 },
    farRightAligned: { x: 1200, y: 400, width: 100, height: 50 },
    upRight: { x: 560, y: 100, width: 100, height: 50 },
    down: { x: 400, y: 700, width: 100, height: 50 },
    left: { x: 50, y: 380, width: 100, height: 50 },
  };

  it('picks the nearest card in the pressed direction, preferring alignment', () => {
    expect(neighbourInDirection(rects, 'mid', 'right')).toBe('right');
    expect(neighbourInDirection(rects, 'mid', 'down')).toBe('down');
    expect(neighbourInDirection(rects, 'mid', 'left')).toBe('left');
    expect(neighbourInDirection(rects, 'mid', 'up')).toBe('upRight');
  });

  it('returns undefined at the edge of the diagram', () => {
    expect(neighbourInDirection(rects, 'farRightAligned', 'right')).toBeUndefined();
  });
});

describe('routeBetween', () => {
  // a → b → c → y, x → b, c → a (a cycle), plus a detour b → d → y
  const r = buildGraph(['a', 'b', 'c', 'd', 'x', 'y', 'lone'], [...edges, { id: 'bd', from: 'b', to: 'd' }, { id: 'dy', from: 'd', to: 'y' }]);

  it('collects every node and edge on a directed walk (loops included), and one shortest path', () => {
    const route = routeBetween(r, 'b', 'y')!;
    expect(route.reversed).toBe(false);
    // a is on the loop b → c → a → b, so a walk from b to y can pass it.
    expect([...route.nodes].sort()).toEqual(['a', 'b', 'c', 'd', 'y']);
    expect([...route.edges].sort()).toEqual(['ab', 'bc', 'bd', 'ca', 'cy', 'dy']);
    expect(route.steps).toHaveLength(2);
  });

  it('runs the other way when only that direction has a path', () => {
    const route = routeBetween(r, 'y', 'x')!;
    expect(route.reversed).toBe(true);
    expect(route.steps).toEqual(['xb', 'bc', 'cy']);
  });

  it('is null between unconnected nodes, a node and itself, or unknown ids', () => {
    expect(routeBetween(r, 'lone', 'a')).toBeNull();
    expect(routeBetween(r, 'a', 'a')).toBeNull();
    expect(routeBetween(r, 'a', 'ghost')).toBeNull();
  });
});
