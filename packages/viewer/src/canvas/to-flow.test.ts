import { describe, expect, it } from 'vitest';
import type { LaidOutDiagram } from '@stackmap/core';
import { groupedPlatformLayout } from '../samples/grouped-platform.layout';
import { toFlow, type CardFlowNode } from './to-flow';

describe('toFlow', () => {
  const { nodes, edges } = toFlow(groupedPlatformLayout);

  it('emits one frame per group, drawn under the cards', () => {
    const frames = nodes.filter((n) => n.type === 'frame');
    expect(frames).toHaveLength(groupedPlatformLayout.draft.groups!.length);
    for (const f of frames) expect(f.zIndex).toBe(0);
    expect(nodes.indexOf(frames.at(-1)!)).toBeLessThan(nodes.findIndex((n) => n.type === 'card'));
  });

  it('places cards at their laid-out rects and never lets users drag or connect', () => {
    const card = nodes.find((n) => n.id === 'db')!;
    const rect = groupedPlatformLayout.nodes.db!;
    expect(card.position).toEqual({ x: rect.x, y: rect.y });
    expect([card.width, card.height]).toEqual([rect.width, rect.height]);
    expect(card.draggable).toBe(false);
    expect(card.connectable).toBe(false);
  });

  it('passes ELK points, kind and label through to routed edges', () => {
    const e5 = edges.find((e) => e.id === 'e5')!;
    expect(e5).toMatchObject({ source: 'orders-svc', target: 'jobs', sourceHandle: 'out', targetHandle: 'in', type: 'routed' });
    expect(e5.data!.points).toEqual(groupedPlatformLayout.edges.e5);
    expect(e5.data!.kind).toBe('async');
    expect(e5.data!.label).toBe('enqueue');
    expect(edges.find((e) => e.id === 'e2')!.data!.kind).toBe('sync');
  });

  it('stacks every edge above the group frames', () => {
    for (const e of edges) expect(e.zIndex, e.id).toBeGreaterThan(0);
  });

  it('marks which sides of each card have edges attached', () => {
    const sides = (id: string) => {
      const { hasIn, hasOut } = (nodes.find((n) => n.id === id) as CardFlowNode).data;
      return { hasIn, hasOut };
    };
    expect(sides('web')).toEqual({ hasIn: false, hasOut: true });
    expect(sides('gw')).toEqual({ hasIn: true, hasOut: true });
    expect(sides('stripe')).toEqual({ hasIn: true, hasOut: false });
  });

  it('fails loudly when the layout is missing an element', () => {
    const broken: LaidOutDiagram = { ...groupedPlatformLayout, nodes: {} };
    expect(() => toFlow(broken)).toThrow("No layout for node 'web'");
  });
});
