import { Ellipsis, Workflow } from 'lucide-react';
import type { DiagramDraft } from '@stackmap/core';
import { IconButton, PANEL_CLASS, PANEL_STYLE } from './ui';

export function IdentityCard({ draft }: { draft: DiagramDraft }) {
  return (
    <div className={`${PANEL_CLASS} flex items-center gap-3 py-2 pr-2 pl-3`} style={PANEL_STYLE}>
      <div className="grid size-9 place-items-center rounded-xl bg-page text-fg-muted">
        <Workflow size={17} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="min-w-0 pr-4">
        <div className="truncate text-[14px] leading-5 font-medium text-fg">{draft.title}</div>
        {draft.subtitle && <div className="truncate text-[12.5px] leading-4 text-fg-muted">{draft.subtitle}</div>}
      </div>
      <IconButton label="Diagram menu">
        <Ellipsis size={17} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
