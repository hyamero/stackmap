import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { LaidOutDiagram } from '@stackmap/core';
import { ZoomBar } from '../chrome/ZoomBar';
import { CanvasPanel } from './CanvasPanel';
import { Minimap } from './Minimap';
import { toScene } from './scene';
import { SceneLayers } from './SceneLayers';
import { useZoom } from './useZoom';
import type { Transform } from './viewport';
import { ViewportProvider } from './ViewportContext';

const GRID = 20;

// Dot grid that pans and scales with the diagram, like the M0 React Flow background.
function gridStyle({ x, y, k }: Transform): CSSProperties {
  const gap = GRID * k;
  const r = Math.max(0.5, 1.2 * k);
  return {
    backgroundImage: `radial-gradient(circle, var(--sm-grid) ${r}px, transparent ${r + 0.5}px)`,
    backgroundSize: `${gap}px ${gap}px`,
    backgroundPosition: `${x % gap}px ${y % gap}px`,
  };
}

export function DiagramCanvas({ diagram, children }: { diagram: LaidOutDiagram; children?: ReactNode }) {
  const scene = useMemo(() => toScene(diagram), [diagram]);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewport = useZoom(stageRef, scene.content);
  const [minimap, setMinimap] = useState(false);
  const { x, y, k } = viewport.transform;

  return (
    <ViewportProvider value={viewport}>
      <div className="relative size-full">
        <div
          ref={stageRef}
          role="region"
          aria-label="Diagram canvas"
          className="sm-stage absolute inset-0 cursor-grab overflow-hidden active:cursor-grabbing"
          style={gridStyle(viewport.transform)}
        >
          <div
            className="sm-viewport absolute top-0 left-0 origin-top-left"
            style={{ transform: `translate(${x}px, ${y}px) scale(${k})` }}
          >
            <SceneLayers scene={scene} />
          </div>
        </div>
        {/* Overlays are siblings of the stage, so wheel/drag on them never reaches d3-zoom. */}
        <CanvasPanel position="bottom-left">
          <ZoomBar minimapOn={minimap} onToggleMinimap={() => setMinimap((v) => !v)} />
        </CanvasPanel>
        {minimap && (
          <CanvasPanel position="bottom-right">
            <Minimap scene={scene} />
          </CanvasPanel>
        )}
        {children}
      </div>
    </ViewportProvider>
  );
}
