import { measureText, type Point, type Rect } from '@stackmap/core';

// Edge label placement shared by the lane and compact ELK layouts: the viewer's pill (11px Geist, 8px padding
// each side, 20px tall) on a run of the route, clear of cards and of other labels.

const LABEL_H = 20;
export const labelWidth = (text: string) => Math.ceil(measureText(text, 'sans400', 11)) + 16;
const round = (n: number) => Math.round(n * 100) / 100;

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/**
 * The label goes on the longest run that holds its pill without touching a card or another label; along a run
 * it may slide off the midpoint to clear a neighbour's pill. Horizontal runs are preferred.
 */
export function placeLabel(points: Point[], text: string, cards: Rect[], taken: Rect[]): Point {
  return findLabelSpot(points, text, cards, taken) ?? claimFallback(points, text, taken);
}

/** A spot that fits, claimed in `taken`; null when none does. */
export function findLabelSpot(points: Point[], text: string, cards: Rect[], taken: Rect[]): Point | null {
  const w = labelWidth(text);
  const pillAt = (p: Point): Rect => ({ x: p.x - w / 2, y: p.y - LABEL_H / 2, width: w, height: LABEL_H });
  let best: { p: Point; score: number } | null = null;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const horizontal = a.y === b.y;
    const len = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const room = horizontal ? len >= w + 16 : len >= LABEL_H + 16;
    if (!room) continue;
    // On the line first; a vertical run may also carry the pill just beside it (right, then left).
    const sides = horizontal ? [0] : [0, w / 2 + 4, -(w / 2 + 4)];
    search: for (const side of sides) {
      for (const t of [0.5, 0.35, 0.65, 0.2, 0.8]) {
        const p = { x: round(a.x + (b.x - a.x) * t + side), y: round(a.y + (b.y - a.y) * t) };
        const pill = pillAt(p);
        if (cards.some((r) => overlaps(pill, r)) || taken.some((r) => overlaps(pill, r))) continue;
        // Longer and horizontal runs first; off-centre and off-line spots lose a little.
        const score = (horizontal ? 2 : 1) * len - Math.abs(t - 0.5) * 40 - (side ? 30 : 0);
        if (!best || score > best.score) best = { p, score };
        break search;
      }
    }
  }
  if (!best) return null;
  taken.push(pillAt(best.p));
  return best.p;
}

/** No spot fits: the middle of the longest run, overlapping whatever is there. */
function claimFallback(points: Point[], text: string, taken: Rect[]): Point {
  let best = { p: points[0]!, len: -1 };
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const len = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    if (len > best.len) best = { p: { x: round((a.x + b.x) / 2), y: round((a.y + b.y) / 2) }, len };
  }
  const w = labelWidth(text);
  taken.push({ x: best.p.x - w / 2, y: best.p.y - LABEL_H / 2, width: w, height: LABEL_H });
  return best.p;
}

