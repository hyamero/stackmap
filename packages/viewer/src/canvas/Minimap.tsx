import { useRef, type PointerEvent } from 'react';
import type { Rect } from '@stackmap/core';
import { PANEL_CLASS, PANEL_STYLE } from '../chrome/ui';
import type { Emphasis } from '../explore/emphasis';
import { edgeStroke } from './ArrowMarker';
import type { Scene } from './scene';
import { viewportRect } from './viewport';
import { useViewport } from './ViewportContext';

const WIDTH = 200;
const PAD = 24;

const attrs = (r: Rect) => ({ x: r.x, y: r.y, width: r.width, height: r.height });

/** The radar: the whole diagram in miniature, mirroring what the explorer lights and dims, plus the visible area. */
export function Minimap({ scene, emphasis }: { scene: Scene; emphasis: Emphasis }) {
  const { transform, stage, centerOn } = useViewport();
  const c = scene.content;
  const box = { x: c.x - PAD, y: c.y - PAD, width: c.width + PAD * 2, height: c.height + PAD * 2 };
  const height = Math.min(160, Math.max(60, Math.round((WIDTH * box.height) / box.width)));
  const view = viewportRect(transform, stage);
  // Framing the visible area too (as React Flow did) keeps the box unclipped when it is larger than the content.
  const x0 = Math.min(box.x, view.x);
  const y0 = Math.min(box.y, view.y);
  const frame = {
    x: x0,
    y: y0,
    width: Math.max(box.x + box.width, view.x + view.width) - x0,
    height: Math.max(box.y + box.height, view.y + view.height) - y0,
  };

  // Press to jump there; keep the button down and drag to steer the canvas live.
  const dragging = useRef(false);
  const toDiagram = (e: PointerEvent<SVGSVGElement>) => {
    const ctm = e.currentTarget.getScreenCTM();
    return ctm && new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  };
  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    const p = toDiagram(e);
    if (!p) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    centerOn({ x: p.x, y: p.y });
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const p = dragging.current && toDiagram(e);
    if (p) centerOn({ x: p.x, y: p.y }, { instant: true });
  };
  const stop = () => void (dragging.current = false);

  return (
    <div className={`${PANEL_CLASS} p-1.5`} style={PANEL_STYLE}>
      <svg
        role="img"
        aria-label="Minimap"
        className="sm-minimap block cursor-pointer overflow-visible touch-none select-none"
        width={WIDTH}
        height={height}
        viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        {[...scene.lanes, ...(scene.phaseStyle === 'band' ? scene.phases : [])].map((l) => (
          <rect key={`l:${l.id}`} {...attrs(l.rect)} rx={16} style={{ fill: 'var(--sm-group-fill)', stroke: 'var(--sm-panel-border)' }} vectorEffect="non-scaling-stroke" />
        ))}
        {scene.lifelines.map((l) => (
          <line key={`ll:${l.node}`} x1={l.x} x2={l.x} y1={l.top} y2={l.bottom} vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--sm-group-border)', strokeWidth: 1 }} />
        ))}
        {scene.frames.map((f) => (
          <rect
            key={f.id}
            {...attrs(f.rect)}
            rx={18}
            vectorEffect="non-scaling-stroke"
            style={{ fill: 'none', stroke: 'var(--sm-group-border)', strokeWidth: 1, strokeDasharray: '3 2' }}
          />
        ))}
        {scene.edges.map((e) => {
          const { dim, tint } = emphasis.edges.get(e.id) ?? { dim: false, tint: null };
          return (
            <polyline
              key={e.id}
              data-minimap-edge={e.id}
              points={e.points.map((p) => `${p.x},${p.y}`).join(' ')}
              vectorEffect="non-scaling-stroke"
              style={{ fill: 'none', stroke: edgeStroke(tint), strokeWidth: tint ? 1.5 : 1, opacity: dim ? 0.2 : 0.7 }}
            />
          );
        })}
        {scene.cards.map((card) => (
          <rect
            key={card.node.id}
            className="sm-minimap-card"
            data-dim={emphasis.nodes.get(card.node.id) === 'dim' || undefined}
            {...attrs(card.rect)}
            rx={14}
            style={{ fill: `var(--sm-${card.node.type}-accent)`, opacity: emphasis.nodes.get(card.node.id) === 'dim' ? 0.2 : 0.8 }}
          />
        ))}
        {/* --sm-text instead of a fixed translucent black: the React Flow mask vanished on dark panels. */}
        <rect
          className="sm-minimap-viewport"
          {...attrs(view)}
          vectorEffect="non-scaling-stroke"
          style={{ fill: 'var(--sm-text)', fillOpacity: 0.06, stroke: 'var(--sm-text)', strokeOpacity: 0.7, strokeWidth: 1.5 }}
        />
      </svg>
    </div>
  );
}
