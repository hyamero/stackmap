import type { ReactNode } from 'react';
import { FileJson, SquareTerminal } from 'lucide-react';
import type { Owner } from '@/lib/json-lines';
import { CopyButton } from './CopyButton';
import './code.css';

const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g;

/** Keys in the text colour, strings, numbers and booleans each in their own, as the boards print JSON. */
export function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  for (const m of line.matchAll(TOKEN)) {
    const [whole, str, colon, num, bool] = m;
    out.push(line.slice(at, m.index));
    const i = m.index;
    if (str && colon) out.push(<span key={i} className="j-k">{str}</span>, colon);
    else if (str) out.push(<span key={i} className="j-s">{str}</span>);
    else if (num) out.push(<span key={i} className="j-n">{num}</span>);
    else out.push(<span key={i} className="j-b">{bool}</span>);
    at = i + whole.length;
  }
  out.push(line.slice(at));
  return out;
}

/**
 * A JSON file with line numbers, under its name, length and a copy button. `owners` tags each line with the
 * node, edge or group it belongs to, for a figure that links lines and cards.
 */
export function JsonCode({ file, code, owners, label, className = '' }: { file: string; code: string; owners?: (Owner | null)[]; label?: string; className?: string }) {
  const lines = code.split('\n');
  return (
    <figure className={`cb ${className}`}>
      <figcaption className="cb-h">
        <span className="cb-f">
          <FileJson size={15} strokeWidth={1.75} aria-hidden="true" />
          <span className="mono">{file}</span>
        </span>
        <span className="cb-l">{label ?? `${lines.length} lines`}</span>
        <CopyButton text={code} label={`Copy ${file}`} className="cp" />
      </figcaption>
      <pre className="cb-b" tabIndex={0}>
        <code>
          {lines.map((l, i) => (
            <span key={i} className="cl" data-o={owners?.[i] ?? undefined}>
              <span className="cn" aria-hidden="true">
                {i + 1}
              </span>
              <span className="cc">{highlight(l)}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

// How the CLI's output reads in a terminal: the command, a diagnostic's head, its fixes and the verdict.
function TermLine({ line }: { line: string }) {
  if (line.startsWith('$ ')) {
    return (
      <span className="tl t-cmd">
        <span className="t-ps">$</span> {line.slice(2)}
      </span>
    );
  }
  const head = /^(error|warning)(\s+)(\S+)(\s+)(\S+)$/.exec(line);
  if (head) {
    return (
      <span className="tl">
        <span className={head[1] === 'error' ? 't-err' : 't-warn'}>{head[1]}</span>
        {head[2]}
        <span className="t-code">{head[3]}</span>
        {head[4]}
        <span className="t-subj">{head[5]}</span>
      </span>
    );
  }
  const fix = /^(\s+)fix:(.*)$/.exec(line);
  if (fix) {
    return (
      <span className="tl t-fix">
        {fix[1]}
        <span className="t-fixl">fix:</span>
        {fix[2]}
      </span>
    );
  }
  const tone = line.startsWith('✗') ? 't-err' : line.startsWith('✓') ? 't-ok' : line.startsWith('delivered') || line.startsWith('serving') ? 't-ink' : '';
  return <span className={`tl ${tone}`}>{line}</span>;
}

/** A terminal session: `lines` holds commands (`$ …`) and their output. */
export function Terminal({ title, lines, className = '' }: { title: string; lines: string[]; className?: string }) {
  return (
    <figure className={`term ${className}`}>
      <figcaption className="cb-h">
        <span className="cb-f">
          <SquareTerminal size={15} strokeWidth={1.75} aria-hidden="true" />
          <span className="mono">{title}</span>
        </span>
      </figcaption>
      <pre className="term-b" tabIndex={0}>
        <code>
          {lines.map((l, i) => (
            <TermLine key={i} line={l} />
          ))}
        </code>
      </pre>
    </figure>
  );
}
