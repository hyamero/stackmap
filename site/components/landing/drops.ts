import type { LaidOutDiagram } from '@stackmap/core';
import { toScene } from '@stackmap/viewer/src/canvas/scene';
import type { Tween } from './timeline';

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

const ENTER = 'cb:0.23,1,0.32,1';

/**
 * The viewer scene's own timelines: each card takes the board's drop for its layer, connections fade in
 * after the map flattens, and the intro hands over to the real viewer by 76%.
 */
export function viewerTweens(diagram: LaidOutDiagram, board: Tween[]): Tween[] {
  const drop = (layer: number) => board.find((t) => t.target === `.a-drop${layer}`)?.frames;
  const drops = [...dropLayers(diagram)].flatMap(([id, layer]) => {
    const frames = drop(layer);
    return frames ? [{ target: `.plane [data-card-id="${id}"]`, frames }] : [];
  });
  return [
    ...drops,
    { target: '.plane .sm-edges, .plane .sm-edge-label', frames: { '0%': { opacity: '0' }, '47%': { opacity: '0' }, '58%': { opacity: '1', ease: 'cb:0.33,1,0.68,1' }, '100%': { opacity: '1' } } },
    { target: '.vintro', frames: { '0%': { autoAlpha: '1' }, '76%': { autoAlpha: '1' }, '80%': { autoAlpha: '0', ease: ENTER }, '100%': { autoAlpha: '0' } } },
    { target: '.vreal', frames: { '0%': { autoAlpha: '0' }, '60%': { autoAlpha: '0' }, '76%': { autoAlpha: '1', ease: ENTER }, '100%': { autoAlpha: '1' } } },
  ];
}
