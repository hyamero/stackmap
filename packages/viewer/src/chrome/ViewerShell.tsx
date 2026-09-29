import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { KIND_LABELS, type LaidOutDiagram } from '@stackmap/core';
import { CanvasPanel } from '../canvas/CanvasPanel';
import { DiagramCanvas } from '../canvas/DiagramCanvas';
import { ExploreProvider, useExplore } from '../explore/ExploreContext';
import { readLiveConfig, readShown } from '../live';
import { revealChrome, slideIndicator } from '../motion/motion';
import type { ThemeChoice } from '../theme/theme';
import { IdentityCard } from './IdentityCard';
import { Inspector } from './Inspector';
import { Toolbar } from './Toolbar';

/** Below this width the inspector starts collapsed (Q27). */
const INSPECTOR_BREAKPOINT = 1100;

// Author view ids are prefixed so a view named "overview" can't collide with the built-in tab.
const tabId = (id: string | null) => (id === null ? 'sm-tab-overview' : `sm-tab-v-${id}`);
const DIAGRAM_ID = 'sm-diagram';

function ViewTabs() {
  const { draft, state, dispatch } = useExplore();
  const tabs = [{ id: null, label: 'Overview' }, ...(draft.views ?? []).map((v) => ({ ...v, id: v.id as string | null }))];
  const current = tabs.find((t) => t.id === state.view) ?? tabs[0]!;
  // One indicator that slides between tabs, so a view change reads as a move rather than a blink.
  const bar = useRef<HTMLSpanElement>(null);
  const placed = useRef<{ x: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const place = () => {
      const tab = document.getElementById(tabId(current.id));
      if (!tab || !bar.current) return null;
      const to = { x: tab.offsetLeft, width: tab.offsetWidth };
      bar.current.style.width = `${to.width}px`;
      bar.current.style.transform = `translateX(${to.x}px)`;
      return to;
    };
    const from = placed.current;
    const to = place();
    placed.current = to;
    // Tab widths change once the web font arrives; follow without animating.
    void document.fonts?.ready.then(() => (placed.current = place() ?? placed.current));
    if (!from || !to || (from.x === to.x && from.width === to.width)) return;
    const motion = slideIndicator(bar.current, from, to);
    return () => motion.cancel();
  }, [current.id]);
  // Roving focus across the tablist, per the ARIA tabs pattern.
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    const to = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + last) % tabs.length, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = tabs[to]!;
    dispatch({ type: 'view', id: next.id });
    document.getElementById(tabId(next.id))?.focus();
  };
  return (
    // Scrolls sideways rather than wrapping when views outgrow the row; -mb-px lays the indicator on the header rule.
    <div role="tablist" aria-label="Views" className="relative -mb-px flex min-w-0 gap-7 overflow-x-auto [scrollbar-width:none]">
      {tabs.map((tab, i) => (
        <button
          key={tab.id ?? 'overview'}
          id={tabId(tab.id)}
          role="tab"
          aria-controls={DIAGRAM_ID}
          type="button"
          aria-selected={tab === current}
          tabIndex={tab === current ? 0 : -1}
          onClick={() => dispatch({ type: 'view', id: tab.id })}
          onKeyDown={(e) => onKeyDown(e, i)}
          className="shrink-0 text-[14.5px] whitespace-nowrap text-fg-muted transition-colors duration-150 hover:text-fg focus-visible:-outline-offset-2 aria-selected:text-fg"
        >
          {tab.label}
        </button>
      ))}
      <span ref={bar} aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-fg" />
    </div>
  );
}

function ViewCaption() {
  const { draft, state } = useExplore();
  const caption = draft.views?.find((v) => v.id === state.view)?.caption;
  return caption ? <p className="px-8 pt-3 text-[13px] text-fg-muted">{caption}</p> : null;
}

export function ViewerShell({
  diagram,
  theme,
  onToggleTheme,
}: {
  diagram: LaidOutDiagram;
  theme: ThemeChoice;
  onToggleTheme: () => void;
}) {
  const { draft } = diagram;
  const [inspectorCollapsed, setInspectorCollapsed] = useState(() => innerWidth < INSPECTOR_BREAKPOINT);
  const shell = useRef<HTMLDivElement>(null);
  // Read during render: the canvas (a child) records what it shows in its own layout effect, which runs first.
  const [reloaded] = useState(() => readLiveConfig(document) !== null && readShown() !== null);
  useLayoutEffect(() => {
    const root = shell.current;
    // A live reload after a save keeps the chrome still; only the diagram's changes animate.
    if (!root || reloaded) return;
    const motion = revealChrome([...root.querySelectorAll<HTMLElement>('.sm-panel, aside[aria-label="Inspector"]')]);
    return () => motion.cancel();
  }, [reloaded]);
  return (
    <ExploreProvider draft={draft}>
      <div ref={shell} className="flex h-full flex-col bg-page font-sans text-fg">
        <header className="mx-8 mt-4 flex gap-8 border-b border-divider">
          <div className="flex max-w-[45%] min-w-0 items-center gap-3 py-3">
            <h1 className="truncate text-[20px] leading-7 font-semibold tracking-tight">{draft.title}</h1>
            <span
              className="shrink-0 rounded-lg bg-panel px-2 py-0.5 text-[13px] text-fg-muted"
              style={{ boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)' }}
            >
              {KIND_LABELS[draft.kind]}
            </span>
          </div>
          <ViewTabs />
          <span className="ml-auto shrink-0 self-center text-[14px] whitespace-nowrap text-fg-muted max-md:hidden">
            {draft.nodes.length} nodes · {draft.edges.length} connections
          </span>
        </header>
        <ViewCaption />
        <main className="flex min-h-0 flex-1 gap-4 px-8 pt-4 pb-6">
          <section
            id={DIAGRAM_ID}
            role="tabpanel"
            aria-label="Diagram"
            className="relative min-w-0 flex-1 overflow-hidden rounded-[20px] bg-stage"
            style={{ boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)' }}
          >
            <DiagramCanvas diagram={diagram}>
              <CanvasPanel position="top-left" className="flex gap-2">
                <IdentityCard draft={draft} />
                <Toolbar theme={theme} onToggleTheme={onToggleTheme} />
              </CanvasPanel>
            </DiagramCanvas>
          </section>
          <Inspector collapsed={inspectorCollapsed} onToggle={() => setInspectorCollapsed((v) => !v)} />
        </main>
      </div>
    </ExploreProvider>
  );
}
