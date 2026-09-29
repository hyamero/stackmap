import { useLayoutEffect, type RefObject } from 'react';
import type { Motion } from './motion';

/** Runs an entrance once when the element mounts (before paint) and settles it if the element goes away early. */
export function useEnter<T extends HTMLElement>(ref: RefObject<T | null>, play: (el: T | null) => Motion, enabled = true) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const motion = play(ref.current);
    return () => motion.cancel();
    // Mount-only by design: an entrance never replays on re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
