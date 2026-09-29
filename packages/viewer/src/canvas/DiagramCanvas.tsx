import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { LaidOutDiagram, Rect } from '@stackmap/core';
import { ZoomBar } from '../chrome/ZoomBar';
import { useSceneReveal } from '../motion/useSceneReveal';
import { useExplore } from '../explore/ExploreContext';
import { routeBetween } from '../explore/graph';
import { inMenu } from '../chrome/Toolbar';
import { CanvasPanel } from './CanvasPanel';
import { Minimap } from './Minimap';
import { toScene, type Scene } from './scene';
import { SceneLayers } from './SceneLayers';
import { useZoom } from './useZoom';
import type { Camera } from './useZoom';
import type { Transform } from './viewport';
import { CameraProvider, ContentProvider, SceneProvider, ViewportProvider } from './ViewportContext';

const PAN_STEP = 80;

function union(rects: Rect[]): Rect | null {
  if (!rects.length) return null;
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return { x, y, width: Math.max(...rects.map((r) => r.x + r.width)) - x, height: Math.max(...rects.map((r) => r.y + r.height)) - y };
}

// Camera follows the explorer: a view fits its members (Overview fits everything, Q27); a revealing
// selection (search, deep link) centres the node. The initial Overview needs nothing: useZoom already fit it.
function useCameraEffects(scene: Scene, camera: Camera, restored: boolean) {
  const { draft, state, graph } = useExplore();
  const rectOf = useMemo(() => new Map(scene.cards.map((c) => [c.node.id, c.rect])), [scene]);
  // Compare against the previous view, not a "first run" flag: StrictMode re-runs effects on mount.
  const shownView = useRef<string | null | undefined>(restored ? state.view : null);
  useEffect(() => {
    if (shownView.current === state.view) return;
    shownView.current = state.view;
    const members = state.view ? (draft.views?.find((v) => v.id === state.view)?.nodes ?? []) : [];
    const box = union(members.flatMap((id) => rectOf.get(id) ?? []));
    if (box) camera.fitRect(box);
    else camera.fit();
  }, [state.view, draft, rectOf, camera]);
  // A new route frames everything on it.
  const shownRoute = useRef(restored ? state.route : null);
  useEffect(() => {
    if (shownRoute.current === state.route) return;
    shownRoute.current = state.route;
    if (!state.route) return;
    const on = routeBetween(graph, state.route.from, state.route.to)?.nodes ?? new Set([state.route.from, state.route.to]);
    const box = union([...on].flatMap((id) => rectOf.get(id) ?? []));
    if (box) camera.fitRect(box);
  }, [state.route, graph, rectOf, camera]);
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

/** `chrome` false (presentation): no toolbar, zoom bar or minimap, and the camera refits the bigger stage. */
export function DiagramCanvas({ diagram, children, chrome = true }: { diagram: LaidOutDiagram; children?: ReactNode; chrome?: boolean }) {
  const scene = useMemo(() => toScene(diagram), [diagram]);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const viewport = useZoom(stageRef, scene.content);
  // Exports frame everything drawn: edge routes can swing outside the card/frame box (U-turns).
  const exportBox = useMemo(() => {
    const points = scene.edges.flatMap((e) => e.points);
    return union([scene.content, ...points.map((p) => ({ x: p.x, y: p.y, width: 0, height: 0 }))])!;
  }, [scene]);
  const { camera } = viewport;
  const explore = useExplore();
  const { emphasis, dispatch, state } = explore;
  const [minimap, setMinimap] = useState(false);
  const { x, y, k } = viewport.transform;
  useCameraEffects(scene, camera, viewport.restored);
  // The stage changes size when the chrome comes or goes: frame the current view again once it has.
  const framed = useRef(chrome);
  useEffect(() => {
    if (framed.current === chrome) return;
    framed.current = chrome;
    const id = requestAnimationFrame(() => {
      const members = state.view ? (explore.draft.views?.find((v) => v.id === state.view)?.nodes ?? []) : [];
      const box = union(members.flatMap((m) => scene.cards.find((c) => c.node.id === m)?.rect ?? []));
      if (box) camera.fitRect(box);
      else camera.fit();
    });
    return () => cancelAnimationFrame(id);
  }, [chrome, state.view, explore.draft, scene, camera]);
  // M toggles the radar from anywhere but a text field or menu; not while presenting (it's hidden then).
  const chromeRef = useRef(chrome);
  chromeRef.current = chrome;
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.key !== 'm' && e.key !== 'M') || !chromeRef.current) return;
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || inMenu(t) || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
      e.preventDefault();
      setMinimap((v) => !v);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  useSceneReveal(sceneRef, scene, viewport.restored);

  // Keys when the stage itself has focus (cards handle their own and stop propagation).
  const onKeyDown = (e: KeyboardEvent) => {
    const pan: Record<string, [number, number]> = {
      ArrowUp: [0, PAN_STEP],
      ArrowDown: [0, -PAN_STEP],
      ArrowLeft: [PAN_STEP, 0],
      ArrowRight: [-PAN_STEP, 0],
    };
    if (pan[e.key]) camera.panBy(...pan[e.key]!, { instant: e.repeat });
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
      <SceneProvider value={scene}>
      <div className="relative size-full">
        {/* Top-left chrome first in the DOM: Tab reaches search/lens/trace before the cards. */}
        {chrome && children}
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
            ref={sceneRef}
            className="sm-viewport absolute top-0 left-0 origin-top-left"
            style={{ transform: `translate(${x}px, ${y}px) scale(${k})` }}
          >
            <SceneLayers scene={scene} emphasis={emphasis} selected={state.selected} />
          </div>
        </div>
        {/* Overlays are siblings of the stage, so wheel/drag on them never reaches d3-zoom. */}
        {chrome && (
          <CanvasPanel position="bottom-left">
            <ZoomBar minimapOn={minimap} onToggleMinimap={() => setMinimap((v) => !v)} />
          </CanvasPanel>
        )}
        {chrome && minimap && (
          <CanvasPanel position="bottom-right">
            <Minimap scene={scene} emphasis={emphasis} />
          </CanvasPanel>
        )}
      </div>
      </SceneProvider>
      </ContentProvider>
     </CameraProvider>
    </ViewportProvider>
  );
}
