'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

/** Pill tabs over panels the server already rendered; arrows, Home and End move between them. */
export function Tabs({ label, tabs, mono = false }: { label: string; tabs: { id: string; label: string; panel: ReactNode }[]; mono?: boolean }) {
  const [on, setOn] = useState(0);
  const ids = useId();
  const list = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const to = { ArrowRight: on + 1, ArrowLeft: on - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const i = (to + tabs.length) % tabs.length;
    setOn(i);
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[i]?.focus();
  };
  return (
    <>
      <div ref={list} className="fam" role="tablist" aria-label={label} onKeyDown={onKey}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${ids}-t${i}`}
            className={`fam-b ${mono ? 'mono' : ''}`}
            aria-selected={i === on}
            aria-controls={`${ids}-p${i}`}
            tabIndex={i === on ? 0 : -1}
            onClick={() => setOn(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} className="fam-p" role="tabpanel" id={`${ids}-p${i}`} aria-labelledby={`${ids}-t${i}`} data-on={i === on} hidden={i !== on}>
          {t.panel}
        </div>
      ))}
    </>
  );
}
