import type { MouseEvent } from 'react';
import type { Rect } from '@stackmap/core';
import { PANEL_CLASS, PANEL_STYLE } from '../chrome/ui';
import type { Scene } from './scene';
import { viewportRect } from './viewport';
import { useViewport } from './ViewportContext';

const WIDTH = 200;
const PAD = 24;

const attrs = (r: Rect) => ({ x: r.x, y: r.y, width: r.width, height: r.height });

export function Minimap({ scene }: { scene: Scene }) {
  const { transform, stage, centerOn } = useViewport();
  const c = scene.content;
  const box = { x: c.x - PAD, y: c.y - PAD, width: c.width + PAD * 2, height: c.height + PAD * 2 };
  const height = Math.min(160, Math.max(60, Math.round((WIDTH * box.height) / box.width)));

  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    const ctm = e.currentTarget.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    centerOn({ x: p.x, y: p.y });
  };

  return (
    <div className={`${PANEL_CLASS} p-1.5`} style={PANEL_STYLE}>
      <svg
        role="img"
        aria-label="Minimap"
        className="sm-minimap block cursor-pointer"
        width={WIDTH}
        height={height}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={onClick}
      >
        {scene.frames.map((f) => (
          <rect
            key={f.id}
            {...attrs(f.rect)}
            rx={18}
            vectorEffect="non-scaling-stroke"
            style={{ fill: 'none', stroke: 'var(--sm-group-border)', strokeWidth: 1, strokeDasharray: '3 2' }}
          />
        ))}
        {scene.cards.map((card) => (
          <rect
            key={card.node.id}
            className="sm-minimap-card"
            {...attrs(card.rect)}
            rx={14}
            style={{ fill: `var(--sm-${card.node.type}-accent)`, opacity: 0.8 }}
          />
        ))}
        {/* --sm-text instead of a fixed translucent black: the React Flow mask vanished on dark panels. */}
        <rect
          className="sm-minimap-viewport"
          {...attrs(viewportRect(transform, stage))}
          vectorEffect="non-scaling-stroke"
          style={{ fill: 'var(--sm-text)', fillOpacity: 0.06, stroke: 'var(--sm-text)', strokeOpacity: 0.7, strokeWidth: 1.5 }}
        />
      </svg>
    </div>
  );
}
