'use client';

import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  label: string;
}

/** "On this page": the current section is the last heading above the top third of the window. */
export function Toc({ items }: { items: TocItem[] }) {
  const [current, setCurrent] = useState(items[0]?.id);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let on = items[0]?.id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.32) on = id;
      }
      setCurrent(on);
    };
    const onScroll = () => (frame ||= requestAnimationFrame(update));
    update();
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {items.map((t) => (
        <li key={t.id}>
          <a
            href={`#${t.id}`}
            aria-current={t.id === current ? 'true' : undefined}
            className="block py-[5px] pl-3.5 text-[13.5px] leading-[1.4] text-fg-muted no-underline shadow-[inset_1.5px_0_0_var(--sm-panel-border)] transition-[color,box-shadow] duration-150 hover:text-fg aria-[current=true]:text-fg aria-[current=true]:shadow-[inset_1.5px_0_0_var(--sm-text)]"
          >
            {t.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
