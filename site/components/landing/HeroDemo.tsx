'use client';

import { useState, type ReactNode } from 'react';
import { MousePointerClick, PanelsTopLeft, Play, Route, Search, Waypoints } from 'lucide-react';
import { KIND_LABELS, type LaidOutDiagram } from '@stackmap/core';
import { useExplore } from '@stackmap/viewer/src/explore/ExploreContext';
import type { StaticDiagram } from '@/lib/data/static-html';
import { EmbeddedViewer } from '@/components/viewer/EmbeddedViewer';

type Try = 'select' | 'trace' | 'route' | 'find' | 'views' | 'play';

const TRIES: { id: Try; label: string; key?: string; icon: ReactNode; desc: string }[] = [
  { id: 'select', label: 'Select', key: 'Click', icon: <MousePointerClick size={16} strokeWidth={1.75} />, desc: 'Select a card for its details, connections and the file and line behind it.' },
  { id: 'trace', label: 'Trace', key: 'T', icon: <Route size={16} strokeWidth={1.75} />, desc: 'Keep a node’s upstream and downstream. Everything else dims; nothing moves.' },
  { id: 'route', label: 'Route', key: 'R', icon: <Waypoints size={16} strokeWidth={1.75} />, desc: 'Pick two nodes and every path between them lights up, hop by hop.' },
  { id: 'find', label: 'Find', key: '/', icon: <Search size={16} strokeWidth={1.75} />, desc: 'Search titles, ids and types. The lens dims the types you don’t need.' },
  { id: 'views', label: 'Views', icon: <PanelsTopLeft size={16} strokeWidth={1.75} />, desc: 'Tabs your agent defines, like Checkout path. Present steps through them full screen.' },
  { id: 'play', label: 'Play', key: 'P', icon: <Play size={16} strokeWidth={1.75} />, desc: 'Pulses travel whatever you’re looking at: the diagram, a view, a trace or a route.' },
];
const IDLE = 'This is the real viewer, cut down to one diagram. Every control works.';

/** What the demo shows off; each must exist in the diagram (the Commerce API demo). */
export interface Showcase {
  select: string;
  route: [string, string];
  query: string;
  view: string;
}

/** Each button puts the real viewer in one state; the modes are exclusive, and Play runs over any of them. */
function TryBar({ show }: { show: Showcase }) {
  const { state, dispatch } = useExplore();
  const [said, setSaid] = useState<Try | null>(null);
  const active: Try | null = state.route || state.routing ? 'route' : state.query !== null ? 'find' : state.selected && state.trace ? 'trace' : state.selected ? 'select' : state.view ? 'views' : null;
  const on = (id: Try) => (id === 'play' ? state.playing : active === id);
  const reset = () => {
    dispatch({ type: 'clear' });
    if (state.trace) dispatch({ type: 'toggleTrace' });
    if (state.view) dispatch({ type: 'view', id: null });
  };
  const go = (id: Try) => {
    setSaid(id);
    if (id === 'play') return dispatch({ type: 'togglePlay' });
    const wasOn = on(id);
    reset();
    if (wasOn) return;
    if (id === 'select' || id === 'trace') {
      dispatch({ type: 'select', id: show.select });
      if (id === 'trace') dispatch({ type: 'toggleTrace' });
    } else if (id === 'route') {
      dispatch({ type: 'toggleRoute' });
      dispatch({ type: 'select', id: show.route[0] });
      dispatch({ type: 'select', id: show.route[1] });
    } else if (id === 'find') dispatch({ type: 'search', query: show.query });
    else dispatch({ type: 'view', id: show.view });
  };
  const shown = said === 'play' ? 'play' : (active ?? (said && on(said) ? said : null));
  return (
    <div className="try" data-rise="" style={{ ['--d' as string]: '320ms' }}>
      <div className="try-g pnl" role="group" aria-label="Try the viewer">
        {TRIES.map((t) => (
          <button key={t.id} type="button" className="try-b" aria-pressed={on(t.id)} onClick={() => go(t.id)}>
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
            {t.key && (
              <span className="kbd" aria-hidden="true">
                {t.key}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="try-d" aria-live="polite">
        {shown ? TRIES.find((t) => t.id === shown)!.desc : IDLE}
      </p>
    </div>
  );
}

export function HeroDemo({ diagram, still, show }: { diagram: LaidOutDiagram; still: StaticDiagram; show: Showcase }) {
  return (
    <EmbeddedViewer diagram={diagram} still={still} variant="hero" crumb={`stackmap › ${KIND_LABELS[diagram.draft.kind]}`}>
      <TryBar show={show} />
    </EmbeddedViewer>
  );
}
