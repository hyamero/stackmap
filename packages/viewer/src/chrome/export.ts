import { toBlob, toSvg } from 'html-to-image';
import type { Rect } from '@stackmap/core';

/** Space around the diagram in exports, in diagram px. */
export const EXPORT_PADDING = 32;

export const exportFileName = (title: string, ext: string) =>
  `${
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'diagram'
  }.${ext}`;

// The whole diagram at 1:1 (not just what's on screen), on the stage background.
function options(content: Rect, pixelRatio: number) {
  const viewport = document.querySelector<HTMLElement>('.sm-viewport');
  if (!viewport) throw new Error('no diagram on the page');
  const width = Math.ceil(content.width + 2 * EXPORT_PADDING);
  const height = Math.ceil(content.height + 2 * EXPORT_PADDING);
  const stage = getComputedStyle(document.documentElement).getPropertyValue('--sm-stage').trim();
  return {
    node: viewport,
    opts: {
      width,
      height,
      pixelRatio,
      backgroundColor: stage,
      style: {
        transform: `translate(${EXPORT_PADDING - content.x}px, ${EXPORT_PADDING - content.y}px)`,
        width: `${width}px`,
        height: `${height}px`,
      },
    },
  };
}

export async function exportPng(content: Rect, scale: 1 | 2): Promise<Blob> {
  const { node, opts } = options(content, scale);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error('PNG export produced no image');
  return blob;
}

/**
 * SVG wrapping an HTML snapshot in <foreignObject>: exact look, fonts embedded, but not editable
 * vector shapes, and some tools (Figma, Illustrator) don't render foreignObject.
 */
export async function exportSvg(content: Rect): Promise<string> {
  const { node, opts } = options(content, 1);
  return toSvg(node, opts);
}

export function download(href: string, name: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
}
