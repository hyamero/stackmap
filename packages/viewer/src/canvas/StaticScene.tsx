import { useMemo } from 'react';
import type { LaidOutDiagram } from '@stackmap/core';
import type { Emphasis } from '../explore/emphasis';
import { DispatchProvider } from '../explore/ExploreContext';
import { toScene } from './scene';
import { SceneLayers } from './SceneLayers';
import type { Camera } from './useZoom';
import { CameraProvider } from './ViewportContext';

const noop = () => {};
const still: Camera = { zoomIn: noop, zoomOut: noop, fit: noop, centerOn: noop, fitRect: noop, panBy: noop, ensureVisible: noop };
const calm: Emphasis = { active: false, nodes: new Map(), edges: new Map() };

/**
 * The diagram as drawn at rest, at its natural size: no explorer, camera or motion, and nothing that
 * reads the page (so it renders on a server). Inert, since its cards would otherwise be buttons that do nothing.
 */
export function StaticScene({ diagram }: { diagram: LaidOutDiagram }) {
  const scene = useMemo(() => toScene(diagram), [diagram]);
  const { content } = scene;
  return (
    <DispatchProvider value={noop}>
      <CameraProvider value={still}>
        <div inert className="relative" style={{ width: content.width, height: content.height }}>
          <div className="absolute top-0 left-0" style={{ transform: `translate(${-content.x}px, ${-content.y}px)` }}>
            <SceneLayers scene={scene} emphasis={calm} selected={null} />
          </div>
        </div>
      </CameraProvider>
    </DispatchProvider>
  );
}
