import { Ellipsis, Workflow } from 'lucide-react';
import type { DiagramDraft } from '@stackmap/core';
import { IconButton, PANEL_CLASS, PANEL_STYLE } from './ui';

export function IdentityCard({ draft, onDetails }: { draft: DiagramDraft; onDetails?: () => void }) {
  return (
    <div className={`${PANEL_CLASS} flex min-w-0 items-center gap-3 py-2 pr-2 pl-3`} style={PANEL_STYLE}>
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-page text-fg-muted">
        <Workflow size={17} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="min-w-0 pr-4">
        <div className="truncate text-[14px] leading-5 font-medium text-fg" title={draft.title}>
          {draft.title}
        </div>
        {draft.subtitle && (
          <div className="truncate text-[12.5px] leading-4 text-fg-muted" title={draft.subtitle}>
            {draft.subtitle}
          </div>
        )}
      </div>
      <IconButton label="Diagram details" onClick={onDetails}>
        <Ellipsis size={17} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
