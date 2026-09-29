import { describe, expect, it } from 'vitest';
import type { DiagramDraft, LaidOutDiagram, Point, Rect } from '@stackmap/core';
import { GALLERY } from '@stackmap/core/gallery';
import { assignColumns, backEdges } from '../src/lanes';
import { labelWidth } from '../src/labels';
import { layoutDiagram } from '../src/index';

const inside = (p: Point, r: Rect, pad = 0) => p.x > r.x + pad && p.x < r.x + r.width - pad && p.y > r.y + pad && p.y < r.y + r.height - pad;
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const onBoundary = (p: Point, r: Rect) =>
  p.x >= r.x - 0.5 && p.x <= r.x + r.width + 0.5 && p.y >= r.y - 0.5 && p.y <= r.y + r.height + 0.5 && !inside(p, r, 0.5);
/** Whether an axis-aligned segment runs through the rectangle's interior. */
const crosses = (a: Point, b: Point, r: Rect) =>
  Math.max(a.x, b.x) > r.x + 0.5 && Math.min(a.x, b.x) < r.x + r.width - 0.5 && Math.max(a.y, b.y) > r.y + 0.5 && Math.min(a.y, b.y) < r.y + r.height - 0.5;

const laid = await Promise.all(Object.entries(GALLERY).map(async ([name, d]) => [name, d, await layoutDiagram(d)] as const));

describe.each(laid)('gallery sample %s', (_name, draft: DiagramDraft, out: LaidOutDiagram) => {
  it('places no card on another', () => {
    const rects = Object.entries(out.nodes);
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) expect(overlap(rects[i]![1], rects[j]![1]), `${rects[i]![0]} × ${rects[j]![0]}`).toBe(false);
  });

  it('routes every edge orthogonally from its source card to its target card, through no card', () => {
    for (const e of draft.edges) {
      const pts = out.edges[e.id]!;
      expect(pts.length, e.id).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < pts.length; i++) expect(pts[i]!.x === pts[i - 1]!.x || pts[i]!.y === pts[i - 1]!.y, `${e.id} segment ${i}`).toBe(true);
      expect(onBoundary(pts[0]!, out.nodes[e.from]!), `${e.id} starts on ${e.from}`).toBe(true);
      expect(onBoundary(pts.at(-1)!, out.nodes[e.to]!), `${e.id} ends on ${e.to}`).toBe(true);
      for (const [id, r] of Object.entries(out.nodes)) {
        // The first and last segments leave and enter their own cards; everything else stays outside every card.
        for (let i = 1; i < pts.length; i++) {
          const own = (i === 1 && id === e.from) || (i === pts.length - 1 && id === e.to);
          if (!own) expect(crosses(pts[i - 1]!, pts[i]!, r), `${e.id} segment ${i} crosses ${id}`).toBe(false);
        }
      }
    }
  });

  it('keeps edge labels off the cards', () => {
    for (const [id, p] of Object.entries(out.labels ?? {})) for (const [n, r] of Object.entries(out.nodes)) expect(inside(p, r), `${id} label on ${n}`).toBe(false);
  });

  it('puts every lane node inside its lane, and lanes in draft order', () => {
    if (!out.lanes) return;
    for (const n of draft.nodes) {
      const lane = out.lanes[n.lane!]!;
      const r = out.nodes[n.id]!;
      expect(r.y >= lane.y && r.y + r.height <= lane.y + lane.height, `${n.id} in ${n.lane}`).toBe(true);
    }
    const ys = draft.lanes!.map((l) => out.lanes![l.id]!.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  });

  it('is deterministic', async () => {
    expect(await layoutDiagram(draft)).toEqual(out);
  });
});

const lanes = (over: Partial<DiagramDraft>): DiagramDraft => ({
  kind: 'workflow',
  title: 't',
  lanes: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
  ],
  nodes: [],
  edges: [],
  ...over,
});
const n = (id: string, lane: string) => ({ id, type: 'service' as const, lane, card: { title: id } });

