import { cardSize, measureText, type DiagramDraft, type DiagramEdge, type LaidOutDiagram, type Point, type Rect, type SequenceLayout } from '@stackmap/core';

// Sequence layout: participants across the top in draft order, messages top to bottom in edge order. The agent
// gives only order; stackmap derives column spacing from the labels, rows from the messages and phases, and
// activation bars from calls and replies.

const PAD = 40;
/** Space between the participant cards and the first message. */
const HEAD_GAP = 36;
/** Minimum distance between neighbouring lifelines, beyond the card width. */
const COL_GAP = 40;
const ROW = 44;
const SELF_ROW = 60;
/** Width and height of a self-message's loop. */
const LOOP = { width: 36, height: 22 };
/** A phase's band: the label strip above its first message, and the room after its last. */
export const PHASE_HEAD = 28;
const PHASE_TAIL = 12;
const PHASE_PAD_X = 16;
/** Activation bar width, and the sideways step of each nested bar. */
export const ACTIVATION = { width: 10, nest: 5 };
/** Shortest bar: an async hit or a call answered on the next row still shows. */
const MIN_BAR = 24;
const LABEL = { face: 'sans400', size: 11.5, height: 16, gap: 6 } as const;
const labelWidth = (text: string) => Math.ceil(measureText(text, LABEL.face, LABEL.size)) + 12;

const round = (n: number) => Math.round(n * 100) / 100;

export interface Bar {
  participant: string;
  /** 0 = on the lifeline; a self-call nests one step right of what is open */
  depth: number;
  /** first and last message row it covers */
  from: number;
  to: number;
  /** the self-message that drew it, for nested bars */
  self?: string;
  /** who called, and the last row the participant was busy (opened or sent) */
  caller?: string;
  busy?: number;
}

/**
 * Activation bars by simulation over the messages in order. A call or async message to a participant with no
 * open bar opens one; a reply from a participant closes its open bar; a self-call nests a short bar. A bar nobody
 * replied to ends where its participant was last busy once someone else calls it; one still open at the end runs
 * to its participant's last message.
 */
export function activations(edges: DiagramEdge[]): Bar[] {
  const open = new Map<string, Bar>();
  const last = new Map<string, number>();
  const bars: Bar[] = [];
  edges.forEach((e, row) => {
    last.set(e.from, row);
    last.set(e.to, row);
    const sending = open.get(e.from);
    if (sending) sending.busy = row;
    if (e.from === e.to) {
      bars.push({ participant: e.from, depth: open.has(e.from) ? 1 : 0, from: row, to: row, self: e.id });
      return;
    }
    if (e.kind === 'return') {
      const bar = open.get(e.from);
      if (bar) {
        bar.to = row;
        open.delete(e.from);
      }
      return;
    }
    const current = open.get(e.to);
    if (current && current.caller !== e.from) {
      current.to = current.busy ?? current.from;
      open.delete(e.to);
    }
    if (!open.has(e.to)) {
      const bar: Bar = { participant: e.to, depth: 0, from: row, to: row, caller: e.from, busy: row };
      open.set(e.to, bar);
      bars.push(bar);
    }
  });
  for (const bar of open.values()) bar.to = Math.max(bar.to, last.get(bar.participant) ?? bar.to);
  return bars.map(({ caller: _c, busy: _b, ...b }) => b);
}

