import type { Point } from '@stackmap/core';
import type { Graph } from '../explore/graph';

/**
 * Flow playback timing, shared by the live canvas and the video export. A pulse takes `travel` ms to run an
 * edge; a whole diagram sets its pulses off across `wave` ms in reading order; a focused flow chains its hops
 * (each sets off as the one before it arrives), squeezed so the chain never takes longer than `span`.
 */
export const FLOW = { travel: 1200, wave: 1800, span: 4800, rest: 600 } as const;
/** A pulse's look in diagram px, the same on the canvas and in the video: a solid core in a soft halo. */
export const PULSE = { core: 4, halo: 9, haloOpacity: 0.22 } as const;

export interface FlowPulse {
  /** the edge it runs along */
  id: string;
  /** the edge's source node, which tints the pulse */
  from: string;
  points: Point[];
  /** ms into each loop it sets off */
  delay: number;
}

export interface Flow {
  pulses: FlowPulse[];
  /** ms per loop */
  period: number;
}

export const NO_FLOW: Flow = { pulses: [], period: FLOW.wave + FLOW.travel };

interface FlowEdge {
  id: string;
  from: string;
  points: Point[];
}

/** The point `t` (0–1) of the way along a polyline. */
export function pointAlong(points: Point[], t: number): Point {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i]!.x, p.y - points[i]!.y));
  let left = Math.max(0, Math.min(1, t)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i]! || i === lengths.length - 1) {
      const f = lengths[i] ? Math.min(1, left / lengths[i]!) : 0;
      return { x: points[i]!.x + (points[i + 1]!.x - points[i]!.x) * f, y: points[i]!.y + (points[i + 1]!.y - points[i]!.y) * f };
    }
    left -= lengths[i]!;
  }
  return points.at(-1)!;
}

/** Where a pulse is `ms` into playback, or null while it waits for its turn in the loop. */
export function pulseAt(flow: Flow, p: FlowPulse, ms: number): Point | null {
  const t = (((ms - p.delay) % flow.period) + flow.period) % flow.period;
  return t > FLOW.travel ? null : pointAlong(p.points, t / FLOW.travel);
}

const drawable = <T extends FlowEdge>(edges: T[]) => edges.filter((e) => e.points.length > 1);

/** Everything at once: a wave in reading order, `at` being each edge's position along it. */
export function waveFlow(edges: (FlowEdge & { at: number })[]): Flow {
  const usable = drawable(edges);
  const min = Math.min(...usable.map((e) => e.at));
  const range = Math.max(...usable.map((e) => e.at)) - min || 1;
  return {
    pulses: usable.map((e) => ({ id: e.id, from: e.from, points: e.points, delay: ((e.at - min) / range) * FLOW.wave })),
    period: FLOW.wave + FLOW.travel,
  };
}

/** A focused flow: hop by hop from where it starts, `ranks` counting the hops. */
export function hopFlow(edges: FlowEdge[], ranks: ReadonlyMap<string, number>): Flow {
  const usable = drawable(edges).filter((e) => ranks.has(e.id));
  const last = Math.max(0, ...usable.map((e) => ranks.get(e.id)!));
  const step = last ? Math.min(FLOW.travel, FLOW.span / last) : 0;
  return {
    pulses: usable.map((e) => ({ id: e.id, from: e.from, points: e.points, delay: ranks.get(e.id)! * step })),
    period: last * step + FLOW.travel + FLOW.rest,
  };
}

/**
 * How many hops each of `edges` is from where the flow starts: `start` when given, else every node the subset
 * has no forward way into (falling back to `fallback` when it's all one cycle). Replies and roll-backs follow
 * the calls they answer rather than starting anything. A sequence ranks by time instead: one message at a time.
 */
export function hopRanks(g: Graph, edges: ReadonlySet<string>, { start, fallback }: { start?: string; fallback: string }): Map<string, number> {
  const ranks = new Map<string, number>();
  if (g.timed) {
    g.order.filter((id) => edges.has(id)).forEach((id, i) => ranks.set(id, i));
    return ranks;
  }
  const ids = [...edges].filter((id) => g.ends.has(id));
  const forward = ids.filter((id) => !g.returns.has(id));
  const entered = new Set(forward.map((id) => g.ends.get(id)!.to));
  const sources = start ? [start] : [...new Set(forward.map((id) => g.ends.get(id)!.from))].filter((n) => !entered.has(n));
  const depth = new Map((sources.length ? sources : [fallback]).map((n) => [n, 0]));
  // Forward edges first, so a reply never makes its caller look downstream; then anything only a reply reaches.
  for (const usable of [new Set(forward), new Set(ids)]) {
    const queue = [...depth.keys()];
    while (queue.length) {
      const n = queue.shift()!;
      for (const id of g.out.get(n) ?? []) {
        const to = g.ends.get(id)!.to;
        if (!usable.has(id) || depth.has(to)) continue;
        depth.set(to, depth.get(n)! + 1);
        queue.push(to);
      }
    }
  }
  for (const id of ids) ranks.set(id, depth.get(g.ends.get(id)!.from) ?? 0);
  return ranks;
}
