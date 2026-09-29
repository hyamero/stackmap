import { describe, expect, it } from 'vitest';
import type { DiagramDraft, Point, Rect } from '@stackmap/core';
import { layoutLanes } from '../src/lanes';

// Property test: random workflows and lifecycles (tones, returns, async, labels, tags, phases, groups, self-loops,
// parallel edges) must always lay out into geometry the viewer can draw honestly.

function generator(seed: number) {
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff), seed / 0x7fffffff);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)]!;
  return (): DiagramDraft => {
    const lanes = Array.from({ length: 2 + Math.floor(rnd() * 4) }, (_, i) => ({ id: `l${i}`, label: `Lane ${i}` }));
    const n = 3 + Math.floor(rnd() * 14);
    const lifecycle = rnd() < 0.3;
    const types = lifecycle ? (['start', 'active', 'waiting', 'decision', 'success', 'failure'] as const) : (['service', 'client', 'queue', 'security'] as const);
    const nodes = Array.from({ length: n }, (_, i) => ({ id: `n${i}`, type: pick(types), lane: pick(lanes).id, card: { title: `N${i}`, ...(rnd() < 0.3 ? { tag: 'tag' } : {}) } }));
    const edges = Array.from({ length: Math.floor(rnd() * n * 2) }, (_, i) => {
      const r = rnd();
      return {
        id: `e${i}`,
        from: pick(nodes).id,
        to: pick(nodes).id,
        ...(rnd() < 0.3 ? { label: pick(['ok', 'retry', 'needs approval', 'timeout']) } : {}),
        ...(r < 0.15 ? { kind: 'return' as const } : r < 0.3 ? { kind: 'async' as const } : {}),
        ...(rnd() < 0.4 ? { tone: pick(['main', 'security', 'error'] as const) } : {}),
      };
    });
    const d: DiagramDraft = { kind: lifecycle ? 'lifecycle' : 'workflow', title: 'fuzz', lanes, nodes, edges };
    if (rnd() < 0.4) {
      const per = Math.ceil(n / 3);
      d.phases = [0, 1, 2].map((i) => ({ id: `p${i}`, label: `P${i}`, nodes: nodes.slice(i * per, (i + 1) * per).map((x) => x.id) })).filter((p) => p.nodes.length);
    }
    return d;
  };
}

const inside = (p: Point, r: Rect) => p.x > r.x + 0.5 && p.x < r.x + r.width - 0.5 && p.y > r.y + 0.5 && p.y < r.y + r.height - 0.5;
const crosses = (a: Point, b: Point, r: Rect) =>
  Math.max(a.x, b.x) > r.x + 0.5 && Math.min(a.x, b.x) < r.x + r.width - 0.5 && Math.max(a.y, b.y) > r.y + 0.5 && Math.min(a.y, b.y) < r.y + r.height - 0.5;

describe('lane layout properties', () => {
  const next = generator(20260930);
  const cases = Array.from({ length: 150 }, next);

  it.each(cases.map((d, i) => [i, d] as const))('random diagram %i lays out soundly', (_i, d) => {
    const out = layoutLanes(d);
    expect(Number.isFinite(out.bounds.width) && Number.isFinite(out.bounds.height)).toBe(true);
    // Columns stay dense: the diagram is never wider than one column per node.
    expect(out.bounds.width).toBeLessThan(144 + d.nodes.length * (176 + 176) + 200);
    const ports = new Map<string, Set<'in' | 'out'>>();
    for (const e of d.edges) {
      const pts = out.edges[e.id]!;
      for (let i = 1; i < pts.length; i++) expect(pts[i]!.x === pts[i - 1]!.x || pts[i]!.y === pts[i - 1]!.y, `${e.id} is orthogonal`).toBe(true);
      for (const [id, r] of Object.entries(out.nodes))
        for (let i = 1; i < pts.length; i++) {
          const own = (i === 1 && id === e.from) || (i === pts.length - 1 && id === e.to);
          if (!own) expect(crosses(pts[i - 1]!, pts[i]!, r), `${e.id} segment ${i} crosses ${id}`).toBe(false);
        }
      for (const [role, p] of [['out', pts[0]!], ['in', pts.at(-1)!]] as const) {
        const key = `${p.x},${p.y}`;
        ports.set(key, (ports.get(key) ?? new Set()).add(role));
      }
    }
    // No point is both where an arrow arrives and where another edge leaves: that would read as two-way.
    expect([...ports].filter(([, roles]) => roles.size > 1).map(([k]) => k)).toEqual([]);
    for (const [id, p] of Object.entries(out.labels ?? {})) for (const [n, r] of Object.entries(out.nodes)) expect(inside(p, r), `label ${id} on ${n}`).toBe(false);
  });
});
