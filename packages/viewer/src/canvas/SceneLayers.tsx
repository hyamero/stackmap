import { memo, useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { TYPE_LABELS, type Rect } from '@stackmap/core';
import { NodeCard } from '../card/NodeCard';
import type { Emphasis, NodeEmphasis } from '../explore/emphasis';
import { useExploreDispatch } from '../explore/ExploreContext';
import { neighbourInDirection, type Direction } from '../explore/graph';
import { arrowMarkerId, ArrowMarkerDefs } from './ArrowMarker';
import type { Scene, SceneCard, SceneFrame } from './scene';
import { useCamera } from './ViewportContext';

const ARROWS: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
export const focusCard = (id: string) => document.querySelector<HTMLElement>(`.sm-card[data-card-id="${CSS.escape(id)}"]`)?.focus();

const place = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }): CSSProperties => ({
  left: x,
  top: y,
  width,
  height,
});

// Dot centred on the card edge where ELK put the port (mid-side, per layout's fixed ports).
function handleStyle(side: 'in' | 'out', horizontal: boolean): CSSProperties {
  if (horizontal) {
    return side === 'in'
      ? { top: '50%', left: 0, transform: 'translate(-50%, -50%)' }
      : { top: '50%', right: 0, transform: 'translate(50%, -50%)' };
  }
  return side === 'in'
    ? { left: '50%', top: 0, transform: 'translate(-50%, -50%)' }
    : { left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' };
}

function Frame({ frame }: { frame: SceneFrame }) {
  // Q18: groups aren't in the refs — thin dashed container, faint fill, sentence-case label in the 48px band.
  return (
    <div
      data-frame-id={frame.id}
      className="sm-frame absolute rounded-[18px] border border-dashed"
      style={{ ...place(frame.rect), borderColor: 'var(--sm-group-border)', background: 'var(--sm-group-fill)' }}
    >
      <div className="flex h-12 items-center px-5 text-[12.5px] font-medium text-fg-muted">
        {frame.label}
      </div>
    </div>
  );
}

// Memoised with stable props: an explorer change re-renders only the cards whose emphasis changed.
const Card = memo(function Card({
  card,
  horizontal,
  state,
  rects,
  tabbable,
  onFocused,
}: {
  card: SceneCard;
  horizontal: boolean;
  state: NodeEmphasis;
  rects: Record<string, Rect>;
  /** roving tabindex: one card is the canvas's tab stop, arrows move between the rest */
  tabbable: boolean;
  onFocused: (id: string) => void;
}) {
  const { node, rect, hasIn, hasOut } = card;
  const dispatch = useExploreDispatch();
  const camera = useCamera();
  const accent = { '--sm-handle': `var(--sm-${node.type}-accent)` } as CSSProperties;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    const dir = ARROWS[e.key];
    if (dir) {
      const next = neighbourInDirection(rects, node.id, dir);
      if (next) focusCard(next);
    } else if (e.key === 'Enter' || e.key === ' ') {
      dispatch({ type: 'select', id: node.id });
    } else if (e.key === 'Escape') {
      dispatch({ type: 'clear' });
    } else return;
    // The stage would otherwise pan on arrows / clear on Escape as well.
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div
      data-card-id={node.id}
      data-emphasis={state}
      role="button"
      tabIndex={tabbable ? 0 : -1}
      aria-pressed={state === 'focus'}
      aria-label={`${node.card.title}, ${TYPE_LABELS[node.type]}`}
      className="sm-card absolute cursor-pointer"
      style={{ ...place(rect), ...accent }}
      onClick={(e) => {
        e.stopPropagation();
        if ((e.target as Element).closest('a')) return; // the card's CTA link opens, not selects
        dispatch({ type: 'select', id: node.id });
      }}
      onFocus={(e) => {
        onFocused(node.id);
        // Keyboard focus only: a mouse-down focus would start a pan that fights the user's drag.
        if (e.currentTarget.matches(':focus-visible')) camera.ensureVisible(rect);
      }}
      onKeyDown={onKeyDown}
    >
      <NodeCard node={node} />
      {hasIn && <span aria-hidden="true" data-handle="in" className="sm-handle" style={handleStyle('in', horizontal)} />}
      {hasOut && <span aria-hidden="true" data-handle="out" className="sm-handle" style={handleStyle('out', horizontal)} />}
    </div>
  );
});

// Paint order is the z-order: frames < edges < cards (+ handle dots) < edge labels.
// Memoised: `scene` and `emphasis` are stable across pan/zoom frames, so without this every d3-zoom
// transform update re-rendered every card.
export const SceneLayers = memo(function SceneLayers({
  scene,
  emphasis,
  selected,
}: {
  scene: Scene;
  emphasis: Emphasis;
  selected: string | null;
}) {
  const horizontal = scene.direction === 'RIGHT';
  const rects = useMemo(() => Object.fromEntries(scene.cards.map((c) => [c.node.id, c.rect])), [scene]);
  const [lastFocused, setLastFocused] = useState<string | null>(null);
  const tabStop = selected ?? (lastFocused && rects[lastFocused] ? lastFocused : scene.cards[0]?.node.id);
  return (
    <>
      {scene.frames.map((f) => (
        <Frame key={f.id} frame={f} />
      ))}
      <svg
        aria-hidden="true"
        className="sm-edges pointer-events-none absolute top-0 left-0 overflow-visible"
        width={scene.bounds.width}
        height={scene.bounds.height}
      >
        <ArrowMarkerDefs />
        {scene.edges.map((e) => {
          const { dim, tint } = emphasis.edges.get(e.id) ?? { dim: false, tint: null };
          return (
            <path
              key={e.id}
              data-edge-id={e.id}
              data-dim={dim || undefined}
              data-tint={tint ?? undefined}
              className="sm-edge-path"
              d={e.path}
              fill="none"
              markerEnd={`url(#${arrowMarkerId(tint)})`}
              style={{
                stroke: tint ? `var(--sm-${tint}-accent)` : 'var(--sm-edge)',
                strokeWidth: tint ? 1.75 : 1.25,
                strokeDasharray: e.kind === 'async' ? '5 4' : undefined,
              }}
            />
          );
        })}
      </svg>
      {scene.cards.map((c) => (
        <Card
          key={c.node.id}
          card={c}
          horizontal={horizontal}
          state={emphasis.nodes.get(c.node.id) ?? 'normal'}
          rects={rects}
          tabbable={c.node.id === tabStop}
          onFocused={setLastFocused}
        />
      ))}
      {scene.edges.map((e) =>
        e.label && e.mid ? (
          <div
            key={e.id}
            data-dim={emphasis.edges.get(e.id)?.dim || undefined}
            className="sm-edge-label pointer-events-none absolute rounded-full bg-panel px-2 py-0.5 font-sans text-[11px] whitespace-nowrap text-fg-muted"
            style={{
              left: e.mid.x,
              top: e.mid.y,
              transform: 'translate(-50%, -50%)',
              boxShadow: 'inset 0 0 0 1px var(--sm-panel-border)',
            }}
          >
            {e.label}
          </div>
        ) : null,
      )}
    </>
  );
});
