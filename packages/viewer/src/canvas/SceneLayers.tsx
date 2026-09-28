import { memo, type CSSProperties } from 'react';
import { TYPE_LABELS } from '@stackmap/core';
import { NodeCard } from '../card/NodeCard';
import { ARROW_MARKER_ID, ArrowMarkerDefs } from './ArrowMarker';
import type { Scene, SceneCard, SceneFrame } from './scene';

const place = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }): CSSProperties => ({
  left: x,
  top: y,
  width,
  height,
});

// Dot centred on the card edge where ELK put the port (mid-side, per layout's fixed ports).
function handleStyle(side: 'in' | 'out', horizontal: boolean): CSSProperties {
  if (horizontal) {
    return side === 'in'
      ? { top: '50%', left: 0, transform: 'translate(-50%, -50%)' }
      : { top: '50%', right: 0, transform: 'translate(50%, -50%)' };
  }
  return side === 'in'
    ? { left: '50%', top: 0, transform: 'translate(-50%, -50%)' }
    : { left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' };
}

function Frame({ frame }: { frame: SceneFrame }) {
  // Q18: groups aren't in the refs — thin dashed container, faint fill, small-caps label in the 48px band.
  return (
    <div
      data-frame-id={frame.id}
      className="sm-frame absolute rounded-[18px] border border-dashed"
      style={{ ...place(frame.rect), borderColor: 'var(--sm-group-border)', background: 'var(--sm-group-fill)' }}
    >
      <div className="flex h-12 items-center px-5 text-[11px] font-medium tracking-[0.12em] text-fg-muted uppercase">
        {frame.label}
      </div>
    </div>
  );
}

function Card({ card, horizontal }: { card: SceneCard; horizontal: boolean }) {
  const { node, rect, hasIn, hasOut } = card;
  const accent = { '--sm-handle': `var(--sm-${node.type}-accent)` } as CSSProperties;
  return (
    <div
      data-card-id={node.id}
      role="group"
      aria-label={`${node.card.title}, ${TYPE_LABELS[node.type]}`}
      className="sm-card absolute"
      style={place(rect)}
    >
      <NodeCard node={node} />
      {hasIn && <span aria-hidden="true" data-handle="in" className="sm-handle" style={{ ...accent, ...handleStyle('in', horizontal) }} />}
      {hasOut && <span aria-hidden="true" data-handle="out" className="sm-handle" style={{ ...accent, ...handleStyle('out', horizontal) }} />}
    </div>
  );
}

// Paint order is the z-order: frames < edges < cards (+ handle dots) < edge labels.
// Memoised: `scene` is stable across pan/zoom frames (useMemo in DiagramCanvas), so without this
// every d3-zoom transform update re-rendered every card.
export const SceneLayers = memo(function SceneLayers({ scene }: { scene: Scene }) {
  const horizontal = scene.direction === 'RIGHT';
  return (
    <>
      {scene.frames.map((f) => (
        <Frame key={f.id} frame={f} />
      ))}
      <svg
        aria-hidden="true"
        className="sm-edges pointer-events-none absolute top-0 left-0 overflow-visible"
        width={scene.bounds.width}
        height={scene.bounds.height}
      >
        <ArrowMarkerDefs />
        {scene.edges.map((e) => (
          <path
            key={e.id}
            data-edge-id={e.id}
            className="sm-edge-path"
            d={e.path}
            fill="none"
            markerEnd={`url(#${ARROW_MARKER_ID})`}
            style={{ stroke: 'var(--sm-edge)', strokeWidth: 1.25, strokeDasharray: e.kind === 'async' ? '5 4' : undefined }}
          />
        ))}
      </svg>
      {scene.cards.map((c) => (
        <Card key={c.node.id} card={c} horizontal={horizontal} />
      ))}
      {scene.edges.map((e) =>
        e.label && e.mid ? (
          <div
            key={e.id}
            className="sm-edge-label pointer-events-none absolute rounded-full bg-panel px-2 py-0.5 font-sans text-[11px] whitespace-nowrap text-fg-muted"
            style={{
              left: e.mid.x,
              top: e.mid.y,
              transform: 'translate(-50%, -50%)',
              boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)',
            }}
          >
            {e.label}
          </div>
        ) : null,
      )}
    </>
  );
});
