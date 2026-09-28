import type { Edge, Node } from '@xyflow/react';
import type { DiagramNode, Direction, LaidOutDiagram, Point, Rect } from '@stackmap/core';

export type CardFlowNode = Node<{ node: DiagramNode; direction: Direction }, 'card'>;
export type FrameFlowNode = Node<{ label: string }, 'frame'>;
export type RoutedFlowEdge = Edge<{ points: Point[]; kind: 'sync' | 'async'; label?: string }, 'routed'>;

function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`No layout for ${what}`);
  return value;
}

const placed = (r: Rect) => ({ position: { x: r.x, y: r.y }, width: r.width, height: r.height });
const readOnly = { draggable: false, connectable: false } as const;

export function toFlow(d: LaidOutDiagram): { nodes: (CardFlowNode | FrameFlowNode)[]; edges: RoutedFlowEdge[] } {
  const direction = d.draft.direction ?? 'RIGHT';

  const frames: FrameFlowNode[] = (d.draft.groups ?? []).map((g) => ({
    id: `group:${g.id}`,
    type: 'frame',
    data: { label: g.label },
    ...placed(need(d.groups[g.id], `group '${g.id}'`)),
    ...readOnly,
    selectable: false,
    zIndex: 0,
  }));

  const cards: CardFlowNode[] = d.draft.nodes.map((n) => ({
    id: n.id,
    type: 'card',
    data: { node: n, direction },
    ...placed(need(d.nodes[n.id], `node '${n.id}'`)),
    ...readOnly,
    zIndex: 1,
  }));

  const edges: RoutedFlowEdge[] = d.draft.edges.map((e) => ({
    id: e.id,
    source: e.from,
    target: e.to,
    sourceHandle: 'out',
    targetHandle: 'in',
    type: 'routed',
    data: { points: need(d.edges[e.id], `edge '${e.id}'`), kind: e.kind ?? 'sync', label: e.label },
    focusable: false,
  }));

  // Frames first so React Flow paints them beneath the cards.
  return { nodes: [...frames, ...cards], edges };
}
