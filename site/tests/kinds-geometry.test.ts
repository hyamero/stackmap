import { beforeAll, describe, expect, it } from 'vitest';
import { DIAGRAM_KINDS, type LaidOutDiagram } from '@stackmap/core';
import { kindsGeometry, kindsKeyframes, type KindsGeometry } from '../components/landing/kinds-geometry';
import { layoutSite } from '../lib/data/diagrams';

const AREA = { cx: 720, cy: 640, width: 1248, height: 522 };
let checkout: Record<string, LaidOutDiagram>;
let g: KindsGeometry;

beforeAll(async () => {
  checkout = (await layoutSite()).checkout;
  g = kindsGeometry(checkout, AREA);
}, 60_000);

describe('kinds geometry', () => {
  it('fits every kind inside the area at one shared scale', () => {
    for (const l of g.layers) {
      const { width, height } = l.diagram.bounds;
      expect(l.left).toBeGreaterThanOrEqual(AREA.cx - AREA.width / 2 - 1);
      expect(l.top).toBeGreaterThanOrEqual(AREA.cy - AREA.height / 2 - 1);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    }
    expect(Math.min(...g.layers.map((l) => l.cam))).toBeCloseTo(1, 5);
  });

  it('never zooms a kind past the cap', () => {
    for (const l of g.layers) expect(l.cam).toBeLessThanOrEqual(1.35);
  });

  it('puts each slot on its node’s laid-out card, for every kind that has one', () => {
    const wf = DIAGRAM_KINDS.indexOf('workflow');
    const face = g.slots[0]![wf]!;
    expect(face.card.node.id).toBe('add');
    expect(face.rect.width).toBeCloseTo(face.card.rect.width * g.scale, 5);
  });

  it('writes one timeline per slot, face, layer and the camera', () => {
    const css = kindsKeyframes(g, 'd-');
    const faces = g.slots.flat().filter(Boolean).length;
    expect(css.match(/@keyframes d-tl-ks\d\{/g)).toHaveLength(g.slots.length);
    expect(css.match(/@keyframes d-tl-kf\d_\d\{/g)).toHaveLength(faces);
    expect(css.match(/@keyframes d-tl-kl\d\{/g)).toHaveLength(DIAGRAM_KINDS.length);
    expect(css).toContain('@keyframes d-tl-kcam{');
  });

  it('hides a slot through the kinds that leave it empty', () => {
    const css = kindsKeyframes(g, 'd-');
    const slot3 = css.match(/@keyframes d-tl-ks3\{(.*?)\}\n/)![1]!;
    // dataflow (kind 1) has no card in slot 3: 23% and 36% hold it invisible
    expect(slot3).toMatch(/23%\{[^}]*opacity:0/);
  });
});
