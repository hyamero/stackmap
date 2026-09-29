import { useSyncExternalStore } from 'react';

// The edges a pulse is travelling right now, for chrome that follows playback (the route's step list).
// Published by the flow layer only when the set changes, so subscribers re-render per hop, not per frame.
const EMPTY: ReadonlySet<string> = new Set();
let current = EMPTY;
let key = '';
const listeners = new Set<() => void>();

export function setInFlight(ids: string[]): void {
  const next = ids.join('\n');
  if (next === key) return;
  key = next;
  current = ids.length ? new Set(ids) : EMPTY;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useInFlight = (): ReadonlySet<string> => useSyncExternalStore(subscribe, () => current, () => EMPTY);
