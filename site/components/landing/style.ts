import type { CSSProperties } from 'react';

/** Board markup sets custom properties (--x, --z…) inline, which CSSProperties doesn't type. */
export const s = (style: Record<string, string>) => style as CSSProperties;
