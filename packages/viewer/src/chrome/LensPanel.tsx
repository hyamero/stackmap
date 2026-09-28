import { countByType, TYPE_LABELS } from '@stackmap/core';
import { useExplore } from '../explore/ExploreContext';
import { PANEL_CLASS, PANEL_STYLE } from './ui';

export function LensPanel({ onClose }: { onClose: () => void }) {
  const { draft, state, dispatch } = useExplore();
  return (
    <fieldset
      className={`${PANEL_CLASS} absolute top-full left-0 z-20 mt-2 w-[240px] p-3`}
      style={PANEL_STYLE}
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        onClose();
      }}
    >
      <legend className="sr-only">Show node types</legend>
      <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-fg-muted uppercase" aria-hidden="true">
        Types
      </p>
      {countByType(draft.nodes).map(([type, count]) => (
        <label key={type} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-[13px] text-fg hover:bg-page">
          <input
            type="checkbox"
            checked={!state.hiddenTypes.has(type)}
            onChange={() => dispatch({ type: 'toggleType', nodeType: type })}
            className="size-3.5"
            style={{ accentColor: `var(--sm-${type}-accent)` }}
          />
          {TYPE_LABELS[type]}
          <span className="ml-auto text-fg-muted tabular-nums">{count}</span>
        </label>
      ))}
    </fieldset>
  );
}
