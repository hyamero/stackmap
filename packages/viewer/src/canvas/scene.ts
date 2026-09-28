import {
  polylineMidpoint,
  roundedOrthogonalPath,
  type DiagramNode,
  type Direction,
  type LaidOutDiagram,
  type Point,
  type Rect,
} from '@stackmap/core';

export const EDGE_RADIUS = 10;

export interface SceneFrame {
  id: string;
  label: string;
  rect: Rect;
  depth: number;
}

export interface SceneCard {
  node: DiagramNode;
  rect: Rect;
  hasIn: boolean;
  hasOut: boolean;
}

export interface SceneEdge {
  id: string;
  from: string;
  to: string;
  points: Point[];
  path: string;
  kind: 'sync' | 'async';
  label?: string;
  mid?: Point;
}

export interface Scene {
  direction: Direction;
  bounds: { width: number; height: number };
  /** Union of card and frame rects — what "fit to screen" frames. */
  content: Rect;
  frames: SceneFrame[];
  cards: SceneCard[];
  edges: SceneEdge[];
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

export function toScene(d: LaidOutDiagram): Scene {
  const groups = d.draft.groups ?? [];
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
      frame: { id: g.id, label: g.label, rect: need(d.groups[g.id], `group '${g.id}'`), depth: depthOf(g.id) },
      order,
    }))
    .sort((a, b) => a.frame.depth - b.frame.depth || a.order - b.order)
    .map(({ frame }) => frame);

  const targets = new Set(d.draft.edges.map((e) => e.to));
  const sources = new Set(d.draft.edges.map((e) => e.from));
  const cards: SceneCard[] = d.draft.nodes.map((node) => ({
    node,
    rect: need(d.nodes[node.id], `node '${node.id}'`),
    hasIn: targets.has(node.id),
    hasOut: sources.has(node.id),
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
      label: e.label,
      mid: e.label ? polylineMidpoint(points) : undefined,
    };
  });

  return {
    direction: d.draft.direction ?? 'RIGHT',
    bounds: d.bounds,
    content: union([...frames.map((f) => f.rect), ...cards.map((c) => c.rect)]),
    frames,
    cards,
    edges,
  };
}
