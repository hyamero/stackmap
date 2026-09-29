import { NODE_TYPES, type NodeType } from '@stackmap/core';

export interface ExploreState {
  selected: string | null;
  /** null = search closed; '' = open, nothing typed */
  query: string | null;
  hiddenTypes: ReadonlySet<NodeType>;
  trace: boolean;
  /** null = Overview */
  view: string | null;
  /** bumped when a selection should also move the camera (search, deep link) */
  reveal: number;
}

export const INITIAL: ExploreState = { selected: null, query: null, hiddenTypes: new Set(), trace: false, view: null, reveal: 0 };

export type ExploreAction =
  | { type: 'select'; id: string | null; reveal?: boolean }
  | { type: 'clear' }
  | { type: 'search'; query: string | null }
  | { type: 'toggleType'; nodeType: NodeType }
  | { type: 'toggleTrace' }
  | { type: 'view'; id: string | null }
  | { type: 'replace'; state: ExploreState };

export function explore(s: ExploreState, a: ExploreAction): ExploreState {
  switch (a.type) {
    case 'select':
      return { ...s, selected: a.id, reveal: a.reveal ? s.reveal + 1 : s.reveal };
    case 'clear':
      return { ...s, selected: null, query: null };
    case 'search':
      return { ...s, query: a.query };
    case 'toggleType': {
      const hidden = new Set(s.hiddenTypes);
      if (!hidden.delete(a.nodeType)) hidden.add(a.nodeType);
      return { ...s, hiddenTypes: hidden };
    }
    case 'toggleTrace':
      return { ...s, trace: !s.trace };
    case 'view':
      return { ...s, view: a.id };
    case 'replace':
      return a.state;
  }
}

export interface Known {
  nodes: ReadonlySet<string>;
  views: ReadonlySet<string>;
  types: ReadonlySet<NodeType>;
}

/** Deep link state; ids the diagram doesn't have are dropped rather than trusted. */
export function parseHash(hash: string, known: Known): ExploreState {
  // URLSearchParams decodes each value and tolerates malformed escapes, so junk never throws.
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const view = params.get('view');
  const node = params.get('node');
  const lens = (params.get('lens') ?? '')
    .split(',')
    .filter((t): t is NodeType => (NODE_TYPES as readonly string[]).includes(t) && known.types.has(t as NodeType));
  return {
    ...INITIAL,
    view: view && known.views.has(view) ? view : null,
    selected: node && known.nodes.has(node) ? node : null,
    reveal: node && known.nodes.has(node) ? 1 : 0,
    hiddenTypes: new Set(lens),
  };
}

export function formatHash(s: ExploreState): string {
  const parts: string[] = [];
  if (s.view) parts.push(`view=${encodeURIComponent(s.view)}`);
  if (s.selected) parts.push(`node=${encodeURIComponent(s.selected)}`);
  if (s.hiddenTypes.size) parts.push(`lens=${[...s.hiddenTypes].sort().join(',')}`);
  return parts.length ? `#${parts.join('&')}` : '';
}
