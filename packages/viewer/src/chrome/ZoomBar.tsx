import { Map as MapIcon, Maximize, Minus, Plus } from 'lucide-react';
import { useViewport } from '../canvas/ViewportContext';
import { IconButton, PANEL_CLASS, PANEL_STYLE, ToolbarDivider } from './ui';

/** Without `onToggleMinimap` the bar has no minimap button. */
export function ZoomBar({ minimapOn = false, onToggleMinimap }: { minimapOn?: boolean; onToggleMinimap?: () => void }) {
  const { transform, zoomIn, zoomOut, fit } = useViewport();
  return (
    <div className={`${PANEL_CLASS} flex items-center p-1.5`} style={PANEL_STYLE}>
      <IconButton label="Zoom out" onClick={zoomOut}>
        <Minus size={17} strokeWidth={1.75} />
      </IconButton>
      <span className="w-12 text-center text-[13px] text-fg tabular-nums">{Math.round(transform.k * 100)}%</span>
      <IconButton label="Zoom in" onClick={zoomIn}>
        <Plus size={17} strokeWidth={1.75} />
      </IconButton>
      <ToolbarDivider />
      <IconButton label="Fit to screen" onClick={fit}>
        <Maximize size={16} strokeWidth={1.75} />
      </IconButton>
      {onToggleMinimap && (
        <IconButton label="Toggle minimap (M)" pressed={minimapOn} onClick={onToggleMinimap}>
          <MapIcon size={16} strokeWidth={1.75} />
        </IconButton>
      )}
    </div>
  );
}
