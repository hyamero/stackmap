'use client';

import { useEffect, useRef, useState } from 'react';

/** The landing's copy button: the board's `.ib.cp`, which swaps its icon to a check while `.done`. */
export function BoardCopy({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () => {
    const finish = () => {
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1600);
    };
    navigator.clipboard?.writeText(text).then(finish, finish) ?? finish();
  };
  return (
    <button className={`ib cp ${done ? 'done' : ''}`} type="button" aria-label={done ? 'Copied' : label} onClick={copy}>
      <svg className="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-i="copy">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
      <svg className="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-i="check">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  );
}
