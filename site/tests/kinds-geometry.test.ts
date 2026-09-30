import { beforeAll, describe, expect, it } from 'vitest';
import { DIAGRAM_KINDS, type LaidOutDiagram } from '@stackmap/core';
import { HOLDS, holdTime, kindsGeometry, kindsTweens, restingFlow, type KindsGeometry } from '../components/landing/kinds-geometry';
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

  it('writes one tween per slot, face, layer and the camera', () => {
    const tweens = kindsTweens(g);
    const faces = g.slots.flat().filter(Boolean).length;
    const targets = tweens.map((t) => t.target);
    expect(targets.filter((t) => /^\.ks\d$/.test(t))).toHaveLength(g.slots.length);
    expect(targets.filter((t) => /^\.kf\d_\d$/.test(t))).toHaveLength(faces);
    expect(targets.filter((t) => /^\.kl\d$/.test(t))).toHaveLength(DIAGRAM_KINDS.length);
    expect(targets).toContain('.kcam');
  });

  it('hides a slot through the kinds that leave it empty', () => {
    const slot3 = kindsTweens(g).find((t) => t.target === '.ks3')!;
    // dataflow (kind 1) has no card in slot 3: its hold keeps the slot invisible
    expect(slot3.frames['23%']!.opacity).toBe('0');
    expect(slot3.frames['36%']!.opacity).toBe('0');
  });

  it('moves on the board\'s in-out curve and holds still in each kind', () => {
    const slot0 = kindsTweens(g).find((t) => t.target === '.ks0')!;
    expect(slot0.frames['23%']!.ease).toBe('cb:0.77,0,0.175,1');
    expect(slot0.frames['16%']!.left).toBe(slot0.frames['0%']!.left);
  });
});

describe('kind flows', () => {
  it('gives every kind a flow along its own drawn connections', () => {
    for (const kind of DIAGRAM_KINDS) {
      const { flow, width, height } = restingFlow(checkout[kind]!);
      expect(flow.pulses.length).toBeGreaterThan(0);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    }
  });

  it('lands on a ripple instead of a glow when asked to', () => {
    const { flow } = restingFlow(checkout.workflow!, { glows: false });
    expect(flow.pulses.every((p) => p.glow === null)).toBe(true);
  });

  it('scrubs one loop of a kind\'s flow through its hold, and none outside it', () => {
    const [a, b] = HOLDS[1]!;
    expect(holdTime(a / 100, 1, 3000)).toBe(0);
    expect(holdTime((a + b) / 200, 1, 3000)).toBeCloseTo(1500, 5);
    // The loop's end is its start again: the hold's last instant already belongs outside it.
    expect(holdTime(b / 100, 1, 3000)).toBeNull();
    expect(holdTime((b - 0.13) / 100, 1, 3000)).toBeCloseTo(2970, 5);
    expect(holdTime((a - 1) / 100, 1, 3000)).toBeNull();
    expect(holdTime((b + 1) / 100, 1, 3000)).toBeNull();
  });

  it('shows nothing before the scene starts scrubbing', () => {
    expect(holdTime(0, 0, 3000)).toBeNull();
  });
});
