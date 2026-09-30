'use client';

import { useEffect, useRef, useState } from 'react';
import { DIAGRAM_KINDS, KIND_LABELS } from '@stackmap/core';
import { HOLDS } from './kinds-geometry';

/**
 * The kind pills. While the page scrubs they seek to that kind's hold and follow the scroll; at rest they
 * switch the shown kind in place (the scene's data-kind picks the layer, faces and slot positions).
 */
export function KindPills({ rest }: { rest: number }) {
  const ref = useRef<HTMLDivElement>(null);
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
  const pick = (k: number) => {
    const scene = ref.current?.closest<HTMLElement>('[data-scene]');
    const root = scene?.closest<HTMLElement>('.lp');
    if (!scene || !root) return;
    setKind(k);
    if (root.classList.contains('live')) {
      const [a, b] = HOLDS[k]!;
      root.dispatchEvent(new CustomEvent('seek', { detail: { id: scene.dataset.scene, p: (a + b) / 200 } }));
    } else scene.dataset.kind = DIAGRAM_KINDS[k];
  };
  return (
    <div ref={ref} className="kpills pnl" role="group" aria-label="Diagram kinds">
      {DIAGRAM_KINDS.map((k, i) => (
        <button key={k} className="kpill" type="button" aria-pressed={i === kind} onClick={() => pick(i)}>
          {KIND_LABELS[k]}
        </button>
      ))}
    </div>
  );
}
