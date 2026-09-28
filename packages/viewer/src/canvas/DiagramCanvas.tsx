import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { LaidOutDiagram, Rect } from '@stackmap/core';
import { ZoomBar } from '../chrome/ZoomBar';
import { useExplore } from '../explore/ExploreContext';
import { CanvasPanel } from './CanvasPanel';
import { Minimap } from './Minimap';
import { toScene, type Scene } from './scene';
import { SceneLayers } from './SceneLayers';
import { useZoom } from './useZoom';
import type { Camera } from './useZoom';
import type { Transform } from './viewport';
import { CameraProvider, ContentProvider, ViewportProvider } from './ViewportContext';

const PAN_STEP = 80;

function union(rects: Rect[]): Rect | null {
  if (!rects.length) return null;
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return { x, y, width: Math.max(...rects.map((r) => r.x + r.width)) - x, height: Math.max(...rects.map((r) => r.y + r.height)) - y };
}

// Camera follows the explorer: a view fits its members (Overview fits everything, Q27); a revealing
// selection (search, deep link) centres the node. Skips the first run for Overview so the initial fit stands.
function useCameraEffects(scene: Scene, camera: Camera, restored: boolean) {
  const { draft, state } = useExplore();
  const rectOf = useMemo(() => new Map(scene.cards.map((c) => [c.node.id, c.rect])), [scene]);
  const first = useRef(true);
  useEffect(() => {
    // After a live reload the restored camera stands; later view changes move it as usual.
    if (first.current && restored) return void (first.current = false);
    const members = state.view ? (draft.views?.find((v) => v.id === state.view)?.nodes ?? []) : [];
    const box = union(members.flatMap((id) => rectOf.get(id) ?? []));
    if (box) camera.fitRect(box);
    else if (!first.current) camera.fit();
    first.current = false;
  }, [state.view, draft, rectOf, camera]);
  // The reveal a live reload restores from the hash is already on screen.
  const restoredReveal = useRef(restored ? state.reveal : -1);
  const latest = useRef({ state, draft });
  latest.current = { state, draft };
  useEffect(() => {
    // Only a new reveal moves the camera, not every selection; read the rest from the latest render.
    const { state: s, draft: d } = latest.current;
    if (restoredReveal.current === s.reveal) return;
    const r = s.reveal && s.selected ? rectOf.get(s.selected) : undefined;
    if (!r) return;
    // Inside the active view the fit already shows it; centring would undo the view's zoom (Q27).
    const inView = s.view && d.views?.find((v) => v.id === s.view)?.nodes.includes(s.selected!);
    if (!inView) camera.centerOn({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
  }, [state.reveal, rectOf, camera]);
}

const GRID = 20;
const DOT = 1.2;

// Dot grid that pans and scales with the diagram — React Flow's <Background> pattern, so dot size and weight match M0.
function DotGrid({ x, y, k }: Transform) {
  const gap = GRID * k;
  const r = (DOT * k) / 2;
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
      <pattern
        id="sm-grid"
        patternUnits="userSpaceOnUse"
        x={x % gap}
        y={y % gap}
        width={gap}
        height={gap}
        patternTransform={`translate(${-gap / 2},${-gap / 2})`}
      >
        <circle cx={r} cy={r} r={r} style={{ fill: 'var(--sm-grid)' }} />
      </pattern>
      <rect width="100%" height="100%" fill="url(#sm-grid)" />
    </svg>
  );
}

export function DiagramCanvas({ diagram, children }: { diagram: LaidOutDiagram; children?: ReactNode }) {
  const scene = useMemo(() => toScene(diagram), [diagram]);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewport = useZoom(stageRef, scene.content);
  // Exports frame everything drawn: edge routes can swing outside the card/frame box (U-turns).
  const exportBox = useMemo(() => {
    const points = scene.edges.flatMap((e) => e.points);
    return union([scene.content, ...points.map((p) => ({ x: p.x, y: p.y, width: 0, height: 0 }))])!;
  }, [scene]);
  const { camera } = viewport;
  const { emphasis, dispatch, state } = useExplore();
  const [minimap, setMinimap] = useState(false);
  const { x, y, k } = viewport.transform;
  useCameraEffects(scene, camera, viewport.restored);

  // Keys when the stage itself has focus (cards handle their own and stop propagation).
  const onKeyDown = (e: KeyboardEvent) => {
    const pan: Record<string, [number, number]> = {
      ArrowUp: [0, PAN_STEP],
      ArrowDown: [0, -PAN_STEP],
      ArrowLeft: [PAN_STEP, 0],
      ArrowRight: [-PAN_STEP, 0],
    };
    if (pan[e.key]) camera.panBy(...pan[e.key]!);
    else if (e.key === '+' || e.key === '=') camera.zoomIn();
    else if (e.key === '-') camera.zoomOut();
    else if (e.key === '0') camera.fit();
    else if (e.key === 'Escape') dispatch({ type: 'clear' });
    else return;
    e.preventDefault();
  };

  return (
    <ViewportProvider value={viewport}>
     <CameraProvider value={camera}>
      <ContentProvider value={exportBox}>
      <div className="relative size-full">
        {/* Top-left chrome first in the DOM: Tab reaches search/lens/trace before the cards. */}
        {children}
        <div
          ref={stageRef}
          role="region"
          aria-label="Diagram canvas"
          aria-roledescription="zoomable diagram; arrows pan, plus and minus zoom, 0 fits"
          tabIndex={0}
          className="sm-stage absolute inset-0 cursor-grab overflow-hidden outline-none active:cursor-grabbing"
          // d3-zoom swallows the click that ends a drag, so this only fires for a real click on empty canvas.
          onClick={() => dispatch({ type: 'select', id: null })}
          onKeyDown={onKeyDown}
        >
          <DotGrid {...viewport.transform} />
          <div
            className="sm-viewport absolute top-0 left-0 origin-top-left"
            style={{ transform: `translate(${x}px, ${y}px) scale(${k})` }}
          >
            <SceneLayers scene={scene} emphasis={emphasis} selected={state.selected} />
          </div>
        </div>
        {/* Overlays are siblings of the stage, so wheel/drag on them never reaches d3-zoom. */}
        <CanvasPanel position="bottom-left">
          <ZoomBar minimapOn={minimap} onToggleMinimap={() => setMinimap((v) => !v)} />
        </CanvasPanel>
        {minimap && (
          <CanvasPanel position="bottom-right">
            <Minimap scene={scene} />
          </CanvasPanel>
        )}
      </div>
      </ContentProvider>
     </CameraProvider>
    </ViewportProvider>
  );
}
