import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom';
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Point, Rect } from '@stackmap/core';
import { CHROME_INSET, fitTransform, MAX_ZOOM, MIN_ZOOM, viewportRect, ZOOM_STEP, type Size, type Transform } from './viewport';

/** Camera moves. Stable across renders, so consumers don't re-render on every pan/zoom frame. */
export interface Camera {
  zoomIn(): void;
  zoomOut(): void;
  fit(): void;
  centerOn(p: Point): void;
  /** Fit an arbitrary diagram-space rect (e.g. a view's members), never zooming past 100%. */
  fitRect(r: Rect): void;
  panBy(dx: number, dy: number): void;
  /** Pan the least distance that brings `r` fully on stage; no-op when it already is. */
  ensureVisible(r: Rect): void;
}

export interface ViewportApi extends Camera {
  transform: Transform;
  stage: Size;
  camera: Camera;
}

// Stage bands covered by the top-left toolbar row and the bottom-left zoom bar (15px inset + panel + gap).
const OVERLAY_BANDS = { top: 80, bottom: 76 };

const duration = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150);
const toZoom = (t: Transform) => zoomIdentity.translate(t.x, t.y).scale(t.k);

export function useZoom(stageRef: RefObject<HTMLDivElement | null>, content: Rect): ViewportApi {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const current = useRef(transform);
  current.current = transform;
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
    sel.call(z.transform, toZoom(fitTransform(content, size, { inset: CHROME_INSET })));

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
          .call(z.transform, toZoom(fitTransform(content, { width: el.clientWidth, height: el.clientHeight }, { inset: CHROME_INSET }))),
      ),
    [animate, content],
  );
  const centerOn = useCallback(
    (p: Point) => animate((z, el) => select(el).transition().duration(duration()).call(z.translateTo, p.x, p.y)),
    [animate],
  );

  const fitRect = useCallback(
    (r: Rect) =>
      animate((z, el) => {
        const t = fitTransform(r, { width: el.clientWidth, height: el.clientHeight });
        const k = Math.min(t.k, 1);
        const cx = r.x + r.width / 2;
        const cy = r.y + r.height / 2;
        const next = { x: el.clientWidth / 2 - cx * k, y: el.clientHeight / 2 - cy * k, k };
        select(el).transition().duration(duration()).call(z.transform, toZoom(next));
      }),
    [animate],
  );
  const panBy = useCallback(
    (dx: number, dy: number) =>
      animate((z, el) => select(el).transition().duration(duration()).call(z.translateBy, dx / current.current.k, dy / current.current.k)),
    [animate],
  );
  const ensureVisible = useCallback(
    (r: Rect) =>
      animate((z, el) => {
        const { k } = current.current;
        const margin = 24 / k;
        const full = viewportRect(current.current, { width: el.clientWidth, height: el.clientHeight });
        // Treat the overlay bands as off-screen so a focused card never ends up under the chrome.
        const v = { ...full, y: full.y + OVERLAY_BANDS.top / k, height: full.height - (OVERLAY_BANDS.top + OVERLAY_BANDS.bottom) / k };
        const shift = (lo: number, size: number, vlo: number, vsize: number) =>
          lo - margin < vlo ? lo - margin - vlo : lo + size + margin > vlo + vsize ? lo + size + margin - (vlo + vsize) : 0;
        const dx = shift(r.x, r.width, v.x, v.width);
        const dy = shift(r.y, r.height, v.y, v.height);
        if (dx || dy) select(el).transition().duration(duration()).call(z.translateBy, -dx, -dy);
      }),
    [animate],
  );

  const camera = useMemo<Camera>(
    () => ({ zoomIn, zoomOut, fit, centerOn, fitRect, panBy, ensureVisible }),
    [zoomIn, zoomOut, fit, centerOn, fitRect, panBy, ensureVisible],
  );
  return { transform, stage, camera, ...camera };
}
