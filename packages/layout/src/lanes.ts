import { cardSize, type DiagramDraft, type DiagramEdge, type LaidOutDiagram, type Point, type Rect } from '@stackmap/core';
import { labelWidth, placeLabel } from './labels';
import { nudge, routeEdges, STUB, type PortChoice, type RouteRequest } from './route';

// Swimlane layout for workflow and lifecycle diagrams: lanes are full-width rows in draft order, columns
// follow the flow (longest path), and stackmap routes the edges itself (./route.ts).

const PAD = 40;
/** Left rail of every lane, holding its label (wrapped to the rail). */
export const LANE_HEAD = 144;
const LANE_PAD_X = 32;
const LANE_PAD_TOP = 20;
/** Room under a lane's cards for the channel same-lane back edges take. */
const LANE_PAD_BOTTOM = 28;
const LANE_GAP = 16;
const STACK_GAP = 28;
const MIN_GUTTER = 64;
const MAX_GUTTER = 176;
/** Header band above the lanes, when there are phases. */
export const PHASE_BAND = 40;
const PHASE_GAP = 8;
/** Group frames inside a lane: padding around members and the label band above them. */
export const GROUP_PAD = 12;
export const GROUP_LABEL = 28;
/** Room left of a lifecycle start state for its initial marker. */
export const START_MARK = 28;


const round = (n: number) => Math.round(n * 100) / 100;
const roundRect = (r: Rect): Rect => ({ x: round(r.x), y: round(r.y), width: round(r.width), height: round(r.height) });

/** Edges that don't push their target to a later column: replies, and whatever closes a cycle. */
export function backEdges(draft: DiagramDraft): Set<string> {
  const back = new Set(draft.edges.filter((e) => e.kind === 'return' || e.from === e.to).map((e) => e.id));
  const phaseOf = new Map<string, number>();
  draft.phases?.forEach((p, i) => p.nodes?.forEach((n) => phaseOf.has(n) || phaseOf.set(n, i)));
  for (const e of draft.edges) {
    const a = phaseOf.get(e.from);
    const b = phaseOf.get(e.to);
    if (a !== undefined && b !== undefined && b < a) back.add(e.id);
  }
  // DFS in draft order; an edge into a node still on the stack closes a cycle.
  const out = new Map(draft.nodes.map((n) => [n.id, [] as DiagramEdge[]]));
  for (const e of draft.edges) if (!back.has(e.id)) out.get(e.from)?.push(e);
  const state = new Map<string, 1 | 2>();
  const visit = (id: string) => {
    state.set(id, 1);
    for (const e of out.get(id) ?? []) {
      const s = state.get(e.to);
      if (s === 1) back.add(e.id);
      else if (s === undefined && out.has(e.to)) visit(e.to);
    }
    state.set(id, 2);
  };
  const hasIn = new Set(draft.edges.filter((e) => !back.has(e.id)).map((e) => e.to));
  for (const n of draft.nodes) if (!hasIn.has(n.id) && !state.has(n.id)) visit(n.id);
  for (const n of draft.nodes) if (!state.has(n.id)) visit(n.id);
  return back;
}

/**
 * Column per node: longest path over forward edges. Within a lane a successor moves one column right; across
 * lanes it may stay in the same column (a straight drop). A phase starts after the previous phase ends.
 */