export function layoutSequence(draft: DiagramDraft): LaidOutDiagram {
  const people = draft.nodes;
  const index = new Map(people.map((n, i) => [n.id, i]));
  const size = new Map(people.map((n) => [n.id, cardSize(n.card, 'compact')]));
  const cardW = Math.max(176, ...[...size.values()].map((s) => s.width));
  const cardH = Math.max(...[...size.values()].map((s) => s.height));
  const edges = draft.edges.filter((e) => index.has(e.from) && index.has(e.to));

  // Lifeline spacing: every gap at least a card plus COL_GAP; a label that spans gaps widens them evenly.
  const gaps = Array.from({ length: Math.max(0, people.length - 1) }, () => cardW + COL_GAP);
  let rightExtra = 0;
  const spans = edges
    .map((e) => ({ e, a: Math.min(index.get(e.from)!, index.get(e.to)!), b: Math.max(index.get(e.from)!, index.get(e.to)!) }))
    .sort((x, y) => x.b - x.a - (y.b - y.a));
  for (const { e, a, b } of spans) {
    if (!e.label) continue;
    const w = labelWidth(e.label);
    if (a === b) {
      // A self-message's label sits right of its loop, before the next lifeline.
      const need = LOOP.width + 8 + w + 16;
      if (a < gaps.length) gaps[a] = Math.max(gaps[a]!, need + ACTIVATION.width);
      else rightExtra = Math.max(rightExtra, need - cardW / 2);
      continue;
    }
    const have = gaps.slice(a, b).reduce((s, g) => s + g, 0);
    const need = w + 32;
    if (need > have) for (let i = a; i < b; i++) gaps[i]! += (need - have) / (b - a);
  }
  const xs: number[] = [PAD + cardW / 2];
  for (const g of gaps) xs.push(xs.at(-1)! + g);
  const xOf = (id: string) => xs[index.get(id)!]!;

  const nodes: Record<string, Rect> = {};
  for (const n of people) {
    const s = size.get(n.id)!;
    nodes[n.id] = { x: round(xOf(n.id) - s.width / 2), y: PAD + (cardH - s.height), width: s.width, height: s.height };
  }

  // Rows: each message gets a row; a phase adds its label strip before its first message and room after its last.
  const edgeIndex = new Map(edges.map((e, i) => [e.id, i]));
  const phaseRange = (draft.phases ?? [])
    .map((p) => {
      const rows = (p.edges ?? []).flatMap((id) => (edgeIndex.has(id) ? [edgeIndex.get(id)!] : []));
      return rows.length ? { id: p.id, first: Math.min(...rows), last: Math.max(...rows) } : null;
    })
    .filter((p): p is { id: string; first: number; last: number } => p !== null);
  const rowY: number[] = [];
  let cursor = PAD + cardH + HEAD_GAP;
  const phaseTop = new Map<string, number>();
  const phaseBottom = new Map<string, number>();
  edges.forEach((e, i) => {
    for (const p of phaseRange) if (p.first === i) {
      phaseTop.set(p.id, cursor);
      cursor += PHASE_HEAD;
    }
    const self = e.from === e.to;
    // The arrow sits below its label.
    rowY.push(cursor + LABEL.height + LABEL.gap);
    cursor += self ? SELF_ROW : ROW;
    for (const p of phaseRange) if (p.last === i) {
      cursor += PHASE_TAIL;
      phaseBottom.set(p.id, cursor);
    }
  });
  const bottom = cursor + 12;

  const bars = activations(edges);
  const barRect = (b: Bar): Rect => {
    const x = xOf(b.participant) - ACTIVATION.width / 2 + b.depth * ACTIVATION.nest;
    // A self-call's bar starts where its loop comes back; a lifeline bar brackets its first and last rows.
    const y0 = b.self ? rowY[b.from]! + LOOP.height - 6 : rowY[b.from]! - 6;
    const y1 = Math.max(b.self ? y0 : rowY[b.to]! + 6, y0 + (b.self ? 18 : MIN_BAR));
    return { x: round(x), y: round(y0), width: ACTIVATION.width, height: round(y1 - y0) };
  };
  // A message leaves and arrives at the edge of the lifeline bar open on its row.
  const reach = (participant: string, row: number) =>
    bars.some((b) => !b.self && b.participant === participant && b.from <= row && b.to >= row) ? ACTIVATION.width / 2 : 0;

  const out: Record<string, Point[]> = {};
  const labels: Record<string, Point> = {};
  edges.forEach((e, i) => {
    const y = rowY[i]!;
    const x = xOf(e.from);
    if (e.from === e.to) {
      const x0 = x + reach(e.from, i);
      const bar = bars.find((b) => b.self === e.id)!;
      out[e.id] = [
        { x: round(x0), y: round(y) },
        { x: round(x0 + LOOP.width), y: round(y) },
        { x: round(x0 + LOOP.width), y: round(y + LOOP.height) },
        { x: round(x - ACTIVATION.width / 2 + bar.depth * ACTIVATION.nest + ACTIVATION.width), y: round(y + LOOP.height) },
      ];
      if (e.label) labels[e.id] = { x: round(x0 + LOOP.width + 8 + labelWidth(e.label) / 2), y: round(y + LOOP.height / 2) };
      return;
    }
    const tx = xOf(e.to);
    const dir = tx > x ? 1 : -1;
    const a = x + dir * reach(e.from, i);
    const b = tx - dir * reach(e.to, i);
    out[e.id] = [
      { x: round(a), y: round(y) },
      { x: round(b), y: round(y) },
    ];
    if (e.label) labels[e.id] = { x: round((a + b) / 2), y: round(y - LABEL.gap - LABEL.height / 2) };
  });

  const lifelines: SequenceLayout['lifelines'] = {};
  for (const n of people) lifelines[n.id] = { x: round(xOf(n.id)), top: nodes[n.id]!.y + nodes[n.id]!.height, bottom: round(bottom) };

  const left = xs[0]! - cardW / 2 - PHASE_PAD_X;
  const right = xs.at(-1)! + cardW / 2 + PHASE_PAD_X + rightExtra;
  const phases: Record<string, Rect> = {};
  for (const p of phaseRange) {
    const top = phaseTop.get(p.id)!;
    phases[p.id] = { x: round(left), y: round(top), width: round(right - left), height: round(phaseBottom.get(p.id)! - top) };
  }

  return {
    draft,
    nodes,
    groups: {},
    edges: out,
    labels,
    phases,
    sequence: {
      lifelines,
      activations: bars.map((b) => ({ participant: b.participant, rect: barRect(b), depth: b.depth })),
    },
    bounds: { width: round(right + PAD), height: round(bottom + PAD) },
  };
}
