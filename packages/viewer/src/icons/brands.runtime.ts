// The built template's stand-in for brands.gen (see vite.config.ts): the marks travel as a data block,
// which `stackmap deliver` trims to the brands the diagram uses.
export const BRANDS_ELEMENT_ID = 'stackmap-brands';

const text = typeof document === 'undefined' ? null : document.getElementById(BRANDS_ELEMENT_ID)?.textContent;
export const BRANDS: Record<string, { title: string; path: string }> = text ? JSON.parse(text) : {};
