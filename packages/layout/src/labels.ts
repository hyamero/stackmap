import { measureText, polylineMidpoint, type Point, type Rect } from '@stackmap/core';

// Edge label placement shared by the lane and ELK layouts: the viewer's pill (11px Geist, 8px padding each side,
// 20px tall) on a run of the route, clear of cards, other labels and other edges' lines.

const LABEL_H = 20;
export const labelWidth = (text: string) => Math.ceil(measureText(text, 'sans400', 11)) + 16;
const round = (n: number) => Math.round(n * 100) / 100;

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
/** Whether any axis-aligned segment of a route runs through the rectangle. */
const crossed = (r: Rect, lines: Point[][]) =>
  lines.some((pts) =>
    pts.slice(1).some((b, i) => {
      const a = pts[i]!;
      return Math.max(a.x, b.x) > r.x && Math.min(a.x, b.x) < r.x + r.width && Math.max(a.y, b.y) > r.y && Math.min(a.y, b.y) < r.y + r.height;
    }),
  );
const pillAt = (p: Point, w: number): Rect => ({ x: p.x - w / 2, y: p.y - LABEL_H / 2, width: w, height: LABEL_H });

/**
 * Every label of a laid-out diagram, in draft order. A label goes on the longest run of its route that holds its
 * pill clear of cards, other labels and other edges' lines; along a run it may slide off the midpoint to clear a
 * neighbour. Horizontal runs are preferred. Where no spot clears the lines, one that clears cards and labels does,
 * and failing that the middle of the longest run. With `keepMidpoints`, a label whose route midpoint is already
 * clear stays there (where the viewer drew it before full layouts placed labels), so only the crowded ones move.
 * `misfit` is the widest label that found no fully clear spot, 0 when all did.
 */
export function placeLabels(
  edges: { id: string; label?: string }[],
  routes: Record<string, Point[]>,
  cards: Rect[],
  keepMidpoints = false,
): { labels: Record<string, Point>; misfit: number } {
  const labelled = edges.filter((e) => e.label && routes[e.id]);
  const others = (id: string) => Object.entries(routes).flatMap(([k, pts]) => (k === id ? [] : [pts]));
  const taken: Rect[] = [];
  const labels: Record<string, Point> = {};
  if (keepMidpoints) {
    for (const e of labelled) {
      const p = polylineMidpoint(routes[e.id]!);
      const pill = pillAt(p, labelWidth(e.label!));
      if (cards.some((r) => overlaps(pill, r)) || taken.some((r) => overlaps(pill, r)) || crossed(pill, others(e.id))) continue;
      // Claimed now, so a later label whose midpoint lands here is the one that moves.
      taken.push(pill);
      labels[e.id] = { x: round(p.x), y: round(p.y) };
    }
  }
  let misfit = 0;
  for (const e of labelled) {
    if (labels[e.id]) continue;
    const spot = findLabelSpot(routes[e.id]!, e.label!, cards, taken, others(e.id));
    if (spot) labels[e.id] = spot;
    else misfit = Math.max(misfit, labelWidth(e.label!));
  }
  for (const e of labelled) if (!labels[e.id]) labels[e.id] = findLabelSpot(routes[e.id]!, e.label!, cards, taken) ?? claimFallback(routes[e.id]!, e.label!, taken);
  return { labels, misfit };
}

/** A spot that fits, claimed in `taken`; null when none does. */
export function findLabelSpot(points: Point[], text: string, cards: Rect[], taken: Rect[], lines: Point[][] = []): Point | null {
  const w = labelWidth(text);
  let best: { p: Point; score: number } | null = null;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const horizontal = a.y === b.y;
    const len = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const room = horizontal ? len >= w + 16 : len >= LABEL_H + 16;
    if (!room) continue;
    // On the line first; else just beside it: right then left of a vertical run, above then below a horizontal one
    // (a pause/resume pair on parallel runs gets one pill above and one below).
    const beside = horizontal ? LABEL_H / 2 + 3 : w / 2 + 4;
    const offsets: [number, number][] = horizontal ? [[0, 0], [0, -beside], [0, beside]] : [[0, 0], [beside, 0], [-beside, 0]];
    search: for (const [dx, dy] of offsets) {
      for (const t of [0.5, 0.35, 0.65, 0.2, 0.8]) {
        const p = { x: round(a.x + (b.x - a.x) * t + dx), y: round(a.y + (b.y - a.y) * t + dy) };
        const pill = pillAt(p, w);
        if (cards.some((r) => overlaps(pill, r)) || taken.some((r) => overlaps(pill, r)) || crossed(pill, lines)) continue;
        // Longer and horizontal runs first; off-centre and off-line spots lose a little.
        const score = (horizontal ? 2 : 1) * len - Math.abs(t - 0.5) * 40 - (dx || dy ? 30 : 0);
        if (!best || score > best.score) best = { p, score };
        break search;
      }
    }
  }
  if (!best) return null;
  taken.push(pillAt(best.p, w));
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
  taken.push(pillAt(best.p, labelWidth(text)));
  return best.p;
}