export function assignColumns(draft: DiagramDraft, back: Set<string>): Map<string, number> {
  const laneOf = new Map(draft.nodes.map((n) => [n.id, n.lane]));
  const laneIndex = new Map((draft.lanes ?? []).map((l, i) => [l.id, i]));
  const forward = draft.edges.filter((e) => !back.has(e.id) && laneOf.has(e.from) && laneOf.has(e.to));
  const phases = (draft.phases ?? []).map((p) => (p.nodes ?? []).filter((n) => laneOf.has(n)));
  const phaseOf = new Map<string, number>();
  phases.forEach((ns, i) => ns.forEach((n) => phaseOf.has(n) || phaseOf.set(n, i)));
  // Cross-lane edges that must still step right: their straight drop would run through a card.
  const step = new Set<string>();
  const settle = () => {
    const col = new Map(draft.nodes.map((n) => [n.id, 0]));
    const starts = phases.map(() => 0);
    // Monotone: columns only grow, and the forward edges are acyclic, so this settles (bounded for safety).
    for (let round = 0; round < draft.nodes.length * 4 + 8; round++) {
      let changed = false;
      const raise = (id: string, to: number) => {
        if (to > col.get(id)!) {
          col.set(id, to);
          changed = true;
        }
      };
      for (const [id, p] of phaseOf) raise(id, starts[p]!);
      for (const e of forward) raise(e.to, col.get(e.from)! + (laneOf.get(e.from) === laneOf.get(e.to) || step.has(e.id) ? 1 : 0));
      for (let p = 1; p < phases.length; p++) {
        const prevEnd = Math.max(starts[p - 1]!, ...phases[p - 1]!.map((n) => col.get(n)!));
        if (prevEnd + 1 > starts[p]!) {
          starts[p] = prevEnd + 1;
          changed = true;
        }
      }
      if (!changed) break;
    }
    return col;
  };
  let col = settle();
  for (let pass = 0; pass < forward.length; pass++) {
    // Stepping right is worth a column only inside the existing width; past it, routing around is cheaper.
    const last = Math.max(...col.values());
    const blocked = forward.find((e) => {
      if (step.has(e.id) || col.get(e.from) !== col.get(e.to) || col.get(e.from)! + 1 > last) return false;
      const [a, b] = [laneIndex.get(laneOf.get(e.from)!)!, laneIndex.get(laneOf.get(e.to)!)!].sort((x, y) => x - y);
      return draft.nodes.some((n) => n.id !== e.from && n.id !== e.to && col.get(n.id) === col.get(e.from) && laneIndex.get(n.lane!)! > a! && laneIndex.get(n.lane!)! < b!);
    });
    if (!blocked) break;
    step.add(blocked.id);
    col = settle();
  }
  return col;
}

function portChoices(sameLane: boolean, dCol: number, dLane: number, isBack: boolean): { sources: PortChoice[]; targets: PortChoice[] } {
  const c = (side: PortChoice['side'], cost: number): PortChoice => ({ side, cost });
  if (isBack) {
    if (sameLane) return { sources: [c('bottom', 0), c('top', 30), c('left', 60)], targets: [c('bottom', 0), c('top', 30), c('right', 60)] };
    return dLane > 0
      ? { sources: [c('bottom', 0), c('left', 20)], targets: [c('right', 0), c('top', 20), c('left', 40)] }
      : { sources: [c('top', 0), c('left', 20)], targets: [c('right', 0), c('bottom', 20), c('left', 40)] };
  }
  if (sameLane) return { sources: [c('right', 0), c('bottom', 80), c('top', 80)], targets: [c('left', 0), c('top', 80), c('bottom', 80)] };
  if (dLane > 0)
    return dCol === 0
      ? { sources: [c('bottom', 0)], targets: [c('top', 0)] }
      : { sources: [c('bottom', 0), c('right', 30)], targets: [c('top', 0), c('left', 30)] };
  return dCol === 0
    ? { sources: [c('top', 0)], targets: [c('bottom', 0)] }
    : { sources: [c('top', 0), c('right', 30)], targets: [c('bottom', 0), c('left', 30)] };
}

