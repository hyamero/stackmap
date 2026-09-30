'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { LaidOutDiagram } from '@stackmap/core';
import { toScene } from '@stackmap/viewer/src/canvas/scene';
import { StaticScene } from '@stackmap/viewer/src/canvas/StaticScene';

const GRID = 20;

/**
 * A diagram at rest, scaled to fit its box and never past 100%. `width` is the box's width at the design
 * size, so the server's markup is already fitted; once hydrated it follows the box's real size.
 */
export function FitDiagram({
  diagram,
  width,
  height,
  pad = 24,
  fill = false,
  className = '',
}: {
  diagram: LaidOutDiagram;
  width: number;
  height: number;
  pad?: number;
  /** take the parent's height instead of `height`, which then only sets the first fit */
  fill?: boolean;
  className?: string;
}) {
  const { content } = useMemo(() => toScene(diagram), [diagram]);
  const fit = useCallback((w: number, h: number) => Math.min(1, (w - 2 * pad) / content.width, (h - 2 * pad) / content.height), [content, pad]);
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(() => fit(width, height));
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setK(fit(el.clientWidth, el.clientHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);
  return (
    <div
      ref={box}
      role="img"
      aria-label={`${diagram.draft.title}: ${diagram.draft.nodes.length} nodes, ${diagram.draft.edges.length} connections`}
      className={`relative overflow-hidden bg-stage ${className}`}
      style={{
        height: fill ? '100%' : height,
        backgroundImage: 'radial-gradient(circle, var(--sm-grid) 1px, transparent 1.25px)',
        backgroundSize: `${GRID * k}px ${GRID * k}px`,
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute top-1/2 left-1/2" style={{ transform: `translate(-50%, -50%) scale(${k})` }}>
        <StaticScene diagram={diagram} />
      </div>
    </div>
  );
}
