import { countByType, TYPE_LABELS, type DiagramDraft } from '@stackmap/core';
import { PANEL_STYLE } from './ui';

const eyebrow = 'text-[11px] font-medium tracking-[0.12em] text-fg-muted uppercase';

export function Inspector({ draft }: { draft: DiagramDraft }) {
  return (
    <aside className="w-[300px] shrink-0 overflow-y-auto rounded-[20px] bg-panel p-5" style={PANEL_STYLE}>
      <div className={eyebrow}>Diagram</div>
      <h2 className="mt-2 text-[18px] font-semibold tracking-tight text-fg">{draft.title}</h2>
      {draft.subtitle && <p className="mt-1 text-[13px] text-fg-muted">{draft.subtitle}</p>}
      <div className={`${eyebrow} mt-8`} aria-hidden="true">
        Legend
      </div>
      <ul aria-label="Legend" className="mt-3 space-y-2.5">
        {countByType(draft.nodes).map(([type, count]) => (
          <li key={type} className="flex items-center justify-between text-[13px] text-fg">
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: `var(--sm-${type}-accent)` }} />
              {TYPE_LABELS[type]}
            </span>
            <span className="text-fg-muted tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
