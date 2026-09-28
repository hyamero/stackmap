import { useMemo, useRef, useState, type ReactNode } from 'react';
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
const DOT = 1.2;

// Dot grid that pans and scales with the diagram — React Flow's <Background> pattern, so dot size and weight match M0.
function DotGrid({ x, y, k }: Transform) {
  const gap = GRID * k;
  const r = (DOT * k) / 2;
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
      <pattern
        id="sm-grid"
        patternUnits="userSpaceOnUse"
        x={x % gap}
        y={y % gap}
        width={gap}
        height={gap}
        patternTransform={`translate(${-gap / 2},${-gap / 2})`}
      >
        <circle cx={r} cy={r} r={r} style={{ fill: 'var(--sm-grid)' }} />
      </pattern>
      <rect width="100%" height="100%" fill="url(#sm-grid)" />
    </svg>
  );
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
        >
          <DotGrid {...viewport.transform} />
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
