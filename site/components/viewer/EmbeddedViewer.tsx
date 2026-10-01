'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { Pause, Play } from 'lucide-react';
import { KIND_LABELS, type LaidOutDiagram } from '@stackmap/core';
import { CanvasPanel } from '@stackmap/viewer/src/canvas/CanvasPanel';
import { DiagramCanvas } from '@stackmap/viewer/src/canvas/DiagramCanvas';
import { IdentityCard } from '@stackmap/viewer/src/chrome/IdentityCard';
import { Inspector } from '@stackmap/viewer/src/chrome/Inspector';
import { Toolbar } from '@stackmap/viewer/src/chrome/Toolbar';
import { ViewTabs } from '@stackmap/viewer/src/chrome/ViewTabs';
import { ExploreProvider, useExplore } from '@stackmap/viewer/src/explore/ExploreContext';
import { ViewerScope } from '@stackmap/viewer/src/explore/scope';
import { motionAllowed } from '@stackmap/viewer/src/motion/motion';
import type { StaticDiagram } from '@/lib/data/static-html';
import { FitDiagram } from '@/components/diagram/FitDiagram';
import { toggleTheme, useTheme } from '@/components/site/theme';
import './viewer.css';

const typing = (t: EventTarget) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * Starts the flow once the intro has played, unless the reader got there first; stops it while the frame is off
 * screen and picks it up again on return, so a page of diagrams never animates out of sight.
 */
