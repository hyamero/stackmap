'use client';

import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';
import type { LaidOutDiagram } from '@stackmap/core';
import { FitDiagram } from '@/components/diagram/FitDiagram';
import { ArrowIcon } from '@/components/ui/icons';

export interface GalleryItem {
  id: string;
  title: string;
  kind: string;
  nodes: number;
  prompt?: string;
  diagram: LaidOutDiagram;
}

/** Plain data, since the page (a server component) builds it: a kind, the agent-written ones, or everything. */
export interface Filter {
  id: string;
  label: string;
  kind?: string;
  agent?: true;
}

const matches = (f: Filter | undefined, i: GalleryItem) => !f || ((!f.kind || f.kind === i.kind) && (!f.agent || !!i.prompt));


// The viewer reads the window (hash, size, keys), so it mounts on the client; until then the frame
// shows the same diagram at rest, which is also what a reader without JavaScript gets.
function Resting({ diagram }: { diagram: LaidOutDiagram }) {
  return <FitDiagram diagram={diagram} width={1248} height={680} pad={48} fill />;
}
const Viewer = dynamic(() => import('./LiveViewer'), { ssr: false });

function Agent() {
  return <span className="inline-flex items-center gap-1.5 text-fg before:size-1.5 before:rounded-full before:bg-fg">Written by an agent</span>;
}

export function Gallery({ items, thumbs, filters }: { items: GalleryItem[]; thumbs: Record<string, ReactNode>; filters?: Filter[] }) {
  const [filter, setFilter] = useState(filters?.[0]?.id);
  const shown = items.filter((i) => matches(filters?.find((f) => f.id === filter), i));
  const [selected, setSelected] = useState(items[0]!.id);
  const [live, setLive] = useState(false);
  const at = Math.max(0, shown.findIndex((i) => i.id === selected));
  const current = shown[at] ?? items[0]!;
  const step = (by: number) => setSelected(shown[(at + by + shown.length) % shown.length]!.id);
  const pick = (id: string) => {
    setSelected(id);
    setLive(true);
    document.getElementById('viewer-x')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <>
      <section id="viewer-x" aria-label="Example viewer" className="mt-14 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="m-0 flex flex-wrap items-center gap-3 text-sm text-fg-muted">
            <span className="rounded-full px-2.5 py-0.5 text-[13px] text-fg shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">{current.kind}</span>
            <span className="tabular-nums">{current.nodes} nodes</span>
            {current.prompt && <Agent />}
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-panel p-1 shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">
            <button type="button" aria-label="Previous example" onClick={() => step(-1)} className="sm-press grid size-9 cursor-pointer place-items-center rounded-full text-fg-muted hover:bg-page hover:text-fg">
              <ArrowIcon back />
            </button>
            <span aria-live="polite" className="min-w-[52px] text-center font-mono text-[13px] text-fg-muted tabular-nums">
              {at + 1}/{shown.length}
            </span>
            <button type="button" aria-label="Next example" onClick={() => step(1)} className="sm-press grid size-9 cursor-pointer place-items-center rounded-full text-fg-muted hover:bg-page hover:text-fg">
              <ArrowIcon />
            </button>
          </div>
        </div>
        <div className="relative mt-4 h-[480px] overflow-hidden rounded-[22px] bg-page shadow-panel md:h-[680px]">
          {live ? (
            <Viewer key={current.id} diagram={current.diagram} />
          ) : (
            <button
              type="button"
              onClick={() => setLive(true)}
              aria-label={`Open ${current.title} in the viewer`}
              className="group relative block size-full cursor-pointer text-left"
            >
              <Resting diagram={current.diagram} />
              <span className="absolute top-5 left-5 max-w-[70%] rounded-2xl bg-panel px-4 py-3 shadow-panel">
                <span className="block truncate text-[17px] font-semibold tracking-tight text-fg">{current.title}</span>
                <span className="mt-0.5 block text-[13px] text-fg-muted">Select to explore it in the viewer</span>
              </span>
              <span className="sm-press absolute bottom-5 left-5 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-fg group-hover:opacity-90">
                Open in the viewer
              </span>
            </button>
          )}
        </div>
        {current.prompt && (
          <div className="mt-4 grid gap-2 rounded-[18px] bg-panel p-5 shadow-[inset_0_0_0_1px_var(--sm-panel-border)] md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
            <h3 className="text-[13px] font-semibold">What the agent was asked</h3>
            <div>
              <p className="text-sm leading-[1.6] text-fg">“{current.prompt}”</p>
              <p className="mt-2.5 text-[12.5px] leading-[1.55] text-fg-muted">
                Written by a coding agent in the skill’s eval: it read the request, wrote the JSON, validated it and delivered the file.
              </p>
            </div>
          </div>
        )}
      </section>

      {filters && (
        <div role="group" aria-label="Filter examples" className="mt-[72px] inline-flex flex-wrap gap-1 rounded-[26px] bg-panel p-[5px] shadow-panel">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={f.id === filter}
              onClick={() => setFilter(f.id)}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm text-fg-muted transition-colors duration-150 hover:text-fg aria-pressed:bg-primary aria-pressed:text-primary-fg"
            >
              {f.label}
              <span className="text-[12.5px] opacity-70 tabular-nums">{items.filter((i) => matches(f, i)).length}</span>
            </button>
          ))}
        </div>
      )}

      <ul className={`m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4 ${filters ? 'mt-7' : 'mt-14'}`}>
        {shown.map((i) => (
          <li key={i.id}>
            <button type="button" aria-pressed={i.id === current.id} onClick={() => pick(i.id)} className="group flex w-full cursor-pointer flex-col gap-3 border-0 bg-transparent p-0 text-left text-fg outline-none">
              <span className="grid h-[196px] w-full place-items-center overflow-hidden rounded-2xl bg-stage p-3 shadow-[inset_0_0_0_1px_var(--sm-panel-border)] transition-shadow duration-150 group-hover:shadow-[inset_0_0_0_1.5px_var(--sm-text-muted)] group-focus-visible:shadow-[inset_0_0_0_2px_var(--sm-text),0_0_0_3px_var(--sm-page),0_0_0_5px_var(--sm-text)] group-aria-pressed:shadow-[inset_0_0_0_2px_var(--sm-text)]">
                {thumbs[i.id]}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[15.5px] font-semibold tracking-[-0.01em]">{i.title}</span>
                <span className="flex flex-wrap gap-2.5 text-[12.5px] text-fg-muted">
                  <span>{i.kind}</span>
                  <span className="tabular-nums">{i.nodes} nodes</span>
                  {i.prompt && <Agent />}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
