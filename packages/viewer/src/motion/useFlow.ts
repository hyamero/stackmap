import { useMemo } from 'react';
import { useExplore } from '../explore/ExploreContext';
import { routeBetween, type Graph } from '../explore/graph';
import type { Emphasis } from '../explore/emphasis';
import type { ExploreState } from '../explore/state';
import type { Scene } from '../canvas/scene';
import { hopFlow, hopRanks, NO_FLOW, waveFlow, type Flow } from './flow';

/**
 * The flow that plays is whatever the explorer is showing: a route runs hop by hop from its start, a selection
 * (traced or not) runs through its lit connections, and otherwise everything not dimmed (by a view, the lens or
 * a search) runs as one wave in reading order, in time order for a sequence.
 */
export function flowOf(scene: Scene, graph: Graph, state: Pick<ExploreState, 'route' | 'selected'>, em: Emphasis): Flow {
  const lit = scene.edges.filter((e) => em.edges.get(e.id)?.tint);
  if (state.route) {
    const route = routeBetween(graph, state.route.from, state.route.to);
    if (!route) return NO_FLOW;
    // A reversed route's `from` is already the end it really runs from.
    return hopFlow(lit, hopRanks(graph, new Set(lit.map((e) => e.id)), { start: route.from, fallback: route.from }));
  }
  if (state.selected) return hopFlow(lit, hopRanks(graph, new Set(lit.map((e) => e.id)), { fallback: state.selected }));
  const rect = new Map(scene.cards.map((c) => [c.node.id, c.rect]));
  const at = (e: Scene['edges'][number]) => {
    if (scene.kind === 'sequence') return e.points[0]?.y ?? 0;
    const r = rect.get(e.from);
    return r ? (scene.direction === 'RIGHT' ? r.x : r.y) : 0;
  };
  return waveFlow(scene.edges.filter((e) => !em.edges.get(e.id)?.dim).map((e) => ({ ...e, at: at(e) })));
}

export function useFlow(scene: Scene): Flow {
  const { graph, state, emphasis } = useExplore();
  const { route, selected } = state;
  return useMemo(() => flowOf(scene, graph, { route, selected }, emphasis), [scene, graph, route, selected, emphasis]);
}
