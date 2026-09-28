import { useReactFlow, useViewport } from '@xyflow/react';
import { Map as MapIcon, Maximize, Minus, Plus } from 'lucide-react';
import { IconButton, PANEL_CLASS, PANEL_STYLE, ToolbarDivider } from './ui';

const duration = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150);

export function ZoomBar({ minimapOn, onToggleMinimap }: { minimapOn: boolean; onToggleMinimap: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  return (
    <div className={`${PANEL_CLASS} flex items-center p-1.5`} style={PANEL_STYLE}>
      <IconButton label="Zoom out" onClick={() => zoomOut({ duration: duration() })}>
        <Minus size={17} strokeWidth={1.75} />
      </IconButton>
      <span className="w-12 text-center text-[13px] text-fg tabular-nums">{Math.round(zoom * 100)}%</span>
      <IconButton label="Zoom in" onClick={() => zoomIn({ duration: duration() })}>
        <Plus size={17} strokeWidth={1.75} />
      </IconButton>
      <ToolbarDivider />
      <IconButton label="Fit to screen" onClick={() => fitView({ duration: duration(), padding: 0.15 })}>
        <Maximize size={16} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Toggle minimap" pressed={minimapOn} onClick={onToggleMinimap}>
        <MapIcon size={16} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
