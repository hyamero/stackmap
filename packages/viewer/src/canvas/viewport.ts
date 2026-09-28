import type { Rect } from '@stackmap/core';

export interface Transform {
  x: number;
  y: number;
  k: number;
}

export interface Size {
  width: number;
  height: number;
}

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 1.2;
export const FIT_PADDING = 0.15;

export const clampZoom = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));

// Same formula as React Flow's fitView, so M0's tuned layouts keep their fitted zoom.
export function fitTransform(content: Rect, stage: Size, padding = FIT_PADDING): Transform {
  if (stage.width <= 0 || stage.height <= 0 || content.width <= 0 || content.height <= 0) return { x: 0, y: 0, k: 1 };
  const k = clampZoom(
    Math.min(stage.width / (content.width * (1 + padding)), stage.height / (content.height * (1 + padding))),
  );
  return {
    x: (stage.width - content.width * k) / 2 - content.x * k,
    y: (stage.height - content.height * k) / 2 - content.y * k,
    k,
  };
}

/** The part of the diagram currently visible on stage, in diagram coordinates. */
export function viewportRect(t: Transform, stage: Size): Rect {
  return { x: -t.x / t.k, y: -t.y / t.k, width: stage.width / t.k, height: stage.height / t.k };
}
