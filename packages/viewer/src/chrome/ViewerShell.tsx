import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KIND_LABELS, type LaidOutDiagram } from '@stackmap/core';
import { CanvasPanel } from '../canvas/CanvasPanel';
import { DiagramCanvas } from '../canvas/DiagramCanvas';
import { ExploreProvider, useExplore } from '../explore/ExploreContext';
import { readLiveConfig, readShown } from '../live';
import { revealChrome } from '../motion/motion';
import type { ThemeChoice } from '../theme/theme';
import { IdentityCard } from './IdentityCard';
import { Inspector } from './Inspector';
import { PresentBar } from './Presentation';
import { inMenu } from './Toolbar';
import { Toolbar } from './Toolbar';
import { ViewTabs } from './ViewTabs';

/** Below this width the inspector starts collapsed (Q27). */
const INSPECTOR_BREAKPOINT = 1100;

const DIAGRAM_ID = 'sm-diagram';

/** The identity card's details button shows the diagram itself in the inspector, whatever was selected. */
function DiagramIdentity({ onDetails }: { onDetails: () => void }) {
  const { draft, dispatch } = useExplore();
  return (
    <IdentityCard
      draft={draft}
      onDetails={() => {
        dispatch({ type: 'clear' });
        onDetails();
      }}
    />
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
  titleAs: Title = 'h1',
}: {
  diagram: LaidOutDiagram;
  theme: ThemeChoice;
  onToggleTheme: () => void;
  /** h2 when the shell sits in a page that has its own h1 and main landmark (the website); its main is then a plain div */
  titleAs?: 'h1' | 'h2';
}) {
  const { draft } = diagram;
  const Main = Title === 'h1' ? 'main' : 'div';
  const [inspectorCollapsed, setInspectorCollapsed] = useState(() => innerWidth < INSPECTOR_BREAKPOINT);
  const shell = useRef<HTMLDivElement>(null);
  // Presentation (F): the stage alone, full screen where the browser allows it, stepping through the views.
  const [presenting, setPresenting] = useState(false);
  const presentingRef = useRef(false);
  presentingRef.current = presenting;
  const present = useCallback((on: boolean) => {
    presentingRef.current = on;
    setPresenting(on);
    if (on) void shell.current?.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }, []);
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if ((e.key !== 'f' && e.key !== 'F') || e.metaKey || e.ctrlKey || e.altKey || e.repeat || inMenu(t) || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
      e.preventDefault();
      present(!presenting);
    };
    // Leaving full screen (Esc in the browser's own handling) ends the presentation too.
    const onFullscreen = () => {
      if (!document.fullscreenElement) setPresenting(false);
      // A request that resolved after the presentation already ended (a quick F, F): leave full screen again.
      else if (!presentingRef.current) void document.exitFullscreen().catch(() => {});
    };
    addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [presenting, present]);
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
      <div ref={shell} data-presenting={presenting || undefined} className="@container flex h-full flex-col bg-page font-sans text-fg">
        {!presenting && (
        <header className="mx-8 mt-4 flex gap-8 border-b border-divider @max-2xl:mx-4 @max-2xl:mt-2 @max-md:flex-wrap @max-md:gap-x-4 @max-md:gap-y-0">
          <div className="flex max-w-[45%] min-w-0 items-center gap-3 py-3 @max-md:max-w-full @max-md:basis-full @max-md:pb-1">
            <Title className="truncate text-[20px] leading-7 font-semibold tracking-tight">{draft.title}</Title>
            <span
              className="shrink-0 rounded-lg bg-panel px-2 py-0.5 text-[13px] text-fg-muted"
              style={{ boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)' }}
            >
              {KIND_LABELS[draft.kind]}
            </span>
          </div>
          <ViewTabs controls={DIAGRAM_ID} />
          <span className="ml-auto shrink-0 self-center text-[14px] whitespace-nowrap text-fg-muted max-md:hidden">
            {draft.nodes.length} nodes · {draft.edges.length} connections
          </span>
        </header>
        )}
        {!presenting && <ViewCaption />}
        <Main className={`relative flex min-h-0 flex-1 gap-4 @max-2xl:gap-2 ${presenting ? '' : 'px-8 pt-4 pb-6 @max-2xl:px-3 @max-2xl:pt-3 @max-2xl:pb-3'}`}>
          <section
            id={DIAGRAM_ID}
            role="tabpanel"
            aria-label="Diagram"
            className={`@container/stage relative min-w-0 flex-1 overflow-hidden bg-stage ${presenting ? '' : 'rounded-[20px]'}`}
            style={presenting ? undefined : { boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)' }}
          >
            <DiagramCanvas diagram={diagram} chrome={!presenting}>
              {/* Never wider than the stage: the identity card gives way (truncating, then hidden) before the toolbar. */}
              <CanvasPanel position="top-left" className="flex max-w-[calc(100%-30px)] gap-2">
                {/* Narrow, the header already names the diagram: the toolbar gets the room. */}
                <div className="flex min-w-0 @max-[640px]/stage:hidden">
                  <DiagramIdentity onDetails={() => setInspectorCollapsed(false)} />
                </div>
                <Toolbar theme={theme} onToggleTheme={onToggleTheme} onPresent={() => present(true)} />
              </CanvasPanel>
            </DiagramCanvas>
            {presenting && <PresentBar onExit={() => present(false)} />}
          </section>
          {!presenting && <Inspector collapsed={inspectorCollapsed} onToggle={() => setInspectorCollapsed((v) => !v)} />}
        </Main>
      </div>
    </ExploreProvider>
  );
}
