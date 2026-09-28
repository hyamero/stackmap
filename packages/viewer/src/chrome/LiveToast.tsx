import { CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { connectLive, readLiveConfig, type LiveStatus } from '../live';
import { PANEL_CLASS, PANEL_STYLE } from './ui';

const SHOWN = 5;

/** Live status from `stackmap serve`; null in a delivered file (no connection is ever opened). */
export function useLiveStatus(): LiveStatus | null {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  useEffect(() => connectLive(document, setStatus), []);
  return status;
}

export const isLive = () => readLiveConfig(document) !== null;

export function LiveToast({ status, hasDiagram }: { status: LiveStatus | null; hasDiagram: boolean }) {
  if (!status || status.ok) return null;
  const errors = status.diagnostics.filter((d) => d.severity === 'error');
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${PANEL_CLASS} fixed bottom-6 left-1/2 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 p-4 font-sans`}
      style={PANEL_STYLE}
    >
      <p className="flex items-center gap-2 text-[14px] font-medium text-fg">
        <CircleAlert size={16} strokeWidth={2} aria-hidden="true" style={{ color: 'var(--sm-cache-accent)' }} />
        {errors.length} error{errors.length === 1 ? '' : 's'} in the diagram
        <span className="font-normal text-fg-muted">
          · {hasDiagram ? 'showing the last good version' : 'waiting for a valid diagram'}
        </span>
      </p>
      <ul className="mt-2 space-y-1.5">
        {errors.slice(0, SHOWN).map((d, i) => (
          <li key={i} className="text-[12.5px] leading-5 text-fg-muted">
            <code className="font-mono text-[12px] text-fg">{d.code}</code> <code className="font-mono text-[12px]">{d.subject || '(root)'}</code>{' '}
            {d.message}
          </li>
        ))}
        {errors.length > SHOWN && <li className="text-[12.5px] text-fg-muted">…and {errors.length - SHOWN} more (run `stackmap validate`)</li>}
      </ul>
    </div>
  );
}
