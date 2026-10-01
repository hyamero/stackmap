'use client';

import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { LaidOutDiagram } from '@stackmap/core';
import type { StaticDiagram } from '@/lib/data/static-html';
import { EmbeddedViewer } from '@/components/viewer/EmbeddedViewer';
import './gallery.css';

export interface GalleryItem {
  id: string;
  title: string;
  kind: string;
  nodes: number;
  edges: number;
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

function Agent() {
  return <span className="gt-ag">Written by an agent</span>;
}

function Asked({ prompt }: { prompt: string }) {
  return (
    <section className="mt-7">
      <h4 className="text-[13px] font-semibold text-fg">What the agent was asked</h4>
      <p className="mt-3 text-[14px] leading-[1.6] text-fg">“{prompt}”</p>
      <p className="mt-2.5 text-[12.5px] leading-[1.55] text-fg-muted">
        Written by a coding agent in the skill’s eval: it read the request, wrote the JSON, validated it and delivered the file.
      </p>
    </section>
  );
}

/**
 * The picked diagram in the real viewer, a pager over the filtered list and the thumbnails. `rest` is the first
 * item pre-rendered, which the frame shows before the viewer mounts and without script.
 */
export function Gallery({ items, rest, thumbs, filters }: { items: GalleryItem[]; rest: StaticDiagram; thumbs: Record<string, ReactNode>; filters?: Filter[] }) {
  const [filter, setFilter] = useState(filters?.[0]?.id);
  const shown = items.filter((i) => matches(filters?.find((f) => f.id === filter), i));
  const [selected, setSelected] = useState(items[0]!.id);
  const at = Math.max(0, shown.findIndex((i) => i.id === selected));
  const current = shown[at] ?? items[0]!;
  const step = (by: number) => setSelected(shown[(at + by + shown.length) % shown.length]!.id);
  const pick = (id: string) => {
    setSelected(id);
    document.getElementById('viewer-x')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <>
      <section className="gv" id="viewer-x" aria-label="Example viewer">
        <div className="gv-head">
          <div>
            <h2 className="gv-t">{current.title}</h2>
            <p className="gv-meta">
              <span className="badge">{current.kind}</span>
              <span className="tnum">
                {current.nodes} nodes · {current.edges} connections
              </span>
              {current.prompt && <Agent />}
            </p>
          </div>
          <div className="gv-nav">
            <button type="button" className="ib" aria-label="Previous example" onClick={() => step(-1)}>
              <ArrowLeft size={17} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <span aria-live="polite" className="mono tnum gv-pos">
              {at + 1} / {shown.length}
            </span>
            <button type="button" className="ib" aria-label="Next example" onClick={() => step(1)}>
              <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="gv-frame">
          <EmbeddedViewer
            key={current.id}
            diagram={current.diagram}
            still={current.id === items[0]!.id ? rest : undefined}
            variant="gallery"
            extra={current.prompt && <Asked prompt={current.prompt} />}
          />
        </div>
      </section>

      {filters && (
        <div role="group" aria-label="Filter examples" className="gv-f pnl">
          {filters.map((f) => (
            <button key={f.id} type="button" className="kpill" aria-pressed={f.id === filter} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="tnum">{items.filter((i) => matches(f, i)).length}</span>
            </button>
          ))}
        </div>
      )}

      <ul className={`gv-g ${filters ? '' : 'solo'}`}>
        {shown.map((i) => (
          <li key={i.id}>
            <button type="button" className="gt" aria-pressed={i.id === current.id} onClick={() => pick(i.id)}>
              <span className="gt-s">{thumbs[i.id]}</span>
              <span className="gt-c">
                <span className="gt-t">{i.title}</span>
                <span className="gt-m">
                  <span>{i.kind}</span>
                  <span className="tnum">{i.nodes} nodes</span>
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
