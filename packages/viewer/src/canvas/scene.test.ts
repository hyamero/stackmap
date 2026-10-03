import { describe, expect, it } from 'vitest';
import type { LaidOutDiagram } from '@stackmap/core';
import { galleryLayouts } from '../samples/gallery.layout';
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

// A plus: a horizontal call through the middle of a vertical one, plus a third that only touches the first at its end.
const crossing = (tone?: 'main'): LaidOutDiagram => ({
  draft: {
    kind: 'architecture',
    title: 'crossing',
    nodes: ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, type: 'service' as const, card: { title: id } })),
    edges: [
      { id: 'down', from: 'a', to: 'b', tone },
      { id: 'across', from: 'c', to: 'd' },
      { id: 'joins', from: 'e', to: 'b' },
    ],
  },
  nodes: {
    a: { x: 160, y: 0, width: 80, height: 40 },
    b: { x: 160, y: 260, width: 80, height: 40 },
    c: { x: 0, y: 130, width: 40, height: 40 },
    d: { x: 360, y: 130, width: 40, height: 40 },
    e: { x: 300, y: 200, width: 40, height: 40 },
  },
  groups: {},
  edges: {
    down: [{ x: 200, y: 40 }, { x: 200, y: 260 }],
    across: [{ x: 40, y: 150 }, { x: 360, y: 150 }],
    joins: [{ x: 300, y: 220 }, { x: 200, y: 220 }, { x: 200, y: 260 }],
  },
  bounds: { width: 400, height: 300 },
});

describe('crossings', () => {
  it('breaks the earlier-drawn line where the later crosses it, and nowhere a trunk merely joins', () => {
    const edges = Object.fromEntries(toScene(crossing()).edges.map((e) => [e.id, e.gaps]));
    expect(edges).toEqual({ down: [{ x: 200, y: 150, vertical: true, over: ['across'] }], across: [], joins: [] });
  });

  it('keeps the main flow whole: the plainer line passes under it', () => {
    const edges = Object.fromEntries(toScene(crossing('main')).edges.map((e) => [e.id, e.gaps]));
    expect(edges.down).toEqual([]);
    expect(edges.across).toEqual([{ x: 200, y: 150, vertical: false, over: ['down'] }]);
  });

  it('breaks a lone line, not a trunk, between equals', () => {
    const d = crossing();
    d.draft.edges.push({ id: 'mate', from: 'e', to: 'b' });
    d.edges.mate = [{ x: 300, y: 220 }, { x: 260, y: 220 }, { x: 260, y: 140 }, { x: 200, y: 140 }, { x: 200, y: 260 }];
    const edges = Object.fromEntries(toScene(d).edges.map((e) => [e.id, e.gaps]));
    expect(edges).toMatchObject({ down: [], mate: [], across: [{ x: 200, y: 150, vertical: false }] });
  });

  it('breaks every edge of a trunk through the crossing, even one that joins it just before', () => {
    const d = crossing();
    d.draft.edges[1]!.tone = 'main';
    d.draft.edges.push({ id: 'mate', from: 'e', to: 'b' });
    d.edges.mate = [{ x: 300, y: 220 }, { x: 260, y: 220 }, { x: 260, y: 140 }, { x: 200, y: 140 }, { x: 200, y: 260 }];
    const edges = Object.fromEntries(toScene(d).edges.map((e) => [e.id, e.gaps]));
    expect(edges.down).toEqual([{ x: 200, y: 150, vertical: true, over: ['across'] }]);
    expect(edges.mate).toEqual([{ x: 200, y: 150, vertical: true, over: ['across'] }]);
  });

  it('leaves sequence messages whole', () => {
    expect(toScene(galleryLayouts['cache-miss']!).edges.every((e) => e.gaps.length === 0)).toBe(true);
  });
});

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

  it('places cards at their rects and puts a dot only where an edge meets a card', () => {
    const db = scene.cards.find((c) => c.node.id === 'db')!;
    expect(db.rect).toEqual(groupedPlatformLayout.nodes.db);
    const roles = (id: string) => [...new Set(scene.handles.filter((h) => h.node === id).map((h) => h.role))].sort();
    expect(roles('web')).toEqual(['out']);
    expect(roles('gw')).toEqual(['in', 'out']);
    expect(roles('stripe')).toEqual(['in']);
    const ends = new Set(scene.edges.flatMap((e) => [`${e.points[0]!.x},${e.points[0]!.y}`, `${e.points.at(-1)!.x},${e.points.at(-1)!.y}`]));
    expect(new Set(scene.handles.map((h) => `${h.at.x},${h.at.y}`))).toEqual(ends);
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

  it('lane layouts: lanes, phase headers, compact cards, end states and dots at the route ends', () => {
    const d = galleryLayouts['agent-run']!;
    const lanes = toScene(d);
    expect(lanes.compact).toBe(true);
    expect(lanes.phaseStyle).toBe('header');
    expect(lanes.lanes.map((l) => [l.id, l.tone])).toEqual(d.draft.lanes!.map((l) => [l.id, l.tone]));
    expect(lanes.cards.filter((c) => c.final).map((c) => c.node.id).sort()).toEqual(['cancelled', 'completed', 'expired']);
    // failed has a way out (retry), so it isn't an end state.
    expect(lanes.cards.find((c) => c.node.id === 'failed')!.final).toBe(false);
    const ends = new Set(lanes.edges.flatMap((e) => [`${e.points[0]!.x},${e.points[0]!.y}`, `${e.points.at(-1)!.x},${e.points.at(-1)!.y}`]));
    expect(new Set(lanes.handles.map((h) => `${h.at.x},${h.at.y}`))).toEqual(ends);
    expect(lanes.edges.find((e) => e.id === 'retry')!.kind).toBe('return');
    expect(lanes.edges.find((e) => e.id === 'needs-approval')!.mid).toEqual(d.labels!['needs-approval']);
  });

  it('ELK layouts keep full cards; staged dataflows get bands', () => {
    expect(scene.compact).toBe(false);
    const staged = toScene(galleryLayouts['product-analytics']!);
    expect(staged.phaseStyle).toBe('band');
    expect(staged.compact).toBe(true);
    expect(staged.phases.map((p) => p.id)).toEqual(['sources', 'ingest', 'process', 'store', 'consume']);
  });

  it('sequence: lifelines under every participant, activation bars, text labels, no dots', () => {
    const d = galleryLayouts['cache-miss']!;
    const seq = toScene(d);
    expect(seq.phaseStyle).toBe('time');
    expect(seq.labelStyle).toBe('text');
    expect(seq.handles).toEqual([]);
    expect(seq.lifelines.map((l) => l.node)).toEqual(d.draft.nodes.map((n) => n.id));
    expect(seq.activations.length).toBe(d.sequence!.activations.length);
    // Fit frames the lifelines too, not just the cards at the top.
    const bottom = Math.max(...seq.lifelines.map((l) => l.bottom));
    expect(seq.content.y + seq.content.height).toBeGreaterThanOrEqual(bottom);
  });
});
