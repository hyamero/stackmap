import { Download } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { download, exportFileName, exportPng, exportSvg } from './export';
import { popIn } from '../motion/motion';
import { PANEL_CLASS, PANEL_STYLE } from './ui';
import { useExplore } from '../explore/ExploreContext';
import { useSceneContent } from '../canvas/ViewportContext';

type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'done'; text: string } | { kind: 'error'; text: string };

export function ExportMenu() {
  const { draft } = useExplore();
  const content = useSceneContent();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  // Opened from the keyboard (ArrowDown, or Enter/Space: a click with detail 0) the menu appears at once.
  const byKey = useRef(false);
  // The menu is right-aligned under the button: grow it from the button's centre.
  useLayoutEffect(() => {
    if (!open || !menu.current || byKey.current) return;
    const b = button.current;
    const motion = popIn(menu.current, `${menu.current.offsetWidth - (b ? b.offsetWidth / 2 : 0)}px 0`);
    return () => motion.cancel();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    addEventListener('pointerdown', onDown);
    return () => removeEventListener('pointerdown', onDown);
  }, [open]);

  const run = async (job: () => Promise<string>) => {
    setOpen(false);
    setStatus({ kind: 'busy' });
    try {
      setStatus({ kind: 'done', text: await job() });
    } catch (e) {
      setStatus({ kind: 'error', text: `Export failed: ${(e as Error).message}` });
    }
    button.current?.focus();
  };
  // A diagram past the canvas limit is exported smaller; say so rather than pretend it's 2×.
  const scaled = (asked: number, got: number) => (got < asked ? ` at ${got.toFixed(2)}× (browser canvas limit)` : '');
  const png = (scale: 1 | 2) =>
    run(async () => {
      const { blob, scale: got } = await exportPng(content, scale);
      download(blob, exportFileName(draft.title, scale === 2 ? '2x.png' : 'png'));
      return `Saved PNG ${scale}×${scaled(scale, got)}`;
    });
  const items = [
    { label: 'PNG', hint: '1×', act: () => png(1) },
    { label: 'PNG', hint: '2×', act: () => png(2) },
    {
      label: 'Copy PNG',
      hint: '2×',
      act: () =>
        run(async () => {
          if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('clipboard not available here');
          const png = exportPng(content, 2);
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': png.then((p) => p.blob) })]);
          const { scale } = await png;
          return `Copied PNG${scaled(2, scale)}`;
        }),
    },
    {
      label: 'SVG',
      hint: 'snapshot',
      act: () =>
        run(async () => {
          download(await exportSvg(content), exportFileName(draft.title, 'svg'));
          return 'Saved SVG';
        }),
    },
  ];

  return (
    <div ref={root} className="relative ml-1">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={status.kind === 'busy'}
        onClick={(e) => {
          byKey.current = e.detail === 0;
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            byKey.current = true;
            setOpen(true);
          }
        }}
        className="sm-press flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-[14px] font-medium text-primary-fg disabled:opacity-60"
      >
        <Download size={16} strokeWidth={2} aria-hidden="true" />
        {status.kind === 'busy' ? 'Exporting…' : 'Export'}
      </button>
      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label="Export"
          // Tab (or any focus move) out of the menu closes it.
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
          }}
          className={`${PANEL_CLASS} absolute top-full right-0 z-20 mt-2 w-[200px] p-1.5`}
          style={PANEL_STYLE}
          onKeyDown={(e) => {
            const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')];
            const i = items.indexOf(document.activeElement as HTMLElement);
            if (e.key === 'ArrowDown') items[(i + 1) % items.length]?.focus();
            else if (e.key === 'ArrowUp') items[(i - 1 + items.length) % items.length]?.focus();
            else if (e.key === 'Home') items[0]?.focus();
            else if (e.key === 'End') items.at(-1)?.focus();
            else if (e.key === 'Escape') {
              setOpen(false);
              button.current?.focus();
            } else return;
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {items.map((item, i) => (
            <button
              key={`${item.label}${item.hint}`}
              type="button"
              role="menuitem"
              autoFocus={i === 0}
              onClick={item.act}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-fg hover:bg-page focus:bg-page focus:outline-none"
            >
              {item.label}
              <span className="text-[12px] text-fg-muted">{item.hint}</span>
            </button>
          ))}
        </div>
      )}
      <span role="status" className="sr-only">
        {status.kind === 'done' || status.kind === 'error' ? status.text : ''}
      </span>
      {status.kind === 'error' && (
        <p className="absolute top-full right-0 mt-2 w-max max-w-[260px] rounded-lg bg-panel px-3 py-2 text-[12px] text-fg" style={PANEL_STYLE}>
          {status.text}
        </p>
      )}
    </div>
  );
}
