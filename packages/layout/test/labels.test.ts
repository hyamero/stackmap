import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { polylineMidpoint, type DiagramDraft, type LaidOutDiagram, type Point, type Rect } from '@stackmap/core';
import { GALLERY } from '@stackmap/core/gallery';
import { commerceApi, groupedPlatform } from '@stackmap/core/samples';
import { labelWidth } from '../src/labels';
import { layoutDiagram } from '../src/index';

const overlap = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
/** Whether an axis-aligned segment runs through the rectangle's interior. */
const crosses = (a: Point, b: Point, r: Rect) =>
  Math.max(a.x, b.x) > r.x && Math.min(a.x, b.x) < r.x + r.width && Math.max(a.y, b.y) > r.y && Math.min(a.y, b.y) < r.y + r.height;

const read = (dir: URL) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f, JSON.parse(readFileSync(new URL(f, dir), 'utf8')) as DiagramDraft] as const);

// Everything stackmap ships a picture of: the samples, the archify gallery, the skill's examples and the site's gallery.
const shipped: (readonly [string, DiagramDraft])[] = [
  ['commerceApi', commerceApi] as const,
  ['groupedPlatform', groupedPlatform] as const,
  ...Object.entries(GALLERY).map(([name, d]) => [name, d] as const),
  ...read(new URL('../../../skill/examples/', import.meta.url)),
  ...read(new URL('../../../site/content/examples/', import.meta.url)),
].filter(([, d]) => d.kind !== 'sequence');

const laid = await Promise.all(shipped.map(async ([name, d]) => [name, d, await layoutDiagram(d)] as const));

/** Each label's pill where the viewer draws it: the layout's spot, else the route's midpoint. */
function pills(draft: DiagramDraft, out: LaidOutDiagram): { id: string; rect: Rect }[] {
  return draft.edges
    .filter((e) => e.label && out.edges[e.id])
    .map((e) => {
      const p = out.labels?.[e.id] ?? polylineMidpoint(out.edges[e.id]!);
      const w = labelWidth(e.label!);
      return { id: e.id, rect: { x: p.x - w / 2, y: p.y - 10, width: w, height: 20 } };
    });
}

describe.each(laid)('edge labels in %s', (_name, draft, out) => {
  const all = pills(draft, out);

  it('places every label', () => {
    for (const p of all) expect(out.labels?.[p.id], p.id).toBeDefined();
  });

  it('keeps labels off each other and off the cards', () => {
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) expect(overlap(all[i]!.rect, all[j]!.rect), `${all[i]!.id} × ${all[j]!.id}`).toBe(false);
      for (const [n, r] of Object.entries(out.nodes)) expect(overlap(all[i]!.rect, r), `${all[i]!.id} on ${n}`).toBe(false);
    }
  });

  it("keeps labels off other edges' lines", () => {
    for (const p of all) {
      for (const [id, pts] of Object.entries(out.edges)) {
        if (id === p.id) continue;
        const hit = pts.slice(1).some((b, i) => crosses(pts[i]!, b, p.rect));
        expect(hit, `${p.id} over ${id}`).toBe(false);
      }
    }
  });
});
