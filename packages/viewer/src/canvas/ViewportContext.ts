import { createContext, useContext } from 'react';
import type { Rect } from '@stackmap/core';
import type { Scene } from './scene';
import type { Camera, ViewportApi } from './useZoom';

const ViewportContext = createContext<ViewportApi | null>(null);
// Separate from the viewport, which changes every pan/zoom frame: cards only need the (stable) camera.
const CameraContext = createContext<Camera | null>(null);

// Everything the diagram draws (cards, frames, edge routes), for exports; as stable as the scene.
const ContentContext = createContext<Rect | null>(null);

export const ViewportProvider = ViewportContext.Provider;
export const ContentProvider = ContentContext.Provider;

export function useSceneContent(): Rect {
  const r = useContext(ContentContext);
  if (!r) throw new Error('useSceneContent must be used inside DiagramCanvas');
  return r;
}
export const CameraProvider = CameraContext.Provider;

// The scene itself, for exports that need more than the frame (the video's flow animation).
const SceneContext = createContext<Scene | null>(null);
export const SceneProvider = SceneContext.Provider;
export function useScene(): Scene {
  const s = useContext(SceneContext);
  if (!s) throw new Error('useScene must be used inside DiagramCanvas');
  return s;
}

export function useViewport(): ViewportApi {
  const api = useContext(ViewportContext);
  if (!api) throw new Error('useViewport must be used inside DiagramCanvas');
  return api;
}

export function useCamera(): Camera {
  const camera = useContext(CameraContext);
  if (!camera) throw new Error('useCamera must be used inside DiagramCanvas');
  return camera;
}
