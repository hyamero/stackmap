import { TYPE_LABELS, type NodeType } from '@stackmap/core';
import { TypeIcon } from '@stackmap/viewer/src/icons/TypeIcon';

/** A node type as the card draws it: its fill, border and icon tile. */
export function TypeChip({ type, small = false }: { type: NodeType; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[10px] text-fg ${small ? 'h-[26px] pr-2.5 pl-1 text-xs' : 'h-8 pr-3 pl-1.5 text-[13px]'}`}
      style={{ background: `var(--sm-${type}-fill)`, boxShadow: `inset 0 0 0 1px var(--sm-${type}-border)` }}
    >
      <span
        className={`grid place-items-center rounded-[7px] ${small ? 'size-[18px]' : 'size-[22px]'}`}
        style={{ background: `var(--sm-${type}-tile)`, color: `var(--sm-${type}-accent)` }}
      >
        <TypeIcon type={type} size={small ? 11 : 13} />
      </span>
      {TYPE_LABELS[type]}
    </span>
  );
}
