import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import type { DiagramDraft } from '@stackmap/core';
import { emphasis, type Emphasis } from './emphasis';
import { buildGraph, type Graph } from './graph';
import { explore, formatHash, parseHash, type ExploreAction, type ExploreState, type Known } from './state';

export interface Explore {
  draft: DiagramDraft;
  state: ExploreState;
  dispatch: Dispatch<ExploreAction>;
  graph: Graph;
  emphasis: Emphasis;
}

const ExploreContext = createContext<Explore | null>(null);

export function useExplore(): Explore {
  const ctx = useContext(ExploreContext);
  if (!ctx) throw new Error('useExplore must be used inside ExploreProvider');
  return ctx;
}

const knownOf = (d: DiagramDraft): Known => ({
  nodes: new Set(d.nodes.map((n) => n.id)),
  views: new Set((d.views ?? []).map((v) => v.id)),
  types: new Set(d.nodes.map((n) => n.type)),
});

export function ExploreProvider({ draft, children }: { draft: DiagramDraft; children: ReactNode }) {
  const known = useMemo(() => knownOf(draft), [draft]);
  const [state, dispatch] = useReducer(explore, undefined, () => parseHash(location.hash, known));
  const graph = useMemo(() => buildGraph(draft.nodes.map((n) => n.id), draft.edges), [draft]);
  const em = useMemo(() => emphasis(draft, graph, state), [draft, graph, state]);

  // Deep links: the hash mirrors view/node/lens without adding history entries.
  const hash = formatHash(state);
  useEffect(() => {
    if (hash === location.hash || (!hash && !location.hash)) return;
    history.replaceState(history.state, '', hash || location.pathname + location.search);
  }, [hash]);
  useEffect(() => {
    const onHash = () => dispatch({ type: 'replace', state: { ...parseHash(location.hash, known), trace: false } });
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, [known]);

  const value = useMemo(() => ({ draft, state, dispatch, graph, emphasis: em }), [draft, state, graph, em]);
  return <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>;
}
