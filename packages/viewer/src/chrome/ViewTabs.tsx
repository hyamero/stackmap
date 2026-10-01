import { useId, useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { useExplore } from '../explore/ExploreContext';
import { slideIndicator } from '../motion/motion';

/** Overview, then the author's views, as tabs over the diagram (`controls`: the id of the panel they switch). */
export function ViewTabs({ controls, className = '' }: { controls: string; className?: string }) {
  const { draft, state, dispatch } = useExplore();
  // Per instance, so two viewers on one page don't share tab ids; author view ids are suffixed so a view named
  // "overview" can't collide with the built-in tab.
  const uid = useId();
  const tabId = (id: string | null) => (id === null ? `${uid}-overview` : `${uid}-v-${id}`);
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
    // tabId only changes with uid, which is stable for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div role="tablist" aria-label="Views" className={`relative -mb-px flex min-w-0 gap-7 overflow-x-auto [scrollbar-width:none] ${className}`}>
      {tabs.map((tab, i) => (
        <button
          key={tab.id ?? 'overview'}
          id={tabId(tab.id)}
          role="tab"
          aria-controls={controls}
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
