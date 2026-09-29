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

export interface Route {
  from: string;
  to: string;
  /** every node and edge on some directed path from `from` to `to` */
  nodes: Set<string>;
  edges: Set<string>;
  /** one shortest path, as the edges taken in order */
  steps: string[];
  /** no path ran from → to, so this is the one from `to` back to `from` */
  reversed: boolean;
}

function walk(g: Graph, start: string, dir: 'out' | 'in'): Set<string> {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const id = queue.shift()!;
    for (const e of g[dir].get(id) ?? []) {
      const next = dir === 'out' ? g.ends.get(e)!.to : g.ends.get(e)!.from;
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

function directed(g: Graph, a: string, b: string): Omit<Route, 'reversed'> | null {
  if (!g.out.has(a) || !g.out.has(b)) return null;
  const ahead = walk(g, a, 'out');
  if (!ahead.has(b) || a === b) return null;
  const behind = walk(g, b, 'in');
  const nodes = new Set([...ahead].filter((n) => behind.has(n)));
  const edges = new Set([...g.ends].filter(([, e]) => nodes.has(e.from) && nodes.has(e.to)).map(([id]) => id));
  // BFS for one shortest path, over the edges on the route only.
  const via = new Map<string, string>();
  const queue = [a];
  const seen = new Set([a]);
  while (queue.length && !seen.has(b)) {
    const id = queue.shift()!;
    for (const e of g.out.get(id) ?? []) {
      const next = g.ends.get(e)!.to;
      if (!edges.has(e) || seen.has(next)) continue;
      seen.add(next);
      via.set(next, e);
      queue.push(next);
    }
  }
  const steps: string[] = [];
  for (let at = b; at !== a; at = g.ends.get(via.get(at)!)!.from) steps.unshift(via.get(at)!);
  return { from: a, to: b, nodes, edges, steps };
}

/**
 * The route between two nodes along authored edges only (never inferred from the drawing): everything on a
 * directed path from `a` to `b`, or from `b` to `a` when no path runs forward. Null when neither exists.
 */
export function routeBetween(g: Graph, a: string, b: string): Route | null {
  const forward = directed(g, a, b);
  if (forward) return { ...forward, reversed: false };
  const back = directed(g, b, a);
  return back ? { ...back, reversed: true } : null;
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
