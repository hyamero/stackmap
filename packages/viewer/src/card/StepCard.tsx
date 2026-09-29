import type { CSSProperties } from 'react';
import { cardSize, COMPACT, type DiagramNode } from '@stackmap/core';
import { BrandIcon, hasBrand } from '../icons/BrandIcon';
import { TypeIcon } from '../icons/TypeIcon';

/**
 * The compact card of workflow steps, lifecycle states and sequence participants: icon tile, title, subtitle and
 * an optional tag pill. Geometry mirrors core's COMPACT metrics and `cardTextSlots(card, 'compact')`.
 * `final` (a lifecycle end state) draws a double outline.
 */
export function StepCard({ node, final = false }: { node: DiagramNode; final?: boolean }) {
  const { type, card } = node;
  const tint = (key: 'fill' | 'border' | 'tile' | 'accent') => `var(--sm-${type}-${key})`;
  const { height } = cardSize(card, 'compact');
  // Inset shadows, not borders: an outline must not change the fixed height.
  const ring: CSSProperties = {
    boxShadow: final
      ? `inset 0 0 0 1.5px ${tint('accent')}, inset 0 0 0 3.5px ${tint('fill')}, inset 0 0 0 4.5px ${tint('accent')}`
      : `inset 0 0 0 1px ${tint('border')}`,
  };
  return (
    <div
      data-testid="step-card"
      data-node-id={node.id}
      data-type={type}
      data-final={final || undefined}
      className="flex flex-col overflow-hidden font-sans"
      style={{ width: COMPACT.width, height, borderRadius: COMPACT.radius, background: tint('fill'), ...ring }}
    >
      <header className="flex shrink-0 items-center gap-2.5 px-3" style={{ height: COMPACT.header }}>
        <div className="grid size-7 shrink-0 place-items-center rounded-[8px]" style={{ background: tint('tile'), color: tint('accent') }}>
          {card.brand && hasBrand(card.brand) ? <BrandIcon slug={card.brand} size={15} /> : <TypeIcon type={type} size={15} />}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] leading-[18px] font-medium text-fg" title={card.title}>
            {card.title}
          </div>
          {card.subtitle && (
            <div className="truncate text-[11.5px] leading-4 text-fg-muted" title={card.subtitle}>
              {card.subtitle}
            </div>
          )}
        </div>
      </header>
      {card.tag && (
        // Lines the pill up with the title: 12px padding + 28px tile + 10px gap.
        <div data-testid="card-tag" className="flex shrink-0 items-start pr-3 pl-[50px]" style={{ height: COMPACT.tagRow }}>
          <span className="inline-flex h-[18px] max-w-full items-center rounded-full px-2 text-[11px] font-medium text-fg" style={{ background: tint('tile') }}>
            <span className="truncate" title={card.tag}>
              {card.tag}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