function useAutoplay(frame: RefObject<HTMLElement | null>, live: boolean, delay: number) {
  const { state, dispatch } = useExplore();
  const playing = useRef(state.playing);
  playing.current = state.playing;
  const paused = useRef(false);
  useEffect(() => {
    if (!live || !motionAllowed()) return;
    const t = setTimeout(() => playing.current || dispatch({ type: 'togglePlay' }), delay);
    return () => clearTimeout(t);
  }, [live, delay, dispatch]);
  useEffect(() => {
    const el = frame.current;
    if (!live || !el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      if (!e.isIntersecting && playing.current) {
        paused.current = true;
        dispatch({ type: 'togglePlay' });
      } else if (e.isIntersecting && paused.current) {
        paused.current = false;
        if (!playing.current) dispatch({ type: 'togglePlay' });
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [frame, live, dispatch]);
}

/** The viewer's T: trace the selection. A delivered file traces from the toolbar; the embed adds the key. */
function onTraceKey(e: KeyboardEvent, selected: string | null, trace: () => void) {
  if ((e.key !== 't' && e.key !== 'T') || e.metaKey || e.ctrlKey || e.altKey || e.repeat || typing(e.target) || !selected) return;
  e.preventDefault();
  trace();
}

function Stage({ id, diagram, still, live, children }: { id: string; diagram: LaidOutDiagram; still: StaticDiagram; live: boolean; children?: ReactNode }) {
  return (
    <section id={id} role="tabpanel" aria-label="Diagram" className="ev-stage @container/stage">
      {live ? (
        <DiagramCanvas diagram={diagram} minimap={false} wheel="modifier">
          {children}
        </DiagramCanvas>
      ) : (
        <div className="ev-still">
          <FitDiagram still={still} width={932} height={686} pad={48} fill className="bg-transparent" />
        </div>
      )}
    </section>
  );
}

function HeroFrame({ diagram, still, crumb, live }: { diagram: LaidOutDiagram; still: StaticDiagram; crumb: string; live: boolean }) {
  const { draft } = diagram;
  const theme = useTheme() ?? 'light';
  const stage = useId();
  return (
    <>
      <div className="ev-head">
        <p className="crumb">{crumb}</p>
        <div className="vt">
          <h2>{draft.title}</h2>
          <span className="badge">{KIND_LABELS[draft.kind]}</span>
          <span className="cnt tnum">
            {draft.nodes.length} nodes · {draft.edges.length} connections
          </span>
        </div>
      </div>
      <ViewTabs controls={stage} className="ev-tabs h-9" />
      <div className="ev-body">
        <Stage id={stage} diagram={diagram} still={still} live={live}>
          <CanvasPanel position="top-left" className="flex max-w-[calc(100%-30px)] gap-2">
            <div className="flex min-w-0 @max-[640px]/stage:hidden">
              <IdentityCard draft={draft} />
            </div>
            <Toolbar theme={theme} onToggleTheme={toggleTheme} exports={false} trace={false} />
          </CanvasPanel>
        </Stage>
        <Inspector placement="static" headingLevel={3} />
      </div>
    </>
  );
}

function GalleryFrame({ diagram, still, extra, live }: { diagram: LaidOutDiagram; still: StaticDiagram; extra?: ReactNode; live: boolean }) {
  const { state, dispatch } = useExplore();
  const allowed = live && motionAllowed();
  const on = state.playing && allowed;
  return (
    <div className="ev-body ev-gallery">
      <section aria-label="Diagram" className="ev-stage">
        {live ? (
          <DiagramCanvas diagram={diagram} chrome={false} wheel="modifier" />
        ) : (
          <div className="ev-still">
            <FitDiagram still={still} width={932} height={620} pad={48} fill className="bg-transparent" />
          </div>
        )}
        <div className="pnl ev-tools">
          <button type="button" className="ib" aria-label="Play the flow" aria-pressed={on} disabled={!allowed} onClick={() => dispatch({ type: 'togglePlay' })}>
            {on ? <Pause size={17} strokeWidth={1.75} aria-hidden="true" /> : <Play size={17} strokeWidth={1.75} aria-hidden="true" />}
          </button>
          <span className="ev-hint">{state.selected ? 'Esc clears the selection' : 'Select a card'}</span>
        </div>
      </section>
      <Inspector placement="static" headingLevel={3} extra={extra} />
    </div>
  );
}

function Frame(props: {
  diagram: LaidOutDiagram;
  still: StaticDiagram;
  variant: 'hero' | 'gallery';
  crumb?: string;
  extra?: ReactNode;
  label: string;
  children?: ReactNode;
}) {
  const { diagram, still, variant, crumb, extra, label, children } = props;
  const { state, dispatch } = useExplore();
  const root = useRef<HTMLDivElement>(null);
  // The viewer reads the window (its size, pointer and motion settings), so it takes over from the still once mounted.
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);
  useAutoplay(root, live, variant === 'hero' ? 1100 : 900);
  return (
    <>
      <ViewerScope value={root}>
        <div
          ref={root}
          className={`ev ev-${variant} @container`}
          data-live={live || undefined}
          role="group"
          aria-label={label}
          onKeyDown={(e) => onTraceKey(e, state.selected, () => dispatch({ type: 'toggleTrace' }))}
        >
          {variant === 'hero' ? (
            <HeroFrame diagram={diagram} still={still} crumb={crumb ?? ''} live={live} />
          ) : (
            <GalleryFrame diagram={diagram} still={still} extra={extra} live={live} />
          )}
        </div>
      </ViewerScope>
      {children}
    </>
  );
}

/**
 * The real viewer, framed for a page: its own explorer that never touches the URL, keys that act only while focus
 * is inside it, and a wheel left to the page. `hero` is the landing's (header, view tabs, toolbar, zoom bar,
 * inspector); `gallery` is the examples' (flow toggle and inspector). `children` render inside its explorer, so
 * controls beside the frame can drive it. Before it mounts, and without script, the frame shows `still`.
 */
export function EmbeddedViewer({
  diagram,
  still,
  variant,
  crumb,
  extra,
  children,
}: {
  diagram: LaidOutDiagram;
  still: StaticDiagram;
  variant: 'hero' | 'gallery';
  crumb?: string;
  extra?: ReactNode;
  children?: ReactNode;
}) {
  const label = `The stackmap viewer, showing ${diagram.draft.title}. Keys while it has focus: T trace, R route, slash to search, P play, Escape clears.`;
  return (
    <ExploreProvider draft={diagram.draft} syncHash={false}>
      <Frame diagram={diagram} still={still} variant={variant} crumb={crumb} extra={extra} label={label}>
        {children}
      </Frame>
    </ExploreProvider>
  );
}
