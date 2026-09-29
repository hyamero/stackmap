import { CircleAlert } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { connectLive, readLiveConfig, type LiveStatus } from '../live';
import { riseIn } from '../motion/motion';
import { useEnter } from '../motion/useEnter';
import { PANEL_CLASS, PANEL_STYLE } from './ui';

const SHOWN = 5;

/** Live status from `stackmap serve`; null in a delivered file (no connection is ever opened). */
export function useLiveStatus(): LiveStatus | null {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  useEffect(() => connectLive(document, setStatus), []);
  return status;
}

export const isLive = () => readLiveConfig(document) !== null;

// Mounts once per appearance, so it rises in when a problem starts and stays still while its errors update.
// The live region around it is persistent: screen readers announce changes to a region, not a new one's content.
function Toast({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEnter(ref, riseIn);
  return (
    <div ref={ref} className={`${PANEL_CLASS} fixed bottom-6 left-1/2 z-50 -translate-x-1/2 font-sans ${className}`} style={PANEL_STYLE}>
      {children}
    </div>
  );
}

export function LiveToast(props: { status: LiveStatus | null; hasDiagram: boolean }) {
  // A delivered file never connects, so it gets no live region at all.
  if (!props.status && !isLive()) return null;
  return (
    <div role="status" aria-live="polite">
      <ToastContent {...props} />
    </div>
  );
}

function ToastContent({ status, hasDiagram }: { status: LiveStatus | null; hasDiagram: boolean }) {
  if (status?.disconnected) {
    return (
      <Toast key="disconnected" className="px-4 py-3 text-[13px] text-fg-muted">
        Disconnected from <code className="font-mono text-fg">stackmap serve</code> · retrying…
      </Toast>
    );
  }
  if (!status || status.ok) return null;
  const errors = status.diagnostics.filter((d) => d.severity === 'error');
  return (
    <Toast key="errors" className="w-[min(560px,calc(100vw-32px))] p-4">
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
    </Toast>
  );
}
