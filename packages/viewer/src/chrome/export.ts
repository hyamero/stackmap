import { getFontEmbedCSS, toBlob, toSvg } from 'html-to-image';
import type { Rect } from '@stackmap/core';
import { settleAll } from '../motion/motion';

/** Space around the diagram in exports, in diagram px. */
export const EXPORT_PADDING = 32;
/** Longest canvas side browsers render (Chromium, Firefox); beyond it html-to-image silently shrinks. */
export const CANVAS_MAX = 16384;

export const exportFileName = (title: string, ext: string) =>
  `${
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'diagram'
  }.${ext}`;

/** Canvas area Safari/WebKit renders; past it the canvas silently comes out blank. */
export const CANVAS_AREA_MAX = 16_777_216;

/** The requested scale, or less when the canvas would pass either browser limit. */
export const effectiveScale = (width: number, height: number, scale: number) =>
  Math.min(scale, CANVAS_MAX / Math.max(width, height), Math.sqrt(CANVAS_AREA_MAX / (width * height)));

// Only properties that change how a card, frame or edge looks. Copying every computed property
// inline made a 6-card SVG 1.4 MB (a 500-node one ~90 MB).
const STYLE_PREFIXES = [
  'display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'min-', 'max-', 'box-sizing',
  'margin', 'padding', 'flex', 'grid', 'gap', 'row-gap', 'column-gap', 'align-', 'justify-', 'place-', 'order',
  'overflow', 'text-overflow', 'white-space', 'font', 'line-height', 'letter-spacing', 'text-align',
  'text-transform', 'text-decoration', 'vertical-align', 'color', 'background', 'border', 'box-shadow',
  'outline', 'opacity', 'transform', 'fill', 'stroke', 'marker', 'visibility', 'z-index', 'inset',
  '-webkit-font-smoothing', 'shape-rendering',
];
// The snapshot re-resolves the SVG layer's var(--sm-…) colours (edges and their tones, arrowheads, handle dots,
// lifelines), so those tokens must travel; the other theme tokens would only bloat every element's inline style.
const SVG_TOKENS = /^--sm-(edge|handle|text|group-border|[a-z]+-accent)$/;
// Chromium resolves SVG geometry (path `d`, circle `r`, …) as CSS; without these the clone draws no edges.
const SVG_GEOMETRY = ['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'paint-order', 'vector-effect'];
let styleProps: string[] | undefined;
const includedStyles = (el: Element) =>
  (styleProps ??= [...getComputedStyle(el)].filter(
    (p) => SVG_GEOMETRY.includes(p) || SVG_TOKENS.test(p) || STYLE_PREFIXES.some((x) => p.startsWith(x)),
  ));

// Font CSS (the inlined Geist data URLs) is the same for every export; build it once.
let fontCss: Promise<string> | undefined;

async function options(content: Rect, pixelRatio: number) {
  // The clone copies computed styles: an export mid-intro would otherwise keep faded cards and half-drawn edges.
  await settleAll();
  const node = document.querySelector<HTMLElement>('.sm-viewport');
  if (!node) throw new Error('no diagram on the page');
  const width = Math.ceil(content.width + 2 * EXPORT_PADDING);
  const height = Math.ceil(content.height + 2 * EXPORT_PADDING);
  const stage = getComputedStyle(document.documentElement).getPropertyValue('--sm-stage').trim();
  fontCss ??= getFontEmbedCSS(node);
  return {
    node,
    width,
    height,
    opts: {
      width,
      height,
      pixelRatio,
      backgroundColor: stage,
      fontEmbedCSS: await fontCss,
      includeStyleProperties: includedStyles(node),
      style: {
        transform: `translate(${EXPORT_PADDING - content.x}px, ${EXPORT_PADDING - content.y}px)`,
        width: `${width}px`,
        height: `${height}px`,
      },
    },
  };
}

/** The whole diagram at 1:1 (not just what's on screen), on the stage background. */
export async function exportPng(content: Rect, scale: 1 | 2): Promise<{ blob: Blob; scale: number }> {
  const width = Math.ceil(content.width + 2 * EXPORT_PADDING);
  const height = Math.ceil(content.height + 2 * EXPORT_PADDING);
  const effective = effectiveScale(width, height, scale);
  const { node, opts } = await options(content, effective);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error('PNG export produced no image');
  return { blob, scale: effective };
}

/**
 * SVG wrapping an HTML snapshot in <foreignObject>: exact look, fonts embedded, but not editable
 * vector shapes, and some tools (Figma, Illustrator) don't render foreignObject.
 */
export async function exportSvg(content: Rect): Promise<Blob> {
  const { node, opts } = await options(content, 1);
  const url = await toSvg(node, opts);
  // A Blob instead of a multi-megabyte data: URL on an <a href>.
  return new Blob([decodeURIComponent(url.slice(url.indexOf(',') + 1))], { type: 'image/svg+xml' });
}

export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
