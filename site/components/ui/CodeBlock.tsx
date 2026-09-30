import type { ReactNode } from 'react';
import { NODE_TYPES } from '@stackmap/core';
import { CopyButton } from './CopyButton';

const TYPES: ReadonlySet<string> = new Set(NODE_TYPES);
const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)/g;

// Keys muted, values in the text colour, and a node type in its own accent, as the canvas shows JSON.
function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  for (const m of line.matchAll(TOKEN)) {
    out.push(line.slice(at, m.index));
    const [whole, str, colon, num] = m;
    const i = m.index;
    if (str && colon) out.push(<span key={i} className="text-fg-muted">{str}</span>, colon);
    else if (str && TYPES.has(str.slice(1, -1)) && /"type":\s*$/.test(line.slice(0, i))) {
      out.push(<span key={i} style={{ color: `var(--sm-${str.slice(1, -1)}-accent)` }}>{str}</span>);
    } else out.push(<span key={i} className="text-fg">{str ?? num}</span>);
    at = i + whole.length;
  }
  out.push(line.slice(at));
  return out;
}

/** Pretty JSON under a file-name header. `maxLines` cuts it with an ellipsis line. */
export function CodeBlock({ file, code, copy, maxLines, className = '' }: { file: string; code: string; copy?: boolean; maxLines?: number; className?: string }) {
  const all = code.split('\n');
  const lines = maxLines && all.length > maxLines ? [...all.slice(0, maxLines), '  …'] : all;
  return (
    <div className={`overflow-hidden rounded-[14px] bg-panel shadow-[inset_0_0_0_1px_var(--sm-panel-border)] ${className}`}>
      <div className="flex h-[42px] items-center justify-between pr-1.5 pl-[18px] text-[12.5px] text-fg-muted shadow-[inset_0_-1px_0_var(--sm-panel-border)]">
        <span className="font-mono">{file}</span>
        {copy && <CopyButton text={code} label={`Copy ${file}`} className="size-8" />}
      </div>
      <pre className="m-0 overflow-x-auto px-5 pt-4 pb-[18px] font-mono text-code text-fg-muted">
        <code>
          {lines.map((l, i) => (
            <span key={i} className="block whitespace-pre">
              {highlight(l)}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/** A shell command with a copy button. */
export function Command({ command, label, className = '' }: { command: string; label: string; className?: string }) {
  return (
    <div className={`flex h-[52px] items-center gap-3 rounded-[14px] bg-panel pr-2 pl-[18px] shadow-panel ${className}`}>
      <span aria-hidden="true" className="font-mono text-[15px] text-fg-muted">
        $
      </span>
      <code className="min-w-0 flex-auto truncate font-mono text-[15px] text-fg">{command}</code>
      <CopyButton text={command} label={label} />
    </div>
  );
}