describe('lane columns', () => {
  it('steps right within a lane and drops straight down across lanes', () => {
    const d = lanes({
      nodes: [n('x', 'a'), n('y', 'a'), n('z', 'b')],
      edges: [
        { id: 'xy', from: 'x', to: 'y' },
        { id: 'yz', from: 'y', to: 'z' },
      ],
    });
    expect(Object.fromEntries(assignColumns(d, backEdges(d)))).toEqual({ x: 0, y: 1, z: 1 });
  });

  it('breaks cycles and ignores return edges', () => {
    const d = lanes({
      nodes: [n('x', 'a'), n('y', 'a'), n('z', 'a')],
      edges: [
        { id: 'xy', from: 'x', to: 'y' },
        { id: 'yz', from: 'y', to: 'z' },
        { id: 'zx', from: 'z', to: 'x' },
        { id: 'zy', from: 'z', to: 'y', kind: 'return' },
      ],
    });
    expect([...backEdges(d)].sort()).toEqual(['zx', 'zy']);
    expect(Object.fromEntries(assignColumns(d, backEdges(d)))).toEqual({ x: 0, y: 1, z: 2 });
  });

  it('starts each phase after the previous one ends', () => {
    const d = lanes({
      nodes: [n('x', 'a'), n('y', 'b'), n('z', 'c')],
      phases: [
        { id: 'p', label: 'P', nodes: ['x'] },
        { id: 'q', label: 'Q', nodes: ['y', 'z'] },
      ],
      edges: [{ id: 'xy', from: 'x', to: 'y' }],
    });
    expect(Object.fromEntries(assignColumns(d, backEdges(d)))).toEqual({ x: 0, y: 1, z: 1 });
  });

  it('steps a drop right when a card in a lane between would block it', () => {
    const d = lanes({
      nodes: [n('x', 'a'), n('mid', 'b'), n('z', 'c'), n('w', 'a')],
      edges: [
        { id: 'xw', from: 'x', to: 'w' },
        { id: 'xm', from: 'x', to: 'mid' },
        { id: 'xz', from: 'x', to: 'z' },
      ],
    });
    // mid sits under x (column 0), so x → z steps into column 1, which w already opened.
    expect(Object.fromEntries(assignColumns(d, backEdges(d)))).toEqual({ x: 0, mid: 0, z: 1, w: 1 });
  });

  it('never splits a reply and its call onto one port (no two-way arrows)', async () => {
    const d = lanes({
      nodes: [n('x', 'a'), n('y', 'b')],
      edges: [
        { id: 'go', from: 'x', to: 'y' },
        { id: 'back', from: 'y', to: 'x', kind: 'return' },
      ],
    });
    const out = await layoutDiagram(d);
    const go = out.edges.go!;
    const back = out.edges.back!;
    expect(go[0]).not.toEqual(back.at(-1));
    expect(go.at(-1)).not.toEqual(back[0]);
  });

  it('a later phase reaching an earlier one through an unphased step still lays out compactly', () => {
    const d: DiagramDraft = {
      kind: 'workflow',
      title: 'Agent',
      lanes: [
        { id: 'agent', label: 'Agent' },
        { id: 'tools', label: 'Tools' },
      ],
      phases: [
        { id: 'plan', label: 'Plan', nodes: ['policy'] },
        { id: 'exec', label: 'Execute', nodes: ['tool'] },
      ],
      nodes: [n('tool', 'agent'), n('trace', 'tools'), n('policy', 'agent')],
      edges: [
        { id: 'e1', from: 'tool', to: 'trace' },
        { id: 'e2', from: 'trace', to: 'policy' },
      ],
    };
    const col = assignColumns(d, backEdges(d));
    expect(backEdges(d).has('e2')).toBe(true);
    expect(Math.max(...col.values())).toBeLessThanOrEqual(2);
  });

  it('keeps the labels of a pause/resume pair and of parallel edges apart', async () => {
    const d = lanes({
      nodes: [n('run', 'a'), n('pause', 'a')],
      edges: [
        { id: 'p', from: 'run', to: 'pause', label: 'pause' },
        { id: 'r', from: 'pause', to: 'run', label: 'resume', kind: 'return' },
        { id: 'p2', from: 'run', to: 'pause', label: 'suspend job' },
      ],
    });
    const out = await layoutDiagram(d);
    const pill = (id: string, text: string) => {
      const c = out.labels![id]!;
      const w = labelWidth(text);
      return { x: c.x - w / 2, y: c.y - 10, width: w, height: 20 };
    };
    const pills = [pill('p', 'pause'), pill('r', 'resume'), pill('p2', 'suspend job')];
    const hit = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
    for (let i = 0; i < pills.length; i++) for (let j = i + 1; j < pills.length; j++) expect(hit(pills[i]!, pills[j]!), `${i} × ${j}`).toBe(false);
    expect(out.edges.p).not.toEqual(out.edges.p2);
  });
});
