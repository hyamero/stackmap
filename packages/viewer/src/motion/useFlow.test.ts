import { describe, expect, it } from 'vitest';
import type { DiagramDraft } from '@stackmap/core';
import { emphasis } from '../explore/emphasis';
import { buildGraph } from '../explore/graph';
import { INITIAL, type ExploreState } from '../explore/state';
import type { Scene } from '../canvas/scene';
import { FLOW } from './flow';
import { flowOf } from './useFlow';

//   a ─► b ─► c      d ─► b
const draft: DiagramDraft = {
  kind: 'architecture',
  title: 't',
  nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, type: 'service', card: { title: id } })),
  edges: [
    { id: 'ab', from: 'a', to: 'b' },
    { id: 'bc', from: 'b', to: 'c' },
    { id: 'db', from: 'd', to: 'b' },
  ],
  views: [{ id: 'tail', label: 'Tail', nodes: ['b', 'c'] }],
};
const x = { a: 0, d: 0, b: 300, c: 600 } as Record<string, number>;
const scene = {
  kind: 'architecture',
  direction: 'RIGHT',
  cards: draft.nodes.map((node) => ({ node, rect: { x: x[node.id]!, y: 0, width: 100, height: 50 } })),
  edges: draft.edges.map((e) => ({ ...e, points: [{ x: x[e.from]! + 100, y: 25 }, { x: x[e.to]!, y: 25 }] })),
} as unknown as Scene;
const graph = buildGraph(draft.nodes.map((n) => n.id), draft.edges);
const play = (s: Partial<ExploreState>) => {
  const state = { ...INITIAL, ...s };
  return Object.fromEntries(flowOf(scene, graph, state, emphasis(draft, graph, state)).pulses.map((p) => [p.id, p.delay]));
};

describe('which flow plays', () => {
  it('plays everything as a wave in reading order when nothing is focused', () => {
    expect(play({})).toEqual({ ab: 0, db: 0, bc: FLOW.wave });
  });

  it('plays only what a view shows', () => {
    expect(play({ view: 'tail' })).toEqual({ bc: 0 });
  });

  it('plays a route hop by hop from its start', () => {
    expect(play({ route: { from: 'a', to: 'c' } })).toEqual({ ab: 0, bc: FLOW.travel });
    // No path forward: it runs from the far end back.
    expect(play({ route: { from: 'c', to: 'a' } })).toEqual({ ab: 0, bc: FLOW.travel });
    expect(play({ route: { from: 'a', to: 'd' } })).toEqual({});
  });

  it("plays a selection's connections, and its whole trace when tracing", () => {
    expect(play({ selected: 'c' })).toEqual({ bc: 0 });
    expect(play({ selected: 'c', trace: true })).toEqual({ ab: 0, db: 0, bc: FLOW.travel });
  });
});
