import { useMemo } from 'react';
import { useExplore } from '../explore/ExploreContext';
import type { Scene } from '../canvas/scene';
import type { Flow } from './flow';
import { flowOf } from './flowOf';

export { flowOf };

export function useFlow(scene: Scene): Flow {
  const { graph, state, emphasis } = useExplore();
  const { route, selected } = state;
  return useMemo(() => flowOf(scene, graph, { route, selected }, emphasis), [scene, graph, route, selected, emphasis]);
}
