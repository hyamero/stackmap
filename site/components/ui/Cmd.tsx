import { CopyButton } from './CopyButton';

/** A shell command in a panel with its copy button (the canvas's `.cmd`). */
export function Cmd({ command, label, big = false, className = '' }: { command: string; label: string; big?: boolean; className?: string }) {
  return (
    <div className={`cmd pnl ${big ? 'big' : ''} ${className}`}>
      <span className="mono cmd-p" aria-hidden="true">
        $
      </span>
      <code className="mono cmd-t">{command}</code>
      <CopyButton text={command} label={label} />
    </div>
  );
}
