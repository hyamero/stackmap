import type { NodeProps } from '@xyflow/react';
import type { FrameFlowNode } from './to-flow';

// Q18: groups aren't in the refs — thin dashed container, faint fill, small-caps label in the 48px band.
export function FrameNode({ data }: NodeProps<FrameFlowNode>) {
  return (
    <div
      className="size-full rounded-[18px] border border-dashed"
      style={{ borderColor: 'var(--sm-group-border)', background: 'var(--sm-group-fill)' }}
    >
      <div className="flex h-12 items-center px-5 text-[11px] font-medium tracking-[0.12em] text-fg-muted uppercase">
        {data.label}
      </div>
    </div>
  );
}
