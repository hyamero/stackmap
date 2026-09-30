'use client';

import { useEffect } from 'react';

/**
 * The nav's #viewer, #kinds and #install point at the desktop scenes' ids. On a phone those are hidden,
 * so the hash goes to the phone scene that carries the same data-anchor instead.
 */
export function HashAnchors() {
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const desktop = id && document.getElementById(id);
      if (!desktop || desktop.offsetParent !== null || desktop.closest('.pin-spacer')) return;
      document.querySelector(`.lp-m [data-anchor="${CSS.escape(id)}"]`)?.scrollIntoView();
    };
    go();
    addEventListener('hashchange', go);
    return () => removeEventListener('hashchange', go);
  }, []);
  return null;
}
