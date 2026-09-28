import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { polylineMidpoint, roundedOrthogonalPath } from '@stackmap/core';
import { ARROW_MARKER_ID } from './ArrowMarker';
import type { RoutedFlowEdge } from './to-flow';

// Ignores React Flow's handle coordinates: the route is ELK's, baked at build time.
export function RoutedEdge({ id, data }: EdgeProps<RoutedFlowEdge>) {
  const { points, kind, label } = data!;
  const mid = label ? polylineMidpoint(points) : null;
  return (
    <>
      <BaseEdge
        id={id}
        path={roundedOrthogonalPath(points, 10)}
        markerEnd={`url(#${ARROW_MARKER_ID})`}
        style={{ stroke: 'var(--sm-edge)', strokeWidth: 1.25, strokeDasharray: kind === 'async' ? '5 4' : undefined }}
      />
      {label && mid && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded-full bg-panel px-2 py-0.5 font-sans text-[11px] text-fg-muted"
            style={{
              transform: `translate(-50%, -50%) translate(${mid.x}px, ${mid.y}px)`,
              // Edges are raised to zIndex 1 (above frames); the pill must still cover its line.
              zIndex: 2,
              boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
