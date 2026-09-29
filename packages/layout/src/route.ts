import type { Point, Rect } from '@stackmap/core';

// Orthogonal connector routing for the lane layouts, where ELK doesn't place the nodes. A sparse visibility
// grid (the caller's channel lines plus every node's centre and port stubs), A* over (point, heading) with a
// bend cost, then nudging so unrelated edges sharing a channel run side by side instead of on top of each other.

export type Side = 'left' | 'right' | 'top' | 'bottom';
export interface PortChoice {
  side: Side;
  /** added to the route's cost when this side is used */
  cost: number;
}
export interface RouteRequest {
  id: string;
  from: string;
  to: string;
  /** edges of different tones don't share a port: a trunk would hide which colour goes where */
  tone?: string;
  sources: PortChoice[];
  targets: PortChoice[];
}

/** Distance from a card edge to the first bend: arrowheads and handle dots need a straight run. */
export const STUB = 20;
/** Clearance kept between a route and any card. */
const MARGIN = 12;
const BEND = 48;
/** Extra cost per px for running along a channel another, unrelated edge already uses. */
const SHARED = 1.5;
const TRACK = 8;
/** Cost of a side the request didn't ask for: a last resort, so every edge gets an orthogonal route. */
const ANY_SIDE = 400;
/** Cost of leaving through a side an arrow already enters, or entering one an edge leaves: reads as two-way. */
const OPPOSED = 600;
const SIDES: Side[] = ['right', 'bottom', 'left', 'top'];
/** Cost of sharing a port slot with an edge of another tone: another slot is almost always better. */
const MIXED_TONE = 300;
/** Shortest straight run a nudge may leave at a port (arrowhead + gap). */
const MIN_RUN = 12;

type Dir = 0 | 1 | 2 | 3; // right, down, left, up
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
const SIDE_DIR: Record<Side, Dir> = { right: 0, bottom: 1, left: 2, top: 3 };

const round = (n: number) => Math.round(n * 100) / 100;

/** Port slots per side: the midpoint, then one either side, so edges of different tones leave separately. */
const SLOTS = [0, -1, 1] as const;
type Slot = (typeof SLOTS)[number];
const SLOT_GAP = { horizontal: 28, vertical: 16 };
/** Cost of an off-centre slot: used only when the midpoint is taken by an edge that can't share it. */
const SLOT_COST = 24;

export function portPoint(r: Rect, side: Side, slot: Slot = 0): Point {
  const along = slot * (side === 'top' || side === 'bottom' ? SLOT_GAP.horizontal : SLOT_GAP.vertical);
  switch (side) {
    case 'left':
      return { x: r.x, y: r.y + r.height / 2 + along };
    case 'right':
      return { x: r.x + r.width, y: r.y + r.height / 2 + along };
    case 'top':
      return { x: r.x + r.width / 2 + along, y: r.y };
    case 'bottom':
      return { x: r.x + r.width / 2 + along, y: r.y + r.height };
  }
}
const stubPoint = (r: Rect, side: Side, slot: Slot = 0): Point => {
  const p = portPoint(r, side, slot);
  const d = SIDE_DIR[side];
  return { x: p.x + DX[d]! * STUB, y: p.y + DY[d]! * STUB };
};

const inflate = (r: Rect, m: number): Rect => ({ x: r.x - m, y: r.y - m, width: r.width + 2 * m, height: r.height + 2 * m });
const inside = (p: Point, r: Rect) => p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.height;
/** Whether an axis-aligned segment passes through the rectangle's interior. */
function crosses(a: Point, b: Point, r: Rect): boolean {
  const x0 = Math.min(a.x, b.x);
  const x1 = Math.max(a.x, b.x);
  const y0 = Math.min(a.y, b.y);
  const y1 = Math.max(a.y, b.y);
  return x1 > r.x && x0 < r.x + r.width && y1 > r.y && y0 < r.y + r.height;
}

