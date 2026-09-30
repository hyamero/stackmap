'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { LaidOutDiagram } from '@stackmap/core';
import type { StaticDiagram } from '@/lib/data/static-html';
import { FitDiagram } from '@/components/diagram/FitDiagram';

const LiveViewer = dynamic(() => import('@/components/examples/LiveViewer'), { ssr: false });

/**
 * The real viewer, mounted once its box is on screen (and visible: the other composition's copy never mounts).
 * Until then, and without script, the same diagram at rest.
 */
export function LazyViewer({ diagram, still, width, height }: { diagram: LaidOutDiagram; still: StaticDiagram; width: number; height: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting && el.offsetParent !== null) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: '50% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="size-full">
      {mounted ? <LiveViewer diagram={diagram} /> : <FitDiagram still={still} width={width} height={height} pad={48} fill />}
    </div>
  );
}
