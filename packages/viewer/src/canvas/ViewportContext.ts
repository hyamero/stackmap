import { createContext, useContext } from 'react';
import type { ViewportApi } from './useZoom';

const ViewportContext = createContext<ViewportApi | null>(null);

export const ViewportProvider = ViewportContext.Provider;

export function useViewport(): ViewportApi {
  const api = useContext(ViewportContext);
  if (!api) throw new Error('useViewport must be used inside DiagramCanvas');
  return api;
}
