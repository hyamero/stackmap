import { Background, BackgroundVariant, MiniMap, Panel, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useMemo, useState, type ReactNode } from 'react';
import type { LaidOutDiagram } from '@stackmap/core';
import { ZoomBar } from '../chrome/ZoomBar';
import type { ThemeChoice } from '../theme/theme';
import { ArrowMarker } from './ArrowMarker';
import { CardNode } from './CardNode';
import { FrameNode } from './FrameNode';
import { RoutedEdge } from './RoutedEdge';
import { toFlow, type CardFlowNode } from './to-flow';

const nodeTypes = { card: CardNode, frame: FrameNode };
const edgeTypes = { routed: RoutedEdge };

export function DiagramCanvas({
  diagram,
  theme,
  children,
}: {
  diagram: LaidOutDiagram;
  theme: ThemeChoice;
  children?: ReactNode;
}) {
  const { nodes, edges } = useMemo(() => toFlow(diagram), [diagram]);
  const [minimap, setMinimap] = useState(false);
  return (
    <ReactFlowProvider>
      <ArrowMarker />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={theme}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        deleteKeyCode={null}
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="var(--sm-grid)" />
        {minimap && (
          <MiniMap
            pannable
            zoomable
            bgColor="var(--sm-panel)"
            maskColor="rgb(0 0 0 / 0.08)"
            nodeColor={(n) => (n.type === 'card' ? `var(--sm-${(n as CardFlowNode).data.node.type}-accent)` : 'transparent')}
          />
        )}
        <Panel position="bottom-left">
          <ZoomBar minimapOn={minimap} onToggleMinimap={() => setMinimap((v) => !v)} />
        </Panel>
        {children}
      </ReactFlow>
    </ReactFlowProvider>
  );
}
