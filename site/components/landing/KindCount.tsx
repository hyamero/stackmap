'use client';

import { useEffect, useRef, useState } from 'react';
import { HOLDS } from './kinds-geometry';

/** The phone's "3 / 5 · one checkout, five ways", following the scroll while the scene scrubs. */
export function KindCount({ rest, total }: { rest: number; total: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [kind, setKind] = useState(rest);
  useEffect(() => {
    const scene = ref.current?.closest<HTMLElement>('[data-scene]');
    if (!scene) return;
    const onScene = (e: Event) => {
      const pct = (e as CustomEvent<number>).detail * 100;
      setKind(Math.max(0, HOLDS.findLastIndex(([a]) => pct >= a - 3.5)));
    };
    scene.addEventListener('scene', onScene);
    return () => scene.removeEventListener('scene', onScene);
  }, []);
  return (
    <p ref={ref} className="kcount mono tnum">
      {kind + 1} / {total} · one checkout, five ways
    </p>
  );
}
