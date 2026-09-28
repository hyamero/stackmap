import type { DiagramNode } from '@stackmap/core';
import { NodeCard } from '../card/NodeCard';
import type { ThemeChoice } from '../theme/theme';
import { boundaryNodes } from './boundary-nodes';
import { GALLERY_SECTIONS } from './gallery-nodes';

// Boundary cards back the card-fit browser test (dev server only); they would ship the metrics table.
const sections = import.meta.env.DEV ? [...GALLERY_SECTIONS, ['Boundary', boundaryNodes()] as const] : GALLERY_SECTIONS;

export function GalleryPage({ theme, onToggleTheme }: { theme: ThemeChoice; onToggleTheme: () => void }) {
  return (
    <div className="min-h-full bg-page px-10 py-8 font-sans text-fg">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-[28px] font-semibold tracking-tight">Card gallery</h1>
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full bg-primary px-4 py-2 text-[14px] font-medium text-primary-fg"
        >
          {theme === 'dark' ? 'Light' : 'Dark'} theme
        </button>
      </header>
      {sections.map(([label, nodes]) => (
        <section key={label} className="mb-10">
          <h2 className="mb-4 text-[11px] font-medium tracking-[0.12em] text-fg-muted uppercase">{label}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,280px)] items-start gap-6">
            {nodes.map((n: DiagramNode) => (
              <NodeCard key={n.id} node={n} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
