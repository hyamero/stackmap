import { createRequire } from 'node:module';
import ElkApi from 'elkjs/lib/elk-api.js';
import ElkBundled from 'elkjs/lib/elk.bundled.js';
import type { ElkExtendedEdge, ElkNode, ElkPort } from 'elkjs/lib/elk-api';
import { cardSize, isLaneKind, usesCompactCards, type DiagramDraft, type Direction, type LaidOutDiagram, type Point, type Rect } from '@stackmap/core';
import { findLabelSpot, labelWidth, placeLabel } from './labels';
import { layoutLanes } from './lanes';
import { layoutSequence } from './sequence';

export { layoutLanes } from './lanes';
export { layoutSequence } from './sequence';

/** Vertical space reserved at the top of a group for its label. */
export const GROUP_LABEL_BAND = 48;
/** Stage bands (architecture/dataflow phases): the label band and the padding around their nodes. */
export const STAGE_LABEL_BAND = 44;
const STAGE_PAD = 20;
const COMPACT_GAP = { right: 72, max: 168 } as const;
const GROUP_PREFIX = 'group:';

// elkjs's bundled build treats any runtime with a global `self` and no `document` as a web worker
// (Bun, Deno), hijacks `self.onmessage` and never exports its in-process worker. Give those runtimes
// a real Worker instead; Node keeps the in-process one.
function createElk(): { elk: InstanceType<typeof ElkBundled>; dispose: () => void } {
  const g = globalThis as { self?: unknown; document?: unknown; Worker?: unknown };
  if (g.self === undefined || g.document !== undefined || g.Worker === undefined) {
    return { elk: new ElkBundled(), dispose: () => {} };
  }
  const workerUrl = createRequire(import.meta.url).resolve('elkjs/lib/elk-worker.min.js');
  const elk = new ElkApi({ workerUrl });
  // A real Worker keeps the process alive until terminated; the in-process one has no terminate().
  return { elk, dispose: () => elk.terminateWorker() };
}

const rootOptions = (direction: Direction, compact: boolean): Record<string, string> => ({
  'elk.algorithm': 'layered',
  'elk.direction': direction,
  'elk.edgeRouting': 'ORTHOGONAL',
  // Cross-group edges must be routed by one layout run, not per container.
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.padding': '[top=40,left=40,bottom=40,right=40]',
  'elk.spacing.nodeNode': '40',
  'elk.spacing.edgeNode': '20',
  // The layer gap must fit an edge label pill, which is far wider than it is tall.
  // Full cards reserve a label pill in every gap; compact layouts start tight and widen for labels (compactLabels).
  'elk.layered.spacing.nodeNodeBetweenLayers': direction === 'RIGHT' ? String(compact ? COMPACT_GAP.right : 120) : '72',
  'elk.layered.spacing.edgeNodeBetweenLayers': '24',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  // Draft order is the author's intended stacking; ELK otherwise reorders ties freely.
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  // Absolute coordinates everywhere, so the viewer never walks the hierarchy.
  'org.eclipse.elk.json.shapeCoords': 'ROOT',
  'org.eclipse.elk.json.edgeCoords': 'ROOT',
});

/**
 * Layout width (padding included) past which a ~1060px canvas fits the diagram below ~60% zoom, so the
 * layout is redone with wrapping. ELK's own wrap decision is scale-free (aspect ratio only) and would
 * also fold a short two-node chain, hence the width gate.
 */
const MAX_UNWRAPPED_WIDTH = 1600;

const wrapOptions: Record<string, string> = {
  'elk.layered.wrapping.strategy': 'SINGLE_EDGE',
  'elk.aspectRatio': '1.4',
  'elk.layered.wrapping.additionalEdgeSpacing': '40',
};

// One fixed in/out port per node is what makes fan-in/fan-out collapse into shared trunks.
function ports(id: string, width: number, height: number, direction: Direction): ElkPort[] {
  const horizontal = direction === 'RIGHT';
  return [
    {
      id: `${id}:in`,
      x: horizontal ? 0 : width / 2,
      y: horizontal ? height / 2 : 0,
      layoutOptions: { 'elk.port.side': horizontal ? 'WEST' : 'NORTH' },
    },
    {
      id: `${id}:out`,
      x: horizontal ? width : width / 2,
      y: horizontal ? height / 2 : height,
      layoutOptions: { 'elk.port.side': horizontal ? 'EAST' : 'SOUTH' },
    },
  ];
}

const round = (n: number) => Math.round(n * 100) / 100;

