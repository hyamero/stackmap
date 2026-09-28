import { Panel } from '@xyflow/react';
import { ChevronRight } from 'lucide-react';
import type { LaidOutDiagram } from '@stackmap/core';
import { DiagramCanvas } from '../canvas/DiagramCanvas';
import type { ThemeChoice } from '../theme/theme';
import { IdentityCard } from './IdentityCard';
import { Inspector } from './Inspector';
import { Toolbar } from './Toolbar';

const KIND_LABEL = { architecture: 'Architecture', dataflow: 'Dataflow' } as const;

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
  const tabs = [{ id: 'overview', label: 'Overview' }, ...(draft.views ?? [])];
  return (
    <div className="flex h-full flex-col bg-page font-sans text-fg">
      <header className="px-8 pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-fg-muted">
          <span>stackmap</span>
          <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
          <span className="text-fg">{KIND_LABEL[draft.kind]}</span>
        </nav>
        <div className="mt-3 flex items-end justify-between gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] leading-9 font-semibold tracking-tight">{draft.title}</h1>
            <span
              className="rounded-lg bg-panel px-2.5 py-1 text-[13px] text-fg-muted"
              style={{ boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)' }}
            >
              {KIND_LABEL[draft.kind]}
            </span>
          </div>
          <span className="pb-1 text-[14px] text-fg-muted">
            {draft.nodes.length} nodes · {draft.edges.length} connections
          </span>
        </div>
        <div role="tablist" aria-label="Views" className="mt-5 flex gap-7 border-b border-divider">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={i === 0}
              className="-mb-px border-b-2 border-transparent pb-3 text-[14.5px] text-fg-muted aria-selected:border-fg aria-selected:text-fg"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <main className="flex min-h-0 flex-1 gap-4 px-8 pt-5 pb-6">
        <section
          aria-label="Diagram"
          className="relative min-w-0 flex-1 overflow-hidden rounded-[20px] bg-stage"
          style={{ boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)' }}
        >
          <DiagramCanvas diagram={diagram} theme={theme}>
            <Panel position="top-left" className="flex gap-2">
              <IdentityCard draft={draft} />
              <Toolbar theme={theme} onToggleTheme={onToggleTheme} />
            </Panel>
          </DiagramCanvas>
        </section>
        <Inspector draft={draft} />
      </main>
    </div>
  );
}
