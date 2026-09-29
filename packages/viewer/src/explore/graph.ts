import type { Rect } from '@stackmap/core';

export interface Graph {
  /** edge ids by source node */
  out: Map<string, string[]>;
  /** edge ids by target node */
  in: Map<string, string[]>;
  ends: Map<string, { from: string; to: string }>;
}

export function buildGraph(nodeIds: string[], edges: { id: string; from: string; to: string }[]): Graph {
  const out = new Map(nodeIds.map((id) => [id, [] as string[]]));
  const inn = new Map(nodeIds.map((id) => [id, [] as string[]]));
  const ends = new Map<string, { from: string; to: string }>();
  for (const e of edges) {
    if (!out.has(e.from) || !inn.has(e.to)) continue;
    out.get(e.from)!.push(e.id);
    inn.get(e.to)!.push(e.id);
    ends.set(e.id, { from: e.from, to: e.to });
  }
  return { out, in: inn, ends };
}

/** The node plus everything upstream of it and everything downstream of it (not sideways). */
export function reachable(g: Graph, start: string): { nodes: Set<string>; edges: Set<string> } {
  const nodes = new Set([start]);
  const edges = new Set<string>();
  const walk = (dir: 'out' | 'in') => {
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const id = queue.shift()!;
      for (const e of g[dir].get(id) ?? []) {
        edges.add(e);
        const next = dir === 'out' ? g.ends.get(e)!.to : g.ends.get(e)!.from;
        if (seen.has(next)) continue;
        seen.add(next);
        nodes.add(next);
        queue.push(next);
      }
    }
  };
  walk('out');
  walk('in');
  return { nodes, edges };
}

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Nearest card whose centre lies in the pressed direction. Off-axis distance counts double, so an
 * aligned card beats a slightly closer diagonal one.
 */
export function neighbourInDirection(rects: Record<string, Rect>, from: string, dir: Direction): string | undefined {
  const c = (r: Rect) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
  const o = c(rects[from]!);
  let best: string | undefined;
  let bestScore = Infinity;
  for (const [id, r] of Object.entries(rects)) {
    if (id === from) continue;
    const p = c(r);
    const [along, across] = dir === 'left' || dir === 'right' ? [p.x - o.x, p.y - o.y] : [p.y - o.y, p.x - o.x];
    const forward = dir === 'right' || dir === 'down' ? along : -along;
    if (forward <= 0) continue;
    const score = forward + 2 * Math.abs(across);
    if (score < bestScore) [best, bestScore] = [id, score];
  }
  return best;
}