export async function layoutDiagram(draft: DiagramDraft): Promise<LaidOutDiagram> {
  if (isLaneKind(draft.kind)) return layoutLanes(draft);
  if (draft.kind === 'sequence') return layoutSequence(draft);
  const direction = draft.direction ?? 'RIGHT';
  const compact = usesCompactCards(draft);
  const variant = compact ? 'compact' : 'full';
  const stages = draft.phases?.length ? stagePartitions(draft) : null;
  const root: ElkNode = { id: 'root', layoutOptions: rootOptions(direction, compact), children: [], edges: [] };
  if (stages) {
    // Stages are ELK partitions: every node of stage i is laid out before (left of / above) stage i+1.
    root.layoutOptions!['elk.partitioning.activate'] = 'true';
    // Room for the stage labels above (RIGHT) or beside (DOWN) the first node row.
    root.layoutOptions!['elk.padding'] = direction === 'RIGHT' ? `[top=${40 + STAGE_LABEL_BAND},left=40,bottom=40,right=40]` : `[top=40,left=${40 + 160},bottom=40,right=40]`;
    // A stage band pads its nodes on both sides of the gap: keep a visible gutter between neighbours.
    root.layoutOptions!['elk.layered.spacing.nodeNodeBetweenLayers'] = String(Math.max(Number(root.layoutOptions!['elk.layered.spacing.nodeNodeBetweenLayers']), 2 * STAGE_PAD + 64));
  }

  const groupNodes = new Map<string, ElkNode>();
  for (const g of draft.groups ?? []) {
    groupNodes.set(g.id, {
      id: `${GROUP_PREFIX}${g.id}`,
      children: [],
      layoutOptions: {
        'elk.padding': `[top=${GROUP_LABEL_BAND},left=24,bottom=24,right=24]`,
        // Spacing doesn't inherit into containers. ELK's 20px layer gap can't fit a label pill plus an
        // arrowhead, and its 10px edge-node gap routes edges flush under cards.
        'elk.layered.spacing.nodeNodeBetweenLayers': '80',
        'elk.spacing.edgeNode': '20',
      },
    });
  }
  const containerOf = (groupId: string | undefined, owner: string): ElkNode => {
    if (!groupId) return root;
    const g = groupNodes.get(groupId);
    if (!g) throw new Error(`${owner} references unknown group '${groupId}'`);
    return g;
  };

  for (const g of draft.groups ?? []) containerOf(g.parent, `Group '${g.id}'`).children!.push(groupNodes.get(g.id)!);

  const nodeIds = new Set<string>();
  for (const n of draft.nodes) {
    nodeIds.add(n.id);
    const { width, height } = cardSize(n.card, variant);
    const partition = stages?.get(n.id);
    containerOf(n.group, `Node '${n.id}'`).children!.push({
      id: n.id,
      width,
      height,
      layoutOptions: { 'elk.portConstraints': 'FIXED_POS', ...(partition === undefined ? {} : { 'elk.partitioning.partition': String(partition) }) },
      ports: ports(n.id, width, height, direction),
    });
  }

  for (const e of draft.edges) {
    for (const end of [e.from, e.to]) {
      if (!nodeIds.has(end)) throw new Error(`Edge '${e.id}' references unknown node '${end}'`);
    }
    root.edges!.push({ id: e.id, sources: [`${e.from}:out`], targets: [`${e.to}:in`] });
  }

  const { elk, dispose } = createElk();
  try {
    const run = async (gap?: number) => {
      const opts = gap === undefined ? root.layoutOptions! : { ...root.layoutOptions, 'elk.layered.spacing.nodeNodeBetweenLayers': String(gap) };
      let result = await elk.layout({ ...structuredClone(root), layoutOptions: opts });
      // Wrapping would fold stages back onto each other.
      if ((result.width ?? 0) > MAX_UNWRAPPED_WIDTH && !stages) result = await elk.layout({ ...structuredClone(root), layoutOptions: { ...opts, ...wrapOptions } });
      return collect(draft, result, direction, stages !== null);
    };
    let laid = await run();
    if (!compact) return laid;
    // Compact layouts start with tight layer gaps and widen them once if a label found no room to sit.
    let spots = compactLabels(draft, laid);
    if (spots.misfit > 0) {
      laid = await run(Math.min(COMPACT_GAP.max, Math.max(Number(root.layoutOptions!['elk.layered.spacing.nodeNodeBetweenLayers']), spots.misfit + 24)));
      spots = compactLabels(draft, laid);
    }
    return { ...laid, labels: spots.labels };
  } finally {
    dispose();
  }
}

