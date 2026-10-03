import {
  isLaneKind,
  usesCompactCards,
  polylineMidpoint,
  roundedOrthogonalPath,
  type DiagramKind,
  type DiagramNode,
  type Direction,
  type EdgeKind,
  type EdgeTone,
  type LaidOutDiagram,
  type NodeType,
  type Point,
  type Rect,
} from '@stackmap/core';

export const EDGE_RADIUS = 10;

/** Height of a group frame's label band: ELK layouts reserve 48px (GROUP_LABEL_BAND), lane layouts 28px. */
const FRAME_BAND = { elk: 48, lanes: 28 } as const;

export interface SceneFrame {
  id: string;
  label: string;
  rect: Rect;
  depth: number;
  band: number;
  tone?: 'security';
}

export interface SceneLane {
  id: string;
  label: string;
  rect: Rect;
  tone?: 'exception';
}

export interface ScenePhase {
  id: string;
  label: string;
  rect: Rect;
}

export interface SceneCard {
  node: DiagramNode;
  rect: Rect;
  /** lifecycle: an end state (success or failure with no way out) */
  final: boolean;
}

export interface SceneEdge {
  id: string;
  from: string;
  to: string;
  points: Point[];
  path: string;
  kind: EdgeKind;
  tone?: EdgeTone;
  label?: string;
  mid?: Point;
  /** where another edge crosses over this one: the viewer breaks this line there */
  gaps: SceneGap[];
}

/** A crossing on the line that passes under, and whether that line runs vertically there. */
export interface SceneGap {
  x: number;
  y: number;
  vertical: boolean;
  /** the edges passing over */
  over: string[];
}

export interface SceneLifeline {
  node: string;
  type: NodeType;
  x: number;
  top: number;
  bottom: number;
}

export interface SceneActivation {
  node: string;
  type: NodeType;
  rect: Rect;
  depth: number;
}

/** A connection dot where an edge meets a card, tinted by that card's type. */
export interface SceneHandle {
  node: string;
  type: NodeType;
  at: Point;
  role: 'in' | 'out';
}

export interface Scene {
  kind: DiagramKind;
  direction: Direction;
  /** step, state and participant cards instead of full node cards */
  compact: boolean;
  /** lane kinds: headers over columns; architecture/dataflow: stage bands; sequence: time bands */
  phaseStyle: 'header' | 'band' | 'time';
  bounds: { width: number; height: number };
  /** Union of everything drawn except edges — what "fit to screen" frames. */
  content: Rect;
  lanes: SceneLane[];
  phases: ScenePhase[];
  frames: SceneFrame[];
  cards: SceneCard[];
  edges: SceneEdge[];
  /** One dot per place an edge meets a card (edges attach anywhere along a side); none in a sequence. */
  handles: SceneHandle[];
  /** sequence: one lifeline per participant and the activation bars on them */
  lifelines: SceneLifeline[];
  activations: SceneActivation[];
  /** pill: a chip on the line; text: plain text above it (sequence messages) */
  labelStyle: 'pill' | 'text';
}

function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`No layout for ${what}`);
  return value;
}

function union(rects: Rect[]): Rect {
  if (!rects.length) return { x: 0, y: 0, width: 0, height: 0 };
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.width));
  const bottom = Math.max(...rects.map((r) => r.y + r.height));
  return { x, y, width: right - x, height: bottom - y };
}

// A crossing this near a run's end sits on its rounded corner or arrowhead: leave it whole.
const CROSSING_CLEAR = EDGE_RADIUS + 4;
// The main flow outranks any toned edge, which outranks a plain one.
const prominence = (e: SceneEdge) => (e.tone === 'main' ? 2 : e.tone ? 1 : 0);

/**
 * With trunks, a line crossing another can read as a branch joining it; a short break in the line that passes under
 * says it doesn't. Only proper crossings count: where any edge bends, lines meet at a junction instead. Every edge
 * running through a crossing one way breaks there together (a trunk's mates would otherwise show through the gap).
 */
function markCrossings(edges: SceneEdge[]): void {
  // Runs by the line they lie on: vertical ones by x, horizontal ones by y.
  type Run = { k: number; lo: number; hi: number };
  const ups = new Map<number, Run[]>();
  const acrosses = new Map<number, Run[]>();
  const bends = new Set<string>();
  edges.forEach((e, k) => {
    e.points.forEach((p, i) => {
      bends.add(`${p.x},${p.y}`);
      const q = e.points[i + 1];
      if (!q || (p.x === q.x) === (p.y === q.y)) return;
      const [map, at, lo, hi] = p.x === q.x ? [ups, p.x, Math.min(p.y, q.y), Math.max(p.y, q.y)] : [acrosses, p.y, Math.min(p.x, q.x), Math.max(p.x, q.x)];
      map.set(at, [...(map.get(at) ?? []), { k, lo, hi }]);
    });
  });
  const ys = [...acrosses.keys()].sort((a, b) => a - b);
  const through = (runs: Run[] | undefined, v: number) => [...new Set((runs ?? []).filter((r) => r.lo < v && v < r.hi).map((r) => r.k))];
  // The bundle that stays whole: the more prominent, then the busier (break a lone line, not a trunk), then the later.
  const n = edges.length;
  const rank = (bundle: number[]) => Math.max(...bundle.map((k) => prominence(edges[k]!))) * n * n + bundle.length * n + Math.max(...bundle);
  const done = new Set<string>();
  for (const [x, verticals] of ups) {
    for (const v of verticals) {
      // Horizontal lines strictly inside this run, clear of its corners.
      let i = ys.findIndex((y) => y > v.lo + CROSSING_CLEAR);
      for (; i >= 0 && i < ys.length && ys[i]! < v.hi - CROSSING_CLEAR; i++) {
        const y = ys[i]!;
        const key = `${x},${y}`;
        if (done.has(key) || bends.has(key)) continue;
        if (!acrosses.get(y)!.some((h) => h.k !== v.k && h.lo + CROSSING_CLEAR < x && x < h.hi - CROSSING_CLEAR)) continue;
        done.add(key);
        const [down, across] = [through(ups.get(x), y), through(acrosses.get(y), x)];
        const [under, over] = rank(down) < rank(across) ? [down, across] : [across, down];
        for (const k of under) edges[k]!.gaps.push({ x, y, vertical: under === down, over: over.map((o) => edges[o]!.id) });
      }
    }
  }
}

