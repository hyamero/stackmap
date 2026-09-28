import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkExtendedEdge, ElkNode, ElkPort } from 'elkjs/lib/elk-api';
import { cardSize, type DiagramDraft, type Direction, type LaidOutDiagram, type Point, type Rect } from '@stackmap/core';

/** Vertical space reserved at the top of a group for its label. */
export const GROUP_LABEL_BAND = 48;
const GROUP_PREFIX = 'group:';

const rootOptions = (direction: Direction): Record<string, string> => ({
  'elk.algorithm': 'layered',
  'elk.direction': direction,
  'elk.edgeRouting': 'ORTHOGONAL',
  // Cross-group edges must be routed by one layout run, not per container.
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.padding': '[top=40,left=40,bottom=40,right=40]',
  'elk.spacing.nodeNode': '40',
  'elk.spacing.edgeNode': '20',
  'elk.layered.spacing.nodeNodeBetweenLayers': '120',
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
  const direction = draft.direction ?? 'RIGHT';
  const root: ElkNode = { id: 'root', layoutOptions: rootOptions(direction), children: [], edges: [] };

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
    const { width, height } = cardSize(n.card);
    containerOf(n.group, `Node '${n.id}'`).children!.push({
      id: n.id,
      width,
      height,
      layoutOptions: { 'elk.portConstraints': 'FIXED_POS' },
      ports: ports(n.id, width, height, direction),
    });
  }

  for (const e of draft.edges) {
    for (const end of [e.from, e.to]) {
      if (!nodeIds.has(end)) throw new Error(`Edge '${e.id}' references unknown node '${end}'`);
    }
    root.edges!.push({ id: e.id, sources: [`${e.from}:out`], targets: [`${e.to}:in`] });
  }

  const elk = new ELK();
  let result = await elk.layout(structuredClone(root));
  if ((result.width ?? 0) > MAX_UNWRAPPED_WIDTH) {
    result = await elk.layout({ ...structuredClone(root), layoutOptions: { ...root.layoutOptions, ...wrapOptions } });
  }

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

  return { draft, nodes, groups, edges, bounds: { width: round(result.width ?? 0), height: round(result.height ?? 0) } };
}