/** Widest label (px) that found no free spot on its route; 0 when all fit. Labels are placed either way. */
function compactLabels(draft: DiagramDraft, laid: LaidOutDiagram): { labels: Record<string, Point>; misfit: number } {
  const cards = Object.values(laid.nodes);
  const taken: Rect[] = [];
  const labels: Record<string, Point> = {};
  let misfit = 0;
  const pending = draft.edges.filter((e) => e.label && laid.edges[e.id]);
  for (const e of pending) {
    const spot = findLabelSpot(laid.edges[e.id]!, e.label!, cards, taken);
    if (spot) labels[e.id] = spot;
    else misfit = Math.max(misfit, labelWidth(e.label!));
  }
  for (const e of pending) if (!labels[e.id]) labels[e.id] = placeLabel(laid.edges[e.id]!, e.label!, cards, taken);
  return { labels, misfit };
}

function collect(draft: DiagramDraft, result: ElkNode, direction: Direction, staged: boolean): LaidOutDiagram {
  const nodes: Record<string, Rect> = {};
  const groups: Record<string, Rect> = {};
  const edges: Record<string, Point[]> = {};
  const visit = (container: ElkNode) => {
    for (const c of container.children ?? []) {
      const rect = { x: round(c.x ?? 0), y: round(c.y ?? 0), width: round(c.width ?? 0), height: round(c.height ?? 0) };
      if (c.id.startsWith(GROUP_PREFIX)) groups[c.id.slice(GROUP_PREFIX.length)] = rect;
      else nodes[c.id] = rect;
      visit(c);
    }
    // ELK may re-home edges into the lowest common ancestor, so collect from every level.
    for (const e of (container.edges ?? []) as ElkExtendedEdge[]) {
      edges[e.id] = (e.sections ?? [])
        .flatMap((s) => [s.startPoint, ...(s.bendPoints ?? []), s.endPoint])
        .map((p) => ({ x: round(p.x), y: round(p.y) }));
    }
  };
  visit(result);

  const bounds = { width: round(result.width ?? 0), height: round(result.height ?? 0) };
  if (!staged) return { draft, nodes, groups, edges, bounds };
  return { draft, nodes, groups, edges, bounds, phases: stageBands(draft, nodes, direction) };
}

/** Partition per node: its phase, or for an unphased node the phase of its first placed predecessor (else 0). */
function stagePartitions(draft: DiagramDraft): Map<string, number> {
  const part = new Map<string, number>();
  draft.phases!.forEach((p, i) => p.nodes?.forEach((n) => part.has(n) || part.set(n, i)));
  for (let pass = 0; pass < draft.nodes.length; pass++) {
    let changed = false;
    for (const e of draft.edges) {
      if (part.has(e.from) && !part.has(e.to)) {
        part.set(e.to, part.get(e.from)!);
        changed = true;
      }
    }
    if (!changed) break;
  }
  // Partitions only order the top level; grouped nodes are left to the group's own layout.
  const grouped = new Set(draft.nodes.filter((n) => n.group !== undefined).map((n) => n.id));
  for (const n of draft.nodes) if (!part.has(n.id)) part.set(n.id, 0);
  for (const id of grouped) part.delete(id);
  return part;
}

/** One band per stage: its nodes' extent along the flow, the whole diagram across it, plus the label band. */
function stageBands(draft: DiagramDraft, nodes: Record<string, Rect>, direction: Direction): Record<string, Rect> {
  const out: Record<string, Rect> = {};
  const all = Object.values(nodes);
  if (!all.length) return out;
  const top = Math.min(...all.map((r) => r.y));
  const bottom = Math.max(...all.map((r) => r.y + r.height));
  const left = Math.min(...all.map((r) => r.x));
  const right = Math.max(...all.map((r) => r.x + r.width));
  for (const p of draft.phases ?? []) {
    const members = (p.nodes ?? []).flatMap((id) => nodes[id] ?? []);
    if (!members.length) continue;
    if (direction === 'RIGHT') {
      const x = Math.min(...members.map((r) => r.x)) - STAGE_PAD;
      const x2 = Math.max(...members.map((r) => r.x + r.width)) + STAGE_PAD;
      out[p.id] = { x: round(x), y: round(top - STAGE_PAD - STAGE_LABEL_BAND), width: round(x2 - x), height: round(bottom - top + 2 * STAGE_PAD + STAGE_LABEL_BAND) };
    } else {
      const y = Math.min(...members.map((r) => r.y)) - STAGE_PAD;
      const y2 = Math.max(...members.map((r) => r.y + r.height)) + STAGE_PAD;
      out[p.id] = { x: round(left - STAGE_PAD - 160), y: round(y), width: round(right - left + 2 * STAGE_PAD + 160), height: round(y2 - y) };
    }
  }
  return out;
}
