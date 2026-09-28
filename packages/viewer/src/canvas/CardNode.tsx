import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { NodeCard } from '../card/NodeCard';
import type { CardFlowNode } from './to-flow';

export function CardNode({ data }: NodeProps<CardFlowNode>) {
  const { node, direction, hasIn, hasOut } = data;
  const horizontal = direction === 'RIGHT';
  const handleStyle = { '--sm-handle': `var(--sm-${node.type}-accent)` } as CSSProperties;
  return (
    <>
      {hasIn && (
        <Handle
          id="in"
          type="target"
          position={horizontal ? Position.Left : Position.Top}
          isConnectable={false}
          className="sm-handle"
          style={handleStyle}
        />
      )}
      <NodeCard node={node} />
      {hasOut && (
        <Handle
          id="out"
          type="source"
          position={horizontal ? Position.Right : Position.Bottom}
          isConnectable={false}
          className="sm-handle"
          style={handleStyle}
        />
      )}
    </>
  );
}
