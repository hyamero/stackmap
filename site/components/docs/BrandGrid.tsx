'use client';

import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Search } from 'lucide-react';

/**
 * Filters the server-rendered brand list by slug or name, and copies a slug when it's clicked. The list itself
 * (146 marks) stays server markup; this only hides items and marks the one copied.
 */
export function BrandGrid({ total, children }: { total: number; children: ReactNode }) {
  const grid = useRef<HTMLUListElement>(null);
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(total);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const filter = (value: string) => {
    setQ(value);
    const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let n = 0;
    for (const li of grid.current?.querySelectorAll<HTMLLIElement>('.br') ?? []) {
      const hit = words.every((w) => (li.dataset.hay ?? '').includes(w));
      li.hidden = !hit;
      if (hit) n++;
    }
    setShown(n);
  };

  const copy = (e: MouseEvent) => {
    const li = (e.target as Element).closest<HTMLLIElement>('.br');
    const slug = li?.dataset.slug;
    if (!li || !slug) return;
    const done = () => {
      for (const x of grid.current?.querySelectorAll('[data-done]') ?? []) x.removeAttribute('data-done');
      li.setAttribute('data-done', '');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => li.removeAttribute('data-done'), 1400);
    };
    navigator.clipboard?.writeText(slug).then(done, done) ?? done();
  };

  return (
    <>
      <div className="br-bar">
        <label className="br-q">
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="sr-only">Filter brands</span>
          <input type="search" placeholder="Filter brands" autoComplete="off" spellCheck={false} value={q} onChange={(e) => filter(e.target.value)} />
        </label>
        <span className="br-n tnum" aria-live="polite">
          {shown === total ? `${total} brands` : `${shown} of ${total}`}
        </span>
      </div>
      <ul ref={grid} className="br-g" onClick={copy}>
        {children}
      </ul>
    </>
  );
}