export function layoutLanes(draft: DiagramDraft): LaidOutDiagram {
  const lanes = draft.lanes ?? [];
  const laneIndex = new Map(lanes.map((l, i) => [l.id, i]));
  const nodes = draft.nodes.filter((n) => n.lane !== undefined && laneIndex.has(n.lane));
  const back = backEdges(draft);
  const col = assignColumns(draft, back);
  const size = new Map(nodes.map((n) => [n.id, cardSize(n.card, 'compact')]));
  const cols = Math.max(0, ...nodes.map((n) => col.get(n.id)!)) + 1;
  const cardW = Math.max(...[...size.values()].map((s) => s.width));

  // A gutter wide enough for the widest label on an edge between neighbouring columns of one lane.
  const laneOf = new Map(nodes.map((n) => [n.id, n.lane!]));
  const neighbourLabels = draft.edges.filter((e) => e.label && !back.has(e.id) && laneOf.get(e.from) === laneOf.get(e.to) && col.get(e.to)! - col.get(e.from)! === 1);
  const gutter = Math.min(MAX_GUTTER, Math.max(MIN_GUTTER, ...neighbourLabels.map((e) => labelWidth(e.label!) + 24)));

  const hasStart = nodes.some((n) => n.type === 'start' && col.get(n.id) === 0);
  const x0 = PAD + LANE_HEAD + (hasStart ? START_MARK : 0);
  const colX = (c: number) => x0 + c * (cardW + gutter);
  const bandX = PAD;
  const bandW = colX(cols - 1) + cardW + LANE_PAD_X - PAD;

  const top = PAD + (draft.phases?.length ? PHASE_BAND + PHASE_GAP : 0);
  const rects: Record<string, Rect> = {};
  const laneRects: Record<string, Rect> = {};
  const groupRects: Record<string, Rect> = {};
  let y = top;
  for (const lane of lanes) {
    const members = nodes.filter((n) => n.lane === lane.id);
    const grouped = (draft.groups ?? []).some((g) => members.some((n) => n.group === g.id));
    const contentTop = y + LANE_PAD_TOP + (grouped ? GROUP_LABEL + GROUP_PAD : 0);
    // Stack row k of every column shares one centre line, so neighbours in a lane line up.
    const cells = new Map<number, typeof members>();
    for (const n of members) cells.set(col.get(n.id)!, [...(cells.get(col.get(n.id)!) ?? []), n]);
    const depth = Math.max(0, ...[...cells.values()].map((c) => c.length));
    const rowH = Array.from({ length: depth }, (_, k) => Math.max(0, ...[...cells.values()].map((c) => (c[k] ? size.get(c[k].id)!.height : 0))));
    const rowCenter: number[] = [];
    let cursor = contentTop;
    for (let k = 0; k < depth; k++) {
      rowCenter.push(cursor + rowH[k]! / 2);
      cursor += rowH[k]! + STACK_GAP;
    }
    for (const [c, cell] of cells) {
      cell.forEach((n, k) => {
        const s = size.get(n.id)!;
        rects[n.id] = roundRect({ x: colX(c) + (cardW - s.width) / 2, y: rowCenter[k]! - s.height / 2, width: s.width, height: s.height });
      });
    }
    // The rail label may wrap: keep an empty or one-row lane tall enough for two lines.
    const contentBottom = Math.max(depth ? cursor - STACK_GAP : contentTop + 60, y + 72 - LANE_PAD_BOTTOM);
    const bottom = contentBottom + (grouped ? GROUP_PAD : 0) + LANE_PAD_BOTTOM;
    laneRects[lane.id] = roundRect({ x: bandX, y, width: bandW, height: bottom - y });
    y = bottom + LANE_GAP;
  }

  for (const g of draft.groups ?? []) {
    const members = nodes.filter((n) => n.group === g.id).map((n) => rects[n.id]!);
    if (!members.length) continue;
    const x = Math.min(...members.map((r) => r.x)) - GROUP_PAD;
    const yTop = Math.min(...members.map((r) => r.y)) - GROUP_PAD - GROUP_LABEL;
    const right = Math.max(...members.map((r) => r.x + r.width)) + GROUP_PAD;
    const bottom = Math.max(...members.map((r) => r.y + r.height)) + GROUP_PAD;
    groupRects[g.id] = roundRect({ x, y: yTop, width: right - x, height: bottom - yTop });
  }

  const phaseRects: Record<string, Rect> = {};
  for (const p of draft.phases ?? []) {
    const cs = (p.nodes ?? []).filter((n) => col.has(n) && laneOf.has(n)).map((n) => col.get(n)!);
    if (!cs.length) continue;
    const left = colX(Math.min(...cs)) - gutter / 2 + 8;
    const right = colX(Math.max(...cs)) + cardW + gutter / 2 - 8;
    phaseRects[p.id] = roundRect({ x: Math.max(left, bandX + 8), y: PAD, width: Math.min(right, bandX + bandW - 8) - Math.max(left, bandX + 8), height: PHASE_BAND });
  }

  // Channels: gutter centres, the lane margins, and in every lane its label strip and bottom padding.
  const xs = [x0 - (hasStart ? START_MARK : 0) - LANE_PAD_X / 2, bandX + bandW - LANE_PAD_X / 2];
  for (let c = 0; c < cols - 1; c++) xs.push(colX(c) + cardW + gutter / 2);
  const ys: number[] = [];
  for (const r of Object.values(laneRects)) ys.push(r.y + r.height - LANE_PAD_BOTTOM / 2, r.y - LANE_GAP / 2, r.y + r.height + LANE_GAP / 2);
  // Lane rails, group labels and start markers are text and marks that edges must not run over.
  const obstacles: Rect[] = [];
  for (const lane of lanes) {
    const r = laneRects[lane.id]!;
    obstacles.push({ x: r.x, y: r.y, width: LANE_HEAD - 8, height: r.height });
  }
  for (const g of draft.groups ?? []) {
    const r = groupRects[g.id];
    if (r) obstacles.push({ x: r.x, y: r.y + 4, width: labelWidth(g.label) + 24, height: GROUP_LABEL - 8 });
  }
  for (const n of nodes) {
    if (n.type !== 'start') continue;
    const r = rects[n.id]!;
    obstacles.push({ x: r.x - START_MARK, y: r.y + r.height / 2 - 8, width: START_MARK, height: 16 });
  }

  const requests: RouteRequest[] = draft.edges
    .filter((e) => rects[e.from] && rects[e.to] && e.from !== e.to)
    .map((e) => {
      const dLane = laneIndex.get(laneOf.get(e.to)!)! - laneIndex.get(laneOf.get(e.from)!)!;
      const dCol = col.get(e.to)! - col.get(e.from)!;
      const isBack = back.has(e.id) || dCol < 0;
      const choice = portChoices(dLane === 0, dCol, dLane, isBack);
      // A start state's left side holds its initial marker.
      const blockLeft = (id: string) => draft.nodes.find((n) => n.id === id)?.type === 'start';
      return {
        id: e.id,
        from: e.from,
        to: e.to,
        tone: `${e.tone ?? ''}${e.kind === 'return' ? ':return' : ''}`,
        sources: choice.sources.filter((c) => !(c.side === 'left' && blockLeft(e.from))),
        targets: choice.targets.filter((c) => !(c.side === 'left' && blockLeft(e.to))),
        order: (isBack ? 1e6 : 0) + Math.abs(dCol) * 1000 + Math.abs(dLane),
      };
    })
    .sort((a, b) => a.order - b.order);
  const ends = Object.fromEntries(draft.edges.map((e) => [e.id, { from: e.from, to: e.to }]));
  const routed = nudge(routeEdges(rects, requests, { xs, ys }, obstacles), ends);

  const edges: Record<string, Point[]> = {};
  for (const e of draft.edges) {
    if (routed[e.id]) edges[e.id] = routed[e.id]!.map((p) => ({ x: round(p.x), y: round(p.y) }));
    else if (e.from === e.to && rects[e.from]) edges[e.id] = selfLoop(rects[e.from]!);
  }

  const cards = Object.values(rects);
  const taken: Rect[] = [];
  const labels: Record<string, Point> = {};
  for (const e of draft.edges) if (e.label && edges[e.id]) labels[e.id] = placeLabel(edges[e.id]!, e.label, cards, taken);

  const height = y - LANE_GAP + PAD;
  return {
    draft,
    nodes: rects,
    groups: groupRects,
    edges,
    lanes: laneRects,
    phases: phaseRects,
    labels,
    bounds: { width: round(bandX + bandW + PAD), height: round(height) },
  };
}

/** A self-transition: out of the top, round over the card, back into the top. */
function selfLoop(r: Rect): Point[] {
  const cx = r.x + r.width / 2;
  return [
    { x: round(cx + 24), y: r.y },
    { x: round(cx + 24), y: round(r.y - STUB - 8) },
    { x: round(cx - 24), y: round(r.y - STUB - 8) },
    { x: round(cx - 24), y: r.y },
  ];
}