export function toScene(d: LaidOutDiagram): Scene {
  const lanes = isLaneKind(d.draft.kind);
  // Lane layouts leave empty groups out (nothing to frame).
  const groups = (d.draft.groups ?? []).filter((g) => !lanes || d.groups[g.id]);
  const parentOf = new Map(groups.map((g) => [g.id, g.parent]));
  const depthOf = (id: string): number => {
    let depth = 0;
    for (let p = parentOf.get(id); p !== undefined; p = parentOf.get(p)) {
      if (++depth > groups.length) throw new Error(`Group '${id}' has a parent cycle`);
    }
    return depth;
  };

  // Parents first: a child frame painted before its parent disappears under the parent's fill.
  const frames: SceneFrame[] = groups
    .map((g, order) => ({
      frame: {
        id: g.id,
        label: g.label,
        rect: need(d.groups[g.id], `group '${g.id}'`),
        depth: depthOf(g.id),
        band: lanes ? FRAME_BAND.lanes : FRAME_BAND.elk,
        tone: g.tone,
      },
      order,
    }))
    .sort((a, b) => a.frame.depth - b.frame.depth || a.order - b.order)
    .map(({ frame }) => frame);

  const exits = new Set(d.draft.edges.filter((e) => e.from !== e.to).map((e) => e.from));
  const cards: SceneCard[] = d.draft.nodes.map((node) => ({
    node,
    rect: need(d.nodes[node.id], `node '${node.id}'`),
    final: (node.type === 'success' || node.type === 'failure') && !exits.has(node.id),
  }));

  const edges: SceneEdge[] = d.draft.edges.map((e) => {
    const points = need(d.edges[e.id], `edge '${e.id}'`);
    return {
      id: e.id,
      from: e.from,
      to: e.to,
      points,
      path: roundedOrthogonalPath(points, EDGE_RADIUS),
      kind: e.kind ?? 'sync',
      tone: e.tone,
      label: e.label,
      mid: e.label ? (d.labels?.[e.id] ?? polylineMidpoint(points)) : undefined,
      gaps: [],
    };
  });

  const laneList: SceneLane[] = (d.draft.lanes ?? []).flatMap((l) => {
    const rect = d.lanes?.[l.id];
    return rect ? [{ id: l.id, label: l.label, rect, tone: l.tone }] : [];
  });
  const phases: ScenePhase[] = (d.draft.phases ?? []).flatMap((p) => {
    const rect = d.phases?.[p.id];
    return rect ? [{ id: p.id, label: p.label, rect }] : [];
  });

  const typeOf = new Map(d.draft.nodes.map((n) => [n.id, n.type]));
  const sequence = d.draft.kind === 'sequence';
  const lifelines: SceneLifeline[] = sequence
    ? d.draft.nodes.flatMap((n) => {
        const l = d.sequence?.lifelines[n.id];
        return l ? [{ node: n.id, type: n.type, ...l }] : [];
      })
    : [];
  const activations: SceneActivation[] = (d.sequence?.activations ?? []).flatMap((a) =>
    typeOf.has(a.participant) ? [{ node: a.participant, type: typeOf.get(a.participant)!, rect: a.rect, depth: a.depth }] : [],
  );
  if (!sequence) markCrossings(edges);
  const handles: SceneHandle[] = [];
  if (!sequence) {
    const seen = new Set<string>();
    for (const e of edges) {
      for (const [node, at, role] of [
        [e.from, e.points[0]!, 'out'],
        [e.to, e.points.at(-1)!, 'in'],
      ] as const) {
        const key = `${node}:${at.x},${at.y}`;
        if (seen.has(key)) continue;
        seen.add(key);
        handles.push({ node, type: typeOf.get(node)!, at, role });
      }
    }
  }

  return {
    kind: d.draft.kind,
    direction: lanes ? 'RIGHT' : (d.draft.direction ?? 'RIGHT'),
    compact: usesCompactCards(d.draft),
    phaseStyle: lanes ? 'header' : d.draft.kind === 'sequence' ? 'time' : 'band',
    bounds: d.bounds,
    content: union([
      ...laneList.map((l) => l.rect),
      ...phases.map((p) => p.rect),
      ...frames.map((f) => f.rect),
      ...cards.map((c) => c.rect),
      ...lifelines.map((l) => ({ x: l.x, y: l.top, width: 0, height: l.bottom - l.top })),
      // Labels can reach past everything else (a self-call's label on the last lifeline). The viewer can't ship
      // the font metrics, so their boxes are a generous estimate: 7px a character plus padding.
      ...edges.flatMap((e) => (e.label && e.mid ? [{ x: e.mid.x - (e.label.length * 7 + 16) / 2, y: e.mid.y - 10, width: e.label.length * 7 + 16, height: 20 }] : [])),
    ]),
    lanes: laneList,
    phases,
    frames,
    cards,
    edges,
    handles,
    lifelines,
    activations,
    labelStyle: sequence ? 'text' : 'pill',
  };
}
