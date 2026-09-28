import { TYPE_LABELS, type DiagramDraft, type DiagramNode, type NodeType } from '@stackmap/core';
import { reachable, type Graph } from './graph';
import type { ExploreState } from './state';

export type NodeEmphasis = 'focus' | 'normal' | 'dim';
export interface EdgeEmphasis {
  dim: boolean;
  /** source node type when the edge is part of the selection or trace (Q26), else null */
  tint: NodeType | null;
}
export interface Emphasis {
  /** anything dimmed or focused */
  active: boolean;
  nodes: Map<string, NodeEmphasis>;
  edges: Map<string, EdgeEmphasis>;
}

const haystack = (n: DiagramNode) => [n.card.title, n.card.subtitle ?? '', n.id, TYPE_LABELS[n.type]].join('\n').toLowerCase();

/** Substring search (no regex), title-prefix matches first, then document order. */
export function searchMatches(draft: DiagramDraft, query: string): DiagramNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits = draft.nodes.filter((n) => haystack(n).includes(q));
  const prefix = (n: DiagramNode) => (n.card.title.toLowerCase().startsWith(q) ? 0 : 1);
  return hits.map((n, i) => ({ n, i })).sort((a, b) => prefix(a.n) - prefix(b.n) || a.i - b.i).map((x) => x.n);
}

export function emphasis(draft: DiagramDraft, graph: Graph, s: ExploreState): Emphasis {
  const view = s.view ? new Set(draft.views?.find((v) => v.id === s.view)?.nodes ?? []) : null;
  const q = s.query?.trim() ? new Set(searchMatches(draft, s.query).map((n) => n.id)) : null;
  const trace = s.trace && s.selected ? reachable(graph, s.selected) : null;
  const typeOf = new Map(draft.nodes.map((n) => [n.id, n.type]));

  const nodes = new Map<string, NodeEmphasis>();
  for (const n of draft.nodes) {
    const excluded = (view && !view.has(n.id)) || s.hiddenTypes.has(n.type) || (q && !q.has(n.id)) || (trace && !trace.nodes.has(n.id));
    nodes.set(n.id, n.id === s.selected ? 'focus' : excluded ? 'dim' : 'normal');
  }

  const edges = new Map<string, EdgeEmphasis>();
  for (const e of draft.edges) {
    const lit = !!s.selected && (trace ? trace.edges.has(e.id) : e.from === s.selected || e.to === s.selected);
    const endDim = nodes.get(e.from) === 'dim' || nodes.get(e.to) === 'dim';
    edges.set(e.id, { dim: !lit && (endDim || !!trace), tint: lit ? (typeOf.get(e.from) ?? null) : null });
  }

  const active = !!s.selected || [...nodes.values()].some((v) => v === 'dim');
  return { active, nodes, edges };
}
