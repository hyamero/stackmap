import type { LaidOutDiagram } from '@stackmap/core';
import { toScene } from '@stackmap/viewer/src/canvas/scene';

/** The board has six drop beats; ranks past the last share it. */
export const DROP_BEATS = 6;

/**
 * "Cards drop onto the tilted map, layer by layer": a card's layer is its rank along the flow, so the
 * diagram lands from its entry points outward. Ranks come from the laid-out positions, not a list.
 */
export function dropLayers(diagram: LaidOutDiagram): Map<string, number> {
  const scene = toScene(diagram);
  const horizontal = scene.direction === 'RIGHT';
  const along = (id: string) => {
    const r = scene.cards.find((c) => c.node.id === id)!.rect;
    return horizontal ? r.x : r.y;
  };
  const ranks = [...new Set(scene.cards.map((c) => along(c.node.id)))].sort((a, b) => a - b);
  return new Map(scene.cards.map((c) => [c.node.id, Math.min(DROP_BEATS - 1, ranks.indexOf(along(c.node.id)))]));
}
