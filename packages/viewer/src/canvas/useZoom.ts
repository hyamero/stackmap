import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom';
import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { Point, Rect } from '@stackmap/core';
import { fitTransform, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP, type Size, type Transform } from './viewport';

export interface ViewportApi {
  transform: Transform;
  stage: Size;
  zoomIn(): void;
  zoomOut(): void;
  fit(): void;
  centerOn(p: Point): void;
}

const duration = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150);
const toZoom = (t: Transform) => zoomIdentity.translate(t.x, t.y).scale(t.k);

export function useZoom(stageRef: RefObject<HTMLDivElement | null>, content: Rect): ViewportApi {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [stage, setStage] = useState<Size>({ width: 0, height: 0 });
  const behavior = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const sel = select(el);
    const z = zoom<HTMLDivElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on('zoom', (event: D3ZoomEvent<HTMLDivElement, unknown>) => {
        const { x, y, k } = event.transform;
        setTransform({ x, y, k });
      });
    // Double-click zoom is a surprise in a viewer where clicks will select nodes (M3).
    sel.call(z).on('dblclick.zoom', null);
    behavior.current = z;

    const size = { width: el.clientWidth, height: el.clientHeight };
    setStage(size);
    sel.call(z.transform, toZoom(fitTransform(content, size)));

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => setStage({ width: el.clientWidth, height: el.clientHeight }));
    observer?.observe(el);
    return () => {
      observer?.disconnect();
      sel.on('.zoom', null);
      behavior.current = null;
    };
  }, [stageRef, content]);

  const animate = useCallback(
    (apply: (z: ZoomBehavior<HTMLDivElement, unknown>, el: HTMLDivElement) => void) => {
      const el = stageRef.current;
      const z = behavior.current;
      if (el && z) apply(z, el);
    },
    [stageRef],
  );

  const zoomIn = useCallback(
    () => animate((z, el) => select(el).transition().duration(duration()).call(z.scaleBy, ZOOM_STEP)),
    [animate],
  );
  const zoomOut = useCallback(
    () => animate((z, el) => select(el).transition().duration(duration()).call(z.scaleBy, 1 / ZOOM_STEP)),
    [animate],
  );
  const fit = useCallback(
    () =>
      animate((z, el) =>
        select(el)
          .transition()
          .duration(duration())
          .call(z.transform, toZoom(fitTransform(content, { width: el.clientWidth, height: el.clientHeight }))),
      ),
    [animate, content],
  );
  const centerOn = useCallback(
    (p: Point) => animate((z, el) => select(el).transition().duration(duration()).call(z.translateTo, p.x, p.y)),
    [animate],
  );

  return { transform, stage, zoomIn, zoomOut, fit, centerOn };
}
