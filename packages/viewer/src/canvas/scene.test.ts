import { describe, expect, it } from 'vitest';
import type { LaidOutDiagram } from '@stackmap/core';
import { groupedPlatformLayout } from '../samples/grouped-platform.layout';
import { toScene } from './scene';

const nested: LaidOutDiagram = {
  draft: {
    kind: 'architecture',
    title: 'nested',
    groups: [
      { id: 'inner', label: 'Inner', parent: 'outer' },
      { id: 'outer', label: 'Outer' },
    ],
    nodes: [{ id: 'a', type: 'service', group: 'inner', card: { title: 'a' } }],
    edges: [],
  },
  nodes: { a: { x: 60, y: 120, width: 280, height: 64 } },
  groups: { inner: { x: 40, y: 80, width: 320, height: 130 }, outer: { x: 20, y: 30, width: 360, height: 200 } },
  edges: {},
  bounds: { width: 420, height: 270 },
};

describe('toScene', () => {
  const scene = toScene(groupedPlatformLayout);

  it('emits one frame per group at its laid-out rect', () => {
    expect(scene.frames).toHaveLength(groupedPlatformLayout.draft.groups!.length);
    const data = scene.frames.find((f) => f.id === 'data-tier')!;
    expect(data.rect).toEqual(groupedPlatformLayout.groups['data-tier']);
    expect(data.label).toBe('Data tier');
  });

  it('parents paint before children, whatever order groups are listed in', () => {
    const { frames } = toScene(nested);
    expect(frames.map((f) => [f.id, f.depth])).toEqual([
      ['outer', 0],
      ['inner', 1],
    ]);
  });

  it('rejects a parent cycle instead of looping', () => {
    const cyclic: LaidOutDiagram = {
      ...nested,
      draft: {
        ...nested.draft,
        groups: [
          { id: 'inner', label: 'Inner', parent: 'outer' },
          { id: 'outer', label: 'Outer', parent: 'inner' },
        ],
      },
    };
    expect(() => toScene(cyclic)).toThrow("Group 'inner' has a parent cycle");
  });

  it('places cards at their rects and marks which sides have edges', () => {
    const db = scene.cards.find((c) => c.node.id === 'db')!;
    expect(db.rect).toEqual(groupedPlatformLayout.nodes.db);
    const sides = (id: string) => {
      const { hasIn, hasOut } = scene.cards.find((c) => c.node.id === id)!;
      return { hasIn, hasOut };
    };
    expect(sides('web')).toEqual({ hasIn: false, hasOut: true });
    expect(sides('gw')).toEqual({ hasIn: true, hasOut: true });
    expect(sides('stripe')).toEqual({ hasIn: true, hasOut: false });
  });

  it('precomputes edge paths, kinds and label midpoints from the baked points', () => {
    const e5 = scene.edges.find((e) => e.id === 'e5')!;
    expect(e5).toMatchObject({ from: 'orders-svc', to: 'jobs', kind: 'async', label: 'enqueue' });
    expect(e5.points).toEqual(groupedPlatformLayout.edges.e5);
    expect(e5.path.startsWith('M ')).toBe(true);
    expect(e5.mid).toBeDefined();
    const e2 = scene.edges.find((e) => e.id === 'e2')!;
    expect(e2.kind).toBe('sync');
    expect(e2.mid).toBeUndefined();
  });

  it('content is the union of card and frame rects, not the padded layout bounds', () => {
    const { content } = toScene(nested);
    expect(content).toEqual({ x: 20, y: 30, width: 360, height: 200 });
  });

  it('fails loudly when the layout is missing an element', () => {
    expect(() => toScene({ ...groupedPlatformLayout, nodes: {} })).toThrow("No layout for node 'web'");
    expect(() => toScene({ ...groupedPlatformLayout, groups: {} })).toThrow("No layout for group 'edge-tier'");
    expect(() => toScene({ ...groupedPlatformLayout, edges: {} })).toThrow("No layout for edge 'e1'");
  });
});
