'use client';

import type { ReactNode } from 'react';
import { Link2, MousePointerClick, PanelsTopLeft, Play, Route, Search, Waypoints } from 'lucide-react';
import { KIND_LABELS, type LaidOutDiagram } from '@stackmap/core';
import { formatHash } from '@stackmap/viewer/src/explore/state';
import type { StaticDiagram } from '@/lib/data/static-html';
import { EmbeddedViewer } from '@/components/viewer/EmbeddedViewer';
import { useTry, type Showcase, type Try } from '@/components/viewer/useTry';

const icon = (I: typeof Play) => <I size={16} strokeWidth={1.75} aria-hidden="true" />;

const FEATURES: { id: Try; label: string; icon: ReactNode; title: string; desc: string; keys: [string, string][] }[] = [
  {
    id: 'select',
    label: 'Select',
    icon: icon(MousePointerClick),
    title: 'Select a card',
    desc: 'Click a card for its details, its connections and the evidence behind it: the file and line it came from. Click a connection to move along it.',
    keys: [
      ['Click', 'select'],
      ['Esc', 'clear'],
    ],
  },
  {
    id: 'trace',
    label: 'Trace',
    icon: icon(Route),
    title: 'Trace a node',
    desc: 'With a card selected, Trace keeps everything upstream and downstream of it and dims the rest. Nothing moves, so the layout stays where you learned it.',
    keys: [['Esc', 'clear']],
  },
  {
    id: 'route',
    label: 'Route',
    icon: icon(Waypoints),
    title: 'Route between two nodes',
    desc: 'Press R, then pick where the route starts and where it ends. Every path between them lights up and the inspector lists the shortest, hop by hop. If nothing runs that way, you get the way back.',
    keys: [
      ['R', 'route'],
      ['Esc', 'cancel'],
    ],
  },
  {
    id: 'find',
    label: 'Find',
    icon: icon(Search),
    title: 'Find a node',
    desc: 'Press / to search titles, ids and types; the arrow keys and Enter pick a match, and the camera brings it to you. The lens beside it dims the node types you don’t need.',
    keys: [
      ['/', 'search'],
      ['↑ ↓', 'move'],
      ['↵', 'select'],
    ],
  },
  {
    id: 'views',
    label: 'Views',
    icon: icon(PanelsTopLeft),
    title: 'Views',
    desc: 'Tabs your agent defines, like Checkout path. A view dims everything else and fits its members; Overview is always first. Present steps through them, full screen.',
    keys: [['F', 'present']],
  },
  {
    id: 'play',
    label: 'Play',
    icon: icon(Play),
    title: 'Play the flow',
    desc: 'Pulses travel whatever you’re looking at: the whole diagram, a view, a trace or a route, hop by hop. The button beside Play sets the speed: 1×, 2× or 0.5×. With reduced motion there is nothing to play.',
    keys: [['P', 'play or stop']],
  },
];

function Features({ show }: { show: Showcase }) {
  const { on, go, shown, state } = useTry(show);
  const f = FEATURES.find((x) => x.id === (shown ?? 'select'))!;
  return (
    <div className="vf">
      <div className="vf-g pnl" role="group" aria-label="Show a feature">
        {FEATURES.map((x) => (
          <button key={x.id} type="button" className="vf-b" aria-pressed={on(x.id)} onClick={() => go(x.id)}>
            {x.icon}
            <span>{x.label}</span>
          </button>
        ))}
      </div>
      <div className="vf-p" aria-live="polite">
        <h3 className="vf-t">{f.title}</h3>
        <p className="vf-d">{f.desc}</p>
        <p className="vf-k">
          {f.keys.map(([k, what]) => (
            <span key={k} className="vf-kk">
              <span className="kbd">{k}</span>
              <span>{what}</span>
            </span>
          ))}
        </p>
      </div>
      <p className="vf-url">
        <span className="u mono">
          <Link2 size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>
            diagram.html<b>{formatHash(state) || '#'}</b>
          </span>
        </span>
      </p>
    </div>
  );
}

/** The docs' viewer: the landing's diagram in the real viewer, with buttons that show each feature and the link it makes. */
export function ViewerTry({ diagram, still, show }: { diagram: LaidOutDiagram; still: StaticDiagram; show: Showcase }) {
  return (
    <div className="vd">
      <EmbeddedViewer diagram={diagram} still={still} crumb={`stackmap › ${KIND_LABELS[diagram.draft.kind]}`}>
        <Features show={show} />
      </EmbeddedViewer>
    </div>
  );
}
