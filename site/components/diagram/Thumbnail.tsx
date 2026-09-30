import type { LaidOutDiagram, Rect } from '@stackmap/core';
import { toScene } from '@stackmap/viewer/src/canvas/scene';

const PAD = 40;
const box = (r: Rect) => ({ x: r.x, y: r.y, width: r.width, height: r.height });

/** The diagram in miniature, drawn like the viewer's radar: lanes, frames, routes, and cards in their type accent. */
export function Thumbnail({ diagram }: { diagram: LaidOutDiagram }) {
  const scene = toScene(diagram);
  const { x, y, width, height } = scene.content;
  return (
    <svg
      aria-hidden="true"
      className="size-full"
      viewBox={`${x - PAD} ${y - PAD} ${width + 2 * PAD} ${height + 2 * PAD}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {[...scene.lanes, ...(scene.phaseStyle === 'band' ? scene.phases : [])].map((l) => (
        <rect key={`l:${l.id}`} {...box(l.rect)} rx={16} vectorEffect="non-scaling-stroke" style={{ fill: 'var(--sm-group-fill)', stroke: 'var(--sm-panel-border)' }} />
      ))}
      {scene.lifelines.map((l) => (
        <line key={`ll:${l.node}`} x1={l.x} x2={l.x} y1={l.top} y2={l.bottom} vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--sm-group-border)', strokeDasharray: '3 3' }} />
      ))}
      {scene.frames.map((f) => (
        <rect key={f.id} {...box(f.rect)} rx={18} vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: 'var(--sm-group-border)', strokeDasharray: '3 3' }} />
      ))}
      {scene.edges.map((e) => (
        <polyline key={e.id} points={e.points.map((p) => `${p.x},${p.y}`).join(' ')} vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: 'var(--sm-edge)' }} />
      ))}
      {scene.cards.map((c) => (
        <rect key={c.node.id} {...box(c.rect)} rx={14} style={{ fill: `var(--sm-${c.node.type}-accent)`, fillOpacity: 0.55 }} />
      ))}
    </svg>
  );
}
