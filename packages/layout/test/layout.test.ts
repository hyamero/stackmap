import { describe, expect, it } from 'vitest';
import { cardSize, type DiagramDraft, type DiagramNode, type Point, type Rect } from '@stackmap/core';
import { commerceApi, groupedPlatform } from '@stackmap/core/samples';
import { GROUP_LABEL_BAND, layoutDiagram } from '../src/index';
import { STRESS } from './stress';

const node = (id: string, extra: Partial<DiagramNode> = {}): DiagramNode => ({
  id,
  type: 'service',
  card: { title: id },
  ...extra,
});
const draft = (d: Partial<DiagramDraft>): DiagramDraft => ({ kind: 'architecture', title: 't', nodes: [], edges: [], ...d });
const rightMid = (r: Rect): Point => ({ x: r.x + r.width, y: r.y + r.height / 2 });
const leftMid = (r: Rect): Point => ({ x: r.x, y: r.y + r.height / 2 });
const near = (a: Point, b: Point) => {
  expect(a.x).toBeCloseTo(b.x, 0);
  expect(a.y).toBeCloseTo(b.y, 0);
};

describe('layoutDiagram', () => {
  it('places the target to the right and routes port to port', async () => {
    const out = await layoutDiagram(
      draft({ nodes: [node('a'), node('b')], edges: [{ id: 'e', from: 'a', to: 'b' }] }),
    );
    const a = out.nodes.a!;
    const b = out.nodes.b!;
    expect(b.x).toBeGreaterThan(a.x + a.width);
    const pts = out.edges.e!;
    near(pts[0]!, rightMid(a));
    near(pts[pts.length - 1]!, leftMid(b));
  });

  it('sizes every node with cardSize', async () => {
    const rich = node('r', { card: { title: 'r', rows: [{ label: 'x', value: 'y' }], cta: { label: 'go' } } });
    const out = await layoutDiagram(draft({ nodes: [rich] }));
    expect(out.nodes.r!.width).toBe(cardSize(rich.card).width);
    expect(out.nodes.r!.height).toBe(cardSize(rich.card).height);
  });

  it('routes every segment orthogonally', async () => {
    const out = await layoutDiagram(groupedPlatform);
    for (const [id, pts] of Object.entries(out.edges)) {
      for (let i = 1; i < pts.length; i++) {
        const axisAligned = Math.abs(pts[i]!.x - pts[i - 1]!.x) < 0.5 || Math.abs(pts[i]!.y - pts[i - 1]!.y) < 0.5;
        expect(axisAligned, `edge ${id} segment ${i}`).toBe(true);
      }
    }
  });

  it('keeps grouped nodes inside their group, below the label band, in absolute coordinates', async () => {
    const out = await layoutDiagram(groupedPlatform);
    for (const n of groupedPlatform.nodes.filter((n) => n.group)) {
      const r = out.nodes[n.id]!;
      const g = out.groups[n.group!]!;
      expect(r.x, n.id).toBeGreaterThanOrEqual(g.x);
      expect(r.y, n.id).toBeGreaterThanOrEqual(g.y + GROUP_LABEL_BAND - 1);
      expect(r.x + r.width, n.id).toBeLessThanOrEqual(g.x + g.width);
      expect(r.y + r.height, n.id).toBeLessThanOrEqual(g.y + g.height);
    }
  });

  it('fan-in converges on the target port', async () => {
    const out = await layoutDiagram(
      draft({
        nodes: [node('s1'), node('s2'), node('s3'), node('t')],
        edges: ['s1', 's2', 's3'].map((s) => ({ id: `${s}-t`, from: s, to: 't' })),
      }),
    );
    const target = leftMid(out.nodes.t!);
    for (const s of ['s1', 's2', 's3']) {
      const pts = out.edges[`${s}-t`]!;
      near(pts[pts.length - 1]!, target);
    }
  });

  it('stacks siblings fed from one source in draft order', async () => {
    const siblings = ['s1', 's2', 's3'];
    const out = await layoutDiagram(
      draft({
        nodes: [node('src'), ...siblings.map((s) => node(s)), node('t1'), node('t2')],
        edges: [
          ...siblings.map((s) => ({ id: `src-${s}`, from: 'src', to: s })),
          ...siblings.flatMap((s) => ['t1', 't2'].map((t) => ({ id: `${s}-${t}`, from: s, to: t }))),
        ],
      }),
    );
    const ys = siblings.map((s) => out.nodes[s]!.y);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
  });

  it('keeps the Commerce API instances in draft order', async () => {
    const out = await layoutDiagram(commerceApi);
    const ys = [1, 2, 3].map((i) => out.nodes[`commerce-api-${i}`]!.y);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
  });

  it('wraps a wide left-to-right diagram instead of laying it out as one long strip', async () => {
    const { width, height } = (await layoutDiagram({ ...groupedPlatform, direction: 'RIGHT' })).bounds;
    expect(width / height).toBeLessThanOrEqual(2.6);
  });

  it('keeps a short chain on one row', async () => {
    const out = await layoutDiagram(
      draft({ nodes: [node('a'), node('b'), node('c')], edges: [{ id: 'ab', from: 'a', to: 'b' }, { id: 'bc', from: 'b', to: 'c' }] }),
    );
    expect(out.nodes.b!.y).toBe(out.nodes.a!.y);
    expect(out.nodes.c!.y).toBe(out.nodes.a!.y);
  });

  it('lays out top-down when direction is DOWN', async () => {
    const out = await layoutDiagram(
      draft({ direction: 'DOWN', nodes: [node('a'), node('b')], edges: [{ id: 'e', from: 'a', to: 'b' }] }),
    );
    expect(out.nodes.b!.y).toBeGreaterThan(out.nodes.a!.y + out.nodes.a!.height);
  });

  it('lays the grouped sample out top-down with every edge flowing downward', async () => {
    const out = await layoutDiagram(groupedPlatform);
    for (const [id, pts] of Object.entries(out.edges)) {
      expect(pts[pts.length - 1]!.y, id).toBeGreaterThan(pts[0]!.y);
    }
  });

  it('lays a reply out against the flow, so the caller stays upstream of what it calls', async () => {
    const out = await layoutDiagram(
      draft({
        direction: 'DOWN',
        groups: [{ id: 'ui', label: 'UI' }, { id: 'api', label: 'API' }],
        nodes: [node('api', { group: 'api' }), node('feed', { type: 'client', group: 'ui' }), node('picker', { type: 'client', group: 'ui' })],
        edges: [
          { id: 'send', from: 'picker', to: 'api' },
          { id: 'reply', from: 'api', to: 'feed', kind: 'return' },
        ],
      }),
    );
    expect(out.groups.ui!.y + out.groups.ui!.height).toBeLessThan(out.groups.api!.y);
    // The call drops straight in; the reply climbs back up from the callee's top to the caller's bottom.
    expect(out.edges.send!.length).toBeLessThanOrEqual(4);
    const reply = out.edges.reply!;
    expect(reply[0]!.y).toBeCloseTo(out.nodes.api!.y, 0);
    expect(reply.at(-1)!.y).toBeCloseTo(out.nodes.feed!.y + out.nodes.feed!.height, 0);
  });

  it('breaks a cycle at the edge that points back to where the flow started', async () => {
    const out = await layoutDiagram(
      draft({
        direction: 'DOWN',
        nodes: [node('a'), node('b'), node('c')],
        edges: [
          { id: 'ab', from: 'a', to: 'b' },
          { id: 'bc', from: 'b', to: 'c' },
          { id: 'ca', from: 'c', to: 'a', label: 'retry' },
        ],
      }),
    );
    expect(out.nodes.a!.y).toBeLessThan(out.nodes.b!.y);
    expect(out.nodes.b!.y).toBeLessThan(out.nodes.c!.y);
    // The back edge leaves c by its top and enters a by its bottom instead of wrapping round the diagram.
    const ca = out.edges.ca!;
    expect(ca[0]!.y).toBeCloseTo(out.nodes.c!.y, 0);
    expect(ca.at(-1)!.y).toBeCloseTo(out.nodes.a!.y + out.nodes.a!.height, 0);
  });

  it('gives labelled edges and edges of different styles their own port', async () => {
    const targets = ['t1', 't2', 't3', 't4'];
    for (const direction of ['RIGHT', 'DOWN'] as const) {
      const out = await layoutDiagram(
        draft({
          direction,
          nodes: [node('hub'), ...targets.map((t) => node(t)), node('m'), node('s')],
          edges: [
            ...targets.map((t) => ({ id: t, from: 'hub', to: t, label: `to ${t}` })),
            { id: 'main', from: 'hub', to: 'm', tone: 'main' as const },
            { id: 'sec', from: 'hub', to: 's', tone: 'security' as const },
          ],
        }),
      );
      const starts = Object.values(out.edges).map((pts) => `${pts[0]!.x},${pts[0]!.y}`);
      expect(new Set(starts).size, direction).toBe(starts.length);
    }
  });

  it('still merges unlabelled edges of one style into a shared port', async () => {
    const out = await layoutDiagram(
      draft({
        direction: 'DOWN',
        nodes: [node('hub'), node('a'), node('b'), node('c')],
        edges: ['a', 'b', 'c'].map((t) => ({ id: t, from: 'hub', to: t })),
      }),
    );
    const starts = Object.values(out.edges).map((pts) => `${pts[0]!.x},${pts[0]!.y}`);
    expect(new Set(starts).size).toBe(1);
  });

  it('top-aligns the cards of a row, whatever their heights', async () => {
    // In the hub, feed (a reply's target) and finisher are shorter than their row-mates and used to be centred on them.
    const out = await layoutDiagram(STRESS['hub-down']!);
    expect(out.nodes.feed!.y).toBe(out.nodes.picker!.y);
    expect(out.nodes.finisher!.y).toBe(out.nodes.pin!.y);
    expect(out.nodes.effort!.y).toBe(out.nodes.pin!.y);
  });

  it('is deterministic', async () => {
    expect(await layoutDiagram(groupedPlatform)).toEqual(await layoutDiagram(groupedPlatform));
  });

  it('rejects dangling references with a precise message', async () => {
    await expect(
      layoutDiagram(draft({ nodes: [node('a')], edges: [{ id: 'e1', from: 'a', to: 'ghost' }] })),
    ).rejects.toThrow("Edge 'e1' references unknown node 'ghost'");
    await expect(layoutDiagram(draft({ nodes: [node('a', { group: 'nope' })] }))).rejects.toThrow(
      "Node 'a' references unknown group 'nope'",
    );
  });
});
