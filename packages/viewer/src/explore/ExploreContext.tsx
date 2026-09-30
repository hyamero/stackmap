import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from 'react';
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
// `dispatch` never changes; cards read it from here so explorer state changes don't re-render them all.
const DispatchContext = createContext<Dispatch<ExploreAction> | null>(null);
/** For scenes drawn without an explorer (StaticScene): cards dispatch into this instead. */
export const DispatchProvider = DispatchContext.Provider;

export function useExploreDispatch(): Dispatch<ExploreAction> {
  const d = useContext(DispatchContext);
  if (!d) throw new Error('useExploreDispatch must be used inside ExploreProvider');
  return d;
}

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
  const graph = useMemo(() => buildGraph(draft.nodes.map((n) => n.id), draft.edges, { timed: draft.kind === 'sequence' }), [draft]);
  const em = useMemo(() => emphasis(draft, graph, state), [draft, graph, state]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Deep links: the hash mirrors view/node/lens without adding history entries.
  const hash = formatHash(state);
  useEffect(() => {
    if (hash === location.hash || (!hash && !location.hash)) return;
    history.replaceState(history.state, '', hash || location.pathname + location.search);
  }, [hash]);
  useEffect(() => {
    // A new node in the hash is a new reveal, so the camera follows every deep link, not just the first.
    const onHash = () =>
      dispatch({
        type: 'replace',
        state: { ...parseHash(location.hash, known), trace: false, reveal: stateRef.current.reveal + 1 },
      });
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, [known]);

  const value = useMemo(() => ({ draft, state, dispatch, graph, emphasis: em }), [draft, state, graph, em]);
  return (
    <DispatchContext.Provider value={dispatch}>
      <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>
    </DispatchContext.Provider>
  );
}