class Heap {
  private items: [number, number][] = [];
  get size() {
    return this.items.length;
  }
  push(cost: number, state: number) {
    const a = this.items;
    a.push([cost, state]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]![0] <= a[i]![0]) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }
  pop(): [number, number] {
    const a = this.items;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l]![0] < a[m]![0]) m = l;
        if (r < a.length && a[r]![0] < a[m]![0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}

interface Grid {
  pts: Point[];
  /** neighbour point index per direction, -1 when blocked */
  next: Int32Array;
}

function buildGrid(xs: number[], ys: number[], blocked: Rect[]): Grid {
  const X = [...new Set(xs.map(round))].sort((a, b) => a - b);
  const Y = [...new Set(ys.map(round))].sort((a, b) => a - b);
  const pts: Point[] = [];
  const index = new Int32Array(X.length * Y.length).fill(-1);
  for (let j = 0; j < Y.length; j++) {
    for (let i = 0; i < X.length; i++) {
      const p = { x: X[i]!, y: Y[j]! };
      if (blocked.some((r) => inside(p, r))) continue;
      index[j * X.length + i] = pts.length;
      pts.push(p);
    }
  }
  const next = new Int32Array(pts.length * 4).fill(-1);
  const link = (a: number, b: number, dir: Dir) => {
    if (blocked.some((r) => crosses(pts[a]!, pts[b]!, r))) return;
    next[a * 4 + dir] = b;
    next[b * 4 + ((dir + 2) % 4)] = a;
  };
  for (let j = 0; j < Y.length; j++) {
    let prev = -1;
    for (let i = 0; i < X.length; i++) {
      const k = index[j * X.length + i]!;
      if (k < 0) {
        prev = -1;
        continue;
      }
      if (prev >= 0) link(prev, k, 0);
      prev = k;
    }
  }
  for (let i = 0; i < X.length; i++) {
    let prev = -1;
    for (let j = 0; j < Y.length; j++) {
      const k = index[j * X.length + i]!;
      if (k < 0) {
        prev = -1;
        continue;
      }
      if (prev >= 0) link(prev, k, 1);
      prev = k;
    }
  }
  return { pts, next };
}

interface Used {
  from: string;
  to: string;
}
const stepKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
/** Cost of touching a point another, unrelated edge already runs through (a crossing or a merge). */
const CROSS = 40;

interface Port {
  side: Side;
  slot: Slot;
  cost: number;
}

/**
 * Routes every request around `nodes` (and extra `obstacles`, e.g. labels), using `xs`/`ys` as channel lines.
 * Returns each edge's polyline from port to port, first point on the source card, last on the target card.
 */
export function routeEdges(
  nodes: Record<string, Rect>,
  requests: RouteRequest[],
  channels: { xs: number[]; ys: number[] },
  obstacles: Rect[] = [],
): Record<string, Point[]> {
  const xs = [...channels.xs];
  const ys = [...channels.ys];
  for (const r of Object.values(nodes)) {
    for (const slot of SLOTS) {
      const top = stubPoint(r, 'top', slot);
      const left = stubPoint(r, 'left', slot);
      xs.push(top.x);
      ys.push(left.y);
    }
    xs.push(r.x - STUB, r.x + r.width + STUB);
    ys.push(r.y - STUB, r.y + r.height + STUB);
  }
  const blocked = [...Object.values(nodes).map((r) => inflate(r, MARGIN)), ...obstacles];
  const grid = buildGrid(xs, ys, blocked);
  const at = new Map(grid.pts.map((p, i) => [`${p.x},${p.y}`, i]));
  const find = (p: Point) => at.get(`${round(p.x)},${round(p.y)}`);
  const usedSteps = new Map<string, Used[]>();
  const usedPoints = new Map<number, Used[]>();
  const out: Record<string, Point[]> = {};

  // Who uses each port slot: edges may share one only in the same direction and tone (a trunk).
  const slotUse = new Map<string, { role: 'in' | 'out'; tones: Set<string> }>();
  const ports = (choices: PortChoice[], node: string, role: 'in' | 'out', tone: string): Port[] => {
    const listed = new Map(choices.map((c) => [c.side, c.cost]));
    return SIDES.flatMap((side) =>
      SLOTS.map((slot) => {
        const use = slotUse.get(`${node}:${side}:${slot}`);
        const clash = !use ? 0 : use.role !== role ? OPPOSED : use.tones.has(tone) ? 0 : MIXED_TONE;
        return { side, slot, cost: (listed.get(side) ?? ANY_SIDE) + (slot ? SLOT_COST : 0) + clash };
      }),
    );
  };
  const claim = (node: string, port: { side: Side; slot: Slot }, role: 'in' | 'out', tone: string) => {
    const key = `${node}:${port.side}:${port.slot}`;
    const use = slotUse.get(key) ?? { role, tones: new Set<string>() };
    use.tones.add(tone);
    slotUse.set(key, use);
  };

  for (const req of requests) {
    const src = nodes[req.from]!;
    const dst = nodes[req.to]!;
    const tone = req.tone ?? '';
    const starts = ports(req.sources, req.from, 'out', tone).flatMap((c) => {
      const k = find(stubPoint(src, c.side, c.slot));
      return k === undefined ? [] : [{ ...c, k }];
    });
    const goals = new Map<number, Port[]>();
    for (const c of ports(req.targets, req.to, 'in', tone)) {
      const k = find(stubPoint(dst, c.side, c.slot));
      if (k !== undefined) goals.set(k, [...(goals.get(k) ?? []), c]);
    }
    // Fan-out from one card and fan-in to one card share a trunk on purpose; only unrelated edges pay.
    const unrelated = (list: Used[] | undefined) => !!list?.some((u) => u.from !== req.from && u.to !== req.to);
    const path = search(grid, starts, goals, (a, b, len) => (unrelated(usedSteps.get(stepKey(a, b))) ? SHARED * len : 0) + (unrelated(usedPoints.get(b)) ? CROSS : 0));
    if (!path) {
      // Boxed in (every stub blocked): an elbow, which may cross a card but is never diagonal.
      const a = portPoint(src, 'right');
      const b = portPoint(dst, 'left');
      out[req.id] = [a, { x: b.x, y: a.y }, b];
      continue;
    }
    const { points: gridPath, src: from, dst: to } = path;
    claim(req.from, from, 'out', tone);
    claim(req.to, to, 'in', tone);
    const me = { from: req.from, to: req.to };
    gridPath.forEach((k, i) => {
      usedPoints.set(k, [...(usedPoints.get(k) ?? []), me]);
      if (i) usedSteps.set(stepKey(gridPath[i - 1]!, k), [...(usedSteps.get(stepKey(gridPath[i - 1]!, k)) ?? []), me]);
    });
    out[req.id] = [portPoint(src, from.side, from.slot), ...gridPath.map((k) => grid.pts[k]!), portPoint(dst, to.side, to.slot)];
  }
  return out;
}

function search(
  grid: Grid,
  starts: (Port & { k: number })[],
  goals: Map<number, Port[]>,
  extra: (a: number, b: number, len: number) => number,
): { points: number[]; src: Port; dst: Port } | null {
  if (!starts.length || !goals.size) return null;
  const n = grid.pts.length * 4;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const srcOf = new Map<number, Port>();
  const heap = new Heap();
  const goalPts = [...goals.keys()].map((k) => grid.pts[k]!);
  const h = (k: number) => {
    const p = grid.pts[k]!;
    let best = Infinity;
    for (const g of goalPts) best = Math.min(best, Math.abs(g.x - p.x) + Math.abs(g.y - p.y));
    return best;
  };
  for (const s of starts) {
    const state = s.k * 4 + SIDE_DIR[s.side];
    if (s.cost < dist[state]!) {
      dist[state] = s.cost;
      srcOf.set(state, s);
      heap.push(s.cost + h(s.k), state);
    }
  }
  let best: { state: number; cost: number; port: Port } | null = null;
  while (heap.size) {
    const [f, state] = heap.pop();
    if (best && f >= best.cost) break;
    const k = state >> 2;
    const dir = (state & 3) as Dir;
    const g = dist[state]!;
    if (f - h(k) > g + 1e-6) continue;
    for (const c of goals.get(k) ?? []) {
      // Arriving heading into the card costs nothing; any other heading needs one more bend.
      const into = (SIDE_DIR[c.side] + 2) % 4;
      const total = g + c.cost + (dir === into ? 0 : BEND);
      if (!best || total < best.cost) best = { state, cost: total, port: c };
    }
    for (let d = 0 as Dir; d < 4; d = (d + 1) as Dir) {
      if (d === (dir + 2) % 4) continue; // no U-turns in place
      const m = grid.next[k * 4 + d]!;
      if (m < 0) continue;
      const a = grid.pts[k]!;
      const b = grid.pts[m]!;
      const len = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      const cost = g + len + extra(k, m, len) + (d === dir ? 0 : BEND);
      const next = m * 4 + d;
      if (cost < dist[next]! - 1e-9) {
        dist[next] = cost;
        prev[next] = state;
        heap.push(cost + h(m), next);
      }
    }
  }
  if (!best) return null;
  const points: number[] = [];
  let s = best.state;
  let first = s;
  while (s >= 0) {
    points.push(s >> 2);
    first = s;
    s = prev[s]!;
  }
  points.reverse();
  return { points, src: srcOf.get(first)!, dst: best.port };
}

/** Drops repeated points and the middle of straight runs. */
export function simplify(points: Point[]): Point[] {
  const pts = points.filter((p, i) => i === 0 || p.x !== points[i - 1]!.x || p.y !== points[i - 1]!.y);
  return pts.filter((p, i) => {
    if (i === 0 || i === pts.length - 1) return true;
    const a = pts[i - 1]!;
    const b = pts[i + 1]!;
    return !((a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y));
  });
}

interface Seg {
  edge: string;
  i: number;
  /** the fixed coordinate: x for a vertical segment, y for a horizontal one */
  at: number;
  lo: number;
  hi: number;
  src: string;
  dst: string;
}

/**
 * Spreads unrelated edges that run along the same line over parallel tracks, TRACK px apart. Segments of
 * edges that share a source or a target stay merged (a trunk). Segments on a port never move, and a move
 * never shortens a port's straight run below MIN_RUN, so edges still meet their cards square.
 */
export function nudge(routes: Record<string, Point[]>, ends: Record<string, { from: string; to: string }>): Record<string, Point[]> {
  const out: Record<string, Point[]> = Object.fromEntries(Object.entries(routes).map(([k, v]) => [k, simplify(v).map((p) => ({ ...p }))]));
  for (const vertical of [true, false]) {
    const lines = new Map<number, Seg[]>();
    for (const [edge, pts] of Object.entries(out)) {
      for (let i = 1; i + 1 < pts.length - 1; i++) {
        const a = pts[i]!;
        const b = pts[i + 1]!;
        if (vertical ? a.x !== b.x : a.y !== b.y) continue;
        const at = vertical ? a.x : a.y;
        const [lo, hi] = vertical ? [Math.min(a.y, b.y), Math.max(a.y, b.y)] : [Math.min(a.x, b.x), Math.max(a.x, b.x)];
        const seg = { edge, i, at, lo, hi, src: ends[edge]!.from, dst: ends[edge]!.to };
        lines.set(at, [...(lines.get(at) ?? []), seg]);
      }
    }
    for (const segs of lines.values()) {
      if (segs.length < 2) continue;
      // Union segments that overlap and belong to one trunk; then give each cluster of overlapping groups tracks.
      const group = segs.map((_, i) => i);
      const root = (i: number): number => (group[i] === i ? i : (group[i] = root(group[i]!)));
      const overlap = (a: Seg, b: Seg) => Math.min(a.hi, b.hi) - Math.max(a.lo, b.lo) > 0.5;
      for (let a = 0; a < segs.length; a++)
        for (let b = a + 1; b < segs.length; b++) {
          const s = segs[a]!;
          const t = segs[b]!;
          if ((s.edge === t.edge || s.src === t.src || s.dst === t.dst) && overlap(s, t)) group[root(a)] = root(b);
        }
      const roots = [...new Set(segs.map((_, i) => root(i)))];
      const span = new Map(roots.map((r) => [r, { lo: Infinity, hi: -Infinity }]));
      segs.forEach((s, i) => {
        const g = span.get(root(i))!;
        g.lo = Math.min(g.lo, s.lo);
        g.hi = Math.max(g.hi, s.hi);
      });
      const track = new Map<number, number>();
      for (const r of roots) {
        const me = span.get(r)!;
        const taken = new Set(
          roots.filter((o) => track.has(o) && Math.min(span.get(o)!.hi, me.hi) - Math.max(span.get(o)!.lo, me.lo) > 0.5).map((o) => track.get(o)!),
        );
        let t = 0;
        while (taken.has(t)) t++;
        track.set(r, t);
      }
      segs.forEach((s, i) => {
        const t = track.get(root(i))!;
        if (!t) return;
        const off = (t % 2 ? 1 : -1) * Math.ceil(t / 2) * TRACK;
        const pts = out[s.edge]!;
        const axis = vertical ? 'x' : 'y';
        // Moving a point next to a port stretches or shrinks that port's run; keep room for the arrowhead.
        const run = (j: number, port: number) => Math.abs(pts[j]![axis] + off - pts[port]![axis]);
        if ((s.i === 1 && run(1, 0) < MIN_RUN) || (s.i + 1 === pts.length - 2 && run(s.i + 1, pts.length - 1) < MIN_RUN)) return;
        for (const j of [s.i, s.i + 1]) pts[j]![axis] = round(s.at + off);
      });
    }
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, simplify(v)]));
}
