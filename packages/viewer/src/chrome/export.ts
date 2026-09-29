import { getFontEmbedCSS, toBlob, toCanvas, toSvg } from 'html-to-image';
import type { Point, Rect as SceneRect } from '@stackmap/core';
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

async function options(content: SceneRect, pixelRatio: number) {
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
export async function exportPng(content: SceneRect, scale: 1 | 2): Promise<{ blob: Blob; scale: number }> {
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
export async function exportSvg(content: SceneRect): Promise<Blob> {
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

export type RasterType = 'image/jpeg' | 'image/webp';

/** Whether this browser can encode `type` from a canvas (Safari writes PNG when asked for WebP). */
export function canEncode(type: string): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    return c.toDataURL(type).startsWith(`data:${type}`);
  } catch {
    return false;
  }
}

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error(`the browser produced no ${type}`))), type, quality));

/** JPEG or WebP of the whole diagram at 2× (less past the canvas limits), on the stage background. */
export async function exportRaster(content: SceneRect, type: RasterType): Promise<{ blob: Blob; scale: number }> {
  const width = Math.ceil(content.width + 2 * EXPORT_PADDING);
  const height = Math.ceil(content.height + 2 * EXPORT_PADDING);
  const scale = effectiveScale(width, height, 2);
  const { node, opts } = await options(content, scale);
  const canvas = await toCanvas(node, opts);
  return { blob: await canvasBlob(canvas, type, 0.92), scale };
}

/** Video containers in preference order; the first this browser's MediaRecorder can write wins. */
const VIDEO_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
export function videoType(): string | null {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement === 'undefined' || !('captureStream' in HTMLCanvasElement.prototype)) return null;
  return VIDEO_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}
export const videoExtension = (type: string) => (type.startsWith('video/mp4') ? 'mp4' : 'webm');

/** The point `t` (0–1) of the way along a polyline. */
export function pointAlong(points: Point[], t: number): Point {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i]!.x, p.y - points[i]!.y));
  let left = Math.max(0, Math.min(1, t)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i]! || i === lengths.length - 1) {
      const f = lengths[i] ? Math.min(1, left / lengths[i]!) : 0;
      return { x: points[i]!.x + (points[i + 1]!.x - points[i]!.x) * f, y: points[i]!.y + (points[i + 1]!.y - points[i]!.y) * f };
    }
    left -= lengths[i]!;
  }
  return points.at(-1)!;
}

export interface FlowEdge {
  points: Point[];
  /** CSS colour of the pulse (the source node's accent) */
  color: string;
  /** 0–1: when in the loop its pulse sets off, in reading order */
  start: number;
}

export const VIDEO = { duration: 6000, period: 3000, travel: 1200, fps: 30, maxWidth: 1920, maxHeight: 1080 } as const;

/**
 * A short video of the diagram with its flow animated: the snapshot every export uses, and a pulse running
 * along each connection in reading order, looping. Recorded from a canvas with MediaRecorder.
 */
export async function exportVideo(content: SceneRect, edges: FlowEdge[], type: string): Promise<Blob> {
  const width = Math.ceil(content.width + 2 * EXPORT_PADDING);
  const height = Math.ceil(content.height + 2 * EXPORT_PADDING);
  // A frame the encoder can keep up with: the whole diagram inside 1920×1080.
  const scale = Math.min(effectiveScale(width, height, 2), VIDEO.maxWidth / width, VIDEO.maxHeight / height);
  const { node, opts } = await options(content, scale);
  const base = await toCanvas(node, opts);
  const out = document.createElement('canvas');
  // Encoders want even dimensions.
  out.width = base.width - (base.width % 2);
  out.height = base.height - (base.height % 2);
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('no 2D canvas');
  const at = (p: Point) => ({ x: (p.x - content.x + EXPORT_PADDING) * scale, y: (p.y - content.y + EXPORT_PADDING) * scale });
  const routes = edges.filter((e) => e.points.length > 1).map((e) => ({ ...e, points: e.points.map(at) }));
  const frame = (ms: number) => {
    ctx.drawImage(base, 0, 0);
    for (const e of routes) {
      const t = (((ms - e.start * (VIDEO.period - VIDEO.travel)) % VIDEO.period) + VIDEO.period) % VIDEO.period;
      if (t > VIDEO.travel) continue;
      const p = pointAlong(e.points, t / VIDEO.travel);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * scale, 0, Math.PI * 2);
      ctx.globalAlpha = 1;
      ctx.fill();
    }
  };
  frame(0);
  const stream = out.captureStream(VIDEO.fps);
  const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  let failure: Error | null = null;
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onerror = () => (failure = new Error('the browser stopped recording'));
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));
  // A hidden tab stops drawing frames; say so rather than save a frozen video.
  const onHidden = () => document.hidden && (failure ??= new Error('the tab was hidden while recording'));
  document.addEventListener('visibilitychange', onHidden);
  recorder.start();
  const began = performance.now();
  try {
    await new Promise<void>((resolve) => {
      const tick = () => {
        const ms = performance.now() - began;
        frame(ms);
        if (ms < VIDEO.duration && !failure) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  } finally {
    document.removeEventListener('visibilitychange', onHidden);
    if (recorder.state !== 'inactive') recorder.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
  }
  if (failure) throw failure;
  if (!chunks.length) throw new Error('the recording came out empty');
  return new Blob(chunks, { type: type.split(';')[0] });
}
