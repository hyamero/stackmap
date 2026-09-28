import { createContext, useContext } from 'react';
import type { Camera, ViewportApi } from './useZoom';

const ViewportContext = createContext<ViewportApi | null>(null);
// Separate from the viewport, which changes every pan/zoom frame: cards only need the (stable) camera.
const CameraContext = createContext<Camera | null>(null);

export const ViewportProvider = ViewportContext.Provider;
export const CameraProvider = CameraContext.Provider;

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
